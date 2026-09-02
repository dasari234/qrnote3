'use client';

import { FileText, Loader2, X } from 'lucide-react';

import { Button } from '@/components/ui/button';

export interface ChatAttachment {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  url?: string;
  status?: string;
}

interface AttachmentPreviewProps {
  attachments: ChatAttachment[];
  onRemove?: (id: string) => void;
}

export default function AttachmentPreview({
  attachments,
  onRemove,
}: AttachmentPreviewProps) {
  if (!attachments.length) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 px-2 pb-2">
      {attachments.map((attachment) => {
        const isImage = attachment.mimeType.startsWith('image/');

        const isProcessing = attachment.status === 'processing';

        return (
          <div
            key={attachment.id}
            className="relative flex items-center gap-2 rounded-xl border bg-muted/40 p-2 pr-8"
          >
            {isImage && attachment.url ? (
              <img
                src={attachment.url}
                alt={attachment.fileName}
                className="h-12 w-12 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-background">
                {isProcessing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <FileText className="h-5 w-5" />
                )}
              </div>
            )}

            <div className="min-w-0">
              <p className="max-w-[180px] truncate text-sm font-medium">
                {attachment.fileName}
              </p>

              <p className="text-xs text-muted-foreground">
                {isProcessing
                  ? 'Processing...'
                  : isImage
                    ? 'Image'
                    : 'Document'}
              </p>
            </div>

            {onRemove && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1 h-6 w-6"
                onClick={() => onRemove(attachment.id)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
