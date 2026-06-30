"use client";

import React from "react";
import type { ColumnFiltersState, OnChangeFn } from "@tanstack/react-table";
import { Home } from "lucide-react";
import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/data-table/data-table";
import {
  getBookingColumns,
  getBookingFilterColumns,
} from "@/components/data-table/columns/booking-columns";
import {
  useBookings,
  useBulkDeleteBookings,
  useDeleteBooking,
} from "@/hooks/queries/use-bookings";
import type { BookingStatus } from "@/lib/schemas";

const BookingsPage = () => {
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<BookingStatus | "">("");

  const { data, isLoading, isFetching } = useBookings({
    page,
    limit,
    search,
    status: statusFilter || undefined,
  });

  const { mutate: removeBooking, isPending: isDeletingOne } = useDeleteBooking();
  const { mutateAsync: removeBookings, isPending: isDeletingBulk } =
    useBulkDeleteBookings();

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
      setStatusFilter((statusValues?.[0] as BookingStatus | undefined) ?? "");
      setPage(1);
    },
    [columnFilters]
  );

  const filterColumns = React.useMemo(() => getBookingFilterColumns(), []);
  const columns = React.useMemo(
    () =>
      getBookingColumns({
        onDelete: removeBooking,
        isDeleting: isDeletingOne || isDeletingBulk,
      }),
    [removeBooking, isDeletingOne, isDeletingBulk]
  );

  const handleBulkDelete = async (selectedRows: { id: string }[]) => {
    await removeBookings(selectedRows.map((row) => row.id));
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
        <BreadcrumbItem>Bookings</BreadcrumbItem>
      </Breadcrumbs>

      <Card className="mt-6 overflow-hidden">
        <CardHeader className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-default-900">Bookings</CardTitle>
            <p className="mt-0.5 text-xs text-default-500">
              Manage customer bookings, payments, and trip requests.
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
            searchKey="bookingNumber"
            searchPlaceholder="Search by booking #, customer, or address"
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

export default BookingsPage;
