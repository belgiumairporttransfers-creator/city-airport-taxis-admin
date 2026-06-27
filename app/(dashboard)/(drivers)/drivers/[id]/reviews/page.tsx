"use client";

import { useParams } from "next/navigation";
import { useDriver } from "@/hooks/queries/use-drivers";
import DriverReviews from "../components/driver-reviews";

const DriverProfileReviewsPage = () => {
  const params = useParams<{ id: string }>();
  const { data } = useDriver(params.id);

  if (!data) {
    return null;
  }

  return <DriverReviews reviews={data.reviews ?? []} />;
};

export default DriverProfileReviewsPage;
