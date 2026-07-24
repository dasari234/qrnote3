import { QRType } from '@/lib/types';

/**
 * Builds the raw string value that gets encoded into a QR code.
 * For dynamic QRs this is the public short-link URL; for static QRs
 * it is the type-specific payload (mailto:, tel:, WIFI:, etc.).
 */
export function buildQRValue(
  type: QRType,
  payload: Record<string, any>,
  options: { dynamic?: boolean; shortLinkUrl?: string } = {}
): string {
  if (options.dynamic && options.shortLinkUrl) {
    return options.shortLinkUrl;
  }

  switch (type) {
    case 'url':
    case 'pdf':
    case 'image':
    case 'social':
    case 'review':
    case 'menu':
    case 'video':
    case 'app':
      return payload.url || '';

    case 'text':
      return payload.text || '';

    case 'email': {
      const subject = payload.subject ? `?subject=${encodeURIComponent(payload.subject)}` : '';
      const body = payload.body
        ? `${subject ? '&' : '?'}body=${encodeURIComponent(payload.body)}`
        : '';
      return `mailto:${payload.email || ''}${subject}${body}`;
    }

    case 'phone':
      return `tel:${payload.phone || ''}`;

    case 'sms': {
      return `smsto:${payload.phone || ''}:${payload.message || ''}`;
    }

    case 'whatsapp': {
      const phone = (payload.phone || '').replace(/[^\d+]/g, '');
      const msg = payload.message ? `?text=${encodeURIComponent(payload.message)}` : '';
      return `https://wa.me/${phone.replace(/^\+/, '')}${msg}`;
    }

    case 'telegram': {
      const username = (payload.username || '').replace(/^@/, '');
      return `https://t.me/${username}`;
    }

    case 'geo': {
      return `geo:${payload.lat || 0},${payload.lng || 0}`;
    }

    case 'wifi': {
      const enc = payload.encryption || 'WPA';
      const ssid = payload.ssid || '';
      const password = payload.password || '';
      const hidden = payload.hidden === 'true' ? 'H:true;' : '';
      if (enc === 'nopass') {
        return `WIFI:T:nopass;S:${ssid};${hidden};`;
      }
      return `WIFI:T:${enc};S:${ssid};P:${password};${hidden};`;
    }

    case 'vcard': {
      return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${payload.lastName || ''};${payload.firstName || ''}`,
        `FN:${[payload.firstName, payload.lastName].filter(Boolean).join(' ')}`,
        payload.org ? `ORG:${payload.org}` : '',
        payload.title ? `TITLE:${payload.title}` : '',
        payload.phone ? `TEL:${payload.phone}` : '',
        payload.email ? `EMAIL:${payload.email}` : '',
        payload.url ? `URL:${payload.url}` : '',
        'END:VCARD',
      ]
        .filter(Boolean)
        .join('\n');
    }

    case 'event': {
      return [
        'BEGIN:VEVENT',
        `SUMMARY:${payload.title || ''}`,
        payload.location ? `LOCATION:${payload.location}` : '',
        payload.start ? `DTSTART:${payload.start}` : '',
        payload.end ? `DTEND:${payload.end}` : '',
        'END:VEVENT',
      ]
        .filter(Boolean)
        .join('\n');
    }

    case 'catalog':
      return payload.catalogUrl || payload.url || '';

    case 'product':
      return payload.productUrl || payload.url || '';

    case 'resume':
      return payload.resumeUrl || payload.url || '';

    case 'portfolio':
      return payload.portfolioUrl || payload.url || '';

    case 'wedding':
      return payload.rsvpUrl || payload.url || '';

    case 'birthday':
      return payload.rsvpUrl || payload.url || '';

    case 'conference':
      return payload.registerUrl || payload.website || payload.url || '';

    case 'seminar':
      return payload.registerUrl || payload.url || '';

    case 'meetup':
      return payload.groupUrl || payload.url || '';

    case 'rsvp':
      return payload.url || '';

    case 'medical_emergency':
    case 'pet_id':
    case 'gift_memories':
    case 'doorbell':
    case 'memorial':
    case 'lost_found':
      return options.shortLinkUrl || '';

    default:
      return '';
  }
}
/**
 * For dynamic QRs, resolves the actual destination a scan should
 * redirect to. For static QRs, returns null (the QR value itself
 * is the destination).
 */
export function resolveDestination(
  type: QRType,
  payload: Record<string, any>
): string | null {
  switch (type) {
    // Direct URL redirects
    case 'url':
    case 'pdf':
    case 'image':
    case 'social':
    case 'review':
    case 'menu':
    case 'video':
    case 'app':
      return payload.url || null;

    case 'catalog':
      return payload.catalogUrl || null;

    case 'product':
      return payload.productUrl || null;

    case 'portfolio':
      return payload.portfolioUrl || null;

    case 'resume':
      return payload.resumeUrl || null;

    case 'wedding':
    case 'birthday':
      return payload.rsvpUrl || null;

    case 'conference':
      return (
        payload.registerUrl ||
        payload.website ||
        null
      );

    case 'meetup':
      return payload.groupUrl || null;

    case 'seminar':
      return payload.registerUrl || null;

    // URI schemes
    case 'whatsapp':
    case 'telegram':
    case 'geo':
    case 'phone':
    case 'sms':
    case 'email':
      return buildQRValue(type, payload);

    // These are rendered as landing pages
    case 'vcard':
    case 'wifi':
    case 'text':
    case 'event':
    case 'medical_emergency':
    case 'pet_id':
    case 'gift_memories':
    case 'doorbell':
    case 'memorial':
    case 'lost_found':
    case 'rsvp':
      return null;

    default:
      return null;
  }
}

/**
 * QR types that are always rendered as a styled public landing page
 * (they never redirect straight to an external URL).
 */
export const LANDING_TYPES: QRType[] = [
  'vcard',
  'wifi',
  'text',
  'event',
  'medical_emergency',
  'pet_id',
  'gift_memories',
  'doorbell',
  'memorial',
  'lost_found',
  'rsvp',
];

export function isLandingType(type: QRType): boolean {
  return LANDING_TYPES.includes(type);
}

/** Whether a dynamic QR of this type redirects to an external destination. */
export function isRedirectType(type: QRType): boolean {
  return !isLandingType(type);
}

const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export function generateShortCode(length = 8): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}

export async function generateUniqueShortCode(
  checkFn: (code: string) => Promise<boolean>
): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const code = generateShortCode();
    const exists = await checkFn(code);
    if (!exists) return code;
  }
  throw new Error('Could not generate a unique short code after 10 attempts');
}
