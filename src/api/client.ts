/**
 * Axios HTTP Client Configuration
 * Includes request/response interceptors for authentication
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import { API_BASE_URL, API_TIMEOUT } from "../constants/config";

// Flag to prevent multiple refresh token requests simultaneously
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

/**
 * Subscribe to token refresh
 */
const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

/**
 * Notify all subscribers with new token
 */
const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

/**
 * Clear tokens from storage and reset refresh state
 */
const clearAuthTokens = async () => {
  await AsyncStorage.removeItem("accessToken");
  await AsyncStorage.removeItem("refreshToken");
  await AsyncStorage.removeItem("userData");
  isRefreshing = false;
  refreshSubscribers = [];
};

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
      // Get access token from storage
      const accessToken = await AsyncStorage.getItem("accessToken");

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
 * Automatically refreshes tokens when they expire
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
    if (error.response?.status === 401 && originalRequest) {
      // Don't try to refresh if this is already a refresh token request
      const isRefreshRequest = originalRequest.url?.includes("refresh-tokens");

      if (isRefreshRequest) {
        // Refresh token is invalid, clear auth and reject
        await clearAuthTokens();
        return Promise.reject(error);
      }

      // Check if we've already tried to refresh the token for this request
      if (!originalRequest._retry) {
        originalRequest._retry = true;

        // If we're already refreshing, wait for the new token
        if (isRefreshing) {
          return new Promise((resolve) => {
            subscribeTokenRefresh((newToken: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
              }
              resolve(apiClient(originalRequest));
            });
          });
        }

        isRefreshing = true;

        try {
          // Get refresh token from storage
          const refreshToken = await AsyncStorage.getItem("refreshToken");

          if (!refreshToken) {
            // No refresh token available, clear auth
            await clearAuthTokens();
            return Promise.reject(error);
          }

          // Make refresh token request directly to avoid circular dependency
          const refreshResponse = await axios.post(
            `${API_BASE_URL}/customer/auth/refresh-tokens`,
            { refreshToken },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          const { tokens } = refreshResponse.data.data;
          const newAccessToken = tokens.access.token;
          const newRefreshToken = tokens.refresh.token;

          // Store new tokens
          await AsyncStorage.setItem("accessToken", newAccessToken);
          await AsyncStorage.setItem("refreshToken", newRefreshToken);

          isRefreshing = false;

          // Notify all waiting requests with the new token
          onTokenRefreshed(newAccessToken);

          // Update the Authorization header with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }

          // Retry the original request
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh token failed or is invalid
          console.error("Token refresh failed:", refreshError);

          // Clear all stored tokens
          await clearAuthTokens();

          // Reject with the refresh error
          return Promise.reject(refreshError);
        }
      }

      // If retry already happened and still failed, clear storage
      await clearAuthTokens();
    }

    // Return other errors as-is
    return Promise.reject(error);
  }
);

export default apiClient;
