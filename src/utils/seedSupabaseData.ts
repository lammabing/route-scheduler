
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

    // 5. Create additional sample schedules for better coverage
    console.log("Creating additional sample schedules...");
    
    // Get route IDs for additional schedules
    const routeIds = Object.values(routeMap);
    
    // Sample departure times for different schedule types
    const weekdayTimes = ['06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '17:30', '18:00', '18:30', '19:00', '20:00'];
    const weekendTimes = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];
    const holidayTimes = ['09:00', '11:00', '13:00', '15:00', '17:00'];

    // Create schedules for each route
    for (let i = 0; i < routeIds.length; i++) {
      const routeId = routeIds[i];
      const route = routes[i];
      
      // Weekday schedule
      const { data: weekdaySchedule, error: weekdayError } = await supabase
        .from('schedules')
        .insert({
          route_id: routeId,
          name: `${route.name} - Weekday Schedule`,
          effective_from: '2024-01-01',
          effective_until: null,
          is_weekend_schedule: false,
          is_holiday_schedule: false
        })
        .select()
        .single();
      
      if (weekdayError) throw new Error(`Error creating weekday schedule: ${weekdayError.message}`);
      
      // Insert weekday departure times
      const weekdayDepartures = weekdayTimes.map(time => ({
        schedule_id: weekdaySchedule.id,
        time: time
      }));
      
      const { error: weekdayDepartureError } = await supabase
        .from('departure_times')
        .insert(weekdayDepartures);
      
      if (weekdayDepartureError) throw new Error(`Error inserting weekday departures: ${weekdayDepartureError.message}`);
      
      // Weekend schedule
      const { data: weekendSchedule, error: weekendError } = await supabase
        .from('schedules')
        .insert({
          route_id: routeId,
          name: `${route.name} - Weekend Schedule`,
          effective_from: '2024-01-01',
          effective_until: null,
          is_weekend_schedule: true,
          is_holiday_schedule: false
        })
        .select()
        .single();
      
      if (weekendError) throw new Error(`Error creating weekend schedule: ${weekendError.message}`);
      
      // Insert weekend departure times
      const weekendDepartures = weekendTimes.map(time => ({
        schedule_id: weekendSchedule.id,
        time: time
      }));
      
      const { error: weekendDepartureError } = await supabase
        .from('departure_times')
        .insert(weekendDepartures);
      
      if (weekendDepartureError) throw new Error(`Error inserting weekend departures: ${weekendDepartureError.message}`);
      
      // Holiday schedule
      const { data: holidaySchedule, error: holidayError } = await supabase
        .from('schedules')
        .insert({
          route_id: routeId,
          name: `${route.name} - Holiday Schedule`,
          effective_from: '2024-01-01',
          effective_until: null,
          is_weekend_schedule: false,
          is_holiday_schedule: true
        })
        .select()
        .single();
      
      if (holidayError) throw new Error(`Error creating holiday schedule: ${holidayError.message}`);
      
      // Insert holiday departure times
      const holidayDepartures = holidayTimes.map(time => ({
        schedule_id: holidaySchedule.id,
        time: time
      }));
      
      const { error: holidayDepartureError } = await supabase
        .from('departure_times')
        .insert(holidayDepartures);
      
      if (holidayDepartureError) throw new Error(`Error inserting holiday departures: ${holidayDepartureError.message}`);
      
      // Create sample fares for each schedule
      const sampleFares = [
        { name: 'Adult', fare_type: 'standard', price: 3.50, currency: 'USD', description: 'Standard adult fare' },
        { name: 'Student', fare_type: 'student', price: 2.50, currency: 'USD', description: 'Student discount fare' },
        { name: 'Senior', fare_type: 'senior', price: 2.00, currency: 'USD', description: 'Senior citizen fare' },
        { name: 'Child', fare_type: 'child', price: 1.50, currency: 'USD', description: 'Child fare (under 12)' }
      ];
      
      // Insert fares for weekday schedule
      const weekdayFares = sampleFares.map(fare => ({
        ...fare,
        schedule_id: weekdaySchedule.id
      }));
      
      const { error: weekdayFareError } = await supabase
        .from('fares')
        .insert(weekdayFares);
      
      if (weekdayFareError) throw new Error(`Error inserting weekday fares: ${weekdayFareError.message}`);
      
      // Insert fares for weekend schedule (slightly higher prices)
      const weekendFares = sampleFares.map(fare => ({
        ...fare,
        schedule_id: weekendSchedule.id,
        price: fare.price * 1.1 // 10% higher for weekends
      }));
      
      const { error: weekendFareError } = await supabase
        .from('fares')
        .insert(weekendFares);
      
      if (weekendFareError) throw new Error(`Error inserting weekend fares: ${weekendFareError.message}`);
      
      // Insert fares for holiday schedule
      const holidayFares = sampleFares.map(fare => ({
        ...fare,
        schedule_id: holidaySchedule.id,
        price: fare.price * 1.2 // 20% higher for holidays
      }));
      
      const { error: holidayFareError } = await supabase
        .from('fares')
        .insert(holidayFares);
      
      if (holidayFareError) throw new Error(`Error inserting holiday fares: ${holidayFareError.message}`);
      
      console.log(`✅ Created comprehensive schedules for route: ${route.name}`);
    }
    
    console.log("✅ Database seeding completed successfully with comprehensive schedule data!");
    return true;
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
};
