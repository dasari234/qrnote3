'use client';

import { Paperclip, Send } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

import { useChatApp } from '@/context/ai-chat-context';
import { useChat } from '@ai-sdk/react';

interface ChatComposerProps {
  conversationId: string | null;
  onConversationCreated?: (conversation: any) => void;
}

export default function ChatComposer({
  conversationId,
  onConversationCreated,
}: ChatComposerProps) {
  const { modelId } = useChatApp();

  const [input, setInput] = useState('');

  const { sendMessage, status } = useChat();

  const isLoading = status === 'submitted' || status === 'streaming';

  async function submit(event: React.FormEvent) {
    event.preventDefault();

    const text = input.trim();

      if (!text || isLoading || !modelId) {
      return;
    }

    // This stops subsequent Enter keystrokes from reading the same text value
    setInput('');

    try {
      let activeConversationId = conversationId;

      // First prompt in a new chat: create the conversation only now.
      if (!activeConversationId) {
        const response = await fetch('/api/conversations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to create conversation');
        }

        const data = await response.json();
        activeConversationId = data.conversation.id;

        // Tell ChatShell about the newly-created chat.
        onConversationCreated?.(data.conversation);
      }

      await sendMessage(
        {
          text,
        },
        {
          body: {
            modelId,
            conversationId: activeConversationId,
          },
        }
      );
    } catch (error) {
      console.error('Failed to submit message:', error);

      // Restore prompt text only if the entire submission routine fails.
      setInput(text);
    }
  }

  return (
    <div className="border-t bg-background">
      <form onSubmit={submit} className="mx-auto w-full max-w-4xl p-4">
        <div className="flex flex-col rounded-2xl border bg-background shadow-sm focus-within:ring-1 focus-within:ring-ring">
          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();

                if (isLoading || !input.trim()) {
                  return;
                }

                event.currentTarget.form?.requestSubmit();
              }
            }}
            placeholder="Message AI..."
            disabled={isLoading}
            className="min-h-[70px] resize-none border-0 focus-visible:ring-0 shadow-none"
          />

          <div className="flex items-center justify-between p-3 pt-0">
            <div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                disabled
                title="File upload coming in Sprint 7"
                className="h-8 w-8"
              >
                <Paperclip className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>

            <div>
              <Button
                type="submit"
                size="icon"
                className="h-8 w-8"
                disabled={isLoading || !input.trim() || !modelId}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <p className="mt-2 text-center text-xs text-muted-foreground">
          Enter to send · Shift + Enter for a new line
        </p>
      </form>
    </div>
  );
}
