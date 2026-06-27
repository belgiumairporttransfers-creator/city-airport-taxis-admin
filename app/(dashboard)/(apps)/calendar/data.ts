import type {
  CalendarCategory,
  CalendarEvent,
} from "@/lib/interface";

export type { CalendarCategory, CalendarEvent };

export const categories: CalendarCategory[] = [
  {
    label: "Business",
    value: "business",
    className: "data-[state=checked]:bg-primary",
  },
  {
    label: "Personal",
    value: "personal",
    className: "data-[state=checked]:bg-success",
  },
  {
    label: "Holiday",
    value: "holiday",
    className: "data-[state=checked]:bg-destructive",
  },
  {
    label: "Family",
    value: "family",
    className: "data-[state=checked]:bg-info",
  },
  {
    label: "Meeting",
    value: "meeting",
    className: "data-[state=checked]:bg-warning",
  },
  {
    label: "Etc",
    value: "etc",
    className: "data-[state=checked]:bg-info",
  },
];

export const events: CalendarEvent[] = [
  {
    id: "1",
    title: "Business Strategy Meeting",
    start: new Date("2026-06-05T10:00:00"),
    end: new Date("2026-06-05T11:30:00"),
    allDay: false,
    extendedProps: { calendar: "business" },
  },
  {
    id: "2",
    title: "Team Standup",
    start: new Date("2026-06-10T09:00:00"),
    end: new Date("2026-06-10T09:30:00"),
    allDay: false,
    extendedProps: { calendar: "meeting" },
  },
  {
    id: "3",
    title: "Doctor Appointment",
    start: new Date("2026-06-12T14:00:00"),
    end: new Date("2026-06-12T15:00:00"),
    allDay: false,
    extendedProps: { calendar: "personal" },
  },
  {
    id: "4",
    title: "Public Holiday",
    start: new Date("2026-06-15"),
    end: new Date("2026-06-15"),
    allDay: true,
    extendedProps: { calendar: "holiday" },
  },
  {
    id: "5",
    title: "Family Dinner",
    start: new Date("2026-06-18T19:00:00"),
    end: new Date("2026-06-18T21:00:00"),
    allDay: false,
    extendedProps: { calendar: "family" },
  },
  {
    id: "6",
    title: "Project Deadline",
    start: new Date("2026-06-20"),
    end: new Date("2026-06-20"),
    allDay: true,
    extendedProps: { calendar: "etc" },
  },
  {
    id: "7",
    title: "Client Presentation",
    start: new Date("2026-06-22T11:00:00"),
    end: new Date("2026-06-22T12:00:00"),
    allDay: false,
    extendedProps: { calendar: "business" },
  },
  {
    id: "8",
    title: "Weekly Review",
    start: new Date("2026-06-25T16:00:00"),
    end: new Date("2026-06-25T17:00:00"),
    allDay: false,
    extendedProps: { calendar: "meeting" },
  },
  {
    id: "9",
    title: "Weekend Trip",
    start: new Date("2026-06-28"),
    end: new Date("2026-06-29"),
    allDay: true,
    extendedProps: { calendar: "personal" },
  },
];
