import { z } from "zod";

export const sessionSchema = z.object({
  _id: z.string(),
  ipAddress: z.string(),
  device: z.string().optional(),
  browser: z.string().optional(),
  os: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

export type AuthSession = z.infer<typeof sessionSchema>;

export const sessionsResponseSchema = z.object({
  items: z.array(sessionSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export const getSessionsParamsSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
});

export type SessionsResponse = z.infer<typeof sessionsResponseSchema>;
export type GetSessionsParams = z.infer<typeof getSessionsParamsSchema>;
