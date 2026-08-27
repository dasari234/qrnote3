'use client';

import { useEffect, useRef, useState } from 'react';

import { Bot, Menu, Plus, Send, Sparkles, User, X } from 'lucide-react';

import { AI_MODELS, DEFAULT_MODEL, getAIModel } from '@/lib/ai/models';
import { AIModelDefinition } from '@/lib/ai/types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface AIModel {
  id: string;
  provider: string;
  name: string;
  description: string;
}

export default function ChatApp() {
  const [messages, setMessages] = useState<Message[]>([]);

  const [input, setInput] = useState('');

const [selectedModel, setSelectedModel] = useState<AIModelDefinition>(
  getAIModel(DEFAULT_MODEL) || AI_MODELS[0]
);

  const [loading, setLoading] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages, loading]);

  function createNewChat() {
    setMessages([]);
    setInput('');

    textareaRef.current?.focus();
  }

  async function sendMessage() {
    const value = input.trim();

    if (!value || loading) {
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: value,
    };

    const assistantId = crypto.randomUUID();

    setMessages((current) => [
      ...current,
      userMessage,
      {
        id: assistantId,
        role: 'assistant',
        content: '',
      },
    ]);

    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          provider: selectedModel.provider,
          model: selectedModel.id,

          messages: [...messages, userMessage].map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();

        throw new Error(error?.error || 'Failed to send message');
      }

      if (!response.body) {
        throw new Error('No response stream received');
      }

      const reader = response.body.getReader();

      const decoder = new TextDecoder();

      let assistantText = '';

      while (true) {
        const { value, done } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value, {
          stream: true,
        });

        assistantText += chunk;

        setMessages((current) =>
          current.map((message) =>
            message.id === assistantId
              ? {
                  ...message,
                  content: assistantText,
                }
              : message
          )
        );
      }
    } catch (error) {
      console.error(error);

      setMessages((current) =>
        current.map((message) =>
          message.id === assistantId
            ? {
                ...message,
                content:
                  error instanceof Error
                    ? `Error: ${error.message}`
                    : 'Something went wrong.',
              }
            : message
        )
      );
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();

      sendMessage();
    }
  }

  return (
    <div className="flex h-screen bg-white text-gray-900">
      {/* Sidebar */}

      <aside
        className={`
          fixed inset-y-0 left-0 z-40
          flex w-[280px] flex-col
          border-r border-gray-200
          bg-[#f7f7f8]
          transition-transform duration-200
          md:relative md:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Sidebar Header */}

        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white">
              <Sparkles size={17} />
            </div>

            <span className="font-semibold">AI Assistant</span>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 hover:bg-gray-200 md:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* New Chat */}

        <div className="px-3">
          <button
            onClick={createNewChat}
            className="
              flex w-full items-center gap-3
              rounded-lg border border-gray-300
              bg-white px-3 py-2.5
              text-sm font-medium
              hover:bg-gray-50
            "
          >
            <Plus size={18} />
            New chat
          </button>
        </div>

        {/* History */}

        <div className="mt-5 flex-1 overflow-y-auto px-3">
          <p className="px-2 text-xs font-medium text-gray-500">Recent</p>

          {messages.length > 0 && (
            <button className="mt-2 w-full truncate rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-200">
              {messages[0]?.content}
            </button>
          )}
        </div>

        {/* Sidebar Footer */}

        <div className="border-t border-gray-200 p-3">
          <div className="rounded-lg p-2 text-sm">
            <div className="font-medium">AI Playground</div>

            <div className="text-xs text-gray-500">Multi-provider chat</div>
          </div>
        </div>
      </aside>

      {/* Main */}

      <main className="flex min-w-0 flex-1 flex-col">
        {/* Header */}

        <header className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 hover:bg-gray-100 md:hidden"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="font-semibold">{selectedModel.name}</h1>
              <p className="text-xs text-gray-500">
                {selectedModel.description}
              </p>
            </div>
          </div>

          {/* Model selector */}
          <select
            value={selectedModel.id}
            onChange={(event) => {
              const model = AI_MODELS.find(
                (item) => item.id === event.target.value
              );
              if (model) {
                setSelectedModel(model as AIModelDefinition);
              }
            }}
            className="
              rounded-lg border border-gray-300
              bg-white px-3 py-2
              text-sm outline-none
              focus:ring-2 focus:ring-gray-200
            "
          >
            {AI_MODELS.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name} — {model.description}
              </option>
            ))}
          </select>
        </header>

        {/* Messages */}

        <section className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl px-4 py-8">
            {messages.length === 0 ? (
              <Welcome />
            ) : (
              <div className="space-y-8">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}

                {loading && messages[messages.length - 1]?.role === 'user' && (
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-white">
                      <Bot size={16} />
                    </div>

                    <div className="pt-1">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:120ms]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:240ms]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </section>

        {/* Composer */}

        <div className="border-t border-gray-200 bg-white">
          <div className="mx-auto max-w-4xl px-4 py-4">
            <div
              className="
                relative flex items-end
                rounded-2xl border border-gray-300
                bg-white p-2
                shadow-sm
                focus-within:border-gray-400
                focus-within:shadow-md
              "
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message AI..."
                rows={1}
                disabled={loading}
                className="
                  max-h-40 min-h-[44px]
                  flex-1 resize-none
                  bg-transparent
                  px-3 py-2.5
                  text-sm
                  outline-none
                  placeholder:text-gray-400
                "
              />

              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="
                  flex h-10 w-10
                  items-center justify-center
                  rounded-xl
                  bg-black text-white
                  transition
                  hover:bg-gray-800
                  disabled:cursor-not-allowed
                  disabled:bg-gray-200
                  disabled:text-gray-400
                "
              >
                <Send size={17} />
              </button>
            </div>

            <p className="mt-2 text-center text-xs text-gray-400">
              AI can make mistakes. Check important information.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function Welcome() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white">
        <Sparkles size={26} />
      </div>

      <h2 className="text-3xl font-semibold tracking-tight">
        How can I help you?
      </h2>

      <p className="mt-2 max-w-lg text-sm text-gray-500">
        Ask anything. Switch between OpenAI, Anthropic and Google models from
        the selector above.
      </p>

      <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
        {[
          'Explain a complex technical concept',
          'Build a React component',
          'Analyze my architecture',
          'Help me debug my code',
        ].map((item) => (
          <div
            key={item}
            className="
              rounded-xl border border-gray-200
              p-4 text-left text-sm
              hover:bg-gray-50
            "
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <div className="flex gap-4">
      <div
        className={`
          flex h-8 w-8 shrink-0
          items-center justify-center
          rounded-full
          ${isUser ? 'bg-gray-200 text-gray-700' : 'bg-black text-white'}
        `}
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      <div className="min-w-0 flex-1 pt-1">
        <div className="mb-1 text-sm font-semibold">
          {isUser ? 'You' : 'AI'}
        </div>

        <div className="whitespace-pre-wrap break-words text-sm leading-7 text-gray-800">
          {message.content}
        </div>
      </div>
    </div>
  );
}
