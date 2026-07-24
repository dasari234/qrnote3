import { Button } from '@/components/ui/button';
import { CalendarClock, Car, Home, Mail, Package, Phone } from 'lucide-react';
import { InfoRow, ScanShell, Section } from '../scan-shell';

export function DoorbellTemplate({
  payload,
  name,
}: {
  payload: Record<string, any>;
  name: string;
}) {
  const household = payload.householdName || name;

  return (
    <ScanShell>
      <div className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-colors">
        {/* Banner Section - Maintains high visibility using semantic primary color system */}
        <div className="flex flex-col items-center bg-primary px-6 py-8 text-center text-primary-foreground shadow-inner">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-foreground/15 backdrop-blur-sm">
            <Home className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="mt-4 text-xl font-bold tracking-tight">{household}</h1>
        </div>

        <div className="space-y-4 p-5 bg-card">
          {payload.visitorMessage && (
            <p className="rounded-lg bg-muted dark:bg-muted/50 p-3 text-sm text-foreground/90 border border-border/40 font-medium leading-relaxed">
              {payload.visitorMessage}
            </p>
          )}

          <div className="space-y-2">
            {payload.ownerPhone && (
              <Button asChild className="w-full shadow-sm">
                <a href={`tel:${payload.ownerPhone}`}>
                  <Phone className="mr-2 h-4 w-4" />
                  Call {payload.ownerName || 'Resident'}
                </a>
              </Button>
            )}
            {payload.ownerEmail && (
              <Button variant="outline" asChild className="w-full hover:bg-accent hover:text-accent-foreground">
                <a href={`mailto:${payload.ownerEmail}`}>
                  <Mail className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                  Send Email
                </a>
              </Button>
            )}
            {payload.appointmentUrl && (
              <Button variant="outline" asChild className="w-full hover:bg-accent hover:text-accent-foreground">
                <a href={payload.appointmentUrl} target="_blank" rel="noreferrer">
                  <CalendarClock className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                  Book Appointment
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      {(payload.deliveryNotes || payload.parkingInstructions) && (
        <div className="mt-4 bg-card rounded-xl border border-border p-1 shadow-sm">
          <Section title="Instructions">
            <div className="divide-y divide-border px-4">
              <InfoRow
                label="Deliveries"
                value={payload.deliveryNotes}
                icon={<Package className="h-4 w-4 text-primary" />}
              />
              <InfoRow
                label="Parking"
                value={payload.parkingInstructions}
                icon={<Car className="h-4 w-4 text-primary" />}
              />
            </div>
          </Section>
        </div>
      )}
    </ScanShell>
  );
}
