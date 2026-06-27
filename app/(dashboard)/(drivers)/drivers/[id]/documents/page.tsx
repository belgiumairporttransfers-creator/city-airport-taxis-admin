"use client";

import { useParams } from "next/navigation";
import { useDriver } from "@/hooks/queries/use-drivers";
import DriverDocuments from "../components/driver-documents";

const DriverProfileDocumentsPage = () => {
  const params = useParams<{ id: string }>();
  const { data } = useDriver(params.id);

  if (!data) {
    return null;
  }

  return <DriverDocuments driver={data} />;
};

export default DriverProfileDocumentsPage;
