"use client";

import React from "react";
import type { ColumnFiltersState, OnChangeFn } from "@tanstack/react-table";
import { Home } from "lucide-react";
import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/data-table/data-table";
import {
  getPaymentColumns,
  getPaymentFilterColumns,
} from "@/components/data-table/columns/payment-columns";
import {
  useBulkDeletePayments,
  useDeletePayment,
  usePayments,
} from "@/hooks/queries/use-payments";
import type { PaymentStatus } from "@/lib/schemas";

const PaymentsPage = () => {
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<PaymentStatus | "">("");

  const { data, isLoading, isFetching } = usePayments({
    page,
    limit,
    search,
    status: statusFilter || undefined,
  });

  const { mutate: removePayment, isPending: isDeletingOne } = useDeletePayment();
  const { mutateAsync: removePayments, isPending: isDeletingBulk } =
    useBulkDeletePayments();

  const columnFilters = React.useMemo<ColumnFiltersState>(
    () => (statusFilter ? [{ id: "status", value: [statusFilter] }] : []),
    [statusFilter]
  );

  const handleColumnFiltersChange = React.useCallback<OnChangeFn<ColumnFiltersState>>(
    (updater) => {
      const nextFilters =
        typeof updater === "function" ? updater(columnFilters) : updater;
      const statusValues = nextFilters.find((filter) => filter.id === "status")?.value as
        | string[]
        | undefined;
      setStatusFilter((statusValues?.[0] as PaymentStatus | undefined) ?? "");
      setPage(1);
    },
    [columnFilters]
  );

  const filterColumns = React.useMemo(() => getPaymentFilterColumns(), []);
  const columns = React.useMemo(
    () =>
      getPaymentColumns({
        onDelete: removePayment,
        isDeleting: isDeletingOne || isDeletingBulk,
      }),
    [removePayment, isDeletingOne, isDeletingBulk]
  );

  const handleBulkDelete = async (selectedRows: { id: string }[]) => {
    await removePayments(selectedRows.map((row) => row.id));
  };

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
        <BreadcrumbItem>Operations</BreadcrumbItem>
        <BreadcrumbItem>Payment History</BreadcrumbItem>
      </Breadcrumbs>

      <Card className="mt-6 overflow-hidden">
        <CardHeader className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-default-900">
              Payment History
            </CardTitle>
            <p className="mt-0.5 text-xs text-default-500">
              Review transaction records and payment statuses.
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
            searchKey="transactionId"
            searchPlaceholder="Search by transaction ID"
            searchValue={search}
            onSearchChange={(value) => {
              setSearch(value);
              setPage(1);
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
            isDeleting={isDeletingOne || isDeletingBulk}
            getRowId={(row) => row.id}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default PaymentsPage;
