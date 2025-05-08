import { DayOfWeek, Fare, PublicHoliday, Route, Schedule, TimeInfo } from "@/types";

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

// Mock fares
export const fares: Fare[] = [
  {
    id: "fare1",
    name: "Standard",
    price: 3.50,
    currency: "USD",
    description: "Regular adult fare",
    fareType: "standard"
  },
  {
    id: "fare2",
    name: "Concession",
    price: 1.75,
    currency: "USD",
    description: "Discount fare for eligible concession holders",
    fareType: "concession"
  },
  {
    id: "fare3",
    name: "Student",
    price: 2.00,
    currency: "USD",
    description: "Valid student ID required",
    fareType: "student"
  },
  {
    id: "fare4",
    name: "Senior/Disability",
    price: 1.50,
    currency: "USD",
    description: "For seniors and disability card holders",
    fareType: "senior"
  },
  {
    id: "fare5",
    name: "Child",
    price: 1.00,
    currency: "USD",
    description: "For children aged 5-15",
    fareType: "child"
  },
  {
    id: "fare6",
    name: "Day Pass",
    price: 8.50,
    currency: "USD",
    description: "Unlimited travel for one day",
    fareType: "other"
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
    color: "#1a73e8",
    featuredImage: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&auto=format&fit=crop"
  },
  {
    id: "route2",
    name: "Route 200",
    origin: "Northside",
    destination: "Westpark",
    description: "North to west express service",
    transportType: "bus",
    color: "#34a853",
    featuredImage: "https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?w=800&auto=format&fit=crop"
  },
  {
    id: "route3",
    name: "C Line",
    origin: "Central Station",
    destination: "Airport",
    description: "Central station to airport service",
    transportType: "train",
    color: "#673ab7",
    featuredImage: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&auto=format&fit=crop"
  },
  {
    id: "route4",
    name: "T5",
    origin: "University",
    destination: "Tech Park",
    description: "University to Technology Park service",
    transportType: "tram",
    color: "#fbbc05",
    featuredImage: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&auto=format&fit=crop"
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
      { time: "06:00", fareIds: ["fare1", "fare2", "fare4", "fare5"] },
      { time: "06:30", fareIds: ["fare1", "fare2", "fare4", "fare5"] },
      { time: "07:00", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare4", "fare5"] },
      { time: "07:30", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare4", "fare5"] },
      { time: "08:00", infoSuffixes: ["c", "d"], fareIds: ["fare1", "fare2", "fare3", "fare4", "fare5"] },
      { time: "08:30", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare3", "fare4", "fare5"] },
      { time: "09:00", fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "10:00", fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "11:00", fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "12:00", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "13:00", fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "14:00", fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "15:00", infoSuffixes: ["a"], fareIds: ["fare1", "fare2", "fare3", "fare4", "fare5"] },
      { time: "15:30", infoSuffixes: ["a", "c"], fareIds: ["fare1", "fare2", "fare3", "fare4", "fare5"] },
      { time: "16:00", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare3", "fare4", "fare5"] },
      { time: "16:30", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare3", "fare4", "fare5"] },
      { time: "17:00", infoSuffixes: ["c", "d"], fareIds: ["fare1", "fare2", "fare4", "fare5"] },
      { time: "17:30", fareIds: ["fare1", "fare2", "fare4", "fare5"] },
      { time: "18:00", fareIds: ["fare1", "fare2", "fare4", "fare5"] },
      { time: "19:00", fareIds: ["fare1", "fare2", "fare4", "fare5"] },
      { time: "20:00", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare4", "fare5"] },
      { time: "21:00", fareIds: ["fare1", "fare2", "fare4", "fare5"] }
    ],
    effectiveFrom: "2023-01-01",
    fares: [fares[0], fares[1], fares[2], fares[3], fares[4], fares[5]]
  },
  // Route 1 weekend schedule
  {
    id: "schedule2",
    routeId: "route1",
    tags: ["sat", "sun"],
    departureTimes: [
      { time: "08:00", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "09:00", fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "10:00", fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "11:00", fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "12:00", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "13:00", fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "14:00", fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "15:00", fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "16:00", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "17:00", fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "18:00", fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "19:00", fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "20:00", fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] }
    ],
    effectiveFrom: "2023-01-01",
    fares: [fares[0], fares[1], fares[3], fares[4], fares[5]]
  },
  // Route 1 holiday schedule
  {
    id: "schedule3",
    routeId: "route1",
    tags: ["holiday"],
    departureTimes: [
      { time: "09:00", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "11:00", fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "13:00", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "15:00", fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "17:00", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "19:00", fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] }
    ],
    effectiveFrom: "2023-01-01",
    fares: [fares[0], fares[1], fares[3], fares[4], fares[5]]
  },
  // Route 2 weekday schedule
  {
    id: "schedule4",
    routeId: "route2",
    tags: ["mon", "tue", "wed", "thu", "fri"],
    departureTimes: [
      { time: "06:15", fareIds: ["fare1", "fare2", "fare4", "fare5"] },
      { time: "06:45", fareIds: ["fare1", "fare2", "fare4", "fare5"] },
      { time: "07:15", infoSuffixes: ["b"], fareIds: ["fare1", "fare2", "fare3", "fare4", "fare5"] },
      { time: "07:45", fareIds: ["fare1", "fare2", "fare3", "fare4", "fare5"] },
      { time: "08:15", infoSuffixes: ["b", "c"], fareIds: ["fare1", "fare2", "fare3", "fare4", "fare5"] },
      { time: "08:45", fareIds: ["fare1", "fare2", "fare3", "fare4", "fare5"] },
      { time: "09:15", infoSuffixes: ["b"], fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "10:15", fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "11:15", fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "12:15", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "13:15", fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "14:15", fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "15:15", infoSuffixes: ["a", "b"], fareIds: ["fare1", "fare2", "fare3", "fare4", "fare5"] },
      { time: "15:45", infoSuffixes: ["a"], fareIds: ["fare1", "fare2", "fare3", "fare4", "fare5"] },
      { time: "16:15", infoSuffixes: ["b", "c"], fareIds: ["fare1", "fare2", "fare3", "fare4", "fare5"] },
      { time: "16:45", fareIds: ["fare1", "fare2", "fare3", "fare4", "fare5"] },
      { time: "17:15", infoSuffixes: ["b"], fareIds: ["fare1", "fare2", "fare4", "fare5"] },
      { time: "17:45", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare4", "fare5"] },
      { time: "18:15", fareIds: ["fare1", "fare2", "fare4", "fare5"] },
      { time: "19:15", fareIds: ["fare1", "fare2", "fare4", "fare5"] },
      { time: "20:15", fareIds: ["fare1", "fare2", "fare4", "fare5"] },
      { time: "21:15", fareIds: ["fare1", "fare2", "fare4", "fare5"] }
    ],
    effectiveFrom: "2023-01-01",
    fares: [fares[0], fares[1], fares[2], fares[3], fares[4], fares[5]]
  },
  // Route 3 daily schedule
  {
    id: "schedule5",
    routeId: "route3",
    tags: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    departureTimes: [
      { time: "05:30", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare4", "fare5"] },
      { time: "06:00", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare4", "fare5"] },
      { time: "06:30", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare4", "fare5"] },
      { time: "07:00", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare3", "fare4", "fare5"] },
      { time: "07:30", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare3", "fare4", "fare5"] },
      { time: "08:00", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare3", "fare4", "fare5"] },
      { time: "08:30", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare3", "fare4", "fare5"] },
      { time: "09:00", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare3", "fare4", "fare5"] },
      { time: "09:30", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "10:00", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "11:00", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "12:00", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "13:00", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "14:00", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "15:00", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare3", "fare4", "fare5"] },
      { time: "16:00", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare3", "fare4", "fare5"] },
      { time: "17:00", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare3", "fare4", "fare5"] },
      { time: "18:00", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare4", "fare5"] },
      { time: "19:00", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare4", "fare5"] },
      { time: "20:00", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare4", "fare5"] },
      { time: "21:00", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare4", "fare5"] },
      { time: "22:00", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare4", "fare5"] },
      { time: "23:00", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare4", "fare5"] }
    ],
    effectiveFrom: "2023-01-01",
    fares: [fares[0], fares[1], fares[2], fares[3], fares[4], fares[5]]
  },
  // Route 3 holiday schedule
  {
    id: "schedule6",
    routeId: "route3",
    tags: ["holiday"],
    departureTimes: [
      { time: "06:00", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "07:00", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "08:00", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "09:00", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "10:00", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "11:00", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "12:00", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "13:00", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "14:00", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "15:00", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "16:00", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "17:00", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "18:00", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "19:00", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "20:00", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "21:00", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "22:00", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] }
    ],
    effectiveFrom: "2023-01-01",
    fares: [fares[0], fares[1], fares[3], fares[4], fares[5]]
  },
  // Route 4 weekday schedule
  {
    id: "schedule7",
    routeId: "route4",
    tags: ["mon", "tue", "wed", "thu", "fri"],
    departureTimes: [
      { time: "07:00", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare4", "fare5"] },
      { time: "07:30", fareIds: ["fare1", "fare2", "fare4", "fare5"] },
      { time: "08:00", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare3", "fare4", "fare5"] },
      { time: "08:30", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare3", "fare4", "fare5"] },
      { time: "09:00", fareIds: ["fare1", "fare2", "fare3", "fare4", "fare5"] },
      { time: "09:30", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "10:00", fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "11:00", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "12:00", fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "13:00", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "14:00", fareIds: ["fare1", "fare2", "fare4", "fare5", "fare6"] },
      { time: "15:00", infoSuffixes: ["c", "a"], fareIds: ["fare1", "fare2", "fare3", "fare4", "fare5"] },
      { time: "15:30", infoSuffixes: ["a"], fareIds: ["fare1", "fare2", "fare3", "fare4", "fare5"] },
      { time: "16:00", infoSuffixes: ["c", "a"], fareIds: ["fare1", "fare2", "fare3", "fare4", "fare5"] },
      { time: "16:30", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare3", "fare4", "fare5"] },
      { time: "17:00", fareIds: ["fare1", "fare2", "fare4", "fare5"] },
      { time: "17:30", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare4", "fare5"] },
      { time: "18:00", fareIds: ["fare1", "fare2", "fare4", "fare5"] },
      { time: "19:00", infoSuffixes: ["c"], fareIds: ["fare1", "fare2", "fare4", "fare5"] }
    ],
    effectiveFrom: "2023-01-01",
    fares: [fares[0], fares[1], fares[2], fares[3], fares[4], fares[5]]
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
