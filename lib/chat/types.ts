import type { StaticImageData } from "next/image";
import type { MessageAttachment, MessageStatus, MessageType } from "@/lib/schemas/communication";

export type UiMessageStatus = MessageStatus | "pending" | "failed";

export type ChatAvatar = StaticImageData | { src: string } | string;

export type Contact = {
  id: string;
  conversationId: string;
  fullName: string;
  role?: string;
  about?: string;
  avatar?: ChatAvatar;
  status: string;
  unreadmessage: number;
  date: string;
  lastMessageStatus?: MessageStatus;
  lastMessageSenderId?: string;
  participantAccountType?: "admin" | "user";
  participantAccountId?: string;
  isTyping?: boolean;
};

export type ChatMessageReplyTo = {
  id: string;
  previewText: string;
  senderAccountId: string;
};

export type ChatMessage = {
  id: string;
  message: string;
  time: string;
  senderId: string;
  type?: MessageType;
  attachment?: MessageAttachment;
  replyTo?: ChatMessageReplyTo;
  status?: UiMessageStatus;
  isDeleted?: boolean;
};

export type ProfileUser = {
  id: string;
  avatar?: ChatAvatar;
  fullName: string;
  bio?: string;
  role?: string;
  status?: string;
};

export type PinnedMessage = {
  note?: string;
  avatar?: ChatAvatar;
  index?: number;
  messageId?: string;
};

export type Chat = {
  id: string;
  userId: string;
  unseenMsgs: number;
  chat: ChatMessage[];
};

export const getAvatarSrc = (avatar?: ChatAvatar): string => {
  if (!avatar) return "";
  if (typeof avatar === "string") return avatar;
  if (typeof avatar === "object" && "src" in avatar) {
    const src = avatar.src;
    return typeof src === "string" ? src : (src as { src?: string }).src ?? "";
  }
  return "";
};
