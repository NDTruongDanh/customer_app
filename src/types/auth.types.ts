/**
 * Authentication Type Definitions
 * Based on the Roommaster API Documentation
 */

/**
 * Customer object representing a customer
 */
export interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  idNumber: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Token object containing JWT and expiration
 */
export interface Token {
  token: string;
  expires: string; // ISO 8601 date string
}

/**
 * Authentication tokens (access and refresh)
 */
export interface AuthTokens {
  access: Token;
  refresh: Token;
}

/**
 * Response from login and register endpoints
 */
export interface AuthResponse {
  data: {
    customer: Customer;
    tokens: AuthTokens;
  };
}

/**
 * Registration data payload
 */
export interface RegisterData {
  fullName: string;
  phone: string;
  email: string;
  password: string;
}

/**
 * Login data payload
 */
export interface LoginData {
  phone: string;
  password: string;
}

/**
 * Logout data payload
 */
export interface LogoutData {
  refreshToken: string;
}

/**
 * Refresh tokens data payload
 */
export interface RefreshTokensData {
  refreshToken: string;
}

/**
 * Forgot password data payload
 */
export interface ForgotPasswordData {
  email: string;
}

/**
 * Reset password data payload
 */
export interface ResetPasswordData {
  token: string;
  password: string;
}

/**
 * API Error response structure
 */
export interface ApiError {
  code: number;
  message: string;
  stack?: string;
  errors?: {
    field: string;
    message: string;
  }[];
}
