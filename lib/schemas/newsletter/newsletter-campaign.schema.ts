import { z } from "zod";
import {
  newsletterAudienceSchema,
  newsletterSendModeSchema,
} from "./send-newsletter.schema";

export const newsletterCampaignStatusSchema = z.enum([
  "scheduled",
  "sending",
  "sent",
  "failed",
  "cancelled",
]);

export const newsletterCampaignSchema = z.object({
  _id: z.string(),
  campaignName: z.string(),
  subject: z.string(),
  preheader: z.string(),
  message: z.string(),
  fromName: z.string(),
  replyTo: z.string(),
  audience: newsletterAudienceSchema,
  sendMode: newsletterSendModeSchema,
  scheduledDate: z.string(),
  scheduledTime: z.string(),
  scheduledAt: z.string().optional(),
  ctaText: z.string(),
  ctaUrl: z.string(),
  imageUrl: z.string(),
  imagePublicId: z.string(),
  status: newsletterCampaignStatusSchema,
  recipientCount: z.number(),
  sentCount: z.number(),
  failedCount: z.number(),
  sentAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  queued: z.boolean().optional(),
});

export const newsletterCampaignsResponseSchema = z.object({
  items: z.array(newsletterCampaignSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export const getNewsletterCampaignsParamsSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  search: z.string().optional(),
  status: newsletterCampaignStatusSchema.optional(),
  sort: z.string().optional(),
});

export const sendNewsletterPayloadSchema = z.object({
  campaignName: z.string().trim().min(1).max(120),
  subject: z.string().trim().min(1),
  preheader: z.string().trim().max(150).optional(),
  message: z.string().min(1),
  fromName: z.string().trim().min(1).max(80),
  replyTo: z.string().trim().email(),
  audience: newsletterAudienceSchema,
  sendMode: newsletterSendModeSchema,
  scheduledDate: z.string().optional(),
  scheduledTime: z.string().optional(),
  scheduledAt: z.string().optional(),
  ctaText: z.string().trim().max(40).optional(),
  ctaUrl: z.union([z.string().trim().url(), z.literal("")]).optional(),
  imageUrl: z.string().optional(),
  imagePublicId: z.string().optional(),
  draftId: z.string().optional(),
});

export type NewsletterCampaign = z.infer<typeof newsletterCampaignSchema>;
export type NewsletterCampaignsResponse = z.infer<typeof newsletterCampaignsResponseSchema>;
export type GetNewsletterCampaignsParams = z.infer<typeof getNewsletterCampaignsParamsSchema>;
export type SendNewsletterPayload = z.infer<typeof sendNewsletterPayloadSchema>;
