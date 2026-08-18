'use client';

import { QrFormFields } from '@/components/qr/qr-form-fields';
import { QrFormFieldsExtended } from '@/components/qr/qr-form-fields-extended';
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


import { createQrCode } from '@/lib/qr/actions';
import { QR_TYPES, QR_TYPE_CATEGORIES } from '@/lib/qr/types';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { QRStyle, QRType } from '@/lib/types';
import { cn } from '@/lib/utils';

import {
  ArrowLeft,
  Bitcoin,
  Calendar,
  Check,
  ChevronDown,
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
  MoreHorizontal,
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
  ChevronLeft,
};

interface Props {
  workspaceId: string;
  folders: { id: string; name: string }[];
  tags: { id: string; name: string; color: string }[];
}

export function QrCreateForm({
  workspaceId,
  folders,
  tags,
}: Props) {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  /* -------------------------------------------------------------------------- */
  /* State                                                                      */
  /* -------------------------------------------------------------------------- */

  const [name, setName] = useState('');
  const [type, setType] = useState<QRType>('url');
  const [payload, setPayload] = useState<Record<string, any>>({});

  const [isDynamic, setIsDynamic] = useState(true);

  const [style, setStyle] = useState<QRStyle>({
    fgColor: '#000000',
    bgColor: '#ffffff',
    templateId: 'classic-black',
  });

  const [folderId, setFolderId] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);

  /* Advanced options */
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [shortCode, setShortCode] = useState('');
  const [variant, setVariant] = useState<string | null>(null);
  const [testName, setTestName] = useState('');
  const [suggestedCode, setSuggestedCode] = useState('');

  /* UI state */
  const [activeCategory, setActiveCategory] = useState('link');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [brandingOpen, setBrandingOpen] = useState(false);

  const typeDef = useMemo(
    () => QR_TYPES.find((t) => t.type === type)!,
    [type]
  );

  /* -------------------------------------------------------------------------- */
  /* Category scrolling                                                        */
  /* -------------------------------------------------------------------------- */

  const tabsRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = () => {
    const element = tabsRef.current;

    if (!element) {
      return;
    }

    setCanScrollLeft(element.scrollLeft > 5);

    setCanScrollRight(
      element.scrollLeft + element.clientWidth <
        element.scrollWidth - 5
    );
  };

  const scrollTabs = (direction: 'left' | 'right') => {
    tabsRef.current?.scrollBy({
      left: direction === 'left' ? -240 : 240,
      behavior: 'smooth',
    });
  };

  const scrollActiveTabIntoView = (value: string) => {
    const tab = tabRefs.current[value];

    tab?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  };

  useEffect(() => {
    updateScrollButtons();

    const element = tabsRef.current;

    if (!element) {
      return;
    }

    element.addEventListener('scroll', updateScrollButtons);
    window.addEventListener('resize', updateScrollButtons);

    return () => {
      element.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, []);

  useEffect(() => {
    scrollActiveTabIntoView(activeCategory);
  }, [activeCategory]);

  useEffect(() => {
    const categoryTypes = QR_TYPES.filter(
      (item) => item.category === activeCategory
    );

    if (categoryTypes.length === 0) {
      return;
    }

    const currentTypeBelongsToCategory =
      QR_TYPES.find((item) => item.type === type)?.category ===
      activeCategory;

    if (!currentTypeBelongsToCategory) {
      setType(categoryTypes[0].type);
      setPayload({});
    }
  }, [activeCategory, type]);

  /* -------------------------------------------------------------------------- */
  /* Helpers                                                                    */
  /* -------------------------------------------------------------------------- */

  const shortLinkUrl = useMemo(() => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/q/preview`;
    }

    return '/q/preview';
  }, []);

  const generateSuggestedCode = (value: string) => {
    const suggested = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 20);

    setSuggestedCode(suggested);
  };

  const handleFieldChange = (
    key: string,
    value: string
  ) => {
    setPayload((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const handleTypeChange = (nextType: QRType) => {
    setType(nextType);
    setPayload({});
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((previous) => {
      if (previous.includes(tagId)) {
        return previous.filter((id) => id !== tagId);
      }

      return [...previous, tagId];
    });
  };

  const selectedTagObjects = tags.filter((tag) =>
    selectedTags.includes(tag.id)
  );

  /* -------------------------------------------------------------------------- */
  /* Submit                                                                     */
  /* -------------------------------------------------------------------------- */

  const handleSubmit = async (
    event: React.SyntheticEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);

    try {
      if (!name.trim()) {
        toast.error('Please give your QR code a name');
        setLoading(false);
        return;
      }

      const requiredFields = typeDef.fields.filter(
        (field) => field.required
      );

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

      await createQrCode({
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
        expiresAt: expiresAt
          ? new Date(expiresAt)
          : undefined,
        variant: variant || undefined,
        testName: testName || undefined,
      });

      toast.success('QR code created successfully');

      router.refresh();
      router.push('/dashboard/qr');
    } catch (error: any) {
      toast.error(
        error?.message || 'Failed to create QR code'
      );
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /* UI                                                                         */
  /* -------------------------------------------------------------------------- */

  return (
    <form
      onSubmit={handleSubmit}
      className="min-h-screen bg-background"
    >
      {/* -------------------------------------------------------------------- */}
      {/* Header                                                               */}
      {/* -------------------------------------------------------------------- */}

      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-9 w-9 shrink-0 rounded-lg"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">
                Go back
              </span>
            </Button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl">
                  Create QR Code
                </h1>

                <span className="hidden rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary sm:inline-flex">
                  Builder
                </span>
              </div>

              <p className="hidden text-xs text-muted-foreground sm:block">
                Create, customize and manage your QR code
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              className="hidden sm:inline-flex"
              onClick={() => router.back()}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={loading}
              className="min-w-[145px] shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create QR Code
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* -------------------------------------------------------------------- */}
      {/* Main                                                                  */}
      {/* -------------------------------------------------------------------- */}

      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px] xl:gap-8">
          {/* ================================================================= */}
          {/* LEFT                                                               */}
          {/* ================================================================= */}

          <main className="min-w-0 space-y-6">
            {/* ---------------------------------------------------------------- */}
            {/* Step 1 - QR Type                                                 */}
            {/* ---------------------------------------------------------------- */}

            <section>
              <div className="mb-3 flex items-end justify-between gap-4">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                      1
                    </span>

                    <h2 className="text-base font-semibold">
                      Choose QR type
                    </h2>
                  </div>

                  <p className="ml-8 text-sm text-muted-foreground">
                    What do you want your QR code to do?
                  </p>
                </div>
              </div>

              <Card className="overflow-hidden border-border/70 shadow-sm">
                <CardContent className="p-0">
                  {/* Category navigation */}
                  <div className="relative border-b border-border/70 bg-muted/[0.18]">
                    {/* Left scroll button */}
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={!canScrollLeft}
                      onClick={() => scrollTabs('left')}
                      className={cn(
                        'absolute left-2 top-1/2 z-10 h-8 w-8 -translate-y-1/2 rounded-full bg-background shadow-sm transition-all',
                        !canScrollLeft &&
                          'pointer-events-none opacity-0'
                      )}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="sr-only">
                        Scroll categories left
                      </span>
                    </Button>

                    {/* Categories */}
                    <div
                      ref={tabsRef}
                      className="scrollbar-hide flex gap-1 overflow-x-auto px-11 py-2"
                    >
                      {QR_TYPE_CATEGORIES.map((category) => {
                        const active =
                          activeCategory === category.id;

                        return (
                          <button
                            key={category.id}
                            ref={(element) => {
                              tabRefs.current[category.id] =
                                element;
                            }}
                            type="button"
                            role="tab"
                            aria-selected={active}
                            aria-controls={`qr-category-${category.id}`}
                            onClick={() => {
                              setActiveCategory(category.id);
                            }}
                            className={cn(
                              'shrink-0 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all',
                              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
                              active
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:bg-background hover:text-foreground'
                            )}
                          >
                            {category.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Right scroll button */}
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={!canScrollRight}
                      onClick={() => scrollTabs('right')}
                      className={cn(
                        'absolute right-2 top-1/2 z-10 h-8 w-8 -translate-y-1/2 rounded-full bg-background shadow-sm transition-all',
                        !canScrollRight &&
                          'pointer-events-none opacity-0'
                      )}
                    >
                      <ChevronRight className="h-4 w-4" />
                      <span className="sr-only">
                        Scroll categories right
                      </span>
                    </Button>
                  </div>

                  {/* QR type cards */}
                  <div
                    id={`qr-category-${activeCategory}`}
                    role="tabpanel"
                    className="p-4 sm:p-5"
                  >
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
                      {QR_TYPES.filter(
                        (item) =>
                          item.category === activeCategory
                      ).map((item) => {
                        const Icon =
                          ICONS[item.icon] || Link;

                        const active = item.type === type;

                        return (
                          <button
                            key={item.type}
                            type="button"
                            aria-pressed={active}
                            onClick={() =>
                              handleTypeChange(item.type)
                            }
                            className={cn(
                              'group relative flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-xl border p-3 text-center transition-all',
                              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                              active
                                ? 'border-primary bg-primary/[0.06] shadow-sm ring-1 ring-primary'
                                : 'border-border/70 bg-background hover:border-primary/40 hover:bg-muted/30'
                            )}
                          >
                            {active && (
                              <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                <Check className="h-3 w-3" />
                              </span>
                            )}

                            <span
                              className={cn(
                                'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
                                active
                                  ? 'bg-primary/10 text-primary'
                                  : 'bg-muted text-muted-foreground group-hover:text-foreground'
                              )}
                            >
                              <Icon className="h-[18px] w-[18px]" />
                            </span>

                            <span className="text-xs font-semibold leading-tight">
                              {item.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* ---------------------------------------------------------------- */}
            {/* Step 2 - QR Content                                              */}
            {/* ---------------------------------------------------------------- */}

            <section>
              <div className="mb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                    2
                  </span>

                  <h2 className="text-base font-semibold">
                    QR content
                  </h2>
                </div>

                <p className="ml-8 mt-1 text-sm text-muted-foreground">
                  Configure the information your QR
                  code will contain.
                </p>
              </div>

              <Card className="border-border/70 shadow-sm">
                <CardHeader className="border-b border-border/50 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-base">
                        {typeDef?.label || 'QR Code'}
                      </CardTitle>

                      <CardDescription className="mt-1">
                        Enter the content for your QR
                        code.
                      </CardDescription>
                    </div>

                    <div className="hidden rounded-lg bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary sm:block">
                      {typeDef?.label || 'QR'}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6 p-5">
                  {/* QR name */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-sm font-semibold"
                    >
                      QR name
                    </Label>

                    <Input
                      id="name"
                      value={name}
                      placeholder="e.g. Summer Campaign"
                      onChange={(event) => {
                        const value =
                          event.target.value;

                        setName(value);
                        generateSuggestedCode(value);
                      }}
                      className="h-11"
                    />

                    <p className="text-xs text-muted-foreground">
                      Give this QR code a name so you
                      can easily find it later.
                    </p>
                  </div>

                  {/* Dynamic QR content */}
                  <div className="rounded-xl border border-border/70 bg-muted/[0.18] p-4">
                    <QrFormFields
                      typeDef={typeDef}
                      payload={payload}
                      onChange={handleFieldChange}
                    />
                  </div>

                  {/* Dynamic QR */}
                  <div
                    className={cn(
                      'flex items-center justify-between gap-4 rounded-xl border p-4 transition-colors',
                      isDynamic
                        ? 'border-primary/30 bg-primary/[0.04]'
                        : 'border-border/70 bg-background'
                    )}
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div
                        className={cn(
                          'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                          isDynamic
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        <Share2 className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Label
                            htmlFor="dynamic"
                            className="cursor-pointer text-sm font-semibold"
                          >
                            Dynamic QR
                          </Label>

                          {isDynamic && (
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                              Recommended
                            </span>
                          )}
                        </div>

                        <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted-foreground">
                          Change the destination later
                          without reprinting the QR code
                          and enable scan analytics.
                        </p>
                      </div>
                    </div>

                    <Switch
                      id="dynamic"
                      checked={isDynamic}
                      onCheckedChange={setIsDynamic}
                    />
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* ---------------------------------------------------------------- */}
            {/* Step 3 - Advanced                                               */}
            {/* ---------------------------------------------------------------- */}

            <section>
              <Card className="overflow-hidden border-border/70 shadow-sm">
                <button
                  type="button"
                  onClick={() =>
                    setAdvancedOpen(
                      (previous) => !previous
                    )
                  }
                  className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <MoreHorizontal className="h-4 w-4" />
                    </div>

                    <div>
                      <h2 className="text-sm font-semibold">
                        Advanced settings
                      </h2>

                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Expiration, custom URL and A/B
                        testing
                      </p>
                    </div>
                  </div>

                  <ChevronDown
                    className={cn(
                      'h-4 w-4 text-muted-foreground transition-transform',
                      advancedOpen &&
                        'rotate-180'
                    )}
                  />
                </button>

                {advancedOpen && (
                  <div className="border-t border-border/70 p-5">
                    <QrFormFieldsExtended
                      typeDef={typeDef}
                      payload={payload}
                      onChange={handleFieldChange}
                      expiresAt={
                        expiresAt ?? undefined
                      }
                      onExpiryChange={setExpiresAt}
                      shortCode={shortCode}
                      onShortCodeChange={setShortCode}
                      suggestedShortCode={
                        suggestedCode
                      }
                      variant={variant}
                      onVariantChange={setVariant}
                      testName={testName}
                      onTestNameChange={setTestName}
                    />
                  </div>
                )}
              </Card>
            </section>

            {/* ---------------------------------------------------------------- */}
            {/* Step 5 - Branding                                               */}
            {/* ---------------------------------------------------------------- */}

            <section>
              <Card className="overflow-hidden border-border/70 shadow-sm">
                <button
                  type="button"
                  onClick={() =>
                    setBrandingOpen(
                      (previous) => !previous
                    )
                  }
                  className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <ImageIcon className="h-4 w-4" />
                    </div>

                    <div>
                      <h2 className="text-sm font-semibold">
                        Branding & appearance
                      </h2>

                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Customize colors, templates and
                        QR appearance
                      </p>
                    </div>
                  </div>

                  <ChevronDown
                    className={cn(
                      'h-4 w-4 text-muted-foreground transition-transform',
                      brandingOpen &&
                        'rotate-180'
                    )}
                  />
                </button>

                {brandingOpen && (
                  <div className="border-t border-border/70 p-5">
                    <QrStyleEditor
                      style={style}
                      onChange={setStyle}
                    />
                  </div>
                )}
              </Card>
            </section>

            {/* ---------------------------------------------------------------- */}
            {/* Mobile create CTA                                               */}
            {/* ---------------------------------------------------------------- */}

            <div className="pt-2 lg:hidden">
              <Button
                type="submit"
                disabled={loading}
                className="h-12 w-full text-sm font-semibold shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating QR Code…
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create QR Code
                  </>
                )}
              </Button>
            </div>
          </main>

          {/* ================================================================= */}
          {/* RIGHT - PREVIEW                                                   */}
          {/* ================================================================= */}

          <aside className="lg:sticky lg:top-[88px]">
            <Card className="overflow-hidden border-border/70 shadow-sm">
              {/* Preview header */}
              <CardHeader className="border-b border-border/60 bg-muted/[0.12] pb-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">
                      Live preview
                    </CardTitle>

                    <CardDescription className="mt-1">
                      Your QR code updates as you edit.
                    </CardDescription>
                  </div>

                  <div
                    className={cn(
                      'flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[10px] font-semibold',
                      isDynamic
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    <span
                      className={cn(
                        'h-1.5 w-1.5 rounded-full',
                        isDynamic
                          ? 'bg-primary'
                          : 'bg-muted-foreground'
                      )}
                    />

                    {isDynamic
                      ? 'Dynamic'
                      : 'Static'}
                  </div>
                </div>
              </CardHeader>

              {/* QR */}
              <CardContent className="p-0">
                <div className="flex min-h-[390px] items-center justify-center bg-muted/[0.12] p-6 sm:p-8">
                  <div className="w-full max-w-[300px] rounded-2xl border border-border/70 bg-background p-5 shadow-sm">
                    <div className="flex min-h-[290px] items-center justify-center rounded-xl bg-white p-5">
                      <QRPreview
                        type={type}
                        payload={payload}
                        isDynamic={isDynamic}
                        shortLinkUrl={
                          shortLinkUrl
                        }
                        style={style}
                      />
                    </div>

                    <div className="mt-4 text-center">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {name.trim() ||
                          'Untitled QR Code'}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {typeDef?.label ||
                          'QR Code'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="border-t border-border/60 p-4">
                  <div className="flex items-center gap-2 rounded-lg bg-primary/[0.06] px-3 py-2.5">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Check className="h-3.5 w-3.5" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold">
                        Ready to create
                      </p>

                      <p className="text-[11px] text-muted-foreground">
                        {isDynamic
                          ? 'Dynamic QR with analytics enabled'
                          : 'Static QR code'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Desktop action */}
                <div className="hidden border-t border-border/60 p-4 lg:block">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-11 w-full font-semibold shadow-sm"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating…
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Create QR Code
                      </>
                    )}
                  </Button>

                  <p className="mt-2 text-center text-[11px] text-muted-foreground">
                    You can edit your QR code later.
                  </p>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </form>
  );
}
