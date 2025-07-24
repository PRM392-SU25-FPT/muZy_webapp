"use client";

import type React from "react";
import { useState, useEffect } from "react";
import type { OrderResponseDTO } from "../types/dto";
import { useOrders } from "../hooks/useOrders";

const Orders: React.FC = () => {
  const { orders, loading, fetchOrders, updateOrderStatus } = useOrders();

  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<OrderResponseDTO | null>(
    null
  );
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Mock data - replace with actual API calls
  // const mockOrders: OrderResponseDTO[] = [
  //   {
  //     orderId: 12345,
  //     userId: 1,
  //     customerName: "Nguyễn Văn A",
  //     orderDate: new Date("2024-01-15"),
  //     totalAmount: 3200000,
  //     status: "pending",
  //     orderDetails: [
  //       {
  //         orderDetailId: 1,
  //         orderId: 12345,
  //         productId: 1,
  //         productName: "Guitar Acoustic Yamaha",
  //         quantity: 1,
  //         unitPrice: 2500000,
  //       },
  //       {
  //         orderDetailId: 2,
  //         orderId: 12345,
  //         productId: 4,
  //         productName: "Dây đàn guitar",
  //         quantity: 2,
  //         unitPrice: 350000,
  //       },
  //     ],
  //   },
  //   {
  //     orderId: 12346,
  //     userId: 2,
  //     customerName: "Trần Thị B",
  //     orderDate: new Date("2024-01-14"),
  //     totalAmount: 8900000,
  //     status: "confirmed",
  //     orderDetails: [
  //       {
  //         orderDetailId: 3,
  //         orderId: 12346,
  //         productId: 2,
  //         productName: "Piano Điện Casio",
  //         quantity: 1,
  //         unitPrice: 8900000,
  //       },
  //     ],
  //   },
  //   {
  //     orderId: 12347,
  //     userId: 3,
  //     customerName: "Lê Văn C",
  //     orderDate: new Date("2024-01-13"),
  //     totalAmount: 1800000,
  //     status: "shipped",
  //     orderDetails: [
  //       {
  //         orderDetailId: 4,
  //         orderId: 12347,
  //         productId: 4,
  //         productName: "Violin 4/4",
  //         quantity: 1,
  //         unitPrice: 1800000,
  //       },
  //     ],
  //   },
  //   {
  //     orderId: 12348,
  //     userId: 4,
  //     customerName: "Phạm Thị D",
  //     orderDate: new Date("2024-01-12"),
  //     totalAmount: 12000000,
  //     status: "delivered",
  //     orderDetails: [
  //       {
  //         orderDetailId: 5,
  //         orderId: 12348,
  //         productId: 3,
  //         productName: "Trống Jazz Pearl",
  //         quantity: 1,
  //         unitPrice: 12000000,
  //       },
  //     ],
  //   },
  // ]

  useEffect(() => {
    fetchOrders({ status: filterStatus });
  }, [filterStatus, fetchOrders]);

  // const loadOrders = async () => {
  //   setLoading(true)
  //   try {
  //     // Simulate API call
  //     await new Promise((resolve) => setTimeout(resolve, 500))
  //     setOrders(mockOrders)
  //   } catch (error) {
  //     console.error("Error loading orders:", error)
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: "Chờ xử lý",
      confirmed: "Đã xác nhận",
      shipped: "Đang giao",
      delivered: "Đã giao",
      cancelled: "Đã hủy",
    };
    return statusMap[status] || status;
  };

  const getStatusStats = () => {
    const stats = {
      pending: orders.filter((o) => o.status === "pending").length,
      confirmed: orders.filter((o) => o.status === "confirmed").length,
      shipped: orders.filter((o) => o.status === "shipped").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
    };
    return stats;
  };

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleViewOrderDetails = (order: OrderResponseDTO) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const filteredOrders =
    filterStatus === "all"
      ? orders
      : orders.filter((order) => order.status === filterStatus);
  const stats = getStatusStats();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Đơn hàng</h1>
        <p>Quản lý đơn hàng và giao dịch ({orders.length} đơn hàng)</p>
      </div>

      <div className="order-stats">
        <div className="order-stat">
          <span className="stat-icon">⏳</span>
          <div>
            <p className="stat-number">{stats.pending}</p>
            <span>Chờ xử lý</span>
          </div>
        </div>
        <div className="order-stat">
          <span className="stat-icon">✅</span>
          <div>
            <p className="stat-number">{stats.confirmed}</p>
            <span>Đã xác nhận</span>
          </div>
        </div>
        <div className="order-stat">
          <span className="stat-icon">🚚</span>
          <div>
            <p className="stat-number">{stats.shipped}</p>
            <span>Đang giao</span>
          </div>
        </div>
        <div className="order-stat">
          <span className="stat-icon">📦</span>
          <div>
            <p className="stat-number">{stats.delivered}</p>
            <span>Đã giao</span>
          </div>
        </div>
      </div>

      <div className="filter-section">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="status-filter"
        >
          <option value="all">Tất cả đơn hàng</option>
          <option value="pending">Chờ xử lý</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="shipped">Đang giao</option>
          <option value="delivered">Đã giao</option>
        </select>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner">⏳</div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã đơn hàng</th>
                <th>Khách hàng</th>
                <th>Ngày đặt</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.orderId}>
                  <td className="order-id">#{order.orderId}</td>
                  <td>{order.customerName}</td>
                  <td>{formatDate(order.orderDate)}</td>
                  <td className="price">{formatPrice(order.totalAmount)}</td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusUpdate(order.orderId, e.target.value)
                      }
                      className={`status-select status-${order.status}`}
                    >
                      <option value="pending">Chờ xử lý</option>
                      <option value="confirmed">Đã xác nhận</option>
                      <option value="shipped">Đang giao</option>
                      <option value="delivered">Đã giao</option>
                      <option value="cancelled">Đã hủy</option>
                    </select>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-view"
                        title="Xem chi tiết"
                        onClick={() => handleViewOrderDetails(order)}
                      >
                        👁️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && filteredOrders.length === 0 && (
          <div className="no-results">
            <p>Không có đơn hàng nào</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div
          className="modal-overlay"
          onClick={() => setShowOrderDetails(false)}
        >
          <div
            className="modal-content large"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Chi tiết đơn hàng #{selectedOrder.orderId}</h2>
              <button
                className="modal-close"
                onClick={() => setShowOrderDetails(false)}
              >
                ×
              </button>
            </div>

            <div className="order-details">
              <div className="order-info">
                <div className="info-row">
                  <span className="label">Khách hàng:</span>
                  <span className="value">{selectedOrder.customerName}</span>
                </div>
                <div className="info-row">
                  <span className="label">Ngày đặt:</span>
                  <span className="value">
                    {formatDate(selectedOrder.orderDate)}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Trạng thái:</span>
                  <span className={`status status-${selectedOrder.status}`}>
                    {getStatusLabel(selectedOrder.status)}
                  </span>
                </div>
              </div>

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
                    {selectedOrder.orderDetails?.map((item) => (
                      <tr key={item.orderDetailId}>
                        <td>{item.productName}</td>
                        <td>{item.quantity}</td>
                        <td>{formatPrice(item.unitPrice)}</td>
                        <td>{formatPrice(item.quantity * item.unitPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="order-total">
                <div className="total-row">
                  <span className="label">Tổng cộng:</span>
                  <span className="value">
                    {formatPrice(selectedOrder.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowOrderDetails(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
