import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { acceptInvite } from '@/lib/team/actions';

export async function POST(request: Request) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
        return NextResponse.json({ message: 'Missing token' }, { status: 400 });
    }

    const invite = await prisma.orgInvite.findUnique({
        where: { token },
        include: { org: { select: { name: true } } },
    });

    if (!invite || invite.accepted || invite.expiresAt < new Date()) {
        return NextResponse.json({ message: 'Invite link is expired or invalid.' }, { status: 400 });
    }

    try {
        await acceptInvite(token);
        return NextResponse.json({
            orgName: invite.org.name,
            role: invite.role,
        });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Mutation failed' }, { status: 500 });
    }
}
