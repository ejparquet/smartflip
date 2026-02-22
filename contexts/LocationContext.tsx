import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { Platform, Alert } from "react-native";
import * as Location from "expo-location";

export interface UserLocation {
  latitude: number;
  longitude: number;
  zipCode?: string;
  city?: string;
  state?: string;
  displayName: string;
  source: "gps" | "manual";
}

interface LocationState {
  location: UserLocation | null;
  isLoading: boolean;
  isLocationEnabled: boolean;
  requestLocation: () => Promise<void>;
  setManualLocation: (zipCode: string, city: string, state: string) => Promise<void>;
  clearLocation: () => Promise<void>;
  getDistanceMiles: (lat: number, lon: number) => number | null;
  maxDistanceMiles: number;
  setMaxDistance: (miles: number) => void;
}

const LOCATION_STORAGE_KEY = "smartflip_user_location";
const MAX_DISTANCE_KEY = "smartflip_max_distance";

const ZIP_CODE_COORDINATES: Record<string, { lat: number; lon: number; city: string; state: string }> = {
  "70801": { lat: 30.4515, lon: -91.1871, city: "Baton Rouge", state: "LA" },
  "70802": { lat: 30.4407, lon: -91.1761, city: "Baton Rouge", state: "LA" },
  "70803": { lat: 30.4118, lon: -91.1798, city: "Baton Rouge", state: "LA" },
  "70808": { lat: 30.3977, lon: -91.1288, city: "Baton Rouge", state: "LA" },
  "70809": { lat: 30.4074, lon: -91.0651, city: "Baton Rouge", state: "LA" },
  "70810": { lat: 30.3654, lon: -91.0651, city: "Baton Rouge", state: "LA" },
  "70816": { lat: 30.4485, lon: -91.0551, city: "Baton Rouge", state: "LA" },
  "78701": { lat: 30.2672, lon: -97.7431, city: "Austin", state: "TX" },
  "78702": { lat: 30.2622, lon: -97.7191, city: "Austin", state: "TX" },
  "78703": { lat: 30.2922, lon: -97.7631, city: "Austin", state: "TX" },
  "78704": { lat: 30.2422, lon: -97.7631, city: "Austin", state: "TX" },
  "78705": { lat: 30.2922, lon: -97.7391, city: "Austin", state: "TX" },
  "78745": { lat: 30.2072, lon: -97.7931, city: "Austin", state: "TX" },
  "78751": { lat: 30.3122, lon: -97.7231, city: "Austin", state: "TX" },
  "78752": { lat: 30.3322, lon: -97.7031, city: "Austin", state: "TX" },
  "78753": { lat: 30.3722, lon: -97.6831, city: "Austin", state: "TX" },
  "78757": { lat: 30.3522, lon: -97.7331, city: "Austin", state: "TX" },
  "78758": { lat: 30.3822, lon: -97.7031, city: "Austin", state: "TX" },
  "78660": { lat: 30.4422, lon: -97.6231, city: "Pflugerville", state: "TX" },
  "78681": { lat: 30.5222, lon: -97.6831, city: "Round Rock", state: "TX" },
  "78664": { lat: 30.5072, lon: -97.6631, city: "Round Rock", state: "TX" },
  "78613": { lat: 30.5122, lon: -97.8231, city: "Cedar Park", state: "TX" },
  "78641": { lat: 30.5622, lon: -97.8531, city: "Leander", state: "TX" },
  "78628": { lat: 30.6322, lon: -97.6931, city: "Georgetown", state: "TX" },
  "78610": { lat: 30.0822, lon: -97.8431, city: "Buda", state: "TX" },
  "78620": { lat: 30.1922, lon: -98.0931, city: "Dripping Springs", state: "TX" },
  "55401": { lat: 44.9778, lon: -93.2650, city: "Minneapolis", state: "MN" },
  "55402": { lat: 44.9750, lon: -93.2720, city: "Minneapolis", state: "MN" },
  "55403": { lat: 44.9700, lon: -93.2880, city: "Minneapolis", state: "MN" },
  "10001": { lat: 40.7506, lon: -73.9971, city: "New York", state: "NY" },
  "10002": { lat: 40.7157, lon: -73.9863, city: "New York", state: "NY" },
  "90001": { lat: 33.9425, lon: -118.2551, city: "Los Angeles", state: "CA" },
  "90002": { lat: 33.9491, lon: -118.2468, city: "Los Angeles", state: "CA" },
};

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const [LocationProvider, useLocation] = createContextHook<LocationState>(() => {
  const queryClient = useQueryClient();
  const [maxDistanceMiles, setMaxDistanceMiles] = useState(50);

  const locationQuery = useQuery({
    queryKey: ["userLocation"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(LOCATION_STORAGE_KEY);
      const maxDist = await AsyncStorage.getItem(MAX_DISTANCE_KEY);
      if (maxDist) {
        setMaxDistanceMiles(parseInt(maxDist, 10));
      }
      if (stored) {
        return JSON.parse(stored) as UserLocation;
      }
      return null;
    },
  });

  const saveLocationMutation = useMutation({
    mutationFn: async (location: UserLocation) => {
      await AsyncStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
      return location;
    },
    onSuccess: (location) => {
      queryClient.setQueryData(["userLocation"], location);
    },
  });

  const clearLocationMutation = useMutation({
    mutationFn: async () => {
      await AsyncStorage.removeItem(LOCATION_STORAGE_KEY);
    },
    onSuccess: () => {
      queryClient.setQueryData(["userLocation"], null);
    },
  });

  const { mutateAsync: saveLocation } = saveLocationMutation;
  const { mutateAsync: clearLocationAsync } = clearLocationMutation;

  const requestLocation = useCallback(async () => {
    try {
      if (Platform.OS === "web") {
        if ("geolocation" in navigator) {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: false,
              timeout: 10000,
              maximumAge: 300000,
            });
          });
          
          const location: UserLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            displayName: "Current Location",
            source: "gps",
          };
          
          await saveLocation(location);
        } else {
          Alert.alert("Error", "Geolocation is not supported in this browser");
        }
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== "granted") {
        Alert.alert(
          "Location Permission Required",
          "Please enable location access to see nearby stores and materials.",
          [{ text: "OK" }]
        );
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      let cityState = "Current Location";
      try {
        const [reverseGeocode] = await Location.reverseGeocodeAsync({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        if (reverseGeocode) {
          cityState = `${reverseGeocode.city || ""}, ${reverseGeocode.region || ""}`.trim();
          if (cityState === ",") cityState = "Current Location";
        }
      } catch (e) {
        console.log("Reverse geocode failed:", e);
      }

      const location: UserLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        zipCode: undefined,
        city: undefined,
        state: undefined,
        displayName: cityState,
        source: "gps",
      };

      await saveLocation(location);
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Error", "Unable to get your location. Please try entering your zip code manually.");
    }
  }, [saveLocation]);

  const setManualLocation = useCallback(async (zipCode: string, city: string, state: string) => {
    const coords = ZIP_CODE_COORDINATES[zipCode];
    
    const location: UserLocation = {
      latitude: coords?.lat || 30.2672,
      longitude: coords?.lon || -97.7431,
      zipCode,
      city: city || coords?.city || "",
      state: state || coords?.state || "",
      displayName: `${city || coords?.city || "Unknown"}, ${state || coords?.state || ""}`,
      source: "manual",
    };

    await saveLocation(location);
  }, [saveLocation]);

  const clearLocation = useCallback(async () => {
    await clearLocationAsync();
  }, [clearLocationAsync]);

  const getDistanceMiles = useCallback((lat: number, lon: number): number | null => {
    const currentLocation = locationQuery.data;
    if (!currentLocation) return null;
    return calculateDistance(currentLocation.latitude, currentLocation.longitude, lat, lon);
  }, [locationQuery.data]);

  const setMaxDistance = useCallback(async (miles: number) => {
    setMaxDistanceMiles(miles);
    await AsyncStorage.setItem(MAX_DISTANCE_KEY, miles.toString());
  }, []);

  return {
    location: locationQuery.data ?? null,
    isLoading: locationQuery.isLoading,
    isLocationEnabled: !!locationQuery.data,
    requestLocation,
    setManualLocation,
    clearLocation,
    getDistanceMiles,
    maxDistanceMiles,
    setMaxDistance,
  };
});

export function getDistanceFromCoords(
  userLat: number,
  userLon: number,
  targetLat: number,
  targetLon: number
): number {
  return calculateDistance(userLat, userLon, targetLat, targetLon);
}
