import { z } from "zod";
import {
  DRIVER_DOCUMENT_FIELDS,
  driverShiftTypeSchema,
  type DriverDocumentField,
} from "./driver-application.schema";

const timeSchema = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be in HH:mm format");

const requiredDocumentUrlSchema = z
  .string()
  .trim()
  .url({ message: "Document is required" });

const documentFormFields = Object.fromEntries(
  DRIVER_DOCUMENT_FIELDS.map((field) => [field, requiredDocumentUrlSchema])
) as Record<DriverDocumentField, typeof requiredDocumentUrlSchema>;

const documentUrlFields = Object.fromEntries(
  DRIVER_DOCUMENT_FIELDS.map((field) => [field, z.string().url()])
) as Record<DriverDocumentField, z.ZodString>;

const createDriverBaseSchema = z.object({
  operatingCountry: z.string().trim().min(1, "Country is required").max(120),
  operatingCity: z.string().trim().min(1, "City is required").max(120),
  firstName: z.string().trim().min(1, "First name is required").max(80),
  lastName: z.string().trim().min(1, "Last name is required").max(80),
  email: z.string().trim().email("Valid email is required"),
  phone: z.string().trim().min(5, "Phone is required").max(30),
  homeAddress: z.string().trim().min(1, "Address is required").max(500),
  carType: z.string().trim().min(1, "Vehicle type is required").max(120),
  carColor: z.string().trim().min(1, "Vehicle color is required").max(60),
  licensePlate: z.string().trim().min(1, "License plate is required").max(20),
  carYearModel: z.string().trim().min(1, "Year / model is required").max(40),
  yearsOfExperience: z.coerce.number().int().min(0).max(80),
  shiftType: driverShiftTypeSchema,
  availableFrom: timeSchema,
  availableTo: timeSchema,
  about: z.string().trim().max(5000).optional(),
  skills: z.string().trim().max(1000).optional(),
  profilePhoto: z.string().trim().url().optional().or(z.literal("")),
});

export const createDriverFormSchema = createDriverBaseSchema.extend(documentFormFields);

export const createDriverPayloadSchema = createDriverFormSchema
  .omit({
    profilePhoto: true,
    skills: true,
    ...Object.fromEntries(DRIVER_DOCUMENT_FIELDS.map((field) => [field, true])),
  })
  .extend({
    profilePhoto: z.string().optional(),
    skills: z.array(z.string()).optional(),
    documents: z.object(documentUrlFields),
  });

export type CreateDriverFormInput = z.infer<typeof createDriverFormSchema>;
export type CreateDriverFormSchema = z.infer<typeof createDriverFormSchema>;
export type CreateDriverPayload = Omit<
  CreateDriverFormInput,
  "skills" | "profilePhoto" | DriverDocumentField
> & {
  profilePhoto?: string;
  skills?: string[];
  documents: DriverDocumentsPayload;
};
export type DriverDocumentsPayload = {
  [K in DriverDocumentField]: string;
};
