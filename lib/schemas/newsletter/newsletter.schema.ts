import { z } from "zod";

export const newsletterSourceSchema = z.enum(["coming-soon", "website"]);

export const newsletterSchema = z.object({
  _id: z.string(),
  email: z.string().email(),
  source: newsletterSourceSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const newslettersResponseSchema = z.object({
  items: z.array(newsletterSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export const getNewslettersParamsSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  search: z.string().optional(),
  source: newsletterSourceSchema.optional(),
  sort: z.string().optional(),
});

export type NewsletterSource = z.infer<typeof newsletterSourceSchema>;
export type Newsletter = z.infer<typeof newsletterSchema>;
export type NewslettersResponse = z.infer<typeof newslettersResponseSchema>;
export type GetNewslettersParams = z.infer<typeof getNewslettersParamsSchema>;
