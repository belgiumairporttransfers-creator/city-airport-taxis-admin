"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { formatDate, formatPrice, formatTime } from "@/lib/utils";
import type { AdminPayout } from "@/lib/schemas";

const payoutStatusClasses: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  completed: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
  failed: "bg-destructive/10 text-destructive",
};

interface GetDriverPayoutColumnsOptions {
  showActions?: boolean;
  dateColumnTitle?: string;
  actingId?: string | null;
  onApprove?: (payout: AdminPayout) => void;
  onReject?: (payout: AdminPayout) => void;
}

export function getDriverPayoutColumns({
  showActions = false,
  dateColumnTitle = "Requested",
  actingId = null,
  onApprove,
  onReject,
}: GetDriverPayoutColumnsOptions = {}): ColumnDef<AdminPayout>[] {
  const columns: ColumnDef<AdminPayout>[] = [
    {
      id: "driver",
      accessorFn: (row) =>
        row.driver
          ? `${row.driver.firstName} ${row.driver.lastName}`.trim()
          : "Unknown driver",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Driver" />
      ),
      cell: ({ row }) => {
        const driver = row.original.driver;
        const name = driver
          ? `${driver.firstName} ${driver.lastName}`.trim()
          : "Unknown driver";

        return (
          <div>
            <Link
              href={`/drivers/${row.original.driverId}/wallet`}
              className="font-medium text-primary hover:underline"
            >
              {name || "Driver"}
            </Link>
            {driver?.applicationNumber ? (
              <p className="text-xs text-default-500">{driver.applicationNumber}</p>
            ) : null}
          </div>
        );
      },
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount" />
      ),
      cell: ({ row }) => (
        <span className="font-semibold text-default-900">
          {formatPrice(row.original.amount)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
              payoutStatusClasses[status] ?? "bg-default-100 text-default-600"
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      id: "date",
      accessorFn: (row) => row.processedAt || row.createdAt,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={dateColumnTitle} />
      ),
      cell: ({ row }) => {
        const value =
          dateColumnTitle === "Processed" && row.original.processedAt
            ? row.original.processedAt
            : row.original.createdAt;

        return (
          <span className="whitespace-nowrap text-default-600">
            {formatDate(value)} {formatTime(value)}
          </span>
        );
      },
    },
    {
      id: "note",
      accessorFn: (row) => row.requestNote || row.adminNotes || "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Note" />
      ),
      cell: ({ row }) => (
        <span className="text-default-600">
          {row.original.requestNote || row.original.adminNotes || "—"}
        </span>
      ),
    },
  ];

  if (showActions) {
    columns.push({
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const payout = row.original;
        const isPending = payout.status === "pending";
        const isActing = actingId === payout.id;

        if (!isPending) {
          return <p className="text-right text-xs text-default-500">—</p>;
        }

        return (
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isActing}
              onClick={() => onReject?.(payout)}
            >
              Reject
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isActing}
              onClick={() => onApprove?.(payout)}
            >
              {isActing ? "…" : "Approve"}
            </Button>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    });
  }

  return columns;
}
