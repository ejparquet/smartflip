import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  Platform,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Stack } from "expo-router";
import * as Location from "expo-location";
import {
  Search,
  X,
  MapPin,
  Phone,
  Clock,
  Star,
  Navigation,
  ChevronRight,
  Package,
  AlertCircle,
  LocateFixed,
  RefreshCw,
  ShoppingBag,
  Check,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import BackButton from "@/components/BackButton";
import { Store, MaterialInventory } from "@/types";
import { mockStores } from "@/mocks/stores";

interface UserLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 3959;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const categoryLabels: Record<string, string> = {
  hardware: "Hardware",
  lumber: "Lumber",
  electrical: "Electrical",
  plumbing: "Plumbing",
  paint: "Paint",
  flooring: "Flooring",
  appliances: "Appliances",
};

const categoryColors: Record<string, string> = {
  hardware: "#3B82F6",
  lumber: "#D97706",
  electrical: "#EAB308",
  plumbing: "#0EA5E9",
  paint: "#8B5CF6",
  flooring: "#10B981",
  appliances: "#EC4899",
};

type FilterType = "all" | "hardware" | "lumber" | "electrical" | "plumbing" | "paint" | "flooring";

export default function NearbyStoresScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [holdItem, setHoldItem] = useState<MaterialInventory | null>(null);
  const [holdQuantity, setHoldQuantity] = useState("1");

  const dynamicStyles = useMemo(() => ({
    container: { backgroundColor: theme.background },
    searchInputWrapper: { backgroundColor: theme.surface, borderColor: theme.border },
    searchInput: { color: theme.text },
    filterChip: { backgroundColor: theme.surface, borderColor: theme.border },
    filterChipActive: { backgroundColor: theme.navy, borderColor: theme.navy },
    filterChipText: { color: theme.textSecondary },
    filterChipTextActive: { color: theme.white },
    card: { backgroundColor: theme.surface },
    cardTitle: { color: theme.text },
    cardSubtitle: { color: theme.textSecondary },
  }), [theme]);

  const requestLocationPermission = useCallback(async () => {
    try {
      setLocationLoading(true);
      setLocationError(null);
      console.log("[NearbyStores] Requesting location permission...");

      if (Platform.OS === "web") {
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              console.log("[NearbyStores] Web location obtained:", latitude, longitude);
              let address = "Current Location";
              try {
                const [addressResult] = await Location.reverseGeocodeAsync({ latitude, longitude });
                if (addressResult) {
                  address = [addressResult.city, addressResult.region].filter(Boolean).join(", ") || "Current Location";
                }
              } catch (e) {
                console.log("[NearbyStores] Reverse geocode failed on web:", e);
              }
              setUserLocation({ latitude, longitude, address });
              setLocationPermission(true);
              setLocationLoading(false);
            },
            (error) => {
              console.log("[NearbyStores] Web geolocation error:", error.message);
              setLocationError("Location access denied");
              setLocationPermission(false);
              setLocationLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
          );
        } else {
          setLocationError("Location not supported");
          setLocationPermission(false);
          setLocationLoading(false);
        }
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log("[NearbyStores] Location permission status:", status);

      if (status !== "granted") {
        setLocationError("Location permission denied");
        setLocationPermission(false);
        setLocationLoading(false);
        return;
      }

      setLocationPermission(true);
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      console.log("[NearbyStores] Location obtained:", location.coords);

      const { latitude, longitude } = location.coords;
      let address = "Current Location";
      try {
        const [addressResult] = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (addressResult) {
          address = [addressResult.city, addressResult.region].filter(Boolean).join(", ") || "Current Location";
        }
      } catch (e) {
        console.log("[NearbyStores] Reverse geocode failed:", e);
      }

      setUserLocation({ latitude, longitude, address });
      setLocationLoading(false);
    } catch (error) {
      console.log("[NearbyStores] Location error:", error);
      setLocationError("Failed to get location");
      setLocationLoading(false);
    }
  }, []);

  useEffect(() => {
    requestLocationPermission();
  }, [requestLocationPermission]);

  const storesWithDistance = useMemo(() => {
    if (!userLocation) {
      return mockStores.map(store => ({
        ...store,
        calculatedDistance: parseFloat(store.distance),
      }));
    }

    return mockStores.map(store => {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        store.latitude,
        store.longitude
      );
      return {
        ...store,
        calculatedDistance: distance,
        distance: `${distance.toFixed(1)} mi`,
      };
    });
  }, [userLocation]);

  const filteredStores = useMemo(() => {
    let stores = storesWithDistance;

    if (selectedFilter !== "all") {
      stores = stores.filter(s => s.category === selectedFilter);
    }

    if (searchQuery) {
      stores = stores.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.inventory?.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return stores.sort((a, b) => a.calculatedDistance - b.calculatedDistance);
  }, [selectedFilter, searchQuery, storesWithDistance]);

  const handleCall = useCallback((phone: string) => {
    Linking.openURL(`tel:${phone.replace(/\D/g, "")}`);
  }, []);

  const handleDirections = useCallback((store: Store) => {
    const url = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(store.address)}`,
      android: `geo:0,0?q=${encodeURIComponent(store.address)}`,
      default: `https://maps.google.com/?q=${encodeURIComponent(store.address)}`,
    });
    Linking.openURL(url);
  }, []);

  const handleHoldForPickup = useCallback((store: Store, item: MaterialInventory) => {
    setSelectedStore(store);
    setHoldItem(item);
    setHoldQuantity("1");
    setShowHoldModal(true);
  }, []);

  const filterOptions: { id: FilterType; label: string }[] = [
    { id: "all", label: "All Stores" },
    { id: "hardware", label: "Hardware" },
    { id: "lumber", label: "Lumber" },
    { id: "plumbing", label: "Plumbing" },
    { id: "paint", label: "Paint" },
    { id: "flooring", label: "Flooring" },
    { id: "electrical", label: "Electrical" },
  ];

  const renderLocationBanner = () => {
    if (locationLoading) {
      return (
        <View style={[styles.locationBanner, { backgroundColor: isDark ? "#1C1917" : "#FFFBEB" }]}>
          <ActivityIndicator size="small" color={theme.navy} />
          <Text style={[styles.locationText, { color: theme.textSecondary }]}>
            Finding your location...
          </Text>
        </View>
      );
    }

    if (locationError || !locationPermission) {
      return (
        <TouchableOpacity
          style={[styles.locationBanner, styles.locationBannerError, { backgroundColor: isDark ? "#1C1917" : "#FEF2F2" }]}
          onPress={requestLocationPermission}
        >
          <AlertCircle size={16} color="#EF4444" />
          <Text style={[styles.locationText, { color: "#EF4444" }]}>
            {locationError || "Enable location for accurate distances"}
          </Text>
          <RefreshCw size={14} color="#EF4444" />
        </TouchableOpacity>
      );
    }

    if (userLocation) {
      return (
        <View style={[styles.locationBanner, { backgroundColor: isDark ? "#1C1917" : "#ECFDF5" }]}>
          <LocateFixed size={16} color="#22C55E" />
          <View style={styles.locationInfo}>
            <Text style={[styles.locationLabel, { color: theme.textSecondary }]}>Your Location</Text>
            <Text style={[styles.locationAddress, { color: theme.text }]}>{userLocation.address}</Text>
          </View>
          <TouchableOpacity onPress={requestLocationPermission} style={styles.refreshBtn}>
            <RefreshCw size={14} color="#22C55E" />
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  const renderStoreCard = (store: Store & { calculatedDistance: number }) => {
    const catColor = categoryColors[store.category] || "#6B7280";
    const catLabel = categoryLabels[store.category] || store.category;
    const matchingItems = searchQuery
      ? store.inventory?.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())) || []
      : [];

    return (
      <View
        key={store.id}
        style={[styles.storeCard, dynamicStyles.card]}
      >
        <View style={styles.storeHeader}>
          <Image source={{ uri: store.image }} style={styles.storeImage} contentFit="cover" />
          <View style={styles.storeInfo}>
            <View style={styles.storeNameRow}>
              <Text style={[styles.storeName, dynamicStyles.cardTitle]} numberOfLines={1}>{store.name}</Text>
              <View style={[styles.categoryBadge, { backgroundColor: `${catColor}15` }]}>
                <Text style={[styles.categoryText, { color: catColor }]}>{catLabel}</Text>
              </View>
            </View>

            <View style={styles.storeAddressRow}>
              <MapPin size={12} color={theme.textSecondary} strokeWidth={1.5} />
              <Text style={[styles.storeAddress, dynamicStyles.cardSubtitle]} numberOfLines={1}>
                {store.address}
              </Text>
            </View>

            <View style={styles.storeMetaRow}>
              <View style={styles.distanceBadge}>
                <Navigation size={12} color={theme.navy} strokeWidth={1.5} />
                <Text style={[styles.distanceText, { color: theme.navy }]}>{store.distance}</Text>
              </View>
              <View style={styles.ratingBadge}>
                <Star size={12} color="#272D53" fill="#272D53" />
                <Text style={[styles.ratingText, { color: theme.text }]}>{store.rating}</Text>
              </View>
              <View style={[styles.statusBadge, !store.isOpen && styles.closedBadge]}>
                <Clock size={12} color={store.isOpen ? "#10B981" : "#EF4444"} strokeWidth={1.5} />
                <Text style={[styles.statusText, !store.isOpen && styles.closedText]}>
                  {store.isOpen ? "Open" : "Closed"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {matchingItems.length > 0 && (
          <View style={[styles.inventorySection, { borderTopColor: theme.border }]}>
            <Text style={[styles.inventoryTitle, { color: theme.text }]}>Available Items</Text>
            {matchingItems.slice(0, 3).map((item) => (
              <View key={item.id} style={[styles.inventoryItem, { borderBottomColor: theme.borderLight }]}>
                <View style={styles.inventoryLeft}>
                  <View style={[styles.stockIndicator, !item.inStock && styles.outOfStock]} />
                  <View>
                    <Text style={[styles.inventoryName, { color: theme.text }]}>{item.name}</Text>
                    <Text style={[styles.inventoryMeta, { color: theme.textSecondary }]}>
                      {item.inStock ? `${item.quantity} in stock` : "Out of stock"}
                      {item.aisle && ` · Aisle ${item.aisle}`}
                    </Text>
                  </View>
                </View>
                <View style={styles.inventoryRight}>
                  <Text style={[styles.inventoryPrice, { color: theme.text }]}>${item.price.toFixed(2)}</Text>
                  {item.inStock && (
                    <TouchableOpacity
                      style={[styles.holdButton, { backgroundColor: theme.navy }]}
                      onPress={() => handleHoldForPickup(store, item)}
                    >
                      <ShoppingBag size={12} color="#FFF" strokeWidth={2} />
                      <Text style={styles.holdButtonText}>Hold</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={[styles.storeActions, { borderTopColor: theme.border }]}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.surfaceSecondary }]}
            onPress={() => handleCall(store.phone)}
          >
            <Phone size={16} color={theme.navy} />
            <Text style={[styles.actionBtnText, { color: theme.navy }]}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.directionsBtn, { backgroundColor: theme.navy }]}
            onPress={() => handleDirections(store)}
          >
            <Navigation size={16} color="#FFF" />
            <Text style={styles.directionsBtnText}>Directions</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={[styles.header, { backgroundColor: theme.background }]}>
          <BackButton color={theme.navy} backgroundColor={theme.surfaceSecondary} />
          <Text style={[styles.headerTitle, { color: theme.navy }]}>Nearby Stores</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.searchContainer}>
          <View style={[styles.searchInputWrapperHome, dynamicStyles.searchInputWrapper]}>
            <Search size={20} color={theme.textTertiary} strokeWidth={1.5} />
            <TextInput
              style={[styles.searchInput, dynamicStyles.searchInput]}
              placeholder="Search stores, materials..."
              placeholderTextColor={theme.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <X size={18} color={theme.textTertiary} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {renderLocationBanner()}

        <View style={styles.filterSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {filterOptions.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterChip,
                  dynamicStyles.filterChip,
                  selectedFilter === filter.id && dynamicStyles.filterChipActive,
                ]}
                onPress={() => setSelectedFilter(filter.id)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    dynamicStyles.filterChipText,
                    selectedFilter === filter.id && dynamicStyles.filterChipTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView
          style={styles.storesList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.storesContent}
        >
          <View style={styles.resultsHeader}>
            <Text style={[styles.resultsCount, { color: theme.textSecondary }]}>
              {filteredStores.length} store{filteredStores.length !== 1 ? "s" : ""} nearby
            </Text>
            {userLocation && (
              <Text style={[styles.sortedByText, { color: theme.textTertiary }]}>
                Sorted by distance
              </Text>
            )}
          </View>

          {filteredStores.map(renderStoreCard)}

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>

      <Modal
        visible={showHoldModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowHoldModal(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
            <TouchableOpacity onPress={() => setShowHoldModal(false)}>
              <X size={24} color={theme.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Hold for Pickup</Text>
            <View style={{ width: 24 }} />
          </View>

          {selectedStore && holdItem && (
            <View style={styles.modalContent}>
              <View style={[styles.holdStoreInfo, { backgroundColor: theme.surface }]}>
                <Image
                  source={{ uri: selectedStore.image }}
                  style={styles.holdStoreImage}
                  contentFit="cover"
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.holdStoreName, { color: theme.text }]}>{selectedStore.name}</Text>
                  <Text style={[styles.holdStoreAddress, { color: theme.textSecondary }]}>{selectedStore.address}</Text>
                </View>
              </View>

              <View style={[styles.holdItemCard, { backgroundColor: theme.surface }]}>
                <Text style={[styles.holdItemName, { color: theme.text }]}>{holdItem.name}</Text>
                <Text style={[styles.holdItemPrice, { color: theme.textSecondary }]}>${holdItem.price.toFixed(2)} each</Text>

                <View style={[styles.quantitySelector, { borderBottomColor: theme.borderLight }]}>
                  <Text style={[styles.quantityLabel, { color: theme.text }]}>Quantity</Text>
                  <View style={styles.quantityControls}>
                    <TouchableOpacity
                      style={[styles.quantityButton, { backgroundColor: theme.surfaceSecondary }]}
                      onPress={() => setHoldQuantity(Math.max(1, parseInt(holdQuantity) - 1).toString())}
                    >
                      <Text style={[styles.quantityButtonText, { color: theme.text }]}>−</Text>
                    </TouchableOpacity>
                    <TextInput
                      style={[styles.quantityInput, { color: theme.text, backgroundColor: theme.surfaceSecondary }]}
                      value={holdQuantity}
                      onChangeText={setHoldQuantity}
                      keyboardType="number-pad"
                    />
                    <TouchableOpacity
                      style={[styles.quantityButton, { backgroundColor: theme.surfaceSecondary }]}
                      onPress={() => setHoldQuantity((parseInt(holdQuantity) + 1).toString())}
                    >
                      <Text style={[styles.quantityButtonText, { color: theme.text }]}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.holdTotal}>
                  <Text style={[styles.holdTotalLabel, { color: theme.text }]}>Total</Text>
                  <Text style={[styles.holdTotalAmount, { color: theme.text }]}>
                    ${(holdItem.price * parseInt(holdQuantity || "0")).toFixed(2)}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.confirmHoldButton, { backgroundColor: theme.navy }]}
                onPress={() => {
                  setShowHoldModal(false);
                  if (selectedStore) handleCall(selectedStore.phone);
                }}
              >
                <Check size={20} color="#FFF" strokeWidth={2} />
                <Text style={styles.confirmHoldText}>Confirm Hold & Call Store</Text>
              </TouchableOpacity>

              <Text style={[styles.holdNote, { color: theme.textSecondary }]}>
                Items will be held for 24 hours. Call the store to confirm pickup time.
              </Text>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchInputWrapperHome: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  locationBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
  },
  locationBannerError: {
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  locationText: {
    flex: 1,
    fontSize: 13,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 11,
  },
  locationAddress: {
    fontSize: 14,
    fontWeight: "500" as const,
    marginTop: 1,
  },
  refreshBtn: {
    padding: 6,
  },
  filterSection: {
    paddingVertical: 8,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "500" as const,
  },
  storesList: {
    flex: 1,
  },
  storesContent: {
    paddingHorizontal: 16,
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  resultsCount: {
    fontSize: 13,
  },
  sortedByText: {
    fontSize: 12,
  },
  storeCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  storeHeader: {
    flexDirection: "row",
    padding: 14,
  },
  storeImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  storeInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: "center",
  },
  storeNameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  storeName: {
    fontSize: 16,
    fontWeight: "600" as const,
    flex: 1,
    marginRight: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  storeAddressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  storeAddress: {
    fontSize: 13,
    flex: 1,
  },
  storeMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  distanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  distanceText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "500" as const,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  closedBadge: {
    backgroundColor: "#FEF2F2",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "500" as const,
    color: "#10B981",
  },
  closedText: {
    color: "#EF4444",
  },
  inventorySection: {
    paddingHorizontal: 14,
    paddingBottom: 10,
    borderTopWidth: 1,
    marginTop: 4,
    paddingTop: 12,
  },
  inventoryTitle: {
    fontSize: 13,
    fontWeight: "600" as const,
    marginBottom: 8,
  },
  inventoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  inventoryLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  stockIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
  },
  outOfStock: {
    backgroundColor: "#EF4444",
  },
  inventoryName: {
    fontSize: 14,
    fontWeight: "500" as const,
  },
  inventoryMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  inventoryRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  inventoryPrice: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  holdButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  holdButtonText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#FFF",
  },
  storeActions: {
    flexDirection: "row",
    padding: 14,
    gap: 10,
    borderTopWidth: 1,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  directionsBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  directionsBtnText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FFF",
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  modalContent: {
    padding: 16,
  },
  holdStoreInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: 16,
    marginBottom: 16,
  },
  holdStoreImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  holdStoreName: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  holdStoreAddress: {
    fontSize: 13,
    marginTop: 4,
  },
  holdItemCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  holdItemName: {
    fontSize: 18,
    fontWeight: "600" as const,
    marginBottom: 4,
  },
  holdItemPrice: {
    fontSize: 14,
    marginBottom: 16,
  },
  quantitySelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  quantityLabel: {
    fontSize: 15,
    fontWeight: "500" as const,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: "500" as const,
  },
  quantityInput: {
    width: 50,
    height: 36,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600" as const,
    borderRadius: 8,
  },
  holdTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  holdTotalLabel: {
    fontSize: 15,
    fontWeight: "500" as const,
  },
  holdTotalAmount: {
    fontSize: 22,
    fontWeight: "700" as const,
  },
  confirmHoldButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  confirmHoldText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFF",
  },
  holdNote: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
});
