/**
 * Booking Summary Screen
 * Full booking summary after proceeding from cart to checkout
 */

import { CloudinaryImage } from "@/src/components/CloudinaryImage";
import { useCart } from "@/src/context/CartContext";
import { useRouter } from "expo-router";
import { ArrowLeft, Minus, Plus } from "lucide-react-native";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Helper function to format date in the format "1-Oct-2023"
const formatDate = (date: Date | null): string => {
  if (!date) return "Not selected";
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export default function BookingSummaryScreen() {
  const router = useRouter();
  const { cartItems, getCartTotal, updateCartItem } = useCart();

  const subtotal = getCartTotal();
  const tax = Math.round(subtotal * 0.1); // 10% tax
  const total = subtotal + tax;

  const handleContinueToPayment = () => {
    if (cartItems.length === 0) {
      Alert.alert("Error", "Your cart is empty");
      return;
    }

    // Validate that all cart items have dates
    const hasInvalidDates = cartItems.some(
      (item) => !item.checkInDate || !item.checkOutDate
    );

    if (hasInvalidDates) {
      Alert.alert(
        "Invalid Dates",
        "Please ensure all rooms have check-in and check-out dates selected."
      );
      return;
    }

    // Navigate to the payment screen for QR code display and image upload
    router.push("/payment");
  };

  // Calculate total number of nights and guests
  const totalNights = cartItems.reduce(
    (acc, item) => acc + item.numberOfNights,
    0
  );
  const totalGuests = cartItems.reduce(
    (acc, item) => acc + item.numberOfGuests,
    0
  );

  // Get earliest check-in and latest check-out dates
  const checkInDate = cartItems.length > 0 ? cartItems[0].checkInDate : null;
  const checkOutDate = cartItems.length > 0 ? cartItems[0].checkOutDate : null;

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
          <Text style={styles.headerTitle}>Booking Summary</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Room Cards */}
          {cartItems.map((item, index) => {
            // Get default or first image from room type
            // Get image from room or room type (prioritize room-specific, then room type)
            const roomDefaultImage = item.room.images?.find(
              (img) => img.isDefault
            );
            const roomFirstImage = item.room.images?.[0];
            const typeDefaultImage = item.room.roomType?.images?.find(
              (img) => img.isDefault
            );
            const typeFirstImage = item.room.roomType?.images?.[0];

            const displayImage =
              roomDefaultImage ||
              roomFirstImage ||
              typeDefaultImage ||
              typeFirstImage;

            return (
              <View key={item.id} style={styles.roomCard}>
                {/* Room Image and Info */}
                <View style={styles.roomHeader}>
                  {displayImage ? (
                    <CloudinaryImage
                      src={displayImage.secureUrl || displayImage.url}
                      width={230}
                      transformation="c_fill,ar_3:2"
                      style={styles.roomImage}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={styles.roomImagePlaceholder}>
                      <Text style={styles.roomImagePlaceholderText}>Room</Text>
                    </View>
                  )}
                  <View style={styles.roomInfo}>
                    <Text style={styles.roomName} numberOfLines={1}>
                      {item.room.roomType?.name || "Room"}
                    </Text>
                    <Text style={styles.roomLocation} numberOfLines={1}>
                      Floor {item.room.floor} • Room {item.room.roomNumber}
                    </Text>
                    <Text style={styles.roomPrice}>
                      {parseFloat(
                        item.room.roomType?.basePrice || "0"
                      ).toLocaleString("en-US")}{" "}
                      VND
                      <Text style={styles.roomPriceUnit}> /night</Text>
                    </Text>
                  </View>
                </View>

                {/* Booking Details */}
                <View style={styles.detailsSection}>
                  {/* Booking Date Label */}
                  <Text style={styles.sectionLabel}>Booking Date</Text>
                  <Text style={styles.sectionValue}>
                    {formatDate(new Date())}
                  </Text>

                  {/* Check-in */}
                  <Text style={styles.sectionLabel}>Check-in</Text>
                  <Text style={styles.sectionValue}>
                    {formatDate(item.checkInDate)}
                  </Text>

                  {/* Check-out */}
                  <Text style={styles.sectionLabel}>Check-out</Text>
                  <Text style={styles.sectionValue}>
                    {formatDate(item.checkOutDate)}
                  </Text>

                  {/* Guests */}
                  <View style={styles.guestSection}>
                    <Text style={styles.sectionLabel}>Guests</Text>
                    <View style={styles.guestCounter}>
                      <TouchableOpacity
                        onPress={() => {
                          if (item.numberOfGuests > 1) {
                            updateCartItem(item.id, {
                              numberOfGuests: item.numberOfGuests - 1,
                            });
                          }
                        }}
                        style={[
                          styles.counterButton,
                          item.numberOfGuests <= 1 &&
                            styles.counterButtonDisabled,
                        ]}
                        disabled={item.numberOfGuests <= 1}
                      >
                        <Minus
                          size={16}
                          color={item.numberOfGuests <= 1 ? "#ccc" : "#007ef2"}
                        />
                      </TouchableOpacity>
                      <Text style={styles.guestCount}>
                        {item.numberOfGuests}
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          const maxGuests = item.room.roomType?.capacity || 4;
                          if (item.numberOfGuests < maxGuests) {
                            updateCartItem(item.id, {
                              numberOfGuests: item.numberOfGuests + 1,
                            });
                          }
                        }}
                        style={[
                          styles.counterButton,
                          item.numberOfGuests >=
                            (item.room.roomType?.capacity || 4) &&
                            styles.counterButtonDisabled,
                        ]}
                        disabled={
                          item.numberOfGuests >=
                          (item.room.roomType?.capacity || 4)
                        }
                      >
                        <Plus
                          size={16}
                          color={
                            item.numberOfGuests >=
                            (item.room.roomType?.capacity || 4)
                              ? "#ccc"
                              : "#007ef2"
                          }
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={styles.maxGuestsText}>
                    Max {item.room.roomType?.capacity || 4} guests
                  </Text>

                  {/* Room(s) */}
                  <Text style={styles.sectionLabel}>Room(s)</Text>
                  <Text style={styles.sectionValue}>1</Text>
                </View>

                {/* Divider between rooms */}
                {index < cartItems.length - 1 && (
                  <View style={styles.roomDivider} />
                )}
              </View>
            );
          })}

          {/* Price Breakdown */}
          <View style={styles.priceSection}>
            <Text style={styles.priceSectionTitle}>Price Breakdown</Text>

            {/* Amount */}
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Amount</Text>
              <Text style={styles.priceValue}>
                {subtotal.toLocaleString("en-US")} VND
              </Text>
            </View>

            {/* Tax */}
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Tax (10%)</Text>
              <Text style={styles.priceValue}>
                {tax.toLocaleString("en-US")} VND
              </Text>
            </View>

            {/* Divider */}
            <View style={styles.priceDivider} />

            {/* Total */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                {total.toLocaleString("en-US")} VND
              </Text>
            </View>
          </View>

          {/* Spacer for button */}
          <View style={styles.buttonSpacer} />
        </ScrollView>

        {/* Bottom Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.paymentButton}
            onPress={handleContinueToPayment}
          >
            <Text style={styles.paymentButtonText}>CONTINUE TO PAYMENT</Text>
          </TouchableOpacity>
        </View>
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
  roomCard: {
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
  roomHeader: {
    flexDirection: "row",
    marginBottom: 16,
  },
  roomImage: {
    width: 115,
    height: 78,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ffd700",
  },
  roomImagePlaceholder: {
    width: 115,
    height: 78,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ffd700",
    backgroundColor: "#e5f3ff",
    justifyContent: "center",
    alignItems: "center",
  },
  roomImagePlaceholderText: {
    color: "#007ef2",
    fontSize: 12,
    fontWeight: "500",
  },
  roomInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "flex-start",
  },
  roomName: {
    fontSize: 16,
    fontWeight: "700",
    color: "rgba(0, 0, 0, 0.81)",
    marginBottom: 4,
  },
  roomLocation: {
    fontSize: 10,
    fontWeight: "300",
    color: "#7f7f7f",
    marginBottom: 8,
  },
  roomPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#007ef2",
  },
  roomPriceUnit: {
    fontSize: 12,
    fontWeight: "400",
  },
  detailsSection: {
    marginTop: 8,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#252424",
    marginTop: 12,
    marginBottom: 4,
  },
  sectionValue: {
    fontSize: 14,
    fontWeight: "400",
    color: "#7f7f7f",
  },
  roomDivider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginTop: 16,
  },
  priceSection: {
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
  priceSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: "400",
    color: "#252424",
  },
  priceValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7f7f7f",
  },
  priceDivider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#252424",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#007ef2",
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
  paymentButton: {
    backgroundColor: "#007ef2",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  paymentButtonDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  paymentButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.88)",
    letterSpacing: 0.5,
  },
  guestSection: {
    marginTop: 12,
  },
  guestCounter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 12,
  },
  counterButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e5f3ff",
    justifyContent: "center",
    alignItems: "center",
  },
  counterButtonDisabled: {
    backgroundColor: "#f5f5f5",
  },
  guestCount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#252424",
    minWidth: 20,
    textAlign: "center",
  },
  maxGuestsText: {
    fontSize: 12,
    color: "#7f7f7f",
    marginTop: 4,
  },
});
