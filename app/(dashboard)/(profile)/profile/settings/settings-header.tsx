"use client";

import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Home } from "lucide-react";
import coverImage from "@/public/images/all-img/user-cover.png";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icon } from "@iconify/react";
import { getInitials } from "@/lib/utils";
import { useAuthMe } from "@/hooks/queries/use-auth";
import defaultAvatar from "@/public/images/avatar/avatar-7.jpg";
import LayoutLoader from "@/components/layout-loader";

const SettingsHeader = () => {
  const { data: admin, isLoading } = useAuthMe();

  if (isLoading) {
    return <LayoutLoader />;
  }

  const displayName = admin?.name ?? "Admin";
  const role = admin?.role ?? "admin";
  const email = admin?.email ?? "";
  const avatarUrl = admin?.avatar || defaultAvatar.src;
  const initials = admin ? getInitials(admin.name) : "CC";

  return (
    <>
      <Breadcrumbs>
        <BreadcrumbItem>
          <Home className="h-4 w-4" />
        </BreadcrumbItem>
        <BreadcrumbItem>Settings</BreadcrumbItem>
        <BreadcrumbItem>Profile Settings</BreadcrumbItem>
      </Breadcrumbs>
      <Card className="mt-6 rounded-lg overflow-hidden">
        <CardContent className="p-0">
          <div
            className="relative h-[200px] xl:h-[240px] w-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${coverImage.src})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 flex items-end px-5 pb-2 lg:px-8 lg:pb-3">
              <div className="flex items-end gap-4 min-w-0 translate-y-1">
                <Avatar className="h-16 w-16 lg:h-20 lg:w-20 shrink-0 border-2 border-white shadow-sm">
                  <AvatarImage src={avatarUrl} alt={displayName} className="object-cover" />
                  <AvatarFallback className="text-xl">{initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 text-white pb-1">
                  <div className="text-lg lg:text-xl font-semibold truncate">{displayName}</div>
                  {email && (
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs lg:text-sm text-white/75">
                      <Icon icon="heroicons:envelope" className="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0" />
                      <span className="truncate">{email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default SettingsHeader;
