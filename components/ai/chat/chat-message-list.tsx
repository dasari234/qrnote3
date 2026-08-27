"use client";

import type { ChatStatus, UIMessage } from "ai";
import { useEffect, useRef } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";

import ChatMessage from "./chat-message";

interface ChatMessageListProps {
  messages: UIMessage[];
  status: ChatStatus;
  loading?: boolean;
  error?: Error | undefined;
}

export default function ChatMessageList({
  messages,
  status,
  loading = false,
  error,
}: ChatMessageListProps) {
  const bottomRef =
    useRef<HTMLDivElement>(null);

  /*
   * Automatically scroll to the latest
   * user/assistant message.
   */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const isGenerating =
    status === "submitted" ||
    status === "streaming";

  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className="mx-auto w-full max-w-4xl px-4 py-8">
        {loading ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="text-sm text-muted-foreground">
              Loading conversation...
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex min-h-[60vh] flex-col items-center justify-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border bg-muted">
              <span className="font-bold">
                AI
              </span>
            </div>

            <h2 className="text-2xl font-semibold">
              How can I help you?
            </h2>

            <p className="mt-2 max-w-md text-center text-sm text-muted-foreground">
              Ask a question, write code,
              analyze something, or explore
              an idea.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {messages.map(
              (message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                />
              ),
            )}

            {isGenerating && (
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border">
                  <span className="text-xs font-semibold">
                    AI
                  </span>
                </div>

                <div className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
                  Generating response...
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                {error.message ||
                  "Unable to generate a response."}
              </div>
            )}
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
