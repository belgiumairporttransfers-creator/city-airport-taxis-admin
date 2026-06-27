import { z } from "zod";

export const resetPasswordSchema = z.object({
  token: z.string().min(1, { message: "Reset token is required." }),
  password: z
    .string()
    .min(4, { message: "Your password must be at least 4 characters." }),
});

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
