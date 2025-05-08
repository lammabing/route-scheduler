
// Days of the week
export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun' | 'holiday';

// Time information
export interface TimeInfo {
  id: string;
  symbol: string;
  description: string;
}

// Departure time with associated information
export interface DepartureTime {
  time: string; // in HH:MM format
  infoSuffixes?: string[]; // IDs of associated TimeInfo
}

// Schedule associated with a route
export interface Schedule {
  id: string;
  routeId: string;
  tags: DayOfWeek[]; // Days this schedule is active
  departureTimes: DepartureTime[];
  effectiveFrom: string; // ISO date string
  effectiveUntil?: string; // ISO date string, optional
}

// Route details
export interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
  description?: string;
  transportType: 'bus' | 'train' | 'tram' | 'ferry' | 'other';
  color?: string; // For UI presentation
  additionalInfo?: string;
}

// Public holiday
export interface PublicHoliday {
  date: string; // ISO date string
  title: string;
  description?: string;
}
