'use client';

import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

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

import {
  CalendarDays,
} from 'lucide-react';

import {
  format,
  isAfter,
  startOfDay,
} from 'date-fns';

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

      {field.type === 'textarea' ? (
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
      ) : field.type === 'date' ? (
        <DateField
          id={inputId}
          value={value}
          placeholder={field.placeholder}
          disableFutureDates={
            field.disableFutureDates
          }
          onChange={onChange}
        />
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

/* -------------------------------------------------------------------------- */
/* Date Field                                                                  */
/* -------------------------------------------------------------------------- */

function DateField({
  id,
  value,
  placeholder,
  disableFutureDates = false,
  onChange,
}: {
  id: string;
  value: string;
  placeholder?: string;
  disableFutureDates?: boolean;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const selectedDate = useMemo(() => {
    if (!value) {
      return undefined;
    }

    const date = new Date(
      `${value}T00:00:00`
    );

    return Number.isNaN(date.getTime())
      ? undefined
      : date;
  }, [value]);

  const today = startOfDay(new Date());

  /*
   * Lock page scrolling while the date picker
   * popover is open.
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    const body = document.body;

    const previousOverflow =
      body.style.overflow;

    const previousPaddingRight =
      body.style.paddingRight;

    // Prevent layout jump caused by scrollbar disappearing
    const scrollbarWidth =
      window.innerWidth -
      document.documentElement
        .clientWidth;

    body.style.overflow = 'hidden';

    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow =
        previousOverflow;

      body.style.paddingRight =
        previousPaddingRight;
    };
  }, [open]);

  const handleSelect = (date?: Date) => {
    if (!date) {
      return;
    }

    if (
      disableFutureDates &&
      isAfter(
        startOfDay(date),
        today
      )
    ) {
      return;
    }

    onChange(
      format(date, 'yyyy-MM-dd')
    );

    // Close after selecting a date
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className="h-10 w-full justify-start border-input bg-background px-3 text-left text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <CalendarDays className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />

          <span
            className={
              selectedDate
                ? 'text-foreground'
                : 'text-muted-foreground'
            }
          >
            {selectedDate
              ? format(
                  selectedDate,
                  'dd MMM yyyy'
                )
              : placeholder ||
                'Select date'}
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-auto p-0"
      >
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          disabled={
            disableFutureDates
              ? (date) =>
                  isAfter(
                    startOfDay(date),
                    today
                  )
              : undefined
          }
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
