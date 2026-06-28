import type {
  CommunicationMessage,
  MessageType,
  SendMessagePayload,
} from "@/lib/schemas/communication";
import type { ProfileUser } from "@/lib/chat/types";
import { getAvatarSrc } from "@/lib/chat/types";

export type OptimisticSender = {
  accountType: "admin" | "user";
  accountId: string;
  displayName: string;
  avatarUrl?: string;
};

export type SendMessageWithOptimistic = SendMessagePayload & {
  optimisticSender?: OptimisticSender;
};

export const getOptimisticSender = (
  profile: ProfileUser,
  accountType: "admin" | "user"
): OptimisticSender => ({
  accountType,
  accountId: profile.id,
  displayName: profile.fullName,
  avatarUrl: getAvatarSrc(profile.avatar) || undefined,
});

const getPreviewText = (type: MessageType, content?: string) => {
  if (type === "voice") return "Voice message";
  if (type === "image") return "Photo";
  if (type === "document") return "Document";
  return content ?? "";
};

export const createOptimisticMessage = (
  payload: SendMessagePayload,
  clientMessageId: string,
  sender: OptimisticSender
): CommunicationMessage => ({
  id: `pending-${clientMessageId}`,
  conversationId: payload.conversationId,
  type: payload.type,
  content: payload.type === "text" ? payload.content : getPreviewText(payload.type, payload.content),
  sender: {
    accountType: sender.accountType,
    accountId: sender.accountId,
    displayName: sender.displayName,
    avatarUrl: sender.avatarUrl,
  },
  status: "pending" as unknown as CommunicationMessage["status"],
  isDeleted: false,
  clientMessageId,
  createdAt: new Date().toISOString(),
});
