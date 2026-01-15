/**
 * Payment Screen
 * Display QR code for payment and allow user to upload payment proof
 */

import { useCart } from "@/src/context/CartContext";
import bookingService from "@/src/services/booking.service";
import paymentService from "@/src/services/payment.service";
import type { CreateBookingRequest } from "@/src/types/booking.types";
import { handleApiError } from "@/src/utils/errorHandler";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Camera,
  CheckCircle,
  Image as ImageIcon,
  Upload,
  X,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface SelectedImage {
  uri: string;
  type: string;
  name: string;
}

export default function PaymentScreen() {
  const router = useRouter();
  const { cartItems, getCartTotal, clearCart } = useCart();

  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
  const [isLoadingQR, setIsLoadingQR] = useState(true);
  const [qrError, setQrError] = useState<string | null>(null);

  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);

  const subtotal = getCartTotal();
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;
  // Deposit is 30% of total
  const depositAmount = Math.round(total * 0.3);

  // Load QR code on mount
  useEffect(() => {
    loadPaymentQRCode();
  }, []);

  const loadPaymentQRCode = async () => {
    try {
      setIsLoadingQR(true);
      setQrError(null);
      const response = await paymentService.getPaymentQRCode();
      if (response.data?.base64) {
        setQrCodeBase64(response.data.base64);
      } else {
        setQrError("No QR code available");
      }
    } catch (error) {
      console.error("Error loading QR code:", error);
      const errorInfo = handleApiError(error, "Unable to load payment QR code");
      setQrError(errorInfo.message);
    } finally {
      setIsLoadingQR(false);
    }
  };

  const pickImage = async () => {
    try {
      // Check current permission status first
      const permissionResult =
        await ImagePicker.getMediaLibraryPermissionsAsync();

      // If permission not determined yet, request it
      if (permissionResult.status === "undetermined") {
        const requestResult =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        // On iOS 14+, "limited" access is returned via accessPrivileges
        if (
          requestResult.status !== "granted" &&
          requestResult.accessPrivileges !== "limited"
        ) {
          Alert.alert(
            "Permission Required",
            "Please allow access to your photo library to upload payment proof.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Open Settings",
                onPress: () => {
                  // On iOS this will open app settings
                  // On Android it opens app info page
                  import("expo-linking").then((Linking) => {
                    Linking.openSettings();
                  });
                },
              },
            ]
          );
          return;
        }
      } else if (permissionResult.status === "denied") {
        // Permission was previously denied, guide user to settings
        Alert.alert(
          "Permission Required",
          "Photo library access was denied. Please enable it in Settings to upload payment proof.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Open Settings",
              onPress: () => {
                import("expo-linking").then((Linking) => {
                  Linking.openSettings();
                });
              },
            },
          ]
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsMultipleSelection: true,
        selectionLimit: 5 - selectedImages.length,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        const newImages: SelectedImage[] = result.assets.map(
          (asset, index) => ({
            uri: asset.uri,
            type: asset.mimeType || "image/jpeg",
            name: asset.fileName || `payment_proof_${Date.now()}_${index}.jpg`,
          })
        );
        setSelectedImages((prev) => [...prev, ...newImages].slice(0, 5));
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to select image. Please try again.");
    }
  };

  const takePhoto = async () => {
    try {
      // Request camera permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please allow camera access to take a photo of your payment proof."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const newImage: SelectedImage = {
          uri: asset.uri,
          type: asset.mimeType || "image/jpeg",
          name: asset.fileName || `payment_proof_${Date.now()}.jpg`,
        };
        setSelectedImages((prev) => [...prev, newImage].slice(0, 5));
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo. Please try again.");
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitPayment = async () => {
    if (selectedImages.length === 0) {
      Alert.alert(
        "No Images Selected",
        "Please upload at least one payment proof image."
      );
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert("Error", "Your cart is empty");
      return;
    }

    setIsUploading(true);

    try {
      // Step 1: Create the booking first
      const bookingRequest: CreateBookingRequest = {
        rooms: cartItems.map((item) => ({
          roomId: item.room.id,
        })),
        checkInDate: cartItems[0].checkInDate!.toISOString(),
        checkOutDate: cartItems[0].checkOutDate!.toISOString(),
        totalGuests: cartItems.reduce(
          (acc, item) => acc + item.numberOfGuests,
          0
        ),
      };

      console.log(
        "Creating booking with payload:",
        JSON.stringify(bookingRequest, null, 2)
      );

      const bookingResponse = await bookingService.createBooking(
        bookingRequest
      );
      // The booking ID is in data.bookingId based on the CreateBookingResponse type
      const bookingId = bookingResponse.data.bookingId;
      setCreatedBookingId(bookingId);

      console.log("Booking created with ID:", bookingId);

      // Step 2: Upload payment proof images
      console.log("Uploading payment images for booking:", bookingId);

      await paymentService.uploadPaymentImages(
        bookingId,
        selectedImages,
        "Bank Transfer",
        `Deposit payment of ${depositAmount.toLocaleString("en-US")} VND`
      );

      console.log("Payment images uploaded successfully");

      // Step 3: Clear cart and show success modal
      clearCart();
      setShowSuccessModal(true);
    } catch (error: unknown) {
      console.error("Payment submission error:", error);
      const errorInfo = handleApiError(
        error,
        "Unable to submit payment. Please try again."
      );
      Alert.alert("Payment Failed", errorInfo.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    router.push("/(tabs)/my-bookings");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#007ef2" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Deposit Amount Card */}
          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>Deposit Amount (30%)</Text>
            <Text style={styles.amountValue}>
              {depositAmount.toLocaleString("en-US")} VND
            </Text>
            <Text style={styles.amountNote}>
              Please transfer this amount to complete your booking
            </Text>
          </View>

          {/* QR Code Section */}
          <View style={styles.qrSection}>
            <Text style={styles.sectionTitle}>Scan to Pay</Text>
            <Text style={styles.sectionSubtitle}>
              Use your banking app to scan this QR code
            </Text>

            <View style={styles.qrContainer}>
              {isLoadingQR ? (
                <View style={styles.qrLoading}>
                  <ActivityIndicator size="large" color="#007ef2" />
                  <Text style={styles.qrLoadingText}>Loading QR Code...</Text>
                </View>
              ) : qrError ? (
                <View style={styles.qrError}>
                  <Text style={styles.qrErrorText}>{qrError}</Text>
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={loadPaymentQRCode}
                  >
                    <Text style={styles.retryButtonText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : qrCodeBase64 ? (
                <Image
                  source={{ uri: qrCodeBase64 }}
                  style={styles.qrImage}
                  resizeMode="contain"
                />
              ) : null}
            </View>
          </View>

          {/* Upload Section */}
          <View style={styles.uploadSection}>
            <Text style={styles.sectionTitle}>Upload Payment Proof</Text>
            <Text style={styles.sectionSubtitle}>
              Take a screenshot or photo of your payment confirmation
            </Text>

            {/* Image Selection Buttons */}
            <View style={styles.uploadButtons}>
              <TouchableOpacity
                style={[
                  styles.uploadButton,
                  selectedImages.length >= 5 && styles.uploadButtonDisabled,
                ]}
                onPress={pickImage}
                disabled={selectedImages.length >= 5}
              >
                <ImageIcon
                  size={24}
                  color={selectedImages.length >= 5 ? "#ccc" : "#007ef2"}
                />
                <Text
                  style={[
                    styles.uploadButtonText,
                    selectedImages.length >= 5 &&
                      styles.uploadButtonTextDisabled,
                  ]}
                >
                  Gallery
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.uploadButton,
                  selectedImages.length >= 5 && styles.uploadButtonDisabled,
                ]}
                onPress={takePhoto}
                disabled={selectedImages.length >= 5}
              >
                <Camera
                  size={24}
                  color={selectedImages.length >= 5 ? "#ccc" : "#007ef2"}
                />
                <Text
                  style={[
                    styles.uploadButtonText,
                    selectedImages.length >= 5 &&
                      styles.uploadButtonTextDisabled,
                  ]}
                >
                  Camera
                </Text>
              </TouchableOpacity>
            </View>

            {/* Selected Images Preview */}
            {selectedImages.length > 0 && (
              <View style={styles.selectedImagesContainer}>
                <Text style={styles.selectedImagesLabel}>
                  Selected Images ({selectedImages.length}/5)
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.selectedImagesScroll}
                >
                  {selectedImages.map((image, index) => (
                    <View key={index} style={styles.selectedImageWrapper}>
                      <Image
                        source={{ uri: image.uri }}
                        style={styles.selectedImage}
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => removeImage(index)}
                      >
                        <X size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {selectedImages.length === 0 && (
              <View style={styles.noImagesContainer}>
                <Upload size={48} color="#ccc" />
                <Text style={styles.noImagesText}>No images selected yet</Text>
              </View>
            )}
          </View>

          {/* Spacer for button */}
          <View style={styles.buttonSpacer} />
        </ScrollView>

        {/* Bottom Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (isUploading || selectedImages.length === 0) &&
                styles.submitButtonDisabled,
            ]}
            onPress={handleSubmitPayment}
            disabled={isUploading || selectedImages.length === 0}
          >
            {isUploading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.submitButtonText}>Processing...</Text>
              </View>
            ) : (
              <Text style={styles.submitButtonText}>CONFIRM PAYMENT</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Success Modal */}
        <Modal
          visible={showSuccessModal}
          transparent
          animationType="fade"
          onRequestClose={handleSuccessModalClose}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.successIconContainer}>
                <CheckCircle size={64} color="#22c55e" />
              </View>
              <Text style={styles.successTitle}>Payment Submitted!</Text>
              <Text style={styles.successMessage}>
                Your booking has been created and payment proof has been
                uploaded. Our team will verify your payment shortly.
              </Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleSuccessModalClose}
              >
                <Text style={styles.modalButtonText}>View My Bookings</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5fafe",
  },
  container: {
    flex: 1,
    backgroundColor: "#f5fafe",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#007ef2",
    flex: 1,
    textAlign: "center",
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  amountCard: {
    backgroundColor: "#007ef2",
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  amountLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  amountNote: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
  },
  qrSection: {
    backgroundColor: "#fff",
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#7f7f7f",
    marginBottom: 16,
  },
  qrContainer: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 250,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
  },
  qrLoading: {
    alignItems: "center",
  },
  qrLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#7f7f7f",
  },
  qrError: {
    alignItems: "center",
  },
  qrErrorText: {
    fontSize: 14,
    color: "#ef4444",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#007ef2",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  qrImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 8,
  },
  uploadSection: {
    backgroundColor: "#fff",
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  uploadButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  uploadButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#e5f3ff",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#007ef2",
    borderStyle: "dashed",
  },
  uploadButtonDisabled: {
    backgroundColor: "#f5f5f5",
    borderColor: "#ccc",
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007ef2",
  },
  uploadButtonTextDisabled: {
    color: "#ccc",
  },
  selectedImagesContainer: {
    marginTop: 8,
  },
  selectedImagesLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#252424",
    marginBottom: 12,
  },
  selectedImagesScroll: {
    flexDirection: "row",
  },
  selectedImageWrapper: {
    marginRight: 12,
    position: "relative",
  },
  selectedImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#ef4444",
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  noImagesContainer: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
  },
  noImagesText: {
    marginTop: 12,
    fontSize: 14,
    color: "#7f7f7f",
  },
  buttonSpacer: {
    height: 24,
  },
  bottomContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 24 : 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  submitButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.95)",
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    width: "100%",
    maxWidth: 340,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 12,
    textAlign: "center",
  },
  successMessage: {
    fontSize: 15,
    color: "#7f7f7f",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: "#007ef2",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
