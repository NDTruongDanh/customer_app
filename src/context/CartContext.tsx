/**
 * Cart Context
 * Manages shopping cart state for room bookings
 */

import type { CartItem, Room } from "@/src/types";
import React, { createContext, ReactNode, useContext, useState } from "react";

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (
    room: Room,
    checkInDate: Date | null,
    checkOutDate: Date | null,
    numberOfGuests: number
  ) => void;
  removeFromCart: (itemId: string) => void;
  updateCartItem: (
    itemId: string,
    updates: Partial<
      Pick<CartItem, "checkInDate" | "checkOutDate" | "numberOfGuests">
    >
  ) => void;
  clearCart: () => void;
  getCartItemCount: () => number;
  getCartTotal: () => number;
  isInCart: (roomId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Calculate number of nights between dates
  const calculateNights = (
    checkIn: Date | null,
    checkOut: Date | null
  ): number => {
    if (!checkIn || !checkOut) return 0;
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Calculate total price
  const calculateTotalPrice = (
    room: Room,
    checkIn: Date | null,
    checkOut: Date | null
  ): number => {
    const nights = calculateNights(checkIn, checkOut);
    const basePrice = parseFloat(room.roomType.basePrice);
    return nights * basePrice;
  };

  const addToCart = (
    room: Room,
    checkInDate: Date | null,
    checkOutDate: Date | null,
    numberOfGuests: number
  ) => {
    const numberOfNights = calculateNights(checkInDate, checkOutDate);
    const totalPrice = calculateTotalPrice(room, checkInDate, checkOutDate);

    const newItem: CartItem = {
      id: `${room.id}-${Date.now()}`, // Unique ID combining room ID and timestamp
      room,
      checkInDate,
      checkOutDate,
      numberOfNights,
      numberOfGuests,
      totalPrice,
      addedAt: new Date(),
    };

    setCartItems((prev) => [...prev, newItem]);
  };

  const removeFromCart = (itemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateCartItem = (
    itemId: string,
    updates: Partial<
      Pick<CartItem, "checkInDate" | "checkOutDate" | "numberOfGuests">
    >
  ) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const updatedCheckIn = updates.checkInDate ?? item.checkInDate;
          const updatedCheckOut = updates.checkOutDate ?? item.checkOutDate;
          const updatedGuests = updates.numberOfGuests ?? item.numberOfGuests;

          return {
            ...item,
            checkInDate: updatedCheckIn,
            checkOutDate: updatedCheckOut,
            numberOfGuests: updatedGuests,
            numberOfNights: calculateNights(updatedCheckIn, updatedCheckOut),
            totalPrice: calculateTotalPrice(
              item.room,
              updatedCheckIn,
              updatedCheckOut
            ),
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartItemCount = (): number => {
    return cartItems.length;
  };

  const getCartTotal = (): number => {
    return cartItems.reduce((total, item) => total + item.totalPrice, 0);
  };

  const isInCart = (roomId: string): boolean => {
    return cartItems.some((item) => item.room.id === roomId);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateCartItem,
        clearCart,
        getCartItemCount,
        getCartTotal,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
