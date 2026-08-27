"use client";

import {
  MessageSquare,
  Plus,
  Search,
  Settings,
  Trash2,
  User
} from "lucide-react";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { ChatConversation } from "./chat-shell";

interface Props {
  conversations: ChatConversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreate: (
    conversation: ChatConversation,
  ) => void;
  onDelete: (id: string) => void;
}

export default function ChatSidebar({
  conversations,
  selectedId,
  onSelect,
  onCreate,
  onDelete,
}: Props) {
  const [search, setSearch] =
    useState("");

  const filtered =
    useMemo(() => {
      const value =
        search.trim().toLowerCase();

      if (!value) {
        return conversations;
      }

      return conversations.filter(
        (conversation) =>
          conversation.title
            .toLowerCase()
            .includes(value),
      );
    }, [conversations, search]);

  const today = [];
  const yesterday = [];
  const older = [];

  const now = new Date();

  for (const conversation of filtered) {
    const date = new Date(
      conversation.updatedAt,
    );

    const diff =
      now.getTime() - date.getTime();

    const days =
      diff / (1000 * 60 * 60 * 24);

    if (days < 1) {
      today.push(conversation);
    } else if (days < 2) {
      yesterday.push(conversation);
    } else {
      older.push(conversation);
    }
  }

  async function createChat() {
    const response = await fetch(
      "/api/conversations",
      {
        method: "POST",
      },
    );

    if (!response.ok) {
      return;
    }

    const data =
      await response.json();

    onCreate(data.conversation);
  }

  async function deleteChat(
    id: string,
  ) {
    const response = await fetch(
      `/api/conversations/${id}`,
      {
        method: "DELETE",
      },
    );

    if (response.ok) {
      onDelete(id);
    }
  }

  return (
    <aside className="flex w-[280px] shrink-0 flex-col border-r bg-muted/20">
      <div className="p-3">
        <Button
          onClick={createChat}
          className="w-full justify-start gap-2"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
          New chat
        </Button>
      </div>

      <div className="px-3 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search chats"
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        <ConversationGroup
          title="Today"
          conversations={today}
          selectedId={selectedId}
          onSelect={onSelect}
          onDelete={deleteChat}
        />

        <ConversationGroup
          title="Yesterday"
          conversations={yesterday}
          selectedId={selectedId}
          onSelect={onSelect}
          onDelete={deleteChat}
        />

        <ConversationGroup
          title="Previous"
          conversations={older}
          selectedId={selectedId}
          onSelect={onSelect}
          onDelete={deleteChat}
        />
      </div>

      <div className="border-t p-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start gap-3"
        >
          <User className="h-4 w-4" />
          Account
        </Button>
      </div>
    </aside>
  );
}

function ConversationGroup({
  title,
  conversations,
  selectedId,
  onSelect,
  onDelete,
}: {
  title: string;
  conversations: ChatConversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  if (conversations.length === 0) {
    return null;
  }

  return (
    <div className="mb-5">
      <p className="px-2 pb-2 text-xs font-medium text-muted-foreground">
        {title}
      </p>

      {conversations.map(
        (conversation) => (
          <div
            key={conversation.id}
            className={`group flex items-center rounded-lg ${
              selectedId ===
              conversation.id
                ? "bg-muted"
                : "hover:bg-muted"
            }`}
          >
            <button
              onClick={() =>
                onSelect(conversation.id)
              }
              className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2 text-left text-sm"
            >
              <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />

              <span className="truncate">
                {conversation.title}
              </span>
            </button>

            <Button
              variant="ghost"
              size="icon"
              className="mr-1 h-7 w-7 opacity-0 group-hover:opacity-100"
              onClick={() =>
                onDelete(conversation.id)
              }
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
      )}
    </div>
  );
}
