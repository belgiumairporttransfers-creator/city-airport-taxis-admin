"use client";

import React from "react";
import { Home } from "lucide-react";
import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/data-table/data-table";
import { getNewsletterCampaignColumns } from "@/components/data-table/columns/newsletter-campaign-columns";
import ConfirmationDialog from "@/components/confirmation-dialog";
import {
  useDeleteNewsletterCampaign,
  useNewsletterCampaigns,
  useResendNewsletterCampaign,
} from "@/hooks/queries/use-newsletter-campaigns";

const NewsletterCampaignsPage = () => {
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [search, setSearch] = React.useState("");
  const [resendingId, setResendingId] = React.useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [campaignToDelete, setCampaignToDelete] = React.useState<{
    id: string;
    name: string;
  } | null>(null);

  const { data, isLoading, isFetching } = useNewsletterCampaigns(
    {
      page,
      limit,
      search,
    },
    { pollWhileSending: true }
  );
  const { mutateAsync: resendCampaign } = useResendNewsletterCampaign();
  const { mutateAsync: deleteCampaign, isPending: isDeleting } =
    useDeleteNewsletterCampaign();

  const handleResend = React.useCallback(
    async (id: string) => {
      setResendingId(id);
      try {
        await resendCampaign(id);
      } finally {
        setResendingId(null);
      }
    },
    [resendCampaign]
  );

  const handleDeleteRequest = React.useCallback(
    (id: string) => {
      const campaign = data?.items.find((item) => item._id === id);
      setCampaignToDelete({
        id,
        name: campaign?.campaignName ?? "this campaign",
      });
      setDeleteDialogOpen(true);
    },
    [data?.items]
  );

  const handleConfirmDelete = React.useCallback(async () => {
    if (!campaignToDelete) return;
    await deleteCampaign(campaignToDelete.id);
    setCampaignToDelete(null);
  }, [campaignToDelete, deleteCampaign]);

  const columns = React.useMemo(
    () =>
      getNewsletterCampaignColumns({
        onResend: (id) => void handleResend(id),
        onDelete: handleDeleteRequest,
        resendingId,
        isDeleting,
      }),
    [handleResend, handleDeleteRequest, resendingId, isDeleting]
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
        <BreadcrumbItem>Newsletter</BreadcrumbItem>
        <BreadcrumbItem>Sent Campaigns</BreadcrumbItem>
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
            getRowId={(row) => row._id}
          />
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setCampaignToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete campaign?"
        description={`This will permanently delete "${campaignToDelete?.name ?? "this campaign"}" and all of its recipient records. This action cannot be undone.`}
        confirmLabel="Delete"
        pendingLabel="Deleting..."
      />
    </>
  );
};

export default NewsletterCampaignsPage;
