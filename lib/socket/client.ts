import { io, type Socket } from "socket.io-client";

const getSocketBaseUrl = () => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
  return backendUrl.replace(/\/api\/?$/, "");
};

const SOCKET_PATH = process.env.NEXT_PUBLIC_SOCKET_PATH || "/socket.io";

let socket: Socket | null = null;

export const getAppSocket = (): Socket | null => {
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

export const connectAppSocket = (): Socket | null => {
  const client = getAppSocket();
  if (client && !client.connected) {
    client.connect();
  }
  return client;
};

export const disconnectAppSocket = () => {
  if (socket?.connected) {
    socket.disconnect();
  }
};
