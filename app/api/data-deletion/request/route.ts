import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email || '').trim().toLowerCase();
    const note = body.note ? String(body.note) : null;
    if (!email) return NextResponse.json({ ok: false, error: 'email required' }, { status: 400 });

    const forwarded = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
    const ip = forwarded.split(',')[0].trim() || null;
    const salt = process.env.IP_HASH_SALT || '';
    const ipHash = ip ? crypto.createHash('sha256').update(ip + salt).digest('hex') : null;

    const created = await prisma.dataDeletionRequest.create({
      data: {
        requesterEmail: email,
        requesterIpHash: ipHash,
        note,
      },
    });

    return NextResponse.json({ ok: true, id: created.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: 'internal' }, { status: 500 });
  }
}
