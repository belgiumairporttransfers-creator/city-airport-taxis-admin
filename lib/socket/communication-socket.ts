import type { CommunicationMessage, ConversationListItem } from "@/lib/schemas/communication";
import { connectAppSocket, getAppSocket } from "@/lib/socket/client";

export type CommunicationSocketHandlers = {
  onMessageNew?: (message: CommunicationMessage) => void;
  onMessageRead?: (payload: {
    conversationId: string;
    messageId: string;
    readAt: string;
    readerAccountId: string;
  }) => void;
  onMessageDelivered?: (payload: {
    messageId: string;
    conversationId: string;
    deliveredAt?: string;
  }) => void;
  onMessageDeleted?: (payload: { messageId: string; conversationId: string }) => void;
  onConversationUpdate?: (conversation: ConversationListItem) => void;
  onTyping?: (payload: { conversationId: string; accountType: string; accountId: string }) => void;
  onStopTyping?: (payload: { conversationId: string; accountType: string; accountId: string }) => void;
  onPresenceUpdate?: (payload: {
    accountType: string;
    accountId: string;
    status: string;
    lastSeenAt?: string;
  }) => void;
};

export const joinConversationRoom = (conversationId: string) => {
  const client = connectAppSocket();
  client?.emit("conversation:join", { conversationId });
};

export const leaveConversationRoom = (conversationId: string) => {
  const client = getAppSocket();
  client?.emit("conversation:leave", { conversationId });
};

export const emitTyping = (conversationId: string) => {
  getAppSocket()?.emit("message:typing", { conversationId });
};

export const emitStopTyping = (conversationId: string) => {
  getAppSocket()?.emit("message:stop-typing", { conversationId });
};

export const emitMessageDelivered = (messageId: string) => {
  getAppSocket()?.emit("message:delivered", { messageId });
};

export const subscribeCommunicationSocket = (handlers: CommunicationSocketHandlers) => {
  const client = connectAppSocket();
  if (!client) {
    return () => undefined;
  }

  const {
    onMessageNew,
    onMessageRead,
    onMessageDelivered,
    onMessageDeleted,
    onConversationUpdate,
    onTyping,
    onStopTyping,
    onPresenceUpdate,
  } = handlers;

  if (onMessageNew) client.on("message:new", onMessageNew);
  if (onMessageRead) client.on("message:read", onMessageRead);
  if (onMessageDelivered) client.on("message:delivered", onMessageDelivered);
  if (onMessageDeleted) client.on("message:deleted", onMessageDeleted);
  if (onConversationUpdate) client.on("conversation:update", onConversationUpdate);
  if (onTyping) client.on("message:typing", onTyping);
  if (onStopTyping) client.on("message:stop-typing", onStopTyping);
  if (onPresenceUpdate) client.on("presence:update", onPresenceUpdate);

  return () => {
    if (onMessageNew) client.off("message:new", onMessageNew);
    if (onMessageRead) client.off("message:read", onMessageRead);
    if (onMessageDelivered) client.off("message:delivered", onMessageDelivered);
    if (onMessageDeleted) client.off("message:deleted", onMessageDeleted);
    if (onConversationUpdate) client.off("conversation:update", onConversationUpdate);
    if (onTyping) client.off("message:typing", onTyping);
    if (onStopTyping) client.off("message:stop-typing", onStopTyping);
    if (onPresenceUpdate) client.off("presence:update", onPresenceUpdate);
  };
};
