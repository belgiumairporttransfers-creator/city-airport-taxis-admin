import { z } from "zod";
import { updateProfileSchema } from "./update-profile.schema";

export const personalDetailsFormSchema = updateProfileSchema.extend({
  email: z.string().email(),
});

export type PersonalDetailsFormSchema = z.infer<typeof personalDetailsFormSchema>;

export const toUpdateProfilePayload = (
  values: PersonalDetailsFormSchema
): z.infer<typeof updateProfileSchema> => ({
  firstName: values.firstName,
  lastName: values.lastName,
  phoneNumber: values.phoneNumber?.trim() || undefined,
});
