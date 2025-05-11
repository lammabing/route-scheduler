
import { useEffect, useState } from "react";
import { formatTimeRemaining, getMinutesUntilTime } from "@/utils/dateUtils";

interface TimeRemainingProps {
  time: string;
  currentTime?: Date;
  updateInterval?: number; // in milliseconds
  className?: string; // Add className prop for custom styling
}

const TimeRemaining = ({
  time,
  currentTime: initialTime = new Date(),
  updateInterval = 30000, // Default update every 30 seconds
  className = ""
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
    if (minutesRemaining <= 5) return "text-white font-bold";
    if (minutesRemaining <= 15) return "text-white font-bold";
    return "text-white font-bold";
  };

  return (
    <span className={`${getColorClass()} ${className}`}>
      {formattedTime}
    </span>
  );
};

export default TimeRemaining;
