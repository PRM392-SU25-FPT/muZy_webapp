"use client";
import { useCallback, useState } from "react";
import { type ApiResponse, type ApiOptions } from "./types";

const BASE_URL = "https://prm-web-app-980191490938.us-central1.run.app";

export const useApi = <T>() => {
  const [state, setState] = useState<ApiResponse<T>>({
    data: null,
    error: null,
    loading: false,
  });
  const [ongoingRequests, setOngoingRequests] = useState<Set<string>>(
    new Set()
  );
  const [retryCounts, setRetryCounts] = useState<Map<string, number>>(
    new Map()
  );
  const MAX_RETRIES = 3;

  const request = useCallback(
    async (endpoint: string, options: ApiOptions = {}) => {
      const requestKey = `${endpoint}_${options.method || "GET"}`;

      // Check cache
      const cachedData = localStorage.getItem(requestKey);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          // 5-minute cache
          setState({ data, error: null, loading: false });
          return data as T;
        }
      }

      // Block duplicate requests
      if (ongoingRequests.has(requestKey)) {
        console.log(`Duplicate request blocked: ${requestKey}`);
        return state.data;
      }

      // Check retry limit
      const currentRetryCount = retryCounts.get(requestKey) || 0;
      if (currentRetryCount >= MAX_RETRIES) {
        const errorMessage = `Đã đạt giới hạn thử lại (${MAX_RETRIES}) cho ${endpoint}`;
        setState({ data: null, error: errorMessage, loading: false });
        throw new Error(errorMessage);
      }

      setOngoingRequests((prev) => new Set(prev).add(requestKey));
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const { method = "GET", headers = {}, body } = options;
        const config: RequestInit = {
          method,
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
            ...headers,
          },
        };

        if (body && method !== "GET") {
          config.body = JSON.stringify(body);
        }

        console.log(`API Call: ${BASE_URL}${endpoint}`, {
          method,
          headers,
          body,
        });

        const response = await fetch(`${BASE_URL}${endpoint}`, config);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        setState({ data, error: null, loading: false });
        setRetryCounts((prev) => {
          const newMap = new Map(prev);
          newMap.delete(requestKey); // Reset retry count on success
          return newMap;
        });

        // Cache response
        localStorage.setItem(
          requestKey,
          JSON.stringify({ data, timestamp: Date.now() })
        );

        return data as T;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Đã xảy ra lỗi";
        setState({ data: null, error: errorMessage, loading: false });
        setRetryCounts((prev) =>
          new Map(prev).set(requestKey, currentRetryCount + 1)
        );
        throw error;
      } finally {
        setOngoingRequests((prev) => {
          const newSet = new Set(prev);
          newSet.delete(requestKey);
          return newSet;
        });
      }
    },
    []
  );

  return {
    ...state,
    request,
  };
};

// Auth token management
export const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken");
  }
  return null;
};

export const setAuthToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("authToken", token);
  }
};

export const removeAuthToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("authToken");
  }
};

export const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
