/**
 * Centralized Error Handler Utility
 * Provides consistent error message extraction from API errors
 */

import { AxiosError } from "axios";

export interface ApiErrorResponse {
  message?: string;
  error?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  code?: number;
  statusCode?: number;
}

export interface ErrorResult {
  message: string;
  statusCode?: number;
  isNetworkError: boolean;
  isAuthError: boolean;
  fieldErrors?: Array<{ field: string; message: string }>;
}

/**
 * Extract user-friendly error message from any error type
 * @param error - The error to handle (could be AxiosError, Error, or unknown)
 * @param fallbackMessage - Default message if error cannot be parsed
 * @returns ErrorResult with formatted message and metadata
 */
export const handleApiError = (
  error: unknown,
  fallbackMessage: string = "An unexpected error occurred. Please try again."
): ErrorResult => {
  // Handle Axios errors
  if (isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;

    // Network error (no response)
    if (!axiosError.response) {
      return {
        message:
          "Network error. Please check your internet connection and try again.",
        isNetworkError: true,
        isAuthError: false,
      };
    }

    const { status, data } = axiosError.response;

    // Authentication errors
    if (status === 401) {
      return {
        message:
          data?.message || "Your session has expired. Please login again.",
        statusCode: 401,
        isNetworkError: false,
        isAuthError: true,
      };
    }

    // Forbidden errors
    if (status === 403) {
      return {
        message:
          data?.message || "You don't have permission to perform this action.",
        statusCode: 403,
        isNetworkError: false,
        isAuthError: false,
      };
    }

    // Validation errors (usually 400)
    if (status === 400 && data?.errors && Array.isArray(data.errors)) {
      const fieldErrors = data.errors.map((e) => ({
        field: e.field,
        message: e.message,
      }));
      const formattedMessage = fieldErrors
        .map((e) => `${e.field}: ${e.message}`)
        .join("\n");

      return {
        message:
          formattedMessage ||
          data?.message ||
          "Invalid input. Please check your data.",
        statusCode: 400,
        isNetworkError: false,
        isAuthError: false,
        fieldErrors,
      };
    }

    // Not found errors
    if (status === 404) {
      return {
        message: data?.message || "The requested resource was not found.",
        statusCode: 404,
        isNetworkError: false,
        isAuthError: false,
      };
    }

    // Conflict errors
    if (status === 409) {
      return {
        message: data?.message || "This action conflicts with existing data.",
        statusCode: 409,
        isNetworkError: false,
        isAuthError: false,
      };
    }

    // Server errors
    if (status >= 500) {
      return {
        message: "Server error. Please try again later.",
        statusCode: status,
        isNetworkError: false,
        isAuthError: false,
      };
    }

    // Other API errors with message
    if (data?.message) {
      return {
        message: data.message,
        statusCode: status,
        isNetworkError: false,
        isAuthError: false,
      };
    }

    if (data?.error) {
      return {
        message: data.error,
        statusCode: status,
        isNetworkError: false,
        isAuthError: false,
      };
    }
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    // Check for network-related error messages
    if (
      error.message.includes("Network") ||
      error.message.includes("network") ||
      error.message.includes("ECONNREFUSED") ||
      error.message.includes("Failed to fetch")
    ) {
      return {
        message: "Network error. Please check your internet connection.",
        isNetworkError: true,
        isAuthError: false,
      };
    }

    return {
      message: error.message || fallbackMessage,
      isNetworkError: false,
      isAuthError: false,
    };
  }

  // Handle string errors
  if (typeof error === "string") {
    return {
      message: error,
      isNetworkError: false,
      isAuthError: false,
    };
  }

  // Unknown error type
  return {
    message: fallbackMessage,
    isNetworkError: false,
    isAuthError: false,
  };
};

/**
 * Type guard to check if error is an Axios error
 */
function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError)?.isAxiosError === true;
}

/**
 * Get a simple error message string from any error
 * Useful for quick error message extraction
 */
export const getErrorMessage = (
  error: unknown,
  fallbackMessage: string = "An unexpected error occurred."
): string => {
  return handleApiError(error, fallbackMessage).message;
};

/**
 * Check if error is a network/connection error
 */
export const isNetworkError = (error: unknown): boolean => {
  return handleApiError(error).isNetworkError;
};

/**
 * Check if error is an authentication error
 */
export const isAuthError = (error: unknown): boolean => {
  return handleApiError(error).isAuthError;
};
