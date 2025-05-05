import { Input } from "@/components/ui/input";
import { TimeEstimate } from "@/types/task";
import { useState, useRef, useEffect } from "react";

interface EstimatedTimeCellProps {
  estimatedTime: TimeEstimate | null;
  onChange: (time: TimeEstimate | null) => void;
  timeSpent?: number;
  disabled?: boolean;
}

export function EstimatedTimeCell({ 
  estimatedTime, 
  onChange, 
  timeSpent = 0,
  disabled = false 
}: EstimatedTimeCellProps) {
  const [days, setDays] = useState<string>(estimatedTime?.days?.toString() || "");
  const [hours, setHours] = useState<string>(estimatedTime?.hours?.toString() || "");
  const [minutes, setMinutes] = useState<string>(estimatedTime?.minutes?.toString() || "");
  
  const daysRef = useRef<HTMLInputElement>(null);
  const hoursRef = useRef<HTMLInputElement>(null);
  const minutesRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (estimatedTime) {
      setDays(estimatedTime?.days?.toString() || "");
      setHours(estimatedTime?.hours?.toString() || "0");
      setMinutes(estimatedTime?.minutes?.toString() || "0");
    } else {
      setDays("");
      setHours("");
      setMinutes("");
    }
  }, [estimatedTime]);

  const handleBlur = () => {
    normalizeValues();
    
    const parsedDays = parseInt(days) || 0;
    const parsedHours = parseInt(hours) || 0;
    const parsedMinutes = parseInt(minutes) || 0;

    if (parsedDays === 0 && parsedHours === 0 && parsedMinutes === 0) {
      onChange(null);
    } else {
      onChange({ days: parsedDays, hours: parsedHours, minutes: parsedMinutes });
    }
  };

  const normalizeValues = () => {
    let parsedDays = parseInt(days) || 0;
    let parsedHours = parseInt(hours) || 0;
    let parsedMinutes = parseInt(minutes) || 0;
    
    if (parsedMinutes >= 60) {
      const additionalHours = Math.floor(parsedMinutes / 60);
      parsedHours += additionalHours;
      parsedMinutes = parsedMinutes % 60;
    }
    
    if (parsedHours >= 24) {
      const additionalDays = Math.floor(parsedHours / 24);
      parsedDays += additionalDays;
      parsedHours = parsedHours % 24;
    }
    
    setDays(parsedDays > 0 ? parsedDays.toString() : "");
    setHours(parsedHours > 0 ? parsedHours.toString() : "");
    setMinutes(parsedMinutes > 0 ? parsedMinutes.toString() : "");
  };

  const handleDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setDays(value);
    }
  };

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || (/^\d+$/.test(value) && parseInt(value) <= 23)) {
      setHours(value);
    }
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || (/^\d+$/.test(value) && parseInt(value) <= 59)) {
      setMinutes(value);
    }
  };

  const handleDaysKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && days !== "") {
      hoursRef.current?.focus();
    }
  };

  const handleHoursKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && hours !== "") {
      minutesRef.current?.focus();
    }
  };

  const formatTimeSpent = (minutes: number): string => {
    if (minutes === 0) return "";
    
    const days = Math.floor(minutes / (24 * 60));
    const remainingMinutes = minutes % (24 * 60);
    const hours = Math.floor(remainingMinutes / 60);
    const mins = remainingMinutes % 60;
    
    let result = "";
    if (days > 0) result += `${days}d `;
    if (hours > 0) result += `${hours}h `;
    if (mins > 0) result += `${mins}m`;
    
    return result.trim() + " spent";
  };

  return (
    <div className="estimated-time-cell">
      {disabled ? (
        <span className="time-spent text-sm">{formatTimeSpent(timeSpent)}</span>
      ) : (
        <div className="flex items-center gap-0.5">
          <input
            ref={daysRef}
            type="text"
            value={days}
            onChange={handleDaysChange}
            onBlur={handleBlur}
            onKeyDown={handleDaysKeyDown}
            maxLength={3}
            className="w-6 h-5 p-0.5 text-center border-none bg-transparent text-sm"
            placeholder="d"
            disabled={disabled}
          />
          <span className="text-sm">:</span>
          <input
            ref={hoursRef}
            type="text"
            value={hours}
            onChange={handleHoursChange}
            onBlur={handleBlur}
            onKeyDown={handleHoursKeyDown}
            maxLength={2}
            className="w-6 h-5 p-0.5 text-center border-none bg-transparent text-sm"
            placeholder="h"
            disabled={disabled}
          />
          <span className="text-sm">:</span>
          <input
            ref={minutesRef}
            type="text"
            value={minutes}
            onChange={handleMinutesChange}
            onBlur={handleBlur}
            maxLength={2}
            className="w-6 h-5 p-0.5 text-center border-none bg-transparent text-sm"
            placeholder="m"
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
}
