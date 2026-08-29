"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TripSummary } from "@/lib/schemas";

const tripStatusLabels: Record<string, string> = {
  driver_accepted: "Accepted",
  driver_arrived: "Arrived",
  passenger_onboard: "Onboard",
  trip_started: "Started",
  completed: "Completed",
  accepted: "Accepted",
  complete: "Completed",
};

const tripStatusClasses: Record<string, string> = {
  driver_accepted: "bg-info/10 text-info",
  driver_arrived: "bg-warning/10 text-warning",
  passenger_onboard: "bg-warning/10 text-warning",
  trip_started: "bg-primary/10 text-primary",
  completed: "bg-success/10 text-success",
  accepted: "bg-info/10 text-info",
  complete: "bg-success/10 text-success",
};

const truncateAddress = (value: string, maxLength = 28) =>
  value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;

type DriverTripsTableProps = {
  trips: TripSummary[];
  loading?: boolean;
};

const DriverTripsTable = ({ trips, loading = false }: DriverTripsTableProps) => {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Booking</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Pickup</TableHead>
            <TableHead>Route</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="py-8 text-center text-default-500">
                Loading trips...
              </TableCell>
            </TableRow>
          ) : trips.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-8 text-center text-default-500">
                No trips found for this driver.
              </TableCell>
            </TableRow>
          ) : (
            trips.map((trip) => (
              <TableRow key={trip.id}>
                <TableCell>
                  <Link
                    href={`/trips/${trip.bookingNumber}`}
                    className="font-semibold text-primary hover:underline"
                  >
                    {trip.bookingNumber}
                  </Link>
                </TableCell>
                <TableCell className="font-medium text-default-900">
                  {trip.customer.firstName} {trip.customer.lastName}
                </TableCell>
                <TableCell className="whitespace-nowrap text-default-600">
                  {trip.route.pickupDate} {trip.route.pickupTime}
                </TableCell>
                <TableCell className="max-w-[220px] text-default-600">
                  <p className="truncate" title={trip.route.pickupAddress}>
                    {truncateAddress(trip.route.pickupAddress)}
                  </p>
                  <p className="truncate" title={trip.route.dropoffAddress}>
                    → {truncateAddress(trip.route.dropoffAddress)}
                  </p>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      tripStatusClasses[trip.status] ?? "bg-default-100 text-default-600"
                    }`}
                  >
                    {tripStatusLabels[trip.status] ?? trip.status}
                  </span>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default DriverTripsTable;
