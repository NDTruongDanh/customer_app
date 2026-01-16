import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowRight, Wifi, Wind, Coffee } from "lucide-react-native";

interface RoomSuggestion {
  id: string;
  roomNumber: string;
  type: string;
  capacity?: number;
  price: number;
  image: string;
  description?: string;
}

interface RoomSuggestionCardProps {
  rooms: RoomSuggestion[];
}

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.75;

export function RoomSuggestionCard({ rooms }: RoomSuggestionCardProps) {
  const router = useRouter();

  if (!rooms || rooms.length === 0) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Recommended for you ✨</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + 16}
      >
        {rooms.map((room) => (
          <View key={room.id} style={styles.card}>
            <Image
              source={{
                uri: room.image || "https://via.placeholder.com/400x300",
              }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.cardContent}>
              {/* Room Number & Type Header */}
              <View style={styles.headerRow}>
                <Text style={styles.roomNumber}>Room {room.roomNumber}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{room.type}</Text>
                </View>
              </View>

              {/* Secondary Info: Capacity */}
              <Text style={styles.subInfo}>
                Max {room.capacity || 2} Guests • Non-smoking
              </Text>

              {/* Amenities Row */}
              <View style={styles.amenitiesContainer}>
                <View style={styles.amenityItem}>
                  <Wifi size={14} color="#64748b" />
                  <Text style={styles.amenityText}>Wifi</Text>
                </View>
                <View style={styles.amenityItem}>
                  <Wind size={14} color="#64748b" />
                  <Text style={styles.amenityText}>AC</Text>
                </View>
                <View style={styles.amenityItem}>
                  <Coffee size={14} color="#64748b" />
                  <Text style={styles.amenityText}>Coffee</Text>
                </View>
              </View>

              {/* Price & Action */}
              <View style={styles.footerRow}>
                <View>
                  <Text style={styles.priceValue}>
                    {formatPrice(room.price)}
                    <Text style={styles.currency}> VND</Text>
                  </Text>
                  <Text style={styles.perNight}>per night</Text>
                </View>

                <TouchableOpacity
                  style={styles.bookButton}
                  onPress={() => {
                    router.push({
                      pathname: "/room-details",
                      params: { id: room.id },
                    });
                  }}
                >
                  <Text style={styles.bookButtonText}>Book</Text>
                  <ArrowRight size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    width: "100%",
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  scrollContent: {
    paddingRight: 16,
    paddingBottom: 4,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  image: {
    width: "100%",
    height: 150,
    backgroundColor: "#f1f5f9",
  },
  cardContent: {
    padding: 14,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  roomNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  badge: {
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#0284c7",
  },
  subInfo: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 12,
  },
  amenitiesContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingBottom: 12,
  },
  amenityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  amenityText: {
    fontSize: 12,
    color: "#64748b",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  priceValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#007AFF",
  },
  currency: {
    fontSize: 12,
    fontWeight: "600",
  },
  perNight: {
    fontSize: 12,
    color: "#94a3b8",
  },
  bookButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
  },
  bookButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
