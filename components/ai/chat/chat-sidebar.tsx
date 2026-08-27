"use client";

import {
    MessageSquare,
    Plus,
    Search,
    Settings,
    User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const conversations = [
  {
    id: "1",
    title: "React Server Components",
  },
  {
    id: "2",
    title: "Design scalable APIs",
  },
  {
    id: "3",
    title: "PostgreSQL optimization",
  },
  {
    id: "4",
    title: "Supabase RLS architecture",
  },
];

export default function ChatSidebar() {
  return (
    <aside className="flex w-[280px] shrink-0 flex-col border-r bg-muted/20">
      <div className="p-3">
        <Button
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
            placeholder="Search chats"
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        <div className="mb-5">
          <p className="px-2 pb-2 text-xs font-medium text-muted-foreground">
            Today
          </p>

          {conversations.slice(0, 3).map((conversation) => (
            <button
              key={conversation.id}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-muted"
            >
              <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />

              <span className="truncate">
                {conversation.title}
              </span>
            </button>
          ))}
        </div>

        <div>
          <p className="px-2 pb-2 text-xs font-medium text-muted-foreground">
            Yesterday
          </p>

          {conversations.slice(3).map((conversation) => (
            <button
              key={conversation.id}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-muted"
            >
              <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />

              <span className="truncate">
                {conversation.title}
              </span>
            </button>
          ))}
        </div>
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
