import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/rbac";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await requireSuperAdmin(user.id);

    const body = await req.json();
    const { code, type, amount, usageLimit, validFrom, validUntil } = body;
    if (!code || !type || typeof amount !== 'number') return NextResponse.json({ error: 'invalid' }, { status: 400 });

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        type,
        amount,
        usageLimit: usageLimit ?? null,
        validFrom: validFrom ? new Date(validFrom) : null,
        validUntil: validUntil ? new Date(validUntil) : null,
        active: true,
      }
    });

    return NextResponse.json({ ok: true, coupon });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ ok: false, error: err.message || 'Server error' }, { status: 500 });
  }
}
