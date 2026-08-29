import { z } from "zod";

export const assignmentSchema = z.object({
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
  expiresAt: z.string().optional(),
  adminNotes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createAssignmentPayloadSchema = z.object({
  bookingId: z.string().min(1),
  driverId: z.string().min(1, "Select a driver"),
  adminNotes: z.string().max(2000).optional(),
});

export type Assignment = z.infer<typeof assignmentSchema>;
export type CreateAssignmentPayload = z.infer<typeof createAssignmentPayloadSchema>;
