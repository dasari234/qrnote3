'use client';

import {
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    endOfMonth,
    format,
    isAfter,
    isBefore,
    startOfDay,
    startOfMonth
} from 'date-fns';

import { CalendarDays } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { Calendar } from '@/components/ui/calendar';

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

import { DateConfig } from '@/lib/qr/types';

interface DateFieldProps {
  id?: string;
  value?: string;
  placeholder?: string;
  dateConfig?: DateConfig;
  onChange: (value: string) => void;
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export function DateField({
  id,
  value = '',
  placeholder = 'Select date',
  dateConfig,
  onChange,
}: DateFieldProps) {
  const [open, setOpen] =
    useState(false);

  const selectedDate = useMemo(
    () => parseDate(value),
    [value]
  );

  /*
   * Calendar month currently being displayed.
   *
   * If editing an existing value such as:
   *
   * 10-04-1979
   *
   * the calendar automatically opens at:
   *
   * April 1979
   */
  const [displayMonth, setDisplayMonth] =
    useState<Date>(
      selectedDate ??
        new Date()
    );

  /*
   * Synchronize calendar month when
   * the selected value changes.
   */
  useEffect(() => {
    if (selectedDate) {
      setDisplayMonth(
        startOfMonth(selectedDate)
      );
    }
  }, [selectedDate]);

  /*
   * Lock body scrolling while the
   * date popover is open.
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
      document.documentElement
        .clientWidth;

    body.style.overflow =
      'hidden';

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

  /*
   * Calculate the available year range.
   *
   * This makes the year dropdown practical
   * for DOB as well as event dates.
   */
  const yearRange = useMemo(
    () =>
      getYearRange(
        dateConfig
      ),
    [dateConfig]
  );

  /*
   * Handle selecting a date.
   */
  const handleSelect = (
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

    onChange(
      format(
        date,
        'yyyy-MM-dd'
      )
    );

    setOpen(false);
  };

  /*
   * Change month.
   */
  const handleMonthChange = (
    month: number
  ) => {
    const nextDate =
      new Date(
        displayMonth.getFullYear(),
        month,
        1
      );

    if (
      !isMonthDisabled(
        nextDate,
        dateConfig
      )
    ) {
      setDisplayMonth(
        startOfMonth(nextDate)
      );
    }
  };

  /*
   * Change year.
   */
  const handleYearChange = (
    year: number
  ) => {
    const nextDate =
      new Date(
        year,
        displayMonth.getMonth(),
        1
      );

    if (
      !isMonthDisabled(
        nextDate,
        dateConfig
      )
    ) {
      setDisplayMonth(
        startOfMonth(nextDate)
      );
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);

        /*
         * When opening the picker,
         * always start from the selected
         * date if one exists.
         */
        if (
          nextOpen &&
          selectedDate
        ) {
          setDisplayMonth(
            startOfMonth(
              selectedDate
            )
          );
        }
      }}
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
              : placeholder}
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="z-50 w-auto p-0"
      >
        <div className="p-3">
          {/* -------------------------------------------------------------- */}
          {/* Month / Year selectors                                         */}
          {/* -------------------------------------------------------------- */}

          <div className="mb-3 flex items-center gap-2">
            {/* Month */}

            <select
              value={displayMonth.getMonth()}
              onChange={(event) =>
                handleMonthChange(
                  Number(
                    event.target.value
                  )
                )
              }
              className="h-9 flex-1 rounded-md border border-input bg-background px-2 text-sm font-semibold text-foreground outline-none transition focus:ring-2 focus:ring-ring"
              aria-label="Select month"
            >
              {Array.from(
                { length: 12 },
                (_, month) => {
                  const monthDate =
                    new Date(
                      2024,
                      month,
                      1
                    );

                  const disabled =
                    !hasSelectableDayInMonth(
                      monthDate,
                      dateConfig
                    );

                  return (
                    <option
                      key={month}
                      value={month}
                      disabled={
                        disabled
                      }
                    >
                      {format(
                        monthDate,
                        'MMMM'
                      )}
                    </option>
                  );
                }
              )}
            </select>

            {/* Year */}

            <select
              value={displayMonth.getFullYear()}
              onChange={(event) =>
                handleYearChange(
                  Number(
                    event.target.value
                  )
                )
              }
              className="h-9 w-[110px] rounded-md border border-input bg-background px-2 text-sm font-semibold text-foreground outline-none transition focus:ring-2 focus:ring-ring"
              aria-label="Select year"
            >
              {yearRange.map(
                (year) => {
                  const yearDate =
                    new Date(
                      year,
                      0,
                      1
                    );

                  const disabled =
                    !hasSelectableDayInYear(
                      yearDate,
                      dateConfig
                    );

                  return (
                    <option
                      key={year}
                      value={year}
                      disabled={
                        disabled
                      }
                    >
                      {year}
                    </option>
                  );
                }
              )}
            </select>
          </div>

          {/* -------------------------------------------------------------- */}
          {/* Calendar                                                        */}
          {/* -------------------------------------------------------------- */}

          <Calendar
            mode="single"
            selected={
              selectedDate
            }
            month={
              displayMonth
            }
            onMonthChange={
              setDisplayMonth
            }
            onSelect={
              handleSelect
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
      </PopoverContent>
    </Popover>
  );
}

/* -------------------------------------------------------------------------- */
/* Date parsing                                                               */
/* -------------------------------------------------------------------------- */

export function parseDate(
  value?: string
): Date | undefined {
  if (!value) {
    return undefined;
  }

  const datePart = value
    .split('T')[0]
    .trim();

  let year: number;
  let month: number;
  let day: number;

  /*
   * YYYY-MM-DD
   *
   * Example:
   * 1979-04-10
   */
  const isoMatch =
    /^(\d{4})-(\d{2})-(\d{2})$/.exec(
      datePart
    );

  if (isoMatch) {
    year = Number(
      isoMatch[1]
    );

    month =
      Number(
        isoMatch[2]
      ) - 1;

    day = Number(
      isoMatch[3]
    );
  } else {
    /*
     * DD-MM-YYYY
     *
     * Example:
     * 10-04-1979
     */
    const dmyMatch =
      /^(\d{2})-(\d{2})-(\d{4})$/.exec(
        datePart
      );

    if (!dmyMatch) {
      return undefined;
    }

    day = Number(
      dmyMatch[1]
    );

    month =
      Number(
        dmyMatch[2]
      ) - 1;

    year = Number(
      dmyMatch[3]
    );
  }

  const date = new Date(
    year,
    month,
    day
  );

  /*
   * Validate invalid dates such as:
   *
   * 31-02-1979
   */
  if (
    date.getFullYear() !==
      year ||
    date.getMonth() !==
      month ||
    date.getDate() !==
      day
  ) {
    return undefined;
  }

  return date;
}

/* -------------------------------------------------------------------------- */
/* Date restriction                                                           */
/* -------------------------------------------------------------------------- */

export function isDateDisabled(
  date: Date,
  config?: DateConfig
): boolean {
  if (!config) {
    return false;
  }

  const currentDate =
    startOfDay(date);

  const today =
    startOfDay(
      new Date()
    );

  /*
   * Past
   */
  if (
    config.restriction ===
    'past'
  ) {
    if (
      config.includeToday ===
      false
    ) {
      if (
        !isBefore(
          currentDate,
          today
        )
      ) {
        return true;
      }
    } else if (
      isAfter(
        currentDate,
        today
      )
    ) {
      return true;
    }
  }

  /*
   * Future
   */
  if (
    config.restriction ===
    'future'
  ) {
    if (
      config.includeToday ===
      false
    ) {
      if (
        !isAfter(
          currentDate,
          today
        )
      ) {
        return true;
      }
    } else if (
      isBefore(
        currentDate,
        today
      )
    ) {
      return true;
    }
  }

  /*
   * Minimum date
   */
  if (config.minDate) {
    const minDate =
      parseDate(
        config.minDate
      );

    if (
      minDate &&
      isBefore(
        currentDate,
        startOfDay(
          minDate
        )
      )
    ) {
      return true;
    }
  }

  /*
   * Maximum date
   */
  if (config.maxDate) {
    const maxDate =
      parseDate(
        config.maxDate
      );

    if (
      maxDate &&
      isAfter(
        currentDate,
        startOfDay(
          maxDate
        )
      )
    ) {
      return true;
    }
  }

  return false;
}

/* -------------------------------------------------------------------------- */
/* Year range                                                                 */
/* -------------------------------------------------------------------------- */

function getYearRange(
  config?: DateConfig
): number[] {
  const currentYear =
    new Date().getFullYear();

  let minYear =
    currentYear - 100;

  let maxYear =
    currentYear + 100;

  /*
   * If minDate is provided,
   * use its year as lower bound.
   */
  if (config?.minDate) {
    const minDate =
      parseDate(
        config.minDate
      );

    if (minDate) {
      minYear =
        minDate.getFullYear();
    }
  }

  /*
   * If maxDate is provided,
   * use its year as upper bound.
   */
  if (config?.maxDate) {
    const maxDate =
      parseDate(
        config.maxDate
      );

    if (maxDate) {
      maxYear =
        maxDate.getFullYear();
    }
  }

  /*
   * Past-only fields should not
   * offer future years.
   */
  if (
    config?.restriction ===
    'past'
  ) {
    maxYear =
      Math.min(
        maxYear,
        currentYear
      );
  }

  /*
   * Future-only fields should not
   * offer past years.
   */
  if (
    config?.restriction ===
    'future'
  ) {
    minYear =
      Math.max(
        minYear,
        currentYear
      );
  }

  const years: number[] =
    [];

  for (
    let year = maxYear;
    year >= minYear;
    year--
  ) {
    years.push(year);
  }

  return years;
}

/* -------------------------------------------------------------------------- */
/* Month availability                                                         */
/* -------------------------------------------------------------------------- */

function hasSelectableDayInMonth(
  monthDate: Date,
  config?: DateConfig
): boolean {
  const firstDay =
    startOfMonth(
      monthDate
    );

  const lastDay =
    endOfMonth(
      monthDate
    );

  /*
   * If the entire month is outside
   * min/max boundaries, don't allow it.
   */
  if (
    config?.minDate
  ) {
    const minDate =
      parseDate(
        config.minDate
      );

    if (
      minDate &&
      isBefore(
        lastDay,
        startOfDay(
          minDate
        )
      )
    ) {
      return false;
    }
  }

  if (
    config?.maxDate
  ) {
    const maxDate =
      parseDate(
        config.maxDate
      );

    if (
      maxDate &&
      isAfter(
        firstDay,
        startOfDay(
          maxDate
        )
      )
    ) {
      return false;
    }
  }

  /*
   * Check each day in the month.
   */
  let current =
    firstDay;

  while (
    current <= lastDay
  ) {
    if (
      !isDateDisabled(
        current,
        config
      )
    ) {
      return true;
    }

    current = new Date(
      current.getFullYear(),
      current.getMonth(),
      current.getDate() + 1
    );
  }

  return false;
}

/* -------------------------------------------------------------------------- */
/* Year availability                                                           */
/* -------------------------------------------------------------------------- */

function hasSelectableDayInYear(
  yearDate: Date,
  config?: DateConfig
): boolean {
  const year =
    yearDate.getFullYear();

  /*
   * Fast min/max checks.
   */
  if (
    config?.minDate
  ) {
    const minDate =
      parseDate(
        config.minDate
      );

    if (
      minDate &&
      year <
        minDate.getFullYear()
    ) {
      return false;
    }
  }

  if (
    config?.maxDate
  ) {
    const maxDate =
      parseDate(
        config.maxDate
      );

    if (
      maxDate &&
      year >
        maxDate.getFullYear()
    ) {
      return false;
    }
  }

  /*
   * Check all months.
   */
  for (
    let month = 0;
    month < 12;
    month++
  ) {
    if (
      hasSelectableDayInMonth(
        new Date(
          year,
          month,
          1
        ),
        config
      )
    ) {
      return true;
    }
  }

  return false;
}

function isMonthDisabled(
  monthDate: Date,
  config?: DateConfig
): boolean {
  return !hasSelectableDayInMonth(
    monthDate,
    config
  );
}
