import { z } from "zod";

export const vehicleCategoryStatusSchema = z.enum(["active", "inactive"]);

export const vehicleCategorySchema = z.object({
  _id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  image: z.string().optional(),
  passengerCapacity: z.number(),
  luggageCapacity: z.number(),
  sortOrder: z.number(),
  status: vehicleCategoryStatusSchema,
  isDefault: z.boolean(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const vehicleCategoriesResponseSchema = z.object({
  items: z.array(vehicleCategorySchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export const getVehicleCategoriesParamsSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  search: z.string().optional(),
  status: vehicleCategoryStatusSchema.optional(),
  sort: z.string().optional(),
});

export const createVehicleCategoryFormSchema = z.object({
  name: z.string().trim().min(1, "Category name is required").max(120),
  description: z.string().trim().max(2000).optional(),
  passengerCapacity: z.coerce.number().int().min(1, "At least 1 passenger").max(99),
  luggageCapacity: z.coerce.number().int().min(0).max(99),
  sortOrder: z.coerce.number().int().min(0).default(0),
  status: vehicleCategoryStatusSchema.default("active"),
  isDefault: z.boolean().default(false),
  image: z.union([z.instanceof(File), z.null()]).optional(),
});

export type VehicleCategoryStatus = z.infer<typeof vehicleCategoryStatusSchema>;
export type VehicleCategory = z.infer<typeof vehicleCategorySchema>;
export type VehicleCategoriesResponse = z.infer<typeof vehicleCategoriesResponseSchema>;
export type GetVehicleCategoriesParams = z.infer<typeof getVehicleCategoriesParamsSchema>;
export type CreateVehicleCategoryFormSchema = z.infer<typeof createVehicleCategoryFormSchema>;

export type CreateVehicleCategoryPayload = {
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  passengerCapacity: number;
  luggageCapacity: number;
  sortOrder?: number;
  status?: VehicleCategoryStatus;
  isDefault?: boolean;
};

export const updateVehicleCategoryFormSchema = createVehicleCategoryFormSchema;

export type UpdateVehicleCategoryFormSchema = z.infer<typeof updateVehicleCategoryFormSchema>;

export type UpdateVehicleCategoryPayload = {
  name?: string;
  description?: string;
  image?: string;
  passengerCapacity?: number;
  luggageCapacity?: number;
  sortOrder?: number;
  status?: VehicleCategoryStatus;
  isDefault?: boolean;
};
