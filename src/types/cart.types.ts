/**
 * Cart Type Definitions
 * Types for shopping cart functionality
 */

import type { Room } from "./room.types";

/**
 * Cart Item - Room with booking details
 */
export interface CartItem {
  id: string; // Unique ID for cart item
  room: Room;
  checkInDate: Date | null;
  checkOutDate: Date | null;
  numberOfNights: number;
  numberOfGuests: number;
  totalPrice: number;
  addedAt: Date;
}

/**
 * Cart Summary
 */
export interface CartSummary {
  totalItems: number;
  subtotal: number;
  taxes: number;
  serviceFee: number;
  total: number;
}
