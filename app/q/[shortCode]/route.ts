import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseUserAgent } from '@/lib/utils';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ shortCode: string }> }
) {
  const { shortCode } = await context.params;
  const qr = await prisma.qrCode.findUnique({
    where: { shortCode: shortCode },
    select: { id: true, type: true, isDynamic: true, destinationUrl: true, status: true },
  });

  if (!qr) {
    return new NextResponse('QR code not found', { status: 404 });
  }

  if (qr.status !== 'active') {
    return new NextResponse('This QR code is paused.', { status: 410 });
  }

  if (!qr.isDynamic || !qr.destinationUrl) {
    return new NextResponse('No destination configured for this QR code.', {
      status: 400,
    });
  }

  const headers = req.headers;
  const ua = headers.get('user-agent') || '';
  const { browser, os, device } = parseUserAgent(ua);
  const lang = headers.get('accept-language')?.split(',')[0] || '';
  const referrer = headers.get('referer') || '';
  const url = new URL(req.url);
  const utmSource = url.searchParams.get('utm_source') || null;
  const utmMedium = url.searchParams.get('utm_medium') || null;
  const utmCampaign = url.searchParams.get('utm_campaign') || null;

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
      data: { scanCount: { increment: 1 } },
    }),
  ]);

  return NextResponse.redirect(qr.destinationUrl, { status: 302 });
}

