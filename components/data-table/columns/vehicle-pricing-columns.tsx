"use client";

import { Pencil, Trash2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { DataTableFilterColumn } from "@/components/data-table/data-table-toolbar";
import { formatDistanceRange, formatDate, formatPrice, formatPercent, formatTime } from "@/lib/utils";
import type { VehicleCategory, VehiclePricing, VehiclePricingType } from "@/lib/schemas";

const pricingTypeLabels: Record<VehiclePricingType, string> = {
  fixed: "Fixed",
  per_unit: "Per km",
  base_plus_per_unit: "Base + per km",
};

const statusClasses: Record<VehiclePricing["status"], string> = {
  active: "bg-success/10 text-success",
  inactive: "bg-default-100 text-default-600",
};

const formatIncreaseColumn = (slab: VehiclePricing) => {
  if (slab.increasePercentage === undefined || slab.increasePercentage === null) {
    return "—";
  }

  return formatPercent(slab.increasePercentage);
};

const formatPriceColumn = (slab: VehiclePricing) => {
  const amount = formatPrice(slab.priceAmount);

  if (slab.pricingType === "per_unit") {
    return `${amount}/km`;
  }

  if (slab.pricingType === "base_plus_per_unit") {
    if (slab.perKmRate === undefined || slab.perKmRate === null) {
      return amount;
    }

    return `${amount} + ${formatPrice(slab.perKmRate)}/km`;
  }

  return amount;
};

interface GetVehiclePricingColumnsOptions {
  categoryNameById: Record<string, string>;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
  isUpdating?: boolean;
}

export function getVehiclePricingFilterColumns(
  categories: VehicleCategory[]
): DataTableFilterColumn[] {
  return [
    {
      column: "categoryId",
      title: "Category",
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

export function getVehiclePricingColumns({
  categoryNameById,
  onEdit,
  onDelete,
  isDeleting = false,
  isUpdating = false,
}: GetVehiclePricingColumnsOptions): ColumnDef<VehiclePricing>[] {
  return [
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
        <span className="font-medium">
          {categoryNameById[row.original.categoryId] ?? "—"}
        </span>
      ),
    },
    {
      id: "distanceRange",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Distance range" />,
      cell: ({ row }) => (
        <span className="text-default-700">
          {formatDistanceRange(row.original.minDistance, row.original.maxDistance)}
        </span>
      ),
    },
    {
      accessorKey: "pricingType",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
      cell: ({ row }) => pricingTypeLabels[row.original.pricingType],
    },
    {
      accessorKey: "priceAmount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Price" />,
      cell: ({ row }) => (
        <span className="text-default-700">{formatPriceColumn(row.original)}</span>
      ),
    },
    {
      accessorKey: "increasePercentage",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Adjustment %" />,
      cell: ({ row }) => (
        <span className="text-default-700">{formatIncreaseColumn(row.original)}</span>
      ),
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
            aria-label="Edit pricing slab"
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
            aria-label="Delete pricing slab"
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
