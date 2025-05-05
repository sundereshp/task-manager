
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare } from "lucide-react";
import { useState } from "react";

interface CommentsCellProps {
  comments: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function CommentsCell({ comments, onChange, disabled = false }: CommentsCellProps) {
  const [value, setValue] = useState(comments);

  const handleSave = () => {
    onChange(value);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          disabled={disabled}
          variant={comments ? "default" : "outline"} 
          size="sm"
          className="w-20 truncate"
        >
          <MessageSquare className="h-3 w-3 mr-1" />
          {comments ? "View" : "Add"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 pointer-events-auto">
        <div className="space-y-4">
          <h4 className="font-medium">Comments</h4>
          <Textarea
            placeholder="Add any notes or comments here..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="min-h-28"
          />
          <div className="flex justify-end">
            <Button onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
