
import { supabase } from "@/lib/supabase";
import { routes, timeInfos, fares, schedules, publicHolidays } from "@/data/mockData";

/**
 * Seed Supabase database with sample data
 * Note: This function bypasses RLS by using a service role or admin context
 */
export const seedSupabaseData = async () => {
  try {
    console.log("Starting seeding process...");
    
    // First, let's try to clear existing data to avoid conflicts
    console.log("Clearing existing data...");
    
    // Clear in reverse order due to foreign key constraints
    await supabase.from('departure_time_fares').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('departure_time_infos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('departure_times').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('fares').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('schedules').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('public_holidays').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('routes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('time_infos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    console.log("✅ Cleared existing data");
    
    // 1. Insert time infos with upsert to handle conflicts
    console.log("Inserting time info symbols...");
    const { data: timeInfoData, error: timeInfoError } = await supabase
      .from('time_infos')
      .upsert(timeInfos.map(info => ({
        symbol: info.symbol,
        description: info.description
      })), {
        onConflict: 'symbol'
      })
      .select();
      
    if (timeInfoError) {
      console.error("Time info error details:", timeInfoError);
      throw new Error(`Error inserting time infos: ${timeInfoError.message}`);
    }
    console.log(`✅ Inserted ${timeInfoData?.length || 0} time infos`);
    
    // Create a mapping of symbols to database IDs for time infos
    const timeInfoMap = timeInfoData?.reduce((acc, info) => {
      const originalInfo = timeInfos.find(ti => ti.symbol === info.symbol);
      if (originalInfo) {
        acc[originalInfo.id] = info.id;
      }
      return acc;
    }, {} as Record<string, string>) || {};
    
    // 2. Insert routes with upsert
    console.log("Inserting routes...");
    const { data: routeData, error: routeError } = await supabase
      .from('routes')
      .upsert(routes.map(route => ({
        name: route.name,
        origin: route.origin,
        destination: route.destination,
        description: route.description,
        transport_type: route.transportType,
        featured_image: route.featuredImage
      })), {
        onConflict: 'name'
      })
      .select();
      
    if (routeError) {
      console.error("Route error details:", routeError);
      throw new Error(`Error inserting routes: ${routeError.message}`);
    }
    console.log(`✅ Inserted ${routeData?.length || 0} routes`);
    
    // Create a mapping of route names to database IDs
    const routeMap = routeData?.reduce((acc, route) => {
      const originalRoute = routes.find(r => r.name === route.name);
      if (originalRoute) {
        acc[originalRoute.id] = route.id;
      }
      return acc;
    }, {} as Record<string, string>) || {};
    
    // 3. Insert public holidays with upsert
    console.log("Inserting public holidays...");
    const { data: holidayData, error: holidayError } = await supabase
      .from('public_holidays')
      .upsert(publicHolidays.map(holiday => ({
        name: holiday.title,
        date: holiday.date,
        description: holiday.description || null
      })), {
        onConflict: 'date'
      })
      .select();
      
    if (holidayError) {
      console.error("Holiday error details:", holidayError);
      throw new Error(`Error inserting holidays: ${holidayError.message}`);
    }
    console.log(`✅ Inserted ${holidayData?.length || 0} public holidays`);
    
    // 4. Create comprehensive schedules for each route
    console.log("Creating comprehensive schedules...");
    
    const routeIds = Object.values(routeMap);
    
    // Sample departure times for different schedule types
    const weekdayTimes = ['06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '17:30', '18:00', '18:30', '19:00', '20:00'];
    const weekendTimes = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];
    const holidayTimes = ['09:00', '11:00', '13:00', '15:00', '17:00'];

    // Create schedules for each route
    for (let i = 0; i < routeIds.length && i < routes.length; i++) {
      const routeId = routeIds[i];
      const route = routes[i];
      
      console.log(`Creating schedules for route: ${route.name}`);
      
      // Weekday schedule
      const { data: weekdaySchedule, error: weekdayError } = await supabase
        .from('schedules')
        .upsert({
          route_id: routeId,
          name: `${route.name} - Weekday Schedule`,
          effective_from: '2024-01-01',
          effective_until: null,
          is_weekend_schedule: false,
          is_holiday_schedule: false
        }, {
          onConflict: 'route_id,name'
        })
        .select()
        .single();
      
      if (weekdayError) {
        console.error("Weekday schedule error:", weekdayError);
        continue;
      }
      
      // Insert weekday departure times
      if (weekdaySchedule) {
        const weekdayDepartures = weekdayTimes.map(time => ({
          schedule_id: weekdaySchedule.id,
          time: time
        }));
        
        await supabase.from('departure_times').upsert(weekdayDepartures, {
          onConflict: 'schedule_id,time'
        });
        
        // Create sample fares for weekday schedule
        const weekdayFares = [
          { name: 'Adult', fare_type: 'standard', price: 3.50, currency: 'USD', description: 'Standard adult fare', schedule_id: weekdaySchedule.id },
          { name: 'Student', fare_type: 'student', price: 2.50, currency: 'USD', description: 'Student discount fare', schedule_id: weekdaySchedule.id },
          { name: 'Senior', fare_type: 'senior', price: 2.00, currency: 'USD', description: 'Senior citizen fare', schedule_id: weekdaySchedule.id },
          { name: 'Child', fare_type: 'child', price: 1.50, currency: 'USD', description: 'Child fare (under 12)', schedule_id: weekdaySchedule.id }
        ];
        
        await supabase.from('fares').upsert(weekdayFares, {
          onConflict: 'schedule_id,name'
        });
      }
      
      // Weekend schedule
      const { data: weekendSchedule, error: weekendError } = await supabase
        .from('schedules')
        .upsert({
          route_id: routeId,
          name: `${route.name} - Weekend Schedule`,
          effective_from: '2024-01-01',
          effective_until: null,
          is_weekend_schedule: true,
          is_holiday_schedule: false
        }, {
          onConflict: 'route_id,name'
        })
        .select()
        .single();
      
      if (!weekendError && weekendSchedule) {
        const weekendDepartures = weekendTimes.map(time => ({
          schedule_id: weekendSchedule.id,
          time: time
        }));
        
        await supabase.from('departure_times').upsert(weekendDepartures, {
          onConflict: 'schedule_id,time'
        });
        
        const weekendFares = [
          { name: 'Adult', fare_type: 'standard', price: 3.85, currency: 'USD', description: 'Standard adult fare', schedule_id: weekendSchedule.id },
          { name: 'Student', fare_type: 'student', price: 2.75, currency: 'USD', description: 'Student discount fare', schedule_id: weekendSchedule.id },
          { name: 'Senior', fare_type: 'senior', price: 2.20, currency: 'USD', description: 'Senior citizen fare', schedule_id: weekendSchedule.id },
          { name: 'Child', fare_type: 'child', price: 1.65, currency: 'USD', description: 'Child fare (under 12)', schedule_id: weekendSchedule.id }
        ];
        
        await supabase.from('fares').upsert(weekendFares, {
          onConflict: 'schedule_id,name'
        });
      }
      
      // Holiday schedule
      const { data: holidaySchedule, error: holidayError } = await supabase
        .from('schedules')
        .upsert({
          route_id: routeId,
          name: `${route.name} - Holiday Schedule`,
          effective_from: '2024-01-01',
          effective_until: null,
          is_weekend_schedule: false,
          is_holiday_schedule: true
        }, {
          onConflict: 'route_id,name'
        })
        .select()
        .single();
      
      if (!holidayError && holidaySchedule) {
        const holidayDepartures = holidayTimes.map(time => ({
          schedule_id: holidaySchedule.id,
          time: time
        }));
        
        await supabase.from('departure_times').upsert(holidayDepartures, {
          onConflict: 'schedule_id,time'
        });
        
        const holidayFares = [
          { name: 'Adult', fare_type: 'standard', price: 4.20, currency: 'USD', description: 'Standard adult fare', schedule_id: holidaySchedule.id },
          { name: 'Student', fare_type: 'student', price: 3.00, currency: 'USD', description: 'Student discount fare', schedule_id: holidaySchedule.id },
          { name: 'Senior', fare_type: 'senior', price: 2.40, currency: 'USD', description: 'Senior citizen fare', schedule_id: holidaySchedule.id },
          { name: 'Child', fare_type: 'child', price: 1.80, currency: 'USD', description: 'Child fare (under 12)', schedule_id: holidaySchedule.id }
        ];
        
        await supabase.from('fares').upsert(holidayFares, {
          onConflict: 'schedule_id,name'
        });
      }
      
      console.log(`✅ Created comprehensive schedules for route: ${route.name}`);
    }
    
    console.log("✅ Database seeding completed successfully with comprehensive schedule data!");
    return true;
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
};
