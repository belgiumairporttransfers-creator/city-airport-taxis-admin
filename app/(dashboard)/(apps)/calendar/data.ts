import type { CalendarCategory } from "@/lib/interface";

export const bookingStatusCategories: CalendarCategory[] = [
  {
    label: "Pending",
    value: "pending",
    className: "data-[state=checked]:bg-warning",
  },
  {
    label: "Confirmed",
    value: "confirmed",
    className: "data-[state=checked]:bg-primary",
  },
  {
    label: "Accepted",
    value: "accepted",
    className: "data-[state=checked]:bg-info",
  },
  {
    label: "Complete",
    value: "complete",
    className: "data-[state=checked]:bg-success",
  },
  {
    label: "Cancelled",
    value: "cancelled",
    className: "data-[state=checked]:bg-destructive",
  },
];
