import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const templates = await prisma.template.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ ok: true, templates });
  } catch (err: any) {
    console.error('list templates error', err);
    return NextResponse.json({ ok: false, error: err.message || 'Server error' }, { status: 500 });
  }
}
