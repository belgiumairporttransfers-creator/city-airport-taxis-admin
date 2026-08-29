"use client";

import React from "react";
import { Home } from "lucide-react";
import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/data-table/data-table";
import { getDriverPayoutColumns } from "@/components/data-table/columns/driver-payout-columns";
import {
  useAllDriverPayouts,
  useApproveDriverPayout,
  useRejectDriverPayout,
} from "@/hooks/queries/use-driver-wallet";
import type { AdminPayout } from "@/lib/schemas";

type DriverPayoutsPageViewProps = {
  status: "pending" | "completed";
  title: string;
  description: string;
};

const DriverPayoutsPageView = ({
  status,
  title,
  description,
}: DriverPayoutsPageViewProps) => {
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(20);
  const [actingId, setActingId] = React.useState<string | null>(null);

  const { data, isLoading, isFetching } = useAllDriverPayouts({
    page,
    limit,
    status,
  });
  const approvePayout = useApproveDriverPayout();
  const rejectPayout = useRejectDriverPayout();

  const handleApprove = React.useCallback(
    (payout: AdminPayout) => {
      setActingId(payout.id);
      approvePayout.mutate(
        { driverId: payout.driverId, transactionId: payout.id },
        { onSettled: () => setActingId(null) }
      );
    },
    [approvePayout]
  );

  const handleReject = React.useCallback(
    (payout: AdminPayout) => {
      setActingId(payout.id);
      rejectPayout.mutate(
        { driverId: payout.driverId, transactionId: payout.id },
        { onSettled: () => setActingId(null) }
      );
    },
    [rejectPayout]
  );

  const columns = React.useMemo(
    () =>
      getDriverPayoutColumns({
        showActions: status === "pending",
        dateColumnTitle: status === "completed" ? "Processed" : "Requested",
        actingId,
        onApprove: handleApprove,
        onReject: handleReject,
      }),
    [status, actingId, handleApprove, handleReject]
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
        <BreadcrumbItem>Drivers</BreadcrumbItem>
        <BreadcrumbItem>{title}</BreadcrumbItem>
      </Breadcrumbs>

      <Card className="mt-6 overflow-hidden">
        <CardHeader className="border-b border-border px-5 py-4">
          <CardTitle className="text-lg font-semibold text-default-900">
            {title}
          </CardTitle>
          <p className="mt-0.5 text-xs text-default-500">{description}</p>
        </CardHeader>

        <CardContent className="p-4">
          <DataTable
            columns={columns}
            data={data?.items ?? []}
            loading={isLoading}
            fetching={isFetching}
            hideToolbar
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

export default DriverPayoutsPageView;
