'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/components/providers/auth-provider';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function SettingsPage() {
  const { user } = useAuth();
  const supabase = createBrowserSupabaseClient();
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', user!.id);
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success('Profile updated');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account preferences</p>
      </div>

      <Card className="max-w-lg bg-card text-card-foreground border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Profile</CardTitle>
          <CardDescription className="text-muted-foreground">Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
            <Input
              id="email"
              value={user?.email || ''}
              disabled
              className="bg-muted text-muted-foreground border-input opacity-70 cursor-not-allowed dark:bg-muted/40"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-foreground font-medium">Full name</Label>
            <Input
              id="fullName"
              placeholder="e.g. John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="bg-background text-foreground border-input focus-visible:ring-ring placeholder:text-muted-foreground/50"
            />
          </div>
          <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto transition-colors">
            {loading ? 'Saving…' : 'Save changes'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
