"use client";

import { useState } from "react";
import ChatComposer from "./chat-composer";
import ChatHeader from "./chat-header";
import ChatMessageList from "./chat-message-list";
import ChatSidebar from "./chat-sidebar";

export default function ChatShell() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {sidebarOpen && <ChatSidebar />}

      <section className="flex min-w-0 flex-1 flex-col">
        <ChatHeader
          onToggleSidebar={() =>
            setSidebarOpen((value) => !value)
          }
        />

        <ChatMessageList />

        <ChatComposer />
      </section>
    </div>
  );
}
