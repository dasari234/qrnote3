'use client';

import { QrStyleEditor } from '@/components/qr/qr-style-editor';

import {
  Card,
  CardContent,
} from '@/components/ui/card';

import {
  ChevronDown,
  Palette,
} from 'lucide-react';

import { QRStyle } from '@/lib/types';

import { useState } from 'react';

interface Props {
  style: QRStyle;
  onStyleChange: (
    style: QRStyle
  ) => void;
}

export function QrBrandingSection({
  style,
  onStyleChange,
}: Props) {
  const [open, setOpen] =
    useState(false);

  return (
    <section>
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <button
          type="button"
          onClick={() =>
            setOpen((previous) => !previous)
          }
          className="flex w-full items-center justify-between gap-4 p-5 text-left hover:bg-muted/30"
          aria-expanded={open}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Palette className="h-4 w-4" />
            </div>

            <div>
              <h2 className="text-sm font-semibold">
                Branding & appearance
              </h2>

              <p className="mt-0.5 text-xs text-muted-foreground">
                Customize colors, templates and QR
                appearance
              </p>
            </div>
          </div>

          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${
              open ? 'rotate-180' : ''
            }`}
          />
        </button>

        {open && (
          <CardContent className="border-t border-border/70 p-5">
            <QrStyleEditor
              style={style}
              onChange={onStyleChange}
            />
          </CardContent>
        )}
      </Card>
    </section>
  );
}
