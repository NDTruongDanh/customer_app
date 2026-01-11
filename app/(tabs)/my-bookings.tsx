import { Calendar } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MyBookingsScreen() {
  // Mock data - will be replaced with actual API calls
  const bookings: any[] = [];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Bookings</Text>
        </View>

        {/* Empty State */}
        {bookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar size={80} color="#ccc" />
            <Text style={styles.emptyTitle}>No Bookings Yet</Text>
            <Text style={styles.emptyMessage}>
              You haven&apos;t made any bookings yet. Start exploring hotels and
              make your first booking!
            </Text>
          </View>
        ) : (
          <View style={styles.bookingsList}>
            {/* Booking cards will be rendered here */}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5fafe",
  },
  container: {
    flex: 1,
    backgroundColor: "#f5fafe",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "OpenSans_700Bold",
    color: "#007ef2",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: "OpenSans_700Bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
  },
  emptyMessage: {
    fontSize: 16,
    fontFamily: "Roboto",
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  bookingsList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
});
