import { useCart } from "@/src/context/CartContext";
import { Tabs } from "expo-router";
import { Calendar, Home, ShoppingCart, User } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

export default function TabLayout() {
  const { getCartItemCount } = useCart();
  const cartCount = getCartItemCount();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#007ef2",
        tabBarInactiveTintColor: "#7f7f7f",
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIconStyle: styles.tabBarIcon,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Home size={20} color={color} fill={focused ? color : "none"} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ color }) => (
            <View style={styles.cartIconContainer}>
              <ShoppingCart size={20} color={color} />
              {cartCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {cartCount > 9 ? "9+" : cartCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="my-bookings"
        options={{
          title: "My bookings",
          tabBarIcon: ({ color }) => <Calendar size={16} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <User size={20} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#fff",
    borderTopWidth: 0,
    height: 70,
    paddingBottom: 10,
    paddingTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  tabBarLabel: {
    fontSize: 11,
    fontFamily: "Roboto",
  },
  tabBarIcon: {
    marginBottom: 2,
  },
  cartIconContainer: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -8,
    backgroundColor: "#ff3b30",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
});
