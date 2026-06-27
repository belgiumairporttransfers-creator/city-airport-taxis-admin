"use client";

import { useParams } from "next/navigation";
import LayoutLoader from "@/components/layout-loader";
import { useDriver } from "@/hooks/queries/use-drivers";
import Header from "./components/header";

const DriverProfileLayout = ({ children }: { children: React.ReactNode }) => {
  const params = useParams<{ id: string }>();
  const { data, isLoading, isError } = useDriver(params.id);

  return (
    <>
      <Header />
      {isLoading ? (
        <LayoutLoader />
      ) : isError || !data ? (
        <p className="text-destructive">Driver application not found.</p>
      ) : (
        <div className="relative z-10 pt-4">{children}</div>
      )}
    </>
  );
};

export default DriverProfileLayout;
