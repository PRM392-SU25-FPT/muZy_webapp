"use client"

import { useState, useCallback, useRef } from "react"
import { useApi, getAuthHeaders } from "./useApi"
import type {
  OrderResponseDTO,
  OrderListResponse,
  OrderCreateDTO,
  OrderUpdateDTO,
  OrderStatusResponseDto,
  OrderStatusEnum,
} from "../types/dto"

export const useOrders = () => {
  const [orders, setOrders] = useState<OrderResponseDTO[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [statusFilter, setStatusFilter] = useState<OrderStatusEnum | "">("")

  const ordersApi = useApi<OrderListResponse>()
  const orderApi = useApi<OrderResponseDTO>()
  const statusApi = useApi<OrderStatusResponseDto[]>()
  const statusActionApi = useApi<OrderStatusResponseDto>()

  const fetchingRef = useRef(false)

  const fetchOrders = useCallback(
    async (page = 1, status: OrderStatusEnum | "" = "") => {
      if (fetchingRef.current) return

      try {
        fetchingRef.current = true

        let url = `/api/orders?pageNumber=${page}&pageSize=${pageSize}`
        if (status) {
          url += `&status=${status}`
        }

        console.log("Fetching orders from URL:", url) // Debug log

        const response = await ordersApi.request(url, {
          headers: getAuthHeaders(),
        })

        console.log("Orders API response:", response) // Debug log

        if (response) {
          // Handle the OrderListResponse structure - try multiple possible response formats
          const orderList = response.items || response.orders || response.data || []
          console.log("Parsed order list:", orderList) // Debug log
          console.log("Total count from API:", response.totalCount) // Debug log

          setOrders(orderList)
          setTotalCount(response.totalCount || 0)
          setCurrentPage(response.pageNumber || page)
        }
      } catch (error) {
        console.error("Error fetching orders:", error)
        throw error
      } finally {
        fetchingRef.current = false
      }
    },
    [ordersApi, pageSize],
  )

  // Fixed fetchOrdersWithParams to properly wait for API response
  const fetchOrdersWithParams = useCallback(
    async (params: { pageNumber: number; pageSize: number }) => {
      if (fetchingRef.current) return { totalCount: 0 }

      try {
        fetchingRef.current = true

        const url = `/api/orders?pageNumber=${params.pageNumber}&pageSize=${params.pageSize}`
        console.log("Dashboard fetching orders from URL:", url) // Debug log

        const response = await ordersApi.request(url, {
          headers: getAuthHeaders(),
        })

        console.log("Dashboard orders API response:", response) // Debug log

        if (response) {
          // Handle the OrderListResponse structure - try multiple possible response formats
          const orderList = response.items || response.orders || response.data || []
          const count = response.totalCount || 0

          console.log("Dashboard parsed order list:", orderList) // Debug log
          console.log("Dashboard total count from API:", count) // Debug log

          // Update state
          setOrders(orderList)
          setTotalCount(count)
          setCurrentPage(response.pageNumber || params.pageNumber)

          // Return the actual count from API response
          return { totalCount: count }
        }

        return { totalCount: 0 }
      } catch (error) {
        console.error("Error fetching orders for dashboard:", error)
        return { totalCount: 0 }
      } finally {
        fetchingRef.current = false
      }
    },
    [ordersApi],
  )

  const getOrder = useCallback(
    async (id: number): Promise<OrderResponseDTO> => {
      try {
        const response = await orderApi.request(`/api/orders/${id}`, {
          headers: getAuthHeaders(),
        })
        return response
      } catch (error) {
        console.error("Error fetching order:", error)
        throw error
      }
    },
    [orderApi],
  )

  const createOrder = useCallback(
    async (orderData: OrderCreateDTO): Promise<OrderResponseDTO> => {
      try {
        const response = await orderApi.request("/api/orders", {
          method: "POST",
          body: orderData,
          headers: getAuthHeaders(),
        })
        return response
      } catch (error) {
        console.error("Error creating order:", error)
        throw error
      }
    },
    [orderApi],
  )

  const updateOrder = useCallback(
    async (id: number, orderData: OrderUpdateDTO): Promise<OrderResponseDTO> => {
      try {
        const response = await orderApi.request(`/api/orders/${id}/status`, {
          method: "PUT",
          body: orderData,
          headers: getAuthHeaders(),
        })
        return response
      } catch (error) {
        console.error("Error updating order:", error)
        throw error
      }
    },
    [orderApi],
  )

  const deleteOrder = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        await orderApi.request(`/api/orders/${id}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
        })
        return true
      } catch (error) {
        console.error("Error deleting order:", error)
        throw error
      }
    },
    [orderApi],
  )

  // Order Status Management
  const getOrderStatuses = useCallback(
    async (orderId: number, sort = "desc"): Promise<OrderStatusResponseDto[]> => {
      try {
        const response = await statusApi.request(`/api/orders/${orderId}/status/all?sort=${sort}`, {
          headers: getAuthHeaders(),
        })
        return response || []
      } catch (error) {
        console.error("Error fetching order statuses:", error)
        throw error
      }
    },
    [statusApi],
  )

  const getLatestOrderStatus = useCallback(
    async (orderId: number): Promise<OrderStatusResponseDto | null> => {
      try {
        const response = await statusActionApi.request(`/api/orders/${orderId}/status/latest`, {
          headers: getAuthHeaders(),
        })
        return response
      } catch (error) {
        console.error("Error fetching latest order status:", error)
        return null
      }
    },
    [statusActionApi],
  )

  const createOrderStatus = useCallback(
    async (
      orderId: number,
      statusData: { status: OrderStatusEnum; description: string },
    ): Promise<OrderStatusResponseDto> => {
      try {
        console.log("Creating order status:", { orderId, statusData }) // Debug log

        const response = await statusActionApi.request(`/api/orders/${orderId}/status`, {
          method: "POST",
          body: {
            OrderID: orderId, // Match the C# DTO property name (capital O and I)
            Status: statusData.status, // Match C# property name
            Description: statusData.description, // Match C# property name
          },
          headers: getAuthHeaders(),
        })

        console.log("Create status response:", response) // Debug log
        return response
      } catch (error) {
        console.error("Error creating order status:", error)
        throw error
      }
    },
    [statusActionApi],
  )

  const updateOrderStatus = useCallback(
    async (
      orderId: number,
      statusId: number,
      statusData: { status: OrderStatusEnum; description: string },
    ): Promise<OrderStatusResponseDto> => {
      try {
        console.log("Updating order status:", { orderId, statusId, statusData }) // Debug log

        const response = await statusActionApi.request(`/api/orders/${orderId}/status/${statusId}`, {
          method: "PUT",
          body: {
            Status: statusData.status, // Match C# property name
            Description: statusData.description, // Match C# property name
          },
          headers: getAuthHeaders(),
        })

        console.log("Update status response:", response) // Debug log
        return response
      } catch (error) {
        console.error("Error updating order status:", error)
        throw error
      }
    },
    [statusActionApi],
  )

  const deleteOrderStatus = useCallback(
    async (orderId: number, statusId: number): Promise<boolean> => {
      try {
        await statusActionApi.request(`/api/orders/${orderId}/status/${statusId}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
        })
        return true
      } catch (error) {
        console.error("Error deleting order status:", error)
        throw error
      }
    },
    [statusActionApi],
  )

  const refreshOrders = useCallback(() => {
    fetchOrders(currentPage, statusFilter)
  }, [fetchOrders, currentPage, statusFilter])

  const handlePageChange = useCallback(
    (page: number) => {
      fetchOrders(page, statusFilter)
    },
    [fetchOrders, statusFilter],
  )

  const handleStatusFilterChange = useCallback(
    (status: OrderStatusEnum | "") => {
      setStatusFilter(status)
      fetchOrders(1, status)
    },
    [fetchOrders],
  )

  return {
    orders,
    totalCount,
    currentPage,
    pageSize,
    statusFilter,
    loading: ordersApi.loading || orderApi.loading || statusApi.loading || statusActionApi.loading,
    error: ordersApi.error || orderApi.error || statusApi.error || statusActionApi.error,
    fetchOrders,
    fetchOrdersWithParams, // For Dashboard compatibility
    getOrder,
    createOrder,
    updateOrder,
    deleteOrder,
    getOrderStatuses,
    getLatestOrderStatus,
    createOrderStatus,
    updateOrderStatus,
    deleteOrderStatus,
    refreshOrders,
    handlePageChange,
    handleStatusFilterChange,
  }
}
