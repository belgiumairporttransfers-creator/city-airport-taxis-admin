import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarCategory } from "@/lib/interface";

const EventSheet = ({
  open,
  onClose,
  categories,
  event,
}: {
  open: boolean;
  onClose: () => void;
  categories: CalendarCategory[];
  event: any;
}) => {
  const calendarValue = event?.event?.extendedProps?.calendar;
  const categoryLabel =
    categories.find((category) => category.value === calendarValue)?.label ??
    calendarValue;

  return (
    <Sheet open={open}>
      <SheetContent
        onPointerDownOutside={onClose}
        onClose={onClose}
        className="px-0"
      >
        <SheetHeader className="px-6">
          <SheetTitle>Event Details</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <ScrollArea className="h-[calc(100vh-180px)]">
            <div className="space-y-4 px-6 pb-5">
              <div className="space-y-1.5">
                <Label>Event Name</Label>
                <p className="text-sm text-default-900">
                  {event?.event?.title ?? "—"}
                </p>
              </div>
              <div className="space-y-1.5">
                <Label>Start Date</Label>
                <p className="text-sm text-default-900">
                  {event?.event?.start
                    ? formatDate(event.event.start)
                    : "—"}
                </p>
              </div>
              <div className="space-y-1.5">
                <Label>End Date</Label>
                <p className="text-sm text-default-900">
                  {event?.event?.end ? formatDate(event.event.end) : "—"}
                </p>
              </div>
              <div className="space-y-1.5">
                <Label>Label</Label>
                <p className="text-sm text-default-900 capitalize">
                  {categoryLabel ?? "—"}
                </p>
              </div>
            </div>
          </ScrollArea>
          <div className="px-6 pb-6">
            <Button type="button" className="w-full" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default EventSheet;
