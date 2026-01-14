import { useLogin } from "@/src/hooks";
import { showAlert } from "@/src/utils/alert";
import { handleApiError } from "@/src/utils/errorHandler";
import { loginSchema, validateForm } from "@/src/utils/validation";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Eye, EyeOff, Lock, Phone } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { z } from "zod";

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<z.ZodIssue[] | undefined>(undefined);

  const loginMutation = useLogin();

  // Clear field error when user types
  const handlePhoneChange = (value: string) => {
    setPhone(value);
    if (errors) {
      setErrors(errors.filter((e) => !e.path.includes("phone")));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (errors) {
      setErrors(errors.filter((e) => !e.path.includes("password")));
    }
  };

  const handleLogin = () => {
    const result = validateForm(loginSchema, { phone, password });

    if (!result.success) {
      setErrors(result.errors);
      // Show the first error as an alert
      const firstError = result.errors[0];
      showAlert("Validation Error", firstError.message);
      return;
    }

    setErrors(undefined);

    loginMutation.mutate(
      { phone: result.data.phone, password: result.data.password },
      {
        onSuccess: (response) => {
          if (response.data.customer.isEmailVerified) {
            router.replace("/(tabs)/home");
          } else {
            router.replace("/verify-email");
          }
        },
        onError: (error: unknown) => {
          console.error("Login error:", error);
          const errorInfo = handleApiError(
            error,
            "Login failed. Please check your credentials."
          );
          showAlert("Login Failed", errorInfo.message);
        },
      }
    );
  };

  const handleForgotPassword = () => {
    console.log("Forgot password pressed");
    // Will implement later
  };

  const handleSignupPress = () => {
    router.push("/signup");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View style={styles.container}>
          {/* Back Button */}
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#007EF2" />
          </Pressable>

          {/* Title */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>
              <Text style={styles.titleWelcome}>Welcome</Text>{" "}
              <Text style={styles.titleBack}>Back</Text>
            </Text>
            <Text style={styles.subtitle}>
              We missed you! Login to continue your journey with us.
            </Text>
          </View>

          {/* Input Fields */}
          <View style={styles.formContainer}>
            {/* Email Input */}
            <View style={[styles.inputContainer, styles.inputFocused]}>
              <Phone size={18} color="#7F7F7F" style={styles.phoneIcon} />
              <View style={styles.inputContent}>
                {/* <Text style={styles.inputLabel}>Email Address</Text> */}
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={handlePhoneChange}
                  placeholder="Phone Number"
                  placeholderTextColor="#7F7F7F"
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                />
              </View>
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

            {/* Forgot Password Link */}
            <Pressable
              style={styles.forgotPasswordContainer}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </Pressable>

            {/* Login Button */}
            <Pressable
              style={[
                styles.loginButton,
                loginMutation.isPending && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </Pressable>
          </View>

          {/* Signup Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Doesnot have an account? </Text>
            <Pressable onPress={handleSignupPress}>
              <Text style={styles.signupLink}>Signup</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#F5FAFE",
  },
  container: {
    flex: 1,
    backgroundColor: "#F5FAFE",
    paddingTop: 16,
  },
  backButton: {
    position: "absolute",
    left: 15,
    top: 16,
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
  titleWelcome: {
    color: "rgba(0, 0, 0, 0.81)",
  },
  titleBack: {
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
  forgotPasswordContainer: {
    alignSelf: "flex-start",
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 15,
    color: "#FFD700",
    textDecorationLine: "underline",
    fontWeight: "500",
  },
  loginButton: {
    backgroundColor: "#007EF2",
    borderRadius: 10,
    height: 41,
    justifyContent: "center",
    alignItems: "center",
  },
  loginButtonDisabled: {
    backgroundColor: "#B0D4F1",
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.88)",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 80,
    marginBottom: 20,
  },
  signupText: {
    fontSize: 15,
    color: "rgba(0, 0, 0, 0.6)",
  },
  signupLink: {
    fontSize: 15,
    color: "#FFD700",
    textDecorationLine: "underline",
    fontWeight: "500",
  },
});
