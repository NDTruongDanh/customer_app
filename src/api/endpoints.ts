/**
 * API Endpoints
 * Centralized location for all API endpoint paths
 */

/**
 * Customer Authentication Endpoints
 */
export const AUTH_ENDPOINTS = {
  REGISTER: "/customer/auth/register",
  LOGIN: "/customer/auth/login",
  LOGOUT: "/customer/auth/logout",
  REFRESH_TOKENS: "/customer/auth/refresh-tokens",
  FORGOT_PASSWORD: "/customer/auth/forgot-password",
  RESET_PASSWORD: "/customer/auth/reset-password",
} as const;

/**
 * Customer Profile Endpoints
 */
export const PROFILE_ENDPOINTS = {
  GET_PROFILE: "/customer/profile",
  UPDATE_PROFILE: "/customer/profile",
  CHANGE_PASSWORD: "/customer/profile/change-password",
} as const;

/**
 * Room Endpoints
 */
export const ROOM_ENDPOINTS = {
  SEARCH_ROOMS: "/customer/rooms/available",
  GET_ROOM_DETAILS: (roomId: string) => `/customer/rooms/${roomId}`,
} as const;

/**
 * Booking Endpoints
 */
export const BOOKING_ENDPOINTS = {
  CREATE_BOOKING: "/customer/bookings",
  GET_BOOKINGS: "/customer/bookings",
  GET_BOOKING_DETAILS: (bookingId: string) => `/customer/bookings/${bookingId}`,
  CANCEL_BOOKING: (bookingId: string) =>
    `/customer/bookings/${bookingId}/cancel`,
} as const;

/**
 * Promotion Endpoints
 */
export const PROMOTION_ENDPOINTS = {
  GET_AVAILABLE: "/customer/promotions/available",
  GET_MY_PROMOTIONS: "/customer/promotions/my-promotions",
  CLAIM_PROMOTION: "/customer/promotions/claim",
} as const;
