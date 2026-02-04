import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { ParrotLogo } from "./ParrotLogo";
import { cn } from "@/lib/utils";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  images?: string[];
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
              <ParrotLogo size="sm" className="w-5 h-5" />
            )}
          </div>

          {/* Message bubble */}
          <div
            className={cn(
              "flex-1 p-4 rounded-lg overflow-x-auto",
              message.role === "user"
                ? "bg-primary/10 border border-primary/30"
                : "bg-card border border-border/50"
            )}
          >
            <div className="prose prose-sm prose-invert max-w-none text-foreground prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-primary prose-pre:bg-muted prose-pre:text-foreground">
              {message.images && message.images.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-3">
                  {message.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Uploaded ${idx + 1}`}
                      className="max-w-[200px] max-h-[200px] object-contain rounded-lg border border-border/50"
                    />
                  ))}
                </div>
              )}
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      ))}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex gap-3 max-w-3xl mx-auto">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-accent border border-primary/50">
            <ParrotLogo size="sm" className="w-5 h-5 animate-pulse" />
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
