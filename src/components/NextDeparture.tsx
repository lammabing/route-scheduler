
import { useState, useEffect } from "react";
import { DepartureTime, Fare, TimeInfo } from "@/types";
import { formatTimeDisplay } from "@/utils/dateUtils";
import TimeRemaining from "./TimeRemaining";
import FareDisplay from "./FareDisplay";
import { Button } from "./ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface NextDepartureProps {
  departureTime: DepartureTime;
  timeInfo: TimeInfo[];
  fares?: Fare[];
  isNext: boolean;
}

const NextDeparture = ({ 
  departureTime, 
  timeInfo,
  fares = [],
  isNext
}: NextDepartureProps) => {
  const [currentTime] = useState(new Date());
  const [showFares, setShowFares] = useState(false);
  
  return (
    <div 
      className={`rounded-md mb-2 ${
        isNext ? 'next-departure' : 'bg-background'
      }`}
    >
      <div className="flex items-center justify-between p-4">
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
        <div className="flex items-center">
          {isNext && (
            <TimeRemaining 
              time={departureTime.time} 
              currentTime={currentTime}
              updateInterval={10000} 
              showHoursAndMinutes={true}
            />
          )}
          
          {fares.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="ml-2"
              onClick={() => setShowFares(!showFares)}
            >
              {showFares ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </Button>
          )}
        </div>
      </div>
      
      {showFares && fares.length > 0 && (
        <div className="px-4 pb-3 pt-0">
          <FareDisplay fares={fares} compact />
        </div>
      )}
    </div>
  );
};

export default NextDeparture;
