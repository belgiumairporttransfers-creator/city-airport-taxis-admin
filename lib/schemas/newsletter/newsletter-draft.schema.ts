import { z } from "zod";
import {
  newsletterAudienceSchema,
  newsletterSendModeSchema,
} from "./send-newsletter.schema";

export const newsletterDraftSchema = z.object({
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
  ctaText: z.string(),
  ctaUrl: z.string(),
  imageUrl: z.string(),
  imagePublicId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const newsletterDraftsResponseSchema = z.object({
  items: z.array(newsletterDraftSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export const getNewsletterDraftsParamsSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  search: z.string().optional(),
  sort: z.string().optional(),
});

export const saveNewsletterDraftSchema = z.object({
  campaignName: z.string().trim().min(1, "Campaign name is required").max(120),
  subject: z.string().trim().optional(),
  preheader: z.string().trim().max(150).optional(),
  message: z.string().optional(),
  fromName: z.string().trim().max(80).optional(),
  replyTo: z.union([z.string().trim().email("Enter a valid reply-to email"), z.literal("")]).optional(),
  audience: newsletterAudienceSchema.optional(),
  sendMode: newsletterSendModeSchema.optional(),
  scheduledDate: z.string().optional(),
  scheduledTime: z.string().optional(),
  ctaText: z.string().trim().max(40).optional(),
  ctaUrl: z.union([z.string().trim().url("Enter a valid URL"), z.literal("")]).optional(),
  imageUrl: z.string().optional(),
  imagePublicId: z.string().optional(),
});

export type NewsletterDraft = z.infer<typeof newsletterDraftSchema>;
export type NewsletterDraftsResponse = z.infer<typeof newsletterDraftsResponseSchema>;
export type GetNewsletterDraftsParams = z.infer<typeof getNewsletterDraftsParamsSchema>;
export type SaveNewsletterDraftPayload = z.infer<typeof saveNewsletterDraftSchema>;
