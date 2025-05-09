
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSchedule } from "@/hooks/useSchedule";
import Header from "@/components/Header";
import RouteSelectionCard from "@/components/RouteSelectionCard";
import RouteDetailsCard from "@/components/RouteDetailsCard";
import Footer from "@/components/Footer";

const Index = () => {
  const { toast } = useToast();
  
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
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);
  
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
      </div>
      
      <Footer refreshData={refreshData} />
    </div>
  );
};

export default Index;
