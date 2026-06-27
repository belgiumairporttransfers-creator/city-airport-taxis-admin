import { z } from "zod";

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, { message: "Current password is required." }),
  newPassword: z
    .string()
    .min(4, { message: "Your password must be at least 4 characters." }),
});

export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;
