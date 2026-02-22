import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
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
  ShoppingCart,
  Building2,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";

type MaterialStatus = "ordered" | "in_transit" | "delivered" | "on_site" | "low_stock";
type TabType = "inventory" | "orders" | "suppliers";

interface Material {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  status: MaterialStatus;
  project?: string;
  supplier: string;
  reorderLevel: number;
  lastOrdered?: string;
  expectedDelivery?: string;
  image: string;
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
  project: string;
  trackingNumber?: string;
}

interface Supplier {
  id: string;
  name: string;
  logo: string;
  specialty: string;
  phone: string;
  email: string;
  address: string;
  rating: number;
  ordersPlaced: number;
  isPreferred: boolean;
  deliveryTime: string;
  paymentTerms: string;
}

const mockMaterials: Material[] = [
  {
    id: "m1",
    name: "2x4 Lumber (8ft)",
    category: "Framing",
    quantity: 450,
    unit: "pieces",
    pricePerUnit: 4.50,
    status: "on_site",
    project: "Beacon Hill Renovation",
    supplier: "Home Depot Pro",
    reorderLevel: 100,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200",
  },
  {
    id: "m2",
    name: "Drywall Sheets 4x8",
    category: "Drywall",
    quantity: 120,
    unit: "sheets",
    pricePerUnit: 12.50,
    status: "on_site",
    project: "Beacon Hill Renovation",
    supplier: "Building Supply Co",
    reorderLevel: 50,
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200",
  },
  {
    id: "m3",
    name: "Electrical Wire 12/2 (250ft)",
    category: "Electrical",
    quantity: 8,
    unit: "rolls",
    pricePerUnit: 85.00,
    status: "low_stock",
    project: "South End Condo Flip",
    supplier: "Electrical Supply House",
    reorderLevel: 10,
    image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=200",
  },
  {
    id: "m4",
    name: "PEX Pipe 1/2\" (100ft)",
    category: "Plumbing",
    quantity: 15,
    unit: "rolls",
    pricePerUnit: 45.00,
    status: "in_transit",
    supplier: "Plumbing Warehouse",
    reorderLevel: 8,
    expectedDelivery: "2026-01-29",
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=200",
  },
  {
    id: "m5",
    name: "Kitchen Cabinets (Custom Set)",
    category: "Cabinets",
    quantity: 1,
    unit: "set",
    pricePerUnit: 18500.00,
    status: "ordered",
    project: "Beacon Hill Renovation",
    supplier: "Cabinet World",
    reorderLevel: 1,
    expectedDelivery: "2026-02-10",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200",
  },
  {
    id: "m6",
    name: "Hardwood Flooring (Oak)",
    category: "Flooring",
    quantity: 1200,
    unit: "sq ft",
    pricePerUnit: 8.00,
    status: "on_site",
    project: "Beacon Hill Renovation",
    supplier: "Boston Flooring",
    reorderLevel: 400,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200",
  },
  {
    id: "m7",
    name: "Quartz Countertop Slab",
    category: "Countertops",
    quantity: 2,
    unit: "slabs",
    pricePerUnit: 1850.00,
    status: "ordered",
    project: "South End Condo Flip",
    supplier: "Stone Center",
    reorderLevel: 1,
    expectedDelivery: "2026-02-05",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200",
  },
  {
    id: "m8",
    name: "Interior Doors (6-Panel)",
    category: "Doors",
    quantity: 14,
    unit: "doors",
    pricePerUnit: 250.00,
    status: "on_site",
    project: "Beacon Hill Renovation",
    supplier: "Door & Window Outlet",
    reorderLevel: 5,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200",
  },
  {
    id: "m9",
    name: "Bathroom Fixtures Set",
    category: "Plumbing",
    quantity: 3,
    unit: "sets",
    pricePerUnit: 1400.00,
    status: "low_stock",
    supplier: "Ferguson Plumbing",
    reorderLevel: 4,
    image: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=200",
  },
  {
    id: "m10",
    name: "Roofing Shingles",
    category: "Roofing",
    quantity: 45,
    unit: "bundles",
    pricePerUnit: 35.00,
    status: "on_site",
    project: "Victorian Home Renovation",
    supplier: "Roofing Supply Pro",
    reorderLevel: 20,
    image: "https://images.unsplash.com/photo-1632759145351-1d592919f522?w=200",
  },
];

const mockOrders: MaterialOrder[] = [
  {
    id: "o1",
    orderNumber: "ORD-2026-0127",
    supplier: "Cabinet World",
    supplierLogo: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200",
    items: [
      { name: "Custom Kitchen Cabinets", quantity: 1, unit: "set" },
      { name: "Cabinet Hardware Kit", quantity: 1, unit: "kit" },
    ],
    totalAmount: 18950.00,
    status: "shipped",
    orderDate: "2026-01-25",
    expectedDelivery: "2026-02-10",
    project: "Beacon Hill Renovation",
    trackingNumber: "1Z999AA10123456784",
  },
  {
    id: "o2",
    orderNumber: "ORD-2026-0126",
    supplier: "Plumbing Warehouse",
    supplierLogo: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=200",
    items: [
      { name: "PEX Pipe 1/2\" (100ft)", quantity: 10, unit: "rolls" },
      { name: "PEX Fittings Kit", quantity: 2, unit: "kits" },
      { name: "Water Heater 50 Gal", quantity: 1, unit: "unit" },
    ],
    totalAmount: 1425.00,
    status: "confirmed",
    orderDate: "2026-01-26",
    expectedDelivery: "2026-01-29",
    project: "Beacon Hill Renovation",
  },
  {
    id: "o3",
    orderNumber: "ORD-2026-0124",
    supplier: "Stone Center",
    supplierLogo: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200",
    items: [
      { name: "Quartz Countertop Slab", quantity: 2, unit: "slabs" },
      { name: "Edge Finishing", quantity: 1, unit: "service" },
      { name: "Sink Cutout", quantity: 2, unit: "cutouts" },
    ],
    totalAmount: 4150.00,
    status: "delivered",
    orderDate: "2026-01-20",
    expectedDelivery: "2026-01-24",
    project: "South End Condo Flip",
  },
  {
    id: "o4",
    orderNumber: "ORD-2026-0122",
    supplier: "Boston Flooring",
    supplierLogo: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200",
    items: [
      { name: "Hardwood Flooring (Oak)", quantity: 800, unit: "sq ft" },
      { name: "Underlayment", quantity: 800, unit: "sq ft" },
      { name: "Floor Trim Molding", quantity: 200, unit: "linear ft" },
    ],
    totalAmount: 7480.00,
    status: "pending",
    orderDate: "2026-01-22",
    expectedDelivery: "2026-02-01",
    project: "Beacon Hill Renovation",
  },
];

const mockSuppliers: Supplier[] = [
  {
    id: "s1",
    name: "Home Depot Pro",
    logo: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200",
    specialty: "Lumber & Building Materials",
    phone: "(617) 555-2001",
    email: "pro@homedepot.com",
    address: "1200 Construction Blvd, Boston, MA",
    rating: 4.9,
    ordersPlaced: 78,
    isPreferred: true,
    deliveryTime: "Same day",
    paymentTerms: "Net 30",
  },
  {
    id: "s2",
    name: "Cabinet World",
    logo: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200",
    specialty: "Custom & Stock Cabinets",
    phone: "(617) 555-2002",
    email: "orders@cabinetworld.com",
    address: "450 Kitchen Center Dr, Newton, MA",
    rating: 4.8,
    ordersPlaced: 32,
    isPreferred: true,
    deliveryTime: "2-4 weeks",
    paymentTerms: "50% Deposit",
  },
  {
    id: "s3",
    name: "Boston Flooring",
    logo: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200",
    specialty: "Hardwood & Tile Flooring",
    phone: "(617) 555-2003",
    email: "sales@bostonflooring.com",
    address: "789 Floor Center, Cambridge, MA",
    rating: 4.7,
    ordersPlaced: 45,
    isPreferred: true,
    deliveryTime: "2-3 days",
    paymentTerms: "Net 15",
  },
  {
    id: "s4",
    name: "Electrical Supply House",
    logo: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=200",
    specialty: "Electrical & Lighting",
    phone: "(617) 555-2004",
    email: "orders@electricalsupply.com",
    address: "321 Electric Way, Somerville, MA",
    rating: 4.6,
    ordersPlaced: 56,
    isPreferred: false,
    deliveryTime: "1-2 days",
    paymentTerms: "Net 30",
  },
  {
    id: "s5",
    name: "Stone Center",
    logo: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200",
    specialty: "Countertops & Stone",
    phone: "(617) 555-2005",
    email: "sales@stonecenter.com",
    address: "567 Quarry Rd, Watertown, MA",
    rating: 4.8,
    ordersPlaced: 28,
    isPreferred: true,
    deliveryTime: "1-2 weeks",
    paymentTerms: "50% Deposit",
  },
  {
    id: "s6",
    name: "Ferguson Plumbing",
    logo: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=200",
    specialty: "Plumbing & HVAC",
    phone: "(617) 555-2006",
    email: "orders@ferguson.com",
    address: "890 Industrial Park, Boston, MA",
    rating: 4.7,
    ordersPlaced: 42,
    isPreferred: true,
    deliveryTime: "1-2 days",
    paymentTerms: "Net 30",
  },
];

export default function MaterialTrackingScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("inventory");
  const [searchQuery, setSearchQuery] = useState("");

  const getStatusColor = (status: MaterialStatus | MaterialOrder["status"]) => {
    switch (status) {
      case "ordered":
      case "pending": return Colors.textSecondary;
      case "in_transit":
      case "confirmed":
      case "shipped": return "#3B82F6";
      case "delivered":
      case "on_site": return Colors.success;
      case "low_stock": return Colors.error;
      default: return Colors.textSecondary;
    }
  };

  const getStatusLabel = (status: MaterialStatus | MaterialOrder["status"]) => {
    switch (status) {
      case "ordered": return "Ordered";
      case "in_transit": return "In Transit";
      case "delivered": return "Delivered";
      case "on_site": return "On Site";
      case "low_stock": return "Low Stock";
      case "pending": return "Pending";
      case "confirmed": return "Confirmed";
      case "shipped": return "Shipped";
      default: return status;
    }
  };

  const getStatusIcon = (status: MaterialStatus | MaterialOrder["status"]) => {
    switch (status) {
      case "ordered":
      case "pending": return Clock;
      case "in_transit":
      case "shipped": return Truck;
      case "confirmed": return CheckCircle;
      case "delivered":
      case "on_site": return CheckCircle;
      case "low_stock": return AlertTriangle;
      default: return Package;
    }
  };

  const filteredMaterials = mockMaterials.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockCount = mockMaterials.filter(m => m.status === "low_stock" || m.quantity <= m.reorderLevel).length;
  const totalValue = mockMaterials.reduce((sum, m) => sum + (m.quantity * m.pricePerUnit), 0);
  const pendingOrders = mockOrders.filter(o => o.status !== "delivered").length;

  const renderMaterialCard = (material: Material) => {
    const StatusIcon = getStatusIcon(material.status);
    const isLow = material.quantity <= material.reorderLevel;
    
    return (
      <TouchableOpacity key={material.id} style={styles.materialCard}>
        <View style={styles.materialHeader}>
          <Image source={{ uri: material.image }} style={styles.materialImage} contentFit="cover" />
          <View style={styles.materialInfo}>
            <Text style={styles.materialName}>{material.name}</Text>
            <Text style={styles.materialCategory}>{material.category}</Text>
            {material.project && (
              <View style={styles.projectRow}>
                <Building2 size={12} color={Colors.textSecondary} />
                <Text style={styles.projectText}>{material.project}</Text>
              </View>
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
            <Text style={styles.statLabel}>Quantity</Text>
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
            <Text style={styles.statLabel}>Total Value</Text>
            <Text style={styles.statValue}>${(material.quantity * material.pricePerUnit).toFixed(2)}</Text>
          </View>
        </View>

        {isLow && (
          <View style={styles.lowStockWarning}>
            <AlertTriangle size={14} color={Colors.error} />
            <Text style={styles.lowStockText}>
              Below reorder level ({material.reorderLevel} {material.unit})
            </Text>
            <TouchableOpacity style={styles.reorderBtn}>
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
            <Text style={styles.orderProject}>{order.project}</Text>
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

  const renderSupplierCard = (supplier: Supplier) => (
    <TouchableOpacity key={supplier.id} style={styles.supplierCard}>
      <View style={styles.supplierHeader}>
        <Image source={{ uri: supplier.logo }} style={styles.supplierCardLogo} contentFit="cover" />
        <View style={styles.supplierInfo}>
          <View style={styles.supplierNameRow}>
            <Text style={styles.supplierCardName}>{supplier.name}</Text>
            {supplier.isPreferred && (
              <View style={styles.preferredBadge}>
                <Text style={styles.preferredText}>Preferred</Text>
              </View>
            )}
          </View>
          <Text style={styles.supplierSpecialty}>{supplier.specialty}</Text>
          <View style={styles.supplierRating}>
            <Text style={styles.ratingText}>★ {supplier.rating}</Text>
            <Text style={styles.ordersText}>• {supplier.ordersPlaced} orders</Text>
          </View>
        </View>
      </View>

      <View style={styles.supplierDetails}>
        <View style={styles.supplierDetail}>
          <Truck size={14} color={Colors.textSecondary} />
          <Text style={styles.supplierDetailText}>{supplier.deliveryTime}</Text>
        </View>
        <View style={styles.supplierDetail}>
          <DollarSign size={14} color={Colors.textSecondary} />
          <Text style={styles.supplierDetailText}>{supplier.paymentTerms}</Text>
        </View>
      </View>

      <View style={styles.supplierActions}>
        <TouchableOpacity style={styles.contactBtn}>
          <Text style={styles.contactBtnText}>Contact</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.orderNowBtn}>
          <ShoppingCart size={16} color={Colors.white} />
          <Text style={styles.orderNowText}>Order Now</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Construction Materials",
          headerLeft: () => <BackButton />,
          headerStyle: { backgroundColor: Colors.background },
          headerShadowVisible: false,
        }}
      />

      <View style={styles.headerSection}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Package size={18} color="#0EA5E9" />
            <Text style={styles.statCardValue}>{mockMaterials.length}</Text>
            <Text style={styles.statCardLabel}>Items</Text>
          </View>
          <View style={styles.statCard}>
            <AlertTriangle size={18} color={Colors.error} />
            <Text style={[styles.statCardValue, { color: Colors.error }]}>{lowStockCount}</Text>
            <Text style={styles.statCardLabel}>Low Stock</Text>
          </View>
          <View style={styles.statCard}>
            <Truck size={18} color="#3B82F6" />
            <Text style={styles.statCardValue}>{pendingOrders}</Text>
            <Text style={styles.statCardLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <DollarSign size={18} color={Colors.success} />
            <Text style={styles.statCardValue}>${(totalValue/1000).toFixed(1)}K</Text>
            <Text style={styles.statCardLabel}>Value</Text>
          </View>
        </View>

        <View style={styles.tabContainer}>
          {([
            { key: "inventory", label: "Inventory", icon: Package },
            { key: "orders", label: "Orders", icon: Truck },
            { key: "suppliers", label: "Suppliers", icon: Building2 },
          ] as const).map(tab => (
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
        </View>
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
        {activeTab === "inventory" && filteredMaterials.map(m => renderMaterialCard(m))}
        {activeTab === "orders" && mockOrders.map(o => renderOrderCard(o))}
        {activeTab === "suppliers" && mockSuppliers.map(s => renderSupplierCard(s))}
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
  tabContainer: {
    flexDirection: "row",
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSecondary,
  },
  tabActive: {
    backgroundColor: "#0EA5E9",
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
    backgroundColor: "#0EA5E9",
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
  materialCategory: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  projectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  projectText: {
    fontSize: 12,
    color: Colors.primary,
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
  orderProject: {
    fontSize: 12,
    color: Colors.textSecondary,
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
  supplierCard: {
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
  supplierHeader: {
    flexDirection: "row",
    marginBottom: 14,
  },
  supplierCardLogo: {
    width: 56,
    height: 56,
    borderRadius: 12,
    marginRight: 12,
  },
  supplierInfo: {
    flex: 1,
  },
  supplierNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  supplierCardName: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  preferredBadge: {
    backgroundColor: "#E8E9EE",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  preferredText: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: "#B45309",
  },
  supplierSpecialty: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  supplierRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  ratingText: {
    fontSize: 13,
    color: Colors.warning,
    fontWeight: "600" as const,
  },
  ordersText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  supplierDetails: {
    flexDirection: "row",
    gap: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 14,
  },
  supplierDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  supplierDetailText: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: "500" as const,
  },
  supplierActions: {
    flexDirection: "row",
    gap: 10,
  },
  contactBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  contactBtnText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  orderNowBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#0EA5E9",
  },
  orderNowText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.white,
  },
});
