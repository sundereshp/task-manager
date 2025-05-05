import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Play, MoreVertical, Trash, Pencil, Copy } from "lucide-react";
import { useTaskContext } from "../context/TaskContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ProjectSidebarProps {
  isCollapsed?: boolean;
}

export function ProjectSidebar({ isCollapsed = false }: ProjectSidebarProps) {
  const { 
    projects, 
    selectedProject, 
    addProject, 
    selectProject, 
    startTimer,
    timer,
    deleteProject,
    renameProject,
    duplicateProject
  } = useTaskContext();
  
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [isTimerDialogOpen, setIsTimerDialogOpen] = useState(false);
  const [selectedProjectForTimer, setSelectedProjectForTimer] = useState<string | null>(null);
  const [selectedActionItem, setSelectedActionItem] = useState<string | null>(null);
  
  const [renamingProject, setRenamingProject] = useState<{id: string, name: string} | null>(null);
  
  // Function to flatten project structure and get all action items
  const getAllActionItems = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return [];
    
    const actionItems: { id: string; name: string; path: string }[] = [];
    
    project.tasks.forEach(task => {
      task.subtasks.forEach(subtask => {
        subtask.actionItems.forEach(actionItem => {
          actionItems.push({
            id: actionItem.id,
            name: actionItem.name,
            path: `${task.name} > ${subtask.name} > ${actionItem.name}`
          });
        });
      });
    });
    
    return actionItems;
  };

  const handleAddProject = () => {
    if (newProjectName.trim()) {
      addProject(newProjectName.trim())
        .then(() => {
          setNewProjectName("");
          setIsAddingProject(false);
          toast.success("Project added");
        })
        .catch(error => {
          console.error("Error adding project:", error);
          toast.error("Failed to add project");
        });
    }
  };

  const handleStartTimer = () => {
    if (selectedProjectForTimer && selectedActionItem) {
      startTimer(selectedProjectForTimer, selectedActionItem);
      setIsTimerDialogOpen(false);
      toast.success("Timer started");
    }
  };

  const openTimerDialog = (projectId: string) => {
    setSelectedProjectForTimer(projectId);
    setSelectedActionItem(null);
    setIsTimerDialogOpen(true);
  };
  
  const handleRenameProject = async (id: string) => {
    if (renamingProject && renamingProject.name.trim()) {
      try {
        console.log("Attempting to rename project:", {
          currentId: id,
          renamingId: renamingProject.id,
          newName: renamingProject.name
        });
        
        // First, find the project in the list
        const project = projects.find(p => p.id === renamingProject.id);
        if (!project) {
          console.error(`Project not found with ID: ${renamingProject.id}`);
          toast.error(`Project not found with ID: ${renamingProject.id}`);
          setRenamingProject(null);
          return;
        }
        
        await renameProject(renamingProject.id, renamingProject.name);
        setRenamingProject(null);
        toast.success("Project renamed successfully");
      } catch (error: any) {
        console.error("Detailed error in handleRenameProject:", {
          error: error.message,
          response: error.response?.data,
          projectId: renamingProject?.id,
          newName: renamingProject?.name
        });
        
        // Show a more user-friendly error message
        toast.error(error.message || "Failed to rename project");
        setRenamingProject(null);
      }
    }
  };
  
  const handleDeleteProject = (id: string) => {
    deleteProject(id)
      .then(() => {
        toast.success("Project deleted");
      })
      .catch(error => {
        console.error("Error deleting project:", error);
        toast.error("Failed to delete project");
      });
  };
  
  const handleDuplicateProject = (id: string) => {
    duplicateProject(id)
      .then(() => {
        toast.success("Project duplicated");
      })
      .catch(error => {
        console.error("Error duplicating project:", error);
        toast.error("Failed to duplicate project");
      });
  };

  const handleSelectActionItem = (id: string) => {
    setSelectedActionItem(id);
  };

  return (
    <div className="p-4 h-full flex flex-col overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        {!isCollapsed && <h2 className="font-semibold text-sidebar-foreground">Projects</h2>}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => !isCollapsed && setIsAddingProject(true)}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Add Project</TooltipContent>
        </Tooltip>
      </div>
      
      {!isCollapsed && isAddingProject && (
        <div className="flex items-center gap-2 mb-4">
          <Input
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="Project name"
            className="h-8"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddProject();
              if (e.key === "Escape") setIsAddingProject(false);
            }}
          />
          <Button size="sm" onClick={handleAddProject} className="h-8">Add</Button>
        </div>
      )}

      <div className="space-y-1 overflow-y-auto flex-grow">
        {projects.map((project) => (
          <div 
            key={project.id} 
            className={cn(
              "flex items-center justify-between rounded-md px-2 py-1.5",
              selectedProject?.id === project.id 
                ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            )}
          >
            {renamingProject && renamingProject.id === project.id && !isCollapsed ? (
              <Input
                value={renamingProject.name}
                onChange={(e) => setRenamingProject({...renamingProject, name: e.target.value})}
                autoFocus
                className="h-7 py-0 px-1 text-sm"
                onBlur={() => handleRenameProject(project.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRenameProject(project.id);
                  if (e.key === "Escape") setRenamingProject(null);
                }}
              />
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={cn(
                      "text-sm font-medium text-left truncate",
                      isCollapsed ? "w-8 mx-auto flex justify-center" : "flex-1"
                    )}
                    onClick={() => selectProject(project.id)}
                  >
                    {isCollapsed ? project.name.charAt(0).toUpperCase() : project.name}
                  </button>
                </TooltipTrigger>
                {isCollapsed && <TooltipContent side="right">{project.name}</TooltipContent>}
              </Tooltip>
            )}
            
            {!isCollapsed && (
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={cn(
                        "h-6 w-6 p-0 flex-shrink-0",
                        timer.isRunning && timer.projectId === project.id ? "text-green-500 timer-active" : ""
                      )} 
                      onClick={() => openTimerDialog(project.id)}
                    >
                      <Play className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Start Timer</TooltipContent>
                </Tooltip>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 flex-shrink-0">
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem 
                      onClick={() => setRenamingProject({ id: project.id, name: project.name })}
                      className="flex items-center"
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      <span>Rename Project</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDuplicateProject(project.id)}
                      className="flex items-center"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      <span>Duplicate Project</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteProject(project.id)}
                      className="flex items-center text-destructive"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      <span>Delete Project</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Timer Dialog */}
      <Dialog open={isTimerDialogOpen} onOpenChange={setIsTimerDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Action Item to Start Timer</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <RadioGroup value={selectedActionItem || ""} onValueChange={handleSelectActionItem}>
              {selectedProjectForTimer && getAllActionItems(selectedProjectForTimer).map((item) => (
                <div key={item.id} className="flex items-center space-x-2 border rounded-md p-2 mb-2">
                  <RadioGroupItem value={item.id} id={item.id} />
                  <Label htmlFor={item.id} className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.path}</div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
            
            {selectedProjectForTimer && getAllActionItems(selectedProjectForTimer).length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                No action items available in this project.
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsTimerDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              onClick={handleStartTimer} 
              disabled={!selectedActionItem}
            >
              Start Timer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}