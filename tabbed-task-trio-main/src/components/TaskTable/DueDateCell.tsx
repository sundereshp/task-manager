
import { format, addDays, isSameDay } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface DueDateCellProps {
  dueDate: Date | null;
  onChange: (date: Date | null) => void;
  disabled?: boolean;
}

export function DueDateCell({ dueDate, onChange, disabled = false }: DueDateCellProps) {
  const [isSelectMode, setIsSelectMode] = useState(true);
  
  const today = new Date();
  const tomorrow = addDays(today, 1);
  const thisWeekend = (() => {
    const date = new Date(today);
    const day = date.getDay();
    const diff = (day === 0 ? -1 : 6 - day); // If Sunday, get Saturday before, otherwise get next Saturday
    return addDays(date, diff);
  })();
  const nextWeek = addDays(today, 7);
  const nextWeekend = addDays(thisWeekend, 7);
  const inTwoWeeks = addDays(today, 14);
  const inFourWeeks = addDays(today, 28);

  const presetOptions = [
    { value: "today", label: "Today", date: today },
    { value: "tomorrow", label: "Tomorrow", date: tomorrow },
    { value: "this-weekend", label: "This Weekend", date: thisWeekend },
    { value: "next-week", label: "Next Week", date: nextWeek },
    { value: "next-weekend", label: "Next Weekend", date: nextWeekend },
    { value: "in-2-weeks", label: "In 2 Weeks", date: inTwoWeeks },
    { value: "in-4-weeks", label: "In 4 Weeks", date: inFourWeeks },
    { value: "custom", label: "Calendar Date", date: null },
    { value: "none", label: "No Due Date", date: null },
  ];

  const getPresetValue = () => {
    if (!dueDate) return "none";
    
    for (const option of presetOptions) {
      if (option.date && isSameDay(option.date, dueDate)) {
        return option.value;
      }
    }
    
    return "custom";
  };

  const handleSelectChange = (value: string) => {
    if (value === "custom") {
      setIsSelectMode(false);
      return;
    }
    
    const selectedOption = presetOptions.find(option => option.value === value);
    onChange(selectedOption?.date || null);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          disabled={disabled}
          variant="outline"
          className={cn(
            "justify-start text-left font-normal border-none",
            !dueDate && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dueDate ? format(dueDate, "MMM d, yyyy") : "No due date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
        {isSelectMode ? (
          <div className="p-2">
            <Select
              value={getPresetValue()}
              onValueChange={handleSelectChange}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Select due date" />
              </SelectTrigger>
              <SelectContent position="popper">
                {presetOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                    {option.date && (
                      <span className="ml-2 text-muted-foreground text-xs">
                        ({format(option.date, "MMM d")})
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {getPresetValue() === "custom" && (
              <div className="pt-2 flex justify-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsSelectMode(false)}
                >
                  Open Calendar
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-0">
            <div className="flex items-center p-2 border-b">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsSelectMode(true)}
                className="h-8 px-2"
              >
                ← Back to presets
              </Button>
            </div>
            <Calendar
              mode="single"
              selected={dueDate || undefined}
              onSelect={(date) => {
                onChange(date);
                setIsSelectMode(true);
              }}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
