"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { RoutePath } from "../routes/RoutePath"
import { useProducts } from "../hooks/useProducts"
import { useCategories } from "../hooks/useCategories"
import { useOrders } from "../hooks/useOrders"

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    orders: 0,
  })

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { fetchProducts } = useProducts()
  const { fetchCategories } = useCategories()
  const { fetchOrdersWithParams } = useOrders()

  const loadDashboardData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const promises = [
        fetchProducts({ pageNumber: 1, pageSize: 1 }).catch(() => ({ totalCount: 0 })),
        fetchCategories().catch(() => []),
        fetchOrdersWithParams({ pageNumber: 1, pageSize: 1 }).catch(() => ({ totalCount: 0 })),
      ]

      const [productsResponse, categoriesResponse, ordersResponse] = await Promise.allSettled(promises)

      let productCount = 0
      let categoryCount = 0
      let orderCount = 0

      if (productsResponse.status === "fulfilled" && productsResponse.value) {
        productCount = productsResponse.value.totalCount || 0
      }

      if (categoriesResponse.status === "fulfilled" && categoriesResponse.value) {
        categoryCount = Array.isArray(categoriesResponse.value) ? categoriesResponse.value.length : 0
      }

      if (ordersResponse.status === "fulfilled" && ordersResponse.value) {
        orderCount = ordersResponse.value.totalCount || 0
      }

      setStats({
        products: productCount,
        categories: categoryCount,
        orders: orderCount,
      })
    } catch (error) {
      console.error("Error loading dashboard data:", error)
      setError("Không thể tải dữ liệu dashboard")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
    // chỉ chạy 1 lần khi mount
  }, [])

  const handleRefresh = () => {
    loadDashboardData()
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-banner">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <span className="error-message">{error}</span>
            <button className="error-retry-btn" onClick={handleRefresh}>
              Thử lại
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1 className="dashboard-title">
            <span className="title-icon">🎵</span>
            Chào mừng đến với Music Shop Admin
          </h1>
          <p className="dashboard-subtitle">Quản lý cửa hàng nhạc cụ của bạn một cách hiệu quả</p>
        </div>
        <div className="dashboard-actions">
          <button className="refresh-btn" onClick={handleRefresh} disabled={isLoading}>
            <span className="refresh-icon">{isLoading ? "⏳" : "🔄"}</span>
            {isLoading ? "Đang tải..." : "Làm mới"}
          </button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="stats-grid">
        <Link to={RoutePath.PRODUCTS} className="stat-card-link">
          <div className="stat-card products-card">
            <div className="stat-icon-container">
              <div className="stat-icon">🎸</div>
              <div className="stat-badge">Sản phẩm</div>
            </div>
            <div className="stat-content">
              <div className="stat-number">
                {isLoading ? (
                  <div className="loading-number">⏳</div>
                ) : (
                  <span className="number-display">{stats.products.toLocaleString()}</span>
                )}
              </div>
              <div className="stat-label">Tổng số sản phẩm</div>
              <div className="stat-description">Quản lý kho hàng nhạc cụ</div>
            </div>
            <div className="stat-arrow">→</div>
          </div>
        </Link>

        <Link to={RoutePath.CATEGORIES} className="stat-card-link">
          <div className="stat-card categories-card">
            <div className="stat-icon-container">
              <div className="stat-icon">📁</div>
              <div className="stat-badge">Danh mục</div>
            </div>
            <div className="stat-content">
              <div className="stat-number">
                {isLoading ? (
                  <div className="loading-number">⏳</div>
                ) : (
                  <span className="number-display">{stats.categories.toLocaleString()}</span>
                )}
              </div>
              <div className="stat-label">Danh mục sản phẩm</div>
              <div className="stat-description">Phân loại và tổ chức sản phẩm</div>
            </div>
            <div className="stat-arrow">→</div>
          </div>
        </Link>

        <Link to={RoutePath.ORDERS} className="stat-card-link">
          <div className="stat-card orders-card">
            <div className="stat-icon-container">
              <div className="stat-icon">📦</div>
              <div className="stat-badge">Đơn hàng</div>
            </div>
            <div className="stat-content">
              <div className="stat-number">
                {isLoading ? (
                  <div className="loading-number">⏳</div>
                ) : (
                  <span className="number-display">{stats.orders.toLocaleString()}</span>
                )}
              </div>
              <div className="stat-label">Tổng đơn hàng</div>
              <div className="stat-description">Theo dõi và xử lý đơn hàng</div>
            </div>
            <div className="stat-arrow">→</div>
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2 className="section-title">
          <span className="section-icon">⚡</span>
          Thao tác nhanh
        </h2>
        <div className="quick-actions-grid">
          <Link to={RoutePath.PRODUCTS} className="quick-action-card">
            <div className="action-icon">➕</div>
            <div className="action-content">
              <h3>Thêm sản phẩm</h3>
              <p>Thêm nhạc cụ mới vào kho</p>
            </div>
          </Link>

          <Link to={RoutePath.CATEGORIES} className="quick-action-card">
            <div className="action-icon">📂</div>
            <div className="action-content">
              <h3>Quản lý danh mục</h3>
              <p>Tạo và chỉnh sửa danh mục</p>
            </div>
          </Link>

          <Link to={RoutePath.ORDERS} className="quick-action-card">
            <div className="action-icon">📋</div>
            <div className="action-content">
              <h3>Xem đơn hàng</h3>
              <p>Theo dõi đơn hàng mới</p>
            </div>
          </Link>

          <Link to={RoutePath.STORE_LOCATIONS} className="quick-action-card">
            <div className="action-icon">📍</div>
            <div className="action-content">
              <h3>Vị trí cửa hàng</h3>
              <p>Quản lý địa điểm kinh doanh</p>
            </div>
          </Link>
        </div>
      </div>

      {/* System Status */}
      <div className="system-status">
        <h2 className="section-title">
          <span className="section-icon">💡</span>
          Trạng thái hệ thống
        </h2>
        <div className="status-grid">
          <div className="status-item">
            <div className="status-indicator online"></div>
            <div className="status-content">
              <h4>API Server</h4>
              <p>Hoạt động bình thường</p>
            </div>
          </div>
          <div className="status-item">
            <div className="status-indicator online"></div>
            <div className="status-content">
              <h4>Database</h4>
              <p>Kết nối ổn định</p>
            </div>
          </div>
          <div className="status-item">
            <div className="status-indicator online"></div>
            <div className="status-content">
              <h4>Storage</h4>
              <p>Dung lượng khả dụng</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
