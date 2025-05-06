import { useRef, useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Task, Status, User } from "@/types/task";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { StatusCell } from "./StatusCell";
import { DueDateCell } from "./DueDateCell";
import { PriorityCell } from "./PriorityCell";
import { AssigneeCell } from "./AssigneeCell";
import { CommentsCell } from "./CommentsCell";
import { RowActions } from "./RowActions";
import { SubtaskInputRow } from "./subTaskInputRow";
import { SubtaskRow } from "./SubtaskRow";

interface TaskRowProps {
  task: Task;
  users: User[];
  selectedProjectId: string;
  editingItem: {
    id: string | null;
    type: 'task' | 'subtask' | 'actionItem' | null;
    name: string;
  } | null;
  setEditingItem: (item: {
    id: string | null;
    type: 'task' | 'subtask' | 'actionItem' | null;
    name: string;
  } | null) => void;
  updateTask: (projectId: string, taskId: string, updates: Partial<Task>) => void;
  handleDeleteItem: (id: string, type: 'task' | 'subtask' | 'actionItem') => void;
  handleAddItem: (type: 'task' | 'subtask' | 'actionItem', parentTaskId?: string, parentSubtaskId?: string) => void;
  setHoveredRowId: (id: string | null) => void;
  handleStartTimer: (taskId: string, subtaskId: string) => void;
  handleUpdateTime: (
    actionItemId: string,
    estimatedTime: { days?: number; hours: number; minutes: number } | null
  ) => void;
  handleTimerToggle: (actionItemId: string) => void;
  handleToggleExpand: (projectId: string, taskId: string, type: "task" | "subtask", subtaskId?: string) => void;
  onAddSubtask: (taskId: string) => void;
  hoveredRowId: string | null;
}

export function TaskRow({
  task,
  users,
  selectedProjectId,
  editingItem,
  setEditingItem,
  updateTask,
  handleDeleteItem,
  handleStartTimer,
  handleUpdateTime,
  handleTimerToggle,
  handleToggleExpand,
  setHoveredRowId,
  onAddSubtask,
  hoveredRowId
}: TaskRowProps) {
  const taskInputRef = useRef<HTMLInputElement>(null);
  const [showSubtaskInput, setShowSubtaskInput] = useState(false);
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;

  useEffect(() => {
    if (editingItem && editingItem.id === task.id && editingItem.type === 'task') {
      taskInputRef.current?.focus();
    }
  }, [editingItem]);

  const handleSaveEdit = () => {
    if (!editingItem || !selectedProjectId) return;
    updateTask(selectedProjectId, task.id, { name: editingItem.name });
    setEditingItem(null);
  };

  const handleAddSubtask = (e: React.MouseEvent) => {
    e.stopPropagation();
    // If task is not expanded, expand it first
    if (!task.expanded) {
      handleToggleExpand(selectedProjectId, task.id, 'task');
      // Use setTimeout to ensure the task is expanded before showing input
      setTimeout(() => setShowSubtaskInput(true), 0);
    } else {
      // If already expanded, just show the input
      setShowSubtaskInput(true);
    }
  };

  const handleSubtaskAdded = () => {
    setShowSubtaskInput(false);
  };

  return (
    <>
      <tr
        className={cn(
          "task-row",
          task.status === "inprogress" && "bg-primary/5"
        )}
        onMouseEnter={() => setHoveredRowId(task.id)}
        onMouseLeave={() => setHoveredRowId(null)}
      >
        <td className="name-cell">
          <div className="flex items-center pl-2 w-full">
            <div className="flex-shrink-0">
              <button
                className="toggler flex-shrink-0"
                onClick={() => handleToggleExpand(selectedProjectId, task.id, 'task')}
              >
                {task.expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            </div>
            <div className="flex-shrink-0 mr-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-0 bg-transparent border-none hover:scale-105 transition-transform" style={{ width: "16px", height: "16px" }}>
                    <svg viewBox="-3 -3 106 106" style={{ width: "100%", height: "100%" }}>
                      <circle
                        cx="50"
                        cy="50"
                        r="50"
                        fill="transparent"
                        className="stroke-black dark:stroke-white"
                        strokeWidth={5}
                        strokeDasharray={`calc((2 * 3.14 * 45) / 8 - 20), 20`}
                      />

                    </svg>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[120px]">
                  {[
                    { value: "todo", label: "To Do", icon: "⏳" },
                    { value: "inprogress", label: "In Progress", icon: "🔄" },
                    { value: "done", label: "Done", icon: "✅" }
                  ].map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => updateTask(selectedProjectId, task.id, { status: option.value as Status })}
                      className="flex items-center gap-2"
                    >
                      <span className="text-lg">{option.icon}</span>
                      <span>{option.label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="min-w-0 flex-1">
              {editingItem && editingItem.id === task.id && editingItem.type === 'task' ? (
                <Input
                  ref={taskInputRef}
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  onBlur={handleSaveEdit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveEdit();
                    if (e.key === 'Escape') setEditingItem(null);
                  }}
                  autoFocus
                  className="inline-edit w-full"
                />
              ) : (
                <div className="flex items-center min-w-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="truncate block min-w-0">{task.name}</span>
                    </TooltipTrigger>
                    <TooltipContent>{task.name}</TooltipContent>
                  </Tooltip>

                  {hoveredRowId === task.id && (
                    <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleAddSubtask}
                        className="h-6 w-6 p-0 text-gray-700 hover:text-green-600 flex-shrink-0"
                      >
                        <Plus size={14} />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingItem({ id: task.id, type: 'task', name: task.name });
                        }}
                        className="h-6 w-6 p-0 text-gray-700 hover:text-blue-600 flex-shrink-0"
                      >
                        <Pencil size={14} />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </td>

        <td>
          <AssigneeCell
            users={users}
            assigneeId={task.assignee}
            onChange={(assignee) => updateTask(selectedProjectId, task.id, { assignee })}
          />
        </td>
        <td>
          <DueDateCell
            dueDate={task.dueDate}
            onChange={(dueDate) => updateTask(selectedProjectId, task.id, { dueDate })}
          />
        </td>
        <td>
          <PriorityCell
            priority={task.priority}
            onChange={(priority) => updateTask(selectedProjectId, task.id, { priority })}
          />
        </td>
        <td>
          <StatusCell
            status={task.status}
            onChange={(status) => updateTask(selectedProjectId, task.id, { status })}
          />
        </td>
        <td>
          <CommentsCell
            comments={task.comments}
            onChange={(comments) => updateTask(selectedProjectId, task.id, { comments })}
          />
        </td>
        <td></td>
        <td>
          <RowActions onDelete={() => handleDeleteItem(task.id, 'task')} />
        </td>
      </tr>

      {task.expanded && (
        <>

          {(showSubtaskInput || !hasSubtasks) && (
            <SubtaskInputRow
              key={`subtask-input-${task.id}`}
              taskId={task.id}
              selectedProjectId={selectedProjectId}
              onAdd={handleSubtaskAdded}
            />
          )}
        </>
      )}
    </>
  );
}
