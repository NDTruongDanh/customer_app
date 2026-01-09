/**
 * API Configuration
 * Contains all configuration values for API communication
 */

// API Base URL from environment variables or default
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://room-master-dcdsfng4c7h7hwbg.eastasia-01.azurewebsites.net/v1";

// API timeout in milliseconds
export const API_TIMEOUT = 30000; // 30 seconds

// Token refresh configuration
export const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry
