"use client"

import type React from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { RoutePath } from "../routes/RoutePath"

interface SidebarProps {
  onLogout: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const navigate = useNavigate()

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "📊",
      path: RoutePath.DASHBOARD,
    },
    {
      id: "products",
      label: "Sản phẩm & Danh mục",
      icon: "🎸",
      path: RoutePath.PRODUCTS,
    },
    {
      id: "orders",
      label: "Đơn hàng",
      icon: "📦",
      path: RoutePath.ORDERS,
    },
  ]

  const handleLogout = () => {
    onLogout()
    navigate(RoutePath.LOGIN)
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">♪</span>
          <span className="logo-text">Music Admin</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => (
            <li key={item.id} className="nav-item">
              <NavLink
                to={item.path}
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                end={item.path === RoutePath.DASHBOARD}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <span className="nav-icon">🚪</span>
          <span className="nav-label">Đăng xuất</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
