import API_ROUTES from "@/lib/api/routes";
import type {
  CreateHourlyPricingPayload,
  GetHourlyPricingParams,
  HourlyPricing,
  HourlyPricingListResponse,
  UpdateHourlyPricingPayload,
} from "@/lib/schemas";
import { api } from "./client";

export const getHourlyPricing = async (params?: GetHourlyPricingParams) => {
  return api.get<HourlyPricingListResponse>(API_ROUTES.HOURLY_PRICING, { params });
};

export const getHourlyPricingByCategory = async (categoryId: string) => {
  return api.get<{ items: HourlyPricing[] }>(
    `${API_ROUTES.VEHICLE_CATEGORIES}/${categoryId}/hourly-pricing`
  );
};

export const createHourlyPricing = async (
  categoryId: string,
  payload: CreateHourlyPricingPayload
) => {
  return api.post<HourlyPricing>(
    `${API_ROUTES.VEHICLE_CATEGORIES}/${categoryId}/hourly-pricing`,
    payload
  );
};

export const updateHourlyPricing = async (id: string, payload: UpdateHourlyPricingPayload) => {
  return api.patch<HourlyPricing>(`${API_ROUTES.HOURLY_PRICING}/${id}`, payload);
};

export const deleteHourlyPricing = async (id: string) => {
  return api.delete(`${API_ROUTES.HOURLY_PRICING}/${id}`);
};
