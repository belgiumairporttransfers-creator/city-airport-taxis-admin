"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  startOfDay,
  isSameMonth,
  parse,
} from "date-fns";
import { toZonedTime, formatInTimeZone } from "date-fns-tz";
import { ChevronRight } from "lucide-react";
import { DEFAULT_TIMEZONE } from "@/constants/app-default";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

export default function DatePicker({
  value,
  onChange,
  disabled,
  error,
  className,
}: DatePickerProps) {
  const timezone = DEFAULT_TIMEZONE;
  const [open, setOpen] = useState(false);

  const toDateKey = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const todayKey = useMemo(
    () => formatInTimeZone(new Date(), timezone, "yyyy-MM-dd"),
    [timezone]
  );
  const todayZoned = useMemo(() => startOfDay(toZonedTime(new Date(), timezone)), [timezone]);

  useEffect(() => {
    if (!value) {
      onChange(todayKey);
    }
  }, [onChange, todayKey, value]);

  const [currentMonth, setCurrentMonth] = useState(() =>
    startOfMonth(toZonedTime(new Date(), timezone))
  );

  const displayDateKey = value || todayKey;

  const selectedDate = useMemo(() => {
    try {
      return parse(displayDateKey, "yyyy-MM-dd", new Date());
    } catch {
      return null;
    }
  }, [displayDateKey]);

  const calendarDays = useMemo(() => {
    const startMonth = startOfMonth(currentMonth);
    const startDayOffset = (getDay(startMonth) + 6) % 7;

    const startDate = new Date(startMonth);
    startDate.setDate(startMonth.getDate() - startDayOffset);

    return eachDayOfInterval({
      start: startDate,
      end: new Date(startDate.getTime() + 41 * 86400000),
    });
  }, [currentMonth]);

  const checkIsDisabled = useCallback(
    (date: Date) => {
      const dateKey = toDateKey(date);
      return dateKey < todayKey;
    },
    [todayKey, toDateKey]
  );

  const handleSelect = (date: Date) => {
    onChange(toDateKey(date));
    setOpen(false);
  };

  return (
    <div className="relative w-full">
      <div
        className={cn(
          className,
          disabled ? "cursor-not-allowed opacity-50" : "!cursor-pointer"
        )}
        onClick={() => {
          if (!disabled) setOpen((prev) => !prev);
        }}
      >
        {selectedDate ? (
          <span className="truncate text-sm text-default-500 2xl:text-base">
            {format(selectedDate, "dd MMM yyyy")}
          </span>
        ) : (
          <span className="truncate text-sm text-default-500 2xl:text-base">
            {formatInTimeZone(new Date(), timezone, "dd MMM yyyy")}
          </span>
        )}
      </div>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 transition-opacity"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-x-0 bottom-0 z-50 w-full animate-in fade-in slide-in-from-bottom-4 rounded-t-2xl border border-border bg-popover text-popover-foreground shadow-2xl duration-200 sm:absolute sm:inset-auto sm:bottom-full sm:mb-2 sm:left-0 sm:w-[340px] sm:rounded-xl">
            <div className="p-5">
              <div className="mb-5 flex items-center justify-between">
                <button
                  type="button"
                  disabled={isSameMonth(currentMonth, todayZoned)}
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="rounded-full p-2 transition-colors hover:bg-primary/10 disabled:pointer-events-none disabled:opacity-20 cursor-pointer"
                >
                  <ChevronRight size={18} className="rotate-180 text-default-600" />
                </button>

                <h3 className="text-sm font-bold text-default-900">
                  {format(currentMonth, "MMMM yyyy")}
                </h3>

                <button
                  type="button"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="rounded-full p-2 transition-colors hover:bg-primary/10 cursor-pointer"
                >
                  <ChevronRight size={18} className="text-default-600" />
                </button>
              </div>

              <div className="mb-3 grid grid-cols-7 text-center text-[10px] font-bold uppercase tracking-widest text-default-400">
                {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 text-sm">
                {calendarDays.map((date, i) => {
                  const inactive = !isSameMonth(date, currentMonth);
                  const disabledDay = checkIsDisabled(date);
                  const selected = selectedDate && isSameDay(date, selectedDate);

                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={disabledDay}
                      onClick={() => handleSelect(date)}
                      className={cn(
                        "relative rounded-lg py-2.5 text-center transition-all focus:outline-none",
                        disabledDay && "cursor-not-allowed text-default-200",
                        !disabledDay && "cursor-pointer",
                        inactive && !disabledDay && "text-default-500",
                        !inactive && !disabledDay && "font-semibold text-default-700",
                        selected
                          ? "bg-primary font-bold text-primary-foreground shadow-lg"
                          : !disabledDay && "hover:bg-primary/10"
                      )}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
