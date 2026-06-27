import { deleteNewsletterCampaign, getNewsletterCampaigns, resendNewsletterCampaign, sendNewsletter } from "@/lib/api/newsletter-campaign";
import type {
  GetNewsletterCampaignsParams,
  NewsletterCampaign,
  NewsletterCampaignsResponse,
  SendNewsletterPayload,
} from "@/lib/schemas";
import { NEWSLETTER_CAMPAIGN_RECIPIENTS_QUERY_KEY } from "@/hooks/queries/use-newsletter-campaign-recipients";
import { NEWSLETTER_DRAFTS_QUERY_KEY } from "@/hooks/queries/use-newsletter-drafts";
import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const NEWSLETTER_CAMPAIGNS_QUERY_KEY = ["newsletter-campaigns"] as const;
type ApiError = { message?: string };

const refreshNewsletterCampaigns = async (queryClient: QueryClient) => {
  await queryClient.invalidateQueries({ queryKey: NEWSLETTER_CAMPAIGNS_QUERY_KEY });
  await queryClient.refetchQueries({
    queryKey: NEWSLETTER_CAMPAIGNS_QUERY_KEY,
    type: "active",
  });
};

const refreshNewsletterCampaignRecipients = async (queryClient: QueryClient) => {
  await queryClient.invalidateQueries({ queryKey: NEWSLETTER_CAMPAIGN_RECIPIENTS_QUERY_KEY });
  await queryClient.refetchQueries({
    queryKey: NEWSLETTER_CAMPAIGN_RECIPIENTS_QUERY_KEY,
    type: "active",
  });
};

const removeCampaignFromCache = (queryClient: QueryClient, campaignId: string) => {
  queryClient.setQueriesData<NewsletterCampaignsResponse>(
    { queryKey: NEWSLETTER_CAMPAIGNS_QUERY_KEY },
    (current) => {
      if (!current?.items) return current;

      const items = current.items.filter((item) => item._id !== campaignId);
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

const upsertCampaignInCache = (queryClient: QueryClient, campaign: NewsletterCampaign) => {
  queryClient.setQueriesData<NewsletterCampaignsResponse>(
    { queryKey: NEWSLETTER_CAMPAIGNS_QUERY_KEY },
    (current) => {
      if (!current?.items) return current;

      const index = current.items.findIndex((item) => item._id === campaign._id);
      if (index === -1) return current;

      const items = [...current.items];
      items[index] = { ...items[index], ...campaign };
      return { ...current, items };
    }
  );
};

const CAMPAIGN_POLL_INTERVAL_MS = 4000;

const hasActiveCampaignSend = (items: NewsletterCampaign[]) =>
  items.some(
    (campaign) =>
      campaign.status === "sending" &&
      campaign.recipientCount > 0 &&
      campaign.sentCount + campaign.failedCount < campaign.recipientCount
  );

export const useNewsletterCampaigns = (
  params: GetNewsletterCampaignsParams,
  options?: { pollWhileSending?: boolean }
) => {
  const pollWhileSending = options?.pollWhileSending ?? false;

  return useQuery({
    queryKey: [...NEWSLETTER_CAMPAIGNS_QUERY_KEY, params],
    queryFn: () => getNewsletterCampaigns(params),
    staleTime: pollWhileSending ? 2000 : 0,
    refetchInterval: pollWhileSending
      ? (query) => {
          const items =
            (query.state.data as NewsletterCampaignsResponse | undefined)?.items ?? [];
          return hasActiveCampaignSend(items) ? CAMPAIGN_POLL_INTERVAL_MS : false;
        }
      : false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
  });
};

export const useSendNewsletter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendNewsletterPayload) => sendNewsletter(payload),
    onSuccess: async (campaign, variables) => {
      toast.success(
        variables.sendMode === "scheduled"
          ? "Newsletter scheduled successfully"
          : campaign?.queued
            ? "Newsletter queued successfully. Track live sending progress in Sent Campaigns."
            : campaign?.status === "sending"
              ? "Newsletter is being sent. Track progress in Sent Campaigns."
              : campaign?.status === "sent"
                ? "Newsletter sent successfully"
                : "Newsletter send failed. You can resend from campaigns."
      );
      await Promise.all([
        refreshNewsletterCampaigns(queryClient),
        variables.draftId
          ? queryClient.invalidateQueries({ queryKey: NEWSLETTER_DRAFTS_QUERY_KEY })
          : Promise.resolve(),
      ]);
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to send newsletter.");
    },
  });
};

export const useResendNewsletterCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => resendNewsletterCampaign(id),
    onSuccess: async (campaign) => {
      if (campaign) {
        upsertCampaignInCache(queryClient, campaign);
      }

      toast.success(
        campaign?.queued
          ? "Newsletter resend queued. Track live progress in Sent Campaigns."
          : campaign?.status === "sending"
            ? "Newsletter resend started. Track progress in Sent Campaigns."
            : campaign?.status === "sent"
              ? "Newsletter resent successfully"
              : "Newsletter resend failed. Please try again."
      );

      await Promise.all([
        refreshNewsletterCampaigns(queryClient),
        refreshNewsletterCampaignRecipients(queryClient),
      ]);
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to resend newsletter.");
    },
  });
};

export const useDeleteNewsletterCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteNewsletterCampaign(id),
    onMutate: async (campaignId) => {
      await queryClient.cancelQueries({ queryKey: NEWSLETTER_CAMPAIGNS_QUERY_KEY });

      const snapshots = queryClient.getQueriesData<NewsletterCampaignsResponse>({
        queryKey: NEWSLETTER_CAMPAIGNS_QUERY_KEY,
      });

      removeCampaignFromCache(queryClient, campaignId);

      return { snapshots };
    },
    onSuccess: async () => {
      toast.success("Campaign deleted successfully");
      await Promise.all([
        refreshNewsletterCampaigns(queryClient),
        refreshNewsletterCampaignRecipients(queryClient),
      ]);
    },
    onError: (error: ApiError, _campaignId, context) => {
      context?.snapshots.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      toast.error(error?.message || "Failed to delete campaign.");
    },
  });
};
