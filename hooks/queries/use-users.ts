import {
  bulkDeleteAdminUsers,
  deleteAdminUser,
  getAdminUsers,
  getAdminUserStats,
  updateAdminUserStatus,
} from "@/lib/api/user";
import type {
  AdminUsersResponse,
  GetAdminUsersParams,
} from "@/lib/schemas";
import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const USERS_QUERY_KEY = ["admin", "users"] as const;
export const USER_STATS_QUERY_KEY = ["admin", "users", "stats"] as const;

type ApiError = { message?: string };

const refreshUsers = async (queryClient: QueryClient) => {
  await queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
  await queryClient.invalidateQueries({ queryKey: USER_STATS_QUERY_KEY });
  await queryClient.refetchQueries({
    queryKey: USERS_QUERY_KEY,
    type: "active",
  });
};

const removeUserFromCache = (queryClient: QueryClient, userId: string) => {
  queryClient.setQueriesData<AdminUsersResponse>({ queryKey: USERS_QUERY_KEY }, (current) => {
    if (!current?.items) return current;

    const items = current.items.filter((item) => item._id !== userId);
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

export const useAdminUsers = (params?: GetAdminUsersParams) => {
  return useQuery({
    queryKey: [...USERS_QUERY_KEY, params],
    queryFn: () => getAdminUsers(params),
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
};

export const useAdminUserStats = () => {
  return useQuery({
    queryKey: USER_STATS_QUERY_KEY,
    queryFn: getAdminUserStats,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });
};

export const useDeleteAdminUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => deleteAdminUser(userId),
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: USERS_QUERY_KEY });

      const snapshots = queryClient.getQueriesData<AdminUsersResponse>({
        queryKey: USERS_QUERY_KEY,
      });

      removeUserFromCache(queryClient, userId);

      return { snapshots };
    },
    onSuccess: async () => {
      toast.success("User account totally deleted successfully.");
      await refreshUsers(queryClient);
    },
    onError: (error: ApiError, _userId, context) => {
      context?.snapshots.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      toast.error(error?.message || "Failed to delete user account.");
    },
  });
};

export const useUpdateAdminUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      reason,
    }: {
      id: string;
      status: "active" | "suspended";
      reason?: string;
    }) => updateAdminUserStatus(id, { status, reason }),
    onSuccess: async () => {
      toast.success("User status updated successfully.");
      await refreshUsers(queryClient);
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to update user status.");
    },
  });
};

export const useBulkDeleteAdminUsers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userIds: string[]) => bulkDeleteAdminUsers(userIds),
    onMutate: async (userIds) => {
      await queryClient.cancelQueries({ queryKey: USERS_QUERY_KEY });

      const snapshots = queryClient.getQueriesData<AdminUsersResponse>({
        queryKey: USERS_QUERY_KEY,
      });

      userIds.forEach((id) => removeUserFromCache(queryClient, id));

      return { snapshots };
    },
    onSuccess: (_data, userIds) => {
      toast.success(`${userIds.length} user account(s) permanently deleted.`);
      void refreshUsers(queryClient);
    },
    onError: (error: ApiError, _userIds, context) => {
      context?.snapshots.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      toast.error(error?.message || "Failed to delete selected users.");
    },
  });
};
