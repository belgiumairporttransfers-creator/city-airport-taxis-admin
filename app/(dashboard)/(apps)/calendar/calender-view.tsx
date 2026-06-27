"use client";
import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import EventSheet from "./event-sheet";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarEvent, CalendarCategory } from "./data";
import { EventContentArg } from "@fullcalendar/core";

interface CalendarViewProps {
  events: CalendarEvent[];
  categories: CalendarCategory[];
}

const CalendarView = ({ events, categories }: CalendarViewProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string[] | null>(
    null
  );
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [sheetOpen, setSheetOpen] = useState<boolean>(false);
  const [date, setDate] = React.useState<Date>(new Date());

  useEffect(() => {
    setSelectedCategory(categories?.map((c) => c.value));
  }, [categories]);

  const handleEventClick = (arg: any) => {
    setSelectedEvent(arg);
    setSheetOpen(true);
  };

  const handleCloseModal = () => {
    setSheetOpen(false);
    setSelectedEvent(null);
  };

  const handleCategorySelection = (category: string) => {
    if (selectedCategory && selectedCategory.includes(category)) {
      setSelectedCategory(selectedCategory.filter((c) => c !== category));
    } else {
      setSelectedCategory([...(selectedCategory || []), category]);
    }
  };

  const handleClassName = (arg: EventContentArg) => {
    if (arg.event.extendedProps.calendar === "holiday") {
      return "destructive";
    } else if (arg.event.extendedProps.calendar === "business") {
      return "primary";
    } else if (arg.event.extendedProps.calendar === "personal") {
      return "success";
    } else if (arg.event.extendedProps.calendar === "family") {
      return "info";
    } else if (arg.event.extendedProps.calendar === "etc") {
      return "info";
    } else if (arg.event.extendedProps.calendar === "meeting") {
      return "warning";
    } else {
      return "primary";
    }
  };

  const filteredEvents = events?.filter((event) =>
    selectedCategory?.includes(event.extendedProps.calendar)
  );

  return (
    <>
      <div className=" grid grid-cols-12 gap-6 divide-x  divide-border">
        <Card className="col-span-12 lg:col-span-4 2xl:col-span-3  pb-5">
          <CardContent className="p-0 ">
            <CardHeader className="border-none mb-2 pt-5" />
            <div className="px-3">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(s) => s && setDate(s)}
                className="rounded-md border border-border w-full p-0 border-none"
              />
            </div>
            <div className="py-4 text-default-800  font-semibold text-xs uppercase mt-4 px-4">
              FILTER
            </div>
            <ul className=" space-y-2 px-4">
              <li className=" flex gap-3">
                <Checkbox
                  checked={selectedCategory?.length === categories?.length}
                  onClick={() => {
                    if (selectedCategory?.length === categories?.length) {
                      setSelectedCategory([]);
                    } else {
                      setSelectedCategory(categories.map((c) => c.value));
                    }
                  }}
                />
                <Label>All</Label>
              </li>
              {categories?.map((category) => (
                <li className=" flex gap-3 " key={category.value}>
                  <Checkbox
                    className={category.className}
                    id={category.label}
                    checked={selectedCategory?.includes(category.value)}
                    onClick={() => handleCategorySelection(category.value)}
                  />
                  <Label htmlFor={category.label}>{category.label}</Label>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="col-span-12 lg:col-span-8 2xl:col-span-9  pt-5">
          <CardContent className="dash-tail-calendar">
            <FullCalendar
              plugins={[
                dayGridPlugin,
                timeGridPlugin,
                interactionPlugin,
                listPlugin,
              ]}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
              }}
              events={filteredEvents}
              editable={false}
              selectable={false}
              droppable={false}
              dayMaxEvents={2}
              weekends={true}
              eventClassNames={handleClassName}
              eventClick={handleEventClick}
              initialView="dayGridMonth"
            />
          </CardContent>
        </Card>
      </div>
      <EventSheet
        open={sheetOpen}
        onClose={handleCloseModal}
        categories={categories}
        event={selectedEvent}
      />
    </>
  );
};

export default CalendarView;
