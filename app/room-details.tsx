import { roomService } from "@/src/api";
import type { Room } from "@/src/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Heart,
  Mail,
  MapPin,
  Phone,
  Share2,
} from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
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

  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const fetchRoomDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await roomService.getRoomDetails(roomId);
      setRoom(response.data);
    } catch (err: any) {
      console.error("Error fetching room details:", err);
      setError(err.response?.data?.message || "Failed to load room details");
    } finally {
      setIsLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    if (roomId) {
      fetchRoomDetails();
    }
  }, [roomId, fetchRoomDetails]);

  const handleBookNow = () => {
    if (room) {
      // TODO: Navigate to booking screen with room data when booking screen is created
      console.log("Book room:", room.id);
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
        <TouchableOpacity style={styles.retryButton} onPress={fetchRoomDetails}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const pricePerNight = parseFloat(room.roomType.pricePerNight);
  const formattedPrice = pricePerNight.toLocaleString("en-US");
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
        <View style={styles.priceContainer}>
          <Text style={styles.priceAmount}>{formattedPrice}₫</Text>
          <Text style={styles.priceUnit}>/night</Text>
        </View>
        <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
          <Text style={styles.bookButtonText}>BOOK NOW</Text>
        </TouchableOpacity>
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
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  priceAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007ef2",
  },
  priceUnit: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  bookButton: {
    backgroundColor: "#007ef2",
    paddingHorizontal: 40,
    paddingVertical: 13,
    borderRadius: 10,
  },
  bookButtonText: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 18,
    fontWeight: "600",
  },
});
