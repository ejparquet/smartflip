import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Image } from "expo-image";
import {
  ArrowLeft,
  Search,
  Plus,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  Calendar,
  ChevronRight,
  Droplets,
  Phone,
  Wrench,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";

type MaterialStatus = "in_stock" | "low_stock" | "ordered" | "in_transit";
type TabType = "pipes" | "fittings" | "fixtures" | "tools" | "orders";

interface PlumberMaterial {
  id: string;
  name: string;
  category: TabType;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  status: MaterialStatus;
  supplier: string;
  supplierPhone?: string;
  reorderLevel: number;
  expectedDelivery?: string;
  image: string;
  description?: string;
}

interface MaterialOrder {
  id: string;
  orderNumber: string;
  supplier: string;
  supplierLogo: string;
  items: { name: string; quantity: number; unit: string }[];
  totalAmount: number;
  status: "pending" | "confirmed" | "shipped" | "delivered";
  orderDate: string;
  expectedDelivery: string;
  trackingNumber?: string;
}

const plumberMaterials: PlumberMaterial[] = [
  {
    id: "pm1",
    name: "PEX Pipe 1/2\" (100ft roll)",
    category: "pipes",
    quantity: 12,
    unit: "rolls",
    pricePerUnit: 45.00,
    status: "in_stock",
    supplier: "Ferguson Plumbing",
    supplierPhone: "(617) 555-2006",
    reorderLevel: 5,
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=200",
    description: "Flexible cross-linked polyethylene tubing",
  },
  {
    id: "pm2",
    name: "PEX Pipe 3/4\" (100ft roll)",
    category: "pipes",
    quantity: 8,
    unit: "rolls",
    pricePerUnit: 65.00,
    status: "in_stock",
    supplier: "Ferguson Plumbing",
    supplierPhone: "(617) 555-2006",
    reorderLevel: 4,
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=200",
  },
  {
    id: "pm3",
    name: "Copper Pipe 1/2\" (10ft)",
    category: "pipes",
    quantity: 25,
    unit: "pieces",
    pricePerUnit: 18.50,
    status: "in_stock",
    supplier: "Plumbing Warehouse",
    supplierPhone: "(617) 555-3001",
    reorderLevel: 10,
    image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=200",
  },
  {
    id: "pm4",
    name: "ABS Drain Pipe 3\" (10ft)",
    category: "pipes",
    quantity: 6,
    unit: "pieces",
    pricePerUnit: 22.00,
    status: "low_stock",
    supplier: "Home Depot Pro",
    supplierPhone: "(617) 555-2001",
    reorderLevel: 8,
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200",
  },
  {
    id: "pm5",
    name: "PVC Pipe 4\" (10ft)",
    category: "pipes",
    quantity: 3,
    unit: "pieces",
    pricePerUnit: 28.00,
    status: "ordered",
    supplier: "Plumbing Warehouse",
    supplierPhone: "(617) 555-3001",
    reorderLevel: 5,
    expectedDelivery: "2026-02-02",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200",
  },
  {
    id: "pm6",
    name: "PEX Crimp Fittings Kit (100pc)",
    category: "fittings",
    quantity: 4,
    unit: "kits",
    pricePerUnit: 89.00,
    status: "in_stock",
    supplier: "Ferguson Plumbing",
    supplierPhone: "(617) 555-2006",
    reorderLevel: 2,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200",
  },
  {
    id: "pm7",
    name: "Copper Sweat Fittings Assortment",
    category: "fittings",
    quantity: 6,
    unit: "kits",
    pricePerUnit: 125.00,
    status: "in_stock",
    supplier: "Plumbing Warehouse",
    supplierPhone: "(617) 555-3001",
    reorderLevel: 3,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200",
  },
  {
    id: "pm8",
    name: "SharkBite Push Fittings (25pc)",
    category: "fittings",
    quantity: 2,
    unit: "boxes",
    pricePerUnit: 175.00,
    status: "low_stock",
    supplier: "Ferguson Plumbing",
    supplierPhone: "(617) 555-2006",
    reorderLevel: 3,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200",
  },
  {
    id: "pm9",
    name: "Ball Valve 1/2\" (10pc)",
    category: "fittings",
    quantity: 8,
    unit: "packs",
    pricePerUnit: 45.00,
    status: "in_stock",
    supplier: "Plumbing Warehouse",
    supplierPhone: "(617) 555-3001",
    reorderLevel: 4,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200",
  },
  {
    id: "pm10",
    name: "Toilet - Kohler Wellworth",
    category: "fixtures",
    quantity: 3,
    unit: "units",
    pricePerUnit: 289.00,
    status: "in_stock",
    supplier: "Ferguson Plumbing",
    supplierPhone: "(617) 555-2006",
    reorderLevel: 2,
    image: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=200",
  },
  {
    id: "pm11",
    name: "Kitchen Faucet - Delta",
    category: "fixtures",
    quantity: 2,
    unit: "units",
    pricePerUnit: 245.00,
    status: "in_stock",
    supplier: "Ferguson Plumbing",
    supplierPhone: "(617) 555-2006",
    reorderLevel: 2,
    image: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=200",
  },
  {
    id: "pm12",
    name: "Water Heater 50 Gal",
    category: "fixtures",
    quantity: 1,
    unit: "unit",
    pricePerUnit: 850.00,
    status: "in_transit",
    supplier: "Ferguson Plumbing",
    supplierPhone: "(617) 555-2006",
    reorderLevel: 1,
    expectedDelivery: "2026-02-01",
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=200",
  },
  {
    id: "pm13",
    name: "Garbage Disposal - InSinkErator",
    category: "fixtures",
    quantity: 2,
    unit: "units",
    pricePerUnit: 189.00,
    status: "in_stock",
    supplier: "Plumbing Warehouse",
    supplierPhone: "(617) 555-3001",
    reorderLevel: 2,
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200",
  },
  {
    id: "pm14",
    name: "PEX Crimp Tool Set",
    category: "tools",
    quantity: 2,
    unit: "sets",
    pricePerUnit: 85.00,
    status: "in_stock",
    supplier: "Ferguson Plumbing",
    supplierPhone: "(617) 555-2006",
    reorderLevel: 1,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200",
  },
  {
    id: "pm15",
    name: "Pipe Cutter Set",
    category: "tools",
    quantity: 3,
    unit: "sets",
    pricePerUnit: 65.00,
    status: "in_stock",
    supplier: "Plumbing Warehouse",
    supplierPhone: "(617) 555-3001",
    reorderLevel: 2,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200",
  },
  {
    id: "pm16",
    name: "Drain Snake 50ft",
    category: "tools",
    quantity: 2,
    unit: "units",
    pricePerUnit: 125.00,
    status: "in_stock",
    supplier: "Plumbing Warehouse",
    supplierPhone: "(617) 555-3001",
    reorderLevel: 1,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200",
  },
];

const plumberOrders: MaterialOrder[] = [
  {
    id: "po1",
    orderNumber: "PLB-2026-0128",
    supplier: "Ferguson Plumbing",
    supplierLogo: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=200",
    items: [
      { name: "Water Heater 50 Gal", quantity: 1, unit: "unit" },
      { name: "PEX Pipe 1/2\" (100ft)", quantity: 5, unit: "rolls" },
    ],
    totalAmount: 1075.00,
    status: "shipped",
    orderDate: "2026-01-26",
    expectedDelivery: "2026-02-01",
    trackingNumber: "1Z999AA10123456789",
  },
  {
    id: "po2",
    orderNumber: "PLB-2026-0125",
    supplier: "Plumbing Warehouse",
    supplierLogo: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200",
    items: [
      { name: "PVC Pipe 4\" (10ft)", quantity: 10, unit: "pieces" },
      { name: "ABS Fittings Assortment", quantity: 2, unit: "kits" },
    ],
    totalAmount: 380.00,
    status: "confirmed",
    orderDate: "2026-01-25",
    expectedDelivery: "2026-02-02",
  },
  {
    id: "po3",
    orderNumber: "PLB-2026-0120",
    supplier: "Ferguson Plumbing",
    supplierLogo: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=200",
    items: [
      { name: "Toilet - Kohler Wellworth", quantity: 2, unit: "units" },
      { name: "Wax Ring Seals", quantity: 4, unit: "units" },
    ],
    totalAmount: 618.00,
    status: "delivered",
    orderDate: "2026-01-18",
    expectedDelivery: "2026-01-22",
  },
];

export default function PlumberMaterialsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("pipes");
  const [searchQuery, setSearchQuery] = useState("");

  const getStatusColor = (status: MaterialStatus | MaterialOrder["status"]) => {
    switch (status) {
      case "in_stock": return Colors.success;
      case "low_stock": return Colors.error;
      case "ordered":
      case "pending": return Colors.textSecondary;
      case "in_transit":
      case "confirmed":
      case "shipped": return "#3B82F6";
      case "delivered": return Colors.success;
      default: return Colors.textSecondary;
    }
  };

  const getStatusLabel = (status: MaterialStatus | MaterialOrder["status"]) => {
    switch (status) {
      case "in_stock": return "In Stock";
      case "low_stock": return "Low Stock";
      case "ordered": return "Ordered";
      case "in_transit": return "In Transit";
      case "pending": return "Pending";
      case "confirmed": return "Confirmed";
      case "shipped": return "Shipped";
      case "delivered": return "Delivered";
      default: return status;
    }
  };

  const getStatusIcon = (status: MaterialStatus | MaterialOrder["status"]) => {
    switch (status) {
      case "in_stock": return CheckCircle;
      case "low_stock": return AlertTriangle;
      case "ordered":
      case "pending": return Clock;
      case "in_transit":
      case "shipped": return Truck;
      case "confirmed": return CheckCircle;
      case "delivered": return CheckCircle;
      default: return Package;
    }
  };

  const filteredMaterials = useMemo(() => {
    if (activeTab === "orders") return [];
    return plumberMaterials.filter(m => {
      const matchesTab = m.category === activeTab;
      const matchesSearch = searchQuery === "" ||
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.supplier.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [activeTab, searchQuery]);

  const stats = useMemo(() => {
    const total = plumberMaterials.length;
    const lowStock = plumberMaterials.filter(m => m.status === "low_stock").length;
    const pending = plumberOrders.filter(o => o.status !== "delivered").length;
    const value = plumberMaterials.reduce((sum, m) => sum + (m.quantity * m.pricePerUnit), 0);
    return { total, lowStock, pending, value };
  }, []);

  const handleCallSupplier = (phone: string) => {
    const phoneUrl = `tel:${phone.replace(/[^0-9]/g, '')}`;
    Linking.openURL(phoneUrl).catch(() => {
      Alert.alert("Unable to Call", "Could not open the phone dialer.");
    });
  };

  const handleReorder = (material: PlumberMaterial) => {
    Alert.alert(
      "Reorder Material",
      `Order more ${material.name} from ${material.supplier}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Place Order",
          onPress: () => {
            Alert.alert("Order Placed", `Reorder for ${material.name} has been submitted to ${material.supplier}.`);
          },
        },
      ]
    );
  };

  const renderMaterialCard = (material: PlumberMaterial) => {
    const StatusIcon = getStatusIcon(material.status);
    const isLow = material.status === "low_stock" || material.quantity <= material.reorderLevel;

    return (
      <TouchableOpacity key={material.id} style={styles.materialCard}>
        <View style={styles.materialHeader}>
          <Image source={{ uri: material.image }} style={styles.materialImage} contentFit="cover" />
          <View style={styles.materialInfo}>
            <Text style={styles.materialName}>{material.name}</Text>
            <Text style={styles.materialSupplier}>{material.supplier}</Text>
            {material.description && (
              <Text style={styles.materialDesc} numberOfLines={1}>{material.description}</Text>
            )}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(material.status)}15` }]}>
            <StatusIcon size={12} color={getStatusColor(material.status)} />
            <Text style={[styles.statusText, { color: getStatusColor(material.status) }]}>
              {getStatusLabel(material.status)}
            </Text>
          </View>
        </View>

        <View style={styles.materialStats}>
          <View style={styles.materialStat}>
            <Text style={styles.statLabel}>Qty</Text>
            <Text style={[styles.statValue, isLow && { color: Colors.error }]}>
              {material.quantity} {material.unit}
            </Text>
          </View>
          <View style={styles.materialStatDivider} />
          <View style={styles.materialStat}>
            <Text style={styles.statLabel}>Unit Price</Text>
            <Text style={styles.statValue}>${material.pricePerUnit.toFixed(2)}</Text>
          </View>
          <View style={styles.materialStatDivider} />
          <View style={styles.materialStat}>
            <Text style={styles.statLabel}>Total</Text>
            <Text style={styles.statValue}>${(material.quantity * material.pricePerUnit).toFixed(2)}</Text>
          </View>
        </View>

        {isLow && (
          <View style={styles.lowStockWarning}>
            <AlertTriangle size={14} color={Colors.error} />
            <Text style={styles.lowStockText}>
              Below reorder level ({material.reorderLevel} {material.unit})
            </Text>
            <TouchableOpacity style={styles.reorderBtn} onPress={() => handleReorder(material)}>
              <Text style={styles.reorderBtnText}>Reorder</Text>
            </TouchableOpacity>
          </View>
        )}

        {material.expectedDelivery && (
          <View style={styles.deliveryInfo}>
            <Truck size={14} color="#3B82F6" />
            <Text style={styles.deliveryText}>
              Expected: {new Date(material.expectedDelivery).toLocaleDateString()}
            </Text>
          </View>
        )}

        {material.supplierPhone && (
          <TouchableOpacity 
            style={styles.callSupplierBtn}
            onPress={() => handleCallSupplier(material.supplierPhone!)}
          >
            <Phone size={14} color={Colors.primary} />
            <Text style={styles.callSupplierText}>Call Supplier</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const renderOrderCard = (order: MaterialOrder) => {
    const StatusIcon = getStatusIcon(order.status);

    return (
      <TouchableOpacity key={order.id} style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <Image source={{ uri: order.supplierLogo }} style={styles.supplierLogo} contentFit="cover" />
          <View style={styles.orderInfo}>
            <Text style={styles.orderNumber}>{order.orderNumber}</Text>
            <Text style={styles.supplierName}>{order.supplier}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(order.status)}15` }]}>
            <StatusIcon size={12} color={getStatusColor(order.status)} />
            <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
              {getStatusLabel(order.status)}
            </Text>
          </View>
        </View>

        <View style={styles.orderItems}>
          {order.items.map((item, idx) => (
            <View key={idx} style={styles.orderItem}>
              <Text style={styles.orderItemName}>{item.name}</Text>
              <Text style={styles.orderItemQty}>{item.quantity} {item.unit}</Text>
            </View>
          ))}
        </View>

        <View style={styles.orderFooter}>
          <View style={styles.orderDates}>
            <View style={styles.orderDate}>
              <Calendar size={12} color={Colors.textSecondary} />
              <Text style={styles.orderDateText}>
                Ordered: {new Date(order.orderDate).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.orderDate}>
              <Truck size={12} color={Colors.textSecondary} />
              <Text style={styles.orderDateText}>
                ETA: {new Date(order.expectedDelivery).toLocaleDateString()}
              </Text>
            </View>
          </View>
          <Text style={styles.orderTotal}>${order.totalAmount.toFixed(2)}</Text>
        </View>

        {order.trackingNumber && (
          <TouchableOpacity style={styles.trackingRow}>
            <Text style={styles.trackingLabel}>Tracking:</Text>
            <Text style={styles.trackingNumber}>{order.trackingNumber}</Text>
            <ChevronRight size={16} color={Colors.primary} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Plumbing Materials",
          headerLeft: () => <BackButton />,
          headerStyle: { backgroundColor: Colors.background },
          headerShadowVisible: false,
        }}
      />

      <View style={styles.headerSection}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Droplets size={18} color="#06B6D4" />
            <Text style={styles.statCardValue}>{stats.total}</Text>
            <Text style={styles.statCardLabel}>Items</Text>
          </View>
          <View style={styles.statCard}>
            <AlertTriangle size={18} color={Colors.error} />
            <Text style={[styles.statCardValue, { color: Colors.error }]}>{stats.lowStock}</Text>
            <Text style={styles.statCardLabel}>Low Stock</Text>
          </View>
          <View style={styles.statCard}>
            <Truck size={18} color="#3B82F6" />
            <Text style={styles.statCardValue}>{stats.pending}</Text>
            <Text style={styles.statCardLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <DollarSign size={18} color={Colors.success} />
            <Text style={styles.statCardValue}>${(stats.value/1000).toFixed(1)}K</Text>
            <Text style={styles.statCardLabel}>Value</Text>
          </View>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
        >
          {([
            { key: "pipes" as TabType, label: "Pipes", icon: Wrench },
            { key: "fittings" as TabType, label: "Fittings", icon: Package },
            { key: "fixtures" as TabType, label: "Fixtures", icon: Droplets },
            { key: "tools" as TabType, label: "Tools", icon: Wrench },
            { key: "orders" as TabType, label: "Orders", icon: Truck },
          ]).map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <tab.icon size={16} color={activeTab === tab.key ? Colors.white : Colors.textSecondary} />
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={18} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search materials..."
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.addButton}>
          <Plus size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab !== "orders" && filteredMaterials.map(m => renderMaterialCard(m))}
        {activeTab === "orders" && plumberOrders.map(o => renderOrderCard(o))}

        {activeTab !== "orders" && filteredMaterials.length === 0 && (
          <View style={styles.emptyState}>
            <Package size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Materials Found</Text>
            <Text style={styles.emptyText}>
              {searchQuery ? "Try a different search term" : "Add materials to this category"}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backButton: {
    marginLeft: 8,
  },
  headerSection: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  statCardValue: {
    fontSize: 18,
    fontWeight: "800" as const,
    color: Colors.text,
    marginTop: 6,
  },
  statCardLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tabScrollContent: {
    gap: 8,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSecondary,
  },
  tabActive: {
    backgroundColor: "#06B6D4",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.white,
  },
  searchSection: {
    flexDirection: "row",
    padding: 20,
    paddingBottom: 12,
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
    fontSize: 15,
    color: Colors.text,
    paddingVertical: 12,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#06B6D4",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 8,
    paddingBottom: 100,
  },
  materialCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  materialHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  materialImage: {
    width: 52,
    height: 52,
    borderRadius: 10,
    marginRight: 12,
  },
  materialInfo: {
    flex: 1,
  },
  materialName: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  materialSupplier: {
    fontSize: 13,
    color: Colors.primary,
    marginTop: 2,
  },
  materialDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  materialStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  materialStat: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  materialStatDivider: {
    width: 1,
    backgroundColor: Colors.borderLight,
  },
  lowStockWarning: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
  },
  lowStockText: {
    flex: 1,
    fontSize: 13,
    color: Colors.error,
  },
  reorderBtn: {
    backgroundColor: Colors.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  reorderBtnText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  deliveryInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#DBEAFE",
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
  },
  deliveryText: {
    fontSize: 13,
    color: "#3B82F6",
    fontWeight: "500" as const,
  },
  callSupplierBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  callSupplierText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  orderCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  supplierLogo: {
    width: 48,
    height: 48,
    borderRadius: 10,
    marginRight: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  supplierName: {
    fontSize: 14,
    color: Colors.primary,
    marginTop: 2,
  },
  orderItems: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 10,
    padding: 12,
    gap: 8,
    marginBottom: 14,
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  orderItemName: {
    fontSize: 13,
    color: Colors.text,
  },
  orderItemQty: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "500" as const,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  orderDates: {
    gap: 4,
  },
  orderDate: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  orderDateText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  orderTotal: {
    fontSize: 20,
    fontWeight: "800" as const,
    color: Colors.text,
  },
  trackingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  trackingLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  trackingNumber: {
    flex: 1,
    fontSize: 13,
    color: Colors.primary,
    fontWeight: "500" as const,
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
  },
});
