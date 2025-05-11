
import React from "react";
import { Route, DepartureTime, Fare, TimeInfo, Announcement, SpecialInfo } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import RouteFeaturedImage from "./RouteFeaturedImage";
import ScheduleDisplay from "./ScheduleDisplay";
import { Badge } from "./ui/badge";

// Sample data for demonstration
const sampleAnnouncements: Announcement[] = [
  {
    id: "ann1",
    title: "Track Maintenance",
    content: "Expect minor delays of 5-10 minutes due to scheduled track maintenance.",
    urgency: "info",
    effectiveFrom: "May 15, 2026",
    effectiveUntil: "May 20, 2026"
  }
];

const sampleSpecialInfo: SpecialInfo[] = [
  {
    id: "info1",
    title: "Bicycle Policy",
    content: "Bicycles are welcome on this route during non-peak hours. Please use designated areas.",
    icon: "bike"
  }
];

interface RouteDetailsCardProps {
  route: Route;
  departureTimes: DepartureTime[];
  nextDepartureTime: string | null;
  isLoading: boolean;
  isHoliday: boolean;
  getInfoForTime: (time: string) => TimeInfo[];
  getFaresForTime: (time: string) => Fare[];
  availableFares: Fare[];
}

const RouteDetailsCard = ({
  route,
  departureTimes,
  nextDepartureTime,
  isLoading,
  isHoliday,
  getInfoForTime,
  getFaresForTime,
  availableFares,
}: RouteDetailsCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{route.name}</CardTitle>
            <CardDescription>
              {route.origin} → {route.destination}
            </CardDescription>
          </div>
          {route.description && (
            <span className="text-xs text-muted-foreground">
              {route.description}
            </span>
          )}
        </div>
      </CardHeader>
      
      {route.featuredImage && (
        <div className="px-6">
          <RouteFeaturedImage 
            imageUrl={route.featuredImage} 
            altText={`${route.name} route image`} 
            height="h-40"
          />
        </div>
      )}
      
      <CardContent>
        {route.transportType && (
          <div className="mb-4">
            <Badge variant="outline" className="bg-primary/10">
              {route.transportType.charAt(0).toUpperCase() + route.transportType.slice(1)}
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
          announcements={sampleAnnouncements}
          specialInfo={sampleSpecialInfo}
        />
      </CardContent>
    </Card>
  );
};

export default RouteDetailsCard;
