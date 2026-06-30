import { z } from "zod";
import { bookingCustomerSchema } from "../booking/booking.schema";

export const paymentStatusSchema = z.enum([
  "pending",
  "paid",
  "failed",
  "cancelled",
  "expired",
  "refunded",
  "partially_refunded",
]);

export const paymentSchema = z.object({
  id: z.string(),
  bookingId: z.string(),
  status: paymentStatusSchema,
  amount: z.number(),
  currency: z.string(),
  transactionId: z.string().optional(),
  providerPaymentId: z.string().optional(),
  cardLastDigits: z.string().optional(),
  paidAt: z.string().optional(),
  refundedAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  bookingNumber: z.string().optional(),
  customer: bookingCustomerSchema,
  method: z.string(),
});

export const paymentsResponseSchema = z.object({
  items: z.array(paymentSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export const getPaymentsParamsSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  search: z.string().optional(),
  status: paymentStatusSchema.optional(),
  sort: z.string().optional(),
});

export type PaymentStatus = z.infer<typeof paymentStatusSchema>;
export type Payment = z.infer<typeof paymentSchema>;
export type PaymentsResponse = z.infer<typeof paymentsResponseSchema>;
export type GetPaymentsParams = z.infer<typeof getPaymentsParamsSchema>;
