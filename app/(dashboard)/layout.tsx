import DashBoardLayoutProvider from "@/provider/dashboard.layout.provider";
import React, { Suspense } from "react";

export const dynamic = "force-dynamic";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Suspense>
      <DashBoardLayoutProvider>{children}</DashBoardLayoutProvider>
    </Suspense>
  );
};

export default layout;
