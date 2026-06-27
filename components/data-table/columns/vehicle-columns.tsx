"use client";

import { Pencil, Trash2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { DataTableFilterColumn } from "@/components/data-table/data-table-toolbar";
import type { Vehicle, VehicleCategory } from "@/lib/schemas";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const statusClasses: Record<Vehicle["status"], string> = {
  active: "bg-success/10 text-success",
  maintenance: "bg-warning/10 text-warning",
  inactive: "bg-default-100 text-default-600",
};

interface GetVehicleColumnsOptions {
  categoryNameById: Record<string, string>;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
  isUpdating?: boolean;
}

export function getVehicleFilterColumns(categories: VehicleCategory[]): DataTableFilterColumn[] {
  return [
    {
      column: "status",
      title: "Status",
      multiple: false,
      options: [
        { value: "active", label: "Active" },
        { value: "maintenance", label: "Maintenance" },
        { value: "inactive", label: "Inactive" },
      ],
    },
    {
      column: "categoryId",
      title: "Category",
      multiple: false,
      options: categories.map((category) => ({
        value: category._id,
        label: category.name,
      })),
    },
  ];
}

export function getVehicleColumns({
  categoryNameById,
  onEdit,
  onDelete,
  isDeleting = false,
  isUpdating = false,
}: GetVehicleColumnsOptions): ColumnDef<Vehicle>[] {
  return [
    {
      accessorKey: "registrationNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Registration" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("registrationNumber")}</span>
      ),
    },
    {
      id: "vehicle",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Vehicle" />,
      cell: ({ row }) => {
        const vehicle = row.original;
        return (
          <span>
            {vehicle.make} {vehicle.model}
            {vehicle.year ? ` (${vehicle.year})` : ""}
          </span>
        );
      },
    },
    {
      accessorKey: "categoryId",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
      enableColumnFilter: true,
      filterFn: (row, columnId, filterValue) => {
        const values = filterValue as string[] | undefined;
        if (!values?.length) return true;
        return values.includes(row.getValue(columnId) as string);
      },
      cell: ({ row }) => (
        <span className="text-default-600">
          {categoryNameById[row.original.categoryId] ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "passengerCapacity",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Passengers" />,
      cell: ({ row }) => row.getValue("passengerCapacity"),
    },
    {
      accessorKey: "luggageCapacity",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Luggage" />,
      cell: ({ row }) => row.getValue("luggageCapacity"),
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
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Added" />,
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
            onClick={() => onEdit(row.original._id)}
            aria-label="Edit vehicle"
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
            aria-label="Delete vehicle"
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
