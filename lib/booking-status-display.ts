import type { Booking, BookingTripPhase } from "@/lib/schemas";

const bookingStatusLabels: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  accepted: "Accepted",
  complete: "Complete",
  cancelled: "Cancelled",
};

const tripPhaseLabels: Record<BookingTripPhase, string> = {
  driver_accepted: "Driver Accepted",
  driver_arrived: "Driver Arrived",
  passenger_onboard: "Passenger Onboard",
  trip_started: "Trip Started",
  completed: "Completed",
};

const bookingStatusClasses: Record<string, string> = {
  pending: "bg-default-50 text-default-700 border border-default-200",
  confirmed: "bg-primary/10 text-primary border border-transparent",
  accepted: "bg-info/10 text-info border border-transparent",
  complete: "bg-success/10 text-success border border-transparent",
  cancelled: "bg-default-100 text-default-600 border border-transparent",
};

const tripPhaseClasses: Record<BookingTripPhase, string> = {
  driver_accepted: "bg-info/10 text-info border border-transparent",
  driver_arrived: "bg-warning/10 text-warning border border-transparent",
  passenger_onboard: "bg-warning/10 text-warning border border-transparent",
  trip_started: "bg-primary/10 text-primary border border-transparent",
  completed: "bg-success/10 text-success border border-transparent",
};

export const getBookingDisplayStatus = (
  booking: Pick<Booking, "status" | "tripPhase">
): { label: string; className: string; key: string } => {
  const phase = booking.tripPhase ?? null;

  if (phase) {
    return {
      key: phase,
      label: tripPhaseLabels[phase],
      className: tripPhaseClasses[phase],
    };
  }

  return {
    key: booking.status,
    label: bookingStatusLabels[booking.status] ?? booking.status,
    className:
      bookingStatusClasses[booking.status] ??
      "bg-default-100 text-default-600 border border-transparent",
  };
};
