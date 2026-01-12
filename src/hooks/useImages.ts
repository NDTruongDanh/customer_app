/**
 * Image Hooks
 * TanStack Query hooks for fetching Cloudinary images
 */

import { useQuery } from "@tanstack/react-query";
import { imageService } from "../api";

/**
 * Query keys factory for images
 */
export const imageKeys = {
  all: ["images"] as const,
  roomTypes: () => [...imageKeys.all, "room-types"] as const,
  roomType: (id: string) => [...imageKeys.roomTypes(), id] as const,
  services: () => [...imageKeys.all, "services"] as const,
  service: (id: string) => [...imageKeys.services(), id] as const,
  rooms: () => [...imageKeys.all, "rooms"] as const,
  room: (id: string) => [...imageKeys.rooms(), id] as const,
};

/**
 * Hook to fetch images for a room type
 * @param roomTypeId - The ID of the room type
 * @returns TanStack Query result with room type images
 */
export const useRoomTypeImages = (roomTypeId: string) => {
  return useQuery({
    queryKey: imageKeys.roomType(roomTypeId),
    queryFn: () => imageService.getRoomTypeImages(roomTypeId),
    enabled: !!roomTypeId,
    staleTime: 5 * 60 * 1000, // 5 minutes - images don't change often
  });
};

/**
 * Hook to fetch images for a service
 * @param serviceId - The ID of the service
 * @returns TanStack Query result with service images
 */
export const useServiceImages = (serviceId: string) => {
  return useQuery({
    queryKey: imageKeys.service(serviceId),
    queryFn: () => imageService.getServiceImages(serviceId),
    enabled: !!serviceId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch images for a room
 * @param roomId - The ID of the room
 * @returns TanStack Query result with room images
 */
export const useRoomImages = (roomId: string) => {
  return useQuery({
    queryKey: imageKeys.room(roomId),
    queryFn: () => imageService.getRoomImages(roomId),
    enabled: !!roomId,
    staleTime: 5 * 60 * 1000,
  });
};
