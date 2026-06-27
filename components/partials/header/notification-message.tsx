"use client";

import { Bell } from "@/components/svg";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import shortImage from "@/public/images/all-img/short-image-2.png";
import { formatDistanceToNow } from "date-fns";
import type { Notification } from "@/lib/schemas";
import {
  NotificationCountBadge,
  NotificationIcon,
} from "@/components/notifications/notification-utils";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationSocket,
  useNotificationUnreadCount,
  useNotifications,
} from "@/hooks/queries/use-notifications";

const DROPDOWN_NOTIFICATION_LIMIT = 5;

const NotificationMessage = () => {
  const router = useRouter();
  useNotificationSocket();

  const { data: notificationsData, isLoading } = useNotifications({
    page: 1,
    limit: DROPDOWN_NOTIFICATION_LIMIT,
  });
  const { data: unreadData } = useNotificationUnreadCount();
  const markAsRead = useMarkNotificationRead();
  const markAllAsRead = useMarkAllNotificationsRead();

  const notifications = notificationsData?.items ?? [];
  const unreadCount = unreadData?.count ?? 0;

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead.mutateAsync(notification.id);
    }

    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const handleMarkAllAsRead = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (unreadCount === 0) {
      return;
    }

    await markAllAsRead.mutateAsync();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full text-default-500 hover:bg-default-100 hover:text-primary data-[state=open]:bg-default-100 dark:text-default-800 dark:hover:bg-default-200 dark:data-[state=open]:bg-default-200 md:h-10 md:w-10"
        >
          <Bell className="h-6 w-6 md:h-[1.65rem] md:w-[1.65rem]" />
          <NotificationCountBadge count={unreadCount} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-999 mx-4 w-[min(100vw-2rem,412px)] p-0 lg:w-[412px]">
        <DropdownMenuLabel
          style={{ backgroundImage: `url(${shortImage.src})` }}
          className="flex h-full w-full items-center bg-cover bg-no-repeat p-4"
        >
          <span className="flex-1 text-base font-semibold text-white">Notifications</span>
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0 || markAllAsRead.isPending}
            className="cursor-pointer text-xs font-medium text-white hover:underline disabled:cursor-not-allowed disabled:opacity-60"
          >
            Mark all as read
          </button>
        </DropdownMenuLabel>
        <div className="max-h-[360px]">
          <ScrollArea className="h-full max-h-[360px]">
            {isLoading ? (
              <div className="px-4 py-6 text-center text-sm text-default-500">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-default-500">
                No notifications yet
              </div>
            ) : (
              notifications.map((item) => (
                <DropdownMenuItem
                  key={item.id}
                  className="flex cursor-pointer gap-3 px-4 py-3 dark:hover:bg-background"
                  onClick={() => void handleNotificationClick(item)}
                >
                  <NotificationIcon notification={item} />
                  <div className="min-w-0 flex-1">
                    <div
                      className={cn("mb-0.5 truncate text-sm text-default-900", {
                        "font-semibold": !item.isRead,
                        "font-medium": item.isRead,
                      })}
                    >
                      {item.title}
                    </div>
                    <div className="line-clamp-2 text-xs text-default-600">{item.message}</div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <span
                      className={cn("whitespace-nowrap text-xs", {
                        "font-medium text-default-900": !item.isRead,
                        "text-default-500": item.isRead,
                      })}
                    >
                      {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </span>
                    {!item.isRead ? <span className="h-2 w-2 rounded-full bg-primary" /> : null}
                  </div>
                </DropdownMenuItem>
              ))
            )}
          </ScrollArea>
        </div>
        <DropdownMenuSeparator />
        <div className="p-3">
          <Button asChild className="w-full" variant="outline">
            <Link href="/notifications">View all notifications</Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationMessage;
