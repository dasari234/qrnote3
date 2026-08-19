'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  Copy,
  ExternalLink,
  Loader2,
  Pause,
  Play,
  Save,
  Trash2,
} from 'lucide-react';

import { QRPreview } from '@/components/qr/qr-preview';
import { QrPdfDownload } from './qr-pdf-download';
import { QrPngDownload } from './qr-png-download';

import { QrAdvancedSection } from './create/qr-advanced-section';
import { QrBrandingSection } from './create/qr-branding-section';
import { QrContentSection } from './create/qr-content-section';
import { QrOrganizationSection } from './create/qr-organization-section';
import { QrTypeSelector } from './create/qr-type-selector';

import {
  deleteQrCode,
  duplicateQrCode,
  updateQrCode,
  updateQrStatus,
} from '@/lib/qr/actions';

import { QR_TYPES } from '@/lib/qr/types';
import { QRStyle, QRType } from '@/lib/types';

interface Props {
  qr: any;

  folders: {
    id: string;
    name: string;
  }[];

  tags: {
    id: string;
    name: string;
    color: string;
  }[];

  selectedTagIds: string[];
}

export function QrEditForm({
  qr,
  folders,
  tags,
  selectedTagIds,
}: Props) {
  const router = useRouter();

  const canvasWrapperRef =
    useRef<HTMLDivElement>(null);

  /* -------------------------------------------------------------------------- */
  /* Mounted                                                                    */
  /* -------------------------------------------------------------------------- */

  const [isMounted, setIsMounted] =
    useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  /* -------------------------------------------------------------------------- */
  /* Core QR state                                                               */
  /* -------------------------------------------------------------------------- */

  const [name, setName] =
    useState<string>(qr.name || '');

  const [type, setType] =
    useState<QRType>(qr.type);

  const [payload, setPayload] =
    useState<Record<string, any>>(
      qr.payload || {}
    );

  const [isDynamic, setIsDynamic] =
    useState<boolean>(
      Boolean(qr.isDynamic)
    );

  const [style, setStyle] =
    useState<QRStyle>(
      (qr.style as QRStyle) || {
        fgColor: '#000000',
        bgColor: '#ffffff',
        templateId: 'classic-black',
      }
    );

  /* -------------------------------------------------------------------------- */
  /* Organization                                                               */
  /* -------------------------------------------------------------------------- */

  const [folderId, setFolderId] =
    useState<string>(
      qr.folderId || ''
    );

  const [selectedTags, setSelectedTags] =
    useState<string[]>(
      selectedTagIds || []
    );

  /* -------------------------------------------------------------------------- */
  /* Status                                                                     */
  /* -------------------------------------------------------------------------- */

  const [status, setStatus] =
    useState(qr.status);

  /* -------------------------------------------------------------------------- */
  /* Advanced                                                                   */
  /* -------------------------------------------------------------------------- */

  const [expiresAt, setExpiresAt] =
    useState<string | null>(
      qr.expiresAt
        ? new Date(qr.expiresAt)
            .toISOString()
            .split('T')[0]
        : null
    );

  const [shortCode, setShortCode] =
    useState<string>(
      qr.shortCode || ''
    );

  const [variant, setVariant] =
    useState<string | null>(
      qr.variant || null
    );

  const [testName, setTestName] =
    useState<string>(
      qr.testName || ''
    );

  /* -------------------------------------------------------------------------- */
  /* UI state                                                                   */
  /* -------------------------------------------------------------------------- */

  const [loading, setLoading] =
    useState(false);

  const [duplicating, setDuplicating] =
    useState(false);

  const [isDeleting, setIsDeleting] =
    useState(false);

  const [
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
  ] = useState(false);

  /* -------------------------------------------------------------------------- */
  /* QR definition                                                              */
  /* -------------------------------------------------------------------------- */

  const typeDef = useMemo(
    () =>
      QR_TYPES.find(
        (item) => item.type === type
      ),
    [type]
  );

  /* -------------------------------------------------------------------------- */
  /* Short URL                                                                  */
  /* -------------------------------------------------------------------------- */

  const shortLinkUrl = useMemo(() => {
    if (
      isMounted &&
      typeof window !== 'undefined' &&
      shortCode
    ) {
      return `${window.location.origin}/q/${shortCode}`;
    }

    return `/q/${shortCode || 'preview'}`;
  }, [isMounted, shortCode]);

  /* -------------------------------------------------------------------------- */
  /* Dirty state                                                                */
  /* -------------------------------------------------------------------------- */

  const hasChanges = useMemo(() => {
    const originalStyle =
      (qr.style as QRStyle) || {
        fgColor: '#000000',
        bgColor: '#ffffff',
      };

    const originalExpiresAt =
      qr.expiresAt
        ? new Date(qr.expiresAt)
            .toISOString()
            .split('T')[0]
        : null;

    const payloadChanged =
      JSON.stringify(payload) !==
      JSON.stringify(qr.payload || {});

    const styleChanged =
      JSON.stringify(style) !==
      JSON.stringify(originalStyle);

    const tagsChanged =
      JSON.stringify(
        [...selectedTags].sort()
      ) !==
      JSON.stringify(
        [...(selectedTagIds || [])].sort()
      );

    return (
      name !== (qr.name || '') ||
      type !== qr.type ||
      payloadChanged ||
      isDynamic !== Boolean(qr.isDynamic) ||
      styleChanged ||
      folderId !== (qr.folderId || '') ||
      tagsChanged ||
      expiresAt !== originalExpiresAt ||
      shortCode !== (qr.shortCode || '') ||
      variant !== (qr.variant || null) ||
      testName !== (qr.testName || '')
    );
  }, [
    name,
    type,
    payload,
    isDynamic,
    style,
    folderId,
    selectedTags,
    expiresAt,
    shortCode,
    variant,
    testName,
    qr,
    selectedTagIds,
  ]);

  /* -------------------------------------------------------------------------- */
  /* Handlers                                                                   */
  /* -------------------------------------------------------------------------- */

  const handleFieldChange = (
    key: string,
    value: string
  ) => {
    setPayload((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const handleTypeChange = (
    nextType: QRType
  ) => {
    if (nextType === type) {
      return;
    }

    setType(nextType);

    /*
     * QR payload fields are type-specific.
     * Do not carry old fields into the new QR type.
     */
    setPayload({});
  };

  const handleTagToggle = (
    tagId: string
  ) => {
    setSelectedTags((previous) => {
      if (previous.includes(tagId)) {
        return previous.filter(
          (id) => id !== tagId
        );
      }

      return [...previous, tagId];
    });
  };

  /* -------------------------------------------------------------------------- */
  /* Save                                                                       */
  /* -------------------------------------------------------------------------- */

  const handleSave = async () => {
    if (loading) {
      return;
    }

    if (!name.trim()) {
      toast.error(
        'Please give your QR code a name'
      );

      return;
    }

    const requiredFields =
      typeDef?.fields.filter(
        (field) => field.required
      ) || [];

    const missingField =
      requiredFields.find((field) => {
        const value =
          payload[field.key];

        return (
          !value ||
          !String(value).trim()
        );
      });

    if (missingField) {
      toast.error(
        `${missingField.label} is required`
      );

      return;
    }

    setLoading(true);

    try {
      await updateQrCode({
        id: qr.id,

        name: name.trim(),

        type,

        payload,

        isDynamic,

        style,

        status,

        folderId:
          folderId || null,

        tagIds: selectedTags,

        customShortCode:
          shortCode || undefined,

        expiresAt: expiresAt
          ? new Date(expiresAt)
          : null,

        variant:
          variant || null,

        testName:
          testName || undefined,
      });

      toast.success(
        'QR code updated successfully'
      );

      router.refresh();
      router.push('/dashboard/qr');
    } catch (error: any) {
      console.error(
        'Failed to update QR code',
        error
      );

      toast.error(
        error?.message ||
          'Failed to update QR code'
      );
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /* Status                                                                     */
  /* -------------------------------------------------------------------------- */

  const handleToggleStatus = async () => {
    if (loading) {
      return;
    }

    const next =
      status === 'active'
        ? 'paused'
        : 'active';

    setStatus(next);

    try {
      await updateQrStatus(
        qr.id,
        next
      );

      toast.success(
        next === 'active'
          ? 'QR code activated'
          : 'QR code paused'
      );

      router.refresh();
    } catch (error: any) {
      setStatus(status);

      toast.error(
        error?.message ||
          'Failed to update QR status'
      );
    }
  };

  /* -------------------------------------------------------------------------- */
  /* Duplicate                                                                  */
  /* -------------------------------------------------------------------------- */

  const handleDuplicate = async () => {
    if (duplicating) {
      return;
    }

    setDuplicating(true);

    try {
      const result =
        await duplicateQrCode(
          qr.id
        );

      toast.success(
        'QR code duplicated'
      );

      router.push(
        `/dashboard/qr/${result.id}`
      );

      router.refresh();
    } catch (error: any) {
      toast.error(
        error?.message ||
          'Failed to duplicate QR code'
      );
    } finally {
      setDuplicating(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /* Delete                                                                     */
  /* -------------------------------------------------------------------------- */

  const handleDelete = async () => {
    try {
      await deleteQrCode(qr.id);

      toast.success(
        'QR code deleted'
      );

      router.push(
        '/dashboard/qr'
      );

      router.refresh();
    } catch (error: any) {
      toast.error(
        error?.message ||
          'Failed to delete QR code'
      );

      throw error;
    }
  };

  const handleConfirmDelete =
    async () => {
      if (isDeleting) {
        return;
      }

      setIsDeleting(true);

      try {
        await handleDelete();

        setIsDeleteDialogOpen(false);
      } catch {
        // Error already displayed.
      } finally {
        setIsDeleting(false);
      }
    };

  /* -------------------------------------------------------------------------- */
  /* Copy                                                                       */
  /* -------------------------------------------------------------------------- */

  const handleCopyLink = async () => {
    if (!shortCode) {
      toast.error(
        'Static QR codes do not have a short link'
      );

      return;
    }

    try {
      const link =
        `${window.location.origin}/q/${shortCode}`;

      await navigator.clipboard.writeText(
        link
      );

      toast.success(
        'Short link copied'
      );
    } catch {
      toast.error(
        'Unable to copy short link'
      );
    }
  };

  /* -------------------------------------------------------------------------- */
  /* Back                                                                       */
  /* -------------------------------------------------------------------------- */

  const handleBack = () => {
    if (
      hasChanges &&
      !window.confirm(
        'You have unsaved changes. Leave without saving?'
      )
    ) {
      return;
    }

    router.back();
  };

  /* -------------------------------------------------------------------------- */
  /* Render                                                                     */
  /* -------------------------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-background">
      {/* -------------------------------------------------------------------- */}
      {/* Header                                                               */}
      {/* -------------------------------------------------------------------- */}

      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex min-h-16 max-w-[1440px] items-center justify-between gap-4 px-4 py-1 sm:px-6 lg:px-8">
          {/* Left */}
          <div className="flex min-w-0 items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-9 w-9 shrink-0 rounded-lg"
            >
              <span className="text-lg">
                ←
              </span>

              <span className="sr-only">
                Go back
              </span>
            </Button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-base font-semibold sm:text-lg">
                  Edit QR Code
                </h1>

                {hasChanges && (
                  <span className="hidden items-center gap-1 text-[11px] text-muted-foreground sm:inline-flex">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    Unsaved changes
                  </span>
                )}
              </div>

              <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="truncate">
                  {qr.name}
                </span>

                <span>·</span>

                <span className="capitalize">
                  {String(type).replace(
                    '_',
                    ' '
                  )}
                </span>

                <span>·</span>

                <span>
                  {qr.scanCount || 0}{' '}
                  scans
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={
                handleToggleStatus
              }
              disabled={
                loading ||
                duplicating ||
                isDeleting
              }
              className="hidden sm:inline-flex"
            >
              {status === 'active' ? (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Activate
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={
                handleDuplicate
              }
              disabled={
                loading ||
                duplicating ||
                isDeleting
              }
            >
              {duplicating ? (
                <Loader2 className="h-4 w-4 animate-spin sm:mr-2" />
              ) : (
                <Copy className="h-4 w-4 sm:mr-2" />
              )}

              <span className="hidden sm:inline">
                Duplicate
              </span>
            </Button>

            {/* Delete */}
            <Dialog
              open={
                isDeleteDialogOpen
              }
              onOpenChange={
                setIsDeleteDialogOpen
              }
            >
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={
                    loading ||
                    duplicating ||
                    isDeleting
                  }
                  className="hidden text-destructive hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive sm:inline-flex"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    Delete this QR code?
                  </DialogTitle>

                  <DialogDescription>
                    This action cannot be
                    undone. The QR code will
                    be permanently removed and
                    its traffic redirects will
                    stop.
                  </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2">
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={
                        isDeleting
                      }
                    >
                      Cancel
                    </Button>
                  </DialogClose>

                  <Button
                    type="button"
                    variant="destructive"
                    disabled={
                      isDeleting
                    }
                    onClick={
                      handleConfirmDelete
                    }
                  >
                    {isDeleting
                      ? 'Deleting…'
                      : 'Delete QR Code'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              type="button"
              onClick={handleSave}
              disabled={
                loading ||
                duplicating ||
                isDeleting ||
                !hasChanges
              }
              className="min-w-[90px]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* -------------------------------------------------------------------- */}
      {/* Main                                                                  */}
      {/* -------------------------------------------------------------------- */}

      <main className="mx-auto max-w-[1440px] px-4 py-6 pb-28 sm:px-6 lg:px-8 lg:py-8 lg:pb-8">
        {/* Page intro */}
        <div className="mb-7">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Edit your QR code
            </h2>

            <span
              className={
                status === 'active'
                  ? 'rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-600'
                  : 'rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-600'
              }
            >
              {status === 'active'
                ? 'Active'
                : 'Paused'}
            </span>
          </div>

          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
            Update your QR content,
            organization, advanced settings and
            appearance.
          </p>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Layout                                                              */}
        {/* ------------------------------------------------------------------ */}

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_390px]">
          {/* ================================================================ */}
          {/* LEFT                                                               */}
          {/* ================================================================ */}

          <div className="min-w-0 space-y-6">
            {/* -------------------------------------------------------------- */}
            {/* 1. QR TYPE                                                       */}
            {/* -------------------------------------------------------------- */}

            <QrTypeSelector
              type={type}
              onTypeChange={
                handleTypeChange
              }
            />

            {/* -------------------------------------------------------------- */}
            {/* 2. CONTENT                                                       */}
            {/* -------------------------------------------------------------- */}

            <QrContentSection
              typeDef={typeDef}
              name={name}
              payload={payload}
              isDynamic={isDynamic}
              onNameChange={
                setName
              }
              onFieldChange={
                handleFieldChange
              }
              onDynamicChange={
                setIsDynamic
              }
            />

            {/* -------------------------------------------------------------- */}
            {/* 3. ORGANIZATION                                                  */}
            {/* -------------------------------------------------------------- */}

            <QrOrganizationSection
              folders={folders}
              tags={tags}
              folderId={folderId}
              selectedTags={
                selectedTags
              }
              onFolderChange={
                setFolderId
              }
              onTagToggle={
                handleTagToggle
              }
            />

            {/* -------------------------------------------------------------- */}
            {/* 4. ADVANCED                                                      */}
            {/* -------------------------------------------------------------- */}

            <QrAdvancedSection
              typeDef={typeDef}
              payload={payload}
              onFieldChange={
                handleFieldChange
              }
              expiresAt={
                expiresAt ?? undefined
              }
              onExpiryChange={
                setExpiresAt
              }
              shortCode={
                shortCode
              }
              onShortCodeChange={
                setShortCode
              }
              suggestedShortCode={
                shortCode
              }
              variant={variant}
              onVariantChange={
                setVariant
              }
              testName={testName}
              onTestNameChange={
                setTestName
              }
            />

            {/* -------------------------------------------------------------- */}
            {/* 5. BRANDING                                                      */}
            {/* -------------------------------------------------------------- */}

            <QrBrandingSection
              style={style}
              onStyleChange={
                setStyle
              }
            />

            {/* -------------------------------------------------------------- */}
            {/* Mobile status action                                             */}
            {/* -------------------------------------------------------------- */}

            <Card className="border-border/70 shadow-sm sm:hidden">
              <CardContent className="p-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={
                    handleToggleStatus
                  }
                  disabled={loading}
                >
                  {status ===
                  'active' ? (
                    <>
                      <Pause className="mr-2 h-4 w-4" />
                      Pause QR Code
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Activate QR Code
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* ================================================================ */}
          {/* RIGHT / PREVIEW                                                    */}
          {/* ================================================================ */}

          <aside className="lg:sticky lg:top-[88px]">
            <Card className="overflow-hidden border-border/70 shadow-sm">
              {/* Preview header */}
              <CardHeader className="border-b border-border/60 bg-muted/[0.12] pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">
                      Live preview
                    </CardTitle>

                    <CardDescription className="mt-1">
                      Changes appear instantly.
                    </CardDescription>
                  </div>

                  <span
                    className={
                      status === 'active'
                        ? 'rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-600'
                        : 'rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold text-amber-600'
                    }
                  >
                    {status === 'active'
                      ? 'Active'
                      : 'Paused'}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {/* QR stage */}
                <div className="flex min-h-[390px] items-center justify-center bg-muted/[0.12] p-6">
                  <div className="w-full max-w-[300px] rounded-2xl border border-border/70 bg-background p-5 shadow-sm">
                    <div
                      ref={
                        canvasWrapperRef
                      }
                      className="flex min-h-[275px] items-center justify-center rounded-xl bg-white p-5"
                    >
                      <QRPreview
                        type={type}
                        payload={
                          payload
                        }
                        isDynamic={
                          isDynamic
                        }
                        shortLinkUrl={
                          shortLinkUrl
                        }
                        style={style}
                      />
                    </div>

                    <div className="mt-4 text-center">
                      <p className="truncate text-sm font-semibold">
                        {name.trim() ||
                          'Untitled QR Code'}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {typeDef?.label ||
                          type}
                        {' · '}
                        {isDynamic
                          ? 'Dynamic'
                          : 'Static'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Download actions */}
                <div className="grid grid-cols-2 gap-2 border-t border-border/60 p-4">
                  <QrPngDownload
                    canvasWrapperRef={
                      canvasWrapperRef
                    }
                    name={name}
                  />

                  <QrPdfDownload
                    canvasWrapperRef={
                      canvasWrapperRef
                    }
                    name={name}
                    typeLabel={
                      typeDef?.label ??
                      type
                    }
                    scanCount={
                      qr.scanCount
                    }
                    isDynamic={
                      isDynamic
                    }
                    shortLinkUrl={
                      isDynamic &&
                      shortCode
                        ? shortLinkUrl
                        : undefined
                    }
                  />
                </div>

                {/* Short URL */}
                {isMounted &&
                  isDynamic &&
                  shortCode && (
                    <div className="border-t border-border/60 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-semibold">
                          Short link
                        </span>

                        <span className="text-[10px] text-emerald-600">
                          Live
                        </span>
                      </div>

                      <div className="rounded-xl border border-border/70 bg-muted/[0.2] p-3">
                        <p className="truncate font-mono text-xs text-muted-foreground">
                          {shortLinkUrl.replace(
                            /^https?:\/\//,
                            ''
                          )}
                        </p>
                      </div>

                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={
                            handleCopyLink
                          }
                        >
                          <Copy className="mr-1.5 h-3.5 w-3.5" />
                          Copy
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a
                            href={
                              shortLinkUrl
                            }
                            target="_blank"
                            rel="noreferrer"
                          >
                            <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                            Open
                          </a>
                        </Button>
                      </div>
                    </div>
                  )}

                {/* Stats */}
                <div className="border-t border-border/60 p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-muted/[0.35] p-3">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        Scans
                      </p>

                      <p className="mt-1 text-lg font-bold">
                        {qr.scanCount ||
                          0}
                      </p>
                    </div>

                    <div className="rounded-xl bg-muted/[0.35] p-3">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        Status
                      </p>

                      <p className="mt-1 text-sm font-bold capitalize">
                        {status}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Unsaved state */}
                {hasChanges && (
                  <div className="border-t border-border/60 bg-amber-500/[0.05] px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />

                      <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                        You have unsaved changes.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>

      {/* -------------------------------------------------------------------- */}
      {/* Mobile sticky save                                                   */}
      {/* -------------------------------------------------------------------- */}

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border/70 bg-background/95 p-3 shadow-lg backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-[1440px] gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-11"
            onClick={
              handleToggleStatus
            }
            disabled={loading}
          >
            {status === 'active' ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>

          <Button
            type="button"
            className="h-11 flex-1"
            onClick={handleSave}
            disabled={
              loading ||
              !hasChanges
            }
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
