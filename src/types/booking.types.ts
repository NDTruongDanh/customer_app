/**
 * Booking Type Definitions
 * Types for booking-related API requests and responses
 */

import { RoomImage, RoomTypeImage } from "./room.types";

export interface CreateBookingRequest {
  rooms: Array<{ roomId: string }>;
  checkInDate: string; // ISO 8601 format
  checkOutDate: string; // ISO 8601 format
  totalGuests: number;
}

export interface CreateBookingResponse {
  data: {
    bookingId: string;
    bookingCode: string;
    expiresAt: string; // ISO 8601 format
    totalAmount: number;
  };
}

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CHECKED_IN"
  | "CHECKED_OUT"
  | "CANCELLED";

export interface BookingSearchParams {
  page?: number;
  limit?: number;
  status?: BookingStatus;
}

export interface BookingCustomer {
  id: string;
  fullName: string;
  phone: string;
  email: string;
}

export interface BookingRoomType {
  id: string;
  name: string;
  capacity: number;
  totalBed: number;
  basePrice: string;
  // Deprecated: use images array instead
  imageUrl?: string | null;
  images?: RoomTypeImage[];
}

export interface BookingRoomInfo {
  id: string;
  roomNumber: string;
  floor: number;
  code: string;
  status: string;
  images?: RoomImage[];
}

export interface BookingRoom {
  id: string;
  bookingId: string;
  roomId: string;
  roomTypeId: string;
  checkInDate: string;
  checkOutDate: string;
  pricePerNight: string;
  totalAmount: string;
  status: BookingStatus;
  room: BookingRoomInfo;
  roomType: BookingRoomType;
}

export interface Booking {
  id: string;
  bookingCode: string;
  status: BookingStatus;
  primaryCustomerId: string;
  checkInDate: string;
  checkOutDate: string;
  totalGuests: number;
  totalAmount: string;
  depositRequired: string;
  createdAt: string;
  updatedAt: string;
  primaryCustomer: BookingCustomer;
  bookingRooms: BookingRoom[];
}

export interface GetBookingsResponse {
  data: {
    data: Booking[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}
