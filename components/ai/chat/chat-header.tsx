"use client";

import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import ModelSelector from "./model-selector";

interface ChatHeaderProps {
  onToggleSidebar: () => void;
}

export default function ChatHeader({
  onToggleSidebar,
}: ChatHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div>
          <h1 className="text-sm font-semibold">
            AI Playground
          </h1>

          <p className="text-xs text-muted-foreground">
            Chat
          </p>
        </div>
      </div>

      <ModelSelector />
    </header>
  );
}
