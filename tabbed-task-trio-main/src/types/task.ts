export type Priority = "urgent" | "high" | "normal" | "low" | "none";
export type Status = "todo" | "inprogress" | "done";

export interface User {
  id: string;
  name: string;
  avatar?: string;
}

export interface TimeEstimate {
  days?: number;
  hours: number;
  minutes: number;
}

export interface ActionItem {
  id: string;
  name: string;
  assignee: string | null;
  dueDate: Date | null;
  priority: Priority;
  status: Status;
  comments: string;
  estimatedTime: TimeEstimate | null;
  timeSpent: number; // in minutes
}

export interface Subtask {
  id: string;
  name: string;
  assignee: string | null;
  dueDate: Date | null;
  priority: Priority;
  status: Status;
  comments: string;
  expanded: boolean;
  actionItems: ActionItem[];
}

export interface Task {
  id: string;
  name: string;
  assignee: string | null;
  dueDate: Date | null;
  priority: Priority;
  status: Status;
  comments: string;
  expanded: boolean;
  subtasks: Subtask[];
  createdAt?: string;  // Added as optional since it might not be present in all tasks
}

export interface Project {
  id: string;
  name: string;
  tasks: Task[];
}

export interface TimerInfo {
  projectId: string | null;
  actionItemId: string | null;
  startTime: Date | null;
  isRunning: boolean;
}
