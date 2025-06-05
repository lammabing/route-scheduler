
import { supabase } from "@/lib/supabase";

export const clearDatabase = async () => {
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
};
