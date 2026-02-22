import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Linking,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import {
  ArrowLeft,
  Plus,
  Package,
  Search,
  X,
  Filter,
  Zap,
  CircuitBoard,
  Lightbulb,
  Plug,
  Cable,
  Box,
  Tag,
  DollarSign,
  Building2,
  ShoppingCart,
  Star,
  ChevronRight,
  Barcode,
  ExternalLink,
  Copy,
  Heart,
  AlertTriangle,
  CheckCircle,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";

type PartCategory = "breakers" | "wire" | "outlets" | "switches" | "lighting" | "panels" | "connectors" | "tools" | "safety";
type PartStatus = "in_stock" | "low_stock" | "out_of_stock" | "discontinued";

interface Part {
  id: string;
  name: string;
  category: PartCategory;
  brand: string;
  model: string;
  sku: string;
  upc?: string;
  description: string;
  specs: Record<string, string>;
  price?: number;
  supplierPrice?: number;
  image?: string;
  status: PartStatus;
  quantity?: number;
  minQuantity?: number;
  suppliers: string[];
  rating?: number;
  isFavorite?: boolean;
  notes?: string;
  alternates?: string[];
}

const mockParts: Part[] = [
  {
    id: "1",
    name: "20A Single Pole AFCI Breaker",
    category: "breakers",
    brand: "Square D",
    model: "QO120AFCI",
    sku: "SQD-QO120AFCI",
    upc: "785901234567",
    description: "Arc-fault circuit interrupter breaker for bedroom circuits per NEC code requirements.",
    specs: {
      "Amperage": "20A",
      "Voltage": "120V",
      "Poles": "Single",
      "Type": "AFCI",
      "Series": "QO",
    },
    price: 42.99,
    supplierPrice: 32.50,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200",
    status: "in_stock",
    quantity: 15,
    minQuantity: 5,
    suppliers: ["Home Depot", "Lowes", "Grainger", "Electrical Wholesaler"],
    rating: 4.8,
    isFavorite: true,
  },
  {
    id: "2",
    name: "50A Double Pole GFCI Breaker",
    category: "breakers",
    brand: "Eaton",
    model: "BR250GF",
    sku: "EAT-BR250GF",
    description: "Ground fault circuit interrupter for spa, hot tub, and EV charger installations.",
    specs: {
      "Amperage": "50A",
      "Voltage": "240V",
      "Poles": "Double",
      "Type": "GFCI",
      "Series": "BR",
    },
    price: 89.99,
    supplierPrice: 68.00,
    status: "in_stock",
    quantity: 8,
    minQuantity: 3,
    suppliers: ["Grainger", "Electrical Wholesaler"],
    rating: 4.7,
  },
  {
    id: "3",
    name: "12/2 NM-B Romex Cable (250ft)",
    category: "wire",
    brand: "Southwire",
    model: "28828255",
    sku: "SW-12-2-250",
    description: "Non-metallic sheathed cable for general purpose 20A circuits.",
    specs: {
      "Gauge": "12 AWG",
      "Conductors": "2 + Ground",
      "Length": "250 ft",
      "Type": "NM-B",
      "Jacket": "Yellow",
    },
    price: 149.99,
    supplierPrice: 115.00,
    status: "low_stock",
    quantity: 3,
    minQuantity: 5,
    suppliers: ["Home Depot", "Lowes", "Electrical Wholesaler"],
    rating: 4.9,
    isFavorite: true,
  },
  {
    id: "4",
    name: "20A Tamper-Resistant Duplex Outlet",
    category: "outlets",
    brand: "Leviton",
    model: "T5820-W",
    sku: "LEV-T5820-W",
    description: "Code-compliant tamper-resistant receptacle for residential installations.",
    specs: {
      "Amperage": "20A",
      "Voltage": "125V",
      "Type": "Duplex",
      "Color": "White",
      "Features": "Tamper-Resistant",
    },
    price: 3.49,
    supplierPrice: 2.20,
    status: "in_stock",
    quantity: 85,
    minQuantity: 25,
    suppliers: ["Home Depot", "Lowes", "Grainger"],
    rating: 4.6,
  },
  {
    id: "5",
    name: "20A GFCI Outlet with Wall Plate",
    category: "outlets",
    brand: "Leviton",
    model: "GFNT2-W",
    sku: "LEV-GFNT2-W",
    description: "Self-testing GFCI outlet for kitchens, bathrooms, and outdoor use.",
    specs: {
      "Amperage": "20A",
      "Voltage": "125V",
      "Type": "GFCI",
      "Color": "White",
      "Self-Test": "Yes",
    },
    price: 19.99,
    supplierPrice: 14.50,
    status: "in_stock",
    quantity: 42,
    minQuantity: 15,
    suppliers: ["Home Depot", "Lowes", "Grainger", "Electrical Wholesaler"],
    rating: 4.8,
    isFavorite: true,
  },
  {
    id: "6",
    name: "Decora 3-Way Switch",
    category: "switches",
    brand: "Leviton",
    model: "5603-2W",
    sku: "LEV-5603-2W",
    description: "Decorator style 3-way switch for multi-location lighting control.",
    specs: {
      "Amperage": "15A",
      "Voltage": "120/277V",
      "Type": "3-Way",
      "Style": "Decora",
      "Color": "White",
    },
    price: 4.99,
    supplierPrice: 3.20,
    status: "in_stock",
    quantity: 55,
    minQuantity: 20,
    suppliers: ["Home Depot", "Lowes"],
    rating: 4.7,
  },
  {
    id: "7",
    name: "6\" LED Recessed Light Kit",
    category: "lighting",
    brand: "Halo",
    model: "RL6069S1EWHR",
    sku: "HAL-RL6069",
    description: "All-in-one recessed LED downlight with selectable color temperature.",
    specs: {
      "Size": "6 inch",
      "Lumens": "900",
      "CCT": "2700K-5000K Selectable",
      "Wattage": "12W",
      "Dimmable": "Yes",
    },
    price: 24.99,
    supplierPrice: 18.00,
    status: "in_stock",
    quantity: 28,
    minQuantity: 10,
    suppliers: ["Home Depot", "Lowes", "Electrical Wholesaler"],
    rating: 4.5,
  },
  {
    id: "8",
    name: "200A Main Breaker Panel",
    category: "panels",
    brand: "Square D",
    model: "QO140L200PG",
    sku: "SQD-QO140L200PG",
    description: "40-circuit 200A main breaker load center for residential service entrance.",
    specs: {
      "Amperage": "200A",
      "Circuits": "40",
      "Phase": "Single",
      "Type": "Indoor",
      "Main Breaker": "Included",
    },
    price: 289.99,
    supplierPrice: 225.00,
    status: "in_stock",
    quantity: 4,
    minQuantity: 2,
    suppliers: ["Grainger", "Electrical Wholesaler"],
    rating: 4.9,
    isFavorite: true,
  },
  {
    id: "9",
    name: "Wire Connector Assortment",
    category: "connectors",
    brand: "Ideal",
    model: "30-1149",
    sku: "IDL-30-1149",
    description: "Professional wire nut assortment with multiple sizes for various gauge combinations.",
    specs: {
      "Quantity": "185 pcs",
      "Sizes": "Red, Yellow, Orange, Tan",
      "Type": "Twist-On",
      "Case": "Included",
    },
    price: 29.99,
    supplierPrice: 22.00,
    status: "in_stock",
    quantity: 12,
    minQuantity: 5,
    suppliers: ["Home Depot", "Grainger"],
    rating: 4.6,
  },
  {
    id: "10",
    name: "Non-Contact Voltage Tester",
    category: "tools",
    brand: "Fluke",
    model: "1AC-A1-II",
    sku: "FLK-1AC-A1-II",
    description: "Professional non-contact voltage detector with LED and audible alert.",
    specs: {
      "Voltage Range": "90-1000V AC",
      "Detection": "Non-Contact",
      "Alert": "LED + Audible",
      "Battery": "2x AAA",
    },
    price: 24.99,
    supplierPrice: 19.00,
    status: "low_stock",
    quantity: 2,
    minQuantity: 3,
    suppliers: ["Grainger", "Amazon"],
    rating: 4.9,
  },
];

const categoryConfig: Record<PartCategory, { label: string; icon: any; color: string }> = {
  breakers: { label: "Breakers", icon: CircuitBoard, color: "#EF4444" },
  wire: { label: "Wire & Cable", icon: Cable, color: "#272D53" },
  outlets: { label: "Outlets", icon: Plug, color: "#3B82F6" },
  switches: { label: "Switches", icon: Zap, color: "#8B5CF6" },
  lighting: { label: "Lighting", icon: Lightbulb, color: "#FBBF24" },
  panels: { label: "Panels", icon: Box, color: "#22C55E" },
  connectors: { label: "Connectors", icon: Package, color: "#06B6D4" },
  tools: { label: "Tools", icon: Package, color: "#EC4899" },
  safety: { label: "Safety", icon: AlertTriangle, color: "#DC2626" },
};

const statusConfig: Record<PartStatus, { label: string; color: string; bgColor: string }> = {
  in_stock: { label: "In Stock", color: "#22C55E", bgColor: "#DCFCE7" },
  low_stock: { label: "Low Stock", color: "#272D53", bgColor: "#E8E9EE" },
  out_of_stock: { label: "Out of Stock", color: "#DC2626", bgColor: "#FEE2E2" },
  discontinued: { label: "Discontinued", color: "#6B7280", bgColor: "#F3F4F6" },
};

export default function ElectricalPartsDatabaseScreen() {
  const router = useRouter();
  const [parts, setParts] = useState<Part[]>(mockParts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<PartCategory | "all">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const filteredParts = useMemo(() => {
    return parts.filter((part) => {
      const matchesSearch =
        part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        part.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        part.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        part.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || part.category === selectedCategory;
      const matchesFavorites = !showFavoritesOnly || part.isFavorite;
      return matchesSearch && matchesCategory && matchesFavorites;
    });
  }, [parts, searchQuery, selectedCategory, showFavoritesOnly]);

  const stats = useMemo(() => {
    const lowStock = parts.filter((p) => p.status === "low_stock").length;
    const outOfStock = parts.filter((p) => p.status === "out_of_stock").length;
    const favorites = parts.filter((p) => p.isFavorite).length;
    return { total: parts.length, lowStock, outOfStock, favorites };
  }, [parts]);

  const handleToggleFavorite = useCallback((partId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setParts((prev) =>
      prev.map((p) => (p.id === partId ? { ...p, isFavorite: !p.isFavorite } : p))
    );
  }, []);

  const handleCopySku = useCallback((sku: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Copied", `SKU "${sku}" copied to clipboard`);
  }, []);

  const handleOrderPart = useCallback((part: Part) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Order Part",
      `Add ${part.name} to order?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Add to Order", onPress: () => Alert.alert("Added", "Part added to order") },
      ]
    );
  }, []);

  const handleSearchSupplier = useCallback((supplier: string, partName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(`${supplier} ${partName}`)}`;
    Linking.openURL(searchUrl);
  }, []);

  const renderPartCard = (part: Part) => {
    const category = categoryConfig[part.category];
    const status = statusConfig[part.status];
    const CategoryIcon = category.icon;

    return (
      <TouchableOpacity
        key={part.id}
        style={styles.partCard}
        onPress={() => setSelectedPart(part)}
        activeOpacity={0.7}
      >
        <View style={styles.partHeader}>
          {part.image ? (
            <Image source={{ uri: part.image }} style={styles.partImage} />
          ) : (
            <View style={[styles.partImagePlaceholder, { backgroundColor: `${category.color}15` }]}>
              <CategoryIcon size={24} color={category.color} />
            </View>
          )}
          <View style={styles.partInfo}>
            <Text style={styles.partBrand}>{part.brand}</Text>
            <Text style={styles.partName} numberOfLines={2}>{part.name}</Text>
            <Text style={styles.partModel}>{part.model}</Text>
          </View>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => handleToggleFavorite(part.id)}
          >
            <Heart
              size={20}
              color={part.isFavorite ? "#DC2626" : Colors.textTertiary}
              fill={part.isFavorite ? "#DC2626" : "transparent"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.partMeta}>
          <View style={[styles.categoryBadge, { backgroundColor: `${category.color}15` }]}>
            <CategoryIcon size={12} color={category.color} />
            <Text style={[styles.categoryText, { color: category.color }]}>{category.label}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bgColor }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.partFooter}>
          {part.price && (
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Retail</Text>
              <Text style={styles.priceValue}>${part.price.toFixed(2)}</Text>
            </View>
          )}
          {part.quantity !== undefined && (
            <View style={styles.stockContainer}>
              <Text style={styles.stockLabel}>In Stock</Text>
              <Text style={[styles.stockValue, part.quantity <= (part.minQuantity || 0) && styles.lowStockValue]}>
                {part.quantity}
              </Text>
            </View>
          )}
          {part.rating ? (
            <View style={styles.ratingContainer}>
              <Star size={12} color="#FBBF24" fill="#FBBF24" />
              <Text style={styles.ratingValue}>{part.rating}</Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Parts Database",
          headerLeft: () => <BackButton />,
          headerRight: () => (
            <TouchableOpacity onPress={() => {}} style={styles.addButton}>
              <Plus size={24} color="#EAB308" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Package size={32} color="#EAB308" />
          </View>
          <Text style={styles.headerTitle}>Electrical Parts Database</Text>
          <Text style={styles.headerSubtitle}>
            Common components, brands, specs, and replacement parts
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Parts</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#E8E9EE" }]}>
            <Text style={[styles.statValue, { color: "#272D53" }]}>{stats.lowStock}</Text>
            <Text style={[styles.statLabel, { color: "#272D53" }]}>Low Stock</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#FEE2E2" }]}>
            <Text style={[styles.statValue, { color: "#DC2626" }]}>{stats.outOfStock}</Text>
            <Text style={[styles.statLabel, { color: "#DC2626" }]}>Out of Stock</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#FCE7F3" }]}>
            <Text style={[styles.statValue, { color: "#EC4899" }]}>{stats.favorites}</Text>
            <Text style={[styles.statLabel, { color: "#EC4899" }]}>Favorites</Text>
          </View>
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Search size={18} color={Colors.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search parts, brands, SKU..."
              placeholderTextColor={Colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <X size={18} color={Colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[styles.filterButton, showFilters && styles.filterButtonActive]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} color={showFilters ? Colors.white : Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.favoriteFilterButton, showFavoritesOnly && styles.favoriteFilterActive]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowFavoritesOnly(!showFavoritesOnly);
            }}
          >
            <Heart
              size={18}
              color={showFavoritesOnly ? Colors.white : "#DC2626"}
              fill={showFavoritesOnly ? Colors.white : "transparent"}
            />
          </TouchableOpacity>
        </View>

        {showFilters && (
          <View style={styles.filtersSection}>
            <Text style={styles.filterLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <TouchableOpacity
                style={[styles.filterChip, selectedCategory === "all" && styles.filterChipActive]}
                onPress={() => setSelectedCategory("all")}
              >
                <Text style={[styles.filterChipText, selectedCategory === "all" && styles.filterChipTextActive]}>
                  All
                </Text>
              </TouchableOpacity>
              {(Object.keys(categoryConfig) as PartCategory[]).map((cat) => {
                const config = categoryConfig[cat];
                const Icon = config.icon;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.filterChip,
                      selectedCategory === cat && styles.filterChipActive,
                      selectedCategory === cat && { backgroundColor: config.color },
                    ]}
                    onPress={() => setSelectedCategory(cat)}
                  >
                    <Icon size={14} color={selectedCategory === cat ? Colors.white : config.color} />
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedCategory === cat && styles.filterChipTextActive,
                      ]}
                    >
                      {config.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        <View style={styles.partsSection}>
          <Text style={styles.sectionTitle}>Parts ({filteredParts.length})</Text>
          {filteredParts.map(renderPartCard)}

          {filteredParts.length === 0 && (
            <View style={styles.emptyState}>
              <Package size={48} color={Colors.textTertiary} />
              <Text style={styles.emptyStateTitle}>No Parts Found</Text>
              <Text style={styles.emptyStateText}>
                Try adjusting your search or filters
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal visible={selectedPart !== null} animationType="slide" presentationStyle="pageSheet">
        {selectedPart && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedPart(null)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Part Details</Text>
              <TouchableOpacity onPress={() => handleToggleFavorite(selectedPart.id)}>
                <Heart
                  size={22}
                  color={selectedPart.isFavorite ? "#DC2626" : Colors.text}
                  fill={selectedPart.isFavorite ? "#DC2626" : "transparent"}
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.partDetailHeader}>
                {selectedPart.image ? (
                  <Image source={{ uri: selectedPart.image }} style={styles.partDetailImage} />
                ) : (
                  <View style={styles.partDetailImagePlaceholder}>
                    {React.createElement(categoryConfig[selectedPart.category].icon, {
                      size: 48,
                      color: categoryConfig[selectedPart.category].color,
                    })}
                  </View>
                )}
                <View style={styles.partDetailInfo}>
                  <Text style={styles.partDetailBrand}>{selectedPart.brand}</Text>
                  <Text style={styles.partDetailName}>{selectedPart.name}</Text>
                  <Text style={styles.partDetailModel}>{selectedPart.model}</Text>
                </View>
              </View>

              <View style={styles.skuSection}>
                <TouchableOpacity
                  style={styles.skuCard}
                  onPress={() => handleCopySku(selectedPart.sku)}
                >
                  <Barcode size={18} color={Colors.textSecondary} />
                  <View style={styles.skuInfo}>
                    <Text style={styles.skuLabel}>SKU</Text>
                    <Text style={styles.skuValue}>{selectedPart.sku}</Text>
                  </View>
                  <Copy size={16} color={Colors.textTertiary} />
                </TouchableOpacity>
                {selectedPart.upc && (
                  <TouchableOpacity
                    style={styles.skuCard}
                    onPress={() => handleCopySku(selectedPart.upc!)}
                  >
                    <Barcode size={18} color={Colors.textSecondary} />
                    <View style={styles.skuInfo}>
                      <Text style={styles.skuLabel}>UPC</Text>
                      <Text style={styles.skuValue}>{selectedPart.upc}</Text>
                    </View>
                    <Copy size={16} color={Colors.textTertiary} />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.pricingCard}>
                <Text style={styles.pricingTitle}>Pricing</Text>
                <View style={styles.pricingGrid}>
                  {selectedPart.price && (
                    <View style={styles.pricingItem}>
                      <Text style={styles.pricingLabel}>Retail Price</Text>
                      <Text style={styles.pricingValue}>${selectedPart.price.toFixed(2)}</Text>
                    </View>
                  )}
                  {selectedPart.supplierPrice && (
                    <View style={styles.pricingItem}>
                      <Text style={styles.pricingLabel}>Supplier Price</Text>
                      <Text style={[styles.pricingValue, { color: "#22C55E" }]}>
                        ${selectedPart.supplierPrice.toFixed(2)}
                      </Text>
                    </View>
                  )}
                  {selectedPart.price && selectedPart.supplierPrice && (
                    <View style={styles.pricingItem}>
                      <Text style={styles.pricingLabel}>Margin</Text>
                      <Text style={[styles.pricingValue, { color: "#3B82F6" }]}>
                        {Math.round(((selectedPart.price - selectedPart.supplierPrice) / selectedPart.price) * 100)}%
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.specsCard}>
                <Text style={styles.specsTitle}>Specifications</Text>
                {Object.entries(selectedPart.specs).map(([key, value]) => (
                  <View key={key} style={styles.specRow}>
                    <Text style={styles.specKey}>{key}</Text>
                    <Text style={styles.specValue}>{value}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.descriptionCard}>
                <Text style={styles.descriptionTitle}>Description</Text>
                <Text style={styles.descriptionText}>{selectedPart.description}</Text>
              </View>

              {selectedPart.quantity !== undefined && (
                <View style={styles.inventoryCard}>
                  <Text style={styles.inventoryTitle}>Inventory</Text>
                  <View style={styles.inventoryRow}>
                    <View style={styles.inventoryItem}>
                      <Text style={styles.inventoryLabel}>In Stock</Text>
                      <Text style={[
                        styles.inventoryValue,
                        selectedPart.quantity <= (selectedPart.minQuantity || 0) && { color: "#DC2626" }
                      ]}>
                        {selectedPart.quantity}
                      </Text>
                    </View>
                    {selectedPart.minQuantity && (
                      <View style={styles.inventoryItem}>
                        <Text style={styles.inventoryLabel}>Min Quantity</Text>
                        <Text style={styles.inventoryValue}>{selectedPart.minQuantity}</Text>
                      </View>
                    )}
                  </View>
                  {selectedPart.quantity <= (selectedPart.minQuantity || 0) && (
                    <View style={styles.reorderAlert}>
                      <AlertTriangle size={14} color="#DC2626" />
                      <Text style={styles.reorderAlertText}>Reorder recommended</Text>
                    </View>
                  )}
                </View>
              )}

              <View style={styles.suppliersCard}>
                <Text style={styles.suppliersTitle}>Available At</Text>
                {selectedPart.suppliers.map((supplier) => (
                  <TouchableOpacity
                    key={supplier}
                    style={styles.supplierRow}
                    onPress={() => handleSearchSupplier(supplier, selectedPart.name)}
                  >
                    <Building2 size={16} color={Colors.textSecondary} />
                    <Text style={styles.supplierName}>{supplier}</Text>
                    <ExternalLink size={14} color={Colors.textTertiary} />
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.orderButton}
                onPress={() => handleOrderPart(selectedPart)}
              >
                <ShoppingCart size={20} color="#000" />
                <Text style={styles.orderButtonText}>Add to Order</Text>
              </TouchableOpacity>
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
  backButton: {
    padding: 8,
  },
  addButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#FEF9C3",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center" as const,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  searchSection: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 10,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  filterButtonActive: {
    backgroundColor: "#EAB308",
  },
  favoriteFilterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  favoriteFilterActive: {
    backgroundColor: "#DC2626",
  },
  filtersSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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
  partsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 14,
  },
  partCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  partHeader: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
  },
  partImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  partImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  partInfo: {
    flex: 1,
  },
  partBrand: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#EAB308",
    textTransform: "uppercase" as const,
  },
  partName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
    marginTop: 2,
  },
  partModel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  favoriteButton: {
    padding: 4,
  },
  partMeta: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  partFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  priceContainer: {},
  priceLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  stockContainer: {},
  stockLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
  stockValue: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#22C55E",
  },
  lowStockValue: {
    color: "#DC2626",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: "auto",
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.text,
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
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
  modalTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  partDetailHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
  },
  partDetailImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  partDetailImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: "#FEF9C3",
    alignItems: "center",
    justifyContent: "center",
  },
  partDetailInfo: {
    flex: 1,
  },
  partDetailBrand: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#EAB308",
    textTransform: "uppercase" as const,
  },
  partDetailName: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginTop: 4,
  },
  partDetailModel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  skuSection: {
    gap: 8,
    marginBottom: 16,
  },
  skuCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 10,
  },
  skuInfo: {
    flex: 1,
  },
  skuLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  skuValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    fontFamily: "monospace",
  },
  pricingCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  pricingTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  pricingGrid: {
    flexDirection: "row",
    gap: 12,
  },
  pricingItem: {
    flex: 1,
    backgroundColor: "#FEF9C3",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  pricingLabel: {
    fontSize: 11,
    color: "#92400E",
  },
  pricingValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#92400E",
    marginTop: 4,
  },
  specsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  specsTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  specRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  specKey: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  specValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  descriptionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  descriptionTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  inventoryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  inventoryTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  inventoryRow: {
    flexDirection: "row",
    gap: 16,
  },
  inventoryItem: {
    flex: 1,
  },
  inventoryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  inventoryValue: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
    marginTop: 2,
  },
  reorderAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  reorderAlertText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#DC2626",
  },
  suppliersCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  suppliersTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  supplierRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  supplierName: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  orderButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#EAB308",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  orderButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#000",
  },
});
