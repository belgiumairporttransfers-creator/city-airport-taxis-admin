"use client";

import AuthGuard from "@/components/auth/auth-guard";
import Header from "@/components/partials/header";
import Sidebar from "@/components/partials/sidebar";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/store";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useMounted } from "@/hooks/use-mounted";
import LayoutLoader from "@/components/layout-loader";
import ScrollLockFix from "@/components/scroll-lock-fix";
import { Suspense } from "react";

const DashBoardLayoutProvider = ({ children }: { children: React.ReactNode }) => {
  const { collapsed } = useSidebar();
  const location = usePathname();
  const mounted = useMounted();

  if (!mounted) {
    return <LayoutLoader />;
  }

  return (
    <AuthGuard>
      <ScrollLockFix />
      <div className="min-h-screen overflow-x-clip bg-background">
        <Header />
        <Sidebar />

        <div
          className={cn(
            "content-wrapper min-h-screen bg-background transition-all duration-150 max-w-full",
            {
              "xl:ml-[300px]": !collapsed,
              "xl:ml-[72px]": collapsed,
            }
          )}
        >
          <div className={cn("layout-padding px-4 sm:px-6 pt-6 page-min-height max-w-full")}>
            <LayoutWrapper location={location}>{children}</LayoutWrapper>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default DashBoardLayoutProvider;

const LayoutWrapper = ({
  children,
  location,
}: {
  children: React.ReactNode;
  location: string;
}) => {
  return (
    <>
      <motion.div
        key={location}
        initial="pageInitial"
        animate="pageAnimate"
        exit="pageExit"
        variants={{
          pageInitial: {
            opacity: 0,
            y: 50,
          },
          pageAnimate: {
            opacity: 1,
            y: 0,
          },
          pageExit: {
            opacity: 0,
            y: -50,
          },
        }}
        transition={{
          type: "tween",
          ease: "easeInOut",
          duration: 0.5,
        }}
      >
        <main>
          <Suspense fallback={<LayoutLoader />}>{children}</Suspense>
        </main>
      </motion.div>
    </>
  );
};
