'use client';

import { QRPreview } from '@/components/qr/qr-preview';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

import { Check, Loader2 } from 'lucide-react';

import { QRStyle, QRType } from '@/lib/types';

interface Props {
  type: QRType;
  typeLabel?: string;
  payload: Record<string, any>;
  name: string;
  isDynamic: boolean;
  style: QRStyle;
  loading: boolean;
}

export function QrCreatePreview({
  type,
  typeLabel,
  payload,
  name,
  isDynamic,
  style,
  loading,
}: Props) {
  const shortLinkUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/q/preview`
      : '/q/preview';

  return (
    <aside className="lg:sticky lg:top-[88px]">
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardHeader className="border-b border-border/60 bg-muted/[0.12] pb-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">
                Live preview
              </CardTitle>

              <CardDescription className="mt-1">
                Your QR code updates as you edit.
              </CardDescription>
            </div>

            <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />

              {isDynamic
                ? 'Dynamic'
                : 'Static'}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="flex min-h-[390px] items-center justify-center bg-muted/[0.12] p-6">
            <div className="w-full max-w-[300px] rounded-2xl border border-border/70 bg-background p-5 shadow-sm">
              <div className="flex min-h-[290px] items-center justify-center rounded-xl bg-white p-5">
                <QRPreview
                  type={type}
                  payload={payload}
                  isDynamic={isDynamic}
                  shortLinkUrl={
                    shortLinkUrl
                  }
                  style={style}
                />
              </div>

              <div className="mt-4 text-center">
                <p className="truncate text-sm font-semibold">
                  {name.trim() ||
                    'Untitled QR Code'}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {typeLabel || 'QR Code'}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-border/60 p-4">
            <div className="flex items-center gap-2 rounded-lg bg-primary/[0.06] px-3 py-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                {loading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
              </div>

              <div>
                <p className="text-xs font-semibold">
                  {loading
                    ? 'Creating QR code…'
                    : 'Ready to create'}
                </p>

                <p className="text-[11px] text-muted-foreground">
                  {isDynamic
                    ? 'Dynamic QR with analytics enabled'
                    : 'Static QR code'}
                </p>
              </div>
            </div>
          </div>

          <div className="hidden border-t border-border/60 p-4 lg:block">
            <p className="text-center text-[11px] text-muted-foreground">
              You can edit your QR code later.
            </p>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
