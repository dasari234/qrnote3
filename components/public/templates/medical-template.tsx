import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background p-3 transition-colors dark:bg-muted/10">
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="truncate text-sm font-semibold text-foreground mt-0.5">
          {name || phone}
        </p>
      </div>
      {phone && (
        <Button asChild size="sm" className="shadow-sm">
          <a href={`tel:${phone}`}>
            <Phone className="mr-1.5 h-3.5 w-3.5" />
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
      {/* Container Frame - Keeps a soft red outline in dark themes for critical emphasis */}
      <div className="overflow-hidden rounded-xl border border-destructive/40 bg-card text-card-foreground shadow-sm transition-colors">
        {/* Banner Section - Swaps color layers gracefully while preserving high recognition */}
        <div className="flex items-center gap-3 bg-destructive px-5 py-4 text-destructive-foreground shadow-inner">
          <HeartPulse className="h-7 w-7 shrink-0 text-destructive-foreground" />
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-90">
              Medical Emergency
            </p>
            <h1 className="text-lg font-bold leading-tight truncate tracking-tight text-balance">{fullName}</h1>
          </div>
        </div>

        <div className="p-5 bg-card">
          <div className="flex flex-wrap gap-2">
            {payload.bloodGroup && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 text-xs font-bold text-destructive dark:bg-red-500/20 dark:text-red-400 border border-destructive/20 dark:border-red-500/10">
                <Droplet className="h-3.5 w-3.5 fill-current" />
                Blood: {payload.bloodGroup}
              </span>
            )}
            {payload.organDonor === 'yes' && (
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary dark:bg-primary/20 dark:text-primary-foreground border border-primary/10">
                Organ Donor
              </span>
            )}
            {payload.dateOfBirth && (
              <span className="inline-flex items-center rounded-full bg-muted dark:bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground border border-border/40">
                DOB: {payload.dateOfBirth}
              </span>
            )}
          </div>

          {payload.allergies && (
            <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/5 p-3 dark:bg-red-950/20 dark:border-red-500/30">
              <div className="flex items-center gap-2 text-destructive dark:text-red-400">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wide">
                  Allergies
                </span>
              </div>
              <p className="mt-1.5 whitespace-pre-line text-sm text-foreground/90 font-semibold leading-relaxed">
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
          <div className="mt-4 bg-card rounded-xl border border-border p-4 shadow-sm transition-colors">
            <Section title="Emergency Contacts">
              <div className="grid gap-2 sm:grid-cols-2 mt-2">
                <EmergencyContact
                  label="Primary Contact"
                  name={payload.emergencyContact1Name}
                  phone={payload.emergencyContact1Phone}
                />
                <EmergencyContact
                  label="Secondary Contact"
                  name={payload.emergencyContact2Name}
                  phone={payload.emergencyContact2Phone}
                />
              </div>
            </Section>
          </div>
        )}

      <div className="mt-4 bg-card rounded-xl border border-border p-1 shadow-sm transition-colors">
        <Section title="Medical Information">
          {/* Fix: Explicit color variable evaluation for data row division lines */}
          <div className="divide-y divide-border px-4">
            <InfoRow
              label="Current Medications"
              value={payload.medications && <span className="whitespace-pre-line text-foreground/90 font-medium">{payload.medications}</span>}
              icon={<Pill className="h-4 w-4 text-primary" />}
            />
            <InfoRow
              label="Medical History"
              value={payload.medicalHistory && <span className="whitespace-pre-line text-foreground/90 font-medium">{payload.medicalHistory}</span>}
              icon={<HeartPulse className="h-4 w-4 text-primary" />}
            />
            <InfoRow
              label="Primary Doctor"
              value={payload.doctor}
              icon={<Stethoscope className="h-4 w-4 text-primary" />}
            />
            <InfoRow
              label="Insurance Provider"
              value={payload.insurance}
              icon={<User className="h-4 w-4 text-primary" />}
            />
          </div>
        </Section>
      </div>

      {payload.hospitalAddress && (
        <div className="mt-4">
          <Button asChild className="w-full shadow-sm transition-transform active:scale-[0.99]">
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
