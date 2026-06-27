export type PresenceStatus = "online" | "offline" | "away" | "busy";

export type MessageType = "text" | "image" | "document" | "voice" | "location" | "system";

export type MessageStatus = "sent" | "delivered" | "seen";

export interface ConversationListItem {
  id: string;
  type: "direct";
  participant: {
    accountType: "admin" | "user";
    accountId: string;
    role: string;
    displayName: string;
    avatarUrl?: string;
    presence: PresenceStatus;
    lastSeenAt?: string;
  };
  lastMessage?: {
    id: string;
    type: MessageType;
    previewText: string;
    senderAccountId: string;
    sentAt: string;
    status: MessageStatus;
  };
  unreadCount: number;
  isTyping: boolean;
  lastActivityAt: string;
}

export interface MessageAttachment {
  id: string;
  kind: "image" | "document" | "voice";
  url: string;
  publicId: string;
  mimeType: string;
  size: number;
  filename: string;
  duration?: number;
  waveform?: number[];
  thumbnailUrl?: string;
}

export interface CommunicationMessage {
  id: string;
  conversationId: string;
  type: MessageType;
  content?: string;
  attachment?: MessageAttachment;
  replyTo?: {
    id: string;
    previewText: string;
    senderAccountId: string;
  };
  sender: {
    accountType: "admin" | "user";
    accountId: string;
    displayName: string;
    avatarUrl?: string;
  };
  status: MessageStatus;
  deliveredAt?: string;
  seenAt?: string;
  isDeleted: boolean;
  clientMessageId?: string;
  createdAt: string;
}

export interface ConversationsResponse {
  items: ConversationListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface MessagesResponse {
  items: CommunicationMessage[];
  hasMore: boolean;
  nextCursor?: string;
}

export interface UnreadCountResponse {
  total: number;
}

export interface CreateConversationPayload {
  participantAccountType: "admin" | "user";
  participantAccountId: string;
}

export interface SendMessagePayload {
  conversationId: string;
  type: MessageType;
  content?: string;
  attachmentId?: string;
  replyToMessageId?: string;
  clientMessageId?: string;
}
