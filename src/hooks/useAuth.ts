"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { useApi, setAuthToken, removeAuthToken, getAuthToken } from "./useApi"

interface User {
  id: number
  email: string
  name: string
  role: string
}

interface LoginRequest {
  email: string
  password: string
}

interface RegisterRequest {
  email: string
  password: string
  name: string
}

// interface ForgotPasswordRequest {
//   email: string
// }

// interface ResetPasswordRequest {
//   token: string
//   password: string
// }

interface AuthResponse {
  user: User
  token: string
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const api = useApi<AuthResponse>()

  // Mock data for development
  const mockUser = useMemo<User>(() => ({
    id: 1,
    email: "admin@musicshop.com",
    name: "Admin User",
    role: "admin",
  }), [])

  const mockAuthResponse = useMemo<AuthResponse>(() => ({
    user: mockUser,
    token: "mock-jwt-token-12345",
  }), [mockUser])

  useEffect(() => {
    const token = getAuthToken()
    if (token) {
      // In real app, validate token with backend
      setUser(mockUser)
      setIsAuthenticated(true)
    }
  }, [mockUser])

  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      // For now, use mock data - replace with real API call
      if (credentials.email === "admin@musicshop.com" && credentials.password === "password") {
        setAuthToken(mockAuthResponse.token)
        setUser(mockAuthResponse.user)
        setIsAuthenticated(true)
        return mockAuthResponse
      } else {
        throw new Error("Invalid credentials")
      }
    } catch (error) {
      setUser(null)
      setIsAuthenticated(false)
      throw error
    }
  }, [mockAuthResponse])

  const register = useCallback(async (userData: RegisterRequest) => {
      const mockResponse = {
        ...mockAuthResponse,
        user: { ...mockUser, email: userData.email, name: userData.name },
      }

      setAuthToken(mockResponse.token)
      setUser(mockResponse.user)
      setIsAuthenticated(true)
      return mockResponse
  }, [mockAuthResponse, mockUser])

  const logout = useCallback(() => {
    removeAuthToken()
    setUser(null)
    setIsAuthenticated(false)
  }, [])

  const forgotPassword = useCallback(async () => {
      return { message: "Password reset email sent" }
  }, [])

  const resetPassword = useCallback(() => {
      return { message: "Password reset successful" }
  }, [])

  const updateProfile = useCallback(async (userData: Partial<User>) => {
      const updatedUser = { ...mockUser, ...userData }
      setUser(updatedUser)
      return updatedUser
  }, [mockUser])

  return {
    user,
    isAuthenticated,
    loading: api.loading,
    error: api.error,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
  }
}
