'use client';

import { Paperclip, Send } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

import { useChatApp } from '@/context/ai-chat-context';
import { useChat } from '@ai-sdk/react';

interface ChatComposerProps {
  conversationId: string | null;
}

export default function ChatComposer({ conversationId }: ChatComposerProps) {
  const { modelId } = useChatApp();

  const [input, setInput] = useState('');

  const { sendMessage, status } = useChat();

  const isLoading = status === 'submitted' || status === 'streaming';

  async function submit(event: React.FormEvent) {
    event.preventDefault();

    const text = input.trim();

    if (!text || isLoading) {
      return;
    }

    setInput('');

    await sendMessage(
      {
        text,
      },
      {
        body: {
          modelId,
          conversationId,
        },
      }
    );
  }

  return (
    <div className="border-t bg-background">
      <form onSubmit={submit} className="mx-auto w-full max-w-4xl p-4">
        <div className="relative rounded-2xl border bg-background shadow-sm">
          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();

                if (!isLoading) {
                  event.currentTarget.form?.requestSubmit();
                }
              }
            }}
            placeholder="Message AI..."
            disabled={isLoading}
            className="min-h-[70px] resize-none border-0 pr-24 focus-visible:ring-0"
          />

          <div className="absolute bottom-3 left-3">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              disabled
              title="File upload coming in Sprint 7"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </div>

          <div className="absolute bottom-3 right-3">
            <Button
              type="submit"
              size="icon"
              disabled={
                isLoading || !input.trim() || !modelId || !conversationId
              }
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <p className="mt-2 text-center text-xs text-muted-foreground">
          Enter to send · Shift + Enter for a new line
        </p>
      </form>
    </div>
  );
}
