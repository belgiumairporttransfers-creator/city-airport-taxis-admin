"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Home, Pencil, Trash2, UserPlus } from "lucide-react";
import LayoutLoader from "@/components/layout-loader";
import AssignBookingModel from "@/components/models/assign-booking-model";
import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBooking, useDeleteBooking } from "@/hooks/queries/use-bookings";
import { formatDate, formatDistance, formatPrice, formatTime } from "@/lib/utils";

const EUR_SYMBOL = "€";

const BookingDetailPage = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, isError, error } = useBooking(params.id);
  const { mutate: removeBooking, isPending: isDeleting } = useDeleteBooking();
  const [assignOpen, setAssignOpen] = useState(false);

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

  const handleDelete = () => {
    if (!window.confirm("Delete this booking and its payment history?")) return;

    removeBooking(data.id, {
      onSuccess: () => router.push("/trips"),
    });
  };

  const canAssign = data.status === "confirmed" && !data.driver?.driverId;

  return (
    <>
      <Breadcrumbs>
        <BreadcrumbItem>
          <Home className="h-4 w-4" />
        </BreadcrumbItem>
        <BreadcrumbItem>
          <Link href="/trips">Bookings</Link>
        </BreadcrumbItem>
        <BreadcrumbItem>{data.bookingNumber}</BreadcrumbItem>
      </Breadcrumbs>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-default-900">{data.bookingNumber}</h1>
          <p className="text-sm text-default-500">
            Booking ID: <span className="font-mono text-default-700">{data.id}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canAssign ? (
            <Button type="button" onClick={() => setAssignOpen(true)}>
              <UserPlus className="h-4 w-4" />
              Assign driver
            </Button>
          ) : null}
          <Button type="button" variant="outline" asChild>
            <Link href={`/bookings/${data.id}/edit`}>
              <Pencil className="h-4 w-4" />
              Edit booking
            </Link>
          </Button>
          <Button
            type="button"
            color="destructive"
            disabled={isDeleting}
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
            Delete booking
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Booking overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-default-500">Status</p>
                <p className="font-medium capitalize text-default-900">{data.status}</p>
              </div>
              <div>
                <p className="text-xs text-default-500">Payment status</p>
                <p className="font-medium capitalize text-default-900">
                  {data.payment.paymentStatus}
                </p>
              </div>
              <div>
                <p className="text-xs text-default-500">Payment method</p>
                <p className="font-medium text-default-900">
                  {data.payment.paymentMethod === "pay_onboard"
                    ? "Pay onboard"
                    : data.payment.paymentMethod === "mollie"
                      ? "Online (Card)"
                      : data.payment.paymentMethod}
                </p>
              </div>
              <div>
                <p className="text-xs text-default-500">Category</p>
                <p className="font-medium text-default-900">{data.category}</p>
              </div>
              <div>
                <p className="text-xs text-default-500">Vehicle</p>
                <p className="font-medium text-default-900">{data.vehicle.categoryName}</p>
              </div>
              <div>
                <p className="text-xs text-default-500">Pickup date</p>
                <p className="font-medium text-default-900">
                  {data.route.pickupDate} {data.route.pickupTime}
                </p>
              </div>
              {data.route.returnDate ? (
                <div>
                  <p className="text-xs text-default-500">Return date</p>
                  <p className="font-medium text-default-900">
                    {data.route.returnDate}
                    {data.route.returnTime ? ` ${data.route.returnTime}` : ""}
                  </p>
                </div>
              ) : null}
              <div>
                <p className="text-xs text-default-500">Distance</p>
                <p className="font-medium text-default-900">
                  {formatDistance(data.route.distance)}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-default-500">Pickup</p>
                <p className="font-medium text-default-900">{data.route.pickupAddress}</p>
              </div>
              <div>
                <p className="text-xs text-default-500">Delivery</p>
                <p className="font-medium text-default-900">{data.route.dropoffAddress}</p>
              </div>
            </div>

            {data.notes ? (
              <div>
                <p className="text-xs text-default-500">Customer notes</p>
                <p className="text-default-900">{data.notes}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium text-default-900">
                {data.customer.firstName} {data.customer.lastName}
              </p>
              <p className="text-default-600">{data.customer.email}</p>
              <p className="text-default-600">{data.customer.phone}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-semibold text-default-900">
                {formatPrice(data.pricing.total, EUR_SYMBOL)}
              </p>
              <p className="text-default-600">
                Method:{" "}
                {data.payment.paymentMethod === "pay_onboard"
                  ? "Pay onboard"
                  : data.payment.paymentMethod === "mollie"
                    ? "Online (Card)"
                    : data.payment.paymentMethod}
              </p>
              {data.paymentRecord?.transactionId ? (
                <p className="text-default-600">
                  Transaction: {data.paymentRecord.transactionId}
                </p>
              ) : null}
              <p className="text-default-600">
                Created: {formatDate(data.createdAt)} {formatTime(data.createdAt)}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <AssignBookingModel
        open={assignOpen}
        booking={data}
        onClose={() => setAssignOpen(false)}
      />
    </>
  );
};

export default BookingDetailPage;
