"use client";

import React from "react";
import { Home } from "lucide-react";
import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/data-table/data-table";
import { getDriverEarningsColumns } from "@/components/data-table/columns/driver-earnings-columns";
import { useDriverEarningsReport } from "@/hooks/queries/use-driver-wallet";
import { formatPercent, formatPrice } from "@/lib/utils";

const EUR_SYMBOL = "€";

const DriverEarningsReportPage = () => {
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [search, setSearch] = React.useState("");

  const { data, isLoading, isFetching } = useDriverEarningsReport();

  const columns = React.useMemo(() => getDriverEarningsColumns(), []);

  const filteredItems = React.useMemo(() => {
    const items = data?.items ?? [];
    const query = search.trim().toLowerCase();
    if (!query) return items;

    return items.filter((item) => {
      const haystack = [
        item.bookingNumber,
        item.paymentStatus,
        item.bookingStatus,
        item.pickupDate,
        String(item.total),
        String(item.net),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [data?.items, search]);

  const paginatedItems = React.useMemo(() => {
    const start = (page - 1) * limit;
    return filteredItems.slice(start, start + limit);
  }, [filteredItems, page, limit]);

  const pagination = {
    total: filteredItems.length,
    page,
    limit,
    pages: Math.max(1, Math.ceil(filteredItems.length / limit) || 1),
  };

  const summary = data?.summary;

  return (
    <>
      <Breadcrumbs>
        <BreadcrumbItem>
          <Home className="h-4 w-4" />
        </BreadcrumbItem>
        <BreadcrumbItem>Drivers</BreadcrumbItem>
        <BreadcrumbItem>Earnings Report</BreadcrumbItem>
      </Breadcrumbs>

      {summary ? (
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-default-500">Completed trips</p>
              <p className="mt-1 text-xl font-semibold text-default-900">{summary.count}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-default-500">Commission %</p>
              <p className="mt-1 text-xl font-semibold text-default-900">
                {formatPercent(summary.commissionPercent)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-default-500">Total revenue</p>
              <p className="mt-1 text-xl font-semibold text-default-900">
                {formatPrice(summary.totalRevenue, EUR_SYMBOL)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-default-500">Driver earnings</p>
              <p className="mt-1 text-xl font-semibold text-default-900">
                {formatPrice(summary.totalDriverEarnings, EUR_SYMBOL)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-default-500">Commission total</p>
              <p className="mt-1 text-xl font-semibold text-default-900">
                {formatPrice(summary.totalCommission, EUR_SYMBOL)}
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <Card className="mt-6 overflow-hidden">
        <CardHeader className="border-b border-border px-5 py-4">
          <CardTitle className="text-lg font-semibold text-default-900">
            Earnings Report
          </CardTitle>
          <p className="mt-0.5 text-xs text-default-500">
            Driver payouts for completed bookings after platform commission.
          </p>
        </CardHeader>

        <CardContent className="p-4">
          <DataTable
            columns={columns}
            data={paginatedItems}
            searchKey="bookingNumber"
            searchPlaceholder="Search by booking #, status, or date"
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
            getRowId={(row) => row.bookingId}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default DriverEarningsReportPage;
