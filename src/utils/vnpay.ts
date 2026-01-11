/**
 * VNPAY Utility Functions
 * Helper functions for VNPAY payment integration
 * Based on official VNPAY Mobile SDK specification v1.1
 */

import { Alert, NativeEventEmitter, NativeModules } from "react-native";
import VNPMerchant from "react-native-vnpay-merchant";
import type { VnpayPaymentResult } from "../types/payment.types";

// Get the native module from NativeModules
const { VnpayMerchant: VnpayMerchantModule } = NativeModules;

/**
 * VNPAY Configuration
 * Update these values based on your VNPAY merchant account
 */
const tmnCode = process.env.EXPO_PUBLIC_TMN_CODE;

const VNPAY_CONFIG = {
  TMN_CODE: tmnCode, // Replace with your TMN code from VNPAY
  SCHEME: "roommaster", // URL scheme for deep linking
  IS_SANDBOX: true, // Set to false for production
  TITLE: "Thanh toán đặt phòng",
  TITLE_COLOR: "007ef2", // 6 characters, no #
  BEGIN_COLOR: "007ef2", // 6 characters, no #
  END_COLOR: "0056b3", // 6 characters, no #
  BACK_ALERT: "Bạn có chắc chắn muốn hủy thanh toán?",
  ICON_BACK_NAME: "ic_back", // Icon name in native project
};

/**
 * Open VNPAY payment screen
 * Based on official VNPAY SDK specification
 *
 * @param paymentUrl - Payment URL from backend
 * @returns Promise with payment result
 */
export const openVnpayPayment = async (
  paymentUrl: string
): Promise<VnpayPaymentResult> => {
  return new Promise((resolve, reject) => {
    try {
      // Check if native module is available
      if (!VnpayMerchantModule) {
        const error = new Error(
          "VNPAY native module is not available. Make sure react-native-vnpay-merchant is properly installed and linked."
        );
        console.error(error.message);
        reject(error);
        return;
      }

      // Create event emitter for SDK callbacks
      const eventEmitter = new NativeEventEmitter(VnpayMerchantModule);

      // Setup listener for payment result
      const paymentBackListener = eventEmitter.addListener(
        "PaymentBack",
        (e) => {
          console.log("VNPAY SDK callback received:", e);

          // Remove listener after receiving result
          eventEmitter.removeAllListeners("PaymentBack");

          if (e && e.resultCode !== undefined) {
            const result = parseVnpayResult(e.resultCode);
            resolve(result);
          } else {
            reject(new Error("Invalid payment result"));
          }
        }
      );

      // Show VNPAY payment screen
      VNPMerchant.show({
        scheme: VNPAY_CONFIG.SCHEME,
        isSandbox: VNPAY_CONFIG.IS_SANDBOX,
        paymentUrl: paymentUrl,
        tmn_code: VNPAY_CONFIG.TMN_CODE,
        title: VNPAY_CONFIG.TITLE,
        titleColor: VNPAY_CONFIG.TITLE_COLOR,
        beginColor: VNPAY_CONFIG.BEGIN_COLOR,
        endColor: VNPAY_CONFIG.END_COLOR,
        backAlert: VNPAY_CONFIG.BACK_ALERT,
        iconBackName: VNPAY_CONFIG.ICON_BACK_NAME,
      });
    } catch (error) {
      console.error("Error opening VNPAY:", error);
      reject(error);
    }
  });
};

/**
 * Parse VNPAY result code to payment result
 * According to VNPAY SDK specification:
 * - resultCode == -1: User pressed back
 * - resultCode == 10: User selected mobile banking app
 * - resultCode == 97: Payment success
 * - resultCode == 98: Payment failed
 * - resultCode == 99: Payment cancelled
 *
 * @param resultCode - Result code from VNPAY SDK
 * @returns Parsed payment result
 */
export const parseVnpayResult = (resultCode: number): VnpayPaymentResult => {
  console.log("Parsing VNPAY result code:", resultCode);

  switch (resultCode) {
    case 97:
      // Payment success
      return {
        resultCode: 0, // Map to our standard success code
        message: "Giao dịch thành công",
      };

    case 98:
      // Payment failed
      return {
        resultCode: 1, // Map to our standard failed code
        message: "Giao dịch không thành công",
      };

    case 99:
      // User cancelled from VNPAY QR gateway
      return {
        resultCode: -1, // Map to our standard cancelled code
        message: "Giao dịch đã bị hủy",
      };

    case -1:
      // User pressed back button
      return {
        resultCode: -1, // Map to our standard cancelled code
        message: "Người dùng đã hủy thanh toán",
      };

    case 10:
      // User selected mobile banking app
      // This means payment is in progress
      return {
        resultCode: 2, // Processing state
        message: "Đang chờ xác nhận thanh toán từ ngân hàng",
      };

    default:
      // Unknown result code
      return {
        resultCode: 1,
        message: `Mã lỗi không xác định: ${resultCode}`,
      };
  }
};

/**
 * Get user-friendly message based on VNPAY response code
 * Reference: VNPAY API documentation
 */
export const getPaymentMessage = (responseCode: string): string => {
  const messages: Record<string, string> = {
    "00": "Giao dịch thành công",
    "07": "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).",
    "09": "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.",
    "10": "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần",
    "11": "Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.",
    "12": "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.",
    "13": "Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).",
    "24": "Giao dịch không thành công do: Khách hàng hủy giao dịch",
    "51": "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.",
    "65": "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.",
    "75": "Ngân hàng thanh toán đang bảo trì.",
    "79": "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.",
    "99": "Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)",
  };

  return messages[responseCode] || "Giao dịch không thành công";
};

/**
 * Show payment result alert
 */
export const showPaymentResult = (
  result: VnpayPaymentResult,
  onSuccess?: () => void,
  onFailure?: () => void
) => {
  if (result.resultCode === 0) {
    // Success
    Alert.alert(
      "Thanh toán thành công!",
      "Giao dịch của bạn đã được xử lý thành công.",
      [
        {
          text: "OK",
          onPress: onSuccess,
        },
      ]
    );
  } else if (result.resultCode === -1) {
    // Cancelled
    Alert.alert(
      "Đã hủy thanh toán",
      "Bạn đã hủy thanh toán. Vui lòng thử lại nếu muốn tiếp tục.",
      [
        {
          text: "OK",
          onPress: onFailure,
        },
      ]
    );
  } else if (result.resultCode === 2) {
    // Processing - waiting for confirmation
    Alert.alert(
      "Đang xử lý thanh toán",
      "Đang chờ xác nhận thanh toán từ ngân hàng. Vui lòng kiểm tra lại trạng thái đơn hàng sau ít phút.",
      [
        {
          text: "OK",
          onPress: onFailure,
        },
      ]
    );
  } else {
    // Failed
    Alert.alert(
      "Thanh toán thất bại",
      result.message || "Không thể hoàn tất thanh toán. Vui lòng thử lại.",
      [
        {
          text: "OK",
          onPress: onFailure,
        },
      ]
    );
  }
};
