import { Tabs } from "expo-router";
import { Calendar, Home, User } from "lucide-react-native";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabLayout() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5fafe",
  },
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
});
