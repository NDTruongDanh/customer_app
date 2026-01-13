/**
 * Booking Detail Screen
 * Shows detailed information about a specific booking
 * Allows users to cancel pending bookings
 */

import CloudinaryImage from "@/src/components/CloudinaryImage";
import bookingService from "@/src/services/booking.service";
import { Booking, BookingStatus } from "@/src/types/booking.types";
import { showAlert } from "@/src/utils/alert";
import { format } from "date-fns";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CreditCard,
  MapPin,
  Users,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BookingDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Parse booking data from params
  const booking: Booking = params.booking
    ? JSON.parse(params.booking as string)
    : null;

  if (!booking) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <AlertCircle size={64} color="#dc2626" />
          <Text style={styles.errorText}>Booking not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const firstRoom = booking.bookingRooms[0];
  const roomType = firstRoom?.roomType;
  const room = firstRoom?.room;

  // Image Priority:
  // 1. Room Default Image
  // 2. Room First Image
  // 3. Room Type Default Image
  // 4. Room Type First Image
  // 5. Legacy/Fallback URL
  const roomImage =
    room?.images?.find((img) => img.isDefault) || room?.images?.[0];
  const roomTypeImage =
    roomType?.images?.find((img) => img.isDefault) || roomType?.images?.[0];

  const imageSource =
    roomImage?.url ||
    roomTypeImage?.url ||
    roomType?.imageUrl ||
    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=2070&auto=format&fit=crop";

  // Status Badge Helpers
  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case "CONFIRMED":
        return { bg: "#d1fae5", text: "#059669" };
      case "PENDING":
        return { bg: "#ffedd5", text: "#d97706" };
      case "CHECKED_IN":
        return { bg: "#dbeafe", text: "#2563eb" };
      case "CHECKED_OUT":
        return { bg: "#f3f4f6", text: "#4b5563" };
      case "CANCELLED":
        return { bg: "#fee2e2", text: "#dc2626" };
      default:
        return { bg: "#f3f4f6", text: "#4b5563" };
    }
  };

  const statusStyle = getStatusColor(booking.status);

  const handleCancelBooking = async () => {
    setIsCancelling(true);
    try {
      await bookingService.cancelBooking(booking.id);
      setShowCancelModal(false);
      showAlert(
        "Booking Cancelled",
        `Booking ${booking.bookingCode} has been cancelled successfully.`
      );
      // Navigate back to bookings list
      router.back();
    } catch (error: any) {
      console.error("Cancel booking error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to cancel booking. Please try again.";
      showAlert("Error", errorMessage);
    } finally {
      setIsCancelling(false);
    }
  };

  const CancelConfirmationModal = () => (
    <Modal
      visible={showCancelModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowCancelModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalIconContainer}>
            <AlertCircle size={48} color="#dc2626" />
          </View>

          <Text style={styles.modalTitle}>Cancel Booking?</Text>
          <Text style={styles.modalMessage}>
            Are you sure you want to cancel booking{" "}
            <Text style={styles.modalBookingCode}>{booking.bookingCode}</Text>?
            {"\n\n"}
            This action cannot be undone.
          </Text>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonSecondary]}
              onPress={() => setShowCancelModal(false)}
              disabled={isCancelling}
            >
              <Text style={styles.modalButtonTextSecondary}>Keep Booking</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonDanger]}
              onPress={handleCancelBooking}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.modalButtonTextDanger}>Cancel Booking</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerBackButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#007ef2" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Booking Details</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Room Image */}
          <View style={styles.imageContainer}>
            <CloudinaryImage
              src={imageSource}
              style={styles.roomImage}
              contentFit="cover"
              transition={200}
              width={600} // Higher res for detail view
            />
            {/* Status Badge */}
            <View
              style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}
            >
              <Text style={[styles.statusText, { color: statusStyle.text }]}>
                {booking.status.replace("_", " ")}
              </Text>
            </View>
          </View>

          {/* Booking Info */}
          <View style={styles.contentContainer}>
            {/* Room Name & Code */}
            <View style={styles.section}>
              <Text style={styles.roomName}>{roomType?.name || "Room"}</Text>
              <Text style={styles.roomCode}>
                {room?.code || firstRoom.roomTypeId}
              </Text>
              <Text style={styles.bookingCode}>
                Booking Code: {booking.bookingCode}
              </Text>
            </View>

            {/* Dates */}
            <View style={styles.section}>
              <View style={styles.infoRow}>
                <Calendar size={20} color="#007ef2" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Check-in</Text>
                  <Text style={styles.infoValue}>
                    {format(new Date(booking.checkInDate), "EEEE, dd MMM yyyy")}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Calendar size={20} color="#007ef2" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Check-out</Text>
                  <Text style={styles.infoValue}>
                    {format(
                      new Date(booking.checkOutDate),
                      "EEEE, dd MMM yyyy"
                    )}
                  </Text>
                </View>
              </View>
            </View>

            {/* Guest Info */}
            <View style={styles.section}>
              <View style={styles.infoRow}>
                <Users size={20} color="#007ef2" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Guests</Text>
                  <Text style={styles.infoValue}>
                    {booking.totalGuests} guest(s)
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <MapPin size={20} color="#007ef2" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Rooms</Text>
                  <Text style={styles.infoValue}>
                    {booking.bookingRooms.length} room(s)
                  </Text>
                </View>
              </View>
            </View>

            {/* Payment Info */}
            <View style={styles.section}>
              <View style={styles.infoRow}>
                <CreditCard size={20} color="#007ef2" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Total Amount</Text>
                  <Text style={styles.priceValue}>
                    {parseInt(booking.totalAmount).toLocaleString("vi-VN")} VND
                  </Text>
                </View>
              </View>
            </View>

            {/* Room Details */}
            {booking.bookingRooms.length > 1 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Room Details</Text>
                {booking.bookingRooms.map((bookingRoom, index) => (
                  <View key={bookingRoom.id} style={styles.roomDetailCard}>
                    <Text style={styles.roomDetailTitle}>
                      Room {index + 1}: {bookingRoom.roomType?.name}
                    </Text>
                    <Text style={styles.roomDetailInfo}>
                      Code: {bookingRoom.room?.code || bookingRoom.roomTypeId}
                    </Text>
                    <Text style={styles.roomDetailInfo}>
                      Price:{" "}
                      {parseInt(bookingRoom.totalAmount).toLocaleString(
                        "vi-VN"
                      )}{" "}
                      VND
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Cancel Button - Only show for PENDING bookings */}
        {booking.status === "PENDING" && (
          <View style={styles.bottomContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowCancelModal(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Cancel Booking</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Cancel Confirmation Modal */}
      <CancelConfirmationModal />
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
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerBackButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    flex: 1,
    textAlign: "center",
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: "100%",
    height: 250,
    position: "relative",
  },
  roomImage: {
    width: "100%",
    height: "100%",
  },
  statusBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  roomName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  roomCode: {
    fontSize: 14,
    color: "#9ca3af",
    fontWeight: "500",
    marginBottom: 8,
  },
  bookingCode: {
    fontSize: 14,
    color: "#007ef2",
    fontWeight: "600",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  infoTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 4,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 16,
    color: "#1a1a1a",
    fontWeight: "600",
  },
  priceValue: {
    fontSize: 20,
    color: "#007ef2",
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  roomDetailCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  roomDetailTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  roomDetailInfo: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 4,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  cancelButton: {
    backgroundColor: "#dc2626",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: "#007ef2",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fee2e2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 12,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  modalBookingCode: {
    fontWeight: "700",
    color: "#007ef2",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  modalButtonSecondary: {
    backgroundColor: "#f3f4f6",
  },
  modalButtonDanger: {
    backgroundColor: "#dc2626",
  },
  modalButtonTextSecondary: {
    fontSize: 15,
    fontWeight: "700",
    color: "#4b5563",
  },
  modalButtonTextDanger: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
});
