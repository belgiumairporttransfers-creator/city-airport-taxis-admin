"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { Home } from "lucide-react";
import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/data-table/data-table";
import { getNewsletterCampaignRecipientColumns } from "@/components/data-table/columns/newsletter-campaign-recipient-columns";
import {
  useNewsletterCampaignRecipients,
  useResendCampaignRecipient,
} from "@/hooks/queries/use-newsletter-campaign-recipients";

const CampaignRecipientsPage = () => {
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("campaignId") ?? "";

  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(20);
  const [search, setSearch] = React.useState("");
  const [resendingId, setResendingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setPage(1);
  }, [campaignId]);

  const { data, isLoading, isFetching } = useNewsletterCampaignRecipients({
    page,
    limit,
    search,
    campaignId: campaignId || undefined,
    status: "failed",
  });

  const { mutateAsync: resendRecipient } = useResendCampaignRecipient();

  const handleResend = React.useCallback(
    async (id: string) => {
      setResendingId(id);
      try {
        await resendRecipient(id);
      } finally {
        setResendingId(null);
      }
    },
    [resendRecipient]
  );

  const columns = React.useMemo(
    () =>
      getNewsletterCampaignRecipientColumns({
        onResend: (id) => void handleResend(id),
        resendingId,
      }),
    [handleResend, resendingId]
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
        <BreadcrumbItem>Failed Recipients</BreadcrumbItem>
      </Breadcrumbs>

      <Card className="mt-6 overflow-hidden">
        <CardContent className="p-4">
          <DataTable
            columns={columns}
            data={data?.items ?? []}
            searchKey="email"
            searchPlaceholder="Search failed recipients by email"
            searchValue={search}
            onSearchChange={(value) => {
              setPage(1);
              setSearch(value);
            }}
            loading={isLoading}
            fetching={isFetching}
            pageSizeOptions={[20, 50, 100]}
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
    </>
  );
};

export default CampaignRecipientsPage;
