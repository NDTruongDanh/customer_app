import { Calendar } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface DateGuestSelectorProps {
  dateRange: string;
  onDatePress: () => void;
  // Keep these props for backwards compatibility but they're optional now
  guests?: number;
  onGuestsPress?: () => void;
}

export default function DateGuestSelector({
  dateRange,
  onDatePress,
}: DateGuestSelectorProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={onDatePress}>
        <Calendar size={14} color="#007ef2" />
        <Text style={styles.buttonText}>{dateRange}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 12,
    marginVertical: 12,
    marginHorizontal: 20,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 126, 242, 0.12)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  buttonText: {
    fontSize: 12,
    color: "#007ef2",
    fontFamily: "OpenSans_400Regular",
    textDecorationLine: "underline",
  },
});
