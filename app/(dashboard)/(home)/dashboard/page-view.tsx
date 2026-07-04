"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReportsSnapshot from "./components/reports-snapshot";
import UserDeviceReport from "./components/user-device-report";
import UserStats from "./components/user-stats-chart";
import UsersStat from "./components/users-stat";
import ReportsArea from "./components/reports-area";
import Transaction from "./components/transaction";
import Orders from "./components/orders";
import OperationsOverview from "./components/operations-overview";
import { ScrollArea } from "@/components/ui/scroll-area";

const DashboardPageView = () => {
  return (
    <div className="space-y-6">
      <div className="text-2xl font-medium text-default-800">
        Analytics Dashboard
      </div>
      {/* <OperationsOverview /> */}
      {/* reports area */}
      <div className="grid grid-cols-12  gap-6 ">
        <div className="col-span-12 lg:col-span-8">
          <ReportsSnapshot />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <UsersStat />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ReportsArea />
        </div> */}
        {/* <Card>
          <CardHeader className="border-none p-6 pt-5 mb-0">
            <CardTitle className="text-lg font-semibold text-default-900 p-0">
              New vs Returning Visitors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UserStats />
          </CardContent>
        </Card> */}
        {/* <Card>
          <CardHeader className="border-none p-6 pt-5 mb-0">
            <CardTitle className="text-lg font-semibold text-default-900 p-0">
              Device Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="dashtail-legend">
              <UserDeviceReport />
            </div>
          </CardContent>
        </Card> */}
      </div>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4">
          <Card>
            <CardHeader className="flex-row justify-between items-center gap-4 mb-0 border-none p-6 pb-4">
              <CardTitle className="whitespace-nowrap">
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pt-0 h-[580px] pb-0">
              <ScrollArea className="h-full">
                <Transaction />
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
        <div className="col-span-12 lg:col-span-8">
          <Orders />
        </div>
      </div>
    </div>
  );
};

export default DashboardPageView;
