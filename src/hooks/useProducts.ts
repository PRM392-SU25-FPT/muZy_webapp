"use client";

import { useState, useCallback } from "react";
import { useApi, getAuthHeaders } from "./useApi";
import type {
  ProductsApiResponse,
  ProductApiResponse
} from "./types";
import type {
  ProductDto,
  ProductCreateRequest,
  ProductUpdateRequest,
  ProductFilterRequest
} from "../types/dto";

export const useProducts = () => {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const productsApi = useApi<ProductsApiResponse>();
  const productApi = useApi<ProductApiResponse>();

  // Fetch products with filters
  const fetchProducts = useCallback(
    async (filters?: ProductFilterRequest) => {
      try {
        const queryParams = new URLSearchParams();

        if (filters) {
          if (filters.searchTerm) queryParams.append("searchTerm", filters.searchTerm);
          if (filters.category) queryParams.append("category", filters.category);
          if (filters.minPrice != null) queryParams.append("minPrice", filters.minPrice.toString());
          if (filters.maxPrice != null) queryParams.append("maxPrice", filters.maxPrice.toString());
          if (filters.sortBy) queryParams.append("sort", filters.sortBy);
          if (filters.sortOrder) queryParams.append("sortOrder", filters.sortOrder);
          if (filters.pageNumber != null) queryParams.append("pageNumber", filters.pageNumber.toString());
          if (filters.pageSize != null) queryParams.append("pageSize", filters.pageSize.toString());
        }

        const endpoint = `/api/products${
          queryParams.toString() ? `?${queryParams.toString()}` : ""
        }`;

        const response = await productsApi.request(endpoint, { headers: getAuthHeaders() });

        if (response) {
          const items = response.products ?? [];
          const count = response.totalCount ?? items.length;
          const pages =
            response.totalPages ??
            Math.ceil(count / (filters?.pageSize || 10));

          setProducts(items);
          setTotalCount(count);
          setTotalPages(pages);
        }

        return response;
      } catch (error) {
        console.error("Error fetching products:", error);
        return null;
      }
    },
    [productsApi]
  );

  const getProduct = useCallback(
    async (id: number): Promise<ProductDto> => {
      try {
        return await productApi.request(`/api/products/${id}`, {
          headers: getAuthHeaders()
        });
      } catch (error) {
        console.error("Error fetching product:", error);
        throw error;
      }
    },
    [productApi]
  );

  const createProduct = useCallback(
    async (productData: ProductCreateRequest): Promise<ProductDto> => {
      try {
        const response = await productApi.request("/api/products", {
          method: "POST",
          body: productData, // no JSON.stringify
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json"
          }
        });

        setProducts((prev) => [...prev, response]);
        setTotalCount((prev) => prev + 1);
        return response;
      } catch (error) {
        console.error("Error creating product:", error);
        throw error;
      }
    },
    [productApi]
  );

  const updateProduct = useCallback(
    async (id: number, productData: ProductUpdateRequest): Promise<ProductDto> => {
      try {
        const response = await productApi.request(`/api/products/${id}`, {
          method: "PUT",
          body: productData,
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json"
          }
        });

        setProducts((prev) =>
          prev.map((p) => (p.productID === id ? response : p))
        );
        return response;
      } catch (error) {
        console.error("Error updating product:", error);
        throw error;
      }
    },
    [productApi]
  );

  const deleteProduct = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        await productApi.request(`/api/products/${id}`, {
          method: "DELETE",
          headers: getAuthHeaders()
        });

        setProducts((prev) => prev.filter((p) => p.productID !== id));
        setTotalCount((prev) => Math.max(0, prev - 1));
        return true;
      } catch (error) {
        console.error("Error deleting product:", error);
        return false;
      }
    },
    [productApi]
  );

  const searchProducts = useCallback(
    async (
      searchTerm: string,
      filters?: Partial<ProductFilterRequest>
    ): Promise<ProductDto[]> => {
      try {
        const queryParams = new URLSearchParams();
        queryParams.append("searchTerm", searchTerm);
        if (filters?.sortBy) queryParams.append("sort", filters.sortBy);
        if (filters?.sortOrder) queryParams.append("sortOrder", filters.sortOrder);
        if (filters?.pageNumber != null)
          queryParams.append("pageNumber", filters.pageNumber.toString());
        if (filters?.pageSize != null)
          queryParams.append("pageSize", filters.pageSize.toString());

        const response = await productsApi.request(
          `/api/products/search?${queryParams.toString()}`,
          { headers: getAuthHeaders() }
        );

        return response?.products ?? [];
      } catch (error) {
        console.error("Error searching products:", error);
        return [];
      }
    },
    [productsApi]
  );

  const getProductsByPriceRange = useCallback(
    async (
      minPrice?: number,
      maxPrice?: number,
      filters?: Partial<ProductFilterRequest>
    ): Promise<ProductDto[]> => {
      try {
        const queryParams = new URLSearchParams();
        if (minPrice != null) queryParams.append("minPrice", minPrice.toString());
        if (maxPrice != null) queryParams.append("maxPrice", maxPrice.toString());
        if (filters?.sortBy) queryParams.append("sort", filters.sortBy);
        if (filters?.sortOrder) queryParams.append("sortOrder", filters.sortOrder);
        if (filters?.pageNumber != null)
          queryParams.append("pageNumber", filters.pageNumber.toString());
        if (filters?.pageSize != null)
          queryParams.append("pageSize", filters.pageSize.toString());

        const response = await productsApi.request(
          `/api/products/price-range?${queryParams.toString()}`,
          { headers: getAuthHeaders() }
        );

        return response?.products ?? [];
      } catch (error) {
        console.error("Error fetching products by price:", error);
        return [];
      }
    },
    [productsApi]
  );

  return {
    products,
    totalCount,
    totalPages,
    loading: productsApi.loading || productApi.loading,
    error: productsApi.error || productApi.error,
    fetchProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    getProductsByPriceRange
  };
};
