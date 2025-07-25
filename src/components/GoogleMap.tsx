"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import type { StoreLocationDto } from "../types/dto"

// Declare global google types
declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

interface GoogleMapProps {
  locations: StoreLocationDto[]
  center?: { lat: number; lng: number }
  zoom?: number
  height?: string
  onMapClick?: (lat: number, lng: number) => void
  selectedLocation?: StoreLocationDto | null
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  locations,
  center = { lat: 10.762622, lng: 106.660172 }, // Ho Chi Minh City
  zoom = 12,
  height = "400px",
  onMapClick,
  selectedLocation,
}) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setIsLoaded(true)
        return
      }

      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        // Script is already loading
        const checkLoaded = () => {
          if (window.google && window.google.maps) {
            setIsLoaded(true)
          } else {
            setTimeout(checkLoaded, 100)
          }
        }
        checkLoaded()
        return
      }

      const script = document.createElement("script")
      // Replace YOUR_GOOGLE_MAPS_API_KEY with your actual API key
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dOWTgHz-TvSFQ4&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => setIsLoaded(true)
      script.onerror = () => setError("Không thể tải Google Maps API")
      document.head.appendChild(script)
    }

    loadGoogleMaps()
  }, [])

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.google) return

    try {
      const map = new window.google.maps.Map(mapRef.current, {
        center,
        zoom,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        streetViewControl: false,
        mapTypeControl: true,
        fullscreenControl: true,
        zoomControl: true,
      })

      mapInstanceRef.current = map

      // Add click listener if onMapClick is provided
      if (onMapClick) {
        map.addListener("click", (event: any) => {
          if (event.latLng) {
            const lat = event.latLng.lat()
            const lng = event.latLng.lng()
            onMapClick(lat, lng)
          }
        })
      }
    } catch (err) {
      console.error("Error initializing map:", err)
      setError("Không thể khởi tạo bản đồ")
    }
  }, [isLoaded, center, zoom, onMapClick])

  // Update markers when locations change
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded || !window.google) return

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current = []

    // Add new markers
    locations.forEach((location) => {
      const marker = new window.google.maps.Marker({
        position: { lat: location.latitude, lng: location.longitude },
        map: mapInstanceRef.current,
        title: location.address,
        icon: {
          url:
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#667eea"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 32),
        },
      })

      // Add info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 200px;">
            <h4 style="margin: 0 0 8px 0; color: #1e293b;">Cửa hàng nhạc cụ</h4>
            <p style="margin: 0; color: #64748b; font-size: 14px;">${location.address}</p>
            <div style="margin-top: 8px; font-size: 12px; color: #9ca3af;">
              <div>Vĩ độ: ${location.latitude}</div>
              <div>Kinh độ: ${location.longitude}</div>
            </div>
          </div>
        `,
      })

      marker.addListener("click", () => {
        // Close all other info windows
        markersRef.current.forEach((m) => {
          const iw = (m as any).infoWindow
          if (iw) iw.close()
        })
        infoWindow.open(mapInstanceRef.current, marker)
      })

      // Store info window reference
      ;(marker as any).infoWindow = infoWindow
      markersRef.current.push(marker)
    })

    // Auto-fit bounds if there are locations
    if (locations.length > 0) {
      const bounds = new window.google.maps.LatLngBounds()
      locations.forEach((location) => {
        bounds.extend({ lat: location.latitude, lng: location.longitude })
      })
      mapInstanceRef.current.fitBounds(bounds)

      // Set minimum zoom level
      const listener = window.google.maps.event.addListener(mapInstanceRef.current, "idle", () => {
        if (mapInstanceRef.current!.getZoom()! > 15) {
          mapInstanceRef.current!.setZoom(15)
        }
        window.google.maps.event.removeListener(listener)
      })
    }
  }, [locations, isLoaded])

  // Highlight selected location
  useEffect(() => {
    if (!selectedLocation || !mapInstanceRef.current) return

    // Pan to selected location
    mapInstanceRef.current.panTo({
      lat: selectedLocation.latitude,
      lng: selectedLocation.longitude,
    })

    // Find and open info window for selected marker
    const selectedMarker = markersRef.current.find((marker) => {
      const position = marker.getPosition()
      return (
        position &&
        Math.abs(position.lat() - selectedLocation.latitude) < 0.000001 &&
        Math.abs(position.lng() - selectedLocation.longitude) < 0.000001
      )
    })

    if (selectedMarker) {
      const infoWindow = (selectedMarker as any).infoWindow
      if (infoWindow) {
        infoWindow.open(mapInstanceRef.current, selectedMarker)
      }
    }
  }, [selectedLocation])

  if (error) {
    return (
      <div className="map-error" style={{ height }}>
        <div className="error-content">
          <span className="error-icon">🗺️</span>
          <p>{error}</p>
          <small>Vui lòng kiểm tra kết nối internet và thử lại</small>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="map-loading" style={{ height }}>
        <div className="loading-content">
          <div className="loading-spinner">⏳</div>
          <p>Đang tải bản đồ...</p>
        </div>
      </div>
    )
  }

  return <div ref={mapRef} style={{ width: "100%", height }} className="google-map" />
}

export default GoogleMap
