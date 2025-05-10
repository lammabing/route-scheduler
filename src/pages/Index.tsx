
import { useEffect } from "react";
import { toast } from "sonner";
import { useSchedule } from "@/hooks/useSchedule";
import Header from "@/components/Header";
import RouteSelectionCard from "@/components/RouteSelectionCard";
import RouteDetailsCard from "@/components/RouteDetailsCard";
import Footer from "@/components/Footer";
import AdminSeeder from "@/components/AdminSeeder";

const Index = () => {
  const {
    routes,
    currentRoute,
    currentDate,
    selectedSchedule,
    timeInfos,
    publicHolidays,
    isHoliday,
    holidayInfo,
    departureTimes,
    nextDepartureTime,
    isLoading,
    error,
    setRouteId,
    setDate,
    getInfoForTime,
    getFaresForTime,
    availableFares,
    refreshData
  } = useSchedule();
  
  // Error handling
  useEffect(() => {
    if (error) {
      toast.error("Error", {
        description: error,
      });
    }
  }, [error]);
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl min-h-screen">
      <Header />
      
      <div className="grid gap-6">
        <RouteSelectionCard 
          routes={routes}
          currentRoute={currentRoute}
          currentDate={currentDate}
          isLoading={isLoading}
          publicHolidays={publicHolidays}
          isHoliday={isHoliday}
          holidayInfo={holidayInfo}
          setRouteId={setRouteId}
          setDate={setDate}
        />
        
        {currentRoute && (
          <RouteDetailsCard 
            route={currentRoute}
            departureTimes={departureTimes}
            nextDepartureTime={nextDepartureTime}
            isLoading={isLoading}
            isHoliday={isHoliday}
            getInfoForTime={getInfoForTime}
            getFaresForTime={getFaresForTime}
            availableFares={availableFares}
          />
        )}
        
        {routes.length === 0 && !isLoading && (
          <div className="p-8 text-center border rounded-lg bg-amber-50 border-amber-200">
            <h2 className="text-xl font-semibold text-amber-800 mb-2">No Routes Found</h2>
            <p className="text-amber-700 mb-4">
              Your database appears to be empty. Use the "Seed Database" button to populate it with sample data.
            </p>
          </div>
        )}
      </div>
      
      <Footer refreshData={refreshData} />
      
      {/* Add the database seeder button */}
      <AdminSeeder />
    </div>
  );
};

export default Index;
