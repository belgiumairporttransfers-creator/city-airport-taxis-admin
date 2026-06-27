import { z } from "zod";

export const driverApplicationStatusSchema = z.enum([
  "pending",
  "under_review",
  "changes_requested",
  "approved",
  "rejected",
  "suspended",
]);

export const driverShiftTypeSchema = z.enum(["day", "night", "both"]);

export const driverDocumentsSchema = z.record(z.string());

export const driverReviewSchema = z.object({
  id: z.string(),
  passengerName: z.string(),
  rating: z.number(),
  comment: z.string(),
  createdAt: z.string(),
});

export const driverApplicationSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  applicationNumber: z.string(),
  status: driverApplicationStatusSchema,
  operatingCountry: z.string(),
  operatingCity: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  phone: z.string(),
  homeAddress: z.string(),
  carType: z.string(),
  carColor: z.string(),
  licensePlate: z.string(),
  carYearModel: z.string(),
  yearsOfExperience: z.number(),
  shiftType: driverShiftTypeSchema,
  availableFrom: z.string(),
  availableTo: z.string(),
  profilePhoto: z.string().optional(),
  about: z.string(),
  skills: z.array(z.string()),
  reviews: z.array(driverReviewSchema).optional(),
  documents: driverDocumentsSchema.optional(),
  reviewNotes: z.string().optional(),
  reviewedBy: z.string().optional(),
  reviewedAt: z.string().optional(),
  approvedAt: z.string().optional(),
  rejectedAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const driverApplicationsResponseSchema = z.object({
  items: z.array(driverApplicationSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export const driverApplicationStatsSchema = z.object({
  pending: z.number(),
  underReview: z.number(),
  changesRequested: z.number(),
  approved: z.number(),
  rejected: z.number(),
  suspended: z.number(),
  total: z.number(),
});

export const getDriverApplicationsParamsSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  search: z.string().optional(),
  status: driverApplicationStatusSchema.optional(),
  sort: z.string().optional(),
});

export const DRIVER_DOCUMENT_FIELDS = [
  "chauffeurPassFront",
  "chauffeurPassBack",
  "kiwaPermit",
  "driverLicenseFront",
  "driverLicenseBack",
  "carCard",
  "carFrontView",
  "carBackView",
  "carLeftView",
  "carRightView",
  "carInsideView",
  "licensePlateView",
  "taxiInsurancePolicy",
  "kvkUittreksel",
  "bankCardCopy",
] as const;

export type DriverDocumentField = (typeof DRIVER_DOCUMENT_FIELDS)[number];

export const DRIVER_DOCUMENT_LABELS: Record<DriverDocumentField, string> = {
  chauffeurPassFront: "Chauffeur Pass (Front)",
  chauffeurPassBack: "Chauffeur Pass (Back)",
  kiwaPermit: "Kiwa Permit",
  driverLicenseFront: "Driver License (Front)",
  driverLicenseBack: "Driver License (Back)",
  carCard: "Car Card",
  carFrontView: "Car Front View",
  carBackView: "Car Back View",
  carLeftView: "Car Left View",
  carRightView: "Car Right View",
  carInsideView: "Car Inside View",
  licensePlateView: "License Plate View",
  taxiInsurancePolicy: "Taxi Insurance Policy",
  kvkUittreksel: "KVK Uittreksel",
  bankCardCopy: "Bank Card Copy",
};

export type DriverApplicationStatus = z.infer<typeof driverApplicationStatusSchema>;
export type DriverReview = z.infer<typeof driverReviewSchema>;
export type DriverShiftType = z.infer<typeof driverShiftTypeSchema>;
export type DriverApplication = z.infer<typeof driverApplicationSchema>;
export type DriverApplicationsResponse = z.infer<typeof driverApplicationsResponseSchema>;
export type DriverApplicationStats = z.infer<typeof driverApplicationStatsSchema>;
export type GetDriverApplicationsParams = z.infer<typeof getDriverApplicationsParamsSchema>;
