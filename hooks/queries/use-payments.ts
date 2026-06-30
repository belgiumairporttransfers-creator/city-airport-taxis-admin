import { bulkDeletePayments, deletePayment, getPayments } from "@/lib/api/payment";
import type { GetPaymentsParams } from "@/lib/schemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const PAYMENTS_QUERY_KEY = ["payments"] as const;
type ApiError = { message?: string };

export const usePayments = (params: GetPaymentsParams) => {
  return useQuery({
    queryKey: [...PAYMENTS_QUERY_KEY, params],
    queryFn: () => getPayments(params),
    staleTime: 1000 * 30,
  });
};

export const useDeletePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePayment,
    onSuccess: async () => {
      toast.success("Payment deleted successfully");
      await queryClient.invalidateQueries({ queryKey: PAYMENTS_QUERY_KEY });
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to delete payment.");
    },
  });
};

export const useBulkDeletePayments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkDeletePayments,
    onSuccess: async (_, ids) => {
      toast.success(
        ids.length === 1
          ? "Payment deleted successfully"
          : `${ids.length} payments deleted successfully`
      );
      await queryClient.invalidateQueries({ queryKey: PAYMENTS_QUERY_KEY });
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to delete payments.");
    },
  });
};
