export type QRType =
  | 'url'
  | 'text'
  | 'email'
  | 'phone'
  | 'sms'
  | 'whatsapp'
  | 'telegram'
  | 'wifi'
  | 'vcard'
  | 'pdf'
  | 'image'
  | 'social'
  | 'review'
  | 'event'
  | 'menu'
  | 'video'
  | 'app'
  | 'geo'
  | 'crypto'
  | 'paypal';

export type QRStatus = 'active' | 'paused' | 'archived';

export type DotType =
  | 'square'
  | 'rounded'
  | 'dots'
  | 'classy'
  | 'classy-rounded'
  | 'extra-rounded';

export type CornerSquareType = 'square' | 'dot' | 'extra-rounded';
export type CornerDotType = 'square' | 'dot';

export type GradientType = 'solid' | 'vertical' | 'horizontal' | 'diagonal' | 'radial';

export interface QRStyle {
  fgColor?: string;
  bgColor?: string;
  gradientType?: GradientType;
  gradientColor1?: string;
  gradientColor2?: string;
  logoUrl?: string;
  size?: number;
  margin?: number;
  errorCorrection?: 'L' | 'M' | 'Q' | 'H';
  frame?: 'none' | 'rounded' | 'border' | 'caption';
  frameColor?: string;
  caption?: string;
  dotsType?: DotType;
  cornerSquareType?: CornerSquareType;
  cornerDotType?: CornerDotType;
  templateId?: string;
}

export interface QRCode {
  id: string;
  workspace_id: string;
  folder_id: string | null;
  created_by: string;
  name: string;
  type: QRType;
  is_dynamic: boolean;
  short_code: string | null;
  destination_url: string | null;
  payload: Record<string, any>;
  style: QRStyle;
  status: QRStatus;
  scan_count: number;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  logo_url: string | null;
  created_at: string;
}

export interface Workspace {
  id: string;
  org_id: string;
  name: string;
  created_at: string;
}

export interface Folder {
  id: string;
  workspace_id: string;
  parent_id: string | null;
  name: string;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

export interface OrganizationMember {
  id: string;
  org_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  created_at: string;
}
