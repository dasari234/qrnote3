"use client";

import { useState } from "react";

import ChatHeader from "./chat-header";
import ChatSidebar from "./chat-sidebar";
import ChatWorkspace from "./chat-workspace";

export interface ChatConversation {
  id: string;
  title: string;
  modelId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ChatShellProps {
  initialConversations: ChatConversation[];
  initialConversationId?: string;
}

export default function ChatShell({
  initialConversations,
  initialConversationId,
}: ChatShellProps) {
  const [
    conversations,
    setConversations,
  ] = useState(
    initialConversations,
  );

  const [
    conversationId,
    setConversationId,
  ] = useState<string | null>(
    initialConversationId ?? null,
  );

  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(true);

  function handleConversationCreated(
    conversation: ChatConversation,
  ) {
    setConversations(
      (current) => {
        const exists =
          current.some(
            (item) =>
              item.id ===
              conversation.id,
          );

        if (exists) {
          return current;
        }

        return [
          conversation,
          ...current,
        ];
      },
    );

    setConversationId(
      conversation.id,
    );
  }

  function handleConversationDelete(
    id: string,
  ) {
    setConversations(
      (current) =>
        current.filter(
          (item) =>
            item.id !== id,
        ),
    );

    if (conversationId === id) {
      setConversationId(null);
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {sidebarOpen && (
        <ChatSidebar
          conversations={
            conversations
          }
          selectedId={
            conversationId
          }
          onSelect={
            setConversationId
          }
          onCreate={(
            conversation,
          ) => {
            setConversations(
              (current) => {
                const exists =
                  current.some(
                    (item) =>
                      item.id ===
                      conversation.id,
                  );

                if (exists) {
                  return current;
                }

                return [
                  conversation,
                  ...current,
                ];
              },
            );

            setConversationId(
              conversation.id,
            );
          }}
          onDelete={
            handleConversationDelete
          }
        />
      )}

      <section className="flex min-w-0 flex-1 flex-col">
        <ChatHeader
          onToggleSidebar={() =>
            setSidebarOpen(
              (value) => !value,
            )
          }
        />

        <ChatWorkspace
          conversationId={
            conversationId
          }
          onConversationCreated={
            handleConversationCreated
          }
        />
      </section>
    </div>
  );
}
