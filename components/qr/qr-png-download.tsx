'use client';

import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface QrPngDownloadProps {
  /** ref to the container that holds the <canvas> element */
  canvasWrapperRef: React.RefObject<HTMLDivElement | null>;
  /** QR code name used as filename */
  name: string;
  className?: string;
}

export function QrPngDownload({ canvasWrapperRef, name, className }: QrPngDownloadProps) {
  const [generating, setGenerating] = useState(false);

  const handleDownloadPng = async () => {
    const canvas = canvasWrapperRef.current?.querySelector('canvas');
    if (!canvas) {
      toast.error('QR canvas not ready — please wait a moment and try again.');
      return;
    }

    setGenerating(true);
    try {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      // Clean string to build a safe slugged filename
      const safeName = name.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'qr-code';
      a.download = `${safeName}.png`;
      a.click();
    } catch (err: any) {
      toast.error('Failed to download PNG: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button
      variant="outline"
      className={className ?? 'w-full'}
      onClick={handleDownloadPng}
      disabled={generating}
    >
      {generating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating PNG…
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Download PNG
        </>
      )}
    </Button>
  );
}
