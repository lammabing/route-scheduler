
import { DayOfWeek, PublicHoliday, Route, Schedule, TimeInfo } from "@/types";

// Mock time information/legends
export const timeInfos: TimeInfo[] = [
  {
    id: "a",
    symbol: "a",
    description: "Service operates only during school terms"
  },
  {
    id: "b",
    symbol: "b",
    description: "Service extends to Central Station"
  },
  {
    id: "c",
    symbol: "c",
    description: "Wheelchair accessible service"
  },
  {
    id: "d",
    symbol: "d",
    description: "Express service, limited stops"
  }
];

// Mock routes
export const routes: Route[] = [
  {
    id: "route1",
    name: "Route 100",
    origin: "Downtown",
    destination: "Riverside",
    description: "Main downtown to riverside route",
    transportType: "bus",
    color: "#1a73e8"
  },
  {
    id: "route2",
    name: "Route 200",
    origin: "Northside",
    destination: "Westpark",
    description: "North to west express service",
    transportType: "bus",
    color: "#34a853"
  },
  {
    id: "route3",
    name: "C Line",
    origin: "Central Station",
    destination: "Airport",
    description: "Central station to airport service",
    transportType: "train",
    color: "#673ab7"
  },
  {
    id: "route4",
    name: "T5",
    origin: "University",
    destination: "Tech Park",
    description: "University to Technology Park service",
    transportType: "tram",
    color: "#fbbc05"
  }
];

// Mock schedules
export const schedules: Schedule[] = [
  // Route 1 weekday schedule
  {
    id: "schedule1",
    routeId: "route1",
    tags: ["mon", "tue", "wed", "thu", "fri"],
    departureTimes: [
      { time: "06:00" },
      { time: "06:30" },
      { time: "07:00", infoSuffixes: ["c"] },
      { time: "07:30", infoSuffixes: ["c"] },
      { time: "08:00", infoSuffixes: ["c", "d"] },
      { time: "08:30", infoSuffixes: ["c"] },
      { time: "09:00" },
      { time: "10:00" },
      { time: "11:00" },
      { time: "12:00", infoSuffixes: ["c"] },
      { time: "13:00" },
      { time: "14:00" },
      { time: "15:00", infoSuffixes: ["a"] },
      { time: "15:30", infoSuffixes: ["a", "c"] },
      { time: "16:00", infoSuffixes: ["c"] },
      { time: "16:30", infoSuffixes: ["c"] },
      { time: "17:00", infoSuffixes: ["c", "d"] },
      { time: "17:30" },
      { time: "18:00" },
      { time: "19:00" },
      { time: "20:00", infoSuffixes: ["c"] },
      { time: "21:00" }
    ],
    effectiveFrom: "2023-01-01"
  },
  // Route 1 weekend schedule
  {
    id: "schedule2",
    routeId: "route1",
    tags: ["sat", "sun"],
    departureTimes: [
      { time: "08:00", infoSuffixes: ["c"] },
      { time: "09:00" },
      { time: "10:00" },
      { time: "11:00" },
      { time: "12:00", infoSuffixes: ["c"] },
      { time: "13:00" },
      { time: "14:00" },
      { time: "15:00" },
      { time: "16:00", infoSuffixes: ["c"] },
      { time: "17:00" },
      { time: "18:00" },
      { time: "19:00" },
      { time: "20:00" }
    ],
    effectiveFrom: "2023-01-01"
  },
  // Route 1 holiday schedule
  {
    id: "schedule3",
    routeId: "route1",
    tags: ["holiday"],
    departureTimes: [
      { time: "09:00", infoSuffixes: ["c"] },
      { time: "11:00" },
      { time: "13:00", infoSuffixes: ["c"] },
      { time: "15:00" },
      { time: "17:00", infoSuffixes: ["c"] },
      { time: "19:00" }
    ],
    effectiveFrom: "2023-01-01"
  },
  // Route 2 weekday schedule
  {
    id: "schedule4",
    routeId: "route2",
    tags: ["mon", "tue", "wed", "thu", "fri"],
    departureTimes: [
      { time: "06:15" },
      { time: "06:45" },
      { time: "07:15", infoSuffixes: ["b"] },
      { time: "07:45" },
      { time: "08:15", infoSuffixes: ["b", "c"] },
      { time: "08:45" },
      { time: "09:15", infoSuffixes: ["b"] },
      { time: "10:15" },
      { time: "11:15" },
      { time: "12:15", infoSuffixes: ["c"] },
      { time: "13:15" },
      { time: "14:15" },
      { time: "15:15", infoSuffixes: ["a", "b"] },
      { time: "15:45", infoSuffixes: ["a"] },
      { time: "16:15", infoSuffixes: ["b", "c"] },
      { time: "16:45" },
      { time: "17:15", infoSuffixes: ["b"] },
      { time: "17:45", infoSuffixes: ["c"] },
      { time: "18:15" },
      { time: "19:15" },
      { time: "20:15" },
      { time: "21:15" }
    ],
    effectiveFrom: "2023-01-01"
  },
  // Route 3 daily schedule
  {
    id: "schedule5",
    routeId: "route3",
    tags: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    departureTimes: [
      { time: "05:30", infoSuffixes: ["c"] },
      { time: "06:00", infoSuffixes: ["c"] },
      { time: "06:30", infoSuffixes: ["c"] },
      { time: "07:00", infoSuffixes: ["c"] },
      { time: "07:30", infoSuffixes: ["c"] },
      { time: "08:00", infoSuffixes: ["c"] },
      { time: "08:30", infoSuffixes: ["c"] },
      { time: "09:00", infoSuffixes: ["c"] },
      { time: "09:30", infoSuffixes: ["c"] },
      { time: "10:00", infoSuffixes: ["c"] },
      { time: "11:00", infoSuffixes: ["c"] },
      { time: "12:00", infoSuffixes: ["c"] },
      { time: "13:00", infoSuffixes: ["c"] },
      { time: "14:00", infoSuffixes: ["c"] },
      { time: "15:00", infoSuffixes: ["c"] },
      { time: "16:00", infoSuffixes: ["c"] },
      { time: "17:00", infoSuffixes: ["c"] },
      { time: "18:00", infoSuffixes: ["c"] },
      { time: "19:00", infoSuffixes: ["c"] },
      { time: "20:00", infoSuffixes: ["c"] },
      { time: "21:00", infoSuffixes: ["c"] },
      { time: "22:00", infoSuffixes: ["c"] },
      { time: "23:00", infoSuffixes: ["c"] }
    ],
    effectiveFrom: "2023-01-01"
  },
  // Route 3 holiday schedule
  {
    id: "schedule6",
    routeId: "route3",
    tags: ["holiday"],
    departureTimes: [
      { time: "06:00", infoSuffixes: ["c"] },
      { time: "07:00", infoSuffixes: ["c"] },
      { time: "08:00", infoSuffixes: ["c"] },
      { time: "09:00", infoSuffixes: ["c"] },
      { time: "10:00", infoSuffixes: ["c"] },
      { time: "11:00", infoSuffixes: ["c"] },
      { time: "12:00", infoSuffixes: ["c"] },
      { time: "13:00", infoSuffixes: ["c"] },
      { time: "14:00", infoSuffixes: ["c"] },
      { time: "15:00", infoSuffixes: ["c"] },
      { time: "16:00", infoSuffixes: ["c"] },
      { time: "17:00", infoSuffixes: ["c"] },
      { time: "18:00", infoSuffixes: ["c"] },
      { time: "19:00", infoSuffixes: ["c"] },
      { time: "20:00", infoSuffixes: ["c"] },
      { time: "21:00", infoSuffixes: ["c"] },
      { time: "22:00", infoSuffixes: ["c"] }
    ],
    effectiveFrom: "2023-01-01"
  },
  // Route 4 weekday schedule
  {
    id: "schedule7",
    routeId: "route4",
    tags: ["mon", "tue", "wed", "thu", "fri"],
    departureTimes: [
      { time: "07:00", infoSuffixes: ["c"] },
      { time: "07:30" },
      { time: "08:00", infoSuffixes: ["c"] },
      { time: "08:30", infoSuffixes: ["c"] },
      { time: "09:00" },
      { time: "09:30", infoSuffixes: ["c"] },
      { time: "10:00" },
      { time: "11:00", infoSuffixes: ["c"] },
      { time: "12:00" },
      { time: "13:00", infoSuffixes: ["c"] },
      { time: "14:00" },
      { time: "15:00", infoSuffixes: ["c", "a"] },
      { time: "15:30", infoSuffixes: ["a"] },
      { time: "16:00", infoSuffixes: ["c", "a"] },
      { time: "16:30", infoSuffixes: ["c"] },
      { time: "17:00" },
      { time: "17:30", infoSuffixes: ["c"] },
      { time: "18:00" },
      { time: "19:00", infoSuffixes: ["c"] }
    ],
    effectiveFrom: "2023-01-01"
  }
];

// Mock public holidays
export const publicHolidays: PublicHoliday[] = [
  {
    date: "2023-01-01",
    title: "New Year's Day"
  },
  {
    date: "2023-12-25",
    title: "Christmas Day"
  },
  {
    date: "2023-12-26",
    title: "Boxing Day"
  },
  {
    date: "2024-01-01",
    title: "New Year's Day"
  },
  {
    date: "2024-05-27",
    title: "Memorial Day"
  },
  {
    date: "2024-07-04",
    title: "Independence Day"
  },
  {
    date: "2024-09-02",
    title: "Labor Day"
  },
  {
    date: "2024-11-28",
    title: "Thanksgiving Day"
  },
  {
    date: "2024-12-25",
    title: "Christmas Day"
  },
  {
    date: "2025-01-01",
    title: "New Year's Day"
  },
  {
    date: "2025-05-26",
    title: "Memorial Day"
  }
];
