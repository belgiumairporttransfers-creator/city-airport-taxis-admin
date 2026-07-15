"use client";

import Link from "next/link";
import { Banknote, Pencil, Trash2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { DataTableFilterColumn } from "@/components/data-table/data-table-toolbar";
import type { VehicleCategory } from "@/lib/schemas";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const statusClasses: Record<VehicleCategory["status"], string> = {
  active: "bg-success/10 text-success",
  inactive: "bg-default-100 text-default-600",
};

interface GetVehicleCategoryColumnsOptions {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
  isUpdating?: boolean;
}

export function getVehicleCategoryFilterColumns(): DataTableFilterColumn[] {
  return [
    {
      column: "status",
      title: "Status",
      multiple: false,
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
    },
  ];
}

export function getVehicleCategoryColumns({
  onEdit,
  onDelete,
  isDeleting = false,
  isUpdating = false,
}: GetVehicleCategoryColumnsOptions): ColumnDef<VehicleCategory>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => <span className="font-medium">{row.getValue("name")}</span>,
    },
    {
      accessorKey: "slug",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Slug" />,
      cell: ({ row }) => <span className="text-default-600">{row.getValue("slug")}</span>,
    },
    {
      accessorKey: "sortOrder",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Order" />,
      cell: ({ row }) => row.getValue("sortOrder"),
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
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusClasses[status]}`}
          >
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: "isDefault",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Default" />,
      cell: ({ row }) => (row.original.isDefault ? "Yes" : "—"),
    },
    {
      accessorKey: "requestForQuote",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Request quote" />,
      cell: ({ row }) => (row.original.requestForQuote ? "Yes" : "—"),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
      cell: ({ row }) => formatDate(row.getValue("createdAt")),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            disabled={isDeleting || isUpdating}
            asChild
          >
            <Link
              href={`/vehicle-pricing?categoryId=${row.original._id}`}
              aria-label="Manage pricing"
            >
              <Banknote className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            disabled={isDeleting || isUpdating}
            onClick={() => onEdit(row.original._id)}
            aria-label="Edit category"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            color="destructive"
            disabled={isDeleting || isUpdating}
            onClick={() => onDelete(row.original._id)}
            aria-label="Delete category"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
