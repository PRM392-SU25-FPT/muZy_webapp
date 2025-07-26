"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import type { StoreLocationDto } from "../types/dto"
import StoreLocationModal from "./StoreLocationModal"
import { useStoreLocations } from "../hooks/useStoreLocations"

const StoreLocations: React.FC = () => {
  const { locations, totalCount, loading, error, fetchLocations, createLocation, updateLocation, deleteLocation } =
    useStoreLocations()

  // Modal states
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<StoreLocationDto | undefined>()

  // Search state
  const [searchTerm, setSearchTerm] = useState("")
  const [initialized, setInitialized] = useState(false)

  // Load locations only once on component mount
  useEffect(() => {
    if (!initialized) {
      fetchLocations()
      setInitialized(true)
    }
  }, [fetchLocations, initialized])

  const handleCreateLocation = useCallback(
    async (locationData: any) => {
      try {
        await createLocation(locationData)
        // Refresh locations after creation
        await fetchLocations()
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi tạo vị trí cửa hàng"
        alert(`Lỗi: ${errorMessage}`)
        console.error("Error creating location:", error)
      }
    },
    [createLocation, fetchLocations],
  )

  const handleUpdateLocation = useCallback(
    async (locationData: any) => {
      try {
        if (editingLocation) {
          await updateLocation(editingLocation.locationID, locationData)
          // Refresh locations after update
          await fetchLocations()
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi cập nhật vị trí cửa hàng"
        alert(`Lỗi: ${errorMessage}`)
        console.error("Error updating location:", error)
      }
    },
    [editingLocation, updateLocation, fetchLocations],
  )

  const handleDeleteLocation = useCallback(
    async (locationId: number) => {
      if (window.confirm("Bạn có chắc chắn muốn xóa vị trí cửa hàng này?")) {
        try {
          await deleteLocation(locationId)
          // Refresh locations after deletion
          await fetchLocations()
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi xóa vị trí cửa hàng"
          alert(`Lỗi: ${errorMessage}`)
          console.error("Error deleting location:", error)
        }
      }
    },
    [deleteLocation, fetchLocations],
  )

  // Filter locations based on search term
  const filteredLocations = locations.filter((location) =>
    location.address.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatCoordinate = (value: number, type: "lat" | "lng") => {
    const direction = type === "lat" ? (value >= 0 ? "N" : "S") : value >= 0 ? "E" : "W"
    return `${Math.abs(value).toFixed(6)}° ${direction}`
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Quản lý Vị trí Cửa hàng</h1>
        <p>Quản lý các vị trí cửa hàng ({totalCount} vị trí)</p>
      </div>

      {error && (
        <div className="error-banner">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <span className="error-message">{error}</span>
            <button className="error-retry-btn" onClick={() => fetchLocations()}>
              Thử lại
            </button>
          </div>
        </div>
      )}

      <div className="page-actions">
        <button
          className="btn-primary"
          onClick={() => {
            setEditingLocation(undefined)
            setIsLocationModalOpen(true)
          }}
        >
          <span>➕</span>
          Thêm vị trí mới
        </button>
        <button className="btn-secondary" onClick={() => fetchLocations()} disabled={loading}>
          <span>{loading ? "⏳" : "🔄"}</span>
          {loading ? "Đang tải..." : "Làm mới"}
        </button>
      </div>

      {/* Search */}
      <div className="filters-section">
        <div className="filters-row">
          <div className="search-box">
            <input
              type="text"
              placeholder="Tìm kiếm địa chỉ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>
      </div>

      {/* Locations Table */}
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
                <th>ID</th>
                <th>Địa chỉ</th>
                <th>Vĩ độ</th>
                <th>Kinh độ</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredLocations.map((location) => (
                <tr key={location.locationID}>
                  <td>
                    <span className="location-id">#{location.locationID}</span>
                  </td>
                  <td>
                    <div className="location-address">
                      <span className="address-text">{location.address}</span>
                    </div>
                  </td>
                  <td>
                    <span className="coordinate">{formatCoordinate(location.latitude, "lat")}</span>
                  </td>
                  <td>
                    <span className="coordinate">{formatCoordinate(location.longitude, "lng")}</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        title="Chỉnh sửa"
                        onClick={() => {
                          setEditingLocation(location)
                          setIsLocationModalOpen(true)
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-delete"
                        title="Xóa"
                        onClick={() => handleDeleteLocation(location.locationID)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && filteredLocations.length === 0 && (
          <div className="no-results">
            <p>
              {searchTerm ? `Không tìm thấy vị trí nào với từ khóa "${searchTerm}"` : "Chưa có vị trí cửa hàng nào"}
            </p>
          </div>
        )}
      </div>

      {/* Location Statistics */}
      <div className="location-stats">
        <div className="stat-card">
          <div className="stat-icon">📍</div>
          <div className="stat-content">
            <h3>Tổng số vị trí</h3>
            <p className="stat-number">{totalCount}</p>
            <span className="stat-label">Cửa hàng</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔍</div>
          <div className="stat-content">
            <h3>Đang hiển thị</h3>
            <p className="stat-number">{filteredLocations.length}</p>
            <span className="stat-label">Kết quả</span>
          </div>
        </div>
      </div>

      {/* Location Modal */}
      <StoreLocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSave={editingLocation ? handleUpdateLocation : handleCreateLocation}
        location={editingLocation}
      />
    </div>
  )
}

export default StoreLocations
