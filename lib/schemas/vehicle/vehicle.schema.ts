import { z } from "zod";

export const vehicleStatusSchema = z.enum(["active", "maintenance", "inactive"]);

export const vehicleSchema = z.object({
  _id: z.string(),
  categoryId: z.string(),
  registrationNumber: z.string(),
  make: z.string(),
  model: z.string(),
  year: z.number().optional(),
  color: z.string().optional(),
  passengerCapacity: z.number(),
  luggageCapacity: z.number(),
  status: vehicleStatusSchema,
  features: z.array(z.string()),
  image: z.string().optional(),
  notes: z.string().optional(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const vehiclesResponseSchema = z.object({
  items: z.array(vehicleSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export const getVehiclesParamsSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  search: z.string().optional(),
  status: vehicleStatusSchema.optional(),
  categoryId: z.string().optional(),
  sort: z.string().optional(),
});

export const vehicleFormSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  registrationNumber: z.string().trim().min(1, "Registration number is required").max(20),
  make: z.string().trim().min(1, "Make is required").max(80),
  model: z.string().trim().min(1, "Model is required").max(80),
  year: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : Number(value)),
    z.number().int().min(1900).max(2100).optional()
  ),
  color: z.string().trim().max(40).optional(),
  passengerCapacity: z.coerce.number().int().min(1, "At least 1 passenger").max(99),
  luggageCapacity: z.coerce.number().int().min(0).max(99),
  status: vehicleStatusSchema.default("active"),
  notes: z.string().trim().max(5000).optional(),
  image: z.union([z.instanceof(File), z.null()]).optional(),
});

export type VehicleStatus = z.infer<typeof vehicleStatusSchema>;
export type Vehicle = z.infer<typeof vehicleSchema>;
export type VehiclesResponse = z.infer<typeof vehiclesResponseSchema>;
export type GetVehiclesParams = z.infer<typeof getVehiclesParamsSchema>;
export type VehicleFormSchema = z.infer<typeof vehicleFormSchema>;

export const createVehicleFormSchema = vehicleFormSchema;
export const updateVehicleFormSchema = vehicleFormSchema;

export type CreateVehicleFormSchema = VehicleFormSchema;
export type UpdateVehicleFormSchema = VehicleFormSchema;

export type CreateVehiclePayload = {
  categoryId: string;
  registrationNumber: string;
  make: string;
  model: string;
  year?: number;
  color?: string;
  passengerCapacity: number;
  luggageCapacity: number;
  status?: VehicleStatus;
  notes?: string;
  image?: string;
};

export type UpdateVehiclePayload = Partial<CreateVehiclePayload>;
