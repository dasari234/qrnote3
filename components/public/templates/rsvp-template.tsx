import { Button } from '@/components/ui/button';
import { CalendarCheck, Clock, Mail, MapPin, Phone } from 'lucide-react';
import { ScanShell } from '../scan-shell';

function formatDate(value?: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function RsvpTemplate({
  payload,
  name,
}: {
  payload: Record<string, any>;
  name: string;
}) {
  const eventName = payload.eventName || name;
  const date = formatDate(payload.date);

  return (
    <ScanShell>
      {/* Container Frame - Configured with standard canvas variables to remain high quality in both themes */}
      <div className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-colors">
        {/* Banner Section - Maintains high visual recognition via primary theme token matching */}
        <div className="bg-primary px-6 py-8 text-primary-foreground shadow-inner">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/15 backdrop-blur-sm">
            <CalendarCheck className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="mt-4 text-xl font-bold tracking-tight text-balance">{eventName}</h1>
          <p className="text-sm text-primary-foreground/90 mt-1 font-medium">You&apos;re invited</p>
        </div>

        <div className="space-y-4 p-5 bg-card">
          {date && (
            <div className="flex items-start gap-3 transition-colors">
              <Clock className="mt-0.5 h-5 w-5 text-muted-foreground/80 shrink-0" />
              <p className="text-sm font-semibold text-foreground/90 leading-normal">{date}</p>
            </div>
          )}
          {payload.location && (
            <div className="flex items-start gap-3 transition-colors">
              <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground/80 shrink-0" />
              <p className="text-sm text-foreground/90 font-medium leading-relaxed">{payload.location}</p>
            </div>
          )}
          {payload.description && (
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90 font-medium bg-muted/30 dark:bg-muted/10 p-4 rounded-lg border border-border/30">
              {payload.description}
            </p>
          )}

          <div className="space-y-2 pt-2">
            {payload.contactPhone && (
              <Button asChild className="w-full shadow-sm transition-transform active:scale-[0.99]">
                <a href={`tel:${payload.contactPhone}`}>
                  <Phone className="mr-2 h-4 w-4" />
                  RSVP by Phone
                </a>
              </Button>
            )}
            {payload.contactEmail && (
              <Button variant="outline" asChild className="w-full hover:bg-accent hover:text-accent-foreground transition-all">
                <a
                  href={`mailto:${payload.contactEmail}?subject=${encodeURIComponent('RSVP: ' + eventName)}`}
                >
                  <Mail className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                  RSVP by Email
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </ScanShell>
  );
}
