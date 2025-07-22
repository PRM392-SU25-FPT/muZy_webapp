import { useCallback } from "react";
import { useApi } from "./useApi";
import {
  type ProductListResponse,
  type ProductFilterRequest,
  type ProductCreateRequest,
  type ProductUpdateRequest,
} from "../types/dto";

export const useProducts = () => {
  const { data, error, loading, request } = useApi<ProductListResponse>();

  const fetchProducts = useCallback(
    async (filters: ProductFilterRequest) => {
      const query = new URLSearchParams({
        sortBy: filters.sortBy || "productName",
        sortOrder: filters.sortOrder || "asc",
        page: filters.pageNumber.toString(),
        limit: filters.pageSize.toString(),
        ...(filters.category && { category: filters.category }),
        ...(filters.minPrice && { minPrice: filters.minPrice.toString() }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice.toString() }),
        ...(filters.searchTerm && { searchTerm: filters.searchTerm }),
      }).toString();

      return request(`/api/products?${query}`);
    },
    [request]
  );

  const createProduct = useCallback(
    async (productData: ProductCreateRequest) => {
      return request("/api/products", {
        method: "POST",
        body: productData,
      });
    },
    [request]
  );

  const updateProduct = useCallback(
    async (productId: number, productData: ProductUpdateRequest) => {
      return request(`/api/products/${productId}`, {
        method: "PUT",
        body: productData,
      });
    },
    [request]
  );

  const deleteProduct = useCallback(
    async (productId: number) => {
      return request(`/api/products/${productId}`, {
        method: "DELETE",
      });
    },
    [request]
  );

  return {
    products: data?.products || [],
    totalCount: data?.totalCount || 0,
    totalPages: data?.totalPages || 1,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
};
