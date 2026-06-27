import { z } from "zod";

export const newsletterCampaignRecipientStatusSchema = z.enum([
  "pending",
  "sent",
  "failed",
]);

export const newsletterCampaignRecipientSchema = z.object({
  _id: z.string(),
  campaignId: z.string(),
  campaignName: z.string().optional(),
  campaignSubject: z.string().optional(),
  campaignStatus: z.string().optional(),
  email: z.string(),
  status: newsletterCampaignRecipientStatusSchema,
  errorMessage: z.string().optional(),
  sentAt: z.string().optional(),
  lastAttemptAt: z.string().optional(),
  attemptCount: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const newsletterCampaignRecipientsResponseSchema = z.object({
  items: z.array(newsletterCampaignRecipientSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export const getNewsletterCampaignRecipientsParamsSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  search: z.string().optional(),
  campaignId: z.string().optional(),
  status: newsletterCampaignRecipientStatusSchema.optional(),
  sort: z.string().optional(),
});

export type NewsletterCampaignRecipient = z.infer<typeof newsletterCampaignRecipientSchema>;
export type NewsletterCampaignRecipientsResponse = z.infer<
  typeof newsletterCampaignRecipientsResponseSchema
>;
export type GetNewsletterCampaignRecipientsParams = z.infer<
  typeof getNewsletterCampaignRecipientsParamsSchema
>;
