"use client";

import DriverPayoutsPageView from "../components/driver-payouts-page-view";

const CompletedPayoutsPage = () => {
  return (
    <DriverPayoutsPageView
      status="completed"
      title="Completed Payouts"
      description="All payouts that have been approved by admin across all drivers."
    />
  );
};

export default CompletedPayoutsPage;
