import React, { useState, useMemo, useCallback } from "react";
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
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { router } from "expo-router";
import {
  Search,
  MapPin,
  Phone,
  Star,
  X,
  Check,
  Mail,
  BadgeCheck,
  TrendingUp,
  Clock,
  Building2,
  Briefcase,
  ChevronRight,
  Home,
  DollarSign,
  Calendar,
  Send,
  Users,
  ExternalLink,
  Scale,
  CheckCircle,
  XCircle,
  GraduationCap,
  Award,
  Shield,
  Globe,
  MessageSquare,
  Zap,
  Video,
  User,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import Colors from "@/constants/colors";
import { Realtor, RealEstateFirm, SoldProperty, AgentTag, RealtorReview } from "@/types";
import { mockRealtors, mockRealEstateFirms, mockRealtorReviews } from "@/mocks/realtors";
import { useLocation, getDistanceFromCoords } from "@/contexts/LocationContext";
import LocationBanner from "@/components/LocationBanner";

type TabType = "agents" | "firms";
type ReviewFilterType = "all" | "buyer" | "seller" | "investor";
type ProfileTabType = "overview" | "portfolio" | "reviews";

export default function RealtorsScreen() {
  const { theme, isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState<TabType>("agents");
  const [selectedRealtor, setSelectedRealtor] = useState<Realtor | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRealtorDetail, setShowRealtorDetail] = useState(false);
  const [inviteMessage, setInviteMessage] = useState("");
  const [compareMode, setCompareMode] = useState(false);
  const [selectedFirmsForCompare, setSelectedFirmsForCompare] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<ReviewFilterType>("all");
  const [profileTab, setProfileTab] = useState<ProfileTabType>("overview");
  const { location, maxDistanceMiles } = useLocation();

  const dynamicStyles = useMemo(() => ({
    container: { backgroundColor: theme.background },
    header: { backgroundColor: theme.surface, borderBottomColor: theme.border },
    headerTitle: { color: theme.navy },
    headerSubtitle: { color: theme.textSecondary },
    tabContainer: { backgroundColor: theme.surface, borderBottomColor: theme.border },
    tab: { backgroundColor: "transparent" },
    tabActive: { backgroundColor: theme.navy },
    tabText: { color: theme.textSecondary },
    tabTextActive: { color: theme.white },
    searchSection: { backgroundColor: theme.surface },
    searchInputWrapper: { backgroundColor: theme.surfaceSecondary },
    searchInput: { color: theme.text },
    card: { backgroundColor: theme.surface },
    cardTitle: { color: theme.text },
    cardSubtitle: { color: theme.textSecondary },
    badge: { backgroundColor: isDark ? "#312E81" : "#EEF2FF" },
    badgeText: { color: theme.navy },
    statLabel: { color: theme.textSecondary },
    statValue: { color: theme.text },
    chipContainer: { backgroundColor: theme.surfaceSecondary },
    chipText: { color: theme.textSecondary },
    actionButton: { backgroundColor: theme.navy },
    secondaryButton: { backgroundColor: theme.surfaceSecondary },
    secondaryButtonText: { color: theme.navy },
    modalContainer: { backgroundColor: theme.background },
    modalHeader: { backgroundColor: theme.surface, borderBottomColor: theme.border },
    modalTitle: { color: theme.text },
    inputLabel: { color: theme.text },
    textInput: { backgroundColor: theme.surfaceSecondary, color: theme.text, borderColor: theme.border },
    sectionTitle: { color: theme.text },
    propertyCard: { backgroundColor: theme.surfaceSecondary },
    propertyTitle: { color: theme.text },
    propertyMeta: { color: theme.textSecondary },
    firmCard: { backgroundColor: theme.surface },
    firmName: { color: theme.text },
    firmAddress: { color: theme.textSecondary },
    hiringBadge: { backgroundColor: "#ECFDF5" },
    hiringText: { color: "#10B981" },
    compareButton: { backgroundColor: isDark ? "#312E81" : "#EEF2FF" },
    compareButtonActive: { backgroundColor: theme.navy },
  }), [theme, isDark]);

  const filteredRealtors = useMemo(() => {
    let realtors = mockRealtors.map((realtor) => {
      let calculatedDistance: number | null = null;
      if (location && realtor.latitude && realtor.longitude) {
        calculatedDistance = getDistanceFromCoords(
          location.latitude,
          location.longitude,
          realtor.latitude,
          realtor.longitude
        );
      }
      return { ...realtor, calculatedDistance };
    });

    if (searchQuery) {
      realtors = realtors.filter((realtor) =>
        realtor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        realtor.serviceAreas.some(area => area.toLowerCase().includes(searchQuery.toLowerCase())) ||
        realtor.specialties.some(spec => spec.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return realtors.sort((a, b) => b.rating - a.rating);
  }, [searchQuery, location]);

  const filteredFirms = useMemo(() => {
    let firms = mockRealEstateFirms;

    if (searchQuery) {
      firms = firms.filter((firm) =>
        firm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        firm.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return firms;
  }, [searchQuery]);

  const handleCall = (phone: string) => {
    const phoneNumber = phone.replace(/[^0-9]/g, "");
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleWebsite = (website: string) => {
    Linking.openURL(website);
  };

  const handleFirmPress = useCallback((firm: RealEstateFirm) => {
    if (compareMode) {
      toggleFirmCompare(firm.id);
    } else {
      router.push(`/firm/${firm.id}` as any);
    }
  }, [compareMode]);

  const toggleFirmCompare = (firmId: string) => {
    setSelectedFirmsForCompare((prev) => {
      if (prev.includes(firmId)) {
        return prev.filter((id) => id !== firmId);
      }
      if (prev.length >= 3) {
        Alert.alert("Limit Reached", "You can compare up to 3 firms at a time.");
        return prev;
      }
      return [...prev, firmId];
    });
  };

  const getSelectedFirmsData = () => {
    return selectedFirmsForCompare.map((id) => mockRealEstateFirms.find((f) => f.id === id)).filter(Boolean) as RealEstateFirm[];
  };

  const getAgentTagStyle = (tag?: AgentTag) => {
    switch (tag) {
      case "top_producer":
        return { bg: "#E8E9EE", text: "#D97706", label: "Top Producer" };
      case "mentor":
        return { bg: "#DBEAFE", text: "#2563EB", label: "Mentor" };
      case "new":
        return { bg: "#D1FAE5", text: "#059669", label: "New" };
      default:
        return null;
    }
  };

  const handleInviteRealtor = (realtor: Realtor) => {
    setSelectedRealtor(realtor);
    setInviteMessage(`Hi ${realtor.name},\n\nI'm working on a flip project and would love to discuss having you list the property when it's ready for sale. I've been impressed by your track record in the area.\n\nWould you be interested in discussing this opportunity?`);
    setShowInviteModal(true);
  };

  const handleViewRealtorDetail = (realtor: Realtor) => {
    setSelectedRealtor(realtor);
    setShowRealtorDetail(true);
  };

  const confirmInvite = () => {
    if (!selectedRealtor) return;

    Alert.alert(
      "Invitation Sent!",
      `Your invitation has been sent to ${selectedRealtor.name}. They will be notified about your project.`,
      [{ text: "OK", onPress: () => setShowInviteModal(false) }]
    );
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    }
    return `$${(price / 1000).toFixed(0)}K`;
  };

  const renderStarRating = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} size={14} color="#272D53" fill="#272D53" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star key={i} size={14} color="#272D53" fill="#272D53" style={{ opacity: 0.5 }} />
        );
      } else {
        stars.push(
          <Star key={i} size={14} color="#D1D5DB" />
        );
      }
    }

    return <View style={styles.starContainer}>{stars}</View>;
  };

  const renderRealtorCard = (realtor: Realtor & { calculatedDistance?: number | null }) => (
    <TouchableOpacity
      key={realtor.id}
      style={[styles.realtorCard, dynamicStyles.card]}
      onPress={() => handleViewRealtorDetail(realtor)}
      activeOpacity={0.7}
    >
      <View style={styles.realtorHeader}>
        <Image
          source={{ uri: realtor.avatar }}
          style={styles.realtorAvatar}
          contentFit="cover"
        />
        <View style={styles.realtorInfo}>
          <View style={styles.realtorNameRow}>
            <Text style={[styles.realtorName, dynamicStyles.cardTitle]}>{realtor.name}</Text>
            {realtor.isVerified && (
              <BadgeCheck size={18} color="#10B981" fill="#10B981" />
            )}
          </View>
          <Text style={[styles.realtorFirm, dynamicStyles.cardSubtitle]}>{realtor.firmName}</Text>
          <View style={styles.ratingRow}>
            {renderStarRating(realtor.rating)}
            <Text style={[styles.ratingText, dynamicStyles.cardSubtitle]}>
              {realtor.rating.toFixed(1)} ({realtor.reviewCount} reviews)
            </Text>
          </View>
        </View>
        {realtor.isAvailable ? (
          <View style={[styles.availableBadge]}>
            <Text style={styles.availableText}>Available</Text>
          </View>
        ) : (
          <View style={styles.busyBadge}>
            <Text style={styles.busyText}>Busy</Text>
          </View>
        )}
      </View>

      {realtor.isVerified && (
        <View style={[styles.cardVerifiedBadge, { backgroundColor: isDark ? "#064E3B" : "#ECFDF5" }]}>
          <Shield size={14} color="#10B981" />
          <Text style={styles.cardVerifiedText}>License #{realtor.licenseNumber}</Text>
          <Text style={[styles.cardVerifiedState, dynamicStyles.cardSubtitle]}>{realtor.licenseState}</Text>
        </View>
      )}

      <View style={styles.credibilityRow}>
        <View style={[styles.credibilityItem, dynamicStyles.chipContainer]}>
          <Calendar size={14} color={theme.navy} />
          <Text style={[styles.credibilityValue, dynamicStyles.cardTitle]}>{realtor.yearsExperience}</Text>
          <Text style={[styles.credibilityLabel, dynamicStyles.cardSubtitle]}>Years</Text>
        </View>
        {realtor.responseTime && (
          <View style={[styles.credibilityItem, { backgroundColor: isDark ? "#7C2D12" : "#E8E9EE" }]}>
            <Zap size={14} color="#272D53" />
            <Text style={[styles.responseTimeShort, { color: "#D97706" }]} numberOfLines={1}>
              {realtor.responseTime.replace("Typically replies within ", "")}
            </Text>
          </View>
        )}
        {realtor.languages && realtor.languages.length > 0 && (
          <View style={[styles.credibilityItem, dynamicStyles.chipContainer]}>
            <Globe size={14} color={theme.textSecondary} />
            <Text style={[styles.credibilityValue, dynamicStyles.chipText]}>
              {realtor.languages.slice(0, 2).join(", ")}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <TrendingUp size={16} color={theme.navy} />
          <Text style={[styles.statValue, dynamicStyles.statValue]}>
            {formatPrice(realtor.totalSalesVolume)}
          </Text>
          <Text style={[styles.statLabel, dynamicStyles.statLabel]}>Sales Volume</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
        <View style={styles.stat}>
          <Clock size={16} color={theme.navy} />
          <Text style={[styles.statValue, dynamicStyles.statValue]}>
            {realtor.averageDaysOnMarket} days
          </Text>
          <Text style={[styles.statLabel, dynamicStyles.statLabel]}>Avg. DOM</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
        <View style={styles.stat}>
          <Home size={16} color={theme.navy} />
          <Text style={[styles.statValue, dynamicStyles.statValue]}>
            {realtor.soldProperties.length}
          </Text>
          <Text style={[styles.statLabel, dynamicStyles.statLabel]}>Recent Sales</Text>
        </View>
      </View>

      <View style={styles.areasSection}>
        <Text style={[styles.areasLabel, dynamicStyles.statLabel]}>Service Areas:</Text>
        <View style={styles.areasChips}>
          {realtor.serviceAreas.slice(0, 3).map((area, index) => (
            <View key={index} style={[styles.areaChip, dynamicStyles.chipContainer]}>
              <MapPin size={12} color={theme.textSecondary} />
              <Text style={[styles.areaChipText, dynamicStyles.chipText]}>{area}</Text>
            </View>
          ))}
          {realtor.serviceAreas.length > 3 && (
            <Text style={[styles.moreAreas, dynamicStyles.cardSubtitle]}>
              +{realtor.serviceAreas.length - 3} more
            </Text>
          )}
        </View>
      </View>

      {realtor.soldProperties.length > 0 && (
        <View style={styles.recentSalePreview}>
          <Text style={[styles.recentSaleLabel, dynamicStyles.statLabel]}>Recent Sale:</Text>
          <View style={styles.recentSaleInfo}>
            <Image
              source={{ uri: realtor.soldProperties[0].image }}
              style={styles.recentSaleImage}
              contentFit="cover"
            />
            <View style={styles.recentSaleDetails}>
              <Text style={[styles.recentSaleAddress, dynamicStyles.cardTitle]} numberOfLines={1}>
                {realtor.soldProperties[0].address}
              </Text>
              <Text style={[styles.recentSalePrice, dynamicStyles.cardSubtitle]}>
                {formatPrice(realtor.soldProperties[0].salePrice)} • {realtor.soldProperties[0].city}
              </Text>
            </View>
          </View>
        </View>
      )}

      <View style={[styles.actionButtons, { borderTopColor: theme.borderLight }]}>
        <TouchableOpacity
          style={[styles.secondaryButton, dynamicStyles.secondaryButton]}
          onPress={() => handleCall(realtor.phone)}
        >
          <Phone size={16} color={theme.navy} />
          <Text style={[styles.secondaryButtonText, dynamicStyles.secondaryButtonText]}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.primaryButton, dynamicStyles.actionButton]}
          onPress={() => handleInviteRealtor(realtor)}
        >
          <Send size={16} color={theme.white} />
          <Text style={styles.primaryButtonText}>Invite to Project</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderFirmCard = (firm: RealEstateFirm) => {
    const isSelected = selectedFirmsForCompare.includes(firm.id);
    
    return (
      <TouchableOpacity
        key={firm.id}
        style={[
          styles.firmCard, 
          dynamicStyles.firmCard,
          compareMode && isSelected && styles.firmCardSelected,
        ]}
        activeOpacity={0.7}
        onPress={() => handleFirmPress(firm)}
      >
        {compareMode && (
          <View style={[
            styles.compareCheckbox,
            isSelected ? styles.compareCheckboxActive : dynamicStyles.chipContainer,
          ]}>
            {isSelected && <Check size={14} color="#FFFFFF" />}
          </View>
        )}
        
        <View style={styles.firmHeader}>
          <Image
            source={{ uri: firm.logo }}
            style={styles.firmLogo}
            contentFit="cover"
          />
          <View style={styles.firmInfo}>
            <View style={styles.firmNameRow}>
              <Text style={[styles.firmName, dynamicStyles.firmName]}>{firm.name}</Text>
              {firm.isHiring && (
                <View style={[styles.hiringBadge, dynamicStyles.hiringBadge]}>
                  <Briefcase size={10} color="#10B981" />
                  <Text style={[styles.hiringText, dynamicStyles.hiringText]}>Hiring</Text>
                </View>
              )}
            </View>
            <View style={styles.firmAddressRow}>
              <MapPin size={12} color={theme.textSecondary} />
              <Text style={[styles.firmAddress, dynamicStyles.firmAddress]} numberOfLines={1}>
                {firm.address}
              </Text>
            </View>
            <View style={styles.firmMetaRow}>
              <View style={styles.firmRating}>
                <Star size={12} color="#272D53" fill="#272D53" />
                <Text style={[styles.firmRatingText, dynamicStyles.cardSubtitle]}>
                  {firm.rating} ({firm.reviewCount})
                </Text>
              </View>
              <View style={styles.firmAgents}>
                <Users size={12} color={theme.textSecondary} />
                <Text style={[styles.firmAgentCount, dynamicStyles.cardSubtitle]}>
                  {firm.agentCount} agents
                </Text>
              </View>
              {firm.distance && (
                <Text style={[styles.firmDistance, dynamicStyles.badgeText]}>{firm.distance}</Text>
              )}
            </View>
          </View>
          <ChevronRight size={20} color={theme.textSecondary} />
        </View>

        <View style={styles.firmQuickStats}>
          <View style={styles.firmQuickStat}>
            <Text style={[styles.firmQuickStatLabel, dynamicStyles.statLabel]}>Split</Text>
            <Text style={[styles.firmQuickStatValue, dynamicStyles.cardTitle]} numberOfLines={1}>
              {firm.commissionSplit || "N/A"}
            </Text>
          </View>
          <View style={[styles.firmQuickStatDivider, { backgroundColor: theme.border }]} />
          <View style={styles.firmQuickStat}>
            <Text style={[styles.firmQuickStatLabel, dynamicStyles.statLabel]}>Fees</Text>
            <Text style={[styles.firmQuickStatValue, dynamicStyles.cardTitle]} numberOfLines={1}>
              {firm.fees || "N/A"}
            </Text>
          </View>
          <View style={[styles.firmQuickStatDivider, { backgroundColor: theme.border }]} />
          <View style={styles.firmQuickStat}>
            <Text style={[styles.firmQuickStatLabel, dynamicStyles.statLabel]}>Leads</Text>
            <View style={styles.leadsIndicatorSmall}>
              {firm.leadsProvided ? (
                <CheckCircle size={14} color="#10B981" />
              ) : (
                <XCircle size={14} color="#EF4444" />
              )}
            </View>
          </View>
        </View>

        {firm.featuredAgents && firm.featuredAgents.length > 0 && (
          <View style={styles.featuredAgentsPreview}>
            <Text style={[styles.featuredAgentsLabel, dynamicStyles.statLabel]}>Featured Agents:</Text>
            <View style={styles.featuredAgentsList}>
              {firm.featuredAgents.slice(0, 3).map((agent) => {
                const tagStyle = getAgentTagStyle(agent.tag);
                return (
                  <View key={agent.id} style={styles.featuredAgentChip}>
                    <Image
                      source={{ uri: agent.avatar }}
                      style={styles.featuredAgentAvatar}
                      contentFit="cover"
                    />
                    {tagStyle && (
                      <View style={[styles.agentMiniTag, { backgroundColor: tagStyle.bg }]}>
                        <Text style={[styles.agentMiniTagText, { color: tagStyle.text }]}>
                          {tagStyle.label}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        <View style={styles.firmSpecialties}>
          {firm.specialties.map((specialty, index) => (
            <View key={index} style={[styles.specialtyChip, dynamicStyles.chipContainer]}>
              <Text style={[styles.specialtyText, dynamicStyles.chipText]}>{specialty}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.firmActions, { borderTopColor: theme.borderLight }]}>
          <TouchableOpacity
            style={[styles.firmActionButton, dynamicStyles.secondaryButton]}
            onPress={() => handleCall(firm.phone)}
          >
            <Phone size={16} color={theme.navy} />
            <Text style={[styles.firmActionText, dynamicStyles.secondaryButtonText]}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.firmActionButton, dynamicStyles.actionButton]}
            onPress={() => router.push(`/firm/${firm.id}`)}
          >
            <Building2 size={16} color={theme.white} />
            <Text style={styles.primaryButtonText}>View Profile</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <LocationBanner />

        <View style={[styles.header, dynamicStyles.header]}>
          <View>
            <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>Real Estate Agents</Text>
            <Text style={[styles.headerSubtitle, dynamicStyles.headerSubtitle]}>
              Find agents to sell your flipped properties
            </Text>
          </View>
        </View>

        <View style={[styles.tabContainer, dynamicStyles.tabContainer]}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === "agents" && dynamicStyles.tabActive]}
            onPress={() => setSelectedTab("agents")}
          >
            <Users size={18} color={selectedTab === "agents" ? theme.white : theme.textSecondary} />
            <Text style={[styles.tabText, selectedTab === "agents" ? dynamicStyles.tabTextActive : dynamicStyles.tabText]}>
              Agents
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === "firms" && dynamicStyles.tabActive]}
            onPress={() => setSelectedTab("firms")}
          >
            <Building2 size={18} color={selectedTab === "firms" ? theme.white : theme.textSecondary} />
            <Text style={[styles.tabText, selectedTab === "firms" ? dynamicStyles.tabTextActive : dynamicStyles.tabText]}>
              Firms & Jobs
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.searchSection, dynamicStyles.searchSection]}>
          <View style={[styles.searchInputWrapper, dynamicStyles.searchInputWrapper]}>
            <Search size={20} color={theme.textTertiary} />
            <TextInput
              style={[styles.searchInput, dynamicStyles.searchInput]}
              placeholder={selectedTab === "agents" ? "Search agents, areas, specialties..." : "Search firms..."}
              placeholderTextColor={theme.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <X size={18} color={theme.textTertiary} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {selectedTab === "agents" ? (
            <>
              <Text style={[styles.resultsText, dynamicStyles.cardSubtitle]}>
                {filteredRealtors.length} agent{filteredRealtors.length !== 1 ? "s" : ""} available
              </Text>
              {filteredRealtors.map(renderRealtorCard)}
            </>
          ) : (
            <>
              <View style={styles.firmsHeader}>
                <Text style={[styles.resultsText, dynamicStyles.cardSubtitle]}>
                  {filteredFirms.length} firm{filteredFirms.length !== 1 ? "s" : ""} nearby
                </Text>
                <TouchableOpacity
                  style={[
                    styles.compareModeButton,
                    compareMode ? dynamicStyles.compareButtonActive : dynamicStyles.compareButton,
                  ]}
                  onPress={() => {
                    setCompareMode(!compareMode);
                    if (compareMode) {
                      setSelectedFirmsForCompare([]);
                    }
                  }}
                >
                  <Scale size={14} color={compareMode ? theme.white : theme.navy} />
                  <Text style={[
                    styles.compareModeButtonText,
                    { color: compareMode ? theme.white : theme.navy },
                  ]}>
                    {compareMode ? "Cancel" : "Compare"}
                  </Text>
                </TouchableOpacity>
              </View>
              
              {compareMode && selectedFirmsForCompare.length > 0 && (
                <TouchableOpacity
                  style={[styles.compareFloatingButton, dynamicStyles.actionButton]}
                  onPress={() => setShowCompareModal(true)}
                >
                  <Scale size={18} color="#FFFFFF" />
                  <Text style={styles.compareFloatingButtonText}>
                    Compare {selectedFirmsForCompare.length} Firm{selectedFirmsForCompare.length > 1 ? "s" : ""}
                  </Text>
                </TouchableOpacity>
              )}
              
              {filteredFirms.map(renderFirmCard)}
            </>
          )}

          <View style={{ height: Platform.OS === "ios" ? 100 : 80 }} />
        </ScrollView>
      </SafeAreaView>

      <Modal
        visible={showInviteModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowInviteModal(false)}
      >
        <SafeAreaView style={[styles.modalContainer, dynamicStyles.modalContainer]}>
          <View style={[styles.modalHeader, dynamicStyles.modalHeader]}>
            <TouchableOpacity onPress={() => setShowInviteModal(false)}>
              <X size={24} color={theme.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, dynamicStyles.modalTitle]}>Invite to Project</Text>
            <View style={{ width: 24 }} />
          </View>

          {selectedRealtor && (
            <ScrollView style={styles.modalContent}>
              <View style={[styles.inviteRealtorInfo, dynamicStyles.card]}>
                <Image
                  source={{ uri: selectedRealtor.avatar }}
                  style={styles.inviteAvatar}
                  contentFit="cover"
                />
                <View style={styles.inviteRealtorDetails}>
                  <Text style={[styles.inviteRealtorName, dynamicStyles.cardTitle]}>
                    {selectedRealtor.name}
                  </Text>
                  <Text style={[styles.inviteRealtorFirm, dynamicStyles.cardSubtitle]}>
                    {selectedRealtor.firmName}
                  </Text>
                  <View style={styles.inviteRating}>
                    {renderStarRating(selectedRealtor.rating)}
                    <Text style={[styles.inviteRatingText, dynamicStyles.cardSubtitle]}>
                      {selectedRealtor.rating.toFixed(1)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.inviteForm}>
                <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>Message</Text>
                <TextInput
                  style={[styles.messageInput, dynamicStyles.textInput]}
                  value={inviteMessage}
                  onChangeText={setInviteMessage}
                  multiline
                  numberOfLines={8}
                  textAlignVertical="top"
                  placeholder="Write a message to the agent..."
                  placeholderTextColor={theme.textTertiary}
                />
              </View>

              <TouchableOpacity
                style={[styles.sendInviteButton, dynamicStyles.actionButton]}
                onPress={confirmInvite}
              >
                <Send size={20} color={theme.white} />
                <Text style={styles.sendInviteText}>Send Invitation</Text>
              </TouchableOpacity>

              <Text style={[styles.inviteNote, dynamicStyles.cardSubtitle]}>
                The agent will be notified and can view your project details.
              </Text>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showRealtorDetail}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowRealtorDetail(false);
          setProfileTab("overview");
          setReviewFilter("all");
        }}
      >
        <SafeAreaView style={[styles.modalContainer, dynamicStyles.modalContainer]}>
          <View style={[styles.modalHeader, dynamicStyles.modalHeader]}>
            <TouchableOpacity onPress={() => {
              setShowRealtorDetail(false);
              setProfileTab("overview");
              setReviewFilter("all");
            }}>
              <X size={24} color={theme.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, dynamicStyles.modalTitle]}>Agent Profile</Text>
            <View style={{ width: 24 }} />
          </View>

          {selectedRealtor && (
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.profileHeroSection}>
                <Image
                  source={{ uri: selectedRealtor.avatar }}
                  style={styles.profileAvatar}
                  contentFit="cover"
                />
                <View style={styles.profileHeroInfo}>
                  <View style={styles.profileNameRow}>
                    <Text style={[styles.profileName, dynamicStyles.cardTitle]}>{selectedRealtor.name}</Text>
                    {selectedRealtor.isVerified && (
                      <BadgeCheck size={20} color="#10B981" fill="#10B981" />
                    )}
                  </View>
                  <Text style={[styles.profileFirm, dynamicStyles.cardSubtitle]}>{selectedRealtor.firmName}</Text>
                  <View style={styles.profileRatingRow}>
                    {renderStarRating(selectedRealtor.rating)}
                    <Text style={[styles.profileRatingText, dynamicStyles.cardSubtitle]}>
                      {selectedRealtor.rating.toFixed(1)} ({selectedRealtor.reviewCount})
                    </Text>
                  </View>
                </View>
              </View>

              {selectedRealtor.isVerified && (
                <View style={[styles.verifiedLicenseBadge, { backgroundColor: isDark ? "#064E3B" : "#ECFDF5" }]}>
                  <View style={styles.verifiedBadgeIcon}>
                    <Shield size={18} color="#10B981" />
                  </View>
                  <View style={styles.verifiedBadgeContent}>
                    <Text style={[styles.verifiedBadgeTitle, { color: "#10B981" }]}>Verified License</Text>
                    <Text style={[styles.verifiedBadgeText, dynamicStyles.cardSubtitle]}>
                      {selectedRealtor.licenseNumber} • {selectedRealtor.licenseState || "TX"}
                    </Text>
                    {selectedRealtor.licenseVerifiedDate && (
                      <Text style={[styles.verifiedBadgeDate, dynamicStyles.cardSubtitle]}>
                        Verified {new Date(selectedRealtor.licenseVerifiedDate).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                  <CheckCircle size={20} color="#10B981" />
                </View>
              )}

              {selectedRealtor.responseTime && (
                <View style={[styles.responseTimeCard, dynamicStyles.chipContainer]}>
                  <Zap size={16} color="#272D53" />
                  <Text style={[styles.responseTimeText, dynamicStyles.cardSubtitle]}>
                    {selectedRealtor.responseTime}
                  </Text>
                </View>
              )}

              <View style={styles.profileTabsContainer}>
                <TouchableOpacity
                  style={[styles.profileTab, profileTab === "overview" && styles.profileTabActive, profileTab === "overview" && { backgroundColor: theme.navy }]}
                  onPress={() => setProfileTab("overview")}
                >
                  <Text style={[styles.profileTabText, profileTab === "overview" && styles.profileTabTextActive]}>
                    Overview
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.profileTab, profileTab === "portfolio" && styles.profileTabActive, profileTab === "portfolio" && { backgroundColor: theme.navy }]}
                  onPress={() => setProfileTab("portfolio")}
                >
                  <Text style={[styles.profileTabText, profileTab === "portfolio" && styles.profileTabTextActive]}>
                    Portfolio
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.profileTab, profileTab === "reviews" && styles.profileTabActive, profileTab === "reviews" && { backgroundColor: theme.navy }]}
                  onPress={() => setProfileTab("reviews")}
                >
                  <Text style={[styles.profileTabText, profileTab === "reviews" && styles.profileTabTextActive]}>
                    Reviews
                  </Text>
                </TouchableOpacity>
              </View>

              {profileTab === "overview" && (
                <>
                  <View style={[styles.detailStatsGrid, dynamicStyles.card]}>
                    <View style={styles.detailStatItem}>
                      <TrendingUp size={20} color={theme.navy} />
                      <Text style={[styles.detailStatValue, dynamicStyles.cardTitle]}>
                        {formatPrice(selectedRealtor.totalSalesVolume)}
                      </Text>
                      <Text style={[styles.detailStatLabel, dynamicStyles.cardSubtitle]}>Total Sales</Text>
                    </View>
                    <View style={styles.detailStatItem}>
                      <Clock size={20} color={theme.navy} />
                      <Text style={[styles.detailStatValue, dynamicStyles.cardTitle]}>
                        {selectedRealtor.averageDaysOnMarket}
                      </Text>
                      <Text style={[styles.detailStatLabel, dynamicStyles.cardSubtitle]}>Avg DOM</Text>
                    </View>
                    <View style={styles.detailStatItem}>
                      <Calendar size={20} color={theme.navy} />
                      <Text style={[styles.detailStatValue, dynamicStyles.cardTitle]}>
                        {selectedRealtor.yearsExperience}+
                      </Text>
                      <Text style={[styles.detailStatLabel, dynamicStyles.cardSubtitle]}>Years Exp.</Text>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={[styles.detailSectionTitle, dynamicStyles.sectionTitle]}>About</Text>
                    <Text style={[styles.profileBioText, dynamicStyles.cardSubtitle]}>{selectedRealtor.bio}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={[styles.detailSectionTitle, dynamicStyles.sectionTitle]}>Specialties</Text>
                    <View style={styles.detailChips}>
                      {selectedRealtor.specialties.map((specialty, index) => (
                        <View key={index} style={[styles.detailChip, dynamicStyles.badge]}>
                          <Text style={[styles.detailChipText, dynamicStyles.badgeText]}>{specialty}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {selectedRealtor.propertyTypes && selectedRealtor.propertyTypes.length > 0 && (
                    <View style={styles.detailSection}>
                      <Text style={[styles.detailSectionTitle, dynamicStyles.sectionTitle]}>Property Types</Text>
                      <View style={styles.detailChips}>
                        {selectedRealtor.propertyTypes.map((type, index) => (
                          <View key={index} style={[styles.detailChip, dynamicStyles.chipContainer]}>
                            <Home size={14} color={theme.textSecondary} />
                            <Text style={[styles.detailChipText, dynamicStyles.chipText]}>{type}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  <View style={styles.detailSection}>
                    <Text style={[styles.detailSectionTitle, dynamicStyles.sectionTitle]}>Service Areas</Text>
                    <View style={styles.serviceAreasContainer}>
                      <View style={styles.serviceAreasMapPlaceholder}>
                        <MapPin size={24} color={theme.navy} />
                        <Text style={[styles.serviceAreasMapText, dynamicStyles.cardSubtitle]}>
                          {selectedRealtor.serviceAreas.length} Areas Covered
                        </Text>
                      </View>
                      <View style={styles.detailChips}>
                        {selectedRealtor.serviceAreas.map((area, index) => (
                          <View key={index} style={[styles.detailChip, dynamicStyles.chipContainer]}>
                            <MapPin size={14} color={theme.textSecondary} />
                            <Text style={[styles.detailChipText, dynamicStyles.chipText]}>{area}</Text>
                          </View>
                        ))}
                      </View>
                      {selectedRealtor.serviceZipCodes && selectedRealtor.serviceZipCodes.length > 0 && (
                        <Text style={[styles.zipCodesText, dynamicStyles.cardSubtitle]}>
                          ZIP: {selectedRealtor.serviceZipCodes.join(", ")}
                        </Text>
                      )}
                    </View>
                  </View>

                  {selectedRealtor.languages && selectedRealtor.languages.length > 0 && (
                    <View style={styles.detailSection}>
                      <Text style={[styles.detailSectionTitle, dynamicStyles.sectionTitle]}>Languages</Text>
                      <View style={styles.detailChips}>
                        {selectedRealtor.languages.map((lang, index) => (
                          <View key={index} style={[styles.detailChip, dynamicStyles.chipContainer]}>
                            <Globe size={14} color={theme.textSecondary} />
                            <Text style={[styles.detailChipText, dynamicStyles.chipText]}>{lang}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {selectedRealtor.availability && (
                    <View style={styles.detailSection}>
                      <Text style={[styles.detailSectionTitle, dynamicStyles.sectionTitle]}>Availability</Text>
                      <View style={[styles.availabilityCard, dynamicStyles.card]}>
                        <View style={styles.availabilityRow}>
                          <Clock size={16} color={theme.textSecondary} />
                          <Text style={[styles.availabilityText, dynamicStyles.cardSubtitle]}>
                            {selectedRealtor.availability.hours}
                          </Text>
                        </View>
                        <View style={styles.availabilityRow}>
                          <Calendar size={16} color={theme.textSecondary} />
                          <Text style={[styles.availabilityText, dynamicStyles.cardSubtitle]}>
                            {selectedRealtor.availability.days}
                          </Text>
                        </View>
                        <View style={styles.availabilityModesRow}>
                          {selectedRealtor.availability.virtual && (
                            <View style={[styles.availabilityMode, { backgroundColor: isDark ? "#1E3A5F" : "#EFF6FF" }]}>
                              <Video size={14} color="#3B82F6" />
                              <Text style={[styles.availabilityModeText, { color: "#3B82F6" }]}>Virtual</Text>
                            </View>
                          )}
                          {selectedRealtor.availability.inPerson && (
                            <View style={[styles.availabilityMode, { backgroundColor: isDark ? "#1E3A5F" : "#EFF6FF" }]}>
                              <User size={14} color="#3B82F6" />
                              <Text style={[styles.availabilityModeText, { color: "#3B82F6" }]}>In-Person</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  )}

                  {selectedRealtor.ratingBreakdown && (
                    <View style={styles.detailSection}>
                      <Text style={[styles.detailSectionTitle, dynamicStyles.sectionTitle]}>Rating Breakdown</Text>
                      <View style={[styles.ratingBreakdownCard, dynamicStyles.card]}>
                        <View style={styles.ratingBreakdownRow}>
                          <Text style={[styles.ratingBreakdownLabel, dynamicStyles.cardSubtitle]}>Professionalism</Text>
                          <View style={styles.ratingBreakdownBar}>
                            <View style={[styles.ratingBreakdownFill, { width: `${(selectedRealtor.ratingBreakdown.professionalism / 5) * 100}%`, backgroundColor: theme.navy }]} />
                          </View>
                          <Text style={[styles.ratingBreakdownValue, dynamicStyles.cardTitle]}>{selectedRealtor.ratingBreakdown.professionalism.toFixed(1)}</Text>
                        </View>
                        <View style={styles.ratingBreakdownRow}>
                          <Text style={[styles.ratingBreakdownLabel, dynamicStyles.cardSubtitle]}>Negotiation</Text>
                          <View style={styles.ratingBreakdownBar}>
                            <View style={[styles.ratingBreakdownFill, { width: `${(selectedRealtor.ratingBreakdown.negotiation / 5) * 100}%`, backgroundColor: theme.navy }]} />
                          </View>
                          <Text style={[styles.ratingBreakdownValue, dynamicStyles.cardTitle]}>{selectedRealtor.ratingBreakdown.negotiation.toFixed(1)}</Text>
                        </View>
                        <View style={styles.ratingBreakdownRow}>
                          <Text style={[styles.ratingBreakdownLabel, dynamicStyles.cardSubtitle]}>Communication</Text>
                          <View style={styles.ratingBreakdownBar}>
                            <View style={[styles.ratingBreakdownFill, { width: `${(selectedRealtor.ratingBreakdown.communication / 5) * 100}%`, backgroundColor: theme.navy }]} />
                          </View>
                          <Text style={[styles.ratingBreakdownValue, dynamicStyles.cardTitle]}>{selectedRealtor.ratingBreakdown.communication.toFixed(1)}</Text>
                        </View>
                        <View style={styles.ratingBreakdownRow}>
                          <Text style={[styles.ratingBreakdownLabel, dynamicStyles.cardSubtitle]}>Market Knowledge</Text>
                          <View style={styles.ratingBreakdownBar}>
                            <View style={[styles.ratingBreakdownFill, { width: `${(selectedRealtor.ratingBreakdown.marketKnowledge / 5) * 100}%`, backgroundColor: theme.navy }]} />
                          </View>
                          <Text style={[styles.ratingBreakdownValue, dynamicStyles.cardTitle]}>{selectedRealtor.ratingBreakdown.marketKnowledge.toFixed(1)}</Text>
                        </View>
                      </View>
                    </View>
                  )}

                  {selectedRealtor.badges && selectedRealtor.badges.length > 0 && (
                    <View style={styles.detailSection}>
                      <Text style={[styles.detailSectionTitle, dynamicStyles.sectionTitle]}>Badges & Awards</Text>
                      <View style={styles.badgesContainer}>
                        {selectedRealtor.badges.map((badge, index) => (
                          <View key={index} style={[styles.badgeItem, { backgroundColor: isDark ? "#312E81" : "#E8E9EE" }]}>
                            <Award size={16} color="#272D53" />
                            <Text style={[styles.badgeItemText, { color: "#D97706" }]}>{badge}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </>
              )}

              {profileTab === "portfolio" && (
                <View style={styles.portfolioSection}>
                  <Text style={[styles.portfolioHeaderText, dynamicStyles.cardSubtitle]}>
                    {selectedRealtor.soldProperties.length} Completed Deals
                  </Text>
                  {selectedRealtor.soldProperties.map((property) => (
                    <View key={property.id} style={[styles.portfolioCard, dynamicStyles.card]}>
                      <Image
                        source={{ uri: property.image }}
                        style={styles.portfolioImage}
                        contentFit="cover"
                      />
                      <View style={styles.portfolioContent}>
                        <Text style={[styles.portfolioAddress, dynamicStyles.cardTitle]}>
                          {property.address}
                        </Text>
                        <Text style={[styles.portfolioLocation, dynamicStyles.cardSubtitle]}>
                          {property.city}, {property.state}
                        </Text>
                        <View style={styles.portfolioMetricsRow}>
                          <View style={styles.portfolioMetric}>
                            <Text style={[styles.portfolioMetricLabel, dynamicStyles.cardSubtitle]}>Sold</Text>
                            <Text style={[styles.portfolioMetricValue, { color: "#10B981" }]}>
                              {formatPrice(property.salePrice)}
                            </Text>
                          </View>
                          {property.purchasePrice && (
                            <View style={styles.portfolioMetric}>
                              <Text style={[styles.portfolioMetricLabel, dynamicStyles.cardSubtitle]}>Purchase</Text>
                              <Text style={[styles.portfolioMetricValue, dynamicStyles.cardTitle]}>
                                {formatPrice(property.purchasePrice)}
                              </Text>
                            </View>
                          )}
                          <View style={styles.portfolioMetric}>
                            <Text style={[styles.portfolioMetricLabel, dynamicStyles.cardSubtitle]}>DOM</Text>
                            <Text style={[styles.portfolioMetricValue, dynamicStyles.cardTitle]}>
                              {property.daysOnMarket}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.portfolioFooter}>
                          <View style={[styles.propertyTypeBadge, dynamicStyles.chipContainer]}>
                            <Home size={12} color={theme.textSecondary} />
                            <Text style={[styles.propertyTypeBadgeText, dynamicStyles.chipText]}>
                              {property.propertyType.replace("_", " ")}
                            </Text>
                          </View>
                          <Text style={[styles.portfolioDate, dynamicStyles.cardSubtitle]}>
                            {new Date(property.soldDate).toLocaleDateString()}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {profileTab === "reviews" && (
                <View style={styles.reviewsSection}>
                  <View style={styles.reviewFilterRow}>
                    <TouchableOpacity
                      style={[styles.reviewFilterChip, reviewFilter === "all" && styles.reviewFilterChipActive, reviewFilter === "all" && { backgroundColor: theme.navy }]}
                      onPress={() => setReviewFilter("all")}
                    >
                      <Text style={[styles.reviewFilterChipText, reviewFilter === "all" && styles.reviewFilterChipTextActive]}>All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.reviewFilterChip, reviewFilter === "buyer" && styles.reviewFilterChipActive, reviewFilter === "buyer" && { backgroundColor: theme.navy }]}
                      onPress={() => setReviewFilter("buyer")}
                    >
                      <Text style={[styles.reviewFilterChipText, reviewFilter === "buyer" && styles.reviewFilterChipTextActive]}>Buyers</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.reviewFilterChip, reviewFilter === "seller" && styles.reviewFilterChipActive, reviewFilter === "seller" && { backgroundColor: theme.navy }]}
                      onPress={() => setReviewFilter("seller")}
                    >
                      <Text style={[styles.reviewFilterChipText, reviewFilter === "seller" && styles.reviewFilterChipTextActive]}>Sellers</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.reviewFilterChip, reviewFilter === "investor" && styles.reviewFilterChipActive, reviewFilter === "investor" && { backgroundColor: theme.navy }]}
                      onPress={() => setReviewFilter("investor")}
                    >
                      <Text style={[styles.reviewFilterChipText, reviewFilter === "investor" && styles.reviewFilterChipTextActive]}>Investors</Text>
                    </TouchableOpacity>
                  </View>
                  {mockRealtorReviews
                    .filter((r) => r.realtorId === selectedRealtor.id)
                    .filter((r) => reviewFilter === "all" || r.reviewerType === reviewFilter)
                    .map((review) => (
                      <View key={review.id} style={[styles.reviewCard, dynamicStyles.card]}>
                        <View style={styles.reviewHeader}>
                          <Image
                            source={{ uri: review.reviewerAvatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100" }}
                            style={styles.reviewAvatar}
                            contentFit="cover"
                          />
                          <View style={styles.reviewHeaderInfo}>
                            <Text style={[styles.reviewerName, dynamicStyles.cardTitle]}>{review.reviewerName}</Text>
                            <View style={styles.reviewerMetaRow}>
                              <View style={[styles.reviewerTypeBadge, { backgroundColor: review.reviewerType === "investor" ? (isDark ? "#312E81" : "#EEF2FF") : review.reviewerType === "buyer" ? (isDark ? "#064E3B" : "#ECFDF5") : (isDark ? "#7C2D12" : "#E8E9EE") }]}>
                                <Text style={[styles.reviewerTypeText, { color: review.reviewerType === "investor" ? "#6366F1" : review.reviewerType === "buyer" ? "#10B981" : "#D97706" }]}>
                                  {review.reviewerType.charAt(0).toUpperCase() + review.reviewerType.slice(1)}
                                </Text>
                              </View>
                              <Text style={[styles.reviewDate, dynamicStyles.cardSubtitle]}>
                                {new Date(review.createdAt).toLocaleDateString()}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.reviewRatingBadge}>
                            <Star size={14} color="#272D53" fill="#272D53" />
                            <Text style={styles.reviewRatingText}>{review.rating.toFixed(1)}</Text>
                          </View>
                        </View>
                        {review.propertyAddress && (
                          <View style={[styles.reviewPropertyTag, dynamicStyles.chipContainer]}>
                            <MapPin size={12} color={theme.textSecondary} />
                            <Text style={[styles.reviewPropertyText, dynamicStyles.chipText]}>{review.propertyAddress}</Text>
                          </View>
                        )}
                        <Text style={[styles.reviewComment, dynamicStyles.cardSubtitle]}>{review.comment}</Text>
                      </View>
                    ))}
                  {mockRealtorReviews
                    .filter((r) => r.realtorId === selectedRealtor.id)
                    .filter((r) => reviewFilter === "all" || r.reviewerType === reviewFilter).length === 0 && (
                    <View style={styles.noReviewsContainer}>
                      <MessageSquare size={40} color={theme.textTertiary} />
                      <Text style={[styles.noReviewsText, dynamicStyles.cardSubtitle]}>
                        No reviews from {reviewFilter === "all" ? "clients" : reviewFilter + "s"} yet
                      </Text>
                    </View>
                  )}
                </View>
              )}

              <View style={styles.detailActions}>
                <TouchableOpacity
                  style={[styles.detailActionButton, dynamicStyles.secondaryButton]}
                  onPress={() => handleCall(selectedRealtor.phone)}
                >
                  <Phone size={18} color={theme.navy} />
                  <Text style={[styles.detailActionText, dynamicStyles.secondaryButtonText]}>Call</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.detailActionButton, dynamicStyles.secondaryButton]}
                  onPress={() => handleEmail(selectedRealtor.email)}
                >
                  <Mail size={18} color={theme.navy} />
                  <Text style={[styles.detailActionText, dynamicStyles.secondaryButtonText]}>Email</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.inviteButton, dynamicStyles.actionButton]}
                onPress={() => {
                  setShowRealtorDetail(false);
                  setProfileTab("overview");
                  setTimeout(() => handleInviteRealtor(selectedRealtor), 300);
                }}
              >
                <Send size={20} color={theme.white} />
                <Text style={styles.inviteButtonText}>Invite to Sell Property</Text>
              </TouchableOpacity>

              <View style={{ height: 40 }} />
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showCompareModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCompareModal(false)}
      >
        <SafeAreaView style={[styles.modalContainer, dynamicStyles.modalContainer]}>
          <View style={[styles.modalHeader, dynamicStyles.modalHeader]}>
            <TouchableOpacity onPress={() => setShowCompareModal(false)}>
              <X size={24} color={theme.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, dynamicStyles.modalTitle]}>Compare Firms</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent} horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.compareTable}>
              <View style={[styles.compareRowHeader, dynamicStyles.chipContainer]}>
                <View style={styles.compareLabelCell}>
                  <Text style={[styles.compareLabelText, dynamicStyles.cardSubtitle]}>Firm</Text>
                </View>
                {getSelectedFirmsData().map((firm) => (
                  <View key={firm.id} style={styles.compareValueCell}>
                    <Image source={{ uri: firm.logo }} style={styles.compareFirmLogo} contentFit="cover" />
                    <Text style={[styles.compareFirmName, dynamicStyles.cardTitle]} numberOfLines={2}>
                      {firm.name}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={[styles.compareRow, { borderBottomColor: theme.border }]}>
                <View style={styles.compareLabelCell}>
                  <Star size={14} color={theme.textSecondary} />
                  <Text style={[styles.compareLabelText, dynamicStyles.cardSubtitle]}>Rating</Text>
                </View>
                {getSelectedFirmsData().map((firm) => (
                  <View key={firm.id} style={styles.compareValueCell}>
                    <Text style={[styles.compareValueText, dynamicStyles.cardTitle]}>
                      {firm.rating} ({firm.reviewCount})
                    </Text>
                  </View>
                ))}
              </View>

              <View style={[styles.compareRow, { borderBottomColor: theme.border }]}>
                <View style={styles.compareLabelCell}>
                  <Users size={14} color={theme.textSecondary} />
                  <Text style={[styles.compareLabelText, dynamicStyles.cardSubtitle]}>Agents</Text>
                </View>
                {getSelectedFirmsData().map((firm) => (
                  <View key={firm.id} style={styles.compareValueCell}>
                    <Text style={[styles.compareValueText, dynamicStyles.cardTitle]}>
                      {firm.agentCount}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={[styles.compareRow, { borderBottomColor: theme.border }]}>
                <View style={styles.compareLabelCell}>
                  <DollarSign size={14} color={theme.textSecondary} />
                  <Text style={[styles.compareLabelText, dynamicStyles.cardSubtitle]}>Split</Text>
                </View>
                {getSelectedFirmsData().map((firm) => (
                  <View key={firm.id} style={styles.compareValueCell}>
                    <Text style={[styles.compareValueText, dynamicStyles.cardTitle]} numberOfLines={2}>
                      {firm.commissionSplit || "N/A"}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={[styles.compareRow, { borderBottomColor: theme.border }]}>
                <View style={styles.compareLabelCell}>
                  <DollarSign size={14} color={theme.textSecondary} />
                  <Text style={[styles.compareLabelText, dynamicStyles.cardSubtitle]}>Fees</Text>
                </View>
                {getSelectedFirmsData().map((firm) => (
                  <View key={firm.id} style={styles.compareValueCell}>
                    <Text style={[styles.compareValueText, dynamicStyles.cardTitle]} numberOfLines={2}>
                      {firm.fees || "N/A"}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={[styles.compareRow, { borderBottomColor: theme.border }]}>
                <View style={styles.compareLabelCell}>
                  <DollarSign size={14} color={theme.textSecondary} />
                  <Text style={[styles.compareLabelText, dynamicStyles.cardSubtitle]}>Cap</Text>
                </View>
                {getSelectedFirmsData().map((firm) => (
                  <View key={firm.id} style={styles.compareValueCell}>
                    <Text style={[styles.compareValueText, dynamicStyles.cardTitle]} numberOfLines={2}>
                      {firm.capAmount || "N/A"}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={[styles.compareRow, { borderBottomColor: theme.border }]}>
                <View style={styles.compareLabelCell}>
                  <GraduationCap size={14} color={theme.textSecondary} />
                  <Text style={[styles.compareLabelText, dynamicStyles.cardSubtitle]}>Training</Text>
                </View>
                {getSelectedFirmsData().map((firm) => (
                  <View key={firm.id} style={styles.compareValueCell}>
                    <Text style={[styles.compareValueText, dynamicStyles.cardTitle]} numberOfLines={3}>
                      {firm.trainingProgram || "N/A"}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={[styles.compareRow, { borderBottomColor: theme.border }]}>
                <View style={styles.compareLabelCell}>
                  <Users size={14} color={theme.textSecondary} />
                  <Text style={[styles.compareLabelText, dynamicStyles.cardSubtitle]}>Leads</Text>
                </View>
                {getSelectedFirmsData().map((firm) => (
                  <View key={firm.id} style={styles.compareValueCell}>
                    {firm.leadsProvided ? (
                      <View style={styles.compareLeadsYes}>
                        <CheckCircle size={16} color="#10B981" />
                        <Text style={{ color: "#10B981", fontWeight: "600" as const }}>Yes</Text>
                      </View>
                    ) : (
                      <View style={styles.compareLeadsNo}>
                        <XCircle size={16} color="#EF4444" />
                        <Text style={{ color: "#EF4444", fontWeight: "600" as const }}>No</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>

              <View style={[styles.compareRow, { borderBottomColor: theme.border }]}>
                <View style={styles.compareLabelCell}>
                  <Briefcase size={14} color={theme.textSecondary} />
                  <Text style={[styles.compareLabelText, dynamicStyles.cardSubtitle]}>Hiring</Text>
                </View>
                {getSelectedFirmsData().map((firm) => (
                  <View key={firm.id} style={styles.compareValueCell}>
                    {firm.isHiring ? (
                      <View style={styles.compareHiringYes}>
                        <Text style={{ color: "#10B981", fontWeight: "600" as const }}>Yes</Text>
                      </View>
                    ) : (
                      <View style={styles.compareHiringNo}>
                        <Text style={{ color: "#6B7280", fontWeight: "600" as const }}>No</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>

              <View style={styles.compareActions}>
                <View style={styles.compareLabelCell} />
                {getSelectedFirmsData().map((firm) => (
                  <View key={firm.id} style={styles.compareValueCell}>
                    <TouchableOpacity
                      style={[styles.compareViewButton, dynamicStyles.actionButton]}
                      onPress={() => {
                        setShowCompareModal(false);
                        router.push(`/firm/${firm.id}` as any);
                      }}
                    >
                      <Text style={styles.compareViewButtonText}>View Profile</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
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
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  resultsText: {
    fontSize: 14,
    marginBottom: 12,
  },
  realtorCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
  },
  realtorHeader: {
    flexDirection: "row",
    padding: 16,
    alignItems: "flex-start",
  },
  realtorAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  realtorInfo: {
    flex: 1,
    marginLeft: 14,
  },
  realtorNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  realtorName: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  realtorFirm: {
    fontSize: 13,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  starContainer: {
    flexDirection: "row",
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
  },
  availableBadge: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  availableText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: "#10B981",
  },
  busyBadge: {
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  busyText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: "#EF4444",
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  stat: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 15,
    fontWeight: "700" as const,
  },
  statLabel: {
    fontSize: 11,
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  areasSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  areasLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  areasChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
  },
  cardVerifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  cardVerifiedText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#10B981",
  },
  cardVerifiedState: {
    fontSize: 11,
    marginLeft: "auto",
  },
  credibilityRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 8,
  },
  credibilityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  credibilityValue: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  credibilityLabel: {
    fontSize: 11,
  },
  responseTimeShort: {
    fontSize: 12,
    fontWeight: "500" as const,
  },
  areaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  areaChipText: {
    fontSize: 12,
  },
  moreAreas: {
    fontSize: 12,
  },
  recentSalePreview: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  recentSaleLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  recentSaleInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  recentSaleImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
  },
  recentSaleDetails: {
    flex: 1,
  },
  recentSaleAddress: {
    fontSize: 14,
    fontWeight: "500" as const,
  },
  recentSalePrice: {
    fontSize: 13,
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: "row",
    padding: 14,
    gap: 10,
    borderTopWidth: 1,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  primaryButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  firmCard: {
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
  },
  firmHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  firmLogo: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  firmInfo: {
    flex: 1,
    marginLeft: 14,
  },
  firmNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  firmName: {
    fontSize: 17,
    fontWeight: "600" as const,
  },
  hiringBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  hiringText: {
    fontSize: 10,
    fontWeight: "600" as const,
  },
  firmAddressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  firmAddress: {
    flex: 1,
    fontSize: 12,
  },
  firmMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 6,
  },
  firmRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  firmRatingText: {
    fontSize: 12,
  },
  firmAgents: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  firmAgentCount: {
    fontSize: 12,
  },
  firmDistance: {
    fontSize: 12,
    fontWeight: "500" as const,
  },
  firmDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 12,
  },
  firmSpecialties: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  specialtyChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  specialtyText: {
    fontSize: 12,
  },
  firmActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  firmActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  firmActionText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inviteRealtorInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  inviteAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  inviteRealtorDetails: {
    marginLeft: 14,
  },
  inviteRealtorName: {
    fontSize: 17,
    fontWeight: "600" as const,
  },
  inviteRealtorFirm: {
    fontSize: 13,
    marginTop: 2,
  },
  inviteRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  inviteRatingText: {
    fontSize: 12,
  },
  inviteForm: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500" as const,
    marginBottom: 8,
  },
  messageInput: {
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    minHeight: 180,
    borderWidth: 1,
  },
  sendInviteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  sendInviteText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  inviteNote: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
  detailHeader: {
    alignItems: "center",
    paddingBottom: 20,
  },
  detailAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  detailName: {
    fontSize: 22,
    fontWeight: "700" as const,
  },
  detailFirm: {
    fontSize: 14,
    marginTop: 4,
  },
  detailRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  detailRatingText: {
    fontSize: 14,
  },
  detailBio: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 16,
    paddingHorizontal: 10,
  },
  profileHeroSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileHeroInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700" as const,
  },
  profileFirm: {
    fontSize: 14,
    marginTop: 2,
  },
  profileRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  profileRatingText: {
    fontSize: 13,
  },
  verifiedLicenseBadge: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  verifiedBadgeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  verifiedBadgeContent: {
    flex: 1,
    marginLeft: 12,
  },
  verifiedBadgeTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  verifiedBadgeText: {
    fontSize: 12,
    marginTop: 2,
  },
  verifiedBadgeDate: {
    fontSize: 11,
    marginTop: 2,
  },
  responseTimeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 16,
  },
  responseTimeText: {
    fontSize: 13,
  },
  profileTabsContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  profileTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  profileTabActive: {
    backgroundColor: "#1E3A5F",
  },
  profileTabText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "#6B7280",
  },
  profileTabTextActive: {
    color: "#FFFFFF",
  },
  profileBioText: {
    fontSize: 14,
    lineHeight: 22,
  },
  serviceAreasContainer: {
    gap: 12,
  },
  serviceAreasMapPlaceholder: {
    height: 80,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.05)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  serviceAreasMapText: {
    fontSize: 14,
    fontWeight: "500" as const,
  },
  zipCodesText: {
    fontSize: 12,
    marginTop: 4,
  },
  availabilityCard: {
    padding: 14,
    borderRadius: 12,
    gap: 10,
  },
  availabilityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  availabilityText: {
    fontSize: 14,
  },
  availabilityModesRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  availabilityMode: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  availabilityModeText: {
    fontSize: 12,
    fontWeight: "500" as const,
  },
  ratingBreakdownCard: {
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  ratingBreakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  ratingBreakdownLabel: {
    width: 110,
    fontSize: 12,
  },
  ratingBreakdownBar: {
    flex: 1,
    height: 6,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 3,
    overflow: "hidden",
  },
  ratingBreakdownFill: {
    height: "100%",
    borderRadius: 3,
  },
  ratingBreakdownValue: {
    width: 30,
    fontSize: 13,
    fontWeight: "600" as const,
    textAlign: "right" as const,
  },
  badgesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  badgeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  badgeItemText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  portfolioSection: {
    gap: 12,
  },
  portfolioHeaderText: {
    fontSize: 14,
    marginBottom: 4,
  },
  portfolioCard: {
    borderRadius: 14,
    overflow: "hidden",
  },
  portfolioImage: {
    width: "100%",
    height: 160,
  },
  portfolioContent: {
    padding: 14,
  },
  portfolioAddress: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  portfolioLocation: {
    fontSize: 13,
    marginTop: 2,
  },
  portfolioMetricsRow: {
    flexDirection: "row",
    marginTop: 12,
    gap: 16,
  },
  portfolioMetric: {
    flex: 1,
  },
  portfolioMetricLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  portfolioMetricValue: {
    fontSize: 16,
    fontWeight: "700" as const,
  },
  portfolioFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  propertyTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  propertyTypeBadgeText: {
    fontSize: 11,
    textTransform: "capitalize" as const,
  },
  portfolioDate: {
    fontSize: 12,
  },
  reviewsSection: {
    gap: 12,
  },
  reviewFilterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  reviewFilterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  reviewFilterChipActive: {
    backgroundColor: "#1E3A5F",
  },
  reviewFilterChipText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "#6B7280",
  },
  reviewFilterChipTextActive: {
    color: "#FFFFFF",
  },
  reviewCard: {
    padding: 14,
    borderRadius: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  reviewAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  reviewHeaderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  reviewerName: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  reviewerMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  reviewerTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  reviewerTypeText: {
    fontSize: 10,
    fontWeight: "600" as const,
  },
  reviewDate: {
    fontSize: 12,
  },
  reviewRatingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E8E9EE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  reviewRatingText: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: "#D97706",
  },
  reviewPropertyTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 10,
    alignSelf: "flex-start",
  },
  reviewPropertyText: {
    fontSize: 12,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  noReviewsContainer: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
  },
  noReviewsText: {
    fontSize: 14,
  },
  detailStatsGrid: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  detailStatItem: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  detailStatValue: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
  detailStatLabel: {
    fontSize: 11,
    textAlign: "center",
  },
  detailSection: {
    marginBottom: 20,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginBottom: 12,
  },
  detailChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  detailChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  detailChipText: {
    fontSize: 13,
  },
  soldPropertyCard: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  soldPropertyImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  soldPropertyInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  soldPropertyAddress: {
    fontSize: 15,
    fontWeight: "500" as const,
  },
  soldPropertyLocation: {
    fontSize: 13,
    marginTop: 2,
  },
  soldPropertyStats: {
    flexDirection: "row",
    gap: 16,
    marginTop: 8,
  },
  soldPropertyStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  soldPropertyPrice: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  soldPropertyDays: {
    fontSize: 13,
  },
  detailActions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
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
    fontSize: 15,
    fontWeight: "600" as const,
  },
  inviteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  inviteButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  firmQuickStats: {
    flexDirection: "row",
    paddingVertical: 12,
    marginTop: 12,
  },
  firmQuickStat: {
    flex: 1,
    alignItems: "center",
  },
  firmQuickStatLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  firmQuickStatValue: {
    fontSize: 12,
    fontWeight: "600" as const,
    textAlign: "center",
  },
  firmQuickStatDivider: {
    width: 1,
    height: 32,
  },
  leadsIndicatorSmall: {
    marginTop: 2,
  },
  featuredAgentsPreview: {
    paddingBottom: 10,
  },
  featuredAgentsLabel: {
    fontSize: 11,
    marginBottom: 8,
  },
  featuredAgentsList: {
    flexDirection: "row",
    gap: 8,
  },
  featuredAgentChip: {
    alignItems: "center",
  },
  featuredAgentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginBottom: 4,
  },
  agentMiniTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  agentMiniTagText: {
    fontSize: 8,
    fontWeight: "600" as const,
  },
  firmsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  compareModeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  compareModeButtonText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  compareFloatingButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  compareFloatingButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600" as const,
  },
  firmCardSelected: {
    borderWidth: 2,
    borderColor: "#3B82F6",
  },
  compareCheckbox: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  compareCheckboxActive: {
    backgroundColor: "#3B82F6",
  },
  compareTable: {
    paddingBottom: 20,
  },
  compareRowHeader: {
    flexDirection: "row",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  compareRow: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  compareLabelCell: {
    width: 100,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
  },
  compareLabelText: {
    fontSize: 12,
    flex: 1,
  },
  compareValueCell: {
    width: 130,
    alignItems: "center",
    paddingHorizontal: 8,
  },
  compareFirmLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginBottom: 6,
  },
  compareFirmName: {
    fontSize: 12,
    fontWeight: "600" as const,
    textAlign: "center",
  },
  compareValueText: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 16,
  },
  compareLeadsYes: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  compareLeadsNo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  compareHiringYes: {
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  compareHiringNo: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  compareActions: {
    flexDirection: "row",
    paddingTop: 16,
  },
  compareViewButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  compareViewButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600" as const,
  },
});
