"use client";

import { useCallback, useEffect, useMemo, useRef, useState, Fragment } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import ContactList from "./contact-list";
import Blank from "./blank";
import MessageHeader from "./message-header";
import MessageFooter from "./message-footer";
import Messages from "./messages";
import MyProfileHeader from "./my-profile-header";
import EmptyMessage from "./empty-message";
import Loader from "./loader";
import SearchMessages from "./contact-info/search-messages";
import PinnedMessages from "./pin-messages";
import ForwardMessage from "./forward-message";
import MessageDateSeparator from "./message-date-separator";
import ContactInfo from "./contact-info";
import ConfirmationDialog from "@/components/confirmation-dialog";
import { formatChatDateLabel, shouldShowChatDateSeparator } from "@/lib/chat/date";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import type { Contact, PinnedMessage } from "@/lib/chat/types";
import { mapAuthProfileToChatProfile, mapMessageToChat } from "@/lib/chat/mappers";
import { emitMessageDelivered } from "@/lib/socket/communication-socket";
import TypingIndicator from "@/lib/chat/typing-indicator";
import { useAuthMe } from "@/hooks/queries/use-auth";
import { useDrivers } from "@/hooks/queries/use-drivers";
import {
  useCommunicationSocket,
  useConversations,
  useCreateConversation,
  useDeleteMessage,
  useMarkConversationRead,
  useMessages,
  useSendMessage,
} from "@/hooks/queries/use-communication";

type ReplyComposerState = {
  messageId?: string;
  message?: string;
  contact?: Contact;
};

const ChatPage = () => {
  const searchParams = useSearchParams();
  const conversationIdFromUrl = searchParams.get("conversationId");
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showContactSidebar, setShowContactSidebar] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [replay, setReply] = useState(false);
  const [replayData, setReplyData] = useState<ReplyComposerState>({});
  const [isOpenSearch, setIsOpenSearch] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState<PinnedMessage[]>([]);
  const [isForward, setIsForward] = useState(false);
  const [forwardMessageContent, setForwardMessageContent] = useState<string | null>(null);
  const [conversationSearch, setConversationSearch] = useState("");
  const [deleteMessageId, setDeleteMessageId] = useState<string | null>(null);

  const { data: authMe } = useAuthMe();
  const profileData = useMemo(
    () => (authMe ? mapAuthProfileToChatProfile(authMe) : undefined),
    [authMe]
  );

  const { data: conversationsData, isLoading } = useConversations(conversationSearch);
  const { data: driversData } = useDrivers({ status: "approved", limit: 100, page: 1 });

  const { typingByConversation } = useCommunicationSocket(
    selectedConversationId,
    profileData?.id
  );

  const contacts = useMemo(() => {
    const existing = conversationsData?.contacts ?? [];
    const existingDriverUserIds = new Set(
      existing
        .filter((c) => c.participantAccountType === "user")
        .map((c) => c.participantAccountId)
    );

    const searchTerm = conversationSearch.trim().toLowerCase();

    const driverContacts: Contact[] = (driversData?.items ?? [])
      .filter((driver) => driver.userId && !existingDriverUserIds.has(driver.userId))
      .map((driver) => ({
        id: `driver-${driver.userId}`,
        conversationId: "",
        fullName: `${driver.firstName} ${driver.lastName}`.trim(),
        role: "driver",
        about: "Start a conversation",
        avatar: driver.profilePhoto,
        status: "offline",
        unreadmessage: 0,
        date: "",
        participantAccountType: "user" as const,
        participantAccountId: driver.userId!,
      }))
      .filter(
        (contact) =>
          !searchTerm || contact.fullName.toLowerCase().includes(searchTerm)
      );

    return [...existing, ...driverContacts].map((contact) => ({
      ...contact,
      isTyping: contact.conversationId
        ? Boolean(typingByConversation[contact.conversationId]) || contact.isTyping
        : contact.isTyping,
    }));
  }, [
    conversationsData?.contacts,
    driversData?.items,
    conversationSearch,
    typingByConversation,
  ]);

  useEffect(() => {
    if (!conversationIdFromUrl) return;

    const exists = contacts.some(
      (contact) => contact.conversationId === conversationIdFromUrl
    );

    if (exists) {
      setSelectedConversationId(conversationIdFromUrl);
    }
  }, [conversationIdFromUrl, contacts]);

  const selectedContact = contacts.find((c) => c.conversationId === selectedConversationId);
  const isPeerTyping = Boolean(
    selectedConversationId && typingByConversation[selectedConversationId]
  );

  const {
    data: messagesData,
    isLoading: messageLoading,
    isError: messageIsError,
  } = useMessages(selectedConversationId);

  const sendMessageMutation = useSendMessage();
  const deleteMessageMutation = useDeleteMessage();
  const createConversationMutation = useCreateConversation();
  const markReadMutation = useMarkConversationRead();

  const chatMessages = useMemo(
    () => (messagesData?.items ?? []).map(mapMessageToChat),
    [messagesData?.items]
  );

  const chatHeightRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!selectedConversationId || !messagesData?.items?.length) return;

    const lastMessage = messagesData.items[messagesData.items.length - 1];
    if (!lastMessage || lastMessage.sender.accountId === profileData?.id) return;

    markReadMutation.mutate({
      messageId: lastMessage.id,
      conversationId: selectedConversationId,
    });
  }, [selectedConversationId, messagesData?.items, profileData?.id]);

  useEffect(() => {
    if (!messagesData?.items || !profileData?.id) return;

    messagesData.items.forEach((message) => {
      if (message.sender.accountId !== profileData.id && message.status === "sent") {
        emitMessageDelivered(message.id);
      }
    });
  }, [messagesData?.items, profileData?.id]);

  useEffect(() => {
    if (chatHeightRef.current) {
      chatHeightRef.current.scrollTo({
        top: chatHeightRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatMessages.length, selectedConversationId, isPeerTyping]);

  useEffect(() => {
    setReply(false);
    setReplyData({});
  }, [selectedConversationId]);

  const clearReply = () => {
    setReply(false);
    setReplyData({});
  };

  const openChat = async (contact: Contact) => {
    if (contact.conversationId) {
      setSelectedConversationId(contact.conversationId);
      clearReply();
      if (showContactSidebar) setShowContactSidebar(false);
      return;
    }

    if (!contact.participantAccountId) return;

    const created = await createConversationMutation.mutateAsync({
      participantAccountType: contact.participantAccountType ?? "user",
      participantAccountId: contact.participantAccountId,
    });

    if (created?.id) {
      setSelectedConversationId(created.id);
      clearReply();
      if (showContactSidebar) setShowContactSidebar(false);
    }
  };

  const onDelete = (messageId: string) => {
    setDeleteMessageId(messageId);
  };

  const handleConfirmDeleteMessage = async () => {
    if (!deleteMessageId) return;

    await deleteMessageMutation.mutateAsync(deleteMessageId);
    setPinnedMessages((prev) =>
      (prev as { messageId?: string }[]).filter((msg) => msg.messageId !== deleteMessageId)
    );
  };

  const messageToDelete = chatMessages.find((message) => message.id === deleteMessageId);
  const deleteMessagePreview = messageToDelete?.message.trim().slice(0, 80);

  const handleSendMessage = (message: string) => {
    if (!selectedConversationId || !message.trim()) return;

    sendMessageMutation.mutate({
      conversationId: selectedConversationId,
      type: "text",
      content: message.trim(),
      replyToMessageId: replay && replayData.messageId ? replayData.messageId : undefined,
    });
    clearReply();
  };

  const handleReply = (data: { id: string; message: string }, contact: Contact) => {
    setReply(true);
    setReplyData({ message: data.message, messageId: data.id, contact });
  };

  const handleShowInfo = () => setShowInfo(!showInfo);
  const handleSetIsOpenSearch = () => setIsOpenSearch(!isOpenSearch);
  const handleForward = (message: string) => {
    setForwardMessageContent(message);
    setIsForward(true);
  };

  const resolveConversationId = async (contact: Contact) => {
    if (contact.conversationId) return contact.conversationId;
    if (!contact.participantAccountId) {
      throw new Error("Unable to start conversation with this contact.");
    }

    const created = await createConversationMutation.mutateAsync({
      participantAccountType: contact.participantAccountType ?? "user",
      participantAccountId: contact.participantAccountId,
    });

    if (!created?.id) {
      throw new Error("Failed to start conversation.");
    }

    return created.id;
  };

  const handleForwardToContact = async (contact: Contact) => {
    if (!forwardMessageContent?.trim()) return;

    const conversationId = await resolveConversationId(contact);

    await sendMessageMutation.mutateAsync({
      conversationId,
      type: "text",
      content: forwardMessageContent.trim(),
    });

    toast.success(`Message forwarded to ${contact.fullName}`);
    setForwardMessageContent(null);
  };

  const handlePinMessage = (note: PinnedMessage) => {
    setPinnedMessages((prev) => {
      const list = [...prev];
      const idx = list.findIndex((msg) => JSON.stringify(msg) === JSON.stringify(note));
      if (idx !== -1) list.splice(idx, 1);
      else list.push(note);
      return list;
    });
  };

  const handleUnpinMessage = (pinnedMessage: PinnedMessage) => {
    setPinnedMessages((prev) => prev.filter((msg) => msg !== pinnedMessage));
  };

  const isLg = useMediaQuery("(max-width: 1024px)");

  return (
    <div className="flex gap-5 app-height relative rtl:space-x-reverse">
      {isLg && showContactSidebar && (
        <div
          className=" bg-background/60 backdrop-filter backdrop-blur-xs absolute w-full flex-1 inset-0 z-99 rounded-md"
          onClick={() => setShowContactSidebar(false)}
        />
      )}
      {isLg && showInfo && (
        <div
          className=" bg-background/60 backdrop-filter backdrop-blur-xs absolute w-full flex-1 inset-0 z-40 rounded-md"
          onClick={() => setShowInfo(false)}
        />
      )}
      <div
        className={cn("transition-all duration-150 flex-none  ", {
          "absolute h-full top-0 md:w-[260px] w-[200px] z-999": isLg,
          "flex-none min-w-[260px]": !isLg,
          "left-0": isLg && showContactSidebar,
          "-left-full": isLg && !showContactSidebar,
        })}
      >
        <Card className="h-full pb-0">
          <CardHeader className="border-none pb-0 mb-0">
            <MyProfileHeader profile={profileData} onSearchChange={setConversationSearch} />
          </CardHeader>
          <CardContent className="pt-0 px-0 lg:h-[calc(100%-170px)] h-[calc(100%-70px)]">
            <ScrollArea className="h-full">
              {isLoading ? (
                <Loader />
              ) : contacts.length === 0 ? (
                <p className="px-4 py-6 text-sm text-default-500">No drivers to message yet.</p>
              ) : (
                contacts.map((contact) => (
                  <ContactList
                    key={contact.id}
                    contact={contact}
                    selectedChatId={selectedConversationId}
                    currentUserId={profileData?.id}
                    openChat={() => void openChat(contact)}
                  />
                ))
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {selectedConversationId && selectedContact ? (
        <div className="flex-1 ">
          <div className=" flex space-x-5 h-full rtl:space-x-reverse">
            <div className="flex-1">
              <Card className="h-full flex flex-col ">
                <CardHeader className="flex-none mb-0">
                  <MessageHeader
                    showInfo={showInfo}
                    handleShowInfo={handleShowInfo}
                    profile={selectedContact}
                    mblChatHandler={() => setShowContactSidebar(!showContactSidebar)}
                  />
                </CardHeader>
                {isOpenSearch && (
                  <SearchMessages handleSetIsOpenSearch={handleSetIsOpenSearch} />
                )}
                <PinnedMessages
                  pinnedMessages={pinnedMessages}
                  handleUnpinMessage={handleUnpinMessage}
                />
                <CardContent className="p-0! relative min-h-0 flex-1 overflow-hidden">
                  <div className="chat-scrollbar h-full overflow-y-auto py-4" ref={chatHeightRef}>
                    {messageLoading ? (
                      <Loader />
                    ) : messageIsError ? (
                      <EmptyMessage />
                    ) : (
                      chatMessages.map((message, i) => (
                        <Fragment key={message.id}>
                          {shouldShowChatDateSeparator(
                            message.time,
                            chatMessages[i - 1]?.time
                          ) ? (
                            <MessageDateSeparator label={formatChatDateLabel(message.time)} />
                          ) : null}
                          <Messages
                            message={message}
                            contact={selectedContact}
                            profile={profileData}
                            onDelete={onDelete}
                            index={i}
                            selectedChatId={selectedConversationId}
                            handleReply={handleReply}
                            handleForward={handleForward}
                            handlePinMessage={handlePinMessage}
                            pinnedMessages={pinnedMessages}
                          />
                        </Fragment>
                      ))
                    )}
                    {isPeerTyping ? <TypingIndicator /> : null}
                  </div>
                </CardContent>
                <CardFooter className="flex-none flex-col px-0 py-4 border-t border-border">
                  <MessageFooter
                    handleSendMessage={handleSendMessage}
                    replay={replay}
                    replayData={replayData}
                    onCancelReply={clearReply}
                    conversationId={selectedConversationId}
                    replyToMessageId={
                      replay && replayData.messageId ? replayData.messageId : undefined
                    }
                    onMessageSent={clearReply}
                  />
                </CardFooter>
              </Card>
            </div>
            {showInfo && selectedContact && (
              <ContactInfo
                handleSetIsOpenSearch={handleSetIsOpenSearch}
                handleShowInfo={handleShowInfo}
                contact={selectedContact}
              />
            )}
          </div>
        </div>
      ) : (
        <Blank mblChatHandler={() => setShowContactSidebar(true)} />
      )}
      <ForwardMessage
        open={isForward}
        setIsOpen={setIsForward}
        contacts={contacts}
        messageContent={forwardMessageContent}
        currentConversationId={selectedConversationId}
        onForward={handleForwardToContact}
        isSending={sendMessageMutation.isPending || createConversationMutation.isPending}
      />
      <ConfirmationDialog
        open={Boolean(deleteMessageId)}
        onClose={() => setDeleteMessageId(null)}
        onConfirm={handleConfirmDeleteMessage}
        title="Delete message?"
        description={
          deleteMessagePreview
            ? `"${deleteMessagePreview}${messageToDelete && messageToDelete.message.length > 80 ? "..." : ""}" will be removed for everyone in this chat. This action cannot be undone.`
            : "This message will be removed for everyone in this chat. This action cannot be undone."
        }
        confirmLabel="Delete"
        pendingLabel="Deleting..."
      />
    </div>
  );
};

export default ChatPage;
