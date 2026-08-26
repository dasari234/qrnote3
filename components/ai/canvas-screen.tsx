'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCopilotAction } from '@copilotkit/react-core';
import { CopilotPopup } from '@copilotkit/react-ui';
import { useState } from 'react';

interface Artifact {
  id: string;
  title: string;
  code: string;
  type: string;
}

export default function CanvasScreen() {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);

  // Hook CopilotKit dynamic execution runtime directly to frontend rendering pipelines
  useCopilotAction({
    name: 'renderArtifact',
    description: 'Generates user-facing system tools or scripts on the interactive canvas.',
    parameters: [
      { name: 'id', type: 'string', description: 'Unique identifier' },
      { name: 'title', type: 'string', description: 'Title of the artifact' },
      { name: 'code', type: 'string', description: 'Raw code block context' },
      { name: 'type', type: 'string', description: 'Language classification' },
    ],
    handler: async ({ id, title, code, type }) => {
      const newArtifact = { id, title, code, type };
      setArtifacts((prev) => [...prev, newArtifact]);
      setSelectedArtifact(newArtifact);
    },
  });

  return (
    <div className="flex h-[calc(100vh-4rem)] border-t overflow-hidden relative">
      {/* Left Navigation Matrix */}
      <div className="w-80 border-r bg-card p-4 flex flex-col gap-3">
        <h3 className="font-semibold text-xs tracking-wider text-muted-foreground uppercase px-2">Generated Artifacts</h3>
        {artifacts.length === 0 ? (
          <p className="text-xs text-muted-foreground px-2 italic">No assets built by agent execution yet.</p>
        ) : (
          artifacts.map((art) => (
            <button
              key={art.id}
              onClick={() => setSelectedArtifact(art)}
              className={`w-full text-left p-3 rounded-lg border text-sm transition-all ${
                selectedArtifact?.id === art.id ? 'bg-accent border-primary' : 'bg-background hover:bg-accent/50'
              }`}
            >
              <div className="font-medium truncate">{art.title}</div>
              <div className="text-xs text-muted-foreground uppercase mt-1">{art.type}</div>
            </button>
          ))
        )}
      </div>

      {/* Main Work Area Display */}
      <div className="flex-1 bg-zinc-950 p-6 overflow-y-auto">
        {selectedArtifact ? (
          <Card className="border-zinc-800 bg-zinc-900 text-zinc-100 shadow-2xl">
            <CardHeader className="border-b border-zinc-800 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-mono">{selectedArtifact.title}</CardTitle>
              <span className="text-xs font-mono uppercase bg-zinc-800 px-2 py-1 rounded text-zinc-400">{selectedArtifact.type}</span>
            </CardHeader>
            <CardContent className="p-6">
              <pre className="font-mono text-sm leading-relaxed p-4 rounded-md bg-black text-emerald-400 overflow-x-auto">
                <code>{selectedArtifact.code}</code>
              </pre>
            </CardContent>
          </Card>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <p className="text-sm font-mono">Activate the chat popup and ask the system to "Generate a script to fetch weather details".</p>
          </div>
        )}
      </div>

      {/* Copilot Floating Node Anchor */}
      <CopilotPopup
        labels={{ title: "Canvas Co-Designer", initial: "I can write canvas code dynamically. Command me." }}
      />
    </div>
  );
}
