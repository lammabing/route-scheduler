import { useEffect, useRef, useState } from "react";
import { DepartureTime, Fare, TimeInfo, Announcement, SpecialInfo } from "@/types";
import { formatTimeDisplay, isTimeInPast } from "@/utils/dateUtils";
import NextDeparture from "./NextDeparture";
import FareDisplay from "./FareDisplay";
import { Button } from "./ui/button";
import { Info, Bell } from "lucide-react";
import SpecialInfoDisplay from "./SpecialInfoDisplay";
import AnnouncementDisplay from "./AnnouncementDisplay";

interface ScheduleDisplayProps {
  departureTimes: DepartureTime[];
  nextDepartureTime: string | null;
  getTimeInfo: (time: string) => TimeInfo[];
  getFaresForTime: (time: string) => Fare[];
  isLoading?: boolean;
  isHoliday?: boolean;
  allFares?: Fare[];
  announcements?: Announcement[];
  specialInfo?: SpecialInfo[];
}

const ScheduleDisplay = ({
  departureTimes,
  nextDepartureTime,
  getTimeInfo,
  getFaresForTime,
  isLoading = false,
  isHoliday = false,
  allFares = [],
  announcements = [],
  specialInfo = [],
}: ScheduleDisplayProps) => {
  const nextDepartureRef = useRef<HTMLDivElement>(null);
  const [showAllFares, setShowAllFares] = useState(false);
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  const [showSpecialInfo, setShowSpecialInfo] = useState(false);

  // Scroll to next departure when it changes
  useEffect(() => {
    if (nextDepartureRef.current && nextDepartureTime) {
      nextDepartureRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [nextDepartureTime]);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-pulse space-y-4 w-full">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-12 bg-gray-200 rounded-md w-full"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (!departureTimes.length) {
    return (
      <div className="text-center p-8">
        <p className="text-lg text-muted-foreground">
          No schedule available for the selected date.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-1 mt-4 ${isHoliday ? 'holiday-schedule' : ''}`}>
      <div className="px-2 mb-4">
        <h3 className="font-semibold text-sm uppercase text-muted-foreground">
          {departureTimes.length} {departureTimes.length === 1 ? 'departure' : 'departures'}{' '}
          {isHoliday && <span className="text-schedule-holiday">(Holiday Schedule)</span>}
        </h3>

        <div className="mt-2 flex flex-wrap gap-2">
          {allFares && allFares.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAllFares(!showAllFares)}
              className="flex items-center gap-1 text-xs"
            >
              <Info className="h-3 w-3" />
              {showAllFares ? "Hide Fare Information" : "Show Fare Information"}
            </Button>
          )}
          
          {announcements && announcements.length > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAnnouncements(!showAnnouncements)}
              className={`flex items-center gap-1 text-xs ${
                announcements.some(a => a.urgency === 'urgent') 
                  ? 'border-red-300 bg-red-50 hover:bg-red-100 text-red-800' 
                  : ''
              }`}
            >
              <Bell className="h-3 w-3" />
              {showAnnouncements ? "Hide Announcements" : "Service Announcements"}
              {announcements.some(a => a.urgency === 'urgent') && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
            </Button>
          )}
          
          {specialInfo && specialInfo.length > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowSpecialInfo(!showSpecialInfo)}
              className="flex items-center gap-1 text-xs"
            >
              <Info className="h-3 w-3" />
              {showSpecialInfo ? "Hide Route Information" : "Route Information"}
            </Button>
          )}
        </div>
        
        {showAllFares && allFares && allFares.length > 0 && (
          <div className="mt-2">
            <FareDisplay fares={allFares} />
          </div>
        )}
        
        {showAnnouncements && announcements && announcements.length > 0 && (
          <div className="mt-2">
            <AnnouncementDisplay announcements={announcements} />
          </div>
        )}
        
        {showSpecialInfo && specialInfo && specialInfo.length > 0 && (
          <div className="mt-2">
            <SpecialInfoDisplay specialInfo={specialInfo} />
          </div>
        )}
      </div>

      <div className="space-y-1">
        {departureTimes.map((departureTime) => {
          const timeInfo = getTimeInfo(departureTime.time);
          const fares = getFaresForTime(departureTime.time);
          const isNext = departureTime.time === nextDepartureTime;

          // If this is the next departure, assign it to the ref
          const ref = isNext ? nextDepartureRef : null;

          return (
            <div ref={ref} key={departureTime.time}>
              <NextDeparture
                departureTime={departureTime}
                timeInfo={timeInfo}
                fares={fares}
                isNext={isNext}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-2">
        <h3 className="text-xs text-muted-foreground font-medium mb-2">
          Time Notations:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          {[...new Set(
            departureTimes
              .flatMap((dt) => dt.infoSuffixes || [])
              .filter(Boolean)
          )].map((suffix) => {
            const info = getTimeInfo("").find((i) => i.id === suffix);

            return info ? (
              <div key={info.id} className="flex items-center">
                <span className="time-info-suffix bg-primary text-white mr-1">
                  {info.symbol}
                </span>
                <span>{info.description}</span>
              </div>
            ) : null;
          })}
        </div>
      </div>
    </div>
  );
};

export default ScheduleDisplay;
