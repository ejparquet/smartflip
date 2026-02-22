import React, { useState, useMemo } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import {
  Search,
  Hammer,
  Paintbrush,
  Droplets,
  Zap,
  Palette,
  TreePine,
  Waves,
  Truck,
  HardHat,
  Star,
  MapPin,
  Phone,
  ChevronRight,
  ChevronLeft,
  Filter,
  Home as HomeIcon,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";
import { mockProfessionals } from "@/mocks/professionals";

const serviceCategories = [
  { id: "all", label: "All", singularLabel: "All Professionals", icon: null },
  { id: "contractor", label: "Contractors", singularLabel: "Contractor", icon: Hammer, color: "#3B82F6" },
  { id: "painter", label: "Painters", singularLabel: "Painters", icon: Paintbrush, color: "#EC4899" },
  { id: "plumber", label: "Plumbers", singularLabel: "Plumbers", icon: Droplets, color: "#06B6D4" },
  { id: "electrician", label: "Electricians", singularLabel: "Electricians", icon: Zap, color: "#272D53" },
  { id: "realtor", label: "Realtors", singularLabel: "Realtors", icon: HomeIcon, color: "#10B981" },
  { id: "landscaper", label: "Landscape", singularLabel: "Landscape", icon: TreePine, color: "#22C55E" },
  { id: "interior_designer", label: "Interior Design", singularLabel: "Interior Designers", icon: Palette, color: "#8B5CF6" },
  { id: "pool_company", label: "Pools", singularLabel: "Pool Companies", icon: Waves, color: "#0EA5E9" },
  { id: "dumpster_service", label: "Dumper Loads", singularLabel: "Dumper Loads", icon: Truck, color: "#78716C" },
  { id: "roofer", label: "Roofing", singularLabel: "Roofers", icon: HardHat, color: "#B45309" },
];

export default function ServicesScreen() {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category?: string }>();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(category || "all");

  const dynamicStyles = useMemo(() => ({
    container: { backgroundColor: theme.background },
    headerTitle: { color: theme.text },
    searchContainer: { backgroundColor: theme.surface, borderColor: theme.border },
    searchInput: { color: theme.text },
    categoryChip: { backgroundColor: theme.surface, borderColor: theme.border },
    categoryChipActive: { backgroundColor: theme.navy, borderColor: theme.navy },
    categoryChipText: { color: theme.textSecondary },
    categoryChipTextActive: { color: theme.white },
    sectionTitle: { color: theme.text },
    serviceCard: { backgroundColor: theme.surface },
    serviceName: { color: theme.text },
    serviceType: { color: theme.textSecondary },
    serviceLocation: { color: theme.textSecondary },
  }), [theme]);

  const filteredProfessionals = useMemo(() => {
    return mockProfessionals.filter((pro) => {
      const matchesSearch = pro.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pro.professionalType.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || pro.professionalType === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleCall = (phone: string, name: string) => {
    const phoneNumber = phone.replace(/[^0-9+]/g, "");
    const url = Platform.OS === "ios" ? `telprompt:${phoneNumber}` : `tel:${phoneNumber}`;
    
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert("Call Professional", `Would you like to call ${name} at ${phone}?`);
        }
      })
      .catch((err) => console.log("Error:", err));
  };

  const getCategoryLabel = (type: string) => {
    const category = serviceCategories.find((c) => c.id === type);
    return category?.label || type.charAt(0).toUpperCase() + type.slice(1).replace("_", " ");
  };

  const getPageTitle = () => {
    if (selectedCategory === "all") return "Services";
    const category = serviceCategories.find((c) => c.id === selectedCategory);
    return category?.label || "Services";
  };

  const getSectionTitle = () => {
    const category = serviceCategories.find((c) => c.id === selectedCategory);
    return category?.singularLabel || "All Professionals";
  };

  const getCategoryColor = (type: string) => {
    const category = serviceCategories.find((c) => c.id === type);
    return category?.color || Colors.primary;
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.header}>
          <BackButton />
          <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>{getPageTitle()}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.searchSection}>
          <View style={[styles.searchContainer, dynamicStyles.searchContainer]}>
            <Search size={20} color={theme.textTertiary} strokeWidth={1.5} />
            <TextInput
              style={[styles.searchInput, dynamicStyles.searchInput]}
              placeholder="Search services or professionals..."
              placeholderTextColor={theme.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={[styles.filterButton, { backgroundColor: theme.surface }]}>
            <Filter size={20} color={theme.navy} strokeWidth={1.5} />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {serviceCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                dynamicStyles.categoryChip,
                selectedCategory === category.id && dynamicStyles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              {category.icon && (
                <category.icon 
                  size={16} 
                  color={selectedCategory === category.id ? "#FFFFFF" : category.color} 
                  strokeWidth={1.5} 
                />
              )}
              <Text
                style={[
                  styles.categoryChipText,
                  dynamicStyles.categoryChipText,
                  selectedCategory === category.id && dynamicStyles.categoryChipTextActive,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
          {getSectionTitle()} ({filteredProfessionals.length})
        </Text>

        {filteredProfessionals.length === 0 ? (
          <View style={styles.emptyState}>
            <Search size={48} color={theme.textTertiary} strokeWidth={1} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No professionals found</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Try adjusting your search or filters
            </Text>
          </View>
        ) : (
          filteredProfessionals.map((professional) => (
            <TouchableOpacity
              key={professional.id}
              style={[styles.serviceCard, dynamicStyles.serviceCard]}
              onPress={() => router.push(`/professional/${professional.id}` as any)}
              activeOpacity={0.7}
            >
              <Image
                source={{ uri: professional.avatar }}
                style={styles.serviceAvatar}
                contentFit="cover"
              />
              <View style={styles.serviceInfo}>
                <View style={styles.serviceHeader}>
                  <Text style={[styles.serviceName, dynamicStyles.serviceName]}>{professional.name}</Text>
                  <View style={styles.ratingContainer}>
                    <Star size={14} color="#272D53" fill="#272D53" />
                    <Text style={styles.ratingText}>{professional.rating}</Text>
                  </View>
                </View>
                <View style={[styles.serviceTypeBadge, { backgroundColor: `${getCategoryColor(professional.professionalType)}15` }]}>
                  <Text style={[styles.serviceType, { color: getCategoryColor(professional.professionalType) }]}>
                    {getCategoryLabel(professional.professionalType)}
                  </Text>
                </View>
                <View style={styles.serviceMetaRow}>
                  <MapPin size={12} color={theme.textSecondary} strokeWidth={1.5} />
                  <Text style={[styles.serviceLocation, dynamicStyles.serviceLocation]}>
                    {professional.yearsExperience} years experience
                  </Text>
                </View>
                <Text style={[styles.serviceProjects, { color: theme.textTertiary }]}>
                  {professional.completedProjects}+ completed projects
                </Text>
              </View>
              <View style={styles.serviceActions}>
                {professional.phone && (
                  <TouchableOpacity
                    style={[styles.callBtn, { backgroundColor: theme.surfaceSecondary }]}
                    onPress={() => handleCall(professional.phone!, professional.name)}
                  >
                    <Phone size={18} color={theme.navy} strokeWidth={1.5} />
                  </TouchableOpacity>
                )}
                <ChevronRight size={20} color={theme.textTertiary} strokeWidth={1.5} />
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    backgroundColor: "transparent",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700" as const,
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  searchSection: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 8,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "500" as const,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    marginBottom: 16,
  },
  serviceCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  serviceAvatar: {
    width: 64,
    height: 64,
    borderRadius: 14,
  },
  serviceInfo: {
    flex: 1,
    marginLeft: 14,
  },
  serviceHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "600" as const,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#272D53",
  },
  serviceTypeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 6,
  },
  serviceType: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  serviceMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  serviceLocation: {
    fontSize: 12,
  },
  serviceProjects: {
    fontSize: 11,
  },
  serviceActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
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
    marginTop: 4,
  },
});
