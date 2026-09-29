"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, ShieldAlert, Trash2, User as UserIcon, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { DataTableFilterColumn } from "@/components/data-table/data-table-toolbar";
import type { AdminUser } from "@/lib/schemas";

const formatDate = (value?: string) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const getInitials = (firstName?: string, lastName?: string) => {
  const f = firstName?.[0] || "";
  const l = lastName?.[0] || "";
  return (f + l).toUpperCase() || "U";
};

interface GetUserColumnsOptions {
  onDelete: (user: AdminUser) => void;
  onToggleStatus?: (user: AdminUser) => void;
  isDeleting?: boolean;
}

export function getUserFilterColumns(): DataTableFilterColumn[] {
  return [
    {
      column: "status",
      title: "Status",
      multiple: false,
      options: [
        { value: "active", label: "Active" },
        { value: "suspended", label: "Suspended" },
      ],
    },
    {
      column: "isVerified",
      title: "Email Verification",
      multiple: false,
      options: [
        { value: "true", label: "Verified" },
        { value: "false", label: "Unverified" },
      ],
    },
  ];
}

export function getUserColumns({
  onDelete,
  onToggleStatus,
  isDeleting = false,
}: GetUserColumnsOptions): ColumnDef<AdminUser>[] {
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
      id: "user",
      header: ({ column }) => <DataTableColumnHeader column={column} title="User" />,
      cell: ({ row }) => {
        const user = row.original;
        const initials = getInitials(user.firstName, user.lastName);
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-border">
              {user.avatar && <AvatarImage src={user.avatar} alt={user.fullName || "User"} />}
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold text-default-900 leading-tight">
                {user.fullName || `${user.firstName} ${user.lastName}`}
              </span>
              {user.companyName && (
                <span className="text-xs text-default-500 font-medium">
                  {user.companyName}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-sm text-default-800">{user.email}</span>
            {user.isVerified ? (
              <CheckCircle2 className="h-4 w-4 text-success shrink-0" aria-label="Email verified" />
            ) : (
              <XCircle className="h-4 w-4 text-warning shrink-0" aria-label="Email not verified" />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "phoneNumber",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Phone" />,
      cell: ({ row }) => (
        <span className="text-default-700 text-sm">
          {row.getValue("phoneNumber") || "—"}
        </span>
      ),
    },
    {
      accessorKey: "isVerified",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Verification" />,
      cell: ({ row }) => {
        const isVerified = row.original.isVerified;
        return isVerified ? (
          <Badge color="success" variant="soft" className="font-medium">
            Verified
          </Badge>
        ) : (
          <Badge color="warning" variant="soft" className="font-medium">
            Unverified
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const status = row.original.status;
        return status === "active" ? (
          <Badge color="success" variant="soft" className="font-medium capitalize">
            Active
          </Badge>
        ) : (
          <Badge color="destructive" variant="soft" className="font-medium capitalize">
            Suspended
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Registered" />,
      cell: ({ row }) => (
        <span className="text-default-600 text-xs whitespace-nowrap">
          {formatDate(row.getValue("createdAt"))}
        </span>
      ),
    },
    {
      accessorKey: "lastLogin",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Last Login" />,
      cell: ({ row }) => (
        <span className="text-default-600 text-xs whitespace-nowrap">
          {row.original.lastLogin ? formatDate(row.original.lastLogin) : "Never"}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex justify-end items-center gap-1.5">
            {onToggleStatus && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-xs font-medium text-default-600 hover:text-default-900"
                onClick={() => onToggleStatus(user)}
              >
                {user.status === "active" ? "Suspend" : "Activate"}
              </Button>
            )}
            <Button
              type="button"
              size="icon"
              variant="ghost"
              color="destructive"
              disabled={isDeleting}
              onClick={() => onDelete(user)}
              aria-label={`Delete user ${user.email}`}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
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
