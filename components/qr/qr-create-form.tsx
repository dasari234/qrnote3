'use client';

import { QrFormFields } from '@/components/qr/qr-form-fields';
import { QRPreview } from '@/components/qr/qr-preview';
import { QrStyleEditor } from '@/components/qr/qr-style-editor';
import { QrFormFieldsExtended } from '@/components/qr/qr-form-fields-extended';
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
  Loader2,
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
import { cn } from '@/lib/utils';

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

  // New state variables for A/B testing, expiry, vanity slug
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [shortCode, setShortCode] = useState('');
  const [variant, setVariant] = useState<string | null>(null);
  const [testName, setTestName] = useState('');
  const [suggestedCode, setSuggestedCode] = useState('');

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

  // Generate a suggested short code from the name
  const generateSuggestedCode = (nameStr: string) => {
    const suggested = nameStr
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 20);
    setSuggestedCode(suggested);
  };

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
        customShortCode: shortCode || undefined,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        variant: variant || undefined,
        testName: testName || undefined,
      });
      toast.success('QR code created!');
      router.push(`/dashboard/qr`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create QR code');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="hover:bg-accent text-muted-foreground hover:text-foreground shrink-0 rounded-md h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Go back</span>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{/* Fixed contrast text variable placement */}Create QR Code</h1>
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto shadow-sm transition-all duration-200 active:scale-[0.99]"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary-foreground/80" />
              <span>Saving…</span>
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4 text-primary-foreground/90" />
              <span>Save QR Code</span>
            </>
          )}
        </Button>
      </div>


      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: form */}
        <div className="space-y-6 lg:col-span-2">
          {/* Type selector */}
          <Card className="bg-card text-card-foreground border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-foreground font-bold">QR Type</CardTitle>
              <CardDescription className="text-muted-foreground">Choose what your QR code will do</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="link" value={activeCategory} onValueChange={setActiveCategory}>
                <div className="relative flex items-center">

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="absolute left-0 z-10 h-8 w-8 rounded-full disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:bg-accent hover:text-accent-foreground border-border"
                    disabled={!canScrollLeft}
                    onClick={() => scrollTabs("left")}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Scroll tabs left</span>
                  </Button>

                  <div
                    ref={tabsRef}
                    className="mx-10 flex-1 overflow-x-auto scrollbar-hide"
                  >
                    {/* Update: Injected contextual tab background properties for clean segmentation */}
                    <TabsList className="inline-flex w-max min-w-full bg-muted/60 dark:bg-muted/20 border border-border/40 p-1 rounded-lg">
                      {QR_TYPE_CATEGORIES.map((cat) => (
                        <TabsTrigger
                          key={cat.id}
                          value={cat.id}
                          ref={(el) => {
                            tabRefs.current[cat.id] = el;
                          }}
                          className="min-w-[120px] transition-all duration-200 ease-in-out hover:bg-background/80 hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground"
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
                    className="absolute right-0 z-10 h-8 w-8 rounded-full disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:bg-accent hover:text-accent-foreground border-border"
                    disabled={!canScrollRight}
                    onClick={() => scrollTabs("right")}
                  >
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">Scroll tabs right</span>
                  </Button>

                </div>
                {QR_TYPE_CATEGORIES.map((cat) => (
                  <TabsContent key={cat.id} value={cat.id} className="mt-4 outline-none focus-visible:ring-0">
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
                            className={cn(
                              "flex flex-col items-center gap-2.5 rounded-xl border border-border bg-card p-3.5 text-center transition-all duration-200 select-none hover:border-primary/40 hover:bg-muted/30 dark:hover:bg-muted/10",
                              active && "border-primary bg-primary/5 ring-1 ring-primary dark:bg-primary/10"
                            )}
                          >
                            <Icon
                              className={cn("h-5 w-5 transition-transform duration-200 group-hover:scale-105", active ? "text-primary" : "text-muted-foreground/80")}
                            />
                            <span className="text-xs font-semibold text-foreground leading-none">{t.label}</span>
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
          <Card className="bg-card text-card-foreground border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-foreground font-bold">Details</CardTitle>
              <CardDescription className="text-muted-foreground">Name your QR code and configure its content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground font-medium">QR Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Summer Campaign Link"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    generateSuggestedCode(e.target.value);
                  }}
                  className="bg-background text-foreground border-input placeholder:text-muted-foreground/50 focus-visible:ring-ring font-medium text-sm"
                />
              </div>

              <QrFormFields typeDef={typeDef} payload={payload} onChange={handleFieldChange} />

              {/* Folder Selector Menu Dropdown */}
              {folders.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="folder" className="text-foreground font-medium">Folder (optional)</Label>
                  <select
                    id="folder"
                    value={folderId}
                    onChange={(e) => setFolderId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring focus:border-ring font-medium transition-all dark:bg-card cursor-pointer"
                  >
                    <option value="" className="bg-popover text-popover-foreground">No folder</option>
                    {folders.map((f) => (
                      <option key={f.id} value={f.id} className="bg-popover text-popover-foreground py-2">
                        📁 {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Tags Management Loop Matrix */}
              {tags.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">Tags</Label>
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
                          className={cn(
                            "rounded-full border px-3 py-1 text-xs font-semibold transition-all select-none shadow-xs border-border bg-background text-foreground hover:bg-accent hover:border-muted-foreground/30",
                            active && "border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:border-primary"
                          )}
                        >
                          <span
                            className="mr-1.5 inline-block h-2 w-2 rounded-full border border-black/10 dark:border-white/10 shrink-0"
                            style={{ backgroundColor: tag.color }}
                          />
                          <span>{tag.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Dynamic Action Switch Toggle Container */}
              <div className="flex items-center justify-between rounded-xl border border-border p-4 bg-muted/10 dark:bg-transparent shadow-inner">
                <div className="space-y-0.5 pr-4">
                  <Label htmlFor="dynamic" className="text-foreground font-semibold leading-none">Dynamic QR</Label>
                  <p className="text-xs text-muted-foreground leading-normal mt-1">
                    Edit the destination later without reprinting. Enables scan analytics.
                  </p>
                </div>
                <Switch id="dynamic" checked={isDynamic} onCheckedChange={setIsDynamic} />
              </div>
            </CardContent>
          </Card>


          {/* Extended fields: Vanity Slug, Expiry, A/B Testing */}
          <QrFormFieldsExtended
            typeDef={typeDef}
            payload={payload}
            onChange={handleFieldChange}
            expiresAt={expiresAt ?? undefined}
            onExpiryChange={setExpiresAt}
            shortCode={shortCode}
            onShortCodeChange={setShortCode}
            suggestedShortCode={suggestedCode}
            variant={variant}
            onVariantChange={setVariant}
            testName={testName}
            onTestNameChange={setTestName}
          />

          {/* Style */}
          <Card className="bg-card text-card-foreground border-border shadow-sm transition-colors duration-200">
            <CardHeader>
              <CardTitle className="text-lg text-foreground font-bold">Branding & Style</CardTitle>
              <CardDescription className="text-muted-foreground">Customize the appearance of your QR code</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <QrStyleEditor style={style} onChange={setStyle} />
            </CardContent>
          </Card>

        </div>

        {/* Right: preview */}
        <div className="lg:col-span-1">
          <div className="sticky top-20">
            <Card className="bg-card text-card-foreground border-border shadow-sm transition-colors duration-200">
              <CardHeader>
                <CardTitle className="text-lg text-foreground font-bold">Live Preview</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center py-6 bg-card">
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
