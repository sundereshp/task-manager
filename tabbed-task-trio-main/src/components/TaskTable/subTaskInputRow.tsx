import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useTaskContext } from "@/context/TaskContext";

interface SubtaskInputRowProps {
  taskId: string;
  selectedProjectId: string;
  onAdd: () => void;
  defaultOpen?: boolean;
}

export function SubtaskInputRow({ taskId, selectedProjectId, onAdd }: { 
    taskId: string;
    selectedProjectId: string;
    onAdd: () => void;
  }) {
    const [name, setName] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const { addSubtask } = useTaskContext();
  
    const handleSubmit = async () => {
      if (!name.trim()) return;
      await addSubtask(selectedProjectId, taskId, name.trim());
      setName("");
      onAdd();
    };
  
    useEffect(() => {
      inputRef.current?.focus();
    }, []);
  
    return (
      <tr>
        <td className="name-cell">
          <div className="flex items-center pl-8 w-full">
            <div className="min-w-0 flex-1">
              <Input
                ref={inputRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit();
                  if (e.key === "Escape") onAdd();
                }}
                placeholder="Enter subtask name"
                className="w-full border-0 shadow-none focus-visible:ring-0 pl-2 py-2 text-sm"
              />
            </div>
          </div>
        </td>
        <td colSpan={7}></td>
      </tr>
    );
  }