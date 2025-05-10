
import { useEffect, useState } from "react";
import { DepartureTime, Fare, PublicHoliday, Route, Schedule, TimeInfo } from "@/types";
import { findScheduleForDate, getTimeInfo, getFaresForTime, saveDataForOffline, getCachedRouteData, saveRecentRoute, saveViewedDate } from "@/utils/scheduleUtils";
import { getNextDepartureTime, isPublicHoliday } from "@/utils/dateUtils";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

// Data fetching functions for React Query
const fetchRoutes = async (): Promise<Route[]> => {
  const { data, error } = await supabase
    .from('routes')
    .select('*');
    
  if (error) throw new Error(error.message);
  
  return data.map(route => ({
    id: route.id,
    name: route.name,
    origin: route.origin,
    destination: route.destination,
    description: route.description || undefined,
    transportType: route.transport_type,
    color: undefined,
    additionalInfo: undefined,
    featuredImage: route.featured_image || undefined
  }));
};

const fetchSchedules = async (): Promise<Schedule[]> => {
  // First get all schedules
  const { data: schedulesData, error: schedulesError } = await supabase
    .from('schedules')
    .select('*');
    
  if (schedulesError) throw new Error(schedulesError.message);
  
  const schedules: Schedule[] = [];
  
  // For each schedule, get its departure times and fares
  for (const schedule of schedulesData) {
    // Get departure times for this schedule
    const { data: departureTimes, error: departureTimesError } = await supabase
      .from('departure_times')
      .select('*, departure_time_infos(time_info_id), departure_time_fares(fare_id)')
      .eq('schedule_id', schedule.id);
      
    if (departureTimesError) throw new Error(departureTimesError.message);
    
    // Get fares for this schedule
    const { data: fares, error: faresError } = await supabase
      .from('fares')
      .select('*')
      .eq('schedule_id', schedule.id);
      
    if (faresError) throw new Error(faresError.message);
    
    // Convert schedule to our app format
    const formattedSchedule: Schedule = {
      id: schedule.id,
      routeId: schedule.route_id,
      tags: getScheduleTags(schedule),
      effectiveFrom: schedule.effective_from || '',
      effectiveUntil: schedule.effective_until,
      departureTimes: departureTimes.map(dt => ({
        time: dt.time,
        infoSuffixes: dt.departure_time_infos?.map(info => info.time_info_id) || [],
        fareIds: dt.departure_time_fares?.map(fare => fare.fare_id) || []
      })),
      fares: fares.map(fare => ({
        id: fare.id,
        name: fare.name,
        price: fare.price,
        currency: fare.currency,
        description: fare.description,
        fareType: fare.fare_type
      }))
    };
    
    schedules.push(formattedSchedule);
  }
  
  return schedules;
};

// Helper to determine schedule tags based on schedule properties
const getScheduleTags = (schedule: any): string[] => {
  const tags: string[] = [];
  
  // Check if it's a weekend or holiday schedule
  if (schedule.is_weekend_schedule) {
    tags.push('sat', 'sun');
  } else if (schedule.is_holiday_schedule) {
    tags.push('holiday');
  } else {
    // Weekday schedule
    tags.push('mon', 'tue', 'wed', 'thu', 'fri');
  }
  
  return tags;
};

const fetchTimeInfos = async (): Promise<TimeInfo[]> => {
  const { data, error } = await supabase
    .from('time_infos')
    .select('*');
    
  if (error) throw new Error(error.message);
  
  return data.map(info => ({
    id: info.id,
    symbol: info.symbol,
    description: info.description
  }));
};

const fetchPublicHolidays = async (): Promise<PublicHoliday[]> => {
  const { data, error } = await supabase
    .from('public_holidays')
    .select('*');
    
  if (error) throw new Error(error.message);
  
  return data.map(holiday => ({
    date: holiday.date,
    title: holiday.name,
    description: holiday.description
  }));
};

interface UseScheduleProps {
  initialRouteId?: string;
  initialDate?: Date;
}

interface UseScheduleReturn {
  routes: Route[];
  currentRoute: Route | undefined;
  currentDate: Date;
  selectedSchedule: Schedule | undefined;
  timeInfos: TimeInfo[];
  publicHolidays: PublicHoliday[];
  isHoliday: boolean;
  holidayInfo: PublicHoliday | undefined;
  departureTimes: DepartureTime[];
  nextDepartureTime: string | null;
  isLoading: boolean;
  error: string | null;
  setRouteId: (id: string) => void;
  setDate: (date: Date) => void;
  getInfoForTime: (time: string) => TimeInfo[];
  getFaresForTime: (time: string) => Fare[];
  availableFares: Fare[];
  refreshData: () => void;
}

export const useSchedule = ({
  initialRouteId,
  initialDate = new Date()
}: UseScheduleProps = {}): UseScheduleReturn => {
  // Get cached data to start with
  const cachedData = getCachedRouteData();
  const cachedRouteId = localStorage.getItem("recentRouteId") || undefined;
  
  // Initial state setup
  const [routeId, setRouteId] = useState<string>(initialRouteId || cachedRouteId || "");
  const [date, setDate] = useState<Date>(initialDate);
  
  // React Query hooks
  const { 
    data: routes = [], 
    isLoading: isRoutesLoading,
    error: routesError,
    refetch: refetchRoutes
  } = useQuery({
    queryKey: ['routes'],
    queryFn: fetchRoutes,
    initialData: cachedData.isAvailable ? cachedData.routes : undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const { 
    data: schedules = [], 
    isLoading: isSchedulesLoading,
    error: schedulesError,
    refetch: refetchSchedules
  } = useQuery({
    queryKey: ['schedules'],
    queryFn: fetchSchedules,
    initialData: cachedData.isAvailable ? cachedData.schedules : undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const { 
    data: timeInfos = [], 
    isLoading: isTimeInfosLoading,
    error: timeInfosError,
    refetch: refetchTimeInfos
  } = useQuery({
    queryKey: ['timeInfos'],
    queryFn: fetchTimeInfos,
    initialData: cachedData.isAvailable ? cachedData.timeInfos : undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const { 
    data: publicHolidays = [], 
    isLoading: isHolidaysLoading,
    error: holidaysError,
    refetch: refetchHolidays
  } = useQuery({
    queryKey: ['publicHolidays'],
    queryFn: fetchPublicHolidays,
    initialData: cachedData.isAvailable ? cachedData.publicHolidays : undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Handle error states
  const error = routesError?.message || schedulesError?.message || timeInfosError?.message || holidaysError?.message || null;
  
  // Determine if any data is still loading
  const isLoading = isRoutesLoading || isSchedulesLoading || isTimeInfosLoading || isHolidaysLoading;
  
  // Set default route if not already set
  useEffect(() => {
    if (!routeId && routes.length > 0) {
      setRouteId(routes[0].id);
    }
  }, [routes, routeId]);
  
  // Derived state
  const currentRoute = routes.find(route => route.id === routeId);
  const isHoliday = isPublicHoliday(date, publicHolidays);
  const holidayInfo = publicHolidays.find(holiday => 
    new Date(holiday.date).toDateString() === date.toDateString()
  );
  const selectedSchedule = findScheduleForDate(routeId, date, schedules, publicHolidays);
  const departureTimes = selectedSchedule?.departureTimes || [];
  const availableFares = selectedSchedule?.fares || [];
  
  const times = departureTimes.map(dt => dt.time);
  const nextDepartureTime = getNextDepartureTime(times);
  
  // Save data for offline use whenever it changes
  useEffect(() => {
    if (!isLoading && !error) {
      saveDataForOffline(routes, schedules, timeInfos, publicHolidays);
    }
  }, [routes, schedules, timeInfos, publicHolidays, isLoading, error]);
  
  // Handler for selecting a route
  const handleSetRouteId = (id: string) => {
    setRouteId(id);
    saveRecentRoute(id);
  };
  
  // Handler for setting the date
  const handleSetDate = (newDate: Date) => {
    setDate(newDate);
    saveViewedDate(newDate);
  };
  
  // Function to get info for a specific time
  const getInfoForTime = (time: string): TimeInfo[] => {
    return getTimeInfo(time, selectedSchedule, timeInfos);
  };

  // Function to get fares for a specific time
  const getFaresForDeparture = (time: string): Fare[] => {
    return getFaresForTime(time, selectedSchedule, availableFares);
  };
  
  // Function to refresh all data
  const refreshData = () => {
    toast.info("Refreshing schedule data...");
    
    Promise.all([
      refetchRoutes(),
      refetchSchedules(),
      refetchTimeInfos(),
      refetchHolidays(),
    ]).then(() => {
      toast.success("Schedule data refreshed!");
    }).catch((err) => {
      toast.error("Failed to refresh data: " + (err.message || "Unknown error"));
    });
  };
  
  return {
    routes,
    currentRoute,
    currentDate: date,
    selectedSchedule,
    timeInfos,
    publicHolidays,
    isHoliday,
    holidayInfo,
    departureTimes,
    nextDepartureTime,
    isLoading,
    error,
    setRouteId: handleSetRouteId,
    setDate: handleSetDate,
    getInfoForTime,
    getFaresForTime: getFaresForDeparture,
    availableFares,
    refreshData
  };
};
