import { z } from "zod";

export const tripExecutionStatusSchema = z.enum([
  "driver_accepted",
  "driver_arrived",
  "passenger_onboard",
  "trip_started",
  "completed",
]);

export const tripCustomerSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string(),
  email: z.string(),
});

export const tripRouteSchema = z.object({
  pickupAddress: z.string(),
  dropoffAddress: z.string(),
  pickupDate: z.string(),
  pickupTime: z.string(),
  distance: z.number(),
  durationMinutes: z.number().optional(),
  estimatedArrival: z.string().optional(),
  airportPickup: z.boolean(),
});

export const tripVehicleSchema = z.object({
  categoryId: z.string(),
  categoryName: z.string(),
  passengers: z.number(),
  luggage: z.number(),
});

export const tripTimestampsSchema = z.object({
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  driverArrivedAt: z.string().optional(),
  passengerBoardedAt: z.string().optional(),
  actualPickupTime: z.string().optional(),
  actualDropoffTime: z.string().optional(),
});

export const tripSummarySchema = z.object({
  id: z.string(),
  bookingNumber: z.string(),
  status: z.string(),
  category: z.string(),
  customer: tripCustomerSchema,
  route: tripRouteSchema,
  vehicle: tripVehicleSchema,
  trip: tripTimestampsSchema,
  assignmentStatus: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const tripsResponseSchema = z.object({
  items: z.array(tripSummarySchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export const tripTimelineEntrySchema = z.object({
  event: z.string(),
  at: z.string(),
  metadata: z.record(z.unknown()).optional(),
});

export const tripAssignmentSchema = z.object({
  id: z.string(),
  assignmentNumber: z.string(),
  bookingId: z.string(),
  bookingNumber: z.string(),
  driverId: z.string(),
  driverUserId: z.string(),
  assignedBy: z.string(),
  status: z.string(),
  assignedAt: z.string(),
  acceptedAt: z.string().optional(),
  rejectedAt: z.string().optional(),
  expiredAt: z.string().optional(),
  completedAt: z.string().optional(),
  rejectReason: z.string().optional(),
  adminNotes: z.string().optional(),
  expiresAt: z.string().optional(),
  chatConversationId: z.string().nullable().optional(),
  callSessionId: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const tripDriverSchema = z.object({
  id: z.string(),
  applicationNumber: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  phone: z.string(),
  carType: z.string(),
  licensePlate: z.string(),
  status: z.string(),
});

export const tripFlightSchema = z.object({
  required: z.boolean(),
  flightNumber: z.string().optional(),
  terminal: z.string().optional(),
});

export const adminTripDetailSchema = z.object({
  booking: z.object({
    id: z.string(),
    bookingNumber: z.string(),
    status: z.string(),
    category: z.string(),
    notes: z.string().optional(),
    trip: tripTimestampsSchema,
  }),
  customer: tripCustomerSchema,
  route: tripRouteSchema,
  vehicle: tripVehicleSchema,
  flight: tripFlightSchema,
  assignment: tripAssignmentSchema,
  driver: tripDriverSchema,
  timeline: z.array(tripTimelineEntrySchema),
});

export const getTripsParamsSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  status: tripExecutionStatusSchema.optional(),
  driver: z.string().optional(),
  date: z.string().optional(),
  search: z.string().optional(),
  sort: z.string().optional(),
});

export type TripExecutionStatus = z.infer<typeof tripExecutionStatusSchema>;
export type TripSummary = z.infer<typeof tripSummarySchema>;
export type TripsResponse = z.infer<typeof tripsResponseSchema>;
export type AdminTripDetail = z.infer<typeof adminTripDetailSchema>;
export type GetTripsParams = z.infer<typeof getTripsParamsSchema>;
