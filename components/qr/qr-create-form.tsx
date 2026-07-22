'use client';

import { QrFormFields } from '@/components/qr/qr-form-fields';
import { QRPreview } from '@/components/qr/qr-preview';
import { QrStyleEditor } from '@/components/qr/qr-style-editor';
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
import { Switch } from '@/components/ui/switch';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { createQrCode } from '@/lib/qr/actions';
import { QR_TYPES, QR_TYPE_CATEGORIES } from '@/lib/qr/types';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { QRStyle, QRType } from '@/lib/types';
import {
  ArrowLeft,
  Bitcoin,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Contact,
  DollarSign,
  FileText,
  Flower2,
  Gift,
  HeartPulse,
  Home,
  Image as ImageIcon,
  Link,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  PawPrint,
  Phone,
  Save,
  Search,
  Send,
  Share2,
  Smartphone,
  Star,
  Type,
  User,
  Users,
  UtensilsCrossed,
  Video,
  Wifi
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

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
  MessageCircle,
  Send,
  Smartphone,
  MapPin,
  Bitcoin,
  DollarSign,
  User,
  HeartPulse,
  PawPrint,
  Search,
  Flower2,
  Home,
  Gift,
  Users,
  ChevronRight,
  ChevronLeft
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

  const tabsRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activeCategory, setActiveCategory] = useState("link");

  const updateScrollButtons = () => {
    const el = tabsRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(
      el.scrollLeft + el.clientWidth < el.scrollWidth - 5
    );
  };

  const scrollActiveTabIntoView = (value: string) => {
    const tab = tabRefs.current[value];

    tab?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  };

  const scrollTabs = (direction: "left" | "right") => {
    tabsRef.current?.scrollBy({
      left: direction === "left" ? -220 : 220,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    updateScrollButtons();

    const el = tabsRef.current;
    if (!el) return;

    el.addEventListener("scroll", updateScrollButtons);
    window.addEventListener("resize", updateScrollButtons);

    return () => {
      el.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, []);

  useEffect(() => {
    scrollActiveTabIntoView(activeCategory);
  }, [activeCategory]);

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
              <Tabs defaultValue="link" value={activeCategory}  onValueChange={setActiveCategory}>
               <div className="relative flex items-center">

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="absolute left-0 z-10 h-8 w-8 rounded-full disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                    disabled={!canScrollLeft}
                    onClick={() => scrollTabs("left")}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>


                  <div
                    ref={tabsRef}
                    className="mx-10 flex-1 overflow-x-auto scrollbar-hide"
                  >
                    <TabsList className="inline-flex w-max min-w-full">
                      {QR_TYPE_CATEGORIES.map((cat) => (
                        <TabsTrigger
                          key={cat.id}
                          value={cat.id}
                          ref={(el) => {
                            tabRefs.current[cat.id] = el;
                          }}
                          className="min-w-[120px] transition-all duration-200 ease-in-out hover:bg-muted hover:text-foreground hover:shadow-sm hover:-translate-y-0.5 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:translate-y-0 data-[state=active]:font-semibold disabled:pointer-events-none"
                        >
                          {cat.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="absolute right-0 z-10 h-8 w-8 rounded-full disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                    disabled={!canScrollRight}
                    onClick={() => scrollTabs("right")}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>

               </div>
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
