"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { OrderStatusResponseDto, OrderStatusEnum } from "../types/dto"
import { getOrderStatusLabel } from "../types/dto"

interface OrderStatusModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (statusData: any) => Promise<void>
  status?: OrderStatusResponseDto
  orderId: number
  isEditing: boolean
}

const OrderStatusModal: React.FC<OrderStatusModalProps> = ({ isOpen, onClose, onSave, status, orderId, isEditing }) => {
  console.log("OrderStatusModal render:", { isOpen, isEditing, orderId, status }) // Debug log

  const [formData, setFormData] = useState({
    status: 1 as OrderStatusEnum,
    description: "",
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // Reset form when modal opens/closes or status changes
  useEffect(() => {
    if (isOpen) {
      if (isEditing && status) {
        setFormData({
          status: status.status,
          description: status.description || "",
        })
      } else {
        setFormData({
          status: 1,
          description: "",
        })
      }
      setErrors({})
    }
  }, [isOpen, isEditing, status])

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.description.trim()) {
      newErrors.description = "Mô tả trạng thái là bắt buộc"
    } else if (formData.description.length > 500) {
      newErrors.description = "Mô tả không được vượt quá 500 ký tự"
    }

    if (!formData.status || ![1, 2, 3, 4].includes(formData.status)) {
      newErrors.status = "Vui lòng chọn trạng thái hợp lệ"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const submitData = {
        status: formData.status,
        description: formData.description.trim(),
      }

      await onSave(submitData)
      onClose()
    } catch (error) {
      console.error("Error saving status:", error)
      setErrors({
        submit: error instanceof Error ? error.message : "Có lỗi xảy ra khi lưu trạng thái",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }))
    }
  }

  if (!isOpen) {
    console.log("Modal not open, returning null") // Debug log
    return null
  }

  console.log("Modal is rendering with data:", { orderId, isEditing, status }) // Debug log

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {isEditing ? "Chỉnh sửa trạng thái" : "Thêm trạng thái mới"}
            <span className="order-id-badge">#{orderId}</span>
          </h2>
          <button className="modal-close" onClick={onClose} disabled={loading}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {errors.submit && (
            <div className="error-banner">
              <div className="error-content">
                <span className="error-icon">⚠️</span>
                <span className="error-message">{errors.submit}</span>
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="status" className="form-label">
              <span className="label-text">Trạng thái đơn hàng</span>
              <span className="required-indicator">*</span>
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleInputChange("status", Number.parseInt(e.target.value) as OrderStatusEnum)}
              className={`form-select ${errors.status ? "error" : ""}`}
              disabled={loading}
            >
              <option value={1}>{getOrderStatusLabel(1)}</option>
              <option value={2}>{getOrderStatusLabel(2)}</option>
              <option value={3}>{getOrderStatusLabel(3)}</option>
              <option value={4}>{getOrderStatusLabel(4)}</option>
            </select>
            {errors.status && <span className="error-text">{errors.status}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              <span className="label-text">Mô tả chi tiết</span>
              <span className="required-indicator">*</span>
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className={`form-textarea ${errors.description ? "error" : ""}`}
              placeholder="Nhập mô tả chi tiết về trạng thái đơn hàng..."
              rows={4}
              maxLength={500}
              disabled={loading}
            />
            <div className="textarea-footer">
              <span className={`char-count ${formData.description.length > 450 ? "warning" : ""}`}>
                {formData.description.length}/500 ký tự
              </span>
            </div>
            {errors.description && <span className="error-text">{errors.description}</span>}
          </div>

          {/* Status Preview */}
          <div className="status-preview">
            <h4 className="preview-title">Xem trước trạng thái:</h4>
            <div className="preview-content">
              <span className={`status-badge ${getStatusClass(formData.status)}`}>
                {getOrderStatusLabel(formData.status)}
              </span>
              <span className="preview-description">{formData.description || "Chưa có mô tả"}</span>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Hủy bỏ
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="loading-spinner">⏳</span>
                  Đang lưu...
                </>
              ) : (
                <>
                  <span className="save-icon">💾</span>
                  {isEditing ? "Cập nhật" : "Thêm mới"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Helper function to get status CSS class
const getStatusClass = (status: OrderStatusEnum): string => {
  switch (status) {
    case 1:
      return "status-pending"
    case 2:
      return "status-confirmed"
    case 3:
      return "status-delivering"
    case 4:
      return "status-delivered"
    default:
      return "status-unknown"
  }
}

export default OrderStatusModal
