# VNPAY Payment Integration Guide

This document provides instructions for implementing and configuring VNPAY payment in the Room Master mobile app.

## Overview

The app integrates VNPAY Mobile SDK to process payments for hotel bookings. The flow is:

1. User creates a booking
2. Backend creates VNPAY payment URL
3. App opens VNPAY payment screen
4. User completes payment in VNPAY app/web
5. VNPAY redirects back to app with result
6. App verifies and processes payment result

## Architecture

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Mobile    │─────▶│   Backend   │─────▶│   VNPAY     │
│     App     │      │     API     │      │   Gateway   │
└─────────────┘      └─────────────┘      └─────────────┘
       │                                          │
       └──────────────────────────────────────────┘
              Deep Link Callback
```

## Files Created

### 1. Type Definitions

- **File**: `src/types/payment.types.ts`
- **Purpose**: TypeScript interfaces for payment requests, responses, and results

### 2. Payment Service

- **File**: `src/services/payment.service.ts`
- **Purpose**: API calls to backend for VNPAY payment operations
- **Endpoints**:
  - `POST /customer/payments/vnpay/create` - Create payment URL
  - `POST /customer/payments/vnpay/callback` - Verify payment callback
  - `GET /customer/payments/:transactionId` - Get payment status

### 3. VNPAY Utilities

- **File**: `src/utils/vnpay.ts`
- **Purpose**: Helper functions for VNPAY SDK integration
- **Functions**:
  - `openVnpayPayment()` - Open VNPAY payment screen
  - `parseVnpayCallback()` - Parse callback URL
  - `getPaymentMessage()` - Get user-friendly messages
  - `showPaymentResult()` - Display result alerts

### 4. Updated Booking Flow

- **File**: `app/booking-summary.tsx`
- **Changes**: Integrated VNPAY payment after booking creation

## Configuration

### Step 1: Update VNPAY Configuration

Edit `src/utils/vnpay.ts` and update the `VNPAY_CONFIG` object:

```typescript
const VNPAY_CONFIG = {
  TMN_CODE: "YOUR_TMN_CODE", // Get from VNPAY merchant account
  SCHEME: "roommaster", // URL scheme for deep linking
  IS_SANDBOX: true, // Set false in production
  TITLE: "Thanh toán đặt phòng", // Payment screen title
  TITLE_COLOR: "#007ef2", // Title color
  BEGIN_COLOR: "#007ef2", // Gradient start color
  END_COLOR: "#0056b3", // Gradient end color
  BACK_ALERT: "Bạn có chắc chắn muốn hủy thanh toán?",
  ICON_BACK_NAME: "ic_back", // Back icon asset name
};
```

**Important**: Replace `YOUR_TMN_CODE` with your actual VNPAY Terminal ID (TMN Code).

### Step 2: Configure Deep Linking

Add the following to `app.json`:

```json
{
  "expo": {
    "scheme": "roommaster",
    "ios": {
      "bundleIdentifier": "com.yourcompany.roommaster"
    },
    "android": {
      "package": "com.yourcompany.roommaster",
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [
            {
              "scheme": "roommaster"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

### Step 3: Backend API Implementation

Your backend must implement the following endpoints:

#### Create VNPAY Payment URL

```
POST /customer/payments/vnpay/create
Content-Type: application/json
Authorization: Bearer <token>

Request Body:
{
  "bookingId": "string",
  "amount": number,
  "orderInfo": "string",
  "returnUrl": "roommaster://payment-result",
  "locale": "vn" | "en"
}

Response:
{
  "data": {
    "paymentUrl": "https://sandbox.vnpayment.vn/...",
    "transactionId": "string"
  }
}
```

#### Backend Integration Steps:

1. Receive payment request from mobile app
2. Create VNPAY payment parameters according to VNPAY spec
3. Generate secure hash using your VNPAY Secret Key
4. Build payment URL with parameters
5. Return payment URL to mobile app

#### VNPAY Callback Handler (Server-to-Server)

VNPAY will also send a server-to-server callback to verify the transaction. Configure this in your VNPAY merchant dashboard:

```
POST /api/payments/vnpay/ipn
```

## Testing

### Sandbox Mode

VNPAY provides sandbox credentials for testing:

- **URL**: https://sandbox.vnpayment.vn/
- **Test Cards**: Provided by VNPAY documentation
- **TMN Code**: Get from VNPAY sandbox account

### Test Flow

1. Create a booking in the app
2. Click "CONTINUE TO PAYMENT"
3. App should create booking and open VNPAY payment screen
4. Use VNPAY sandbox test cards to complete payment
5. Verify app receives callback and shows success message

### Debug Logging

Check console logs for:

- Booking request payload
- Booking response
- Payment URL creation
- VNPAY callback URL
- Payment result

## Payment Flow States

### Success Flow

```
1. Create Booking → 2. Get Payment URL → 3. Open VNPAY
                                              ↓
6. Navigate to My Bookings ← 5. Show Success ← 4. Payment Success
```

### Failure/Cancel Flow

```
1. Create Booking → 2. Get Payment URL → 3. Open VNPAY
                                              ↓
                                         4. Payment Failed/Cancelled
                                              ↓
                                         5. Show Alert
                                              ↓
                                    6. Option to Retry or View Booking
```

## Payment Result Codes

| Result Code | Meaning        | Action                           |
| ----------- | -------------- | -------------------------------- |
| 0           | Success        | Clear cart, navigate to bookings |
| -1          | User cancelled | Show retry option                |
| 1           | Failed         | Show error message, allow retry  |

## VNPAY Response Codes

| Code | Description                              |
| ---- | ---------------------------------------- |
| 00   | Success                                  |
| 07   | Successful debit, suspected fraud        |
| 09   | Card not registered for internet banking |
| 10   | Incorrect authentication (>3 times)      |
| 11   | Payment timeout                          |
| 12   | Card/Account locked                      |
| 13   | Incorrect OTP                            |
| 24   | User cancelled                           |
| 51   | Insufficient balance                     |
| 65   | Daily transaction limit exceeded         |
| 75   | Bank under maintenance                   |
| 79   | Too many incorrect password attempts     |
| 99   | Other errors                             |

## Security Considerations

1. **Never expose VNPAY Secret Key in mobile app**

   - All secure hash generation MUST happen on backend

2. **Validate payment callbacks**

   - Backend must verify VNPAY signature
   - Check transaction amount matches booking amount
   - Verify transaction hasn't been processed before

3. **Use HTTPS for all API calls**

4. **Implement payment timeout**
   - Bookings should have expiration time
   - Unpaid bookings should be automatically cancelled

## Production Checklist

- [ ] Update `TMN_CODE` with production credentials
- [ ] Set `IS_SANDBOX: false` in VNPAY_CONFIG
- [ ] Update payment URLs to production VNPAY endpoints
- [ ] Configure production deep linking scheme
- [ ] Test end-to-end flow with real cards (small amounts)
- [ ] Set up VNPAY IPN (Instant Payment Notification) endpoint
- [ ] Implement payment reconciliation process
- [ ] Add transaction logging for audit trail
- [ ] Set up monitoring and alerts for failed payments

## Troubleshooting

### Payment screen doesn't open

- Check VNPAY SDK is properly installed
- Verify TMN_CODE is correct
- Check payment URL format
- Enable debug logging

### Callback not received

- Verify deep linking is configured in app.json
- Check URL scheme matches everywhere
- Test deep linking: `npx uri-scheme open roommaster://payment-result --ios`

### Payment shows success but backend fails

- Check backend is verifying VNPAY signature
- Ensure IPN endpoint is configured
- Verify network connectivity
- Check backend logs for errors

## Support

- **VNPAY Documentation**: https://sandbox.vnpayment.vn/apis/docs
- **VNPAY Support**: Contact your VNPAY account manager
- **Mobile SDK**: Check `react-native-vnpay-merchant` documentation

## References

- VNPAY Technical Documentation (PDF provided)
- VNPAY API Documentation
- React Native Deep Linking Guide
- Expo Linking API Documentation
