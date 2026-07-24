import { Button } from '@/components/ui/button';
import { CalendarPlus, Clock, MapPin } from 'lucide-react';
import { DownloadFileButton } from '../download-file-button';
import { ScanShell, Section } from '../scan-shell';

/** Parse a compact iCS timestamp (YYYYMMDDTHHMMSS) into a readable label. */
function formatICS(value?: string): string | null {
  if (!value) return null;
  const m = value.match(/^(\d{4})(\d{2})(\d{2})T?(\d{2})?(\d{2})?/);
  if (!m) return value;
  const [, y, mo, d, h = '00', mi = '00'] = m;
  const date = new Date(
    Number(y),
    Number(mo) - 1,
    Number(d),
    Number(h),
    Number(mi)
  );
  if (isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function EventTemplate({
  payload,
  name,
}: {
  payload: Record<string, any>;
  name: string;
}) {
  const title = payload.title || name;
  const start = formatICS(payload.start);
  const end = formatICS(payload.end);

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//QRNote//EN',
    'BEGIN:VEVENT',
    `SUMMARY:${title}`,
    payload.location ? `LOCATION:${payload.location}` : '',
    payload.start ? `DTSTART:${payload.start}` : '',
    payload.end ? `DTEND:${payload.end}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n');

  return (
    <ScanShell>
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="bg-primary px-6 py-8 text-primary-foreground">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/15">
            <CalendarPlus className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-balance">{title}</h1>
        </div>

        <div className="space-y-4 p-5">
          {start && (
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">{start}</p>
                {end && <p className="text-sm text-muted-foreground">until {end}</p>}
              </div>
            </div>
          )}
          {payload.location && (
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <p className="text-sm text-foreground">{payload.location}</p>
            </div>
          )}

          <div className="space-y-2 pt-1">
            <DownloadFileButton
              content={ics}
              filename={`${title.replace(/\s+/g, '_')}.ics`}
              mimeType="text/calendar"
              className="w-full"
            >
              <CalendarPlus className="mr-2 h-4 w-4" />
              Add to Calendar
            </DownloadFileButton>
            {payload.location && (
              <Button asChild variant="outline" className="w-full">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(payload.location)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Get Directions
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </ScanShell>
  );
}
