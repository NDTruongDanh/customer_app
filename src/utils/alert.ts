/**
 * Cross-platform alert utility
 * Uses native Alert on mobile and browser alert/confirm on web
 */

import { Alert, Platform } from "react-native";

/**
 * Show an alert message
 * Works on both web and mobile platforms
 */
export const showAlert = (title: string, message?: string) => {
  if (Platform.OS === "web") {
    const alertMessage = message ? `${title}\n\n${message}` : title;
    alert(alertMessage);
  } else {
    Alert.alert(title, message);
  }
};

/**
 * Show a confirmation dialog
 * Returns a promise that resolves to true if confirmed, false if cancelled
 */
export const showConfirm = (
  title: string,
  message?: string,
  confirmText: string = "OK",
  cancelText: string = "Cancel"
): Promise<boolean> => {
  return new Promise((resolve) => {
    if (Platform.OS === "web") {
      const confirmMessage = message ? `${title}\n\n${message}` : title;
      const result = window.confirm(confirmMessage);
      resolve(result);
    } else {
      Alert.alert(title, message, [
        {
          text: cancelText,
          style: "cancel",
          onPress: () => resolve(false),
        },
        {
          text: confirmText,
          onPress: () => resolve(true),
        },
      ]);
    }
  });
};

/**
 * Show an alert with custom buttons (mobile only, falls back to simple alert on web)
 */
export const showAlertWithButtons = (
  title: string,
  message: string,
  buttons: {
    text: string;
    style?: "default" | "cancel" | "destructive";
    onPress?: () => void;
  }[]
) => {
  if (Platform.OS === "web") {
    // On web, just show the message and call the first non-cancel button's callback
    const alertMessage = `${title}\n\n${message}`;
    alert(alertMessage);
    const defaultButton = buttons.find((b) => b.style !== "cancel");
    if (defaultButton?.onPress) {
      defaultButton.onPress();
    }
  } else {
    Alert.alert(title, message, buttons as any);
  }
};
