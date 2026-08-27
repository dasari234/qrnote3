"use client";

import {
    Avatar,
    AvatarFallback,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatApp } from "@/context/ai-chat-context";

import { useChat } from "@ai-sdk/react";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

export default function ChatScreen() {
  const { modelId } = useChatApp();

  const [input, setInput] = useState("");

  /**
   * AI SDK chat client.
   *
   * The API endpoint defaults to /api/chat.
   */
  const {
    messages,
    sendMessage,
    status,
    error,
  } = useChat();

  const isLoading =
    status === "submitted" ||
    status === "streaming";

  const scrollRef = useRef<HTMLDivElement>(null);

  /**
   * Automatically scroll to the latest message.
   */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [messages]);

  /**
   * Submit a chat message.
   */
  const handleFormSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const messageText = input.trim();

    if (!messageText || isLoading) {
      return;
    }

    setInput("");

    try {
      await sendMessage(
        {
          text: messageText,
        },
        {
          body: {
            modelId,
          },
        },
      );
    } catch (err) {
      console.error(
        "Failed to send chat message:",
        err,
      );
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <ScrollArea className="flex-1">
        <div className="mx-auto w-full max-w-4xl px-4 py-6">
          {messages.length === 0 ? (
            <div className="flex h-[55vh] flex-col items-center justify-center gap-3 text-muted-foreground">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border bg-muted">
                <span className="text-lg font-semibold">
                  AI
                </span>
              </div>

              <h2 className="text-xl font-semibold text-foreground">
                Welcome to AgentOS
              </h2>

              <p className="max-w-md text-center text-sm">
                Ask anything and start a conversation
                with your selected AI model.
              </p>

              <p className="text-xs text-muted-foreground">
                Model: {modelId}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => {
                const isUser =
                  message.role === "user";

                return (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${
                      isUser
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    {!isUser && (
                      <Avatar className="h-8 w-8 shrink-0 border bg-accent">
                        <AvatarFallback>
                          AI
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        isUser
                          ? "bg-primary text-primary-foreground"
                          : "border bg-muted"
                      }`}
                    >
                      <div className="prose prose-sm max-w-none break-words dark:prose-invert">
                        {message.parts.map(
                          (part, index) => {
                            if (
                              part.type ===
                              "text"
                            ) {
                              return (
                                <ReactMarkdown
                                  key={`${message.id}-${index}`}
                                >
                                  {part.text}
                                </ReactMarkdown>
                              );
                            }

                            return null;
                          },
                        )}
                      </div>
                    </div>

                    {isUser && (
                      <Avatar className="h-8 w-8 shrink-0 border bg-primary">
                        <AvatarFallback>
                          ME
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {isLoading && (
            <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
              <Avatar className="h-8 w-8 border bg-accent">
                <AvatarFallback>
                  AI
                </AvatarFallback>
              </Avatar>

              <div className="flex items-center gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:120ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:240ms]" />
              </div>

              <span>
                {status === "submitted"
                  ? "Connecting..."
                  : "Generating response..."}
              </span>
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error.message ||
                "Unable to generate a response."}
            </div>
          )}

          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="border-t bg-background">
        <form
          onSubmit={handleFormSubmit}
          className="mx-auto flex w-full max-w-4xl gap-2 px-4 py-4"
        >
          <Input
            value={input}
            onChange={(event) =>
              setInput(event.target.value)
            }
            placeholder="Message AgentOS..."
            className="h-12 flex-1 rounded-xl px-4"
            disabled={isLoading}
            autoComplete="off"
          />

          <Button
            type="submit"
            size="lg"
            className="h-12 rounded-xl px-6"
            disabled={
              isLoading || !input.trim()
            }
          >
            {isLoading ? "..." : "Send"}
          </Button>
        </form>

        <div className="mx-auto max-w-4xl px-4 pb-3 text-center text-xs text-muted-foreground">
          AI can make mistakes. Check important
          information.
        </div>
      </div>
    </div>
  );
}
