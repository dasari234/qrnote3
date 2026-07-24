'use client';

import { buildQRValue } from '@/lib/qr/factory';
import { QRStyle, QRType } from '@/lib/types';
import type { Options } from 'qr-code-styling';
import QRCodeStyling from 'qr-code-styling';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

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
  const { resolvedTheme } = useTheme(); // Detect absolute dark/light state safely

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
  const rawFrameColor = style?.frameColor || '#000000';
  const caption = style?.caption || 'Scan me';

  // Fix: Intercept raw #000000 settings in dark mode to inject theme lines, otherwise respect custom colors
  const isDarkMode = resolvedTheme === 'dark';
  const useThemeFallback = isDarkMode && (rawFrameColor === '#000000' || rawFrameColor.toLowerCase() === '#ffffff');

  const activeFrameColor = useThemeFallback ? 'var(--border)' : rawFrameColor;
  const activeTextColor = useThemeFallback ? 'var(--foreground)' : rawFrameColor;

  const frameClass =
    frame === 'rounded'
      ? 'rounded-2xl border-4 border-solid p-4 overflow-hidden bg-white dark:bg-card'
      : frame === 'border'
        ? 'rounded-none border-4 border-solid p-4 bg-white dark:bg-card'
        : frame === 'caption'
          ? 'rounded-lg border-2 border-solid p-4 pb-3 bg-white dark:bg-card'
          : 'bg-white p-2 rounded-xl border border-border/40 shadow-sm';

  const frameStyle =
    frame === 'none'
      ? {}
      : { borderStyle: 'solid', borderColor: activeFrameColor };

  return (
    <div className="flex flex-col items-center gap-3 select-none pt-10 pb-4">
      <div
        className={cn(
          // Fix: Added isolate, forced overflow-hidden, and cleaned up padding properties to lock in the rounded corners
          "flex w-fit flex-col items-center p-3 rounded-xl border border-border/40 bg-white shadow-sm transition-all duration-200 dark:bg-card overflow-hidden isolate",
          frameClass
        )}
        style={frameStyle}
      >
        {/* Fix: Added an absolute white canvas base plate wrapper to ensure standard optical contrast boundaries clip cleanly */}
        <div className="overflow-hidden rounded-lg bg-white p-1">
          <div ref={containerRef} className="flex items-center justify-center" />
        </div>
        {frame === 'caption' && (
          <p
            className="mt-2.5 text-[10px] font-black uppercase tracking-widest text-center leading-none max-w-[180px] truncate"
            style={{ color: activeTextColor }}
          >
            {caption}
          </p>
        )}
      </div>

      <p className="text-xs text-muted-foreground font-medium font-mono text-center max-w-[240px] truncate">
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

  // Preserve clear scanner contrast definitions
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
