"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { CheckCheck, ExternalLink, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { DataTableFilterColumn } from "@/components/data-table/data-table-toolbar";
import {
  NotificationIcon,
  severityBadgeClassMap,
} from "@/components/notifications/notification-utils";
import type { Notification } from "@/lib/schemas";
import { cn } from "@/lib/utils";

export function getNotificationFilterColumns(): DataTableFilterColumn[] {
  return [
    {
      column: "isRead",
      title: "Status",
      multiple: false,
      options: [
        { value: "unread", label: "Unread" },
        { value: "read", label: "Read" },
      ],
    },
  ];
}

type NotificationColumnOptions = {
  onOpen: (notification: Notification) => void;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  markingReadId?: string | null;
  deletingId?: string | null;
};

export const getNotificationColumns = ({
  onOpen,
  onMarkRead,
  onDelete,
  markingReadId,
  deletingId,
}: NotificationColumnOptions): ColumnDef<Notification>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-0.5"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-0.5"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "notification",
    header: "Notification",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex min-w-[280px] items-start gap-3 py-1">
          <NotificationIcon notification={item} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p
                className={cn("truncate text-sm text-default-900", {
                  "font-semibold": !item.isRead,
                  "font-medium": item.isRead,
                })}
              >
                {item.title}
              </p>
              {!item.isRead ? (
                <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
              ) : null}
            </div>
            <p className="mt-1 line-clamp-2 text-sm text-default-600">{item.message}</p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "entityType",
    header: "Entity",
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {row.original.entityType}
      </Badge>
    ),
  },
  {
    accessorKey: "severity",
    header: "Severity",
    cell: ({ row }) => (
      <Badge variant="outline" className={cn("capitalize", severityBadgeClassMap[row.original.severity])}>
        {row.original.severity}
      </Badge>
    ),
  },
  {
    accessorKey: "isRead",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={cn(
          row.original.isRead
            ? "border-default-200 bg-default-50 text-default-600"
            : "border-primary/20 bg-primary/10 text-primary"
        )}
      >
        {row.original.isRead ? "Read" : "Unread"}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Received",
    cell: ({ row }) => (
      <div className="whitespace-nowrap text-sm text-default-600">
        {format(new Date(row.original.createdAt), "MMM d, yyyy · h:mm a")}
      </div>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex items-center justify-end gap-1">
          {!item.isRead ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={markingReadId === item.id}
              onClick={() => onMarkRead(item.id)}
              title="Mark as read"
            >
              <CheckCheck className="h-4 w-4" />
            </Button>
          ) : null}
          {item.actionUrl ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onOpen(item)}
              title="Open related record"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            disabled={deletingId === item.id}
            onClick={() => onDelete(item.id)}
            title="Delete notification"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
