import { useRegister } from "@/src/hooks";
import type { RegisterData } from "@/src/types";
import { showAlert } from "@/src/utils/alert";
import { handleApiError } from "@/src/utils/errorHandler";
import { signupSchema, validateForm } from "@/src/utils/validation";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Eye, EyeOff, Lock, Mail, Phone, User } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { z } from "zod";

export default function SignupScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<z.ZodIssue[] | undefined>(undefined);

  const registerMutation = useRegister();

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

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    clearFieldError("phone");
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    clearFieldError("password");
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    clearFieldError("confirmPassword");
  };

  const handleContinue = () => {
    const result = validateForm(signupSchema, {
      fullName,
      email,
      phone,
      password,
      confirmPassword,
    });

    if (!result.success) {
      setErrors(result.errors);
      // Show the first error as an alert
      const firstError = result.errors[0];
      showAlert("Validation Error", firstError.message);
      return;
    }

    setErrors(undefined);

    const registerData: RegisterData = {
      fullName: result.data.fullName,
      phone: result.data.phone,
      email: result.data.email,
      password: result.data.password,
    };

    registerMutation.mutate(registerData, {
      onSuccess: () => {
        router.replace("/verify-email");
      },
      onError: (error: unknown) => {
        console.error("Signup error:", error);
        const errorInfo = handleApiError(
          error,
          "Signup failed. Please try again."
        );
        showAlert("Signup Failed", errorInfo.message);
      },
    });
  };

  const handleLoginPress = () => {
    router.push("/login");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            {/* Back Button */}
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <MaterialIcons name="arrow-back" size={24} color="#007EF2" />
            </Pressable>

            {/* Title */}
            <View style={styles.headerContainer}>
              <Text style={styles.title}>
                <Text style={styles.titleCreate}>Create</Text>{" "}
                <Text style={styles.titleAccount}>Account</Text>
              </Text>
              <Text style={styles.subtitle}>
                Fill your information below to create your account.
              </Text>
            </View>

            {/* Input Fields */}
            <View style={styles.formContainer}>
              {/* Full Name Input */}
              <View style={[styles.inputContainer, styles.inputFocused]}>
                <User size={18} color="#7F7F7F" style={styles.inputIcon} />
                <View style={styles.inputContent}>
                  {/* <Text style={styles.inputLabel}>Full Name</Text> */}
                  <TextInput
                    style={styles.input}
                    value={fullName}
                    onChangeText={handleFullNameChange}
                    placeholder="Full Name"
                    placeholderTextColor="#7F7F7F"
                  />
                </View>
              </View>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Mail size={18} color="#7F7F7F" style={styles.emailIcon} />
                <TextInput
                  style={styles.inputField}
                  value={email}
                  onChangeText={handleEmailChange}
                  placeholder="Email Address"
                  placeholderTextColor="#7F7F7F"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Phone Input */}
              <View style={styles.inputContainer}>
                <Phone size={18} color="#7F7F7F" style={styles.phoneIcon} />
                <TextInput
                  style={styles.inputField}
                  value={phone}
                  onChangeText={handlePhoneChange}
                  placeholder="Phone Number"
                  placeholderTextColor="#7F7F7F"
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Lock size={18} color="#7F7F7F" style={styles.passwordIcon} />
                <TextInput
                  style={styles.inputField}
                  value={password}
                  onChangeText={handlePasswordChange}
                  placeholder="Password"
                  placeholderTextColor="#7F7F7F"
                  secureTextEntry={!showPassword}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff size={18} color="#7F7F7F" />
                  ) : (
                    <Eye size={18} color="#7F7F7F" />
                  )}
                </Pressable>
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <Lock size={18} color="#7F7F7F" style={styles.passwordIcon} />
                <TextInput
                  style={styles.inputField}
                  value={confirmPassword}
                  onChangeText={handleConfirmPasswordChange}
                  placeholder="Confirm Password"
                  placeholderTextColor="#7F7F7F"
                  secureTextEntry={!showConfirmPassword}
                />
                <Pressable
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} color="#7F7F7F" />
                  ) : (
                    <Eye size={18} color="#7F7F7F" />
                  )}
                </Pressable>
              </View>

              {/* Continue Button */}
              <Pressable
                style={[
                  styles.continueButton,
                  registerMutation.isPending && styles.continueButtonDisabled,
                ]}
                onPress={handleContinue}
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.continueButtonText}>Continue</Text>
                )}
              </Pressable>
            </View>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <Pressable onPress={handleLoginPress}>
                <Text style={styles.loginLink}>Login</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5FAFE",
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#F5FAFE",
    paddingTop: 20,
  },
  backButton: {
    position: "absolute",
    left: 16,
    top: 21,
    width: 24,
    height: 24,
    zIndex: 10,
  },
  headerContainer: {
    alignItems: "center",
    marginTop: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  titleCreate: {
    color: "rgba(0, 0, 0, 0.81)",
  },
  titleAccount: {
    color: "#007EF2",
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "rgba(0, 0, 0, 0.55)",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 318,
  },
  formContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 53,
    borderWidth: 1,
    borderColor: "rgba(108, 104, 104, 0.31)",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 15,
    backgroundColor: "#FFFFFF",
  },
  inputFocused: {
    borderColor: "#007EF2",
  },
  inputIcon: {
    marginRight: 8,
  },
  emailIcon: {
    marginRight: 8,
  },
  phoneIcon: {
    marginRight: 8,
  },
  passwordIcon: {
    marginRight: 8,
  },
  inputContent: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 10,
    color: "#7F7F7F",
    marginBottom: 2,
  },
  input: {
    fontSize: 15,
    color: "#000000",
    padding: 0,
    margin: 0,
  },
  inputField: {
    flex: 1,
    fontSize: 15,
    color: "#000000",
    padding: 0,
  },
  continueButton: {
    backgroundColor: "#007EF2",
    borderRadius: 10,
    height: 41,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  continueButtonDisabled: {
    backgroundColor: "#B0D4F1",
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.88)",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 20,
  },
  loginText: {
    fontSize: 15,
    color: "rgba(0, 0, 0, 0.6)",
  },
  loginLink: {
    fontSize: 15,
    color: "#FFD700",
    textDecorationLine: "underline",
    fontWeight: "500",
  },
});
