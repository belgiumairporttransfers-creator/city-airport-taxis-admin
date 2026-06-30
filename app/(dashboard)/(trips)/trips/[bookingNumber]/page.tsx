"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Home } from "lucide-react";
import LayoutLoader from "@/components/layout-loader";
import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTrip } from "@/hooks/queries/use-trips";

const formatDateTime = (value?: string) =>
  value
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "—";

const statusLabels: Record<string, string> = {
  driver_accepted: "Driver Accepted",
  driver_arrived: "Driver Arrived",
  passenger_onboard: "Passenger Onboard",
  trip_started: "Trip Started",
  completed: "Completed",
};

const TripDetailPage = () => {
  const params = useParams<{ bookingNumber: string }>();
  const { data, isLoading, isError, error } = useTrip(params.bookingNumber);

  if (isLoading) {
    return <LayoutLoader />;
  }

  if (isError || !data) {
    const message =
      error && typeof error === "object" && "message" in error
        ? String(error.message)
        : "Trip not found.";

    return (
      <div className="mt-6 space-y-3">
        <p className="text-destructive">{message}</p>
        <p className="text-sm text-default-600">
          Trips appear here after payment is confirmed, a driver is assigned, and the driver
          accepts the assignment.
        </p>
        <Link href="/trips" className="text-sm text-primary hover:underline">
          Back to trips
        </Link>
      </div>
    );
  }

  return (
    <>
      <Breadcrumbs>
        <BreadcrumbItem>
          <Home className="h-4 w-4" />
        </BreadcrumbItem>
        <BreadcrumbItem>
          <Link href="/trips">Trips</Link>
        </BreadcrumbItem>
        <BreadcrumbItem>{data.booking.bookingNumber}</BreadcrumbItem>
      </Breadcrumbs>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Trip overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-default-500">Status</p>
                <p className="font-medium text-default-900">
                  {statusLabels[data.booking.status] ?? data.booking.status}
                </p>
              </div>
              <div>
                <p className="text-xs text-default-500">Category</p>
                <p className="font-medium text-default-900">{data.booking.category}</p>
              </div>
              <div>
                <p className="text-xs text-default-500">Pickup</p>
                <p className="font-medium text-default-900">
                  {data.route.pickupDate} {data.route.pickupTime}
                </p>
                <p className="text-sm text-default-600">{data.route.pickupAddress}</p>
              </div>
              <div>
                <p className="text-xs text-default-500">Dropoff</p>
                <p className="font-medium text-default-900">{data.route.dropoffAddress}</p>
              </div>
            </div>

            {data.booking.notes ? (
              <div>
                <p className="text-xs text-default-500">Notes</p>
                <p className="text-sm text-default-700">{data.booking.notes}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Driver</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="font-medium text-default-900">
              {data.driver.firstName} {data.driver.lastName}
            </p>
            <p className="text-sm text-default-600">{data.driver.phone}</p>
            <p className="text-sm text-default-600">{data.driver.email}</p>
            <p className="text-sm text-default-600">
              {data.driver.carType} · {data.driver.licensePlate}
            </p>
            <Link href={`/drivers/${data.driver.id}`} className="text-sm text-primary hover:underline">
              View driver profile
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="font-medium text-default-900">
              {data.customer.firstName} {data.customer.lastName}
            </p>
            <p className="text-sm text-default-600">{data.customer.phone}</p>
            <p className="text-sm text-default-600">{data.customer.email}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="font-medium text-default-900">{data.assignment.assignmentNumber}</p>
            <p className="text-sm capitalize text-default-600">{data.assignment.status}</p>
            <p className="text-sm text-default-600">
              Assigned {formatDateTime(data.assignment.assignedAt)}
            </p>
            {data.assignment.acceptedAt ? (
              <p className="text-sm text-default-600">
                Accepted {formatDateTime(data.assignment.acceptedAt)}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Execution timestamps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-default-600">
            <p>Arrived: {formatDateTime(data.booking.trip.driverArrivedAt)}</p>
            <p>Passenger onboard: {formatDateTime(data.booking.trip.passengerBoardedAt)}</p>
            <p>Started: {formatDateTime(data.booking.trip.startedAt)}</p>
            <p>Completed: {formatDateTime(data.booking.trip.completedAt)}</p>
          </CardContent>
        </Card>

        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.timeline.length === 0 ? (
                <p className="text-sm text-default-500">No timeline events yet.</p>
              ) : (
                data.timeline.map((entry) => (
                  <div
                    key={`${entry.event}-${entry.at}`}
                    className="flex flex-col gap-1 border-b border-border pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <p className="font-medium text-default-900">{entry.event}</p>
                    <p className="text-sm text-default-500">{formatDateTime(entry.at)}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default TripDetailPage;
