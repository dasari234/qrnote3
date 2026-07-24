/**
 * Pure helpers for reading/writing the extra QR metadata that we store
 * inside the existing `payload` JSON column (under reserved keys prefixed
 * with `_`). This keeps advanced features working without a schema change.
 *
 * Reserved payload keys:
 *   _ab        -> A/B testing / URL rotation config
 *   _expiresAt -> ISO datetime string after which the QR is expired
 *
 * This module is intentionally free of server-only imports so it can be
 * used from client components too.
 */

export interface AbVariant {
  id: string;
  label: string;
  url: string;
  weight: number;
  scans: number;
}

export interface AbConfig {
  enabled: boolean;
  variants: AbVariant[];
}

export const AB_KEY = '_ab';
export const EXPIRES_KEY = '_expiresAt';

/** Keys that are metadata rather than user-entered QR content. */
export const RESERVED_PAYLOAD_KEYS = [AB_KEY, EXPIRES_KEY];

/** Strip reserved metadata keys, leaving only user-facing content. */
export function stripReservedKeys(
  payload: Record<string, any> | null | undefined
): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(payload || {})) {
    if (!RESERVED_PAYLOAD_KEYS.includes(k)) out[k] = v;
  }
  return out;
}

export function getAbConfig(
  payload: Record<string, any> | null | undefined
): AbConfig | null {
  const raw = payload?.[AB_KEY];
  if (!raw || typeof raw !== 'object') return null;
  const variants: AbVariant[] = Array.isArray(raw.variants)
    ? raw.variants
        .filter((v: any) => v && typeof v === 'object')
        .map((v: any, i: number) => ({
          id: String(v.id ?? `v${i}`),
          label: String(v.label ?? `Variant ${i + 1}`),
          url: String(v.url ?? ''),
          weight: Number.isFinite(Number(v.weight)) ? Number(v.weight) : 0,
          scans: Number.isFinite(Number(v.scans)) ? Number(v.scans) : 0,
        }))
    : [];
  return { enabled: !!raw.enabled, variants };
}

export function getExpiresAt(
  payload: Record<string, any> | null | undefined
): Date | null {
  const raw = payload?.[EXPIRES_KEY];
  if (!raw || typeof raw !== 'string') return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

export function isExpired(
  payload: Record<string, any> | null | undefined,
  now: Date = new Date()
): boolean {
  const expiresAt = getExpiresAt(payload);
  return !!expiresAt && now.getTime() > expiresAt.getTime();
}

/**
 * Deterministic-ish weighted random pick across active variants (those with
 * a non-empty url and positive weight). Returns the index into the full
 * variants array, or -1 when nothing is selectable.
 */
export function pickWeightedVariantIndex(
  variants: AbVariant[],
  rand: number = Math.random()
): number {
  const eligible = variants
    .map((v, i) => ({ v, i }))
    .filter(({ v }) => v.url.trim() !== '' && v.weight > 0);
  if (eligible.length === 0) return -1;

  const total = eligible.reduce((sum, { v }) => sum + v.weight, 0);
  let threshold = rand * total;
  for (const { v, i } of eligible) {
    threshold -= v.weight;
    if (threshold <= 0) return i;
  }
  return eligible[eligible.length - 1].i;
}

/** True when the A/B config has at least one usable variant. */
export function abHasActiveVariants(config: AbConfig | null): boolean {
  if (!config || !config.enabled) return false;
  return config.variants.some((v) => v.url.trim() !== '' && v.weight > 0);
}

const SLUG_REGEX = /^[A-Za-z0-9_-]{3,48}$/;

/** Validate a user-supplied vanity short code. Returns an error message or null. */
export function validateSlug(slug: string): string | null {
  if (!SLUG_REGEX.test(slug)) {
    return 'Use 3–48 letters, numbers, hyphens or underscores (no spaces).';
  }
  const reserved = ['preview', 'new', 'api', 'q', 'dashboard'];
  if (reserved.includes(slug.toLowerCase())) {
    return 'That code is reserved. Please choose another.';
  }
  return null;
}
