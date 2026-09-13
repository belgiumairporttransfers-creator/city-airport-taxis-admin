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
import AssignBookingModel from "@/components/models/assign-booking-model";
import {
  useBookings,
  useBulkDeleteBookings,
  useDeleteBooking,
} from "@/hooks/queries/use-bookings";
import {
  isPickupDatePreset,
  resolvePickupDatePreset,
  type PickupDatePreset,
} from "@/lib/booking-pickup-date-presets";
import type { Booking } from "@/lib/schemas";

const CompletedBookingsPage = () => {
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [search, setSearch] = React.useState("");
  const [pickupDateFilter, setPickupDateFilter] = React.useState<PickupDatePreset | "">(
    ""
  );
  const [assignBooking, setAssignBooking] = React.useState<Booking | null>(null);

  const pickupDateRange = React.useMemo(
    () => (pickupDateFilter ? resolvePickupDatePreset(pickupDateFilter) : undefined),
    [pickupDateFilter]
  );

  const { data, isLoading, isFetching } = useBookings({
    page,
    limit,
    search,
    status: "complete",
    pickupDateFrom: pickupDateRange?.pickupDateFrom,
    pickupDateTo: pickupDateRange?.pickupDateTo,
  });

  const { mutate: removeBooking, isPending: isDeletingOne } = useDeleteBooking();
  const { mutateAsync: removeBookings, isPending: isDeletingBulk } =
    useBulkDeleteBookings();

  const columnFilters = React.useMemo<ColumnFiltersState>(() => {
    const filters: ColumnFiltersState = [];
    if (pickupDateFilter) filters.push({ id: "pickupDate", value: [pickupDateFilter] });
    return filters;
  }, [pickupDateFilter]);

  const handleColumnFiltersChange = React.useCallback<OnChangeFn<ColumnFiltersState>>(
    (updater) => {
      const nextFilters =
        typeof updater === "function" ? updater(columnFilters) : updater;
      const pickupDateValues = nextFilters.find((filter) => filter.id === "pickupDate")
        ?.value as string[] | undefined;
      const nextPickupDate = pickupDateValues?.[0];

      setPickupDateFilter(
        nextPickupDate && isPickupDatePreset(nextPickupDate) ? nextPickupDate : ""
      );
      setPage(1);
    },
    [columnFilters]
  );

  const filterColumns = React.useMemo(
    () => getBookingFilterColumns().filter((column) => column.column !== "status"),
    []
  );
  const columns = React.useMemo(
    () =>
      getBookingColumns({
        onDelete: removeBooking,
        onAssign: setAssignBooking,
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
        <BreadcrumbItem>Completed Bookings</BreadcrumbItem>
      </Breadcrumbs>

      <Card className="mt-6 overflow-hidden">
        <CardHeader className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-default-900">
              Completed Bookings
            </CardTitle>
            <p className="mt-0.5 text-xs text-default-500">
              View bookings that have been marked complete.
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

      <AssignBookingModel
        open={Boolean(assignBooking)}
        booking={assignBooking}
        onClose={() => setAssignBooking(null)}
      />
    </>
  );
};

export default CompletedBookingsPage;
