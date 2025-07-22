import { useCallback } from "react";
import { useApi } from "./useApi";
import {
  type CategoryListResponse,
  type CategoryCreateRequest,
} from "../types/dto";

export const useCategories = () => {
  const { data, error, loading, request } = useApi<CategoryListResponse>();

  const fetchCategories = useCallback(async () => {
    return request("/api/categories");
  }, [request]);

  const createCategory = useCallback(
    async (categoryData: CategoryCreateRequest) => {
      return request("/api/categories", {
        method: "POST",
        body: categoryData,
      });
    },
    [request]
  );

  return {
    categories: data?.categories || [],
    error,
    loading,
    fetchCategories,
    createCategory,
  };
};
