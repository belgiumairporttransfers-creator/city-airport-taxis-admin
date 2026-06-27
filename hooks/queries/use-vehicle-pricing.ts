import {
  createVehiclePricing,
  deleteVehiclePricing,
  getVehiclePricing,
  getVehiclePricingByCategory,
  getVehiclePricingQuotes,
  updateVehiclePricing,
  validateVehiclePricingStructure,
} from "@/lib/api/vehicle-pricing";
import type {
  CreateVehiclePricingPayload,
  GetVehiclePricingParams,
  UpdateVehiclePricingPayload,
  VehiclePricingListResponse,
} from "@/lib/schemas";
import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const VEHICLE_PRICING_QUERY_KEY = ["vehicle-pricing"] as const;
type ApiError = { message?: string };

const refreshVehiclePricing = async (queryClient: QueryClient) => {
  await queryClient.invalidateQueries({ queryKey: VEHICLE_PRICING_QUERY_KEY });
  await queryClient.refetchQueries({
    queryKey: VEHICLE_PRICING_QUERY_KEY,
    type: "active",
  });
};

const removePricingFromCache = (queryClient: QueryClient, pricingId: string) => {
  queryClient.setQueriesData<VehiclePricingListResponse>(
    { queryKey: VEHICLE_PRICING_QUERY_KEY },
    (current) => {
      if (!current?.items) return current;

      const items = current.items.filter((item) => item._id !== pricingId);
      if (items.length === current.items.length) return current;

      return {
        ...current,
        items,
        meta: current.meta
          ? {
              ...current.meta,
              total: Math.max(0, current.meta.total - 1),
            }
          : current.meta,
      };
    }
  );
};

export const useVehiclePricing = (params: GetVehiclePricingParams) => {
  return useQuery({
    queryKey: [...VEHICLE_PRICING_QUERY_KEY, params],
    queryFn: () => getVehiclePricing(params),
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
};

export const useVehicleCategoryPricing = (categoryId: string, enabled = true) => {
  return useQuery({
    queryKey: [...VEHICLE_PRICING_QUERY_KEY, "category", categoryId],
    queryFn: async () => {
      const response = await getVehiclePricingByCategory(categoryId);
      return response?.items ?? [];
    },
    enabled: enabled && !!categoryId,
    staleTime: 0,
  });
};

export const useVehiclePricingQuotes = (distanceKm: number | null) => {
  return useQuery({
    queryKey: [...VEHICLE_PRICING_QUERY_KEY, "quotes", distanceKm],
    queryFn: () => getVehiclePricingQuotes(distanceKm as number),
    enabled: distanceKm !== null && Number.isFinite(distanceKm) && distanceKm >= 0,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
};

export const useCreateVehiclePricing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      categoryId,
      payload,
    }: {
      categoryId: string;
      payload: CreateVehiclePricingPayload;
    }) => createVehiclePricing(categoryId, payload),
    onSuccess: async () => {
      toast.success("Pricing slab created successfully");
      await refreshVehiclePricing(queryClient);
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to create pricing slab.");
    },
  });
};

export const useUpdateVehiclePricing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateVehiclePricingPayload }) =>
      updateVehiclePricing(id, payload),
    onSuccess: async () => {
      toast.success("Pricing slab updated successfully");
      await refreshVehiclePricing(queryClient);
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to update pricing slab.");
    },
  });
};

export const useDeleteVehiclePricing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVehiclePricing,
    onMutate: async (pricingId) => {
      await queryClient.cancelQueries({ queryKey: VEHICLE_PRICING_QUERY_KEY });

      const snapshots = queryClient.getQueriesData<VehiclePricingListResponse>({
        queryKey: VEHICLE_PRICING_QUERY_KEY,
      });

      removePricingFromCache(queryClient, pricingId);

      return { snapshots };
    },
    onSuccess: async () => {
      toast.success("Pricing slab deleted successfully");
      await refreshVehiclePricing(queryClient);
    },
    onError: (error: ApiError, _pricingId, context) => {
      context?.snapshots.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      toast.error(error?.message || "Failed to delete pricing slab.");
    },
  });
};

export const useValidateVehiclePricingStructure = () => {
  return useMutation({
    mutationFn: validateVehiclePricingStructure,
    onSuccess: (result) => {
      if (!result) return;

      if (result.isComplete) {
        toast.success("Pricing structure is complete with no gaps or overlaps.");
        return;
      }

      const issues: string[] = [];
      if (result.gaps.length > 0) {
        issues.push(`${result.gaps.length} coverage gap(s)`);
      }
      if (result.overlaps.length > 0) {
        issues.push(`${result.overlaps.length} overlap(s)`);
      }
      if (result.openEndedCount !== 1) {
        issues.push(
          result.openEndedCount === 0
            ? "missing open-ended slab"
            : "multiple open-ended slabs"
        );
      }

      toast.error(`Pricing structure issues: ${issues.join(", ")}.`);
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to validate pricing structure.");
    },
  });
};
