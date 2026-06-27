import API_ROUTES from "@/lib/api/routes";
import type {
  CreateVehiclePricingPayload,
  GetVehiclePricingParams,
  PricingStructureValidation,
  UpdateVehiclePricingPayload,
  VehiclePricing,
  VehiclePricingListResponse,
  VehiclePricingQuotesResponse,
} from "@/lib/schemas";
import { api } from "./client";

export const getVehiclePricing = async (params?: GetVehiclePricingParams) => {
  return api.get<VehiclePricingListResponse>(API_ROUTES.VEHICLE_PRICING, { params });
};

export const getVehiclePricingByCategory = async (categoryId: string) => {
  return api.get<{ items: VehiclePricing[] }>(
    `${API_ROUTES.VEHICLE_CATEGORIES}/${categoryId}/pricing`
  );
};

export const createVehiclePricing = async (
  categoryId: string,
  payload: CreateVehiclePricingPayload
) => {
  return api.post<VehiclePricing>(
    `${API_ROUTES.VEHICLE_CATEGORIES}/${categoryId}/pricing`,
    payload
  );
};

export const updateVehiclePricing = async (id: string, payload: UpdateVehiclePricingPayload) => {
  return api.patch<VehiclePricing>(`${API_ROUTES.VEHICLE_PRICING}/${id}`, payload);
};

export const deleteVehiclePricing = async (id: string) => {
  return api.delete(`${API_ROUTES.VEHICLE_PRICING}/${id}`);
};

export const getVehiclePricingQuotes = async (distance: number) => {
  return api.get<VehiclePricingQuotesResponse>(`${API_ROUTES.VEHICLE_PRICING}/quotes`, {
    params: { distance },
  });
};

export const validateVehiclePricingStructure = async (categoryId: string) => {
  return api.post<PricingStructureValidation>(
    `${API_ROUTES.VEHICLE_CATEGORIES}/${categoryId}/pricing/validate`,
    {}
  );
};
