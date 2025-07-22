"use client"

import { useState, useCallback, useMemo } from "react"
import { useApi } from "./useApi"
import type { OrdersApiResponse, OrderApiResponse, SuccessResponse } from "./types"
import type { OrderResponseDTO, OrderCreateDTO, OrderUpdateDTO } from "../types/dto"

interface OrderFilters {
  status?: string
  page?: number
  limit?: number
}

export const useOrders = () => {
  const [orders, setOrders] = useState<OrderResponseDTO[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const ordersApi = useApi<OrdersApiResponse>()
  const orderApi = useApi<OrderApiResponse>()
  const actionApi = useApi<SuccessResponse>()

  // Mock orders data for development
const mockOrders: OrderResponseDTO[] = useMemo(() => [
    {
      orderId: 12345,
      userId: 1,
      customerName: "Nguyễn Văn A",
      orderDate: new Date("2024-01-15"),
      totalAmount: 3200000,
      status: "pending",
      orderDetails: [
        {
          orderDetailId: 1,
          orderId: 12345,
          productId: 1,
          productName: "Guitar Acoustic Yamaha",
          quantity: 1,
          unitPrice: 2500000,
        },
        {
          orderDetailId: 2,
          orderId: 12345,
          productId: 4,
          productName: "Dây đàn guitar",
          quantity: 2,
          unitPrice: 350000,
        },
      ],
    },
    {
      orderId: 12346,
      userId: 2,
      customerName: "Trần Thị B",
      orderDate: new Date("2024-01-14"),
      totalAmount: 8900000,
      status: "confirmed",
      orderDetails: [
        {
          orderDetailId: 3,
          orderId: 12346,
          productId: 2,
          productName: "Piano Điện Casio",
          quantity: 1,
          unitPrice: 8900000,
        },
      ],
    },
    {
      orderId: 12347,
      userId: 3,
      customerName: "Lê Văn C",
      orderDate: new Date("2024-01-13"),
      totalAmount: 1800000,
      status: "shipped",
      orderDetails: [
        {
          orderDetailId: 4,
          orderId: 12347,
          productId: 4,
          productName: "Violin 4/4",
          quantity: 1,
          unitPrice: 1800000,
        },
      ],
    },
    {
      orderId: 12348,
      userId: 4,
      customerName: "Phạm Thị D",
      orderDate: new Date("2024-01-12"),
      totalAmount: 12000000,
      status: "delivered",
      orderDetails: [
        {
          orderDetailId: 5,
          orderId: 12348,
          productId: 3,
          productName: "Trống Jazz Pearl",
          quantity: 1,
          unitPrice: 12000000,
        },
      ],
    },
  ], [])

  const fetchOrders = useCallback(async (filters?: OrderFilters): Promise<OrderResponseDTO[]> => {
    try {
      // For now, use mock data - replace with real API call
      let filteredOrders = [...mockOrders]

      if (filters?.status && filters.status !== "all") {
        filteredOrders = filteredOrders.filter((order) => order.status === filters.status)
      }

      setOrders(filteredOrders)
      setTotalCount(filteredOrders.length)
      return filteredOrders

      // Real API call:
      // const queryParams = new URLSearchParams()
      // if (filters?.status) queryParams.append('status', filters.status)
      // if (filters?.page) queryParams.append('page', filters.page.toString())
      // if (filters?.limit) queryParams.append('limit', filters.limit.toString())
      //
      // const endpoint = `/api/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      // const response = await ordersApi.request(endpoint, {
      //   headers: getAuthHeaders(),
      // })
      //
      // if (response) {
      //   const orderList = response.orders || response.data || response
      //   setOrders(orderList)
      //   setTotalCount(response.totalCount || response.total || 0)
      //   return orderList
      // }
      //
      // return []
    } catch (error) {
      console.error("Error fetching orders:", error)
      throw error
    }
  }, [mockOrders])

  const getOrder = useCallback(async (id: number): Promise<OrderResponseDTO> => {
    try {
      // Mock response
      const order = mockOrders.find((o) => o.orderId === id)
      if (!order) throw new Error("Order not found")
      return order

      // Real API call:
      // const response = await orderApi.request(`/api/orders/${id}`, {
      //   headers: getAuthHeaders(),
      // })
      // return response.order || response
    } catch (error) {
      console.error("Error fetching order:", error)
      throw error
    }
  }, [mockOrders])

  const createOrder = useCallback(async (orderData: OrderCreateDTO): Promise<OrderResponseDTO> => {
    try {
      // Mock response
      const newOrder: OrderResponseDTO = {
        orderId: Date.now(),
        userId: orderData.userId,
        customerName: "New Customer",
        orderDate: orderData.orderDate,
        totalAmount: orderData.totalAmount,
        status: orderData.status,
        orderDetails: [],
      }

      setOrders((prev) => [newOrder, ...prev])
      setTotalCount((prev) => prev + 1)
      return newOrder

      // Real API call:
      // const response = await orderApi.request('/api/orders', {
      //   method: 'POST',
      //   body: orderData,
      //   headers: getAuthHeaders(),
      // })
      //
      // const createdOrder = response.order || response
      // if (createdOrder) {
      //   setOrders(prev => [createdOrder, ...prev])
      //   setTotalCount(prev => prev + 1)
      // }
      //
      // return createdOrder
    } catch (error) {
      console.error("Error creating order:", error)
      throw error
    }
  }, [])

  const updateOrder = useCallback(
    async (id: number, orderData: OrderUpdateDTO): Promise<OrderResponseDTO> => {
      try {
        // Mock response
        setOrders((prev) =>
          prev.map((order) =>
            order.orderId === id ? { ...order, totalAmount: orderData.totalAmount, status: orderData.status } : order,
          ),
        )

        const updatedOrder = orders.find((o) => o.orderId === id)
        if (!updatedOrder) throw new Error("Order not found")
        return updatedOrder

        // Real API call:
        // const response = await orderApi.request(`/api/orders/${id}`, {
        //   method: 'PUT',
        //   body: orderData,
        //   headers: getAuthHeaders(),
        // })
        //
        // const updated = response.order || response
        // if (updated) {
        //   setOrders(prev => prev.map(o => o.orderId === id ? updated : o))
        // }
        //
        // return updated
      } catch (error) {
        console.error("Error updating order:", error)
        throw error
      }
    },
    [orders],
  )

  const updateOrderStatus = useCallback(async (id: number, status: string): Promise<boolean> => {
    try {
      // Mock response
      setOrders((prev) => prev.map((order) => (order.orderId === id ? { ...order, status } : order)))

      return true

      // Real API call:
      // const response = await actionApi.request(`/api/orders/${id}/status`, {
      //   method: 'PUT',
      //   body: { status },
      //   headers: getAuthHeaders(),
      // })
      //
      // if (response.success) {
      //   setOrders(prev => prev.map(o => o.orderId === id ? { ...o, status } : o))
      // }
      //
      // return response.success
    } catch (error) {
      console.error("Error updating order status:", error)
      throw error
    }
  }, [])

  const deleteOrder = useCallback(async (id: number): Promise<boolean> => {
    try {
      // Mock response
      setOrders((prev) => prev.filter((order) => order.orderId !== id))
      setTotalCount((prev) => prev - 1)
      return true

      // Real API call:
      // await actionApi.request(`/api/orders/${id}`, {
      //   method: 'DELETE',
      //   headers: getAuthHeaders(),
      // })
      //
      // setOrders(prev => prev.filter(o => o.orderId !== id))
      // setTotalCount(prev => prev - 1)
      // return true
    } catch (error) {
      console.error("Error deleting order:", error)
      throw error
    }
  }, [])

  return {
    orders,
    totalCount,
    loading: ordersApi.loading || orderApi.loading || actionApi.loading,
    error: ordersApi.error || orderApi.error || actionApi.error,
    fetchOrders,
    getOrder,
    createOrder,
    updateOrder,
    updateOrderStatus,
    deleteOrder,
  }
}
