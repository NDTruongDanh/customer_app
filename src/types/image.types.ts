/**
 * Image Type Definitions
 * Types for Cloudinary image responses and related data structures
 */

/**
 * Image Response - Represents an image stored in Cloudinary
 */
export interface ImageResponse {
  id: string;
  url: string;
  secureUrl: string;
  thumbnailUrl?: string;
  cloudinaryId: string;
  width?: number;
  height?: number;
  format?: string;
  sortOrder: number;
  isDefault: boolean;
  createdAt: string;
}

/**
 * Upload Signature - For signed direct uploads (admin use)
 * Included for completeness but not used in customer app
 */
export interface UploadSignature {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
  tags: string;
}
