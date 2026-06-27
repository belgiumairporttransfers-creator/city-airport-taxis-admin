import API_ROUTES from "@/lib/api/routes";
import type {
  GetNewsletterCampaignsParams,
  NewsletterCampaign,
  NewsletterCampaignsResponse,
  SendNewsletterPayload,
} from "@/lib/schemas";
import { api } from "./client";

export const sendNewsletter = async (payload: SendNewsletterPayload) => {
  return api.post<NewsletterCampaign>(`${API_ROUTES.NEWSLETTER_CAMPAIGNS}/send`, payload);
};

export const getNewsletterCampaigns = async (params?: GetNewsletterCampaignsParams) => {
  return api.get<NewsletterCampaignsResponse>(API_ROUTES.NEWSLETTER_CAMPAIGNS, { params });
};

export const getNewsletterCampaign = async (id: string) => {
  return api.get<NewsletterCampaign>(`${API_ROUTES.NEWSLETTER_CAMPAIGNS}/${id}`);
};

export const resendNewsletterCampaign = async (id: string) => {
  return api.post<NewsletterCampaign>(`${API_ROUTES.NEWSLETTER_CAMPAIGNS}/${id}/resend`);
};

export const deleteNewsletterCampaign = async (id: string) => {
  return api.delete<NewsletterCampaign>(`${API_ROUTES.NEWSLETTER_CAMPAIGNS}/${id}`);
};
