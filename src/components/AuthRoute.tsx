import type React from "react"
import { Navigate } from "react-router-dom"

interface AuthRouteProps {
  children: React.ReactNode
  isAuthenticated: boolean
}

const AuthRoute: React.FC<AuthRouteProps> = ({ children, isAuthenticated }) => {
  // If user is already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default AuthRoute
