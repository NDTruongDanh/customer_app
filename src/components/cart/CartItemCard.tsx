/**
 * Cart Item Component
 * Displays individual room in the cart with booking details
 */

import type { CartItem } from "@/src/types";
import { Bed, Calendar, Minus, Plus, Trash2, Users } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface CartItemCardProps {
  item: CartItem;
  onRemove: () => void;
  onUpdateGuests?: (guests: number) => void;
}

export default function CartItemCard({
  item,
  onRemove,
  onUpdateGuests,
}: CartItemCardProps) {
  const {
    room,
    checkInDate,
    checkOutDate,
    numberOfNights,
    numberOfGuests,
    totalPrice,
  } = item;
  const [guests, setGuests] = useState(numberOfGuests);

  const formattedPrice = totalPrice.toLocaleString("en-US");
  const basePrice = parseFloat(room.roomType.basePrice).toLocaleString("en-US");

  const formatDate = (date: Date | null) => {
    if (!date) return "Not set";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleIncreaseGuests = () => {
    if (guests < room.roomType.capacity) {
      const newGuests = guests + 1;
      setGuests(newGuests);
      onUpdateGuests?.(newGuests);
    }
  };

  const handleDecreaseGuests = () => {
    if (guests > 1) {
      const newGuests = guests - 1;
      setGuests(newGuests);
      onUpdateGuests?.(newGuests);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Image Placeholder */}
        <View style={styles.imageContainer}>
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>Room</Text>
          </View>
        </View>

        {/* Room Details */}
        <View style={styles.detailsContainer}>
          {/* Room Name & Remove Button */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.roomName}>{room.roomType.name}</Text>
              <Text style={styles.roomNumber}>
                Room {room.roomNumber} • Floor {room.floor}
              </Text>
            </View>
            <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
              <Trash2 size={18} color="#ff3b30" />
            </TouchableOpacity>
          </View>

          {/* Room Info */}
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Bed size={14} color="#7f7f7f" />
              <Text style={styles.infoText}>{room.roomType.totalBed} bed</Text>
            </View>
            <View style={styles.infoItem}>
              <Users size={14} color="#7f7f7f" />
              <Text style={styles.infoText}>Max {room.roomType.capacity}</Text>
            </View>
          </View>

          {/* Dates */}
          <View style={styles.datesContainer}>
            <View style={styles.dateItem}>
              <Calendar size={14} color="#007ef2" />
              <View style={styles.dateTextContainer}>
                <Text style={styles.dateLabel}>Check-in</Text>
                <Text style={styles.dateValue}>{formatDate(checkInDate)}</Text>
              </View>
            </View>
            <View style={styles.dateItem}>
              <Calendar size={14} color="#007ef2" />
              <View style={styles.dateTextContainer}>
                <Text style={styles.dateLabel}>Check-out</Text>
                <Text style={styles.dateValue}>{formatDate(checkOutDate)}</Text>
              </View>
            </View>
          </View>

          {/* Guests Selector */}
          <View style={styles.guestsContainer}>
            <Text style={styles.guestsLabel}>Number of Guests</Text>
            <View style={styles.guestsControl}>
              <TouchableOpacity
                style={[
                  styles.guestButton,
                  guests <= 1 && styles.guestButtonDisabled,
                ]}
                onPress={handleDecreaseGuests}
                disabled={guests <= 1}
              >
                <Minus size={16} color={guests <= 1 ? "#ccc" : "#007ef2"} />
              </TouchableOpacity>
              <Text style={styles.guestsValue}>{guests}</Text>
              <TouchableOpacity
                style={[
                  styles.guestButton,
                  guests >= room.roomType.capacity &&
                    styles.guestButtonDisabled,
                ]}
                onPress={handleIncreaseGuests}
                disabled={guests >= room.roomType.capacity}
              >
                <Plus
                  size={16}
                  color={guests >= room.roomType.capacity ? "#ccc" : "#007ef2"}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Price */}
          <View style={styles.priceContainer}>
            <View style={styles.priceDetails}>
              <Text style={styles.priceLabel}>
                {basePrice} VND × {numberOfNights} night
                {numberOfNights > 1 ? "s" : ""}
              </Text>
            </View>
            <Text style={styles.totalPrice}>{formattedPrice} VND</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    width: "100%",
    height: 120,
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#e5f3ff",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#007ef2",
    fontSize: 14,
    fontWeight: "500",
  },
  detailsContainer: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  roomName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  roomNumber: {
    fontSize: 12,
    color: "#7f7f7f",
  },
  removeButton: {
    padding: 4,
    marginLeft: 12,
  },
  infoRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: "#7f7f7f",
  },
  datesContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
  },
  dateItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateTextContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 10,
    color: "#7f7f7f",
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 12,
    fontWeight: "500",
    color: "#1a1a1a",
  },
  guestsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 8,
  },
  guestsLabel: {
    fontSize: 14,
    color: "#1a1a1a",
    fontWeight: "500",
  },
  guestsControl: {
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
  guestsValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    minWidth: 24,
    textAlign: "center",
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: "#f0f0f0",
  },
  priceDetails: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: "#7f7f7f",
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#007ef2",
  },
});
