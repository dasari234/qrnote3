import { Lock, Wifi } from 'lucide-react';
import { CopyButton } from '../copy-button';
import { InfoRow, ScanShell, Section } from '../scan-shell';

const ENCRYPTION_LABELS: Record<string, string> = {
  WPA: 'WPA/WPA2',
  WEP: 'WEP',
  nopass: 'Open (no password)',
};

export function WifiTemplate({
  payload,
  name,
}: {
  payload: Record<string, any>;
  name: string;
}) {
  const ssid = payload.ssid || name;
  const enc = payload.encryption || 'WPA';

  return (
    <ScanShell>
      {/* Container Frame - Explicitly sets boundary tokens to block unstyled browser light leaks */}
      <div className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-colors">
        {/* Banner Section - Maintains high visual recognition via primary theme token matching */}
        <div className="flex flex-col items-center bg-primary px-6 py-8 text-center text-primary-foreground shadow-inner">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-foreground/15 backdrop-blur-sm shadow-sm select-none">
            <Wifi className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="mt-4 text-xl font-bold tracking-tight text-balance">{ssid}</h1>
          <p className="text-sm text-primary-foreground/90 mt-1 font-medium">Wi-Fi Network</p>
        </div>

        <div className="p-5 bg-card">
          <Section>
            {/* Fix: Explicit color variable evaluation for row items division lines, wrapped safely for type validation parameters */}
            <div className="divide-y divide-border border-t border-b border-border/40 text-foreground/90 font-medium">
              <div className="transition-colors hover:bg-muted/30 dark:hover:bg-muted/10">
                <InfoRow label="Network Name" value={ssid} icon={<Wifi className="h-4 w-4 text-primary" />} />
              </div>
              <div className="transition-colors hover:bg-muted/30 dark:hover:bg-muted/10">
                <InfoRow
                  label="Security"
                  value={ENCRYPTION_LABELS[enc] || enc}
                  icon={<Lock className="h-4 w-4 text-primary" />}
                />
              </div>
              {payload.password && enc !== 'nopass' && (
                <div className="flex items-center justify-between gap-3 py-3 px-1 transition-colors hover:bg-muted/30 dark:hover:bg-muted/10">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                      Password
                    </p>
                    <p className="mt-1 break-all font-mono text-sm text-foreground bg-muted/60 dark:bg-muted/20 px-2 py-1 rounded border border-border/30 w-fit">
                      {payload.password}
                    </p>
                  </div>
                  <CopyButton value={payload.password} label="Copy" className="flex-shrink-0 shadow-sm" />
                </div>
              )}
            </div>
          </Section>

          <p className="mt-5 text-center text-xs text-muted-foreground leading-relaxed px-4">
            Open your device Wi-Fi settings, select the network above, and enter
            the password to connect.
          </p>
        </div>
      </div>
    </ScanShell>
  );
}
