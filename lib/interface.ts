// for calendar
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date | string;
  end: Date | string;
  allDay: boolean;
  classNames?: string[];
  extendedProps: {
    calendar: string;
    bookingId: string;
    tripType?: string;
  };
}

export interface CalendarCategory {
  label: string;
  value: string;
  activeClass?: string;
  className?: string;
}