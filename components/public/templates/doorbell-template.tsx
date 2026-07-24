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
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="flex flex-col items-center bg-primary px-6 py-8 text-center text-primary-foreground">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-foreground/15">
            <Home className="h-8 w-8" />
          </div>
          <h1 className="mt-4 text-xl font-bold">{household}</h1>
        </div>

        <div className="space-y-4 p-5">
          {payload.visitorMessage && (
            <p className="rounded-lg bg-muted p-3 text-sm text-foreground">
              {payload.visitorMessage}
            </p>
          )}

          <div className="space-y-2">
            {payload.ownerPhone && (
              <Button asChild className="w-full">
                <a href={`tel:${payload.ownerPhone}`}>
                  <Phone className="mr-2 h-4 w-4" />
                  Call {payload.ownerName || 'Resident'}
                </a>
              </Button>
            )}
            {payload.ownerEmail && (
              <Button asChild variant="outline" className="w-full">
                <a href={`mailto:${payload.ownerEmail}`}>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </a>
              </Button>
            )}
            {payload.appointmentUrl && (
              <Button asChild variant="outline" className="w-full">
                <a href={payload.appointmentUrl} target="_blank" rel="noreferrer">
                  <CalendarClock className="mr-2 h-4 w-4" />
                  Book Appointment
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      {(payload.deliveryNotes || payload.parkingInstructions) && (
        <div className="mt-4">
          <Section title="Instructions">
            <div className="divide-y">
              <InfoRow
                label="Deliveries"
                value={payload.deliveryNotes}
                icon={<Package className="h-4 w-4" />}
              />
              <InfoRow
                label="Parking"
                value={payload.parkingInstructions}
                icon={<Car className="h-4 w-4" />}
              />
            </div>
          </Section>
        </div>
      )}
    </ScanShell>
  );
}
