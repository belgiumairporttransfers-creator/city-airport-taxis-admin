import { z } from "zod";

export const activitySchema = z.object({
  _id: z.string(),
  type: z.enum([
    "login",
    "logout",
    "password_change",
    "password_reset",
    "password_reset_request",
    "update_profile",
    "logout_all",
    "email_verified",
    "session_revoked",
  ]),
  status: z.enum(["success", "failed"]),
  ipAddress: z.string().optional(),
  device: z.string().optional(),
  browser: z.string().optional(),
  os: z.string().optional(),
  timestamp: z.string(),
});

export type Activity = z.infer<typeof activitySchema>;

export const activitiesResponseSchema = z.object({
  items: z.array(activitySchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export const getActivitiesParamsSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
});

export type ActivitiesResponse = z.infer<typeof activitiesResponseSchema>;
export type GetActivitiesParams = z.infer<typeof getActivitiesParamsSchema>;
