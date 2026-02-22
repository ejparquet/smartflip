import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  Modal,
  Linking,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Package,
  Truck,
  MapPin,
  Plus,
  X,
  Check,
  Calendar,
  Phone,
  Building2,
  CheckCircle2,
  Circle,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";

interface Delivery {
  id: string;
  vendor: string;
  vendorPhone?: string;
  items: string;
  expectedDate: string;
  status: "ordered" | "shipped" | "in_transit" | "delivered";
  trackingNumber?: string;
  projectName?: string;
  notes?: string;
}

const DELIVERY_STORAGE_KEY = "smartflip_deliveries";

const mockDeliveries: Delivery[] = [
  {
    id: "1",
    vendor: "Home Depot",
    vendorPhone: "(555) 123-4567",
    items: "Lumber (2x4x8), Plywood Sheets",
    expectedDate: "2025-01-26",
    status: "in_transit",
    trackingNumber: "HD-789456123",
    projectName: "Kitchen Renovation",
  },
  {
    id: "2",
    vendor: "Lowe's",
    vendorPhone: "(555) 987-6543",
    items: "Paint (5 gal), Brushes, Rollers",
    expectedDate: "2025-01-27",
    status: "shipped",
    trackingNumber: "LW-456123789",
    projectName: "Bathroom Remodel",
  },
  {
    id: "3",
    vendor: "Ferguson Plumbing",
    vendorPhone: "(555) 456-7890",
    items: "PVC Pipes, Fittings, Valves",
    expectedDate: "2025-01-25",
    status: "delivered",
    projectName: "Kitchen Renovation",
  },
  {
    id: "4",
    vendor: "ABC Electric Supply",
    items: "Wire (100ft), Outlets, Switches",
    expectedDate: "2025-01-28",
    status: "ordered",
    projectName: "Whole House Rewire",
  },
];

const statusConfig = {
  ordered: { label: "Ordered", color: "#6B7280", icon: Circle },
  shipped: { label: "Shipped", color: "#3B82F6", icon: Package },
  in_transit: { label: "In Transit", color: "#272D53", icon: Truck },
  delivered: { label: "Delivered", color: "#10B981", icon: CheckCircle2 },
};

export default function DeliveryTrackingScreen() {
  const router = useRouter();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadDeliveries();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveDeliveries(deliveries);
    }
  }, [deliveries, isLoaded]);

  const loadDeliveries = async () => {
    try {
      const stored = await AsyncStorage.getItem(DELIVERY_STORAGE_KEY);
      if (stored) {
        setDeliveries(JSON.parse(stored));
      } else {
        setDeliveries(mockDeliveries);
        await AsyncStorage.setItem(DELIVERY_STORAGE_KEY, JSON.stringify(mockDeliveries));
      }
    } catch (error) {
      console.log("Error loading deliveries:", error);
      setDeliveries(mockDeliveries);
    } finally {
      setIsLoaded(true);
    }
  };

  const saveDeliveries = async (data: Delivery[]) => {
    try {
      await AsyncStorage.setItem(DELIVERY_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.log("Error saving deliveries:", error);
    }
  };
  const [newDelivery, setNewDelivery] = useState({
    vendor: "",
    vendorPhone: "",
    items: "",
    expectedDate: "",
    trackingNumber: "",
    projectName: "",
    notes: "",
  });

  const filteredDeliveries = deliveries.filter((d) => {
    if (filterStatus === "all") return true;
    return d.status === filterStatus;
  });

  const handleAddDelivery = () => {
    if (!newDelivery.vendor || !newDelivery.items) {
      Alert.alert("Error", "Please fill in vendor and items");
      return;
    }
    const delivery: Delivery = {
      id: Date.now().toString(),
      ...newDelivery,
      status: "ordered",
    };
    setDeliveries([delivery, ...deliveries]);
    setNewDelivery({
      vendor: "",
      vendorPhone: "",
      items: "",
      expectedDate: "",
      trackingNumber: "",
      projectName: "",
      notes: "",
    });
    setShowAddModal(false);
  };

  const updateStatus = (id: string, newStatus: Delivery["status"]) => {
    const updated = deliveries.map((d) => (d.id === id ? { ...d, status: newStatus } : d));
    setDeliveries(updated);
  };

  const handleCallVendor = (phone: string, vendorName: string) => {
    const phoneNumber = phone.replace(/[^0-9+]/g, "");
    const url = Platform.OS === "ios" ? `telprompt:${phoneNumber}` : `tel:${phoneNumber}`;
    
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert(
            "Call Vendor",
            `Would you like to call ${vendorName} at ${phone}?`,
            [
              { text: "Cancel", style: "cancel" },
              { text: "Copy Number", onPress: () => {
                if (Platform.OS !== "web") {
                  Alert.alert("Phone Number", phone);
                }
              }},
            ]
          );
        }
      })
      .catch((err) => console.log("Error checking phone support:", err));
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.headerTitle}>Delivery Tracking</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Plus size={24} color={Colors.navy} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {["all", "ordered", "shipped", "in_transit", "delivered"].map(
              (status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterChip,
                    filterStatus === status && styles.filterChipActive,
                  ]}
                  onPress={() => setFilterStatus(status)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      filterStatus === status && styles.filterChipTextActive,
                    ]}
                  >
                    {status === "all"
                      ? "All"
                      : status === "in_transit"
                      ? "In Transit"
                      : status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </ScrollView>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredDeliveries.length === 0 ? (
            <View style={styles.emptyState}>
              <Package size={48} color="#D1D5DB" strokeWidth={1.5} />
              <Text style={styles.emptyText}>No deliveries found</Text>
            </View>
          ) : (
            filteredDeliveries.map((delivery) => {
              const config = statusConfig[delivery.status];
              const StatusIcon = config.icon;
              return (
                <View key={delivery.id} style={styles.deliveryCard}>
                  <View style={styles.deliveryHeader}>
                    <View style={styles.vendorRow}>
                      <Building2
                        size={18}
                        color={Colors.navy}
                        strokeWidth={1.5}
                      />
                      <Text style={styles.vendorName}>{delivery.vendor}</Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: `${config.color}15` },
                      ]}
                    >
                      <StatusIcon
                        size={14}
                        color={config.color}
                        strokeWidth={2}
                      />
                      <Text style={[styles.statusText, { color: config.color }]}>
                        {config.label}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.itemsText}>{delivery.items}</Text>

                  <View style={styles.deliveryMeta}>
                    {delivery.projectName && (
                      <View style={styles.metaItem}>
                        <MapPin size={14} color="#6B7280" strokeWidth={1.5} />
                        <Text style={styles.metaText}>
                          {delivery.projectName}
                        </Text>
                      </View>
                    )}
                    {delivery.expectedDate && (
                      <View style={styles.metaItem}>
                        <Calendar size={14} color="#6B7280" strokeWidth={1.5} />
                        <Text style={styles.metaText}>
                          Expected: {delivery.expectedDate}
                        </Text>
                      </View>
                    )}
                    {delivery.trackingNumber && (
                      <View style={styles.metaItem}>
                        <Package size={14} color="#6B7280" strokeWidth={1.5} />
                        <Text style={styles.metaText}>
                          {delivery.trackingNumber}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.actionRow}>
                    {delivery.vendorPhone && (
                      <TouchableOpacity 
                        style={styles.callButton}
                        onPress={() => handleCallVendor(delivery.vendorPhone!, delivery.vendor)}
                      >
                        <Phone size={16} color={Colors.navy} strokeWidth={1.5} />
                        <Text style={styles.callButtonText}>Call Vendor</Text>
                      </TouchableOpacity>
                    )}
                    {delivery.status !== "delivered" && (
                      <TouchableOpacity
                        style={styles.markDeliveredButton}
                        onPress={() => updateStatus(delivery.id, "delivered")}
                      >
                        <Check size={16} color="#FFFFFF" strokeWidth={2} />
                        <Text style={styles.markDeliveredText}>
                          Mark Delivered
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>

      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <X size={24} color="#6B7280" strokeWidth={1.5} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Delivery</Text>
            <TouchableOpacity onPress={handleAddDelivery}>
              <Check size={24} color={Colors.navy} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Vendor Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Home Depot"
                placeholderTextColor="#9CA3AF"
                value={newDelivery.vendor}
                onChangeText={(text) =>
                  setNewDelivery({ ...newDelivery, vendor: text })
                }
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Vendor Phone</Text>
              <TextInput
                style={styles.input}
                placeholder="(555) 123-4567"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                value={newDelivery.vendorPhone}
                onChangeText={(text) =>
                  setNewDelivery({ ...newDelivery, vendorPhone: text })
                }
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Items *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="List the items being delivered"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                value={newDelivery.items}
                onChangeText={(text) =>
                  setNewDelivery({ ...newDelivery, items: text })
                }
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Expected Delivery Date</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9CA3AF"
                value={newDelivery.expectedDate}
                onChangeText={(text) =>
                  setNewDelivery({ ...newDelivery, expectedDate: text })
                }
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tracking Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter tracking number"
                placeholderTextColor="#9CA3AF"
                value={newDelivery.trackingNumber}
                onChangeText={(text) =>
                  setNewDelivery({ ...newDelivery, trackingNumber: text })
                }
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Project Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Link to a project"
                placeholderTextColor="#9CA3AF"
                value={newDelivery.projectName}
                onChangeText={(text) =>
                  setNewDelivery({ ...newDelivery, projectName: text })
                }
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Additional notes"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                value={newDelivery.notes}
                onChangeText={(text) =>
                  setNewDelivery({ ...newDelivery, notes: text })
                }
              />
            </View>
          </ScrollView>
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
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  filterRow: {
    backgroundColor: "transparent",
    paddingVertical: 12,
    paddingHorizontal: 16,
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
  filterChipActive: {
    backgroundColor: Colors.navy,
    borderColor: Colors.navy,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#6B7280",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#9CA3AF",
    marginTop: 12,
  },
  deliveryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  deliveryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  vendorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  vendorName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  itemsText: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 12,
    lineHeight: 20,
  },
  deliveryMeta: {
    gap: 6,
    marginBottom: 14,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: "#6B7280",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 12,
  },
  callButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
  },
  callButtonText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.navy,
  },
  markDeliveredButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.navy,
  },
  markDeliveredText: {
    fontSize: 14,
    fontWeight: "500" as const,
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
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  modalContent: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1F2937",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
});
