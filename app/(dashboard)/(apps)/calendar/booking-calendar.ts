import type { CalendarEvent } from "@/lib/interface";
import type { Booking } from "@/lib/schemas";

const DEFAULT_DURATION_MINUTES = 60;

export const bookingToCalendarEvent = (booking: Booking): CalendarEvent | null => {
  const { pickupDate, pickupTime, durationMinutes } = booking.route;

  if (!pickupDate || !pickupTime) {
    return null;
  }

  const start = new Date(`${pickupDate}T${pickupTime}:00`);
  if (Number.isNaN(start.getTime())) {
    return null;
  }

  const duration = durationMinutes ?? DEFAULT_DURATION_MINUTES;
  const end = new Date(start.getTime() + duration * 60 * 1000);

  return {
    id: booking.id,
    title: booking.bookingNumber,
    start,
    end,
    allDay: false,
    extendedProps: {
      calendar: booking.status,
      bookingId: booking.id,
    },
  };
};

export const bookingsToCalendarEvents = (bookings: Booking[]): CalendarEvent[] =>
  bookings
    .map(bookingToCalendarEvent)
    .filter((event): event is CalendarEvent => event !== null);
