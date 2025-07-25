"use client";

import { useState, useCallback } from "react";
import { useApi, getAuthHeaders } from "./useApi";
import type {
  StoreLocationsApiResponse,
  StoreLocationApiResponse
} from "./types";
import type {
  StoreLocationDto,
  StoreLocationCreateRequest,
  StoreLocationUpdateRequest
} from "../types/dto";

export const useStoreLocations = () => {
  const [locations, setLocations] = useState<StoreLocationDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const locationsApi = useApi<StoreLocationsApiResponse>();
  const locationApi = useApi<StoreLocationApiResponse>();

  // Fetch all locations
  const fetchLocations = useCallback(async (): Promise<StoreLocationDto[]> => {
    try {
      const response = await locationsApi.request("/api/StoreLocation", {
        headers: getAuthHeaders()
      });

      const locationList = Array.isArray(response)
        ? response
        : response?.items ?? [];

      const count = Array.isArray(response)
        ? locationList.length
        : response?.totalCount ?? locationList.length;

      setLocations(locationList);
      setTotalCount(count);

      return locationList;
    } catch (error) {
      console.error("Error fetching store locations:", error);
      return [];
    }
  }, [locationsApi]);

  // Get a single location
  const getLocation = useCallback(
    async (id: number): Promise<StoreLocationDto> => {
      try {
        return await locationApi.request(`/api/StoreLocation/${id}`, {
          headers: getAuthHeaders()
        });
      } catch (error) {
        console.error("Error fetching store location:", error);
        throw error;
      }
    },
    [locationApi]
  );

  // Create a new location
  const createLocation = useCallback(
    async (
      locationData: StoreLocationCreateRequest
    ): Promise<StoreLocationDto> => {
      try {
        const payload = {
          locationID: 0, // Server will assign ID
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          address: locationData.address
        };

        const response = await locationApi.request("/api/StoreLocation", {
          method: "POST",
          body: payload,
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json"
          }
        });

        setLocations((prev) => [...prev, response]);
        setTotalCount((prev) => prev + 1);

        return response;
      } catch (error) {
        console.error("Error creating store location:", error);
        throw error;
      }
    },
    [locationApi]
  );

  // Update an existing location
  const updateLocation = useCallback(
    async (
      id: number,
      locationData: StoreLocationUpdateRequest
    ): Promise<StoreLocationDto> => {
      try {
        const payload = {
          locationID: locationData.locationID,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          address: locationData.address
        };

        const response = await locationApi.request(`/api/StoreLocation/${id}`, {
          method: "PUT",
          body: payload,
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json"
          }
        });

        // Update local state
        setLocations((prev) =>
          prev.map((loc) => (loc.locationID === id ? response : loc))
        );

        return response;
      } catch (error) {
        console.error("Error updating store location:", error);
        throw error;
      }
    },
    [locationApi]
  );

  // Delete a location
  const deleteLocation = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        await locationApi.request(`/api/StoreLocation/${id}`, {
          method: "DELETE",
          headers: getAuthHeaders()
        });

        setLocations((prev) => prev.filter((loc) => loc.locationID !== id));
        setTotalCount((prev) => Math.max(0, prev - 1));

        return true;
      } catch (error) {
        console.error("Error deleting store location:", error);
        return false;
      }
    },
    [locationApi]
  );

  return {
    locations,
    totalCount,
    loading: locationsApi.loading || locationApi.loading,
    error: locationsApi.error || locationApi.error,
    fetchLocations,
    getLocation,
    createLocation,
    updateLocation,
    deleteLocation
  };
};
