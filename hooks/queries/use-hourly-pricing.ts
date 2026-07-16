import {
  createHourlyPricing,
  deleteHourlyPricing,
  getHourlyPricing,
  getHourlyPricingByCategory,
  updateHourlyPricing,
} from "@/lib/api/hourly-pricing";
import type {
  CreateHourlyPricingPayload,
  GetHourlyPricingParams,
  HourlyPricingListResponse,
  UpdateHourlyPricingPayload,
} from "@/lib/schemas";
import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const HOURLY_PRICING_QUERY_KEY = ["hourly-pricing"] as const;
type ApiError = { message?: string };

const refreshHourlyPricing = async (queryClient: QueryClient) => {
  await queryClient.invalidateQueries({ queryKey: HOURLY_PRICING_QUERY_KEY });
  await queryClient.refetchQueries({
    queryKey: HOURLY_PRICING_QUERY_KEY,
    type: "active",
  });
};

const removeHourlyPricingFromCache = (queryClient: QueryClient, pricingId: string) => {
  queryClient.setQueriesData<HourlyPricingListResponse>(
    { queryKey: HOURLY_PRICING_QUERY_KEY },
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

export const useHourlyPricing = (params: GetHourlyPricingParams) => {
  return useQuery({
    queryKey: [...HOURLY_PRICING_QUERY_KEY, params],
    queryFn: () => getHourlyPricing(params),
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
};

export const useCategoryHourlyPricing = (categoryId: string, enabled = true) => {
  return useQuery({
    queryKey: [...HOURLY_PRICING_QUERY_KEY, "category", categoryId],
    queryFn: async () => {
      const response = await getHourlyPricingByCategory(categoryId);
      return response?.items ?? [];
    },
    enabled: enabled && !!categoryId,
    staleTime: 0,
  });
};

export const useCreateHourlyPricing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      categoryId,
      payload,
    }: {
      categoryId: string;
      payload: CreateHourlyPricingPayload;
    }) => createHourlyPricing(categoryId, payload),
    onSuccess: async () => {
      toast.success("Hourly pricing created successfully");
      await refreshHourlyPricing(queryClient);
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to create hourly pricing.");
    },
  });
};

export const useUpdateHourlyPricing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateHourlyPricingPayload }) =>
      updateHourlyPricing(id, payload),
    onSuccess: async () => {
      toast.success("Hourly pricing updated successfully");
      await refreshHourlyPricing(queryClient);
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to update hourly pricing.");
    },
  });
};

export const useDeleteHourlyPricing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteHourlyPricing,
    onMutate: async (pricingId) => {
      await queryClient.cancelQueries({ queryKey: HOURLY_PRICING_QUERY_KEY });

      const snapshots = queryClient.getQueriesData<HourlyPricingListResponse>({
        queryKey: HOURLY_PRICING_QUERY_KEY,
      });

      removeHourlyPricingFromCache(queryClient, pricingId);

      return { snapshots };
    },
    onSuccess: async () => {
      toast.success("Hourly pricing deleted successfully");
      await refreshHourlyPricing(queryClient);
    },
    onError: (error: ApiError, _pricingId, context) => {
      context?.snapshots.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      toast.error(error?.message || "Failed to delete hourly pricing.");
    },
  });
};
