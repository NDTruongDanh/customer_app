import { authService } from "@/src/api";
import type { User } from "@/src/types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await SecureStore.getItemAsync("userData");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          setLoggingOut(true);
          try {
            const refreshToken = await SecureStore.getItemAsync("refreshToken");

            if (refreshToken) {
              await authService.logout(refreshToken);
            }

            // Clear all stored data
            await SecureStore.deleteItemAsync("accessToken");
            await SecureStore.deleteItemAsync("refreshToken");
            await SecureStore.deleteItemAsync("userData");

            Alert.alert("Success", "Logged out successfully!");
            router.replace("/welcome");
          } catch (error: any) {
            console.error("Logout error:", error);

            // Clear tokens even if API call fails
            await SecureStore.deleteItemAsync("accessToken");
            await SecureStore.deleteItemAsync("refreshToken");
            await SecureStore.deleteItemAsync("userData");

            Alert.alert("Logged Out", "You have been logged out.");
            router.replace("/welcome");
          } finally {
            setLoggingOut(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007EF2" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="account-circle"
            size={80}
            color="#007EF2"
          />
          <Text style={styles.welcomeText}>Welcome!</Text>
          {user && <Text style={styles.nameText}>{user.name}</Text>}
        </View>

        {/* Success Card */}
        <View style={styles.successCard}>
          <MaterialCommunityIcons
            name="check-circle"
            size={50}
            color="#4CAF50"
          />
          <Text style={styles.successTitle}>Authentication Successful</Text>
          <Text style={styles.successMessage}>
            You have successfully logged in to Room Master
          </Text>
        </View>

        {/* User Information Card */}
        {user && (
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Your Account Information</Text>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="account" size={24} color="#666" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Name</Text>
                <Text style={styles.infoValue}>{user.name}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="email" size={24} color="#666" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user.email}</Text>
              </View>
            </View>

            {user.phone && (
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="phone" size={24} color="#666" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Phone</Text>
                  <Text style={styles.infoValue}>{user.phone}</Text>
                </View>
              </View>
            )}

            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="shield-check"
                size={24}
                color="#666"
              />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Account Type</Text>
                <Text style={styles.infoValue}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name={user.isEmailVerified ? "email-check" : "email-alert"}
                size={24}
                color={user.isEmailVerified ? "#4CAF50" : "#FF9800"}
              />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Email Verification</Text>
                <Text
                  style={[
                    styles.infoValue,
                    user.isEmailVerified ? styles.verified : styles.notVerified,
                  ]}
                >
                  {user.isEmailVerified ? "Verified" : "Not Verified"}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Token Status Card */}
        <View style={styles.tokenCard}>
          <Text style={styles.cardTitle}>Authentication Status</Text>
          <View style={styles.tokenRow}>
            <MaterialCommunityIcons
              name="key-variant"
              size={20}
              color="#4CAF50"
            />
            <Text style={styles.tokenText}>Access Token: Active</Text>
          </View>
          <View style={styles.tokenRow}>
            <MaterialCommunityIcons
              name="key-chain-variant"
              size={20}
              color="#4CAF50"
            />
            <Text style={styles.tokenText}>Refresh Token: Active</Text>
          </View>
          <Text style={styles.tokenNote}>
            Tokens are securely stored and will auto-refresh when needed
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialCommunityIcons name="logout" size={24} color="#fff" />
                <Text style={styles.logoutButtonText}>Logout</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.testNote}>
            This is a test screen. In a production app, this would be your main
            dashboard with booking features, room listings, and more.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
  },
  nameText: {
    fontSize: 20,
    color: "#666",
    marginTop: 5,
  },
  successCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
  },
  successMessage: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 5,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  infoTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  verified: {
    color: "#4CAF50",
  },
  notVerified: {
    color: "#FF9800",
  },
  tokenCard: {
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  tokenRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  tokenText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 10,
    fontWeight: "500",
  },
  tokenNote: {
    fontSize: 12,
    color: "#666",
    marginTop: 10,
    fontStyle: "italic",
  },
  actionsContainer: {
    marginTop: 10,
    marginBottom: 40,
  },
  logoutButton: {
    backgroundColor: "#F44336",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 10,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  testNote: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginTop: 20,
    fontStyle: "italic",
    paddingHorizontal: 20,
  },
});
