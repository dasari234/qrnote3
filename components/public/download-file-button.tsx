'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

/**
 * Downloads a text payload (vCard, iCalendar, etc.) as a file on click.
 * Leverages native button themes to shift gracefully across light and dark states.
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
    // Return early if there is no payload to avoid generating corrupted empty files
    if (!content) return;

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
    <Button
      type="button"
      // Fix: Merge classes using cn to guarantee clean utility token updates across theme shifts
      className={cn(
        "shadow-sm transition-all duration-200 active:scale-[0.99] hover:opacity-95 select-none",
        className
      )}
      onClick={handleDownload}
    >
      {children}
    </Button>
  );
}
