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

import {
  QRField,
  QRTypeDefinition,
} from '@/lib/qr/types';
import { DateField } from './date-field';
import { DateTimeField } from './date-time-field';
import { TimeField } from './time-field';


interface QrFormFieldsProps {
  typeDef: QRTypeDefinition;
  payload: Record<string, any>;
  onChange: (
    key: string,
    value: string
  ) => void;
}

export function QrFormFields({
  typeDef,
  payload,
  onChange,
}: QrFormFieldsProps) {
  if (
    !typeDef?.fields ||
    typeDef.fields.length === 0
  ) {
    return (
      <p className="py-4 text-center text-sm font-medium text-muted-foreground">
        No specific data fields required for
        this QR format configuration.
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
          onChange={(value) =>
            onChange(field.key, value)
          }
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
  onChange: (value: string) => void;
}) {
  const inputId = `qr-field-${field.key}`;

  return (
  <div className="space-y-2 transition-colors">
    <Label
      htmlFor={inputId}
      className="font-medium text-foreground/90"
    >
      {field.label}

      {field.required && (
        <span className="ml-1 font-bold text-destructive dark:text-red-400">
          *
        </span>
      )}
    </Label>

    {field.type === 'date' ? (
      <DateField
        id={inputId}
        value={value}
        placeholder={
          field.placeholder ||
          'Select date'
        }
        dateConfig={field.dateConfig}
        onChange={onChange}
      />
    ) : field.type === 'datetime' ? (
      <DateTimeField
        id={inputId}
        value={value}
        placeholder={
          field.placeholder ||
          'Select date & time'
        }
        dateConfig={field.dateConfig}
        onChange={onChange}
      />
    ) : field.type === 'time' ? (
      <TimeField
        id={inputId}
        value={value}
        placeholder={
          field.placeholder ||
          'Select time'
        }
        timeFormat={
          field.dateConfig?.timeFormat ??
          '12h'
        }
        onChange={onChange}
      />
    ) : field.type === 'textarea' ? (
      <Textarea
        id={inputId}
        placeholder={field.placeholder}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="min-h-[90px] border-input bg-background text-sm font-medium text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-ring"
        rows={3}
      />
    ) : field.type === 'select' ? (
      <Select
        value={
          value ||
          field.options?.[0]?.value ||
          ''
        }
        onValueChange={onChange}
      >
        <SelectTrigger
          id={inputId}
          className="w-full border-input bg-background text-sm font-medium text-foreground focus:ring-ring"
        >
          <SelectValue placeholder="Select…" />
        </SelectTrigger>

        <SelectContent className="border-border bg-popover text-popover-foreground shadow-md">
          {field.options?.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="cursor-pointer py-2 text-sm font-medium focus:bg-accent focus:text-accent-foreground"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    ) : (
      <Input
        id={inputId}
        type={
          field.type === 'url'
            ? 'url'
            : field.type === 'password'
              ? 'password'
              : 'text'
        }
        placeholder={field.placeholder}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="border-input bg-background text-sm font-medium text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-ring"
      />
    )}

    {field.helpText && (
      <p className="mt-1 px-0.5 text-xs font-medium leading-normal text-muted-foreground/80">
        ℹ️ {field.helpText}
      </p>
    )}
  </div>
  );
}

