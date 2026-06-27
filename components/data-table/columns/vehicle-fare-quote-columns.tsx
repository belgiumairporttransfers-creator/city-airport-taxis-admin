"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import {
  formatDistanceRange,
  formatPrice,
  formatPercent,
} from "@/lib/utils";
import type { VehiclePricing, VehiclePricingQuoteItem, VehiclePricingType } from "@/lib/schemas";

const pricingTypeLabels: Record<VehiclePricingType, string> = {
  fixed: "Fixed",
  per_unit: "Per km",
  base_plus_per_unit: "Base + per km",
};

const formatSlabPrice = (slab: VehiclePricing) => {
  if (!slab) return "—";

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

export function getVehicleFareQuoteColumns(): ColumnDef<VehiclePricingQuoteItem>[] {
  return [
    {
      id: "category",
      accessorFn: (row) => row.category.name,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
      cell: ({ row }) => (
        <span className="font-medium text-default-900">{row.original.category.name}</span>
      ),
    },
    {
      id: "fareAmount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Fare" />,
      cell: ({ row }) => {
        const fare = row.original.fare;

        if (!fare) {
          return <span className="text-default-500">No pricing slab</span>;
        }

        return <span className="font-semibold text-default-900">{formatPrice(fare.amount)}</span>;
      },
    },
    {
      id: "pricingType",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Pricing type" />,
      cell: ({ row }) => {
        const slab = row.original.fare?.slab;
        if (!slab) return "—";
        return pricingTypeLabels[slab.pricingType];
      },
    },
    {
      id: "distanceRange",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Slab range" />,
      cell: ({ row }) => {
        const slab = row.original.fare?.slab;
        if (!slab) return "—";

        return (
          <span className="text-default-700">
            {formatDistanceRange(slab.minDistance, slab.maxDistance)}
          </span>
        );
      },
    },
    {
      id: "slabPrice",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Slab price" />,
      cell: ({ row }) => {
        const slab = row.original.fare?.slab;
        if (!slab) return "—";

        return <span className="text-default-700">{formatSlabPrice(slab)}</span>;
      },
    },
    {
      id: "adjustment",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Adjustment %" />,
      cell: ({ row }) => {
        const adjustment = row.original.fare?.slab.increasePercentage;
        if (adjustment === undefined || adjustment === null) return "—";
        return formatPercent(adjustment);
      },
    },
    {
      id: "vehicles",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Vehicles" />,
      cell: ({ row }) => {
        const vehicles = row.original.vehicles;

        if (!vehicles.length) {
          return <span className="text-default-500">No active vehicles</span>;
        }

        return (
          <span className="text-default-700">
            {vehicles
              .map((vehicle) => `${vehicle.registrationNumber} (${vehicle.make} ${vehicle.model})`)
              .join(", ")}
          </span>
        );
      },
    },
  ];
}
