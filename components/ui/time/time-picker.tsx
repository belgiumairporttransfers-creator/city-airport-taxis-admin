"use client";

import { useState, useEffect, useCallback } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { DEFAULT_TIMEZONE } from "@/constants/app-default";
import { cn } from "@/lib/utils";
import TimeColumn from "./time-column";
import { Button } from "@/components/ui/button";

interface TimePickerProps {
  value?: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

export default function TimePicker({
  value,
  onChange,
  disabled,
  error,
  className,
}: TimePickerProps) {
  const timezone = DEFAULT_TIMEZONE;
  const [open, setOpen] = useState(false);

  const getCurrentTime = useCallback(
    () => formatInTimeZone(new Date(), timezone, "HH:mm"),
    [timezone]
  );

  const getInitialTime = useCallback(() => {
    const currentTime = getCurrentTime();
    const match = currentTime.match(/^(\d{2}):(\d{2})$/);
    if (!match) return { h: 0, m: 0 };

    return {
      h: parseInt(match[1], 10),
      m: parseInt(match[2], 10),
    };
  }, [getCurrentTime]);

  const [hour, setHour] = useState<number | null>(null);
  const [minute, setMinute] = useState<number | null>(null);

  useEffect(() => {
    if (!value) {
      onChange(getCurrentTime());
    }
  }, [getCurrentTime, onChange, value]);

  useEffect(() => {
    if (!value) {
      const initial = getInitialTime();
      setHour(initial.h);
      setMinute(initial.m);
      return;
    }

    const match = value.match(/^(\d{1,2}):(\d{2})$/);
    if (match) {
      setHour(parseInt(match[1], 10));
      setMinute(parseInt(match[2], 10));
    }
  }, [value, getInitialTime]);

  useEffect(() => {
    if (open && hour !== null && minute !== null) {
      const formatted = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      if (formatted !== value) {
        onChange(formatted);
      }
    }
  }, [hour, minute, open, onChange, value]);

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
        <span className="truncate text-sm text-default-500 2xl:text-base">
          {value || getCurrentTime()}
        </span>
      </div>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 transition-opacity"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-x-0 bottom-0 z-50 w-full animate-in fade-in slide-in-from-bottom-4 rounded-t-xl border border-border bg-popover text-popover-foreground shadow-2xl duration-200 sm:absolute sm:inset-auto sm:bottom-full sm:mb-2 sm:left-1/2 sm:w-64 sm:-translate-x-1/2 sm:rounded-md">
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <TimeColumn
                  label="Hour (24h)"
                  values={Array.from({ length: 24 }, (_, i) => i)}
                  selected={hour}
                  onSelect={setHour}
                />

                <TimeColumn
                  label="Minute"
                  values={Array.from({ length: 60 }, (_, i) => i)}
                  selected={minute}
                  onSelect={setMinute}
                />
              </div>

              <Button
                type="button"
                color="primary"
                onClick={() => setOpen(false)}
                disabled={hour === null || minute === null}
                className="mt-2 w-full py-4 text-sm font-bold sm:py-2"
              >
                Done
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
