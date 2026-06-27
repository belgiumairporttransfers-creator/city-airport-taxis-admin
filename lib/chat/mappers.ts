import type {
  CommunicationMessage,
  ConversationListItem,
} from "@/lib/schemas/communication";
import type { Contact, ChatMessage, ProfileUser } from "@/lib/chat/types";

export const mapConversationToContact = (item: ConversationListItem): Contact => ({
  id: item.id,
  conversationId: item.id,
  fullName: item.participant.displayName,
  role: item.participant.role,
  about: item.lastMessage?.previewText ?? "No messages yet",
  avatar: item.participant.avatarUrl,
  status: item.participant.presence,
  unreadmessage: item.unreadCount,
  date: item.lastMessage?.sentAt ?? "",
  lastMessageStatus: item.lastMessage?.status,
  lastMessageSenderId: item.lastMessage?.senderAccountId,
  participantAccountType: item.participant.accountType,
  participantAccountId: item.participant.accountId,
  isTyping: item.isTyping,
});

export const mapMessageToChat = (message: CommunicationMessage): ChatMessage => ({
  id: message.id,
  message: message.isDeleted
    ? "Message deleted"
    : message.type === "voice"
      ? "Voice message"
      : message.type === "image"
        ? "Photo"
        : message.type === "document"
          ? "Document"
          : message.content ?? message.attachment?.filename ?? "",
  time: message.createdAt,
  senderId: message.sender.accountId,
  type: message.type,
  attachment: message.attachment,
  replyTo: message.replyTo,
  status: message.status,
  isDeleted: message.isDeleted,
});

export const mapAuthProfileToChatProfile = (user: {
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role?: string;
}): ProfileUser => ({
  id: user._id ?? user.id ?? "",
  fullName: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
  avatar: user.avatar,
  bio: user.role === "admin" ? "Admin" : "Driver",
  role: user.role,
  status: "online",
});
