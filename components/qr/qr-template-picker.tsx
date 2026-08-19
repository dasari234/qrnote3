'use client';

import { QRPreview } from '@/components/qr/qr-preview';
import { QR_TEMPLATES } from '@/lib/qr/templates';
import { QRStyle } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { useCallback } from 'react';

interface QrTemplatePickerProps {
  selectedId?: string;
  onSelect: (templateId: string, style: QRStyle) => void;
}

export function QrTemplatePicker({ selectedId, onSelect }: QrTemplatePickerProps) {
  const handleSelect = useCallback((id: string, style: QRStyle) => {
    onSelect(id, { ...style });
  }, [onSelect]);

  return (
    <div
      role="radiogroup"
      aria-label="Select QR code template"
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 pt-4 pb-1 overflow-visible"
    >
      {QR_TEMPLATES.map((template) => {
        const isActive = selectedId === template.id;

        return (
          <button
            key={template.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => handleSelect(template.id, template.style)}
               className={cn(
              'group relative flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-3 text-center transition-all duration-200 select-none overflow-visible',
              'hover:border-primary/40 hover:bg-muted/30 dark:hover:bg-muted/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              isActive && 'border-primary ring-2 ring-primary dark:ring-primary shadow-sm'
            )}
          >
            {/* Visual Indicator Layer */}
            {isActive && (
              <span
                className="absolute -top-1.5 -right-1.5 z-30 flex h-5 w-5 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black shadow-md animate-in fade-in-0 zoom-in-95 duration-150"
                aria-hidden="true"
              >
                <Check className="h-3 w-3 stroke-[3]" />
              </span>
            )}

            {isActive && <span className="sr-only">(Selected)</span>}

            <div className="flex w-full items-center justify-center pt-2 pb-1 overflow-visible shrink-0">
              <div className="flex items-center justify-center bg-white dark:bg-zinc-900 p-4  group-hover:scale-105 transition-transform duration-200 aspect-square w-28 h-30">
                <QRPreview
                  type="url"
                  payload={{ url: 'https://example.com' }}
                  isDynamic={false}
                  style={template.style}
                  size={64}
                />
              </div>
            </div>

            {/* Template Meta Context */}
            <div className="space-y-1 w-full pt-1">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block">
                Static QR
              </span>
              <p className="text-xs font-bold text-foreground leading-none truncate">
                {template.name}
              </p>
              <p className="text-[10px] leading-snug text-muted-foreground min-h-[30px] px-1 line-clamp-2 text-center">
                {template.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
