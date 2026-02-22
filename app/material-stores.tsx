import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  Platform,
  Alert,
  Modal,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import {
  Search,
  MapPin,
  Phone,
  Navigation,
  Clock,
  Star,
  X,
  Check,
  ShoppingBag,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";
import LocationBanner from "@/components/LocationBanner";
import { Store, MaterialInventory } from "@/types";
import { mockStores } from "@/mocks/stores";

export default function StoresScreen() {
  const params = useLocalSearchParams();
  const searchMaterial = params.material as string | undefined;
  
  const [searchQuery, setSearchQuery] = useState(searchMaterial || "");
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [holdItem, setHoldItem] = useState<MaterialInventory | null>(null);
  const [holdQuantity, setHoldQuantity] = useState("1");

  const filteredStores = searchQuery
    ? mockStores.filter((store) => {
        const hasMatchingInventory = store.inventory?.some((item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return (
          store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          store.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          hasMatchingInventory
        );
      })
    : mockStores;

  const handleCall = (phone: string) => {
    const phoneNumber = phone.replace(/[^0-9]/g, "");
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleDirections = (store: Store) => {
    const address = encodeURIComponent(store.address);
    const url = Platform.select({
      ios: `maps:?daddr=${address}`,
      android: `google.navigation:q=${address}`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${address}`,
    });
    Linking.openURL(url);
  };

  const handleHoldForPickup = (store: Store, item: MaterialInventory) => {
    setSelectedStore(store);
    setHoldItem(item);
    setHoldQuantity("1");
    setShowHoldModal(true);
  };

  const confirmHold = () => {
    if (!selectedStore || !holdItem) return;
    
    Alert.alert(
      "Hold Confirmed",
      `${holdQuantity} x ${holdItem.name} will be held at ${selectedStore.name}. Please call the store to confirm pickup time.`,
      [
        {
          text: "Call Store",
          onPress: () => handleCall(selectedStore.phone),
        },
        {
          text: "Done",
          style: "cancel",
        },
      ]
    );
    setShowHoldModal(false);
  };

  const getMatchingInventory = (store: Store) => {
    if (!searchQuery) return store.inventory || [];
    return (
      store.inventory?.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) || []
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Nearby Stores",
          headerTitleStyle: { fontWeight: "600", color: Colors.navy },
          headerLeft: () => <BackButton />,
        }}
      />

      <View style={styles.searchSection}>
        <View style={styles.searchInputWrapper}>
          <Search size={20} color="#9CA3AF" strokeWidth={1.5} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search materials or stores..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <X size={18} color="#9CA3AF" strokeWidth={1.5} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <LocationBanner />

        {searchQuery && (
          <Text style={styles.resultsText}>
            {filteredStores.length} store{filteredStores.length !== 1 ? "s" : ""} found
            {searchQuery && ` for "${searchQuery}"`}
          </Text>
        )}

        {filteredStores.map((store) => {
          const matchingItems = getMatchingInventory(store);
          
          return (
            <View key={store.id} style={styles.storeCard}>
              <View style={styles.storeHeader}>
                <Image
                  source={{ uri: store.image }}
                  style={styles.storeImage}
                  contentFit="cover"
                />
                <View style={styles.storeInfo}>
                  <View style={styles.storeNameRow}>
                    <Text style={styles.storeName}>{store.name}</Text>
                    <View style={styles.ratingBadge}>
                      <Star size={12} color="#272D53" fill="#272D53" />
                      <Text style={styles.ratingText}>{store.rating}</Text>
                    </View>
                  </View>
                  <View style={styles.storeAddressRow}>
                    <MapPin size={14} color="#6B7280" strokeWidth={1.5} />
                    <Text style={styles.storeAddress} numberOfLines={1}>
                      {store.address}
                    </Text>
                  </View>
                  <View style={styles.storeMetaRow}>
                    <View style={styles.distanceBadge}>
                      <Navigation size={12} color={Colors.navy} strokeWidth={1.5} />
                      <Text style={styles.distanceText}>{store.distance}</Text>
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

              {matchingItems.length > 0 && searchQuery && (
                <View style={styles.inventorySection}>
                  <Text style={styles.inventoryTitle}>Available Items</Text>
                  {matchingItems.map((item) => (
                    <View key={item.id} style={styles.inventoryItem}>
                      <View style={styles.inventoryLeft}>
                        <View style={[styles.stockIndicator, !item.inStock && styles.outOfStock]} />
                        <View>
                          <Text style={styles.inventoryName}>{item.name}</Text>
                          <Text style={styles.inventoryMeta}>
                            {item.inStock ? `${item.quantity} in stock` : "Out of stock"}
                            {item.aisle && ` • Aisle ${item.aisle}`}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.inventoryRight}>
                        <Text style={styles.inventoryPrice}>${item.price.toFixed(2)}</Text>
                        {item.inStock && (
                          <TouchableOpacity
                            style={styles.holdButton}
                            onPress={() => handleHoldForPickup(store, item)}
                          >
                            <ShoppingBag size={14} color="#FFFFFF" strokeWidth={2} />
                            <Text style={styles.holdButtonText}>Hold</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleCall(store.phone)}
                >
                  <Phone size={18} color={Colors.navy} strokeWidth={1.5} />
                  <Text style={styles.actionButtonText}>Call</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.directionsButton]}
                  onPress={() => handleDirections(store)}
                >
                  <Navigation size={18} color="#FFFFFF" strokeWidth={1.5} />
                  <Text style={styles.directionsButtonText}>Directions</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal
        visible={showHoldModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowHoldModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowHoldModal(false)}>
              <X size={24} color="#6B7280" strokeWidth={1.5} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Hold for Pickup</Text>
            <View style={{ width: 24 }} />
          </View>

          {selectedStore && holdItem && (
            <View style={styles.modalContent}>
              <View style={styles.holdStoreInfo}>
                <Image
                  source={{ uri: selectedStore.image }}
                  style={styles.holdStoreImage}
                  contentFit="cover"
                />
                <View>
                  <Text style={styles.holdStoreName}>{selectedStore.name}</Text>
                  <Text style={styles.holdStoreAddress}>{selectedStore.address}</Text>
                </View>
              </View>

              <View style={styles.holdItemCard}>
                <Text style={styles.holdItemName}>{holdItem.name}</Text>
                <Text style={styles.holdItemPrice}>${holdItem.price.toFixed(2)} each</Text>
                
                <View style={styles.quantitySelector}>
                  <Text style={styles.quantityLabel}>Quantity</Text>
                  <View style={styles.quantityControls}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => setHoldQuantity(Math.max(1, parseInt(holdQuantity) - 1).toString())}
                    >
                      <Text style={styles.quantityButtonText}>−</Text>
                    </TouchableOpacity>
                    <TextInput
                      style={styles.quantityInput}
                      value={holdQuantity}
                      onChangeText={setHoldQuantity}
                      keyboardType="number-pad"
                    />
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => setHoldQuantity((parseInt(holdQuantity) + 1).toString())}
                    >
                      <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.holdTotal}>
                  <Text style={styles.holdTotalLabel}>Total</Text>
                  <Text style={styles.holdTotalAmount}>
                    ${(holdItem.price * parseInt(holdQuantity || "0")).toFixed(2)}
                  </Text>
                </View>
              </View>

              <TouchableOpacity style={styles.confirmHoldButton} onPress={confirmHold}>
                <Check size={20} color="#FFFFFF" strokeWidth={2} />
                <Text style={styles.confirmHoldText}>Confirm Hold & Call Store</Text>
              </TouchableOpacity>

              <Text style={styles.holdNote}>
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
    backgroundColor: "#F5F5F7",
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#1F2937",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  resultsText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },
  storeCard: {
    backgroundColor: "#FFFFFF",
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
    marginBottom: 4,
  },
  storeName: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E8E9EE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#92400E",
  },
  storeAddressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  storeAddress: {
    flex: 1,
    fontSize: 13,
    color: "#6B7280",
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
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: Colors.navy,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  closedBadge: {
    backgroundColor: "#FEF2F2",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: "#10B981",
  },
  closedText: {
    color: "#EF4444",
  },
  inventorySection: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    marginTop: 4,
    paddingTop: 12,
  },
  inventoryTitle: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#374151",
    marginBottom: 10,
  },
  inventoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
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
    color: "#1F2937",
  },
  inventoryMeta: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  inventoryRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  inventoryPrice: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  holdButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.navy,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  holdButtonText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  actionButtons: {
    flexDirection: "row",
    padding: 14,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.navy,
  },
  directionsButton: {
    backgroundColor: Colors.navy,
  },
  directionsButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#F5F5F7",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  modalContent: {
    padding: 16,
  },
  holdStoreInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#FFFFFF",
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
    color: "#1F2937",
  },
  holdStoreAddress: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },
  holdItemCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  holdItemName: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 4,
  },
  holdItemPrice: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
  quantitySelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  quantityLabel: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: "#374151",
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
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: "500" as const,
    color: "#374151",
  },
  quantityInput: {
    width: 50,
    height: 36,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
    backgroundColor: "#F3F4F6",
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
    color: "#374151",
  },
  holdTotalAmount: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: "#1F2937",
  },
  confirmHoldButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.navy,
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  confirmHoldText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  holdNote: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 18,
  },
});
