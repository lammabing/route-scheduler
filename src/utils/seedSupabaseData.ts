
import { supabase } from "@/lib/supabase";
import { routes, timeInfos, fares, schedules, publicHolidays } from "@/data/mockData";

/**
 * Seed Supabase database with sample data
 */
export const seedSupabaseData = async () => {
  try {
    console.log("Starting seeding process...");
    
    // 1. Insert time infos
    console.log("Inserting time info symbols...");
    const { data: timeInfoData, error: timeInfoError } = await supabase
      .from('time_infos')
      .insert(timeInfos.map(info => ({
        symbol: info.symbol,
        description: info.description
      })))
      .select();
      
    if (timeInfoError) throw new Error(`Error inserting time infos: ${timeInfoError.message}`);
    console.log(`✅ Inserted ${timeInfoData.length} time infos`);
    
    // Create a mapping of local IDs to database IDs for time infos
    const timeInfoMap = timeInfoData.reduce((acc, info, index) => {
      acc[timeInfos[index].id] = info.id;
      return acc;
    }, {} as Record<string, string>);
    
    // 2. Insert routes
    console.log("Inserting routes...");
    const { data: routeData, error: routeError } = await supabase
      .from('routes')
      .insert(routes.map(route => ({
        name: route.name,
        origin: route.origin,
        destination: route.destination,
        description: route.description,
        transport_type: route.transportType,
        featured_image: route.featuredImage
      })))
      .select();
      
    if (routeError) throw new Error(`Error inserting routes: ${routeError.message}`);
    console.log(`✅ Inserted ${routeData.length} routes`);
    
    // Create a mapping of local IDs to database IDs for routes
    const routeMap = routeData.reduce((acc, route, index) => {
      acc[routes[index].id] = route.id;
      return acc;
    }, {} as Record<string, string>);
    
    // 3. Insert public holidays
    console.log("Inserting public holidays...");
    const { data: holidayData, error: holidayError } = await supabase
      .from('public_holidays')
      .insert(publicHolidays.map(holiday => ({
        name: holiday.title,
        date: holiday.date,
        description: holiday.description || null
      })))
      .select();
      
    if (holidayError) throw new Error(`Error inserting holidays: ${holidayError.message}`);
    console.log(`✅ Inserted ${holidayData.length} public holidays`);
    
    // 4. Insert schedules and their related data
    console.log("Inserting schedules and related data...");
    for (const schedule of schedules) {
      // 4a. Insert schedule
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('schedules')
        .insert({
          route_id: routeMap[schedule.routeId],
          name: `Schedule for ${schedule.tags.join(', ')}`,
          effective_from: schedule.effectiveFrom,
          effective_until: schedule.effectiveUntil || null,
          is_weekend_schedule: schedule.tags.includes('sat') || schedule.tags.includes('sun'),
          is_holiday_schedule: schedule.tags.includes('holiday')
        })
        .select()
        .single();
        
      if (scheduleError) throw new Error(`Error inserting schedule: ${scheduleError.message}`);
      
      const scheduleId = scheduleData.id;
      
      // 4b. Insert fares for this schedule
      const { data: fareData, error: fareError } = await supabase
        .from('fares')
        .insert(schedule.fares.map(fare => ({
          schedule_id: scheduleId,
          name: fare.name,
          fare_type: fare.fareType,
          price: fare.price,
          currency: fare.currency,
          description: fare.description
        })))
        .select();
        
      if (fareError) throw new Error(`Error inserting fares: ${fareError.message}`);
      
      // Create a mapping of local fare IDs to database IDs
      const fareMap = fareData.reduce((acc, fare, index) => {
        acc[schedule.fares[index].id] = fare.id;
        return acc;
      }, {} as Record<string, string>);
      
      // 4c. Insert departure times and their associations
      for (const departure of schedule.departureTimes) {
        // Insert departure time
        const { data: departureData, error: departureError } = await supabase
          .from('departure_times')
          .insert({
            schedule_id: scheduleId,
            time: departure.time
          })
          .select()
          .single();
          
        if (departureError) throw new Error(`Error inserting departure time: ${departureError.message}`);
        
        const departureTimeId = departureData.id;
        
        // Insert time info associations
        if (departure.infoSuffixes && departure.infoSuffixes.length > 0) {
          const timeInfoAssociations = departure.infoSuffixes.map(infoId => ({
            departure_time_id: departureTimeId,
            time_info_id: timeInfoMap[infoId]
          }));
          
          const { error: timeInfoAssocError } = await supabase
            .from('departure_time_infos')
            .insert(timeInfoAssociations);
            
          if (timeInfoAssocError) throw new Error(`Error inserting time info associations: ${timeInfoAssocError.message}`);
        }
        
        // Insert fare associations
        if (departure.fareIds && departure.fareIds.length > 0) {
          const fareAssociations = departure.fareIds.map(fareId => ({
            departure_time_id: departureTimeId,
            fare_id: fareMap[fareId]
          }));
          
          const { error: fareAssocError } = await supabase
            .from('departure_time_fares')
            .insert(fareAssociations);
            
          if (fareAssocError) throw new Error(`Error inserting fare associations: ${fareAssocError.message}`);
        }
      }
      
      console.log(`✅ Inserted schedule with ID ${scheduleId} and all related data`);
    }
    
    console.log("✅ Database seeding completed successfully!");
    return true;
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
};
