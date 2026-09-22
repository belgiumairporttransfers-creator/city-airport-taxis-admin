"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Home } from "lucide-react";
import LayoutLoader from "@/components/layout-loader";
import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useBooking, useUpdateBooking } from "@/hooks/queries/use-bookings";
import {
  fromBookingDetailToUpdateForm,
  toUpdateBookingPayload,
  updateBookingFormSchema,
  type UpdateBookingFormSchema,
} from "@/lib/schemas";

const statusOptions = [
  { value: "confirmed", label: "Confirmed" },
  { value: "passenger_onboard", label: "Pax Onboard" },
  { value: "driver_arrived", label: "Arrived" },
  { value: "complete", label: "Completed" },
  { value: "pending", label: "Pending" },
  { value: "cancelled", label: "Cancelled" },
];

const EditBookingPage = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, isError, error } = useBooking(params.id);
  const { mutate: saveBooking, isPending } = useUpdateBooking(params.id);

  const form = useForm<UpdateBookingFormSchema>({
    resolver: zodResolver(updateBookingFormSchema),
    mode: "onChange",
    defaultValues: {
      status: "confirmed",
      customerFirstName: "",
      customerLastName: "",
      customerEmail: "",
      customerPhone: "",
      pickupAddress: "",
      dropoffAddress: "",
      pickupDate: "",
      pickupTime: "",
      returnDate: "",
      returnTime: "",
      notes: "",
      flightNumber: "",
      terminal: "",
      passengers: 1,
      luggage: 0,
      handLuggage: 0,
      smallCheckedCase: 0,
      largeCheckedCase: 0,
      adminNote: "",
    },
  });

  useEffect(() => {
    if (data) {
      form.reset(fromBookingDetailToUpdateForm(data));
    }
  }, [data, form]);

  if (isLoading) {
    return <LayoutLoader />;
  }

  if (isError || !data) {
    const message =
      error && typeof error === "object" && "message" in error
        ? String(error.message)
        : "Booking not found.";

    return (
      <div className="mt-6 space-y-3">
        <p className="text-destructive">{message}</p>
        <Link href="/trips" className="text-sm text-primary hover:underline">
          Back to bookings
        </Link>
      </div>
    );
  }

  const isReturnTrip = data.category === "return-trip";
  const isHourly = data.category === "hourly";

  const onSubmit = (values: UpdateBookingFormSchema) => {
    saveBooking(toUpdateBookingPayload(values), {
      onSuccess: () => router.push(`/bookings/${data.id}`),
    });
  };

  return (
    <>
      <Breadcrumbs>
        <BreadcrumbItem>
          <Home className="h-4 w-4" />
        </BreadcrumbItem>
        <BreadcrumbItem>
          <Link href="/trips">Bookings</Link>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <Link href={`/bookings/${data.id}`}>{data.bookingNumber}</Link>
        </BreadcrumbItem>
        <BreadcrumbItem>Edit</BreadcrumbItem>
      </Breadcrumbs>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-default-900">
            Edit {data.bookingNumber}
          </h1>
          <p className="text-sm text-default-500">
            Update booking details. The customer will be emailed after you save.
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" asChild>
            <Link href={`/bookings/${data.id}`}>Cancel</Link>
          </Button>
          <Button
            type="button"
            isLoading={isPending}
            loadingText="Saving..."
            onClick={form.handleSubmit(onSubmit)}
          >
            Save changes
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input name="customerFirstName" label="First name" />
                <Input name="customerLastName" label="Last name" />
                <Input name="customerEmail" type="email" label="Email" />
                <Input name="customerPhone" type="tel" label="Phone" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Trip details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Input
                    name="status"
                    type="select"
                    label="Booking status"
                    options={statusOptions}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Input name="pickupAddress" label="Pickup address" />
                </div>
                {!isHourly ? (
                  <div className="sm:col-span-2">
                    <Input name="dropoffAddress" label="Delivery address" />
                  </div>
                ) : null}
                <Input name="pickupDate" type="date" label="Pickup date" />
                <Input name="pickupTime" type="time" label="Pickup time" />
                {isReturnTrip ? (
                  <>
                    <Input name="returnDate" type="date" label="Return date" />
                    <Input name="returnTime" type="time" label="Return time" />
                  </>
                ) : null}
              </div>
              <p className="text-xs text-default-500">
                Trip type: <span className="font-medium text-default-700">{data.category}</span>
                {" · "}
                Vehicle:{" "}
                <span className="font-medium text-default-700">
                  {data.vehicle.categoryName}
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Passengers & luggage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                <Input name="passengers" type="number" label="Passengers" min={1} max={20} />
                <Input name="luggage" type="number" label="Luggage" min={0} max={20} />
                <Input name="handLuggage" type="number" label="Hand" min={0} max={20} />
                <Input name="smallCheckedCase" type="number" label="Small" min={0} max={20} />
                <Input name="largeCheckedCase" type="number" label="Large" min={0} max={20} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Flight & notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input name="flightNumber" label="Flight number" />
                <Input name="terminal" label="Terminal" />
              </div>
              <Input
                name="notes"
                type="textarea"
                label="Customer notes"
              />
              <Input
                name="adminNote"
                type="textarea"
                label="Internal admin note"
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2 pb-8">
            <Button type="button" variant="outline" asChild>
              <Link href={`/bookings/${data.id}`}>Cancel</Link>
            </Button>
            <Button type="submit" isLoading={isPending} loadingText="Saving...">
              Save changes
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};

export default EditBookingPage;
