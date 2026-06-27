import {
  createVehicleCategory,
  deleteVehicleCategory,
  getVehicleCategories,
  updateVehicleCategory,
} from "@/lib/api/vehicle-category";
import type {
  CreateVehicleCategoryPayload,
  GetVehicleCategoriesParams,
  UpdateVehicleCategoryPayload,
  VehicleCategoriesResponse,
} from "@/lib/schemas";
import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const VEHICLE_CATEGORIES_QUERY_KEY = ["vehicle-categories"] as const;
type ApiError = { message?: string };

const refreshVehicleCategories = async (queryClient: QueryClient) => {
  await queryClient.invalidateQueries({ queryKey: VEHICLE_CATEGORIES_QUERY_KEY });
  await queryClient.refetchQueries({
    queryKey: VEHICLE_CATEGORIES_QUERY_KEY,
    type: "active",
  });
};

const removeCategoryFromCache = (queryClient: QueryClient, categoryId: string) => {
  queryClient.setQueriesData<VehicleCategoriesResponse>(
    { queryKey: VEHICLE_CATEGORIES_QUERY_KEY },
    (current) => {
      if (!current?.items) return current;

      const items = current.items.filter((item) => item._id !== categoryId);
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

export const useVehicleCategories = (params: GetVehicleCategoriesParams) => {
  return useQuery({
    queryKey: [...VEHICLE_CATEGORIES_QUERY_KEY, params],
    queryFn: () => getVehicleCategories(params),
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
};

export const useCreateVehicleCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateVehicleCategoryPayload) => createVehicleCategory(payload),
    onSuccess: async () => {
      toast.success("Vehicle category created successfully");
      await refreshVehicleCategories(queryClient);
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to create vehicle category.");
    },
  });
};

export const useUpdateVehicleCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateVehicleCategoryPayload }) =>
      updateVehicleCategory(id, payload),
    onSuccess: async () => {
      toast.success("Vehicle category updated successfully");
      await refreshVehicleCategories(queryClient);
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to update vehicle category.");
    },
  });
};

export const useDeleteVehicleCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVehicleCategory,
    onMutate: async (categoryId) => {
      await queryClient.cancelQueries({ queryKey: VEHICLE_CATEGORIES_QUERY_KEY });

      const snapshots = queryClient.getQueriesData<VehicleCategoriesResponse>({
        queryKey: VEHICLE_CATEGORIES_QUERY_KEY,
      });

      removeCategoryFromCache(queryClient, categoryId);

      return { snapshots };
    },
    onSuccess: async () => {
      toast.success("Vehicle category deleted successfully");
      await refreshVehicleCategories(queryClient);
    },
    onError: (error: ApiError, _categoryId, context) => {
      context?.snapshots.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      toast.error(error?.message || "Failed to delete vehicle category.");
    },
  });
};
