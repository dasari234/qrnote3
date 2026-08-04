import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { lookupIp } from '@/lib/geoip';
import crypto from 'crypto';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const qrId = url.searchParams.get('qrId');
    const shortCode = url.searchParams.get('shortCode');
    const utm_source = url.searchParams.get('utm_source') || null;
    const utm_medium = url.searchParams.get('utm_medium') || null;
    const utm_campaign = url.searchParams.get('utm_campaign') || null;

    // Resolve qrId if shortCode provided
    let resolvedQrId = qrId;
    if (!resolvedQrId && shortCode) {
      const qr = await prisma.qrCode.findUnique({ where: { shortCode } });
      if (qr) resolvedQrId = qr.id;
    }

    if (!resolvedQrId) {
      return NextResponse.json({ ok: false, error: 'qrId or shortCode required' }, { status: 400 });
    }

    // Extract IP (X-Forwarded-For preferred)
    const forwarded = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
    const ip = forwarded.split(',')[0].trim() || null;

    // Hash IP with optional salt
    const salt = process.env.IP_HASH_SALT || '';
    const ipHash = ip ? crypto.createHash('sha256').update(ip + salt).digest('hex') : null;

    const ua = req.headers.get('user-agent') || null;
    const referrer = req.headers.get('referer') || null;
    const acceptLang = req.headers.get('accept-language') || null;
    const language = acceptLang ? acceptLang.split(',')[0] : null;

    const geo = lookupIp(ip);

    const scan = await prisma.scanEvent.create({
      data: {
        qrId: resolvedQrId,
        ipHash: ipHash,
        country: geo?.country || null,
        region: geo?.region || null,
        city: geo?.city || null,
        userAgent: ua,
        referrer: referrer,
        language: language,
        utmSource: utm_source,
        utmMedium: utm_medium,
        utmCampaign: utm_campaign,
      },
    });

    return NextResponse.json({ ok: true, scanId: scan.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: 'internal' }, { status: 500 });
  }
}
