/**
 * Booking Type Definitions
 * Types for booking-related API requests and responses
 */

/**
 * Booking Creation Request
 */
export interface CreateBookingRequest {
  rooms: Array<{ roomId: string }>;
  checkInDate: string; // ISO 8601 format
  checkOutDate: string; // ISO 8601 format
  totalGuests: number;
}

/**
 * Booking Creation Response
 */
export interface CreateBookingResponse {
  data: {
    bookingId: string;
    bookingCode: string;
    expiresAt: string; // ISO 8601 format
    totalAmount: number;
  };
}

/**
 * Booking Status
 */
export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CHECKED_IN"
  | "CHECKED_OUT"
  | "CANCELLED";
