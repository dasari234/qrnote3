'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { Upload, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user } = useAuth();
  const supabase = createBrowserSupabaseClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState('');
  const [avatarBase64, setAvatarBase64] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // FIX 1: Watch the full lifecycle of the user object so it re-triggers when auth resolves
  useEffect(() => {
    if (!user?.id) return;

    const fetchProfileData = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading profile:', error.message);
        return;
      }

      // FIX 2: Gracefully fall back to user_metadata metadata if profiles record is empty
      if (data) {
        setFullName(data.full_name || user?.user_metadata?.full_name || '');
        if (data.avatar_url) {
          setAvatarBase64(data.avatar_url);
          setPreviewUrl(data.avatar_url);
        }
      } else {
        setFullName(user?.user_metadata?.full_name || '');
      }
    };

    fetchProfileData();
  }, [user, user?.id, supabase]); // Added user to dependency matrix

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const resultStr = reader.result as string;
      setPreviewUrl(resultStr);
      setAvatarBase64(resultStr);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!user?.id) {
      toast.error('You must be signed in.');
      return;
    }

    setLoading(true);

    // FIX 3: Use upsert instead of update so that if a profile row does not exist yet, it creates it automatically
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id, // Primary Key match anchor
        full_name: fullName.trim(),
        avatar_url: avatarBase64 || null,
        updated_at: new Date().toISOString()
      });

    setLoading(true);

    if (error) {
      toast.error(`Save failed: ${error.message}`);
    } else {
      toast.success('Profile updated successfully');
    }
    setLoading(false);
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
          <CardDescription className="text-muted-foreground">Update your personal information and avatar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">

          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
            <div className="relative group flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted dark:bg-muted/30">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="Avatar preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-10 w-10 text-muted-foreground/60" />
              )}
            </div>

            <div className="space-y-2 text-center sm:text-left">
              <Label className="text-foreground font-medium block">Profile Picture</Label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                id="avatar-upload"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2 border-input"
              >
                <Upload className="h-4 w-4" />
                Upload image
              </Button>
              <p className="text-[11px] text-muted-foreground">
                Max file size: 2MB. Image will convert automatically.
              </p>
            </div>
          </div>

          {/* Email read-only field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
            <Input
              id="email"
              value={user?.email || ''}
              disabled
              className="bg-muted text-muted-foreground border-input opacity-70 cursor-not-allowed dark:bg-muted/40"
            />
          </div>

          {/* Full Name field */}
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
