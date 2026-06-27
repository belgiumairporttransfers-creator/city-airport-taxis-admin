import {
  getNewsletterCampaignRecipients,
  resendCampaignRecipient,
} from "@/lib/api/newsletter-campaign-recipient";
import type {
  GetNewsletterCampaignRecipientsParams,
  NewsletterCampaignRecipientsResponse,
} from "@/lib/schemas";
import { NEWSLETTER_CAMPAIGNS_QUERY_KEY } from "@/hooks/queries/use-newsletter-campaigns";
import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const NEWSLETTER_CAMPAIGN_RECIPIENTS_QUERY_KEY = [
  "newsletter-campaign-recipients",
] as const;
type ApiError = { message?: string };

const removeRecipientFromCache = (queryClient: QueryClient, recipientId: string) => {
  queryClient.setQueriesData<NewsletterCampaignRecipientsResponse>(
    { queryKey: NEWSLETTER_CAMPAIGN_RECIPIENTS_QUERY_KEY },
    (current) => {
      if (!current?.items) return current;

      const items = current.items.filter((item) => item._id !== recipientId);
      if (items.length === current.items.length) return current;

      return {
        ...current,
        items,
        meta: current.meta
          ? {
              ...current.meta,
              total: Math.max(0, current.meta.total - 1),
            }
          : current.meta,
      };
    }
  );
};

const refreshNewsletterCampaignRecipients = async (queryClient: QueryClient) => {
  await queryClient.invalidateQueries({ queryKey: NEWSLETTER_CAMPAIGN_RECIPIENTS_QUERY_KEY });
  await queryClient.refetchQueries({
    queryKey: NEWSLETTER_CAMPAIGN_RECIPIENTS_QUERY_KEY,
    type: "active",
  });
};

export const useNewsletterCampaignRecipients = (
  params: GetNewsletterCampaignRecipientsParams
) => {
  return useQuery({
    queryKey: [...NEWSLETTER_CAMPAIGN_RECIPIENTS_QUERY_KEY, params],
    queryFn: () => getNewsletterCampaignRecipients(params),
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
};

export const useResendCampaignRecipient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => resendCampaignRecipient(id),
    onSuccess: async (recipient, recipientId) => {
      toast.success(
        recipient?.status === "sent"
          ? "Email resent successfully"
          : "Email resend failed. Please try again."
      );

      if (recipient?.status === "sent") {
        removeRecipientFromCache(queryClient, recipientId);
      }

      await Promise.all([
        refreshNewsletterCampaignRecipients(queryClient),
        queryClient.invalidateQueries({ queryKey: NEWSLETTER_CAMPAIGNS_QUERY_KEY }),
      ]);
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to resend email.");
    },
  });
};
