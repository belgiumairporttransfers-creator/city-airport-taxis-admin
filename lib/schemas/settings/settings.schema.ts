import { z } from "zod";

export const paymentModeSchema = z.enum(["test", "live"]);

export const settingsSchema = z.object({
  maintenanceMode: z.boolean(),
  comingSoonMode: z.boolean(),
  paymentMode: paymentModeSchema,
  minBookingMinutes: z.number().int().min(0),
  stopFee: z.number().min(0),
  cardProcessingFee: z.number().min(0).max(100),
  airportPickup: z.number().min(0),
  trainPickup: z.number().min(0),
  meetAndGreet: z.number().min(0),
  returnMeetAndGreet: z.number().min(0),
  waitingTimePricePerMinute: z.number().min(0),
  waitingTimePricePerHour: z.number().min(0),
});

export const settingsResponseSchema = z.object({
  _id: z.string(),
  key: z.string(),
  maintenanceMode: z.boolean(),
  comingSoonMode: z.boolean(),
  paymentMode: paymentModeSchema,
  minBookingMinutes: z.number().int().min(0),
  stopFee: z.number().min(0),
  cardProcessingFee: z.number().min(0).max(100),
  airportPickup: z.number().min(0),
  trainPickup: z.number().min(0),
  meetAndGreet: z.number().min(0),
  returnMeetAndGreet: z.number().min(0),
  waitingTimePricePerMinute: z.number().min(0),
  waitingTimePricePerHour: z.number().min(0),
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
  stopFee: z.coerce.number().min(0, "Stops fee cannot be negative"),
  cardProcessingFee: z.coerce
    .number()
    .min(0, "Card processing fee cannot be negative")
    .max(100, "Card processing fee cannot exceed 100%"),
  airportPickup: z.coerce.number().min(0, "Airport pickup price cannot be negative"),
  trainPickup: z.coerce.number().min(0, "Train pickup price cannot be negative"),
  meetAndGreet: z.coerce.number().min(0, "Meet and greet price cannot be negative"),
  returnMeetAndGreet: z.coerce
    .number()
    .min(0, "Return meet and greet price cannot be negative"),
  waitingTimePricePerMinute: z.coerce
    .number()
    .min(0, "Driver waiting time price per minute cannot be negative"),
  waitingTimePricePerHour: z.coerce
    .number()
    .min(0, "Driver waiting time price per hour cannot be negative"),
});

export type SiteSettingsFormSchema = z.infer<typeof siteSettingsFormSchema>;

export const toSettingsPayload = (
  values: SiteSettingsFormSchema
): SettingsSchema => ({
  maintenanceMode: values.maintenanceMode,
  comingSoonMode: values.comingSoonMode,
  paymentMode: values.livePaymentMode ? "live" : "test",
  minBookingMinutes: values.minBookingMinutes,
  stopFee: values.stopFee,
  cardProcessingFee: values.cardProcessingFee,
  airportPickup: values.airportPickup,
  trainPickup: values.trainPickup,
  meetAndGreet: values.meetAndGreet,
  returnMeetAndGreet: values.returnMeetAndGreet,
  waitingTimePricePerMinute: values.waitingTimePricePerMinute,
  waitingTimePricePerHour: values.waitingTimePricePerHour,
});

export const fromSettingsResponse = (settings: Settings): SiteSettingsFormSchema => ({
  maintenanceMode: settings.maintenanceMode,
  comingSoonMode: settings.comingSoonMode ?? false,
  livePaymentMode: settings.paymentMode === "live",
  minBookingMinutes: settings.minBookingMinutes ?? 120,
  stopFee: settings.stopFee ?? 0,
  cardProcessingFee: settings.cardProcessingFee ?? 0,
  airportPickup: settings.airportPickup ?? 0,
  trainPickup: settings.trainPickup ?? 0,
  meetAndGreet: settings.meetAndGreet ?? 0,
  returnMeetAndGreet: settings.returnMeetAndGreet ?? 0,
  waitingTimePricePerMinute: settings.waitingTimePricePerMinute ?? 0,
  waitingTimePricePerHour: settings.waitingTimePricePerHour ?? 0,
});
