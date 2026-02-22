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
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
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
  CheckCircle,
  AlertCircle,
  Waves,
  Wrench,
  FlaskConical,
  Grid3X3,
  Cpu,
  MapPinOff,
  RefreshCw,
  ExternalLink,
  Globe,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { mockPoolStores, PoolStore, poolStoreCategories } from "@/mocks/stores";
import { 
  searchNearbyPoolStores, 
  getPlaceDetails, 
  getDirectionsUrl,
  NearbyPoolStore,
  PlaceDetails 
} from "@/lib/googlePlaces";
import Constants from "expo-constants";

type PoolFilterType = "all" | "pool_supply" | "equipment" | "chemicals" | "tile_coping" | "plumbing" | "automation";

const poolStoreTypeIcons: Record<string, React.ComponentType<any>> = {
  pool_supply: Waves,
  equipment: Wrench,
  chemicals: FlaskConical,
  tile_coping: Grid3X3,
  plumbing: Droplets,
  automation: Cpu,
};

const POOL_COLOR = "#0EA5E9";

const GOOGLE_PLACES_API_KEY = Constants.expoConfig?.extra?.googlePlacesApiKey || 
  process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || "";

export default function StoresTab() {
  const { theme, isDark } = useTheme();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<PoolFilterType>("all");
  const [selectedStore, setSelectedStore] = useState<NearbyPoolStore | PoolStore | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
  
  const [nearbyStores, setNearbyStores] = useState<NearbyPoolStore[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);

  const dynamicStyles = useMemo(() => ({
    container: { backgroundColor: theme.background },
    header: { backgroundColor: theme.surface, borderBottomColor: theme.border },
    headerTitle: { color: theme.text },
    searchInput: { backgroundColor: theme.surfaceSecondary, color: theme.text },
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
      console.log("[Stores] Requesting location permission...");
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === "granted";
      setLocationPermission(granted);
      
      if (!granted) {
        setLocationError("Location permission denied");
        console.log("[Stores] Location permission denied");
      }
      
      return granted;
    } catch (error) {
      console.error("[Stores] Error requesting location permission:", error);
      setLocationError("Failed to request location permission");
      return false;
    }
  }, []);

  const getCurrentLocation = useCallback(async () => {
    try {
      console.log("[Stores] Getting current location...");
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      console.log("[Stores] Got location:", loc.coords.latitude, loc.coords.longitude);
      setLocation(loc);
      setLocationError(null);
      return loc;
    } catch (error) {
      console.error("[Stores] Error getting location:", error);
      setLocationError("Failed to get current location");
      return null;
    }
  }, []);

  const fetchNearbyStores = useCallback(async (lat: number, lng: number) => {
    if (!GOOGLE_PLACES_API_KEY) {
      console.log("[Stores] No API key, using mock data");
      setUsingMockData(true);
      setApiError(null);
      return;
    }

    try {
      console.log("[Stores] Fetching nearby stores...");
      setApiError(null);
      
      const stores = await searchNearbyPoolStores(lat, lng, GOOGLE_PLACES_API_KEY);
      
      if (stores.length > 0) {
        console.log(`[Stores] Found ${stores.length} nearby stores`);
        setNearbyStores(stores);
        setUsingMockData(false);
      } else {
        console.log("[Stores] No stores found, using mock data");
        setUsingMockData(true);
      }
    } catch (error) {
      console.error("[Stores] Error fetching stores:", error);
      setApiError("Failed to fetch nearby stores");
      setUsingMockData(true);
    }
  }, []);

  const initializeLocation = useCallback(async () => {
    setIsLoading(true);
    
    const hasPermission = await requestLocationPermission();
    
    if (hasPermission) {
      const loc = await getCurrentLocation();
      if (loc) {
        await fetchNearbyStores(loc.coords.latitude, loc.coords.longitude);
      } else {
        setUsingMockData(true);
      }
    } else {
      setUsingMockData(true);
    }
    
    setIsLoading(false);
  }, [requestLocationPermission, getCurrentLocation, fetchNearbyStores]);

  useEffect(() => {
    initializeLocation();
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    
    if (locationPermission) {
      const loc = await getCurrentLocation();
      if (loc) {
        await fetchNearbyStores(loc.coords.latitude, loc.coords.longitude);
      }
    }
    
    setIsRefreshing(false);
  }, [locationPermission, getCurrentLocation, fetchNearbyStores]);

  const handleStoreSelect = useCallback(async (store: NearbyPoolStore | PoolStore) => {
    setSelectedStore(store);
    setShowDetails(true);
    setPlaceDetails(null);
    
    if ('placeId' in store && GOOGLE_PLACES_API_KEY) {
      setLoadingDetails(true);
      try {
        const details = await getPlaceDetails(store.placeId, GOOGLE_PLACES_API_KEY);
        if (details) {
          setPlaceDetails(details);
        }
      } catch (error) {
        console.error("[Stores] Error fetching place details:", error);
      }
      setLoadingDetails(false);
    }
  }, []);

  const displayStores = useMemo(() => {
    const stores: (NearbyPoolStore | PoolStore)[] = usingMockData ? mockPoolStores : nearbyStores;
    
    let filtered: (NearbyPoolStore | PoolStore)[] = stores;
    
    if (selectedFilter !== "all") {
      filtered = filtered.filter(s => s.category === selectedFilter);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.address.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [usingMockData, nearbyStores, selectedFilter, searchQuery]);

  const handleCall = (phone: string) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone.replace(/\D/g, "")}`);
  };

  const handleDirections = (store: { latitude: number; longitude: number; name: string; address: string }) => {
    const url = getDirectionsUrl(store.latitude, store.longitude, store.name);
    Linking.openURL(url);
  };

  const handleWebsite = (url: string) => {
    Linking.openURL(url);
  };

  const filterOptions: { id: PoolFilterType; label: string }[] = [
    { id: "all", label: "All Stores" },
    { id: "pool_supply", label: "Pool Supply" },
    { id: "equipment", label: "Equipment" },
    { id: "chemicals", label: "Chemicals" },
    { id: "tile_coping", label: "Tile & Coping" },
    { id: "plumbing", label: "Plumbing" },
    { id: "automation", label: "Automation" },
  ];

  const renderStoreCard = (store: NearbyPoolStore | PoolStore) => {
    const StoreIcon = poolStoreTypeIcons[store.category] || Waves;
    const storeColor = poolStoreCategories[store.category]?.color || POOL_COLOR;
    const isGoogleStore = 'placeId' in store;
    
    return (
      <TouchableOpacity
        key={store.id}
        style={[styles.storeCard, dynamicStyles.card]}
        onPress={() => handleStoreSelect(store)}
        activeOpacity={0.7}
      >
        <Image source={{ uri: store.image }} style={styles.storeImage} contentFit="cover" />
        
        <View style={styles.storeContent}>
          <View style={styles.storeHeader}>
            <View style={[styles.storeTypeBadge, { backgroundColor: `${storeColor}15` }]}>
              <StoreIcon size={14} color={storeColor} />
              <Text style={[styles.storeTypeText, { color: storeColor }]}>
                {poolStoreCategories[store.category]?.label || store.category}
              </Text>
            </View>
            {!isGoogleStore && 'proDiscount' in store && store.proDiscount && (
              <View style={[styles.discountBadge, { backgroundColor: POOL_COLOR }]}>
                <Percent size={10} color="#FFF" />
                <Text style={styles.discountText}>{store.proDiscount}% Pro</Text>
              </View>
            )}
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
              <Navigation size={12} color={POOL_COLOR} />
              <Text style={[styles.distanceText, { color: POOL_COLOR }]}>{store.distance}</Text>
            </View>
            {store.rating > 0 && (
              <View style={styles.ratingRow}>
                <Star size={12} color="#272D53" fill="#272D53" />
                <Text style={[styles.ratingText, { color: theme.text }]}>
                  {store.rating.toFixed(1)}
                  {isGoogleStore && 'reviewCount' in store && store.reviewCount > 0 && (
                    <Text style={{ color: theme.textTertiary }}> ({store.reviewCount})</Text>
                  )}
                </Text>
              </View>
            )}
            <View style={[styles.statusBadge, { backgroundColor: store.isOpen ? `${POOL_COLOR}15` : "#FEE2E2" }]}>
              <Text style={[styles.statusText, { color: store.isOpen ? POOL_COLOR : "#EF4444" }]}>
                {store.isOpen ? "Open" : "Closed"}
              </Text>
            </View>
          </View>

          {!isGoogleStore && 'specialties' in store && (
            <View style={styles.specialtiesRow}>
              {store.specialties.slice(0, 3).map((spec, idx) => (
                <View key={idx} style={[styles.specialtyChip, { backgroundColor: theme.surfaceSecondary }]}>
                  <Text style={[styles.specialtyText, { color: theme.textSecondary }]}>{spec}</Text>
                </View>
              ))}
            </View>
          )}

          {!isGoogleStore && 'deliveryAvailable' in store && (
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
                  <Text style={[styles.featureText, { color: "#8B5CF6" }]}>Bulk Pricing</Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.storeActions}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: theme.surfaceSecondary }]}
              onPress={() => handleDirections(store)}
            >
              <Navigation size={16} color={POOL_COLOR} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewDetailsBtn, { backgroundColor: POOL_COLOR }]}
              onPress={() => handleStoreSelect(store)}
            >
              <Text style={styles.viewDetailsText}>View Details</Text>
              <ChevronRight size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderLocationStatus = () => {
    if (isLoading) {
      return (
        <View style={[styles.statusBanner, { backgroundColor: isDark ? "#1E3A5F" : "#DBEAFE" }]}>
          <ActivityIndicator size="small" color={POOL_COLOR} />
          <Text style={[styles.statusBannerText, { color: theme.text }]}>
            Finding nearby pool stores...
          </Text>
        </View>
      );
    }
    
    if (locationError && !usingMockData) {
      return (
        <View style={[styles.statusBanner, { backgroundColor: isDark ? "#3B1E1E" : "#FEE2E2" }]}>
          <MapPinOff size={16} color="#EF4444" />
          <Text style={[styles.statusBannerText, { color: "#EF4444" }]}>
            {locationError}
          </Text>
          <TouchableOpacity onPress={initializeLocation}>
            <RefreshCw size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      );
    }
    
    if (usingMockData && !GOOGLE_PLACES_API_KEY) {
      return (
        <View style={[styles.statusBanner, { backgroundColor: isDark ? "#3D3215" : "#E8E9EE" }]}>
          <AlertCircle size={16} color="#272D53" />
          <Text style={[styles.statusBannerText, { color: "#92400E" }]}>
            API key not configured. Showing sample stores.
          </Text>
        </View>
      );
    }
    
    if (!usingMockData && nearbyStores.length > 0 && location) {
      return (
        <View style={[styles.statusBanner, { backgroundColor: isDark ? "#0C4A6E" : "#E0F2FE" }]}>
          <CheckCircle size={16} color={POOL_COLOR} />
          <Text style={[styles.statusBannerText, { color: POOL_COLOR }]}>
            Showing real stores near your location
          </Text>
        </View>
      );
    }
    
    return null;
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={[styles.header, dynamicStyles.header]}>
          <View>
            <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>Nearby Pool Stores</Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              Pool supplies, equipment & materials
            </Text>
          </View>
          <View style={[styles.headerBadge, { backgroundColor: POOL_COLOR }]}>
            <Waves size={20} color="#FFF" />
          </View>
        </View>

        <View style={[styles.searchSection, { backgroundColor: theme.surface }]}>
          <View style={[styles.searchInputWrapper, dynamicStyles.searchInput]}>
            <Search size={18} color={theme.textTertiary} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Search stores, pumps, chemicals..."
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

        {renderLocationStatus()}

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
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={POOL_COLOR}
              colors={[POOL_COLOR]}
            />
          }
        >
          <View style={styles.resultsHeader}>
            <Text style={[styles.resultsCount, { color: theme.textSecondary }]}>
              {displayStores.length} pool store{displayStores.length !== 1 ? "s" : ""} 
              {!usingMockData ? " nearby" : " available"}
            </Text>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={POOL_COLOR} />
              <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                Finding pool stores near you...
              </Text>
            </View>
          ) : displayStores.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Waves size={48} color={theme.textTertiary} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No stores found</Text>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                Try adjusting your search or filters
              </Text>
            </View>
          ) : (
            displayStores.map((store) => renderStoreCard(store))
          )}
          
          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>

      <Modal
        visible={showDetails && !!selectedStore}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowDetails(false);
          setSelectedStore(null);
          setPlaceDetails(null);
        }}
      >
        {selectedStore && (
          <SafeAreaView style={[styles.modalContainer, dynamicStyles.modalContainer]}>
            <View style={[styles.modalHeader, dynamicStyles.modalHeader]}>
              <TouchableOpacity onPress={() => {
                setShowDetails(false);
                setSelectedStore(null);
                setPlaceDetails(null);
              }}>
                <X size={24} color={theme.textSecondary} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: theme.text }]} numberOfLines={1}>
                {selectedStore.name}
              </Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.modalContent}>
              <Image 
                source={{ uri: selectedStore.image }} 
                style={styles.modalImage} 
                contentFit="cover" 
              />

              <View style={[styles.storeInfoBanner, { backgroundColor: isDark ? "#0C4A6E" : "#E0F2FE" }]}>
                <View style={styles.storeInfoRow}>
                  <MapPin size={14} color={POOL_COLOR} />
                  <Text style={[styles.storeInfoText, { color: theme.textSecondary }]} numberOfLines={2}>
                    {placeDetails?.formatted_address || selectedStore.address}
                  </Text>
                </View>
                
                {(placeDetails?.formatted_phone_number || ('phone' in selectedStore && selectedStore.phone)) && (
                  <TouchableOpacity 
                    style={styles.storeInfoRow}
                    onPress={() => handleCall(placeDetails?.formatted_phone_number || ('phone' in selectedStore ? selectedStore.phone : ''))}
                  >
                    <Phone size={14} color={POOL_COLOR} />
                    <Text style={[styles.storeInfoText, { color: POOL_COLOR }]}>
                      {placeDetails?.formatted_phone_number || ('phone' in selectedStore ? selectedStore.phone : '')}
                    </Text>
                  </TouchableOpacity>
                )}

                {placeDetails?.opening_hours?.weekday_text ? (
                  <View style={styles.hoursContainer}>
                    <View style={styles.storeInfoRow}>
                      <Clock size={14} color={POOL_COLOR} />
                      <Text style={[styles.storeInfoText, { color: theme.textSecondary, fontWeight: "600" as const }]}>
                        Hours
                      </Text>
                    </View>
                    {placeDetails.opening_hours.weekday_text.map((day, idx) => (
                      <Text key={idx} style={[styles.hoursText, { color: theme.textSecondary }]}>
                        {day}
                      </Text>
                    ))}
                  </View>
                ) : 'openHours' in selectedStore && (
                  <View style={styles.storeInfoRow}>
                    <Clock size={14} color={POOL_COLOR} />
                    <Text style={[styles.storeInfoText, { color: theme.textSecondary }]}>
                      {selectedStore.openHours}
                    </Text>
                  </View>
                )}

                {selectedStore.rating > 0 && (
                  <View style={styles.storeInfoRow}>
                    <Star size={14} color="#272D53" fill="#272D53" />
                    <Text style={[styles.storeInfoText, { color: theme.text }]}>
                      {selectedStore.rating.toFixed(1)} rating
                      {'reviewCount' in selectedStore && selectedStore.reviewCount > 0 && (
                        <Text style={{ color: theme.textTertiary }}> ({selectedStore.reviewCount} reviews)</Text>
                      )}
                    </Text>
                  </View>
                )}

                {placeDetails?.website && (
                  <TouchableOpacity 
                    style={styles.storeInfoRow}
                    onPress={() => handleWebsite(placeDetails.website!)}
                  >
                    <Globe size={14} color={POOL_COLOR} />
                    <Text style={[styles.storeInfoText, { color: POOL_COLOR }]} numberOfLines={1}>
                      Visit Website
                    </Text>
                    <ExternalLink size={12} color={POOL_COLOR} />
                  </TouchableOpacity>
                )}
              </View>

              {loadingDetails && (
                <View style={styles.detailsLoading}>
                  <ActivityIndicator size="small" color={POOL_COLOR} />
                  <Text style={[styles.detailsLoadingText, { color: theme.textSecondary }]}>
                    Loading store details...
                  </Text>
                </View>
              )}

              {!('placeId' in selectedStore) && 'inventory' in selectedStore && selectedStore.inventory && (
                <>
                  <Text style={[styles.inventoryTitle, { color: theme.text }]}>Pool Equipment & Supplies</Text>
                  {selectedStore.inventory.map((item) => (
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
                              <CheckCircle size={12} color={POOL_COLOR} />
                            ) : (
                              <AlertCircle size={12} color="#EF4444" />
                            )}
                            <Text style={[styles.stockText, { color: item.inStock ? POOL_COLOR : "#EF4444" }]}>
                              {item.inStock ? `${item.quantity} in stock` : "Out of stock"}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View style={styles.inventoryPricing}>
                        <Text style={[styles.inventoryPrice, { color: POOL_COLOR }]}>
                          ${item.price.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </>
              )}

              <View style={styles.modalActions}>
                {(placeDetails?.formatted_phone_number || ('phone' in selectedStore && selectedStore.phone)) && (
                  <TouchableOpacity
                    style={[styles.modalActionBtn, { backgroundColor: theme.surfaceSecondary }]}
                    onPress={() => handleCall(placeDetails?.formatted_phone_number || ('phone' in selectedStore ? selectedStore.phone : ''))}
                  >
                    <Phone size={18} color={POOL_COLOR} />
                    <Text style={[styles.modalActionText, { color: POOL_COLOR }]}>Call</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.modalActionBtn, { backgroundColor: POOL_COLOR, flex: 2 }]}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700" as const,
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  headerBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
  },
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 20,
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  statusBannerText: {
    fontSize: 13,
    fontWeight: "500" as const,
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
    paddingVertical: 12,
  },
  resultsCount: {
    fontSize: 13,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
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
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "500" as const,
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
  viewDetailsBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 40,
    borderRadius: 10,
  },
  viewDetailsText: {
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
    flex: 1,
    textAlign: "center",
    marginHorizontal: 8,
  },
  modalContent: {
    flex: 1,
  },
  modalImage: {
    width: "100%",
    height: 200,
  },
  storeInfoBanner: {
    margin: 20,
    padding: 14,
    borderRadius: 12,
    gap: 10,
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
  hoursContainer: {
    gap: 4,
  },
  hoursText: {
    fontSize: 12,
    marginLeft: 22,
  },
  detailsLoading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },
  detailsLoadingText: {
    fontSize: 13,
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
