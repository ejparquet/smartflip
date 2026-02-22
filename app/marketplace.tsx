import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Stack } from "expo-router";
import {
  Search,
  Plus,
  MapPin,
  Grid3x3,
  TreeDeciduous,
  DoorClosed,
  Bath,
  Droplets,
  Refrigerator,
  Square,
  Paintbrush,
  Lightbulb,
  Wrench,
  Package,
  SlidersHorizontal,
  X,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { mockMarketplaceListings, marketplaceCategories } from "@/mocks/marketplace";
import { MarketplaceCategory, ListingCondition } from "@/types";
import { useLocation, getDistanceFromCoords } from "@/contexts/LocationContext";
import LocationBanner from "@/components/LocationBanner";
import BackButton from "@/components/BackButton";
import { useTheme } from "@/contexts/ThemeContext";

const categoryIcons: Record<MarketplaceCategory, React.ElementType> = {
  tile: Grid3x3,
  wood: TreeDeciduous,
  cabinets: DoorClosed,
  fixtures: Bath,
  plumbing: Droplets,
  appliances: Refrigerator,
  flooring: Square,
  paint: Paintbrush,
  lighting: Lightbulb,
  hardware: Wrench,
  other: Package,
};

const conditionLabels: Record<ListingCondition, string> = {
  new: "New",
  like_new: "Like New",
  good: "Good",
  fair: "Fair",
};

const conditionColors: Record<ListingCondition, string> = {
  new: "#10B981",
  like_new: "#3B82F6",
  good: "#272D53",
  fair: "#6B7280",
};

export default function MarketplaceScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<MarketplaceCategory | "all">("all");
  const [showFilters, setShowFilters] = useState(false);
  const { location, maxDistanceMiles, isLocationEnabled } = useLocation();

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const filteredListings = useMemo(() => {
    return mockMarketplaceListings
      .filter((listing) => {
        if (listing.isSold) return false;
        
        const matchesSearch =
          searchQuery === "" ||
          listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          listing.description.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory =
          selectedCategory === "all" || listing.category === selectedCategory;

        if (!matchesSearch || !matchesCategory) return false;

        if (location && listing.latitude && listing.longitude) {
          const distance = getDistanceFromCoords(
            location.latitude,
            location.longitude,
            listing.latitude,
            listing.longitude
          );
          return distance <= maxDistanceMiles;
        }

        return true;
      })
      .map((listing) => {
        if (location && listing.latitude && listing.longitude) {
          const distance = getDistanceFromCoords(
            location.latitude,
            location.longitude,
            listing.latitude,
            listing.longitude
          );
          return { ...listing, calculatedDistance: distance };
        }
        return { ...listing, calculatedDistance: null };
      })
      .sort((a, b) => {
        if (a.calculatedDistance !== null && b.calculatedDistance !== null) {
          return a.calculatedDistance - b.calculatedDistance;
        }
        return 0;
      });
  }, [searchQuery, selectedCategory, location, maxDistanceMiles]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
        <View style={[styles.header, { backgroundColor: theme.background }]}>
          <BackButton color={theme.navy} backgroundColor={theme.surfaceSecondary} />
          <Text style={[styles.headerTitle, { color: theme.text }]}>Sell Materials</Text>
          <TouchableOpacity
            style={[styles.headerAddButton, { backgroundColor: theme.surfaceSecondary }]}
            onPress={() => router.push("/add-listing" as any)}
          >
            <Plus size={20} color={theme.navy} strokeWidth={2} />
          </TouchableOpacity>
        </View>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.navy} />
          }
        >
          <LocationBanner />

          {/* Search Bar */}
          <View style={[styles.searchContainer, { marginTop: 12 }]}>
            <View style={styles.searchInputWrapper}>
              <Search size={20} color="#9CA3AF" strokeWidth={1.5} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search materials..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <X size={18} color="#9CA3AF" strokeWidth={2} />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              style={[styles.filterButton, showFilters && styles.filterButtonActive]}
              onPress={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal
                size={20}
                color={showFilters ? "#FFFFFF" : Colors.navy}
                strokeWidth={1.5}
              />
            </TouchableOpacity>
          </View>

          {/* Category Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryContainer}
          >
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === "all" && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory("all")}
            >
              <Package
                size={16}
                color={selectedCategory === "all" ? "#FFFFFF" : "#6B7280"}
                strokeWidth={1.5}
              />
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === "all" && styles.categoryChipTextActive,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            {marketplaceCategories.map((category) => {
              const IconComponent = categoryIcons[category.id];
              return (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category.id && styles.categoryChipActive,
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <IconComponent
                    size={16}
                    color={selectedCategory === category.id ? "#FFFFFF" : "#6B7280"}
                    strokeWidth={1.5}
                  />
                  <Text
                    style={[
                      styles.categoryChipText,
                      selectedCategory === category.id && styles.categoryChipTextActive,
                    ]}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Results Count */}
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>
              {filteredListings.length} {filteredListings.length === 1 ? "listing" : "listings"}
            </Text>
          </View>

          {/* Listings Grid */}
          <View style={styles.listingsGrid}>
            {filteredListings.map((listing) => (
              <TouchableOpacity
                key={listing.id}
                style={styles.listingCard}
                onPress={() => router.push(`/listing/${listing.id}` as any)}
                activeOpacity={0.9}
              >
                <View style={styles.listingImageContainer}>
                  <Image
                    source={{ uri: listing.images[0] }}
                    style={styles.listingImage}
                    contentFit="cover"
                  />
                  <View
                    style={[
                      styles.conditionBadge,
                      { backgroundColor: conditionColors[listing.condition] },
                    ]}
                  >
                    <Text style={styles.conditionText}>
                      {conditionLabels[listing.condition]}
                    </Text>
                  </View>
                </View>
                <View style={styles.listingInfo}>
                  <Text style={styles.listingPrice}>{formatPrice(listing.price)}</Text>
                  <Text style={styles.listingTitle} numberOfLines={2}>
                    {listing.title}
                  </Text>
                  <View style={styles.listingMeta}>
                    <MapPin size={12} color="#9CA3AF" strokeWidth={1.5} />
                    <Text style={styles.listingLocation}>
                      {listing.calculatedDistance !== null
                        ? `${listing.calculatedDistance.toFixed(1)} mi`
                        : listing.location}
                    </Text>
                  </View>
                  <Text style={styles.listingDate}>{formatDate(listing.createdAt)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {filteredListings.length === 0 && (
            <View style={styles.emptyState}>
              <Package size={48} color="#D1D5DB" strokeWidth={1.5} />
              <Text style={styles.emptyStateTitle}>No listings found</Text>
              <Text style={styles.emptyStateSubtitle}>
                {isLocationEnabled
                  ? `No listings within ${maxDistanceMiles} miles. Try increasing your search radius.`
                  : "Try adjusting your search or filters"}
              </Text>
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Floating Add Button */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push("/add-listing" as any)}
          activeOpacity={0.9}
        >
          <Plus size={28} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </SafeAreaView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1E2A3B",
  },
  headerAddButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#1F2937",
  },
  filterButton: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  filterButtonActive: {
    backgroundColor: Colors.navy,
  },
  categoryContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 6,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: Colors.navy,
    borderColor: Colors.navy,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "#6B7280",
  },
  categoryChipTextActive: {
    color: "#FFFFFF",
  },
  resultsHeader: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#6B7280",
  },
  listingsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    gap: 12,
  },
  listingCard: {
    width: "47%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  listingImageContainer: {
    position: "relative",
  },
  listingImage: {
    width: "100%",
    height: 140,
  },
  conditionBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  conditionText: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  listingInfo: {
    padding: 12,
  },
  listingPrice: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.navy,
    marginBottom: 4,
  },
  listingTitle: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "#1F2937",
    lineHeight: 18,
    marginBottom: 8,
  },
  listingMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  listingLocation: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  listingDate: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#4B5563",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: Platform.OS === "ios" ? 30 : 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.navy,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.navy,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
});
