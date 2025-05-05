
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Ellipsis, Trash } from "lucide-react";

interface RowActionsProps {
  onDelete: () => void;
  onStartTimer?: () => void;
  isTimerActive?: boolean;
}

export function RowActions({ onDelete, onStartTimer, isTimerActive }: RowActionsProps) {
  return (
    <DropdownMenu>

      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0"
        >
          <Ellipsis size={14} />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end">
        {onStartTimer && (
          <DropdownMenuItem onClick={onStartTimer}>
            <span>{isTimerActive ? "Stop Timer" : "Start Timer"}</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem 
          onClick={onDelete}
          className="text-destructive"
        >
          <Trash className="mr-2 h-4 w-4" />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    
    </DropdownMenu>
  );
}
