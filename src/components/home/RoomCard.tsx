import { Bed, Minus, Plus, Users } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { Room } from "../../types";
import { CloudinaryImage } from "../CloudinaryImage";

interface RoomCardProps {
  room: Room;
  onPress?: () => void;
  onFavoritePress?: () => void;
}

export default function RoomCard({
  room,
  onPress,
  onFavoritePress,
}: RoomCardProps) {
  const { roomType, roomNumber, floor, status } = room;
  const basePrice = parseFloat(roomType.basePrice);
  const [isAmenitiesExpanded, setIsAmenitiesExpanded] = useState(false);

  // Format price to display (divide by 1000 for K format if needed)
  const formattedPrice =
    basePrice >= 1000
      ? `${(basePrice / 1000).toFixed(0)}K`
      : basePrice.toFixed(0);

  // Get all amenities
  const allAmenities = roomType.roomTypeTags.map((tag) => tag.roomTag.name);
  const hasMoreAmenities = allAmenities.length > 3;
  const displayedAmenities = isAmenitiesExpanded
    ? allAmenities
    : allAmenities.slice(0, 3);

  // Get default or first image from room type
  const defaultImage = roomType.images?.find((img) => img.isDefault);
  const firstImage = roomType.images?.[0];
  const displayImage = defaultImage || firstImage;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.card}>
        {/* Room Image */}
        <View style={styles.imageContainer}>
          {displayImage ? (
            <CloudinaryImage
              src={displayImage.secureUrl || displayImage.url}
              width={400}
              transformation="c_fill,ar_3:2"
              style={styles.roomImage}
              contentFit="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>Room Image</Text>
            </View>
          )}
        </View>

        {/* Badges Row */}
        {/* <View style={styles.badgesRow}>
          <View
            style={[
              styles.statusBadge,
              status === "AVAILABLE" && styles.availableBadge,
            ]}
          >
            <Text style={styles.statusText}>{status}</Text>
          </View>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={onFavoritePress}
          >
            <Heart size={14} color="#007ef2" />
          </TouchableOpacity>
        </View> */}

        {/* Room Number (Primary Header) */}
        <Text style={styles.roomNumber}>Room {roomNumber}</Text>

        {/* Floor */}
        <Text style={styles.floorText}>Floor {floor}</Text>

        {/* Room Type Name */}
        <Text style={styles.roomTypeName}>{roomType.name}</Text>

        {/* Capacity & Beds */}
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Users size={12} color="#7f7f7f" />
            <Text style={styles.detailText}>{roomType.capacity} guests</Text>
          </View>
          <View style={styles.detailItem}>
            <Bed size={12} color="#7f7f7f" />
            <Text style={styles.detailText}>{roomType.totalBed} bed</Text>
          </View>
        </View>

        {/* Amenities */}
        {allAmenities.length > 0 && (
          <View style={styles.amenitiesRow}>
            {displayedAmenities.map((amenity, index) => (
              <View key={index} style={styles.amenityTag}>
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
            {hasMoreAmenities && (
              <TouchableOpacity
                style={styles.expandButton}
                onPress={(e) => {
                  e.stopPropagation();
                  setIsAmenitiesExpanded(!isAmenitiesExpanded);
                }}
              >
                {isAmenitiesExpanded ? (
                  <Minus size={10} color="#007ef2" />
                ) : (
                  <Plus size={10} color="#007ef2" />
                )}
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Price */}
        <Text style={styles.priceText}>
          <Text style={styles.priceHighlight}>{formattedPrice} VND</Text>
          <Text style={styles.priceNight}> /night</Text>
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingBottom: 12,
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Shadow for Android
    elevation: 3,
  },
  imageContainer: {
    width: "100%",
    height: 134,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ffd700",
    overflow: "hidden",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#e8f4fd",
    justifyContent: "center",
    alignItems: "center",
  },
  roomImage: {
    width: "100%",
    height: "100%",
  },
  placeholderText: {
    fontSize: 12,
    color: "#007ef2",
    fontFamily: "Roboto_400Regular",
  },
  badgesRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 8,
  },
  statusBadge: {
    backgroundColor: "rgba(127, 127, 127, 0.12)",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
  },
  availableBadge: {
    backgroundColor: "rgba(0, 200, 83, 0.12)",
  },
  statusText: {
    fontSize: 9,
    color: "#7f7f7f",
    fontFamily: "OpenSans_400Regular",
    textTransform: "capitalize",
  },
  favoriteButton: {
    marginLeft: "auto",
  },
  roomNumber: {
    fontSize: 18,
    fontFamily: "Roboto_700Bold",
    color: "#007ef2",
    marginTop: 8,
    paddingHorizontal: 8,
  },
  floorText: {
    fontSize: 12,
    fontFamily: "Roboto_400Regular",
    color: "#7f7f7f",
    marginTop: 2,
    paddingHorizontal: 8,
  },
  roomTypeName: {
    fontSize: 13,
    fontFamily: "Roboto_500Medium",
    color: "rgba(0, 0, 0, 0.81)",
    marginTop: 4,
    paddingHorizontal: 8,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    paddingHorizontal: 8,
    gap: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontSize: 11,
    fontFamily: "Roboto_400Regular",
    color: "#7f7f7f",
  },
  amenitiesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 6,
    paddingHorizontal: 8,
    gap: 4,
  },
  amenityTag: {
    backgroundColor: "rgba(0, 126, 242, 0.08)",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  amenityText: {
    fontSize: 9,
    color: "#007ef2",
    fontFamily: "OpenSans_400Regular",
  },
  priceText: {
    marginTop: 8,
    paddingHorizontal: 8,
    fontSize: 13,
    fontFamily: "Roboto_400Regular",
  },
  priceHighlight: {
    fontSize: 14,
    fontFamily: "Roboto_700Bold",
    color: "#007ef2",
  },
  expandButton: {
    backgroundColor: "rgba(0, 126, 242, 0.08)",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 20,
    height: 16,
  },
  priceNight: {
    color: "rgba(0, 0, 0, 0.81)",
  },
});
