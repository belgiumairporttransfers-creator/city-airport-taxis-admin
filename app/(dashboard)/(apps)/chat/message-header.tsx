"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Menu } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { Contact } from "@/lib/chat/types";
import { getAvatarSrc } from "@/lib/chat/types";

const MessageHeader = ({
  showInfo,
  handleShowInfo,
  profile,
  mblChatHandler,
}: {
  showInfo: boolean;
  handleShowInfo: () => void;
  profile: Contact;
  mblChatHandler: () => void;
}) => {
  const isOnline = profile.status === "online";
  const isLg = useMediaQuery("(max-width: 1024px)");
  const avatarSrc = getAvatarSrc(profile?.avatar);

  return (
    <div className="flex items-center gap-2 px-0 py-0">
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        {isLg && (
          <Menu
            className="h-5 w-5 shrink-0 cursor-pointer text-default-600"
            onClick={mblChatHandler}
          />
        )}
        <div className="relative inline-block shrink-0">
          <Avatar className="h-9 w-9">
            {avatarSrc ? <AvatarImage src={avatarSrc} alt="" /> : null}
            <AvatarFallback>{profile?.fullName?.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <Badge
            className="absolute left-[calc(100%-10px)] top-[calc(100%-10px)] h-2.5 w-2.5 items-center justify-center p-0 ring-1 ring-border ring-offset-[1px]"
            color={isOnline ? "success" : "secondary"}
          ></Badge>
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-default-900">
            {profile?.fullName}
          </div>
          <span className="block truncate text-xs text-default-500">
            {profile.isTyping ? "Typing..." : isOnline ? "Active Now" : "Offline"}
          </span>
        </div>
      </div>
      <div className="hidden shrink-0 space-x-1 sm:flex sm:space-x-2 rtl:space-x-reverse">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon"
                className="bg-transparent rounded-full hover:bg-default-50"
              >
                <span className="text-xl text-primary">
                  <Icon icon="solar:phone-linear" />
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="end">
              <p>Start a voice call</p>
              <TooltipArrow className="fill-primary" />
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon"
                className="bg-transparent rounded-full hover:bg-default-50"
              >
                <span className="text-xl text-primary">
                  <Icon icon="mdi:video-outline" />
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="end">
              <p>Start a video call</p>
              <TooltipArrow className="fill-primary" />
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon"
                className={cn(
                  "bg-transparent hover:bg-default-50 rounded-full",
                  {
                    "text-primary": !showInfo,
                  }
                )}
                onClick={handleShowInfo}
              >
                <span className="text-xl text-primary ">
                  {showInfo ? (
                    <Icon icon="material-symbols:info" />
                  ) : (
                    <Icon icon="material-symbols:info-outline" />
                  )}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="end">
              <p>Conversation information</p>
              <TooltipArrow className="fill-primary" />
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default MessageHeader;
