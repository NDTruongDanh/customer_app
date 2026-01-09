/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import {
  AuthResponse,
  ForgotPasswordData,
  LoginData,
  LogoutData,
  RefreshTokensData,
  RegisterData,
  ResetPasswordData,
} from "../../types/auth.types";
import apiClient from "../client";

/**
 * Authentication API Service
 */
export const authService = {
  /**
   * Register a new customer
   * POST /customer/auth/register
   *
   * @param data - Registration data (fullName, phone, email, password)
   * @returns Promise with customer data and authentication tokens wrapped in data object
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      "/customer/auth/register",
      data
    );
    // Response is already wrapped in { data: { customer, tokens } }
    return response.data;
  },

  /**
   * Customer login
   * POST /customer/auth/login
   *
   * @param phone - Customer phone number
   * @param password - Customer password
   * @returns Promise with customer data and authentication tokens wrapped in data object
   */
  login: async (phone: string, password: string): Promise<AuthResponse> => {
    const data: LoginData = { phone, password };
    const response = await apiClient.post<AuthResponse>(
      "/customer/auth/login",
      data
    );
    // Response is already wrapped in { data: { customer, tokens } }
    return response.data;
  },

  /**
   * Customer logout
   * POST /customer/auth/logout
   *
   * @param refreshToken - Refresh token to invalidate
   * @returns Promise with no data (successful logout)
   */
  logout: async (refreshToken: string): Promise<void> => {
    const data: LogoutData = { refreshToken };
    await apiClient.post("/customer/auth/logout", data);
  },

  /**
   * Refresh authentication tokens
   * POST /customer/auth/refresh-tokens
   *
   * @param refreshToken - Current refresh token
   * @returns Promise with new authentication tokens
   */
  refreshTokens: async (refreshToken: string): Promise<AuthResponse> => {
    const data: RefreshTokensData = { refreshToken };
    const response = await apiClient.post<AuthResponse>(
      "/customer/auth/refresh-tokens",
      data
    );
    return response.data;
  },

  /**
   * Request password reset
   * POST /customer/auth/forgot-password
   *
   * @param email - Email address to send reset link
   * @returns Promise with no data (email sent confirmation)
   */
  forgotPassword: async (email: string): Promise<void> => {
    const data: ForgotPasswordData = { email };
    await apiClient.post("/customer/auth/forgot-password", data);
  },

  /**
   * Reset password with token
   * POST /customer/auth/reset-password
   *
   * @param token - Password reset token from email
   * @param password - New password
   * @returns Promise with no data (password reset confirmation)
   */
  resetPassword: async (token: string, password: string): Promise<void> => {
    const data: ResetPasswordData = { token, password };
    await apiClient.post("/customer/auth/reset-password", data);
  },
};

export default authService;
