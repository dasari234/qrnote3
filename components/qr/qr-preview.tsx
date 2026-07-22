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
  const qrRef = useRef<QRCodeStyling | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Mount detection prevents hydration mismatch between server and client
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

    // Clear old elements to prevent canvas duplication in Strict Mode
    containerRef.current.innerHTML = '';

    if (!qrRef.current) {
      qrRef.current = new QRCodeStyling(options);
    } else {
      qrRef.current.update(options);
    }

    qrRef.current.append(containerRef.current);
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
        ? { borderColor: frameColor, color: frameColor }
        : { borderColor: frameColor };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="inline-flex flex-col items-center" style={frameStyle}>
       <div className={`${frameClass} rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5`}>
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
    dotsOptions.gradient = {
      type: gradientType === 'radial' ? 'radial' : 'linear',
      rotation: gradientRotation,
      colorStops: [
        { offset: 0, color: style?.gradientColor1 || '#0ea5e9' },
        { offset: 1, color: style?.gradientColor2 || '#1e3a8a' },
      ],
    };
    cornersSquareOptions.gradient = dotsOptions.gradient;
    cornersDotOptions.gradient = dotsOptions.gradient;
  } else {
    dotsOptions.color = style?.fgColor || '#000000';
    cornersSquareOptions.color = style?.fgColor || '#000000';
    cornersDotOptions.color = style?.fgColor || '#000000';
  }

  const qrBgColor = style?.bgColor || '#ffffff';

  return {
    width: size,
    height: size,
    type: 'canvas',
    data: value || ' ',
    margin: 16,
    qrOptions: {
        errorCorrectionLevel: style?.logoUrl
          ? 'H'
          : (style?.errorCorrection || 'M'),
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
      margin: 18,
      hideBackgroundDots: true,
      saveAsBlob: true,
      imageSize: 0.22,
      backgroundOptions: {
        color: '#ffffff',
        borderRadius: 18,
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
