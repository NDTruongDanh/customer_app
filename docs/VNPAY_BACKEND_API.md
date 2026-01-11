# VNPAY Payment API Endpoints Specification

This document specifies the backend API endpoints required for VNPAY payment integration in the Room Master mobile app.

## Required Endpoints

### 1. Create VNPAY Payment URL

Creates a payment URL for a booking using VNPAY payment gateway.

**Endpoint**: `POST /customer/payments/vnpay/create`

**Authentication**: Required (Bearer token)

**Request Headers**:

```
Content-Type: application/json
Authorization: Bearer <access_token>
```

**Request Body**:

```json
{
  "bookingId": "string",           // Required - Booking ID to pay for
  "amount": number,                 // Required - Amount in VND
  "orderInfo": "string",            // Required - Order description
  "returnUrl": "string",            // Required - Deep link URL for callback
  "locale": "vn" | "en"             // Optional - Language (default: "vn")
}
```

**Example Request**:

```json
{
  "bookingId": "bk_abc123xyz",
  "amount": 1500000,
  "orderInfo": "Thanh toan dat phong BK001",
  "returnUrl": "http://success.sdk.merchantbackapp",
  "locale": "vn"
}
```

**Important Notes on Return URL**:

According to VNPAY Mobile SDK specification, the `vnp_ReturnUrl` parameter in the payment URL should redirect to special SDK URLs based on payment status:

- **Success**: `http://success.sdk.merchantbackapp`
- **Failed**: `http://fail.sdk.merchantbackapp`
- **Cancelled**: `http://cancel.sdk.merchantbackapp`

The mobile SDK will intercept these URLs and trigger the appropriate event (`PaymentBack`) with result codes:

- `97` = Success
- `98` = Failed
- `99` = Cancelled

The backend should configure the return URL based on payment outcome in the IPN callback handling.

**Success Response (200 OK)**:

```json
{
  "data": {
    "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...",
    "transactionId": "txn_xyz789"
  }
}
```

**Error Responses**:

400 Bad Request - Invalid request data

```json
{
  "error": "Invalid booking ID"
}
```

404 Not Found - Booking not found

```json
{
  "error": "Booking not found"
}
```

409 Conflict - Booking already paid

```json
{
  "error": "Booking has already been paid"
}
```

---

### 2. VNPAY IPN (Instant Payment Notification)

Receives payment confirmation from VNPAY server-to-server callback.

**Endpoint**: `POST /api/payments/vnpay/ipn`

**Authentication**: Not required (verified via VNPAY signature)

**Request Headers**:

```
Content-Type: application/x-www-form-urlencoded
```

**Request Parameters** (URL encoded):

- `vnp_TmnCode`: Terminal ID
- `vnp_Amount`: Payment amount (in smallest unit, multiply by 100)
- `vnp_BankCode`: Bank code
- `vnp_BankTranNo`: Bank transaction number
- `vnp_CardType`: Card type (ATM/QRCODE/etc)
- `vnp_OrderInfo`: Order description
- `vnp_PayDate`: Payment date (yyyyMMddHHmmss)
- `vnp_ResponseCode`: Response code (00 = success)
- `vnp_TxnRef`: Transaction reference (your transaction ID)
- `vnp_TransactionNo`: VNPAY transaction number
- `vnp_SecureHash`: Signature for verification
- ... and other VNPAY parameters

**Success Response (200 OK)**:

```json
{
  "RspCode": "00",
  "Message": "Confirm Success"
}
```

**Error Response (200 OK)** - Still return 200 but with error code

```json
{
  "RspCode": "99",
  "Message": "Unknown error"
}
```

---

### 3. Get Payment Status

Retrieves the current status of a payment transaction.

**Endpoint**: `GET /customer/payments/:transactionId`

**Authentication**: Required (Bearer token)

**Request Headers**:

```
Authorization: Bearer <access_token>
```

**Path Parameters**:

- `transactionId` - The transaction ID returned from create payment

**Success Response (200 OK)**:

```json
{
  "data": {
    "transactionId": "txn_xyz789",
    "bookingId": "bk_abc123xyz",
    "amount": 1500000,
    "status": "SUCCESS" | "PENDING" | "FAILED" | "CANCELLED",
    "paymentMethod": "VNPAY",
    "vnpayTransactionNo": "123456789",
    "bankCode": "NCB",
    "cardType": "ATM",
    "paymentDate": "2026-01-11T10:30:00Z",
    "responseCode": "00",
    "createdAt": "2026-01-11T10:25:00Z",
    "updatedAt": "2026-01-11T10:30:00Z"
  }
}
```

**Error Responses**:

404 Not Found - Transaction not found

```json
{
  "error": "Transaction not found"
}
```

---

## Implementation Guide for Backend

### Step 1: Install VNPAY SDK or Implement Manually

You can either:

1. Use VNPAY SDK if available for your backend language
2. Implement manually following VNPAY API specification

### Step 2: Configure VNPAY Credentials

Store these securely in environment variables:

- `VNPAY_TMN_CODE` - Terminal ID from VNPAY
- `VNPAY_HASH_SECRET` - Secret key for signature generation
- `VNPAY_URL` - Payment gateway URL
  - Sandbox: `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html`
  - Production: `https://vnpayment.vn/paymentv2/vpcpay.html`

### Step 3: Create Payment URL Flow

```
1. Receive payment request from mobile app
   ↓
2. Validate booking exists and is unpaid
   ↓
3. Create transaction record in database (status: PENDING)
   ↓
4. Build VNPAY payment parameters:
   - vnp_Version = "2.1.0"
   - vnp_Command = "pay"
   - vnp_TmnCode = <your TMN code>
   - vnp_Amount = <amount * 100> (convert to smallest unit)
   - vnp_CurrCode = "VND"
   - vnp_TxnRef = <unique transaction reference>
   - vnp_OrderInfo = <order description>
   - vnp_OrderType = "billpayment"
   - vnp_Locale = "vn" or "en"
   - vnp_ReturnUrl = "http://success.sdk.merchantbackapp" (or fail/cancel based on logic, see Important Notes above)
   - vnp_IpAddr = <customer IP>
   - vnp_CreateDate = <yyyyMMddHHmmss>
   ↓
5. Generate secure hash (HMAC SHA512):
   - Sort parameters alphabetically
   - Join as: key1=value1&key2=value2&...
   - Hash with VNPAY secret key
   - Add as vnp_SecureHash parameter
   ↓
6. Build payment URL with all parameters
   ↓
7. Return payment URL to mobile app
```

### Step 4: Handle VNPAY IPN Callback

```
1. Receive IPN callback from VNPAY
   ↓
2. Verify secure hash:
   - Extract vnp_SecureHash from params
   - Remove vnp_SecureHash from params
   - Sort remaining params alphabetically
   - Recreate hash and compare
   ↓
3. If hash is invalid:
   - Log security error
   - Return RspCode: "97" (Invalid signature)
   ↓
4. If hash is valid:
   - Check vnp_ResponseCode
   - If "00": Payment success
     → Update booking status to PAID
     → Update transaction status to SUCCESS
     → Send confirmation email/notification
   - If other code: Payment failed
     → Update transaction status to FAILED
     → Log failure reason
   ↓
5. Return confirmation to VNPAY:
   - RspCode: "00" (Success)
   - Message: "Confirm Success"
```

### Step 5: Database Schema

Suggested `payments` table:

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  transaction_id VARCHAR(50) UNIQUE NOT NULL,
  booking_id UUID REFERENCES bookings(id),
  customer_id UUID REFERENCES customers(id),
  amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'VND',
  status VARCHAR(20) NOT NULL, -- PENDING, SUCCESS, FAILED, CANCELLED
  payment_method VARCHAR(20) DEFAULT 'VNPAY',

  -- VNPAY specific fields
  vnpay_transaction_no VARCHAR(50),
  vnpay_bank_code VARCHAR(20),
  vnpay_card_type VARCHAR(20),
  vnpay_order_info TEXT,
  vnpay_pay_date TIMESTAMP,
  vnpay_response_code VARCHAR(10),
  vnpay_secure_hash VARCHAR(256),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## VNPAY Response Codes Reference

| Code | Description                              |
| ---- | ---------------------------------------- |
| 00   | Transaction successful                   |
| 07   | Successful debit, suspected fraud        |
| 09   | Card not registered for internet banking |
| 10   | Incorrect card authentication (>3 times) |
| 11   | Payment session timeout                  |
| 12   | Card/Account locked                      |
| 13   | Incorrect OTP                            |
| 24   | User cancelled transaction               |
| 51   | Insufficient account balance             |
| 65   | Transaction limit exceeded               |
| 75   | Payment bank under maintenance           |
| 79   | Too many incorrect password attempts     |
| 99   | Unknown error                            |

## Testing

### Sandbox Test Cards

VNPAY provides test cards in sandbox mode. Example:

**Card Number**: 9704198526191432198
**Card Holder**: NGUYEN VAN A
**Issue Date**: 07/15
**OTP**: 123456

Refer to VNPAY documentation for complete list of test cards.

### Test Scenarios

1. **Successful Payment**

   - Use valid test card
   - Complete payment flow
   - Verify IPN callback received
   - Verify booking status updated

2. **User Cancellation**

   - Start payment
   - Cancel at payment screen
   - Verify booking remains unpaid

3. **Insufficient Balance**

   - Use test card with insufficient balance
   - Verify error handling

4. **Timeout**
   - Start payment but don't complete
   - Wait for timeout
   - Verify transaction marked as failed

## Security Checklist

- [ ] VNPAY secret key stored securely (environment variables)
- [ ] All IPN callbacks verify secure hash
- [ ] Transaction amounts validated (prevent tampering)
- [ ] Duplicate transaction detection implemented
- [ ] Rate limiting on payment creation endpoint
- [ ] All payment data logged for audit trail
- [ ] HTTPS enforced for all endpoints
- [ ] Customer can only pay for their own bookings
- [ ] Expired bookings cannot be paid

## Monitoring & Alerts

Set up monitoring for:

- Failed payment rate (alert if > 10%)
- IPN callback failures
- Signature verification failures
- Unusual transaction patterns
- Transaction processing time

## Production Deployment

Before going live:

1. Update VNPAY credentials to production
2. Update payment gateway URL to production
3. Configure production IPN callback URL in VNPAY dashboard
4. Test with small real transactions
5. Monitor first few transactions closely
6. Set up automated reconciliation with VNPAY reports

## References

- VNPAY API Documentation v2.1.0
- VNPAY Merchant Portal: https://merchant.vnpay.vn/
- VNPAY Sandbox: https://sandbox.vnpayment.vn/
