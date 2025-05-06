import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useTaskContext } from "@/context/TaskContext";

export function TaskInputRow({ selectedProjectId }: { selectedProjectId: string }) {
  const [taskName, setTaskName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { addTask, setEditingItem } = useTaskContext();

  const handleAdd = async () => {
    if (!taskName.trim()) return;

    await addTask(selectedProjectId, taskName.trim());
    setTaskName("");
    setEditingItem(null);
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <tr>
      <td className="name-cell">
        <div className="flex items-center w-full">
          <div className="min-w-0 flex-1 pl-2">
            <div className="border border-input rounded-md bg-background shadow-sm transition-colors focus-within:ring-1 focus-within:ring-ring">
              <Input
                ref={inputRef}
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAdd();
                  if (e.key === "Escape") setTaskName("");
                }}
                placeholder="Enter new task name"
                className="w-full border-0 shadow-none focus-visible:ring-0 pl-4 py-2 text-base"
              />
            </div>
          </div>
        </div>
      </td>
      <td colSpan={7}></td>
    </tr>
  );
}
