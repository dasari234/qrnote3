import { Button } from '@/components/ui/button';
import { CalendarCheck, Clock, Mail, MapPin, Phone } from 'lucide-react';
import { ScanShell, Section } from '../scan-shell';

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
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="bg-primary px-6 py-8 text-primary-foreground">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/15">
            <CalendarCheck className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-balance">{eventName}</h1>
          <p className="text-sm text-primary-foreground/80">You&apos;re invited</p>
        </div>

        <div className="space-y-4 p-5">
          {date && (
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">{date}</p>
            </div>
          )}
          {payload.location && (
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <p className="text-sm text-foreground">{payload.location}</p>
            </div>
          )}
          {payload.description && (
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
              {payload.description}
            </p>
          )}

          <div className="space-y-2 pt-1">
            {payload.contactPhone && (
              <Button asChild className="w-full">
                <a href={`tel:${payload.contactPhone}`}>
                  <Phone className="mr-2 h-4 w-4" />
                  RSVP by Phone
                </a>
              </Button>
            )}
            {payload.contactEmail && (
              <Button asChild variant="outline" className="w-full">
                <a
                  href={`mailto:${payload.contactEmail}?subject=${encodeURIComponent('RSVP: ' + eventName)}`}
                >
                  <Mail className="mr-2 h-4 w-4" />
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
