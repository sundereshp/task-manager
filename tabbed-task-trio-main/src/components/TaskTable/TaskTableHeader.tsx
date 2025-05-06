import { Button } from "@/components/ui/button";
import { MinusIcon, PlusIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useTaskContext } from "@/context/TaskContext";

interface TaskTableHeaderProps {
  projectName: string;
  fontSize: number;
  adjustFontSize: (direction: 'increase' | 'decrease') => void;
  timer: {
    isRunning: boolean;
    projectId: string | null;
    startTime: Date | null;
  };
  selectedProjectId: string | null;
  onStopTimer: () => void;
}

export function TaskTableHeader({
  projectName,
  fontSize,
  adjustFontSize,
  timer,
  selectedProjectId,
  onStopTimer,
}: TaskTableHeaderProps) {
  const isTimerActiveForProject =
    timer.isRunning && timer.projectId === selectedProjectId;

  const { selectedProject, addTask, setEditingItem } = useTaskContext();
  
  const onAddTask = async () => {
    if (!selectedProject) return;
  
    const newTask = {
      name: '', // Leave name empty to prompt immediate editing
      assignee: '',
      dueDate: '',
      priority: '',
      status: '',
      comments: '',
      subtasks: [],
      expanded: false,
      createdAt: new Date().toISOString(),
    };
  
    try {
      const addedTask = await addTask(selectedProject.id, newTask.name);
  
      // Enable editing mode right after task is added
      setEditingItem({
        id: addedTask.id,
        type: 'task',
        name: '', // Start with empty string
      });
    } catch (error) {
      console.error("Failed to add task:", error);
    }
  };

  return (
    <div className="mb-4 flex items-center justify-between sticky top-0 bg-background z-10 py-2">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold mr-4">{projectName}</h1>
        <div className="flex items-center space-x-1 bg-muted/50 rounded-md p-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-7 w-7 p-0',
              fontSize <= 10 && 'text-muted-foreground'
            )}
            onClick={() => adjustFontSize('decrease')}
            disabled={fontSize <= 10}
          >
            <MinusIcon className="h-4 w-4" />
          </Button>
          <span className="text-xs font-medium px-1">{fontSize}px</span>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-7 w-7 p-0',
              fontSize >= 20 && 'text-muted-foreground'
            )}
            onClick={() => adjustFontSize('increase')}
            disabled={fontSize >= 20}
          >
            <PlusIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isTimerActiveForProject && (
        <div className="flex items-center space-x-4">
          <div className="text-sm">
            <span className="timer-active font-medium">Timer running: </span>
            <span>{format(timer.startTime!, 'HH:mm:ss')}</span>
          </div>
          <Button variant="destructive" size="sm" onClick={onStopTimer}>
            Stop Timer
          </Button>
        </div>
      )}

      
    </div>
  );
}
