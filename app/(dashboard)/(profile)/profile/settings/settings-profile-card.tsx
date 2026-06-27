"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icon } from "@iconify/react";
import { User, Phone, Mail } from "@/components/svg";
import { useAuthMe, useAuthUpdateProfile } from "@/hooks/queries/use-auth";
import { useUpload } from "@/hooks/queries/use-upload";
import { getInitials } from "@/lib/utils";
import defaultAvatar from "@/public/images/avatar/avatar-7.jpg";
import LayoutLoader from "@/components/layout-loader";
import toast from "react-hot-toast";

const SettingsProfileCard = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: admin, isLoading } = useAuthMe();
  const { mutateAsync: uploadImage, isPending: isUploading } = useUpload();
  const { mutateAsync: updateProfile, isPending: isUpdating } = useAuthUpdateProfile();

  if (isLoading) {
    return <LayoutLoader />;
  }

  const displayName = admin?.name ?? "Admin";
  const avatarUrl = admin?.avatar || defaultAvatar.src;
  const initials = admin ? getInitials(admin.name) : "CC";
  const isSaving = isUploading || isUpdating;

  const adminDetails = [
    {
      icon: User,
      label: "Full Name",
      value: admin?.name ?? "—",
    },
    {
      icon: Phone,
      label: "Phone",
      value: admin?.phoneNumber ?? "—",
    },
    {
      icon: "heroicons:shield-check",
      label: "Role",
      value: admin?.role ?? "—",
      isIconify: true,
    },
    {
      icon: Mail,
      label: "Email",
      value: admin?.email ?? "—",
    },

  ];

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !admin) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    try {
      const uploaded = await uploadImage({ file, folder: "admin-avatars" });
      await updateProfile({
        firstName: admin.firstName,
        lastName: admin.lastName,
        phoneNumber: admin.phoneNumber,
        avatar: uploaded.url,
      });
    } catch {
      // Errors are handled in mutation hooks.
    }
  };

  return (
    <Card className="h-full w-full">
      <CardContent className="p-6">
        <div className="flex flex-col items-center">
          <div className="relative rounded-full">
            <Avatar className="h-[100px] w-[100px]">
              <AvatarImage src={avatarUrl} alt={displayName} className="object-cover" />
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>
            <Button
              type="button"
              size="icon"
              disabled={isSaving}
              className="absolute bottom-0 right-0 h-8 w-8 cursor-pointer rounded-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <Icon
                className="h-5 w-5 text-primary-foreground"
                icon={isSaving ? "svg-spinners:ring-resize" : "heroicons:pencil-square"}
              />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div className="mt-3 text-center text-lg font-semibold text-default-900">{displayName}</div>
        </div>

        <div className="mt-5 border-t border-border pt-5">
          <ul className="space-y-4">
            {adminDetails.map((item, index) => (
              <li key={`admin-detail-${index}`} className="flex items-start gap-3">
                <div className="flex w-[108px] shrink-0 items-center gap-1.5">
                  <span className="shrink-0">
                    {item.isIconify ? (
                      <Icon icon={item.icon as string} className="h-4 w-4 text-primary" />
                    ) : (
                      <item.icon className="h-4 w-4 text-primary" />
                    )}
                  </span>
                  <span className="text-sm font-medium text-default-800">{item.label}:</span>
                </div>
                <span
                  className={`min-w-0 flex-1 text-sm text-default-700 break-words ${
                    item.label === "Role" ? "capitalize" : ""
                  }`}
                >
                  {item.value}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default SettingsProfileCard;
