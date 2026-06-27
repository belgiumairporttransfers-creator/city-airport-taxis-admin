"use client";

import Link from "next/link";
import { RotateCcw, Trash2, Users } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { NewsletterCampaign } from "@/lib/schemas";

const formatDate = (value?: string) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const audienceLabels: Record<NewsletterCampaign["audience"], string> = {
  all: "All subscribers",
  "coming-soon": "Coming soon",
  website: "Website",
};

const statusLabels: Record<NewsletterCampaign["status"], string> = {
  scheduled: "Scheduled",
  sending: "Sending",
  sent: "Sent",
  failed: "Failed",
  cancelled: "Cancelled",
};

const statusClasses: Record<NewsletterCampaign["status"], string> = {
  scheduled: "bg-info/10 text-info",
  sending: "bg-warning/10 text-warning",
  sent: "bg-success/10 text-success",
  failed: "bg-destructive/10 text-destructive",
  cancelled: "bg-default-100 text-default-600",
};

const canResendCampaign = (status: NewsletterCampaign["status"]) =>
  status === "failed" || status === "sending";

interface GetNewsletterCampaignColumnsOptions {
  onResend: (id: string) => void;
  onDelete: (id: string) => void;
  resendingId?: string | null;
  isDeleting?: boolean;
}

export function getNewsletterCampaignColumns({
  onResend,
  onDelete,
  resendingId,
  isDeleting = false,
}: GetNewsletterCampaignColumnsOptions): ColumnDef<NewsletterCampaign>[] {
  return [
    {
      accessorKey: "campaignName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Campaign" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("campaignName")}</span>
      ),
    },
    {
      accessorKey: "subject",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Subject" />
      ),
      cell: ({ row }) => (
        <span className="text-default-600">{row.getValue("subject")}</span>
      ),
    },
    {
      accessorKey: "audience",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Audience" />
      ),
      cell: ({ row }) => audienceLabels[row.original.audience],
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusClasses[status]}`}
          >
            {statusLabels[status]}
          </span>
        );
      },
    },
    {
      accessorKey: "recipientCount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Recipients" />
      ),
      cell: ({ row }) => row.getValue("recipientCount"),
    },
    {
      id: "progress",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Progress" />
      ),
      cell: ({ row }) => {
        const campaign = row.original;
        const total = campaign.recipientCount;
        const processed = campaign.sentCount + campaign.failedCount;

        if (campaign.status === "scheduled") {
          return <span className="text-default-500">—</span>;
        }

        if (total === 0) {
          return <span className="text-default-500">0%</span>;
        }

        const percent = Math.min(100, Math.round((processed / total) * 100));

        return (
          <div className="min-w-[120px] space-y-1">
            <div className="flex items-center justify-between text-xs text-default-600">
              <span>
                {processed}/{total}
              </span>
              <span>{percent}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-default-100">
              <div
                className={`h-full rounded-full transition-all ${
                  campaign.status === "failed"
                    ? "bg-destructive"
                    : campaign.status === "sent"
                      ? "bg-success"
                      : "bg-primary"
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      id: "delivery",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Delivery" />
      ),
      cell: ({ row }) => {
        const campaign = row.original;
        if (campaign.status === "scheduled") {
          return formatDate(campaign.scheduledAt);
        }
        if (campaign.status === "failed") {
          return (
            <span className="text-destructive">
              {formatDate(campaign.sentAt)} ({campaign.failedCount} failed)
            </span>
          );
        }
        return formatDate(campaign.sentAt);
      },
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const campaign = row.original;
        const isResending = resendingId === campaign._id;
        const actionsDisabled = Boolean(resendingId) || isDeleting;

        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              color="secondary"
              asChild
            >
              <Link
                href={`/campaign-recipients?campaignId=${campaign._id}`}
                aria-label="View recipients"
              >
                <Users className="h-4 w-4" />
              </Link>
            </Button>

            {canResendCampaign(campaign.status) ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                color="secondary"
                disabled={actionsDisabled}
                isLoading={isResending}
                loadingText="Resending..."
                onClick={() => onResend(campaign._id)}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Resend
              </Button>
            ) : null}

            <Button
              type="button"
              size="icon"
              variant="ghost"
              color="destructive"
              disabled={actionsDisabled}
              onClick={() => onDelete(campaign._id)}
              aria-label="Delete campaign"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
