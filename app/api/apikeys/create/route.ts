import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { description } = body;

    const key = cryptoRandomKey();
    const apiKey = await prisma.apiKey.create({ data: { userId: user.id, key, description } });
    return NextResponse.json({ ok: true, apiKey: { id: apiKey.id, key: apiKey.key } });
  } catch (err: any) {
    console.error('create api key error', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

function cryptoRandomKey() {
  return require('crypto').randomBytes(24).toString('hex');
}
