"use client";

import { Pencil, Trash2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { DataTableFilterColumn } from "@/components/data-table/data-table-toolbar";
import {
  DISTANCE_LABEL,
  formatDate,
  formatDistance,
  formatPrice,
  formatTime,
} from "@/lib/utils";
import type { HourlyPricing, VehicleCategory } from "@/lib/schemas";

const DURATION_LABEL = "hrs";

const statusClasses: Record<HourlyPricing["status"], string> = {
  active: "bg-success/10 text-success",
  inactive: "bg-default-100 text-default-600",
};

interface GetHourlyPricingColumnsOptions {
  categoryNameById: Record<string, string>;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
  isUpdating?: boolean;
}

export function getHourlyPricingFilterColumns(
  categories: VehicleCategory[]
): DataTableFilterColumn[] {
  return [
    {
      column: "categoryId",
      title: "Fleet",
      multiple: false,
      options: categories.map((category) => ({
        value: category._id,
        label: category.name,
      })),
    },
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

export function getHourlyPricingColumns({
  categoryNameById,
  onEdit,
  onDelete,
  isDeleting = false,
  isUpdating = false,
}: GetHourlyPricingColumnsOptions): ColumnDef<HourlyPricing>[] {
  return [
    {
      accessorKey: "categoryId",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Fleet" />,
      enableColumnFilter: true,
      filterFn: (row, columnId, filterValue) => {
        const values = filterValue as string[] | undefined;
        if (!values?.length) return true;
        return values.includes(row.getValue(columnId) as string);
      },
      cell: ({ row }) => (
        <span className="font-medium">
          {categoryNameById[row.original.categoryId] ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "serviceType",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Service Type" />,
      cell: ({ row }) => (
        <span className="capitalize text-default-700">{row.original.serviceType}</span>
      ),
    },
    {
      accessorKey: "duration",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Duration" />,
      cell: ({ row }) => (
        <span className="text-default-700">
          {row.original.duration} {DURATION_LABEL}
        </span>
      ),
    },
    {
      accessorKey: "price",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Price" />,
      cell: ({ row }) => (
        <span className="text-default-700">{formatPrice(row.original.price)}</span>
      ),
    },
    {
      accessorKey: "includedDistance",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={`Included ${DISTANCE_LABEL}`} />
      ),
      cell: ({ row }) => (
        <span className="text-default-700">
          {formatDistance(row.original.includedDistance)}
        </span>
      ),
    },
    {
      accessorKey: "extraDistancePrice",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={`Extra ${DISTANCE_LABEL} price`}
        />
      ),
      cell: ({ row }) => (
        <span className="text-default-700">
          {formatPrice(row.original.extraDistancePrice)}
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
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusClasses[status]}`}
          >
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Updated" />,
      cell: ({ row }) => {
        const updatedAt = row.getValue("updatedAt") as string;
        const time = formatTime(updatedAt);
        return time ? `${formatDate(updatedAt)} ${time}` : formatDate(updatedAt);
      },
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
            aria-label="Edit hourly pricing"
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
            aria-label="Delete hourly pricing"
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
