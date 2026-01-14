/**
 * ErrorView Component
 * Reusable error display component for screens
 * Shows error icon, message, and retry button
 */

import { AlertTriangle, RefreshCw, WifiOff } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

interface ErrorViewProps {
  /** Error message to display */
  message: string;
  /** Callback when retry button is pressed */
  onRetry?: () => void;
  /** Whether a retry is in progress */
  isRetrying?: boolean;
  /** Whether this is a network error (shows different icon) */
  isNetworkError?: boolean;
  /** Custom title (defaults based on error type) */
  title?: string;
  /** Custom style for container */
  style?: ViewStyle;
  /** Whether to show full screen (flex: 1) or inline */
  fullScreen?: boolean;
  /** Hide retry button */
  hideRetry?: boolean;
  /** Custom retry button text */
  retryText?: string;
}

export const ErrorView: React.FC<ErrorViewProps> = ({
  message,
  onRetry,
  isRetrying = false,
  isNetworkError = false,
  title,
  style,
  fullScreen = true,
  hideRetry = false,
  retryText = "Try Again",
}) => {
  const defaultTitle = isNetworkError
    ? "Connection Error"
    : "Something went wrong";
  const displayTitle = title || defaultTitle;

  const IconComponent = isNetworkError ? WifiOff : AlertTriangle;
  const iconColor = isNetworkError ? "#f97316" : "#ef4444";
  const iconBgColor = isNetworkError ? "#fff7ed" : "#fef2f2";

  return (
    <View
      style={[
        fullScreen ? styles.fullScreenContainer : styles.inlineContainer,
        style,
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
        <IconComponent size={40} color={iconColor} />
      </View>

      <Text style={styles.title}>{displayTitle}</Text>

      <Text style={styles.message}>{message}</Text>

      {!hideRetry && onRetry && (
        <TouchableOpacity
          style={[styles.retryButton, isRetrying && styles.retryButtonDisabled]}
          onPress={onRetry}
          disabled={isRetrying}
          activeOpacity={0.7}
        >
          {isRetrying ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <RefreshCw size={18} color="#fff" />
              <Text style={styles.retryButtonText}>{retryText}</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

/**
 * Inline error message component
 * For displaying errors within forms or sections (smaller footprint)
 */
interface InlineErrorProps {
  message: string;
  style?: ViewStyle;
}

export const InlineError: React.FC<InlineErrorProps> = ({ message, style }) => {
  if (!message) return null;

  return (
    <View style={[styles.inlineErrorContainer, style]}>
      <AlertTriangle size={16} color="#ef4444" />
      <Text style={styles.inlineErrorText}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    backgroundColor: "#f5fafe",
  },
  inlineContainer: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: "center",
    backgroundColor: "#f5fafe",
    borderRadius: 16,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
    maxWidth: 280,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007ef2",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    minWidth: 140,
    shadowColor: "#007ef2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonDisabled: {
    backgroundColor: "#93c5fd",
    shadowOpacity: 0,
    elevation: 0,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  inlineErrorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  inlineErrorText: {
    flex: 1,
    fontSize: 13,
    color: "#dc2626",
    lineHeight: 18,
  },
});

export default ErrorView;
