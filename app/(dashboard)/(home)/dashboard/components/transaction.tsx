"use client";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate, formatPrice, formatTime } from "@/lib/utils";
import { useAdminDashboard } from "@/hooks/queries/use-dashboard";

type AdminPayment = {
  id: string;
  name: string;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
};

const statusLabels: Record<string, string> = {
  paid: "Completed",
  pending: "Pending",
  failed: "Failed",
  cancelled: "Cancelled",
  refunded: "Refunded",
  partially_refunded: "Partial Refund",
  expired: "Expired",
};

const statusClasses: Record<string, string> = {
  paid: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  failed: "bg-destructive/10 text-destructive",
  cancelled: "bg-default-100 text-default-600",
  refunded: "bg-info/10 text-info",
  partially_refunded: "bg-info/10 text-info",
  expired: "bg-default-100 text-default-600",
};

const columns: ColumnDef<AdminPayment>[] = [
  {
    accessorKey: "reference",
    header: "Booking",
    cell: ({ row }) => (
      <span className="font-medium text-primary whitespace-nowrap">
        {row.original.reference}
      </span>
    ),
  },
  {
    accessorKey: "name",
    header: "Customer",
    cell: ({ row }) => (
      <span className="whitespace-nowrap">{row.getValue("name")}</span>
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
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <span className="whitespace-nowrap">
        {formatPrice(row.original.amount)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <span
          className={`inline-block rounded-2xl px-3 py-[2px] text-xs ${
            statusClasses[status] ?? "bg-default-100 text-default-600"
          }`}
        >
          {statusLabels[status] ?? status}
        </span>
      );
    },
  },
];

const Transaction = () => {
  const { data, isLoading } = useAdminDashboard();
  const table = useReactTable({
    data: data?.payments ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card>
      <CardHeader className="mb-0 p-6">
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <div className="overflow-x-auto">
          <div className="h-full w-full overflow-auto no-scrollbar">
            <Table>
              <TableHeader className="bg-default-300">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="text-sm font-semibold text-default-600 h-12 last:text-end whitespace-nowrap"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="[&_tr:last-child]:border-1">
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      Loading payments...
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="hover:bg-default-50 border-border"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="text-sm text-default-600 py-3 last:text-end"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No payments yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {(data?.payments?.length ?? 0) > 0 ? (
          <div className="mt-5 flex justify-center">
            <Button asChild size="sm" variant="outline">
              <Link href="/payments">View all payments</Link>
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default Transaction;
