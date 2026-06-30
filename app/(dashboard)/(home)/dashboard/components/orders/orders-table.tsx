"use client";

import * as React from "react";
import Link from "next/link";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatDate, formatPrice, formatTime } from "@/lib/utils";
import { useBookings } from "@/hooks/queries/use-bookings";
import type { Booking } from "@/lib/schemas";

const EUR_SYMBOL = "€";

const paymentStatusLabels: Record<string, string> = {
  paid: "Completed",
  pending: "Pending",
  failed: "Failed",
  cancelled: "Cancelled",
};

const paymentStatusClasses: Record<string, string> = {
  paid: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  failed: "bg-destructive/10 text-destructive",
  cancelled: "bg-default-100 text-default-600",
};

const columns: ColumnDef<Booking>[] = [
  {
    id: "booking",
    header: "Booking",
    cell: ({ row }) => (
      <Link
        href={`/bookings/${row.original.id}`}
        className="font-medium text-primary hover:underline"
      >
        {row.original.bookingNumber}
      </Link>
    ),
  },
  {
    id: "customer",
    header: "Customer",
    cell: ({ row }) => (
      <span className="whitespace-nowrap">
        {row.original.customer.firstName} {row.original.customer.lastName}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      const value = row.getValue("createdAt") as string;
      return (
        <span className="whitespace-nowrap">
          {formatDate(value)} {formatTime(value)}
        </span>
      );
    },
  },
  {
    id: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <span>{formatPrice(row.original.pricing.total, EUR_SYMBOL)}</span>
    ),
  },
  {
    id: "paymentStatus",
    header: "Order Status",
    cell: ({ row }) => {
      const status = row.original.payment.paymentStatus;
      return (
        <span
          className={`inline-block rounded-2xl px-3 py-[2px] text-xs ${
            paymentStatusClasses[status] ?? "bg-default-100 text-default-600"
          }`}
        >
          {paymentStatusLabels[status] ?? status}
        </span>
      );
    },
  },
];

const OrdersTable = () => {
  const { data, isLoading } = useBookings({ page: 1, limit: 8 });
  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <div className="overflow-x-auto">
        <div className="no-scrollbar h-full w-full overflow-auto">
          <Table>
            <TableHeader className="bg-default-300">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="h-12 whitespace-nowrap text-sm font-semibold text-default-600 last:text-end"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="[&_tr:last-child]:border-1">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    Loading recent orders...
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-border hover:bg-default-50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="py-3 text-sm text-default-600 last:text-end"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No recent orders.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {data?.meta && data.meta.total > 8 ? (
        <div className="mt-5 flex justify-center">
          <Button asChild size="sm" variant="outline">
            <Link href="/trips">View all bookings</Link>
          </Button>
        </div>
      ) : null}
    </>
  );
};

export default OrdersTable;
