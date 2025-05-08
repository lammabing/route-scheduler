
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { PublicHoliday } from "@/types";
import { useState } from "react";

interface DateSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  holidays?: PublicHoliday[];
  isHoliday?: boolean;
  holidayInfo?: PublicHoliday;
  disabled?: boolean;
}

const DateSelector = ({
  selectedDate,
  onDateChange,
  holidays = [],
  isHoliday = false,
  holidayInfo,
  disabled = false,
}: DateSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Function to determine if a date is a holiday
  const isDateHoliday = (date: Date): boolean => {
    return holidays.some(
      (holiday) =>
        format(new Date(holiday.date), "yyyy-MM-dd") ===
        format(date, "yyyy-MM-dd")
    );
  };
  
  return (
    <div className="w-full">
      <div className="flex flex-col space-y-1.5">
        <div className="flex justify-between items-center">
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  isHoliday && "border-schedule-holiday",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
                disabled={disabled}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    onDateChange(date);
                    setIsOpen(false);
                  }
                }}
                modifiers={{
                  holiday: (date) => isDateHoliday(date),
                }}
                modifiersStyles={{
                  holiday: {
                    color: "white",
                    backgroundColor: "hsl(var(--destructive))",
                  },
                }}
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        
        {isHoliday && holidayInfo && (
          <div className="flex items-center">
            <Badge variant="destructive" className="ml-1">
              Holiday: {holidayInfo.title}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
};

export default DateSelector;
