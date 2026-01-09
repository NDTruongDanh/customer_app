import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/welcome");
    }, 2000); // Navigate to welcome screen after 2 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name="map-marker-radius"
        size={60}
        color="#FFD700"
        style={styles.icon}
      />
      <Text style={styles.title}>Room Master</Text>
      <Text style={styles.subtitle}>Find Your Stay, Your Way</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#007EF2",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontFamily: "System",
    fontWeight: "bold",
    fontSize: 45,
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: 10,
  },
  subtitle: {
    fontFamily: "System",
    fontWeight: "600",
    fontSize: 20,
    color: "#FFD700",
    textAlign: "center",
    marginTop: 16,
  },
});
