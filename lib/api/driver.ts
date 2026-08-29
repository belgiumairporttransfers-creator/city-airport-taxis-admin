import API_ROUTES from "@/lib/api/routes";
import type {
  AdminPayoutsResponse,
  CreateDriverPayload,
  DriverApplication,
  DriverApplicationStats,
  DriverApplicationsResponse,
  DriverWalletSummary,
  GetDriverApplicationsParams,
  GetWalletTransactionsParams,
  WalletTransaction,
  WalletTransactionsResponse,
} from "@/lib/schemas";
import { api } from "./client";

export const getDriverApplications = async (params?: GetDriverApplicationsParams) => {
  return api.get<DriverApplicationsResponse>(API_ROUTES.DRIVERS, { params });
};

export const getDriverApplication = async (id: string) => {
  return api.get<DriverApplication>(`${API_ROUTES.DRIVERS}/${id}`);
};

export const getDriverApplicationStats = async () => {
  return api.get<DriverApplicationStats>(`${API_ROUTES.DRIVERS}/stats`);
};

export const getDriverWallet = async (id: string) => {
  return api.get<DriverWalletSummary>(`${API_ROUTES.DRIVERS}/${id}/wallet`);
};

export const getDriverWalletTransactions = async (
  id: string,
  params?: GetWalletTransactionsParams
) => {
  return api.get<WalletTransactionsResponse>(`${API_ROUTES.DRIVERS}/${id}/wallet/transactions`, {
    params,
  });
};

export const getDriverWalletPayouts = async (
  id: string,
  params?: GetWalletTransactionsParams
) => {
  return api.get<WalletTransactionsResponse>(`${API_ROUTES.DRIVERS}/${id}/wallet/payouts`, {
    params,
  });
};

export const getAllDriverPayouts = async (params?: GetWalletTransactionsParams) => {
  return api.get<AdminPayoutsResponse>(`${API_ROUTES.DRIVERS}/payouts`, {
    params,
  });
};

export const approveDriverPayout = async (driverId: string, transactionId: string) => {
  return api.post<WalletTransaction>(
    `${API_ROUTES.DRIVERS}/${driverId}/wallet/payouts/${transactionId}/approve`
  );
};

export const rejectDriverPayout = async (
  driverId: string,
  transactionId: string,
  adminNotes?: string
) => {
  return api.post<WalletTransaction>(
    `${API_ROUTES.DRIVERS}/${driverId}/wallet/payouts/${transactionId}/reject`,
    adminNotes?.trim() ? { adminNotes: adminNotes.trim() } : {}
  );
};

export const createDriverApplication = async (payload: CreateDriverPayload) => {
  return api.post<DriverApplication>(API_ROUTES.DRIVERS, payload);
};

export const startDriverReview = async (id: string) => {
  return api.post<DriverApplication>(`${API_ROUTES.DRIVERS}/${id}/start-review`);
};

export const approveDriverApplication = async (id: string) => {
  return api.post<DriverApplication>(`${API_ROUTES.DRIVERS}/${id}/approve`);
};

export const rejectDriverApplication = async (id: string, reviewNotes: string) => {
  return api.post<DriverApplication>(`${API_ROUTES.DRIVERS}/${id}/reject`, { reviewNotes });
};

export const requestDriverChanges = async (id: string, reviewNotes: string) => {
  return api.post<DriverApplication>(`${API_ROUTES.DRIVERS}/${id}/request-changes`, {
    reviewNotes,
  });
};

export const suspendDriverApplication = async (id: string, reviewNotes?: string) => {
  return api.post<DriverApplication>(`${API_ROUTES.DRIVERS}/${id}/suspend`, { reviewNotes });
};

export const reactivateDriverApplication = async (id: string) => {
  return api.post<DriverApplication>(`${API_ROUTES.DRIVERS}/${id}/reactivate`);
};

export const deleteDriverApplication = async (id: string) => {
  return api.delete<{ id: string; applicationNumber: string }>(`${API_ROUTES.DRIVERS}/${id}`);
};
