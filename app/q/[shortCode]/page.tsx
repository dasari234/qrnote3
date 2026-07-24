import { PublicScanView } from '@/components/public/public-scan-view';
import {
  ExpiredState,
  NotFoundState,
  PausedState,
} from '@/components/public/scan-states';
import { prisma } from '@/lib/prisma';
import { isExpired } from '@/lib/qr/meta';
import { recordScanAndResolve } from '@/lib/qr/scan';
import { QRType } from '@/lib/types';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

// Always render dynamically — every scan records an event.
export const dynamic = 'force-dynamic';

export default async function PublicScanPage({
  params,
}: {
  params: Promise<{ shortCode: string }>;
}) {
  const { shortCode } = await params;

  const qr = await prisma.qrCode.findUnique({
    where: { shortCode },
    select: {
      id: true,
      name: true,
      type: true,
      isDynamic: true,
      destinationUrl: true,
      payload: true,
      status: true,
    },
  });

  if (!qr) return <NotFoundState />;
  if (qr.status !== 'active') return <PausedState />;

  const payload = (qr.payload as Record<string, any>) || {};
  if (isExpired(payload)) return <ExpiredState />;

  // Build the absolute request URL for UTM parsing / scan attribution.
  const headerList = await headers();
  const host = headerList.get('host') || 'localhost';
  const proto = headerList.get('x-forwarded-proto') || 'https';
  const url = `${proto}://${host}/q/${shortCode}`;

  const decision = await recordScanAndResolve(
    {
      id: qr.id,
      type: qr.type,
      isDynamic: qr.isDynamic,
      destinationUrl: qr.destinationUrl,
      payload,
    },
    { headers: headerList, url }
  );

  // redirect() throws NEXT_REDIRECT — keep it outside any try/catch.
  if (decision.kind === 'redirect') {
    redirect(decision.url);
  }

  return (
    <PublicScanView type={qr.type as QRType} payload={payload} name={qr.name} />
  );
}
