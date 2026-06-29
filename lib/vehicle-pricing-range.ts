import type { VehiclePricing } from "@/lib/schemas";
import { formatDistanceRange } from "@/lib/utils";

type SlabRange = {
  minDistance: number;
  maxDistance: number | null;
};

const getSlabUpperBound = (maxDistance: number | null): number =>
  maxDistance === null ? Number.POSITIVE_INFINITY : maxDistance;

export const slabsOverlap = (a: SlabRange, b: SlabRange): boolean => {
  const aMax = getSlabUpperBound(a.maxDistance);
  const bMax = getSlabUpperBound(b.maxDistance);

  return a.minDistance < bMax && b.minDistance < aMax;
};

export const getNextSlabMinDistance = (slabs: VehiclePricing[]): number => {
  if (slabs.length === 0) return 0;

  const sorted = [...slabs].sort((a, b) => a.minDistance - b.minDistance);
  const last = sorted[sorted.length - 1];

  if (last.maxDistance === null) {
    return last.minDistance;
  }

  return last.maxDistance;
};

export const validateSlabRange = ({
  minDistance,
  maxDistance,
  openEnded,
  existingSlabs,
  excludeSlabId,
}: {
  minDistance: number;
  maxDistance?: number;
  openEnded: boolean;
  existingSlabs: VehiclePricing[];
  excludeSlabId?: string;
}): { field: "minDistance" | "maxDistance"; message: string } | null => {
  if (!openEnded) {
    if (maxDistance === undefined || Number.isNaN(maxDistance)) {
      return {
        field: "maxDistance",
        message: "Maximum distance is required unless the slab is open-ended",
      };
    }

    if (maxDistance <= minDistance) {
      return {
        field: "maxDistance",
        message:
          maxDistance === minDistance
            ? "Maximum distance must be greater than minimum distance (a range cannot be empty)"
            : "Maximum distance must be greater than minimum distance",
      };
    }
  }

  const candidate: SlabRange = {
    minDistance,
    maxDistance: openEnded ? null : (maxDistance ?? null),
  };

  for (const slab of existingSlabs) {
    if (excludeSlabId && slab._id === excludeSlabId) continue;

    if (slabsOverlap(candidate, slab)) {
      const slabLabel = formatDistanceRange(slab.minDistance, slab.maxDistance);

      return {
        field: "minDistance",
        message: `This range overlaps an existing slab (${slabLabel}). Use contiguous ranges with no gaps or overlaps.`,
      };
    }
  }

  return null;
};
