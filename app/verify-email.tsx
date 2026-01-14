import { useResendVerification } from "@/src/hooks";
import { showAlert } from "@/src/utils/alert";
import { handleApiError } from "@/src/utils/errorHandler";
import { useRouter } from "expo-router";
import { Mail } from "lucide-react-native";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VerifyEmailScreen() {
  const router = useRouter();
  const resendMutation = useResendVerification();

  const handleResendEmail = () => {
    resendMutation.mutate(undefined, {
      onSuccess: () => {
        showAlert(
          "Email Sent",
          "A verification email has been sent to your inbox."
        );
      },
      onError: (error: unknown) => {
        const errorInfo = handleApiError(
          error,
          "Failed to resend verification email"
        );
        showAlert("Error", errorInfo.message);
      },
    });
  };

  const handleGoToLogin = () => {
    // If we want to force them to re-login, we could clear tokens here.
    // typically we just send them to login screen.
    router.replace("/login");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Mail size={48} color="#007EF2" />
          </View>
        </View>

        <Text style={styles.title}>Verify your email</Text>

        <Text style={styles.description}>
          We've sent a verification email to your inbox. Please check your email
          and click the link to verify your account before you can continue.
        </Text>

        <View style={styles.buttonContainer}>
          <Pressable
            style={[
              styles.resendButton,
              resendMutation.isPending && styles.buttonDisabled,
            ]}
            onPress={handleResendEmail}
            disabled={resendMutation.isPending}
          >
            {resendMutation.isPending ? (
              <ActivityIndicator color="#007EF2" />
            ) : (
              <Text style={styles.resendButtonText}>Resend Email</Text>
            )}
          </Pressable>

          <Pressable style={styles.loginButton} onPress={handleGoToLogin}>
            <Text style={styles.loginButtonText}>Back to Login</Text>
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
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(0, 126, 242, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "rgba(0, 0, 0, 0.6)",
    textAlign: "center",
    marginBottom: 48,
    lineHeight: 24,
  },
  buttonContainer: {
    width: "100%",
    gap: 16,
  },
  resendButton: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#007EF2",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  resendButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007EF2",
  },
  loginButton: {
    height: 50,
    borderRadius: 12,
    backgroundColor: "#007EF2",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#007EF2",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
