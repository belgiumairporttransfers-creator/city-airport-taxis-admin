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
import type { Payment, PaymentStatus } from "@/lib/schemas";

const paymentStatusLabels: Record<string, string> = {
  paid: "Completed",
  pending: "Pending",
  failed: "Failed",
  cancelled: "Cancelled",
  expired: "Expired",
  refunded: "Refunded",
  partially_refunded: "Partially refunded",
};

const paymentStatusClasses: Record<string, string> = {
  paid: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  failed: "bg-destructive/10 text-destructive",
  cancelled: "bg-default-100 text-default-600",
  expired: "bg-warning/10 text-warning",
  refunded: "bg-default-100 text-default-600",
  partially_refunded: "bg-warning/10 text-warning",
};

interface GetPaymentColumnsOptions {
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export function getPaymentFilterColumns(): DataTableFilterColumn[] {
  return [
    {
      column: "status",
      title: "Status",
      multiple: false,
      options: [
        { value: "paid", label: "Completed" },
        { value: "pending", label: "Pending" },
        { value: "failed", label: "Failed" },
      ],
    },
  ];
}

export function getPaymentColumns({
  onDelete,
  isDeleting = false,
}: GetPaymentColumnsOptions): ColumnDef<Payment>[] {
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
      accessorKey: "transactionId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Transaction ID" />
      ),
      cell: ({ row }) => (
        <span className="font-semibold text-default-900">
          {row.getValue("transactionId") ?? "—"}
        </span>
      ),
    },
    {
      id: "customer",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
      cell: ({ row }) => (
        <div>
          <p className="font-semibold text-default-900">{row.original.customer.firstName}</p>
          <p className="text-xs text-default-500">{row.original.customer.email}</p>
        </div>
      ),
    },
    {
      accessorKey: "method",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Method" />,
      cell: ({ row }) => <span className="text-default-600">{row.getValue("method")}</span>,
    },
    {
      id: "card",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Card" />,
      cell: ({ row }) => (
        <span className="text-default-600">
          {row.original.cardLastDigits ? `•••• ${row.original.cardLastDigits}` : "—"}
        </span>
      ),
    },
    {
      id: "amount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
      cell: ({ row }) => (
        <span className="font-semibold text-default-900">
          {row.original.currency} {formatPrice(row.original.amount, "").trim()}
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
              paymentStatusClasses[status] ?? "bg-default-100 text-default-600"
            }`}
          >
            {paymentStatusLabels[status] ?? status.replaceAll("_", " ")}
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
                <Link href={`/bookings/${row.original.bookingId}`} className="flex items-center gap-2">
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

export type { PaymentStatus };
