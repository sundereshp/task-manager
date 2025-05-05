
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "@/types/task";

interface AssigneeCellProps {
  users: User[]; //
  assigneeId: string | null;
  onChange: (userId: string | null) => void;
  disabled?: boolean;//disabled 
}

export function AssigneeCell({ users, assigneeId, onChange, disabled = false }: AssigneeCellProps) {
  const handleChange = (value: string) => {
    onChange(value === "unassigned" ? null : value);
  };

  return (
    <Select 
      disabled={disabled}
      value={assigneeId || "unassigned"} 
      onValueChange={handleChange}
    >
      <SelectTrigger className="w-32 border-none">
        <SelectValue>
          {assigneeId 
            ? users.find(u => u.id === assigneeId)?.name || "Unknown"
            : "Unassigned"
          }
        </SelectValue>
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="unassigned">Unassigned</SelectItem>
        {users.map(user => (
          <SelectItem key={user.id} value={user.id}>
            {user.name}
          </SelectItem>
        ))}      
      </SelectContent>
      
    </Select>
  );
}
