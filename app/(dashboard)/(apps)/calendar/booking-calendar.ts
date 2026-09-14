import type { CalendarEvent } from "@/lib/interface";
import type { Booking } from "@/lib/schemas";
import { getBookingDisplayStatus } from "@/lib/booking-status-display";
import { bookingTypeColorClass, bookingTypeLabel } from "./data";

const DEFAULT_DURATION_MINUTES = 60;

const normalizeTripType = (category: string): string => {
  const value = category?.trim().toLowerCase();
  if (value === "return" || value === "return-trip" || value === "return_trip") {
    return "return-trip";
  }
  if (value === "hourly" || value === "by_the_hour" || value === "by-the-hour") {
    return "hourly";
  }
  return "one-way";
};

/** Normalize HH:mm or HH:mm:ss into a parseable local datetime. */
const parseDateTime = (date: string, time?: string): Date | null => {
  const dateOnly = toDateOnly(date);
  if (!dateOnly) {
    return null;
  }

  const rawTime = time?.trim() || "00:00";
  const match = rawTime.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = Number(match[3] ?? "0");

  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes) ||
    hours > 23 ||
    minutes > 59 ||
    seconds > 59
  ) {
    return null;
  }

  const value = new Date(
    Number(dateOnly.slice(0, 4)),
    Number(dateOnly.slice(5, 7)) - 1,
    Number(dateOnly.slice(8, 10)),
    hours,
    minutes,
    seconds
  );

  return Number.isNaN(value.getTime()) ? null : value;
};

const toDateOnly = (value: string): string | null => {
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return null;
  }
  return trimmed;
};

/** FullCalendar all-day `end` is exclusive. */
const exclusiveEndDate = (dateOnly: string): string | null => {
  const date = new Date(`${dateOnly}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  date.setDate(date.getDate() + 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatEventTime = (time: string): string => {
  const match = time.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) {
    return time;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return time;
  }

  const period = hours >= 12 ? "p" : "a";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, "0")}${period}`;
};

export const toYmd = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const bookingToCalendarEvent = (booking: Booking): CalendarEvent | null => {
  const { pickupDate, pickupTime, returnDate, durationMinutes } = booking.route;

  if (!pickupDate || !pickupTime) {
    return null;
  }

  const tripType = normalizeTripType(booking.category);
  const typeLabel = bookingTypeLabel[tripType] ?? "One way";
  const colorClass = bookingTypeColorClass[tripType] ?? "primary";
  const displayStatus = getBookingDisplayStatus(booking);
  const pickupDateOnly = toDateOnly(pickupDate);
  const returnDateOnly = returnDate ? toDateOnly(returnDate) : null;

  if (tripType === "return-trip" && pickupDateOnly && returnDateOnly) {
    const spanEnd = exclusiveEndDate(returnDateOnly);
    if (spanEnd && returnDateOnly >= pickupDateOnly) {
      return {
        id: booking.id,
        title: `${formatEventTime(pickupTime)} ${typeLabel} · ${booking.bookingNumber} · ${displayStatus.label}`,
        start: pickupDateOnly,
        end: spanEnd,
        allDay: true,
        classNames: [colorClass],
        extendedProps: {
          calendar: displayStatus.key,
          bookingId: booking.id,
          tripType,
        },
      };
    }
  }

  const start = parseDateTime(pickupDate, pickupTime);
  if (!start) {
    return null;
  }

  const duration = durationMinutes ?? DEFAULT_DURATION_MINUTES;
  const end = new Date(start.getTime() + duration * 60 * 1000);

  return {
    id: booking.id,
    title: `${formatEventTime(pickupTime)} ${typeLabel} · ${booking.bookingNumber} · ${displayStatus.label}`,
    start,
    end,
    allDay: false,
    classNames: [colorClass],
    extendedProps: {
      calendar: displayStatus.key,
      bookingId: booking.id,
      tripType,
    },
  };
};

export const bookingsToCalendarEvents = (bookings: Booking[]): CalendarEvent[] =>
  bookings
    .map(bookingToCalendarEvent)
    .filter((event): event is CalendarEvent => event !== null);
