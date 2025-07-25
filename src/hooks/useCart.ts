"use client";

import { useState, useCallback, useEffect } from "react";
import { useApi, getAuthHeaders } from "./useApi";
import type { CartApiResponse, CartItem, SuccessResponse } from "./types";

interface AddToCartRequest {
  productID: number;
  quantity: number;
}
interface UpdateCartRequest {
  cartItemID: number;
  quantity: number;
}
interface Cart {
  cartID: number;
  userID?: number;
  totalPrice: number;
  status: string;
  cartItems: CartItem[];
  totalItems: number;
}

export const useCart = () => {
  const [cart, setCart] = useState<Cart | null>(null);

  const cartApi = useApi<CartApiResponse>();
  const cartActionApi = useApi<SuccessResponse>();

  const fetchCart = useCallback(async (): Promise<Cart | null> => {
    try {
      const response = await cartApi.request("/api/cart", {
        headers: getAuthHeaders(),
      });

      if (response) {
        const cartData: Cart = {
          cartID: response.cartID,
          userID: response.userID,
          totalPrice: response.totalPrice,
          status: response.status || "active",
          cartItems: response.cartItems || [],
          totalItems: response.totalItems || 0,
        };
        setCart(cartData);
        return cartData;
      }
      return null;
    } catch (error) {
      console.error("Error fetching cart:", error);
      return null;
    }
  }, [cartApi]); // <-- useApi is stable, so this won't recreate each render

  useEffect(() => {
    fetchCart();
  }, [fetchCart]); // Will only run once (no loop)

  const addToCart = useCallback(
    async (data: AddToCartRequest): Promise<boolean> => {
      try {
        const res = await cartActionApi.request("/api/cart/add", {
          method: "POST",
          body: data,
          headers: getAuthHeaders(),
        });
        if (res?.success) {
          await fetchCart();
          return true;
        }
        return false;
      } catch (e) {
        console.error("Error adding to cart:", e);
        return false;
      }
    },
    [cartActionApi, fetchCart]
  );

  const updateCartItem = useCallback(
    async (data: UpdateCartRequest): Promise<boolean> => {
      try {
        const res = await cartActionApi.request("/api/cart/update", {
          method: "PUT",
          body: data,
          headers: getAuthHeaders(),
        });
        if (res?.success) {
          setCart((prev) =>
            prev
              ? {
                  ...prev,
                  cartItems: prev.cartItems.map((item) =>
                    item.cartItemID === data.cartItemID
                      ? { ...item, quantity: data.quantity }
                      : item
                  ),
                }
              : prev
          );
          return true;
        }
        return false;
      } catch (e) {
        console.error("Error updating cart item:", e);
        return false;
      }
    },
    [cartActionApi]
  );

  const removeFromCart = useCallback(
    async (itemId: number): Promise<boolean> => {
      try {
        const res = await cartActionApi.request(`/api/cart/remove/${itemId}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
        });
        if (res?.success) {
          setCart((prev) =>
            prev
              ? {
                  ...prev,
                  cartItems: prev.cartItems.filter((i) => i.cartItemID !== itemId),
                  totalItems: prev.totalItems - 1,
                }
              : prev
          );
          return true;
        }
        return false;
      } catch (e) {
        console.error("Error removing from cart:", e);
        return false;
      }
    },
    [cartActionApi]
  );

  const clearCart = useCallback(async (): Promise<boolean> => {
    try {
      const res = await cartActionApi.request("/api/cart/clear", {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (res?.success) {
        setCart(null);
        return true;
      }
      return false;
    } catch (e) {
      console.error("Error clearing cart:", e);
      return false;
    }
  }, [cartActionApi]);

  return {
    cart,
    loading: cartApi.loading || cartActionApi.loading,
    error: cartApi.error || cartActionApi.error,
    fetchCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
  };
};
