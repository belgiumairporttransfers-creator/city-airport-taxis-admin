"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { DataTableFilterColumn } from "@/components/data-table/data-table-toolbar";
import type { DriverApplication, DriverApplicationStatus } from "@/lib/schemas";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const statusLabels: Record<DriverApplicationStatus, string> = {
  pending: "Pending",
  under_review: "Under Review",
  changes_requested: "Changes Requested",
  approved: "Approved",
  rejected: "Rejected",
  suspended: "Suspended",
};

const statusClasses: Record<DriverApplicationStatus, string> = {
  pending: "bg-warning/10 text-warning",
  under_review: "bg-info/10 text-info",
  changes_requested: "bg-warning/10 text-warning",
  approved: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
  suspended: "bg-default-100 text-default-600",
};

export function getDriverApplicationFilterColumns(): DataTableFilterColumn[] {
  return [
    {
      column: "status",
      title: "Status",
      multiple: false,
      options: [
        { value: "pending", label: "Pending" },
        { value: "under_review", label: "Under Review" },
        { value: "changes_requested", label: "Changes Requested" },
        { value: "approved", label: "Approved" },
        { value: "rejected", label: "Rejected" },
        { value: "suspended", label: "Suspended" },
      ],
    },
  ];
}

export function getDriverApplicationColumns(): ColumnDef<DriverApplication>[] {
  return [
    {
      accessorKey: "applicationNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Application #" />
      ),
      cell: ({ row }) => (
        <Link
          href={`/drivers/${row.original.id}`}
          className="font-medium text-primary hover:underline"
        >
          {row.getValue("applicationNumber")}
        </Link>
      ),
    },
    {
      id: "name",
      accessorFn: (row) => `${row.firstName} ${row.lastName}`,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Driver" />,
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-default-900">
            {row.original.firstName} {row.original.lastName}
          </p>
          <p className="text-xs text-default-500">{row.original.email}</p>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Phone" />,
      cell: ({ row }) => row.getValue("phone"),
    },
    {
      accessorKey: "licensePlate",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Plate" />,
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.getValue("licensePlate")}</span>
      ),
    },
    {
      accessorKey: "carType",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Vehicle" />,
      cell: ({ row }) => (
        <span className="text-default-600">{row.getValue("carType")}</span>
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
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClasses[status]}`}
          >
            {statusLabels[status]}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Submitted" />,
      cell: ({ row }) => formatDate(row.getValue("createdAt")),
    },
  ];
}
