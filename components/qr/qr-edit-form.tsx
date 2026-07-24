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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{qr.name}</h1>
          <p className="text-sm text-muted-foreground">
            {qr.type} · {qr.isDynamic ? 'Dynamic' : 'Static'} · {qr.scanCount} scans
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleToggleStatus} disabled={loading}>
            {status === 'active' ? (
              <>
                <Pause className="mr-2 h-4 w-4" /> Pause
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" /> Activate
              </>
            )}
          </Button>
          <Button variant="outline" onClick={handleDuplicate} disabled={duplicating || loading}>
            <Copy className="mr-2 h-4 w-4" /> Duplicate
          </Button>

          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={loading || isDeleting}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Delete this QR code?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete your QR code and completely stop all traffic redirects.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-4 gap-2 sm:gap-0">
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isDeleting}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                >
                  {isDeleting ? 'Deleting…' : 'Delete'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button onClick={handleSave} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: form */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
              <CardDescription>Edit your QR code content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">QR Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>QR Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as QRType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {QR_TYPES.map((t) => (
                      <SelectItem key={t.type} value={t.type}>
                        {t.label} — {t.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <QrFormFields typeDef={typeDef} payload={payload} onChange={handleFieldChange} />

              {/* Folder */}
              <div className="space-y-2">
                <Label htmlFor="folder">Folder</Label>
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
                          className={`rounded-full border px-3 py-1 text-xs font-medium transition ${active
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

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="dynamic">Dynamic QR</Label>
                  <p className="text-xs text-muted-foreground">
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

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Branding & Style</CardTitle>
            </CardHeader>
            <CardContent>
              <QrStyleEditor style={style} onChange={setStyle} />
            </CardContent>
          </Card>
        </div>

        {/* Right: preview */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 space-y-4">
            <Card>
              <CardHeader className="pb-0">
                <CardTitle className="text-lg">Preview</CardTitle>
              </CardHeader>

              <CardContent className="flex flex-col items-center gap-4 pt-1 pb-4">
                <div ref={canvasWrapperRef}>
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
                  <div className="w-full space-y-2">
                    <div className="flex items-center gap-2 rounded-md border bg-muted/30 p-2 text-xs">
                      <span className="truncate text-muted-foreground">
                        {shortLinkUrl.replace(/^https?:\/\//, '')}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={handleCopyLink}>
                        <Copy className="mr-2 h-3 w-3" /> Copy
                      </Button>
                      <Button asChild variant="outline" size="sm" className="flex-1">
                        <a href={shortLinkUrl} target="_blank" rel="noreferrer">
                          <ExternalLink className="mr-2 h-3 w-3" /> Open
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
