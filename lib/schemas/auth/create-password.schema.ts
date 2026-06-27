import { z } from "zod";

export const createPasswordSchema = z.object({
  password: z
    .string()
    .min(4, { message: "Your password must be at least 4 characters." }),
  confirmPassword: z
    .string()
    .min(4, { message: "Your password must be at least 4 characters." }),
});

export type CreatePasswordSchema = z.infer<typeof createPasswordSchema>;
