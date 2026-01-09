/**
 * Axios HTTP Client Configuration
 * Includes request/response interceptors for authentication
 */

import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL, API_TIMEOUT } from "../constants/config";

/**
 * Create and configure Axios instance
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor
 * Automatically adds authentication token to requests
 */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // Get access token from secure storage
      const accessToken = await SecureStore.getItemAsync("accessToken");

      if (accessToken && config.headers) {
        // Add Bearer token to Authorization header
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      return config;
    } catch (error) {
      console.error("Error in request interceptor:", error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 * Handles common error scenarios like token expiration
 */
apiClient.interceptors.response.use(
  (response) => {
    // Return successful responses as-is
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Check if we've already tried to refresh the token
      if (!originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Try to refresh the token
          const refreshToken = await SecureStore.getItemAsync("refreshToken");

          if (refreshToken) {
            // Import authService to avoid circular dependency
            // Using dynamic import to handle circular dependency between client and auth service
            // @ts-expect-error - Dynamic import path resolved at runtime
            const authServiceModule = await import("./services/auth.service");
            const authService =
              authServiceModule.default || authServiceModule.authService;
            const response = await authService.refreshTokens(refreshToken);

            // Store new tokens
            await SecureStore.setItemAsync(
              "accessToken",
              response.tokens.access.token
            );
            await SecureStore.setItemAsync(
              "refreshToken",
              response.tokens.refresh.token
            );

            // Update the Authorization header with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${response.tokens.access.token}`;
            }

            // Retry the original request
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          // Refresh token failed or is invalid
          console.error("Token refresh failed:", refreshError);

          // Clear all stored tokens
          await SecureStore.deleteItemAsync("accessToken");
          await SecureStore.deleteItemAsync("refreshToken");

          // You might want to navigate to login screen here
          // This will be handled in the AuthContext

          return Promise.reject(refreshError);
        }
      }

      // If retry failed or no refresh token, clear storage
      await SecureStore.deleteItemAsync("accessToken");
      await SecureStore.deleteItemAsync("refreshToken");
    }

    // Return other errors as-is
    return Promise.reject(error);
  }
);

export default apiClient;
