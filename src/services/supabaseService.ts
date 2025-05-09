
import { supabase } from "@/lib/supabase";
import { 
  DepartureTime,
  Fare,
  PublicHoliday,
  Route,
  Schedule,
  TimeInfo
} from "@/types";

// Transform database data to app data structures
const mapRouteFromDb = (dbRoute: any): Route => ({
  id: dbRoute.id,
  name: dbRoute.name,
  origin: dbRoute.origin,
  destination: dbRoute.destination,
  description: dbRoute.description,
  transportType: dbRoute.transport_type,
  color: dbRoute.color,
  additionalInfo: dbRoute.additional_info,
  featuredImage: dbRoute.featured_image
});

const mapTimeInfoFromDb = (dbTimeInfo: any): TimeInfo => ({
  id: dbTimeInfo.id,
  symbol: dbTimeInfo.symbol,
  description: dbTimeInfo.description
});

const mapFareFromDb = (dbFare: any): Fare => ({
  id: dbFare.id,
  name: dbFare.name,
  price: dbFare.price,
  currency: dbFare.currency,
  description: dbFare.description,
  fareType: dbFare.fare_type
});

const mapHolidayFromDb = (dbHoliday: any): PublicHoliday => ({
  date: dbHoliday.date,
  title: dbHoliday.title,
  description: dbHoliday.description
});

// Routes
export const fetchRoutes = async (): Promise<Route[]> => {
  const { data, error } = await supabase.from("routes").select("*");
  if (error) {
    console.error("Error fetching routes:", error);
    throw new Error(error.message);
  }
  return data.map(mapRouteFromDb);
};

// Schedules with departure times
export const fetchSchedules = async (): Promise<Schedule[]> => {
  // First get all base schedules
  const { data: schedulesData, error: schedulesError } = await supabase.from("schedules").select("*");
  
  if (schedulesError) {
    console.error("Error fetching schedules:", schedulesError);
    throw new Error(schedulesError.message);
  }
  
  const schedules: Schedule[] = [];
  
  // For each schedule, get its days, departure times, and fares
  for (const scheduleData of schedulesData) {
    // Get days for this schedule
    const { data: daysData, error: daysError } = await supabase
      .from("schedule_days")
      .select("*")
      .eq("schedule_id", scheduleData.id);
      
    if (daysError) {
      console.error("Error fetching schedule days:", daysError);
      continue;
    }
    
    // Get departure times for this schedule
    const { data: departureTimesData, error: departureTimesError } = await supabase
      .from("departure_times")
      .select("*")
      .eq("schedule_id", scheduleData.id);
      
    if (departureTimesError) {
      console.error("Error fetching departure times:", departureTimesError);
      continue;
    }
    
    // Process departure times with their info suffixes and fares
    const departureTimes: DepartureTime[] = await Promise.all(
      departureTimesData.map(async (dt) => {
        // Get info suffixes
        const { data: infoData, error: infoError } = await supabase
          .from("departure_time_info")
          .select("time_info_id")
          .eq("departure_time_id", dt.id);
          
        // Get fare IDs
        const { data: fareData, error: fareError } = await supabase
          .from("departure_time_fares")
          .select("fare_id")
          .eq("departure_time_id", dt.id);
          
        return {
          time: dt.time,
          infoSuffixes: infoError ? [] : infoData.map(item => item.time_info_id),
          fareIds: fareError ? [] : fareData.map(item => item.fare_id)
        };
      })
    );
    
    // Get fares for this schedule
    const { data: scheduleFaresData, error: scheduleFaresError } = await supabase
      .from("schedule_fares")
      .select("fare_id")
      .eq("schedule_id", scheduleData.id);
      
    if (scheduleFaresError) {
      console.error("Error fetching schedule fares:", scheduleFaresError);
      continue;
    }
    
    // Get the actual fare objects
    let fares: Fare[] = [];
    if (scheduleFaresData.length > 0) {
      const fareIds = scheduleFaresData.map(sf => sf.fare_id);
      const { data: faresData, error: faresError } = await supabase
        .from("fares")
        .select("*")
        .in("id", fareIds);
        
      if (!faresError && faresData) {
        fares = faresData.map(mapFareFromDb);
      }
    }
    
    // Combine everything into a schedule object
    schedules.push({
      id: scheduleData.id,
      routeId: scheduleData.route_id,
      tags: daysData.map(day => day.day_type as any),
      departureTimes,
      effectiveFrom: scheduleData.effective_from,
      effectiveUntil: scheduleData.effective_until,
      fares
    });
  }
  
  return schedules;
};

// Time Infos
export const fetchTimeInfos = async (): Promise<TimeInfo[]> => {
  const { data, error } = await supabase.from("time_infos").select("*");
  if (error) {
    console.error("Error fetching time infos:", error);
    throw new Error(error.message);
  }
  return data.map(mapTimeInfoFromDb);
};

// Public Holidays
export const fetchPublicHolidays = async (): Promise<PublicHoliday[]> => {
  const { data, error } = await supabase.from("public_holidays").select("*");
  if (error) {
    console.error("Error fetching public holidays:", error);
    throw new Error(error.message);
  }
  return data.map(mapHolidayFromDb);
};

// Data Initialization - Call this for first-time data seeding
export const initializeDatabaseData = async (
  routes: Route[], 
  schedules: Schedule[], 
  timeInfos: TimeInfo[],
  publicHolidays: PublicHoliday[]
): Promise<void> => {
  try {
    // First check if we already have data
    const { count, error: countError } = await supabase
      .from("routes")
      .select("*", { count: 'exact', head: true });
      
    if (countError) {
      throw new Error(countError.message);
    }
    
    // If data already exists, don't re-seed
    if (count && count > 0) {
      console.log("Database already contains data, skipping initialization");
      return;
    }
    
    console.log("Initializing database with seed data...");
    
    // Insert time infos
    if (timeInfos.length > 0) {
      const timeInfosToInsert = timeInfos.map(info => ({
        id: info.id,
        symbol: info.symbol,
        description: info.description,
        created_at: new Date().toISOString()
      }));
      
      const { error: timeInfoError } = await supabase
        .from("time_infos")
        .insert(timeInfosToInsert);
        
      if (timeInfoError) {
        console.error("Error inserting time infos:", timeInfoError);
      }
    }
    
    // Insert routes
    if (routes.length > 0) {
      const routesToInsert = routes.map(route => ({
        id: route.id,
        name: route.name,
        origin: route.origin,
        destination: route.destination,
        description: route.description,
        transport_type: route.transportType,
        color: route.color,
        additional_info: route.additionalInfo,
        featured_image: route.featuredImage,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      
      const { error: routesError } = await supabase
        .from("routes")
        .insert(routesToInsert);
        
      if (routesError) {
        console.error("Error inserting routes:", routesError);
      }
    }
    
    // Insert fares first (needed for schedules)
    let allFares: Fare[] = [];
    schedules.forEach(schedule => {
      if (schedule.fares) {
        allFares.push(...schedule.fares);
      }
    });
    
    // Remove duplicates by ID
    const uniqueFares = [...new Map(allFares.map(fare => [fare.id, fare])).values()];
    
    if (uniqueFares.length > 0) {
      const faresToInsert = uniqueFares.map(fare => ({
        id: fare.id,
        name: fare.name,
        price: fare.price,
        currency: fare.currency,
        description: fare.description,
        fare_type: fare.fareType,
        created_at: new Date().toISOString()
      }));
      
      const { error: faresError } = await supabase
        .from("fares")
        .insert(faresToInsert);
        
      if (faresError) {
        console.error("Error inserting fares:", faresError);
      }
    }
    
    // Insert holidays
    if (publicHolidays.length > 0) {
      const holidaysToInsert = publicHolidays.map(holiday => ({
        id: crypto.randomUUID(),
        date: holiday.date,
        title: holiday.title,
        description: holiday.description,
        created_at: new Date().toISOString()
      }));
      
      const { error: holidaysError } = await supabase
        .from("public_holidays")
        .insert(holidaysToInsert);
        
      if (holidaysError) {
        console.error("Error inserting public holidays:", holidaysError);
      }
    }
    
    // Insert schedules and related data
    for (const schedule of schedules) {
      // Insert base schedule
      const { data: scheduleData, error: scheduleError } = await supabase
        .from("schedules")
        .insert({
          id: schedule.id,
          route_id: schedule.routeId,
          effective_from: schedule.effectiveFrom,
          effective_until: schedule.effectiveUntil || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
        
      if (scheduleError) {
        console.error("Error inserting schedule:", scheduleError);
        continue;
      }
      
      // Insert schedule days
      if (schedule.tags.length > 0) {
        const daysToInsert = schedule.tags.map(day => ({
          id: crypto.randomUUID(),
          schedule_id: schedule.id,
          day_type: day,
          created_at: new Date().toISOString()
        }));
        
        const { error: daysError } = await supabase
          .from("schedule_days")
          .insert(daysToInsert);
          
        if (daysError) {
          console.error("Error inserting schedule days:", daysError);
        }
      }
      
      // Insert schedule fares
      if (schedule.fares && schedule.fares.length > 0) {
        const scheduleFaresToInsert = schedule.fares.map(fare => ({
          id: crypto.randomUUID(),
          schedule_id: schedule.id,
          fare_id: fare.id,
          created_at: new Date().toISOString()
        }));
        
        const { error: scheduleFaresError } = await supabase
          .from("schedule_fares")
          .insert(scheduleFaresToInsert);
          
        if (scheduleFaresError) {
          console.error("Error inserting schedule fares:", scheduleFaresError);
        }
      }
      
      // Insert departure times and their relationships
      for (const departureTime of schedule.departureTimes) {
        const { data: dtData, error: dtError } = await supabase
          .from("departure_times")
          .insert({
            id: crypto.randomUUID(),
            schedule_id: schedule.id,
            time: departureTime.time,
            created_at: new Date().toISOString()
          })
          .select();
          
        if (dtError || !dtData || dtData.length === 0) {
          console.error("Error inserting departure time:", dtError);
          continue;
        }
        
        const dtId = dtData[0].id;
        
        // Insert time info relationships
        if (departureTime.infoSuffixes && departureTime.infoSuffixes.length > 0) {
          const infoRelationsToInsert = departureTime.infoSuffixes.map(suffix => ({
            id: crypto.randomUUID(),
            departure_time_id: dtId,
            time_info_id: suffix,
            created_at: new Date().toISOString()
          }));
          
          const { error: infoRelError } = await supabase
            .from("departure_time_info")
            .insert(infoRelationsToInsert);
            
          if (infoRelError) {
            console.error("Error inserting departure time info relations:", infoRelError);
          }
        }
        
        // Insert fare relationships
        if (departureTime.fareIds && departureTime.fareIds.length > 0) {
          const fareRelationsToInsert = departureTime.fareIds.map(fareId => ({
            id: crypto.randomUUID(),
            departure_time_id: dtId,
            fare_id: fareId,
            created_at: new Date().toISOString()
          }));
          
          const { error: fareRelError } = await supabase
            .from("departure_time_fares")
            .insert(fareRelationsToInsert);
            
          if (fareRelError) {
            console.error("Error inserting departure time fare relations:", fareRelError);
          }
        }
      }
    }
    
    console.log("Database initialization completed successfully");
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error;
  }
};
