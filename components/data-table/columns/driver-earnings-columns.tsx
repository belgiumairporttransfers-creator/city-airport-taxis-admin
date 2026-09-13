"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { formatPercent, formatPrice } from "@/lib/utils";
import type { DriverEarningsReportItem } from "@/lib/schemas";

const EUR_SYMBOL = "€";

const paymentStatusClasses: Record<string, string> = {
  paid: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  failed: "bg-destructive/10 text-destructive",
  refunded: "bg-default-100 text-default-600",
};

const bookingStatusClasses: Record<string, string> = {
  complete: "bg-success/10 text-success",
  accepted: "bg-info/10 text-info",
  confirmed: "bg-primary/10 text-primary",
  pending: "bg-default-50 text-default-700 border border-default-200",
  cancelled: "bg-default-100 text-default-600",
};

export function getDriverEarningsColumns(): ColumnDef<DriverEarningsReportItem>[] {
  return [
    {
      accessorKey: "bookingNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Booking #" />
      ),
      cell: ({ row }) => (
        <Link
          href={`/bookings/${row.original.bookingId}`}
          className="font-semibold text-primary hover:underline"
        >
          {row.original.bookingNumber}
        </Link>
      ),
    },
    {
      accessorKey: "total",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total price" />
      ),
      cell: ({ row }) => (
        <span className="text-default-900">
          {formatPrice(row.original.total, EUR_SYMBOL)}
        </span>
      ),
    },
    {
      accessorKey: "commissionPercent",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Commission %" />
      ),
      cell: ({ row }) => (
        <span className="text-default-600">
          {formatPercent(row.original.commissionPercent)}
        </span>
      ),
    },
    {
      accessorKey: "net",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Driver payout / net" />
      ),
      cell: ({ row }) => (
        <span className="font-semibold text-default-900">
          {formatPrice(row.original.net, EUR_SYMBOL)}
        </span>
      ),
    },
    {
      accessorKey: "paymentStatus",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Payment status" />
      ),
      cell: ({ row }) => {
        const status = row.original.paymentStatus;
        return (
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
              paymentStatusClasses[status] ?? "bg-default-100 text-default-600"
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: "bookingStatus",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Booking status" />
      ),
      cell: ({ row }) => {
        const status = row.original.bookingStatus;
        return (
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
              bookingStatusClasses[status] ?? "bg-default-100 text-default-600"
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: "pickupDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Pickup date" />
      ),
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-default-600">
          {row.original.pickupDate || "—"}
        </span>
      ),
    },
  ];
}
