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
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="flex flex-col items-center bg-primary px-6 py-8 text-center text-primary-foreground">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-foreground/15">
            <Wifi className="h-8 w-8" />
          </div>
          <h1 className="mt-4 text-xl font-bold">{ssid}</h1>
          <p className="text-sm text-primary-foreground/80">Wi-Fi Network</p>
        </div>

        <div className="p-5">
          <Section>
            <div className="divide-y">
              <InfoRow label="Network Name" value={ssid} icon={<Wifi className="h-4 w-4" />} />
              <InfoRow
                label="Security"
                value={ENCRYPTION_LABELS[enc] || enc}
                icon={<Lock className="h-4 w-4" />}
              />
              {payload.password && enc !== 'nopass' && (
                <div className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Password
                    </p>
                    <p className="mt-0.5 break-all font-mono text-sm text-foreground">
                      {payload.password}
                    </p>
                  </div>
                  <CopyButton value={payload.password} label="Copy" className="flex-shrink-0" />
                </div>
              )}
            </div>
          </Section>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Open your device Wi-Fi settings, select the network above, and enter
            the password to connect.
          </p>
        </div>
      </div>
    </ScanShell>
  );
}
