import { cn } from "@/lib/utils";
import { Status } from "../../types/task";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StatusCellProps {
  status: Status;
  onChange: (value: Status) => void;
  disabled?: boolean;
}

const statusOptions = [
  { value: "todo", label: "To Do", icon: "⏳" },
  { value: "inprogress", label: "In Progress", icon: "🔄" },
  { value: "done", label: "Done", icon: "✅" }
];

const statusColors = {
  todo: "text-status-todo",
  inprogress: "text-status-inprogress",
  done: "text-status-done"
};

export function StatusCell({ status, onChange, disabled = false }: StatusCellProps) {
  const selectedOption = statusOptions.find(option => option.value === status);
  
  return (
    <Select 
      disabled={disabled}
      value={status} 
      onValueChange={(value) => onChange(value as Status)}
    >
      <SelectTrigger 
        className={cn(
          "border-none w-full",
          "flex items-center justify-between",
          "text-sm min-w-0",
          statusColors[status]
        )}
      >
        <SelectValue>
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-lg flex-shrink-0">{selectedOption?.icon}</span>
            <span className="truncate block min-w-0">{selectedOption?.label}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map(option => (
          <SelectItem 
            key={option.value} 
            value={option.value}
            className="flex items-center gap-2"
          >
            <span className="text-lg">{option.icon}</span>
            <span>{option.label}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
