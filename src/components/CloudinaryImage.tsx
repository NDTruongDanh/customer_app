/**
 * CloudinaryImage Component
 * Optimized image component for displaying Cloudinary images
 * Uses expo-image for caching and efficient loading
 */

import { Image, ImageProps, ImageStyle } from "expo-image";
import React from "react";
import { StyleProp, StyleSheet, View } from "react-native";

interface CloudinaryImageProps extends Omit<ImageProps, "source" | "style"> {
  /**
   * The image URL from Cloudinary
   */
  src: string;
  /**
   * Target width for image optimization
   */
  width?: number;
  /**
   * Additional Cloudinary transformations (e.g., "c_fill,ar_16:9")
   */
  transformation?: string;
  /**
   * Style to apply to the image
   */
  style?: StyleProp<ImageStyle>;
  /**
   * Fallback component to show when image fails to load
   */
  fallback?: React.ReactNode;
}

/**
 * Build optimized Cloudinary URL with transformations
 */
const getOptimizedUrl = (
  src: string,
  width?: number,
  transformation?: string
): string => {
  // Only apply transformations to Cloudinary URLs
  if (!src || !src.includes("cloudinary.com")) {
    return src;
  }

  // Build transformation string
  let transformations = "f_auto,q_auto"; // Auto format and quality

  if (width) {
    transformations += `,w_${width}`;
  }

  if (transformation) {
    transformations += `,${transformation}`;
  }

  // Insert transformations into URL
  return src.replace("/upload/", `/upload/${transformations}/`);
};

/**
 * CloudinaryImage Component
 *
 * A wrapper around expo-image that applies Cloudinary optimizations
 * and provides consistent loading/error handling.
 *
 * @example
 * ```tsx
 * <CloudinaryImage
 *   src={room.images[0]?.secureUrl}
 *   width={400}
 *   transformation="c_fill,ar_16:9"
 *   style={styles.roomImage}
 * />
 * ```
 */
export const CloudinaryImage: React.FC<CloudinaryImageProps> = ({
  src,
  width,
  transformation,
  style,
  fallback,
  placeholder = "blurhash",
  contentFit = "cover",
  transition = 200,
  ...props
}) => {
  const optimizedUrl = getOptimizedUrl(src, width, transformation);

  // If no source URL, show fallback
  if (!src) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <View style={[styles.placeholder, style as object]} />
    );
  }

  return (
    <Image
      source={{ uri: optimizedUrl }}
      style={style}
      placeholder={placeholder}
      contentFit={contentFit}
      transition={transition}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: "#e8f4fd",
  },
});

export default CloudinaryImage;
