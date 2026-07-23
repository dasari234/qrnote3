import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { acceptInvite } from '@/lib/team/actions';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2, XCircle, LogIn } from 'lucide-react';

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default async function InviteAcceptPage({ searchParams }: Props) {
  const { token } = await searchParams;

  if (!token) {
    return <ErrorState message="Invalid invite link — no token provided." />;
  }

  // Look up the invite
  const invite = await prisma.orgInvite.findUnique({
    where: { token },
    include: { org: { select: { name: true } } },
  });

  if (!invite) {
    return <ErrorState message="This invite link is invalid or has already been used." />;
  }

  if (invite.accepted) {
    return <ErrorState message="This invite has already been accepted." />;
  }

  if (invite.expiresAt < new Date()) {
    return <ErrorState message="This invite link has expired. Please ask for a new one." />;
  }

  // Check if the user is signed in
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Redirect to sign-in with a redirect back here
    redirect(`/sign-in?redirect=/invite/accept?token=${encodeURIComponent(token)}`);
  }

  // User is signed in — auto-accept
  try {
    await acceptInvite(token);
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md text-center shadow-sm">
          <CardHeader className="items-center pb-2">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-7 w-7 text-green-600" />
            </div>
            <CardTitle className="text-xl">You&apos;re in!</CardTitle>
            <CardDescription>
              You have successfully joined{' '}
              <span className="font-medium text-foreground">{invite.org.name}</span> as a{' '}
              <span className="font-medium text-foreground capitalize">{invite.role}</span>.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Button asChild className="w-full">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  } catch (err: any) {
    return <ErrorState message={err.message ?? 'Failed to accept the invite.'} />;
  }
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md text-center shadow-sm">
        <CardHeader className="items-center pb-2">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <XCircle className="h-7 w-7 text-destructive" />
          </div>
          <CardTitle className="text-xl">Invalid Invite</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <Button asChild variant="outline" className="w-full">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
