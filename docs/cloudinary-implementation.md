# Mobile Implementation Guide - Cloudinary Image Management (React Native)

## Overview

This guide covers the React Native mobile app implementation for customer booking. Uses **Signed Direct Upload** (files go directly to Cloudinary with signed permission, then metadata to backend).

---

## 1. Dependencies Installation

```bash
# Image picker
npm install react-native-image-picker

# Fast image with caching
npm install react-native-fast-image

# TanStack Query
npm install @tanstack/react-query axios

# AsyncStorage for token
npm install @react-native-async-storage/async-storage

# For iOS
cd ios && pod install && cd ..
```

---

## 2. Platform-Specific Setup

### iOS Permissions

**File: `ios/YourApp/Info.plist`**

```xml
<key>NSPhotoLibraryUsageDescription</key>
<string>We need access to your photo library to upload room images</string>
<key>NSCameraUsageDescription</key>
<string>We need access to your camera to take room photos</string>
```

### Android Permissions

**File: `android/app/src/main/AndroidManifest.xml`**

```xml
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.CAMERA"/>
```

---

## 3. Environment Variables

**File: `.env`** (or use react-native-config)

```env
API_URL=http://localhost:3001/api
# For production: https://api.yourhotel.com/api
```

---

## 4. API Client Setup

**File: `src/lib/api/axios-instance.ts`**

```typescript
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const apiClient = axios.create({
  baseURL: process.env.API_URL || "http://localhost:3001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for auth token
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem("auth_token");
      // Navigate to login screen
    }
    return Promise.reject(error);
  }
);
```

---

## 5. Image API Functions

**File: `src/lib/api/image.api.ts`**

```typescript
import { apiClient } from "./axios-instance";

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

export interface UploadSignature {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
  tags: string;
}

export const imageApi = {
  // ==================== GET UPLOAD SIGNATURE ====================

  getUploadSignature: async (
    entityType: "roomType" | "service" | "room",
    entityId: string
  ): Promise<UploadSignature> => {
    const endpoint =
      entityType === "roomType"
        ? `/room-types/${entityId}/upload-signature`
        : entityType === "service"
        ? `/services/${entityId}/upload-signature`
        : `/rooms/${entityId}/upload-signature`;

    const { data } = await apiClient.get(endpoint);
    return data;
  },

  // ==================== SAVE DIRECT UPLOAD ====================

  saveDirectUpload: async (
    entityType: "roomType" | "service" | "room",
    entityId: string,
    uploadData: {
      cloudinaryId: string;
      url: string;
      secureUrl: string;
      width: number;
      height: number;
      format: string;
    }
  ): Promise<ImageResponse> => {
    const endpoint =
      entityType === "roomType"
        ? `/room-types/${entityId}/images/direct`
        : entityType === "service"
        ? `/services/${entityId}/images/direct`
        : `/rooms/${entityId}/images/direct`;

    const { data } = await apiClient.post(endpoint, uploadData);
    return data;
  },

  // ==================== READ ====================

  getRoomTypeImages: async (roomTypeId: string): Promise<ImageResponse[]> => {
    const { data } = await apiClient.get(`/room-types/${roomTypeId}/images`);
    return data;
  },

  getServiceImages: async (serviceId: string): Promise<ImageResponse[]> => {
    const { data } = await apiClient.get(`/services/${serviceId}/images`);
    return data;
  },

  // ==================== DELETE ====================

  deleteRoomTypeImage: async (
    imageId: string
  ): Promise<{ success: boolean }> => {
    const { data } = await apiClient.delete(`/room-types/images/${imageId}`);
    return data;
  },

  deleteServiceImage: async (
    imageId: string
  ): Promise<{ success: boolean }> => {
    const { data } = await apiClient.delete(`/services/images/${imageId}`);
    return data;
  },
};
```

---

## 6. TanStack Query Hooks

**File: `src/hooks/useImageUpload.ts`**

```typescript
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { imageApi, ImageResponse } from "@/lib/api/image.api";
import { Alert } from "react-native";

// Query keys factory
export const imageKeys = {
  all: ["images"] as const,
  roomTypes: () => [...imageKeys.all, "room-types"] as const,
  roomType: (id: string) => [...imageKeys.roomTypes(), id] as const,
  services: () => [...imageKeys.all, "services"] as const,
  service: (id: string) => [...imageKeys.services(), id] as const,
};

// ==================== ROOM TYPE IMAGES ====================

export const useRoomTypeImages = (roomTypeId: string) => {
  return useQuery({
    queryKey: imageKeys.roomType(roomTypeId),
    queryFn: () => imageApi.getRoomTypeImages(roomTypeId),
    enabled: !!roomTypeId,
  });
};

// Note: This hook is for triggering refetch after direct upload
export const useUploadRoomTypeImageDirect = (roomTypeId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // This just triggers a refetch
      await queryClient.invalidateQueries({
        queryKey: imageKeys.roomType(roomTypeId),
      });
    },
  });
};

export const useDeleteRoomTypeImage = (roomTypeId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageId: string) => imageApi.deleteRoomTypeImage(imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: imageKeys.roomType(roomTypeId),
      });
      Alert.alert("Success", "Image deleted successfully");
    },
    onError: (error: any) => {
      Alert.alert(
        "Error",
        error.response?.data?.error || "Failed to delete image"
      );
    },
  });
};

// ==================== SERVICE IMAGES ====================

export const useServiceImages = (serviceId: string) => {
  return useQuery({
    queryKey: imageKeys.service(serviceId),
    queryFn: () => imageApi.getServiceImages(serviceId),
    enabled: !!serviceId,
  });
};

export const useUploadServiceImageDirect = (serviceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await queryClient.invalidateQueries({
        queryKey: imageKeys.service(serviceId),
      });
    },
  });
};

export const useDeleteServiceImage = (serviceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageId: string) => imageApi.deleteServiceImage(imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: imageKeys.service(serviceId) });
      Alert.alert("Success", "Image deleted successfully");
    },
    onError: (error: any) => {
      Alert.alert(
        "Error",
        error.response?.data?.error || "Failed to delete image"
      );
    },
  });
};
```

---

## 7. Image Upload Component

**File: `src/components/ImageUpload.tsx`**

```typescript
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import {
  launchImageLibrary,
  ImagePickerResponse,
  Asset,
} from "react-native-image-picker";
import FastImage from "react-native-fast-image";
import {
  useRoomTypeImages,
  useUploadRoomTypeImageDirect,
  useDeleteRoomTypeImage,
  useServiceImages,
  useUploadServiceImageDirect,
  useDeleteServiceImage,
} from "@/hooks/useImageUpload";
import { ImageResponse, imageApi } from "@/lib/api/image.api";

interface ImageUploadProps {
  entityType: "roomType" | "service";
  entityId: string;
}

const { width } = Dimensions.get("window");
const imageSize = (width - 48) / 3; // 3 columns with padding

export default function ImageUpload({
  entityType,
  entityId,
}: ImageUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<Asset[]>([]);
  const [uploading, setUploading] = useState(false);

  // Hooks based on entity type
  const { data: images = [], isLoading } =
    entityType === "roomType"
      ? useRoomTypeImages(entityId)
      : useServiceImages(entityId);

  const refetchMutation =
    entityType === "roomType"
      ? useUploadRoomTypeImageDirect(entityId)
      : useUploadServiceImageDirect(entityId);

  const deleteMutation =
    entityType === "roomType"
      ? useDeleteRoomTypeImage(entityId)
      : useDeleteServiceImage(entityId);

  // Pick images from library
  const handlePickImages = async () => {
    const result: ImagePickerResponse = await launchImageLibrary({
      mediaType: "photo",
      selectionLimit: 10,
      quality: 0.8,
    });

    if (result.assets) {
      setSelectedFiles(result.assets);
    }
  };

  // SIGNED DIRECT UPLOAD FLOW
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);

    try {
      // Upload all files in parallel
      const uploadPromises = selectedFiles.map(async (asset) => {
        // Step 1: Get signature from backend
        const signatureData = await imageApi.getUploadSignature(
          entityType,
          entityId
        );

        // Step 2: Upload directly to Cloudinary
        const formData = new FormData();
        formData.append("file", {
          uri: asset.uri!,
          type: asset.type || "image/jpeg",
          name: asset.fileName || `image_${Date.now()}.jpg`,
        } as any);
        formData.append("api_key", signatureData.apiKey);
        formData.append("signature", signatureData.signature);
        formData.append("timestamp", signatureData.timestamp.toString());
        formData.append("folder", signatureData.folder);
        formData.append("tags", signatureData.tags);

        const cloudinaryResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!cloudinaryResponse.ok) {
          throw new Error("Failed to upload to Cloudinary");
        }

        const cloudinaryData = await cloudinaryResponse.json();

        // Step 3: Save metadata to backend database
        return imageApi.saveDirectUpload(entityType, entityId, {
          cloudinaryId: cloudinaryData.public_id,
          url: cloudinaryData.url,
          secureUrl: cloudinaryData.secure_url,
          width: cloudinaryData.width,
          height: cloudinaryData.height,
          format: cloudinaryData.format,
        });
      });

      const results = await Promise.allSettled(uploadPromises);

      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      if (failed > 0) {
        Alert.alert(
          "Partial Upload",
          `${successful} of ${selectedFiles.length} images uploaded successfully`
        );
      } else {
        Alert.alert("Success", "All images uploaded successfully");
      }

      setSelectedFiles([]);

      // Refetch images
      refetchMutation.mutate();
    } catch (error) {
      Alert.alert("Error", "Failed to upload images");
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  // Delete image
  const handleDelete = (imageId: string) => {
    Alert.alert("Delete Image", "Are you sure you want to delete this image?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteMutation.mutate(imageId),
      },
    ]);
  };

  // Render uploaded image
  const renderImageItem = ({ item }: { item: ImageResponse }) => {
    // Calculate aspect ratio to prevent layout shift
    const aspectRatio =
      item.width && item.height ? item.width / item.height : 1;

    return (
      <View style={[styles.imageContainer, { aspectRatio }]}>
        <FastImage
          source={{
            uri: item.thumbnailUrl || item.url,
            priority: FastImage.priority.normal,
          }}
          style={styles.image}
          resizeMode={FastImage.resizeMode.cover}
        />
        {item.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>Default</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id)}
        >
          <Text style={styles.deleteText}>×</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render selected file preview
  const renderSelectedFile = ({ item }: { item: Asset }) => {
    const aspectRatio =
      item.width && item.height ? item.width / item.height : 1;

    return (
      <View style={[styles.imageContainer, { aspectRatio }]}>
        <FastImage
          source={{ uri: item.uri!, priority: FastImage.priority.normal }}
          style={styles.image}
          resizeMode={FastImage.resizeMode.cover}
        />
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Upload Section */}
      <View style={styles.uploadSection}>
        <TouchableOpacity
          style={styles.pickButton}
          onPress={handlePickImages}
          disabled={uploading}
        >
          <Text style={styles.pickButtonText}>
            {selectedFiles.length > 0
              ? `${selectedFiles.length} Selected`
              : "Pick Images"}
          </Text>
        </TouchableOpacity>

        {selectedFiles.length > 0 && (
          <View style={styles.selectedSection}>
            <FlatList
              data={selectedFiles}
              renderItem={renderSelectedFile}
              keyExtractor={(item, index) => index.toString()}
              numColumns={3}
              scrollEnabled={false}
            />
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.button, styles.clearButton]}
                onPress={() => setSelectedFiles([])}
              >
                <Text style={styles.buttonText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.uploadButton,
                  uploading && styles.buttonDisabled,
                ]}
                onPress={handleUpload}
                disabled={uploading}
              >
                <Text style={styles.buttonText}>
                  {uploading ? "Uploading..." : "Upload"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Uploaded Images */}
      <View style={styles.uploadedSection}>
        <Text style={styles.sectionTitle}>
          Uploaded Images ({images.length})
        </Text>
        {images.length === 0 ? (
          <Text style={styles.emptyText}>No images uploaded yet</Text>
        ) : (
          <FlatList
            data={images}
            renderItem={renderImageItem}
            keyExtractor={(item) => item.id}
            numColumns={3}
            scrollEnabled={false}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadSection: {
    marginBottom: 24,
  },
  pickButton: {
    backgroundColor: "#3b82f6",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  pickButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  selectedSection: {
    marginTop: 16,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  clearButton: {
    backgroundColor: "#6b7280",
  },
  uploadButton: {
    backgroundColor: "#10b981",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  uploadedSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  emptyText: {
    textAlign: "center",
    color: "#9ca3af",
    marginTop: 32,
  },
  imageContainer: {
    width: imageSize,
    margin: 4,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  defaultBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: "#3b82f6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  defaultText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  deleteButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#ef4444",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    lineHeight: 20,
  },
});
```

---

## 8. Optimized Image Component

**File: `src/components/CloudinaryImage.tsx`**

```typescript
import React from "react";
import FastImage, { FastImageProps } from "react-native-fast-image";

interface CloudinaryImageProps extends Omit<FastImageProps, "source"> {
  src: string;
  width?: number;
  transformation?: string;
}

export const CloudinaryImage: React.FC<CloudinaryImageProps> = ({
  src,
  width,
  transformation,
  ...props
}) => {
  // Apply Cloudinary transformations for mobile optimization
  const getOptimizedUrl = () => {
    if (!src.includes("cloudinary.com")) return src;

    let transformations = "f_auto,q_auto"; // Auto format and quality

    if (width) {
      transformations += `,w_${width}`;
    }

    if (transformation) {
      transformations += `,${transformation}`;
    }

    return src.replace("/upload/", `/upload/${transformations}/`);
  };

  return (
    <FastImage
      {...props}
      source={{
        uri: getOptimizedUrl(),
        priority: FastImage.priority.normal,
      }}
    />
  );
};

// Usage example:
// <CloudinaryImage
//   src={roomType.images[0].url}
//   width={400}
//   transformation="c_fill,ar_16:9"
//   style={styles.image}
//   resizeMode={FastImage.resizeMode.cover}
// />
```

---

## 9. Query Provider Setup

**File: `src/providers/QueryProvider.tsx`**

```typescript
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
```

**File: `App.tsx`**

```typescript
import React from "react";
import { QueryProvider } from "./src/providers/QueryProvider";
import { NavigationContainer } from "@react-navigation/native";
import { RootNavigator } from "./src/navigation/RootNavigator";

export default function App() {
  return (
    <QueryProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </QueryProvider>
  );
}
```

---

## 10. Testing Checklist

### Component Tests

- [ ] ImageUpload renders correctly
- [ ] Image picker opens
- [ ] Selected images display with correct aspect ratios
- [ ] Upload triggers signed direct upload flow
- [ ] Delete confirmation works
- [ ] Loading states show during upload

### Integration Tests

- [ ] Get upload signature from backend
- [ ] Upload directly to Cloudinary
- [ ] Save metadata to backend
- [ ] Handle partial upload failures
- [ ] Delete image end-to-end

### Platform Tests

- [ ] iOS permissions work
- [ ] Android permissions work
- [ ] Image picker works on both platforms
- [ ] FastImage caching works
- [ ] Network errors handled gracefully

### Performance Tests

- [ ] Upload 10 images simultaneously
- [ ] No layout shift during image load
- [ ] Memory usage stays reasonable
- [ ] App doesn't crash on large images

---

## 11. Common Issues & Solutions

### Issue: Permission denied

**Solution:** Check Info.plist (iOS) and AndroidManifest.xml (Android)

### Issue: Upload fails silently

**Check:**

- Network connectivity
- Cloudinary signature generation
- Backend /upload-signature endpoint
- Logs in terminal

### Issue: Images not displaying

**Check:**

- URL format from Cloudinary
- FastImage cache (clear with `FastImage.clearDiskCache()`)
- Network permissions

### Issue: Layout shifts when images load

**Solution:** Always calculate and use aspect ratio from width/height

### Issue: App crashes when uploading

**Check:**

- File size (compress before upload if needed)
- Memory leaks in component
- Use Promise.allSettled for batch uploads

---

## 12. Performance Optimization Tips

### Image Compression

```typescript
import ImageResizer from "react-native-image-resizer";

const compressImage = async (uri: string) => {
  const resized = await ImageResizer.createResizedImage(
    uri,
    1200, // max width
    1200, // max height
    "JPEG",
    80 // quality
  );
  return resized.uri;
};
```

### Caching Strategy

```typescript
// Preload critical images
FastImage.preload([{ uri: "https://...", priority: FastImage.priority.high }]);

// Clear cache when needed
await FastImage.clearMemoryCache();
await FastImage.clearDiskCache();
```
