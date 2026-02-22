import React, { useState, useMemo, useCallback } from "react";
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
import { useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import {
  ArrowLeft,
  Search,
  Filter,
  ChevronRight,
  X,
  Droplets,
  Flame,
  Star,
  ExternalLink,
  Package,
  Wrench,
  FileText,
  Phone,
  Globe,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  ShowerHead,
  Bath,
  Waves,
  Thermometer,
  Gauge,
  Info,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";

interface FixtureSpec {
  label: string;
  value: string;
}

interface ReplacementPart {
  id: string;
  name: string;
  partNumber: string;
  price: string;
  availability: "in_stock" | "order" | "discontinued";
}

interface Fixture {
  id: string;
  category: "water_heater" | "faucet" | "toilet" | "shower" | "sink" | "valve" | "pump";
  type: string;
  brand: string;
  model: string;
  modelNumber: string;
  image: string;
  rating: number;
  reviewCount: number;
  priceRange: string;
  description: string;
  specs: FixtureSpec[];
  features: string[];
  commonIssues: string[];
  replacementParts: ReplacementPart[];
  warrantyInfo: string;
  installationNotes?: string;
  supportPhone?: string;
  supportUrl?: string;
  manualUrl?: string;
}

const categoryConfig: Record<string, { icon: any; color: string; bgColor: string; label: string }> = {
  water_heater: { icon: Flame, color: "#272D53", bgColor: "#E8E9EE", label: "Water Heaters" },
  faucet: { icon: Droplets, color: "#3B82F6", bgColor: "#DBEAFE", label: "Faucets" },
  toilet: { icon: Bath, color: "#8B5CF6", bgColor: "#EDE9FE", label: "Toilets" },
  shower: { icon: ShowerHead, color: "#06B6D4", bgColor: "#CFFAFE", label: "Showers" },
  sink: { icon: Waves, color: "#22C55E", bgColor: "#DCFCE7", label: "Sinks" },
  valve: { icon: Gauge, color: "#EF4444", bgColor: "#FEE2E2", label: "Valves" },
  pump: { icon: Thermometer, color: "#EC4899", bgColor: "#FCE7F3", label: "Pumps" },
};

const mockFixtures: Fixture[] = [
  {
    id: "1",
    category: "water_heater",
    type: "Tank Gas",
    brand: "Rheem",
    model: "Performance Plus",
    modelNumber: "XG50T12DM40U0",
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400",
    rating: 4.5,
    reviewCount: 1243,
    priceRange: "$699 - $899",
    description: "50-gallon gas water heater with 12-year tank warranty. Energy Star certified with 40,000 BTU burner.",
    specs: [
      { label: "Capacity", value: "50 Gallons" },
      { label: "Fuel Type", value: "Natural Gas" },
      { label: "BTU Input", value: "40,000 BTU" },
      { label: "First Hour Rating", value: "80 GPH" },
      { label: "Recovery Rate", value: "43 GPH" },
      { label: "Dimensions", value: "22\" D x 60\" H" },
      { label: "Energy Factor", value: "0.67 UEF" },
    ],
    features: [
      "Push-button Piezo igniter",
      "Self-cleaning dip tube",
      "Premium brass drain valve",
      "Enhanced flow brass drain valve",
      "Factory-installed heat traps",
    ],
    commonIssues: [
      "Pilot light goes out - Check thermocouple",
      "No hot water - Check gas valve and pilot",
      "Lukewarm water - Check dip tube condition",
      "Rumbling noise - Sediment buildup, flush tank",
    ],
    replacementParts: [
      { id: "p1", name: "Thermocouple", partNumber: "SP20060", price: "$12.99", availability: "in_stock" },
      { id: "p2", name: "Gas Control Valve", partNumber: "SP20832", price: "$189.99", availability: "in_stock" },
      { id: "p3", name: "Anode Rod", partNumber: "SP11526", price: "$34.99", availability: "in_stock" },
      { id: "p4", name: "Dip Tube", partNumber: "SP10862", price: "$24.99", availability: "order" },
    ],
    warrantyInfo: "12-year tank, 12-year parts, 1-year labor",
    installationNotes: "Requires 3/4\" gas line, proper venting. Min 18\" clearance from combustibles.",
    supportPhone: "1-800-432-8373",
    supportUrl: "https://www.rheem.com/support",
    manualUrl: "https://www.rheem.com/manuals",
  },
  {
    id: "2",
    category: "water_heater",
    type: "Tankless Gas",
    brand: "Rinnai",
    model: "RU199iN",
    modelNumber: "RU199iN",
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400",
    rating: 4.7,
    reviewCount: 856,
    priceRange: "$1,599 - $1,899",
    description: "Ultra series condensing tankless water heater. 199,000 BTU with built-in recirculation pump.",
    specs: [
      { label: "Max BTU", value: "199,000 BTU" },
      { label: "Min BTU", value: "15,200 BTU" },
      { label: "Flow Rate", value: "11 GPM" },
      { label: "Efficiency", value: "0.96 UEF" },
      { label: "Dimensions", value: "14\" W x 26\" H x 10\" D" },
      { label: "Venting", value: "Concentric or PVC" },
    ],
    features: [
      "Built-in recirculation pump",
      "Wi-Fi connectivity capable",
      "ThermaCirc360 technology",
      "Scale detection",
      "Freeze protection",
    ],
    commonIssues: [
      "Error Code 11 - No ignition, check gas supply",
      "Error Code 12 - Flame failure, clean flame rod",
      "Error Code 14 - Thermal fuse, reset or replace",
      "Scale buildup - Flush with vinegar solution",
    ],
    replacementParts: [
      { id: "p1", name: "Flame Rod", partNumber: "103-000-005", price: "$45.99", availability: "in_stock" },
      { id: "p2", name: "Igniter", partNumber: "103-000-002", price: "$89.99", availability: "in_stock" },
      { id: "p3", name: "Heat Exchanger", partNumber: "104-000-001", price: "$599.99", availability: "order" },
      { id: "p4", name: "Flow Sensor", partNumber: "103-000-010", price: "$125.99", availability: "in_stock" },
    ],
    warrantyInfo: "10-year heat exchanger, 5-year parts, 1-year labor",
    installationNotes: "Requires 3/4\" gas line, adequate gas pressure. Can use PVC venting up to 60 equivalent feet.",
    supportPhone: "1-800-621-9419",
    supportUrl: "https://www.rinnai.us/support",
  },
  {
    id: "3",
    category: "faucet",
    type: "Kitchen Pull-Down",
    brand: "Moen",
    model: "Arbor",
    modelNumber: "7594SRS",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400",
    rating: 4.6,
    reviewCount: 2341,
    priceRange: "$279 - $349",
    description: "Pull-down kitchen faucet with Power Boost technology and Spot Resist stainless finish.",
    specs: [
      { label: "Flow Rate", value: "1.5 GPM" },
      { label: "Spout Height", value: "15.5\"" },
      { label: "Spout Reach", value: "7.875\"" },
      { label: "Hole Config", value: "1 or 3 hole" },
      { label: "Handle Type", value: "Single lever" },
      { label: "Valve Type", value: "Ceramic disc" },
    ],
    features: [
      "Power Boost spray technology",
      "Reflex self-retract system",
      "Spot Resist finish",
      "Duralock quick connect",
      "Secure Docking spray head",
    ],
    commonIssues: [
      "Low water pressure - Check aerator for debris",
      "Spray head won't retract - Check Reflex weight position",
      "Dripping - Replace cartridge",
      "Loose handle - Tighten set screw",
    ],
    replacementParts: [
      { id: "p1", name: "Cartridge", partNumber: "1225", price: "$24.99", availability: "in_stock" },
      { id: "p2", name: "Aerator", partNumber: "101010", price: "$8.99", availability: "in_stock" },
      { id: "p3", name: "Spray Head", partNumber: "164927SRS", price: "$79.99", availability: "in_stock" },
      { id: "p4", name: "Hose Assembly", partNumber: "150259", price: "$49.99", availability: "in_stock" },
    ],
    warrantyInfo: "Limited lifetime warranty on finish and function",
    supportPhone: "1-800-289-6636",
    supportUrl: "https://www.moen.com/support",
  },
  {
    id: "4",
    category: "toilet",
    type: "Two-Piece Elongated",
    brand: "Kohler",
    model: "Cimarron",
    modelNumber: "K-3609-0",
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400",
    rating: 4.4,
    reviewCount: 1876,
    priceRange: "$299 - $399",
    description: "Comfort Height elongated toilet with AquaPiston flush technology. WaterSense certified.",
    specs: [
      { label: "Flush Type", value: "Gravity" },
      { label: "Gallons/Flush", value: "1.28 GPF" },
      { label: "Bowl Height", value: "16.5\" (Comfort)" },
      { label: "Rough-In", value: "12\"" },
      { label: "Trapway", value: "2-1/8\"" },
      { label: "Bowl Shape", value: "Elongated" },
    ],
    features: [
      "AquaPiston canister flush valve",
      "Comfort Height seating",
      "Class Five flushing technology",
      "WaterSense certified",
      "Left-hand trip lever",
    ],
    commonIssues: [
      "Running toilet - Check flapper seal",
      "Weak flush - Check fill valve height",
      "Clogged - AquaPiston rarely clogs, check trapway",
      "Wobbly - Re-set with new wax ring",
    ],
    replacementParts: [
      { id: "p1", name: "Canister Seal", partNumber: "GP1229656", price: "$14.99", availability: "in_stock" },
      { id: "p2", name: "Fill Valve", partNumber: "GP1083167", price: "$29.99", availability: "in_stock" },
      { id: "p3", name: "Trip Lever", partNumber: "85114-CP", price: "$24.99", availability: "in_stock" },
      { id: "p4", name: "Wax Ring", partNumber: "GP1016012", price: "$8.99", availability: "in_stock" },
    ],
    warrantyInfo: "1-year limited warranty",
    supportPhone: "1-800-456-4537",
    supportUrl: "https://www.kohler.com/support",
  },
  {
    id: "5",
    category: "valve",
    type: "PRV",
    brand: "Watts",
    model: "LF25AUB-Z3",
    modelNumber: "LF25AUB-Z3",
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400",
    rating: 4.3,
    reviewCount: 567,
    priceRange: "$79 - $129",
    description: "Lead-free pressure reducing valve with bypass feature. 3/4\" size with union connections.",
    specs: [
      { label: "Size", value: "3/4\" NPT" },
      { label: "Inlet Pressure", value: "25-300 PSI" },
      { label: "Outlet Pressure", value: "25-75 PSI" },
      { label: "Default Setting", value: "50 PSI" },
      { label: "Material", value: "Lead-free brass" },
      { label: "Max Temp", value: "180°F" },
    ],
    features: [
      "Lead-free brass construction",
      "Union connections for easy service",
      "Integral bypass feature",
      "Stainless steel strainer",
      "Adjustable outlet pressure",
    ],
    commonIssues: [
      "Pressure creep - Replace internal cartridge",
      "No pressure reduction - Check for debris",
      "Chattering noise - Adjust outlet pressure",
      "Leaking - Replace O-rings or valve",
    ],
    replacementParts: [
      { id: "p1", name: "Repair Kit", partNumber: "RK25AUB", price: "$45.99", availability: "in_stock" },
      { id: "p2", name: "Complete Cartridge", partNumber: "0887700", price: "$59.99", availability: "in_stock" },
      { id: "p3", name: "Strainer Screen", partNumber: "0881642", price: "$12.99", availability: "in_stock" },
    ],
    warrantyInfo: "5-year limited warranty",
    supportPhone: "1-978-688-1811",
    supportUrl: "https://www.watts.com/support",
  },
  {
    id: "6",
    category: "water_heater",
    type: "Tank Electric",
    brand: "A.O. Smith",
    model: "Signature Premier",
    modelNumber: "E6-50H45DV",
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400",
    rating: 4.4,
    reviewCount: 923,
    priceRange: "$599 - $749",
    description: "50-gallon electric water heater with 4500W elements. CoreGard anode for longer tank life.",
    specs: [
      { label: "Capacity", value: "50 Gallons" },
      { label: "Element Wattage", value: "4500W / 4500W" },
      { label: "Voltage", value: "240V" },
      { label: "First Hour Rating", value: "62 GPH" },
      { label: "Recovery", value: "21 GPH" },
      { label: "Dimensions", value: "22\" D x 52\" H" },
    ],
    features: [
      "CoreGard anode rod",
      "Blue Diamond glass lining",
      "Self-cleaning dip tube",
      "Energy Star certified",
      "Dynaclean diffuser",
    ],
    commonIssues: [
      "No hot water - Check breaker, reset button, elements",
      "Not enough hot water - Check thermostat settings",
      "Water too hot - Lower thermostat, check upper element",
      "Popping noises - Sediment buildup, flush tank",
    ],
    replacementParts: [
      { id: "p1", name: "Upper Element", partNumber: "9000579005", price: "$24.99", availability: "in_stock" },
      { id: "p2", name: "Lower Element", partNumber: "9000579005", price: "$24.99", availability: "in_stock" },
      { id: "p3", name: "Thermostat", partNumber: "9001954045", price: "$19.99", availability: "in_stock" },
      { id: "p4", name: "Anode Rod", partNumber: "9000632005", price: "$39.99", availability: "in_stock" },
    ],
    warrantyInfo: "6-year tank, 6-year parts",
    installationNotes: "Requires 30A double-pole breaker, 10/2 wire. Check local codes for permits.",
    supportPhone: "1-800-527-1953",
    supportUrl: "https://www.aosmith.com/support",
  },
];

export default function FixtureDatabaseScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null);
  const [savedFixtures, setSavedFixtures] = useState<string[]>([]);

  const filteredFixtures = useMemo(() => {
    return mockFixtures.filter((fixture) => {
      const matchesSearch =
        fixture.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fixture.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fixture.modelNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fixture.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || fixture.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleToggleSave = useCallback((fixtureId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSavedFixtures((prev) =>
      prev.includes(fixtureId) ? prev.filter((id) => id !== fixtureId) : [...prev, fixtureId]
    );
  }, []);

  const handleOpenUrl = useCallback((url: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(url);
  }, []);

  const handleCall = useCallback((phone: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(`tel:${phone.replace(/[^0-9]/g, "")}`);
  }, []);

  const getAvailabilityConfig = (availability: string) => {
    switch (availability) {
      case "in_stock":
        return { color: "#22C55E", bgColor: "#DCFCE7", label: "In Stock" };
      case "order":
        return { color: "#272D53", bgColor: "#E8E9EE", label: "Special Order" };
      case "discontinued":
        return { color: "#6B7280", bgColor: "#F3F4F6", label: "Discontinued" };
      default:
        return { color: "#6B7280", bgColor: "#F3F4F6", label: "Unknown" };
    }
  };

  const renderFixtureCard = (fixture: Fixture) => {
    const category = categoryConfig[fixture.category];
    const CategoryIcon = category.icon;
    const isSaved = savedFixtures.includes(fixture.id);

    return (
      <TouchableOpacity
        key={fixture.id}
        style={styles.fixtureCard}
        onPress={() => setSelectedFixture(fixture)}
        activeOpacity={0.7}
      >
        <View style={styles.cardImageSection}>
          <Image source={{ uri: fixture.image }} style={styles.fixtureImage} contentFit="cover" />
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => handleToggleSave(fixture.id)}
          >
            {isSaved ? (
              <BookmarkCheck size={20} color="#272D53" fill="#272D53" />
            ) : (
              <Bookmark size={20} color={Colors.textSecondary} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={[styles.categoryBadge, { backgroundColor: category.bgColor }]}>
              <CategoryIcon size={12} color={category.color} />
              <Text style={[styles.categoryText, { color: category.color }]}>{fixture.type}</Text>
            </View>
          </View>

          <Text style={styles.brandText}>{fixture.brand}</Text>
          <Text style={styles.modelText}>{fixture.model}</Text>
          <Text style={styles.modelNumber}>Model: {fixture.modelNumber}</Text>

          <View style={styles.ratingRow}>
            <Star size={14} color="#272D53" fill="#272D53" />
            <Text style={styles.ratingText}>{fixture.rating}</Text>
            <Text style={styles.reviewCount}>({fixture.reviewCount} reviews)</Text>
          </View>

          <Text style={styles.priceRange}>{fixture.priceRange}</Text>

          <View style={styles.quickStats}>
            <View style={styles.quickStat}>
              <Package size={12} color={Colors.textSecondary} />
              <Text style={styles.quickStatText}>{fixture.replacementParts.length} Parts</Text>
            </View>
          </View>
        </View>

        <ChevronRight size={20} color={Colors.textTertiary} style={styles.chevron} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Fixture Database",
          headerLeft: () => <BackButton />,
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Search size={18} color={Colors.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by brand, model, or part number..."
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
        </View>

        {showFilters && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
            <TouchableOpacity
              style={[styles.filterChip, selectedCategory === "all" && styles.filterChipActive]}
              onPress={() => setSelectedCategory("all")}
            >
              <Text style={[styles.filterChipText, selectedCategory === "all" && styles.filterChipTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            {Object.entries(categoryConfig).map(([key, config]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.filterChip,
                  selectedCategory === key && styles.filterChipActive,
                  selectedCategory === key && { backgroundColor: config.color },
                ]}
                onPress={() => setSelectedCategory(key)}
              >
                <config.icon size={14} color={selectedCategory === key ? "#FFF" : config.color} />
                <Text style={[styles.filterChipText, selectedCategory === key && styles.filterChipTextActive]}>
                  {config.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={styles.fixturesSection}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === "all" ? "All Fixtures" : categoryConfig[selectedCategory]?.label} ({filteredFixtures.length})
          </Text>
          {filteredFixtures.map(renderFixtureCard)}

          {filteredFixtures.length === 0 && (
            <View style={styles.emptyState}>
              <Droplets size={48} color={Colors.textTertiary} />
              <Text style={styles.emptyStateTitle}>No Fixtures Found</Text>
              <Text style={styles.emptyStateText}>Try adjusting your search or filters</Text>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal visible={selectedFixture !== null} animationType="slide" presentationStyle="pageSheet">
        {selectedFixture && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedFixture(null)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Fixture Details</Text>
              <TouchableOpacity onPress={() => handleToggleSave(selectedFixture.id)}>
                {savedFixtures.includes(selectedFixture.id) ? (
                  <BookmarkCheck size={24} color="#272D53" fill="#272D53" />
                ) : (
                  <Bookmark size={24} color={Colors.text} />
                )}
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.detailHeader}>
                <Image source={{ uri: selectedFixture.image }} style={styles.detailImage} contentFit="cover" />
                <View style={styles.detailHeaderInfo}>
                  <Text style={styles.detailBrand}>{selectedFixture.brand}</Text>
                  <Text style={styles.detailModel}>{selectedFixture.model}</Text>
                  <Text style={styles.detailModelNumber}>{selectedFixture.modelNumber}</Text>
                  <View style={styles.detailRating}>
                    <Star size={16} color="#272D53" fill="#272D53" />
                    <Text style={styles.detailRatingText}>{selectedFixture.rating}</Text>
                    <Text style={styles.detailReviewCount}>({selectedFixture.reviewCount})</Text>
                  </View>
                  <Text style={styles.detailPrice}>{selectedFixture.priceRange}</Text>
                </View>
              </View>

              <Text style={styles.detailDescription}>{selectedFixture.description}</Text>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Specifications</Text>
                <View style={styles.specsGrid}>
                  {selectedFixture.specs.map((spec, index) => (
                    <View key={index} style={styles.specItem}>
                      <Text style={styles.specLabel}>{spec.label}</Text>
                      <Text style={styles.specValue}>{spec.value}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Features</Text>
                {selectedFixture.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <View style={styles.featureBullet} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Common Issues & Solutions</Text>
                {selectedFixture.commonIssues.map((issue, index) => (
                  <View key={index} style={styles.issueItem}>
                    <Wrench size={14} color="#272D53" />
                    <Text style={styles.issueText}>{issue}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Replacement Parts</Text>
                {selectedFixture.replacementParts.map((part) => {
                  const availability = getAvailabilityConfig(part.availability);
                  return (
                    <View key={part.id} style={styles.partCard}>
                      <View style={styles.partInfo}>
                        <Text style={styles.partName}>{part.name}</Text>
                        <Text style={styles.partNumber}>Part #: {part.partNumber}</Text>
                      </View>
                      <View style={styles.partPricing}>
                        <Text style={styles.partPrice}>{part.price}</Text>
                        <View style={[styles.availabilityBadge, { backgroundColor: availability.bgColor }]}>
                          <Text style={[styles.availabilityText, { color: availability.color }]}>
                            {availability.label}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Warranty</Text>
                <View style={styles.warrantyCard}>
                  <Info size={16} color="#3B82F6" />
                  <Text style={styles.warrantyText}>{selectedFixture.warrantyInfo}</Text>
                </View>
              </View>

              {selectedFixture.installationNotes && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Installation Notes</Text>
                  <Text style={styles.installationText}>{selectedFixture.installationNotes}</Text>
                </View>
              )}

              <View style={styles.supportSection}>
                <Text style={styles.detailSectionTitle}>Manufacturer Support</Text>
                <View style={styles.supportButtons}>
                  {selectedFixture.supportPhone && (
                    <TouchableOpacity
                      style={styles.supportButton}
                      onPress={() => handleCall(selectedFixture.supportPhone!)}
                    >
                      <Phone size={18} color="#22C55E" />
                      <Text style={styles.supportButtonText}>Call Support</Text>
                    </TouchableOpacity>
                  )}
                  {selectedFixture.supportUrl && (
                    <TouchableOpacity
                      style={styles.supportButton}
                      onPress={() => handleOpenUrl(selectedFixture.supportUrl!)}
                    >
                      <Globe size={18} color="#3B82F6" />
                      <Text style={styles.supportButtonText}>Website</Text>
                    </TouchableOpacity>
                  )}
                  {selectedFixture.manualUrl && (
                    <TouchableOpacity
                      style={styles.supportButton}
                      onPress={() => handleOpenUrl(selectedFixture.manualUrl!)}
                    >
                      <BookOpen size={18} color="#8B5CF6" />
                      <Text style={styles.supportButtonText}>Manual</Text>
                    </TouchableOpacity>
                  )}
                </View>
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
  backButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  searchSection: {
    flexDirection: "row",
    gap: 10,
    padding: 16,
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
    backgroundColor: Colors.primary,
  },
  filtersScroll: {
    paddingHorizontal: 16,
    paddingBottom: 8,
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
  fixturesSection: {
    padding: 16,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 14,
  },
  fixtureCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  cardImageSection: {
    position: "relative",
  },
  fixtureImage: {
    width: "100%",
    height: 140,
  },
  saveButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    padding: 14,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
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
  brandText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  modelText: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  modelNumber: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  reviewCount: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  priceRange: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: "#22C55E",
    marginTop: 6,
  },
  quickStats: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  quickStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  quickStatText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  chevron: {
    position: "absolute",
    right: 14,
    bottom: 14,
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
  detailHeader: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  detailImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  detailHeaderInfo: {
    flex: 1,
    justifyContent: "center",
  },
  detailBrand: {
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  detailModel: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  detailModelNumber: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  detailRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  detailRatingText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  detailReviewCount: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  detailPrice: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#22C55E",
    marginTop: 4,
  },
  detailDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  specsGrid: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  specItem: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  specLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  specValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 8,
  },
  featureBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#22C55E",
    marginTop: 6,
  },
  featureText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
    lineHeight: 20,
  },
  issueItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  issueText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
    lineHeight: 20,
  },
  partCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
  },
  partInfo: {
    flex: 1,
  },
  partName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  partNumber: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  partPricing: {
    alignItems: "flex-end",
  },
  partPrice: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  availabilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  availabilityText: {
    fontSize: 10,
    fontWeight: "600" as const,
  },
  warrantyCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#DBEAFE",
    padding: 14,
    borderRadius: 10,
  },
  warrantyText: {
    fontSize: 14,
    color: "#1E40AF",
    flex: 1,
    lineHeight: 20,
  },
  installationText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 10,
  },
  supportSection: {
    marginBottom: 40,
  },
  supportButtons: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  supportButton: {
    flex: 1,
    minWidth: 100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.surface,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  supportButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
});
