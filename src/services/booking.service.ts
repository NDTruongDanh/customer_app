/**
 * Booking Service
 * API calls for customer booking management
 */

import api from "../api/client";
import type {
  BookingSearchParams,
  CreateBookingRequest,
  CreateBookingResponse,
  GetBookingsResponse,
} from "../types/booking.types";

/**
 * Create a new booking
 */
export const createBooking = async (
  bookingData: CreateBookingRequest
): Promise<CreateBookingResponse> => {
  const response = await api.post<CreateBookingResponse>(
    "/customer/bookings",
    bookingData
  );
  return response.data;
};

/**
 * Get current user's bookings
 */
export const getBookings = async (
  params?: BookingSearchParams
): Promise<GetBookingsResponse> => {
  const response = await api.get<GetBookingsResponse>("/customer/bookings", {
    params,
  });
  return response.data;
};

const bookingService = {
  createBooking,
  getBookings,
};

export default bookingService;
