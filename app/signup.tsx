import { authService } from "@/src/api";
import type { RegisterData } from "@/src/types";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Eye, EyeOff, Lock, Mail, Phone, User } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignupScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!fullName || !email || !password || !confirmPassword || !phone) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    // Password validation
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const registerData: RegisterData = {
        fullName: fullName,
        phone: phone,
        email,
        password,
      };

      const response = await authService.register(registerData);

      // Store tokens securely - response has nested structure { data: { customer, tokens } }
      await SecureStore.setItemAsync(
        "accessToken",
        response.data.tokens.access.token
      );
      await SecureStore.setItemAsync(
        "refreshToken",
        response.data.tokens.refresh.token
      );

      // Store customer data
      await SecureStore.setItemAsync(
        "userData",
        JSON.stringify(response.data.customer)
      );

      Alert.alert("Success", "Account created successfully!");
      router.replace("/(tabs)/home");
    } catch (error: any) {
      console.error("Signup error:", error);

      // Handle validation errors
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors
          .map((e: any) => `${e.field}: ${e.message}`)
          .join("\n");
        Alert.alert("Validation Error", validationErrors);
      } else {
        const errorMessage =
          error.response?.data?.message || "Signup failed. Please try again.";
        Alert.alert("Signup Failed", errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    console.log("Google signup pressed");
    // Will implement later
  };

  const handleFacebookSignup = () => {
    console.log("Facebook signup pressed");
    // Will implement later
  };

  const handleLoginPress = () => {
    router.push("/login");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
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
            Fill your information below or register with your social account.
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
                onChangeText={setFullName}
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
              onChangeText={setEmail}
              placeholder="Email Address"
              placeholderTextColor="#7F7F7F"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Phone size={18} color="#7F7F7F" style={styles.phoneIcon} />
            <TextInput
              style={styles.inputField}
              value={phone}
              onChangeText={setPhone}
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
              onChangeText={setPassword}
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
              onChangeText={setConfirmPassword}
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
              loading && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.continueButtonText}>Continue</Text>
            )}
          </Pressable>
        </View>

        {/* Social Login Section */}
        <View style={styles.socialContainer}>
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or signup with</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialButtonsContainer}>
            {/* Google Button */}
            <Pressable style={styles.socialButton} onPress={handleGoogleSignup}>
              <Image
                source={{
                  uri: "https://www.figma.com/api/mcp/asset/ff677b0b-2270-40ee-b873-166062a75610",
                }}
                style={styles.socialIcon}
              />
            </Pressable>

            {/* Facebook Button */}
            <Pressable
              style={styles.socialButton}
              onPress={handleFacebookSignup}
            >
              <Image
                source={{
                  uri: "https://www.figma.com/api/mcp/asset/b4e7a989-70a3-41ab-906b-c45a3ab678d0",
                }}
                style={styles.socialIcon}
              />
            </Pressable>
          </View>
        </View>

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <Pressable onPress={handleLoginPress}>
            <Text style={styles.loginLink}>Login</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5FAFE",
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
  socialContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(108, 104, 104, 0.31)",
  },
  dividerText: {
    fontSize: 15,
    color: "#7F7F7F",
    marginHorizontal: 12,
  },
  socialButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 30,
  },
  socialButton: {
    width: 57,
    height: 57,
    borderRadius: 28.5,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  socialIcon: {
    width: 27,
    height: 27,
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
