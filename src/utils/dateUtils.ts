
import { format, isAfter, isBefore, isSameDay, parse } from "date-fns";
import { DayOfWeek, PublicHoliday } from "@/types";

// Get the day of week string from a date
export const getDayOfWeek = (date: Date): DayOfWeek => {
  const dayMap: { [key: string]: DayOfWeek } = {
    "0": "sun",
    "1": "mon",
    "2": "tue",
    "3": "wed",
    "4": "thu",
    "5": "fri",
    "6": "sat"
  };
  return dayMap[date.getDay().toString()];
};

// Check if a date is a public holiday
export const isPublicHoliday = (date: Date, holidays: PublicHoliday[]): boolean => {
  return holidays.some(holiday => isSameDay(date, new Date(holiday.date)));
};

// Get holiday information for a specific date
export const getHolidayInfo = (date: Date, holidays: PublicHoliday[]): PublicHoliday | undefined => {
  return holidays.find(holiday => isSameDay(date, new Date(holiday.date)));
};

// Format time string from 24-hour format to 12-hour format
export const formatTimeDisplay = (time: string): string => {
  // Parse the time string (HH:MM) into a Date object
  const date = parse(time, "HH:mm", new Date());
  // Return in 12-hour format with AM/PM
  return format(date, "h:mm a");
};

// Check if a time is in the past compared to the current time
export const isTimeInPast = (timeString: string, currentDate: Date = new Date()): boolean => {
  const [hours, minutes] = timeString.split(":").map(Number);
  const timeDate = new Date(currentDate);
  timeDate.setHours(hours, minutes, 0, 0);
  
  return isBefore(timeDate, currentDate);
};

// Check if a time is in the future compared to the current time
export const isTimeInFuture = (timeString: string, currentDate: Date = new Date()): boolean => {
  const [hours, minutes] = timeString.split(":").map(Number);
  const timeDate = new Date(currentDate);
  timeDate.setHours(hours, minutes, 0, 0);
  
  return isAfter(timeDate, currentDate);
};

// Get the next departure time object from a list of times
export const getNextDepartureTime = (times: string[], currentDate: Date = new Date()): string | null => {
  // Filter for all future times today
  const futureTimes = times.filter(time => isTimeInFuture(time, currentDate));
  
  // Return the earliest future time, or null if none
  return futureTimes.length > 0 ? futureTimes[0] : null;
};

// Calculate minutes remaining until a specific time
export const getMinutesUntilTime = (timeString: string, currentDate: Date = new Date()): number => {
  const [hours, minutes] = timeString.split(":").map(Number);
  const targetDate = new Date(currentDate);
  targetDate.setHours(hours, minutes, 0, 0);
  
  // If time is already past for today, return 0
  if (isBefore(targetDate, currentDate)) {
    return 0;
  }
  
  // Return the difference in minutes
  return Math.round((targetDate.getTime() - currentDate.getTime()) / (60 * 1000));
};

// Format minutes into a human-readable format (e.g., "5 minutes" or "1 hour 20 minutes")
export const formatTimeRemaining = (minutes: number): string => {
  if (minutes <= 0) {
    return "Departed";
  }
  
  if (minutes < 60) {
    return `${minutes} min${minutes !== 1 ? 's' : ''}`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hr${hours !== 1 ? 's' : ''}`;
  }
  
  return `${hours} hr${hours !== 1 ? 's' : ''} ${remainingMinutes} min${remainingMinutes !== 1 ? 's' : ''}`;
};
