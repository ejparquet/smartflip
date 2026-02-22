import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from "react-native";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import {
  Search,
  Filter,
  X,
  DollarSign,
  Ruler,
  Clock,
  CheckCircle,
  Package,
  Heart,
  Share2,
  ExternalLink,
  ChevronDown,
  FolderPlus,
} from "lucide-react-native";
import { Alert } from "react-native";
import Colors from "@/constants/colors";
import { mockFurnitureItems, FurnitureItem, DesignStyle } from "@/mocks/interior-designers";

const categories = [
  "All",
  "Seating",
  "Tables",
  "Storage",
  "Beds",
  "Lighting",
  "Rugs",
  "Decor",
];

const styleLabels: Record<DesignStyle, string> = {
  modern: "Modern",
  traditional: "Traditional",
  transitional: "Transitional",
  minimalist: "Minimalist",
  bohemian: "Bohemian",
  industrial: "Industrial",
  scandinavian: "Scandinavian",
  mid_century: "Mid-Century",
  coastal: "Coastal",
  farmhouse: "Farmhouse",
  contemporary: "Contemporary",
  eclectic: "Eclectic",
};

export default function FurnitureDatabaseScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedItem, setSelectedItem] = useState<FurnitureItem | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [selectedStyles, setSelectedStyles] = useState<DesignStyle[]>([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  const mockProjects = [
    { id: "dp-1", name: "Westlake Modern Refresh", client: "Sarah Mitchell" },
    { id: "dp-2", name: "Downtown Condo Staging", client: "Michael Chen" },
    { id: "dp-3", name: "Lakeway Kitchen & Bath", client: "Emily & James Rodriguez" },
  ];

  const toggleFavorite = (itemId: string) => {
    setFavorites(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleAddToProject = (projectId: string, projectName: string) => {
    if (selectedItem) {
      Alert.alert(
        "Added to Project",
        `"${selectedItem.name}" has been added to "${projectName}".`,
        [{ text: "OK", onPress: () => {
          setShowProjectModal(false);
          setSelectedItem(null);
        }}]
      );
    }
  };

  const filteredItems = mockFurnitureItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    const matchesPrice =
      item.price >= priceRange[0] && item.price <= priceRange[1];
    const matchesStyle =
      selectedStyles.length === 0 ||
      item.style.some((s) => selectedStyles.includes(s));
    return matchesSearch && matchesCategory && matchesPrice && matchesStyle;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Furniture Database",
          headerStyle: { backgroundColor: Colors.background },
          headerShadowVisible: false,
        }}
      />

      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search furniture, brands..."
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Filter size={20} color={Colors.primary} />
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
          {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""} found
        </Text>

        <View style={styles.itemsGrid}>
          {filteredItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.itemCard}
              onPress={() => setSelectedItem(item)}
            >
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.itemImage}
                  contentFit="cover"
                />
                <TouchableOpacity 
                  style={[styles.favoriteButton, favorites.includes(item.id) && styles.favoriteButtonActive]}
                  onPress={() => toggleFavorite(item.id)}
                >
                  <Heart size={18} color={Colors.white} fill={favorites.includes(item.id) ? Colors.white : "transparent"} />
                </TouchableOpacity>
                {item.inStock && (
                  <View style={styles.inStockBadge}>
                    <CheckCircle size={10} color="#10B981" />
                    <Text style={styles.inStockText}>In Stock</Text>
                  </View>
                )}
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.itemBrand}>{item.brand}</Text>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
                <View style={styles.itemMeta}>
                  <Clock size={12} color={Colors.textTertiary} />
                  <Text style={styles.itemMetaText}>{item.leadTime}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {filteredItems.length === 0 && (
          <View style={styles.emptyState}>
            <Package size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Items Found</Text>
            <Text style={styles.emptyText}>
              Try adjusting your search or filters
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal
        visible={!!selectedItem}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedItem(null)}
      >
        {selectedItem && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setSelectedItem(null)}
              >
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Product Details</Text>
              <TouchableOpacity style={styles.modalClose}>
                <Share2 size={22} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Image
                source={{ uri: selectedItem.imageUrl }}
                style={styles.modalImage}
                contentFit="cover"
              />

              <View style={styles.modalProductInfo}>
                <Text style={styles.modalBrand}>{selectedItem.brand}</Text>
                <Text style={styles.modalName}>{selectedItem.name}</Text>
                <Text style={styles.modalPrice}>
                  {formatCurrency(selectedItem.price)}
                </Text>

                <View style={styles.stockStatus}>
                  {selectedItem.inStock ? (
                    <>
                      <CheckCircle size={16} color="#10B981" />
                      <Text style={[styles.stockText, { color: "#10B981" }]}>
                        In Stock
                      </Text>
                    </>
                  ) : (
                    <>
                      <Clock size={16} color="#272D53" />
                      <Text style={[styles.stockText, { color: "#272D53" }]}>
                        Lead Time: {selectedItem.leadTime}
                      </Text>
                    </>
                  )}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Dimensions</Text>
                <View style={styles.dimensionsGrid}>
                  <View style={styles.dimensionItem}>
                    <Text style={styles.dimensionLabel}>Width</Text>
                    <Text style={styles.dimensionValue}>
                      {selectedItem.dimensions.width}"
                    </Text>
                  </View>
                  <View style={styles.dimensionItem}>
                    <Text style={styles.dimensionLabel}>Depth</Text>
                    <Text style={styles.dimensionValue}>
                      {selectedItem.dimensions.depth}"
                    </Text>
                  </View>
                  <View style={styles.dimensionItem}>
                    <Text style={styles.dimensionLabel}>Height</Text>
                    <Text style={styles.dimensionValue}>
                      {selectedItem.dimensions.height}"
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Materials</Text>
                <View style={styles.tagsContainer}>
                  {selectedItem.materials.map((material, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{material}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Available Colors</Text>
                <View style={styles.tagsContainer}>
                  {selectedItem.colors.map((color, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{color}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Design Styles</Text>
                <View style={styles.tagsContainer}>
                  {selectedItem.style.map((style, index) => (
                    <View key={index} style={[styles.tag, styles.styleTag]}>
                      <Text style={[styles.tagText, styles.styleTagText]}>
                        {styleLabels[style]}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Vendor</Text>
                <View style={styles.vendorCard}>
                  <View style={styles.vendorInfo}>
                    <Text style={styles.vendorName}>{selectedItem.vendorName}</Text>
                    <Text style={styles.vendorLead}>
                      Lead Time: {selectedItem.leadTime}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.vendorButton}>
                    <ExternalLink size={16} color="#EC4899" />
                    <Text style={styles.vendorButtonText}>View</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.addToProjectButton}
                  onPress={() => setShowProjectModal(true)}
                >
                  <FolderPlus size={18} color={Colors.white} />
                  <Text style={styles.addToProjectText}>Add to Project</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.saveButton, favorites.includes(selectedItem.id) && styles.saveButtonActive]}
                  onPress={() => toggleFavorite(selectedItem.id)}
                >
                  <Heart size={20} color="#EC4899" fill={favorites.includes(selectedItem.id) ? "#EC4899" : "transparent"} />
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>

      <Modal
        visible={showFilterModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowFilterModal(false)}
            >
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Filter</Text>
            <TouchableOpacity
              onPress={() => {
                setPriceRange([0, 10000]);
                setSelectedStyles([]);
              }}
            >
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterContent}>
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Price Range</Text>
              <View style={styles.priceInputs}>
                <View style={styles.priceInput}>
                  <Text style={styles.priceInputLabel}>Min</Text>
                  <TextInput
                    style={styles.priceInputField}
                    placeholder="$0"
                    placeholderTextColor={Colors.textTertiary}
                    keyboardType="numeric"
                    value={priceRange[0].toString()}
                    onChangeText={(text) =>
                      setPriceRange([parseInt(text) || 0, priceRange[1]])
                    }
                  />
                </View>
                <Text style={styles.priceSeparator}>to</Text>
                <View style={styles.priceInput}>
                  <Text style={styles.priceInputLabel}>Max</Text>
                  <TextInput
                    style={styles.priceInputField}
                    placeholder="$10,000"
                    placeholderTextColor={Colors.textTertiary}
                    keyboardType="numeric"
                    value={priceRange[1].toString()}
                    onChangeText={(text) =>
                      setPriceRange([priceRange[0], parseInt(text) || 10000])
                    }
                  />
                </View>
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Design Style</Text>
              <View style={styles.styleOptions}>
                {Object.entries(styleLabels).map(([key, label]) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.styleOption,
                      selectedStyles.includes(key as DesignStyle) &&
                        styles.styleOptionActive,
                    ]}
                    onPress={() => {
                      const style = key as DesignStyle;
                      if (selectedStyles.includes(style)) {
                        setSelectedStyles(selectedStyles.filter((s) => s !== style));
                      } else {
                        setSelectedStyles([...selectedStyles, style]);
                      }
                    }}
                  >
                    <Text
                      style={[
                        styles.styleOptionText,
                        selectedStyles.includes(key as DesignStyle) &&
                          styles.styleOptionTextActive,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.filterFooter}>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showProjectModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowProjectModal(false)}
      >
        <View style={styles.projectModalOverlay}>
          <View style={styles.projectModalContent}>
            <View style={styles.projectModalHeader}>
              <Text style={styles.projectModalTitle}>Add to Project</Text>
              <TouchableOpacity
                style={styles.projectModalClose}
                onPress={() => setShowProjectModal(false)}
              >
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            {selectedItem && (
              <View style={styles.selectedItemPreview}>
                <Image
                  source={{ uri: selectedItem.imageUrl }}
                  style={styles.selectedItemImage}
                  contentFit="cover"
                />
                <View style={styles.selectedItemInfo}>
                  <Text style={styles.selectedItemName} numberOfLines={1}>{selectedItem.name}</Text>
                  <Text style={styles.selectedItemPrice}>{formatCurrency(selectedItem.price)}</Text>
                </View>
              </View>
            )}

            <Text style={styles.selectProjectLabel}>Select a project:</Text>

            <ScrollView style={styles.projectsList}>
              {mockProjects.map(project => (
                <TouchableOpacity
                  key={project.id}
                  style={styles.projectOption}
                  onPress={() => handleAddToProject(project.id, project.name)}
                >
                  <View style={styles.projectOptionIcon}>
                    <FolderPlus size={20} color="#EC4899" />
                  </View>
                  <View style={styles.projectOptionInfo}>
                    <Text style={styles.projectOptionName}>{project.name}</Text>
                    <Text style={styles.projectOptionClient}>{project.client}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
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
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
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
  itemsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  itemCard: {
    width: "48%",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  imageContainer: {
    position: "relative",
  },
  itemImage: {
    width: "100%",
    height: 140,
  },
  favoriteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  inStockBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  inStockText: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: "#10B981",
  },
  itemContent: {
    padding: 12,
  },
  itemBrand: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontWeight: "500" as const,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginTop: 4,
    lineHeight: 20,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#EC4899",
    marginTop: 8,
  },
  itemMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  itemMetaText: {
    fontSize: 11,
    color: Colors.textTertiary,
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
  clearText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500" as const,
  },
  modalContent: {
    flex: 1,
  },
  modalImage: {
    width: "100%",
    height: 300,
  },
  modalProductInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  modalBrand: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "500" as const,
  },
  modalName: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.text,
    marginTop: 4,
  },
  modalPrice: {
    fontSize: 24,
    fontWeight: "800" as const,
    color: "#EC4899",
    marginTop: 12,
  },
  stockStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
  },
  stockText: {
    fontSize: 14,
    fontWeight: "500" as const,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 14,
  },
  dimensionsGrid: {
    flexDirection: "row",
    gap: 16,
  },
  dimensionItem: {
    flex: 1,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  dimensionLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  dimensionValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 13,
    color: Colors.text,
  },
  styleTag: {
    backgroundColor: "#FCE7F3",
  },
  styleTagText: {
    color: "#EC4899",
  },
  vendorCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 14,
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  vendorLead: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  vendorButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  vendorButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#EC4899",
  },
  actionButtons: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
  },
  addToProjectButton: {
    flex: 1,
    backgroundColor: "#EC4899",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  addToProjectText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  saveButton: {
    width: 56,
    height: 56,
    backgroundColor: "#FCE7F3",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  filterContent: {
    flex: 1,
    padding: 20,
  },
  filterSection: {
    marginBottom: 28,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 14,
  },
  priceInputs: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  priceInput: {
    flex: 1,
  },
  priceInputLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  priceInputField: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  priceSeparator: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 20,
  },
  styleOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  styleOption: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  styleOptionActive: {
    backgroundColor: "#FCE7F3",
    borderColor: "#EC4899",
  },
  styleOptionText: {
    fontSize: 14,
    color: Colors.text,
  },
  styleOptionTextActive: {
    color: "#EC4899",
    fontWeight: "600" as const,
  },
  filterFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  applyButton: {
    backgroundColor: "#EC4899",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  favoriteButtonActive: {
    backgroundColor: "#EC4899",
  },
  saveButtonActive: {
    backgroundColor: "#FCE7F3",
  },
  projectModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end" as const,
  },
  projectModalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "70%",
  },
  projectModalHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 20,
  },
  projectModalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  projectModalClose: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  selectedItemPreview: {
    flexDirection: "row" as const,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    alignItems: "center" as const,
  },
  selectedItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  selectedItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  selectedItemName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  selectedItemPrice: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#EC4899",
    marginTop: 4,
  },
  selectProjectLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  projectsList: {
    maxHeight: 300,
  },
  projectOption: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  projectOptionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#FCE7F3",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  projectOptionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  projectOptionName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  projectOptionClient: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
