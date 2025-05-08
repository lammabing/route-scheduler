
import { useEffect, useState } from "react";
import { DepartureTime, Fare, PublicHoliday, Route, Schedule, TimeInfo } from "@/types";
import { routes as mockRoutes, schedules as mockSchedules, timeInfos as mockTimeInfos, publicHolidays as mockPublicHolidays } from "@/data/mockData";
import { findScheduleForDate, getTimeInfo, getFaresForTime, saveDataForOffline, getCachedRouteData, saveRecentRoute, saveViewedDate } from "@/utils/scheduleUtils";
import { getNextDepartureTime, isPublicHoliday } from "@/utils/dateUtils";

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
  const [routeId, setRouteId] = useState<string>(initialRouteId || "");
  const [date, setDate] = useState<Date>(initialDate);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [timeInfos, setTimeInfos] = useState<TimeInfo[]>([]);
  const [publicHolidays, setPublicHolidays] = useState<PublicHoliday[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
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
  
  // Fetch data (in a real app, this would be an API call)
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // In a real app, these would be API calls
      // For now, we'll use the mock data with a slight delay
      setTimeout(() => {
        setRoutes(mockRoutes);
        setSchedules(mockSchedules);
        setTimeInfos(mockTimeInfos);
        setPublicHolidays(mockPublicHolidays);
        
        // Set default route if not already set
        if (!routeId && mockRoutes.length > 0) {
          setRouteId(mockRoutes[0].id);
        }
        
        // Save data for offline use
        saveDataForOffline(mockRoutes, mockSchedules, mockTimeInfos, mockPublicHolidays);
        
        setIsLoading(false);
      }, 300);
    } catch (err) {
      console.error("Error fetching schedule data:", err);
      setError("Failed to load schedule data. Please try again.");
      setIsLoading(false);
      
      // Try to load from cache in case of error
      const cachedData = getCachedRouteData();
      if (cachedData.isAvailable) {
        setRoutes(cachedData.routes);
        setSchedules(cachedData.schedules);
        setTimeInfos(cachedData.timeInfos);
        setPublicHolidays(cachedData.publicHolidays);
      }
    }
  };
  
  // Initialize data on mount
  useEffect(() => {
    const cachedData = getCachedRouteData();
    
    if (cachedData.isAvailable) {
      // Use cached data initially for fast loading
      setRoutes(cachedData.routes);
      setSchedules(cachedData.schedules);
      setTimeInfos(cachedData.timeInfos);
      setPublicHolidays(cachedData.publicHolidays);
      setIsLoading(false);
      
      // If no route id is set, try to get from localStorage
      if (!routeId) {
        const recentRoute = localStorage.getItem("recentRouteId");
        if (recentRoute) setRouteId(recentRoute);
        else if (cachedData.routes.length > 0) setRouteId(cachedData.routes[0].id);
      }
    }
    
    // Then fetch fresh data
    fetchData();
  }, []);
  
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
    refreshData: fetchData
  };
};
