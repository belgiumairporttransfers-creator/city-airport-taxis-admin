"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Image, { StaticImageData } from "next/image";
import { Button } from "@/components/ui/button";
import type { AuthSession } from "@/lib/schemas";
import windowsImage from "@/public/images/social/windows.png";
import androidImage from "@/public/images/social/android.png";
import macImage from "@/public/images/social/mac.png";
import iphoneImage from "@/public/images/social/iphone.png";
import webImage from "@/public/images/social/web.png";

const getBrowserLabel = (session: AuthSession) => {
  if (session.browser && session.os) return `${session.browser} on ${session.os}`;
  if (session.browser) return session.browser;
  if (session.os) return session.os;
  return "Unknown browser";
};

const getBrowserIcon = (session: AuthSession): StaticImageData => {
  const os = (session.os ?? "").toLowerCase();
  const device = (session.device ?? "").toLowerCase();

  if (os.includes("ios") || device.includes("iphone") || device.includes("ipad")) {
    return iphoneImage;
  }
  if (os.includes("android")) {
    return androidImage;
  }
  if (os.includes("mac") || os.includes("darwin")) {
    return macImage;
  }
  if (os.includes("windows")) {
    return windowsImage;
  }
  return webImage;
};

interface GetSessionColumnsOptions {
  onRevoke: (sessionId: string) => void;
  isRevoking?: boolean;
  revokingSessionId?: string;
}

export function getSessionColumns({
  onRevoke,
  isRevoking,
  revokingSessionId,
}: GetSessionColumnsOptions): ColumnDef<AuthSession>[] {
  return [
    {
      id: "browser",
      header: "Browser",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 font-medium">
          <div className="grid h-5 w-5 shrink-0 place-content-center rounded bg-default-100 dark:bg-default-50">
            <Image
              className="h-3.5 w-3.5"
              src={getBrowserIcon(row.original)}
              alt={getBrowserLabel(row.original)}
            />
          </div>
          <span className="truncate">{getBrowserLabel(row.original)}</span>
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "device",
      header: "Device",
      cell: ({ row }) => (
        <span className="whitespace-nowrap">{row.original.device ?? "Unknown"}</span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "ipAddress",
      header: "Location",
      cell: ({ row }) => (
        <span className="whitespace-nowrap">{row.original.ipAddress}</span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "createdAt",
      header: "Recent Activities",
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {format(new Date(row.original.createdAt), "dd MMM yyyy, HH:mm")}
        </span>
      ),
      enableSorting: false,
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Action</span>,
      cell: ({ row }) => (
        <div className="text-right">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2"
            disabled={isRevoking && revokingSessionId === row.original._id}
            onClick={() => onRevoke(row.original._id)}
          >
            Logout
          </Button>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
