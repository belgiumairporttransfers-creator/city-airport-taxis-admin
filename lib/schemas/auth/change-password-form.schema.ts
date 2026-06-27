import { z } from "zod";
import { changePasswordSchema } from "./change-password.schema";

export const changePasswordFormSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "Current password is required." }),
    newPassword: z
      .string()
      .min(4, { message: "Your password must be at least 4 characters." }),
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your password." }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "New password must be different from the current password.",
    path: ["newPassword"],
  });

export type ChangePasswordFormSchema = z.infer<typeof changePasswordFormSchema>;

export const toChangePasswordPayload = (
  values: ChangePasswordFormSchema
): z.infer<typeof changePasswordSchema> => ({
  oldPassword: values.currentPassword,
  newPassword: values.newPassword,
});
