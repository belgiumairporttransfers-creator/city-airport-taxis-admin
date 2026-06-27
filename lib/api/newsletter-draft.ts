import API_ROUTES from "@/lib/api/routes";
import type {
  GetNewsletterDraftsParams,
  NewsletterDraft,
  NewsletterDraftsResponse,
  SaveNewsletterDraftPayload,
} from "@/lib/schemas";
import { api } from "./client";

export const getNewsletterDrafts = async (params?: GetNewsletterDraftsParams) => {
  return api.get<NewsletterDraftsResponse>(API_ROUTES.NEWSLETTER_DRAFTS, { params });
};

export const getNewsletterDraft = async (id: string) => {
  return api.get<NewsletterDraft>(`${API_ROUTES.NEWSLETTER_DRAFTS}/${id}`);
};

export const createNewsletterDraft = async (payload: SaveNewsletterDraftPayload) => {
  return api.post<NewsletterDraft>(API_ROUTES.NEWSLETTER_DRAFTS, payload);
};

export const updateNewsletterDraft = async (
  id: string,
  payload: SaveNewsletterDraftPayload
) => {
  return api.put<NewsletterDraft>(`${API_ROUTES.NEWSLETTER_DRAFTS}/${id}`, payload);
};

export const deleteNewsletterDraft = async (id: string) => {
  return api.delete(`${API_ROUTES.NEWSLETTER_DRAFTS}/${id}`);
};

export const bulkDeleteNewsletterDrafts = async (ids: string[]) => {
  return api.delete(`${API_ROUTES.NEWSLETTER_DRAFTS}/bulk`, { data: { ids } });
};
