"use client"

import { useState, useCallback } from "react"
import { useApi, getAuthHeaders } from "./useApi"
import type { ProductsApiResponse, ProductApiResponse, PriceRangeApiResponse } from "./types"
import type { ProductDto, ProductCreateRequest, ProductUpdateRequest, ProductFilterRequest } from "../types/dto"

export const useProducts = () => {
  const [products, setProducts] = useState<ProductDto[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const productsApi = useApi<ProductsApiResponse>()
  const productApi = useApi<ProductApiResponse>()
  const priceRangeApi = useApi<PriceRangeApiResponse>()

  const fetchProducts = useCallback(
    async (filters?: ProductFilterRequest) => {
      try {
        const queryParams = new URLSearchParams()

        if (filters) {
          if (filters.searchTerm) queryParams.append("search", filters.searchTerm)
          if (filters.category) queryParams.append("category", filters.category)
          if (filters.minPrice) queryParams.append("minPrice", filters.minPrice.toString())
          if (filters.maxPrice) queryParams.append("maxPrice", filters.maxPrice.toString())
          if (filters.sortBy) queryParams.append("sortBy", filters.sortBy)
          if (filters.sortOrder) queryParams.append("sortOrder", filters.sortOrder)
          if (filters.pageNumber) queryParams.append("page", filters.pageNumber.toString())
          if (filters.pageSize) queryParams.append("limit", filters.pageSize.toString())
        }

        const endpoint = `/api/products${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
        const response = await productsApi.request(endpoint, {
          headers: getAuthHeaders(),
        })

        if (response) {
          setProducts(response.products || response.data || response)
          setTotalCount(response.totalCount || response.total || 0)
          setTotalPages(response.totalPages || Math.ceil((response.totalCount || 0) / (filters?.pageSize || 10)))
        }

        return response
      } catch (error) {
        console.error("Error fetching products:", error)
        throw error
      }
    },
    [productsApi],
  )

  const getProduct = useCallback(
    async (id: number): Promise<ProductDto> => {
      try {
        const response = await productApi.request(`/api/products/${id}`, {
          headers: getAuthHeaders(),
        })
        return response.product || response
      } catch (error) {
        console.error("Error fetching product:", error)
        throw error
      }
    },
    [productApi],
  )

  const createProduct = useCallback(
    async (productData: ProductCreateRequest): Promise<ProductDto> => {
      try {
        const response = await productApi.request("/api/products", {
          method: "POST",
          body: productData,
          headers: getAuthHeaders(),
        })

        const newProduct = response.product || response
        if (newProduct) {
          setProducts((prev) => [newProduct, ...prev])
          setTotalCount((prev) => prev + 1)
        }

        return newProduct
      } catch (error) {
        console.error("Error creating product:", error)
        throw error
      }
    },
    [productApi],
  )

  const updateProduct = useCallback(
    async (id: number, productData: ProductUpdateRequest): Promise<ProductDto> => {
      try {
        const response = await productApi.request(`/api/products/${id}`, {
          method: "PUT",
          body: productData,
          headers: getAuthHeaders(),
        })

        const updatedProduct = response.product || response
        if (updatedProduct) {
          setProducts((prev) => prev.map((p) => (p.productID === id ? updatedProduct : p)))
        }

        return updatedProduct
      } catch (error) {
        console.error("Error updating product:", error)
        throw error
      }
    },
    [productApi],
  )

  const deleteProduct = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        await productApi.request(`/api/products/${id}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
        })

        setProducts((prev) => prev.filter((p) => p.productID !== id))
        setTotalCount((prev) => prev - 1)

        return true
      } catch (error) {
        console.error("Error deleting product:", error)
        throw error
      }
    },
    [productApi],
  )

  const searchProducts = useCallback(
    async (searchTerm: string): Promise<ProductDto[]> => {
      try {
        const response = await productsApi.request(`/api/products/search?q=${encodeURIComponent(searchTerm)}`, {
          headers: getAuthHeaders(),
        })
        return response.products || response.data || response
      } catch (error) {
        console.error("Error searching products:", error)
        throw error
      }
    },
    [productsApi],
  )

  const getPriceRange = useCallback(async (): Promise<PriceRangeApiResponse> => {
    try {
      const response = await priceRangeApi.request("/api/products/price-range", {
        headers: getAuthHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error fetching price range:", error)
      throw error
    }
  }, [priceRangeApi])

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
    getPriceRange,
  }
}
