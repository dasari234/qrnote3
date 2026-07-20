'use client';

import { QRCodeCanvas } from 'qrcode.react';
import { useMemo } from 'react';
import { QRType, QRStyle } from '@/lib/types';
import { buildQRValue } from '@/lib/qr/factory';

interface QRPreviewProps {
  type: QRType;
  payload: Record<string, any>;
  isDynamic: boolean;
  shortLinkUrl?: string;
  style?: QRStyle;
  size?: number;
}

export function QRPreview({
  type,
  payload,
  isDynamic,
  shortLinkUrl,
  style,
  size = 220,
}: QRPreviewProps) {
  const value = useMemo(
    () => buildQRValue(type, payload, { dynamic: isDynamic, shortLinkUrl }),
    [type, payload, isDynamic, shortLinkUrl]
  );

  const fgColor = style?.fgColor || '#000000';
  const bgColor = style?.bgColor || '#ffffff';
  const level = style?.errorCorrection || 'M';
  const frame = style?.frame || 'none';
  const frameColor = style?.frameColor || '#000000';
  const caption = style?.caption || 'Scan me';

  const hasLogo = !!style?.logoUrl;

  const qrElement = (
    <div className="rounded-lg bg-white p-3">
      {value ? (
        <QRCodeCanvas
          value={value}
          size={size}
          fgColor={fgColor}
          bgColor={bgColor}
          level={level}
          includeMargin={false}
          imageSettings={
            hasLogo
              ? {
                  src: style!.logoUrl!,
                  height: size * 0.2,
                  width: size * 0.2,
                  excavate: true,
                }
              : undefined
          }
        />
      ) : (
        <div
          className="flex items-center justify-center text-sm text-muted-foreground"
          style={{ width: size, height: size }}
        >
          Fill in the form to preview
        </div>
      )}
    </div>
  );

  const frameClass =
    frame === 'rounded'
      ? 'rounded-2xl p-4'
      : frame === 'border'
      ? 'rounded-lg border-4 p-4'
      : frame === 'caption'
      ? 'rounded-xl p-4 pb-2'
      : '';

  const frameStyle =
    frame !== 'none' ? { borderColor: frameColor, color: frameColor } : {};

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="inline-flex flex-col items-center"
        style={frameStyle}
      >
        <div className={frameClass}>{qrElement}</div>
        {frame === 'caption' && (
          <p
            className="mt-2 text-sm font-semibold uppercase tracking-wide"
            style={{ color: frameColor }}
          >
            {caption}
          </p>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {isDynamic && shortLinkUrl
          ? `Dynamic · ${shortLinkUrl.replace(/^https?:\/\//, '')}`
          : 'Static QR'}
      </p>
    </div>
  );
}
