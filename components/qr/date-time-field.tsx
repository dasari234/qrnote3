'use client';

import { useEffect, useMemo, useState } from 'react';

import {
    CalendarDays
} from 'lucide-react';

import {
    format
} from 'date-fns';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

import {
    isDateDisabled,
    parseDate,
} from './date-field';

import { DateConfig } from '@/lib/qr/types';
import { TimeField } from './time-field';

interface DateTimeFieldProps {
  id?: string;
  value?: string;
  placeholder?: string;
  dateConfig?: DateConfig;
  onChange: (value: string) => void;
}

export function DateTimeField({
  id,
  value = '',
  placeholder = 'Select date & time',
  dateConfig,
  onChange,
}: DateTimeFieldProps) {
  const [open, setOpen] =
    useState(false);

  const [selectedDate, setSelectedDate] =
    useState<Date | undefined>(
      parseDate(value)
    );

  const [selectedTime, setSelectedTime] =
    useState(
      parseTimeFromDateTime(value)
    );

  /*
   * Keep internal state synchronized
   * when edit form receives new data.
   */
  useEffect(() => {
    setSelectedDate(
      parseDate(value)
    );

    setSelectedTime(
      parseTimeFromDateTime(value)
    );
  }, [value]);

  /*
   * Lock body scrolling while the
   * datetime picker is open.
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

    const scrollbarWidth =
      window.innerWidth -
      document.documentElement.clientWidth;

    body.style.overflow = 'hidden';

    if (scrollbarWidth > 0) {
      body.style.paddingRight =
        `${scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow =
        previousOverflow;

      body.style.paddingRight =
        previousPaddingRight;
    };
  }, [open]);

  const displayValue = useMemo(() => {
    if (
      !selectedDate ||
      !selectedTime
    ) {
      return '';
    }

    const dateText = format(
      selectedDate,
      'dd MMM yyyy'
    );

    const timeText =
      formatTimeForDisplay(
        selectedTime,
        dateConfig?.timeFormat ??
          '12h'
      );

    return `${dateText} · ${timeText}`;
  }, [
    selectedDate,
    selectedTime,
    dateConfig?.timeFormat,
  ]);

  const handleDateSelect = (
    date?: Date
  ) => {
    if (!date) {
      return;
    }

    if (
      isDateDisabled(
        date,
        dateConfig
      )
    ) {
      return;
    }

    setSelectedDate(date);

    updateValue(
      date,
      selectedTime,
      onChange
    );
  };

  const handleTimeChange = (
    time: string
  ) => {
    setSelectedTime(time);

    updateValue(
      selectedDate,
      time,
      onChange
    );
  };

  const handleDone = () => {
    if (
      selectedDate &&
      selectedTime
    ) {
      updateValue(
        selectedDate,
        selectedTime,
        onChange
      );
    }

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
              displayValue
                ? 'text-foreground'
                : 'text-muted-foreground'
            }
          >
            {displayValue ||
              placeholder}
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="z-50 w-[330px] p-0"
      >
        <div className="space-y-4 p-4">
          {/* Header */}

          <div>
            <h3 className="text-sm font-semibold">
              Select date & time
            </h3>

            <p className="mt-1 text-xs text-muted-foreground">
              Choose when your event takes place.
            </p>
          </div>

          {/* Calendar */}

          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={
                handleDateSelect
              }
              disabled={(date) =>
                isDateDisabled(
                  date,
                  dateConfig
                )
              }
              initialFocus
            />
          </div>

          {/* Time */}

          <div className="border-t border-border pt-4">

            <TimeField
              value={
                selectedTime || ''
              }
              timeFormat={
                dateConfig?.timeFormat ??
                '12h'
              }
              onChange={
                handleTimeChange
              }
              placeholder="Select time"
            />
          </div>

          {/* Selected value */}

          {(selectedDate ||
            selectedTime) && (
            <div className="rounded-lg bg-muted/40 px-3 py-2">
              <p className="text-[11px] font-medium text-muted-foreground">
                Selected
              </p>

              <p className="mt-0.5 text-sm font-semibold">
                {displayValue ||
                  'Select date and time'}
              </p>
            </div>
          )}

          {/* Actions */}

          <div className="flex justify-end gap-2 border-t border-border pt-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                setOpen(false)
              }
            >
              Cancel
            </Button>

            <Button
              type="button"
              size="sm"
              disabled={
                !selectedDate ||
                !selectedTime
              }
              onClick={handleDone}
            >
              Done
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function parseTimeFromDateTime(
  value?: string
): string {
  if (!value) {
    return '';
  }

  const match =
    /T(\d{2}):(\d{2})/.exec(
      value
    );

  if (!match) {
    return '';
  }

  return `${match[1]}:${match[2]}`;
}

function updateValue(
  date: Date | undefined,
  time: string | undefined,
  onChange: (value: string) => void
) {
  if (!date || !time) {
    return;
  }

  const dateValue = format(
    date,
    'yyyy-MM-dd'
  );

  onChange(
    `${dateValue}T${time}`
  );
}

function formatTimeForDisplay(
  value: string,
  formatType: '12h' | '24h'
) {
  const match =
    /^(\d{2}):(\d{2})$/.exec(
      value
    );

  if (!match) {
    return value;
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  if (formatType === '24h') {
    return `${String(hour).padStart(
      2,
      '0'
    )}:${String(minute).padStart(
      2,
      '0'
    )}`;
  }

  const period =
    hour >= 12 ? 'PM' : 'AM';

  const hour12 =
    hour % 12 || 12;

  return `${String(hour12).padStart(
    2,
    '0'
  )}:${String(minute).padStart(
    2,
    '0'
  )} ${period}`;
}

function parseTime(
  value?: string
) {
  if (!value) {
    return undefined;
  }

  const match =
    /^(\d{1,2}):(\d{2})$/.exec(
      value
    );

  if (!match) {
    return undefined;
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  if (
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return undefined;
  }

  return `${String(hour).padStart(
    2,
    '0'
  )}:${String(minute).padStart(
    2,
    '0'
  )}`;
}
