# VNPAY Integration Corrections

## Summary

After reviewing the official VNPAY Mobile SDK documentation, several important corrections were made to align the implementation with the official specification.

## Key Changes

### 1. ✅ Payment Result Handling - CRITICAL CHANGE

**Original (Incorrect)**:

- Used React Native `Linking` API with deep linking URLs
- Parsed URL parameters to extract payment result
- Expected callback via `roommaster://payment-result?params...`

**Corrected (Per VNPAY Spec)**:

- Use `NativeEventEmitter` with event name `'PaymentBack'`
- SDK returns result code directly in events event object
- No URL parsing needed

**Code Change** in `src/utils/vnpay.ts`:

```typescript
// ❌ OLD (Incorrect):
const handleUrl = ({ url }: { url: string }) => {
  const result = parseVnpayCallback(url);
  resolve(result);
};
Linking.addEventListener("url", handleUrl);

// ✅ NEW (Correct):
const eventEmitter = new NativeEventEmitter(VnpayMerchantModule);
eventEmitter.addListener("PaymentBack", (e) => {
  const result = parseVnpayResult(e.resultCode);
  resolve(result);
});
```

---

### 2. ✅ Result Codes - CRITICAL CHANGE

**Original (Incorrect)**:

- `0` = Success
- `1` = Failed
- `-1` = Cancelled

**Corrected (Per VNPAY Spec)**:

- `97` = Success → map to internal `0`
- `98` = Failed → map to internal `1`
- `99` = Cancelled → map to internal `-1`
- `-1` = User pressed back → map to internal `-1`
- `10` = User selected mobile banking app → map to internal `2` (processing)

**Code Change** in `src/utils/vnpay.ts`:

```typescript
export const parseVnpayResult = (resultCode: number): VnpayPaymentResult => {
  switch (resultCode) {
    case 97:
      return { resultCode: 0, message: "Giao dịch thành công" };
    case 98:
      return { resultCode: 1, message: "Giao dịch không thành công" };
    case 99:
      return { resultCode: -1, message: "Giao dịch đã bị hủy" };
    case -1:
      return { resultCode: -1, message: "Người dùng đã hủy thanh toán" };
    case 10:
      return { resultCode: 2, message: "Đang chờ xác nhận..." };
  }
};
```

---

### 3. ✅ Return URL Format - CRITICAL CHANGE

**Original (Incorrect)**:

```json
{
  "returnUrl": "roommaster://payment-result"
}
```

**Corrected (Per VNPAY Spec)**:
The backend should use special SDK URLs based on payment outcome:

- Success: `http://success.sdk.merchantbackapp`
- Failed: `http://fail.sdk.merchantbackapp`
- Cancelled: `http://cancel.sdk.merchantbackapp`

These URLs are intercepted by the VNPAY SDK and trigger the `PaymentBack` event with corresponding result codes.

**Code Change** in `app/booking-summary.tsx`:

```typescript
const paymentRequest: VnpayPaymentRequest = {
  // ...
  returnUrl: "http://success.sdk.merchantbackapp", // Per VNPAY SDK spec
};
```

---

### 4. ✅ Color Configuration

**Original (Incorrect)**:

```typescript
TITLE_COLOR: '#007ef2',  // With # symbol
BEGIN_COLOR: '#007ef2',
END_COLOR: '#0056b3',
```

**Corrected (Per VNPAY Spec)**:

```typescript
TITLE_COLOR: '007ef2',  // 6 characters, no # symbol
BEGIN_COLOR: '007ef2',
END_COLOR: '0056b3',
```

---

### 5. ✅ New Result State: Processing

Added handling for result code `10` which indicates the user has selected a mobile banking app and payment is in progress.

**New Alert**:

```typescript
if (result.resultCode === 2) {
  Alert.alert(
    "Đang xử lý thanh toán",
    "Đang chờ xác nhận thanh toán từ ngân hàng..."
  );
}
```

---

## What Stayed the Same (Correct from Start)

✅ Deep linking configuration in `app.json`
✅ TMN_CODE configuration
✅ Sandbox vs Production toggle
✅ Backend IPN callback concept
✅ Payment flow architecture
✅ Error message mapping
✅ UI/UX implementation

---

## Impact on Backend

### Backend Changes Required:

1. **Return URL Parameter**:
   Backend should use the SDK special URLs:

   ```javascript
   // In IPN callback handler, based on vnp_ResponseCode:
   if (responseCode === "00") {
     returnUrl = "http://success.sdk.merchantbackapp";
   } else {
     returnUrl = "http://fail.sdk.merchantbackapp";
   }
   ```

2. **No Changes to IPN**:
   The server-to-server IPN callback remains exactly the same

3. **API Response**:
   Still returns payment URL to mobile app (no changes)

---

## Testing Checklist

After these corrections, verify:

- [ ] `PaymentBack` event is received (not URL callback)
- [ ] Result code `97` shows success message
- [ ] Result code `98` shows failure message
- [ ] Result code `99` shows cancelled message
- [ ] Result code `-1` shows back/cancelled message
- [ ] Result code `10` shows processing message
- [ ] Colors appear correctly (without # symbol errors)
- [ ] Success flow navigates to My Bookings
- [ ] Failure flow stays on booking summary with retry option

---

## Migration Notes

If you had tested the previous implementation:

1. **Clear any URL listeners**: The old deep linking listeners are no longer used
2. **Update returnUrl**: Backend should use the new SDK URLs
3. **Re-test payment flow**: Event-based callbacks behave differently than URL callbacks

---

## Files Modified

| File                        | What Changed                              |
| --------------------------- | ----------------------------------------- |
| `src/utils/vnpay.ts`        | Complete rewrite using NativeEventEmitter |
| `app/booking-summary.tsx`   | Updated returnUrl to SDK format           |
| `docs/VNPAY_BACKEND_API.md` | Added SDK URL specification               |

---

## Why These Changes Matter

### Event-Based vs URL-Based:

- **Events** are more reliable and immediate
- **Events** don't require deep linking configuration for callbacks
- **Events** work consistently across iOS and Android
- **URLs** can be intercepted or modified; **Events** are internal

### Correct Result Codes:

- Ensures compatibility with VNPAY's official SDK
- Prevents misinterpretation of payment status
- Handles all edge cases (back button, app selection, etc.)

### SDK URLs:

- Required for SDK to trigger correct events
- Allows VNPAY gateway to communicate result properly
- Works seamlessly with mobile banking app redirects

---

## References

- **Official Doc**: `vnpay-doc.md` (parsed from PDF)
- **Section**: III. CÀI ĐẶT → 3. React Native
- **Key Info**: Lines 375-478 (React Native implementation)
- **Event Listener**: Lines 410-478 (PaymentBack event handling)
- **Result Codes**: Lines 414-469 (result code documentation)

---

**Date**: January 11, 2026  
**Status**: ✅ Corrected and Aligned with Official Specification
**Impact**: HIGH - Changed core callback mechanism from URL-based to event-based
