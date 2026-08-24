'use client';

import { useEffect, useState } from 'react';

import { QrStyleEditor } from '@/components/qr/qr-style-editor';

import {
  Card,
  CardContent,
} from '@/components/ui/card';

import { QRStyle } from '@/lib/types';

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
  const [draftStyle, setDraftStyle] =
    useState<QRStyle>(style);

  /*
   * Sync draft when the parent style changes.
   *
   * Important:
   * This does NOT call onStyleChange().
   */
  useEffect(() => {
    setDraftStyle(style);
  }, [style]);

  const handleDraftChange = (
    nextStyle: QRStyle
  ) => {
    setDraftStyle(nextStyle);
  };

  const handleApply = () => {
    onStyleChange(draftStyle);
  };

  const handleReset = () => {
    setDraftStyle(style);
  };

  const hasChanges =
    JSON.stringify(draftStyle) !==
    JSON.stringify(style);

  return (
    <section>
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardContent className="p-5">
          <QrStyleEditor
            style={draftStyle}
            onChange={
              handleDraftChange
            }
          />

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-border/70 pt-5">
            <button
              type="button"
              onClick={handleReset}
              disabled={!hasChanges}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium transition hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
            >
              Reset
            </button>

            <button
              type="button"
              onClick={handleApply}
              disabled={!hasChanges}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
            >
              Apply branding
            </button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
