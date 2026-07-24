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
        // Premium Alert Banner - Swaps from a bright solid block to an elegant translucent warnings container
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-destructive dark:bg-red-950/20 dark:text-red-400 shadow-sm transition-colors animate-pulse">
          <AlertTriangle className="h-5 w-5 shrink-0 text-destructive dark:text-red-400" />
          <p className="text-sm font-bold tracking-tight">
            This pet is LOST. Please contact the owner below.
          </p>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-colors">
        {/* Banner Section - Maintains clean branding focus using secondary opacity offsets */}
        <div className="flex flex-col items-center bg-primary px-6 py-8 text-center text-primary-foreground shadow-inner">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-foreground/15 backdrop-blur-sm">
            <PawPrint className="h-9 w-9 text-primary-foreground" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-balance">{petName}</h1>
          {([payload.breed, payload.species].some(Boolean)) && (
            <p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/90 mt-1">
              {[payload.breed, payload.species].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>

        <div className="space-y-3 p-5 bg-card">
          {payload.ownerPhone && (
            <Button asChild className="w-full shadow-sm transition-transform active:scale-[0.99]">
              <a href={`tel:${payload.ownerPhone}`}>
                <Phone className="mr-2 h-4 w-4" />
                Call {payload.ownerName || 'Owner'}
              </a>
            </Button>
          )}
          <div className="grid grid-cols-1 gap-2">
            {payload.ownerEmail && (
              <Button variant="outline" asChild className="w-full hover:bg-accent hover:text-accent-foreground transition-all">
                <a href={`mailto:${payload.ownerEmail}`}>
                  <Mail className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                  Email Owner
                </a>
              </Button>
            )}
            {payload.ownerAddress && (
              <Button variant="outline" asChild className="w-full hover:bg-accent hover:text-accent-foreground transition-all">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(payload.ownerAddress)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                  Owner Address
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      {payload.reward && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 dark:bg-primary/10 dark:border-primary/20 transition-colors">
          <Gift className="h-5 w-5 text-primary shrink-0" />
          <p className="text-sm font-semibold text-foreground/90 leading-normal">{payload.reward}</p>
        </div>
      )}

      <div className="mt-4 bg-card rounded-xl border border-border p-1 shadow-sm transition-colors">
        <Section title="About">
          {/* Wrap item loops cleanly inside a standard division container */}
          <div className="divide-y divide-border px-4">
            <div className="text-foreground/90 font-medium">
              <InfoRow label="Age" value={payload.age} />
            </div>
            <div className="text-foreground/90 font-medium">
              <InfoRow label="Color / Markings" value={payload.color} />
            </div>
            <div className="text-foreground/90 font-medium">
              <InfoRow
                label="Vaccinations"
                value={payload.vaccinations && <span className="whitespace-pre-line">{payload.vaccinations}</span>}
                icon={<Syringe className="h-4 w-4 text-primary" />}
              />
            </div>
            <div className="text-foreground/90 font-medium">
              <InfoRow
                label="Medical Notes"
                value={payload.medicalNotes && <span className="whitespace-pre-line">{payload.medicalNotes}</span>}
              />
            </div>
          </div>
        </Section>
      </div>
    </ScanShell>
  );
}
