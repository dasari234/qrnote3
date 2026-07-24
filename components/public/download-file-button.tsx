'use client';

import { Button } from '@/components/ui/button';
import { ReactNode } from 'react';

/**
 * Downloads a text payload (vCard, iCalendar, etc.) as a file on click.
 */
export function DownloadFileButton({
  content,
  filename,
  mimeType,
  children,
  className,
}: {
  content: string;
  filename: string;
  mimeType: string;
  children: ReactNode;
  className?: string;
}) {
  const handleDownload = () => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Button type="button" className={className} onClick={handleDownload}>
      {children}
    </Button>
  );
}
