import { Button } from '@/components/ui/button';
import { Mail, Phone, Search } from 'lucide-react';
import { ScanShell, Section } from '../scan-shell';

export function LostFoundTemplate({
  payload,
  name,
}: {
  payload: Record<string, any>;
  name: string;
}) {
  const itemName = payload.itemName || name;

  return (
    <ScanShell>
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="flex flex-col items-center bg-primary px-6 py-8 text-center text-primary-foreground">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-foreground/15">
            <Search className="h-8 w-8" />
          </div>
          <p className="mt-3 text-xs font-medium uppercase tracking-widest text-primary-foreground/80">
            Lost &amp; Found
          </p>
          <h1 className="mt-1 text-xl font-bold">{itemName}</h1>
        </div>

        <div className="space-y-4 p-5">
          <p className="text-center text-sm text-muted-foreground">
            Thank you for finding this item! Please reach out to return it.
          </p>
          {payload.description && (
            <p className="rounded-lg bg-muted p-3 text-sm text-foreground">
              {payload.description}
            </p>
          )}
          {payload.contactMessage && (
            <p className="text-sm text-foreground">{payload.contactMessage}</p>
          )}

          <div className="space-y-2">
            {payload.contactPhone && (
              <Button asChild className="w-full">
                <a href={`tel:${payload.contactPhone}`}>
                  <Phone className="mr-2 h-4 w-4" />
                  Call Owner
                </a>
              </Button>
            )}
            {payload.contactEmail && (
              <Button asChild variant="outline" className="w-full">
                <a href={`mailto:${payload.contactEmail}`}>
                  <Mail className="mr-2 h-4 w-4" />
                  Email Owner
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </ScanShell>
  );
}
