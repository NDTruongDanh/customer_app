import { Image, StyleSheet, Text, View } from "react-native";

interface BusinessCardProps {
  name: string;
  imageUrl?: string;
  amenities: string[];
}

export default function BusinessCard({
  name,
  imageUrl,
  amenities,
}: BusinessCardProps) {
  return (
    <View style={styles.container}>
      {/* Image */}
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage} />
        )}
      </View>

      {/* Amenities */}
      <View style={styles.amenitiesContainer}>
        {amenities.map((amenity, index) => (
          <View key={index} style={styles.amenityBadge}>
            <Text style={styles.amenityText}>{amenity}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 184,
    marginRight: 12,
  },
  imageContainer: {
    width: "100%",
    height: 128,
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
  amenitiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 6,
  },
  amenityBadge: {
    backgroundColor: "rgba(0, 126, 242, 0.06)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  amenityText: {
    fontSize: 7,
    color: "#007ef2",
    fontFamily: "OpenSans_400Regular",
  },
});
