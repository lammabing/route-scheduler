
import { useState, useEffect } from "react";
import { DepartureTime, TimeInfo } from "@/types";
import { formatTimeDisplay } from "@/utils/dateUtils";
import TimeRemaining from "./TimeRemaining";

interface NextDepartureProps {
  departureTime: DepartureTime;
  timeInfo: TimeInfo[];
  isNext: boolean;
}

const NextDeparture = ({ 
  departureTime, 
  timeInfo,
  isNext
}: NextDepartureProps) => {
  const [currentTime] = useState(new Date());
  
  return (
    <div 
      className={`flex items-center justify-between p-4 mb-2 rounded-md ${
        isNext ? 'next-departure' : 'bg-background'
      }`}
    >
      <div className="flex items-center">
        <div className="text-xl font-bold">
          {formatTimeDisplay(departureTime.time)}
          {timeInfo.map((info) => (
            <sup 
              key={info.id}
              className={`time-info-suffix ${
                isNext ? 'bg-white text-schedule-highlight' : 'bg-primary text-white'
              }`}
              title={info.description}
            >
              {info.symbol}
            </sup>
          ))}
        </div>
      </div>
      <div>
        {isNext && (
          <TimeRemaining 
            time={departureTime.time} 
            currentTime={currentTime}
            updateInterval={10000} 
          />
        )}
      </div>
    </div>
  );
};

export default NextDeparture;
