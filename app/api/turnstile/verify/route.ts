import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = String(body.token || '');
    if (!token) return NextResponse.json({ success: false, error: 'token is required' }, { status: 400 });

    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) return NextResponse.json({ success: false, error: 'server misconfigured' }, { status: 500 });

    const params = new URLSearchParams();
    params.append('secret', secret);
    params.append('response', token);

    // Include remoteip for stricter verification if available (from reverse proxy / client)
    const forwarded = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
    const ip = forwarded.split(',')[0].trim();
    if (ip) params.append('remoteip', ip);

    const verify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: params,
    });

    const json = await verify.json();
    // json.success is a boolean
    return NextResponse.json(json);
  } catch (e) {
    console.error('turnstile verify error', e);
    return NextResponse.json({ success: false, error: 'internal' }, { status: 500 });
  }
}
