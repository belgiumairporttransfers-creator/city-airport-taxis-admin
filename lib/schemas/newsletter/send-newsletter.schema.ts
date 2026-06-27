import { z } from "zod";

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, "").trim();

export const newsletterAudienceOptions = [
  { label: "All subscribers", value: "all" },
  { label: "Coming soon page", value: "coming-soon" },
  { label: "Website", value: "website" },
] as const;

export const newsletterSendModeOptions = [
  { label: "Send immediately", value: "immediate" },
  { label: "Schedule for later", value: "scheduled" },
] as const;

export const newsletterAudienceSchema = z.enum(["all", "coming-soon", "website"]);
export const newsletterSendModeSchema = z.enum(["immediate", "scheduled"]);

export const sendNewsletterFormSchema = z
  .object({
    campaignName: z.string().trim().min(1, "Campaign name is required").max(120),
    subject: z.string().trim().min(1, "Subject is required"),
    preheader: z.string().trim().max(150, "Preheader must be 150 characters or less"),
    message: z.string().refine((value) => stripHtml(value).length > 0, {
      message: "Message is required",
    }),
    fromName: z.string().trim().min(1, "Sender name is required").max(80),
    replyTo: z.string().trim().email("Enter a valid reply-to email"),
    audience: newsletterAudienceSchema,
    sendMode: newsletterSendModeSchema,
    scheduledDate: z.string().optional(),
    scheduledTime: z.string().optional(),
    ctaText: z.string().trim().max(40, "Button text is too long"),
    ctaUrl: z.union([z.string().trim().url("Enter a valid URL"), z.literal("")]),
    image: z.union([z.instanceof(File), z.null()]).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.sendMode === "scheduled") {
      if (!data.scheduledDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["scheduledDate"],
          message: "Schedule date is required",
        });
      }

      if (!data.scheduledTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["scheduledTime"],
          message: "Schedule time is required",
        });
      }
    }

    if (data.ctaText && !data.ctaUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["ctaUrl"],
        message: "Button URL is required when button text is provided",
      });
    }
  });

export type SendNewsletterFormSchema = z.infer<typeof sendNewsletterFormSchema>;
