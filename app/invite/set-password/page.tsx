'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { Eye, EyeOff } from 'lucide-react'; // Imported icons
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function SetPasswordPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Visibility state
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  const handleSetPassword = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!firstName.trim()) {
      toast.error('First name is required.');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const fullName = trimmedLast ? `${trimmedFirst} ${trimmedLast}` : trimmedFirst;

    const { error } = await supabase.auth.updateUser({
      password,
      data: {
        first_name: trimmedFirst,
        last_name: trimmedLast || null,
        full_name: fullName,
      },
    });

    setLoading(true);

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success('Registration complete! Welcome to QRNote.');
    router.refresh();
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-center">Complete Your Profile</CardTitle>
          <CardDescription className="text-center">
            Enter your details and choose a secure password to access your QRNote account.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSetPassword}>
          <CardContent className="space-y-4">
            {/* First Name Input - Mandatory */}
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>

            {/* Last Name Input - Optional */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="lastName">Last Name</Label>
                <span className="text-xs text-muted-foreground">Optional</span>
              </div>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe (optional)"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            {/* Password Input with Toggle Icon */}
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Saving...' : 'Complete Registration'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
