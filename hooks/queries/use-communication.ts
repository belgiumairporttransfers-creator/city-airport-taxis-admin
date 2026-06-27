import {
  createConversation,
  deleteMessage,
  getConversations,
  getMessages,
  getUnreadCount,
  markMessageRead,
  sendMessage,
  uploadCommunicationAttachment,
} from "@/lib/api/communication";
import { mapConversationToContact } from "@/lib/chat/mappers";
import {
  emitMessageDelivered,
  joinConversationRoom,
  leaveConversationRoom,
  subscribeCommunicationSocket,
} from "@/lib/socket/communication-socket";
import type { SendMessagePayload } from "@/lib/schemas/communication";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export const CONVERSATIONS_QUERY_KEY = ["communication", "conversations"] as const;
export const MESSAGES_QUERY_KEY = ["communication", "messages"] as const;
export const UNREAD_COUNT_QUERY_KEY = ["communication", "unread-count"] as const;

type ApiError = { message?: string };

const refreshConversations = async (queryClient: QueryClient) => {
  await queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY });
  await queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
};

export const useConversations = (search?: string) => {
  return useQuery({
    queryKey: [...CONVERSATIONS_QUERY_KEY, search ?? ""],
    queryFn: async () => {
      const data = await getConversations({ limit: 50, search: search || undefined });
      return {
        ...data,
        contacts: (data?.items ?? []).map(mapConversationToContact),
      };
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};

export const useMessages = (conversationId: string | null) => {
  return useQuery({
    queryKey: [...MESSAGES_QUERY_KEY, conversationId],
    queryFn: async () => {
      if (!conversationId) return null;
      const data = await getMessages(conversationId, { limit: 50 });
      return data;
    },
    enabled: Boolean(conversationId),
    staleTime: 0,
  });
};

export const useUnreadMessageCount = () => {
  return useQuery({
    queryKey: UNREAD_COUNT_QUERY_KEY,
    queryFn: getUnreadCount,
    staleTime: 0,
  });
};

export const useCreateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createConversation,
    onSuccess: async () => {
      await refreshConversations(queryClient);
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to start conversation.");
    },
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendMessagePayload) =>
      sendMessage({
        ...payload,
        clientMessageId: payload.clientMessageId ?? crypto.randomUUID(),
      }),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: [...MESSAGES_QUERY_KEY, variables.conversationId],
      });
      await refreshConversations(queryClient);
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to send message.");
    },
  });
};

export const useUploadCommunicationAttachment = () => {
  return useMutation({
    mutationFn: uploadCommunicationAttachment,
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to upload voice message.");
    },
  });
};

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => deleteMessage(messageId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: MESSAGES_QUERY_KEY });
      await refreshConversations(queryClient);
      toast.success("Message deleted.");
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to delete message.");
    },
  });
};

export const useMarkConversationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      messageId,
      conversationId,
    }: {
      messageId: string;
      conversationId: string;
    }) => markMessageRead(messageId, conversationId),
    onSuccess: async () => {
      await refreshConversations(queryClient);
    },
  });
};

export const useCommunicationSocket = (
  activeConversationId: string | null,
  currentUserId?: string
) => {
  const queryClient = useQueryClient();
  const [typingByConversation, setTypingByConversation] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const unsubscribe = subscribeCommunicationSocket({
      onMessageNew: (message) => {
        if (
          currentUserId &&
          message.sender.accountId !== currentUserId &&
          message.status === "sent"
        ) {
          emitMessageDelivered(message.id);
        }

        setTypingByConversation((prev) => ({
          ...prev,
          [message.conversationId]: false,
        }));

        void queryClient.invalidateQueries({
          queryKey: [...MESSAGES_QUERY_KEY, message.conversationId],
        });
        void refreshConversations(queryClient);
      },
      onConversationUpdate: () => {
        void refreshConversations(queryClient);
      },
      onMessageDeleted: () => {
        void queryClient.invalidateQueries({ queryKey: MESSAGES_QUERY_KEY });
        void refreshConversations(queryClient);
      },
      onMessageRead: () => {
        void queryClient.invalidateQueries({ queryKey: MESSAGES_QUERY_KEY });
        void refreshConversations(queryClient);
      },
      onMessageDelivered: () => {
        void queryClient.invalidateQueries({ queryKey: MESSAGES_QUERY_KEY });
        void refreshConversations(queryClient);
      },
      onTyping: (payload) => {
        if (payload.accountId === currentUserId) return;

        setTypingByConversation((prev) => ({
          ...prev,
          [payload.conversationId]: true,
        }));
      },
      onStopTyping: (payload) => {
        if (payload.accountId === currentUserId) return;

        setTypingByConversation((prev) => ({
          ...prev,
          [payload.conversationId]: false,
        }));
      },
    });

    return unsubscribe;
  }, [queryClient, currentUserId]);

  useEffect(() => {
    if (!activeConversationId) return;

    joinConversationRoom(activeConversationId);

    return () => {
      leaveConversationRoom(activeConversationId);
    };
  }, [activeConversationId]);

  return { typingByConversation };
};
