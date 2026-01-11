/**
 * Payment Service
 * Handles VNPAY payment API calls
 */

import api from "../api/client";
import type {
  VnpayPaymentRequest,
  VnpayPaymentResponse,
} from "../types/payment.types";

const paymentService = {
  /**
   * Create VNPAY payment URL
   * POST /customer/payments/vnpay/create
   */
  async createVnpayPayment(
    request: VnpayPaymentRequest
  ): Promise<VnpayPaymentResponse> {
    const response = await api.post<VnpayPaymentResponse>(
      "/customer/payments/vnpay/create",
      request
    );
    return response.data;
  },

  /**
   * Verify VNPAY payment callback
   * POST /customer/payments/vnpay/callback
   */
  async verifyVnpayPayment(queryParams: string): Promise<any> {
    const response = await api.post("/customer/payments/vnpay/callback", {
      queryParams,
    });
    return response.data;
  },

  /**
   * Get payment status
   * GET /customer/payments/:transactionId
   */
  async getPaymentStatus(transactionId: string): Promise<any> {
    const response = await api.get(`/customer/payments/${transactionId}`);
    return response.data;
  },
};

export default paymentService;
