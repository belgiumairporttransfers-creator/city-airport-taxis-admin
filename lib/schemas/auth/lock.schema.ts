import { z } from "zod";

export const lockSchema = z.object({
  password: z.string().min(4),
});

export type LockSchema = z.infer<typeof lockSchema>;
