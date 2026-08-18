'use client';

import { Button } from '@/components/ui/button';

import {
    ArrowLeft,
    Loader2,
    Save,
} from 'lucide-react';

interface Props {
  loading: boolean;
  onBack: () => void;
}

export function QrCreateHeader({
  loading,
  onBack,
}: Props) {
  return (
    <header className="sticky top-20 z-30 border-b border-border/70 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onBack}
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
              Create, customize and manage your QR
              code
            </p>
          </div>
        </div>

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
    </header>
  );
}
