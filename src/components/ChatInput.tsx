import { useState, useRef, KeyboardEvent } from "react";
import { Send, Paperclip, Image } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSend(message.trim());
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    // Auto-resize
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  return (
    <div className="border-t border-border/30 bg-background/50 backdrop-blur-sm p-4">
      <div className="max-w-4xl mx-auto flex items-end gap-2">
        {/* Input area */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... or /image [prompt] to generate images"
            rows={1}
            disabled={isLoading}
            className={cn(
              "w-full px-4 py-3 bg-card border border-border/50 rounded-lg",
              "text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:border-primary focus:box-glow",
              "resize-none transition-all duration-300",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            className="p-3 rounded-lg border border-border/50 hover:border-primary hover:bg-accent transition-all duration-300 group"
            title="Attach file"
          >
            <Paperclip className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
          </button>
          <button
            className="p-3 rounded-lg border border-border/50 hover:border-primary hover:bg-accent transition-all duration-300 group"
            title="Generate image"
          >
            <Image className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
          </button>
          <button
            onClick={handleSend}
            disabled={!message.trim() || isLoading}
            className={cn(
              "p-3 rounded-lg transition-all duration-300",
              message.trim() && !isLoading
                ? "bg-primary text-primary-foreground hover:box-glow"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
            title="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
