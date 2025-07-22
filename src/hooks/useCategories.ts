"use client"

import { useState, useCallback } from "react"
import { useApi, getAuthHeaders } from "./useApi"
import type { CategoriesApiResponse, CategoryApiResponse } from "./types"
import type { CategoryDto, CategoryCreateRequest, CategoryDetailDto } from "../types/dto"

export const useCategories = () => {
  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const categoriesApi = useApi<CategoriesApiResponse>()
  const categoryApi = useApi<CategoryApiResponse>()

  const fetchCategories = useCallback(async (): Promise<CategoryDto[]> => {
    try {
      const response = await categoriesApi.request("/api/categories", {
        headers: getAuthHeaders(),
      })

      if (response) {
        const categoryList = response.categories || response.data || response
        setCategories(categoryList)
        setTotalCount(response.totalCount || response.total || categoryList.length)
        return categoryList
      }

      return []
    } catch (error) {
      console.error("Error fetching categories:", error)
      throw error
    }
  }, [categoriesApi])

  const getCategory = useCallback(
    async (id: number): Promise<CategoryDetailDto> => {
      try {
        const response = await categoryApi.request(`/api/categories/${id}`, {
          headers: getAuthHeaders(),
        })
        return response.category || response
      } catch (error) {
        console.error("Error fetching category:", error)
        throw error
      }
    },
    [categoryApi],
  )

  const createCategory = useCallback(
    async (categoryData: CategoryCreateRequest): Promise<CategoryDto> => {
      try {
        const response = await categoryApi.request("/api/categories", {
          method: "POST",
          body: categoryData,
          headers: getAuthHeaders(),
        })

        const newCategory = response.category || response
        if (newCategory) {
          setCategories((prev) => [newCategory, ...prev])
          setTotalCount((prev) => prev + 1)
        }

        return newCategory
      } catch (error) {
        console.error("Error creating category:", error)
        throw error
      }
    },
    [categoryApi],
  )

  const updateCategory = useCallback(
    async (id: number, categoryData: CategoryCreateRequest): Promise<CategoryDto> => {
      try {
        const response = await categoryApi.request(`/api/categories/${id}`, {
          method: "PUT",
          body: categoryData,
          headers: getAuthHeaders(),
        })

        const updatedCategory = response.category || response
        if (updatedCategory) {
          setCategories((prev) => prev.map((c) => (c.categoryID === id ? updatedCategory : c)))
        }

        return updatedCategory
      } catch (error) {
        console.error("Error updating category:", error)
        throw error
      }
    },
    [categoryApi],
  )

  const deleteCategory = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        await categoryApi.request(`/api/categories/${id}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
        })

        setCategories((prev) => prev.filter((c) => c.categoryID !== id))
        setTotalCount((prev) => prev - 1)

        return true
      } catch (error) {
        console.error("Error deleting category:", error)
        throw error
      }
    },
    [categoryApi],
  )

  return {
    categories,
    totalCount,
    loading: categoriesApi.loading || categoryApi.loading,
    error: categoriesApi.error || categoryApi.error,
    fetchCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
  }
}
