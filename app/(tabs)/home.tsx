import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import {
  Bell,
  Search,
  SlidersHorizontal,
  Plus,
  ChevronRight,
  ArrowLeft,
  Hammer,
  Paintbrush,
  Droplets,
  Zap,
  Star,
  FileText,
  ClipboardCheck,
  FileCheck,
  MapPin,
  Navigation,
  Phone,
  Store,
  Truck,
  Clock,
  Receipt,
  Shield,
  NotebookPen,
  CloudSun,
  ShoppingBag,
  Gavel,
  Mail,
  UserPlus,
  Palette,
  TreePine,
  Waves,
  Home as HomeIcon,
  HardHat,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { useProperties } from "@/contexts/PropertyContext";
import { useNotifications } from "@/contexts/NotificationsContext";
import Colors from "@/constants/colors";
import { mockTemplates } from "@/mocks/projects";
import { mockProfessionals } from "@/mocks/professionals";
import { mockStores } from "@/mocks/stores";


const propertyFilters = ["All", "Active Properties", "Upcoming", "Closed"];

const serviceTypes = [
  { id: "contractor", label: "Contractors", icon: Hammer, color: "#3B82F6", route: "/service/contractor" },
  { id: "painter", label: "Painters", icon: Paintbrush, color: "#EC4899", route: "/service/painter" },
  { id: "plumber", label: "Plumbers", icon: Droplets, color: "#06B6D4", route: "/service/plumber" },
  { id: "electrician", label: "Electricians", icon: Zap, color: "#272D53", route: "/service/electrician" },
  { id: "realtor", label: "Realtors", icon: HomeIcon, color: "#10B981", route: "/service/realtor" },
  { id: "landscaper", label: "Landscape", icon: TreePine, color: "#22C55E", route: "/service/landscaper" },
  { id: "interior_designer", label: "Interior Design", icon: Palette, color: "#8B5CF6", route: "/service/interior_designer" },
  { id: "pool_company", label: "Pools", icon: Waves, color: "#0EA5E9", route: "/service/pool_company" },
  { id: "dumpster_service", label: "Dumper Loads", icon: Truck, color: "#78716C", route: "/service/dumpster_service" },
  { id: "roofer", label: "Roofing", icon: HardHat, color: "#B45309", route: "/service/roofer" },
];

const documentCategories = [
  {
    id: "contracts",
    title: "Contracts",
    saved: 3,
    pending: 3,
    new: 3,
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&q=80",
  },
  {
    id: "permits",
    title: "Permits",
    saved: 2,
    pending: 1,
    new: 0,
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&q=80",
  },
  {
    id: "inspection",
    title: "Inspections",
    saved: 4,
    pending: 2,
    new: 1,
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&q=80",
  },
];



const quickActionsData = [
  { id: "stores", label: "Material\nStores", icon: Store, color: "#059669", route: "/contractor-stores" },
  { id: "marketplace", label: "Sell\nMaterials", icon: ShoppingBag, color: "#EC4899", route: "/marketplace" },
  { id: "taxauctions", label: "Tax\nAuctions", icon: Gavel, color: "#DC2626", route: "/tax-auctions" },
];

const toolsData = [
  { id: "weather", label: "Weather\nForecast", icon: CloudSun, color: "#0EA5E9", route: "/weather" },
  { id: "delivery", label: "Delivery\nTracking", icon: Truck, color: "#3B82F6", route: "/delivery-tracking" },
  { id: "worklogs", label: "Daily\nWork Logs", icon: NotebookPen, color: "#10B981", route: "/work-logs" },
  { id: "time", label: "Time\nTracking", icon: Clock, color: "#272D53", route: "/time-tracking" },
  { id: "invoices", label: "Invoice\nGenerator", icon: Receipt, color: "#8B5CF6", route: "/invoices" },
  { id: "safety", label: "Safety\nChecklists", icon: Shield, color: "#EF4444", route: "/safety-checklists" },
];

export default function HomeScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const { properties } = useProperties();
  const { unreadCount } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const dynamicStyles = useMemo(() => ({
    container: { backgroundColor: theme.background },
    logoCircle: { backgroundColor: theme.navy, borderColor: theme.border },
    logoText: { color: theme.white },
    notificationButton: { backgroundColor: theme.surfaceSecondary },
    searchInputWrapper: { backgroundColor: theme.surface, borderColor: theme.border },
    searchInput: { color: theme.text },
    filterButton: { backgroundColor: theme.surface, borderColor: theme.border },
    sectionTitle: { color: theme.text },
    addProjectButton: { backgroundColor: theme.surface, borderColor: theme.border },
    filterChip: { backgroundColor: theme.surface, borderColor: theme.border },
    filterChipActive: { backgroundColor: theme.navy, borderColor: theme.navy },
    filterChipText: { color: theme.textSecondary },
    filterChipTextActive: { color: theme.white },
    serviceIconContainer: { backgroundColor: theme.surface, borderColor: theme.border },
    serviceLabel: { color: theme.textSecondary },
    teamCard: { backgroundColor: theme.surface },
    teamName: { color: theme.text },
    teamRole: { color: theme.textSecondary },
    teamProjects: { color: theme.textTertiary },
    documentCard: { backgroundColor: theme.surface },
    documentTitle: { color: theme.text },
    documentBadge: { backgroundColor: theme.surfaceSecondary },
    documentBadgeText: { color: theme.textSecondary },
    quickLinkCard: { backgroundColor: theme.surface },
    quickLinkTitle: { color: theme.text },
    quickLinkCount: { color: theme.textSecondary },
    templateCard: { backgroundColor: theme.surface },
    templateTitle: { color: theme.text },
    templateCategory: { color: theme.textTertiary },
    storeCard: { backgroundColor: theme.surface },
    storeName: { color: theme.text },
    storeActionBtn: { backgroundColor: theme.surfaceSecondary },
    toolCard: { backgroundColor: theme.surface },
    toolLabel: { color: theme.textSecondary },
    calendarCard: { backgroundColor: theme.surface },
  }), [theme]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const filteredProperties = properties.filter((property) => {
    if (selectedFilter === "All") return true;
    if (selectedFilter === "Active Properties") return property.status === "signed";
    if (selectedFilter === "Upcoming") return property.status === "pending";
    if (selectedFilter === "Closed") return property.status === "closed";
    return true;
  });

  const teamMembers = mockProfessionals.slice(0, 3);
  const nearbyStores = mockStores.slice(0, 3);

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.navy} />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={[styles.logoCircle, dynamicStyles.logoCircle]}>
                <Text style={[styles.logoText, dynamicStyles.logoText]}>S</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.notificationButton, dynamicStyles.notificationButton]}
              onPress={() => router.push('/notifications' as never)}
              testID="notifications-bell"
            >
              <Bell size={24} color={theme.navy} strokeWidth={1.5} />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={[styles.searchInputWrapper, dynamicStyles.searchInputWrapper]}>
              <Search size={20} color={theme.textTertiary} strokeWidth={1.5} />
              <TextInput
                style={[styles.searchInput, dynamicStyles.searchInput]}
                placeholder="Search"
                placeholderTextColor={theme.textTertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity style={[styles.filterButton, dynamicStyles.filterButton]}>
              <SlidersHorizontal size={20} color={theme.navy} strokeWidth={1.5} />
            </TouchableOpacity>
          </View>

          {/* Properties Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Properties</Text>
            </View>

            {/* Filter Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterContainer}
            >
              <TouchableOpacity
                style={[styles.addProjectButton, dynamicStyles.addProjectButton]}
                onPress={() => router.push("/add-property" as any)}
              >
                <Plus size={18} color={theme.navy} strokeWidth={2} />
              </TouchableOpacity>
              {propertyFilters.map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterChip,
                    dynamicStyles.filterChip,
                    selectedFilter === filter && dynamicStyles.filterChipActive,
                  ]}
                  onPress={() => setSelectedFilter(filter)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      dynamicStyles.filterChipText,
                      selectedFilter === filter && dynamicStyles.filterChipTextActive,
                    ]}
                  >
                    {filter}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Property Cards */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.projectsContainer}
            >
              {filteredProperties.map((property) => (
                <TouchableOpacity
                  key={property.id}
                  style={styles.projectCard}
                  onPress={() => router.push(`/property/${property.id}` as any)}
                  activeOpacity={0.9}
                >
                  <Image
                    source={{ uri: property.coverImage }}
                    style={styles.projectImage}
                    contentFit="cover"
                  />
                  <LinearGradient
                    colors={['rgba(0,0,0,0)', 'rgba(0,0,0,1)']}
                    locations={[0, 1]}
                    style={styles.projectOverlay}
                  />
                  <View style={styles.projectInfo}>
                    <Text style={styles.projectName} numberOfLines={1}>{property.address.split(',')[0]}</Text>
                    <Text style={styles.projectAddress} numberOfLines={1}>
                      {property.address}
                    </Text>
                    <View style={styles.propertyMetaRow}>
                      <View style={styles.propertyStatusBadge}>
                        <Text style={styles.propertyStatusText}>
                          {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                        </Text>
                      </View>
                      <Text style={styles.propertyPrice}>
                        ${(property.purchasePrice / 1000).toFixed(0)}K
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Quick Actions Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Quick Actions</Text>
            </View>
            <View style={styles.quickActionsContainer}>
              {quickActionsData.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={[styles.quickActionCard, dynamicStyles.quickLinkCard]}
                  onPress={() => router.push(action.route as any)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}15` }]}>
                    <action.icon size={26} color={action.color} strokeWidth={1.5} />
                  </View>
                  <Text style={[styles.quickActionLabel, dynamicStyles.toolLabel]}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Send Invitations Section - For Homeowner/Investor */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Invite Professionals</Text>
              </View>
              <TouchableOpacity style={styles.seeAllButton} onPress={() => router.push("/send-invite" as any)}>
                <ChevronRight size={20} color={theme.textTertiary} strokeWidth={2} />
              </TouchableOpacity>
            </View>
            <View style={styles.sendInviteContainer}>
              <View style={[styles.sendInviteCard, dynamicStyles.quickLinkCard]}>
                <View style={styles.sendInviteContent}>
                  <View style={[styles.sendInviteIcon, { backgroundColor: "#10B98115" }]}>
                    <UserPlus size={28} color="#10B981" strokeWidth={1.5} />
                  </View>
                  <Text style={[styles.sendInviteTitle, { color: theme.text }]}>Invite to Your Project</Text>
                  <Text style={[styles.sendInviteSubtitle, { color: theme.textSecondary }]}>
                    Send invitations to contractors, designers, or partners to collaborate on your projects
                  </Text>
                  <TouchableOpacity 
                    style={styles.sendInviteButton}
                    onPress={() => router.push("/send-invite" as any)}
                  >
                    <Mail size={16} color="#FFFFFF" strokeWidth={2} />
                    <Text style={styles.sendInviteButtonText}>Send Invitation</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Services Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Services</Text>
              <TouchableOpacity style={styles.seeAllButton} onPress={() => router.push("/(tabs)/services" as any)}>
                <ChevronRight size={20} color={theme.textTertiary} strokeWidth={2} />
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.servicesScrollContainer}
            >
              {serviceTypes.map((service) => (
                <TouchableOpacity 
                  key={service.id} 
                  style={styles.serviceItem}
                  onPress={() => router.push(service.route as any)}
                >
                  <View style={[styles.serviceIconContainer, dynamicStyles.serviceIconContainer, { borderColor: `${service.color}30` }]}>
                    <service.icon size={24} color={service.color} strokeWidth={1.5} />
                  </View>
                  <Text style={[styles.serviceLabel, dynamicStyles.serviceLabel]}>{service.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* My Team Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>My Team</Text>
              <TouchableOpacity
                style={styles.seeAllButton}
                onPress={() => router.push("/add-team-member" as any)}
              >
                <ChevronRight size={20} color={theme.textTertiary} strokeWidth={2} />
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.teamContainer}
            >
              {teamMembers.map((member) => (
                <TouchableOpacity
                  key={member.id}
                  style={[styles.teamCard, dynamicStyles.teamCard]}
                  onPress={() => router.push(`/professional/${member.id}` as any)}
                  activeOpacity={0.7}
                >
                  <Image
                    source={{ uri: member.avatar }}
                    style={styles.teamAvatar}
                    contentFit="cover"
                  />
                  <View style={styles.teamInfo}>
                    <Text style={[styles.teamName, dynamicStyles.teamName]}>{member.name}</Text>
                    <View style={styles.teamRoleRow}>
                      <Hammer size={12} color={theme.textSecondary} strokeWidth={1.5} />
                      <Text style={[styles.teamRole, dynamicStyles.teamRole]}>
                        {member.professionalType.charAt(0).toUpperCase() +
                          member.professionalType.slice(1)}
                      </Text>
                    </View>
                    <View style={styles.teamStarsRow}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={12}
                          color={star <= Math.floor(member.rating) ? "#272D53" : theme.border}
                          fill={star <= Math.floor(member.rating) ? "#272D53" : "transparent"}
                        />
                      ))}
                    </View>
                    <View style={styles.teamProjectsRow}>
                      <View style={styles.miniProjectImages}>
                        {[1, 2, 3].map((i) => (
                          <View key={i} style={[styles.miniProjectImage, { marginLeft: i > 1 ? -8 : 0, borderColor: theme.surface }]}>
                            <Image
                              source={{ uri: `https://images.unsplash.com/photo-156051888${i}-ce09059eeffa?w=100` }}
                              style={styles.miniProjectImageInner}
                              contentFit="cover"
                            />
                          </View>
                        ))}
                      </View>
                      <Text style={[styles.teamProjects, dynamicStyles.teamProjects]}>
                        {member.completedProjects}+ Projects
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Documents Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Documents</Text>
              <TouchableOpacity style={styles.seeAllButton} onPress={() => router.push("/document-management" as any)}>
                <ChevronRight size={20} color={theme.textTertiary} strokeWidth={2} />
              </TouchableOpacity>
            </View>
            {documentCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[styles.documentCard, dynamicStyles.documentCard]}
                activeOpacity={0.7}
                onPress={() => {
                  if (category.id === "contracts") router.push("/contracts" as any);
                  else if (category.id === "permits") router.push("/permits" as any);
                  else if (category.id === "inspection") router.push("/inspections" as any);
                }}
              >
                <Image
                  source={{ uri: category.image }}
                  style={styles.documentImage}
                  contentFit="cover"
                />
                <View style={styles.documentInfo}>
                  <Text style={[styles.documentTitle, dynamicStyles.documentTitle]}>{category.title}</Text>
                  <View style={styles.documentBadges}>
                    <View style={[styles.documentBadge, dynamicStyles.documentBadge]}>
                      <Text style={[styles.documentBadgeText, dynamicStyles.documentBadgeText]}>Saved ({category.saved})</Text>
                    </View>
                    <View style={[styles.documentBadge, styles.documentBadgePending]}>
                      <Text style={styles.documentBadgeText}>Pending ({category.pending})</Text>
                    </View>
                    <View style={[styles.documentBadge, styles.documentBadgeNew]}>
                      <Text style={styles.documentBadgeText}>New ({category.new})</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tools Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Tools</Text>
            </View>
            <View style={styles.toolsGrid}>
              {toolsData.map((tool) => (
                <TouchableOpacity
                  key={tool.id}
                  style={[styles.toolCard, dynamicStyles.toolCard]}
                  onPress={() => router.push(tool.route as any)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.toolIconContainer, { backgroundColor: `${tool.color}15` }]}>
                    <tool.icon size={24} color={tool.color} strokeWidth={1.5} />
                  </View>
                  <Text style={[styles.toolLabel, dynamicStyles.toolLabel]}>{tool.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Templates Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Templates</Text>
              <TouchableOpacity
                style={styles.seeAllButton}
                onPress={() => router.push("/(tabs)/templates" as any)}
              >
                <ChevronRight size={20} color={theme.textTertiary} strokeWidth={2} />
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.templatesContainer}
            >
              {mockTemplates.slice(0, 4).map((template) => (
                <TouchableOpacity
                  key={template.id}
                  style={[styles.templateCard, dynamicStyles.templateCard]}
                  onPress={() => router.push(`/template/${template.id}` as any)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.templateIcon,
                      {
                        backgroundColor:
                          template.type === "contract"
                            ? (isDark ? "#312E81" : "#EEF2FF")
                            : template.type === "permit"
                            ? (isDark ? "#78350F" : "#E8E9EE")
                            : (isDark ? "#064E3B" : "#ECFDF5"),
                      },
                    ]}
                  >
                    {template.type === "contract" ? (
                      <FileText size={20} color={isDark ? "#818CF8" : "#4F46E5"} strokeWidth={1.5} />
                    ) : template.type === "permit" ? (
                      <FileCheck size={20} color={isDark ? "#FBBF24" : "#D97706"} strokeWidth={1.5} />
                    ) : (
                      <ClipboardCheck size={20} color={isDark ? "#34D399" : "#059669"} strokeWidth={1.5} />
                    )}
                  </View>
                  <Text style={[styles.templateTitle, dynamicStyles.templateTitle]} numberOfLines={2}>
                    {template.title}
                  </Text>
                  <Text style={[styles.templateCategory, dynamicStyles.templateCategory]}>{template.category}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Nearby Stores Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Nearby Stores</Text>
              <TouchableOpacity
                style={styles.seeAllButton}
                onPress={() => router.push("/nearby-stores" as any)}
              >
                <ChevronRight size={20} color={theme.textTertiary} strokeWidth={2} />
              </TouchableOpacity>
            </View>
            
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.storesContainer}
            >
              {nearbyStores.map((store) => (
                <TouchableOpacity
                  key={store.id}
                  style={[styles.storeCard, dynamicStyles.storeCard]}
                  onPress={() => router.push("/nearby-stores" as any)}
                  activeOpacity={0.7}
                >
                  <Image
                    source={{ uri: store.image }}
                    style={styles.storeImage}
                    contentFit="cover"
                  />
                  <View style={styles.storeInfo}>
                    <Text style={[styles.storeName, dynamicStyles.storeName]} numberOfLines={1}>{store.name}</Text>
                    <View style={styles.storeMetaRow}>
                      <Navigation size={12} color={theme.navy} strokeWidth={1.5} />
                      <Text style={[styles.storeDistance, { color: theme.navy }]}>{store.distance}</Text>
                    </View>
                    <View style={[styles.storeStatusBadge, !store.isOpen && styles.storeClosedBadge]}>
                      <Text style={[styles.storeStatusText, !store.isOpen && styles.storeClosedText]}>
                        {store.isOpen ? "Open" : "Closed"}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.storeActions}>
                    <TouchableOpacity style={[styles.storeActionBtn, dynamicStyles.storeActionBtn]}>
                      <Phone size={14} color={theme.navy} strokeWidth={1.5} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.storeActionBtn, dynamicStyles.storeActionBtn]}>
                      <MapPin size={14} color={theme.navy} strokeWidth={1.5} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={{ height: Platform.OS === "ios" ? 100 : 80 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F3FB",
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    width: 44,
    height: 44,
  },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.navy,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#E5E7EB",
  },
  logoText: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 12,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#1F2937",
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1F2937",
  },
  seeAllButton: {
    padding: 4,
  },
  filterContainer: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  addProjectButton: {
    width: 40,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
  projectsContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  projectCard: {
    width: 280,
    height: 220,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#1F2937",
  },
  projectImage: {
    ...StyleSheet.absoluteFillObject,
  },
  projectOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  projectInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  projectName: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  projectAddress: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 12,
  },
  progressContainer: {
    marginBottom: 6,
  },
  progressBar: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 3,
  },
  progressFill: {
    height: 6,
    backgroundColor: "#3B82F6",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "rgba(255, 255, 255, 0.9)",
  },
  servicesScrollContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  serviceItem: {
    alignItems: "center",
    gap: 8,
  },
  serviceIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  serviceLabel: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: "#4B5563",
  },
  teamContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  teamCard: {
    width: 200,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  teamAvatar: {
    width: 70,
    height: 70,
    borderRadius: 12,
  },
  teamInfo: {
    flex: 1,
    gap: 2,
  },
  teamName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  teamRoleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  teamRole: {
    fontSize: 11,
    color: "#6B7280",
  },
  teamStarsRow: {
    flexDirection: "row",
    gap: 2,
    marginTop: 2,
  },
  teamProjectsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  miniProjectImages: {
    flexDirection: "row",
  },
  miniProjectImage: {
    width: 20,
    height: 20,
    borderRadius: 4,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  miniProjectImageInner: {
    width: "100%",
    height: "100%",
  },
  teamProjects: {
    fontSize: 10,
    color: "#9CA3AF",
  },
  documentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 12,
  },
  documentImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  documentInfo: {
    flex: 1,
    marginLeft: 14,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 8,
  },
  documentBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  documentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  documentBadgePending: {
    backgroundColor: "#E8E9EE",
  },
  documentBadgeNew: {
    backgroundColor: "#ECFDF5",
  },
  documentBadgeText: {
    fontSize: 11,
    fontWeight: "500" as const,
    color: "#4B5563",
  },
  quickLinksContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
  },
  quickLinkCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  quickLinkIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  quickLinkTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 4,
  },
  quickLinkCount: {
    fontSize: 12,
    color: "#6B7280",
  },
  templatesContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  templateCard: {
    width: 140,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
  },
  templateIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  templateTitle: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 4,
    lineHeight: 18,
  },
  templateCategory: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  storesContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  storeCard: {
    width: 180,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
  },
  storeImage: {
    width: "100%",
    height: 90,
  },
  storeInfo: {
    padding: 12,
    paddingBottom: 8,
  },
  storeName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 6,
  },
  storeMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  storeDistance: {
    fontSize: 12,
    color: Colors.navy,
    fontWeight: "500" as const,
  },
  storeStatusBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  storeClosedBadge: {
    backgroundColor: "#FEF2F2",
  },
  storeStatusText: {
    fontSize: 11,
    fontWeight: "500" as const,
    color: "#10B981",
  },
  storeClosedText: {
    color: "#EF4444",
  },
  storeActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  storeActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  quickActionsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#4B5563",
    textAlign: "center",
    lineHeight: 16,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  invitationBadge: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  invitationBadgeText: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  invitationsContainer: {
    paddingHorizontal: 16,
    gap: 14,
  },
  invitationCard: {
    width: 280,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  invitationImage: {
    width: "100%",
    height: 120,
  },
  invitationOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
  },
  invitationTypeBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  invitationTypeText: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  invitationContent: {
    padding: 14,
  },
  inviterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
    marginTop: -36,
  },
  inviterAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  inviterName: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  invitationProjectName: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginBottom: 6,
  },
  invitationMeta: {
    marginBottom: 10,
  },
  invitationMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  invitationMetaText: {
    fontSize: 12,
    color: "#6B7280",
  },
  invitationDetails: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 10,
  },
  invitationDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  invitationDetailText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#374151",
  },
  invitationRoleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.navy,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  invitationRoleText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  invitationActions: {
    flexDirection: "row",
    gap: 10,
  },
  declineButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
  },
  acceptButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#10B981",
  },
  acceptButtonText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  toolsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 12,
  },
  toolCard: {
    width: "30%",
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
  },
  toolIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  toolLabel: {
    fontSize: 10,
    fontWeight: "500" as const,
    color: "#4B5563",
    textAlign: "center",
    lineHeight: 13,
  },
  sendInviteContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  sendInviteCard: {
    borderRadius: 16,
    overflow: "hidden",
  },
  sendInviteContent: {
    padding: 20,
    alignItems: "center",
  },
  sendInviteIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  sendInviteTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    marginBottom: 6,
    textAlign: "center" as const,
  },
  sendInviteSubtitle: {
    fontSize: 13,
    textAlign: "center" as const,
    lineHeight: 18,
    marginBottom: 16,
  },
  sendInviteButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    backgroundColor: Colors.navy,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  sendInviteButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  projectsToInviteCard: {
    borderRadius: 16,
    padding: 16,
  },
  projectsToInviteTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    marginBottom: 12,
  },
  projectInviteRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  projectInviteImage: {
    width: 48,
    height: 48,
    borderRadius: 10,
  },
  projectInviteInfo: {
    flex: 1,
    marginLeft: 12,
  },
  projectInviteName: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  projectInviteTeam: {
    fontSize: 12,
    marginTop: 2,
  },
  inviteProjectBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  propertyMetaRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginTop: 8,
  },
  propertyStatusBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  propertyStatusText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  propertyPrice: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  notificationBadge: {
    position: "absolute" as const,
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#EF4444",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
});
