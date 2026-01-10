import { Heart, MapPin, Star } from "lucide-react-native";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface HotelCardProps {
  id: string;
  name: string;
  location: string;
  rating: number;
  priceMin: number;
  priceMax: number;
  discount?: string;
  imageUrl?: string;
  onPress?: () => void;
  onFavoritePress?: () => void;
}

export default function HotelCard({
  name,
  location,
  rating,
  priceMin,
  priceMax,
  discount,
  imageUrl,
  onPress,
  onFavoritePress,
}: HotelCardProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.card}>
        {/* Image */}
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.image} />
          ) : (
            <View style={styles.placeholderImage} />
          )}
        </View>

        {/* Badges Row */}
        <View style={styles.badgesRow}>
          {discount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discount}</Text>
            </View>
          )}
          <View style={styles.ratingBadge}>
            <Star size={10} color="#007ef2" fill="#007ef2" />
            <Text style={styles.ratingText}>{rating}</Text>
          </View>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={onFavoritePress}
          >
            <Heart size={14} color="#007ef2" />
          </TouchableOpacity>
        </View>

        {/* Hotel Name */}
        <Text style={styles.hotelName}>{name}</Text>

        {/* Location */}
        <View style={styles.locationRow}>
          <MapPin size={10} color="#7f7f7f" />
          <Text style={styles.locationText}>{location}</Text>
        </View>

        {/* Price */}
        <Text style={styles.priceText}>
          <Text style={styles.priceHighlight}>
            ${priceMin} - ${priceMax} USD
          </Text>
          <Text style={styles.priceNight}> /night</Text>
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 12,
  },
  card: {
    width: 197,
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
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#e0e0e0",
  },
  badgesRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 8,
  },
  discountBadge: {
    backgroundColor: "rgba(0, 126, 242, 0.12)",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
  },
  discountText: {
    fontSize: 7,
    color: "#007ef2",
    fontFamily: "OpenSans_400Regular",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 126, 242, 0.12)",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  ratingText: {
    fontSize: 9,
    color: "#007ef2",
    fontFamily: "OpenSans_400Regular",
  },
  favoriteButton: {
    marginLeft: "auto",
  },
  hotelName: {
    fontSize: 14,
    fontFamily: "Roboto_700Bold",
    color: "rgba(0, 0, 0, 0.81)",
    marginTop: 8,
    paddingHorizontal: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    paddingHorizontal: 8,
    gap: 4,
  },
  locationText: {
    fontSize: 10,
    fontFamily: "Roboto_300Light",
    color: "#7f7f7f",
  },
  priceText: {
    marginTop: 8,
    paddingHorizontal: 8,
    fontSize: 10,
    fontFamily: "Roboto_300Light",
  },
  priceHighlight: {
    fontFamily: "Roboto_700Bold",
    color: "#007ef2",
  },
  priceNight: {
    color: "rgba(0, 0, 0, 0.81)",
  },
});
