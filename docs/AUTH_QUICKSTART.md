# 🔑 Authentication API - Quick Reference

## 📦 Installation Complete

The authentication API has been fully implemented with all required endpoints.

## 🚀 Quick Start

### 1. Import the service

```typescript
import { authService } from "@/src/api";
import * as SecureStore from "expo-secure-store";
```

### 2. Login

```typescript
const response = await authService.login(email, password);
await SecureStore.setItemAsync("accessToken", response.tokens.access.token);
await SecureStore.setItemAsync("refreshToken", response.tokens.refresh.token);
```

### 3. Register

```typescript
const response = await authService.register({
  email,
  password,
  name,
  phone,
});
await SecureStore.setItemAsync("accessToken", response.tokens.access.token);
await SecureStore.setItemAsync("refreshToken", response.tokens.refresh.token);
```

### 4. Logout

```typescript
const refreshToken = await SecureStore.getItemAsync("refreshToken");
await authService.logout(refreshToken);
await SecureStore.deleteItemAsync("accessToken");
await SecureStore.deleteItemAsync("refreshToken");
```

## 📁 Implementation Files

- **`src/api/client.ts`** - Axios client with auto token refresh
- **`src/api/services/auth.service.ts`** - Authentication endpoints
- **`src/types/auth.types.ts`** - TypeScript types
- **`src/constants/config.ts`** - API configuration

## 📚 Full Documentation

See [IMPLEMENTATION_SUMMARY.md](../IMPLEMENTATION_SUMMARY.md) for complete documentation.

## 🔗 API Endpoints

| Endpoint                         | Method | Description    |
| -------------------------------- | ------ | -------------- |
| `/customer/auth/register`        | POST   | Create account |
| `/customer/auth/login`           | POST   | Login          |
| `/customer/auth/logout`          | POST   | Logout         |
| `/customer/auth/refresh-tokens`  | POST   | Refresh tokens |
| `/customer/auth/forgot-password` | POST   | Request reset  |
| `/customer/auth/reset-password`  | POST   | Reset password |

## ✨ Features

- ✅ Automatic token refresh
- ✅ Secure token storage
- ✅ Full TypeScript support
- ✅ Error handling
- ✅ Usage examples included

## 🎯 Next Step

Integrate these services into your login and signup screens using the examples in `src/api/USAGE_EXAMPLES.ts`.
