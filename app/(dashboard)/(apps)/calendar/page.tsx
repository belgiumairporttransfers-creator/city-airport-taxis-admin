import { categories, events } from "./data";
import CalendarView from "./calender-view";

export const metadata = {
  title: "Calendar",
};

const CalendarPage = () => {
  return (
    <div>
      <CalendarView events={events} categories={categories} />
    </div>
  );
};

export default CalendarPage;
