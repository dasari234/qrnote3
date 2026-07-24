import { Button } from '@/components/ui/button';
import { stripReservedKeys } from '@/lib/qr/meta';
import { ExternalLink, Info } from 'lucide-react';
import { InfoRow, ScanShell, Section } from '../scan-shell';

const URL_KEYS = ['url', 'productUrl', 'portfolioUrl', 'resumeUrl', 'catalogUrl'];

function humanize(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

export function GenericTemplate({
  payload,
  name,
}: {
  payload: Record<string, any>;
  name: string;
}) {
  const content = stripReservedKeys(payload);
  const primaryUrl = URL_KEYS.map((k) => content[k]).find(Boolean);
  const entries = Object.entries(content).filter(
    ([, v]) => v !== undefined && v !== null && v !== ''
  );

  return (
    <ScanShell>
      <div className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-colors">
        {/* Banner Section - Maintains high visual consistency via primary color token mapping */}
        <div className="flex items-center gap-3 bg-primary px-5 py-5 text-primary-foreground shadow-inner">
          <Info className="h-5 w-5 text-primary-foreground shrink-0" />
          <h1 className="text-lg font-bold tracking-tight text-balance">{name}</h1>
        </div>

        <div className="p-5 bg-card">
          {primaryUrl && (
            <Button asChild className="mb-4 w-full shadow-sm transition-transform active:scale-[0.99]">
              <a href={primaryUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Link
              </a>
            </Button>
          )}

          <Section>
            <div className="divide-y divide-border border-t border-b border-border/40">
              {entries.map(([key, value]) => (
                <div
                  key={key}
                  className="py-1 px-1 transition-colors hover:bg-muted/30 dark:hover:bg-muted/10 text-foreground"
                >
                  <InfoRow label={humanize(key)} value={String(value)} />
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </ScanShell>
  );
}
