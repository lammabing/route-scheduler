
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import RouteSelector from "@/components/RouteSelector";
import DateSelector from "@/components/DateSelector";
import ScheduleDisplay from "@/components/ScheduleDisplay";
import RouteFeaturedImage from "@/components/RouteFeaturedImage";
import { useSchedule } from "@/hooks/useSchedule";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState(new Date());
  
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
  
  // Clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000); // Update every 10 seconds
    
    return () => clearInterval(timer);
  }, []);
  
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
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Route Schedule Sync</h1>
        <p className="text-muted-foreground">
          Find schedules for public transportation routes
        </p>
      </div>
      
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Route Selection</CardTitle>
            <CardDescription>
              Select a route and date to view the schedule
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <>
                <RouteSelector
                  routes={routes}
                  selectedRouteId={currentRoute?.id || ""}
                  onRouteChange={setRouteId}
                  disabled={isLoading}
                />
                <DateSelector
                  selectedDate={currentDate}
                  onDateChange={setDate}
                  holidays={publicHolidays}
                  isHoliday={isHoliday}
                  holidayInfo={holidayInfo}
                  disabled={isLoading}
                />
              </>
            )}
            
            <div className="text-sm text-muted-foreground text-right">
              Current time: {format(currentTime, "h:mm:ss a")}
            </div>
          </CardContent>
        </Card>
        
        {currentRoute && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{currentRoute.name}</CardTitle>
                  <CardDescription>
                    {currentRoute.origin} → {currentRoute.destination}
                  </CardDescription>
                </div>
                {currentRoute.description && (
                  <span className="text-xs text-muted-foreground">
                    {currentRoute.description}
                  </span>
                )}
              </div>
            </CardHeader>
            
            {currentRoute.featuredImage && (
              <div className="px-6">
                <RouteFeaturedImage 
                  imageUrl={currentRoute.featuredImage} 
                  altText={`${currentRoute.name} route image`} 
                  height="h-40"
                />
              </div>
            )}
            
            <CardContent>
              {currentRoute.transportType && (
                <div className="mb-4">
                  <Badge variant="outline" className="bg-primary/10">
                    {currentRoute.transportType.charAt(0).toUpperCase() + currentRoute.transportType.slice(1)}
                  </Badge>
                </div>
              )}
              
              <ScheduleDisplay
                departureTimes={departureTimes}
                nextDepartureTime={nextDepartureTime}
                getTimeInfo={getInfoForTime}
                getFaresForTime={getFaresForTime}
                isLoading={isLoading}
                isHoliday={isHoliday}
                allFares={availableFares}
              />
            </CardContent>
          </Card>
        )}
      </div>
      
      <div className="text-center text-xs text-muted-foreground mt-8">
        <p>
          Schedules and times may change. Data is cached for offline use.{' '}
          <button 
            onClick={refreshData}
            className="text-primary underline"
          >
            Refresh Data
          </button>
        </p>
      </div>
    </div>
  );
};

export default Index;
