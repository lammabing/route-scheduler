
import { supabase } from "@/lib/supabase";
import { routes } from "@/data/mockData";

export const seedRoutes = async () => {
  console.log("Inserting routes...");
  
  // First try to delete existing records to avoid conflicts
  await supabase.from('routes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
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
  
  return routeMap;
};
