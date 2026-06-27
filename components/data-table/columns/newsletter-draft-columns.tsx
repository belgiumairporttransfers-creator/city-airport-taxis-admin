"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { NewsletterDraft } from "@/lib/schemas";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const audienceLabels: Record<NewsletterDraft["audience"], string> = {
  all: "All subscribers",
  "coming-soon": "Coming soon",
  website: "Website",
};

interface GetNewsletterDraftColumnsOptions {
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export function getNewsletterDraftColumns({
  onDelete,
  isDeleting,
}: GetNewsletterDraftColumnsOptions): ColumnDef<NewsletterDraft>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-0.5"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-0.5"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
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
      cell: ({ row }) => {
        const subject = row.getValue("subject") as string;
        return (
          <span className="text-default-600">
            {subject || <span className="text-default-400">—</span>}
          </span>
        );
      },
    },
    {
      accessorKey: "audience",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Audience" />
      ),
      cell: ({ row }) => (
        <span>{audienceLabels[row.original.audience]}</span>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Last updated" />
      ),
      cell: ({ row }) => formatDate(row.getValue("updatedAt")),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            color="secondary"
            asChild
          >
            <Link href={`/send?draftId=${row.original._id}`} aria-label="Edit draft">
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            color="destructive"
            disabled={isDeleting}
            onClick={() => onDelete(row.original._id)}
            aria-label="Delete draft"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
