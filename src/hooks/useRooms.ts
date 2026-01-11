/**
 * Room Hooks
 * TanStack Query hooks for room operations
 */

import { useQuery } from "@tanstack/react-query";
import { roomService } from "../api";
import { queryKeys } from "../lib/queryClient";
import type { RoomSearchParams } from "../types/room.types";

/**
 * Hook to get list of available rooms
 * @param params - Search parameters for filtering rooms
 * @param options - Query options
 */
export function useRooms(
  params?: RoomSearchParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.rooms.list(params),
    queryFn: () => roomService.getRooms(params),
    enabled: options?.enabled ?? true,
    // Keep previous data while fetching new data
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook to get room details
 * @param roomId - The ID of the room to fetch
 * @param options - Query options
 */
export function useRoomDetails(
  roomId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.rooms.detail(roomId),
    queryFn: () => roomService.getRoomDetails(roomId),
    enabled: (options?.enabled ?? true) && !!roomId,
  });
}
