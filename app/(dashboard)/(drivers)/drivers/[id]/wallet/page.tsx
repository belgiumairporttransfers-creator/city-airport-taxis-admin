"use client";

import React from "react";
import { useParams } from "next/navigation";
import {
  Banknote,
  CalendarDays,
  Car,
  PiggyBank,
  TrendingUp,
  Wallet,
} from "lucide-react";
import LayoutLoader from "@/components/layout-loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useApproveDriverPayout,
  useDriverWallet,
  useDriverWalletPayouts,
  useDriverWalletTransactions,
  useRejectDriverPayout,
} from "@/hooks/queries/use-driver-wallet";
import { useTrips } from "@/hooks/queries/use-trips";
import { formatDate, formatPrice, formatTime } from "@/lib/utils";
import DriverTripsTable from "../components/driver-trips-table";
import DriverWalletTransactionsTable from "../components/driver-wallet-transactions-table";

const SummaryCard = ({
  title,
  value,
  hint,
  icon: Icon,
}: {
  title: string;
  value: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
}) => (
  <Card>
    <CardContent className="flex items-start justify-between gap-4 p-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-default-500">{title}</p>
        <p className="mt-2 text-2xl font-bold text-default-900">{value}</p>
        <p className="mt-1 text-xs text-default-500">{hint}</p>
      </div>
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
    </CardContent>
  </Card>
);

const payoutStatusClasses: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  completed: "bg-success/10 text-success",
  failed: "bg-destructive/10 text-destructive",
};

const DriverProfileWalletPage = () => {
  const params = useParams<{ id: string }>();
  const driverId = params.id;

  const [txPage, setTxPage] = React.useState(1);
  const [tripsPage, setTripsPage] = React.useState(1);
  const [payoutPage, setPayoutPage] = React.useState(1);
  const [actingId, setActingId] = React.useState<string | null>(null);
  const txLimit = 10;
  const tripsLimit = 10;

  const { data: summary, isLoading, isError } = useDriverWallet(driverId);
  const {
    data: transactions,
    isLoading: transactionsLoading,
    isFetching: transactionsFetching,
  } = useDriverWalletTransactions(driverId, { page: txPage, limit: txLimit });
  const {
    data: payouts,
    isLoading: payoutsLoading,
    isFetching: payoutsFetching,
  } = useDriverWalletPayouts(driverId, { page: payoutPage, limit: txLimit });
  const {
    data: trips,
    isLoading: tripsLoading,
    isFetching: tripsFetching,
  } = useTrips({
    page: tripsPage,
    limit: tripsLimit,
    driver: driverId,
    sort: "-updatedAt",
  });

  const approvePayout = useApproveDriverPayout(driverId);
  const rejectPayout = useRejectDriverPayout(driverId);

  if (isLoading) {
    return <LayoutLoader />;
  }

  if (isError || !summary) {
    return <p className="text-destructive">Unable to load driver wallet.</p>;
  }

  const txTotalPages = transactions?.meta.totalPages ?? 1;
  const tripsTotalPages = trips?.meta.totalPages ?? 1;
  const payoutTotalPages = payouts?.meta.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-default-900">Driver Wallet</h2>
        <p className="mt-1 text-sm text-default-500">
          Full wallet balance, payouts, earnings ledger, and trips. Platform commission is{" "}
          {summary.commissionPercent}% on card trips.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          title="Available Balance"
          value={formatPrice(summary.availableBalance)}
          hint={
            (summary.pendingPayouts ?? 0) > 0
              ? `Pending payouts: ${formatPrice(summary.pendingPayouts ?? 0)}`
              : "Current wallet balance"
          }
          icon={Wallet}
        />
        <SummaryCard
          title="Today Earned"
          value={formatPrice(summary.todayEarned ?? 0)}
          hint="Credits from trips completed today"
          icon={CalendarDays}
        />
        <SummaryCard
          title="Total Earned"
          value={formatPrice(summary.totalEarned)}
          hint="All-time trip earnings"
          icon={PiggyBank}
        />
        <SummaryCard
          title="Total Paid Out"
          value={formatPrice(summary.totalPaidOut ?? 0)}
          hint="Approved payouts to date"
          icon={Banknote}
        />
        <SummaryCard
          title="This Month"
          value={formatPrice(summary.thisMonthEarned)}
          hint={`Last month: ${formatPrice(summary.lastMonthEarned)}`}
          icon={TrendingUp}
        />
        <SummaryCard
          title="Completed Trips"
          value={String(summary.totalTrips)}
          hint="Trips credited to wallet"
          icon={Car}
        />
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border px-5 py-4">
          <CardTitle className="text-lg font-semibold text-default-900">
            Transaction History
          </CardTitle>
          <p className="mt-0.5 text-xs text-default-500">
            Complete wallet ledger for this driver.
          </p>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          <DriverWalletTransactionsTable
            transactions={transactions?.items ?? []}
            loading={transactionsLoading || transactionsFetching}
          />

          {txTotalPages > 1 ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-default-500">
                Page {txPage} of {txTotalPages} · {transactions?.meta.total ?? 0} total
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={txPage <= 1 || transactionsLoading}
                  onClick={() => setTxPage((current) => Math.max(1, current - 1))}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={txPage >= txTotalPages || transactionsLoading}
                  onClick={() => setTxPage((current) => current + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border px-5 py-4">
          <CardTitle className="text-lg font-semibold text-default-900">Driver Trips</CardTitle>
          <p className="mt-0.5 text-xs text-default-500">
            Active and completed trips assigned to this driver.
          </p>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          <DriverTripsTable
            trips={trips?.items ?? []}
            loading={tripsLoading || tripsFetching}
          />

          {tripsTotalPages > 1 ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-default-500">
                Page {tripsPage} of {tripsTotalPages} · {trips?.meta.total ?? 0} total
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={tripsPage <= 1 || tripsLoading}
                  onClick={() => setTripsPage((current) => Math.max(1, current - 1))}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={tripsPage >= tripsTotalPages || tripsLoading}
                  onClick={() => setTripsPage((current) => current + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border px-5 py-4">
          <CardTitle className="text-lg font-semibold text-default-900">Payouts</CardTitle>
          <p className="mt-0.5 text-xs text-default-500">
            Review and approve or reject driver payout requests.
          </p>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-default-50 text-left">
                  <th className="px-4 py-3 font-medium text-default-600">Amount</th>
                  <th className="px-4 py-3 font-medium text-default-600">Status</th>
                  <th className="px-4 py-3 font-medium text-default-600">Requested</th>
                  <th className="px-4 py-3 font-medium text-default-600">Note</th>
                  <th className="px-4 py-3 text-right font-medium text-default-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payoutsLoading || payoutsFetching ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-default-500">
                      Loading payouts...
                    </td>
                  </tr>
                ) : (payouts?.items.length ?? 0) === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-default-500">
                      No payout requests yet.
                    </td>
                  </tr>
                ) : (
                  payouts?.items.map((payout) => {
                    const isPending = payout.status === "pending";
                    const isActing = actingId === payout.id;

                    return (
                      <tr key={payout.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 font-semibold text-default-900">
                          {formatPrice(payout.amount)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                              payoutStatusClasses[payout.status] ??
                              "bg-default-100 text-default-600"
                            }`}
                          >
                            {payout.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-default-600">
                          {formatDate(payout.createdAt)} {formatTime(payout.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-default-600">
                          {payout.requestNote || payout.adminNotes || "—"}
                        </td>
                        <td className="px-4 py-3">
                          {isPending ? (
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={isActing}
                                onClick={() => {
                                  setActingId(payout.id);
                                  rejectPayout.mutate(
                                    { driverId, transactionId: payout.id },
                                    { onSettled: () => setActingId(null) }
                                  );
                                }}
                              >
                                Reject
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                disabled={isActing}
                                onClick={() => {
                                  setActingId(payout.id);
                                  approvePayout.mutate(
                                    { driverId, transactionId: payout.id },
                                    { onSettled: () => setActingId(null) }
                                  );
                                }}
                              >
                                {isActing ? "…" : "Approve"}
                              </Button>
                            </div>
                          ) : (
                            <p className="text-right text-xs text-default-500">—</p>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {payoutTotalPages > 1 ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-default-500">
                Page {payoutPage} of {payoutTotalPages} · {payouts?.meta.total ?? 0} total
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={payoutPage <= 1 || payoutsLoading}
                  onClick={() => setPayoutPage((current) => Math.max(1, current - 1))}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={payoutPage >= payoutTotalPages || payoutsLoading}
                  onClick={() => setPayoutPage((current) => current + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverProfileWalletPage;
