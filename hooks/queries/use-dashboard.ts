import { getAdminDashboard } from "@/lib/api/dashboard";
import { useQuery } from "@tanstack/react-query";

export const ADMIN_DASHBOARD_QUERY_KEY = ["admin-dashboard"] as const;

export const useAdminDashboard = () => {
  return useQuery({
    queryKey: ADMIN_DASHBOARD_QUERY_KEY,
    queryFn: getAdminDashboard,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  });
};
