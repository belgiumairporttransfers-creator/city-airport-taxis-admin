import API_ROUTES from "@/lib/api/routes";
import type {
  BookingDetail,
  BookingsResponse,
  GetBookingsParams,
  UpdateBookingPayload,
} from "@/lib/schemas";
import { api } from "./client";

export const getBookings = async (params?: GetBookingsParams) => {
  return api.get<BookingsResponse>(API_ROUTES.BOOKINGS, { params });
};

export const getBooking = async (id: string) => {
  return api.get<BookingDetail>(`${API_ROUTES.BOOKINGS}/${id}`);
};

export const updateBooking = async (id: string, payload: UpdateBookingPayload) => {
  return api.patch<BookingDetail>(`${API_ROUTES.BOOKINGS}/${id}`, payload);
};

export const completeBooking = async (id: string) => {
  return api.post<BookingDetail>(`${API_ROUTES.BOOKINGS}/${id}/complete`);
};

export const deleteBooking = async (id: string) => {
  return api.delete(`${API_ROUTES.BOOKINGS}/${id}`);
};

export const bulkDeleteBookings = async (ids: string[]) => {
  return api.delete(`${API_ROUTES.BOOKINGS}/bulk`, { data: { ids } });
};

export const bulkCompleteBookings = async (ids: string[]) => {
  return api.post(`${API_ROUTES.BOOKINGS}/bulk-complete`, { ids });
};
