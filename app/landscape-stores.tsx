import React, { useState, useMemo } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Stack } from "expo-router";
import {
  Search,
  X,
  Trees,
  MapPin,
  Phone,
  Clock,
  Star,
  Navigation,
  ChevronRight,
  Truck,
  Percent,
  Package,
  Leaf,
  Droplets,
  Mountain,
  Shovel,
  Warehouse,
  CheckCircle,
  AlertCircle,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import {
  mockLandscapeStores,
  LandscapeStore,
  storeTypeLabels,
  storeTypeColors,
} from "@/mocks/landscaping";

type FilterType = "all" | "nursery" | "garden_center" | "hardscape" | "irrigation" | "equipment_rental" | "mulch_stone";

const storeTypeIcons: Record<string, React.ComponentType<any>> = {
  nursery: Leaf,
  garden_center: Trees,
  hardscape: Mountain,
  irrigation: Droplets,
  equipment_rental: Shovel,
  mulch_stone: Warehouse,
};

export default function LandscapeStoresScreen() {
  const { theme, isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");
  const [selectedStore, setSelectedStore] = useState<LandscapeStore | null>(null);
  const [showInventory, setShowInventory] = useState(false);

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

  const filteredStores = useMemo(() => {
    let stores = mockLandscapeStores;
    
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
    
    return stores.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  }, [selectedFilter, searchQuery]);

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone.replace(/\D/g, "")}`);
  };

  const handleDirections = (store: LandscapeStore) => {
    const url = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(store.address)}`,
      android: `geo:0,0?q=${encodeURIComponent(store.address)}`,
      default: `https://maps.google.com/?q=${encodeURIComponent(store.address)}`,
    });
    Linking.openURL(url);
  };

  const filterOptions: { id: FilterType; label: string }[] = [
    { id: "all", label: "All Stores" },
    { id: "nursery", label: "Nurseries" },
    { id: "garden_center", label: "Garden Centers" },
    { id: "hardscape", label: "Stone & Hardscape" },
    { id: "irrigation", label: "Irrigation" },
    { id: "mulch_stone", label: "Mulch & Soil" },
    { id: "equipment_rental", label: "Equipment" },
  ];

  const renderStoreCard = (store: LandscapeStore) => {
    const StoreIcon = storeTypeIcons[store.storeType] || Trees;
    const storeColor = storeTypeColors[store.storeType] || "#22C55E";
    
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
              <Navigation size={12} color="#22C55E" />
              <Text style={[styles.distanceText, { color: "#22C55E" }]}>{store.distance}</Text>
            </View>
            <View style={styles.ratingRow}>
              <Star size={12} color="#272D53" fill="#272D53" />
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
                <Text style={[styles.featureText, { color: "#8B5CF6" }]}>Bulk Pricing</Text>
              </View>
            )}
          </View>

          <View style={styles.storeActions}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: theme.surfaceSecondary }]}
              onPress={() => handleCall(store.phone)}
            >
              <Phone size={16} color="#22C55E" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: theme.surfaceSecondary }]}
              onPress={() => handleDirections(store)}
            >
              <Navigation size={16} color="#22C55E" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewInventoryBtn, { backgroundColor: "#22C55E" }]}
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
        <View style={[styles.header, dynamicStyles.header]}>
          <View>
            <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>Landscape Stores</Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              Nurseries, suppliers & equipment
            </Text>
          </View>
          <View style={[styles.headerBadge, { backgroundColor: "#22C55E" }]}>
            <Trees size={20} color="#FFF" />
          </View>
        </View>

        <View style={[styles.searchSection, { backgroundColor: theme.surface }]}>
          <View style={[styles.searchInputWrapper, dynamicStyles.searchInput]}>
            <Search size={18} color={theme.textTertiary} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Search stores, plants, materials..."
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
              <View style={[styles.storeInfoBanner, { backgroundColor: isDark ? "#064E3B" : "#ECFDF5" }]}>
                <View style={styles.storeInfoRow}>
                  <MapPin size={14} color="#22C55E" />
                  <Text style={[styles.storeInfoText, { color: theme.textSecondary }]} numberOfLines={1}>
                    {selectedStore.address}
                  </Text>
                </View>
                <View style={styles.storeInfoRow}>
                  <Clock size={14} color="#22C55E" />
                  <Text style={[styles.storeInfoText, { color: theme.textSecondary }]}>
                    {selectedStore.openHours}
                  </Text>
                </View>
                {selectedStore.proDiscount && (
                  <View style={styles.storeInfoRow}>
                    <Percent size={14} color="#22C55E" />
                    <Text style={[styles.storeInfoText, { color: "#22C55E", fontWeight: "600" as const }]}>
                      {selectedStore.proDiscount}% Pro Discount Available
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
                        Aisle: {item.aisle}
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
                    <Text style={[styles.inventoryPrice, { color: "#22C55E" }]}>
                      ${item.price.toFixed(2)}
                    </Text>
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
                  <Phone size={18} color="#22C55E" />
                  <Text style={[styles.modalActionText, { color: "#22C55E" }]}>Call Store</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalActionBtn, { backgroundColor: "#22C55E" }]}
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
    backgroundColor: "#22C55E",
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
