import { z } from "zod";

export const notificationSeveritySchema = z.enum(["info", "success", "warning", "error"]);

export const notificationEntityTypeSchema = z.enum([
  "driver",
  "customer",
  "booking",
  "vehicle",
  "payment",
  "system",
  "other",
]);

export const notificationSchema = z.object({
  id: z.string(),
  title: z.string(),
  message: z.string(),
  type: z.string(),
  severity: notificationSeveritySchema,
  entityType: notificationEntityTypeSchema,
  entityId: z.string().optional(),
  actionUrl: z.string().optional(),
  isRead: z.boolean(),
  readAt: z.string().optional(),
  createdAt: z.string(),
});

export const notificationsResponseSchema = z.object({
  items: z.array(notificationSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export const notificationUnreadCountSchema = z.object({
  count: z.number(),
});

export const getNotificationsParamsSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  isRead: z.boolean().optional(),
  search: z.string().optional(),
});

export type NotificationSeverity = z.infer<typeof notificationSeveritySchema>;
export type NotificationEntityType = z.infer<typeof notificationEntityTypeSchema>;
export type Notification = z.infer<typeof notificationSchema>;
export type NotificationsResponse = z.infer<typeof notificationsResponseSchema>;
export type NotificationUnreadCount = z.infer<typeof notificationUnreadCountSchema>;
export type GetNotificationsParams = z.infer<typeof getNotificationsParamsSchema>;
