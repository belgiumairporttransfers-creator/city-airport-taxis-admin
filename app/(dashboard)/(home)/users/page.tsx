"use client";

import React from "react";
import type { ColumnFiltersState, OnChangeFn } from "@tanstack/react-table";
import { Home, Users, UserCheck, UserX, ShieldCheck, ShieldAlert } from "lucide-react";
import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/data-table/data-table";
import ConfirmationDialog from "@/components/confirmation-dialog";
import {
  getUserColumns,
  getUserFilterColumns,
} from "@/components/data-table/columns/user-columns";
import {
  useAdminUsers,
  useAdminUserStats,
  useDeleteAdminUser,
  useBulkDeleteAdminUsers,
  useUpdateAdminUserStatus,
} from "@/hooks/queries/use-users";
import type { AdminUser } from "@/lib/schemas";

const UsersPage = () => {
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("");
  const [isVerifiedFilter, setIsVerifiedFilter] = React.useState<string>("");
  const [userToDelete, setUserToDelete] = React.useState<AdminUser | null>(null);
  const [selectedUsersToDelete, setSelectedUsersToDelete] = React.useState<AdminUser[]>([]);

  const { data: stats, isLoading: statsLoading } = useAdminUserStats();
  const { data, isLoading, isFetching } = useAdminUsers({
    page,
    limit,
    search,
    status: statusFilter || undefined,
    isVerified: isVerifiedFilter !== "" ? isVerifiedFilter : undefined,
  });

  const deleteUserMutation = useDeleteAdminUser();
  const bulkDeleteMutation = useBulkDeleteAdminUsers();
  const updateStatusMutation = useUpdateAdminUserStatus();

  const columnFilters = React.useMemo<ColumnFiltersState>(() => {
    const filters: ColumnFiltersState = [];
    if (statusFilter) {
      filters.push({ id: "status", value: [statusFilter] });
    }
    if (isVerifiedFilter) {
      filters.push({ id: "isVerified", value: [isVerifiedFilter] });
    }
    return filters;
  }, [statusFilter, isVerifiedFilter]);

  const handleColumnFiltersChange = React.useCallback<OnChangeFn<ColumnFiltersState>>(
    (updater) => {
      const nextFilters =
        typeof updater === "function" ? updater(columnFilters) : updater;

      const statusValues = nextFilters.find((f) => f.id === "status")?.value as
        | string[]
        | undefined;
      const verifiedValues = nextFilters.find((f) => f.id === "isVerified")?.value as
        | string[]
        | undefined;

      setStatusFilter(statusValues?.[0] ?? "");
      setIsVerifiedFilter(verifiedValues?.[0] ?? "");
      setPage(1);
    },
    [columnFilters]
  );

  const handleToggleStatus = (user: AdminUser) => {
    const newStatus = user.status === "active" ? "suspended" : "active";
    updateStatusMutation.mutate({
      id: user._id,
      status: newStatus,
    });
  };

  const handleOpenDelete = (user: AdminUser) => {
    setUserToDelete(user);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    await deleteUserMutation.mutateAsync(userToDelete._id);
    setUserToDelete(null);
  };

  const handleBulkDelete = (selectedRows: AdminUser[]) => {
    if (!selectedRows.length) return;
    setSelectedUsersToDelete(selectedRows);
  };

  const handleConfirmBulkDelete = async () => {
    if (!selectedUsersToDelete.length) return;
    await bulkDeleteMutation.mutateAsync(selectedUsersToDelete.map((u) => u._id));
    setSelectedUsersToDelete([]);
  };

  const filterColumns = React.useMemo(() => getUserFilterColumns(), []);
  const columns = React.useMemo(
    () =>
      getUserColumns({
        onDelete: handleOpenDelete,
        onToggleStatus: handleToggleStatus,
        isDeleting: deleteUserMutation.isPending || bulkDeleteMutation.isPending,
      }),
    [deleteUserMutation.isPending, bulkDeleteMutation.isPending, updateStatusMutation.isPending]
  );

  const pagination = data?.meta
    ? {
        total: data.meta.total,
        page: data.meta.page,
        limit: data.meta.limit,
        pages: data.meta.totalPages,
      }
    : undefined;

  const statCards = [
    {
      label: "Total Users",
      value: stats?.total ?? 0,
      icon: Users,
      className: "text-primary",
      bgClass: "bg-primary/10",
    },
    {
      label: "Active Users",
      value: stats?.active ?? 0,
      icon: UserCheck,
      className: "text-success",
      bgClass: "bg-success/10",
    },
    {
      label: "Suspended",
      value: stats?.suspended ?? 0,
      icon: UserX,
      className: "text-destructive",
      bgClass: "bg-destructive/10",
    },
    {
      label: "Verified Emails",
      value: stats?.verified ?? 0,
      icon: ShieldCheck,
      className: "text-info",
      bgClass: "bg-info/10",
    },
    {
      label: "Unverified Emails",
      value: stats?.unverified ?? 0,
      icon: ShieldAlert,
      className: "text-warning",
      bgClass: "bg-warning/10",
    },
  ];

  return (
    <>
      <Breadcrumbs>
        <BreadcrumbItem>
          <Home className="h-4 w-4" />
        </BreadcrumbItem>
        <BreadcrumbItem>Dashboard</BreadcrumbItem>
        <BreadcrumbItem>Users</BreadcrumbItem>
      </Breadcrumbs>

      {/* Top Stats Cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-default-500">{card.label}</p>
                  <p className={`mt-1 text-2xl font-bold ${card.className}`}>
                    {statsLoading ? "—" : card.value}
                  </p>
                </div>
                <div className={`p-2.5 rounded-xl ${card.bgClass} ${card.className}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Table Card */}
      <Card className="mt-6 overflow-hidden">
        <CardHeader className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-default-900">
              Registered Users
            </CardTitle>
            <p className="mt-0.5 text-xs text-default-500">
              Manage website users, verification status, and account access.
              {stats ? ` ${stats.total} total users registered.` : ""}
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <DataTable
            columns={columns}
            data={data?.items ?? []}
            filterColumns={filterColumns}
            columnFilters={columnFilters}
            onColumnFiltersChange={handleColumnFiltersChange}
            manualFiltering
            searchKey="email"
            searchPlaceholder="Search by name, email, phone, or company..."
            searchValue={search}
            onSearchChange={(value) => {
              setPage(1);
              setSearch(value);
            }}
            loading={isLoading}
            fetching={isFetching}
            pageSizeOptions={[10, 20, 30, 50]}
            pagination={pagination}
            onPageChange={setPage}
            onPageSizeChange={(pageSize) => {
              setPage(1);
              setLimit(pageSize);
            }}
            onBulkDelete={handleBulkDelete}
            isDeleting={deleteUserMutation.isPending || bulkDeleteMutation.isPending}
            getRowId={(row) => row._id}
          />
        </CardContent>
      </Card>

      {/* Single User Permanent Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={Boolean(userToDelete)}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete User Account"
        description={`Are you sure you want to permanently delete ${
          userToDelete?.fullName || `${userToDelete?.firstName} ${userToDelete?.lastName}`
        } (${userToDelete?.email})? This action cannot be undone and will totally delete their account, login credentials, and all active sessions.`}
        confirmLabel="Delete Account"
        pendingLabel="Deleting..."
      />

      {/* Bulk Delete Selected Users Confirmation Dialog */}
      <ConfirmationDialog
        open={selectedUsersToDelete.length > 0}
        onClose={() => setSelectedUsersToDelete([])}
        onConfirm={handleConfirmBulkDelete}
        title={`Delete ${selectedUsersToDelete.length} Selected User Account${
          selectedUsersToDelete.length > 1 ? "s" : ""
        }`}
        description={`Are you sure you want to permanently delete the ${
          selectedUsersToDelete.length
        } selected user account${
          selectedUsersToDelete.length > 1 ? "s" : ""
        }? This action cannot be undone and will totally delete their accounts, login credentials, and all active sessions.`}
        confirmLabel={`Delete ${selectedUsersToDelete.length} Account${
          selectedUsersToDelete.length > 1 ? "s" : ""
        }`}
        pendingLabel="Deleting accounts..."
      />
    </>
  );
};

export default UsersPage;
