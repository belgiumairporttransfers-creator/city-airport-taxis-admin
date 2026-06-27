"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icon } from "@iconify/react";
import Link from "next/link";
import defaultAvatar from "@/public/images/avatar/avatar-7.jpg";
import { useAuthLogout, useAuthMe } from "@/hooks/queries/use-auth";
import { getInitials } from "@/lib/utils";

const menuItems = [
  {
    name: "Profile Settings",
    icon: "heroicons:cog-6-tooth",
    href: "/profile",
  },
];

const ProfileInfo = () => {
  const { data: admin } = useAuthMe();
  const { mutate: logout, isPending } = useAuthLogout();

  const displayName = admin?.name ?? "City Cab Admin";
  const email = admin?.email ?? "admin@citycab.com";
  const avatarUrl = admin?.avatar || defaultAvatar.src;
  const initials = admin ? getInitials(admin.name) : "CC";


  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild className="cursor-pointer">
        <button type="button" className="flex items-center rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={avatarUrl} alt={displayName} className="object-cover" />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 p-0" align="end">
        <DropdownMenuLabel className="flex gap-2 items-center mb-1 p-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={avatarUrl} alt={displayName} className="object-cover" />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="text-sm font-medium text-default-800 capitalize truncate">
              {displayName}
            </div>
            <p className="text-xs text-default-600 truncate">{email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          {menuItems.map((item) => (
            <Link href={item.href} key={item.name} className="cursor-pointer">
              <DropdownMenuItem className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize px-3 py-1.5 dark:hover:bg-background cursor-pointer">
                <Icon icon={item.icon} className="w-4 h-4" />
                {item.name}
              </DropdownMenuItem>
            </Link>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="mb-0 dark:bg-background" />
        <DropdownMenuItem
          onClick={() => logout()}
          disabled={isPending}
          className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize my-1 px-3 dark:hover:bg-background cursor-pointer"
        >
          <Icon icon="heroicons:power" className="w-4 h-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileInfo;
