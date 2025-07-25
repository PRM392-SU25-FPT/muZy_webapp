"use client"

import type React from "react"
import { useState } from "react"
import type { StoreLocationDto } from "../types/dto"

interface SimpleMapProps {
  locations: StoreLocationDto[]
  selectedLocation?: StoreLocationDto | null
  onLocationSelect?: (location: StoreLocationDto) => void
}

const SimpleMap: React.FC<SimpleMapProps> = ({ locations, selectedLocation, onLocationSelect }) => {
  const [mapType, setMapType] = useState<"roadmap" | "satellite">("roadmap")

  const formatCoordinate = (value: number, type: "lat" | "lng") => {
    const direction = type === "lat" ? (value >= 0 ? "N" : "S") : value >= 0 ? "E" : "W"
    return `${Math.abs(value).toFixed(6)}° ${direction}`
  }

  const getGoogleMapsUrl = (location: StoreLocationDto) => {
    return `https://www.google.com/maps?q=${location.latitude},${location.longitude}&z=15`
  }

  const getStaticMapUrl = () => {
    if (locations.length === 0) return ""

    const markers = locations.map((loc) => `markers=color:red%7C${loc.latitude},${loc.longitude}`).join("&")

    const center =
      locations.length === 1 ? `${locations[0].latitude},${locations[0].longitude}` : "10.762622,106.660172" // Ho Chi Minh City default

    // Note: You'll need to replace YOUR_API_KEY with actual Google Maps API key
    return `https://maps.googleapis.com/maps/api/staticmap?center=${center}&zoom=12&size=600x400&maptype=${mapType}&${markers}&key=YOUR_API_KEY`
  }

  return (
    <div className="simple-map-container">
      <div className="map-controls">
        <div className="map-type-selector">
          <button
            className={`map-type-btn ${mapType === "roadmap" ? "active" : ""}`}
            onClick={() => setMapType("roadmap")}
          >
            🗺️ Bản đồ
          </button>
          <button
            className={`map-type-btn ${mapType === "satellite" ? "active" : ""}`}
            onClick={() => setMapType("satellite")}
          >
            🛰️ Vệ tinh
          </button>
        </div>
      </div>

      <div className="map-content">
        {locations.length > 0 ? (
          <div className="static-map">
            <img
              src={getStaticMapUrl() || "/placeholder.svg"}
              alt="Bản đồ các cửa hàng"
              className="map-image"
              onError={(e) => {
                // Fallback to a placeholder when API key is not available
                e.currentTarget.src = "/placeholder.svg?height=400&width=600&text=Bản đồ cửa hàng"
              }}
            />
          </div>
        ) : (
          <div className="no-locations">
            <div className="no-locations-content">
              <span className="no-locations-icon">📍</span>
              <p>Chưa có vị trí cửa hàng nào</p>
              <small>Thêm vị trí đầu tiên để hiển thị trên bản đồ</small>
            </div>
          </div>
        )}
      </div>

      <div className="locations-list">
        <h3>Danh sách vị trí ({locations.length})</h3>
        <div className="locations-grid">
          {locations.map((location) => (
            <div
              key={location.locationID}
              className={`location-card ${selectedLocation?.locationID === location.locationID ? "selected" : ""}`}
              onClick={() => onLocationSelect?.(location)}
            >
              <div className="location-info">
                <h4>Cửa hàng #{location.locationID}</h4>
                <p className="location-address">{location.address}</p>
                <div className="coordinates">
                  <span>{formatCoordinate(location.latitude, "lat")}</span>
                  <span>{formatCoordinate(location.longitude, "lng")}</span>
                </div>
              </div>
              <div className="location-actions">
                <a
                  href={getGoogleMapsUrl(location)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="view-on-maps-btn"
                  onClick={(e) => e.stopPropagation()}
                >
                  🗺️ Xem trên Google Maps
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SimpleMap
