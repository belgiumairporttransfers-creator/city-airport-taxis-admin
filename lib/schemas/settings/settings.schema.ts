import { z } from "zod";

export const paymentModeSchema = z.enum(["test", "live"]);

const timeStringSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be in HH:mm format");

export const settingsSchema = z.object({
  maintenanceMode: z.boolean(),
  comingSoonMode: z.boolean(),
  paymentMode: paymentModeSchema,
  minBookingMinutes: z.number().int().min(0),
  airportPickup: z.number().min(0),
  waitingTimePricePerMinute: z.number().min(0),
  waitingTimePricePerHour: z.number().min(0),
  driverCommissionPercent: z.number().min(0).max(100),
  nightPricingStartTime: timeStringSchema,
  nightPricingEndTime: timeStringSchema,
  nightPricingPercent: z.number().min(0).max(100),
  driverNotificationDelayMinutes: z.number().int().min(0),
});

export const settingsResponseSchema = z.object({
  _id: z.string(),
  key: z.string(),
  maintenanceMode: z.boolean(),
  comingSoonMode: z.boolean(),
  paymentMode: paymentModeSchema,
  minBookingMinutes: z.number().int().min(0),
  airportPickup: z.number().min(0),
  waitingTimePricePerMinute: z.number().min(0),
  waitingTimePricePerHour: z.number().min(0),
  driverCommissionPercent: z.number().min(0).max(100),
  nightPricingStartTime: timeStringSchema.optional(),
  nightPricingEndTime: timeStringSchema.optional(),
  nightPricingPercent: z.number().min(0).max(100).optional(),
  driverNotificationDelayMinutes: z.number().int().min(0).optional(),
  updatedAt: z.string().optional(),
  createdAt: z.string().optional(),
});

export type PaymentMode = z.infer<typeof paymentModeSchema>;
export type SettingsSchema = z.infer<typeof settingsSchema>;
export type Settings = z.infer<typeof settingsResponseSchema>;

export const siteSettingsFormSchema = z.object({
  maintenanceMode: z.boolean(),
  comingSoonMode: z.boolean(),
  livePaymentMode: z.boolean(),
  minBookingMinutes: z.coerce
    .number()
    .int("Minimum booking time must be a whole number of minutes")
    .min(0, "Minimum booking time cannot be negative"),
  airportPickup: z.coerce.number().min(0, "Airport pickup price cannot be negative"),
  waitingTimePricePerMinute: z.coerce
    .number()
    .min(0, "Driver waiting time price per minute cannot be negative"),
  waitingTimePricePerHour: z.coerce
    .number()
    .min(0, "Driver waiting time price per hour cannot be negative"),
  driverCommissionPercent: z.coerce
    .number()
    .min(0, "Driver commission cannot be negative")
    .max(100, "Driver commission cannot exceed 100%"),
  nightPricingStartTime: timeStringSchema,
  nightPricingEndTime: timeStringSchema,
  nightPricingPercent: z.coerce
    .number()
    .min(0, "Night pricing percent cannot be negative")
    .max(100, "Night pricing percent cannot exceed 100%"),
  driverNotificationDelayMinutes: z.coerce
    .number()
    .int("Driver notification delay must be a whole number of minutes")
    .min(0, "Driver notification delay cannot be negative"),
});

export type SiteSettingsFormSchema = z.infer<typeof siteSettingsFormSchema>;

export const toSettingsPayload = (
  values: SiteSettingsFormSchema
): SettingsSchema => ({
  maintenanceMode: values.maintenanceMode,
  comingSoonMode: values.comingSoonMode,
  paymentMode: values.livePaymentMode ? "live" : "test",
  minBookingMinutes: values.minBookingMinutes,
  airportPickup: values.airportPickup,
  waitingTimePricePerMinute: values.waitingTimePricePerMinute,
  waitingTimePricePerHour: values.waitingTimePricePerHour,
  driverCommissionPercent: values.driverCommissionPercent,
  nightPricingStartTime: values.nightPricingStartTime,
  nightPricingEndTime: values.nightPricingEndTime,
  nightPricingPercent: values.nightPricingPercent,
  driverNotificationDelayMinutes: values.driverNotificationDelayMinutes,
});

export const fromSettingsResponse = (settings: Settings): SiteSettingsFormSchema => ({
  maintenanceMode: settings.maintenanceMode,
  comingSoonMode: settings.comingSoonMode ?? false,
  livePaymentMode: settings.paymentMode === "live",
  minBookingMinutes: settings.minBookingMinutes ?? 120,
  airportPickup: settings.airportPickup ?? 0,
  waitingTimePricePerMinute: settings.waitingTimePricePerMinute ?? 0,
  waitingTimePricePerHour: settings.waitingTimePricePerHour ?? 0,
  driverCommissionPercent: settings.driverCommissionPercent ?? 10,
  nightPricingStartTime: settings.nightPricingStartTime ?? "22:00",
  nightPricingEndTime: settings.nightPricingEndTime ?? "06:00",
  nightPricingPercent: settings.nightPricingPercent ?? 0,
  driverNotificationDelayMinutes: settings.driverNotificationDelayMinutes ?? 10,
});
