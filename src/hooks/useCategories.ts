"use client";

import { useState, useCallback } from "react";
import { useApi, getAuthHeaders } from "./useApi";
import type { CategoriesApiResponse, CategoryApiResponse } from "./types";
import type {
  CategoryDto,
  CategoryCreateRequest,
  CategoryDetailDto,
} from "../types/dto";

export const useCategories = () => {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const categoriesApi = useApi<CategoriesApiResponse>();
  const categoryApi = useApi<CategoryApiResponse>();

  const fetchCategories = useCallback(async (): Promise<CategoryDto[]> => {
    try {
      const response = await categoriesApi.request("/api/categories", {
        headers: getAuthHeaders(),
      });

      if (response) {
        const items =
          response.categories ??
          response.items ??
          (Array.isArray(response) ? response : []);
        const count = response.totalCount ?? items.length;

        setCategories(items);
        setTotalCount(count);
        return items;
      }

      return [];
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  }, [categoriesApi]);

  const getCategory = useCallback(
    async (id: number): Promise<CategoryDetailDto> => {
      try {
        return await categoryApi.request(`/api/categories/${id}`, {
          headers: getAuthHeaders(),
        });
      } catch (error) {
        console.error("Error fetching category:", error);
        throw error;
      }
    },
    [categoryApi]
  );

  const createCategory = useCallback(
    async (categoryData: CategoryCreateRequest): Promise<CategoryDto> => {
      try {
        const response = await categoryApi.request("/api/categories", {
          method: "POST",
          body: categoryData, // Axios handles JSON automatically
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
        });

        setCategories((prev) => [...prev, response]);
        setTotalCount((prev) => prev + 1);

        return response;
      } catch (error) {
        console.error("Error creating category:", error);
        throw error;
      }
    },
    [categoryApi]
  );

  // API placeholders (no update/delete yet)
  const updateCategory = useCallback(
    async (_id: number, _data: CategoryCreateRequest): Promise<CategoryDto> => {
      throw new Error("Update category is not supported by the API");
    },
    []
  );

  const deleteCategory = useCallback(async (_id: number): Promise<boolean> => {
    throw new Error("Delete category is not supported by the API");
  }, []);

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
  };
};
