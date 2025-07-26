import { useCallback, useState } from "react"
import { type ApiOptions, type ApiResponse } from "./types"

const BASE_URL = "https://prm-web-app-980191490938.us-central1.run.app"

export const useApi = <T>() => {
  const [state, setState] = useState<ApiResponse<T>>({
    data: null,
    error: null,
    loading: false,
  })

  const request = useCallback(async (endpoint: string, options: ApiOptions = {}) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const { method = "GET", headers = {}, body } = options

      const config: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      }

      if (body && method !== "GET") {
        config.body = JSON.stringify(body)
      }

      const response = await fetch(`${BASE_URL}${endpoint}`, config)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      setState({
        data,
        error: null,
        loading: false,
      })

      return data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred"
      setState({
        data: null,
        error: errorMessage,
        loading: false,
      })
      throw error
    }
  }, [])

  return {
    ...state,
    request,
  }
}

// Auth token helpers
export const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token")
  }
  return null
}

export const setAuthToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token)
  }
}

export const removeAuthToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token")
  }
}

export const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}
