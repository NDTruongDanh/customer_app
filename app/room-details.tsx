import { useCart } from "@/src/context/CartContext";
import { useRoomDetails } from "@/src/hooks";
import { showAlert } from "@/src/utils/alert";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Calendar,
  Heart,
  Mail,
  MapPin,
  Minus,
  Phone,
  Plus,
  Share2,
  ShoppingCart,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function RoomDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const roomId = params.id as string;

  // Use TanStack Query for room details
  const {
    data: roomResponse,
    isLoading,
    error: roomError,
    refetch,
  } = useRoomDetails(roomId);

  const room = roomResponse?.data ?? null;

  // Format error message
  const error = useMemo(() => {
    if (!roomError) return null;
    const err = roomError as any;
    return err.response?.data?.message || "Failed to load room details";
  }, [roomError]);

  const [isFavorite, setIsFavorite] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [checkInDate, setCheckInDate] = useState<Date | null>(
    params.checkInDate ? new Date(params.checkInDate as string) : null
  );
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(
    params.checkOutDate ? new Date(params.checkOutDate as string) : null
  );
  const [numberOfGuests, setNumberOfGuests] = useState(1);

  const { addToCart, isInCart } = useCart();
  const roomInCart = room ? isInCart(room.id) : false;

  const handleAddToCart = () => {
    if (!room) return;

    if (!checkInDate || !checkOutDate) {
      showAlert("Missing Dates", "Please select check-in and check-out dates");
      return;
    }

    if (checkInDate >= checkOutDate) {
      showAlert("Invalid Dates", "Check-out date must be after check-in date");
      return;
    }

    addToCart(room, checkInDate, checkOutDate, numberOfGuests);
    showAlert(
      "Added to Cart",
      `${room.roomType.name} has been added to your cart`
    );
  };

  const handleGoToCart = () => {
    router.push("/(tabs)/cart");
  };

  const handleIncreaseGuests = () => {
    if (room && numberOfGuests < room.roomType.capacity) {
      setNumberOfGuests(numberOfGuests + 1);
    }
  };

  const handleDecreaseGuests = () => {
    if (numberOfGuests > 1) {
      setNumberOfGuests(numberOfGuests - 1);
    }
  };

  const handleShare = () => {
    // Implement share functionality
    console.log("Share room details");
  };

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007ef2" />
      </View>
    );
  }

  if (error || !room) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || "Room not found"}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const basePrice = parseFloat(room.roomType.basePrice);
  const formattedPrice = basePrice.toLocaleString("en-US");
  const amenities =
    room.roomType.roomTypeTags?.map((tag) => tag.roomTag.name) || [];

  // Generate a simple description based on room data
  const description = `Experience comfort in our ${
    room.roomType.name
  }, located on floor ${room.floor}. This spacious room accommodates up to ${
    room.roomType.capacity
  } guests with ${room.roomType.totalBed} comfortable bed${
    room.roomType.totalBed > 1 ? "s" : ""
  }. Enjoy premium amenities and exceptional service during your stay.`;
  const shouldShowReadMore = description.length > 150;
  const displayDescription = isDescriptionExpanded
    ? description
    : description.substring(0, 150) + (shouldShowReadMore ? "..." : "");

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#007ef2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Room Details</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
            <Share2 size={24} color="#007ef2" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleFavoriteToggle}
          >
            <Heart
              size={24}
              color="#007ef2"
              fill={isFavorite ? "#007ef2" : "transparent"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Room Image */}
        <View style={styles.imageContainer}>
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>Room Image</Text>
          </View>
        </View>

        {/* Room Info */}
        <View style={styles.contentContainer}>
          {/* Room Type Name */}
          <View style={styles.titleRow}>
            <Text style={styles.roomName}>{room.roomType.name}</Text>
            <TouchableOpacity style={styles.locationButton}>
              <MapPin size={20} color="#007ef2" />
            </TouchableOpacity>
          </View>

          {/* Badges */}
          <View style={styles.badgesRow}>
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>10% OFF</Text>
            </View>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>⭐</Text>
              <Text style={styles.ratingScore}>4.5</Text>
              <Text style={styles.reviewsText}>(120 Reviews)</Text>
            </View>
          </View>

          {/* Room Details */}
          <View style={styles.detailsRow}>
            <Text style={styles.detailLabel}>Room:</Text>
            <Text style={styles.detailValue}>{room.roomNumber}</Text>
            <Text style={styles.detailSeparator}>•</Text>
            <Text style={styles.detailLabel}>Floor:</Text>
            <Text style={styles.detailValue}>{room.floor}</Text>
            <Text style={styles.detailSeparator}>•</Text>
            <Text style={styles.detailLabel}>Code:</Text>
            <Text style={styles.detailValue}>{room.code}</Text>
          </View>

          {/* Capacity and Beds */}
          <View style={styles.capacityRow}>
            <Text style={styles.capacityText}>
              👥 {room.roomType.capacity} guests
            </Text>
            <Text style={styles.capacitySeparator}>•</Text>
            <Text style={styles.capacityText}>
              🛏️ {room.roomType.totalBed} bed
              {room.roomType.totalBed > 1 ? "s" : ""}
            </Text>
          </View>

          {/* Description Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{displayDescription}</Text>
            {shouldShowReadMore && (
              <TouchableOpacity
                onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              >
                <Text style={styles.readMoreText}>
                  {isDescriptionExpanded ? "Show less" : "Read more"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Booking Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Booking Details</Text>

            {/* Booking Dates Display */}
            {checkInDate && checkOutDate && (
              <View style={styles.datesDisplayContainer}>
                <View style={styles.dateDisplayItem}>
                  <Calendar size={16} color="#007ef2" />
                  <View style={styles.dateDisplayText}>
                    <Text style={styles.dateDisplayLabel}>Check-in</Text>
                    <Text style={styles.dateDisplayValue}>
                      {checkInDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                </View>
                <View style={styles.dateDisplayItem}>
                  <Calendar size={16} color="#007ef2" />
                  <View style={styles.dateDisplayText}>
                    <Text style={styles.dateDisplayLabel}>Check-out</Text>
                    <Text style={styles.dateDisplayValue}>
                      {checkOutDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Guest Selection */}
            <View style={styles.guestSelectionContainer}>
              <Text style={styles.guestLabel}>Number of Guests</Text>
              <View style={styles.guestControl}>
                <TouchableOpacity
                  style={[
                    styles.guestButton,
                    numberOfGuests <= 1 && styles.guestButtonDisabled,
                  ]}
                  onPress={handleDecreaseGuests}
                  disabled={numberOfGuests <= 1}
                >
                  <Minus
                    size={18}
                    color={numberOfGuests <= 1 ? "#ccc" : "#007ef2"}
                  />
                </TouchableOpacity>
                <Text style={styles.guestValue}>{numberOfGuests}</Text>
                <TouchableOpacity
                  style={[
                    styles.guestButton,
                    room &&
                      numberOfGuests >= room.roomType.capacity &&
                      styles.guestButtonDisabled,
                  ]}
                  onPress={handleIncreaseGuests}
                  disabled={
                    room ? numberOfGuests >= room.roomType.capacity : false
                  }
                >
                  <Plus
                    size={18}
                    color={
                      room && numberOfGuests >= room.roomType.capacity
                        ? "#ccc"
                        : "#007ef2"
                    }
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Amenities Section */}
          {amenities.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Amenities</Text>
              <View style={styles.amenitiesGrid}>
                {amenities.map((amenity, index) => (
                  <View key={index} style={styles.amenityTag}>
                    <Text style={styles.amenityText}>{amenity}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Contact Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Info</Text>
            <View style={styles.contactCard}>
              <View style={styles.contactAvatar}>
                <Text style={styles.avatarText}>👤</Text>
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>Front Desk</Text>
                <Text style={styles.contactRole}>Reception</Text>
              </View>
              <View style={styles.contactActions}>
                <TouchableOpacity style={styles.contactButton}>
                  <Phone size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.contactButton}>
                  <Mail size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Gallery Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gallery</Text>
            <View style={styles.galleryPlaceholder}>
              <Text style={styles.placeholderText}>Gallery coming soon</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceInfo}>
          <Text style={styles.priceAmount}>{formattedPrice} VND</Text>
          <Text style={styles.priceUnit}>/night</Text>
        </View>
        {roomInCart ? (
          <TouchableOpacity style={styles.cartButton} onPress={handleGoToCart}>
            <ShoppingCart size={20} color="#fff" />
            <Text style={styles.cartButtonText}>View Cart</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
            <ShoppingCart size={20} color="#fff" />
            <Text style={styles.addButtonText}>Add to Cart</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5fafe",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5fafe",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5fafe",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#007ef2",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: "#f5fafe",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007ef2",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    height: 290,
    backgroundColor: "#e0e0e0",
  },
  placeholderImage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#d0d0d0",
  },
  placeholderText: {
    fontSize: 16,
    color: "#666",
  },
  contentContainer: {
    padding: 15,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  roomName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "rgba(0,0,0,0.81)",
  },
  locationButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badgesRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },
  discountBadge: {
    backgroundColor: "rgba(0,126,242,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  discountText: {
    fontSize: 10,
    color: "#007ef2",
    fontWeight: "600",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,126,242,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
  },
  ratingScore: {
    fontSize: 12,
    color: "#007ef2",
    fontWeight: "600",
  },
  reviewsText: {
    fontSize: 12,
    color: "#007ef2",
    textDecorationLine: "underline",
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    flexWrap: "wrap",
  },
  detailLabel: {
    fontSize: 12,
    color: "#666",
    marginRight: 4,
  },
  detailValue: {
    fontSize: 12,
    color: "#000",
    fontWeight: "600",
    marginRight: 8,
  },
  detailSeparator: {
    fontSize: 12,
    color: "#666",
    marginRight: 8,
  },
  capacityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  capacityText: {
    fontSize: 12,
    color: "#666",
  },
  capacitySeparator: {
    fontSize: 12,
    color: "#666",
    marginHorizontal: 8,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "rgba(0,0,0,0.81)",
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 10,
    color: "#7f7f7f",
    lineHeight: 16,
  },
  readMoreText: {
    fontSize: 10,
    color: "#ffd700",
    fontWeight: "600",
    textDecorationLine: "underline",
    marginTop: 4,
  },
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  amenityTag: {
    backgroundColor: "rgba(0,126,242,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  amenityText: {
    fontSize: 12,
    color: "#007ef2",
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactAvatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#000",
  },
  contactRole: {
    fontSize: 10,
    color: "#7f7f7f",
  },
  contactActions: {
    flexDirection: "row",
    gap: 8,
  },
  contactButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: "#007ef2",
    justifyContent: "center",
    alignItems: "center",
  },
  galleryPlaceholder: {
    height: 100,
    backgroundColor: "#e0e0e0",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  datesDisplayContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f5f9ff",
    borderRadius: 8,
  },
  dateDisplayItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateDisplayText: {
    flex: 1,
  },
  dateDisplayLabel: {
    fontSize: 10,
    color: "#7f7f7f",
    marginBottom: 2,
  },
  dateDisplayValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  guestSelectionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  guestLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  guestControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  guestButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0f7ff",
    justifyContent: "center",
    alignItems: "center",
  },
  guestButtonDisabled: {
    backgroundColor: "#f5f5f5",
  },
  guestValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    minWidth: 24,
    textAlign: "center",
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    gap: 8,
  },
  priceInfo: {
    flexDirection: "row",
    alignItems: "baseline",
    flexShrink: 1,
    minWidth: 0,
  },
  priceAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#007ef2",
    flexShrink: 1,
  },
  priceUnit: {
    fontSize: 11,
    color: "#7f7f7f",
    marginLeft: 4,
    flexShrink: 0,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#007ef2",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    flexShrink: 0,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  cartButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#34c759",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    flexShrink: 0,
  },
  cartButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
