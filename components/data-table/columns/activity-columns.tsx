"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import type { Activity } from "@/lib/schemas";

const activityLabels: Record<Activity["type"], string> = {
  login: "Logged in",
  logout: "Logged out",
  password_change: "Password changed",
  password_reset: "Password reset",
  password_reset_request: "Password reset requested",
  update_profile: "Profile updated",
  logout_all: "Logged out from all devices",
  email_verified: "Email verified",
  session_revoked: "Session revoked",
};

const getDeviceLabel = (activity: Activity) => {
  const parts = [activity.browser, activity.os, activity.device].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : activity.ipAddress ?? "Unknown device";
};

export function getActivityColumns(): ColumnDef<Activity>[] {
  return [
    {
      accessorKey: "type",
      header: "Activity",
      cell: ({ row }) => (
        <span className="font-medium capitalize">
          {activityLabels[row.original.type]}
          {row.original.status === "failed" && (
            <span className="text-destructive"> (failed)</span>
          )}
        </span>
      ),
      enableSorting: false,
    },
    {
      id: "device",
      header: "Device",
      cell: ({ row }) => getDeviceLabel(row.original),
      enableSorting: false,
    },
    {
      accessorKey: "timestamp",
      header: "Time",
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {format(new Date(row.original.timestamp), "dd MMM yyyy, HH:mm")}
        </span>
      ),
      enableSorting: false,
    },
  ];
}
