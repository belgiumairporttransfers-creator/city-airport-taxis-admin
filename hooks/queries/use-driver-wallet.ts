import {
  approveDriverPayout,
  getAllDriverPayouts,
  getDriverWallet,
  getDriverWalletPayouts,
  getDriverWalletTransactions,
  rejectDriverPayout,
} from "@/lib/api/driver";
import type { GetWalletTransactionsParams } from "@/lib/schemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const driverWalletQueryKey = (id: string) => ["drivers", id, "wallet"] as const;
export const driverWalletTransactionsQueryKey = (
  id: string,
  params: GetWalletTransactionsParams
) => ["drivers", id, "wallet", "transactions", params] as const;
export const driverWalletPayoutsQueryKey = (
  id: string,
  params: GetWalletTransactionsParams
) => ["drivers", id, "wallet", "payouts", params] as const;
export const allDriverPayoutsQueryKey = (params: GetWalletTransactionsParams) =>
  ["drivers", "payouts", params] as const;

type ApiError = { message?: string };

export const useDriverWallet = (id: string) => {
  return useQuery({
    queryKey: driverWalletQueryKey(id),
    queryFn: () => getDriverWallet(id),
    enabled: Boolean(id),
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
};

export const useDriverWalletTransactions = (
  id: string,
  params: GetWalletTransactionsParams
) => {
  return useQuery({
    queryKey: driverWalletTransactionsQueryKey(id, params),
    queryFn: () => getDriverWalletTransactions(id, params),
    enabled: Boolean(id),
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
};

export const useDriverWalletPayouts = (
  id: string,
  params: GetWalletTransactionsParams
) => {
  return useQuery({
    queryKey: driverWalletPayoutsQueryKey(id, params),
    queryFn: () => getDriverWalletPayouts(id, params),
    enabled: Boolean(id),
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
};

export const useAllDriverPayouts = (params: GetWalletTransactionsParams) => {
  return useQuery({
    queryKey: allDriverPayoutsQueryKey(params),
    queryFn: () => getAllDriverPayouts(params),
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
};

const refreshDriverWallet = async (
  queryClient: ReturnType<typeof useQueryClient>,
  id?: string
) => {
  if (id) {
    await queryClient.invalidateQueries({ queryKey: ["drivers", id, "wallet"] });
  }
  await queryClient.invalidateQueries({ queryKey: ["drivers", "payouts"] });
};

export const useApproveDriverPayout = (driverId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      driverId: payoutDriverId,
      transactionId,
    }: {
      driverId: string;
      transactionId: string;
    }) => approveDriverPayout(payoutDriverId, transactionId),
    onSuccess: async (_data, variables) => {
      toast.success("Payout approved");
      await refreshDriverWallet(queryClient, variables.driverId || driverId);
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to approve payout.");
    },
  });
};

export const useRejectDriverPayout = (driverId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      driverId: payoutDriverId,
      transactionId,
      adminNotes,
    }: {
      driverId: string;
      transactionId: string;
      adminNotes?: string;
    }) => rejectDriverPayout(payoutDriverId, transactionId, adminNotes),
    onSuccess: async (_data, variables) => {
      toast.success("Payout rejected");
      await refreshDriverWallet(queryClient, variables.driverId || driverId);
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to reject payout.");
    },
  });
};
