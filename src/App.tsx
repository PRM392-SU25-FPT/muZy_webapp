"use client"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { RoutePath } from "./routes/RoutePath"
import Layout from "./components/Layout"
import Login from "./components/Login"
import Dashboard from "./components/Dashboard"
import Products from "./components/Products"
import Categories from "./components/Categories"
import StoreLocations from "./components/StoreLocations"
import Orders from "./components/Orders"
import NotFound from "./components/NotFound"
import ProtectedRoute from "./components/ProtectedRoute"
import AuthRoute from "./components/AuthRoute"
import "./App.css"
import { useAuth } from "./hooks/useAuth"

function App() {
  const { isAuthenticated, isInitialized, login, logout, loading } = useAuth()

  // Show loading while initializing auth
  if (!isInitialized) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">⏳</div>
        <p>Đang khởi tạo ứng dụng...</p>
      </div>
    )
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
                <Login onLogin={login} />
              </AuthRoute>
            }
          />

          {/* Protected Routes with Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Layout onLogout={logout} />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path={RoutePath.PRODUCTS} element={<Products />} />
            <Route path={RoutePath.CATEGORIES} element={<Categories />} />
            <Route path={RoutePath.STORE_LOCATIONS} element={<StoreLocations />} />
            <Route path={RoutePath.ORDERS} element={<Orders />} />
          </Route>
          <Route path={RoutePath.NOT_FOUND} element={<NotFound />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
