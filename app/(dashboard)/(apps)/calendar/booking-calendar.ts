import type { CalendarEvent } from "@/lib/interface";
import type { Booking } from "@/lib/schemas";
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

const parseDateTime = (date: string, time?: string): Date | null => {
  const normalizedTime = time?.trim() ? time.trim() : "00:00";
  const value = new Date(`${date}T${normalizedTime}:00`);
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
  const [hoursRaw, minutesRaw] = time.split(":");
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return time;
  }

  const period = hours >= 12 ? "p" : "a";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, "0")}${period}`;
};

export const bookingToCalendarEvent = (booking: Booking): CalendarEvent | null => {
  const { pickupDate, pickupTime, returnDate, returnTime, durationMinutes } = booking.route;

  if (!pickupDate || !pickupTime) {
    return null;
  }

  const tripType = normalizeTripType(booking.category);
  const typeLabel = bookingTypeLabel[tripType] ?? "One way";
  const colorClass = bookingTypeColorClass[tripType] ?? "primary";
  const pickupDateOnly = toDateOnly(pickupDate);
  const returnDateOnly = returnDate ? toDateOnly(returnDate) : null;

  if (tripType === "return-trip" && pickupDateOnly && returnDateOnly) {
    const spanEnd = exclusiveEndDate(returnDateOnly);
    if (spanEnd && returnDateOnly >= pickupDateOnly) {
      return {
        id: booking.id,
        title: `${formatEventTime(pickupTime)} ${typeLabel} · ${booking.bookingNumber}`,
        start: pickupDateOnly,
        end: spanEnd,
        allDay: true,
        classNames: [colorClass],
        extendedProps: {
          calendar: booking.status,
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
    title: `${formatEventTime(pickupTime)} ${typeLabel} · ${booking.bookingNumber}`,
    start,
    end,
    allDay: false,
    classNames: [colorClass],
    extendedProps: {
      calendar: booking.status,
      bookingId: booking.id,
      tripType,
    },
  };
};

export const bookingsToCalendarEvents = (bookings: Booking[]): CalendarEvent[] =>
  bookings
    .map(bookingToCalendarEvent)
    .filter((event): event is CalendarEvent => event !== null);
