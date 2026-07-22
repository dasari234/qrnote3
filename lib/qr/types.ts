import { QRType } from '@/lib/types';

export interface QRTypeDefinition {
  type: QRType;
  label: string;
  description: string;
  icon: string;
  category: 'link' | 'contact' | 'media' | 'social' | 'personal' | 'business' | 'events' | 'healthcare' | 'pets';
  fields: QRField[];
}

export interface QRField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'url' | 'select' | 'password' | 'email' | 'tel' | 'datetime-local' | 'date';
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
    type: 'app',
    label: 'App Download',
    description: 'Link to app store listing',
    icon: 'Smartphone',
    category: 'link',
    fields: [
      { key: 'url', label: 'App store URL', type: 'url', placeholder: 'https://apps.apple.com/...', required: true },
    ],
  },
  {
    type: 'geo',
    label: 'Location',
    description: 'GPS coordinates',
    icon: 'MapPin',
    category: 'link',
    fields: [
      { key: 'lat', label: 'Latitude', type: 'text', placeholder: '40.7128', required: true },
      { key: 'lng', label: 'Longitude', type: 'text', placeholder: '-74.0060', required: true },
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
    type: 'whatsapp',
    label: 'WhatsApp',
    description: 'Open a WhatsApp chat',
    icon: 'MessageCircle',
    category: 'contact',
    fields: [
      { key: 'phone', label: 'Phone number', type: 'text', placeholder: '+1 555 000 0000', required: true, helpText: 'Include country code, no spaces' },
      { key: 'message', label: 'Pre-filled message', type: 'textarea', placeholder: 'Hi there!' },
    ],
  },
  {
    type: 'telegram',
    label: 'Telegram',
    description: 'Open a Telegram chat',
    icon: 'Send',
    category: 'contact',
    fields: [
      { key: 'username', label: 'Telegram username', type: 'text', placeholder: '@username', required: true },
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
  {
    type: 'catalog', label: 'Catalog', description: 'Product catalog link', icon: 'BookOpen', category: 'media',
    fields: [
      { key: 'title', label: 'Catalog Title', type: 'text', required: true },
      { key: 'catalogUrl', label: 'Catalog URL', type: 'url', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
    ],
  },
  {
    type: 'product', label: 'Product', description: 'Product information page', icon: 'Package', category: 'media',
    fields: [
      { key: 'name', label: 'Product Name', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'price', label: 'Price', type: 'text', placeholder: '$29.99' },
      { key: 'productUrl', label: 'Product URL', type: 'url', required: true },
      { key: 'imageUrl', label: 'Image URL', type: 'url' },
    ],
  },
  {
    type: 'resume', label: 'Resume', description: 'Share your resume with recruiters', icon: 'FileText', category: 'personal',
    fields: [
      { key: 'fullName', label: 'Full Name', type: 'text', placeholder: 'Jane Doe', required: true },
      { key: 'title', label: 'Professional Title', type: 'text', placeholder: 'Senior Software Engineer', required: true },
      { key: 'summary', label: 'Summary', type: 'textarea', placeholder: 'Brief professional summary...' },
      { key: 'experience', label: 'Work Experience', type: 'textarea', placeholder: 'Company, Role, Years — one per line' },
      { key: 'education', label: 'Education', type: 'textarea', placeholder: 'University, Degree, Year — one per line' },
      { key: 'skills', label: 'Skills', type: 'text', placeholder: 'React, TypeScript, Node.js' },
      { key: 'resumeUrl', label: 'Resume PDF URL', type: 'url', placeholder: 'https://...' },
      { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
      { key: 'phone', label: 'Phone', type: 'tel', placeholder: '+1 555 000 0000' },
      { key: 'linkedin', label: 'LinkedIn URL', type: 'url', placeholder: 'https://linkedin.com/in/...' },
    ],
  },
  {
    type: 'portfolio', label: 'Portfolio', description: 'Showcase your work', icon: 'Briefcase', category: 'personal',
    fields: [
      { key: 'name', label: 'Your Name', type: 'text', required: true },
      { key: 'tagline', label: 'Tagline', type: 'text', placeholder: 'Designer & Developer' },
      { key: 'bio', label: 'Bio', type: 'textarea' },
      { key: 'portfolioUrl', label: 'Portfolio URL', type: 'url', required: true, placeholder: 'https://...' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'behance', label: 'Behance', type: 'url' },
      { key: 'dribbble', label: 'Dribbble', type: 'url' },
    ],
  },
  {
    type: 'wedding', label: 'Wedding', description: 'Wedding invitation page', icon: 'Heart', category: 'events',
    fields: [
      { key: 'coupleNames', label: 'Couple Names', type: 'text', required: true, placeholder: 'Jane & John' },
      { key: 'date', label: 'Wedding Date', type: 'datetime-local', required: true },
      { key: 'venue', label: 'Venue', type: 'text' },
      { key: 'address', label: 'Address', type: 'text' },
      { key: 'details', label: 'Details', type: 'textarea' },
      { key: 'rsvpUrl', label: 'RSVP URL', type: 'url' },
      { key: 'dressCode', label: 'Dress Code', type: 'text' },
      { key: 'giftRegistryUrl', label: 'Gift Registry URL', type: 'url' },
    ],
  },
  {
    type: 'birthday', label: 'Birthday', description: 'Birthday party invitation', icon: 'Cake', category: 'events',
    fields: [
      { key: 'title', label: 'Event Title', type: 'text', required: true, placeholder: 'Jane\'s 30th Birthday' },
      { key: 'date', label: 'Date & Time', type: 'datetime-local', required: true },
      { key: 'location', label: 'Location', type: 'text' },
      { key: 'details', label: 'Details', type: 'textarea' },
      { key: 'rsvpUrl', label: 'RSVP URL', type: 'url' },
    ],
  },
  {
    type: 'rsvp', label: 'RSVP', description: 'RSVP form for any event', icon: 'ClipboardCheck', category: 'events',
    fields: [
      { key: 'eventName', label: 'Event Name', type: 'text', required: true },
      { key: 'date', label: 'Event Date', type: 'datetime-local', required: true },
      { key: 'location', label: 'Location', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'contactPhone', label: 'Contact Phone', type: 'tel' },
      { key: 'contactEmail', label: 'Contact Email', type: 'email' },
    ],
  },
  {
    type: 'conference', label: 'Conference', description: 'Conference info & schedule', icon: 'Users', category: 'events',
    fields: [
      { key: 'name', label: 'Conference Name', type: 'text', required: true },
      { key: 'date', label: 'Date', type: 'datetime-local', required: true },
      { key: 'location', label: 'Location', type: 'text' },
      { key: 'schedule', label: 'Schedule', type: 'textarea', placeholder: '9:00 Keynote, 10:00 Session 1...' },
      { key: 'website', label: 'Website', type: 'url' },
      { key: 'registerUrl', label: 'Registration URL', type: 'url' },
    ],
  },
  {
    type: 'meetup', label: 'Meetup', description: 'Meetup group info', icon: 'Users', category: 'events',
    fields: [
      { key: 'name', label: 'Meetup Name', type: 'text', required: true },
      { key: 'date', label: 'Date & Time', type: 'datetime-local', required: true },
      { key: 'location', label: 'Location', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'groupUrl', label: 'Group URL', type: 'url' },
    ],
  },
  {
    type: 'seminar', label: 'Seminar', description: 'Seminar info & registration', icon: 'GraduationCap', category: 'events',
    fields: [
      { key: 'title', label: 'Seminar Title', type: 'text', required: true },
      { key: 'speaker', label: 'Speaker', type: 'text' },
      { key: 'date', label: 'Date & Time', type: 'datetime-local', required: true },
      { key: 'location', label: 'Location', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'registerUrl', label: 'Registration URL', type: 'url' },
    ],
  },
  {
    type: 'medical_emergency', label: 'Medical Emergency Card', description: 'Emergency medical info accessible by scanning', icon: 'HeartPulse', category: 'personal',
    fields: [
      { key: 'fullName', label: 'Full Name', type: 'text', required: true },
      { key: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
      { key: 'bloodGroup', label: 'Blood Group', type: 'select', options: [
        { value: '', label: 'Unknown' }, { value: 'A+', label: 'A+' }, { value: 'A-', label: 'A-' },
        { value: 'B+', label: 'B+' }, { value: 'B-', label: 'B-' },
        { value: 'AB+', label: 'AB+' }, { value: 'AB-', label: 'AB-' },
        { value: 'O+', label: 'O+' }, { value: 'O-', label: 'O-' },
      ] },
      { key: 'allergies', label: 'Allergies', type: 'textarea', placeholder: 'Penicillin, Peanuts, Latex...' },
      { key: 'medications', label: 'Current Medications', type: 'textarea' },
      { key: 'medicalHistory', label: 'Medical History', type: 'textarea', placeholder: 'Diabetes, Hypertension...' },
      { key: 'doctor', label: 'Doctor Name & Phone', type: 'text' },
      { key: 'insurance', label: 'Insurance Info', type: 'text' },
      { key: 'organDonor', label: 'Organ Donor', type: 'select', options: [{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }] },
      { key: 'emergencyContact1Name', label: 'Emergency Contact 1 Name', type: 'text' },
      { key: 'emergencyContact1Phone', label: 'Emergency Contact 1 Phone', type: 'tel' },
      { key: 'emergencyContact2Name', label: 'Emergency Contact 2 Name', type: 'text' },
      { key: 'emergencyContact2Phone', label: 'Emergency Contact 2 Phone', type: 'tel' },
      { key: 'hospitalAddress', label: 'Preferred Hospital Address', type: 'text', helpText: 'For "Navigate to Hospital" button' },
    ],
  },
  {
    type: 'pet_id', label: 'Pet ID', description: 'Pet identification & recovery info', icon: 'PawPrint', category: 'personal',
      fields: [
        { key: 'petName', label: 'Pet Name', type: 'text', required: true },
        { key: 'species', label: 'Species', type: 'text', placeholder: 'Dog, Cat, Bird...' },
        { key: 'breed', label: 'Breed', type: 'text' },
        { key: 'age', label: 'Age', type: 'text' },
        { key: 'color', label: 'Color / Markings', type: 'text' },
        { key: 'vaccinations', label: 'Vaccinations', type: 'textarea', placeholder: 'Rabies (2024), DHPP (2024)...' },
        { key: 'medicalNotes', label: 'Medical Notes', type: 'textarea' },
        { key: 'ownerName', label: 'Owner Name', type: 'text', required: true },
        { key: 'ownerPhone', label: 'Owner Phone', type: 'tel', required: true },
        { key: 'ownerEmail', label: 'Owner Email', type: 'email' },
        { key: 'ownerAddress', label: 'Owner Address', type: 'text' },
        { key: 'reward', label: 'Reward Information', type: 'text', placeholder: '$500 reward for safe return' },
        { key: 'lostStatus', label: 'Lost Status', type: 'select', options: [{ value: 'safe', label: 'Safe at Home' }, { value: 'lost', label: 'LOST — Please Help!' }] },
      ],
  },
  {
    type: 'gift_memories', label: 'Gift Memories', description: 'Video, photos, playlist & love letter in one scan', icon: 'Gift', category: 'personal',
    fields: [
      { key: 'title', label: 'Gift Title', type: 'text', required: true, placeholder: 'Happy Birthday Sarah!' },
      { key: 'recipient', label: 'Recipient', type: 'text' },
      { key: 'videoUrl', label: 'Video Message URL', type: 'url', placeholder: 'YouTube, Vimeo...' },
      { key: 'photoAlbumUrl', label: 'Photo Album URL', type: 'url', placeholder: 'Google Photos, Flickr...' },
      { key: 'playlistUrl', label: 'Playlist URL', type: 'url', placeholder: 'Spotify, Apple Music...' },
      { key: 'loveLetter', label: 'Love Letter / Message', type: 'textarea' },
      { key: 'timeline', label: 'Memory Timeline', type: 'textarea', placeholder: '2019 First met, 2020 First trip...' },
    ],
  },
  {
    type: 'doorbell', label: 'Smart Doorbell', description: 'Visitor info, delivery notes & contact', icon: 'Home', category: 'personal',
    fields: [
      { key: 'householdName', label: 'Household Name', type: 'text', required: true, placeholder: 'The Smith Residence' },
      { key: 'ownerName', label: 'Owner Name', type: 'text', required: true },
      { key: 'ownerPhone', label: 'Owner Phone', type: 'tel', required: true },
      { key: 'ownerEmail', label: 'Owner Email', type: 'email' },
      { key: 'deliveryNotes', label: 'Delivery Instructions', type: 'textarea', placeholder: 'Leave packages at the back door' },
      { key: 'visitorMessage', label: 'Visitor Message', type: 'textarea', placeholder: 'Hi! Please ring the bell or call...' },
      { key: 'parkingInstructions', label: 'Parking Instructions', type: 'text' },
      { key: 'appointmentUrl', label: 'Appointment Booking URL', type: 'url' },
    ],
  },
  {
    type: 'memorial', label: 'Memorial Page', description: 'Honor a loved one with biography, gallery & stories', icon: 'Flower2', category: 'personal',
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'birthYear', label: 'Birth Year', type: 'text' },
      { key: 'deathYear', label: 'Passing Year', type: 'text' },
      { key: 'biography', label: 'Biography', type: 'textarea' },
      { key: 'familyTree', label: 'Family Tree', type: 'textarea', placeholder: 'Spouse, Children, Parents...' },
      { key: 'galleryUrl', label: 'Photo Gallery URL', type: 'url' },
      { key: 'videoUrl', label: 'Video URL', type: 'url' },
      { key: 'stories', label: 'Stories & Memories', type: 'textarea' },
      { key: 'donationsUrl', label: 'Donations URL', type: 'url', helpText: 'Charity or memorial fund' },
    ],
  },
  {
    type: 'lost_found', label: 'Lost & Found', description: 'Recover lost items & pets', icon: 'Search', category: 'personal',
    fields: [
      { key: 'itemName', label: 'Item Name', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'select', options: [
        { value: 'helmet', label: 'Helmet' }, { value: 'luggage', label: 'Luggage' },
        { value: 'pet_collar', label: 'Pet Collar' }, { value: 'keys', label: 'Keys' },
        { value: 'electronics', label: 'Electronics' }, { value: 'bicycle', label: 'Bicycle' },
        { value: 'other', label: 'Other' },
      ] },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'contactPhone', label: 'Contact Phone', type: 'tel' },
      { key: 'contactEmail', label: 'Contact Email', type: 'email' },
      { key: 'contactMessage', label: 'Message to Finder', type: 'textarea' },
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
  { id: 'personal', label: 'Personal' },
  { id: 'events', label: 'Events' },
] as const;
