import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { requireSuperAdmin } from '@/lib/rbac';

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await requireSuperAdmin(user.id);

    const body = await req.json();
    const { title, description, content, price = 0, isPaid = false } = body;
    if (!title || !content) return NextResponse.json({ error: 'title and content required' }, { status: 400 });

    const t = await prisma.template.create({ data: { title, description, content, price, isPaid } });
    return NextResponse.json({ ok: true, template: t });
  } catch (err: any) {
    console.error('create template error', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
