
import { useEffect, useState } from "react";
import { formatTimeRemaining, getMinutesUntilTime } from "@/utils/dateUtils";

interface TimeRemainingProps {
  time: string;
  currentTime?: Date;
  updateInterval?: number; // in milliseconds
}

const TimeRemaining = ({
  time,
  currentTime: initialTime = new Date(),
  updateInterval = 30000 // Default update every 30 seconds
}: TimeRemainingProps) => {
  const [currentTime, setCurrentTime] = useState<Date>(initialTime);
  const [minutesRemaining, setMinutesRemaining] = useState<number>(
    getMinutesUntilTime(time, initialTime)
  );

  // Update the timer at specified intervals
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      setMinutesRemaining(getMinutesUntilTime(time, now));
    }, updateInterval);

    return () => clearInterval(timer);
  }, [time, updateInterval]);

  // Format the remaining time for display
  const formattedTime = formatTimeRemaining(minutesRemaining);
  
  // Determine color based on time remaining
  const getColorClass = () => {
    if (minutesRemaining <= 5) return "text-schedule-highlight font-bold";
    if (minutesRemaining <= 15) return "text-transport-yellow font-bold";
    return "text-transport-blue font-bold";
  };

  return (
    <span className={getColorClass()}>
      {formattedTime}
    </span>
  );
};

export default TimeRemaining;
