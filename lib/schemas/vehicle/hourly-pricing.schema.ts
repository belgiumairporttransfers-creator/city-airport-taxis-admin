import { z } from "zod";
import { vehiclePricingStatusSchema } from "./vehicle-pricing.schema";

export const hourlyServiceTypeSchema = z.enum(["hourly"]);

const parseRequiredNumber = (value: unknown) => {
  if (value === "" || value === null || value === undefined) {
    return Number.NaN;
  }
  return Number(value);
};

const requiredNumberSchema = z.preprocess(
  parseRequiredNumber,
  z.number({ invalid_type_error: "Must be a valid number" }).min(0)
);

const requiredPositiveIntSchema = z.preprocess(
  parseRequiredNumber,
  z.number({ invalid_type_error: "Must be a valid number" }).int().min(1)
);

export const hourlyPricingSchema = z.object({
  _id: z.string(),
  categoryId: z.string(),
  serviceType: hourlyServiceTypeSchema,
  duration: z.number(),
  price: z.number(),
  includedDistance: z.number(),
  extraDistancePrice: z.number(),
  status: vehiclePricingStatusSchema,
  sortOrder: z.number(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const hourlyPricingListResponseSchema = z.object({
  items: z.array(hourlyPricingSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export const getHourlyPricingParamsSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  categoryId: z.string().optional(),
  status: vehiclePricingStatusSchema.optional(),
  sort: z.string().optional(),
  search: z.string().optional(),
});

const hourlyPricingFormBaseSchema = z.object({
  serviceType: hourlyServiceTypeSchema.default("hourly"),
  duration: requiredPositiveIntSchema.refine((value) => !Number.isNaN(value), {
    message: "Duration is required",
  }),
  price: requiredNumberSchema.refine((value) => !Number.isNaN(value), {
    message: "Price is required",
  }),
  includedDistance: requiredNumberSchema.refine((value) => !Number.isNaN(value), {
    message: "Included distance is required",
  }),
  extraDistancePrice: requiredNumberSchema.refine((value) => !Number.isNaN(value), {
    message: "Extra distance price is required",
  }),
  status: vehiclePricingStatusSchema.default("active"),
  sortOrder: z.preprocess(parseRequiredNumber, z.number().int().min(0)),
});

export const createHourlyPricingFormSchema = hourlyPricingFormBaseSchema.extend({
  categoryId: z.string().min(1, "Category is required"),
});

export const updateHourlyPricingFormSchema = hourlyPricingFormBaseSchema;

export type HourlyServiceType = z.infer<typeof hourlyServiceTypeSchema>;
export type HourlyPricing = z.infer<typeof hourlyPricingSchema>;
export type HourlyPricingListResponse = z.infer<typeof hourlyPricingListResponseSchema>;
export type GetHourlyPricingParams = z.infer<typeof getHourlyPricingParamsSchema>;
export type CreateHourlyPricingFormSchema = z.infer<typeof createHourlyPricingFormSchema>;
export type UpdateHourlyPricingFormSchema = z.infer<typeof updateHourlyPricingFormSchema>;

export type CreateHourlyPricingPayload = {
  serviceType?: HourlyServiceType;
  duration: number;
  price: number;
  includedDistance: number;
  extraDistancePrice: number;
  status?: z.infer<typeof vehiclePricingStatusSchema>;
  sortOrder?: number;
};

export type UpdateHourlyPricingPayload = Partial<CreateHourlyPricingPayload>;

export const toHourlyPricingPayload = (
  values: CreateHourlyPricingFormSchema | UpdateHourlyPricingFormSchema
): CreateHourlyPricingPayload => ({
  serviceType: values.serviceType ?? "hourly",
  duration: values.duration,
  price: values.price,
  includedDistance: values.includedDistance,
  extraDistancePrice: values.extraDistancePrice,
  status: values.status,
  sortOrder: values.sortOrder,
});

export const toHourlyPricingFormValues = (
  pricing: HourlyPricing
): UpdateHourlyPricingFormSchema => ({
  serviceType: pricing.serviceType,
  duration: pricing.duration,
  price: pricing.price,
  includedDistance: pricing.includedDistance,
  extraDistancePrice: pricing.extraDistancePrice,
  status: pricing.status,
  sortOrder: pricing.sortOrder,
});
