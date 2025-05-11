
import { useEffect, useState } from "react";
import { formatTimeRemaining, getMinutesUntilTime } from "@/utils/dateUtils";

interface TimeRemainingProps {
  time: string;
  currentTime?: Date;
  updateInterval?: number; // in milliseconds
  showHoursAndMinutes?: boolean; // New prop to display hours and minutes
}

const TimeRemaining = ({
  time,
  currentTime: initialTime = new Date(),
  updateInterval = 30000, // Default update every 30 seconds
  showHoursAndMinutes = false
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
  
  // Format hours and minutes explicitly if requested
  const hoursAndMinutes = showHoursAndMinutes ? formatHoursAndMinutes(minutesRemaining) : null;
  
  // Determine color based on time remaining
  const getColorClass = () => {
    if (minutesRemaining <= 5) return "text-schedule-highlight";
    if (minutesRemaining <= 15) return "text-transport-yellow";
    return "text-transport-blue";
  };

  return (
    <span className={`font-medium ${getColorClass()}`}>
      {formattedTime}
      {showHoursAndMinutes && hoursAndMinutes && (
        <span className="block text-xs">{hoursAndMinutes}</span>
      )}
    </span>
  );
};

// Helper function to format time in hours:minutes format
const formatHoursAndMinutes = (minutes: number): string | null => {
  if (minutes <= 0) return null;
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  }
  
  return `${hours}h ${mins}m`;
};

export default TimeRemaining;
