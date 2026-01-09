# 🧪 Authentication Testing Guide

## ✅ What's Been Implemented

I've created a complete authentication flow for testing:

### 📱 New Screens:

1. **Home Screen** (`app/home.tsx`) - Post-login dashboard for testing
2. **Updated Login Screen** (`app/login.tsx`) - Now integrated with auth API
3. **Updated Signup Screen** (`app/signup.tsx`) - Now integrated with auth API

## 🚀 How to Test

### 1. Start the App

```bash
pnpm start
```

Then press:

- `i` for iOS
- `a` for Android
- `w` for Web

### 2. Test Signup Flow

1. Navigate to the **Signup** screen
2. Fill in the form:

   - **Username**: Your name (e.g., "John Doe")
   - **Email**: Valid email (e.g., "john@example.com")
   - **Phone**: Optional (e.g., "+1234567890")
   - **Password**: At least 8 characters

3. Click **Continue**
4. You should see:
   - Loading indicator while creating account
   - Success alert
   - Redirect to **Home Screen** showing your account info

### 3. Test Login Flow

1. After signing up, test **Logout** from the home screen
2. Navigate to **Login** screen
3. Enter your credentials:

   - **Phone/Email**: The email you registered with
   - **Password**: Your password

4. Click **Login**
5. You should see:
   - Loading indicator
   - Success alert
   - Redirect to **Home Screen**

### 4. Test Logout

1. On the **Home Screen**, scroll down
2. Click the red **Logout** button
3. Confirm logout in the alert
4. You should be redirected back to the **Welcome** screen

## 🏠 Home Screen Features

The home screen displays:

✅ **User Information Card**

- Your name
- Email address
- Phone number (if provided)
- Account type (Customer)
- Email verification status

✅ **Authentication Status**

- Shows active tokens
- Confirms secure storage

✅ **Logout Functionality**

- Safe logout with confirmation
- Clears all stored tokens
- Redirects to welcome screen

## 📝 What Happens Behind the Scenes

### On Signup:

1. Validates form fields
2. Calls `authService.register()`
3. Stores `accessToken` in SecureStore
4. Stores `refreshToken` in SecureStore
5. Stores `userData` in SecureStore
6. Navigates to `/home`

### On Login:

1. Validates credentials
2. Calls `authService.login()`
3. Stores tokens securely
4. Stores user data
5. Navigates to `/home`

### On Logout:

1. Gets refresh token from storage
2. Calls `authService.logout()`
3. Deletes all tokens
4. Deletes user data
5. Navigates to `/welcome`

## 🔐 Token Management

- **Access Token**: Automatically added to all API requests
- **Refresh Token**: Used to get new access token when expired
- **Auto-Refresh**: Handled automatically by Axios interceptor
- **Secure Storage**: All tokens stored in `expo-secure-store`

## 🎯 Test Scenarios

### ✅ Happy Path

1. Sign up with valid data → Success
2. Logout → Success
3. Login with same credentials → Success
4. Logout again → Success

### ⚠️ Error Scenarios to Test

**Invalid Signup:**

- Empty fields → Shows validation error
- Invalid email format → Shows error
- Existing email → API returns error

**Invalid Login:**

- Wrong password → Shows login failed
- Non-existent email → Shows login failed
- Empty fields → Shows validation error

## 📱 User Interface

### Home Screen Preview:

```
┌─────────────────────────────┐
│     👤 (Profile Icon)       │
│        Welcome!             │
│       [User Name]           │
├─────────────────────────────┤
│   ✓ Authentication          │
│      Successful             │
├─────────────────────────────┤
│  Your Account Information   │
│  📧 Name: John Doe          │
│  ✉️  Email: john@...        │
│  📞 Phone: +123...          │
│  🛡️  Type: Customer         │
│  ✅ Email: Verified         │
├─────────────────────────────┤
│  Authentication Status      │
│  🔑 Access Token: Active    │
│  🔐 Refresh Token: Active   │
├─────────────────────────────┤
│     [🚪 Logout Button]      │
└─────────────────────────────┘
```

## 🐛 Troubleshooting

### If signup/login fails:

1. **Check API Connection:**

   ```
   API URL: https://room-master-dcdsfng4c7h7hwbg.eastasia-01.azurewebsites.net/v1
   ```

2. **Check Console Logs:**

   - Open Metro bundler terminal
   - Look for "Login error:" or "Signup error:"
   - Check the error message

3. **Verify Email Format:**

   - Must include @ and domain
   - Example: user@example.com

4. **Password Requirements:**
   - Check if backend has specific requirements
   - Try at least 8 characters with mix of letters/numbers

### If redirects don't work:

1. Check that `/home` route exists
2. Verify tokens are being stored (check logs)
3. Make sure `router.replace()` is being called

## 📊 Expected API Responses

### Successful Signup/Login:

```json
{
  "user": {
    "id": "xxx",
    "email": "john@example.com",
    "name": "John Doe",
    "phone": "+1234567890",
    "role": "customer",
    "isEmailVerified": false
  },
  "tokens": {
    "access": {
      "token": "eyJ...",
      "expires": "2026-01-09T..."
    },
    "refresh": {
      "token": "eyJ...",
      "expires": "2026-02-08T..."
    }
  }
}
```

### Error Response:

```json
{
  "code": 400,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Email already exists"
    }
  ]
}
```

## 🎉 Success Indicators

You'll know everything is working when:

1. ✅ You can create a new account
2. ✅ You're automatically redirected to home screen
3. ✅ You see your user information displayed
4. ✅ You can logout successfully
5. ✅ You can login again with same credentials
6. ✅ Tokens persist (close app and reopen - should stay logged in)

## 🔄 Testing Token Refresh

Token refresh happens automatically, but you can test it:

1. Login to the app
2. Wait for access token to expire (check token expiry time)
3. Make an API call (future feature)
4. Token should refresh automatically in background
5. Request should complete successfully

## 📝 Notes

- **Phone field** in login accepts email (backend uses email)
- **Phone field** in signup is optional
- All tokens are stored securely
- User data persists across app restarts
- Logout clears all stored data

## 🚀 Next Steps

Once authentication testing is complete:

1. Add more screens (bookings, rooms, profile)
2. Protect routes (redirect to login if not authenticated)
3. Add profile editing
4. Implement forgot password flow
5. Add social login (Google, Facebook)

---

**Happy Testing! 🎊**
