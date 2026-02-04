import { useState, useRef, KeyboardEvent } from "react";
import { Send, Paperclip, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string, images?: string[]) => void;
  isLoading?: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if ((message.trim() || attachedImages.length > 0) && !isLoading) {
      onSend(message.trim(), attachedImages.length > 0 ? attachedImages : undefined);
      setMessage("");
      setAttachedImages([]);
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          setAttachedImages((prev) => [...prev, base64]);
        };
        reader.readAsDataURL(file);
      }
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setAttachedImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="border-t border-border/30 bg-background/50 backdrop-blur-sm p-4">
      <div className="max-w-4xl mx-auto">
        {/* Attached images preview */}
        {attachedImages.length > 0 && (
          <div className="flex gap-2 mb-3 flex-wrap">
            {attachedImages.map((img, index) => (
              <div key={index} className="relative group">
                <img
                  src={img}
                  alt={`Attached ${index + 1}`}
                  className="w-16 h-16 object-cover rounded-lg border border-border/50"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          {/* Input area */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
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
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-lg border border-border/50 hover:border-primary hover:bg-accent transition-all duration-300 group"
              title="Attach image"
              disabled={isLoading}
            >
              <Paperclip className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
            </button>
            <button
              onClick={handleSend}
              disabled={(!message.trim() && attachedImages.length === 0) || isLoading}
              className={cn(
                "p-3 rounded-lg transition-all duration-300",
                (message.trim() || attachedImages.length > 0) && !isLoading
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
    </div>
  );
}
