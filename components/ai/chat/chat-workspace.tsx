"use client";

import { useEffect, useState } from "react";

import type { UIMessage } from "ai";

import ChatComposer from "./chat-composer";
import ChatMessageList from "./chat-message-list";

interface Props {
  conversationId: string | null;
}

export default function ChatWorkspace({
  conversationId,
}: Props) {
  const [messages, setMessages] =
    useState<UIMessage[]>([]);

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!conversationId) {
        setMessages([]);
        return;
      }

      setLoading(true);

      try {
        const response =
          await fetch(
            `/api/conversations/${conversationId}`,
            {
              cache: "no-store",
            },
          );

        if (!response.ok) {
          throw new Error(
            "Unable to load conversation.",
          );
        }

        const data =
          await response.json();

        if (!cancelled) {
          setMessages(
            data.conversation.messages.map(
              (message: any) => ({
                id: message.id,
                role: message.role,
                parts: message.parts,
              }),
            ),
          );
        }
      } catch (error) {
        console.error(
          "Failed to load conversation:",
          error,
        );

        if (!cancelled) {
          setMessages([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  if (!conversationId) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">
            Start a new chat
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Select New chat to begin.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Loading conversation...
      </div>
    );
  }

  return (
    <>
      <ChatMessageList
        initialMessages={messages}
        conversationId={conversationId}
      />

      <ChatComposer
        conversationId={conversationId}
      />
    </>
  );
}
