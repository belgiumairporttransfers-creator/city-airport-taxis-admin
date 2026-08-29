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
  returnDate: z.string().optional(),
  returnTime: z.string().optional(),
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

export const updateBookingFormSchema = z.object({
  customerFirstName: z.string().trim().min(1, "First name is required").max(100),
  customerLastName: z.string().trim().min(1, "Last name is required").max(100),
  customerEmail: z.string().trim().email("Valid email is required").max(255),
  customerPhone: z.string().trim().min(5, "Phone is required").max(30),
  pickupAddress: z.string().trim().min(3, "Pickup address is required").max(500),
  dropoffAddress: z.string().trim().max(500).optional(),
  pickupDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Pickup date must be YYYY-MM-DD"),
  pickupTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Pickup time must be HH:mm"),
  returnDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Return date must be YYYY-MM-DD")
    .or(z.literal(""))
    .optional(),
  returnTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Return time must be HH:mm")
    .or(z.literal(""))
    .optional(),
  notes: z.string().max(2000).optional(),
  flightNumber: z.string().max(20).optional(),
  terminal: z.string().max(50).optional(),
  passengers: z.coerce.number().int().min(1).max(20),
  luggage: z.coerce.number().int().min(0).max(20),
  handLuggage: z.coerce.number().int().min(0).max(20),
  smallCheckedCase: z.coerce.number().int().min(0).max(20),
  largeCheckedCase: z.coerce.number().int().min(0).max(20),
  adminNote: z.string().max(5000).optional(),
});

export type UpdateBookingFormSchema = z.infer<typeof updateBookingFormSchema>;

export type UpdateBookingPayload = {
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone: string;
  pickupAddress: string;
  dropoffAddress?: string;
  pickupDate: string;
  pickupTime: string;
  returnDate?: string;
  returnTime?: string;
  notes?: string;
  flightNumber?: string;
  terminal?: string;
  passengers: number;
  luggage: number;
  handLuggage: number;
  smallCheckedCase: number;
  largeCheckedCase: number;
  adminNote?: string;
};

export const toUpdateBookingPayload = (
  values: UpdateBookingFormSchema
): UpdateBookingPayload => ({
  customerFirstName: values.customerFirstName.trim(),
  customerLastName: values.customerLastName.trim(),
  customerEmail: values.customerEmail.trim(),
  customerPhone: values.customerPhone.trim(),
  pickupAddress: values.pickupAddress.trim(),
  dropoffAddress: values.dropoffAddress?.trim() || "",
  pickupDate: values.pickupDate,
  pickupTime: values.pickupTime,
  returnDate: values.returnDate || "",
  returnTime: values.returnTime || "",
  notes: values.notes?.trim() || "",
  flightNumber: values.flightNumber?.trim() || "",
  terminal: values.terminal?.trim() || "",
  passengers: values.passengers,
  luggage: values.luggage,
  handLuggage: values.handLuggage,
  smallCheckedCase: values.smallCheckedCase,
  largeCheckedCase: values.largeCheckedCase,
  ...(values.adminNote?.trim() ? { adminNote: values.adminNote.trim() } : {}),
});

export const fromBookingDetailToUpdateForm = (
  booking: BookingDetail
): UpdateBookingFormSchema => ({
  customerFirstName: booking.customer.firstName,
  customerLastName: booking.customer.lastName,
  customerEmail: booking.customer.email,
  customerPhone: booking.customer.phone,
  pickupAddress: booking.route.pickupAddress,
  dropoffAddress: booking.route.dropoffAddress ?? "",
  pickupDate: booking.route.pickupDate,
  pickupTime: booking.route.pickupTime,
  returnDate: booking.route.returnDate ?? "",
  returnTime: booking.route.returnTime ?? "",
  notes: booking.notes ?? "",
  flightNumber: booking.flight.flightNumber ?? "",
  terminal: booking.flight.terminal ?? "",
  passengers: booking.vehicle.passengers,
  luggage: booking.vehicle.luggage,
  handLuggage: booking.vehicle.handLuggage ?? 0,
  smallCheckedCase: booking.vehicle.smallCheckedCase ?? 0,
  largeCheckedCase: booking.vehicle.largeCheckedCase ?? 0,
  adminNote: "",
});
