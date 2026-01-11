/**
 * TanStack Query Client Configuration
 * Centralized query client setup with default options
 */

import { QueryClient } from "@tanstack/react-query";
import type { RoomSearchParams } from "../types/room.types";

/**
 * Create and configure the QueryClient instance
 * This client manages the cache and configuration for all queries and mutations
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Time data is considered fresh (5 minutes)
      staleTime: 5 * 60 * 1000,
      // Time until inactive data is garbage collected (30 minutes)
      gcTime: 30 * 60 * 1000,
      // Retry failed queries 3 times
      retry: 3,
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus for web
      refetchOnWindowFocus: false,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
    },
  },
});

/**
 * Query keys for the application
 * Centralized key management for cache invalidation
 */
export const queryKeys = {
  // Auth related keys
  auth: {
    all: ["auth"] as const,
    profile: () => [...queryKeys.auth.all, "profile"] as const,
  },
  // Room related keys
  rooms: {
    all: ["rooms"] as const,
    list: (params?: RoomSearchParams) =>
      [...queryKeys.rooms.all, "list", params] as const,
    detail: (id: string) => [...queryKeys.rooms.all, "detail", id] as const,
  },
  // Booking related keys
  bookings: {
    all: ["bookings"] as const,
    list: () => [...queryKeys.bookings.all, "list"] as const,
    detail: (id: string) => [...queryKeys.bookings.all, "detail", id] as const,
  },
} as const;

export default queryClient;
