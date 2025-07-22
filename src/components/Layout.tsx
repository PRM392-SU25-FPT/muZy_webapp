"use client"

import type React from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"

interface LayoutProps {
  onLogout: () => void
}

const Layout: React.FC<LayoutProps> = ({ onLogout }) => {
  return (
    <div className="layout">
      <Sidebar onLogout={onLogout} />
      <main className="main-content">
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout
