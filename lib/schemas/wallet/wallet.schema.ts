import { z } from "zod";

export const walletTransactionSchema = z.object({
  id: z.string(),
  bookingId: z.string().optional(),
  bookingNumber: z.string().optional(),
  type: z.string(),
  direction: z.string(),
  status: z.string(),
  grossAmount: z.number(),
  commissionPercent: z.number(),
  amount: z.number(),
  currency: z.string(),
  description: z.string(),
  requestNote: z.string().optional(),
  adminNotes: z.string().optional(),
  processedAt: z.string().optional(),
  processedBy: z.string().optional(),
  createdAt: z.string(),
});

export const driverWalletSummarySchema = z.object({
  currency: z.string(),
  availableBalance: z.number(),
  totalEarned: z.number(),
  totalPaidOut: z.number().optional().default(0),
  totalTrips: z.number(),
  commissionPercent: z.number(),
  todayEarned: z.number().optional().default(0),
  thisMonthEarned: z.number(),
  lastMonthEarned: z.number(),
  pendingPayouts: z.number().optional().default(0),
  spendableBalance: z.number().optional().default(0),
  recentTransactions: z.array(walletTransactionSchema),
});

export const walletTransactionsResponseSchema = z.object({
  items: z.array(walletTransactionSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNextPage: z.boolean().optional(),
    hasPrevPage: z.boolean().optional(),
  }),
});

export const adminPayoutDriverSchema = z.object({
  id: z.string(),
  applicationNumber: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  phone: z.string(),
});

export const adminPayoutSchema = walletTransactionSchema.extend({
  driverId: z.string(),
  driver: adminPayoutDriverSchema.optional(),
});

export const adminPayoutsResponseSchema = z.object({
  items: z.array(adminPayoutSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNextPage: z.boolean().optional(),
    hasPrevPage: z.boolean().optional(),
  }),
});

export const getWalletTransactionsParamsSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  sort: z.string().optional(),
});

export type WalletTransaction = z.infer<typeof walletTransactionSchema>;
export type DriverWalletSummary = z.infer<typeof driverWalletSummarySchema>;
export type WalletTransactionsResponse = z.infer<typeof walletTransactionsResponseSchema>;
export type AdminPayout = z.infer<typeof adminPayoutSchema>;
export type AdminPayoutsResponse = z.infer<typeof adminPayoutsResponseSchema>;
export type GetWalletTransactionsParams = z.infer<typeof getWalletTransactionsParamsSchema>;
