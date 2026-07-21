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
  return (
    <div className="space-y-4">
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
    <div className="space-y-2">
      <Label htmlFor={field.key}>
        {field.label}
        {field.required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      {field.type === 'textarea' ? (
        <Textarea
          id={field.key}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : field.type === 'select' ? (
        <Select value={value || field.options?.[0]?.value} onValueChange={onChange}>
          <SelectTrigger id={field.key}>
            <SelectValue placeholder="Select…" />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={field.key}
          type={field.type === 'url' ? 'url' : field.type === 'password' ? 'text' : 'text'}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {field.helpText && (
        <p className="text-xs text-muted-foreground">{field.helpText}</p>
      )}
    </div>
  );
}
