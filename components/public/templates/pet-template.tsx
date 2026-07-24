import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  Gift,
  Mail,
  MapPin,
  PawPrint,
  Phone,
  Syringe,
} from 'lucide-react';
import { InfoRow, ScanShell, Section } from '../scan-shell';

export function PetTemplate({
  payload,
  name,
}: {
  payload: Record<string, any>;
  name: string;
}) {
  const petName = payload.petName || name;
  const isLost = payload.lostStatus === 'lost';

  return (
    <ScanShell>
      {isLost && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-destructive px-4 py-3 text-destructive-foreground">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm font-semibold">
            This pet is LOST. Please contact the owner below.
          </p>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="flex flex-col items-center bg-primary px-6 py-8 text-center text-primary-foreground">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-foreground/15">
            <PawPrint className="h-9 w-9" />
          </div>
          <h1 className="mt-4 text-2xl font-bold">{petName}</h1>
          <p className="text-sm text-primary-foreground/80">
            {[payload.breed, payload.species].filter(Boolean).join(' · ')}
          </p>
        </div>

        <div className="space-y-2 p-5">
          {payload.ownerPhone && (
            <Button asChild className="w-full">
              <a href={`tel:${payload.ownerPhone}`}>
                <Phone className="mr-2 h-4 w-4" />
                Call {payload.ownerName || 'Owner'}
              </a>
            </Button>
          )}
          <div className="grid grid-cols-1 gap-2">
            {payload.ownerEmail && (
              <Button asChild variant="outline" className="w-full">
                <a href={`mailto:${payload.ownerEmail}`}>
                  <Mail className="mr-2 h-4 w-4" />
                  Email Owner
                </a>
              </Button>
            )}
            {payload.ownerAddress && (
              <Button asChild variant="outline" className="w-full">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(payload.ownerAddress)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Owner Address
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      {payload.reward && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <Gift className="h-5 w-5 text-primary" />
          <p className="text-sm font-medium text-foreground">{payload.reward}</p>
        </div>
      )}

      <div className="mt-4">
        <Section title="About">
          <div className="divide-y">
            <InfoRow label="Age" value={payload.age} />
            <InfoRow label="Color / Markings" value={payload.color} />
            <InfoRow
              label="Vaccinations"
              value={payload.vaccinations && <span className="whitespace-pre-line">{payload.vaccinations}</span>}
              icon={<Syringe className="h-4 w-4" />}
            />
            <InfoRow
              label="Medical Notes"
              value={payload.medicalNotes && <span className="whitespace-pre-line">{payload.medicalNotes}</span>}
            />
          </div>
        </Section>
      </div>
    </ScanShell>
  );
}
