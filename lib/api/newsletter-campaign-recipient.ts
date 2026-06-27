import API_ROUTES from "@/lib/api/routes";
import type {
  GetNewsletterCampaignRecipientsParams,
  NewsletterCampaignRecipient,
  NewsletterCampaignRecipientsResponse,
} from "@/lib/schemas";
import { api } from "./client";

export const getNewsletterCampaignRecipients = async (
  params?: GetNewsletterCampaignRecipientsParams
) => {
  return api.get<NewsletterCampaignRecipientsResponse>(
    API_ROUTES.NEWSLETTER_CAMPAIGN_RECIPIENTS,
    { params }
  );
};

export const resendCampaignRecipient = async (id: string) => {
  return api.post<NewsletterCampaignRecipient>(
    `${API_ROUTES.NEWSLETTER_CAMPAIGN_RECIPIENTS}/${id}/resend`
  );
};

export const resendFailedCampaignRecipients = async (campaignId: string) => {
  return api.post<{ resent: number; stillFailed: number; total: number }>(
    `${API_ROUTES.NEWSLETTER_CAMPAIGN_RECIPIENTS}/resend-failed`,
    { campaignId }
  );
};
