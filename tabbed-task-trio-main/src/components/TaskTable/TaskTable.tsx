import { useState } from "react";
import { useTaskContext } from "../../context/TaskContext";
import { ActionItem, Priority, Status, Subtask, Task } from "@/types/task";
import { toast } from "sonner";
import { TaskTableHeader } from "./TaskTableHeader";
import { TableHead } from "./TableHead";
import { TaskRow } from "./TaskRow";
import { SubtaskRow } from "./SubtaskRow";
import { ActionItemRow } from "./ActionItemRow";
import { TimerDialog } from "./TimerDialog";
import { EmptyState } from "./EmptyState";
import { TaskInputRow } from "./TaskInputRow";

export function TaskTable() {
  const {
    selectedProject,
    users,
    addTask,
    updateTask,
    deleteTask,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    addActionItem,
    updateActionItem,
    deleteActionItem,
    toggleExpanded,
    timer,
    startTimer,
    stopTimer
  } = useTaskContext();
  const [hoveredActionItemId, setHoveredActionItemId] = useState<string | null>(null);
  const [newTaskId, setNewTaskId] = useState<string | null>(null);
  const handleUpdateTime = (actionItemId: string, estimatedTime: { days?: number; hours: number; minutes: number } | null) => {
    if (!selectedProject) return;

    const task = selectedProject.tasks.find(t =>
      t.subtasks.some(s =>
        s.actionItems.some(ai => ai.id === actionItemId)
      )
    );

    if (!task) return;

    const subtask = task.subtasks.find(s =>
      s.actionItems.some(ai => ai.id === actionItemId)
    );

    if (!subtask) return;

    updateActionItem(selectedProject.id, task.id, subtask.id, actionItemId, { estimatedTime });
  };

  const handleTimerToggle = (actionItemId: string) => {
    if (!selectedProject) return;

    if (timer.isRunning && timer.actionItemId === actionItemId) {
      stopTimer();
    } else {
      startTimer(selectedProject.id, actionItemId);
    }
  };
  const [editingItem, setEditingItem] = useState<{
    id: string;
    type: 'task' | 'subtask' | 'actionItem';
    name: string;
  } | null>(null);

  const [newItemState, setNewItemState] = useState<{
    type: 'task' | 'subtask' | 'actionItem';
    parentTaskId?: string;
    parentSubtaskId?: string;
    name: string;
    fromExpand?: boolean;
    hoveredActionItemId: string | null;
    setHoveredActionItemId: (id: string | null) => void;
    handleUpdateTime: (actionItemId: string, estimatedTime: { days?: number; hours: number; minutes: number } | null) => void;
    handleTimerToggle: (actionItemId: string) => void;
  } | null>(null);

  const [isTimerDialogOpen, setIsTimerDialogOpen] = useState(false);
  const [timerDialogData, setTimerDialogData] = useState<{
    taskId: string;
    subtaskId: string;
    actionItems: ActionItem[];
    selectedActionItemId: string | null;
  } | null>(null);

  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<number>(14); // Changed default to 15px

  // Handle toggle expanded behavior - now with manual entry behavior
  const handleToggleExpand = (projectId: string, itemId: string, type: 'task' | 'subtask', subtaskId?: string) => {
    if (!selectedProject) return;

    if (type === 'task') {
      const task = selectedProject.tasks.find(t => t.id === itemId);
      if (!task) return;

      // Always toggle the expansion state of task
      toggleExpanded(projectId, itemId, type);
    } else if (type === 'subtask' && subtaskId) {
      const task = selectedProject.tasks.find(t => t.id === itemId);
      if (!task) return;

      const subtask = task.subtasks.find(s => s.id === subtaskId);
      if (!subtask) return;

      // Always toggle the expansion state of subtask
      toggleExpanded(projectId, itemId, type, subtaskId);
    }
  };

  const onAddSubtask = (taskId: string) => {
    if (!selectedProject) return;

    const newSubtask = {
      name: '',
      assignee: '',
      dueDate: '',
      priority: '',
      status: '',
      comments: '',
      expanded: false,
      createdAt: new Date().toISOString(),
    };

    // Directly add subtask to local project state
    addSubtask(selectedProject.id, taskId, newSubtask.name);
  };
  const onAddActionItem = (taskId: string, subtaskId: string) => {
    if (!selectedProject) return;

    const newActionItem = {
      name: '',
      assignee: '',
      dueDate: '',
      priority: '',
      status: '',
      comments: '',
      expanded: false,
      createdAt: new Date().toISOString(),
    };

    // Directly add subtask to local project state
    addActionItem(selectedProject.id, taskId, subtaskId, newActionItem.name);
  };


  if (!selectedProject) {
    return <EmptyState
      message="No project selected"
      submessage="Select a project from the sidebar or create a new one"
    />;
  }

  const handleSaveEdit = () => {
    if (!editingItem || !selectedProject) return;

    if (editingItem.type === 'task') {
      updateTask(selectedProject.id, editingItem.id, { name: editingItem.name });
    } else if (editingItem.type === 'subtask') {
      const parentTask = selectedProject.tasks.find(task =>
        task.subtasks.some(subtask => subtask.id === editingItem.id)
      );
      if (parentTask) {
        updateSubtask(selectedProject.id, parentTask.id, editingItem.id, { name: editingItem.name });
      }
    } else if (editingItem.type === 'actionItem') {
      for (const task of selectedProject.tasks) {
        for (const subtask of task.subtasks) {
          const actionItem = subtask.actionItems.find(ai => ai.id === editingItem.id);
          if (actionItem) {
            updateActionItem(selectedProject.id, task.id, subtask.id, editingItem.id, { name: editingItem.name });
            break;
          }
        }
      }
    }

    setEditingItem(null); // exit edit mode
  };

  const handleAddItem = (type: 'task' | 'subtask' | 'actionItem', parentTaskId?: string, parentSubtaskId?: string) => {
    if (type === 'subtask' && parentTaskId) {
      // Find the task and expand it if not already expanded
      const task = selectedProject?.tasks.find(t => t.id === parentTaskId);
      if (task && !task.expanded) {
        handleToggleExpand(selectedProject.id, parentTaskId, 'task');
      }
      
      // Add the subtask
      addSubtask(selectedProject.id, parentTaskId, '');
    } else if (type === 'task') {
      addTask(selectedProject.id, '');
    }

    setNewItemState({
      type,
      parentTaskId,
      parentSubtaskId,
      name: '',
      hoveredActionItemId: null,
      setHoveredActionItemId: () => { },
      handleUpdateTime: () => { },
      handleTimerToggle: () => { }
    });
  };

  const handleSaveNewItem = () => {
    if (!newItemState || !selectedProject || !newItemState.name.trim()) return;

    const { type, parentTaskId, parentSubtaskId, name, fromExpand } = newItemState;

    if (type === 'task') {
      addTask(selectedProject.id, name);
    } else if (type === 'subtask' && parentTaskId) {
      addSubtask(selectedProject.id, parentTaskId, name);
    } else if (type === 'actionItem' && parentTaskId && parentSubtaskId) {
      addActionItem(selectedProject.id, parentTaskId, parentSubtaskId, name);
    }

    setNewItemState(null);
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} added successfully`);
  };

  const handleDeleteItem = (id: string, type: 'task' | 'subtask' | 'actionItem') => {
    if (!selectedProject) return;

    if (type === 'task') {
      deleteTask(selectedProject.id, id);
      toast.success("Task deleted");
    } else if (type === 'subtask') {
      const parentTask = selectedProject.tasks.find(task =>
        task.subtasks.some(subtask => subtask.id === id)
      );
      if (parentTask) {
        deleteSubtask(selectedProject.id, parentTask.id, id);
        toast.success("Subtask deleted");
      }
    } else if (type === 'actionItem') {
      for (const task of selectedProject.tasks) {
        for (const subtask of task.subtasks) {
          if (subtask.actionItems.some(ai => ai.id === id)) {
            deleteActionItem(selectedProject.id, task.id, subtask.id, id);
            toast.success("Action item deleted");
            return;
          }
        }
      }
    }
  };
 
  const handleStartTimer = (taskId: string, subtaskId: string) => {
    const task = selectedProject.tasks.find(t => t.id === taskId);
    if (!task) return;

    const subtask = task.subtasks.find(s => s.id === subtaskId);
    if (!subtask) return;

    // If there's only one action item, start the timer for that
    if (subtask.actionItems.length === 1) {
      startTimer(selectedProject.id, subtask.actionItems[0].id);
      toast.success("Timer started");
      return;
    }

    // Otherwise open dialog to select action item
    setTimerDialogData({
      taskId,
      subtaskId,
      actionItems: subtask.actionItems,
      selectedActionItemId: null
    });

    setIsTimerDialogOpen(true);
  };

  const confirmStartTimer = () => {
    if (!timerDialogData?.selectedActionItemId || !selectedProject) return;

    startTimer(selectedProject.id, timerDialogData.selectedActionItemId);
    setIsTimerDialogOpen(false);
    toast.success("Timer started");
  };

  const handleStopTimer = () => {
    stopTimer();
    toast.success("Timer stopped");
  };

  const isActiveTimer = (actionItemId: string): boolean => {
    return timer.isRunning && timer.actionItemId === actionItemId;
  };

  const adjustFontSize = (direction: 'increase' | 'decrease') => {
    if (direction === 'increase') {
      setFontSize(prev => Math.min(prev + 1, 20)); // Max size is now 20
    } else {
      setFontSize(prev => Math.max(prev - 1, 10)); // Min size is still 10
    }
  };

  // Function to render task with its children (subtasks and action items)
  const renderTasksWithChildren = () => {
    const rows: JSX.Element[] = [];

    selectedProject.tasks.forEach((task) => {
      // Add the task row
      rows.push(
        <TaskRow
          key={task.id}
          task={task}
          users={users}
          selectedProjectId={selectedProject.id}
          hoveredRowId={hoveredRowId}
          setHoveredRowId={setHoveredRowId}
          editingItem={editingItem}
          setEditingItem={setEditingItem}
          updateTask={updateTask}
          handleDeleteItem={handleDeleteItem}
          handleAddItem={handleAddItem}
          handleStartTimer={handleStartTimer}
          handleUpdateTime={handleUpdateTime}
          handleTimerToggle={handleTimerToggle}
          handleToggleExpand={handleToggleExpand}
          onAddSubtask={onAddSubtask}
        />
        
      );

      // If task is expanded, add its subtasks
      if (task.expanded) {
        task.subtasks.forEach((subtask) => {
          // Add the subtask row
          rows.push(
            <SubtaskRow
              key={subtask.id}
              subtask={subtask}
              taskId={task.id}
              users={users}
              selectedProjectId={selectedProject.id}
              hoveredRowId={hoveredRowId}
              setHoveredRowId={setHoveredRowId}
              editingItem={editingItem}
              setEditingItem={setEditingItem}
              handleToggleExpand={handleToggleExpand}
              updateSubtask={updateSubtask}
              handleSaveEdit={handleSaveEdit}
              handleDeleteItem={handleDeleteItem}
              handleStartTimer={handleStartTimer}
              handleAddItem={handleAddItem}
              handleUpdateTime={handleUpdateTime}
              handleTimerToggle={handleTimerToggle}
              hoveredActionItemId={hoveredActionItemId}
              setHoveredActionItemId={setHoveredActionItemId}
              onAddActionItem={onAddActionItem}
            />
          );

          // If subtask is expanded, add its action items
          if (subtask.expanded) {
            subtask.actionItems.forEach((actionItem) => {
              rows.push(
                <ActionItemRow
                  key={actionItem.id}
                  actionItem={actionItem}
                  taskId={task.id}
                  subtaskId={subtask.id}
                  users={users}
                  selectedProjectId={selectedProject.id}
                  editingItem={editingItem}
                  setEditingItem={setEditingItem}
                  updateActionItem={updateActionItem}
                  handleDeleteItem={handleDeleteItem}
                  isActiveTimer={isActiveTimer(actionItem.id)}
                  hoveredActionItemId={hoveredActionItemId}
                  setHoveredActionItemId={setHoveredActionItemId}
                  handleUpdateTime={handleUpdateTime}
                  handleTimerToggle={handleTimerToggle}
                  handleToggleExpand={handleToggleExpand}
                  onAddActionItem={onAddActionItem}
                />
              );
            });
          }
        });
      }
    });

    return rows;
  };

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="task-table-container overflow-auto">
        <TaskTableHeader
          projectName={selectedProject.name}
          fontSize={fontSize}
          adjustFontSize={adjustFontSize}
          timer={{
            isRunning: timer.isRunning,
            projectId: timer.projectId,
            startTime: new Date(timer.startTime)
          }}
          selectedProjectId={selectedProject.id}
          onStopTimer={handleStopTimer}
        />
        
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table
              className="task-table min-w-full"
              style={{ fontSize: `${fontSize}px` }}
            >
              <TableHead />
              <tbody>    
                {renderTasksWithChildren()}
                <TaskInputRow selectedProjectId={selectedProject.id} />
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <TimerDialog
        isOpen={isTimerDialogOpen}
        onOpenChange={setIsTimerDialogOpen}
        dialogData={timerDialogData}
        setDialogData={setTimerDialogData}
        onStartTimer={confirmStartTimer}
      />
    </div>
  );
}