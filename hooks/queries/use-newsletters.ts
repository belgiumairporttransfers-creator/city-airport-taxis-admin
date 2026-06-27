import {
  bulkDeleteNewsletters,
  deleteNewsletter,
  getNewsletters,
  } from "@/lib/api/newsletter";
import type { GetNewslettersParams } from "@/lib/schemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const NEWSLETTERS_QUERY_KEY = ["newsletters"] as const;
type ApiError = { message?: string };

export const useNewsletters = (params: GetNewslettersParams) => {
  return useQuery({
    queryKey: [...NEWSLETTERS_QUERY_KEY, params],
    queryFn: () => getNewsletters(params),
    staleTime: 1000 * 30,
  });
};

export const useDeleteNewsletter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNewsletter,
    onSuccess: async () => {
      toast.success("Subscriber removed successfully");
      await queryClient.invalidateQueries({ queryKey: NEWSLETTERS_QUERY_KEY });
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to remove subscriber.");
    },
  });
};

export const useBulkDeleteNewsletters = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkDeleteNewsletters,
    onSuccess: async (_, ids) => {
      toast.success(
        ids.length === 1
          ? "Subscriber removed successfully"
          : `${ids.length} subscribers removed successfully`
      );
      await queryClient.invalidateQueries({ queryKey: NEWSLETTERS_QUERY_KEY });
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to remove subscribers.");
    },
  });
};
