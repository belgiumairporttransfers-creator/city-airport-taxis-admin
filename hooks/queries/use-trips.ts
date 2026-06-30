import { getTrip, getTrips } from "@/lib/api/trip";
import type { GetTripsParams } from "@/lib/schemas";
import { useQuery } from "@tanstack/react-query";

export const TRIPS_QUERY_KEY = ["trips"] as const;
export const tripQueryKey = (bookingNumber: string) =>
  [...TRIPS_QUERY_KEY, bookingNumber] as const;

export const useTrips = (params: GetTripsParams) => {
  return useQuery({
    queryKey: [...TRIPS_QUERY_KEY, params],
    queryFn: () => getTrips(params),
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
};

export const useTrip = (bookingNumber: string) => {
  return useQuery({
    queryKey: tripQueryKey(bookingNumber),
    queryFn: () => getTrip(bookingNumber),
    enabled: Boolean(bookingNumber),
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
};
