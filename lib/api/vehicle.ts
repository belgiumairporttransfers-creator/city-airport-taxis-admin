import API_ROUTES from "@/lib/api/routes";
import type {
  CreateVehiclePayload,
  GetVehiclesParams,
  UpdateVehiclePayload,
  Vehicle,
  VehiclesResponse,
} from "@/lib/schemas";
import { api } from "./client";

export const getVehicles = async (params?: GetVehiclesParams) => {
  return api.get<VehiclesResponse>(API_ROUTES.VEHICLES, { params });
};

export const createVehicle = async (payload: CreateVehiclePayload) => {
  return api.post<Vehicle>(API_ROUTES.VEHICLES, payload);
};

export const updateVehicle = async (id: string, payload: UpdateVehiclePayload) => {
  return api.patch<Vehicle>(`${API_ROUTES.VEHICLES}/${id}`, payload);
};

export const deleteVehicle = async (id: string) => {
  return api.delete(`${API_ROUTES.VEHICLES}/${id}`);
};
