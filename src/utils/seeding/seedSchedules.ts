
import { supabase } from "@/lib/supabase";
import { routes } from "@/data/mockData";
import { weekdayTimes, weekendTimes, holidayTimes, createFareTemplates } from "./scheduleTemplates";

export const seedSchedules = async (routeMap: Record<string, string>) => {
  console.log("Creating comprehensive schedules...");
  
  // First try to delete existing records to avoid conflicts
  await supabase.from('schedules').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  const routeIds = Object.values(routeMap);
  
  // Create schedules for each route
  for (let i = 0; i < routeIds.length && i < routes.length; i++) {
    const routeId = routeIds[i];
    const route = routes[i];
    
    console.log(`Creating schedules for route: ${route.name}`);
    
    // Create weekday schedule
    await createScheduleWithDepartures(routeId, route.name, 'weekday', weekdayTimes);
    
    // Create weekend schedule
    await createScheduleWithDepartures(routeId, route.name, 'weekend', weekendTimes);
    
    // Create holiday schedule
    await createScheduleWithDepartures(routeId, route.name, 'holiday', holidayTimes);
    
    console.log(`✅ Created comprehensive schedules for route: ${route.name}`);
  }
};

const createScheduleWithDepartures = async (
  routeId: string, 
  routeName: string, 
  type: 'weekday' | 'weekend' | 'holiday',
  times: string[]
) => {
  const scheduleConfig = {
    weekday: { is_weekend_schedule: false, is_holiday_schedule: false },
    weekend: { is_weekend_schedule: true, is_holiday_schedule: false },
    holiday: { is_weekend_schedule: false, is_holiday_schedule: true }
  };
  
  const config = scheduleConfig[type];
  
  try {
    const { data: schedule, error: scheduleError } = await supabase
      .from('schedules')
      .insert({
        route_id: routeId,
        name: `${routeName} - ${type.charAt(0).toUpperCase() + type.slice(1)} Schedule`,
        effective_from: '2024-01-01',
        effective_until: null,
        ...config
      })
      .select()
      .single();
    
    if (scheduleError) {
      console.error(`${type} schedule error:`, scheduleError);
      return;
    }
    
    if (schedule) {
      console.log(`✅ Created ${type} schedule for ${routeName}`);
      
      // Insert departure times
      const departures = times.map(time => ({
        schedule_id: schedule.id,
        time: time
      }));
      
      const { error: departureError } = await supabase
        .from('departure_times')
        .insert(departures);
      
      if (departureError) {
        console.error(`Error inserting departure times for ${type} schedule:`, departureError);
        return;
      }
      
      console.log(`✅ Added ${departures.length} departure times for ${type} schedule`);
      
      // Create fares
      const fares = createFareTemplates(schedule.id, type);
      const { error: fareError } = await supabase
        .from('fares')
        .insert(fares);
      
      if (fareError) {
        console.error(`Error inserting fares for ${type} schedule:`, fareError);
        return;
      }
      
      console.log(`✅ Added ${fares.length} fares for ${type} schedule`);
    }
  } catch (error) {
    console.error(`Unexpected error creating ${type} schedule for ${routeName}:`, error);
  }
};
