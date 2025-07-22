"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { useApi } from "./useApi"
import type { CartApiResponse, CartItem, SuccessResponse } from "./types"

interface AddToCartRequest {
  productId: number
  quantity: number
}

interface UpdateCartRequest {
  quantity: number
}

interface Cart {
  items: CartItem[]
  totalItems: number
  totalAmount: number
}

export const useCart = () => {
  const [cart, setCart] = useState<Cart>({
    items: [],
    totalItems: 0,
    totalAmount: 0,
  })
  const cartApi = useApi<CartApiResponse>()
  const cartActionApi = useApi<SuccessResponse>()

  // Mock cart data for development
  const mockCartItems: CartItem[] = useMemo(() => [
    {
      id: 1,
      productId: 1,
      productName: "Guitar Acoustic Yamaha",
      price: 2500000,
      quantity: 1,
      total: 2500000,
    },
    {
      id: 2,
      productId: 2,
      productName: "Piano Điện Casio",
      price: 8900000,
      quantity: 1,
      total: 8900000,
    },
  ], [])

  const mockCart = useMemo<Cart>(() => ({
    items: mockCartItems,
    totalItems: 2,
    totalAmount: 11400000,
  }), [mockCartItems])

  const fetchCart = useCallback(async (): Promise<Cart | undefined> => {
    try {
      setCart(mockCart)
      return mockCart 
    } catch {
      // Handle error and return undefined
      return undefined
    }
  }, [mockCart])

  useEffect(() => {
    // Load cart on component mount
    fetchCart()
  }, [fetchCart])

  const addToCart = useCallback(async (data: AddToCartRequest): Promise<CartItem> => {
    try {
      // Mock response
      const newItem: CartItem = {
        id: Date.now(),
        productId: data.productId,
        productName: `Product ${data.productId}`,
        price: 1000000,
        quantity: data.quantity,
        total: 1000000 * data.quantity,
      }

      setCart((prev) => ({
        items: [...prev.items, newItem],
        totalItems: prev.totalItems + data.quantity,
        totalAmount: prev.totalAmount + newItem.total,
      }))

      return newItem

      // Real API call:
      // const response = await cartActionApi.request('/api/cart/add', {
      //   method: 'POST',
      //   body: data,
      //   headers: getAuthHeaders(),
      // })
      //
      // if (response) {
      //   await fetchCart() // Refresh cart
      // }
      //
      // return response
    } catch (error) {
      console.error("Error adding to cart:", error)
      throw error
    }
  }, [])

  const updateCartItem = useCallback(async (itemId: number, data: UpdateCartRequest): Promise<boolean> => {
    try {
      // Mock response
      setCart((prev) => {
        const updatedItems = prev.items.map((item) => {
          if (item.id === itemId) {
            const updatedItem = { ...item, quantity: data.quantity, total: item.price * data.quantity }
            return updatedItem
          }
          return item
        })

        const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0)
        const totalAmount = updatedItems.reduce((sum, item) => sum + item.total, 0)

        return {
          items: updatedItems,
          totalItems,
          totalAmount,
        }
      })

      return true

      // Real API call:
      // const response = await cartActionApi.request('/api/cart/update', {
      //   method: 'PUT',
      //   body: { itemId, ...data },
      //   headers: getAuthHeaders(),
      // })
      //
      // if (response) {
      //   await fetchCart() // Refresh cart
      // }
      //
      // return response.success
    } catch (error) {
      console.error("Error updating cart item:", error)
      throw error
    }
  }, [])

  const removeFromCart = useCallback(async (itemId: number): Promise<boolean> => {
    try {
      // Mock response
      setCart((prev) => {
        const updatedItems = prev.items.filter((item) => item.id !== itemId)
        const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0)
        const totalAmount = updatedItems.reduce((sum, item) => sum + item.total, 0)

        return {
          items: updatedItems,
          totalItems,
          totalAmount,
        }
      })

      return true

      // Real API call:
      // await cartActionApi.request(`/api/cart/remove/${itemId}`, {
      //   method: 'DELETE',
      //   headers: getAuthHeaders(),
      // })
      //
      // await fetchCart() // Refresh cart
      // return true
    } catch (error) {
      console.error("Error removing from cart:", error)
      throw error
    }
  }, [])

  const clearCart = useCallback(async (): Promise<boolean> => {
    try {
      // Mock response
      setCart({
        items: [],
        totalItems: 0,
        totalAmount: 0,
      })

      return true

      // Real API call:
      // await cartActionApi.request('/api/cart/clear', {
      //   method: 'DELETE',
      //   headers: getAuthHeaders(),
      // })
      //
      // setCart({
      //   items: [],
      //   totalItems: 0,
      //   totalAmount: 0
      // })
      //
      // return true
    } catch (error) {
      console.error("Error clearing cart:", error)
      throw error
    }
  }, [])

  return {
    cart,
    loading: cartApi.loading || cartActionApi.loading,
    error: cartApi.error || cartActionApi.error,
    fetchCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
  }
}
