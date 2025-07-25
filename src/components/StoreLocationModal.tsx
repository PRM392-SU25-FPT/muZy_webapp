"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import type { StoreLocationDto, StoreLocationCreateRequest, StoreLocationUpdateRequest } from "../types/dto"

interface StoreLocationModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (location: StoreLocationCreateRequest | StoreLocationUpdateRequest) => void
  location?: StoreLocationDto
  onMapClick?: (lat: number, lng: number) => void
}

const StoreLocationModal: React.FC<StoreLocationModalProps> = ({ isOpen, onClose, onSave, location, onMapClick }) => {
  const [formData, setFormData] = useState<StoreLocationCreateRequest>({
    latitude: 0,
    longitude: 0,
    address: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  useEffect(() => {
    if (location) {
      setFormData({
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
      })
    } else {
      setFormData({
        latitude: 0,
        longitude: 0,
        address: "",
      })
    }
    setErrors({})
  }, [location, isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.address.trim()) {
      newErrors.address = "Địa chỉ là bắt buộc"
    } else if (formData.address.length > 255) {
      newErrors.address = "Địa chỉ không được vượt quá 255 ký tự"
    }

    if (formData.latitude === 0) {
      newErrors.latitude = "Vĩ độ là bắt buộc"
    } else if (formData.latitude < -90 || formData.latitude > 90) {
      newErrors.latitude = "Vĩ độ phải từ -90 đến 90"
    }

    if (formData.longitude === 0) {
      newErrors.longitude = "Kinh độ là bắt buộc"
    } else if (formData.longitude < -180 || formData.longitude > 180) {
      newErrors.longitude = "Kinh độ phải từ -180 đến 180"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      if (location) {
        onSave({ ...formData, locationID: location.locationID } as StoreLocationUpdateRequest)
      } else {
        onSave(formData)
      }
      onClose()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "latitude" || name === "longitude" ? Number.parseFloat(value) || 0 : value,
    }))
  }

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Trình duyệt không hỗ trợ định vị")
      return
    }

    setIsGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setFormData((prev) => ({
          ...prev,
          latitude: Number.parseFloat(latitude.toFixed(6)),
          longitude: Number.parseFloat(longitude.toFixed(6)),
        }))
        setIsGettingLocation(false)
      },
      (error) => {
        console.error("Error getting location:", error)
        alert("Không thể lấy vị trí hiện tại")
        setIsGettingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    )
  }, [])

  const handleMapClick = useCallback(() => {
    if (onMapClick) {
      onMapClick(formData.latitude, formData.longitude)
    }
  }, [formData.latitude, formData.longitude, onMapClick])

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{location ? "Chỉnh sửa vị trí cửa hàng" : "Thêm vị trí cửa hàng mới"}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="address">Địa chỉ *</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={errors.address ? "error" : ""}
              maxLength={255}
              rows={3}
              placeholder="Nhập địa chỉ cửa hàng"
            />
            {errors.address && <span className="error-text">{errors.address}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="latitude">Vĩ độ (Latitude) *</label>
              <input
                type="number"
                id="latitude"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                className={errors.latitude ? "error" : ""}
                step="0.000001"
                min="-90"
                max="90"
                placeholder="10.762622"
              />
              {errors.latitude && <span className="error-text">{errors.latitude}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="longitude">Kinh độ (Longitude) *</label>
              <input
                type="number"
                id="longitude"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                className={errors.longitude ? "error" : ""}
                step="0.000001"
                min="-180"
                max="180"
                placeholder="106.660172"
              />
              {errors.longitude && <span className="error-text">{errors.longitude}</span>}
            </div>
          </div>

          <div className="location-actions">
            <button type="button" className="btn-secondary" onClick={getCurrentLocation} disabled={isGettingLocation}>
              <span>{isGettingLocation ? "⏳" : "📍"}</span>
              {isGettingLocation ? "Đang lấy vị trí..." : "Lấy vị trí hiện tại"}
            </button>

            {formData.latitude !== 0 && formData.longitude !== 0 && (
              <button type="button" className="btn-secondary" onClick={handleMapClick}>
                <span>🗺️</span>
                Xem trên bản đồ
              </button>
            )}
          </div>

          <div className="coordinate-info">
            <small>💡 Bạn có thể lấy tọa độ từ Google Maps bằng cách nhấp chuột phải vào vị trí và chọn tọa độ</small>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn-primary">
              {location ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StoreLocationModal
