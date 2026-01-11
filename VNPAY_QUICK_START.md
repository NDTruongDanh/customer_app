# VNPAY Integration Quick Start Guide

## ⚡ Quick Setup (5 Minutes)

### Prerequisites

- ✅ VNPAY Mobile SDK already installed (`react-native-vnpay-merchant`)
- ✅ All integration files created
- ⚠️ Need VNPAY merchant account credentials

### Step 1: Get VNPAY Credentials (From VNPAY)

Contact VNPAY or login to your merchant dashboard to get:

- **TMN Code** (Terminal Merchant Number) - e.g., `"FAHASA02"`
- **Hash Secret** - Used for backend signature generation

**Sandbox for Testing**:

- Dashboard: https://sandbox.vnpayment.vn/
- Use sandbox credentials for development

### Step 2: Configure Mobile App (1 minute)

Open `.env` (create if needed) and add your TMN Code:

```env
EXPO_PUBLIC_TMN_CODE=YOUR_TMN_CODE
```

The code in `src/utils/vnpay.ts` is already set up to read this variable.

### Step 3: Provide Backend API Spec to Backend Team

Send these files to your backend team:

- 📄 `docs/VNPAY_BACKEND_API.md` - Complete API specification
- 📄 `docs/VNPAY_INTEGRATION.md` - Integration guide

Backend needs to implement **3 endpoints**:

1. `POST /customer/payments/vnpay/create` - Create payment URL
2. `POST /api/payments/vnpay/ipn` - Handle VNPAY callback
3. `GET /customer/payments/:transactionId` - Get payment status (optional)

### Step 4: Test the Integration

```bash
# Run the app
npm run android
# or
npm run ios

# Test flow:
# 1. Browse rooms → Add to cart
# 2. Proceed to booking summary
# 3. Click "CONTINUE TO PAYMENT"
# 4. Booking should be created
# 5. VNPAY payment screen opens
# 6. Use test card to pay
# 7. Verify success/error handling
```

**VNPAY Test Card** (Sandbox):

```
Card Number:  9704198526191432198
Card Holder:  NGUYEN VAN A
Issue Date:   07/15
OTP:          123456
```

---

## 📋 What's Included

### Frontend (Mobile App) ✅

| File                              | Status          | Purpose                  |
| --------------------------------- | --------------- | ------------------------ |
| `src/types/payment.types.ts`      | ✅ Created      | Payment type definitions |
| `src/services/payment.service.ts` | ✅ Created      | Payment API calls        |
| `src/utils/vnpay.ts`              | ⚠️ Needs config | VNPAY SDK wrapper        |
| `app/booking-summary.tsx`         | ✅ Modified     | Integrated payment flow  |
| `app.json`                        | ✅ Modified     | Deep linking configured  |

### Backend (API) ⏳ Pending

| Endpoint                                | Status     | Required |
| --------------------------------------- | ---------- | -------- |
| `POST /customer/payments/vnpay/create`  | ❌ Pending | Yes      |
| `POST /api/payments/vnpay/ipn`          | ❌ Pending | Yes      |
| `GET /customer/payments/:transactionId` | ❌ Pending | Optional |

### Documentation 📚

- ✅ `docs/VNPAY_INTEGRATION.md` - Full integration guide
- ✅ `docs/VNPAY_BACKEND_API.md` - Backend API specification
- ✅ `VNPAY_IMPLEMENTATION_SUMMARY.md` - Implementation overview

---

## 🎯 Current Status

### ✅ Ready

- [x] Mobile app code implemented
- [x] Deep linking configured
- [x] VNPAY SDK integrated
- [x] Payment UI/UX completed
- [x] Error handling implemented
- [x] Documentation created

### ⏳ Pending

- [ ] Update TMN_CODE in `src/utils/vnpay.ts`
- [ ] Backend payment endpoints implementation
- [ ] End-to-end testing with backend
- [ ] Production deployment preparation

---

## 🔍 Verification Checklist

Before marking as complete, verify:

### Mobile App

- [ ] TMN_CODE configured in `src/utils/vnpay.ts`
- [ ] App builds without errors
- [ ] Deep linking works (`npx uri-scheme open roommaster://test --ios`)
- [ ] No TypeScript errors

### Backend

- [ ] All 3 endpoints implemented
- [ ] VNPAY credentials configured
- [ ] Secure hash generation working
- [ ] IPN callback handler tested
- [ ] Database schema created

### Integration

- [ ] Create booking → success
- [ ] Payment URL generated → success
- [ ] VNPAY screen opens → success
- [ ] Test payment → success
- [ ] IPN callback received → success
- [ ] Booking status updated → success
- [ ] App receives callback → success
- [ ] Success message shown → success

---

## 🆘 Need Help?

### Documentation

1. **Integration Guide**: `docs/VNPAY_INTEGRATION.md`
2. **Backend API Spec**: `docs/VNPAY_BACKEND_API.md`
3. **Implementation Summary**: `VNPAY_IMPLEMENTATION_SUMMARY.md`

### Common Issues

**Payment screen doesn't open?**
→ Check TMN_CODE is set correctly in `src/utils/vnpay.ts`

**Callback not received?**
→ Verify deep linking: `npx uri-scheme open roommaster://payment-result --ios`

**Backend errors?**
→ Check backend logs and ensure IPN endpoint is accessible

**Still stuck?**
→ See troubleshooting section in `docs/VNPAY_INTEGRATION.md`

---

## 📞 VNPAY Support

- **Documentation**: https://sandbox.vnpayment.vn/apis/docs
- **Sandbox Dashboard**: https://sandbox.vnpayment.vn/
- **Merchant Portal**: https://merchant.vnpay.vn/
- **Support**: Contact your VNPAY account manager

---

## 🚀 Next Steps

1. **Update TMN_CODE** in `src/utils/vnpay.ts`
2. **Share backend spec** with backend team
3. **Wait for backend** to implement endpoints
4. **Test integration** end-to-end
5. **Fix any issues** found during testing
6. **Deploy to production** when ready

---

**Need more details?** See `VNPAY_IMPLEMENTATION_SUMMARY.md` for complete overview.
