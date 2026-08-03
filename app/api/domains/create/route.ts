import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateVerificationToken } from '@/lib/domain-verification';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { requireSuperAdmin } from '@/lib/rbac';

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await requireSuperAdmin(user.id);

    const body = await req.json();
    const { workspaceId, domain } = body;
    if (!workspaceId || !domain) return NextResponse.json({ error: 'workspaceId and domain required' }, { status: 400 });

    const token = generateVerificationToken();
    const cd = await prisma.customDomain.create({ data: { workspaceId, domain: domain.toLowerCase(), verificationToken: token, verified: false } });

    return NextResponse.json({ ok: true, domain: cd, dnsRecord: `Add TXT record for ${domain}: qrnote-verification=${token}` });
  } catch (err: any) {
    console.error('create domain error', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
