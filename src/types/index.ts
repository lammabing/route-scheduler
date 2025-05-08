
// Days of the week
export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun' | 'holiday';

// Fare information
export interface Fare {
  id: string;
  name: string;
  price: number;
  currency: string;
  description?: string;
  fareType: 'standard' | 'concession' | 'student' | 'senior' | 'child' | 'other';
}

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
  fareIds?: string[]; // IDs of applicable fares for this departure
}

// Schedule associated with a route
export interface Schedule {
  id: string;
  routeId: string;
  tags: DayOfWeek[]; // Days this schedule is active
  departureTimes: DepartureTime[];
  effectiveFrom: string; // ISO date string
  effectiveUntil?: string; // ISO date string, optional
  fares?: Fare[]; // Fares applicable to this schedule
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
  featuredImage?: string; // URL or path to the featured image
}

// Public holiday
export interface PublicHoliday {
  date: string; // ISO date string
  title: string;
  description?: string;
}
