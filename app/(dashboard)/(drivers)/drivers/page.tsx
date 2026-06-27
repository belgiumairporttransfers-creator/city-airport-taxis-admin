"use client";

import React from "react";
import type { ColumnFiltersState, OnChangeFn } from "@tanstack/react-table";
import { Home } from "lucide-react";
import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/data-table/data-table";
import {
  getDriverApplicationColumns,
  getDriverApplicationFilterColumns,
} from "@/components/data-table/columns/driver-application-columns";
import { useDriverStats, useDrivers } from "@/hooks/queries/use-drivers";
import type { DriverApplicationStats, DriverApplicationStatus } from "@/lib/schemas";

type DriverStatKey = Exclude<keyof DriverApplicationStats, "total">;

const statCards: {
  key: DriverStatKey;
  label: string;
  className: string;
}[] = [
  { key: "pending", label: "Pending", className: "text-warning" },
  { key: "underReview", label: "Under Review", className: "text-info" },
  { key: "changesRequested", label: "Changes Requested", className: "text-warning" },
  { key: "approved", label: "Approved", className: "text-success" },
  { key: "rejected", label: "Rejected", className: "text-destructive" },
  { key: "suspended", label: "Suspended", className: "text-default-600" },
];

const DriversPage = () => {
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<DriverApplicationStatus | "">("");

  const { data: stats, isLoading: statsLoading } = useDriverStats();
  const { data, isLoading, isFetching } = useDrivers({
    page,
    limit,
    search,
    status: statusFilter || undefined,
  });

  const columnFilters = React.useMemo<ColumnFiltersState>(
    () => (statusFilter ? [{ id: "status", value: [statusFilter] }] : []),
    [statusFilter]
  );

  const handleColumnFiltersChange = React.useCallback<OnChangeFn<ColumnFiltersState>>(
    (updater) => {
      const nextFilters =
        typeof updater === "function" ? updater(columnFilters) : updater;
      const statusValues = nextFilters.find((filter) => filter.id === "status")
        ?.value as string[] | undefined;
      setStatusFilter((statusValues?.[0] as DriverApplicationStatus | undefined) ?? "");
      setPage(1);
    },
    [columnFilters]
  );

  const filterColumns = React.useMemo(() => getDriverApplicationFilterColumns(), []);
  const columns = React.useMemo(() => getDriverApplicationColumns(), []);

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
        <BreadcrumbItem>Drivers</BreadcrumbItem>
        <BreadcrumbItem>Applications</BreadcrumbItem>
      </Breadcrumbs>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {statCards.map(({ key, label, className }) => (
          <Card key={key}>
            <CardContent className="p-4">
              <p className="text-xs font-medium text-default-500">{label}</p>
              <p className={`mt-1 text-2xl font-semibold ${className}`}>
                {statsLoading ? "—" : (stats?.[key] ?? 0)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6 overflow-hidden">
        <CardHeader className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-default-900">
              Driver applications
            </CardTitle>
            <p className="mt-0.5 text-xs text-default-500">
              Review and manage driver onboarding applications.
              {stats ? ` ${stats.total} total.` : ""}
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
            searchKey="applicationNumber"
            searchPlaceholder="Search by name, email, application #, or plate"
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
            getRowId={(row) => row.id}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default DriversPage;
