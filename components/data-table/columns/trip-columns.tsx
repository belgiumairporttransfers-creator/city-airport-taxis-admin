"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { DataTableFilterColumn } from "@/components/data-table/data-table-toolbar";
import type { TripExecutionStatus, TripSummary } from "@/lib/schemas";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const statusLabels: Record<TripExecutionStatus, string> = {
  driver_accepted: "Driver Accepted",
  driver_arrived: "Driver Arrived",
  passenger_onboard: "Passenger Onboard",
  trip_started: "Trip Started",
  completed: "Completed",
};

const statusClasses: Record<TripExecutionStatus, string> = {
  driver_accepted: "bg-info/10 text-info",
  driver_arrived: "bg-warning/10 text-warning",
  passenger_onboard: "bg-warning/10 text-warning",
  trip_started: "bg-primary/10 text-primary",
  completed: "bg-success/10 text-success",
};

export function getTripFilterColumns(): DataTableFilterColumn[] {
  return [
    {
      column: "status",
      title: "Status",
      multiple: false,
      options: Object.entries(statusLabels).map(([value, label]) => ({ value, label })),
    },
  ];
}

export function getTripColumns(): ColumnDef<TripSummary>[] {
  return [
    {
      accessorKey: "bookingNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Booking #" />
      ),
      cell: ({ row }) => (
        <Link
          href={`/trips/${row.original.bookingNumber}`}
          className="font-medium text-primary hover:underline"
        >
          {row.getValue("bookingNumber")}
        </Link>
      ),
    },
    {
      id: "customer",
      accessorFn: (row) => `${row.customer.firstName} ${row.customer.lastName}`,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-default-900">
            {row.original.customer.firstName} {row.original.customer.lastName}
          </p>
          <p className="text-xs text-default-500">{row.original.customer.phone}</p>
        </div>
      ),
    },
    {
      id: "pickup",
      accessorFn: (row) => row.route.pickupDate,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Pickup" />,
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-default-900">
            {row.original.route.pickupDate} {row.original.route.pickupTime}
          </p>
          <p className="max-w-[220px] truncate text-xs text-default-500">
            {row.original.route.pickupAddress}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "vehicle.categoryName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Vehicle" />,
      cell: ({ row }) => row.original.vehicle.categoryName,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const status = row.getValue("status") as TripExecutionStatus;
        return (
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses[status] ?? "bg-default-100 text-default-600"}`}
          >
            {statusLabels[status] ?? status}
          </span>
        );
      },
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Updated" />,
      cell: ({ row }) => (
        <span className="text-default-600">{formatDate(row.getValue("updatedAt"))}</span>
      ),
    },
  ];
}
