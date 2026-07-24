'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { QRField, QRTypeDefinition } from '@/lib/qr/types';

interface QrFormFieldsProps {
  typeDef: QRTypeDefinition;
  payload: Record<string, any>;
  onChange: (key: string, value: string) => void;
}

export function QrFormFields({ typeDef, payload, onChange }: QrFormFieldsProps) {
  // Graceful fallback for empty or uninstantiated type definitions
  if (!typeDef?.fields || typeDef.fields.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground font-medium">
        No specific data fields required for this QR format configuration.
      </p>
    );
  }

  return (
    <div className="space-y-4 text-foreground">
      {typeDef.fields.map((field) => (
        <FieldInput
          key={field.key}
          field={field}
          value={payload[field.key] || ''}
          onChange={(v) => onChange(field.key, v)}
        />
      ))}
    </div>
  );
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: QRField;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2 transition-colors">
      <Label htmlFor={field.key} className="text-foreground/90 font-medium">
        {field.label}
        {field.required && <span className="ml-1 text-destructive font-bold dark:text-red-400">*</span>}
      </Label>

      {field.type === 'textarea' ? (
        <Textarea
          id={field.key}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-background text-foreground border-input placeholder:text-muted-foreground/50 focus-visible:ring-ring font-medium text-sm leading-relaxed"
          rows={3}
        />
      ) : field.type === 'select' ? (
        <Select value={value || field.options?.[0]?.value} onValueChange={onChange}>
          <SelectTrigger
            id={field.key}
            className="w-full bg-background text-foreground border-input focus:ring-ring font-medium text-sm"
          >
            <SelectValue placeholder="Select…" />
          </SelectTrigger>
          <SelectContent className="bg-popover text-popover-foreground border-border shadow-md">
            {field.options?.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className="focus:bg-accent focus:text-accent-foreground cursor-pointer font-medium text-sm py-2"
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={field.key}
          type={field.type === 'url' ? 'url' : field.type === 'password' ? 'password' : 'text'}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-background text-foreground border-input placeholder:text-muted-foreground/50 focus-visible:ring-ring font-medium text-sm"
        />
      )}

      {field.helpText && (
        <p className="text-xs text-muted-foreground/80 font-medium mt-1 leading-normal px-0.5">
          ℹ️ {field.helpText}
        </p>
      )}
    </div>
  );
}
