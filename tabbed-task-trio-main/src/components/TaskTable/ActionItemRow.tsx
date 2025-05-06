import { AssigneeCell } from "./AssigneeCell";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CommentsCell } from "./CommentsCell";
import { DueDateCell } from "./DueDateCell";
import { EstimatedTimeCell } from "./EstimatedTimeCell";
import { PriorityCell } from "./PriorityCell";
import { RowActions } from "./RowActions";
import { StatusCell } from "./StatusCell";
import { Button } from "@/components/ui/button";
import { Pencil, Plus } from "lucide-react";
import { X } from "lucide-react";
import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ActionItem, User, Status } from "@/types/task";

interface ActionItemRowProps {
  actionItem: ActionItem;
  taskId: string;
  subtaskId: string;
  isActiveTimer: boolean;
  users: User[];
  selectedProjectId: string;
  editingItem: {
    id: string;
    type: 'task' | 'subtask' | 'actionItem';
    name: string;
  } | null;
  setEditingItem: (item: {
    id: string;
    type: 'task' | 'subtask' | 'actionItem';
    name: string;
  } | null) => void;
  updateActionItem: (projectId: string, taskId: string, subtaskId: string, actionItemId: string, updates: Partial<ActionItem>) => void;
  handleDeleteItem: (id: string, type: 'task' | 'subtask' | 'actionItem') => void;
  hoveredActionItemId: string | null;
  setHoveredActionItemId: (id: string | null) => void;
  handleUpdateTime: (actionItemId: string, estimatedTime: { days?: number; hours: number; minutes: number } | null) => void;
  handleTimerToggle: (actionItemId: string) => void;
  handleToggleExpand: (projectId: string, taskId: string, type: "task" | "subtask", subtaskId?: string) => void;
  onAddActionItem: (taskId: string, subtaskId: string) => void;
}

export function ActionItemRow({
  actionItem,
  taskId,
  subtaskId,
  isActiveTimer,
  users,
  selectedProjectId,
  editingItem,
  setEditingItem,
  updateActionItem,
  handleDeleteItem,
  hoveredActionItemId,
  setHoveredActionItemId,
  handleUpdateTime,
  handleTimerToggle,
  handleToggleExpand,
  onAddActionItem
}: ActionItemRowProps) {
  const handleSaveEdit = () => {
    if (!editingItem || !selectedProjectId) return;

    updateActionItem(
      selectedProjectId,
      taskId,
      subtaskId,
      actionItem.id,
      { name: editingItem.name }
    );
    setEditingItem(null);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  return (
    <tr
      className={cn("task-row", isActiveTimer ? "bg-primary/5" : "")}
      onMouseEnter={() => setHoveredActionItemId(actionItem.id)}
      onMouseLeave={() => setHoveredActionItemId(null)}
    >
      <td className="name-cell">
        <div className="flex items-center pl-16 w-full">
          <div className="flex-shrink-0 mr-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="p-0 bg-transparent border-none hover:scale-105 transition-transform flex-shrink-0"
                  style={{ width: "16px", height: "16px" }}
                >
                  <svg
                    viewBox="-3 -3 106 106"
                    style={{
                      width: "100%",
                      height: "100%",
                    }}
                  >
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
                    onClick={() => updateActionItem(selectedProjectId, taskId, subtaskId, actionItem.id, { status: option.value as Status })}
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
            {editingItem && editingItem.id === actionItem.id ? (
              <Input
                value={editingItem.name}
                onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                onBlur={handleSaveEdit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveEdit();
                  if (e.key === 'Escape') handleCancelEdit();
                }}
                autoFocus
                className="inline-edit w-full"
              />
            ) : (
              <div className="flex items-center min-w-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className={cn(
                      "truncate block min-w-0",
                      isActiveTimer && "font-medium text-primary"
                    )}>
                      {actionItem.name}
                      {isActiveTimer && " (Timer Active)"}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{actionItem.name}</TooltipContent>
                </Tooltip>

                {hoveredActionItemId === actionItem.id && (
                  <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingItem({
                          id: actionItem.id,
                          type: 'actionItem',
                          name: actionItem.name
                        });
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
          assigneeId={actionItem.assignee}
          onChange={(assignee) => updateActionItem(selectedProjectId, taskId, subtaskId, actionItem.id, { assignee })}
        />
      </td>
      <td>
        <DueDateCell
          dueDate={actionItem.dueDate}
          onChange={(dueDate) => updateActionItem(selectedProjectId, taskId, subtaskId, actionItem.id, { dueDate })}
        />
      </td>
      <td>
        <PriorityCell
          priority={actionItem.priority}
          onChange={(priority) => updateActionItem(selectedProjectId, taskId, subtaskId, actionItem.id, { priority })}
        />
      </td>
      <td>
        <StatusCell
          status={actionItem.status}
          onChange={(status) => updateActionItem(selectedProjectId, taskId, subtaskId, actionItem.id, { status })}
        />
      </td>
      <td>
        <CommentsCell
          comments={actionItem.comments}
          onChange={(comments) => updateActionItem(selectedProjectId, taskId, subtaskId, actionItem.id, { comments })}
        />
      </td>
      <td>
        <EstimatedTimeCell
          estimatedTime={actionItem.estimatedTime}
          onChange={(estimatedTime) => handleUpdateTime(actionItem.id, estimatedTime)}
          timeSpent={actionItem.timeSpent}
        />
      </td>
      <td>
        <RowActions
          onDelete={() => handleDeleteItem(actionItem.id, 'actionItem')}
          onStartTimer={() => handleTimerToggle(actionItem.id)}
          isTimerActive={isActiveTimer}
        />
      </td>
    </tr>
  );
}
