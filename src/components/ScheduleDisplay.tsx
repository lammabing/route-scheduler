
import { useEffect, useRef } from "react";
import { DepartureTime, TimeInfo } from "@/types";
import { formatTimeDisplay, isTimeInPast } from "@/utils/dateUtils";
import NextDeparture from "./NextDeparture";

interface ScheduleDisplayProps {
  departureTimes: DepartureTime[];
  nextDepartureTime: string | null;
  getTimeInfo: (time: string) => TimeInfo[];
  isLoading?: boolean;
  isHoliday?: boolean;
}

const ScheduleDisplay = ({
  departureTimes,
  nextDepartureTime,
  getTimeInfo,
  isLoading = false,
  isHoliday = false,
}: ScheduleDisplayProps) => {
  const nextDepartureRef = useRef<HTMLDivElement>(null);

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
      </div>

      <div className="space-y-1">
        {departureTimes.map((departureTime) => {
          const timeInfo = getTimeInfo(departureTime.time);
          const isNext = departureTime.time === nextDepartureTime;

          // If this is the next departure, assign it to the ref
          const ref = isNext ? nextDepartureRef : null;

          return (
            <div ref={ref} key={departureTime.time}>
              <NextDeparture
                departureTime={departureTime}
                timeInfo={timeInfo}
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
            // Fixed here: Only passing one argument to getTimeInfo
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
