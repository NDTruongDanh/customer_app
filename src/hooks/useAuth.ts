/**
 * Authentication Hooks
 * TanStack Query hooks for authentication operations
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "../api";
import { queryKeys } from "../lib/queryClient";
import type {
  AuthResponse,
  CustomerProfileResponse,
  RegisterData,
  UpdateProfileData,
} from "../types/auth.types";

/**
 * Hook for user login
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ phone, password }: { phone: string; password: string }) =>
      authService.login(phone, password),
    onSuccess: async (response: AuthResponse) => {
      // Store tokens securely
      await AsyncStorage.setItem(
        "accessToken",
        response.data.tokens.access.token
      );
      await AsyncStorage.setItem(
        "refreshToken",
        response.data.tokens.refresh.token
      );
      // Store customer data
      await AsyncStorage.setItem(
        "userData",
        JSON.stringify(response.data.customer)
      );
      // Invalidate profile query to refetch with new auth
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile() });
    },
  });
}

/**
 * Hook for user registration
 */
export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterData) => authService.register(data),
    onSuccess: async (response: AuthResponse) => {
      // Store tokens securely
      await AsyncStorage.setItem(
        "accessToken",
        response.data.tokens.access.token
      );
      await AsyncStorage.setItem(
        "refreshToken",
        response.data.tokens.refresh.token
      );
      // Store customer data
      await AsyncStorage.setItem(
        "userData",
        JSON.stringify(response.data.customer)
      );
      // Invalidate profile query to refetch with new auth
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile() });
    },
  });
}

/**
 * Hook for user logout
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    },
    onSuccess: async () => {
      // Clear all stored data
      await AsyncStorage.removeItem("accessToken");
      await AsyncStorage.removeItem("refreshToken");
      await AsyncStorage.removeItem("userData");
      // Clear all queries from cache
      queryClient.clear();
    },
    onError: async () => {
      // Clear tokens even if API call fails
      await AsyncStorage.removeItem("accessToken");
      await AsyncStorage.removeItem("refreshToken");
      await AsyncStorage.removeItem("userData");
      // Clear all queries from cache
      queryClient.clear();
    },
  });
}

/**
 * Hook to get customer profile
 */
export function useProfile(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.auth.profile(),
    queryFn: () => authService.getProfile(),
    enabled: options?.enabled ?? true,
  });
}

/**
 * Hook to update customer profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileData) => authService.updateProfile(data),
    onSuccess: (response: CustomerProfileResponse) => {
      // Update profile in cache with new data
      queryClient.setQueryData(queryKeys.auth.profile(), response);
      // Also invalidate to ensure data is fresh
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile() });
    },
  });
}

/**
 * Hook for forgot password
 */
export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
  });
}

/**
 * Hook for reset password
 */
export function useResetPassword() {
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      authService.resetPassword(token, password),
  });
}
