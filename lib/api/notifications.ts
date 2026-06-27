import API_ROUTES from "@/lib/api/routes";
import type {
  GetNotificationsParams,
  Notification,
  NotificationsResponse,
  NotificationUnreadCount,
} from "@/lib/schemas";
import { api } from "./client";

export const getNotifications = async (params?: GetNotificationsParams) => {
  return api.get<NotificationsResponse>(API_ROUTES.NOTIFICATIONS, { params });
};

export const getNotificationUnreadCount = async () => {
  return api.get<NotificationUnreadCount>(`${API_ROUTES.NOTIFICATIONS}/unread-count`);
};

export const markNotificationAsRead = async (id: string) => {
  return api.patch<Notification>(`${API_ROUTES.NOTIFICATIONS}/${id}/read`);
};

export const markAllNotificationsAsRead = async () => {
  return api.patch<{ success: boolean }>(`${API_ROUTES.NOTIFICATIONS}/read-all`);
};

export const deleteNotification = async (id: string) => {
  return api.delete<{ success: boolean }>(`${API_ROUTES.NOTIFICATIONS}/${id}`);
};
