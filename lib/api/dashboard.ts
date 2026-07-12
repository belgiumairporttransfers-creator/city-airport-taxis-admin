import API_ROUTES from "@/lib/api/routes";
import type { AdminDashboardOverview } from "@/lib/schemas";
import { api } from "./client";

export const getAdminDashboard = async () => {
  return api.get<AdminDashboardOverview>(API_ROUTES.DASHBOARD);
};
