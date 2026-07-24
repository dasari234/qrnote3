import { prisma } from '@/lib/prisma';
import { parseUserAgent } from '@/lib/utils';
import { resolveDestination } from '@/lib/qr/factory';
import {
  AB_KEY,
  abHasActiveVariants,
  getAbConfig,
  pickWeightedVariantIndex,
} from '@/lib/qr/meta';
import { QRType } from '@/lib/types';

export type ScanDecision =
  | { kind: 'redirect'; url: string }
  | { kind: 'landing' };

interface ScanQr {
  id: string;
  type: string;
  isDynamic: boolean;
  destinationUrl: string | null;
  payload: any;
}

/**
 * Records a scan event, picks an A/B variant (when configured), increments
 * counters, and returns whether the caller should redirect or render a
 * landing page. Kept out of the page render path's try/catch so `redirect`
 * can be called safely by the caller afterwards.
 */
export async function recordScanAndResolve(
  qr: ScanQr,
  req: { headers: Headers; url: string }
): Promise<ScanDecision> {
  const { headers, url } = req;
  const ua = headers.get('user-agent') || '';
  const { browser, os, device } = parseUserAgent(ua);
  const lang = headers.get('accept-language')?.split(',')[0] || '';
  const referrer = headers.get('referer') || '';
  const parsedUrl = new URL(url);
  const utmSource = parsedUrl.searchParams.get('utm_source');
  const utmMedium = parsedUrl.searchParams.get('utm_medium');
  const utmCampaign = parsedUrl.searchParams.get('utm_campaign');

  let decision: ScanDecision = { kind: 'landing' };
  let updatedPayload: Record<string, any> | null = null;

  // 1. A/B rotation for dynamic redirect QRs
  const abConfig = getAbConfig(qr.payload);
  if (qr.isDynamic && abHasActiveVariants(abConfig)) {
    const idx = pickWeightedVariantIndex(abConfig!.variants);
    if (idx >= 0) {
      const variant = abConfig!.variants[idx];
      const variants = abConfig!.variants.map((v, i) =>
        i === idx ? { ...v, scans: v.scans + 1 } : v
      );
      updatedPayload = {
        ...(qr.payload || {}),
        [AB_KEY]: { ...abConfig, variants },
      };
      decision = { kind: 'redirect', url: variant.url };
    }
  }

  // 2. Fall back to the single configured destination
  if (decision.kind === 'landing' && qr.isDynamic) {
    const dest =
      qr.destinationUrl ||
      resolveDestination(qr.type as QRType, qr.payload || {});
    if (dest) decision = { kind: 'redirect', url: dest };
  }

  await Promise.allSettled([
    prisma.scanEvent.create({
      data: {
        qrId: qr.id,
        browser,
        os,
        device,
        language: lang,
        referrer,
        userAgent: ua,
        utmSource,
        utmMedium,
        utmCampaign,
      },
    }),
    prisma.qrCode.update({
      where: { id: qr.id },
      data: {
        scanCount: { increment: 1 },
        ...(updatedPayload ? { payload: updatedPayload } : {}),
      },
    }),
  ]);

  return decision;
}
