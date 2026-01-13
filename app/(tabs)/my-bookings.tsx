import CloudinaryImage from "@/src/components/CloudinaryImage";
import { useBookings } from "@/src/hooks/useBookings";
import { Booking, BookingStatus } from "@/src/types/booking.types";
import { format } from "date-fns";
import { Stack, useRouter } from "expo-router";
import { Calendar } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TABS = [
  { id: "all", label: "All" },
  { id: "upcoming", label: "Upcoming" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

export default function MyBookingsScreen() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState("all");

  // Map tabs to API status
  // Note: API supports single status filter.
  // "Upcoming" maps to CONFIRMED for now.
  const apiStatus = useMemo((): BookingStatus | undefined => {
    switch (selectedTab) {
      case "upcoming":
        return "CONFIRMED";
      case "completed":
        return "CHECKED_OUT";
      case "cancelled":
        return "CANCELLED";
      default:
        return undefined; // All
    }
  }, [selectedTab]);

  const { data, isLoading, refetch, isRefetching } = useBookings({
    status: apiStatus as BookingStatus | undefined,
    limit: 50, // Fetch more items
  });

  const bookings = data?.data?.data || [];

  const handlePressBooking = (booking: Booking) => {
    // Navigate to booking detail screen
    router.push({
      pathname: "/booking-detail",
      params: {
        booking: JSON.stringify(booking),
      },
    });
  };

  const renderBookingItem = ({ item }: { item: Booking }) => {
    const firstRoom = item.bookingRooms[0];
    if (!firstRoom) return null;

    const roomType = firstRoom.roomType;
    const room = firstRoom.room;

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
          return { bg: "#d1fae5", text: "#059669" }; // Green
        case "PENDING":
          return { bg: "#ffedd5", text: "#d97706" }; // Orange
        case "CHECKED_IN":
          return { bg: "#dbeafe", text: "#2563eb" }; // Blue
        case "CHECKED_OUT":
          return { bg: "#f3f4f6", text: "#4b5563" }; // Gray
        case "CANCELLED":
          return { bg: "#fee2e2", text: "#dc2626" }; // Red
        default:
          return { bg: "#f3f4f6", text: "#4b5563" };
      }
    };

    const statusStyle = getStatusColor(item.status);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handlePressBooking(item)}
        activeOpacity={0.9}
      >
        <Stack.Screen options={{ headerShown: false }} />
        {/* Status Badge - Absolute Top Right (or over image) */}
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {item.status.replace("_", " ")}
          </Text>
        </View>

        <View style={styles.cardContent}>
          {/* Image Section */}
          <View style={styles.imageContainer}>
            <CloudinaryImage
              src={imageSource}
              style={styles.roomImage}
              contentFit="cover"
              transition={200}
              width={200} // Optimization
            />
          </View>

          {/* Details Section */}
          <View style={styles.detailsContainer}>
            <View>
              <Text style={styles.roomName} numberOfLines={1}>
                {roomType?.name || "Room"}
              </Text>
              <Text style={styles.roomCode}>
                {room?.code || firstRoom.roomTypeId}
              </Text>
            </View>

            <View style={styles.dateRow}>
              <Calendar size={14} color="#666" style={{ marginRight: 6 }} />
              <Text style={styles.dateText}>
                {format(new Date(item.checkInDate), "dd MMM")} -{" "}
                {format(new Date(item.checkOutDate), "dd MMM yyyy")}
              </Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.price}>
                {parseInt(item.totalAmount).toLocaleString("vi-VN")} VND
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <FlatList
          horizontal
          data={TABS}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.tab, selectedTab === item.id && styles.activeTab]}
              onPress={() => setSelectedTab(item.id)}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === item.id && styles.activeTabText,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.tabsContent}
        />
      </View>

      {/* Booking List */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007ef2" />
        </View>
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderBookingItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#007ef2"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Calendar size={64} color="#ccc" />
              <Text style={styles.emptyTitle}>No Bookings Found</Text>
              <Text style={styles.emptyMessage}>
                {selectedTab === "all"
                  ? "You haven't made any bookings yet."
                  : `No ${selectedTab} bookings found.`}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5fafe",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#007ef2",
    fontFamily: "System",
  },
  tabsContainer: {
    backgroundColor: "#fff",
    paddingBottom: 10,
  },
  tabsContent: {
    paddingHorizontal: 20,
    gap: 15,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  activeTab: {
    backgroundColor: "#007ef2",
  },
  tabText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  activeTabText: {
    color: "#fff",
  },
  listContent: {
    padding: 20,
    gap: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    position: "relative",
  },
  statusBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    zIndex: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  cardContent: {
    flexDirection: "row",
    padding: 12,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
  },
  roomImage: {
    width: "100%",
    height: "100%",
  },
  detailsContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  roomName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  roomCode: {
    fontSize: 13,
    color: "#9ca3af",
    fontWeight: "500",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  dateText: {
    fontSize: 13,
    color: "#6b7280",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: "#007ef2",
  },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#374151",
    marginTop: 16,
  },
  emptyMessage: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 8,
    textAlign: "center",
  },
});
