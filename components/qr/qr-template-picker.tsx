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
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {QR_TEMPLATES.map((template) => {
        const active = selectedId === template.id;
        return (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect(template.id, { ...template.style })}
            className={cn(
              'group relative flex flex-col items-center gap-2 rounded-lg border p-3 text-center transition-all hover:border-primary/50 hover:bg-accent/40',
              active && 'border-primary bg-primary/5 ring-1 ring-primary'
            )}
          >
            {active && (
              <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="h-3 w-3" />
              </span>
            )}
            <div className="flex h-28 w-full items-center justify-center overflow-hidden rounded-md bg-background">
              <div className="flex items-center justify-center p-2">
                <QRPreview
                  type="url"
                  payload={{ url: 'https://example.com' }}
                  isDynamic={false}
                  style={template.style}
                  size={80}
                />
              </div>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold">{template.name}</p>
              <p className="text-[10px] leading-tight text-muted-foreground">
                {template.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
