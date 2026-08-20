'use client';

import { useEffect, useMemo, useState } from 'react';

import { Clock3 } from 'lucide-react';

import { Button } from '@/components/ui/button';

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

interface TimeFieldProps {
  id?: string;
  value?: string;
  placeholder?: string;
  timeFormat?: '12h' | '24h';
  onChange: (value: string) => void;
}

interface TimeValue {
  hour: number;
  minute: number;
}

const MINUTE_INTERVAL = 5;

export function TimeField({
  id,
  value = '',
  placeholder = 'Select time',
  timeFormat = '12h',
  onChange,
}: TimeFieldProps) {
  const [open, setOpen] = useState(false);

  const parsedTime = useMemo(
    () => parseTime(value),
    [value]
  );

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

  const displayValue =
    parsedTime
      ? formatTime(
          parsedTime,
          timeFormat
        )
      : '';

  const handleSelect = (
    hour: number,
    minute: number
  ) => {
    const normalized =
      `${String(hour).padStart(2, '0')}:${String(
        minute
      ).padStart(2, '0')}`;

    onChange(normalized);

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
          <Clock3 className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />

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
        className="z-50 w-[280px] p-4"
      >
        <TimePicker
          value={parsedTime}
          timeFormat={timeFormat}
          onChange={handleSelect}
        />
      </PopoverContent>
    </Popover>
  );
}

/* -------------------------------------------------------------------------- */
/* Time Picker                                                                */
/* -------------------------------------------------------------------------- */

function TimePicker({
  value,
  timeFormat,
  onChange,
}: {
  value?: TimeValue;
  timeFormat: '12h' | '24h';
  onChange: (
    hour: number,
    minute: number
  ) => void;
}) {
  const currentHour =
    value?.hour ??
    new Date().getHours();

  const currentMinute =
    value?.minute ??
    roundToNextFiveMinutes(
      new Date().getMinutes()
    );

  const [hour, setHour] =
    useState(currentHour);

  const [minute, setMinute] =
    useState(currentMinute);

  const [period, setPeriod] =
    useState<'AM' | 'PM'>(
      currentHour >= 12
        ? 'PM'
        : 'AM'
    );

  useEffect(() => {
    setHour(
      value?.hour ??
        new Date().getHours()
    );

    setMinute(
      value?.minute ??
        roundToNextFiveMinutes(
          new Date().getMinutes()
        )
    );

    setPeriod(
      (value?.hour ??
        new Date().getHours()) >= 12
        ? 'PM'
        : 'AM'
    );
  }, [value]);

  const hour12 =
    hour % 12 || 12;

  const hourOptions =
    timeFormat === '12h'
      ? Array.from(
          { length: 12 },
          (_, index) => index + 1
        )
      : Array.from(
          { length: 24 },
          (_, index) => index
        );

  const minuteOptions =
    Array.from(
      { length: 60 / MINUTE_INTERVAL },
      (_, index) =>
        index * MINUTE_INTERVAL
    );

  const selectHour = (
    selectedHour: number
  ) => {
    if (timeFormat === '24h') {
      setHour(selectedHour);

      onChange(
        selectedHour,
        minute
      );

      return;
    }

    const normalizedHour =
      selectedHour === 12
        ? period === 'AM'
          ? 0
          : 12
        : period === 'PM'
          ? selectedHour + 12
          : selectedHour;

    setHour(normalizedHour);

    onChange(
      normalizedHour,
      minute
    );
  };

  const selectMinute = (
    selectedMinute: number
  ) => {
    setMinute(selectedMinute);

    onChange(
      hour,
      selectedMinute
    );
  };

  const selectPeriod = (
    selectedPeriod: 'AM' | 'PM'
  ) => {
    setPeriod(selectedPeriod);

    let normalizedHour =
      hour;

    if (selectedPeriod === 'AM') {
      normalizedHour =
        hour === 12
          ? 0
          : hour >= 12
            ? hour - 12
            : hour;
    } else {
      normalizedHour =
        hour < 12
          ? hour + 12
          : hour;
    }

    setHour(normalizedHour);

    onChange(
      normalizedHour,
      minute
    );
  };

  return (
    <div className="space-y-4">
      <div className="text-sm font-semibold">
        Select time
      </div>

      <div
        className={
          timeFormat === '12h'
            ? 'grid grid-cols-3 gap-2'
            : 'grid grid-cols-2 gap-2'
        }
      >
        {/* Hour */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground">
            Hour
          </label>

          <select
            value={
              timeFormat === '12h'
                ? hour12
                : hour
            }
            onChange={(event) =>
              selectHour(
                Number(
                  event.target.value
                )
              )
            }
            className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm font-medium outline-none focus:ring-2 focus:ring-ring"
          >
            {hourOptions.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {String(item).padStart(
                    2,
                    '0'
                  )}
                </option>
              )
            )}
          </select>
        </div>

        {/* Minute */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground">
            Minute
          </label>

          <select
            value={minute}
            onChange={(event) =>
              selectMinute(
                Number(
                  event.target.value
                )
              )
            }
            className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm font-medium outline-none focus:ring-2 focus:ring-ring"
          >
            {minuteOptions.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {String(item).padStart(
                    2,
                    '0'
                  )}
                </option>
              )
            )}
          </select>
        </div>

        {/* AM / PM */}
        {timeFormat === '12h' && (
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">
              Period
            </label>

            <select
              value={period}
              onChange={(event) =>
                selectPeriod(
                  event.target
                    .value as
                    | 'AM'
                    | 'PM'
                )
              }
              className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm font-medium outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="AM">
                AM
              </option>

              <option value="PM">
                PM
              </option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function parseTime(
  value?: string
): TimeValue | undefined {
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

  return {
    hour,
    minute,
  };
}

function formatTime(
  value: TimeValue,
  formatType: '12h' | '24h'
) {
  if (formatType === '24h') {
    return `${String(
      value.hour
    ).padStart(2, '0')}:${String(
      value.minute
    ).padStart(2, '0')}`;
  }

  const period =
    value.hour >= 12
      ? 'PM'
      : 'AM';

  const hour =
    value.hour % 12 || 12;

  return `${String(hour).padStart(
    2,
    '0'
  )}:${String(
    value.minute
  ).padStart(2, '0')} ${period}`;
}

function roundToNextFiveMinutes(
  minute: number
) {
  const rounded =
    Math.ceil(
      minute / MINUTE_INTERVAL
    ) * MINUTE_INTERVAL;

  return rounded >= 60
    ? 0
    : rounded;
}
