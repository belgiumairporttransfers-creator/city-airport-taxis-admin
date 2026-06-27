import type { Notification } from "@/lib/schemas";
import { connectAppSocket, disconnectAppSocket, getAppSocket } from "@/lib/socket/client";

export const getNotificationSocket = getAppSocket;
export const connectNotificationSocket = connectAppSocket;
export const disconnectNotificationSocket = disconnectAppSocket;

export type NotificationSocketHandlers = {
  onNew?: (notification: Notification) => void;
  onUpdated?: (notification: Notification) => void;
  onRead?: (notification: Notification) => void;
  onAllRead?: (payload: { unreadCount: number }) => void;
};

export const subscribeNotificationSocket = (handlers: NotificationSocketHandlers) => {
  const client = connectNotificationSocket();
  if (!client) {
    return () => undefined;
  }

  const { onNew, onUpdated, onRead, onAllRead } = handlers;

  if (onNew) {
    client.on("notification:new", onNew);
  }
  if (onUpdated) {
    client.on("notification:updated", onUpdated);
  }
  if (onRead) {
    client.on("notification:read", onRead);
  }
  if (onAllRead) {
    client.on("notification:all-read", onAllRead);
  }

  return () => {
    if (onNew) {
      client.off("notification:new", onNew);
    }
    if (onUpdated) {
      client.off("notification:updated", onUpdated);
    }
    if (onRead) {
      client.off("notification:read", onRead);
    }
    if (onAllRead) {
      client.off("notification:all-read", onAllRead);
    }
  };
};
