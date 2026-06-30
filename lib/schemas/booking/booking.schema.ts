import { z } from "zod";

export const bookingStatusSchema = z.enum([
  "pending",
  "confirmed",
  "accepted",
  "complete",
  "cancelled",
]);

export const bookingPaymentStatusSchema = z.enum([
  "pending",
  "paid",
  "failed",
  "cancelled",
  "expired",
  "refunded",
  "partially_refunded",
]);

export const bookingCustomerSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string(),
  email: z.string(),
});

export const bookingRouteSchema = z.object({
  pickupAddress: z.string(),
  dropoffAddress: z.string(),
  pickupDate: z.string(),
  pickupTime: z.string(),
  distance: z.number(),
  durationMinutes: z.number().optional(),
  estimatedArrival: z.string().optional(),
  airportPickup: z.boolean(),
});

export const bookingVehicleSchema = z.object({
  categoryId: z.string(),
  categoryName: z.string(),
  passengers: z.number(),
  luggage: z.number(),
  handLuggage: z.number().optional(),
  smallCheckedCase: z.number().optional(),
  largeCheckedCase: z.number().optional(),
});

export const bookingPricingSchema = z.object({
  vehicleFare: z.number(),
  airportPickupFee: z.number(),
  total: z.number(),
});

export const bookingPaymentSchema = z.object({
  paymentMethod: z.string(),
  paymentStatus: z.string(),
  paymentId: z.string().optional(),
});

export const bookingTimelineEntrySchema = z.object({
  event: z.string(),
  at: z.string(),
  metadata: z.record(z.unknown()).optional(),
});

export const bookingAdminNoteSchema = z.object({
  id: z.string(),
  adminId: z.string(),
  message: z.string(),
  createdAt: z.string(),
});

export const bookingSchema = z.object({
  id: z.string(),
  bookingNumber: z.string(),
  status: bookingStatusSchema,
  category: z.string(),
  customer: bookingCustomerSchema,
  route: bookingRouteSchema,
  vehicle: bookingVehicleSchema,
  flight: z.object({
    required: z.boolean(),
    flightNumber: z.string().optional(),
    terminal: z.string().optional(),
  }),
  pricing: bookingPricingSchema,
  payment: bookingPaymentSchema,
  driver: z.object({
    driverId: z.string().optional(),
    assignedAt: z.string().optional(),
    acceptedAt: z.string().optional(),
  }),
  timeline: z.array(bookingTimelineEntrySchema),
  notes: z.string().optional(),
  adminNotes: z.array(bookingAdminNoteSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const bookingPaymentRecordSchema = z.object({
  id: z.string(),
  status: z.string(),
  amount: z.number(),
  currency: z.string(),
  transactionId: z.string().optional(),
  providerPaymentId: z.string().optional(),
  cardLastDigits: z.string().optional(),
  paidAt: z.string().optional(),
  createdAt: z.string(),
});

export const bookingDetailSchema = bookingSchema.extend({
  paymentRecord: bookingPaymentRecordSchema.optional(),
});

export const bookingsResponseSchema = z.object({
  items: z.array(bookingSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export const getBookingsParamsSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  search: z.string().optional(),
  status: bookingStatusSchema.optional(),
  paymentStatus: bookingPaymentStatusSchema.optional(),
  sort: z.string().optional(),
});

export type BookingStatus = z.infer<typeof bookingStatusSchema>;
export type BookingPaymentStatus = z.infer<typeof bookingPaymentStatusSchema>;
export type Booking = z.infer<typeof bookingSchema>;
export type BookingDetail = z.infer<typeof bookingDetailSchema>;
export type BookingsResponse = z.infer<typeof bookingsResponseSchema>;
export type GetBookingsParams = z.infer<typeof getBookingsParamsSchema>;
