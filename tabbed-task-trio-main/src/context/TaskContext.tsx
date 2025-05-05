import React, { createContext, useContext, useState, useEffect } from "react";
import { ActionItem, Priority, Project, Status, Subtask, Task, User } from "../types/task";
import { addDays } from "date-fns";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

// Sample user data
const users: User[] = [
  { id: "1", name: "John Doe" },
  { id: "2", name: "Jane Williams Smith" },
  { id: "3", name: "Mike Johnson" },
  { id: "4", name: "Amy Chen" },
  { id: "5", name: "Bob Wilson" },
  { id: "6", name: "Chris Lee" },
];

interface TaskContextType {
  projects: Project[];
  users: User[];
  timer: TimerInfo;
  selectedProject: Project | null;
  newTaskId: string | null;
  setNewTaskId: (id: string | null) => void;
  //functions to add, update, delete, rename, duplicate projects
  addProject: (name: string) => Promise<Project>;
  updateProject: (projectId: string, name: string) => Promise<Project>;
  deleteProject: (projectId: string) => Promise<void>;
  renameProject: (projectId: string, name: string) => Promise<void>;
  duplicateProject: (projectId: string) => Promise<void>;
  selectProject: (projectId: string | null) => void;
  //functions to add, update, delete, rename, duplicate tasks
  addTask: (projectId: string, name: string) => Promise<Task>;
  updateTask: (projectId: string, taskId: string, updates: Partial<Task>) => void;
  deleteTask: (projectId: string, taskId: string) => Promise<void>;
  //functions to add, update, delete, rename, duplicate subtasks
  addSubtask: (projectId: string, taskId: string, name: string) => Promise<Subtask>;
  updateSubtask: (projectId: string, taskId: string, subtaskId: string, updates: Partial<Subtask>) => void;
  deleteSubtask: (projectId: string, taskId: string, subtaskId: string) => Promise<void>;
  //functions to add, update, delete, rename, duplicate action items
  addActionItem: (projectId: string, taskId: string, subtaskId: string, name: string) => Promise<void>;
  updateActionItem: (projectId: string, taskId: string, subtaskId: string, actionItemId: string, updates: Partial<ActionItem>) => void;
  deleteActionItem: (projectId: string, taskId: string, subtaskId: string, actionItemId: string) => Promise<void>;
  //functions to toggle expanded state of tasks and subtasks
  toggleExpanded: (projectId: string, taskId: string, type: "task" | "subtask", subtaskId?: string) => void;
  //functions to start and stop timer
  startTimer: (projectId: string, actionItemId: string) => void;
  stopTimer: () => void;
  //function to get user by id
  getUserById: (id: string | null) => User | undefined;
  //editing state
  editingItem: {
    id: string | null;
    type: 'task' | 'subtask' | 'actionItem' | null;
    name: string;
  };
  setEditingItem: (item: {
    id: string | null;
    type: 'task' | 'subtask' | 'actionItem' | null;
    name: string;
  }) => void;
}
//The TimerInfo interface defines the structure of a timer object 
interface TimerInfo {
  projectId: string | null;
  actionItemId: string | null;
  startTime: Date | null;
  isRunning: boolean;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [newTaskId, setNewTaskId] = useState<string | null>(null);
  const [timer, setTimer] = useState<TimerInfo>({
    projectId: null,
    actionItemId: null,
    startTime: null,
    isRunning: false
  });
  const [editingItem, setEditingItem] = useState({
    id: null,
    type: null,
    name: ""
  });

  const selectedProject = projects.find(p => p.id === selectedProjectId) || null;

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_URL}/projects`);
      setProjects(response.data);
      if (response.data.length > 0) {
        setSelectedProjectId(response.data[0].id);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const addProject = async (name: string) => {
    try {
      const response = await axios.post(`${API_URL}/projects`, { name });
      await fetchProjects();
      return response.data;
    } catch (error) {
      console.error("Error adding project:", error);
      throw error;
    }
  };

  const updateProject = async (projectId: string, name: string) => {
    try {
      console.log(`Making API call to update project ${projectId} with name: ${name}`);
      const response = await axios.put(`${API_URL}/projects/${projectId}`, { name });
      console.log("API response:", response.data);

      // Update local state immediately
      setProjects(prevProjects => {
        const updatedProjects = prevProjects.map(project =>
          project.id === projectId ? { ...project, name } : project
        );
        return updatedProjects;
      });

      return response.data;
    } catch (error: any) {
      console.error("Error updating project:", {
        projectId,
        name,
        error: error.message,
        response: error.response?.data
      });
      throw error;
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      await axios.delete(`${API_URL}/projects/${projectId}`);
      await fetchProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
      throw error;
    }
  };

  const renameProject = async (projectId: string, name: string) => {
    try {
      console.log(`Starting rename process for project ${projectId} with name: ${name}`);

      // First, find the project in the current state
      const project = projects.find(p => p.id === projectId);
      if (!project) {
        throw new Error(`Project not found with ID: ${projectId}`);
      }

      // Update the project
      await updateProject(projectId, name);
      console.log(`Successfully updated project ${projectId}`);

      // Refresh projects to ensure consistency
      await fetchProjects();
      console.log(`Projects refreshed after rename`);
    } catch (error: any) {
      console.error("Error in renameProject:", {
        projectId,
        name,
        error: error.message,
        response: error.response?.data
      });

      throw error;
    }
  };

  const duplicateProject = async (projectId: string) => {
    try {
      await axios.post(`${API_URL}/projects/${projectId}/duplicate`);
      await fetchProjects();
    } catch (error) {
      console.error("Error duplicating project:", error);
      throw error;
    }
  };

  const selectProject = (projectId: string | null) => {
    setSelectedProjectId(projectId);
  };

  const addTask = async (projectId: string, name: string) => {
    try {
      const newTaskData = {
        name,
        assignee: null,
        dueDate: null,
        priority: "normal" as Priority,
        status: "todo" as Status,
        comments: ""
      };

      const response = await axios.post(
        `http://localhost:5000/api/projects/${projectId}/tasks`,
        newTaskData
      );

      const newTask: Task = {
        id: response.data.id,
        ...newTaskData,
        subtasks: [],
        expanded: false,
        createdAt: new Date().toISOString()
      };

      // Update local state and THEN set editing state in a callback
      setProjects(prevProjects => {
        const updated = prevProjects.map(project => {
          if (project.id === projectId) {
            return {
              ...project,
              tasks: [...project.tasks, newTask]
            };
          }
          return project;
        });

        // Set edit mode AFTER updating state
        // Use a slight timeout to ensure UI renders the new task first
        setTimeout(() => {
          setEditingItem({
            id: newTask.id,
            type: 'task',
            name: newTask.name
          });
        }, 0);

        return updated;
      });

      return response.data;
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  };


  const updateTask = async (projectId: string, taskId: string, updates: Partial<Task>) => {
    try {
      // Send PATCH request to backend
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Failed to update task in backend");
      }

      // On success, update in frontend state
      setProjects(prevProjects =>
        prevProjects.map(project =>
          project.id === projectId
            ? {
              ...project,
              tasks: project.tasks.map(task =>
                task.id === taskId ? { ...task, ...updates } : task
              )
            }
            : project
        )
      );
    } catch (error) {
      console.error("Error updating task:", error);
      // Optional: show error to user
    }
  };


  const deleteTask = async (projectId: string, taskId: string) => {
    try {
      await axios.delete(`${API_URL}/projects/${projectId}/tasks/${taskId}`);
      // Update local state
      setProjects(prevProjects =>
        prevProjects.map(project =>
          project.id === projectId
            ? {
              ...project,
              tasks: project.tasks.filter(task => task.id !== taskId)
            }
            : project
        )
      );
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  const addSubtask = async (projectId: string, taskId: string, name: string) => {
    try {
      const response = await axios.post(`${API_URL}/projects/${projectId}/tasks/${taskId}/subtasks`, { name });
      
      // Update local state to set parent task's expanded to true
      setProjects(prevProjects => {
        return prevProjects.map(project => {
          if (project.id === projectId) {
            return {
              ...project,
              tasks: project.tasks.map(task => {
                if (task.id === taskId) {
                  return {
                    ...task,
                    expanded: true,  // Ensure parent task is expanded
                    subtasks: [...task.subtasks, { ...response.data, expanded: false }]
                  };
                }
                return task;
              })
            };
          }
          return project;
        });
      });

      // Set editing state for the new subtask
      setEditingItem({
        id: response.data.id,
        type: 'subtask',
        name: name
      });

      return response.data;
    } catch (error) {
      console.error("Error adding subtask:", error);
      throw error;
    }
  };


  const updateSubtask = async (
    projectId: string,
    taskId: string,
    subtaskId: string,
    updates: Partial<Subtask>
  ) => {
    try {
      // Send PATCH request to backend
      const response = await fetch(
        `http://localhost:5000/api/projects/${projectId}/tasks/${taskId}/subtasks/${subtaskId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update subtask in backend');
      }

      // On success, update frontend state
      setProjects(prevProjects =>
        prevProjects.map(project =>
          project.id === projectId
            ? {
              ...project,
              tasks: project.tasks.map(task =>
                task.id === taskId
                  ? {
                    ...task,
                    subtasks: task.subtasks.map(subtask =>
                      subtask.id === subtaskId
                        ? { ...subtask, ...updates }
                        : subtask
                    )
                  }
                  : task
              )
            }
            : project
        )
      );
    } catch (error) {
      console.error('Error updating subtask:', error);
      // Optional: show error to user
    }
  };



  const deleteSubtask = async (projectId: string, taskId: string, subtaskId: string) => {
    try {
      // Make API call to delete subtask from backend
      await axios.delete(`${API_URL}/projects/${projectId}/tasks/${taskId}/subtasks/${subtaskId}`);

      // Update local state
      setProjects(prevProjects =>
        prevProjects.map(project =>
          project.id === projectId
            ? {
              ...project,
              tasks: project.tasks.map(task =>
                task.id === taskId
                  ? {
                    ...task,
                    subtasks: task.subtasks.filter(subtask => subtask.id !== subtaskId)
                  }
                  : task
              )
            }
            : project
        )
      );
    } catch (error) {
      console.error('Error deleting subtask:', error);
      throw error;
    }
  };

  const addActionItem = async (projectId: string, taskId: string, subtaskId: string, name: string) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/projects/${projectId}/tasks/${taskId}/subtasks/${subtaskId}/actionItems`,
        { name }
      );

      // Update local state
      setProjects(prevProjects => 
        prevProjects.map(project => {
          if (project.id === projectId) {
            return {
              ...project,
              tasks: project.tasks.map(task => {
                if (task.id === taskId) {
                  return {
                    ...task,
                    subtasks: task.subtasks.map(subtask => {
                      if (subtask.id === subtaskId) {
                        return {
                          ...subtask,
                          expanded: true,  // Ensure parent subtask is expanded
                          actionItems: [
                            ...subtask.actionItems,
                            {
                              id: response.data.id,
                              name,
                              assignee: null,
                              dueDate: null,
                              priority: "normal" as Priority,
                              status: "todo" as Status,
                              comments: "",
                              estimatedTime: null,
                              timeSpent: 0
                            }
                          ]
                        };
                      }
                      return subtask;
                    })
                  };
                }
                return task;
              })
            };
          }
          return project;
        })
      );

      // Set editing state for the new action item
      setEditingItem({
        id: response.data.id,
        type: 'actionItem',
        name: name
      });
    } catch (error) {
      console.error('Error adding action item:', error);
      throw error;
    }
  };

  const updateActionItem = async (
    projectId: string,
    taskId: string,
    subtaskId: string,
    actionItemId: string,
    updates: Partial<ActionItem>
  ) => {
    try {
      // Send PATCH request to backend
      const response = await fetch(
        `http://localhost:5000/api/projects/${projectId}/tasks/${taskId}/subtasks/${subtaskId}/actionItems/${actionItemId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update action item in backend');
      }

      // On success, update frontend state
      setProjects(prevProjects =>
        prevProjects.map(project =>
          project.id === projectId
            ? {
              ...project,
              tasks: project.tasks.map(task =>
                task.id === taskId
                  ? {
                    ...task,
                    subtasks: task.subtasks.map(subtask =>
                      subtask.id === subtaskId
                        ? {
                          ...subtask,
                          actionItems: subtask.actionItems.map(actionItem =>
                            actionItem.id === actionItemId
                              ? { ...actionItem, ...updates }
                              : actionItem
                          )
                        }
                        : subtask
                    )
                  }
                  : task
              )
            }
            : project
        )
      );
    } catch (error) {
      console.error('Error updating action item:', error);
      // Optional: show error to user
    }
  };


  const deleteActionItem = async (projectId: string, taskId: string, subtaskId: string, actionItemId: string) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/projects/${projectId}/tasks/${taskId}/subtasks/${subtaskId}/actionItems/${actionItemId}`
      );

      // Update local state
      setProjects(projects.map(project => {
        if (project.id === projectId) {
          return {
            ...project,
            tasks: project.tasks.map(task => {
              if (task.id === taskId) {
                return {
                  ...task,
                  subtasks: task.subtasks.map(subtask => {
                    if (subtask.id === subtaskId) {
                      return {
                        ...subtask,
                        actionItems: subtask.actionItems.filter(ai => ai.id !== actionItemId)
                      };
                    }
                    return subtask;
                  })
                };
              }
              return task;
            })
          };
        }
        return project;
      }));
    } catch (error) {
      console.error('Error deleting action item:', error);
      throw error;
    }
  };

  const toggleExpanded = (
    projectId: string,
    taskId: string,
    type: "task" | "subtask",
    subtaskId?: string
  ) => {
    setProjects(projects.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          tasks: project.tasks.map(task => {
            if (task.id === taskId) {
              if (type === "task") {
                // if (task.subtasks.length === 0) {
                //   return { ...task, expanded: true };
                // }
                return { ...task, expanded: !task.expanded };
              } else if (type === "subtask" && subtaskId) {
                return {
                  ...task,
                  subtasks: task.subtasks.map(subtask => {
                    if (subtask.id === subtaskId) {
                      return { ...subtask, expanded: !subtask.expanded };
                    }
                    return subtask;
                  })
                };
              }
            }
            return task;
          })
        };
      }
      return project;
    }));
  };

  const startTimer = (projectId: string, actionItemId: string) => {
    setTimer({
      projectId,
      actionItemId,
      startTime: new Date(),
      isRunning: true
    });
  };

  const stopTimer = () => {
    setTimer({
      projectId: null,
      actionItemId: null,
      startTime: null,
      isRunning: false
    });
  };

  const getUserById = (id: string | null) => {
    return users.find(user => user.id === id);
  };

  // Context provider wrapper
  return (
    <TaskContext.Provider
      value={{
        projects,
        users,
        timer,
        selectedProject,
        newTaskId,
        setNewTaskId,
        addProject,
        updateProject,
        deleteProject,
        renameProject,
        duplicateProject,
        selectProject,
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
        startTimer,
        stopTimer,
        getUserById,
        editingItem,
        setEditingItem
      }}
    >
      {children}
    </TaskContext.Provider>
  );

};

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTaskContext must be used within a TaskProvider");
  }
  return context;
}

interface TaskProviderProps {
  children: React.ReactNode;
}

export default TaskProvider;
