"use client";

import { useEffect, useRef } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from "@ai-sdk/react";

import ChatMessage from "./chat-message";

interface ChatComposerProps {
  conversationId: string | null;
  initialMessages?: any[];
}

export default function ChatMessageList({ conversationId, initialMessages }: ChatComposerProps) {
  const { messages, status } = useChat();

  const bottomRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const isLoading =
    status === "submitted" ||
    status === "streaming";

  return (
    <ScrollArea className="flex-1">
      <div className="mx-auto w-full max-w-4xl px-4 py-8">
        {messages.length === 0 ? (
          <div className="flex min-h-[60vh] flex-col items-center justify-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border bg-muted">
              <span className="font-bold">AI</span>
            </div>

            <h2 className="text-2xl font-semibold">
              How can I help you?
            </h2>

            <p className="mt-2 text-center text-sm text-muted-foreground">
              Ask a question, write code, analyze
              something, or explore an idea.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
              />
            ))}
          </div>
        )}

        {isLoading && (
          <div className="mt-6 text-sm text-muted-foreground">
            Generating response...
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
