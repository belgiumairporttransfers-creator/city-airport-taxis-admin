"use client";

import { AUTH_ME_QUERY_KEY, useAuthMe } from "@/hooks/queries/use-auth";
import LayoutLoader from "@/components/layout-loader";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { isLoading, isError, isSuccess } = useAuthMe();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (!isError || hasRedirected.current) {
      return;
    }

    hasRedirected.current = true;
    queryClient.removeQueries({ queryKey: AUTH_ME_QUERY_KEY });

    const callbackUrl = encodeURIComponent(pathname);
    window.location.replace(`/auth/login?callbackUrl=${callbackUrl}`);
  }, [isError, pathname, queryClient]);

  if (isLoading || isError || !isSuccess) {
    return <LayoutLoader />;
  }

  return <>{children}</>;
};

export default AuthGuard;
