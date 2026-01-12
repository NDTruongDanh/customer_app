/**
 * Image Service
 * Handles all image-related API calls for Cloudinary images
 */

import type { ImageResponse } from "../../types";
import apiClient from "../client";
import { IMAGE_ENDPOINTS } from "../endpoints";

/**
 * Image Service
 * Provides methods for fetching images from the backend
 */
export const imageService = {
  /**
   * Get all images for a room type
   * @param roomTypeId - The ID of the room type
   * @returns Promise with array of images
   */
  async getRoomTypeImages(roomTypeId: string): Promise<ImageResponse[]> {
    const response = await apiClient.get<ImageResponse[]>(
      IMAGE_ENDPOINTS.GET_ROOM_TYPE_IMAGES(roomTypeId)
    );
    return response.data;
  },

  /**
   * Get all images for a service
   * @param serviceId - The ID of the service
   * @returns Promise with array of images
   */
  async getServiceImages(serviceId: string): Promise<ImageResponse[]> {
    const response = await apiClient.get<ImageResponse[]>(
      IMAGE_ENDPOINTS.GET_SERVICE_IMAGES(serviceId)
    );
    return response.data;
  },

  /**
   * Get all images for a room
   * @param roomId - The ID of the room
   * @returns Promise with array of images
   */
  async getRoomImages(roomId: string): Promise<ImageResponse[]> {
    const response = await apiClient.get<ImageResponse[]>(
      IMAGE_ENDPOINTS.GET_ROOM_IMAGES(roomId)
    );
    return response.data;
  },
};

export default imageService;
