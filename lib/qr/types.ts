import { QRType } from '@/lib/types';

export interface QRTypeDefinition {
  type: QRType;
  label: string;
  description: string;
  icon: string;
  category: 'link' | 'contact' | 'media' | 'social';
  fields: QRField[];
}

export interface QRField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'url' | 'select' | 'password';
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  helpText?: string;
}

export const QR_TYPES: QRTypeDefinition[] = [
  {
    type: 'url',
    label: 'URL',
    description: 'Link to any website',
    icon: 'Link',
    category: 'link',
    fields: [
      { key: 'url', label: 'Destination URL', type: 'url', placeholder: 'https://example.com', required: true },
    ],
  },
  {
    type: 'text',
    label: 'Text',
    description: 'Plain text message',
    icon: 'Type',
    category: 'link',
    fields: [
      { key: 'text', label: 'Text content', type: 'textarea', placeholder: 'Enter your text', required: true },
    ],
  },
  {
    type: 'email',
    label: 'Email',
    description: 'Pre-filled email message',
    icon: 'Mail',
    category: 'contact',
    fields: [
      { key: 'email', label: 'Email address', type: 'text', placeholder: 'hello@example.com', required: true },
      { key: 'subject', label: 'Subject', type: 'text', placeholder: 'Subject line' },
      { key: 'body', label: 'Message', type: 'textarea', placeholder: 'Email body' },
    ],
  },
  {
    type: 'phone',
    label: 'Phone',
    description: 'Click-to-call number',
    icon: 'Phone',
    category: 'contact',
    fields: [
      { key: 'phone', label: 'Phone number', type: 'text', placeholder: '+1 555 000 0000', required: true },
    ],
  },
  {
    type: 'sms',
    label: 'SMS',
    description: 'Pre-filled text message',
    icon: 'MessageSquare',
    category: 'contact',
    fields: [
      { key: 'phone', label: 'Phone number', type: 'text', placeholder: '+1 555 000 0000', required: true },
      { key: 'message', label: 'Message', type: 'textarea', placeholder: 'SMS body' },
    ],
  },
  {
    type: 'wifi',
    label: 'Wi-Fi',
    description: 'Connect to a network',
    icon: 'Wifi',
    category: 'contact',
    fields: [
      { key: 'ssid', label: 'Network name (SSID)', type: 'text', placeholder: 'MyNetwork', required: true },
      {
        key: 'encryption',
        label: 'Encryption',
        type: 'select',
        options: [
          { label: 'WPA/WPA2', value: 'WPA' },
          { label: 'WEP', value: 'WEP' },
          { label: 'None (Open)', value: 'nopass' },
        ],
      },
      { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
      { key: 'hidden', label: 'Hidden network?', type: 'select', options: [{ label: 'No', value: 'false' }, { label: 'Yes', value: 'true' }] },
    ],
  },
  {
    type: 'vcard',
    label: 'vCard',
    description: 'Contact card',
    icon: 'Contact',
    category: 'contact',
    fields: [
      { key: 'firstName', label: 'First name', type: 'text', placeholder: 'Jane', required: true },
      { key: 'lastName', label: 'Last name', type: 'text', placeholder: 'Doe' },
      { key: 'phone', label: 'Phone', type: 'text', placeholder: '+1 555 000 0000' },
      { key: 'email', label: 'Email', type: 'text', placeholder: 'jane@example.com' },
      { key: 'org', label: 'Organization', type: 'text', placeholder: 'Company Inc.' },
      { key: 'title', label: 'Job title', type: 'text', placeholder: 'Product Manager' },
      { key: 'url', label: 'Website', type: 'url', placeholder: 'https://jane.example.com' },
    ],
  },
  {
    type: 'pdf',
    label: 'PDF',
    description: 'Link to a PDF document',
    icon: 'FileText',
    category: 'media',
    fields: [
      { key: 'url', label: 'PDF URL', type: 'url', placeholder: 'https://example.com/doc.pdf', required: true },
    ],
  },
  {
    type: 'image',
    label: 'Image',
    description: 'Link to an image',
    icon: 'Image',
    category: 'media',
    fields: [
      { key: 'url', label: 'Image URL', type: 'url', placeholder: 'https://example.com/pic.jpg', required: true },
    ],
  },
  {
    type: 'social',
    label: 'Social Links',
    description: 'All your social profiles',
    icon: 'Share2',
    category: 'social',
    fields: [
      { key: 'url', label: 'Social landing URL', type: 'url', placeholder: 'https://linktr.ee/you', required: true },
    ],
  },
  {
    type: 'review',
    label: 'Google Review',
    description: 'Collect Google reviews',
    icon: 'Star',
    category: 'social',
    fields: [
      { key: 'url', label: 'Review URL', type: 'url', placeholder: 'https://g.page/r/...', required: true },
    ],
  },
  {
    type: 'event',
    label: 'Event',
    description: 'Calendar event (vCS)',
    icon: 'Calendar',
    category: 'social',
    fields: [
      { key: 'title', label: 'Event title', type: 'text', placeholder: 'My Event', required: true },
      { key: 'location', label: 'Location', type: 'text', placeholder: 'Venue' },
      { key: 'start', label: 'Start (ISO 8601)', type: 'text', placeholder: '20260101T100000', helpText: 'Format: YYYYMMDDTHHMMSS' },
      { key: 'end', label: 'End (ISO 8601)', type: 'text', placeholder: '20260101T110000', helpText: 'Format: YYYYMMDDTHHMMSS' },
    ],
  },
  {
    type: 'menu',
    label: 'Menu',
    description: 'Digital restaurant menu',
    icon: 'UtensilsCrossed',
    category: 'media',
    fields: [
      { key: 'url', label: 'Menu URL', type: 'url', placeholder: 'https://example.com/menu', required: true },
    ],
  },
  {
    type: 'video',
    label: 'Video',
    description: 'Link to a video',
    icon: 'Video',
    category: 'media',
    fields: [
      { key: 'url', label: 'Video URL', type: 'url', placeholder: 'https://youtube.com/...', required: true },
    ],
  },
];

export function getQRTypeDefinition(type: QRType): QRTypeDefinition | undefined {
  return QR_TYPES.find((t) => t.type === type);
}

export const QR_TYPE_CATEGORIES = [
  { id: 'link', label: 'Links' },
  { id: 'contact', label: 'Contact' },
  { id: 'media', label: 'Media' },
  { id: 'social', label: 'Social' },
] as const;
