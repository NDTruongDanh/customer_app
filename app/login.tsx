import { authService } from "@/src/api";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Eye, EyeOff, Lock, Phone } from "lucide-react-native";
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

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert("Error", "Please enter both phone and password");
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login(phone, password);

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

      Alert.alert("Success", "Logged in successfully!");
      router.replace("/(tabs)/home");
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Login failed. Please check your credentials.";
      Alert.alert("Login Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log("Google login pressed");
    // Will implement later
  };

  const handleFacebookLogin = () => {
    console.log("Facebook login pressed");
    // Will implement later
  };

  const handleForgotPassword = () => {
    console.log("Forgot password pressed");
    // Will implement later
  };

  const handleSignupPress = () => {
    router.push("/signup");
  };

  return (
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
              onChangeText={setPhone}
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

        {/* Forgot Password Link */}
        <Pressable
          style={styles.forgotPasswordContainer}
          onPress={handleForgotPassword}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </Pressable>

        {/* Login Button */}
        <Pressable
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </Pressable>
      </View>

      {/* Social Login Section */}
      <View style={styles.socialContainer}>
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Or continue with</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialButtonsContainer}>
          {/* Google Button */}
          <Pressable style={styles.socialButton} onPress={handleGoogleLogin}>
            <Image
              source={{
                uri: "https://www.figma.com/api/mcp/asset/12e332db-c425-4990-b013-72d2282901a1",
              }}
              style={styles.socialIcon}
            />
          </Pressable>

          {/* Facebook Button */}
          <Pressable style={styles.socialButton} onPress={handleFacebookLogin}>
            <Image
              source={{
                uri: "https://www.figma.com/api/mcp/asset/567452e6-96c2-42b3-8e11-c74eceb4818e",
              }}
              style={styles.socialIcon}
            />
          </Pressable>
        </View>
      </View>

      {/* Signup Link */}
      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>Doesnot have an account? </Text>
        <Pressable onPress={handleSignupPress}>
          <Text style={styles.signupLink}>Signup</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  socialContainer: {
    paddingHorizontal: 20,
    marginTop: 34,
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
