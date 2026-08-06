'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { QrCode } from 'lucide-react';

// 1. Move the core form and hook logic into a separate inner component
function SignInFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const supabase = createBrowserSupabaseClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAuthHash = async () => {
      const hash = window.location.hash;
      if (!hash) return;

      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken && refreshToken) {
        setLoading(true);

        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        setLoading(false);

        if (error) {
          toast.error(`Session configuration failed: ${error.message}`);
          return;
        }

        toast.success('Successfully authenticated via invitation!');
        router.refresh();

        // --- NEW LOGIC: Extract token from the session metadata ---
        let finalRedirect = decodeURIComponent(redirect);

        // Supabase passes invitation metadata inside the user's user_metadata block
        const inviteToken = data?.user?.user_metadata?.invite_token;

        // If the path doesn't already have a token parameter, but we found one in metadata, append it
        if (inviteToken && !finalRedirect.includes('token=')) {
          const joinChar = finalRedirect.includes('?') ? '&' : '?';
          finalRedirect = `${finalRedirect}${joinChar}token=${inviteToken}`;
        }
        // ---------------------------------------------------------

        router.push(finalRedirect);
      }
    };

    checkAuthHash();
  }, [redirect, router, supabase]);

  // ------------------------------------------------------------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Welcome back!');
    const targetRoute = decodeURIComponent(redirect);
    router.refresh();
    setTimeout(() => {
      window.location.href = targetRoute;
    }, 50)
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Sign in</CardTitle>
        <CardDescription>Enter your credentials to access your dashboard</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/sign-up" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

// 2. The main default export handles the outer shell and wraps the form in Suspense
export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <QrCode className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight">QRNote</span>
          </Link>
        </div>

        {/* Wrap your dynamic content hook usage inside a Suspense boundary */}
        <Suspense fallback={
          <Card className="animate-pulse">
            <div className="h-[350px] rounded-lg bg-muted/40" />
          </Card>
        }>
          <SignInFormContent />
        </Suspense>
      </div>
    </div>
  );
}
