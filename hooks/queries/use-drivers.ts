import {
  approveDriverApplication,
  createDriverApplication,
  getDriverApplication,
  getDriverApplicationStats,
  getDriverApplications,
  rejectDriverApplication,
  requestDriverChanges,
  startDriverReview,
  suspendDriverApplication,
} from "@/lib/api/driver";
import type { CreateDriverPayload, GetDriverApplicationsParams } from "@/lib/schemas";
import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const DRIVERS_QUERY_KEY = ["drivers"] as const;
export const DRIVER_STATS_QUERY_KEY = ["drivers", "stats"] as const;
export const driverQueryKey = (id: string) => [...DRIVERS_QUERY_KEY, id] as const;

type ApiError = { message?: string };

const refreshDriverQueries = async (queryClient: QueryClient, id: string) => {
  await queryClient.invalidateQueries({ queryKey: driverQueryKey(id) });
  await queryClient.invalidateQueries({ queryKey: DRIVERS_QUERY_KEY });
  await queryClient.invalidateQueries({ queryKey: DRIVER_STATS_QUERY_KEY });
};

const refreshDriverList = async (queryClient: QueryClient) => {
  await queryClient.invalidateQueries({ queryKey: DRIVERS_QUERY_KEY });
  await queryClient.invalidateQueries({ queryKey: DRIVER_STATS_QUERY_KEY });
};

export const useCreateDriver = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDriverPayload) => createDriverApplication(payload),
    onSuccess: async () => {
      toast.success("Driver application created successfully");
      await refreshDriverList(queryClient);
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to create driver application.");
    },
  });
};

export const useDrivers = (params: GetDriverApplicationsParams) => {
  return useQuery({
    queryKey: [...DRIVERS_QUERY_KEY, params],
    queryFn: () => getDriverApplications(params),
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
};

export const useDriverStats = () => {
  return useQuery({
    queryKey: DRIVER_STATS_QUERY_KEY,
    queryFn: getDriverApplicationStats,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
};

export const useDriver = (id: string) => {
  return useQuery({
    queryKey: driverQueryKey(id),
    queryFn: () => getDriverApplication(id),
    enabled: Boolean(id),
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
};

export const useStartDriverReview = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => startDriverReview(id),
    onSuccess: async () => {
      toast.success("Application moved to review");
      await refreshDriverQueries(queryClient, id);
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to start review.");
    },
  });
};

export const useApproveDriverApplication = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => approveDriverApplication(id),
    onSuccess: async () => {
      toast.success("Driver application approved");
      await refreshDriverQueries(queryClient, id);
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to approve application.");
    },
  });
};

export const useRejectDriverApplication = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewNotes: string) => rejectDriverApplication(id, reviewNotes),
    onSuccess: async () => {
      toast.success("Driver application rejected");
      await refreshDriverQueries(queryClient, id);
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to reject application.");
    },
  });
};

export const useRequestDriverChanges = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewNotes: string) => requestDriverChanges(id, reviewNotes),
    onSuccess: async () => {
      toast.success("Changes requested from driver");
      await refreshDriverQueries(queryClient, id);
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to request changes.");
    },
  });
};

export const useSuspendDriverApplication = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewNotes?: string) => suspendDriverApplication(id, reviewNotes),
    onSuccess: async () => {
      toast.success("Driver suspended");
      await refreshDriverQueries(queryClient, id);
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to suspend driver.");
    },
  });
};
