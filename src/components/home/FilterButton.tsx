import { Filter } from "lucide-react-native";
import { StyleSheet, TouchableOpacity } from "react-native";

interface FilterButtonProps {
  onPress: () => void;
}

export default function FilterButton({ onPress }: FilterButtonProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Filter size={28} color="#fff" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#007ef2",
    borderRadius: 10,
    width: 57,
    height: 53,
    alignItems: "center",
    justifyContent: "center",
  },
});
