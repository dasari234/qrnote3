import { QRType } from '@/lib/types';
import { AlertCircle } from 'lucide-react';
import { ScanShell } from './scan-shell';

import { DoorbellTemplate } from './templates/doorbell-template';
import { EventTemplate } from './templates/event-template';
import { GenericTemplate } from './templates/generic-template';
import { GiftTemplate } from './templates/gift-template';
import { LostFoundTemplate } from './templates/lost-found-template';
import { MedicalTemplate } from './templates/medical-template';
import { MemorialTemplate } from './templates/memorial-template';
import { PetTemplate } from './templates/pet-template';
import { RsvpTemplate } from './templates/rsvp-template';
import { TextTemplate } from './templates/text-template';
import { VCardTemplate } from './templates/vcard-template';
import { WifiTemplate } from './templates/wifi-template';

/**
 * Renders the correct public landing template for a scanned QR code.
 * Seamlessly routes data targets down to theme-optimized sub-templates.
 */
export function PublicScanView({
  type,
  payload,
  name,
}: {
  type: QRType;
  payload: Record<string, any>;
  name: string;
}) {
  // Ensure payload exists to prevent downstream mapping crashes across dynamic states
  const safePayload = payload || {};

  switch (type) {
    case 'vcard':
      return <VCardTemplate payload={safePayload} name={name} />;
    case 'event':
      return <EventTemplate payload={safePayload} name={name} />;
    case 'medical_emergency':
      return <MedicalTemplate payload={safePayload} name={name} />;
    case 'pet_id':
      return <PetTemplate payload={safePayload} name={name} />;
    case 'wifi':
      return <WifiTemplate payload={safePayload} name={name} />;
    case 'text':
      return <TextTemplate payload={safePayload} name={name} />;
    case 'memorial':
      return <MemorialTemplate payload={safePayload} name={name} />;
    case 'gift_memories':
      return <GiftTemplate payload={safePayload} name={name} />;
    case 'doorbell':
      return <DoorbellTemplate payload={safePayload} name={name} />;
    case 'lost_found':
      return <LostFoundTemplate payload={safePayload} name={name} />;
    case 'rsvp':
      return <RsvpTemplate payload={safePayload} name={name} />;
    default:
      // Graceful fallback for unrecognized QR types using theme variables
      if (!safePayload || Object.keys(safePayload).length === 0) {
        return (
          <ScanShell>
            <div className="rounded-xl border border-border bg-card p-6 text-center text-card-foreground shadow-sm transition-colors">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted dark:bg-muted/50">
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
              </div>
              <h1 className="text-sm font-bold text-foreground">Empty QR Code</h1>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                This QR code code contains no profile payload information records.
              </p>
            </div>
          </ScanShell>
        );
      }
      return <GenericTemplate payload={safePayload} name={name} />;
  }
}
