import API_ROUTES from "@/lib/api/routes";
import type { GetPaymentsParams, PaymentsResponse } from "@/lib/schemas";
import { api } from "./client";

export const getPayments = async (params?: GetPaymentsParams) => {
  return api.get<PaymentsResponse>(API_ROUTES.PAYMENTS, { params });
};

export const deletePayment = async (id: string) => {
  return api.delete(`${API_ROUTES.PAYMENTS}/${id}`);
};

export const bulkDeletePayments = async (ids: string[]) => {
  return api.delete(`${API_ROUTES.PAYMENTS}/bulk`, { data: { ids } });
};
