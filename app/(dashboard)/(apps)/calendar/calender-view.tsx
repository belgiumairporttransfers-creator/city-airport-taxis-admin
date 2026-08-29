"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import type { DayCellContentArg, EventClickArg, EventContentArg } from "@fullcalendar/core";
import type { DateClickArg } from "@fullcalendar/interaction";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import LayoutLoader from "@/components/layout-loader";
import { bookingTypeCategories, bookingTypeColorClass } from "./data";
import { bookingsToCalendarEvents } from "./booking-calendar";
import { useCalendarBookings } from "@/hooks/queries/use-bookings";

const isSameDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const CalendarView = () => {
  const router = useRouter();
  const calendarRef = useRef<React.ComponentRef<typeof FullCalendar>>(null);
  const typeCategories = bookingTypeCategories;
  const [selectedType, setSelectedType] = useState<string[]>(() =>
    bookingTypeCategories.map((category) => category.value)
  );
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { data, isLoading, isFetching } = useCalendarBookings();

  useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (!api) {
      return;
    }

    api.gotoDate(selectedDate);
  }, [selectedDate]);

  const events = useMemo(
    () => bookingsToCalendarEvents(data?.items ?? []),
    [data?.items]
  );

  const filteredEvents = useMemo(
    () =>
      events.filter((event) =>
        selectedType.includes(event.extendedProps.tripType ?? "one-way")
      ),
    [events, selectedType]
  );

  const handleEventClick = (arg: EventClickArg) => {
    arg.jsEvent.stopPropagation();
    const bookingId = arg.event.extendedProps.bookingId as string | undefined;
    if (bookingId) {
      router.push(`/bookings/${bookingId}`);
    }
  };

  const handleDateClick = (arg: DateClickArg) => {
    setSelectedDate(arg.date);
  };

  const handleDayCellClassNames = (arg: DayCellContentArg) =>
    isSameDay(arg.date, selectedDate) ? ["fc-day-selected"] : [];

  const toggleType = (value: string) => {
    setSelectedType((selected) =>
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value]
    );
  };

  const handleClassName = (arg: EventContentArg) => {
    const tripType = (arg.event.extendedProps.tripType as string | undefined) ?? "one-way";
    return bookingTypeColorClass[tripType] ?? "primary";
  };

  if (isLoading) {
    return <LayoutLoader />;
  }

  return (
    <div className="grid grid-cols-12 gap-6 divide-x divide-border">
      <Card className="col-span-12 pb-5 lg:col-span-4 2xl:col-span-3">
        <CardContent className="p-0">
          <CardHeader className="mb-2 border-none pt-5" />
          <div className="px-3">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(nextDate) => nextDate && setSelectedDate(nextDate)}
              className="w-full rounded-md border border-border border-none p-0"
            />
          </div>

          <div className="mt-4 px-4 py-4 text-xs font-semibold uppercase text-default-800">
            Filter by type
          </div>
          <ul className="space-y-2 px-4">
            <li className="flex gap-3">
              <Checkbox
                checked={selectedType.length === typeCategories.length}
                onClick={() => {
                  if (selectedType.length === typeCategories.length) {
                    setSelectedType([]);
                  } else {
                    setSelectedType(typeCategories.map((category) => category.value));
                  }
                }}
              />
              <Label>All</Label>
            </li>
            {typeCategories.map((category) => (
              <li className="flex gap-3" key={category.value}>
                <Checkbox
                  className={category.className}
                  id={`type-${category.value}`}
                  checked={selectedType.includes(category.value)}
                  onClick={() => toggleType(category.value)}
                />
                <Label htmlFor={`type-${category.value}`}>{category.label}</Label>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="col-span-12 pt-5 lg:col-span-8 2xl:col-span-9">
        <CardContent className="dash-tail-calendar">
          {isFetching && !isLoading ? (
            <p className="mb-3 text-xs text-default-500">Refreshing bookings...</p>
          ) : null}
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
            }}
            events={filteredEvents}
            editable={false}
            selectable={false}
            droppable={false}
            dayMaxEvents={3}
            displayEventTime
            eventDisplay="block"
            weekends
            eventClassNames={handleClassName}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            dayCellClassNames={handleDayCellClassNames}
            initialView="dayGridMonth"
            initialDate={selectedDate}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarView;
