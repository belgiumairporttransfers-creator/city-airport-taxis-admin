"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Envelope } from "@/components/svg";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import shortImage from "@/public/images/all-img/short-image.png";
import { cn, formatTime } from "@/lib/utils";
import { getAvatarSrc } from "@/lib/chat/types";
import { mapAuthProfileToChatProfile } from "@/lib/chat/mappers";
import { useAuthMe } from "@/hooks/queries/use-auth";
import {
  useCommunicationSocket,
  useConversations,
  useUnreadMessageCount,
} from "@/hooks/queries/use-communication";

interface ChatInboxDropdownProps {
  chatPath?: string;
}

const ChatInboxDropdown = ({ chatPath = "/chat" }: ChatInboxDropdownProps) => {
  const router = useRouter();
  const { data: authMe } = useAuthMe();
  const profileData = useMemo(
    () => (authMe ? mapAuthProfileToChatProfile(authMe) : undefined),
    [authMe]
  );

  const { data: conversationsData, isLoading } = useConversations();
  const { data: unreadData } = useUnreadMessageCount();
  const { typingByConversation } = useCommunicationSocket(null, profileData?.id);

  const inboxContacts = useMemo(() => {
    const contacts = conversationsData?.contacts ?? [];

    return [...contacts]
      .map((contact) => ({
        ...contact,
        isTyping: contact.conversationId
          ? Boolean(typingByConversation[contact.conversationId]) || contact.isTyping
          : contact.isTyping,
      }))
      .sort((a, b) => {
        if (a.unreadmessage !== b.unreadmessage) {
          return b.unreadmessage - a.unreadmessage;
        }

        return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
      });
  }, [conversationsData?.contacts, typingByConversation]);

  const unreadCount = unreadData?.total ?? 0;

  const handleOpenConversation = (conversationId: string) => {
    router.push(`${chatPath}?conversationId=${conversationId}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 rounded-full text-default-500 hover:bg-default-100 hover:text-primary data-[state=open]:bg-default-100 dark:text-default-800 dark:hover:bg-default-200 dark:data-[state=open]:bg-default-200 md:h-9 md:w-9"
        >
          <Envelope className="h-5 w-5" />
          {unreadCount > 0 ? (
            <Badge className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center p-0 px-1 text-[10px] font-medium ring-2 ring-primary-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-999 mx-4 w-[min(100vw-2rem,412px)] p-0 lg:w-[412px]">
        <DropdownMenuLabel
          style={{ backgroundImage: `url(${shortImage.src})` }}
          className="flex h-full w-full items-center bg-cover bg-no-repeat p-4"
        >
          <span className="flex-1 text-base font-semibold text-white">Message</span>
          <Link
            href={chatPath}
            className="text-xs font-medium text-white hover:underline hover:decoration-default-100 dark:decoration-default-900"
          >
            View All
          </Link>
        </DropdownMenuLabel>
        <div className="h-[350px] xl:h-[420px]">
          <ScrollArea className="h-full">
            {isLoading ? (
              <p className="px-4 py-6 text-sm text-default-500">Loading messages...</p>
            ) : inboxContacts.length === 0 ? (
              <p className="px-4 py-6 text-sm text-default-500">No chat messages yet.</p>
            ) : (
              inboxContacts.map((contact) => {
                const avatarSrc = getAvatarSrc(contact.avatar);
                const previewText = contact.isTyping ? "Typing..." : contact.about || "No messages yet";

                return (
                  <DropdownMenuItem
                    key={contact.conversationId}
                    className="flex cursor-pointer gap-3 rounded-none px-4 py-2 dark:hover:bg-background"
                    onSelect={() => handleOpenConversation(contact.conversationId)}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <Avatar className="h-10 w-10 shrink-0">
                        {avatarSrc ? <AvatarImage src={avatarSrc} alt={contact.fullName} /> : null}
                        <AvatarFallback className="uppercase">
                          {contact.fullName.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="mb-[2px] truncate text-sm font-medium text-default-900">
                          {contact.fullName}
                        </div>
                        <div className="truncate text-xs text-default-600 max-w-[140px] lg:max-w-[185px]">
                          {previewText}
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <span
                        className={cn("whitespace-nowrap text-xs font-medium uppercase", {
                          "text-default-900": contact.unreadmessage > 0,
                          "text-default-600": contact.unreadmessage === 0,
                        })}
                      >
                        {contact.date ? formatTime(contact.date) : ""}
                      </span>
                      {contact.unreadmessage > 0 ? (
                        <span className="h-2 w-2 rounded-full bg-primary" />
                      ) : (
                        <span className="h-2 w-2" />
                      )}
                    </div>
                  </DropdownMenuItem>
                );
              })
            )}
          </ScrollArea>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ChatInboxDropdown;
