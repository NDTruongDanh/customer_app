/**
 * Booking Hooks
 * TanStack Query hooks for booking operations
 */

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryClient";
import bookingService from "../services/booking.service";
import type { BookingSearchParams } from "../types/booking.types";

/**
 * Hook to get list of user bookings
 * @param params - Search parameters for filtering bookings
 * @param options - Query options
 */
export function useBookings(
  params?: BookingSearchParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.bookings.list(params),
    queryFn: () => bookingService.getBookings(params),
    enabled: options?.enabled ?? true,
    // Keep previous data while fetching new data
    placeholderData: (previousData) => previousData,
  });
}
