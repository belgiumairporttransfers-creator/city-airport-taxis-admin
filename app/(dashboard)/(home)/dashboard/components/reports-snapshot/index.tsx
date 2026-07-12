"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReportsChart from "./reports-chart";
import { useThemeStore } from "@/store";
import { useTheme } from "next-themes";
import { themes } from "@/config/thems";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn, formatPrice } from "@/lib/utils";
import { useAdminDashboard } from "@/hooks/queries/use-dashboard";

const EMPTY_SERIES = [{ data: Array.from({ length: 10 }, () => 0) }];

const formatCount = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

const ReportsSnapshot = () => {
  const { data, isLoading } = useAdminDashboard();
  const { theme: config } = useThemeStore();
  const { theme: mode } = useTheme();
  const theme = themes.find((theme) => theme.name === config);

  const primary = `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].primary})`;
  const warning = `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].warning})`;
  const success = `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].success})`;
  const info = `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].info})`;

  const totals = data?.totals;
  const series = data?.series;

  const tabsTrigger = [
    {
      value: "revenue",
      text: "Total Amount",
      total: isLoading ? "…" : formatPrice(totals?.revenue ?? 0),
      color: "primary",
    },
    {
      value: "users",
      text: "Total Users",
      total: isLoading ? "…" : formatCount(totals?.users ?? 0),
      color: "warning",
    },
    {
      value: "drivers",
      text: "Total Drivers",
      total: isLoading ? "…" : formatCount(totals?.drivers ?? 0),
      color: "success",
    },
    {
      value: "bookings",
      text: "Completed Bookings",
      total: isLoading ? "…" : formatCount(totals?.completedBookings ?? 0),
      color: "info",
    },
  ];

  const tabsContentData = [
    {
      value: "revenue",
      series: series?.revenue ? [{ data: series.revenue }] : EMPTY_SERIES,
      color: primary,
    },
    {
      value: "users",
      series: series?.users ? [{ data: series.users }] : EMPTY_SERIES,
      color: warning,
    },
    {
      value: "drivers",
      series: series?.drivers ? [{ data: series.drivers }] : EMPTY_SERIES,
      color: success,
    },
    {
      value: "bookings",
      series: series?.completedBookings
        ? [{ data: series.completedBookings }]
        : EMPTY_SERIES,
      color: info,
    },
  ];

  return (
    <Card>
      <CardHeader className="border-none pb-0">
        <div className="text-xl font-semibold text-default-900 whitespace-nowrap">
          Reports Snapshot
        </div>
        <span className="text-xs text-default-600">
          Overview of revenue, users, drivers, and completed bookings
        </span>
      </CardHeader>
      <CardContent className="p-1 md:p-5">
        <Tabs defaultValue="revenue">
          <TabsList className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6 justify-start w-full bg-transparent h-full">
            {tabsTrigger.map((item, index) => (
              <TabsTrigger
                key={`report-trigger-${index}`}
                value={item.value}
                className={cn(
                  "flex flex-col gap-1.5 p-4 overflow-hidden   items-start  relative before:absolute before:left-1/2 before:-translate-x-1/2 before:bottom-1 before:h-[2px] before:w-9 before:bg-primary/50 dark:before:bg-primary-foreground before:hidden data-[state=active]:shadow-none data-[state=active]:before:block",
                  {
                    "bg-primary/30 data-[state=active]:bg-primary/50 dark:bg-primary/70": item.color === "primary",
                    "bg-warning/30 data-[state=active]:bg-warning/50 dark:bg-orange-500": item.color === "warning",
                    "bg-success/30 data-[state=active]:bg-success/50 dark:bg-green-500": item.color === "success",
                    "bg-info/30 data-[state=active]:bg-info/50 dark:bg-cyan-500 ": item.color === "info",
                  }
                )}
              >
                <span
                  className={cn(
                    "h-10 w-10 rounded-full bg-primary/40 absolute -top-3 -right-3 ring-8 ring-primary/30",
                    {
                      "bg-primary/50  ring-primary/20 dark:bg-primary dark:ring-primary/40": item.color === "primary",
                      "bg-orange-200 ring-orange-100 dark:bg-orange-300 dark:ring-orange-400": item.color === "warning",
                      "bg-green-200 ring-green-100 dark:bg-green-300 dark:ring-green-400": item.color === "success",
                      "bg-cyan-200 ring-cyan-100 dark:bg-cyan-300 dark:ring-cyan-400": item.color === "info",
                    }
                  )}
                ></span>
                <span className="text-sm text-default-800 dark:text-primary-foreground font-semibold capitalize relative z-10">
                  {item.text}
                </span>
                <span className={`text-lg font-semibold text-${item.color}/80 dark:text-primary-foreground`}>
                  {item.total}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
          {tabsContentData.map((item, index) => (
            <TabsContent key={`report-tab-${index}`} value={item.value}>
              <ReportsChart series={item.series} chartColor={item.color} />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ReportsSnapshot;
