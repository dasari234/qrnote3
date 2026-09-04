'use client';

import type { ChatStatus, UIMessage } from 'ai';

import { useEffect, useRef } from 'react';

import { ScrollArea } from '@/components/ui/scroll-area';

import ChatMessage from './chat-message';

interface ChatMessageListProps {
  messages: UIMessage[];

  status: ChatStatus;

  loading?: boolean;

  error?: Error;
}

function AssistantShimmer() {
  return (
    <div
      className="flex gap-4"
      aria-label="Generating response"
      aria-live="polite"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-background">
        <span className="text-xs font-semibold">AI</span>
      </div>

      <div className="max-w-[80%] rounded-2xl bg-muted px-4 py-4">
        <div className="animate-pulse space-y-2">
          <div className="h-3 w-72 max-w-full rounded bg-background/70" />

          <div className="h-3 w-56 max-w-full rounded bg-background/70" />

          <div className="h-3 w-64 max-w-full rounded bg-background/70" />
        </div>
      </div>
    </div>
  );
}

function ConversationLoadingShimmer() {
  return (
    <div
      className="space-y-8"
      aria-busy="true"
      aria-label="Loading conversation"
    >
      <div className="flex gap-4">
        <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />

        <div className="w-[70%] max-w-lg space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
        </div>
      </div>

      <div className="flex gap-4">
        <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />

        <div className="w-[65%] max-w-xl space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-11/12 animate-pulse rounded bg-muted" />
          <div className="h-4 w-3/5 animate-pulse rounded bg-muted" />
        </div>
      </div>

      <div className="flex justify-end">
        <div className="w-[45%] space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}

function EmptyChat() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border bg-muted">
        <span className="font-bold">AI</span>
      </div>

      <h2 className="text-2xl font-semibold">How can I help you?</h2>

      <p className="mt-2 max-w-md text-center text-sm text-muted-foreground">
        Ask a question, write code, analyze something, or explore an idea.
      </p>
    </div>
  );
}

export default function ChatMessageList({
  messages,
  status,
  loading = false,
  error,
}: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages]);

  const isGenerating = status === 'submitted' || status === 'streaming';

  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className="mx-auto w-full max-w-4xl px-4 py-8">
        {loading ? (
          <ConversationLoadingShimmer />
        ) : messages.length === 0 ? (
          <EmptyChat />
        ) : (
          <div className="space-y-8">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {isGenerating && <AssistantShimmer />}

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
              >
                {error.message || 'Unable to generate a response.'}
              </div>
            )}
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
