"use client";

import type { UIMessage } from "ai";
import ReactMarkdown from "react-markdown";

import {
    Avatar,
    AvatarFallback,
} from "@/components/ui/avatar";

interface ChatMessageProps {
  message: UIMessage;
}

export default function ChatMessage({
  message,
}: ChatMessageProps) {
  const isUser =
    message.role === "user";

  return (
    <div
      className={`flex gap-4 ${
        isUser
          ? "justify-end"
          : "justify-start"
      }`}
    >
      {!isUser && (
        <Avatar className="h-8 w-8 shrink-0 border">
          <AvatarFallback>AI</AvatarFallback>
        </Avatar>
      )}

      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-7 ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        }`}
      >
        {message.parts.map(
          (part, index) => {
            if (part.type !== "text") {
              return null;
            }

            return (
              <ReactMarkdown
                key={`${message.id}-${index}`}
                components={{
                  code({
                    children,
                    className,
                  }) {
                    return (
                      <code
                        className={`${className ?? ""} rounded bg-background/50 px-1 py-0.5`}
                      >
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {part.text}
              </ReactMarkdown>
            );
          },
        )}
      </div>

      {isUser && (
        <Avatar className="h-8 w-8 shrink-0 border">
          <AvatarFallback>ME</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
