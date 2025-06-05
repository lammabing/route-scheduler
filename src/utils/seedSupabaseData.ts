
import { clearDatabase } from "./seeding/clearDatabase";
import { seedTimeInfos } from "./seeding/seedTimeInfos";
import { seedRoutes } from "./seeding/seedRoutes";
import { seedHolidays } from "./seeding/seedHolidays";
import { seedSchedules } from "./seeding/seedSchedules";

/**
 * Seed Supabase database with sample data
 * Note: This function bypasses RLS by using a service role or admin context
 */
export const seedSupabaseData = async () => {
  try {
    console.log("Starting seeding process...");
    
    // Clear existing data
    await clearDatabase();
    
    // Seed core data
    const timeInfoMap = await seedTimeInfos();
    const routeMap = await seedRoutes();
    await seedHolidays();
    
    // Create comprehensive schedules
    await seedSchedules(routeMap);
    
    console.log("✅ Database seeding completed successfully with comprehensive schedule data!");
    return true;
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
};
