
import { DayOfWeek, Fare, PublicHoliday, Route, Schedule, TimeInfo } from "@/types";
import { getDayOfWeek, isPublicHoliday } from "./dateUtils";

// Find the appropriate schedule for a given route, date, and available schedules
export const findScheduleForDate = (
  routeId: string,
  date: Date,
  schedules: Schedule[],
  publicHolidays: PublicHoliday[]
): Schedule | undefined => {
  // First, check if the date is a public holiday
  const isHoliday = isPublicHoliday(date, publicHolidays);
  
  // Filter schedules for the given route
  const routeSchedules = schedules.filter(schedule => schedule.routeId === routeId);
  
  // If it's a holiday and there's a holiday schedule, use that
  if (isHoliday) {
    const holidaySchedule = routeSchedules.find(schedule => 
      schedule.tags.includes("holiday") &&
      new Date(schedule.effectiveFrom) <= date &&
      (!schedule.effectiveUntil || new Date(schedule.effectiveUntil) >= date)
    );
    
    if (holidaySchedule) {
      return holidaySchedule;
    }
  }
  
  // Get day of week for the given date
  const dayOfWeek = getDayOfWeek(date);
  
  // Find the applicable schedule based on the day of the week and effective dates
  return routeSchedules.find(schedule => 
    schedule.tags.includes(dayOfWeek) &&
    new Date(schedule.effectiveFrom) <= date &&
    (!schedule.effectiveUntil || new Date(schedule.effectiveUntil) >= date)
  );
};

// Get all departure times from a schedule as strings
export const getDepartureTimes = (schedule?: Schedule): string[] => {
  if (!schedule) return [];
  return schedule.departureTimes.map(dt => dt.time);
};

// Find time info for a specific time in a schedule
export const getTimeInfo = (
  time: string,
  schedule?: Schedule,
  allTimeInfos: TimeInfo[] = []
): TimeInfo[] => {
  if (!schedule) return [];
  
  const departureTime = schedule.departureTimes.find(dt => dt.time === time);
  if (!departureTime || !departureTime.infoSuffixes) return [];
  
  return allTimeInfos.filter(info => departureTime.infoSuffixes?.includes(info.id));
};

// Get fares for a specific departure time
export const getFaresForTime = (
  time: string,
  schedule?: Schedule,
  allFares: Fare[] = []
): Fare[] => {
  if (!schedule) return [];
  
  const departureTime = schedule.departureTimes.find(dt => dt.time === time);
  if (!departureTime || !departureTime.fareIds) return [];
  
  return allFares.filter(fare => departureTime.fareIds?.includes(fare.id));
};

// Save the most recently viewed route to local storage
export const saveRecentRoute = (routeId: string): void => {
  localStorage.setItem("recentRouteId", routeId);
};

// Get the most recently viewed route from local storage
export const getRecentRoute = (): string | null => {
  return localStorage.getItem("recentRouteId");
};

// Save user viewed date to local storage
export const saveViewedDate = (date: Date): void => {
  localStorage.setItem("viewedDate", date.toISOString());
};

// Get user viewed date from local storage
export const getViewedDate = (): Date | null => {
  const storedDate = localStorage.getItem("viewedDate");
  return storedDate ? new Date(storedDate) : null;
};

// Save route data to local storage for offline use
export const saveDataForOffline = (
  routes: Route[],
  schedules: Schedule[],
  timeInfos: TimeInfo[],
  publicHolidays: PublicHoliday[]
): void => {
  try {
    localStorage.setItem("routes", JSON.stringify(routes));
    localStorage.setItem("schedules", JSON.stringify(schedules));
    localStorage.setItem("timeInfos", JSON.stringify(timeInfos));
    localStorage.setItem("publicHolidays", JSON.stringify(publicHolidays));
    localStorage.setItem("dataLastUpdated", new Date().toISOString());
  } catch (error) {
    console.error("Error saving data for offline use:", error);
  }
};

// Get cached route data from local storage
export const getCachedRouteData = () => {
  try {
    const routes = JSON.parse(localStorage.getItem("routes") || "[]") as Route[];
    const schedules = JSON.parse(localStorage.getItem("schedules") || "[]") as Schedule[];
    const timeInfos = JSON.parse(localStorage.getItem("timeInfos") || "[]") as TimeInfo[];
    const publicHolidays = JSON.parse(localStorage.getItem("publicHolidays") || "[]") as PublicHoliday[];
    const lastUpdated = localStorage.getItem("dataLastUpdated") || null;
    
    return { 
      routes, 
      schedules, 
      timeInfos, 
      publicHolidays, 
      lastUpdated,
      isAvailable: routes.length > 0
    };
  } catch (error) {
    console.error("Error retrieving cached data:", error);
    return {
      routes: [],
      schedules: [],
      timeInfos: [],
      publicHolidays: [],
      lastUpdated: null,
      isAvailable: false
    };
  }
};
