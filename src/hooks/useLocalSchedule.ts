import { useEffect, useState } from "react";
import { DayOfWeek, DepartureTime, Fare, PublicHoliday, Route, Schedule, TimeInfo } from "@/types";
import { findScheduleForDate, getTimeInfo, getFaresForTime, saveDataForOffline, getCachedRouteData, saveRecentRoute, saveViewedDate } from "@/utils/scheduleUtils";
import { getNextDepartureTime, isPublicHoliday } from "@/utils/dateUtils";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

// API base URL
const API_BASE_URL = 'http://localhost:3003/api';

// Data fetching functions for React Query
const fetchRoutes = async (): Promise<Route[]> => {
  const response = await fetch(`${API_BASE_URL}/routes`);
  if (!response.ok) throw new Error('Failed to fetch routes');
  
  const data = await response.json();
  
  return data.map((route: any) => ({
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
  try {
    // Fetch schedules
    const schedulesResponse = await fetch(`${API_BASE_URL}/schedules`);
    if (!schedulesResponse.ok) throw new Error('Failed to fetch schedules');
    const schedulesData = await schedulesResponse.json();
    
    // Fetch all departure times and fares for all schedules
    const schedulesWithDetails = await Promise.all(
      schedulesData.map(async (schedule: any) => {
        try {
          // Fetch departure times for this schedule
          const departureTimesResponse = await fetch(`${API_BASE_URL}/departure-times/${schedule.id}`);
          const departureTimesData = departureTimesResponse.ok ? await departureTimesResponse.json() : [];
          
          // Fetch fares for this schedule
          const faresResponse = await fetch(`${API_BASE_URL}/fares/${schedule.id}`);
          const faresData = faresResponse.ok ? await faresResponse.json() : [];
          
          // Process departure times to include info and fare IDs
          const processedDepartureTimes = await Promise.all(
            departureTimesData.map(async (dt: any) => {
              // Fetch time info IDs for this departure time
              const timeInfosResponse = await fetch(`${API_BASE_URL}/departure-time-infos/${dt.id}`);
              const timeInfosData = timeInfosResponse.ok ? await timeInfosResponse.json() : [];
              const infoSuffixes = timeInfosData.map((info: any) => info.time_info_id);
              
              // Fetch fare IDs for this departure time
              const timeFaresResponse = await fetch(`${API_BASE_URL}/departure-time-fares/${dt.id}`);
              const timeFaresData = timeFaresResponse.ok ? await timeFaresResponse.json() : [];
              const fareIds = timeFaresData.map((fare: any) => fare.fare_id);
              
              return {
                time: dt.time,
                infoSuffixes,
                fareIds
              };
            })
          );
          
          // Process fares
          const processedFares = faresData.map((fare: any) => ({
            id: fare.id,
            name: fare.name,
            price: parseFloat(fare.price),
            currency: fare.currency,
            description: fare.description || undefined,
            fareType: fare.fare_type
          }));
          
          return {
            id: schedule.id,
            routeId: schedule.route_id,
            tags: getScheduleTags(schedule),
            effectiveFrom: schedule.effective_from || '',
            effectiveUntil: schedule.effective_until,
            departureTimes: processedDepartureTimes,
            fares: processedFares
          };
        } catch (error) {
          console.error(`Error processing schedule ${schedule.id}:`, error);
          // Return schedule with empty details if there's an error
          return {
            id: schedule.id,
            routeId: schedule.route_id,
            tags: getScheduleTags(schedule),
            effectiveFrom: schedule.effective_from || '',
            effectiveUntil: schedule.effective_until,
            departureTimes: [],
            fares: []
          };
        }
      })
    );
    
    return schedulesWithDetails;
  } catch (error) {
    console.error('Error fetching schedules:', error);
    throw error;
  }
};

// Helper to determine schedule tags based on schedule properties
const getScheduleTags = (schedule: any): DayOfWeek[] => {
  const tags: DayOfWeek[] = [];
  
  // Check if it's a holiday schedule
  if (schedule.is_holiday_schedule) {
    tags.push('holiday');
  } 
  // Check if it's a weekend schedule
  else if (schedule.is_weekend_schedule) {
    tags.push('sat', 'sun');
  } 
  // Otherwise it's a weekday schedule
  else {
    tags.push('mon', 'tue', 'wed', 'thu', 'fri');
  }
  
  return tags;
};

const fetchTimeInfos = async (): Promise<TimeInfo[]> => {
  const response = await fetch(`${API_BASE_URL}/time-infos`);
  if (!response.ok) throw new Error('Failed to fetch time infos');
  
  const data = await response.json();
  
  return data.map((info: any) => ({
    id: info.id,
    symbol: info.symbol,
    description: info.description
  }));
};

const fetchPublicHolidays = async (): Promise<PublicHoliday[]> => {
  const response = await fetch(`${API_BASE_URL}/public-holidays`);
  if (!response.ok) throw new Error('Failed to fetch public holidays');
  
  const data = await response.json();
  
  return data.map((holiday: any) => ({
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

export const useLocalSchedule = ({
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
  
  // Log debugging information
  useEffect(() => {
    console.log("Schedule debugging info:", {
      routeId,
      date: date.toDateString(),
      totalSchedules: schedules.length,
      schedulesForRoute: schedules.filter(s => s.routeId === routeId).length,
      isHoliday: isPublicHoliday(date, publicHolidays)
    });
  }, [routeId, date, schedules, publicHolidays]);
  
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