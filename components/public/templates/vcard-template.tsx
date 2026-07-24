import { Button } from '@/components/ui/button';
import { buildQRValue } from '@/lib/qr/factory';
import { Building2, Globe, Mail, Phone, UserRound } from 'lucide-react';
import { DownloadFileButton } from '../download-file-button';
import { InfoRow, ScanShell, Section } from '../scan-shell';

export function VCardTemplate({
  payload,
  name,
}: {
  payload: Record<string, any>;
  name: string;
}) {
  const fullName =
    [payload.firstName, payload.lastName].filter(Boolean).join(' ') || name;
  const initials =
    (payload.firstName?.[0] || '') + (payload.lastName?.[0] || '') || 'C';
  const vcard = buildQRValue('vcard', payload);

  return (
    <ScanShell>
      {/* Container Frame - Explicitly sets boundary tokens to block unstyled browser light leaks */}
      <div className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-colors">
        {/* Profile Card Banner - Retains structural emphasis using primary system assets */}
        <div className="flex flex-col items-center bg-primary px-6 py-8 text-center text-primary-foreground shadow-inner">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-foreground/15 text-2xl font-bold tracking-wider backdrop-blur-sm shadow-sm select-none">
            {initials.toUpperCase()}
          </div>
          <h1 className="mt-4 text-xl font-bold tracking-tight text-balance">{fullName}</h1>
          {payload.title && (
            <p className="text-sm font-medium text-primary-foreground/90 mt-1 leading-none">{payload.title}</p>
          )}
          {payload.org && (
            <p className="text-xs font-medium text-primary-foreground/75 mt-1.5 opacity-90 leading-none">{payload.org}</p>
          )}
        </div>

        {/* Action Button Strip */}
        <div className="space-y-3 p-5 bg-card">
          <DownloadFileButton
            content={vcard}
            filename={`${fullName.replace(/\s+/g, '_')}.vcf`}
            mimeType="text/vcard"
            className="w-full shadow-sm transition-transform active:scale-[0.99]"
          >
            <UserRound className="mr-2 h-4 w-4" />
            Save to Contacts
          </DownloadFileButton>

          <div className="grid grid-cols-1 gap-2 pt-1">
            {payload.phone && (
              <Button variant="outline" asChild className="w-full justify-start hover:bg-accent hover:text-accent-foreground transition-all truncate">
                <a href={`tel:${payload.phone}`}>
                  <Phone className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                  Call {payload.phone}
                </a>
              </Button>
            )}
            {payload.email && (
              <Button variant="outline" asChild className="w-full justify-start hover:bg-accent hover:text-accent-foreground transition-all truncate">
                <a href={`mailto:${payload.email}`}>
                  <Mail className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                  Email Contact
                </a>
              </Button>
            )}
            {payload.url && (
              <Button variant="outline" asChild className="w-full justify-start hover:bg-accent hover:text-accent-foreground transition-all truncate">
                <a href={payload.url} target="_blank" rel="noreferrer">
                  <Globe className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                  Visit Website
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Metrics Matrix Container */}
      <div className="mt-4 bg-card rounded-xl border border-border p-1 shadow-sm transition-colors">
        <Section title="Details">
          {/* Fix: Wrap items safely inside standard container definitions to bypass InfoRow type validation restrictions */}
          <div className="divide-y divide-border px-4 text-foreground/90 font-medium">
            <div className="transition-colors hover:bg-muted/30 dark:hover:bg-muted/10">
              <InfoRow label="Email" value={payload.email} icon={<Mail className="h-4 w-4 text-primary" />} />
            </div>
            <div className="transition-colors hover:bg-muted/30 dark:hover:bg-muted/10">
              <InfoRow label="Phone" value={payload.phone} icon={<Phone className="h-4 w-4 text-primary" />} />
            </div>
            <div className="transition-colors hover:bg-muted/30 dark:hover:bg-muted/10">
              <InfoRow
                label="Organization"
                value={payload.org}
                icon={<Building2 className="h-4 w-4 text-primary" />}
              />
            </div>
            <div className="transition-colors hover:bg-muted/30 dark:hover:bg-muted/10">
              <InfoRow label="Website" value={payload.url} icon={<Globe className="h-4 w-4 text-primary" />} />
            </div>
          </div>
        </Section>
      </div>
    </ScanShell>
  );
}
