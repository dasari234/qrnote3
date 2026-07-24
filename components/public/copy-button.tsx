'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

export function CopyButton({
  value,
  label = 'Copy',
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    // Return early if there is no text payload to avoid copying empty clip text strings
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      // Fix: Merge classes using cn to guarantee clean visual changes during theme and status switches
      className={cn(
        "shadow-sm transition-all duration-200 active:scale-[0.99] select-none text-foreground border-input bg-background hover:bg-accent hover:text-accent-foreground",
        copied && "bg-green-500/10 text-green-600 border-green-500/30 hover:bg-green-500/15 hover:text-green-600 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/20 dark:hover:bg-green-500/25",
        className
      )}
      onClick={handleCopy}
      disabled={!value}
    >
      {copied ? (
        <Check className="mr-2 h-4 w-4 shrink-0 transition-transform scale-105" />
      ) : (
        <Copy className="mr-2 h-4 w-4 shrink-0 text-muted-foreground/80 group-hover:text-foreground" />
      )}
      <span>{copied ? 'Copied' : label}</span>
    </Button>
  );
}
