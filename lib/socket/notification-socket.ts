import { io, type Socket } from "socket.io-client";
import type { Notification } from "@/lib/schemas";

const getSocketBaseUrl = () => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
  return backendUrl.replace(/\/api\/?$/, "");
};

const SOCKET_PATH = process.env.NEXT_PUBLIC_SOCKET_PATH || "/socket.io";

let socket: Socket | null = null;

export const getNotificationSocket = (): Socket | null => {
  if (typeof window === "undefined") {
    return null;
  }

  if (!socket) {
    socket = io(getSocketBaseUrl(), {
      path: SOCKET_PATH,
      withCredentials: true,
      transports: ["websocket", "polling"],
      autoConnect: false,
    });
  }

  return socket;
};

export const connectNotificationSocket = (): Socket | null => {
  const client = getNotificationSocket();
  if (client && !client.connected) {
    client.connect();
  }
  return client;
};

export const disconnectNotificationSocket = () => {
  if (socket?.connected) {
    socket.disconnect();
  }
};

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
