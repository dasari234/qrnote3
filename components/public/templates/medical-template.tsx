import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  Droplet,
  HeartPulse,
  Navigation,
  Phone,
  Pill,
  Stethoscope,
  User,
} from 'lucide-react';
import { InfoRow, ScanShell, Section } from '../scan-shell';

function EmergencyContact({
  label,
  name,
  phone,
}: {
  label: string;
  name?: string;
  phone?: string;
}) {
  if (!name && !phone) return null;
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border bg-background p-3">
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="truncate text-sm font-medium text-foreground">
          {name || phone}
        </p>
      </div>
      {phone && (
        <Button asChild size="sm">
          <a href={`tel:${phone}`}>
            <Phone className="mr-1.5 h-4 w-4" />
            Call
          </a>
        </Button>
      )}
    </div>
  );
}

export function MedicalTemplate({
  payload,
  name,
}: {
  payload: Record<string, any>;
  name: string;
}) {
  const fullName = payload.fullName || name;

  return (
    <ScanShell>
      <div className="overflow-hidden rounded-xl border border-destructive/30 bg-card shadow-sm">
        <div className="flex items-center gap-3 bg-destructive px-5 py-4 text-destructive-foreground">
          <HeartPulse className="h-7 w-7" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest opacity-90">
              Medical Emergency
            </p>
            <h1 className="text-lg font-bold leading-tight">{fullName}</h1>
          </div>
        </div>

        <div className="p-5">
          <div className="flex flex-wrap gap-2">
            {payload.bloodGroup && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 text-sm font-semibold text-destructive">
                <Droplet className="h-4 w-4" />
                {payload.bloodGroup}
              </span>
            )}
            {payload.organDonor === 'yes' && (
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                Organ Donor
              </span>
            )}
            {payload.dateOfBirth && (
              <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
                DOB: {payload.dateOfBirth}
              </span>
            )}
          </div>

          {payload.allergies && (
            <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/5 p-3">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wide">
                  Allergies
                </span>
              </div>
              <p className="mt-1 whitespace-pre-line text-sm text-foreground">
                {payload.allergies}
              </p>
            </div>
          )}
        </div>
      </div>

      {(payload.emergencyContact1Name ||
        payload.emergencyContact1Phone ||
        payload.emergencyContact2Name ||
        payload.emergencyContact2Phone) && (
        <div className="mt-4">
          <Section title="Emergency Contacts">
            <div className="space-y-2">
              <EmergencyContact
                label="Contact 1"
                name={payload.emergencyContact1Name}
                phone={payload.emergencyContact1Phone}
              />
              <EmergencyContact
                label="Contact 2"
                name={payload.emergencyContact2Name}
                phone={payload.emergencyContact2Phone}
              />
            </div>
          </Section>
        </div>
      )}

      <div className="mt-4">
        <Section title="Medical Information">
          <div className="divide-y">
            <InfoRow
              label="Current Medications"
              value={payload.medications && <span className="whitespace-pre-line">{payload.medications}</span>}
              icon={<Pill className="h-4 w-4" />}
            />
            <InfoRow
              label="Medical History"
              value={payload.medicalHistory && <span className="whitespace-pre-line">{payload.medicalHistory}</span>}
              icon={<HeartPulse className="h-4 w-4" />}
            />
            <InfoRow
              label="Doctor"
              value={payload.doctor}
              icon={<Stethoscope className="h-4 w-4" />}
            />
            <InfoRow
              label="Insurance"
              value={payload.insurance}
              icon={<User className="h-4 w-4" />}
            />
          </div>
        </Section>
      </div>

      {payload.hospitalAddress && (
        <div className="mt-4">
          <Button asChild className="w-full">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(payload.hospitalAddress)}`}
              target="_blank"
              rel="noreferrer"
            >
              <Navigation className="mr-2 h-4 w-4" />
              Navigate to Hospital
            </a>
          </Button>
        </div>
      )}
    </ScanShell>
  );
}
