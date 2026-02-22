import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import {
  Search,
  Filter,
  Plus,
  ShoppingBag,
  Store,
  Truck,
  Clock,
  Star,
  ChevronRight,
  Heart,
  X,
  Phone,
  Globe,
  MapPin,
  DollarSign,
  Package,
  Bookmark,
  Check,
  ExternalLink,
  Tag,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";

interface Material {
  id: string;
  name: string;
  category: string;
  brand: string;
  vendor: string;
  price: number;
  unit: string;
  tradePrice?: number;
  inStock: boolean;
  leadTime: string;
  image: string;
  isFavorite: boolean;
  description: string;
  dimensions?: string;
  material?: string;
  colors: string[];
}

interface Vendor {
  id: string;
  name: string;
  category: string;
  logo: string;
  tradeDiscount: number;
  minOrder?: number;
  leadTime: string;
  rating: number;
  phone: string;
  website?: string;
  address: string;
}

const mockMaterials: Material[] = [
  {
    id: "m-1",
    name: "Carrara Marble Slab",
    category: "Stone",
    brand: "Italian Imports",
    vendor: "Austin Stone Gallery",
    price: 125,
    unit: "sq ft",
    tradePrice: 95,
    inStock: true,
    leadTime: "2-3 weeks",
    image: "https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?w=800",
    isFavorite: true,
    description: "Premium Italian Carrara marble, polished finish",
    dimensions: "Slabs vary, avg 8' x 5'",
    material: "Natural Stone",
    colors: ["White", "Gray Veining"],
  },
  {
    id: "m-2",
    name: "White Oak Hardwood Flooring",
    category: "Flooring",
    brand: "Garrison Collection",
    vendor: "Lumber Liquidators",
    price: 8.50,
    unit: "sq ft",
    tradePrice: 6.80,
    inStock: true,
    leadTime: "1 week",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    isFavorite: false,
    description: "5\" wide plank, European white oak, natural finish",
    dimensions: "5\" x Random Lengths",
    material: "Solid Hardwood",
    colors: ["Natural", "Light Gray"],
  },
  {
    id: "m-3",
    name: "Zellige Tile - Sage",
    category: "Tile",
    brand: "Clé Tile",
    vendor: "Clé Tile",
    price: 32,
    unit: "sq ft",
    tradePrice: 22,
    inStock: false,
    leadTime: "6-8 weeks",
    image: "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800",
    isFavorite: true,
    description: "Handmade Moroccan zellige tile, glossy finish",
    dimensions: "4\" x 4\"",
    material: "Glazed Terracotta",
    colors: ["Sage Green"],
  },
  {
    id: "m-4",
    name: "Belgian Linen Drapery",
    category: "Textiles",
    brand: "Libeco",
    vendor: "Schumacher",
    price: 145,
    unit: "yard",
    tradePrice: 72,
    inStock: true,
    leadTime: "3-4 weeks",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
    isFavorite: false,
    description: "100% Belgian linen, heavyweight, natural texture",
    dimensions: "54\" wide",
    material: "100% Linen",
    colors: ["Natural", "White", "Oatmeal", "Flax"],
  },
  {
    id: "m-5",
    name: "Unlacquered Brass Hardware",
    category: "Hardware",
    brand: "House of Antique Hardware",
    vendor: "Rejuvenation",
    price: 28,
    unit: "each",
    tradePrice: 22,
    inStock: true,
    leadTime: "1-2 weeks",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    isFavorite: false,
    description: "3\" cabinet pull, unlacquered brass, will patina",
    dimensions: "3\" CC",
    material: "Solid Brass",
    colors: ["Brass"],
  },
];

const mockVendors: Vendor[] = [
  {
    id: "v-1",
    name: "Austin Stone Gallery",
    category: "Stone & Tile",
    logo: "https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?w=200",
    tradeDiscount: 25,
    minOrder: 500,
    leadTime: "2-4 weeks",
    rating: 4.8,
    phone: "(512) 555-0123",
    website: "austinstonegallery.com",
    address: "2401 S Lamar Blvd, Austin, TX",
  },
  {
    id: "v-2",
    name: "Schumacher",
    category: "Textiles",
    logo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    tradeDiscount: 50,
    leadTime: "3-8 weeks",
    rating: 4.9,
    phone: "(800) 523-1200",
    website: "fschumacher.com",
    address: "To the trade showroom",
  },
  {
    id: "v-3",
    name: "Rejuvenation",
    category: "Hardware & Lighting",
    logo: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200",
    tradeDiscount: 20,
    leadTime: "1-3 weeks",
    rating: 4.6,
    phone: "(888) 401-1900",
    website: "rejuvenation.com",
    address: "220 W 2nd St, Austin, TX",
  },
];

const categories = ["All", "Stone", "Tile", "Flooring", "Textiles", "Hardware", "Lighting", "Wallcovering"];

export default function MaterialSourcingScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [showVendors, setShowVendors] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(mockMaterials.filter(m => m.isFavorite).map(m => m.id));

  const filteredMaterials = mockMaterials.filter((material) => {
    const matchesSearch = material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.vendor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || material.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const formatPrice = (price: number, unit: string) => {
    return `$${price.toFixed(2)}/${unit}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: "Material Sourcing",
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerShadowVisible: false,
          headerRight: () => (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => setShowVendors(true)}
            >
              <Store size={22} color="#EC4899" strokeWidth={1.5} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.header}>
        <View style={[styles.searchContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Search size={20} color={theme.textTertiary} strokeWidth={1.5} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search materials, brands, vendors..."
            placeholderTextColor={theme.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={[styles.filterButton, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Filter size={20} color="#EC4899" strokeWidth={1.5} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              { backgroundColor: selectedCategory === category ? "#EC4899" : theme.surface },
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryText,
                { color: selectedCategory === category ? "#FFFFFF" : theme.textSecondary },
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.resultsHeader}>
          <Text style={[styles.resultsCount, { color: theme.text }]}>
            {filteredMaterials.length} Material{filteredMaterials.length !== 1 ? "s" : ""}
          </Text>
          <TouchableOpacity style={styles.favoritesButton}>
            <Heart size={18} color="#EC4899" fill={favorites.length > 0 ? "#EC4899" : "transparent"} strokeWidth={1.5} />
            <Text style={[styles.favoritesText, { color: theme.textSecondary }]}>
              {favorites.length} Saved
            </Text>
          </TouchableOpacity>
        </View>

        {filteredMaterials.map((material) => (
          <TouchableOpacity
            key={material.id}
            style={[styles.materialCard, { backgroundColor: theme.surface }]}
            onPress={() => setSelectedMaterial(material)}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: material.image }}
              style={styles.materialImage}
              contentFit="cover"
            />
            <TouchableOpacity 
              style={styles.favoriteButton}
              onPress={() => toggleFavorite(material.id)}
            >
              <Heart 
                size={20} 
                color={favorites.includes(material.id) ? "#EC4899" : "#FFFFFF"} 
                fill={favorites.includes(material.id) ? "#EC4899" : "transparent"} 
                strokeWidth={2} 
              />
            </TouchableOpacity>
            
            <View style={styles.materialInfo}>
              <View style={styles.materialHeader}>
                <View style={styles.brandRow}>
                  <Text style={[styles.brandName, { color: theme.textSecondary }]}>{material.brand}</Text>
                  {material.tradePrice && (
                    <View style={styles.tradeBadge}>
                      <Tag size={10} color="#059669" strokeWidth={2} />
                      <Text style={styles.tradeText}>Trade</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.materialName, { color: theme.text }]} numberOfLines={2}>
                  {material.name}
                </Text>
              </View>

              <View style={styles.materialMeta}>
                <View style={styles.priceSection}>
                  {material.tradePrice ? (
                    <>
                      <Text style={[styles.tradePrice, { color: "#EC4899" }]}>
                        {formatPrice(material.tradePrice, material.unit)}
                      </Text>
                      <Text style={[styles.retailPrice, { color: theme.textTertiary }]}>
                        {formatPrice(material.price, material.unit)}
                      </Text>
                    </>
                  ) : (
                    <Text style={[styles.tradePrice, { color: theme.text }]}>
                      {formatPrice(material.price, material.unit)}
                    </Text>
                  )}
                </View>
                
                <View style={styles.stockInfo}>
                  <View style={[styles.stockBadge, { backgroundColor: material.inStock ? "#D1FAE5" : "#E8E9EE" }]}>
                    <Text style={[styles.stockText, { color: material.inStock ? "#059669" : "#D97706" }]}>
                      {material.inStock ? "In Stock" : "Made to Order"}
                    </Text>
                  </View>
                  <View style={styles.leadTimeRow}>
                    <Clock size={12} color={theme.textTertiary} strokeWidth={1.5} />
                    <Text style={[styles.leadTimeText, { color: theme.textSecondary }]}>
                      {material.leadTime}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={[styles.vendorRow, { borderTopColor: theme.borderLight }]}>
                <Store size={14} color={theme.textTertiary} strokeWidth={1.5} />
                <Text style={[styles.vendorText, { color: theme.textSecondary }]}>{material.vendor}</Text>
                <ChevronRight size={16} color={theme.textTertiary} strokeWidth={1.5} />
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {filteredMaterials.length === 0 && (
          <View style={styles.emptyState}>
            <ShoppingBag size={48} color={theme.textTertiary} strokeWidth={1.5} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No Materials Found</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Try adjusting your search or filters
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Material Detail Modal */}
      <Modal
        visible={!!selectedMaterial}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedMaterial(null)}
      >
        {selectedMaterial && (
          <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <TouchableOpacity onPress={() => setSelectedMaterial(null)}>
                <X size={24} color={theme.text} strokeWidth={1.5} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Material Details</Text>
              <TouchableOpacity onPress={() => toggleFavorite(selectedMaterial.id)}>
                <Heart 
                  size={24} 
                  color="#EC4899" 
                  fill={favorites.includes(selectedMaterial.id) ? "#EC4899" : "transparent"} 
                  strokeWidth={1.5} 
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <Image
                source={{ uri: selectedMaterial.image }}
                style={styles.modalImage}
                contentFit="cover"
              />

              <View style={styles.modalInfo}>
                <Text style={[styles.modalBrand, { color: theme.textSecondary }]}>
                  {selectedMaterial.brand}
                </Text>
                <Text style={[styles.modalMaterialName, { color: theme.text }]}>
                  {selectedMaterial.name}
                </Text>

                <View style={styles.pricingCard}>
                  {selectedMaterial.tradePrice && (
                    <View style={styles.pricingRow}>
                      <Text style={styles.pricingLabel}>Trade Price</Text>
                      <Text style={styles.tradePriceValue}>
                        {formatPrice(selectedMaterial.tradePrice, selectedMaterial.unit)}
                      </Text>
                    </View>
                  )}
                  <View style={styles.pricingRow}>
                    <Text style={[styles.pricingLabel, { color: theme.textSecondary }]}>
                      {selectedMaterial.tradePrice ? "Retail Price" : "Price"}
                    </Text>
                    <Text style={[
                      selectedMaterial.tradePrice ? styles.retailPriceValue : styles.tradePriceValue,
                      !selectedMaterial.tradePrice && { color: "#EC4899" }
                    ]}>
                      {formatPrice(selectedMaterial.price, selectedMaterial.unit)}
                    </Text>
                  </View>
                  {selectedMaterial.tradePrice && (
                    <View style={styles.savingsRow}>
                      <Text style={styles.savingsText}>
                        You save {Math.round((1 - selectedMaterial.tradePrice / selectedMaterial.price) * 100)}% with trade pricing
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={[styles.descriptionTitle, { color: theme.text }]}>Description</Text>
                <Text style={[styles.descriptionText, { color: theme.textSecondary }]}>
                  {selectedMaterial.description}
                </Text>

                <View style={styles.specsGrid}>
                  {selectedMaterial.dimensions && (
                    <View style={[styles.specCard, { backgroundColor: theme.surfaceSecondary }]}>
                      <Text style={[styles.specLabel, { color: theme.textSecondary }]}>Dimensions</Text>
                      <Text style={[styles.specValue, { color: theme.text }]}>{selectedMaterial.dimensions}</Text>
                    </View>
                  )}
                  {selectedMaterial.material && (
                    <View style={[styles.specCard, { backgroundColor: theme.surfaceSecondary }]}>
                      <Text style={[styles.specLabel, { color: theme.textSecondary }]}>Material</Text>
                      <Text style={[styles.specValue, { color: theme.text }]}>{selectedMaterial.material}</Text>
                    </View>
                  )}
                  <View style={[styles.specCard, { backgroundColor: theme.surfaceSecondary }]}>
                    <Text style={[styles.specLabel, { color: theme.textSecondary }]}>Lead Time</Text>
                    <Text style={[styles.specValue, { color: theme.text }]}>{selectedMaterial.leadTime}</Text>
                  </View>
                  <View style={[styles.specCard, { backgroundColor: theme.surfaceSecondary }]}>
                    <Text style={[styles.specLabel, { color: theme.textSecondary }]}>Availability</Text>
                    <Text style={[styles.specValue, { color: selectedMaterial.inStock ? "#059669" : "#D97706" }]}>
                      {selectedMaterial.inStock ? "In Stock" : "Made to Order"}
                    </Text>
                  </View>
                </View>

                {selectedMaterial.colors.length > 0 && (
                  <>
                    <Text style={[styles.colorsTitle, { color: theme.text }]}>Available Colors</Text>
                    <View style={styles.colorsList}>
                      {selectedMaterial.colors.map((color, index) => (
                        <View key={index} style={[styles.colorChip, { backgroundColor: theme.surfaceSecondary }]}>
                          <Text style={[styles.colorText, { color: theme.text }]}>{color}</Text>
                        </View>
                      ))}
                    </View>
                  </>
                )}

                <View style={[styles.vendorCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <View style={styles.vendorInfo}>
                    <Store size={20} color="#EC4899" strokeWidth={1.5} />
                    <View style={styles.vendorDetails}>
                      <Text style={[styles.vendorName, { color: theme.text }]}>{selectedMaterial.vendor}</Text>
                      <Text style={[styles.vendorCategory, { color: theme.textSecondary }]}>
                        {selectedMaterial.category}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.vendorAction}>
                    <ExternalLink size={18} color="#EC4899" strokeWidth={1.5} />
                  </TouchableOpacity>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity style={[styles.secondaryButton, { borderColor: "#EC4899" }]}>
                    <Bookmark size={18} color="#EC4899" strokeWidth={1.5} />
                    <Text style={styles.secondaryButtonText}>Save to Project</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.primaryButton}>
                    <ShoppingBag size={18} color="#FFFFFF" strokeWidth={1.5} />
                    <Text style={styles.primaryButtonText}>Request Quote</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>

      {/* Vendors Modal */}
      <Modal
        visible={showVendors}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowVendors(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <TouchableOpacity onPress={() => setShowVendors(false)}>
              <X size={24} color={theme.text} strokeWidth={1.5} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Vendors Directory</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {mockVendors.map((vendor) => (
              <View
                key={vendor.id}
                style={[styles.vendorListCard, { backgroundColor: theme.surface }]}
              >
                <View style={styles.vendorListHeader}>
                  <View style={[styles.vendorLogo, { backgroundColor: theme.surfaceSecondary }]}>
                    <Store size={24} color="#EC4899" strokeWidth={1.5} />
                  </View>
                  <View style={styles.vendorListInfo}>
                    <Text style={[styles.vendorListName, { color: theme.text }]}>{vendor.name}</Text>
                    <Text style={[styles.vendorListCategory, { color: theme.textSecondary }]}>
                      {vendor.category}
                    </Text>
                  </View>
                  <View style={styles.vendorRating}>
                    <Star size={14} color="#272D53" fill="#272D53" strokeWidth={1.5} />
                    <Text style={[styles.ratingText, { color: theme.text }]}>{vendor.rating}</Text>
                  </View>
                </View>

                <View style={styles.vendorListMeta}>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{vendor.tradeDiscount}% Trade Discount</Text>
                  </View>
                  {vendor.minOrder && (
                    <Text style={[styles.minOrderText, { color: theme.textSecondary }]}>
                      Min: ${vendor.minOrder}
                    </Text>
                  )}
                  <View style={styles.leadTimeBadge}>
                    <Clock size={12} color={theme.textSecondary} strokeWidth={1.5} />
                    <Text style={[styles.leadTimeLabel, { color: theme.textSecondary }]}>
                      {vendor.leadTime}
                    </Text>
                  </View>
                </View>

                <View style={[styles.vendorListActions, { borderTopColor: theme.borderLight }]}>
                  <TouchableOpacity style={[styles.vendorActionBtn, { backgroundColor: theme.surfaceSecondary }]}>
                    <Phone size={16} color={theme.text} strokeWidth={1.5} />
                    <Text style={[styles.vendorActionText, { color: theme.text }]}>Call</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.vendorActionBtn, { backgroundColor: theme.surfaceSecondary }]}>
                    <MapPin size={16} color={theme.text} strokeWidth={1.5} />
                    <Text style={[styles.vendorActionText, { color: theme.text }]}>Visit</Text>
                  </TouchableOpacity>
                  {vendor.website && (
                    <TouchableOpacity style={[styles.vendorActionBtn, { backgroundColor: theme.surfaceSecondary }]}>
                      <Globe size={16} color={theme.text} strokeWidth={1.5} />
                      <Text style={[styles.vendorActionText, { color: theme.text }]}>Website</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButton: {
    padding: 8,
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
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  categoryScroll: {
    maxHeight: 44,
    marginBottom: 8,
  },
  categoryContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500" as const,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 12,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  favoritesButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  favoritesText: {
    fontSize: 14,
    fontWeight: "500" as const,
  },
  materialCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  materialImage: {
    width: "100%",
    height: 180,
  },
  favoriteButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  materialInfo: {
    padding: 14,
  },
  materialHeader: {
    marginBottom: 12,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  brandName: {
    fontSize: 12,
    fontWeight: "500" as const,
  },
  tradeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tradeText: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: "#059669",
  },
  materialName: {
    fontSize: 17,
    fontWeight: "700" as const,
    lineHeight: 22,
  },
  materialMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  priceSection: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  tradePrice: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
  retailPrice: {
    fontSize: 14,
    textDecorationLine: "line-through",
  },
  stockInfo: {
    alignItems: "flex-end",
    gap: 6,
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stockText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  leadTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  leadTimeText: {
    fontSize: 12,
  },
  vendorRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  vendorText: {
    fontSize: 13,
    flex: 1,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
  modalContent: {
    flex: 1,
  },
  modalImage: {
    width: "100%",
    height: 280,
  },
  modalInfo: {
    padding: 20,
  },
  modalBrand: {
    fontSize: 14,
    fontWeight: "500" as const,
    marginBottom: 4,
  },
  modalMaterialName: {
    fontSize: 24,
    fontWeight: "700" as const,
    marginBottom: 20,
  },
  pricingCard: {
    backgroundColor: "#FDF2F8",
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  pricingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  pricingLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  tradePriceValue: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#EC4899",
  },
  retailPriceValue: {
    fontSize: 16,
    color: "#9CA3AF",
    textDecorationLine: "line-through",
  },
  savingsRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#FCE7F3",
  },
  savingsText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#059669",
    textAlign: "center",
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  specsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  specCard: {
    width: "48%",
    padding: 12,
    borderRadius: 10,
  },
  specLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  specValue: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  colorsTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginBottom: 10,
  },
  colorsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  colorChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  colorText: {
    fontSize: 13,
    fontWeight: "500" as const,
  },
  vendorCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  vendorInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  vendorDetails: {
    flex: 1,
  },
  vendorName: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  vendorCategory: {
    fontSize: 12,
    marginTop: 2,
  },
  vendorAction: {
    padding: 8,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#EC4899",
  },
  primaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#EC4899",
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  vendorListCard: {
    margin: 20,
    marginBottom: 0,
    padding: 16,
    borderRadius: 16,
  },
  vendorListHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  vendorLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  vendorListInfo: {
    flex: 1,
    marginLeft: 12,
  },
  vendorListName: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  vendorListCategory: {
    fontSize: 13,
    marginTop: 2,
  },
  vendorRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  vendorListMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  discountBadge: {
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: "#059669",
  },
  minOrderText: {
    fontSize: 12,
  },
  leadTimeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  leadTimeLabel: {
    fontSize: 12,
  },
  vendorListActions: {
    flexDirection: "row",
    gap: 10,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  vendorActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  vendorActionText: {
    fontSize: 13,
    fontWeight: "500" as const,
  },
});
