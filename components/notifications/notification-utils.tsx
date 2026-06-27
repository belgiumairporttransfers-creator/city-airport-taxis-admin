import type { Notification, NotificationEntityType, NotificationSeverity } from "@/lib/schemas";
import {
  AlertCircle,
  AlertTriangle,
  BellRing,
  Car,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Info,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const entityIconMap: Record<NotificationEntityType, LucideIcon> = {
  driver: ClipboardList,
  customer: Users,
  booking: BellRing,
  vehicle: Car,
  payment: CreditCard,
  system: BellRing,
  other: Info,
};

export const severityIconMap: Record<NotificationSeverity, LucideIcon> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
};

export const severityClassMap: Record<NotificationSeverity, string> = {
  info: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  success: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  error: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

export const severityBadgeClassMap: Record<NotificationSeverity, string> = {
  info: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900",
  success: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-900",
  warning: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
  error: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900",
};

export const formatUnreadBadgeCount = (count: number) => {
  if (count > 99) {
    return "99+";
  }
  return String(count);
};

const unreadBadgeSizeClass = (count: number) => {
  if (count > 99) {
    return "h-4 min-w-[1.35rem] px-1 text-[9px] leading-none";
  }
  if (count > 9) {
    return "h-4 min-w-[1.1rem] px-0.5 text-[9px] leading-none";
  }
  return "h-4 w-4 p-0 text-[10px] leading-none";
};

type NotificationCountBadgeProps = {
  count: number;
  className?: string;
};

export const NotificationCountBadge = ({ count, className }: NotificationCountBadgeProps) => {
  if (count <= 0) {
    return null;
  }

  return (
    <span
      className={cn(
        "absolute -right-0.5 -top-0.5 inline-flex items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground ring-2 ring-primary-foreground",
        unreadBadgeSizeClass(count),
        className
      )}
      aria-label={`${count} unread notifications`}
    >
      {formatUnreadBadgeCount(count)}
    </span>
  );
};

type NotificationIconProps = {
  notification: Pick<Notification, "entityType" | "severity">;
  className?: string;
  iconClassName?: string;
};

export const NotificationIcon = ({
  notification,
  className,
  iconClassName = "h-4 w-4",
}: NotificationIconProps) => {
  const EntityIcon = entityIconMap[notification.entityType] ?? Info;

  return (
    <div
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
        severityClassMap[notification.severity],
        className
      )}
    >
      <EntityIcon className={iconClassName} />
    </div>
  );
};
