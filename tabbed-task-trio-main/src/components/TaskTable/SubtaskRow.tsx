import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Subtask, User, Status } from "@/types/task";
import { ChevronDown, ChevronRight, Pencil, Plus } from "lucide-react";
import { AssigneeCell } from "./AssigneeCell";
import { CommentsCell } from "./CommentsCell";
import { DueDateCell } from "./DueDateCell";
import { PriorityCell } from "./PriorityCell";
import { RowActions } from "./RowActions";
import { StatusCell } from "./StatusCell";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState } from 'react';
import { ActionItemInputRow } from './ActionItemInputRow';
import { ActionItemRow } from './ActionItemRow';

interface SubtaskRowProps {
  subtask: Subtask;
  taskId: string;
  users: User[];
  selectedProjectId: string;
  hoveredRowId: string | null;
  setHoveredRowId: (id: string | null) => void;
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
  updateSubtask: (projectId: string, taskId: string, subtaskId: string, updates: Partial<Subtask>) => void;
  handleSaveEdit: () => void;
  handleDeleteItem: (id: string, type: 'task' | 'subtask' | 'actionItem') => void;
  handleAddItem: (type: 'task' | 'subtask' | 'actionItem', parentTaskId?: string, parentSubtaskId?: string) => void;
  handleStartTimer: (projectId: string, actionItemId: string) => void;
  handleUpdateTime: (actionItemId: string, estimatedTime: { days?: number; hours: number; minutes: number } | null) => void;
  handleTimerToggle: (actionItemId: string) => void;
  hoveredActionItemId: string | null;
  setHoveredActionItemId: (id: string | null) => void;
  onAddActionItem: (taskId: string, subtaskId: string) => void;
  handleToggleExpand: (projectId: string, taskId: string, type: "task" | "subtask", subtaskId?: string) => void;
  onToggleExpand: (projectId: string, taskId: string, type: "task" | "subtask", subtaskId?: string) => void;
}

export function SubtaskRow({
  subtask,
  taskId,
  users,
  selectedProjectId,
  hoveredRowId,
  setHoveredRowId,
  editingItem,
  setEditingItem,
  updateSubtask,
  handleSaveEdit,
  handleDeleteItem,
  handleAddItem,
  handleStartTimer,
  handleUpdateTime,
  handleTimerToggle,
  hoveredActionItemId,
  setHoveredActionItemId,
  onAddActionItem,
  onToggleExpand
}: SubtaskRowProps) {
  const [showActionItemInput, setShowActionItemInput] = useState(false);

  const handleAddActionItemClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // If the subtask is collapsed (chevron is right), expand it first
    if (!subtask.expanded) {
      await handleToggleExpand(selectedProjectId, taskId, 'subtask', subtask.id);
    }

    // Show the action item input row
    setShowActionItemInput(true);
  };

  const handleActionItemAdded = () => {
    setShowActionItemInput(false);
  };

  const handleToggleExpand = async (projectId: string, taskId: string, type: "task" | "subtask", subtaskId?: string) => {
    if (type === 'subtask' && subtaskId === subtask.id) {
      const wasCollapsed = !subtask.expanded;
      await onToggleExpand(projectId, taskId, type, subtaskId);

      // If expanding and there are no action items, show the input row
      if (wasCollapsed && (!subtask.actionItems || subtask.actionItems.length === 0)) {
        setShowActionItemInput(true);
      }
    }
  };

  return (
    <>
      <tr
        key={subtask.id}
        className="task-row"
        onMouseEnter={() => setHoveredRowId(subtask.id)}
        onMouseLeave={() => setHoveredRowId(null)}
      >
        <td className="name-cell">
          <div className="flex items-center pl-8 w-full">
            <div className="flex-shrink-0">
              <button
                className="toggler flex-shrink-0"
                onClick={() => handleToggleExpand(selectedProjectId, taskId, 'subtask', subtask.id)}
              >
                {subtask.expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            </div>
            <div className="flex-shrink-0 mr-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="p-0 bg-transparent border-none hover:scale-105 transition-transform"
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
                      onClick={() => updateSubtask(selectedProjectId, taskId, subtask.id, { status: option.value as Status })}
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
              {editingItem && editingItem.id === subtask.id ? (
                <Input
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
                      <span className="truncate block min-w-0">{subtask.name}</span>
                    </TooltipTrigger>
                    <TooltipContent>{subtask.name}</TooltipContent>
                  </Tooltip>

                  {hoveredRowId === subtask.id && (
                    <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleAddActionItemClick}
                        className="h-6 w-6 p-0 text-gray-700 hover:text-green-600 flex-shrink-0"
                      >
                        <Plus size={14} />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingItem({ id: subtask.id, type: 'subtask', name: subtask.name });
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
            assigneeId={subtask.assignee}
            onChange={(assignee) => updateSubtask(selectedProjectId, taskId, subtask.id, { assignee })}
          />
        </td>
        <td>
          <DueDateCell
            dueDate={subtask.dueDate}
            onChange={(dueDate) => updateSubtask(selectedProjectId, taskId, subtask.id, { dueDate })}
          />
        </td>
        <td>
          <PriorityCell
            priority={subtask.priority}
            onChange={(priority) => updateSubtask(selectedProjectId, taskId, subtask.id, { priority })}
          />
        </td>
        <td>
          <StatusCell
            status={subtask.status}
            onChange={(status) => updateSubtask(selectedProjectId, taskId, subtask.id, { status })}
          />
        </td>
        <td>
          <CommentsCell
            comments={subtask.comments}
            onChange={(comments) => updateSubtask(selectedProjectId, taskId, subtask.id, { comments })}
          />
        </td>
        <td></td>
        <td>
          <RowActions
            onDelete={() => handleDeleteItem(subtask.id, 'subtask')}
            onStartTimer={() => handleStartTimer(selectedProjectId, subtask.id)}
          />
        </td>
      </tr>
      {showActionItemInput && (
        <ActionItemInputRow
          key={`action-item-input-${subtask.id}`}
          taskId={taskId}
          subtaskId={subtask.id}
          selectedProjectId={selectedProjectId}
          onAdd={() => {
            handleActionItemAdded();
            // If there were no action items before, we want to keep the input row visible
            if (subtask.actionItems && subtask.actionItems.length > 0) {
              setShowActionItemInput(false);
            }
          }}
          onCancel={() => {
            setShowActionItemInput(false);
            // If there are no action items, collapse the subtask when canceling
            if (!subtask.actionItems || subtask.actionItems.length === 0) {
              handleToggleExpand(selectedProjectId, taskId, 'subtask', subtask.id);
            }
          }}
        />
      )}
    </>
  );
}
