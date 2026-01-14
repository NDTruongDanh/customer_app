import { useProfile, useUpdateProfile } from "@/src/hooks";
import type { Customer } from "@/src/types";
import { handleApiError } from "@/src/utils/errorHandler";
import { editProfileSchema, validateForm } from "@/src/utils/validation";
import { useRouter } from "expo-router";
import { ArrowLeft, Save } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { z } from "zod";

export default function EditProfileScreen() {
  const router = useRouter();

  // Use TanStack Query for profile data
  const { data: profileResponse, isLoading: loading } = useProfile();
  const updateProfileMutation = useUpdateProfile();

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState<z.ZodIssue[] | undefined>(undefined);

  // Original data for comparison
  const [originalData, setOriginalData] = useState<Customer | null>(null);

  // Sync form state when profile data loads
  useEffect(() => {
    if (profileResponse?.data) {
      const profile = profileResponse.data;
      setOriginalData(profile);
      setFullName(profile.fullName || "");
      setEmail(profile.email || "");
      setIdNumber(profile.idNumber || "");
      setAddress(profile.address || "");
    }
  }, [profileResponse]);

  // Clear field error when user types
  const clearFieldError = (field: string) => {
    if (errors) {
      setErrors(errors.filter((e) => !e.path.includes(field)));
    }
  };

  const handleFullNameChange = (value: string) => {
    setFullName(value);
    clearFieldError("fullName");
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    clearFieldError("email");
  };

  const handleIdNumberChange = (value: string) => {
    setIdNumber(value);
    clearFieldError("idNumber");
  };

  const handleAddressChange = (value: string) => {
    setAddress(value);
    clearFieldError("address");
  };

  const hasChanges = () => {
    if (!originalData) return false;
    return (
      fullName !== (originalData.fullName || "") ||
      email !== (originalData.email || "") ||
      idNumber !== (originalData.idNumber || "") ||
      address !== (originalData.address || "")
    );
  };

  const handleSave = () => {
    // Prepare data (only include non-empty values)
    const formData = {
      fullName: fullName.trim() || undefined,
      idNumber: idNumber.trim() || undefined,
      address: address.trim() || undefined,
    };

    // Validate using Zod
    const result = validateForm(editProfileSchema, formData);

    if (!result.success) {
      setErrors(result.errors);
      // Show the first error as an alert
      const firstError = result.errors[0];
      Alert.alert("Validation Error", firstError.message);
      return;
    }

    setErrors(undefined);

    if (!hasChanges()) {
      Alert.alert("No Changes", "No changes were made to your profile");
      return;
    }

    updateProfileMutation.mutate(result.data, {
      onSuccess: () => {
        router.back();
      },
      onError: (error: unknown) => {
        console.error("Error updating profile:", error);
        const errorInfo = handleApiError(
          error,
          "Failed to update profile. Please try again."
        );
        Alert.alert("Error", errorInfo.message);
      },
    });
  };

  const handleCancel = () => {
    if (hasChanges()) {
      Alert.alert(
        "Discard Changes",
        "You have unsaved changes. Are you sure you want to go back?",
        [
          {
            text: "Stay",
            style: "cancel",
          },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  const saving = updateProfileMutation.isPending;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007ef2" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleCancel}
          disabled={saving}
        >
          <ArrowLeft size={24} color="#007ef2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          <Text style={styles.subtitle}>Update your personal information</Text>

          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={handleFullNameChange}
              placeholder="Enter your full name"
              placeholderTextColor="#999"
              autoCapitalize="words"
              editable={!saving}
            />
          </View>

          {/* Email */}
          {/* <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={handleEmailChange}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!saving}
            />
          </View> */}

          {/* ID Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>ID Number</Text>
            <TextInput
              style={styles.input}
              value={idNumber}
              onChangeText={handleIdNumberChange}
              placeholder="Enter your ID number"
              placeholderTextColor="#999"
              editable={!saving}
            />
          </View>

          {/* Address */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={address}
              onChangeText={handleAddressChange}
              placeholder="Enter your address"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!saving}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              (!hasChanges() || saving) && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!hasChanges() || saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Save size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 126, 242, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "OpenSans_700Bold",
    color: "#333",
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Roboto",
    color: "#666",
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: "Roboto_500Medium",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: "Roboto",
    color: "#333",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  textArea: {
    height: 100,
    paddingTop: 16,
  },
  saveButton: {
    backgroundColor: "#007ef2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    borderRadius: 16,
    gap: 10,
    shadowColor: "#007ef2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: "#ccc",
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Roboto_700Bold",
  },
  bottomSpacing: {
    height: 100,
  },
});
