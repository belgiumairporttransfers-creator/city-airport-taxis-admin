"use client";

import DriverPayoutsPageView from "../components/driver-payouts-page-view";

const RequestedPayoutsPage = () => {
  return (
    <DriverPayoutsPageView
      status="pending"
      title="Requested Payouts"
      description="Review and approve or reject payout requests from all drivers."
    />
  );
};

export default RequestedPayoutsPage;
