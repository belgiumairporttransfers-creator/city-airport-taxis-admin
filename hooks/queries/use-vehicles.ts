import {
  createVehicle,
  deleteVehicle,
  getVehicles,
  updateVehicle,
} from "@/lib/api/vehicle";
import type {
  CreateVehiclePayload,
  GetVehiclesParams,
  UpdateVehiclePayload,
  VehiclesResponse,
} from "@/lib/schemas";
import { VEHICLE_CATEGORIES_QUERY_KEY } from "@/hooks/queries/use-vehicle-categories";
import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const VEHICLES_QUERY_KEY = ["vehicles"] as const;
type ApiError = { message?: string };

const refreshVehicles = async (queryClient: QueryClient) => {
  await queryClient.invalidateQueries({ queryKey: VEHICLES_QUERY_KEY });
  await queryClient.refetchQueries({
    queryKey: VEHICLES_QUERY_KEY,
    type: "active",
  });
};

const removeVehicleFromCache = (queryClient: QueryClient, vehicleId: string) => {
  queryClient.setQueriesData<VehiclesResponse>({ queryKey: VEHICLES_QUERY_KEY }, (current) => {
    if (!current?.items) return current;

    const items = current.items.filter((item) => item._id !== vehicleId);
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
  });
};

export const useVehicles = (params: GetVehiclesParams) => {
  return useQuery({
    queryKey: [...VEHICLES_QUERY_KEY, params],
    queryFn: () => getVehicles(params),
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
};

export const useCreateVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateVehiclePayload) => createVehicle(payload),
    onSuccess: async () => {
      toast.success("Vehicle created successfully");
      await refreshVehicles(queryClient);
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to create vehicle.");
    },
  });
};

export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateVehiclePayload }) =>
      updateVehicle(id, payload),
    onSuccess: async () => {
      toast.success("Vehicle updated successfully");
      await refreshVehicles(queryClient);
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to update vehicle.");
    },
  });
};

export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVehicle,
    onMutate: async (vehicleId) => {
      await queryClient.cancelQueries({ queryKey: VEHICLES_QUERY_KEY });

      const snapshots = queryClient.getQueriesData<VehiclesResponse>({
        queryKey: VEHICLES_QUERY_KEY,
      });

      removeVehicleFromCache(queryClient, vehicleId);

      return { snapshots };
    },
    onSuccess: async () => {
      toast.success("Vehicle deleted successfully");
      await Promise.all([
        refreshVehicles(queryClient),
        queryClient.invalidateQueries({ queryKey: VEHICLE_CATEGORIES_QUERY_KEY }),
      ]);
    },
    onError: (error: ApiError, _vehicleId, context) => {
      context?.snapshots.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      toast.error(error?.message || "Failed to delete vehicle.");
    },
  });
};
