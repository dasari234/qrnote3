'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { deleteQrCode, updateQrCode, updateQrStatus, duplicateQrCode } from '@/lib/qr/actions';
import { QR_TYPES } from '@/lib/qr/types';
import { QRStyle, QRType } from '@/lib/types';
import { Copy, ExternalLink, Pause, Play, Save, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { QrPdfDownload } from './qr-pdf-download';
import { QrPngDownload } from './qr-png-download';
import { cn } from '@/lib/utils';
interface Props {
  qr: any;
  folders: { id: string; name: string }[];
  tags: { id: string; name: string; color: string }[];
  selectedTagIds: string[];
}

export function QrEditForm({ qr, folders, tags, selectedTagIds }: Props) {
  const router = useRouter();
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [name, setName] = useState(qr.name);
  const [type, setType] = useState<QRType>(qr.type);
  const [payload, setPayload] = useState<Record<string, any>>(qr.payload || {});
  const [isDynamic, setIsDynamic] = useState(qr.isDynamic);
  const [style, setStyle] = useState<QRStyle>(
    (qr.style as QRStyle) || { fgColor: '#000000', bgColor: '#ffffff' }
  );
  const [status, setStatus] = useState(qr.status);
  const [folderId, setFolderId] = useState<string>(qr.folderId || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(selectedTagIds);
  const [loading, setLoading] = useState(false);
  const [duplicating, setDuplicating] = useState(false);

  // New state for A/B testing, expiry, vanity slug
  const [expiresAt, setExpiresAt] = useState<string | null>(
    qr.expiresAt ? new Date(qr.expiresAt).toISOString().split('T')[0] : null
  );
  const [shortCode, setShortCode] = useState(qr.shortCode || '');
  const [variant, setVariant] = useState<string | null>(qr.variant || null);
  const [testName, setTestName] = useState(qr.testName || '');

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const typeDef = QR_TYPES.find((t) => t.type === type)!;
  const shortLinkUrl = useMemo(() => {
    if (isMounted && typeof window !== 'undefined' && qr.shortCode) {
      return `${window.location.origin}/q/${qr.shortCode}`;
    }
    return `/q/${qr.shortCode || 'preview'}`;
  }, [isMounted, qr.shortCode]);

  const handleFieldChange = (key: string, value: string) => {
    setPayload((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
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
        folderId: folderId || null,
        tagIds: selectedTags,
        customShortCode: shortCode || undefined,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        variant: variant || null,
        testName: testName || undefined,
      });
      toast.success('QR code updated');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await handleDelete(); // Executes your original delete block safely
      setIsDeleteDialogOpen(false);
    } catch (err) {
      // Errors handled gracefully inside your original handleDelete block
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicate = async () => {
    setDuplicating(true);
    try {
      const result = await duplicateQrCode(qr.id);
      toast.success('QR code duplicated!');
      router.push(`/dashboard/qr/${result.id}`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to duplicate QR code');
    }
    setDuplicating(false);
  };

  const handleDelete = async () => {
    try {
      await deleteQrCode(qr.id);
      toast.success('QR code deleted');
      router.push('/dashboard/qr');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleToggleStatus = async () => {
    const next = status === 'active' ? 'paused' : 'active';
    setStatus(next);
    try {
      await updateQrStatus(qr.id, next);
      toast.success(next === 'active' ? 'QR activated' : 'QR paused');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleCopyLink = () => {
    if (!qr.shortCode) {
      toast.error('Static QR codes do not have a short link');
      return;
    }
    const link = `${window.location.origin}/q/${qr.shortCode}`;
    navigator.clipboard.writeText(link);
    toast.success('Short link copied');
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4 mb-6 text-foreground">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{qr.name}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            <span className="capitalize">{qr.type.replace('_', ' ')}</span> · {qr.isDynamic ? 'Dynamic' : 'Static'} · {qr.scanCount} scans
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Button variant="outline" onClick={handleToggleStatus} disabled={loading} className="hover:bg-accent hover:text-accent-foreground shadow-sm">
            {status === 'active' ? (
              <>
                <Pause className="mr-2 h-4 w-4 text-muted-foreground/80" /> Pause
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4 text-primary" /> Activate
              </>
            )}
          </Button>

          <Button variant="outline" onClick={handleDuplicate} disabled={duplicating || loading} className="hover:bg-accent hover:text-accent-foreground shadow-sm">
            <Copy className="mr-2 h-4 w-4 text-muted-foreground/80" /> Duplicate
          </Button>

          {/* Radix Dialog Confirmation Modal */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={loading || isDeleting} className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 shadow-sm">
                <Trash2 className="mr-2 h-4 w-4 text-destructive/80" /> Delete
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-popover text-popover-foreground border-border shadow-lg animate-in fade-in-0 zoom-in-95 duration-200">
              <DialogHeader>
                <DialogTitle className="text-foreground font-bold">Delete this QR code?</DialogTitle>
                <DialogDescription className="text-muted-foreground text-sm mt-1 leading-relaxed">
                  This action cannot be undone. This will permanently delete your QR code and completely stop all traffic redirects.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-6 gap-2 sm:gap-0">
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isDeleting} className="hover:bg-accent hover:text-accent-foreground">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="shadow-sm transition-transform active:scale-[0.99]"
                >
                  {isDeleting ? 'Deleting…' : 'Delete'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button onClick={handleSave} disabled={loading} className="shadow-sm transition-transform active:scale-[0.99]">
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>


      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: form */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="bg-card text-card-foreground border-border shadow-sm transition-colors duration-200">
            <CardHeader>
              <CardTitle className="text-lg text-foreground font-bold">Details</CardTitle>
              <CardDescription className="text-muted-foreground">Edit your QR code content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 bg-card">
              {/* QR Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground font-medium">QR Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-background text-foreground border-input placeholder:text-muted-foreground/50 focus-visible:ring-ring font-medium text-sm"
                />
              </div>

              {/* QR Type Selector Menu Dropdown */}
              <div className="space-y-2">
                <Label className="text-foreground font-medium">QR Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as QRType)}>
                  <SelectTrigger className="w-full bg-background text-foreground border-input focus:ring-ring font-medium text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover text-popover-foreground border-border shadow-md">
                    {QR_TYPES.map((t) => (
                      <SelectItem
                        key={t.type}
                        value={t.type}
                        className="focus:bg-accent focus:text-accent-foreground cursor-pointer font-medium text-sm py-2"
                      >
                        {t.label} — <span className="text-muted-foreground font-normal text-xs">{t.description}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <QrFormFields typeDef={typeDef} payload={payload} onChange={handleFieldChange} />

              {/* Folder Selector Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="folder" className="text-foreground font-medium">Folder</Label>
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

              {/* Tags Selector Matrix */}
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

              {/* Dynamic Action Switch Tray Container */}
              <div className="flex items-center justify-between rounded-xl border border-border p-4 bg-muted/10 dark:bg-transparent shadow-inner">
                <div className="space-y-0.5 pr-4">
                  <Label htmlFor="dynamic" className="text-foreground font-semibold leading-none">Dynamic QR</Label>
                  <p className="text-xs text-muted-foreground leading-normal mt-1">
                    Dynamic QRs can be edited without reprinting and track scans.
                  </p>
                </div>
                <Switch
                  id="dynamic"
                  checked={isDynamic}
                  onCheckedChange={setIsDynamic}
                  disabled={!!qr.shortCode}
                />
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
            variant={variant}
            onVariantChange={setVariant}
            testName={testName}
            onTestNameChange={setTestName}
          />

          <Card className="bg-card text-card-foreground border-border shadow-sm transition-colors duration-200">
            <CardHeader>
              <CardTitle className="text-lg text-foreground font-bold">Branding & Style</CardTitle>
            </CardHeader>
            <CardContent>
              <QrStyleEditor style={style} onChange={setStyle} />
            </CardContent>
          </Card>

        </div>

        {/* Right: preview */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 space-y-4">
            <Card className="bg-card text-card-foreground border-border shadow-sm transition-colors duration-200">
              <CardHeader className="pb-0">
                <CardTitle className="text-lg text-foreground font-bold">Preview</CardTitle>
              </CardHeader>

              <CardContent className="flex flex-col items-center gap-4 pt-1 pb-4 bg-card">
                <div ref={canvasWrapperRef} className="p-1 rounded-lg bg-transparent">
                  <QRPreview
                    type={type}
                    payload={payload}
                    isDynamic={isDynamic}
                    shortLinkUrl={shortLinkUrl}
                    style={style}
                  />
                </div>
                <QrPngDownload
                  canvasWrapperRef={canvasWrapperRef}
                  name={name}
                />

                <QrPdfDownload
                  canvasWrapperRef={canvasWrapperRef}
                  name={name}
                  typeLabel={typeDef?.label ?? type}
                  scanCount={qr.scanCount}
                  isDynamic={isDynamic}
                  shortLinkUrl={isDynamic && qr.shortCode ? shortLinkUrl : undefined}
                />

                {isMounted && qr.isDynamic && qr.shortCode && (
                  <div className="w-full space-y-3 pt-2 border-t border-border/40 mt-1">
                    {/* Short Link URL Pill Container */}
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 dark:bg-muted/10 p-2.5 text-xs shadow-inner">
                      <span className="truncate text-foreground/80 font-mono font-medium">
                        {shortLinkUrl.replace(/^https?:\/\//, '')}
                      </span>
                    </div>

                    {/* Action Button Grid */}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 hover:bg-accent hover:text-accent-foreground transition-all shadow-sm" onClick={handleCopyLink}>
                        <Copy className="mr-1.5 h-3.5 w-3.5 text-muted-foreground/80" /> Copy
                      </Button>
                      <Button asChild variant="outline" size="sm" className="flex-1 hover:bg-accent hover:text-accent-foreground transition-all shadow-sm">
                        <a href={shortLinkUrl} target="_blank" rel="noreferrer">
                          <ExternalLink className="mr-1.5 h-3.5 w-3.5 text-muted-foreground/80" /> Open
                        </a>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}
