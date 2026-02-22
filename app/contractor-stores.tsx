import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Linking,
  Platform,
  ActivityIndicator,
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
  Truck,
  Percent,
  Package,
  Droplets,
  Hammer,
  Wrench,
  Building,
  CheckCircle,
  AlertCircle,
  CreditCard,
  LocateFixed,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";
import {
  mockContractorStores,
  ContractorStore,
  storeTypeLabels,
  storeTypeColors,
} from "@/mocks/contractors";

type FilterType = "all" | "pool_supply" | "pool_equipment" | "plumbing" | "concrete" | "tile" | "tool_rental" | "building_supply" | "landscape";

interface UserLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

const storeTypeIcons: Record<string, React.ComponentType<any>> = {
  pool_supply: Droplets,
  pool_equipment: Wrench,
  plumbing: Droplets,
  concrete: Building,
  tile: Package,
  tool_rental: Truck,
  building_supply: Building,
  landscape: Package,
};

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

export default function ContractorStoresScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");
  const [selectedStore, setSelectedStore] = useState<ContractorStore | null>(null);
  const [showInventory, setShowInventory] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);

  const dynamicStyles = useMemo(() => ({
    container: { backgroundColor: theme.background },
    logoCircle: { backgroundColor: theme.navy, borderColor: theme.border },
    logoText: { color: theme.white },
    notificationButton: { backgroundColor: theme.surfaceSecondary },
    searchInputWrapper: { backgroundColor: theme.surface, borderColor: theme.border },
    searchInput: { color: theme.text },
    filterButton: { backgroundColor: theme.surface, borderColor: theme.border },
    filterChip: { backgroundColor: theme.surface, borderColor: theme.border },
    filterChipActive: { backgroundColor: theme.navy, borderColor: theme.navy },
    filterChipText: { color: theme.textSecondary },
    filterChipTextActive: { color: theme.white },
    card: { backgroundColor: theme.surface },
    cardTitle: { color: theme.text },
    cardSubtitle: { color: theme.textSecondary },
    modalContainer: { backgroundColor: theme.background },
    modalHeader: { backgroundColor: theme.surface, borderBottomColor: theme.border },
  }), [theme]);

  const requestLocationPermission = useCallback(async () => {
    try {
      setLocationLoading(true);
      setLocationError(null);
      console.log("Requesting location permission...");

      if (Platform.OS === "web") {
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              console.log("Web location obtained:", latitude, longitude);
              
              let address = "Current Location";
              try {
                const [addressResult] = await Location.reverseGeocodeAsync({ latitude, longitude });
                if (addressResult) {
                  address = [addressResult.city, addressResult.region].filter(Boolean).join(", ") || "Current Location";
                }
              } catch (e) {
                console.log("Reverse geocode failed on web:", e);
              }

              setUserLocation({ latitude, longitude, address });
              setLocationPermission(true);
              setLocationLoading(false);
            },
            (error) => {
              console.log("Web geolocation error:", error.message);
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
      console.log("Location permission status:", status);

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
      console.log("Location obtained:", location.coords);

      const { latitude, longitude } = location.coords;
      let address = "Current Location";

      try {
        const [addressResult] = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (addressResult) {
          address = [addressResult.city, addressResult.region].filter(Boolean).join(", ") || "Current Location";
        }
      } catch (e) {
        console.log("Reverse geocode failed:", e);
      }

      setUserLocation({ latitude, longitude, address });
      setLocationLoading(false);
    } catch (error) {
      console.log("Location error:", error);
      setLocationError("Failed to get location");
      setLocationLoading(false);
    }
  }, []);

  useEffect(() => {
    requestLocationPermission();
  }, [requestLocationPermission]);

  const storesWithDistance = useMemo(() => {
    if (!userLocation) {
      return mockContractorStores.map(store => ({
        ...store,
        calculatedDistance: parseFloat(store.distance),
      }));
    }

    return mockContractorStores.map(store => {
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
      stores = stores.filter(s => s.storeType === selectedFilter);
    }
    
    if (searchQuery) {
      stores = stores.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.specialties.some(spec => spec.toLowerCase().includes(searchQuery.toLowerCase())) ||
        s.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return stores.sort((a, b) => a.calculatedDistance - b.calculatedDistance);
  }, [selectedFilter, searchQuery, storesWithDistance]);

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone.replace(/\D/g, "")}`);
  };

  const handleDirections = (store: ContractorStore) => {
    const url = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(store.address)}`,
      android: `geo:0,0?q=${encodeURIComponent(store.address)}`,
      default: `https://maps.google.com/?q=${encodeURIComponent(store.address)}`,
    });
    Linking.openURL(url);
  };

  const filterOptions: { id: FilterType; label: string }[] = [
    { id: "all", label: "All Stores" },
    { id: "pool_supply", label: "Pool Supply" },
    { id: "pool_equipment", label: "Equipment" },
    { id: "plumbing", label: "Plumbing" },
    { id: "concrete", label: "Concrete" },
    { id: "tile", label: "Tile" },
    { id: "tool_rental", label: "Rentals" },
    { id: "building_supply", label: "Building" },
    { id: "landscape", label: "Landscape" },
  ];

  const renderLocationBanner = () => {
    if (locationLoading) {
      return (
        <View style={[styles.locationBanner, { backgroundColor: isDark ? "#1C1917" : "#FFFBEB" }]}>
          <ActivityIndicator size="small" color="#272D53" />
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

  const renderStoreCard = (store: ContractorStore & { calculatedDistance: number }) => {
    const StoreIcon = storeTypeIcons[store.storeType] || Hammer;
    const storeColor = storeTypeColors[store.storeType] || "#272D53";
    
    return (
      <TouchableOpacity
        key={store.id}
        style={[styles.storeCard, dynamicStyles.card]}
        onPress={() => setSelectedStore(store)}
        activeOpacity={0.7}
      >
        <Image source={{ uri: store.image }} style={styles.storeImage} contentFit="cover" />
        
        <View style={styles.storeContent}>
          <View style={styles.storeHeader}>
            <View style={[styles.storeTypeBadge, { backgroundColor: `${storeColor}15` }]}>
              <StoreIcon size={14} color={storeColor} />
              <Text style={[styles.storeTypeText, { color: storeColor }]}>
                {storeTypeLabels[store.storeType]}
              </Text>
            </View>
            {store.proDiscount ? (
              <View style={styles.discountBadge}>
                <Percent size={10} color="#FFF" />
                <Text style={styles.discountText}>{store.proDiscount}% Pro</Text>
              </View>
            ) : null}
          </View>

          <Text style={[styles.storeName, dynamicStyles.cardTitle]}>{store.name}</Text>
          
          <View style={styles.storeAddressRow}>
            <MapPin size={12} color={theme.textSecondary} />
            <Text style={[styles.storeAddress, dynamicStyles.cardSubtitle]} numberOfLines={1}>
              {store.address}
            </Text>
          </View>

          <View style={styles.storeMeta}>
            <View style={styles.distanceRow}>
              <Navigation size={12} color="#1E2A3B" />
              <Text style={[styles.distanceText, { color: "#1E2A3B" }]}>{store.distance}</Text>
            </View>
            <View style={styles.ratingRow}>
              <Star size={12} color="#1E2A3B" fill="#1E2A3B" />
              <Text style={[styles.ratingText, { color: theme.text }]}>{store.rating}</Text>
            </View>
            <View style={[styles.statusBadge, !store.isOpen && styles.closedBadge]}>
              <Text style={[styles.statusText, !store.isOpen && styles.closedText]}>
                {store.isOpen ? "Open" : "Closed"}
              </Text>
            </View>
          </View>

          <View style={styles.specialtiesRow}>
            {store.specialties.slice(0, 3).map((spec, idx) => (
              <View key={idx} style={[styles.specialtyChip, { backgroundColor: theme.surfaceSecondary }]}>
                <Text style={[styles.specialtyText, { color: theme.textSecondary }]}>{spec}</Text>
              </View>
            ))}
          </View>

          <View style={styles.storeFeatures}>
            {store.deliveryAvailable && (
              <View style={styles.featureTag}>
                <Truck size={12} color="#3B82F6" />
                <Text style={[styles.featureText, { color: "#3B82F6" }]}>Delivery</Text>
              </View>
            )}
            {store.bulkPricing && (
              <View style={styles.featureTag}>
                <Package size={12} color="#8B5CF6" />
                <Text style={[styles.featureText, { color: "#8B5CF6" }]}>Bulk</Text>
              </View>
            )}
            {store.creditAvailable && (
              <View style={styles.featureTag}>
                <CreditCard size={12} color="#22C55E" />
                <Text style={[styles.featureText, { color: "#22C55E" }]}>Credit</Text>
              </View>
            )}
          </View>

          <View style={styles.storeActions}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: theme.surfaceSecondary }]}
              onPress={() => handleCall(store.phone)}
            >
              <Phone size={16} color="#1E2A3B" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: theme.surfaceSecondary }]}
              onPress={() => handleDirections(store)}
            >
              <Navigation size={16} color="#1E2A3B" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewInventoryBtn, { backgroundColor: "#1E2A3B" }]}
              onPress={() => {
                setSelectedStore(store);
                setShowInventory(true);
              }}
            >
              <Text style={styles.viewInventoryText}>View Inventory</Text>
              <ChevronRight size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={[styles.header, { backgroundColor: theme.background }]}>
          <BackButton color={theme.navy} backgroundColor={theme.surfaceSecondary} />
          <Text style={styles.headerTitle}>Material Stores</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.searchContainer}>
          <View style={[styles.searchInputWrapperHome, dynamicStyles.searchInputWrapper]}>
            <Search size={20} color={theme.textTertiary} strokeWidth={1.5} />
            <TextInput
              style={[styles.searchInput, dynamicStyles.searchInput]}
              placeholder="Search stores, supplies..."
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
          <TouchableOpacity style={[styles.filterButton, dynamicStyles.filterButton]}>
            <SlidersHorizontal size={20} color={theme.navy} strokeWidth={1.5} />
          </TouchableOpacity>
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
        visible={!!selectedStore && showInventory}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowInventory(false);
          setSelectedStore(null);
        }}
      >
        {selectedStore && (
          <SafeAreaView style={[styles.modalContainer, dynamicStyles.modalContainer]}>
            <View style={[styles.modalHeader, dynamicStyles.modalHeader]}>
              <TouchableOpacity onPress={() => {
                setShowInventory(false);
                setSelectedStore(null);
              }}>
                <X size={24} color={theme.textSecondary} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: theme.text }]}>{selectedStore.name}</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={[styles.storeInfoBanner, { backgroundColor: isDark ? "#78350F" : "#E8E9EE" }]}>
                <View style={styles.storeInfoRow}>
                  <MapPin size={14} color="#272D53" />
                  <Text style={[styles.storeInfoText, { color: theme.textSecondary }]} numberOfLines={1}>
                    {selectedStore.address}
                  </Text>
                </View>
                <View style={styles.storeInfoRow}>
                  <Navigation size={14} color="#272D53" />
                  <Text style={[styles.storeInfoText, { color: "#272D53", fontWeight: "600" as const }]}>
                    {selectedStore.distance} away
                  </Text>
                </View>
                <View style={styles.storeInfoRow}>
                  <Clock size={14} color="#272D53" />
                  <Text style={[styles.storeInfoText, { color: theme.textSecondary }]}>
                    {selectedStore.openHours}
                  </Text>
                </View>
                {selectedStore.proDiscount && (
                  <View style={styles.storeInfoRow}>
                    <Percent size={14} color="#272D53" />
                    <Text style={[styles.storeInfoText, { color: "#272D53", fontWeight: "600" as const }]}>
                      {selectedStore.proDiscount}% Pro Discount Available
                    </Text>
                  </View>
                )}
                {selectedStore.creditAvailable && (
                  <View style={styles.storeInfoRow}>
                    <CreditCard size={14} color="#22C55E" />
                    <Text style={[styles.storeInfoText, { color: "#22C55E", fontWeight: "600" as const }]}>
                      Contractor Credit Available
                    </Text>
                  </View>
                )}
              </View>

              <Text style={[styles.inventoryTitle, { color: theme.text }]}>Available Inventory</Text>

              {selectedStore.inventory?.map((item) => (
                <View
                  key={item.id}
                  style={[styles.inventoryItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
                >
                  <View style={styles.inventoryInfo}>
                    <Text style={[styles.inventoryName, { color: theme.text }]}>{item.name}</Text>
                    <View style={styles.inventoryMeta}>
                      <Text style={[styles.inventoryAisle, { color: theme.textTertiary }]}>
                        {item.aisle}
                      </Text>
                      <View style={styles.stockRow}>
                        {item.inStock ? (
                          <CheckCircle size={12} color="#22C55E" />
                        ) : (
                          <AlertCircle size={12} color="#EF4444" />
                        )}
                        <Text style={[styles.stockText, { color: item.inStock ? "#22C55E" : "#EF4444" }]}>
                          {item.inStock ? `${item.quantity} in stock` : "Out of stock"}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.inventoryPricing}>
                    <Text style={[styles.inventoryPrice, { color: "#272D53" }]}>
                      ${item.price.toFixed(2)}
                    </Text>
                    <Text style={[styles.unitText, { color: theme.textTertiary }]}>/{item.unit}</Text>
                    {selectedStore.proDiscount && item.inStock && (
                      <Text style={[styles.proPrice, { color: theme.textTertiary }]}>
                        Pro: ${(item.price * (1 - selectedStore.proDiscount / 100)).toFixed(2)}
                      </Text>
                    )}
                  </View>
                </View>
              ))}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalActionBtn, { backgroundColor: theme.surfaceSecondary }]}
                  onPress={() => handleCall(selectedStore.phone)}
                >
                  <Phone size={18} color="#272D53" />
                  <Text style={[styles.modalActionText, { color: "#272D53" }]}>Call Store</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalActionBtn, { backgroundColor: "#272D53" }]}
                  onPress={() => handleDirections(selectedStore)}
                >
                  <Navigation size={18} color="#FFF" />
                  <Text style={[styles.modalActionText, { color: "#FFF" }]}>Get Directions</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
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
    color: "#1E2A3B",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 12,
  },
  searchInputWrapperHome: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  locationBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 20,
    marginTop: 12,
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
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  filterSection: {
    paddingVertical: 8,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#6B7280",
  },
  storesList: {
    flex: 1,
  },
  storesContent: {
    paddingHorizontal: 20,
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
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  storeImage: {
    width: "100%",
    height: 120,
  },
  storeContent: {
    padding: 14,
  },
  storeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  storeTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  storeTypeText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  discountBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#1E2A3B",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: "#FFF",
  },
  storeName: {
    fontSize: 17,
    fontWeight: "600" as const,
    marginBottom: 4,
  },
  storeAddressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 10,
  },
  storeAddress: {
    fontSize: 13,
    flex: 1,
  },
  storeMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  distanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  distanceText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "500" as const,
  },
  statusBadge: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  closedBadge: {
    backgroundColor: "#FEE2E2",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "500" as const,
    color: "#22C55E",
  },
  closedText: {
    color: "#EF4444",
  },
  specialtiesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 10,
  },
  specialtyChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  specialtyText: {
    fontSize: 11,
  },
  storeFeatures: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  featureTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  featureText: {
    fontSize: 11,
    fontWeight: "500" as const,
  },
  storeActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  viewInventoryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 40,
    borderRadius: 10,
  },
  viewInventoryText: {
    fontSize: 13,
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
    fontSize: 17,
    fontWeight: "600" as const,
  },
  modalContent: {
    flex: 1,
  },
  storeInfoBanner: {
    margin: 20,
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  storeInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  storeInfoText: {
    fontSize: 13,
    flex: 1,
  },
  inventoryTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  inventoryItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  inventoryInfo: {
    flex: 1,
  },
  inventoryName: {
    fontSize: 14,
    fontWeight: "500" as const,
    marginBottom: 4,
  },
  inventoryMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  inventoryAisle: {
    fontSize: 12,
  },
  stockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  stockText: {
    fontSize: 12,
  },
  inventoryPricing: {
    alignItems: "flex-end",
  },
  inventoryPrice: {
    fontSize: 16,
    fontWeight: "700" as const,
  },
  unitText: {
    fontSize: 11,
  },
  proPrice: {
    fontSize: 11,
    marginTop: 2,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    paddingBottom: 40,
  },
  modalActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  modalActionText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
});
