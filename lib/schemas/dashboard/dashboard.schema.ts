import { z } from "zod";

export const adminDashboardOverviewSchema = z.object({
  totals: z.object({
    revenue: z.number(),
    users: z.number(),
    drivers: z.number(),
    completedBookings: z.number(),
  }),
  series: z.object({
    revenue: z.array(z.number()),
    users: z.array(z.number()),
    drivers: z.array(z.number()),
    completedBookings: z.array(z.number()),
  }),
  payments: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      reference: z.string(),
      amount: z.number(),
      currency: z.string(),
      status: z.string(),
      createdAt: z.string(),
    })
  ),
  recentOrders: z.array(
    z.object({
      id: z.string(),
      bookingNumber: z.string(),
      customerName: z.string(),
      date: z.string(),
      amount: z.number(),
      paymentStatus: z.string(),
      status: z.string(),
    })
  ),
});

export type AdminDashboardOverview = z.infer<typeof adminDashboardOverviewSchema>;
