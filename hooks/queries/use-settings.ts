import { getSettings, updateSettings } from "@/lib/api/settings";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const SETTINGS_QUERY_KEY = ["settings"] as const;

type ApiError = { message?: string };

export const useSettings = () => {
  return useQuery({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: getSettings,
    staleTime: 1000 * 60,
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSettings,
    onSuccess: async () => {
      toast.success("Site settings updated successfully!");
      await queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
    },
    onError: (error: ApiError) => {
      const message = error?.message || "Failed to update site settings. Please try again.";
      toast.error(message);
    },
  });
};
