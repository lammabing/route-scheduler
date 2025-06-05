
import { supabase } from "@/lib/supabase";
import { publicHolidays } from "@/data/mockData";

export const seedHolidays = async () => {
  console.log("Inserting public holidays...");
  
  // First try to delete existing records to avoid conflicts
  await supabase.from('public_holidays').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  const { data: holidayData, error: holidayError } = await supabase
    .from('public_holidays')
    .insert(publicHolidays.map(holiday => ({
      name: holiday.title,
      date: holiday.date,
      description: holiday.description || null
    })))
    .select();
    
  if (holidayError) {
    console.error("Holiday error details:", holidayError);
    throw new Error(`Error inserting holidays: ${holidayError.message}`);
  }
  
  console.log(`✅ Inserted ${holidayData?.length || 0} public holidays`);
  
  return holidayData;
};
