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
      {/* Container Frame - Explicitly styles boundaries with dark-friendly variables to avoid light bleed */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm text-card-foreground transition-colors">
        {/* Header Metadata Meta Row */}
        <div className="mb-4 flex items-center gap-2 text-muted-foreground/90 transition-colors">
          <FileText className="h-5 w-5 text-primary shrink-0" />
          <span className="text-sm font-semibold tracking-tight truncate max-w-[250px]">{name}</span>
        </div>

        {/* Main Content Area - Formatted with an accessible, high-contrast text layout container */}
        <div className="rounded-lg bg-muted/40 dark:bg-muted/10 border border-border/40 p-4 shadow-inner">
          <p className="whitespace-pre-line text-sm md:text-base leading-relaxed text-foreground/90 font-medium">
            {text || <span className="italic text-muted-foreground/60">No text content provided.</span>}
          </p>
        </div>

        {text && (
          <div className="mt-5">
            {/* Added shadow-sm to button frame for micro-depth distinction on deep charcoal themes */}
            <CopyButton value={text} label="Copy text" className="w-full shadow-sm" />
          </div>
        )}
      </div>
    </ScanShell>
  );
}
