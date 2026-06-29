import { z } from "zod";

export const vehiclePricingTypeSchema = z.enum(["fixed", "per_unit", "base_plus_per_unit"]);
export const vehiclePricingStatusSchema = z.enum(["active", "inactive"]);

const parseRequiredNumber = (value: unknown) => {
  if (value === "" || value === null || value === undefined) {
    return Number.NaN;
  }
  return Number(value);
};

const parseOptionalNumber = (value: unknown) => {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const requiredNumberSchema = z.preprocess(
  parseRequiredNumber,
  z.number({ invalid_type_error: "Must be a valid number" }).min(0)
);

const optionalNumberSchema = z.preprocess(parseOptionalNumber, z.number().min(0).optional());

const optionalAdjustmentSchema = z.preprocess(
  parseOptionalNumber,
  z.number().min(-100).max(100).optional()
);

export const vehiclePricingSchema = z.object({
  _id: z.string(),
  categoryId: z.string(),
  minDistance: z.number(),
  maxDistance: z.number().nullable(),
  pricingType: vehiclePricingTypeSchema,
  priceAmount: z.number(),
  perUnitRate: z.number().optional(),
  increasePercentage: z.number().optional(),
  status: vehiclePricingStatusSchema,
  sortOrder: z.number(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const vehiclePricingListResponseSchema = z.object({
  items: z.array(vehiclePricingSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export const getVehiclePricingParamsSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  categoryId: z.string().optional(),
  status: vehiclePricingStatusSchema.optional(),
  sort: z.string().optional(),
  search: z.string().optional(),
});

const pricingFormBaseSchema = z.object({
  minDistance: requiredNumberSchema.refine((value) => !Number.isNaN(value), {
    message: "Minimum distance is required",
  }),
  openEnded: z.boolean().default(false),
  maxDistance: optionalNumberSchema,
  pricingType: vehiclePricingTypeSchema,
  priceAmount: requiredNumberSchema.refine((value) => !Number.isNaN(value), {
    message: "Price amount is required",
  }),
  perUnitRate: optionalNumberSchema,
  increasePercentage: optionalAdjustmentSchema,
  status: vehiclePricingStatusSchema.default("active"),
  sortOrder: z.preprocess(
    parseRequiredNumber,
    z.number().int().min(0)
  ),
});

const refinePricingForm = (
  data: z.infer<typeof pricingFormBaseSchema>,
  ctx: z.RefinementCtx
) => {
  if (!data.openEnded) {
    if (data.maxDistance === undefined || Number.isNaN(data.maxDistance)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Maximum distance is required unless open-ended",
        path: ["maxDistance"],
      });
    } else if (data.maxDistance <= data.minDistance) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          data.maxDistance === data.minDistance
            ? "Maximum distance must be greater than minimum distance (ranges cannot be empty)"
            : "Maximum distance must be greater than minimum distance",
        path: ["maxDistance"],
      });
    }
  }

  if (data.pricingType === "base_plus_per_unit" && data.perUnitRate === undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Per unit rate is required for base + per unit pricing",
      path: ["perUnitRate"],
    });
  }

  if (data.increasePercentage !== undefined) {
    if (data.increasePercentage < -100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Price adjustment cannot be less than -100%",
        path: ["increasePercentage"],
      });
    } else if (data.increasePercentage > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Price adjustment cannot exceed 100%",
        path: ["increasePercentage"],
      });
    }
  }
};

export const createVehiclePricingFormSchema = pricingFormBaseSchema
  .extend({
    categoryId: z.string().min(1, "Category is required"),
  })
  .superRefine(refinePricingForm);

export const updateVehiclePricingFormSchema = pricingFormBaseSchema.superRefine(refinePricingForm);

export const pricingStructureValidationSchema = z.object({
  isComplete: z.boolean(),
  overlaps: z.array(
    z.object({
      slabAId: z.string(),
      slabBId: z.string(),
    })
  ),
  gaps: z.array(
    z.object({
      fromDistance: z.number(),
      toDistance: z.number().nullable(),
    })
  ),
  openEndedCount: z.number(),
});

export type VehiclePricingType = z.infer<typeof vehiclePricingTypeSchema>;
export type VehiclePricingStatus = z.infer<typeof vehiclePricingStatusSchema>;
export type VehiclePricing = z.infer<typeof vehiclePricingSchema>;
export type VehiclePricingListResponse = z.infer<typeof vehiclePricingListResponseSchema>;
export type GetVehiclePricingParams = z.infer<typeof getVehiclePricingParamsSchema>;
export type CreateVehiclePricingFormSchema = z.infer<typeof createVehiclePricingFormSchema>;
export type UpdateVehiclePricingFormSchema = z.infer<typeof updateVehiclePricingFormSchema>;
export type PricingStructureValidation = z.infer<typeof pricingStructureValidationSchema>;

export type CreateVehiclePricingPayload = {
  minDistance: number;
  maxDistance: number | null;
  pricingType: VehiclePricingType;
  priceAmount: number;
  perUnitRate?: number | null;
  increasePercentage?: number | null;
  status?: VehiclePricingStatus;
  sortOrder?: number;
};

export type UpdateVehiclePricingPayload = Partial<CreateVehiclePricingPayload>;

export const toPricingPayload = (
  values: CreateVehiclePricingFormSchema | UpdateVehiclePricingFormSchema
): CreateVehiclePricingPayload => ({
  minDistance: values.minDistance,
  maxDistance: values.openEnded ? null : (values.maxDistance ?? null),
  pricingType: values.pricingType,
  priceAmount: values.priceAmount,
  perUnitRate:
    values.pricingType === "base_plus_per_unit" ? values.perUnitRate : null,
  increasePercentage: values.increasePercentage ?? null,
  status: values.status,
  sortOrder: values.sortOrder,
});

export const toPricingFormValues = (slab: VehiclePricing): UpdateVehiclePricingFormSchema => ({
  minDistance: slab.minDistance,
  openEnded: slab.maxDistance === null,
  maxDistance: slab.maxDistance ?? undefined,
  pricingType: slab.pricingType,
  priceAmount: slab.priceAmount,
  perUnitRate:
    slab.pricingType === "base_plus_per_unit" ? slab.perUnitRate : undefined,
  increasePercentage: slab.increasePercentage,
  status: slab.status,
  sortOrder: slab.sortOrder,
});
