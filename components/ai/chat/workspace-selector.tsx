"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useChatApp } from "@/context/ai-chat-context";
import { Check, ChevronDown } from "lucide-react";

export default function WorkspaceSelector() {
  const { workspaceId, setWorkspaceId, workspaces } = useChatApp();

  const selectedWorkspace = workspaces.find(
    (workspace) => workspace.id === workspaceId
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="max-w-[220px] gap-2"
          disabled={workspaces.length === 0}
        >
          <div className="flex min-w-0 flex-col items-start">
            <span className="text-[10px] leading-none text-muted-foreground">
              Workspace
            </span>
            <span className="max-w-[150px] truncate text-xs font-medium">
              {selectedWorkspace?.name ?? "Select workspace"}
            </span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 shrink-0" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72">
        {workspaces.length === 0 ? (
          <DropdownMenuItem disabled>
            No workspaces available
          </DropdownMenuItem>
        ) : (
          workspaces.map((workspace) => (
            <DropdownMenuItem
              key={workspace.id}
              onClick={() => setWorkspaceId(workspace.id)}
              className="flex items-center justify-between gap-3 py-3"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">
                  {workspace.name}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {workspace.organizationName}
                </div>
              </div>

              {workspace.id === workspaceId && (
                <Check className="h-4 w-4 shrink-0" />
              )}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
