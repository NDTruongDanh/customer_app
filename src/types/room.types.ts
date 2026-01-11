/**
 * Room Type Definitions
 * Types for room-related API responses and data structures
 */

/**
 * Room Tag - Amenities/features like WiFi, TV, etc.
 */
export interface RoomTag {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Room Type Tag - Junction between room type and tags
 */
export interface RoomTypeTag {
  id: string;
  name: string;
  roomTypeId: string;
  roomTagId: string;
  roomTag: RoomTag;
}

/**
 * Room Type - Category of room (Standard, Deluxe, Suite, etc.)
 */
export interface RoomType {
  id: string;
  name: string;
  capacity: number;
  totalBed: number;
  basePrice: string;
  createdAt: string;
  updatedAt: string;
  roomTypeTags: RoomTypeTag[];
}

/**
 * Room Status
 */
export type RoomStatus = "AVAILABLE" | "OCCUPIED" | "MAINTENANCE" | "RESERVED";

/**
 * Room - Individual room entity
 */
export interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  code: string;
  status: RoomStatus;
  roomTypeId: string;
  createdAt: string;
  updatedAt: string;
  roomType: RoomType;
  _count: {
    bookingRooms: number;
  };
}

/**
 * Rooms List Response
 */
export interface RoomsListResponse {
  data: {
    data: Room[];
    total: number;
    page: number;
    limit: number;
  };
}

/**
 * Room Search Params
 */
export interface RoomSearchParams {
  page?: number;
  limit?: number;
  status?: RoomStatus;
  roomTypeId?: string;
  minPrice?: number;
  maxPrice?: number;
  capacity?: number;
  checkInDate: string;
  checkOutDate: string;
}
