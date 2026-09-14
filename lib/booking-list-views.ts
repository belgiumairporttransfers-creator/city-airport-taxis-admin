import type { BookingStatus, BookingTripPhase } from "@/lib/schemas";

export type BookingListViewKey =
  | "all"
  | "pending"
  | "confirmed"
  | "assign"
  | "accepted"
  | "arrived"
  | "onboard"
  | "started"
  | "completed"
  | "cancelled";

export type BookingListView = {
  key: BookingListViewKey;
  title: string;
  description: string;
  href: string;
  status?: BookingStatus;
  tripPhase?: BookingTripPhase;
  hideStatusFilter?: boolean;
};

export const BOOKING_LIST_VIEWS: Record<BookingListViewKey, BookingListView> = {
  all: {
    key: "all",
    title: "Bookings",
    description: "Manage customer bookings, payments, and trip requests.",
    href: "/trips",
  },
  pending: {
    key: "pending",
    title: "Pending Bookings",
    description: "Bookings waiting for payment or confirmation.",
    href: "/trips/pending",
    status: "pending",
    hideStatusFilter: true,
  },
  confirmed: {
    key: "confirmed",
    title: "Confirmed Bookings",
    description: "Confirmed bookings ready to assign a driver.",
    href: "/trips/confirmed",
    status: "confirmed",
    hideStatusFilter: true,
  },
  assign: {
    key: "assign",
    title: "Assigned Bookings",
    description: "All bookings currently assigned to a driver.",
    href: "/trips/assign",
    status: "accepted",
    hideStatusFilter: true,
  },
  accepted: {
    key: "accepted",
    title: "Accepted Bookings",
    description: "Driver accepted — waiting to arrive at pickup.",
    href: "/trips/accepted",
    tripPhase: "driver_accepted",
    hideStatusFilter: true,
  },
  arrived: {
    key: "arrived",
    title: "Arrived Bookings",
    description: "Driver has arrived at the pickup location.",
    href: "/trips/arrived",
    tripPhase: "driver_arrived",
    hideStatusFilter: true,
  },
  onboard: {
    key: "onboard",
    title: "Passenger Onboard",
    description: "Passenger is onboard and waiting for trip start.",
    href: "/trips/onboard",
    tripPhase: "passenger_onboard",
    hideStatusFilter: true,
  },
  started: {
    key: "started",
    title: "Started Trips",
    description: "Trips currently in progress.",
    href: "/trips/started",
    tripPhase: "trip_started",
    hideStatusFilter: true,
  },
  completed: {
    key: "completed",
    title: "Completed Bookings",
    description: "View bookings that have been marked complete.",
    href: "/trips/completed",
    status: "complete",
    hideStatusFilter: true,
  },
  cancelled: {
    key: "cancelled",
    title: "Cancelled Bookings",
    description: "Bookings that were cancelled.",
    href: "/trips/cancelled",
    status: "cancelled",
    hideStatusFilter: true,
  },
};
