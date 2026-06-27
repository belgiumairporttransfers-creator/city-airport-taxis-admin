"use client";

import React from "react";
import type { ColumnFiltersState, OnChangeFn } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { BellRing, CheckCheck, Home, Inbox, MailOpen } from "lucide-react";
import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/data-table/data-table";
import {
  getNotificationColumns,
  getNotificationFilterColumns,
} from "@/components/data-table/columns/notification-columns";
import {
  useBulkDeleteNotifications,
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationSocket,
  useNotificationUnreadCount,
  useNotifications,
} from "@/hooks/queries/use-notifications";
import type { Notification } from "@/lib/schemas";
import { cn } from "@/lib/utils";

type ReadFilter = "" | "unread" | "read";

const statCards = [
  {
    key: "total" as const,
    label: "Total",
    icon: Inbox,
    className: "text-default-900",
  },
  {
    key: "unread" as const,
    label: "Unread",
    icon: BellRing,
    className: "text-primary",
  },
  {
    key: "read" as const,
    label: "Read",
    icon: MailOpen,
    className: "text-success",
  },
];

const NotificationsPage = () => {
  const router = useRouter();
  useNotificationSocket();

  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(20);
  const [search, setSearch] = React.useState("");
  const [readFilter, setReadFilter] = React.useState<ReadFilter>("");
  const [markingReadId, setMarkingReadId] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const isReadParam =
    readFilter === "read" ? true : readFilter === "unread" ? false : undefined;

  const { data, isLoading, isFetching } = useNotifications({
    page,
    limit,
    isRead: isReadParam,
    search: search || undefined,
  });
  const { data: statsData } = useNotifications({ page: 1, limit: 1 });
  const { data: unreadData } = useNotificationUnreadCount();
  const { mutateAsync: markAsRead } = useMarkNotificationRead();
  const { mutateAsync: markAllAsRead, isPending: isMarkingAll } = useMarkAllNotificationsRead();
  const { mutateAsync: deleteNotification } = useDeleteNotification();
  const { mutateAsync: deleteNotifications, isPending: isDeletingBulk } =
    useBulkDeleteNotifications();

  const total = statsData?.meta.total ?? 0;
  const unreadCount = unreadData?.count ?? 0;
  const readCount = Math.max(total - unreadCount, 0);

  const stats = {
    total,
    unread: unreadCount,
    read: readCount,
  };

  const handleOpen = React.useCallback(
    async (notification: Notification) => {
      if (!notification.isRead) {
        await markAsRead(notification.id);
      }
      if (notification.actionUrl) {
        router.push(notification.actionUrl);
      }
    },
    [markAsRead, router]
  );

  const handleMarkRead = React.useCallback(
    async (id: string) => {
      setMarkingReadId(id);
      try {
        await markAsRead(id);
      } finally {
        setMarkingReadId(null);
      }
    },
    [markAsRead]
  );

  const handleDelete = React.useCallback(
    async (id: string) => {
      setDeletingId(id);
      try {
        await deleteNotification(id);
      } finally {
        setDeletingId(null);
      }
    },
    [deleteNotification]
  );

  const columnFilters = React.useMemo<ColumnFiltersState>(
    () => (readFilter ? [{ id: "isRead", value: [readFilter] }] : []),
    [readFilter]
  );

  const handleColumnFiltersChange = React.useCallback<OnChangeFn<ColumnFiltersState>>(
    (updater) => {
      const nextFilters =
        typeof updater === "function" ? updater(columnFilters) : updater;
      const readValues = nextFilters.find((filter) => filter.id === "isRead")?.value as
        | string[]
        | undefined;
      setReadFilter((readValues?.[0] as ReadFilter | undefined) ?? "");
      setPage(1);
    },
    [columnFilters]
  );

  const filterColumns = React.useMemo(() => getNotificationFilterColumns(), []);

  const columns = React.useMemo(
    () =>
      getNotificationColumns({
        onOpen: (notification) => void handleOpen(notification),
        onMarkRead: (id) => void handleMarkRead(id),
        onDelete: (id) => void handleDelete(id),
        markingReadId,
        deletingId,
      }),
    [deletingId, handleDelete, handleMarkRead, handleOpen, markingReadId]
  );

  const handleBulkDelete = React.useCallback(
    async (selectedRows: Notification[]) => {
      await deleteNotifications(selectedRows.map((row) => row.id));
    },
    [deleteNotifications]
  );

  const pagination = data?.meta
    ? {
      total: data.meta.total,
      page: data.meta.page,
      limit: data.meta.limit,
      pages: data.meta.totalPages,
    }
    : undefined;

  return (
    <>
      <Breadcrumbs>
        <BreadcrumbItem>
          <Home className="h-4 w-4" />
        </BreadcrumbItem>
        <BreadcrumbItem>Notifications</BreadcrumbItem>
      </Breadcrumbs>

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-gradient-to-br from-card via-card to-default-50/60 shadow-sm dark:to-default-100/20">
        <div className="flex flex-col gap-4 border-b border-border/80 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-default-900">
              Notification Center
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-default-600">
              Review new driver applications as they are submitted to the platform.
            </p>
          </div>
          <Button
            onClick={() => void markAllAsRead()}
            disabled={unreadCount === 0 || isMarkingAll}
            className="shrink-0"
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        </div>

        <div className="grid gap-4 border-b border-border/80 px-6 py-5 sm:grid-cols-3">
          {statCards.map(({ key, label, icon: Icon, className }) => (
            <Card key={key} className="border-border/70 shadow-none">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-default-600">{label}</CardTitle>
                <Icon className={cn("h-4 w-4", className)} />
              </CardHeader>
              <CardContent>
                <div className={cn("text-2xl font-semibold", className)}>{stats[key]}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="px-6 py-4">
          <DataTable
            columns={columns}
            data={data?.items ?? []}
            filterColumns={filterColumns}
            columnFilters={columnFilters}
            onColumnFiltersChange={handleColumnFiltersChange}
            manualFiltering
            searchKey="title"
            searchPlaceholder="Search new driver applications"
            searchValue={search}
            onSearchChange={(value) => {
              setPage(1);
              setSearch(value);
            }}
            loading={isLoading}
            fetching={isFetching}
            pageSizeOptions={[20, 50, 100]}
            pagination={pagination}
            onPageChange={setPage}
            onPageSizeChange={(pageSize) => {
              setPage(1);
              setLimit(pageSize);
            }}
            onBulkDelete={handleBulkDelete}
            isDeleting={Boolean(deletingId) || isDeletingBulk}
            getRowId={(row) => row.id}
          />
        </div>
      </div>
    </>
  );
};

export default NotificationsPage;
