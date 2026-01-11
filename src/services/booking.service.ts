/**
 * Booking Service
 * API calls for customer booking management
 */

import api from "../api/client";
import type {
  CreateBookingRequest,
  CreateBookingResponse,
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

const bookingService = {
  createBooking,
};

export default bookingService;
