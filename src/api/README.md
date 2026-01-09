# Authentication API Implementation

This document describes the authentication API implementation for the Room Master mobile app.

## 📁 File Structure

```
src/
├── api/
│   ├── client.ts              # Axios instance with interceptors
│   ├── endpoints.ts           # API endpoint definitions
│   ├── index.ts               # API exports
│   └── services/
│       └── auth.service.ts    # Authentication service
├── types/
│   ├── auth.types.ts          # Authentication type definitions
│   └── index.ts               # Types exports
└── constants/
    └── config.ts              # API configuration
```

## 🔑 Implemented Endpoints

### 1. **POST /customer/auth/register**

Register a new customer account.

**Request:**

```typescript
{
  email: string;
  password: string;
  name: string;
  phone?: string;
}
```

**Response:**

```typescript
{
  user: User;
  tokens: {
    access: {
      token: string;
      expires: string;
    }
    refresh: {
      token: string;
      expires: string;
    }
  }
}
```

**Usage:**

```typescript
import { authService } from "@/src/api";

const registerUser = async () => {
  try {
    const response = await authService.register({
      email: "user@example.com",
      password: "SecurePass123",
      name: "John Doe",
      phone: "+1234567890",
    });

    // Store tokens in SecureStore
    await SecureStore.setItemAsync("accessToken", response.tokens.access.token);
    await SecureStore.setItemAsync(
      "refreshToken",
      response.tokens.refresh.token
    );

    console.log("User registered:", response.user);
  } catch (error) {
    console.error("Registration failed:", error);
  }
};
```

---

### 2. **POST /customer/auth/login**

Authenticate an existing customer.

**Request:**

```typescript
{
  email: string;
  password: string;
}
```

**Response:**

```typescript
{
  user: User;
  tokens: AuthTokens;
}
```

**Usage:**

```typescript
import { authService } from "@/src/api";

const loginUser = async () => {
  try {
    const response = await authService.login(
      "user@example.com",
      "SecurePass123"
    );

    // Store tokens securely
    await SecureStore.setItemAsync("accessToken", response.tokens.access.token);
    await SecureStore.setItemAsync(
      "refreshToken",
      response.tokens.refresh.token
    );

    console.log("Logged in:", response.user);
  } catch (error) {
    console.error("Login failed:", error);
  }
};
```

---

### 3. **POST /customer/auth/logout**

Invalidate the refresh token and log out the customer.

**Request:**

```typescript
{
  refreshToken: string;
}
```

**Response:** `204 No Content`

**Usage:**

```typescript
import { authService } from "@/src/api";

const logoutUser = async () => {
  try {
    const refreshToken = await SecureStore.getItemAsync("refreshToken");

    if (refreshToken) {
      await authService.logout(refreshToken);
    }

    // Clear all stored tokens
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");

    console.log("Logged out successfully");
  } catch (error) {
    console.error("Logout failed:", error);
    // Clear tokens anyway
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");
  }
};
```

---

### 4. **POST /customer/auth/refresh-tokens**

Obtain new access and refresh tokens using a valid refresh token.

**Request:**

```typescript
{
  refreshToken: string;
}
```

**Response:**

```typescript
{
  tokens: {
    access: {
      token: string;
      expires: string;
    }
    refresh: {
      token: string;
      expires: string;
    }
  }
}
```

**Usage:**

```typescript
import { authService } from "@/src/api";

const refreshAuthTokens = async () => {
  try {
    const refreshToken = await SecureStore.getItemAsync("refreshToken");

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await authService.refreshTokens(refreshToken);

    // Store new tokens
    await SecureStore.setItemAsync("accessToken", response.tokens.access.token);
    await SecureStore.setItemAsync(
      "refreshToken",
      response.tokens.refresh.token
    );

    console.log("Tokens refreshed successfully");
  } catch (error) {
    console.error("Token refresh failed:", error);
    // Navigate to login screen
  }
};
```

> **Note:** Token refresh is handled automatically by the Axios interceptor in `client.ts`. You typically don't need to call this manually.

---

### 5. **POST /customer/auth/forgot-password** (Bonus)

Request a password reset email.

**Request:**

```typescript
{
  email: string;
}
```

**Response:** `204 No Content`

**Usage:**

```typescript
import { authService } from "@/src/api";

const requestPasswordReset = async () => {
  try {
    await authService.forgotPassword("user@example.com");
    console.log("Password reset email sent");
  } catch (error) {
    console.error("Failed to send reset email:", error);
  }
};
```

---

### 6. **POST /customer/auth/reset-password** (Bonus)

Reset password using the token from email.

**Request:**

```typescript
{
  token: string;
  password: string;
}
```

**Response:** `204 No Content`

**Usage:**

```typescript
import { authService } from "@/src/api";

const resetPassword = async (resetToken: string) => {
  try {
    await authService.resetPassword(resetToken, "NewSecurePass123");
    console.log("Password reset successfully");
    // Navigate to login screen
  } catch (error) {
    console.error("Password reset failed:", error);
  }
};
```

---

## 🔐 Automatic Token Refresh

The Axios client includes automatic token refresh functionality:

1. **Request Interceptor:** Automatically adds the access token to all requests
2. **Response Interceptor:** Catches 401 errors and attempts to refresh the token
3. **Retry Logic:** Retries the original request after successfully refreshing tokens

This means you don't need to manually handle token expiration in your components.

---

## 🛠️ Type Safety

All API functions are fully typed with TypeScript:

```typescript
// Auth types
interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: "customer";
  isEmailVerified: boolean;
}

interface AuthTokens {
  access: { token: string; expires: string };
  refresh: { token: string; expires: string };
}

interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}
```

---

## ⚠️ Error Handling

All API errors follow a consistent structure:

```typescript
interface ApiError {
  code: number;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
```

**Example error handling:**

```typescript
import { AxiosError } from "axios";
import { ApiError } from "@/src/types";

try {
  await authService.login(email, password);
} catch (error) {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiError;

    if (apiError.errors) {
      // Validation errors
      apiError.errors.forEach((err) => {
        console.log(`${err.field}: ${err.message}`);
      });
    } else {
      // General error
      console.error(apiError.message);
    }
  }
}
```

---

## 📦 Installation

Make sure you have the required dependencies:

```bash
# Using npm
npm install axios expo-secure-store

# Using pnpm
pnpm install axios expo-secure-store

# Using yarn
yarn add axios expo-secure-store
```

---

## 🚀 Quick Start

**1. Import the service:**

```typescript
import { authService } from "@/src/api";
import * as SecureStore from "expo-secure-store";
```

**2. Use in your login screen:**

```typescript
const handleLogin = async (email: string, password: string) => {
  try {
    const response = await authService.login(email, password);

    // Save tokens
    await SecureStore.setItemAsync("accessToken", response.tokens.access.token);
    await SecureStore.setItemAsync(
      "refreshToken",
      response.tokens.refresh.token
    );

    // Navigate to main app
    navigation.navigate("Home");
  } catch (error) {
    // Show error to user
    Alert.alert("Login Failed", "Invalid email or password");
  }
};
```

**3. Use in your signup screen:**

```typescript
const handleSignup = async (data: RegisterData) => {
  try {
    const response = await authService.register(data);

    // Save tokens
    await SecureStore.setItemAsync("accessToken", response.tokens.access.token);
    await SecureStore.setItemAsync(
      "refreshToken",
      response.tokens.refresh.token
    );

    // Navigate to main app
    navigation.navigate("Home");
  } catch (error) {
    // Show error to user
    Alert.alert("Signup Failed", "Please check your information");
  }
};
```

---

## 🔗 Related Files

- **API Client:** [src/api/client.ts](./src/api/client.ts)
- **Auth Service:** [src/api/services/auth.service.ts](./src/api/services/auth.service.ts)
- **Type Definitions:** [src/types/auth.types.ts](./src/types/auth.types.ts)
- **Configuration:** [src/constants/config.ts](./src/constants/config.ts)

---

## 📝 Notes

1. **Secure Storage:** Always use `expo-secure-store` for storing tokens, never use AsyncStorage
2. **Token Expiry:** Access tokens expire and are automatically refreshed by the interceptor
3. **Logout:** Always call `logout()` to invalidate the refresh token on the server
4. **Error Handling:** Always wrap API calls in try-catch blocks
5. **Navigation:** After logout or token refresh failure, navigate users to the login screen

---

## 🎯 Next Steps

To complete the authentication flow, you should:

1. Create an AuthContext to manage authentication state globally
2. Implement the login and signup screens
3. Add error handling UI (alerts, toasts, etc.)
4. Implement protected routes/navigation guards
5. Add loading states during API calls

Refer to the main project instructions for implementing these features.
