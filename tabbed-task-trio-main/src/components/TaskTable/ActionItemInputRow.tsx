import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useTaskContext } from "@/context/TaskContext";

interface ActionItemInputRowProps {
    taskId: string;
    subtaskId: string;
    selectedProjectId: string;
    onAdd: () => void;
    onCancel?: () => void;
    autoFocus?: boolean;
}

export function ActionItemInputRow({
    taskId,
    subtaskId,
    selectedProjectId,
    onAdd,
    onCancel,
    autoFocus = true
}: ActionItemInputRowProps) {
    const [actionItemName, setActionItemName] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const { addActionItem } = useTaskContext();

    const handleAdd = async () => {
        if (!actionItemName.trim()) {
            onCancel?.();
            return;
        }

        await addActionItem(selectedProjectId, taskId, subtaskId, actionItemName.trim());
        setActionItemName("");
        onAdd();
    };

    useEffect(() => {
        if (autoFocus) {
            inputRef.current?.focus();
        }
    }, [autoFocus]);

    return (
        <tr>
            <td className="py-1">
                <div className="flex items-center w-full pl-16">
                   {/* This matches the pl-16 in ActionItemRow */}
                    <div className="min-w-0 flex-1">
                        <div className="max-w-2xl">
                            <Input
                                ref={inputRef}
                                value={actionItemName}
                                onChange={(e) => setActionItemName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleAdd();
                                    if (e.key === "Escape") {
                                        setActionItemName("");
                                        onCancel?.();
                                    }
                                }}
                                onBlur={() => {
                                    if (actionItemName.trim()) {
                                        handleAdd();
                                    } else {
                                        onCancel?.();
                                    }
                                }}
                                placeholder="Add an action item"
                                className="w-full border-0 shadow-none focus-visible:ring-0 pl-2 py-2 text-sm h-8"
                            />
                        </div>
                    </div>
                </div>
            </td>
            <td colSpan={7}></td>
        </tr>
    );
}