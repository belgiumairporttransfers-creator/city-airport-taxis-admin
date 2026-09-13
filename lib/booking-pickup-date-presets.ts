import {
  addDays,
  endOfMonth,
  format,
  startOfMonth,
  subDays,
} from "date-fns";

export const PICKUP_DATE_PRESETS = [
  "today",
  "tomorrow",
  "next_7_days",
  "this_month",
  "yesterday",
  "last_7_days",
  "last_30_days",
] as const;

export type PickupDatePreset = (typeof PICKUP_DATE_PRESETS)[number];

export const PICKUP_DATE_PRESET_OPTIONS: Array<{
  value: PickupDatePreset;
  label: string;
}> = [
  { value: "today", label: "Today" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "next_7_days", label: "Next 7 Days" },
  { value: "this_month", label: "This Month" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "last_30_days", label: "Last 30 Days" },
];

const toYmd = (date: Date) => format(date, "yyyy-MM-dd");

export const isPickupDatePreset = (value: string): value is PickupDatePreset =>
  (PICKUP_DATE_PRESETS as readonly string[]).includes(value);

export function resolvePickupDatePreset(
  preset: PickupDatePreset,
  now = new Date()
): { pickupDateFrom: string; pickupDateTo: string } {
  switch (preset) {
    case "today": {
      const day = toYmd(now);
      return { pickupDateFrom: day, pickupDateTo: day };
    }
    case "tomorrow": {
      const day = toYmd(addDays(now, 1));
      return { pickupDateFrom: day, pickupDateTo: day };
    }
    case "next_7_days":
      return {
        pickupDateFrom: toYmd(now),
        pickupDateTo: toYmd(addDays(now, 6)),
      };
    case "this_month":
      return {
        pickupDateFrom: toYmd(startOfMonth(now)),
        pickupDateTo: toYmd(endOfMonth(now)),
      };
    case "yesterday": {
      const day = toYmd(subDays(now, 1));
      return { pickupDateFrom: day, pickupDateTo: day };
    }
    case "last_7_days":
      return {
        pickupDateFrom: toYmd(subDays(now, 6)),
        pickupDateTo: toYmd(now),
      };
    case "last_30_days":
      return {
        pickupDateFrom: toYmd(subDays(now, 29)),
        pickupDateTo: toYmd(now),
      };
    default: {
      const _exhaustive: never = preset;
      return _exhaustive;
    }
  }
}
