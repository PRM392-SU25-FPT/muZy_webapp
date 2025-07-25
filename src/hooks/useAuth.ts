"use client"

import { useState, useCallback, useEffect } from "react"
import { useApi, getAuthHeaders } from "./useApi"

interface LoginRequest {
  username: string
  password: string
}

interface RegisterRequest {
  username: string
  email: string
  password: string
  phoneNumber?: string
  address?: string
}

interface AuthResponse {
  success: boolean
  message: string
  token?: string
  user?: any
}

export const useAuth = () => {
  const [user, setUser] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  const authApi = useApi<AuthResponse>()
  const profileApi = useApi<any>()

  // Khởi tạo state khi app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          setIsInitialized(true)
          return
        }

        // Gọi API để xác thực token và lấy thông tin user
        const profile = await profileApi.request("/api/auth/profile", {
          method: "GET",
          headers: {
            ...getAuthHeaders(),
          },
        })

        if (profile) {
          setUser(profile)
          setIsAuthenticated(true)
        } else {
          localStorage.removeItem("token")
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
        localStorage.removeItem("token")
      } finally {
        setIsInitialized(true)
      }
    }

    initializeAuth()
  }, [profileApi])

  const login = useCallback(async (username: string, password: string): Promise<void> => {
    try {
      const response = await authApi.request("/api/auth/login", {
        method: "POST",
        body: { username, password },
        headers: { "Content-Type": "application/json" },
      })

      if (!response?.success || !response.token) {
        throw new Error(response?.message || "Đăng nhập thất bại")
      }

      localStorage.setItem("token", response.token)
      localStorage.setItem("username", username)

      const profile = await profileApi.request("/api/auth/profile", {
        method: "GET",
        headers: {
          ...getAuthHeaders(),
        },
      })

      setUser(profile || response.user || { username })
      setIsAuthenticated(true)
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }, [authApi, profileApi])

  const register = useCallback(
    async (userData: RegisterRequest): Promise<AuthResponse> => {
      try {
        const response = await authApi.request("/api/auth/register", {
          method: "POST",
          body: userData,
          headers: { "Content-Type": "application/json" },
        })

        if (response?.success && response.token) {
          localStorage.setItem("token", response.token)
          localStorage.setItem("username", userData.username)
          setUser(response.user)
          setIsAuthenticated(true)
          return response
        }

        throw new Error(response?.message || "Registration failed")
      } catch (error: any) {
        console.error("Registration error:", error)
        throw new Error(error?.message || "Registration request failed")
      }
    },
    [authApi],
  )

  const logout = useCallback(() => {
    localStorage.removeItem("token")
    localStorage.removeItem("username")
    setUser(null)
    setIsAuthenticated(false)
  }, [])

  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        return false
      }

      const profile = await profileApi.request("/api/auth/profile", {
        method: "GET",
        headers: { ...getAuthHeaders() },
      })

      if (profile) {
        setUser(profile)
        setIsAuthenticated(true)
        return true
      }

      return false
    } catch (error) {
      console.error("Auth check failed:", error)
      logout()
      return false
    }
  }, [profileApi, logout])

  return {
    user,
    isAuthenticated,
    isInitialized,
    loading: authApi.loading || profileApi.loading,
    error: authApi.error || profileApi.error,
    login,
    register,
    logout,
    checkAuth,
  }
}
