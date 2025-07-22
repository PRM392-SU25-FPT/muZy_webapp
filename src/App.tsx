"use client"

import { useState } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { RoutePath } from "./routes/RoutePath"
import Layout from "./components/Layout"
import Login from "./components/Login"
import Dashboard from "./components/Dashboard"
import Products from "./components/Products"
import Orders from "./components/Orders"
import NotFound from "./components/NotFound"
import ProtectedRoute from "./components/ProtectedRoute"
import AuthRoute from "./components/AuthRoute"
import "./App.css"

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleLogin = (username: string, password: string) => {
    // Simple authentication logic - replace with real authentication
    if (username === "admin" && password === "password") {
      setIsAuthenticated(true)
      return true
    } else {
      alert("Invalid credentials. Use admin/password")
      return false
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
  }

  return (
    <div className="app">
      <Router>
        <Routes>
          {/* Auth Route */}
          <Route
            path={RoutePath.LOGIN}
            element={
              <AuthRoute isAuthenticated={isAuthenticated}>
                <Login onLogin={handleLogin} />
              </AuthRoute>
            }
          />

          {/* Protected Routes with Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Layout onLogout={handleLogout} />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path={RoutePath.PRODUCTS} element={<Products />} />
            <Route path={RoutePath.ORDERS} element={<Orders />} />
          </Route>

          {/* 404 Route */}
          <Route path={RoutePath.NOT_FOUND} element={<NotFound />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
