"use client";

import { cn } from "@/lib/utils";
import ThemeButton from "./theme-button";
import { useSidebar } from "@/store";
import ProfileInfo from "./profile-info";
import VerticalHeader from "./vertical-header";
import ChatInboxDropdown from "@/lib/chat/chat-inbox-dropdown";
import NotificationMessage from "./notification-message";
import { useMediaQuery } from "@/hooks/use-media-query";
import ClassicHeader from "./layout/classic-header";
import FullScreen from "./full-screen";

const NavTools = ({ isDesktop }: { isDesktop: boolean }) => {
  return (
    <div className="nav-tools flex max-w-[calc(100%-2.5rem)] shrink items-center justify-end gap-0.5 sm:gap-1.5">
      {isDesktop && <FullScreen />}

      <ThemeButton />
      <ChatInboxDropdown />
      <NotificationMessage />
      <ProfileInfo />
    </div>
  );
};

const Header = () => {
  const { collapsed } = useSidebar();
  const isDesktop = useMediaQuery("(min-width: 1280px)");

  return (
    <ClassicHeader
      className={cn(
        "sticky inset-x-0 top-0 z-50 w-full max-w-full",
        {
          "xl:ml-[300px] xl:w-[calc(100%-300px)]": !collapsed,
          "xl:ml-[72px] xl:w-[calc(100%-72px)]": collapsed,
        }
      )}
    >
      <div className="w-full max-w-full overflow-hidden border-b border-border bg-card/90 px-2 py-2.5 backdrop-blur-lg sm:px-4 md:px-6 md:py-3">
        <div className="flex min-w-0 items-center justify-between gap-1 sm:gap-2">
          <VerticalHeader />
          <NavTools isDesktop={isDesktop} />
        </div>
      </div>
    </ClassicHeader>
  );
};

export default Header;
