"use client";

import React from "react";
import { Home } from "lucide-react";
import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/data-table/data-table";
import { getNewsletterDraftColumns } from "@/components/data-table/columns/newsletter-draft-columns";
import {
  useBulkDeleteNewsletterDrafts,
  useDeleteNewsletterDraft,
  useNewsletterDrafts,
} from "@/hooks/queries/use-newsletter-drafts";

const NewsletterDraftsPage = () => {
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [search, setSearch] = React.useState("");

  const { data, isLoading, isFetching } = useNewsletterDrafts({ page, limit, search });
  const { mutate: removeDraft, isPending: isDeletingOne } = useDeleteNewsletterDraft();
  const { mutateAsync: removeDrafts, isPending: isDeletingBulk } =
    useBulkDeleteNewsletterDrafts();

  const columns = React.useMemo(
    () =>
      getNewsletterDraftColumns({
        onDelete: removeDraft,
        isDeleting: isDeletingOne || isDeletingBulk,
      }),
    [removeDraft, isDeletingOne, isDeletingBulk]
  );

  const handleBulkDelete = async (selectedRows: { _id: string }[]) => {
    await removeDrafts(selectedRows.map((row) => row._id));
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
        <BreadcrumbItem>Draft Newsletters</BreadcrumbItem>
      </Breadcrumbs>

      <Card className="mt-6 overflow-hidden">
        <CardContent className="p-4">
          <DataTable
            columns={columns}
            data={data?.items ?? []}
            searchKey="campaignName"
            searchPlaceholder="Search by campaign or subject"
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

export default NewsletterDraftsPage;
