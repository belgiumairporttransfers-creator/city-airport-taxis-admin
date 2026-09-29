import API_ROUTES from "@/lib/api/routes";
import type {
  AdminUser,
  AdminUsersResponse,
  AdminUserStats,
  GetAdminUsersParams,
} from "@/lib/schemas";
import { api } from "./client";

export const getAdminUsers = async (params?: GetAdminUsersParams) => {
  return api.get<AdminUsersResponse>(API_ROUTES.USERS, { params });
};

export const getAdminUserStats = async () => {
  return api.get<AdminUserStats>(`${API_ROUTES.USERS}/stats`);
};

export const getAdminUser = async (id: string) => {
  return api.get<AdminUser>(`${API_ROUTES.USERS}/${id}`);
};

export const deleteAdminUser = async (id: string) => {
  return api.delete<{ message: string }>(`${API_ROUTES.USERS}/${id}`);
};

export const bulkDeleteAdminUsers = async (ids: string[]) => {
  return api.post<{ message: string; deletedCount: number }>(
    `${API_ROUTES.USERS}/bulk-delete`,
    { ids }
  );
};

export const updateAdminUserStatus = async (
  id: string,
  payload: { status: "active" | "suspended"; reason?: string }
) => {
  return api.patch<AdminUser>(`${API_ROUTES.USERS}/${id}/status`, payload);
};
