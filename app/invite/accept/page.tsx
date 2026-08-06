'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default function InviteAcceptPage({ searchParams }: Props) {
  // Unwrap searchParams using React.use() hook
  const { token } = use(searchParams);
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [orgName, setOrgName] = useState('');
  const [role, setRole] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const processInvitation = async () => {
      if (!token) {
        setErrorStatus('Invalid invite link — no token provided.');
        setLoading(false);
        return;
      }

      // 1. Check for incoming URL hashes and let Supabase establish the browser session
      const hash = window.location.hash;
      if (hash) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken) {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
        }
      }

      // 2. Check if user is now authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Safe Client redirect to sign-in without losing data context
        const destinationPath = `/invite/accept?token=${token}`;
        router.push(`/sign-in?redirect=${encodeURIComponent(destinationPath)}`);
        return;
      }

      // 3. Fetch invite status and accept it via your API or server action
      try {
        // Call a custom API route or your server action via fetch
        // (Tip: It's safest to wrap database mutations in a clean API route or fetch client-side wrapper)
        const response = await fetch(`/api/invite/accept?token=${token}`, { method: 'POST' });
        const resData = await response.json();

        if (!response.ok) {
          setErrorStatus(resData.message || 'Failed to accept the invite.');
          setLoading(false);
          return;
        }

        setOrgName(resData.orgName);
        setRole(resData.role);
        setSuccess(true);
      } catch (err: any) {
        setErrorStatus(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    processInvitation();
  }, [token, router, supabase]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
        <div className="text-center space-y-2">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground text-sm">Processing invitation security tokens...</p>
        </div>
      </div>
    );
  }

  if (errorStatus) {
    return <ErrorState message={errorStatus} />;
  }

  if (success) {
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
              <span className="font-medium text-foreground">{orgName}</span> as a{' '}
              <span className="font-medium text-foreground capitalize">{role}</span>.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Button asChild className="w-full">
              <Link href="/invite/set-password">Set Account Password</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
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
            <Link href="/sign-in">Go to Login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
