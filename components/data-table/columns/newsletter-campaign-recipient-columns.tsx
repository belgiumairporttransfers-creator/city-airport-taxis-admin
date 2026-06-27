"use client";

import { RotateCcw } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { NewsletterCampaignRecipient } from "@/lib/schemas";

const formatDate = (value?: string) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

interface GetNewsletterCampaignRecipientColumnsOptions {
  onResend: (id: string) => void;
  resendingId?: string | null;
}

export function getNewsletterCampaignRecipientColumns({
  onResend,
  resendingId,
}: GetNewsletterCampaignRecipientColumnsOptions): ColumnDef<NewsletterCampaignRecipient>[] {
  return [
    {
      accessorKey: "campaignName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Campaign" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.campaignName || "—"}
        </span>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) => <span>{row.getValue("email")}</span>,
    },
    {
      accessorKey: "errorMessage",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Error" />
      ),
      cell: ({ row }) => (
        <span className="text-destructive text-sm">
          {row.original.errorMessage || "Delivery failed"}
        </span>
      ),
    },
    {
      accessorKey: "lastAttemptAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Last attempt" />
      ),
      cell: ({ row }) => formatDate(row.original.lastAttemptAt),
    },
    {
      accessorKey: "attemptCount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Attempts" />
      ),
      cell: ({ row }) => row.getValue("attemptCount"),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const recipient = row.original;
        if (recipient.status !== "failed") return null;

        const isResending = resendingId === recipient._id;

        return (
          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              variant="outline"
              color="secondary"
              disabled={Boolean(resendingId)}
              isLoading={isResending}
              loadingText="Resending..."
              onClick={() => onResend(recipient._id)}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Resend
            </Button>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
