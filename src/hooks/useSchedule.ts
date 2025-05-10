import { useEffect, useState } from "react";
import { DepartureTime, Fare, PublicHoliday, Route, Schedule, TimeInfo } from "@/types";
import { findScheduleForDate, getTimeInfo, getFaresForTime, saveDataForOffline, getCachedRouteData, saveRecentRoute, saveViewedDate } from "@/utils/scheduleUtils";
import { getNextDepartureTime, isPublicHoliday } from "@/utils/dateUtils";
import { routes as mockRoutes, schedules as mockSchedules, timeInfos as mockTimeInfos, publicHolidays as mockPublicHolidays } from "@/data/mockData";
import { fetchRoutes, fetchSchedules, fetchTimeInfos, fetchPublicHolidays, initializeDatabaseData } from "@/services/supabaseService";
import { useToast } from "@/hooks/use-toast";
import { isUsingRealCredentials } from "@/lib/supabase";

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
  const { toast } = useToast();
  const [routeId, setRouteId] = useState<string>(initialRouteId || "");
  const [date, setDate] = useState<Date>(initialDate);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [timeInfos, setTimeInfos] = useState<TimeInfo[]>([]);
  const [publicHolidays, setPublicHolidays] = useState<PublicHoliday[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  
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
  
  // Initialize the database with seed data
  const initializeDatabase = async () => {
    if (isInitializing) return;
    
    setIsInitializing(true);
    try {
      await initializeDatabaseData(
        mockRoutes, 
        mockSchedules, 
        mockTimeInfos, 
        mockPublicHolidays
      );
      
      toast({
        title: "Database Initialized",
        description: "Sample data has been loaded into the database.",
      });
      
      // After initialization, fetch the data
      await fetchData();
    } catch (error) {
      console.error("Error initializing database:", error);
      setError("Failed to initialize database. Please try again.");
      toast({
        title: "Initialization Error",
        description: "Failed to initialize the database with sample data.",
        variant: "destructive",
      });
    } finally {
      setIsInitializing(false);
    }
  };
  
  // Fetch data from Supabase
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch all data from Supabase
      const [fetchedRoutes, fetchedSchedules, fetchedTimeInfos, fetchedHolidays] = await Promise.all([
        fetchRoutes(),
        fetchSchedules(),
        fetchTimeInfos(),
        fetchPublicHolidays()
      ]);
      
      setRoutes(fetchedRoutes);
      setSchedules(fetchedSchedules);
      setTimeInfos(fetchedTimeInfos);
      setPublicHolidays(fetchedHolidays);
      
      // If no routes are fetched, it means we need to initialize the database
      if (fetchedRoutes.length === 0) {
        await initializeDatabase();
        return;
      }
      
      // Set default route if not already set
      if (!routeId && fetchedRoutes.length > 0) {
        setRouteId(fetchedRoutes[0].id);
      }
      
      // Save data for offline use
      saveDataForOffline(fetchedRoutes, fetchedSchedules, fetchedTimeInfos, fetchedHolidays);
      
      toast({
        title: "Data Refreshed",
        description: "Schedule data has been updated.",
      });
    } catch (err) {
      console.error("Error fetching schedule data:", err);
      setError("Failed to load schedule data. Please try again.");
      
      // Try to load from cache in case of error
      const cachedData = getCachedRouteData();
      if (cachedData.isAvailable) {
        setRoutes(cachedData.routes);
        setSchedules(cachedData.schedules);
        setTimeInfos(cachedData.timeInfos);
        setPublicHolidays(cachedData.publicHolidays);
        
        toast({
          title: "Using Cached Data",
          description: "Loaded data from local cache due to connection issues.",
        });
      }
    } finally {
      setIsLoading(false);
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
