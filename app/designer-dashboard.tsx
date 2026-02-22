import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Alert,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import {
  Palette,
  Home,
  Camera,
  FileText,
  DollarSign,
  ShoppingBag,
  Lightbulb,
  Grid3X3,
  Layers,
  Store,
  ChevronRight,
  TrendingUp,
  Star,
  MapPin,
  Sofa,
  Calculator,
  Presentation,
  FolderOpen,
  SplitSquareVertical,
  PiggyBank,
  ClipboardCheck,
  Sparkles,
  Check,
  X,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { mockDesignProjects, mockDesignEstimates, mockDesignVendors, interiorDesignerInvitations } from "@/mocks/interior-designers";

const designerStats = [
  { label: "Active Projects", value: "5", trend: "+2", color: "#EC4899" },
  { label: "This Month", value: "$42K", trend: "+18%", color: "#10B981" },
  { label: "Pending Proposals", value: "3", trend: "", color: "#272D53" },
  { label: "Client Rating", value: "4.9", trend: "", color: "#6366F1" },
];

const quickActions = [
  { id: "projects", label: "Projects", icon: FolderOpen, color: "#EC4899", route: "/design-projects" },
  { id: "presentations", label: "Presentations", icon: Presentation, color: "#8B5CF6", route: "/client-presentations" },
  { id: "estimates", label: "Estimates", icon: Calculator, color: "#10B981", route: "/design-estimates" },
  { id: "invoices", label: "Invoices", icon: FileText, color: "#3B82F6", route: "/design-invoicing" },
];

const designTools = [
  { id: "moodboards", label: "Mood\nBoards", icon: Layers, color: "#EC4899", route: "/mood-boards" },
  { id: "colorpalette", label: "Color\nPalettes", icon: Palette, color: "#272D53", route: "/color-palette" },
  { id: "roomplanner", label: "Room\nPlanner", icon: Grid3X3, color: "#3B82F6", route: "/room-planner" },
  { id: "spacecalc", label: "Space\nCalculator", icon: Home, color: "#10B981", route: "/space-calculator" },
  { id: "lighting", label: "Lighting\nPlans", icon: Lightbulb, color: "#6366F1", route: "/lighting-plans" },
  { id: "photos", label: "Photo\nDocs", icon: Camera, color: "#EF4444", route: "/design-photo-documentation" },
];

const resourcesData = [
  { id: "furniture", label: "Furniture\nDatabase", icon: Sofa, color: "#8B5CF6", route: "/furniture-database" },
  { id: "vendors", label: "Vendor\nDirectory", icon: Store, color: "#0EA5E9", route: "/design-vendors" },
  { id: "materials", label: "Material\nSourcing", icon: ShoppingBag, color: "#EC4899", route: "/material-sourcing" },
  { id: "stores", label: "Design\nStores", icon: MapPin, color: "#10B981", route: "/design-stores" },
];

const flipTools = [
  { id: "beforeafter", label: "Before/After\nComparison", icon: SplitSquareVertical, color: "#272D53", route: "/before-after-comparison" },
  { id: "roi", label: "Design ROI\nCalculator", icon: PiggyBank, color: "#10B981", route: "/design-roi-calculator" },
  { id: "staging", label: "Staging\nChecklist", icon: ClipboardCheck, color: "#8B5CF6", route: "/staging-checklist" },
  { id: "quickstage", label: "Quick Stage\nTemplates", icon: Sparkles, color: "#EC4899", route: "/quick-stage-templates" },
];

const statusColors: Record<string, { bg: string; text: string }> = {
  inquiry: { bg: "#EEF2FF", text: "#6366F1" },
  proposal: { bg: "#E8E9EE", text: "#D97706" },
  in_progress: { bg: "#DBEAFE", text: "#2563EB" },
  revision: { bg: "#FCE7F3", text: "#DB2777" },
  completed: { bg: "#D1FAE5", text: "#059669" },
};

const statusLabels: Record<string, string> = {
  inquiry: "Inquiry",
  proposal: "Proposal",
  in_progress: "In Progress",
  revision: "Revision",
  completed: "Completed",
};

export default function DesignerDashboard() {
  const router = useRouter();
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [pendingInvitations, setPendingInvitations] = useState(interiorDesignerInvitations.filter(inv => inv.status === "pending"));
  const [projects] = useState(mockDesignProjects);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleAcceptProject = (invitationId: string) => {
    Alert.alert(
      "Accept Project",
      "Are you sure you want to accept this project invitation?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Accept",
          onPress: () => {
            setPendingInvitations(prev => prev.filter(inv => inv.id !== invitationId));
            Alert.alert("Success", "Project accepted! You can now view it in your projects.");
          },
        },
      ]
    );
  };

  const handleDeclineProject = (invitationId: string) => {
    Alert.alert(
      "Decline Project",
      "Are you sure you want to decline this project invitation?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Decline",
          style: "destructive",
          onPress: () => {
            setPendingInvitations(prev => prev.filter(inv => inv.id !== invitationId));
            Alert.alert("Declined", "Project invitation has been declined.");
          },
        },
      ]
    );
  };

  const activeProjects = projects.filter(p => p.status !== "completed").slice(0, 3);
  const recentEstimates = mockDesignEstimates.slice(0, 2);
  const topVendors = mockDesignVendors.slice(0, 3);

  const dynamicStyles = useMemo(() => ({
    container: { backgroundColor: theme.background },
    sectionTitle: { color: theme.text },
    cardBg: { backgroundColor: theme.surface },
    subtleText: { color: theme.textSecondary },
    borderColor: { borderColor: theme.border },
  }), [theme]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#EC4899" />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.greeting, dynamicStyles.subtleText]}>Welcome back</Text>
              <Text style={[styles.title, { color: theme.text }]}>Designer Studio</Text>
            </View>
            <TouchableOpacity style={[styles.profileButton, { backgroundColor: theme.surface }]}>
              <Image
                source={{ uri: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200" }}
                style={styles.profileImage}
                contentFit="cover"
              />
            </TouchableOpacity>
          </View>

          {/* Stats Cards */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsContainer}
          >
            {designerStats.map((stat, index) => (
              <View
                key={index}
                style={[styles.statCard, { backgroundColor: `${stat.color}15` }]}
              >
                <View style={[styles.statIconBg, { backgroundColor: stat.color }]}>
                  {index === 0 && <FolderOpen size={18} color="#FFFFFF" strokeWidth={2} />}
                  {index === 1 && <DollarSign size={18} color="#FFFFFF" strokeWidth={2} />}
                  {index === 2 && <FileText size={18} color="#FFFFFF" strokeWidth={2} />}
                  {index === 3 && <Star size={18} color="#FFFFFF" strokeWidth={2} />}
                </View>
                <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, dynamicStyles.subtleText]}>{stat.label}</Text>
                {stat.trend && (
                  <View style={[styles.trendBadge, { backgroundColor: stat.color }]}>
                    <TrendingUp size={10} color="#FFFFFF" strokeWidth={2.5} />
                    <Text style={styles.trendText}>{stat.trend}</Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={[styles.quickActionCard, dynamicStyles.cardBg]}
                  onPress={() => router.push(action.route as any)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}15` }]}>
                    <action.icon size={24} color={action.color} strokeWidth={1.5} />
                  </View>
                  <Text style={[styles.quickActionLabel, { color: theme.text }]}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Active Projects */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Active Projects</Text>
              <TouchableOpacity 
                style={styles.seeAllButton}
                onPress={() => router.push("/design-projects" as any)}
              >
                <Text style={styles.seeAllText}>See All</Text>
                <ChevronRight size={16} color="#EC4899" strokeWidth={2} />
              </TouchableOpacity>
            </View>
            
            {/* Pending Project Invitations */}
            {pendingInvitations.length > 0 && (
              <View style={styles.invitationsSection}>
                <Text style={[styles.invitationsSectionTitle, { color: theme.text }]}>New Project Requests</Text>
                {pendingInvitations.map((invitation) => (
                  <View
                    key={invitation.id}
                    style={[styles.invitationCard, dynamicStyles.cardBg]}
                  >
                    <View style={styles.projectHeader}>
                      <Image
                        source={{ uri: invitation.inviterAvatar }}
                        style={styles.clientAvatar}
                        contentFit="cover"
                      />
                      <View style={styles.projectInfo}>
                        <Text style={[styles.projectName, { color: theme.text }]} numberOfLines={1}>
                          {invitation.projectName}
                        </Text>
                        <Text style={[styles.clientName, dynamicStyles.subtleText]}>
                          {invitation.inviterName}
                        </Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: "#E8E9EE" }]}>
                        <Text style={[styles.statusText, { color: "#D97706" }]}>Pending</Text>
                      </View>
                    </View>
                    
                    <View style={styles.projectMeta}>
                      <View style={styles.metaItem}>
                        <MapPin size={14} color={theme.textTertiary} strokeWidth={1.5} />
                        <Text style={[styles.metaText, { color: theme.textSecondary }]} numberOfLines={1}>
                          {invitation.projectAddress.split(",")[0]}
                        </Text>
                      </View>
                      <View style={styles.metaItem}>
                        <DollarSign size={14} color={theme.textTertiary} strokeWidth={1.5} />
                        <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                          {formatCurrency(invitation.budget ?? 0)}
                        </Text>
                      </View>
                    </View>

                    <Text style={[styles.invitationDescription, { color: theme.textSecondary }]} numberOfLines={2}>
                      {invitation.description}
                    </Text>

                    <View style={styles.invitationActions}>
                      <TouchableOpacity
                        style={styles.declineButton}
                        onPress={() => handleDeclineProject(invitation.id)}
                      >
                        <X size={18} color="#EF4444" strokeWidth={2} />
                        <Text style={styles.declineButtonText}>Decline</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.acceptButton}
                        onPress={() => handleAcceptProject(invitation.id)}
                      >
                        <Check size={18} color="#FFFFFF" strokeWidth={2} />
                        <Text style={styles.acceptButtonText}>Accept</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {activeProjects.map((project) => (
              <TouchableOpacity
                key={project.id}
                style={[styles.projectCard, dynamicStyles.cardBg]}
                activeOpacity={0.8}
                onPress={() => router.push("/design-projects" as any)}
              >
                <View style={styles.projectHeader}>
                  <Image
                    source={{ uri: project.clientAvatar }}
                    style={styles.clientAvatar}
                    contentFit="cover"
                  />
                  <View style={styles.projectInfo}>
                    <Text style={[styles.projectName, { color: theme.text }]} numberOfLines={1}>
                      {project.projectName}
                    </Text>
                    <Text style={[styles.clientName, dynamicStyles.subtleText]}>
                      {project.clientName}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusColors[project.status]?.bg }]}>
                    <Text style={[styles.statusText, { color: statusColors[project.status]?.text }]}>
                      {statusLabels[project.status]}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.projectMeta}>
                  <View style={styles.metaItem}>
                    <MapPin size={14} color={theme.textTertiary} strokeWidth={1.5} />
                    <Text style={[styles.metaText, { color: theme.textSecondary }]} numberOfLines={1}>
                      {project.address.split(",")[0]}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Home size={14} color={theme.textTertiary} strokeWidth={1.5} />
                    <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                      {project.rooms.length} Rooms
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <DollarSign size={14} color={theme.textTertiary} strokeWidth={1.5} />
                    <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                      {formatCurrency(project.budget)}
                    </Text>
                  </View>
                </View>

                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text style={[styles.progressLabel, dynamicStyles.subtleText]}>Completion</Text>
                    <Text style={[styles.progressValue, { color: "#EC4899" }]}>
                      {Math.round((project.rooms.filter(r => r.status === "completed").length / project.rooms.length) * 100)}%
                    </Text>
                  </View>
                  <View style={[styles.progressBar, { backgroundColor: theme.borderLight }]}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${(project.rooms.filter(r => r.status === "completed").length / project.rooms.length) * 100}%` }
                      ]} 
                    />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Design Tools */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Design Tools</Text>
            <View style={styles.toolsGrid}>
              {designTools.map((tool) => (
                <TouchableOpacity
                  key={tool.id}
                  style={[styles.toolCard, dynamicStyles.cardBg]}
                  onPress={() => router.push(tool.route as any)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.toolIcon, { backgroundColor: `${tool.color}15` }]}>
                    <tool.icon size={22} color={tool.color} strokeWidth={1.5} />
                  </View>
                  <Text style={[styles.toolLabel, dynamicStyles.subtleText]}>{tool.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Flip & Remodel Tools */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Flip & Remodel Tools</Text>
            <View style={styles.flipToolsGrid}>
              {flipTools.map((tool) => (
                <TouchableOpacity
                  key={tool.id}
                  style={[styles.flipToolCard, dynamicStyles.cardBg]}
                  onPress={() => router.push(tool.route as any)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.flipToolIcon, { backgroundColor: `${tool.color}15` }]}>
                    <tool.icon size={24} color={tool.color} strokeWidth={1.5} />
                  </View>
                  <View style={styles.flipToolContent}>
                    <Text style={[styles.flipToolLabel, { color: theme.text }]}>{tool.label}</Text>
                  </View>
                  <ChevronRight size={18} color={theme.textTertiary} strokeWidth={1.5} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Resources */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Resources</Text>
            <View style={styles.resourcesGrid}>
              {resourcesData.map((resource) => (
                <TouchableOpacity
                  key={resource.id}
                  style={[styles.resourceCard, dynamicStyles.cardBg]}
                  onPress={() => router.push(resource.route as any)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.resourceIcon, { backgroundColor: `${resource.color}15` }]}>
                    <resource.icon size={22} color={resource.color} strokeWidth={1.5} />
                  </View>
                  <Text style={[styles.resourceLabel, dynamicStyles.subtleText]}>{resource.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Top Vendors */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Top Vendors</Text>
              <TouchableOpacity 
                style={styles.seeAllButton}
                onPress={() => router.push("/design-vendors" as any)}
              >
                <Text style={styles.seeAllText}>See All</Text>
                <ChevronRight size={16} color="#EC4899" strokeWidth={2} />
              </TouchableOpacity>
            </View>
            
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.vendorsContainer}
            >
              {topVendors.map((vendor) => (
                <TouchableOpacity
                  key={vendor.id}
                  style={[styles.vendorCard, dynamicStyles.cardBg]}
                  activeOpacity={0.8}
                >
                  <View style={[styles.vendorLogo, { backgroundColor: theme.surfaceSecondary }]}>
                    <Store size={24} color="#EC4899" strokeWidth={1.5} />
                  </View>
                  <Text style={[styles.vendorName, { color: theme.text }]} numberOfLines={1}>
                    {vendor.name}
                  </Text>
                  <Text style={[styles.vendorCategory, dynamicStyles.subtleText]}>
                    {vendor.category.charAt(0).toUpperCase() + vendor.category.slice(1)}
                  </Text>
                  <View style={styles.vendorMeta}>
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>{vendor.tradeDiscount}% Trade</Text>
                    </View>
                    <View style={styles.ratingBadge}>
                      <Star size={12} color="#272D53" fill="#272D53" />
                      <Text style={[styles.ratingText, { color: theme.text }]}>{vendor.rating}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Recent Estimates */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Recent Estimates</Text>
              <TouchableOpacity 
                style={styles.seeAllButton}
                onPress={() => router.push("/design-estimates" as any)}
              >
                <Text style={styles.seeAllText}>See All</Text>
                <ChevronRight size={16} color="#EC4899" strokeWidth={2} />
              </TouchableOpacity>
            </View>
            
            {recentEstimates.map((estimate) => (
              <TouchableOpacity
                key={estimate.id}
                style={[styles.estimateCard, dynamicStyles.cardBg]}
                activeOpacity={0.8}
              >
                <View style={styles.estimateHeader}>
                  <View style={styles.estimateInfo}>
                    <Text style={[styles.estimateClient, { color: theme.text }]}>
                      {estimate.clientName}
                    </Text>
                    <Text style={[styles.estimateType, dynamicStyles.subtleText]}>
                      {estimate.projectType}
                    </Text>
                  </View>
                  <View style={[
                    styles.estimateStatusBadge,
                    { backgroundColor: estimate.status === "sent" ? "#DBEAFE" : estimate.status === "draft" ? "#F3F4F6" : "#D1FAE5" }
                  ]}>
                    <Text style={[
                      styles.estimateStatusText,
                      { color: estimate.status === "sent" ? "#2563EB" : estimate.status === "draft" ? "#6B7280" : "#059669" }
                    ]}>
                      {estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)}
                    </Text>
                  </View>
                </View>
                <View style={styles.estimateDetails}>
                  <View style={styles.estimateDetail}>
                    <Text style={[styles.estimateDetailLabel, dynamicStyles.subtleText]}>Rooms</Text>
                    <Text style={[styles.estimateDetailValue, { color: theme.text }]}>
                      {estimate.rooms.length}
                    </Text>
                  </View>
                  <View style={styles.estimateDetail}>
                    <Text style={[styles.estimateDetailLabel, dynamicStyles.subtleText]}>Design Fee</Text>
                    <Text style={[styles.estimateDetailValue, { color: theme.text }]}>
                      {formatCurrency(estimate.designFee)}
                    </Text>
                  </View>
                  <View style={styles.estimateDetail}>
                    <Text style={[styles.estimateDetailLabel, dynamicStyles.subtleText]}>Total</Text>
                    <Text style={[styles.estimateDetailValue, { color: "#EC4899", fontWeight: "700" as const }]}>
                      {formatCurrency(estimate.totalEstimate)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 14,
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "800" as const,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  statsContainer: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: 130,
    padding: 16,
    borderRadius: 16,
    marginRight: 12,
  },
  statIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800" as const,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500" as const,
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  trendText: {
    fontSize: 10,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#EC4899",
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 12,
  },
  quickActionCard: {
    width: "47%",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  quickActionLabel: {
    fontSize: 15,
    fontWeight: "600" as const,
    flex: 1,
  },
  projectCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  projectHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  clientAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  projectInfo: {
    flex: 1,
    marginLeft: 12,
  },
  projectName: {
    fontSize: 16,
    fontWeight: "700" as const,
    marginBottom: 2,
  },
  clientName: {
    fontSize: 13,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  projectMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 14,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 13,
  },
  progressSection: {
    marginTop: 4,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: "500" as const,
  },
  progressValue: {
    fontSize: 13,
    fontWeight: "700" as const,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#EC4899",
    borderRadius: 3,
  },
  invitationsSection: {
    marginBottom: 16,
  },
  invitationsSectionTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    marginBottom: 12,
    marginHorizontal: 20,
  },
  invitationCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: "#272D53",
  },
  invitationDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  invitationActions: {
    flexDirection: "row",
    gap: 12,
  },
  declineButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#FEE2E2",
    gap: 6,
  },
  declineButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#EF4444",
  },
  acceptButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#10B981",
    gap: 6,
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  toolsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 12,
  },
  toolCard: {
    width: "30%",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  toolIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  toolLabel: {
    fontSize: 11,
    fontWeight: "500" as const,
    textAlign: "center",
    lineHeight: 14,
  },
  resourcesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 12,
  },
  resourceCard: {
    width: "47%",
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  resourceIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  resourceLabel: {
    fontSize: 12,
    fontWeight: "500" as const,
    flex: 1,
    lineHeight: 16,
  },
  vendorsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  vendorCard: {
    width: 160,
    padding: 14,
    borderRadius: 16,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  vendorLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  vendorName: {
    fontSize: 14,
    fontWeight: "600" as const,
    marginBottom: 4,
  },
  vendorCategory: {
    fontSize: 12,
    marginBottom: 12,
  },
  vendorMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  discountBadge: {
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: "#059669",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  estimateCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  estimateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  estimateInfo: {
    flex: 1,
  },
  estimateClient: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginBottom: 4,
  },
  estimateType: {
    fontSize: 13,
  },
  estimateStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  estimateStatusText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  estimateDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  estimateDetail: {
    alignItems: "center",
  },
  estimateDetailLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  estimateDetailValue: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  flipToolsGrid: {
    paddingHorizontal: 20,
    gap: 10,
  },
  flipToolCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  flipToolIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  flipToolContent: {
    flex: 1,
    marginLeft: 14,
  },
  flipToolLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    lineHeight: 18,
  },
});
