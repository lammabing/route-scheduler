
import React from "react";
import RouteSelector from "./RouteSelector";
import DateSelector from "./DateSelector";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { format } from "date-fns";
import { Route, PublicHoliday } from "@/types";

interface RouteSelectionCardProps {
  routes: Route[];
  currentRoute?: Route | null;
  currentDate: Date;
  isLoading: boolean;
  publicHolidays: PublicHoliday[];
  isHoliday: boolean;
  holidayInfo?: PublicHoliday | undefined;
  setRouteId: (id: string) => void;
  setDate: (date: Date) => void;
}

const RouteSelectionCard = ({
  routes,
  currentRoute,
  currentDate,
  isLoading,
  publicHolidays,
  isHoliday,
  holidayInfo,
  setRouteId,
  setDate,
}: RouteSelectionCardProps) => {
  const [currentTime, setCurrentTime] = React.useState(new Date());

  // Clock update
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000); // Update every 10 seconds
    
    return () => clearInterval(timer);
  }, []);

  return (
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
  );
};

export default RouteSelectionCard;
