'use client';

import { buildQRValue } from '@/lib/qr/factory';
import { QRStyle, QRType } from '@/lib/types';
import type { Options } from 'qr-code-styling';
import QRCodeStyling from 'qr-code-styling';
import { useEffect, useMemo, useRef, useState } from 'react';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const value = useMemo(
    () => buildQRValue(type, payload, { dynamic: isDynamic, shortLinkUrl }),
    [type, payload, isDynamic, shortLinkUrl]
  );

  const options = useMemo<Options>(() => buildOptions(value, style, size), [value, style, size]);

  useEffect(() => {
    if (!isMounted || !containerRef.current) return;

    // Clear container to prevent canvas duplication
    containerRef.current.innerHTML = '';

    // Always instantiate a fresh copy to prevent internal canvas state/gradient pollution
    const qrCode = new QRCodeStyling(options);
    qrCode.append(containerRef.current);
  }, [options, isMounted]);

  const frame = style?.frame || 'none';
  const frameColor = style?.frameColor || '#000000';
  const caption = style?.caption || 'Scan me';

  const frameClass =
    frame === 'rounded'
      ? 'rounded-2xl p-4'
      : frame === 'border'
      ? 'rounded-lg border-4 p-4'
      : frame === 'caption'
      ? 'rounded-xl border-2 p-4 pb-2'
      : '';

  const frameStyle =
    frame === 'none'
      ? {}
      : frame === 'caption'
      ? { borderStyle: 'solid', borderColor: frameColor, color: frameColor }
      : { borderStyle: 'solid', borderColor: frameColor };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`inline-flex flex-col items-center ${frameClass}`} style={frameStyle}>
        <div>
          <div ref={containerRef} />
        </div>
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
        {isMounted && isDynamic && shortLinkUrl
          ? `Dynamic · ${shortLinkUrl.replace(/^https?:\/\//, '')}`
          : 'Static QR'}
      </p>
    </div>
  );
}

export function buildOptions(value: string, style: QRStyle | undefined, size: number): Options {
  const gradientType = style?.gradientType || 'solid';
  const isGradient = gradientType !== 'solid';

  const dotsOptions: any = {
    type: style?.dotsType || 'square',
  };
  const cornersSquareOptions: any = {
    type: style?.cornerSquareType || 'square',
  };
  const cornersDotOptions: any = {
    type: style?.cornerDotType || 'square',
  };

  if (isGradient) {
    const gradientRotation = getGradientRotation(gradientType);
    const gradientObj = {
      type: gradientType === 'radial' ? 'radial' : 'linear',
      rotation: gradientRotation,
      colorStops: [
        { offset: 0, color: style?.gradientColor1 || '#0ea5e9' },
        { offset: 1, color: style?.gradientColor2 || '#1e3a8a' },
      ],
    };
    dotsOptions.gradient = gradientObj;
    cornersSquareOptions.gradient = gradientObj;
    cornersDotOptions.gradient = gradientObj;

    // Explicitly delete standard color to avoid merge collision
    delete dotsOptions.color;
    delete cornersSquareOptions.color;
    delete cornersDotOptions.color;
  } else {
    dotsOptions.color = style?.fgColor || '#000000';
    cornersSquareOptions.color = style?.fgColor || '#000000';
    cornersDotOptions.color = style?.fgColor || '#000000';

    // Explicitly delete old gradient configurations so the library builds solid colors properly
    delete dotsOptions.gradient;
    delete cornersSquareOptions.gradient;
    delete cornersDotOptions.gradient;
  }

  const qrBgColor = style?.bgColor || '#ffffff';

  return {
    width: size,
    height: size,
    type: 'canvas',
    data: value || ' ',
    margin: style?.margin ?? 10,
    qrOptions: {
      errorCorrectionLevel: (style?.errorCorrection || 'M') as any,
    },
    dotsOptions,
    cornersSquareOptions,
    cornersDotOptions,
    backgroundOptions: {
      color: qrBgColor,
    },
    image: style?.logoUrl || undefined,
    imageOptions: {
      crossOrigin: 'anonymous',
      margin: 10,
      hideBackgroundDots: true,
      imageSize: 0.6,
      backgroundOptions: {
        color: qrBgColor,
        borderRadius: 80,
      },
    } as any,
  };
}

function getGradientRotation(type: string): number {
  switch (type) {
    case 'horizontal':
      return 0;
    case 'vertical':
      return Math.PI / 2;
    case 'diagonal':
      return Math.PI / 4;
    case 'radial':
      return 0;
    default:
      return 0;
  }
}
