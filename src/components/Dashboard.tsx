import type React from "react"
import { Link } from "react-router-dom"
import { RoutePath } from "../routes/RoutePath"

const Dashboard: React.FC = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Tổng quan hoạt động cửa hàng nhạc cụ</p>
      </div>

      <div className="dashboard-grid">
        <Link to={RoutePath.PRODUCTS} className="stat-card-link">
          <div className="stat-card">
            <div className="stat-icon">🎸</div>
            <div className="stat-content">
              <h3>Sản phẩm</h3>
              <p className="stat-number">156</p>
              <span className="stat-label">Tổng số sản phẩm</span>
            </div>
          </div>
        </Link>

        <Link to={RoutePath.ORDERS} className="stat-card-link">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <h3>Đơn hàng</h3>
              <p className="stat-number">23</p>
              <span className="stat-label">Đơn hàng mới</span>
            </div>
          </div>
        </Link>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Doanh thu</h3>
            <p className="stat-number">45.2M</p>
            <span className="stat-label">VNĐ tháng này</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Khách hàng</h3>
            <p className="stat-number">89</p>
            <span className="stat-label">Khách hàng mới</span>
          </div>
        </div>
      </div>

      <div className="recent-activity">
        <h2>Hoạt động gần đây</h2>
        <div className="activity-list">
          <div className="activity-item">
            <span className="activity-icon">🎹</span>
            <div className="activity-content">
              <p>
                <strong>Đàn Piano Yamaha</strong> đã được thêm vào kho
              </p>
              <small>2 giờ trước</small>
            </div>
          </div>
          <div className="activity-item">
            <span className="activity-icon">📦</span>
            <div className="activity-content">
              <p>
                Đơn hàng <strong>#12345</strong> đã được xác nhận
              </p>
              <small>4 giờ trước</small>
            </div>
          </div>
          <div className="activity-item">
            <span className="activity-icon">🎸</span>
            <div className="activity-content">
              <p>
                <strong>Guitar Acoustic</strong> sắp hết hàng
              </p>
              <small>6 giờ trước</small>
            </div>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Thao tác nhanh</h2>
        <div className="quick-actions-grid">
          <Link to={RoutePath.PRODUCTS} className="quick-action-btn">
            <span className="action-icon">➕</span>
            <span>Thêm sản phẩm</span>
          </Link>
          <Link to={RoutePath.ORDERS} className="quick-action-btn">
            <span className="action-icon">📋</span>
            <span>Xem đơn hàng</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
