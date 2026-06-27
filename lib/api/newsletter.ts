import API_ROUTES from "@/lib/api/routes";
import type { GetNewslettersParams, NewslettersResponse } from "@/lib/schemas";
import { api } from "./client";

export const getNewsletters = async (params?: GetNewslettersParams) => {
  return api.get<NewslettersResponse>(API_ROUTES.NEWSLETTERS, { params });
};

export const deleteNewsletter = async (id: string) => {
  return api.delete(`${API_ROUTES.NEWSLETTERS}/${id}`);
};

export const bulkDeleteNewsletters = async (ids: string[]) => {
  return api.delete(`${API_ROUTES.NEWSLETTERS}/bulk`, { data: { ids } });
};
