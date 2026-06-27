import API_ROUTES from "@/lib/api/routes";
import type {
  CreateVehicleCategoryPayload,
  GetVehicleCategoriesParams,
  UpdateVehicleCategoryPayload,
  VehicleCategoriesResponse,
  VehicleCategory,
} from "@/lib/schemas";
import { api } from "./client";

export const getVehicleCategories = async (params?: GetVehicleCategoriesParams) => {
  return api.get<VehicleCategoriesResponse>(API_ROUTES.VEHICLE_CATEGORIES, { params });
};

export const createVehicleCategory = async (payload: CreateVehicleCategoryPayload) => {
  return api.post<VehicleCategory>(API_ROUTES.VEHICLE_CATEGORIES, payload);
};

export const updateVehicleCategory = async (id: string, payload: UpdateVehicleCategoryPayload) => {
  return api.patch<VehicleCategory>(`${API_ROUTES.VEHICLE_CATEGORIES}/${id}`, payload);
};

export const deleteVehicleCategory = async (id: string) => {
  return api.delete(`${API_ROUTES.VEHICLE_CATEGORIES}/${id}`);
};
