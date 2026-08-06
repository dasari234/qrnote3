import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkDomainDns } from '@/lib/domain-verification';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { requireSuperAdmin } from '@/lib/rbac';

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await requireSuperAdmin(user.id);

    const body = await req.json();
    const { domain } = body;
    if (!domain) return NextResponse.json({ error: 'domain required' }, { status: 400 });

    const cd = await prisma.customDomain.findUnique({ where: { domain: domain.toLowerCase() } });
    if (!cd) return NextResponse.json({ error: 'Domain not found' }, { status: 404 });

    const ok = await checkDomainDns(domain, cd.verificationToken);
    if (!ok) return NextResponse.json({ ok: false, verified: false, reason: 'DNS record not found' });

    const updated = await prisma.customDomain.update({ where: { id: cd.id }, data: { verified: true } });
    return NextResponse.json({ ok: true, verified: true, domain: updated });
  } catch (err: any) {
    console.error('verify domain error', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
