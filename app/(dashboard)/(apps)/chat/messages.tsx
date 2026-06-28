import type { ReactNode } from "react";
import { useState } from "react";
import { cn, formatTime } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Forward, Pin, Reply, Trash2 } from "lucide-react";
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

const MessageActionsMenu = ({
  contact,
  isOwnMessage,
  isDeleted,
  isMessagePinned,
  menuOpen,
  onOpenChange,
  onReply,
  onPin,
  onDelete,
  onForward,
  overlay = false,
}: {
  contact?: Contact;
  isOwnMessage: boolean;
  isDeleted?: boolean;
  isMessagePinned: boolean;
  menuOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onReply: () => void;
  onPin: () => void;
  onDelete: () => void;
  onForward: () => void;
  overlay?: boolean;
}) => (
  <DropdownMenu open={menuOpen} onOpenChange={onOpenChange}>
    <DropdownMenuTrigger asChild>
      <button
        type="button"
        aria-label="Message actions"
        aria-expanded={menuOpen}
        className={cn(
          "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm transition-colors",
          overlay
            ? "text-white/90 hover:bg-white/10"
            : "text-default-500 hover:bg-default-300/40 hover:text-default-700",
          menuOpen && !overlay && "text-primary"
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <ChevronDown
          className={cn("h-3 w-3 transition-transform duration-200", menuOpen && "rotate-180")}
        />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-40 p-1" align="end" side="top" sideOffset={6}>
      {contact ? (
        <MessageMenuItem icon={<Reply className="h-4 w-4" />} label="Reply" onAction={onReply} />
      ) : null}
      {!isOwnMessage ? (
        <MessageMenuItem
          icon={<Pin className="h-4 w-4 rotate-45" />}
          label={isMessagePinned ? "Unpin" : "Pin"}
          onAction={onPin}
        />
      ) : null}
      {!isDeleted ? (
        <MessageMenuItem
          icon={<Trash2 className="h-4 w-4" />}
          label="Delete"
          destructive
          onAction={onDelete}
        />
      ) : null}
      <MessageMenuItem
        icon={<Forward className="h-4 w-4" />}
        label="Forward"
        onAction={onForward}
      />
    </DropdownMenuContent>
  </DropdownMenu>
);

const BubbleFooter = ({
  message,
  isOwnMessage,
  actionsMenu,
  overlay = false,
}: {
  message: ChatMessage;
  isOwnMessage: boolean;
  actionsMenu: ReactNode;
  overlay?: boolean;
}) => (
  <span
    className={cn(
      "inline-flex shrink-0 items-center gap-0.5",
      overlay ? "rounded bg-black/45 px-1 py-0.5" : "ml-1.5 mt-1"
    )}
  >
    <span
      className={cn(
        "text-[10px] leading-4 whitespace-nowrap",
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
    {actionsMenu}
  </span>
);

const MessageBubble = ({
  message,
  contact,
  profile,
  isOwnMessage,
  actionsMenu,
}: {
  message: ChatMessage;
  contact?: Contact;
  profile?: ProfileUser;
  isOwnMessage: boolean;
  actionsMenu: (overlay?: boolean) => ReactNode;
}) => {
  const isImageMessage =
    !message.isDeleted && message.type === "image" && message.attachment?.url;
  const isDocumentMessage =
    !message.isDeleted && message.type === "document" && message.attachment?.url;
  const isVoiceMessage =
    !message.isDeleted && message.type === "voice" && message.attachment?.url;

  const bubbleClass = cn(
    "relative w-full rounded-lg px-2.5 py-1.5 text-sm shadow-sm",
    isOwnMessage ? "bg-primary-100 text-default-900" : "bg-default-200 text-default-900",
    "max-w-[min(100%,calc(100vw-3rem))] sm:max-w-[min(100%,420px)]"
  );

  if (isImageMessage) {
    return (
      <div
        className={cn(
          bubbleClass,
          "overflow-hidden p-1 sm:max-w-[min(100%,320px)]"
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
            <BubbleFooter
              message={message}
              isOwnMessage={isOwnMessage}
              actionsMenu={actionsMenu(true)}
              overlay
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={bubbleClass}>
      {message.replyTo ? (
        <QuotedReply replyTo={message.replyTo} contact={contact} profile={profile} />
      ) : null}
      {isDocumentMessage || isVoiceMessage ? (
        <>
          <MessageContent message={message} isOwnMessage={isOwnMessage} />
          <div className="mt-1 flex justify-end">
            <BubbleFooter message={message} isOwnMessage={isOwnMessage} actionsMenu={actionsMenu()} />
          </div>
        </>
      ) : (
        <div className="text-sm leading-relaxed">
          <span className="float-right clear-right">
            <BubbleFooter message={message} isOwnMessage={isOwnMessage} actionsMenu={actionsMenu()} />
          </span>
          <MessageContent message={message} isOwnMessage={isOwnMessage} />
        </div>
      )}
    </div>
  );
};

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

  const renderActionsMenu = (overlay = false) => (
    <MessageActionsMenu
      contact={contact}
      isOwnMessage={isOwnMessage}
      isDeleted={isDeleted}
      isMessagePinned={isMessagePinned}
      menuOpen={menuOpen}
      onOpenChange={setMenuOpen}
      overlay={overlay}
      onReply={() => {
        if (contact) handleReply(message, contact);
        setMenuOpen(false);
      }}
      onPin={() => {
        handlePinMessageLocal(chatMessage);
        setMenuOpen(false);
      }}
      onDelete={() => {
        onDelete(id);
        setMenuOpen(false);
      }}
      onForward={() => {
        handleForward(chatMessage);
        setMenuOpen(false);
      }}
    />
  );

  return (
    <div className="block px-3 sm:px-4 md:px-6">
      <div
        className={cn(
          "group mb-3 flex w-full",
          isOwnMessage ? "justify-end" : "justify-start"
        )}
      >
        <div className="relative min-w-0 max-w-[85%] sm:max-w-[75%] md:max-w-none">
          {!isOwnMessage && isMessagePinned ? (
            <Pin className="absolute -top-2.5 left-1 z-10 h-3.5 w-3.5 rotate-45 fill-destructive text-destructive" />
          ) : null}
          <MessageBubble
            message={message}
            contact={contact}
            profile={profile}
            isOwnMessage={isOwnMessage}
            actionsMenu={renderActionsMenu}
          />
        </div>
      </div>
    </div>
  );
};

export default Messages;
