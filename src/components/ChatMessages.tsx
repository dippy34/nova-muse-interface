import { useEffect, useRef } from "react";
import { SkullLogo } from "./SkullLogo";
import { cn } from "@/lib/utils";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
}

interface ChatMessagesProps {
  messages: Message[];
  isLoading?: boolean;
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "flex gap-3 max-w-3xl mx-auto",
            message.role === "user" ? "flex-row-reverse" : "flex-row"
          )}
        >
          {/* Avatar */}
          <div
            className={cn(
              "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
              message.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-accent border border-primary/50"
            )}
          >
            {message.role === "user" ? (
              <span className="text-sm font-bold">U</span>
            ) : (
              <SkullLogo size="sm" className="w-5 h-5" />
            )}
          </div>

          {/* Message bubble */}
          <div
            className={cn(
              "flex-1 p-4 rounded-lg",
              message.role === "user"
                ? "bg-primary/10 border border-primary/30"
                : "bg-card border border-border/50"
            )}
          >
            {message.content && (
              <p className="text-sm whitespace-pre-wrap text-foreground">
                {message.content}
              </p>
            )}
            {message.imageUrl && (
              <img 
                src={message.imageUrl} 
                alt="Generated image" 
                className="mt-2 rounded-lg max-w-full h-auto border border-border/30"
              />
            )}
          </div>
        </div>
      ))}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex gap-3 max-w-3xl mx-auto">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-accent border border-primary/50">
            <SkullLogo size="sm" className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1 p-4 rounded-lg bg-card border border-border/50">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
