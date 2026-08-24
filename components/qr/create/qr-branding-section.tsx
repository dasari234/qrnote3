'use client';

import { QrStyleEditor } from '@/components/qr/qr-style-editor';

import {
  Card,
  CardContent,
} from '@/components/ui/card';


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

          <CardContent className="border-t border-border/70 p-5">
            <QrStyleEditor
              style={style}
              onChange={onStyleChange}
            />
          </CardContent>

      </Card>
    </section>
  );
}
