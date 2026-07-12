"use client";

import ReportsSnapshot from "./components/reports-snapshot";
import Transaction from "./components/transaction";
import Orders from "./components/orders";

const DashboardPageView = () => {
  return (
    <div className="space-y-6">
      <div className="text-2xl font-medium text-default-800">
        Analytics Dashboard
      </div>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12">
          <ReportsSnapshot />
        </div>
      </div>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-6">
          <Transaction />
        </div>
        <div className="col-span-12 lg:col-span-6">
          <Orders />
        </div>
      </div>
    </div>
  );
};

export default DashboardPageView;
