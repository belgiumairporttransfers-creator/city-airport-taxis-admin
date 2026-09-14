import {
  bulkDeleteBookings,
  completeBooking,
  deleteBooking,
  getBooking,
  getBookings,
  updateBooking,
} from "@/lib/api/booking";
import type { GetBookingsParams, UpdateBookingPayload } from "@/lib/schemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const BOOKINGS_QUERY_KEY = ["bookings"] as const;
export const bookingQueryKey = (id: string) => [...BOOKINGS_QUERY_KEY, id] as const;
type ApiError = { message?: string };

export const useBookings = (params: GetBookingsParams) => {
  return useQuery({
    queryKey: [...BOOKINGS_QUERY_KEY, params],
    queryFn: () => getBookings(params),
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
    refetchInterval: 10_000,
  });
};

export const useCalendarBookings = (range?: {
  pickupDateFrom?: string;
  pickupDateTo?: string;
}) => {
  return useQuery({
    queryKey: [...BOOKINGS_QUERY_KEY, "calendar", range ?? {}],
    queryFn: () =>
      getBookings({
        page: 1,
        limit: 100,
        sort: "route.pickupDate",
        pickupDateFrom: range?.pickupDateFrom,
        pickupDateTo: range?.pickupDateTo,
      }),
    enabled: Boolean(range?.pickupDateFrom && range?.pickupDateTo),
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
  });
};

export const useBooking = (id: string) => {
  return useQuery({
    queryKey: bookingQueryKey(id),
    queryFn: () => getBooking(id),
    enabled: Boolean(id),
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
    refetchInterval: 10_000,
  });
};

export const useUpdateBooking = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateBookingPayload) => updateBooking(id, payload),
    onSuccess: async () => {
      toast.success("Booking updated. Customer notified by email.");
      await queryClient.invalidateQueries({ queryKey: BOOKINGS_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: bookingQueryKey(id) });
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to update booking.");
    },
  });
};

export const useCompleteBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completeBooking,
    onSuccess: async () => {
      toast.success("Booking marked as complete");
      await queryClient.invalidateQueries({ queryKey: BOOKINGS_QUERY_KEY });
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to mark booking as complete.");
    },
  });
};

export const useDeleteBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBooking,
    onSuccess: async () => {
      toast.success("Booking deleted successfully");
      await queryClient.invalidateQueries({ queryKey: BOOKINGS_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to delete booking.");
    },
  });
};

export const useBulkDeleteBookings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkDeleteBookings,
    onSuccess: async (_, ids) => {
      toast.success(
        ids.length === 1
          ? "Booking deleted successfully"
          : `${ids.length} bookings deleted successfully`
      );
      await queryClient.invalidateQueries({ queryKey: BOOKINGS_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to delete bookings.");
    },
  });
};
