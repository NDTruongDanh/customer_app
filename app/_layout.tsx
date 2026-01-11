import { CartProvider } from "@/src/context/CartContext";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <CartProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </CartProvider>
    </SafeAreaProvider>
  );
}
