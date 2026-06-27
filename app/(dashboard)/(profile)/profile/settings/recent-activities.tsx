"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/data-table/data-table";
import { getActivityColumns } from "@/components/data-table/columns/activity-columns";
import { useAuthActivities } from "@/hooks/queries/use-auth";

const RecentActivities = () => {
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(5);
  const { data, isLoading, isFetching } = useAuthActivities({ page, limit });

  const columns = React.useMemo(() => getActivityColumns(), []);

  const pagination = data?.meta
    ? {
        total: data.meta.total,
        page: data.meta.page,
        limit: data.meta.limit,
        pages: data.meta.totalPages,
      }
    : undefined;

  return (
    <Card className="flex h-full w-full flex-col">
      <CardHeader className="flex min-h-[3.25rem] flex-row items-center border-none mb-0 px-5 pb-3 pt-5">
        <CardTitle className="flex-1 text-lg font-medium text-default-800">
          Recent Activities
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col p-5 pt-0">
        <DataTable
          columns={columns}
          data={data?.items ?? []}
          loading={isLoading}
          fetching={isFetching}
          hideToolbar
          className="flex flex-1 flex-col"
          tableHeadClassName="h-10 px-4 py-0"
          tableRowClassName="h-11"
          tableCellClassName="h-11 px-4 py-0"
          minRows={limit}
          pageSizeOptions={[5, 10, 20]}
          pagination={pagination}
          onPageChange={setPage}
          onPageSizeChange={(pageSize) => {
            setPage(1);
            setLimit(pageSize);
          }}
          getRowId={(row) => row._id}
        />
      </CardContent>
    </Card>
  );
};

export default RecentActivities;
