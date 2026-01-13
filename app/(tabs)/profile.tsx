import { useLogout, useProfile } from "@/src/hooks";
import { showAlert, showConfirm } from "@/src/utils/alert";
import { useRouter } from "expo-router";
import {
  CreditCard,
  Edit3,
  Home,
  LogOut,
  Mail,
  Phone,
  User as UserIcon,
} from "lucide-react-native";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const router = useRouter();

  // Use TanStack Query for profile data
  const {
    data: profileResponse,
    isLoading: loading,
    refetch,
    isRefetching: refreshing,
  } = useProfile();

  const profile = profileResponse?.data ?? null;

  // Use TanStack Query for logout
  const logoutMutation = useLogout();

  const onRefresh = () => {
    refetch();
  };

  const handleLogout = async () => {
    const confirmed = await showConfirm(
      "Logout",
      "Are you sure you want to logout?",
      "Logout",
      "Cancel"
    );

    if (!confirmed) return;

    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        router.replace("/welcome");
        // Also remove the commented out showAlert if it was there (it wasn't commented out in the file I read, but just to be safe I'm replacing the whole block)
      },
      onError: () => {
        showAlert("Logged Out", "You have been logged out.");
        router.replace("/welcome");
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007ef2" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Profile</Text>
          <Text style={styles.headerSubtitle}>Your personal information</Text>
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          {/* Avatar and Name */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <UserIcon size={50} color="#007ef2" strokeWidth={2} />
            </View>
            <Text style={styles.userName}>
              {profile?.fullName || "Guest User"}
            </Text>
            <View style={styles.memberBadge}>
              <Text style={styles.memberBadgeText}>Customer</Text>
            </View>
          </View>

          {/* Personal Information Card */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => router.push("/edit-profile")}
              >
                <Edit3 size={16} color="#007ef2" />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoCard}>
              {/* Full Name */}
              <View style={styles.infoRow}>
                <View style={styles.iconContainer}>
                  <UserIcon size={20} color="#007ef2" />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Full Name</Text>
                  <Text style={styles.infoValue}>
                    {profile?.fullName || "N/A"}
                  </Text>
                </View>
              </View>

              {/* Email */}
              <View style={styles.infoRow}>
                <View style={styles.iconContainer}>
                  <Mail size={20} color="#007ef2" />
                </View>
                <View style={styles.infoTextContainer}>
                  <View style={styles.emailHeader}>
                    <Text style={styles.infoLabel}>Email Address</Text>
                    <View
                      style={[
                        styles.verificationBadge,
                        profile?.isEmailVerified
                          ? styles.verifiedBadge
                          : styles.unverifiedBadge,
                      ]}
                    >
                      <Text
                        style={[
                          styles.verificationBadgeText,
                          profile?.isEmailVerified
                            ? styles.verifiedText
                            : styles.unverifiedText,
                        ]}
                      >
                        {profile?.isEmailVerified ? "Verified" : "Not Verified"}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.infoValue}>
                    {profile?.email || "N/A"}
                  </Text>
                </View>
              </View>

              {/* Phone */}
              <View style={styles.infoRow}>
                <View style={styles.iconContainer}>
                  <Phone size={20} color="#007ef2" />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Phone Number</Text>
                  <Text style={styles.infoValue}>
                    {profile?.phone || "N/A"}
                  </Text>
                </View>
              </View>

              {/* ID Number */}
              <View style={styles.infoRow}>
                <View style={styles.iconContainer}>
                  <CreditCard size={20} color="#007ef2" />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>ID Number</Text>
                  <Text style={styles.infoValue}>
                    {profile?.idNumber || "N/A"}
                  </Text>
                </View>
              </View>

              {/* Address */}
              <View style={[styles.infoRow, styles.lastInfoRow]}>
                <View style={styles.iconContainer}>
                  <Home size={20} color="#007ef2" />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Address</Text>
                  <Text style={styles.infoValue}>
                    {profile?.address || "N/A"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Account Statistics */}
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                ${parseFloat(profile?.totalSpent || "0").toFixed(2)}
              </Text>
              <Text style={styles.statLabel}>Total Spent</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {profile?.rankId ? "Member" : "Guest"}
              </Text>
              <Text style={styles.statLabel}>Membership</Text>
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            disabled={logoutMutation.isPending}
          >
            {logoutMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <LogOut size={20} color="#fff" />
                <Text style={styles.logoutButtonText}>Logout</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5fafe",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "OpenSans_700Bold",
    color: "#007ef2",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: "Roboto",
    color: "#666",
  },
  profileSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(0, 126, 242, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 4,
    borderColor: "#fff",
    shadowColor: "#007ef2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  userName: {
    fontSize: 24,
    fontFamily: "OpenSans_700Bold",
    color: "#333",
    marginBottom: 8,
  },
  memberBadge: {
    backgroundColor: "rgba(0, 126, 242, 0.12)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  memberBadgeText: {
    fontSize: 12,
    fontFamily: "Roboto_500Medium",
    color: "#007ef2",
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "OpenSans_700Bold",
    color: "#333",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 126, 242, 0.08)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontFamily: "Roboto_500Medium",
    color: "#007ef2",
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  lastInfoRow: {
    borderBottomWidth: 0,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 126, 242, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
    justifyContent: "center",
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: "Roboto",
    color: "#999",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontFamily: "Roboto_500Medium",
    color: "#333",
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontFamily: "OpenSans_700Bold",
    color: "#007ef2",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Roboto",
    color: "#666",
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 16,
  },
  logoutButton: {
    backgroundColor: "#F44336",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    borderRadius: 16,
    gap: 10,
    shadowColor: "#F44336",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Roboto_700Bold",
  },
  bottomSpacing: {
    height: 100,
  },
  emailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  verificationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  verifiedBadge: {
    backgroundColor: "rgba(76, 175, 80, 0.12)",
  },
  unverifiedBadge: {
    backgroundColor: "rgba(255, 152, 0, 0.12)",
  },
  verificationBadgeText: {
    fontSize: 10,
    fontFamily: "Roboto_500Medium",
  },
  verifiedText: {
    color: "#4CAF50",
  },
  unverifiedText: {
    color: "#FF9800",
  },
});
