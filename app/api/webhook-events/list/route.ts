import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/rbac";

export async function GET() {
  return NextResponse.json({ ok: false, error: "Use POST with admin auth" }, { status: 405 });
}

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await requireSuperAdmin(user.id);

    const body = await req.json();
    const { page = 1, perPage = 50 } = body;

    const events = await prisma.webhookEvent.findMany({ orderBy: { receivedAt: 'desc' }, take: perPage, skip: (page-1)*perPage });
    return NextResponse.json({ ok: true, events });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ ok: false, error: err.message || 'Server error' }, { status: 500 });
  }
}
