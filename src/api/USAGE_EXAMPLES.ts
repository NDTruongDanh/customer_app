/**
 * Authentication Usage Examples
 *
 * This file demonstrates how to integrate the authentication API
 * into your login and signup screens.
 */

import { authService } from "@/src/api";
import { RegisterData } from "@/src/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

/**
 * Example 1: Login Screen Integration
 */
export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      // Call login API
      const response = await authService.login(email, password);

      // Store tokens securely
      await AsyncStorage.setItem("accessToken", response.tokens.access.token);
      await AsyncStorage.setItem("refreshToken", response.tokens.refresh.token);

      // Optionally store user data
      await AsyncStorage.setItem("userData", JSON.stringify(response.user));

      // Show success message
      Alert.alert("Success", "Logged in successfully!");

      // Navigate to home screen
      router.replace("/");

      return response.user;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Login failed. Please try again.";
      setError(errorMessage);
      Alert.alert("Login Failed", errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};

/**
 * Example 2: Signup Screen Integration
 */
export const useSignup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const signup = async (data: RegisterData) => {
    setLoading(true);
    setError(null);

    try {
      // Call register API
      const response = await authService.register(data);

      // Store tokens securely
      await AsyncStorage.setItem("accessToken", response.tokens.access.token);
      await AsyncStorage.setItem("refreshToken", response.tokens.refresh.token);

      // Optionally store user data
      await AsyncStorage.setItem("userData", JSON.stringify(response.user));

      // Show success message
      Alert.alert("Success", "Account created successfully!");

      // Navigate to home screen
      router.replace("/");

      return response.user;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Signup failed. Please try again.";

      // Handle validation errors
      if (err.response?.data?.errors) {
        const validationErrors = err.response.data.errors
          .map((e: any) => `${e.field}: ${e.message}`)
          .join("\n");
        setError(validationErrors);
        Alert.alert("Validation Error", validationErrors);
      } else {
        setError(errorMessage);
        Alert.alert("Signup Failed", errorMessage);
      }

      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { signup, loading, error };
};

/**
 * Example 3: Logout Functionality
 */
export const useLogout = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const logout = async () => {
    setLoading(true);

    try {
      // Get refresh token
      const refreshToken = await AsyncStorage.getItem("refreshToken");

      if (refreshToken) {
        // Call logout API
        await authService.logout(refreshToken);
      }

      // Clear all stored data
      await AsyncStorage.removeItem("accessToken");
      await AsyncStorage.removeItem("refreshToken");
      await AsyncStorage.removeItem("userData");

      // Navigate to welcome/login screen
      router.replace("/welcome");

      Alert.alert("Success", "Logged out successfully!");
    } catch (err: any) {
      console.error("Logout error:", err);

      // Clear tokens even if API call fails
      await AsyncStorage.removeItem("accessToken");
      await AsyncStorage.removeItem("refreshToken");
      await AsyncStorage.removeItem("userData");

      // Still navigate to login
      router.replace("/welcome");
    } finally {
      setLoading(false);
    }
  };

  return { logout, loading };
};

/**
 * Example 4: Check if user is authenticated on app startup
 */
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const checkAuth = async () => {
    try {
      const accessToken = await AsyncStorage.getItem("accessToken");
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      const userData = await AsyncStorage.getItem("userData");

      if (accessToken && refreshToken) {
        setIsAuthenticated(true);
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return { isAuthenticated, user, loading, checkAuth };
};

/**
 * Example 5: Password Reset Flow
 */
export const usePasswordReset = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestReset = async (email: string) => {
    setLoading(true);
    setError(null);

    try {
      await authService.forgotPassword(email);
      Alert.alert(
        "Email Sent",
        "Please check your email for password reset instructions."
      );
      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to send reset email.";
      setError(errorMessage);
      Alert.alert("Error", errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    setLoading(true);
    setError(null);

    try {
      await authService.resetPassword(token, newPassword);
      Alert.alert("Success", "Your password has been reset successfully!");
      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to reset password.";
      setError(errorMessage);
      Alert.alert("Error", errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { requestReset, resetPassword, loading, error };
};

/**
 * Example 6: Using in a Login Screen Component
 */
/*
import { View, TextInput, Button, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useLogin } from '@/src/hooks/useAuth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useLogin();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await login(email, password);
    } catch (error) {
      // Error is already handled in useLogin hook
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Button title="Login" onPress={handleLogin} />
      )}
    </View>
  );
}
*/

/**
 * Example 7: Using in a Signup Screen Component
 */
/*
import { View, TextInput, Button, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useSignup } from '@/src/hooks/useAuth';

export default function SignupScreen() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });
  const { signup, loading, error } = useSignup();

  const handleSignup = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      await signup(formData);
    } catch (error) {
      // Error is already handled in useSignup hook
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Name"
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
      />
      <TextInput
        placeholder="Email"
        value={formData.email}
        onChangeText={(text) => setFormData({ ...formData, email: text })}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Password"
        value={formData.password}
        onChangeText={(text) => setFormData({ ...formData, password: text })}
        secureTextEntry
      />
      <TextInput
        placeholder="Phone (optional)"
        value={formData.phone}
        onChangeText={(text) => setFormData({ ...formData, phone: text })}
        keyboardType="phone-pad"
      />
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Button title="Sign Up" onPress={handleSignup} />
      )}
    </View>
  );
}
*/
