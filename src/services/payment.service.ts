/**
 * Payment Service
 * API calls for payment-related operations
 */

import api from "../api/client";

/**
 * Payment QR Code Response
 */
export interface PaymentQRCodeResponse {
  data: {
    base64: string; // Base64 encoded image data (e.g., "data:image/png;base64,...")
  };
}

/**
 * Payment Image Upload Response
 */
export interface PaymentImageUploadResponse {
  message: string;
  uploadedCount?: number;
  images?: Array<{
    id: string;
    publicId: string;
    url: string;
    secureUrl: string;
    format: string;
    width: number;
    height: number;
  }>;
}

/**
 * Get payment QR code for customer app
 */
export const getPaymentQRCode = async (): Promise<PaymentQRCodeResponse> => {
  const response = await api.get<PaymentQRCodeResponse>(
    "/customer/app-settings/payment-qr-code"
  );
  return response.data;
};

/**
 * Upload payment proof images for a booking (batch upload)
 * @param bookingId - The booking ID
 * @param images - Array of image files to upload
 * @param paymentMethod - Optional payment method description
 * @param description - Optional notes about the payment
 */
export const uploadPaymentImages = async (
  bookingId: string,
  images: Array<{ uri: string; type: string; name: string }>,
  paymentMethod?: string,
  description?: string
): Promise<PaymentImageUploadResponse> => {
  const formData = new FormData();

  // Add each image to the form data
  images.forEach((image, index) => {
    formData.append("images", {
      uri: image.uri,
      type: image.type || "image/jpeg",
      name: image.name || `payment_proof_${index}.jpg`,
    } as unknown as Blob);
  });

  // Add optional fields
  if (paymentMethod) {
    formData.append("paymentMethod", paymentMethod);
  }
  if (description) {
    formData.append("description", description);
  }

  const response = await api.post<PaymentImageUploadResponse>(
    `/customer/bookings/${bookingId}/payment-images/batch`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

const paymentService = {
  getPaymentQRCode,
  uploadPaymentImages,
};

export default paymentService;
