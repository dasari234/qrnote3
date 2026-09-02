'use client';

interface ToolResultProps {
  toolName: string;
  result: unknown;
}

export default function ToolResult({ toolName, result }: ToolResultProps) {
  return (
    <details className="my-2 rounded-lg border bg-muted/30 p-3 text-xs">
      {' '}
      <summary className="cursor-pointer font-medium">{toolName} </summary>
      <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap">
        {JSON.stringify(result, null, 2)}
      </pre>
    </details>
  );
}
