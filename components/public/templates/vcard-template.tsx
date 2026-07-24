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
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="flex flex-col items-center bg-primary px-6 py-8 text-center text-primary-foreground">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-foreground/15 text-2xl font-semibold">
            {initials.toUpperCase()}
          </div>
          <h1 className="mt-4 text-xl font-bold">{fullName}</h1>
          {payload.title && (
            <p className="text-sm text-primary-foreground/80">{payload.title}</p>
          )}
          {payload.org && (
            <p className="text-sm text-primary-foreground/70">{payload.org}</p>
          )}
        </div>

        <div className="space-y-3 p-5">
          <DownloadFileButton
            content={vcard}
            filename={`${fullName.replace(/\s+/g, '_')}.vcf`}
            mimeType="text/vcard"
            className="w-full"
          >
            <UserRound className="mr-2 h-4 w-4" />
            Save to Contacts
          </DownloadFileButton>

          <div className="grid grid-cols-1 gap-2">
            {payload.phone && (
              <Button asChild variant="outline" className="w-full justify-start">
                <a href={`tel:${payload.phone}`}>
                  <Phone className="mr-2 h-4 w-4" />
                  Call {payload.phone}
                </a>
              </Button>
            )}
            {payload.email && (
              <Button asChild variant="outline" className="w-full justify-start">
                <a href={`mailto:${payload.email}`}>
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </a>
              </Button>
            )}
            {payload.url && (
              <Button asChild variant="outline" className="w-full justify-start">
                <a href={payload.url} target="_blank" rel="noreferrer">
                  <Globe className="mr-2 h-4 w-4" />
                  Visit Website
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <Section title="Details">
          <div className="divide-y">
            <InfoRow label="Email" value={payload.email} icon={<Mail className="h-4 w-4" />} />
            <InfoRow label="Phone" value={payload.phone} icon={<Phone className="h-4 w-4" />} />
            <InfoRow
              label="Organization"
              value={payload.org}
              icon={<Building2 className="h-4 w-4" />}
            />
            <InfoRow label="Website" value={payload.url} icon={<Globe className="h-4 w-4" />} />
          </div>
        </Section>
      </div>
    </ScanShell>
  );
}
