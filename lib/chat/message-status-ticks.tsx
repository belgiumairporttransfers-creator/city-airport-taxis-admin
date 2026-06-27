import { Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MessageStatus } from "@/lib/schemas/communication";

type MessageStatusTicksProps = {
  status?: MessageStatus | string;
  className?: string;
  seenClassName?: string;
  defaultClassName?: string;
  variant?: "inline" | "badge";
};

const MessageStatusTicks = ({
  status = "sent",
  className,
  seenClassName = "text-primary",
  defaultClassName = "text-default-400",
  variant = "inline",
}: MessageStatusTicksProps) => {
  const isSeen = status === "seen";
  const isDelivered = status === "delivered" || isSeen;
  const colorClass = isSeen ? seenClassName : defaultClassName;
  const showDoubleTick = isDelivered && !(variant === "badge" && isSeen);

  const tickIcon = showDoubleTick ? (
    <CheckCheck
      className={cn(
        variant === "badge" ? "h-2.5 w-2.5 text-primary-foreground" : "h-3.5 w-3.5 shrink-0",
        variant === "inline" && colorClass,
        className
      )}
      strokeWidth={variant === "inline" ? 2.5 : undefined}
      aria-label={isSeen ? "Seen" : "Delivered"}
    />
  ) : (
    <Check
      className={cn(
        variant === "badge" ? "h-2.5 w-2.5 text-primary-foreground" : "h-3 w-3 shrink-0",
        variant === "inline" && colorClass,
        className
      )}
      strokeWidth={variant === "inline" ? 2.5 : undefined}
      aria-label={isSeen ? "Seen" : "Sent"}
    />
  );

  if (variant === "badge") {
    return (
      <span
        className={cn(
          "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full",
          isSeen ? "bg-primary/70" : "bg-default-400",
          className
        )}
      >
        {tickIcon}
      </span>
    );
  }

  return tickIcon;
};

export default MessageStatusTicks;
