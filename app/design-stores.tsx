import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Linking,
} from "react-native";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import {
  Search,
  Filter,
  X,
  MapPin,
  Phone,
  Clock,
  Star,
  Navigation,
  Percent,
  CheckCircle,
  ChevronRight,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { mockDesignStores, DesignStore } from "@/mocks/interior-designers";

const categories = [
  "All",
  "Furniture",
  "Decor",
  "Lighting",
  "Textiles",
  "Art",
  "Flooring",
  "Kitchen & Bath",
  "Outdoor",
];

export default function DesignStoresScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStore, setSelectedStore] = useState<DesignStore | null>(null);
  const [showTradeOnly, setShowTradeOnly] = useState(false);

  const filteredStores = mockDesignStores.filter((store) => {
    const matchesSearch = store.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" ||
      store.category.toLowerCase() === selectedCategory.toLowerCase().replace(" & ", "_");
    const matchesTrade = !showTradeOnly || store.tradeProgram;
    return matchesSearch && matchesCategory && matchesTrade;
  });

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleDirections = (store: DesignStore) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Design Stores",
          headerStyle: { backgroundColor: Colors.background },
          headerShadowVisible: false,
        }}
      />

      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search stores..."
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={[styles.tradeButton, showTradeOnly && styles.tradeButtonActive]}
          onPress={() => setShowTradeOnly(!showTradeOnly)}
        >
          <Percent size={18} color={showTradeOnly ? Colors.white : "#EC4899"} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryFilters}
        contentContainerStyle={styles.categoryFiltersContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === category && styles.categoryChipTextActive,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.resultCount}>
          {filteredStores.length} store{filteredStores.length !== 1 ? "s" : ""} nearby
        </Text>

        {filteredStores.map((store) => (
          <TouchableOpacity
            key={store.id}
            style={styles.storeCard}
            onPress={() => setSelectedStore(store)}
          >
            <Image
              source={{ uri: store.image }}
              style={styles.storeImage}
              contentFit="cover"
            />
            <View style={styles.storeContent}>
              <View style={styles.storeHeader}>
                <View style={styles.storeInfo}>
                  <Text style={styles.storeName}>{store.name}</Text>
                  <Text style={styles.storeCategory}>
                    {store.category.charAt(0).toUpperCase() +
                      store.category.slice(1).replace("_", " & ")}
                  </Text>
                </View>
                <View style={styles.ratingBadge}>
                  <Star size={12} color="#272D53" fill="#272D53" />
                  <Text style={styles.ratingText}>{store.rating}</Text>
                </View>
              </View>

              <View style={styles.storeMeta}>
                <View style={styles.metaItem}>
                  <MapPin size={14} color={Colors.textSecondary} />
                  <Text style={styles.metaText}>{store.distance}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Clock size={14} color={store.isOpen ? "#10B981" : Colors.error} />
                  <Text
                    style={[
                      styles.metaText,
                      { color: store.isOpen ? "#10B981" : Colors.error },
                    ]}
                  >
                    {store.isOpen ? "Open" : "Closed"} · {store.openHours}
                  </Text>
                </View>
              </View>

              {store.tradeProgram && (
                <View style={styles.tradeBadge}>
                  <CheckCircle size={12} color="#10B981" />
                  <Text style={styles.tradeBadgeText}>
                    Trade Program ({store.tradeDiscount}% off)
                  </Text>
                </View>
              )}

              <View style={styles.cardFooter}>
                <Text style={styles.viewDetails}>View Details</Text>
                <ChevronRight size={16} color={Colors.primary} />
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {filteredStores.length === 0 && (
          <View style={styles.emptyState}>
            <MapPin size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Stores Found</Text>
            <Text style={styles.emptyText}>
              Try adjusting your search or filters
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal
        visible={!!selectedStore}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedStore(null)}
      >
        {selectedStore && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setSelectedStore(null)}
              >
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Store Details</Text>
              <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.modalContent}>
              <Image
                source={{ uri: selectedStore.image }}
                style={styles.modalImage}
                contentFit="cover"
              />

              <View style={styles.modalStoreInfo}>
                <View style={styles.modalStoreHeader}>
                  <View>
                    <Text style={styles.modalStoreName}>{selectedStore.name}</Text>
                    <Text style={styles.modalStoreCategory}>
                      {selectedStore.category.charAt(0).toUpperCase() +
                        selectedStore.category.slice(1).replace("_", " & ")}
                    </Text>
                  </View>
                  <View style={styles.modalRating}>
                    <Star size={18} color="#272D53" fill="#272D53" />
                    <Text style={styles.modalRatingText}>{selectedStore.rating}</Text>
                  </View>
                </View>

                <View style={styles.statusRow}>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: selectedStore.isOpen ? "#D1FAE5" : "#FEE2E2",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: selectedStore.isOpen ? "#10B981" : Colors.error },
                      ]}
                    >
                      {selectedStore.isOpen ? "Open Now" : "Closed"}
                    </Text>
                  </View>
                  <Text style={styles.hoursText}>{selectedStore.openHours}</Text>
                </View>

                {selectedStore.tradeProgram && (
                  <View style={styles.tradeCard}>
                    <View style={styles.tradeCardHeader}>
                      <Percent size={20} color="#10B981" />
                      <Text style={styles.tradeCardTitle}>Trade Program</Text>
                    </View>
                    <Text style={styles.tradeCardDiscount}>
                      {selectedStore.tradeDiscount}% Designer Discount
                    </Text>
                    <Text style={styles.tradeCardNote}>
                      Show your trade credentials at checkout
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Location</Text>
                <View style={styles.addressCard}>
                  <MapPin size={20} color="#EC4899" />
                  <View style={styles.addressInfo}>
                    <Text style={styles.addressText}>{selectedStore.address}</Text>
                    <Text style={styles.distanceText}>{selectedStore.distance} away</Text>
                  </View>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => handleDirections(selectedStore)}
                >
                  <Navigation size={18} color={Colors.white} />
                  <Text style={styles.primaryButtonText}>Get Directions</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => handleCall(selectedStore.phone)}
                >
                  <Phone size={18} color="#EC4899" />
                  <Text style={styles.secondaryButtonText}>Call Store</Text>
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
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
  },
  tradeButton: {
    width: 48,
    height: 48,
    backgroundColor: "#FCE7F3",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  tradeButtonActive: {
    backgroundColor: "#EC4899",
  },
  categoryFilters: {
    maxHeight: 44,
    marginBottom: 8,
  },
  categoryFiltersContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: "#EC4899",
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.textSecondary,
  },
  categoryChipTextActive: {
    color: Colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  resultCount: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
    marginTop: 8,
  },
  storeCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  storeImage: {
    width: "100%",
    height: 140,
  },
  storeContent: {
    padding: 14,
  },
  storeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  storeCategory: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8E9EE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#272D53",
  },
  storeMeta: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  tradeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  tradeBadgeText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#10B981",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  viewDetails: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.text,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  modalClose: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  modalContent: {
    flex: 1,
  },
  modalImage: {
    width: "100%",
    height: 200,
  },
  modalStoreInfo: {
    padding: 20,
  },
  modalStoreHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  modalStoreName: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  modalStoreCategory: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  modalRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  modalRatingText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#272D53",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  hoursText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  tradeCard: {
    backgroundColor: "#D1FAE5",
    borderRadius: 16,
    padding: 16,
  },
  tradeCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  tradeCardTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#065F46",
  },
  tradeCardDiscount: {
    fontSize: 22,
    fontWeight: "800" as const,
    color: "#10B981",
  },
  tradeCardNote: {
    fontSize: 13,
    color: "#065F46",
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 14,
  },
  addressCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  addressInfo: {
    flex: 1,
  },
  addressText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
  distanceText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  actionButtons: {
    paddingHorizontal: 20,
    gap: 12,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EC4899",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FCE7F3",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#EC4899",
  },
});
