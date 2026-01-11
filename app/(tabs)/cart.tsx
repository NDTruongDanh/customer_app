/**
 * Cart Screen
 * Shopping cart for room bookings - shows all rooms user wants to book
 */

import { CartItemCard } from "@/src/components/cart";
import { useCart } from "@/src/context/CartContext";
import { useRouter } from "expo-router";
import { ArrowLeft, ShoppingCart } from "lucide-react-native";
import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CartScreen() {
  const router = useRouter();
  const { cartItems, removeFromCart, updateCartItem, clearCart, getCartTotal } =
    useCart();

  const subtotal = getCartTotal();
  const serviceFee = subtotal > 0 ? 50000 : 0; // 50000 VND service fee
  const total = subtotal + serviceFee;

  const handleRemoveItem = (itemId: string) => {
    removeFromCart(itemId);
  };

  const handleUpdateGuests = (itemId: string, guests: number) => {
    updateCartItem(itemId, { numberOfGuests: guests });
  };

  const handleProceedToCheckout = () => {
    router.push("/booking-summary");
  };

  const handleClearCart = () => {
    clearCart();
  };

  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <ShoppingCart size={64} color="#ccc" />
      </View>
      <Text style={styles.emptyTitle}>Your cart is empty</Text>
      <Text style={styles.emptySubtitle}>
        Browse our available rooms and add them to your cart
      </Text>
      <TouchableOpacity
        style={styles.browseButton}
        onPress={() => router.push("/(tabs)/home")}
      >
        <Text style={styles.browseButtonText}>Browse Rooms</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#007ef2" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Cart</Text>
          {cartItems.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearCart}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          )}
          {cartItems.length === 0 && <View style={styles.headerPlaceholder} />}
        </View>

        {cartItems.length === 0 ? (
          renderEmptyCart()
        ) : (
          <>
            {/* Cart Items List */}
            <FlatList
              data={cartItems}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <CartItemCard
                  item={item}
                  onRemove={() => handleRemoveItem(item.id)}
                  onUpdateGuests={(guests) =>
                    handleUpdateGuests(item.id, guests)
                  }
                />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />

            {/* Summary Section */}
            <View style={styles.summaryContainer}>
              <ScrollView
                style={styles.summaryScroll}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.summaryTitle}>Booking Summary</Text>

                {/* Items Count */}
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    {cartItems.length} room{cartItems.length > 1 ? "s" : ""}
                  </Text>
                  <Text style={styles.summaryValue}>
                    {subtotal.toLocaleString("en-US")} VND
                  </Text>
                </View>

                {/* Service Fee */}
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Service fee</Text>
                  <Text style={styles.summaryValue}>
                    {serviceFee.toLocaleString("en-US")} VND
                  </Text>
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Total */}
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>
                    {total.toLocaleString("en-US")} VND
                  </Text>
                </View>

                {/* Checkout Button */}
                <TouchableOpacity
                  style={styles.checkoutButton}
                  onPress={handleProceedToCheckout}
                >
                  <Text style={styles.checkoutButtonText}>
                    Proceed to Checkout
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </>
        )}
      </View>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    flex: 1,
    textAlign: "center",
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    fontSize: 14,
    color: "#ff3b30",
    fontWeight: "600",
  },
  headerPlaceholder: {
    width: 60,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#7f7f7f",
    textAlign: "center",
    marginBottom: 32,
  },
  browseButton: {
    backgroundColor: "#007ef2",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
  },
  browseButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  summaryContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  summaryScroll: {
    maxHeight: 280,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#7f7f7f",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 16,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#007ef2",
  },
  checkoutButton: {
    backgroundColor: "#007ef2",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});
