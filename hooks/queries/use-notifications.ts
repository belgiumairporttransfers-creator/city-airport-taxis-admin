import {
  deleteNotification,
  getNotificationUnreadCount,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/lib/api/notifications";
import { subscribeNotificationSocket } from "@/lib/socket/notification-socket";
import type { GetNotificationsParams, Notification } from "@/lib/schemas";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { useEffect } from "react";
import toast from "react-hot-toast";

export const NOTIFICATIONS_QUERY_KEY = ["notifications"] as const;
export const NOTIFICATION_UNREAD_COUNT_QUERY_KEY = ["notifications", "unread-count"] as const;

type ApiError = { message?: string };

const refreshNotificationQueries = async (queryClient: QueryClient) => {
  await queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
  await queryClient.invalidateQueries({ queryKey: NOTIFICATION_UNREAD_COUNT_QUERY_KEY });
};

export const useNotifications = (params: GetNotificationsParams = { page: 1, limit: 10 }) => {
  return useQuery({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, params],
    queryFn: () => getNotifications(params),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};

export const useNotificationUnreadCount = () => {
  return useQuery({
    queryKey: NOTIFICATION_UNREAD_COUNT_QUERY_KEY,
    queryFn: getNotificationUnreadCount,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => markNotificationAsRead(id),
    onSuccess: async () => {
      await refreshNotificationQueries(queryClient);
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to mark notification as read.");
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: async () => {
      await refreshNotificationQueries(queryClient);
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to mark all notifications as read.");
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteNotification(id),
    onSuccess: async () => {
      await refreshNotificationQueries(queryClient);
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to delete notification.");
    },
  });
};

export const useBulkDeleteNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map((id) => deleteNotification(id)));
    },
    onSuccess: async (_, ids) => {
      toast.success(
        ids.length === 1
          ? "Notification deleted successfully"
          : `${ids.length} notifications deleted successfully`
      );
      await refreshNotificationQueries(queryClient);
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to delete notifications.");
    },
  });
};

const prependNotification = (
  queryClient: QueryClient,
  notification: Notification,
  params: GetNotificationsParams = { page: 1, limit: 10 }
) => {
  queryClient.setQueryData(
    [...NOTIFICATIONS_QUERY_KEY, params],
    (current: Awaited<ReturnType<typeof getNotifications>> | undefined) => {
      if (!current?.items) {
        return current;
      }

      const exists = current.items.some((item) => item.id === notification.id);
      if (exists) {
        return {
          ...current,
          items: current.items.map((item) =>
            item.id === notification.id ? notification : item
          ),
        };
      }

      return {
        ...current,
        items: [notification, ...current.items].slice(0, params.limit ?? 10),
        meta: {
          ...current.meta,
          total: current.meta.total + 1,
        },
      };
    }
  );
};

export const useNotificationSocket = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = subscribeNotificationSocket({
      onNew: (notification) => {
        void refreshNotificationQueries(queryClient);

        if (notification.type === "booking.created") {
          toast.success(notification.message, {
            id: `notification-${notification.id}`,
          });
        }

        if (notification.type === "assignment.accepted") {
          toast.success(notification.message, {
            id: `notification-${notification.id}`,
          });
        }

        if (notification.type === "trip.completed") {
          toast.success(notification.message, {
            id: `notification-${notification.id}`,
          });
        }
      },
      onUpdated: (notification) => {
        prependNotification(queryClient, notification);
      },
      onRead: (notification) => {
        prependNotification(queryClient, notification);
        void queryClient.invalidateQueries({ queryKey: NOTIFICATION_UNREAD_COUNT_QUERY_KEY });
      },
      onAllRead: ({ unreadCount }) => {
        queryClient.setQueryData(NOTIFICATION_UNREAD_COUNT_QUERY_KEY, { count: unreadCount });
        void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      },
    });

    return unsubscribe;
  }, [queryClient]);
};
