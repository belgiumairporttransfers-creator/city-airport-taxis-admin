"use client";

import React from "react";
import { Home } from "lucide-react";
import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/data-table/data-table";
import { getNewsletterColumns } from "@/components/data-table/columns/newsletter-columns";
import { useBulkDeleteNewsletters, useDeleteNewsletter, useNewsletters } from "@/hooks/queries/use-newsletters";

const NewslettersPage = () => {
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [search, setSearch] = React.useState("");

  const { data, isLoading, isFetching } = useNewsletters({ page, limit, search });
  const { mutate: removeSubscriber, isPending: isDeletingOne } = useDeleteNewsletter();
  const { mutateAsync: removeSubscribers, isPending: isDeletingBulk } =
    useBulkDeleteNewsletters();

  const columns = React.useMemo(
    () =>
      getNewsletterColumns({
        onDelete: removeSubscriber,
        isDeleting: isDeletingOne || isDeletingBulk,
      }),
    [removeSubscriber, isDeletingOne, isDeletingBulk]
  );

  const handleBulkDelete = async (selectedRows: { _id: string }[]) => {
    await removeSubscribers(selectedRows.map((row) => row._id));
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
        <BreadcrumbItem>Newsletter</BreadcrumbItem>
        <BreadcrumbItem>Newsletters</BreadcrumbItem>
      </Breadcrumbs>

      <Card className="mt-6 overflow-hidden">

        <CardContent className="p-4">
          <DataTable
            columns={columns}
            data={data?.items ?? []}
            searchKey="email"
            searchPlaceholder="Search by email"
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
            isDeleting={isDeletingOne || isDeletingBulk}
            getRowId={(row) => row._id}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default NewslettersPage;
