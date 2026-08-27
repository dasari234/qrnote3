'use client';

import { useState } from 'react';

import ChatComposer from './chat-composer';
import ChatHeader from './chat-header';
import ChatMessageList from './chat-message-list';
import ChatSidebar from './chat-sidebar';

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
  const [conversations, setConversations] = useState(initialConversations);

  const [conversationId, setConversationId] = useState(
    initialConversationId ?? null
  );

  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {sidebarOpen && (
        <ChatSidebar
          conversations={conversations}
          selectedId={conversationId}
          onSelect={setConversationId}
          onCreate={(conversation) => {
            setConversations((current) => [conversation, ...current]);

            setConversationId(conversation.id);
          }}
          onDelete={(id) => {
            setConversations((current) =>
              current.filter((item) => item.id !== id)
            );

            if (conversationId === id) {
              setConversationId(null);
            }
          }}
        />
      )}

      <section className="flex min-w-0 flex-1 flex-col">
        <ChatHeader onToggleSidebar={() => setSidebarOpen((value) => !value)} />

        <ChatMessageList conversationId={conversationId} />

        <ChatComposer
          conversationId={conversationId}
          onConversationCreated={(conversation: any) => {
            setConversations((current) => {
              const exists = current.some(
                (item) => item.id === conversation.id
              );

              if (exists) {
                return current;
              }

              return [conversation, ...current];
            });

            setConversationId(conversation.id);
          }}
        />
      </section>
    </div>
  );
}
