import { FileText } from 'lucide-react';
import { CopyButton } from '../copy-button';
import { ScanShell } from '../scan-shell';

export function TextTemplate({
  payload,
  name,
}: {
  payload: Record<string, any>;
  name: string;
}) {
  const text = payload.text || '';

  return (
    <ScanShell>
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-muted-foreground">
          <FileText className="h-5 w-5" />
          <span className="text-sm font-medium">{name}</span>
        </div>
        <p className="whitespace-pre-line text-base leading-relaxed text-foreground">
          {text}
        </p>
        {text && (
          <div className="mt-5">
            <CopyButton value={text} label="Copy text" className="w-full" />
          </div>
        )}
      </div>
    </ScanShell>
  );
}
