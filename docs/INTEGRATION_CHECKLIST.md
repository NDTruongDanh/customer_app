# 📝 Authentication Integration Checklist

Use this checklist to integrate the authentication API into your login and signup screens.

## ✅ Login Screen (`app/login.tsx`)

### Required Imports

```typescript
- [ ] import { authService } from '@/src/api';
- [ ] import * as SecureStore from 'expo-secure-store';
- [ ] import { useState } from 'react';
- [ ] import { Alert } from 'react-native';
- [ ] import { useRouter } from 'expo-router';
```

### State Management

```typescript
- [ ] const [email, setEmail] = useState('');
- [ ] const [password, setPassword] = useState('');
- [ ] const [loading, setLoading] = useState(false);
```

### Login Function

```typescript
- [ ] Create handleLogin async function
- [ ] Validate email and password (not empty)
- [ ] Set loading to true
- [ ] Call authService.login(email, password)
- [ ] Store accessToken in SecureStore
- [ ] Store refreshToken in SecureStore
- [ ] Navigate to home screen on success
- [ ] Show error alert on failure
- [ ] Set loading to false in finally block
```

### UI Components

```typescript
- [ ] Email TextInput (keyboardType="email-address", autoCapitalize="none")
- [ ] Password TextInput (secureTextEntry={true})
- [ ] Login Button (disabled when loading)
- [ ] Loading indicator (show when loading)
- [ ] Link to signup screen
- [ ] Forgot password link
```

---

## ✅ Signup Screen (`app/signup.tsx`)

### Required Imports

```typescript
- [ ] import { authService } from '@/src/api';
- [ ] import * as SecureStore from 'expo-secure-store';
- [ ] import { useState } from 'react';
- [ ] import { Alert } from 'react-native';
- [ ] import { useRouter } from 'expo-router';
- [ ] import { RegisterData } from '@/src/types';
```

### State Management

```typescript
- [ ] const [formData, setFormData] = useState<RegisterData>({
        name: '',
        email: '',
        password: '',
        phone: '',
      });
- [ ] const [loading, setLoading] = useState(false);
```

### Signup Function

```typescript
- [ ] Create handleSignup async function
- [ ] Validate required fields (name, email, password)
- [ ] Validate email format
- [ ] Validate password strength
- [ ] Set loading to true
- [ ] Call authService.register(formData)
- [ ] Store accessToken in SecureStore
- [ ] Store refreshToken in SecureStore
- [ ] Navigate to home screen on success
- [ ] Show validation errors on failure
- [ ] Set loading to false in finally block
```

### UI Components

```typescript
- [ ] Name TextInput
- [ ] Email TextInput (keyboardType="email-address", autoCapitalize="none")
- [ ] Password TextInput (secureTextEntry={true})
- [ ] Phone TextInput (keyboardType="phone-pad", optional)
- [ ] Signup Button (disabled when loading)
- [ ] Loading indicator (show when loading)
- [ ] Link to login screen
- [ ] Terms & conditions checkbox
```

---

## ✅ Profile/Settings Screen

### Logout Function

```typescript
- [ ] Create handleLogout async function
- [ ] Get refreshToken from SecureStore
- [ ] Call authService.logout(refreshToken)
- [ ] Delete accessToken from SecureStore
- [ ] Delete refreshToken from SecureStore
- [ ] Navigate to welcome/login screen
- [ ] Handle errors gracefully
```

---

## ✅ App Initialization (`app/_layout.tsx` or similar)

### Auth Check on Startup

```typescript
- [ ] Create useEffect hook
- [ ] Check if accessToken exists in SecureStore
- [ ] Check if refreshToken exists in SecureStore
- [ ] If both exist, navigate to home screen
- [ ] If either missing, navigate to welcome/login screen
- [ ] Show loading screen while checking
```

---

## ✅ Password Reset Flow (Optional)

### Forgot Password Screen

```typescript
- [ ] Email input
- [ ] Call authService.forgotPassword(email)
- [ ] Show success message
- [ ] Navigate back to login
```

### Reset Password Screen

```typescript
- [ ] Get reset token from deep link/query params
- [ ] New password input
- [ ] Confirm password input
- [ ] Call authService.resetPassword(token, newPassword)
- [ ] Navigate to login on success
```

---

## ✅ Error Handling

### Common Error Scenarios

```typescript
- [ ] Network errors (no internet)
- [ ] Validation errors (invalid email, weak password)
- [ ] Authentication errors (wrong credentials)
- [ ] Server errors (500, etc.)
- [ ] Token expiration (handled automatically)
```

### Error Display

```typescript
- [ ] Use Alert.alert for critical errors
- [ ] Show inline errors under form fields
- [ ] Use toast/snackbar for minor errors
- [ ] Display validation errors from API
```

---

## ✅ Loading States

### UI Feedback

```typescript
- [ ] Disable buttons while loading
- [ ] Show spinner/ActivityIndicator
- [ ] Prevent multiple submissions
- [ ] Show loading overlay if needed
```

---

## ✅ Validation

### Client-Side Validation

```typescript
- [ ] Email format validation
- [ ] Password strength validation (min 8 chars, etc.)
- [ ] Required fields check
- [ ] Phone number format (if provided)
```

---

## ✅ Navigation Flow

### Routes to Implement

```typescript
- [ ] /welcome - Initial screen
- [ ] /login - Login screen
- [ ] /signup - Signup screen
- [ ] / or /(tabs) - Main app (protected)
- [ ] /forgot-password - Password reset request
- [ ] /reset-password - Password reset with token
```

### Navigation Guards

```typescript
- [ ] Check authentication before showing protected routes
- [ ] Redirect to login if not authenticated
- [ ] Redirect to home if already authenticated
```

---

## ✅ Testing

### Test Cases

```typescript
- [ ] Test successful login
- [ ] Test failed login (wrong password)
- [ ] Test successful signup
- [ ] Test signup with existing email
- [ ] Test logout
- [ ] Test token refresh (simulate expired token)
- [ ] Test forgot password flow
- [ ] Test reset password flow
- [ ] Test navigation after login/signup
- [ ] Test app startup with stored tokens
```

---

## 📚 Reference Files

- **API Service:** `src/api/services/auth.service.ts`
- **Types:** `src/types/auth.types.ts`
- **Usage Examples:** `src/api/USAGE_EXAMPLES.ts`
- **Documentation:** `src/api/README.md`

---

## 🎯 Priority Order

1. **High Priority** (Core functionality)

   - [x] Login screen with API integration
   - [x] Signup screen with API integration
   - [x] Token storage
   - [x] Navigation after auth

2. **Medium Priority** (Enhanced UX)

   - [ ] Logout functionality
   - [ ] Auth check on startup
   - [ ] Loading states
   - [ ] Error handling

3. **Low Priority** (Nice to have)
   - [ ] Forgot password flow
   - [ ] Reset password flow
   - [ ] Remember me option
   - [ ] Biometric authentication

---

## ✨ Tips

1. **Use the provided hooks** in `USAGE_EXAMPLES.ts` - they handle most of the logic
2. **Always use SecureStore** for tokens, never AsyncStorage or local state
3. **Test with real API** to ensure everything works
4. **Handle offline scenarios** gracefully
5. **Show user-friendly error messages** instead of technical errors

---

**Good luck with the implementation! 🚀**
