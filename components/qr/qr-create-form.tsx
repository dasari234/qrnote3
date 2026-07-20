'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { createQrCode } from '@/lib/qr/actions';
import { QR_TYPES, QR_TYPE_CATEGORIES } from '@/lib/qr/types';
import { QRType, QRStyle } from '@/lib/types';
import { QRPreview } from '@/components/qr/qr-preview';
import { QrStyleEditor } from '@/components/qr/qr-style-editor';
import { QrFormFields } from '@/components/qr/qr-form-fields';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Link,
  Type,
  Mail,
  Phone,
  MessageSquare,
  Wifi,
  Contact,
  FileText,
  Image as ImageIcon,
  Share2,
  Star,
  Calendar,
  UtensilsCrossed,
  Video,
  ArrowLeft,
  Save,
} from 'lucide-react';

const ICONS: Record<string, any> = {
  Link,
  Type,
  Mail,
  Phone,
  MessageSquare,
  Wifi,
  Contact,
  FileText,
  Image: ImageIcon,
  Share2,
  Star,
  Calendar,
  UtensilsCrossed,
  Video,
};

interface Props {
  workspaceId: string;
  folders: { id: string; name: string }[];
  tags: { id: string; name: string; color: string }[];
}

export function QrCreateForm({ workspaceId, folders, tags }: Props) {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  const [name, setName] = useState('');
  const [type, setType] = useState<QRType>('url');
  const [payload, setPayload] = useState<Record<string, any>>({});
  const [isDynamic, setIsDynamic] = useState(true);
  const [style, setStyle] = useState<QRStyle>({ fgColor: '#000000', bgColor: '#ffffff' });
  const [folderId, setFolderId] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const typeDef = useMemo(() => QR_TYPES.find((t) => t.type === type)!, [type]);

  const shortLinkUrl = useMemo(() => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/q/preview`;
    }
    return '/q/preview';
  }, []);

  const handleFieldChange = (key: string, value: string) => {
    setPayload((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!name.trim()) {
      toast.error('Please give your QR code a name');
      setLoading(false);
      return;
    }

    const requiredFields = typeDef.fields.filter((f) => f.required);
    for (const field of requiredFields) {
      if (!payload[field.key]?.trim()) {
        toast.error(`${field.label} is required`);
        setLoading(false);
        return;
      }
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error('You must be signed in');
      setLoading(false);
      return;
    }

    try {
      const result = await createQrCode({
        workspaceId,
        name: name.trim(),
        type,
        payload,
        isDynamic,
        style,
        createdBy: user.id,
        folderId: folderId || undefined,
        tagIds: selectedTags,
      });
      toast.success('QR code created!');
      router.push(`/dashboard/qr/${result.id}`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create QR code');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Create QR Code</h1>
        </div>
        <Button type="submit" disabled={loading}>
          <Save className="mr-2 h-4 w-4" />
          {loading ? 'Saving…' : 'Save QR Code'}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: form */}
        <div className="space-y-6 lg:col-span-2">
          {/* Type selector */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">QR Type</CardTitle>
              <CardDescription>Choose what your QR code will do</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="link">
                <TabsList className="grid w-full grid-cols-4">
                  {QR_TYPE_CATEGORIES.map((cat) => (
                    <TabsTrigger key={cat.id} value={cat.id}>
                      {cat.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {QR_TYPE_CATEGORIES.map((cat) => (
                  <TabsContent key={cat.id} value={cat.id} className="mt-4">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {QR_TYPES.filter((t) => t.category === cat.id).map((t) => {
                        const Icon = ICONS[t.icon] || Link;
                        const active = t.type === type;
                        return (
                          <button
                            key={t.type}
                            type="button"
                            onClick={() => {
                              setType(t.type);
                              setPayload({});
                            }}
                            className={`flex flex-col items-center gap-2 rounded-lg border p-3 text-center transition-all hover:border-primary/50 hover:bg-accent/50 ${
                              active ? 'border-primary bg-primary/5 ring-1 ring-primary' : ''
                            }`}
                          >
                            <Icon
                              className={`h-6 w-6 ${active ? 'text-primary' : 'text-muted-foreground'}`}
                            />
                            <span className="text-xs font-medium">{t.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
              <CardDescription>Name your QR code and configure its content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">QR Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Summer Campaign Link"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <QrFormFields typeDef={typeDef} payload={payload} onChange={handleFieldChange} />

              {/* Folder */}
              {folders.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="folder">Folder (optional)</Label>
                  <select
                    id="folder"
                    value={folderId}
                    onChange={(e) => setFolderId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">No folder</option>
                    {folders.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => {
                      const active = selectedTags.includes(tag.id);
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => {
                            setSelectedTags((prev) =>
                              active ? prev.filter((t) => t !== tag.id) : [...prev, tag.id]
                            );
                          }}
                          className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                            active
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border bg-background hover:bg-accent'
                          }`}
                        >
                          <span
                            className="mr-1.5 inline-block h-2 w-2 rounded-full"
                            style={{ backgroundColor: tag.color }}
                          />
                          {tag.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Dynamic toggle */}
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="dynamic">Dynamic QR</Label>
                  <p className="text-xs text-muted-foreground">
                    Edit the destination later without reprinting. Enables scan analytics.
                  </p>
                </div>
                <Switch id="dynamic" checked={isDynamic} onCheckedChange={setIsDynamic} />
              </div>
            </CardContent>
          </Card>

          {/* Style */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Branding & Style</CardTitle>
              <CardDescription>Customize the appearance of your QR code</CardDescription>
            </CardHeader>
            <CardContent>
              <QrStyleEditor style={style} onChange={setStyle} />
            </CardContent>
          </Card>
        </div>

        {/* Right: preview */}
        <div className="lg:col-span-1">
          <div className="sticky top-20">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Live Preview</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center py-6">
                <QRPreview
                  type={type}
                  payload={payload}
                  isDynamic={isDynamic}
                  shortLinkUrl={shortLinkUrl}
                  style={style}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </form>
  );
}
