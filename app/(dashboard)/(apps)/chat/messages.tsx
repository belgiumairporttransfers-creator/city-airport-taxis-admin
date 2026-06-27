import type { ReactNode } from "react";
import { useState } from "react";
import { cn, formatTime } from "@/lib/utils";
import { Icon } from "@iconify/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Forward, Pin, Reply, Trash2 } from "lucide-react";
import MessageStatusTicks from "@/lib/chat/message-status-ticks";
import VoiceMessagePlayer from "@/lib/chat/voice-message-player";
import { ImageMessagePreview } from "@/lib/chat/image-message-preview";
import { DocumentMessagePreview } from "@/lib/chat/document-message-preview";
import type { ProfileUser, Contact, ChatMessage, PinnedMessage } from "@/lib/chat/types";

interface MessagesProps {
  message: ChatMessage;
  contact?: Contact;
  profile?: ProfileUser;
  onDelete: (messageId: string) => void;
  index: number;
  selectedChatId: string;
  handleReply: (data: ChatMessage, contact: Contact) => void;
  handleForward: (data: string) => void;
  handlePinMessage: (data: PinnedMessage) => void;
  pinnedMessages: PinnedMessage[];
}

const getQuotedSenderName = (
  replyTo: NonNullable<ChatMessage["replyTo"]>,
  contact?: Contact,
  profile?: ProfileUser
) => {
  if (replyTo.senderAccountId === profile?.id) return "You";
  if (replyTo.senderAccountId === contact?.participantAccountId) return contact.fullName;
  return contact?.fullName ?? "User";
};

const QuotedReply = ({
  replyTo,
  contact,
  profile,
}: {
  replyTo: NonNullable<ChatMessage["replyTo"]>;
  contact?: Contact;
  profile?: ProfileUser;
}) => {
  const quotedName = getQuotedSenderName(replyTo, contact, profile);

  return (
    <div className="mb-1.5 rounded-sm border-l-4 border-primary bg-default-200 py-1 pl-2 pr-1.5">
      <p className="text-xs font-semibold leading-tight text-primary">{quotedName}</p>
      <p className="mt-0.5 truncate text-xs leading-tight text-default-600">
        {replyTo.previewText}
      </p>
    </div>
  );
};

const MessageContent = ({
  message,
  isOwnMessage,
}: {
  message: ChatMessage;
  isOwnMessage: boolean;
}) => {
  if (message.isDeleted) {
    return <span className="whitespace-pre-wrap break-words">{message.message}</span>;
  }

  if (message.type === "voice" && message.attachment?.url) {
    return (
      <VoiceMessagePlayer
        url={message.attachment.url}
        duration={message.attachment.duration}
        isOwnMessage={isOwnMessage}
      />
    );
  }

  if (message.type === "image" && message.attachment?.url) {
    return <ImageMessagePreview attachment={message.attachment} />;
  }

  if (message.type === "document" && message.attachment?.url) {
    return <DocumentMessagePreview attachment={message.attachment} />;
  }

  return <span className="whitespace-pre-wrap break-words">{message.message}</span>;
};

const MessageMeta = ({
  message,
  isOwnMessage,
  overlay = false,
}: {
  message: ChatMessage;
  isOwnMessage: boolean;
  overlay?: boolean;
}) => (
  <span
    className={cn(
      "flex shrink-0 items-center gap-1.5",
      overlay ? "rounded bg-black/45 px-1.5 py-0.5" : "pb-0.5 pl-1"
    )}
  >
    <span
      className={cn(
        "text-[10px] leading-4",
        overlay ? "text-white/90" : "text-default-500"
      )}
    >
      {formatTime(message.time)}
    </span>
    {isOwnMessage ? (
      <MessageStatusTicks
        status={message.status ?? "sent"}
        seenClassName={overlay ? "text-white" : "text-primary-600"}
        defaultClassName={overlay ? "text-white/80" : "text-default-400"}
      />
    ) : null}
  </span>
);

const MessageBubble = ({
  message,
  contact,
  profile,
  isOwnMessage,
}: {
  message: ChatMessage;
  contact?: Contact;
  profile?: ProfileUser;
  isOwnMessage: boolean;
}) => {
  const isImageMessage =
    !message.isDeleted && message.type === "image" && message.attachment?.url;
  const isDocumentMessage =
    !message.isDeleted && message.type === "document" && message.attachment?.url;

  if (isImageMessage) {
    return (
      <div
        className={cn(
          "relative w-max max-w-[min(100%,320px)] overflow-hidden rounded-md p-1 shadow-sm",
          isOwnMessage ? "bg-primary-100" : "bg-default-200"
        )}
      >
        {message.replyTo ? (
          <div className="px-1 pb-1">
            <QuotedReply replyTo={message.replyTo} contact={contact} profile={profile} />
          </div>
        ) : null}
        <div className="relative">
          <MessageContent message={message} isOwnMessage={isOwnMessage} />
          <div className="absolute bottom-1 right-1">
            <MessageMeta message={message} isOwnMessage={isOwnMessage} overlay />
          </div>
        </div>
      </div>
    );
  }

  if (isDocumentMessage) {
    return (
      <div
        className={cn(
          "relative w-max max-w-[min(100%,320px)] rounded-md px-2 pb-1 pt-1.5 text-sm shadow-sm",
          isOwnMessage ? "bg-primary-100 text-default-900" : "bg-default-200 text-default-900"
        )}
      >
        {message.replyTo ? (
          <QuotedReply replyTo={message.replyTo} contact={contact} profile={profile} />
        ) : null}
        <MessageContent message={message} isOwnMessage={isOwnMessage} />
        <div className="mt-1 flex justify-end">
          <MessageMeta message={message} isOwnMessage={isOwnMessage} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative w-max max-w-[min(100%,420px)] rounded-md px-2.5 pb-1 pt-1.5 text-sm shadow-sm",
        isOwnMessage
          ? "bg-primary-100 text-default-900"
          : "bg-default-200 text-default-900"
      )}
    >
      {message.replyTo ? (
        <QuotedReply replyTo={message.replyTo} contact={contact} profile={profile} />
      ) : null}
      <div className="flex items-end gap-x-1">
        <MessageContent message={message} isOwnMessage={isOwnMessage} />
        <MessageMeta message={message} isOwnMessage={isOwnMessage} />
      </div>
    </div>
  );
};

const MessageMenuItem = ({
  icon,
  label,
  onAction,
  destructive = false,
}: {
  icon: ReactNode;
  label: string;
  onAction: () => void;
  destructive?: boolean;
}) => (
  <DropdownMenuItem
    className={cn(
      "flex cursor-pointer items-center gap-2 px-3 py-2 text-sm",
      destructive && "text-destructive focus:text-destructive"
    )}
    onSelect={(event) => {
      event.preventDefault();
      onAction();
    }}
  >
    {icon}
    <span>{label}</span>
  </DropdownMenuItem>
);

const Messages = ({
  message,
  contact,
  profile,
  onDelete,
  index,
  handleReply,
  handleForward,
  handlePinMessage,
  pinnedMessages,
}: MessagesProps) => {
  const { message: chatMessage, id, isDeleted } = message;
  const isOwnMessage = message.senderId === profile?.id;

  const isMessagePinned = pinnedMessages.some(
    (pinnedMessage) => pinnedMessage.index === index
  );

  const handlePinMessageLocal = (note: string) => {
    handlePinMessage({ note, avatar: contact?.avatar, index, messageId: id });
  };

  const [menuOpen, setMenuOpen] = useState(false);

  const menuTrigger = (
    <button
      type="button"
      className="flex h-7 w-7 items-center justify-center rounded-full bg-default-200 text-default-600 transition-colors hover:bg-default-300"
      aria-label="Message actions"
    >
      <Icon icon="bi:three-dots-vertical" className="text-lg" />
    </button>
  );

  const messageMenu = (
    <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
      <DropdownMenuTrigger asChild>{menuTrigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-36 p-1"
        align={isOwnMessage ? "end" : "start"}
        side="top"
      >
        {!isOwnMessage && contact ? (
          <MessageMenuItem
            icon={<Reply className="h-4 w-4" />}
            label="Reply"
            onAction={() => handleReply(message, contact)}
          />
        ) : null}
        {!isOwnMessage ? (
          <MessageMenuItem
            icon={<Pin className="h-4 w-4 rotate-45" />}
            label={isMessagePinned ? "Unpin" : "Pin"}
            onAction={() => handlePinMessageLocal(chatMessage)}
          />
        ) : null}
        {!isDeleted ? (
          <MessageMenuItem
            icon={<Trash2 className="h-4 w-4" />}
            label="Delete"
            destructive
            onAction={() => onDelete(id)}
          />
        ) : null}
        <MessageMenuItem
          icon={<Forward className="h-4 w-4" />}
          label="Forward"
          onAction={() => handleForward(chatMessage)}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const menuVisibilityClass = cn(
    "shrink-0 self-center transition-opacity duration-150",
    menuOpen ? "opacity-100" : "opacity-100 md:opacity-0 md:group-hover:opacity-100"
  );

  return (
    <div className="block px-0 md:px-6">
      {isOwnMessage ? (
        <div className="group mb-2 flex w-full items-start justify-end gap-2 rtl:space-x-reverse">
          <div className={menuVisibilityClass}>{messageMenu}</div>
          <MessageBubble message={message} contact={contact} profile={profile} isOwnMessage />
        </div>
      ) : (
        <div className="group mb-2 flex w-full items-start gap-2 rtl:space-x-reverse">
          <div className="relative w-max max-w-full">
            {isMessagePinned && (
              <Pin className="absolute -top-2.5 left-1 h-3.5 w-3.5 rotate-45 fill-destructive text-destructive" />
            )}
            <MessageBubble message={message} contact={contact} profile={profile} isOwnMessage={false} />
          </div>
          <div className={menuVisibilityClass}>{messageMenu}</div>
        </div>
      )}
    </div>
  );
};

export default Messages;
