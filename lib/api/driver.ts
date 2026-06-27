import API_ROUTES from "@/lib/api/routes";
import type {
  CreateDriverPayload,
  DriverApplication,
  DriverApplicationStats,
  DriverApplicationsResponse,
  GetDriverApplicationsParams,
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
