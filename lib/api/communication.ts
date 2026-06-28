import { api } from "@/lib/api/client";
import API_ROUTES from "@/lib/api/routes";
import type {
  ConversationListItem,
  ConversationsResponse,
  CreateConversationPayload,
  MessagesResponse,
  CommunicationMessage,
  MessageAttachment,
  SendMessagePayload,
  UnreadCountResponse,
} from "@/lib/schemas/communication";

const BASE = API_ROUTES.COMMUNICATION;

export const getConversations = (params?: { page?: number; limit?: number; search?: string }) =>
  api.get<ConversationsResponse>(`${BASE}/conversations`, { params });

export const createConversation = (payload: CreateConversationPayload) =>
  api.post<ConversationListItem>(`${BASE}/conversations`, payload);

export const getConversation = (id: string) =>
  api.get<ConversationListItem>(`${BASE}/conversations/${id}`);

export const getMessages = (conversationId: string, params?: { limit?: number; before?: string }) =>
  api.get<MessagesResponse>(`${BASE}/conversations/${conversationId}/messages`, { params });

export const sendMessage = (payload: SendMessagePayload) =>
  api.post<CommunicationMessage>(`${BASE}/messages`, payload);

export const markMessageRead = (messageId: string, conversationId: string) =>
  api.patch<{ conversationId: string; messageId: string }>(`${BASE}/messages/${messageId}/read`, {
    conversationId,
  });

export const deleteMessage = (messageId: string) =>
  api.delete<{ messageId: string }>(`${BASE}/messages/${messageId}`);

export const getUnreadCount = () => api.get<UnreadCountResponse>(`${BASE}/unread-count`);

export const searchCommunication = (params: {
  q: string;
  scope?: "conversations" | "messages" | "all";
  conversationId?: string;
}) => api.get<{ conversations: ConversationListItem[]; messages: CommunicationMessage[] }>(
  `${BASE}/search`,
  { params }
);

export type UploadCommunicationAttachmentPayload = {
  conversationId: string;
  file: File;
  kind?: MessageAttachment["kind"];
  duration?: number;
};

export const uploadCommunicationAttachment = ({
  conversationId,
  file,
  kind,
  duration,
}: UploadCommunicationAttachmentPayload) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("conversationId", conversationId);
  if (kind) formData.append("kind", kind);
  if (duration !== undefined) formData.append("duration", String(duration));

  return api.post<MessageAttachment>(`${BASE}/attachments/upload`, formData);
};
