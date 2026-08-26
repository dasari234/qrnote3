'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatApp } from '@/context/ai-chat-context';
import { useChat } from '@ai-sdk/react';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';

export default function ChatScreen() {
  const { provider } = useChatApp();

  // 1. Manage the chat text field state locally
  const [input, setInput] = useState('');

  // 2. FIX: Omit the parameters entirely. It automatically defaults to '/api/chat'
  const { messages, sendMessage, status } = useChat();

  // 3. Compute execution tracking state flags safely
  const isLoading = status === 'submitted' || status === 'streaming';

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // 4. Form handling pipeline matching v5.0 body property standards
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const messageText = input;
    setInput(''); // Optimistic UI clear

    // Trigger the transport execution pipeline
    await sendMessage(
      { text: messageText },
      {
        body: { provider }, // Maps criteria directly to your POST req.json() parsing layers
      }
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto px-4">
      <ScrollArea className="flex-1 pr-4 py-6">
        {messages.length === 0 ? (
          <div className="h-[50vh] flex flex-col items-center justify-center text-muted-foreground gap-2">
            <h2 className="text-xl font-medium text-foreground">
              Welcome to AgentOS
            </h2>
            <p className="text-sm text-center max-w-sm">
              Select a provider above and ask a question to begin a contextual
              thread.
            </p>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-4 mb-6 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role !== 'user' && (
                <Avatar className="h-8 w-8 border bg-accent">
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
              )}

              <div
                className={`p-4 rounded-xl max-w-[80%] text-sm prose prose-sm dark:prose-invert break-words leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted border'
                }`}
              >
                {m.parts.map((part, index) => {
                  if (part.type === 'text') {
                    return (
                      <ReactMarkdown key={index}>{part.text}</ReactMarkdown>
                    );
                  }

                  return null;
                })}
              </div>

              {m.role === 'user' && (
                <Avatar className="h-8 w-8 border bg-primary">
                  <AvatarFallback>ME</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex items-center gap-3 text-sm text-muted-foreground animate-pulse p-4">
            <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" />
            <span>
              {status === 'submitted'
                ? 'Connecting to cluster...'
                : 'Agent is composing response...'}
            </span>
          </div>
        )}
        <div ref={scrollRef} />
      </ScrollArea>

      <form
        onSubmit={handleFormSubmit}
        className="py-4 border-t flex items-center gap-2"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Message agent cluster via ${provider.toUpperCase()}...`}
          className="flex-1 py-6 focus-visible:ring-1"
          disabled={isLoading}
        />
        <Button type="submit" size="lg" disabled={isLoading || !input.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}
