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
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="flex items-center gap-3 bg-primary px-5 py-5 text-primary-foreground">
          <Info className="h-6 w-6" />
          <h1 className="text-lg font-bold">{name}</h1>
        </div>
        <div className="p-5">
          {primaryUrl && (
            <Button asChild className="mb-4 w-full">
              <a href={primaryUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Link
              </a>
            </Button>
          )}
          <Section>
            <div className="divide-y">
              {entries.map(([key, value]) => (
                <InfoRow key={key} label={humanize(key)} value={String(value)} />
              ))}
            </div>
          </Section>
        </div>
      </div>
    </ScanShell>
  );
}
