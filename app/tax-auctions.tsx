import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Linking,
  Alert,
  TextInput,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import {
  MapPin,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Home,
  Building2,
  TreePine,
  ChevronRight,
  Navigation,
  Clock,
  Filter,
  Search,
  X,
  Gavel,
  AlertCircle,
  FileText,
  ExternalLink,
  Bed,
  Bath,
  Maximize,
  ArrowUpDown,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { useLocation } from "@/contexts/LocationContext";
import BackButton from "@/components/BackButton";
import LocationBanner from "@/components/LocationBanner";
import Colors from "@/constants/colors";
import {
  mockTaxAuctions,
  getAuctionsByDistance,
  formatCurrency,
  getPropertyTypeLabel,
  TaxAuctionProperty,
} from "@/mocks/taxAuctions";

type FilterType = "all" | "upcoming" | "active";
type PropertyTypeFilter = "all" | "single_family" | "multi_family" | "commercial" | "land" | "condo";
type SortOption = "distance" | "date" | "price_low" | "price_high";

const propertyTypeIcons: Record<TaxAuctionProperty["propertyType"], typeof Home> = {
  single_family: Home,
  multi_family: Building2,
  commercial: Building2,
  land: TreePine,
  condo: Building2,
};

export default function TaxAuctionsScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const { location, isLocationEnabled, requestLocation } = useLocation();
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<FilterType>("all");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<PropertyTypeFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("distance");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<TaxAuctionProperty | null>(null);

  const dynamicStyles = useMemo(() => ({
    container: { backgroundColor: theme.background },
    card: { backgroundColor: theme.surface },
    text: { color: theme.text },
    textSecondary: { color: theme.textSecondary },
    textTertiary: { color: theme.textTertiary },
    border: { borderColor: theme.border },
    filterChip: { backgroundColor: theme.surface, borderColor: theme.border },
    filterChipActive: { backgroundColor: theme.navy, borderColor: theme.navy },
    searchInput: { backgroundColor: theme.surface, borderColor: theme.border },
  }), [theme]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const filteredAuctions = useMemo(() => {
    let auctions = mockTaxAuctions;

    if (statusFilter !== "all") {
      auctions = auctions.filter(a => a.status === statusFilter);
    }

    if (propertyTypeFilter !== "all") {
      auctions = auctions.filter(a => a.propertyType === propertyTypeFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      auctions = auctions.filter(a => 
        a.address.toLowerCase().includes(query) ||
        a.city.toLowerCase().includes(query) ||
        a.zipCode.includes(query)
      );
    }

    if (isLocationEnabled && location) {
      const auctionsWithDistance = getAuctionsByDistance(
        auctions,
        location.latitude,
        location.longitude,
        100
      );

      switch (sortOption) {
        case "distance":
          return auctionsWithDistance;
        case "date":
          return auctionsWithDistance.sort((a, b) => 
            new Date(a.auctionDate).getTime() - new Date(b.auctionDate).getTime()
          );
        case "price_low":
          return auctionsWithDistance.sort((a, b) => a.startingBid - b.startingBid);
        case "price_high":
          return auctionsWithDistance.sort((a, b) => b.startingBid - a.startingBid);
        default:
          return auctionsWithDistance;
      }
    }

    return auctions.map(a => ({ ...a, distance: 0 }));
  }, [statusFilter, propertyTypeFilter, searchQuery, sortOption, isLocationEnabled, location]);

  const handleCall = useCallback((phone: string) => {
    const phoneUrl = `tel:${phone.replace(/[^\d]/g, '')}`;
    Linking.canOpenURL(phoneUrl).then(supported => {
      if (supported) {
        Linking.openURL(phoneUrl);
      } else {
        Alert.alert("Unable to Call", `Please call ${phone} manually.`);
      }
    });
  }, []);

  const handleEmail = useCallback((email: string, property: TaxAuctionProperty) => {
    const subject = encodeURIComponent(`Inquiry: ${property.address} - Tax Auction`);
    const body = encodeURIComponent(
      `Hello,\n\nI am interested in the tax auction property at:\n\n` +
      `Address: ${property.address}, ${property.city}, ${property.state} ${property.zipCode}\n` +
      `Parcel ID: ${property.parcelId}\n` +
      `Auction Date: ${property.auctionDate}\n\n` +
      `Please provide more information about this property.\n\nThank you.`
    );
    Linking.openURL(`mailto:${email}?subject=${subject}&body=${body}`);
  }, []);

  const formatDate = useCallback((dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }, []);

  const getDaysUntilAuction = useCallback((dateStr: string) => {
    const auctionDate = new Date(dateStr);
    const today = new Date();
    const diffTime = auctionDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, []);

  const renderPropertyCard = useCallback((property: TaxAuctionProperty & { distance: number }) => {
    const PropertyIcon = propertyTypeIcons[property.propertyType];
    const daysUntil = getDaysUntilAuction(property.auctionDate);
    const isUrgent = daysUntil <= 7 && daysUntil > 0;

    return (
      <TouchableOpacity
        key={property.id}
        style={[styles.propertyCard, dynamicStyles.card]}
        onPress={() => setSelectedProperty(property)}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: property.image }}
          style={styles.propertyImage}
          contentFit="cover"
        />
        
        <View style={styles.propertyBadges}>
          <View style={[styles.statusBadge, property.status === "active" && styles.activeBadge]}>
            <Text style={styles.statusBadgeText}>
              {property.status === "active" ? "LIVE NOW" : "UPCOMING"}
            </Text>
          </View>
          {isUrgent && (
            <View style={styles.urgentBadge}>
              <AlertCircle size={12} color="#FFF" />
              <Text style={styles.urgentBadgeText}>{daysUntil}d left</Text>
            </View>
          )}
        </View>

        <View style={styles.propertyContent}>
          <View style={styles.propertyHeader}>
            <View style={[styles.propertyTypeIcon, { backgroundColor: `${theme.navy}15` }]}>
              <PropertyIcon size={18} color={theme.navy} strokeWidth={1.5} />
            </View>
            <Text style={[styles.propertyType, dynamicStyles.textSecondary]}>
              {getPropertyTypeLabel(property.propertyType)}
            </Text>
          </View>

          <Text style={[styles.propertyAddress, dynamicStyles.text]} numberOfLines={1}>
            {property.address}
          </Text>
          <Text style={[styles.propertyLocation, dynamicStyles.textSecondary]}>
            {property.city}, {property.state} {property.zipCode}
          </Text>

          {isLocationEnabled && property.distance > 0 && (
            <View style={styles.distanceRow}>
              <Navigation size={14} color={theme.navy} strokeWidth={1.5} />
              <Text style={[styles.distanceText, { color: theme.navy }]}>
                {property.distance.toFixed(1)} miles away
              </Text>
            </View>
          )}

          <View style={styles.propertyStats}>
            {property.bedrooms ? (
              <View style={styles.statItem}>
                <Bed size={14} color={theme.textTertiary} strokeWidth={1.5} />
                <Text style={[styles.statText, dynamicStyles.textTertiary]}>{property.bedrooms}</Text>
              </View>
            ) : null}
            {property.bathrooms ? (
              <View style={styles.statItem}>
                <Bath size={14} color={theme.textTertiary} strokeWidth={1.5} />
                <Text style={[styles.statText, dynamicStyles.textTertiary]}>{property.bathrooms}</Text>
              </View>
            ) : null}
            {property.sqft ? (
              <View style={styles.statItem}>
                <Maximize size={14} color={theme.textTertiary} strokeWidth={1.5} />
                <Text style={[styles.statText, dynamicStyles.textTertiary]}>{property.sqft.toLocaleString()} sqft</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.divider} />

          <View style={styles.auctionInfo}>
            <View style={styles.auctionRow}>
              <Text style={[styles.auctionLabel, dynamicStyles.textTertiary]}>Starting Bid</Text>
              <Text style={[styles.auctionValue, { color: "#10B981" }]}>
                {formatCurrency(property.startingBid)}
              </Text>
            </View>
            <View style={styles.auctionRow}>
              <Text style={[styles.auctionLabel, dynamicStyles.textTertiary]}>Market Value</Text>
              <Text style={[styles.auctionValue, dynamicStyles.text]}>
                {formatCurrency(property.marketValue)}
              </Text>
            </View>
          </View>

          <View style={styles.dateRow}>
            <Calendar size={14} color={theme.textSecondary} strokeWidth={1.5} />
            <Text style={[styles.dateText, dynamicStyles.textSecondary]}>
              {formatDate(property.auctionDate)} at {property.auctionTime}
            </Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#10B98115" }]}
              onPress={() => handleCall(property.contactPhone)}
            >
              <Phone size={16} color="#10B981" strokeWidth={2} />
              <Text style={[styles.actionButtonText, { color: "#10B981" }]}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: `${theme.navy}15` }]}
              onPress={() => handleEmail(property.contactEmail, property)}
            >
              <Mail size={16} color={theme.navy} strokeWidth={2} />
              <Text style={[styles.actionButtonText, { color: theme.navy }]}>Inquire</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [theme, dynamicStyles, isLocationEnabled, handleCall, handleEmail, formatDate, getDaysUntilAuction]);

  const renderPropertyDetail = useCallback(() => {
    if (!selectedProperty) return null;

    const property = selectedProperty;
    const PropertyIcon = propertyTypeIcons[property.propertyType];
    const daysUntil = getDaysUntilAuction(property.auctionDate);

    return (
      <View style={[styles.detailOverlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
        <View style={[styles.detailModal, dynamicStyles.card]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Image
              source={{ uri: property.image }}
              style={styles.detailImage}
              contentFit="cover"
            />
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedProperty(null)}
            >
              <X size={20} color="#FFF" strokeWidth={2} />
            </TouchableOpacity>

            <View style={styles.detailContent}>
              <View style={styles.detailHeader}>
                <View style={[styles.propertyTypeIcon, { backgroundColor: `${theme.navy}15` }]}>
                  <PropertyIcon size={20} color={theme.navy} strokeWidth={1.5} />
                </View>
                <Text style={[styles.detailType, dynamicStyles.textSecondary]}>
                  {getPropertyTypeLabel(property.propertyType)}
                </Text>
              </View>

              <Text style={[styles.detailAddress, dynamicStyles.text]}>
                {property.address}
              </Text>
              <Text style={[styles.detailLocation, dynamicStyles.textSecondary]}>
                {property.city}, {property.state} {property.zipCode}
              </Text>

              <View style={styles.detailPrices}>
                <View style={styles.priceBox}>
                  <Text style={[styles.priceLabel, dynamicStyles.textTertiary]}>Starting Bid</Text>
                  <Text style={[styles.priceValue, { color: "#10B981" }]}>
                    {formatCurrency(property.startingBid)}
                  </Text>
                </View>
                <View style={styles.priceBox}>
                  <Text style={[styles.priceLabel, dynamicStyles.textTertiary]}>Market Value</Text>
                  <Text style={[styles.priceValue, dynamicStyles.text]}>
                    {formatCurrency(property.marketValue)}
                  </Text>
                </View>
                <View style={styles.priceBox}>
                  <Text style={[styles.priceLabel, dynamicStyles.textTertiary]}>Taxes Owed</Text>
                  <Text style={[styles.priceValue, { color: "#EF4444" }]}>
                    {formatCurrency(property.owedAmount)}
                  </Text>
                </View>
              </View>

              <View style={[styles.infoSection, dynamicStyles.border]}>
                <Text style={[styles.infoTitle, dynamicStyles.text]}>Property Details</Text>
                <View style={styles.infoGrid}>
                  {property.bedrooms ? (
                    <View style={styles.infoItem}>
                      <Text style={[styles.infoLabel, dynamicStyles.textTertiary]}>Bedrooms</Text>
                      <Text style={[styles.infoValue, dynamicStyles.text]}>{property.bedrooms}</Text>
                    </View>
                  ) : null}
                  {property.bathrooms ? (
                    <View style={styles.infoItem}>
                      <Text style={[styles.infoLabel, dynamicStyles.textTertiary]}>Bathrooms</Text>
                      <Text style={[styles.infoValue, dynamicStyles.text]}>{property.bathrooms}</Text>
                    </View>
                  ) : null}
                  {property.sqft ? (
                    <View style={styles.infoItem}>
                      <Text style={[styles.infoLabel, dynamicStyles.textTertiary]}>Sq Ft</Text>
                      <Text style={[styles.infoValue, dynamicStyles.text]}>{property.sqft.toLocaleString()}</Text>
                    </View>
                  ) : null}
                  {property.lotSize ? (
                    <View style={styles.infoItem}>
                      <Text style={[styles.infoLabel, dynamicStyles.textTertiary]}>Lot Size</Text>
                      <Text style={[styles.infoValue, dynamicStyles.text]}>{property.lotSize}</Text>
                    </View>
                  ) : null}
                  {property.yearBuilt ? (
                    <View style={styles.infoItem}>
                      <Text style={[styles.infoLabel, dynamicStyles.textTertiary]}>Year Built</Text>
                      <Text style={[styles.infoValue, dynamicStyles.text]}>{property.yearBuilt}</Text>
                    </View>
                  ) : null}
                  <View style={styles.infoItem}>
                    <Text style={[styles.infoLabel, dynamicStyles.textTertiary]}>Parcel ID</Text>
                    <Text style={[styles.infoValue, dynamicStyles.text]}>{property.parcelId}</Text>
                  </View>
                </View>
              </View>

              <View style={[styles.infoSection, dynamicStyles.border]}>
                <Text style={[styles.infoTitle, dynamicStyles.text]}>Auction Information</Text>
                <View style={styles.auctionDetails}>
                  <View style={styles.auctionDetailRow}>
                    <Calendar size={16} color={theme.textSecondary} strokeWidth={1.5} />
                    <Text style={[styles.auctionDetailText, dynamicStyles.textSecondary]}>
                      {formatDate(property.auctionDate)} at {property.auctionTime}
                    </Text>
                  </View>
                  <View style={styles.auctionDetailRow}>
                    <MapPin size={16} color={theme.textSecondary} strokeWidth={1.5} />
                    <Text style={[styles.auctionDetailText, dynamicStyles.textSecondary]}>
                      {property.auctionLocation}
                    </Text>
                  </View>
                  <View style={styles.auctionDetailRow}>
                    <Clock size={16} color={theme.textSecondary} strokeWidth={1.5} />
                    <Text style={[styles.auctionDetailText, dynamicStyles.textSecondary]}>
                      Registration deadline: {formatDate(property.registrationDeadline)}
                    </Text>
                  </View>
                  <View style={styles.auctionDetailRow}>
                    <DollarSign size={16} color={theme.textSecondary} strokeWidth={1.5} />
                    <Text style={[styles.auctionDetailText, dynamicStyles.textSecondary]}>
                      Deposit required: {formatCurrency(property.depositRequired)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={[styles.infoSection, dynamicStyles.border]}>
                <Text style={[styles.infoTitle, dynamicStyles.text]}>Description</Text>
                <Text style={[styles.descriptionText, dynamicStyles.textSecondary]}>
                  {property.description}
                </Text>
              </View>

              <View style={styles.detailActions}>
                <TouchableOpacity
                  style={[styles.detailActionButton, { backgroundColor: "#10B981" }]}
                  onPress={() => handleCall(property.contactPhone)}
                >
                  <Phone size={18} color="#FFF" strokeWidth={2} />
                  <Text style={styles.detailActionText}>Call Now</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.detailActionButton, { backgroundColor: theme.navy }]}
                  onPress={() => handleEmail(property.contactEmail, property)}
                >
                  <Mail size={18} color="#FFF" strokeWidth={2} />
                  <Text style={styles.detailActionText}>Send Inquiry</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    );
  }, [selectedProperty, theme, dynamicStyles, handleCall, handleEmail, formatDate, getDaysUntilAuction]);

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
        <View style={[styles.header, { backgroundColor: theme.background }]}>
          <BackButton color={theme.navy} backgroundColor={theme.surfaceSecondary} />
          <Text style={[styles.headerTitle, { color: theme.text }]}>Tax Auctions</Text>
          <View style={{ width: 40 }} />
        </View>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.navy} />
        }
      >
        <LocationBanner />

        <View style={styles.searchContainer}>
          <View style={[styles.searchInputWrapper, dynamicStyles.searchInput]}>
            <Search size={18} color={theme.textTertiary} strokeWidth={1.5} />
            <TextInput
              style={[styles.searchInput, dynamicStyles.text]}
              placeholder="Search address, city, or zip..."
              placeholderTextColor={theme.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <X size={18} color={theme.textTertiary} strokeWidth={1.5} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[styles.filterToggle, dynamicStyles.card]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} color={theme.navy} strokeWidth={1.5} />
          </TouchableOpacity>
        </View>

        {showFilters && (
          <View style={[styles.filtersContainer, dynamicStyles.card]}>
            <Text style={[styles.filterLabel, dynamicStyles.text]}>Status</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {(["all", "upcoming", "active"] as FilterType[]).map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterChip,
                    dynamicStyles.filterChip,
                    statusFilter === filter && dynamicStyles.filterChipActive,
                  ]}
                  onPress={() => setStatusFilter(filter)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      { color: statusFilter === filter ? "#FFF" : theme.textSecondary },
                    ]}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.filterLabel, dynamicStyles.text, { marginTop: 12 }]}>Property Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {(["all", "single_family", "multi_family", "commercial", "land", "condo"] as PropertyTypeFilter[]).map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterChip,
                    dynamicStyles.filterChip,
                    propertyTypeFilter === filter && dynamicStyles.filterChipActive,
                  ]}
                  onPress={() => setPropertyTypeFilter(filter)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      { color: propertyTypeFilter === filter ? "#FFF" : theme.textSecondary },
                    ]}
                  >
                    {filter === "all" ? "All" : getPropertyTypeLabel(filter as TaxAuctionProperty["propertyType"])}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.filterLabel, dynamicStyles.text, { marginTop: 12 }]}>Sort By</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {([
                { key: "distance", label: "Distance" },
                { key: "date", label: "Auction Date" },
                { key: "price_low", label: "Price: Low to High" },
                { key: "price_high", label: "Price: High to Low" },
              ] as { key: SortOption; label: string }[]).map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.filterChip,
                    dynamicStyles.filterChip,
                    sortOption === option.key && dynamicStyles.filterChipActive,
                  ]}
                  onPress={() => setSortOption(option.key)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      { color: sortOption === option.key ? "#FFF" : theme.textSecondary },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.resultsHeader}>
          <View style={styles.resultsCount}>
            <Gavel size={18} color={theme.navy} strokeWidth={1.5} />
            <Text style={[styles.resultsText, dynamicStyles.text]}>
              {filteredAuctions.length} {filteredAuctions.length === 1 ? "Property" : "Properties"}
            </Text>
          </View>
          {isLocationEnabled && (
            <View style={styles.locationIndicator}>
              <MapPin size={14} color="#10B981" strokeWidth={1.5} />
              <Text style={[styles.locationText, { color: "#10B981" }]}>
                {location?.displayName || "Your Location"}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.propertiesList}>
          {filteredAuctions.map(renderPropertyCard)}
        </View>

        {filteredAuctions.length === 0 && (
          <View style={styles.emptyState}>
            <Gavel size={48} color={theme.textTertiary} strokeWidth={1} />
            <Text style={[styles.emptyTitle, dynamicStyles.text]}>No Auctions Found</Text>
            <Text style={[styles.emptySubtitle, dynamicStyles.textSecondary]}>
              Try adjusting your filters or search criteria
            </Text>
          </View>
        )}

        <View style={{ height: Platform.OS === "ios" ? 40 : 20 }} />
      </ScrollView>

      {selectedProperty && renderPropertyDetail()}
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
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
  },

  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 10,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  filterToggle: {
    width: 46,
    height: 46,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  filtersContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
    marginBottom: 8,
  },
  filterScroll: {
    marginBottom: 4,
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
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  resultsCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  resultsText: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  locationIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    fontWeight: "500" as const,
  },
  propertiesList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  propertyCard: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  propertyImage: {
    width: "100%",
    height: 180,
  },
  propertyBadges: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    gap: 8,
  },
  statusBadge: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeBadge: {
    backgroundColor: "#10B981",
  },
  statusBadgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "700" as const,
    letterSpacing: 0.5,
  },
  urgentBadge: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  urgentBadgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "700" as const,
  },
  propertyContent: {
    padding: 16,
  },
  propertyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  propertyTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  propertyType: {
    fontSize: 12,
    fontWeight: "500" as const,
  },
  propertyAddress: {
    fontSize: 17,
    fontWeight: "600" as const,
    marginBottom: 2,
  },
  propertyLocation: {
    fontSize: 13,
    marginBottom: 8,
  },
  distanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  distanceText: {
    fontSize: 13,
    fontWeight: "500" as const,
  },
  propertyStats: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },
  auctionInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  auctionRow: {
    gap: 2,
  },
  auctionLabel: {
    fontSize: 11,
    fontWeight: "500" as const,
  },
  auctionValue: {
    fontSize: 16,
    fontWeight: "700" as const,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  dateText: {
    fontSize: 13,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
  },
  detailOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
  },
  detailModal: {
    maxHeight: "90%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  detailImage: {
    width: "100%",
    height: 220,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  detailContent: {
    padding: 20,
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  detailType: {
    fontSize: 13,
    fontWeight: "500" as const,
  },
  detailAddress: {
    fontSize: 20,
    fontWeight: "700" as const,
    marginBottom: 4,
  },
  detailLocation: {
    fontSize: 14,
    marginBottom: 16,
  },
  detailPrices: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  priceBox: {
    alignItems: "center",
    gap: 4,
  },
  priceLabel: {
    fontSize: 11,
    fontWeight: "500" as const,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "700" as const,
  },
  infoSection: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    marginBottom: 12,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  infoItem: {
    width: "45%",
    gap: 2,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: "500" as const,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  auctionDetails: {
    gap: 10,
  },
  auctionDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  auctionDetailText: {
    fontSize: 13,
    flex: 1,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  detailActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
    paddingBottom: Platform.OS === "ios" ? 20 : 0,
  },
  detailActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  detailActionText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600" as const,
  },
});
