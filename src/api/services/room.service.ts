/**
 * Room Service
 * Handles all room-related API calls
 */

import type { Room, RoomSearchParams, RoomsListResponse } from "../../types";
import apiClient from "../client";
import { ROOM_ENDPOINTS } from "../endpoints";

/**
 * Room Service
 * Provides methods for room-related operations
 */
export const roomService = {
  /**
   * Get list of available rooms with optional filters
   * @param params - Search parameters for filtering rooms
   * @returns Promise with rooms list response
   */
  async getRooms(params?: RoomSearchParams): Promise<RoomsListResponse> {
    const response = await apiClient.get<RoomsListResponse>(
      ROOM_ENDPOINTS.SEARCH_ROOMS,
      { params }
    );
    return response.data;
  },

  /**
   * Get detailed information about a specific room
   * @param roomId - The ID of the room
   * @returns Promise with room details
   */
  async getRoomDetails(roomId: string): Promise<{ data: Room }> {
    const response = await apiClient.get<{ data: Room }>(
      ROOM_ENDPOINTS.GET_ROOM_DETAILS(roomId)
    );
    return response.data;
  },
};

export default roomService;
