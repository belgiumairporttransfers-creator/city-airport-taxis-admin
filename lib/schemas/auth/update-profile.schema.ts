import { z } from "zod";

export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1, { message: "First name is required." }).max(80),
  lastName: z.string().trim().min(1, { message: "Last name is required." }).max(80),
  phoneNumber: z.string().trim().max(30).optional(),
  avatar: z.string().trim().max(2048).optional(),
});

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;
