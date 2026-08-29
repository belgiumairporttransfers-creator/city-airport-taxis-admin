"use client";

import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { WalletTransaction } from "@/lib/schemas";
import { formatDate, formatPrice, formatTime } from "@/lib/utils";

const transactionTypeLabels: Record<string, string> = {
  trip_earning: "Trip Earning",
  withdrawal: "Withdrawal",
  adjustment: "Adjustment",
};

const transactionStatusClasses: Record<string, string> = {
  completed: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  failed: "bg-destructive/10 text-destructive",
};

type DriverWalletTransactionsTableProps = {
  transactions: WalletTransaction[];
  loading?: boolean;
};

const DriverWalletTransactionsTable = ({
  transactions,
  loading = false,
}: DriverWalletTransactionsTableProps) => {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead>Booking</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center text-default-500">
                Loading transactions...
              </TableCell>
            </TableRow>
          ) : transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center text-default-500">
                No wallet transactions yet.
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => {
              const isCredit = transaction.direction === "credit";

              return (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium text-default-900">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${
                          isCredit
                            ? "bg-success/10 text-success"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {isCredit ? (
                          <ArrowDownLeft className="h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4" />
                        )}
                      </span>
                      <span>{transaction.description}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {transaction.bookingNumber ? (
                      <Link
                        href={`/trips/${transaction.bookingNumber}`}
                        className="font-semibold text-primary hover:underline"
                      >
                        {transaction.bookingNumber}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-default-600">
                    {transactionTypeLabels[transaction.type] ?? transaction.type}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                        transactionStatusClasses[transaction.status] ??
                        "bg-default-100 text-default-600"
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-default-600">
                    {formatDate(transaction.createdAt)} {formatTime(transaction.createdAt)}
                  </TableCell>
                  <TableCell
                    className={`text-right font-semibold ${
                      isCredit ? "text-success" : "text-destructive"
                    }`}
                  >
                    {isCredit ? "+" : "-"}
                    {formatPrice(transaction.amount)}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default DriverWalletTransactionsTable;
