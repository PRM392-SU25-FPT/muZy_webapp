"use client"

import { useState, useCallback } from "react"
import { useApi, getAuthHeaders } from "./useApi"
import type { StoreLocationDto, StoreLocationCreateRequest, StoreLocationUpdateRequest } from "../types/dto"

export const useStoreLocations = () => {
  const [locations, setLocations] = useState<StoreLocationDto[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const locationsApi = useApi<StoreLocationDto[]>()
  const locationApi = useApi<StoreLocationDto>()

  const fetchLocations = useCallback(async (): Promise<StoreLocationDto[]> => {
    try {
      const response = await locationsApi.request("/api/StoreLocation", {
        headers: getAuthHeaders(),
      })

      if (response) {
        // API returns array directly according to spec
        const locationList = Array.isArray(response) ? response : []
        setLocations(locationList)
        setTotalCount(locationList.length)
        return locationList
      }

      return []
    } catch (error) {
      console.error("Error fetching store locations:", error)
      throw error
    }
  }, [locationsApi])

  const getLocation = useCallback(
    async (id: number): Promise<StoreLocationDto> => {
      try {
        const response = await locationApi.request(`/api/StoreLocation/${id}`, {
          headers: getAuthHeaders(),
        })
        return response
      } catch (error) {
        console.error("Error fetching store location:", error)
        throw error
      }
    },
    [locationApi],
  )

  const createLocation = useCallback(
    async (locationData: StoreLocationCreateRequest): Promise<StoreLocationDto> => {
      try {
        // Convert to match API spec (LocationDTO)
        const apiData = {
          locationID: 0, // Will be assigned by server
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          address: locationData.address,
        }

        const response = await locationApi.request("/api/StoreLocation", {
          method: "POST",
          body: apiData,
          headers: getAuthHeaders(),
        })

        return response
      } catch (error) {
        console.error("Error creating store location:", error)
        throw error
      }
    },
    [locationApi],
  )

  const updateLocation = useCallback(
    async (id: number, locationData: StoreLocationUpdateRequest): Promise<StoreLocationDto> => {
      try {
        // Convert to match API spec (LocationDTO)
        const apiData = {
          locationID: locationData.locationID,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          address: locationData.address,
        }

        const response = await locationApi.request(`/api/StoreLocation/${id}`, {
          method: "PUT",
          body: apiData,
          headers: getAuthHeaders(),
        })

        // Return the updated data
        return response || apiData
      } catch (error) {
        console.error("Error updating store location:", error)
        throw error
      }
    },
    [locationApi],
  )

  const deleteLocation = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        await locationApi.request(`/api/StoreLocation/${id}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
        })

        return true
      } catch (error) {
        console.error("Error deleting store location:", error)
        throw error
      }
    },
    [locationApi],
  )

  return {
    locations,
    totalCount,
    loading: locationsApi.loading || locationApi.loading,
    error: locationsApi.error || locationApi.error,
    fetchLocations,
    getLocation,
    createLocation,
    updateLocation,
    deleteLocation,
  }
}
