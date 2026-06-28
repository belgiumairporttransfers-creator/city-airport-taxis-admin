import type { QueryClient } from "@tanstack/react-query";
import type { ConversationsResponse, MessagesResponse } from "@/lib/schemas/communication";
import { mapConversationToContact } from "@/lib/chat/mappers";

export const CONVERSATIONS_QUERY_KEY = ["communication", "conversations"] as const;
export const MESSAGES_QUERY_KEY = ["communication", "messages"] as const;

const isAtOrBeforeMessageId = (id: string, upToId: string) => id <= upToId;

type ConversationsQueryData = ConversationsResponse & {
  contacts?: ReturnType<typeof mapConversationToContact>[];
};

const patchConversationItems = (
  old: ConversationsQueryData | undefined,
  patchItem: (conversation: ConversationsResponse["items"][number]) => ConversationsResponse["items"][number]
) => {
  if (!old?.items?.length) return old;

  const items = old.items.map(patchItem);

  return {
    ...old,
    items,
    contacts: items.map(mapConversationToContact),
  };
};

export const patchMessagesReadInCache = (
  queryClient: QueryClient,
  payload: {
    conversationId: string;
    messageId: string;
    readAt: string;
    currentUserId?: string;
  }
) => {
  if (!payload.currentUserId) return;

  queryClient.setQueriesData<MessagesResponse | null>(
    { queryKey: [...MESSAGES_QUERY_KEY, payload.conversationId] },
    (old) => {
      if (!old?.items?.length) return old;

      return {
        ...old,
        items: old.items.map((item) => {
          if (
            item.sender.accountId === payload.currentUserId &&
            isAtOrBeforeMessageId(item.id, payload.messageId) &&
            (item.status === "sent" || item.status === "delivered")
          ) {
            return { ...item, status: "seen" as const, seenAt: payload.readAt };
          }
          return item;
        }),
      };
    }
  );

  queryClient.setQueriesData<ConversationsQueryData | undefined>(
    { queryKey: CONVERSATIONS_QUERY_KEY },
    (old) =>
      patchConversationItems(old, (conversation) => {
        const lastMessage = conversation.lastMessage;
        if (
          conversation.id !== payload.conversationId ||
          !lastMessage ||
          lastMessage.senderAccountId !== payload.currentUserId ||
          !isAtOrBeforeMessageId(lastMessage.id, payload.messageId)
        ) {
          return conversation;
        }

        return {
          ...conversation,
          lastMessage: {
            ...lastMessage,
            status: "seen" as const,
          },
        };
      })
  );
};

export const patchMessageDeliveredInCache = (
  queryClient: QueryClient,
  payload: {
    conversationId: string;
    messageId: string;
    deliveredAt?: string;
    currentUserId?: string;
  }
) => {
  if (!payload.currentUserId) return;

  queryClient.setQueriesData<MessagesResponse | null>(
    { queryKey: [...MESSAGES_QUERY_KEY, payload.conversationId] },
    (old) => {
      if (!old?.items?.length) return old;

      return {
        ...old,
        items: old.items.map((item) =>
          item.id === payload.messageId &&
          item.sender.accountId === payload.currentUserId &&
          item.status === "sent"
            ? {
                ...item,
                status: "delivered" as const,
                deliveredAt: payload.deliveredAt,
              }
            : item
        ),
      };
    }
  );

  queryClient.setQueriesData<ConversationsQueryData | undefined>(
    { queryKey: CONVERSATIONS_QUERY_KEY },
    (old) =>
      patchConversationItems(old, (conversation) => {
        const lastMessage = conversation.lastMessage;
        if (
          conversation.id !== payload.conversationId ||
          !lastMessage ||
          lastMessage.id !== payload.messageId ||
          lastMessage.senderAccountId !== payload.currentUserId ||
          lastMessage.status !== "sent"
        ) {
          return conversation;
        }

        return {
          ...conversation,
          lastMessage: {
            ...lastMessage,
            status: "delivered" as const,
          },
        };
      })
  );
};

export const UNREAD_COUNT_QUERY_KEY = ["communication", "unread-count"] as const;

export const patchConversationUnreadInCache = (
  queryClient: QueryClient,
  conversationId: string
) => {
  let clearedUnread = 0;

  queryClient.setQueriesData<ConversationsQueryData | undefined>(
    { queryKey: CONVERSATIONS_QUERY_KEY },
    (old) => {
      if (!old?.items?.length) return old;

      const items = old.items.map((conversation) => {
        if (conversation.id !== conversationId || conversation.unreadCount === 0) {
          return conversation;
        }

        clearedUnread = conversation.unreadCount;
        return { ...conversation, unreadCount: 0 };
      });

      return {
        ...old,
        items,
        contacts: items.map(mapConversationToContact),
      };
    }
  );

  if (clearedUnread > 0) {
    queryClient.setQueriesData<{ total: number } | undefined>(
      { queryKey: UNREAD_COUNT_QUERY_KEY },
      (old) => {
        if (!old) return old;
        return { total: Math.max(0, old.total - clearedUnread) };
      }
    );
  }
};
