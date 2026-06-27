import { z } from "zod";

export const adminProfileSchema = z.object({
  _id: z.string(),
  name: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phoneNumber: z.string().optional(),
  avatar: z.string().optional(),
  role: z.string(),
});

export type AdminProfile = z.infer<typeof adminProfileSchema>;
