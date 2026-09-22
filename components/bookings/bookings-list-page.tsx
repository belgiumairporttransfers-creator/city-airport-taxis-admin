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
  useBulkCompleteBookings,
  useBulkDeleteBookings,
  useCompleteBooking,
  useDeleteBooking,
} from "@/hooks/queries/use-bookings";
import {
  isPickupDatePreset,
  resolvePickupDatePreset,
  type PickupDatePreset,
} from "@/lib/booking-pickup-date-presets";
import {
  BOOKING_LIST_VIEWS,
  type BookingListViewKey,
} from "@/lib/booking-list-views";
import type { Booking, BookingPaymentMethod, BookingStatus } from "@/lib/schemas";

const isPaymentMethod = (value: string): value is BookingPaymentMethod =>
  value === "mollie" || value === "pay_onboard";

type BookingsListPageProps = {
  viewKey: BookingListViewKey;
};

const BookingsListPage = ({ viewKey }: BookingsListPageProps) => {
  const view = BOOKING_LIST_VIEWS[viewKey];
  const lockedStatus = view.status;
  const lockedTripPhase = view.tripPhase;
  const hideStatusFilter = Boolean(view.hideStatusFilter);

  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<BookingStatus | "">("");
  const [pickupDateFilter, setPickupDateFilter] = React.useState<PickupDatePreset | "">(
    ""
  );
  const [paymentMethodFilter, setPaymentMethodFilter] = React.useState<
    BookingPaymentMethod | ""
  >("");
  const [assignBooking, setAssignBooking] = React.useState<Booking | null>(null);

  const pickupDateRange = React.useMemo(
    () => (pickupDateFilter ? resolvePickupDatePreset(pickupDateFilter) : undefined),
    [pickupDateFilter]
  );

  const { data, isLoading, isFetching } = useBookings({
    page,
    limit,
    search,
    status: lockedStatus ?? (statusFilter || undefined),
    tripPhase: lockedTripPhase,
    paymentMethod: paymentMethodFilter || undefined,
    pickupDateFrom: pickupDateRange?.pickupDateFrom,
    pickupDateTo: pickupDateRange?.pickupDateTo,
  });

  const { mutate: removeBooking, isPending: isDeletingOne } = useDeleteBooking();
  const { mutateAsync: removeBookings, isPending: isDeletingBulk } =
    useBulkDeleteBookings();
  const { mutate: markComplete, isPending: isCompleting } = useCompleteBooking();
  const { mutateAsync: completeBookings, isPending: isCompletingBulk } =
    useBulkCompleteBookings();

  const columnFilters = React.useMemo<ColumnFiltersState>(() => {
    const filters: ColumnFiltersState = [];
    if (!hideStatusFilter && statusFilter) {
      filters.push({ id: "status", value: [statusFilter] });
    }
    if (pickupDateFilter) filters.push({ id: "pickupDate", value: [pickupDateFilter] });
    if (paymentMethodFilter) {
      filters.push({ id: "paymentMethod", value: [paymentMethodFilter] });
    }
    return filters;
  }, [hideStatusFilter, statusFilter, pickupDateFilter, paymentMethodFilter]);

  const handleColumnFiltersChange = React.useCallback<OnChangeFn<ColumnFiltersState>>(
    (updater) => {
      const nextFilters =
        typeof updater === "function" ? updater(columnFilters) : updater;
      const statusValues = nextFilters.find((filter) => filter.id === "status")?.value as
        | string[]
        | undefined;
      const pickupDateValues = nextFilters.find((filter) => filter.id === "pickupDate")
        ?.value as string[] | undefined;
      const paymentMethodValues = nextFilters.find((filter) => filter.id === "paymentMethod")
        ?.value as string[] | undefined;
      const nextPickupDate = pickupDateValues?.[0];
      const nextPaymentMethod = paymentMethodValues?.[0];

      if (!hideStatusFilter) {
        setStatusFilter((statusValues?.[0] as BookingStatus | undefined) ?? "");
      }
      setPickupDateFilter(
        nextPickupDate && isPickupDatePreset(nextPickupDate) ? nextPickupDate : ""
      );
      setPaymentMethodFilter(
        nextPaymentMethod && isPaymentMethod(nextPaymentMethod) ? nextPaymentMethod : ""
      );
      setPage(1);
    },
    [columnFilters, hideStatusFilter]
  );

  const filterColumns = React.useMemo(
    () =>
      hideStatusFilter
        ? getBookingFilterColumns().filter((column) => column.column !== "status")
        : getBookingFilterColumns(),
    [hideStatusFilter]
  );

  const columns = React.useMemo(
    () =>
      getBookingColumns({
        onDelete: removeBooking,
        onAssign: setAssignBooking,
        onComplete: (booking) => {
          if (!window.confirm(`Mark booking ${booking.bookingNumber} as complete?`)) {
            return;
          }
          markComplete(booking.id);
        },
        isDeleting: isDeletingOne || isDeletingBulk,
        isCompleting,
      }),
    [removeBooking, markComplete, isDeletingOne, isDeletingBulk, isCompleting]
  );

  const handleBulkDelete = async (selectedRows: { id: string }[]) => {
    await removeBookings(selectedRows.map((row) => row.id));
  };

  const handleBulkComplete = async (selectedRows: { id: string }[]) => {
    await completeBookings(selectedRows.map((row) => row.id));
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
        <BreadcrumbItem>{view.title}</BreadcrumbItem>
      </Breadcrumbs>

      <Card className="mt-6 overflow-hidden">
        <CardHeader className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-default-900">
              {view.title}
            </CardTitle>
            <p className="mt-0.5 text-xs text-default-500">{view.description}</p>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <DataTable
            columns={columns}
            data={data?.items ?? []}
            filterColumns={filterColumns}
            columnFilters={columnFilters}
            onColumnFiltersChange={handleColumnFiltersChange}
            initialColumnVisibility={{ paymentMethod: false }}
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
            onBulkComplete={handleBulkComplete}
            isDeleting={isDeletingOne || isDeletingBulk}
            isCompleting={isCompleting || isCompletingBulk}
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

export default BookingsListPage;
