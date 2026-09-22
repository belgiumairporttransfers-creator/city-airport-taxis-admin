"use client";

import Link from "next/link";
import { CheckCircle2, Eye, MapPin, MoreHorizontal, Pencil, Trash2, UserPlus } from "lucide-react";
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

const truncateAddress = (value: string, maxLength = 36) =>
  value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;

/* ── Payment method labels & styles ─────────────────────────── */

const paymentMethodLabels: Record<string, string> = {
  mollie: "Online",
  pay_onboard: "Cash",
};

const paymentMethodClasses: Record<string, string> = {
  mollie: "text-primary",
  pay_onboard: "text-warning",
};

/* ── Category (trip type) labels & styles ───────────────────── */

const categoryLabels: Record<string, string> = {
  "one-way": "One way",
  hourly: "Hourly",
  "return-trip": "Return trip",
};

const categoryClasses: Record<string, string> = {
  "one-way": "bg-warning/10 text-warning border border-transparent",
  hourly: "bg-info/10 text-info border border-transparent",
  "return-trip": "bg-primary/10 text-primary border border-transparent",
};

/* ── Time & Date formatting helpers ─────────────────────────── */

const formatPickupTime = (time?: string | null): string => {
  if (!time) return "";
  const cleaned = time.trim();

  // If already contains AM or PM (e.g. "6:00 AM" or "9:15 PM AM")
  const ampmMatch = cleaned.match(/^(\d{1,2}):(\d{2})(?:\s*([ap]m))(?:\s*[ap]m)?$/i);
  if (ampmMatch) {
    const hours = parseInt(ampmMatch[1], 10);
    const minutes = ampmMatch[2];
    const ampm = ampmMatch[3].toUpperCase();
    const displayHour = hours % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  // If 24-hour time e.g. "16:50" or "06:00"
  const time24Match = cleaned.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (time24Match) {
    const hours = parseInt(time24Match[1], 10);
    const minutes = time24Match[2];
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHour = hours % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  // If ISO date string e.g. "2026-03-11T16:50:00.000Z"
  if (cleaned.includes("T")) {
    const date = new Date(cleaned);
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
  }

  return cleaned;
};

const formatPickupDate = (dateStr?: string | null): string => {
  if (!dateStr) return "";
  const cleaned = dateStr.trim();

  // Extract YYYY-MM-DD from string or ISO timestamp
  const isoMatch = cleaned.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    const date = new Date(year, month, day);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
  }

  const date = new Date(cleaned);
  if (!isNaN(date.getTime())) {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return cleaned;
};

/* ── Filter columns ─────────────────────────────────────────── */

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
        { value: "pay_onboard", label: "Cash" },
      ],
    },
  ];
}

/* ── Table columns ──────────────────────────────────────────── */

export function getBookingColumns({
  onDelete,
  onAssign,
  onComplete,
  isDeleting = false,
  isCompleting = false,
}: GetBookingColumnsOptions): ColumnDef<Booking>[] {
  return [
    /* ── Select ───────────────────────────────────────────── */
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

    /* ── Booking ID ── payment method label + booking # ───── */
    {
      accessorKey: "bookingNumber",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Booking ID" />,
      cell: ({ row }) => {
        const method = row.original.payment.paymentMethod;
        return (
          <div className="flex flex-col gap-0.5">
            <span
              className={`text-[11px] font-semibold leading-none ${
                paymentMethodClasses[method] ?? "text-default-500"
              }`}
            >
              {paymentMethodLabels[method] ?? method}
            </span>
            <span className="font-semibold text-default-900 text-sm">
              {row.getValue("bookingNumber")}
            </span>
          </div>
        );
      },
    },

    /* ── Customer ── name + email ─────────────────────────── */
    {
      id: "customer",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-default-900 text-sm">
            {row.original.customer.firstName}
          </span>
          <span className="text-[11px] text-default-500 truncate max-w-[180px]">
            {row.original.customer.email}
          </span>
        </div>
      ),
    },

    /* ── Type ── category badge ───────────────────────────── */
    {
      id: "type",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
      cell: ({ row }) => {
        const cat = row.original.category;
        return (
          <span
            className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${
              categoryClasses[cat] ?? "bg-default-100 text-default-700 border border-transparent"
            }`}
          >
            {categoryLabels[cat] ?? cat}
          </span>
        );
      },
    },

    /* ── Route ── pickup (green) + dropoff (red) ─────────── */
    {
      id: "route",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Route" />,
      cell: ({ row }) => (
        <div className="flex flex-col gap-1 min-w-[200px] max-w-[280px]">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-success" />
            <span
              className="text-xs text-default-700 truncate"
              title={row.original.route.pickupAddress}
            >
              {truncateAddress(row.original.route.pickupAddress)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-destructive" />
            <span
              className="text-xs text-default-700 truncate"
              title={row.original.route.dropoffAddress}
            >
              {truncateAddress(row.original.route.dropoffAddress || "—")}
            </span>
          </div>
        </div>
      ),
    },

    /* ── Pickup date/time ── time (bold) + date ──────────── */
    {
      id: "pickupDate",
      accessorFn: (row) => row.route.pickupDate,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Pickup" />,
      enableColumnFilter: true,
      filterFn: (row, _columnId, filterValue) => {
        const values = filterValue as string[] | undefined;
        if (!values?.length) return true;
        return values.includes(row.original.route.pickupDate);
      },
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-default-900 text-sm whitespace-nowrap">
            {formatPickupTime(row.original.route.pickupTime)}
          </span>
          <span className="text-[11px] text-default-500 whitespace-nowrap">
            {formatPickupDate(row.original.route.pickupDate)}
          </span>
        </div>
      ),
    },

    /* ── Amount ───────────────────────────────────────────── */
    {
      id: "amount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
      cell: ({ row }) => (
        <span className="font-semibold text-default-900">
          {formatPrice(row.original.pricing.total, EUR_SYMBOL)}
        </span>
      ),
    },

    /* ── Payment method (hidden – used for filtering only) ── */
    {
      id: "paymentMethod",
      accessorFn: (row) => row.payment.paymentMethod,
      enableColumnFilter: true,
      filterFn: (row, _columnId, filterValue) => {
        const values = filterValue as string[] | undefined;
        if (!values?.length) return true;
        return values.includes(row.original.payment.paymentMethod);
      },
      header: () => null,
      cell: () => null,
    },

    /* ── Vehicle ─────────────────────────────────────────── */
    {
      id: "vehicle",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Vehicle" />,
      cell: ({ row }) => (
        <span className="text-sm text-default-700">
          {row.original.vehicle.categoryName}
        </span>
      ),
    },

    /* ── Status ───────────────────────────────────────────── */
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

    /* ── Actions ──────────────────────────────────────────── */
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
