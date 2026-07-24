import { QRType } from '@/lib/types';
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
  switch (type) {
    case 'vcard':
      return <VCardTemplate payload={payload} name={name} />;
    case 'event':
      return <EventTemplate payload={payload} name={name} />;
    case 'medical_emergency':
      return <MedicalTemplate payload={payload} name={name} />;
    case 'pet_id':
      return <PetTemplate payload={payload} name={name} />;
    case 'wifi':
      return <WifiTemplate payload={payload} name={name} />;
    case 'text':
      return <TextTemplate payload={payload} name={name} />;
    case 'memorial':
      return <MemorialTemplate payload={payload} name={name} />;
    case 'gift_memories':
      return <GiftTemplate payload={payload} name={name} />;
    case 'doorbell':
      return <DoorbellTemplate payload={payload} name={name} />;
    case 'lost_found':
      return <LostFoundTemplate payload={payload} name={name} />;
    case 'rsvp':
      return <RsvpTemplate payload={payload} name={name} />;
    default:
      return <GenericTemplate payload={payload} name={name} />;
  }
}
