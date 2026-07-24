import { Button } from '@/components/ui/button';
import { Mail, Phone, Search } from 'lucide-react';
import { ScanShell } from '../scan-shell';

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
      <div className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-colors">
        {/* Banner Section - Maintains bold styling parameters using your theme's active primary color tokens */}
        <div className="flex flex-col items-center bg-primary px-6 py-8 text-center text-primary-foreground shadow-inner">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-foreground/15 backdrop-blur-sm">
            <Search className="h-8 w-8 text-primary-foreground" />
          </div>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-primary-foreground/90">
            Lost &amp; Found
          </p>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-balance">{itemName}</h1>
        </div>

        <div className="space-y-4 p-5 bg-card">
          <p className="text-center text-sm text-muted-foreground font-medium px-2 leading-relaxed">
            Thank you for finding this item! Please reach out to return it.
          </p>

          {payload.description && (
            <p className="rounded-lg bg-muted dark:bg-muted/50 p-3 text-sm text-foreground/90 border border-border/40 font-medium leading-relaxed">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Item Description:</span>
              {payload.description}
            </p>
          )}

          {payload.contactMessage && (
            <p className="text-sm text-foreground/90 bg-accent/30 dark:bg-accent/10 border border-border/30 rounded-lg p-3 leading-relaxed font-medium">
              {payload.contactMessage}
            </p>
          )}

          <div className="space-y-2 pt-2">
            {payload.contactPhone && (
              <Button asChild className="w-full shadow-sm transition-transform active:scale-[0.99]">
                <a href={`tel:${payload.contactPhone}`}>
                  <Phone className="mr-2 h-4 w-4" />
                  Call Owner
                </a>
              </Button>
            )}
            {payload.contactEmail && (
              <Button variant="outline" asChild className="w-full hover:bg-accent hover:text-accent-foreground transition-all">
                <a href={`mailto:${payload.contactEmail}`}>
                  <Mail className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-foreground" />
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
