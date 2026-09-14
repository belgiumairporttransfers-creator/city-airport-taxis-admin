"use client";

import Link from "next/link";
import { CheckCircle2, Eye, MoreHorizontal, Pencil, Trash2, UserPlus } from "lucide-react";
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
import { PICKUP_DATE_PRESET_OPTIONS } from "@/lib/booking-pickup-date-presets";
import { getBookingDisplayStatus } from "@/lib/booking-status-display";
import { formatPrice } from "@/lib/utils";
import type { Booking, BookingStatus } from "@/lib/schemas";

const EUR_SYMBOL = "€";

const truncateAddress = (value: string, maxLength = 22) =>
  value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;

const paymentMethodLabels: Record<string, string> = {
  mollie: "Online",
  pay_onboard: "Pay onboard",
};

interface GetBookingColumnsOptions {
  onDelete: (id: string) => void;
  onAssign?: (booking: Booking) => void;
  onComplete?: (booking: Booking) => void;
  isDeleting?: boolean;
  isCompleting?: boolean;
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
    {
      column: "pickupDate",
      title: "Pickup date",
      multiple: false,
      options: PICKUP_DATE_PRESET_OPTIONS.map((option) => ({
        value: option.value,
        label: option.label,
      })),
    },
    {
      column: "paymentMethod",
      title: "Payment",
      multiple: false,
      options: [
        { value: "mollie", label: "Online" },
        { value: "pay_onboard", label: "Pay onboard" },
      ],
    },
  ];
}

export function getBookingColumns({
  onDelete,
  onAssign,
  onComplete,
  isDeleting = false,
  isCompleting = false,
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
      id: "paymentMethod",
      accessorFn: (row) => row.payment.paymentMethod,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Payment" />,
      enableColumnFilter: true,
      filterFn: (row, _columnId, filterValue) => {
        const values = filterValue as string[] | undefined;
        if (!values?.length) return true;
        return values.includes(row.original.payment.paymentMethod);
      },
      cell: ({ row }) => {
        const method = row.original.payment.paymentMethod;
        return (
          <span className="text-default-700">
            {paymentMethodLabels[method] ?? method}
          </span>
        );
      },
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
        const display = getBookingDisplayStatus(row.original);
        return (
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${display.className}`}
          >
            {display.label}
          </span>
        );
      },
    },
    {
      id: "pickupDate",
      accessorFn: (row) => row.route.pickupDate,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
      enableColumnFilter: true,
      filterFn: (row, _columnId, filterValue) => {
        const values = filterValue as string[] | undefined;
        if (!values?.length) return true;
        return values.includes(row.original.route.pickupDate);
      },
      cell: ({ row }) => {
        const { pickupDate, pickupTime } = row.original.route;
        const [year, month, day] = pickupDate.split("-").map(Number);
        const hasValidDate = Boolean(year && month && day);
        const dateLabel = hasValidDate
          ? new Date(year, month - 1, day).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : pickupDate;

        return (
          <span className="whitespace-nowrap text-default-600">
            {dateLabel}
            {pickupTime ? ` ${pickupTime}` : ""}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const canAssign =
          row.original.status === "confirmed" && !row.original.driver?.driverId;
        const canComplete =
          row.original.status !== "complete" && row.original.status !== "cancelled";

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  disabled={isDeleting || isCompleting}
                  aria-label="Open actions"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem asChild>
                  <Link href={`/bookings/${row.original.id}`} className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    View
                  </Link>
                </DropdownMenuItem>
                {canAssign && onAssign ? (
                  <DropdownMenuItem
                    className="flex items-center gap-2"
                    onClick={() => onAssign(row.original)}
                  >
                    <UserPlus className="h-4 w-4" />
                    Assign
                  </DropdownMenuItem>
                ) : null}
                {canComplete && onComplete ? (
                  <DropdownMenuItem
                    className="flex items-center gap-2"
                    disabled={isCompleting}
                    onClick={() => onComplete(row.original)}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Mark complete
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem asChild>
                  <Link
                    href={`/bookings/${row.original.id}/edit`}
                    className="flex items-center gap-2"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
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
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];
}

export type { BookingStatus };
