"use client";

import Link from "next/link";
import { Eye, MoreHorizontal, Trash2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { DataTableFilterColumn } from "@/components/data-table/data-table-toolbar";
import { formatDate, formatPrice, formatTime } from "@/lib/utils";
import type { Booking, BookingStatus } from "@/lib/schemas";

const EUR_SYMBOL = "€";

const truncateAddress = (value: string, maxLength = 22) =>
  value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;

const bookingStatusLabels: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  accepted: "Accepted",
  complete: "Complete",
  cancelled: "Cancelled",
};

const bookingStatusClasses: Record<string, string> = {
  pending: "bg-default-50 text-default-700 border border-default-200",
  confirmed: "bg-primary/10 text-primary border border-transparent",
  accepted: "bg-info/10 text-info border border-transparent",
  complete: "bg-success/10 text-success border border-transparent",
  cancelled: "bg-default-100 text-default-600 border border-transparent",
};

interface GetBookingColumnsOptions {
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export function getBookingFilterColumns(): DataTableFilterColumn[] {
  return [
    {
      column: "status",
      title: "Status",
      multiple: false,
      options: [
        { value: "pending", label: "Pending" },
        { value: "confirmed", label: "Confirmed" },
        { value: "accepted", label: "Accepted" },
        { value: "complete", label: "Complete" },
        { value: "cancelled", label: "Cancelled" },
      ],
    },
  ];
}

export function getBookingColumns({
  onDelete,
  isDeleting = false,
}: GetBookingColumnsOptions): ColumnDef<Booking>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-0.5"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-0.5"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "bookingNumber",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Booking ID" />,
      cell: ({ row }) => (
        <span className="font-semibold text-default-900">{row.getValue("bookingNumber")}</span>
      ),
    },
    {
      id: "customer",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
      cell: ({ row }) => (
        <span className="font-semibold text-default-900">
          {row.original.customer.firstName}
        </span>
      ),
    },
    {
      id: "pickup",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Pickup" />,
      cell: ({ row }) => (
        <span className="max-w-[180px] truncate text-default-600" title={row.original.route.pickupAddress}>
          {truncateAddress(row.original.route.pickupAddress)}
        </span>
      ),
    },
    {
      id: "delivery",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Delivery" />,
      cell: ({ row }) => (
        <span
          className="max-w-[180px] truncate text-default-600"
          title={row.original.route.dropoffAddress}
        >
          {truncateAddress(row.original.route.dropoffAddress)}
        </span>
      ),
    },
    {
      id: "amount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
      cell: ({ row }) => (
        <span className="font-semibold text-default-900">
          {formatPrice(row.original.pricing.total, EUR_SYMBOL)}
        </span>
      ),
    },
    {
      id: "vehicle",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Vehicle" />,
      cell: ({ row }) => (
        <span className="inline-flex rounded-full bg-default-100 px-2.5 py-0.5 text-xs font-medium text-default-700">
          {row.original.vehicle.categoryName}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      enableColumnFilter: true,
      filterFn: (row, columnId, filterValue) => {
        const values = filterValue as string[] | undefined;
        if (!values?.length) return true;
        return values.includes(row.getValue(columnId) as string);
      },
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
              bookingStatusClasses[status] ?? "bg-default-100 text-default-600"
            }`}
          >
            {bookingStatusLabels[status] ?? status}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
      cell: ({ row }) => {
        const value = row.getValue("createdAt") as string;
        return (
          <span className="whitespace-nowrap text-default-600">
            {formatDate(value)} {formatTime(value)}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                disabled={isDeleting}
                aria-label="Open actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem asChild>
                <Link href={`/bookings/${row.original.id}`} className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  View
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 text-destructive focus:text-destructive"
                disabled={isDeleting}
                onClick={() => onDelete(row.original.id)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
}

export type { BookingStatus };
