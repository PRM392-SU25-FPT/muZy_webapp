"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useOrders } from "../hooks/useOrders"
import OrderStatusModal from "./OrderStatusModal"
// Cập nhật import để sử dụng OrderStatusEnum
import type { OrderResponseDTO, OrderStatusResponseDto } from "../types/dto"
import { getOrderStatusLabel, getOrderStatusClass } from "../types/dto"
import { OrderStatusEnum } from "../types/dto" // Import OrderStatusEnum

const Orders: React.FC = () => {
  const {
    orders,
    totalCount,
    currentPage,
    pageSize,
    statusFilter,
    loading,
    error,
    fetchOrders,
    getOrder,
    getOrderStatuses,
    createOrderStatus,
    updateOrderStatus,
    deleteOrderStatus,
    refreshOrders,
    handlePageChange,
    handleStatusFilterChange,
  } = useOrders()

  // Modal states
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<OrderResponseDTO | null>(null)
  const [orderStatuses, setOrderStatuses] = useState<OrderStatusResponseDto[]>([])
  const [editingStatus, setEditingStatus] = useState<OrderStatusResponseDto | undefined>()
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [showStatusForm, setShowStatusForm] = useState(false)

  // Load orders only once on component mount
  useEffect(() => {
    if (!initialized) {
      fetchOrders(1, "")
      setInitialized(true)
    }
  }, [fetchOrders, initialized])

  const handleViewOrder = useCallback(
    async (order: OrderResponseDTO) => {
      try {
        const fullOrder = await getOrder(order.orderId)
        const statuses = await getOrderStatuses(order.orderId)
        setSelectedOrder(fullOrder)
        setOrderStatuses(statuses)
        setIsOrderDetailsOpen(true)
      } catch (error) {
        console.error("Error loading order details:", error)
        alert("Có lỗi xảy ra khi tải thông tin đơn hàng")
      }
    },
    [getOrder, getOrderStatuses],
  )

  const handleManageStatus = useCallback(
    async (order: OrderResponseDTO) => {
      try {
        const statuses = await getOrderStatuses(order.orderId)
        setSelectedOrder(order)
        setOrderStatuses(statuses)
        setEditingStatus(undefined)
        setIsStatusModalOpen(true)
      } catch (error) {
        console.error("Error loading order statuses:", error)
        alert("Có lỗi xảy ra khi tải trạng thái đơn hàng")
      }
    },
    [getOrderStatuses],
  )

  const handleCreateStatus = useCallback(
    async (statusData: any) => {
      if (!selectedOrder) return

      try {
        await createOrderStatus(selectedOrder.orderId, statusData)
        // Refresh statuses
        const updatedStatuses = await getOrderStatuses(selectedOrder.orderId)
        setOrderStatuses(updatedStatuses)
        // Close form and refresh orders list
        setShowStatusForm(false)
        refreshOrders()
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi tạo trạng thái"
        alert(`Lỗi: ${errorMessage}`)
        console.error("Error creating status:", error)
      }
    },
    [selectedOrder, createOrderStatus, getOrderStatuses, refreshOrders],
  )

  const handleUpdateStatus = useCallback(
    async (statusData: any) => {
      if (!selectedOrder || !editingStatus) return

      try {
        await updateOrderStatus(selectedOrder.orderId, editingStatus.orderStatusID, statusData)
        // Refresh statuses
        const updatedStatuses = await getOrderStatuses(selectedOrder.orderId)
        setOrderStatuses(updatedStatuses)
        // Close form and refresh orders list
        setEditingStatus(undefined)
        refreshOrders()
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi cập nhật trạng thái"
        alert(`Lỗi: ${errorMessage}`)
        console.error("Error updating status:", error)
      }
    },
    [selectedOrder, editingStatus, updateOrderStatus, getOrderStatuses, refreshOrders],
  )

  const handleDeleteStatus = useCallback(
    async (statusId: number) => {
      if (!selectedOrder) return

      if (window.confirm("Bạn có chắc chắn muốn xóa trạng thái này?")) {
        try {
          await deleteOrderStatus(selectedOrder.orderId, statusId)
          // Refresh statuses
          const updatedStatuses = await getOrderStatuses(selectedOrder.orderId)
          setOrderStatuses(updatedStatuses)
          // Refresh orders list
          refreshOrders()
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi xóa trạng thái"
          alert(`Lỗi: ${errorMessage}`)
          console.error("Error deleting status:", error)
        }
      }
    },
    [selectedOrder, deleteOrderStatus, getOrderStatuses, refreshOrders],
  )

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString("vi-VN")
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  // Sửa lại phần tính toán stats để đếm theo enum OrderStatusEnum
  // Calculate stats - đếm theo enum OrderStatusEnum
  const stats = {
    total: totalCount,
    pending: orders.filter((o) => o.currentStatus === OrderStatusEnum.Pending).length,
    confirmed: orders.filter((o) => o.currentStatus === OrderStatusEnum.Confirmed).length,
    delivering: orders.filter((o) => o.currentStatus === OrderStatusEnum.Delivering).length,
    delivered: orders.filter((o) => o.currentStatus === OrderStatusEnum.Delivered).length,
  }

  // Calculate total pages for pagination
  const totalPages = Math.ceil(totalCount / pageSize)

  const handleAddNewStatus = useCallback(() => {
    setEditingStatus(undefined)
    setShowStatusForm(true)
  }, [])

  return (
    <div className="page-container">
      {/* Enhanced Header */}
      <div className="orders-header">
        <div className="header-content">
          <div className="header-title">
            <h1>
              <span className="title-icon">📦</span>
              Quản lý Đơn hàng
            </h1>
            <p className="header-subtitle">Theo dõi và quản lý tất cả đơn hàng của cửa hàng nhạc cụ</p>
          </div>
          <div className="header-stats">
            <div className="quick-stat">
              <span className="stat-number">{totalCount}</span>
              <span className="stat-label">Tổng đơn hàng</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <span className="error-message">{error}</span>
            <button className="error-retry-btn" onClick={refreshOrders}>
              Thử lại
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Order Statistics */}
      <div className="orders-stats-section">
        <h2 className="section-title">
          <span className="section-icon">📊</span>
          Thống kê đơn hàng
        </h2>
        <div className="order-stats">
          <div className="order-stat total-stat">
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <div className="stat-number">{stats.total}</div>
              <span className="stat-label">Tổng đơn hàng</span>
            </div>
            <div className="stat-trend">
              <span className="trend-indicator positive">↗</span>
            </div>
          </div>
          <div className="order-stat pending-stat">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <div className="stat-number">{stats.pending}</div>
              <span className="stat-label">Chờ xử lý</span>
            </div>
            <div className="stat-percentage">
              {stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}%
            </div>
          </div>
          <div className="order-stat confirmed-stat">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-number">{stats.confirmed}</div>
              <span className="stat-label">Đã xác nhận</span>
            </div>
            <div className="stat-percentage">
              {stats.total > 0 ? Math.round((stats.confirmed / stats.total) * 100) : 0}%
            </div>
          </div>
          <div className="order-stat delivering-stat">
            <div className="stat-icon">🚚</div>
            <div className="stat-content">
              <div className="stat-number">{stats.delivering}</div>
              <span className="stat-label">Đang giao</span>
            </div>
            <div className="stat-percentage">
              {stats.total > 0 ? Math.round((stats.delivering / stats.total) * 100) : 0}%
            </div>
          </div>
          <div className="order-stat delivered-stat">
            <div className="stat-icon">🎉</div>
            <div className="stat-content">
              <div className="stat-number">{stats.delivered}</div>
              <span className="stat-label">Đã giao</span>
            </div>
            <div className="stat-percentage">
              {stats.total > 0 ? Math.round((stats.delivered / stats.total) * 100) : 0}%
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Actions and Filters */}
      <div className="orders-controls">
        <div className="controls-left">
          <button className="btn-refresh" onClick={refreshOrders} disabled={loading}>
            <span className="btn-icon">{loading ? "⏳" : "🔄"}</span>
            <span className="btn-text">{loading ? "Đang tải..." : "Làm mới"}</span>
          </button>
        </div>
        <div className="controls-right">
          <div className="filter-group">
            <label htmlFor="status-filter" className="filter-label">
              Lọc theo trạng thái:
            </label>
            <select
              id="status-filter"
              className="filter-select"
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value as OrderStatusEnum | "")}
            >
              <option value="">Tất cả trạng thái</option>
              <option value={OrderStatusEnum.Pending}>{getOrderStatusLabel(OrderStatusEnum.Pending)}</option>
              <option value={OrderStatusEnum.Confirmed}>{getOrderStatusLabel(OrderStatusEnum.Confirmed)}</option>
              <option value={OrderStatusEnum.Delivering}>{getOrderStatusLabel(OrderStatusEnum.Delivering)}</option>
              <option value={OrderStatusEnum.Delivered}>{getOrderStatusLabel(OrderStatusEnum.Delivered)}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Enhanced Orders Table */}
      <div className="orders-table-section">
        <div className="table-header">
          <h3 className="table-title">
            <span className="table-icon">📋</span>
            Danh sách đơn hàng
          </h3>
          <div className="table-info">
            Hiển thị {orders.length} trong tổng số {totalCount} đơn hàng
          </div>
        </div>

        <div className="table-container">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner">⏳</div>
              <p>Đang tải dữ liệu đơn hàng...</p>
            </div>
          ) : (
            <table className="data-table orders-table">
              <thead>
                <tr>
                  <th>Mã đơn hàng</th>
                  <th>Khách hàng</th>
                  <th>Ngày đặt</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Thanh toán</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.orderId} className="order-row">
                    <td>
                      <span className="order-id">#{order.orderId}</span>
                    </td>
                    <td>
                      <div className="customer-info">
                        <div className="customer-name">{order.customerName || `Khách hàng #${order.userId}`}</div>
                        <small className="customer-address">{order.billingAddress}</small>
                      </div>
                    </td>
                    <td>
                      <div className="date-info">
                        <span className="date-main">{formatDate(order.orderDate)}</span>
                      </div>
                    </td>
                    <td>
                      <span className="price-amount">{formatCurrency(order.totalAmount)}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${getOrderStatusClass(order.currentStatus || 1)}`}>
                        {getOrderStatusLabel(order.currentStatus || 1)}
                      </span>
                    </td>
                    <td>
                      <span className="payment-method">{order.paymentMethod}</span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-action btn-view"
                          title="Xem chi tiết"
                          onClick={() => handleViewOrder(order)}
                        >
                          <span className="action-icon">👁️</span>
                          <span className="action-text">Xem</span>
                        </button>
                        <button
                          className="btn-action btn-manage"
                          title="Quản lý trạng thái"
                          onClick={() => handleManageStatus(order)}
                        >
                          <span className="action-icon">📋</span>
                          <span className="action-text">Quản lý</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!loading && orders.length === 0 && (
            <div className="no-results">
              <div className="no-results-icon">📦</div>
              <h3>Không có đơn hàng nào</h3>
              <p>Chưa có đơn hàng nào được tạo hoặc không có đơn hàng nào phù hợp với bộ lọc hiện tại.</p>
            </div>
          )}
        </div>

        {/* Enhanced Pagination */}
        {totalPages > 1 && (
          <div className="pagination-container">
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                ← Trước
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }

                return (
                  <button
                    key={pageNum}
                    className={`pagination-btn ${currentPage === pageNum ? "active" : ""}`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                )
              })}

              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                Sau →
              </button>
            </div>
            <div className="pagination-info">
              Trang {currentPage} / {totalPages} - Tổng {totalCount} đơn hàng
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal - Keep existing modal code */}
      {isOrderDetailsOpen && selectedOrder && (
        <div className="modal-overlay" onClick={() => setIsOrderDetailsOpen(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi tiết đơn hàng #{selectedOrder.orderId}</h2>
              <button className="modal-close" onClick={() => setIsOrderDetailsOpen(false)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="order-details">
                {/* Order Information */}
                <div className="order-info">
                  <div className="info-row">
                    <span className="label">Mã đơn hàng:</span>
                    <span className="value">#{selectedOrder.orderId}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Khách hàng:</span>
                    <span className="value">{selectedOrder.customerName || `User #${selectedOrder.userId}`}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Ngày đặt:</span>
                    <span className="value">{formatDate(selectedOrder.orderDate)}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Địa chỉ giao hàng:</span>
                    <span className="value">{selectedOrder.billingAddress}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Phương thức thanh toán:</span>
                    <span className="value">{selectedOrder.paymentMethod}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Trạng thái hiện tại:</span>
                    <span className={`status ${getOrderStatusClass(selectedOrder.currentStatus || 1)}`}>
                      {getOrderStatusLabel(selectedOrder.currentStatus || 1)}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                {selectedOrder.orderDetails && selectedOrder.orderDetails.length > 0 && (
                  <div className="order-items">
                    <h3>Sản phẩm đã đặt</h3>
                    <table className="items-table">
                      <thead>
                        <tr>
                          <th>Sản phẩm</th>
                          <th>Số lượng</th>
                          <th>Đơn giá</th>
                          <th>Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.orderDetails.map((item, index) => (
                          <tr key={index}>
                            <td>{item.productName || `Product #${item.productId}`}</td>
                            <td>{item.quantity}</td>
                            <td>{formatCurrency(item.unitPrice)}</td>
                            <td>{formatCurrency(item.unitPrice * item.quantity)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Order Total */}
                <div className="order-total">
                  <div className="total-row">
                    <span className="label">Tổng cộng:</span>
                    <span className="value">{formatCurrency(selectedOrder.totalAmount)}</span>
                  </div>
                </div>

                {/* Status History */}
                <div className="status-history">
                  <h3>Lịch sử trạng thái</h3>
                  {orderStatuses.length > 0 ? (
                    <div className="status-timeline">
                      {orderStatuses.map((status, index) => (
                        <div key={status.orderStatusID} className={`timeline-item ${index === 0 ? "current" : ""}`}>
                          <div className="timeline-marker">
                            <div className={`status-dot ${getOrderStatusClass(status.status)}`}></div>
                          </div>
                          <div className="timeline-content">
                            <div className="status-info">
                              <span className={`status-badge ${getOrderStatusClass(status.status)}`}>
                                {getOrderStatusLabel(status.status)}
                              </span>
                              <span className="status-time">{formatDate(status.updatedAt)}</span>
                            </div>
                            <p className="status-description">{status.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-status">Chưa có l��ch sử trạng thái</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Management Modal */}
      {isStatusModalOpen && selectedOrder && !editingStatus && (
        <div className="modal-overlay" onClick={() => setIsStatusModalOpen(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Quản lý trạng thái đơn hàng #{selectedOrder.orderId}</h2>
              <button className="modal-close" onClick={() => setIsStatusModalOpen(false)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              {/* Status History */}
              <div className="status-history-section">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  <h3>Lịch sử trạng thái</h3>
                  <button className="btn-primary" onClick={handleAddNewStatus}>
                    ➕ Thêm trạng thái mới
                  </button>
                </div>

                {orderStatuses.length > 0 ? (
                  <div className="status-timeline">
                    {orderStatuses.map((status, index) => (
                      <div key={status.orderStatusID} className={`timeline-item ${index === 0 ? "current" : ""}`}>
                        <div className="timeline-marker">
                          <div className={`status-dot ${getOrderStatusClass(status.status)}`}></div>
                        </div>
                        <div className="timeline-content">
                          <div className="status-info">
                            <span className={`status-badge ${getOrderStatusClass(status.status)}`}>
                              {getOrderStatusLabel(status.status)}
                            </span>
                            <span className="status-time">{formatDate(status.updatedAt)}</span>
                            <div className="action-buttons">
                              <button className="btn-edit" title="Chỉnh sửa" onClick={() => setEditingStatus(status)}>
                                ✏️
                              </button>
                              <button
                                className="btn-delete"
                                title="Xóa"
                                onClick={() => handleDeleteStatus(status.orderStatusID)}
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                          <p className="status-description">{status.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-status">
                    <p>Chưa có lịch sử trạng thái</p>
                    <button className="btn-primary" onClick={handleAddNewStatus}>
                      ➕ Thêm trạng thái đầu tiên
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Form Modal - This shows when adding/editing */}
      {showStatusForm && selectedOrder && (
        <OrderStatusModal
          isOpen={true}
          onClose={() => {
            setShowStatusForm(false)
            setEditingStatus(undefined)
          }}
          onSave={handleCreateStatus}
          status={undefined}
          orderId={selectedOrder.orderId}
          isEditing={false}
        />
      )}

      {/* Edit Status Modal */}
      {editingStatus && selectedOrder && (
        <OrderStatusModal
          isOpen={true}
          onClose={() => {
            setEditingStatus(undefined)
          }}
          onSave={handleUpdateStatus}
          status={editingStatus}
          orderId={selectedOrder.orderId}
          isEditing={true}
        />
      )}
    </div>
  )
}

export default Orders
