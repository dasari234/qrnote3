'use client';

import { QRPreview } from '@/components/qr/qr-preview';
import { QR_TEMPLATES } from '@/lib/qr/templates';
import { QRStyle } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface QrTemplatePickerProps {
  selectedId?: string;
  onSelect: (templateId: string, style: QRStyle) => void;
}

export function QrTemplatePicker({ selectedId, onSelect }: QrTemplatePickerProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 pt-3 pb-1 overflow-visible">
      {QR_TEMPLATES.map((template) => {
        const active = selectedId === template.id;
        return (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect(template.id, { ...template.style })}
            className={cn(
              'group relative flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-3 text-center transition-all duration-200 select-none hover:border-primary/40 hover:bg-muted/30 dark:hover:bg-muted/10 overflow-visible',
              active && 'border-primary bg-primary/5 ring-1 ring-primary dark:bg-primary/10 shadow-sm'
            )}
          >
            {active && (
              <span className="absolute -top-1.5 -right-1.5 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md animate-in fade-in-0 zoom-in-95 duration-150">
                <Check className="h-3 w-3" />
              </span>
            )}

            {/* Contextual Backdrop Matrix Layer */}
            <div className="flex h-28 w-full items-center justify-center overflow-hidden rounded-md bg-muted/40 border border-border/30 dark:bg-muted/20 shrink-0">
              <div className="flex items-center justify-center p-2 group-hover:scale-105 transition-transform duration-200">
                <QRPreview
                  type="url"
                  payload={{ url: 'https://example.com' }}
                  isDynamic={false}
                  style={template.style}
                  size={80}
                />
              </div>
            </div>

            <div className="space-y-1 w-full">
              <p className="text-xs font-bold text-foreground leading-none truncate">{template.name}</p>
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
