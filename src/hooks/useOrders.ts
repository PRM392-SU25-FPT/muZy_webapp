"use client";

import { useState, useCallback } from "react";
import { useApi, getAuthHeaders } from "./useApi";
import type {
  OrdersApiResponse,
  OrderApiResponse,
  SuccessResponse,
} from "./types";
import type {
  OrderResponseDTO,
  OrderCreateDTO,
  OrderUpdateDTO,
  OrderStatus,
} from "../types/dto";

interface OrderFilters {
  pageNumber?: number;
  pageSize?: number;
}

export const useOrders = () => {
  const [orders, setOrders] = useState<OrderResponseDTO[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const ordersApi = useApi<OrdersApiResponse>();
  const orderApi = useApi<OrderApiResponse>();
  const actionApi = useApi<SuccessResponse>();

  // Fetch orders (with pagination)
  const fetchOrders = useCallback(
    async (filters?: OrderFilters): Promise<OrderResponseDTO[]> => {
      try {
        const queryParams = new URLSearchParams();
        if (filters?.pageNumber != null)
          queryParams.append("pageNumber", filters.pageNumber.toString());
        if (filters?.pageSize != null)
          queryParams.append("pageSize", filters.pageSize.toString());

        const endpoint = `/api/orders${
          queryParams.toString() ? `?${queryParams.toString()}` : ""
        }`;

        const response = await ordersApi.request(endpoint, {
          headers: getAuthHeaders(),
        });

        if (response) {
          const items =
            response.items ?? (Array.isArray(response) ? response : []);
          const count = response.totalCount ?? items.length;
          const pages =
            response.totalPages ?? Math.ceil(count / (filters?.pageSize || 10));

          setOrders(items);
          setTotalCount(count);
          setTotalPages(pages);
          return items;
        }

        return [];
      } catch (error) {
        console.error("Error fetching orders:", error);
        return [];
      }
    },
    [ordersApi]
  );

  const getOrder = useCallback(
    async (id: number): Promise<OrderResponseDTO> => {
      try {
        return await orderApi.request(`/api/orders/${id}`, {
          headers: getAuthHeaders(),
        });
      } catch (error) {
        console.error("Error fetching order:", error);
        throw error;
      }
    },
    [orderApi]
  );

  const createOrder = useCallback(
    async (orderData: OrderCreateDTO): Promise<OrderResponseDTO> => {
      try {
        const response = await orderApi.request("/api/orders", {
          method: "POST",
          body: orderData, // Axios handles JSON automatically
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
        });

        // Update local list
        setOrders((prev) => [...prev, response]);
        setTotalCount((prev) => prev + 1);

        return response;
      } catch (error) {
        console.error("Error creating order:", error);
        throw error;
      }
    },
    [orderApi]
  );

  const updateOrder = useCallback(
    async (
      id: number,
      orderData: OrderUpdateDTO
    ): Promise<OrderResponseDTO> => {
      try {
        const response = await orderApi.request(`/api/orders/${id}`, {
          method: "PUT",
          body: orderData,
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
        });

        // Sync local state
        setOrders((prev) =>
          prev.map((order) => (order.orderId === id ? response : order))
        );

        return response;
      } catch (error) {
        console.error("Error updating order:", error);
        throw error;
      }
    },
    [orderApi]
  );

  const deleteOrder = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        await orderApi.request(`/api/orders/${id}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
        });

        // Remove locally
        setOrders((prev) => prev.filter((o) => o.orderId !== id));
        setTotalCount((prev) => Math.max(0, prev - 1));

        return true;
      } catch (error) {
        console.error("Error deleting order:", error);
        return false;
      }
    },
    [orderApi]
  );

  const getOrdersByUser = useCallback(
    async (userId: number): Promise<OrderResponseDTO[]> => {
      try {
        const response = await ordersApi.request(`/api/orders/user/${userId}`, {
          headers: getAuthHeaders(),
        });
        return Array.isArray(response) ? response : response?.items ?? [];
      } catch (error) {
        console.error("Error fetching user orders:", error);
        return [];
      }
    },
    [ordersApi]
  );

  const updateOrderStatus = useCallback(
    async (id: number, status: OrderStatus): Promise<OrderResponseDTO> => {
      try {
        const existing = orders.find((o) => o.orderId === id);
        if (!existing) throw new Error("Order not found in local state");

        return await updateOrder(id, { ...existing, status });
      } catch (error) {
        console.error("Error updating order status:", error);
        throw error;
      }
    },
    [orders, updateOrder]
  );

  return {
    orders,
    totalCount,
    totalPages,
    loading: ordersApi.loading || orderApi.loading || actionApi.loading,
    error: ordersApi.error || orderApi.error || actionApi.error,
    fetchOrders,
    getOrder,
    createOrder,
    updateOrder,
    updateOrderStatus,
    deleteOrder,
    getOrdersByUser,
  };
};
