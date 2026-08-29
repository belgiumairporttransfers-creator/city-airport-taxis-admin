import type { CalendarCategory } from "@/lib/interface";

export const bookingTypeCategories: CalendarCategory[] = [
  {
    label: "One way",
    value: "one-way",
    className: "data-[state=checked]:bg-primary",
  },
  {
    label: "Return",
    value: "return-trip",
    className: "data-[state=checked]:bg-success",
  },
  {
    label: "Hourly",
    value: "hourly",
    className: "data-[state=checked]:bg-warning",
  },
];

export const bookingTypeColorClass: Record<string, string> = {
  "one-way": "primary",
  "return-trip": "success",
  hourly: "warning",
};

export const bookingTypeLabel: Record<string, string> = {
  "one-way": "One way",
  "return-trip": "Return",
  hourly: "Hourly",
};
