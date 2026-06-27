"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn, formatTime } from "@/lib/utils";
import MessageStatusTicks from "@/lib/chat/message-status-ticks";
import { type Contact } from "@/lib/chat/types";
import { getAvatarSrc } from "@/lib/chat/types";

const ContactList = ({
  contact,
  openChat,
  selectedChatId,
  currentUserId,
}: {
  contact: Contact;
  openChat: () => void;
  selectedChatId: string | null;
  currentUserId?: string;
}) => {
  const {
    avatar,
    conversationId,
    fullName,
    status,
    about,
    unreadmessage,
    date,
    isTyping,
    lastMessageStatus,
    lastMessageSenderId,
  } = contact;
  const avatarSrc = getAvatarSrc(avatar);
  const isOwnLastMessage = Boolean(
    currentUserId && lastMessageSenderId && lastMessageSenderId === currentUserId
  );

  return (
    <div
      className={cn(
        " gap-4 py-2 lg:py-2.5 px-3 border-l-2 border-transparent   hover:bg-default-200 cursor-pointer flex ",
        {
          "lg:border-primary/70 lg:bg-default-200 ": conversationId === selectedChatId,
        }
      )}
      onClick={openChat}
    >
      <div className="flex-1 flex  gap-3 ">
        <div className="relative inline-block ">
          <Avatar>
            {avatarSrc ? <AvatarImage src={avatarSrc} alt={fullName} /> : null}
            <AvatarFallback className="uppercase">
              {fullName.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <Badge
            className=" h-2 w-2  p-0 ring-1 ring-border ring-offset-[1px]   items-center justify-center absolute
             left-[calc(100%-8px)] top-[calc(100%-10px)]"
            color={status === "online" ? "success" : "secondary"}
          ></Badge>
        </div>
        <div className="block">
          <div className="truncate max-w-[120px]">
            <span className="text-sm text-default-900 font-medium">{fullName}</span>
          </div>
          <div className="truncate  max-w-[120px]">
            <span className=" text-xs  text-default-600 ">
              {isTyping ? "Typing..." : about}
            </span>
          </div>
        </div>
      </div>
      <div className="flex-none flex-col items-end gap-1 hidden lg:flex">
        <span className="text-xs text-default-600 text-end uppercase">
          {date ? formatTime(date) : ""}
        </span>
        {unreadmessage > 0 ? (
          <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary/70 px-1 text-[10px] font-medium text-primary-foreground">
            {unreadmessage}
          </span>
        ) : isOwnLastMessage ? (
          <MessageStatusTicks
            variant="badge"
            status={lastMessageStatus ?? "sent"}
          />
        ) : null}
      </div>
    </div>
  );
};

export default ContactList;
