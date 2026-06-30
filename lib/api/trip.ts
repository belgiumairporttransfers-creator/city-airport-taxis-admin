import API_ROUTES from "@/lib/api/routes";
import type { AdminTripDetail, GetTripsParams, TripsResponse } from "@/lib/schemas";
import { api } from "./client";

export const getTrips = async (params?: GetTripsParams) => {
  return api.get<TripsResponse>(API_ROUTES.TRIPS, { params });
};

export const getTrip = async (bookingNumber: string) => {
  return api.get<AdminTripDetail>(`${API_ROUTES.TRIPS}/${bookingNumber}`);
};
