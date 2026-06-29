import { z } from "zod";
import { vehicleCategorySchema } from "./vehicle-category.schema";
import { vehiclePricingSchema } from "./vehicle-pricing.schema";
import { vehicleSchema } from "./vehicle.schema";

const parseDistance = (value: unknown) => {
  if (value === "" || value === null || value === undefined) {
    return Number.NaN;
  }
  return Number(value);
};

export const vehicleFareQuotesSearchSchema = z.object({
  distance: z.preprocess(
    parseDistance,
    z
      .number({ invalid_type_error: "Distance is required" })
      .min(0, "Distance must be at least 0")
  ),
});

export type VehicleFareQuotesSearchSchema = z.infer<typeof vehicleFareQuotesSearchSchema>;

export const vehiclePricingQuoteItemSchema = z.object({
  category: vehicleCategorySchema,
  fare: z
    .object({
      slab: vehiclePricingSchema,
      distance: z.number(),
      amount: z.number(),
    })
    .nullable(),
  vehicles: z.array(vehicleSchema),
});

export const vehiclePricingQuotesResponseSchema = z.object({
  distance: z.number(),
  items: z.array(vehiclePricingQuoteItemSchema),
});

export type VehiclePricingQuoteItem = z.infer<typeof vehiclePricingQuoteItemSchema>;
export type VehiclePricingQuotesResponse = z.infer<typeof vehiclePricingQuotesResponseSchema>;
