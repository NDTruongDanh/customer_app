/**
 * Payment Type Definitions
 * Types for VNPAY payment integration
 */

/**
 * VNPAY Payment Request
 */
export interface VnpayPaymentRequest {
  bookingId: string;
  amount: number;
  orderInfo: string;
  returnUrl: string;
  locale?: "vn" | "en";
}

/**
 * VNPAY Payment Response from Backend
 */
export interface VnpayPaymentResponse {
  data: {
    paymentUrl: string;
    transactionId: string;
  };
}

/**
 * VNPAY Payment Result (from app callback)
 */
export interface VnpayPaymentResult {
  resultCode: number; // 0: success, -1: cancelled, 1: failed
  message?: string;
  transactionId?: string;
  amount?: number;
  bankCode?: string;
  cardType?: string;
  orderInfo?: string;
  payDate?: string;
  responseCode?: string;
  vnp_SecureHash?: string;
}

/**
 * Payment Status
 */
export type PaymentStatus =
  | "PENDING"
  | "PROCESSING"
  | "SUCCESS"
  | "FAILED"
  | "CANCELLED";

/**
 * Payment Method
 */
export type PaymentMethod = "VNPAY" | "CASH" | "BANK_TRANSFER";
