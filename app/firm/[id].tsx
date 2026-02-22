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
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useLocalSearchParams, router } from "expo-router";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Star,
  Mail,
  Globe,
  Users,
  Calendar,
  DollarSign,
  Award,
  CheckCircle,
  Briefcase,
  GraduationCap,
  TrendingUp,
  Building2,
  Clock,
  X,
  Send,
  ChevronRight,
  Megaphone,
  BookOpen,
  UserPlus,
  Sparkles,
  Heart,
  Laptop,
  Target,
  Wallet,
  Home,
  BarChart,
  Crown,
  Plane,
  Brain,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import BackButton from "@/components/BackButton";
import { mockRealEstateFirms } from "@/mocks/realtors";
import { RealEstateFirm, FirmAnnouncement, AgentTag } from "@/types";

const iconMap: Record<string, any> = {
  "heart": Heart,
  "users": Users,
  "megaphone": Megaphone,
  "graduation-cap": GraduationCap,
  "dollar-sign": DollarSign,
  "laptop": Laptop,
  "brain": Brain,
  "trending-up": TrendingUp,
  "globe": Globe,
  "crown": Crown,
  "plane": Plane,
  "check-circle": CheckCircle,
  "home": Home,
  "sparkles": Sparkles,
  "bar-chart": BarChart,
  "wallet": Wallet,
  "award": Award,
  "target": Target,
};

export default function FirmProfileScreen() {
  const { id } = useLocalSearchParams();
  const { theme, isDark } = useTheme();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showAnnouncementsModal, setShowAnnouncementsModal] = useState(false);
  const [applicationData, setApplicationData] = useState({
    name: "",
    email: "",
    phone: "",
    experience: "",
    coverLetter: "",
  });

  const firm = useMemo(() => {
    return mockRealEstateFirms.find((f) => f.id === id);
  }, [id]);

  const dynamicStyles = useMemo(() => ({
    container: { backgroundColor: theme.background },
    header: { backgroundColor: theme.surface },
    backButton: { backgroundColor: isDark ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.9)" },
    headerTitle: { color: theme.text },
    card: { backgroundColor: theme.surface },
    cardTitle: { color: theme.text },
    cardSubtitle: { color: theme.textSecondary },
    badge: { backgroundColor: isDark ? "#312E81" : "#EEF2FF" },
    badgeText: { color: theme.navy },
    statValue: { color: theme.text },
    statLabel: { color: theme.textSecondary },
    sectionTitle: { color: theme.text },
    chipContainer: { backgroundColor: theme.surfaceSecondary },
    chipText: { color: theme.textSecondary },
    actionButton: { backgroundColor: theme.navy },
    secondaryButton: { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
    secondaryButtonText: { color: theme.navy },
    modalContainer: { backgroundColor: theme.background },
    modalHeader: { backgroundColor: theme.surface, borderBottomColor: theme.border },
    modalTitle: { color: theme.text },
    inputLabel: { color: theme.text },
    textInput: { backgroundColor: theme.surfaceSecondary, color: theme.text, borderColor: theme.border },
    announcementCard: { backgroundColor: theme.surfaceSecondary },
    divider: { backgroundColor: theme.border },
  }), [theme, isDark]);

  if (!firm) {
    return (
      <View style={[styles.container, dynamicStyles.container, styles.centerContent]}>
        <Text style={dynamicStyles.cardTitle}>Firm not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: theme.navy, marginTop: 12 }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCall = () => {
    const phoneNumber = firm.phone.replace(/[^0-9]/g, "");
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmail = () => {
    if (firm.email) {
      Linking.openURL(`mailto:${firm.email}`);
    }
  };

  const handleWebsite = () => {
    if (firm.website) {
      Linking.openURL(firm.website);
    }
  };

  const handleSubmitApplication = () => {
    if (!applicationData.name || !applicationData.email || !applicationData.phone) {
      Alert.alert("Missing Information", "Please fill in all required fields.");
      return;
    }

    Alert.alert(
      "Application Submitted!",
      `Your application to ${firm.name} has been submitted. They will review your information and contact you soon.`,
      [{ text: "OK", onPress: () => setShowJoinModal(false) }]
    );
    setApplicationData({ name: "", email: "", phone: "", experience: "", coverLetter: "" });
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    }
    return `$${(price / 1000).toFixed(0)}K`;
  };

  const getAnnouncementIcon = (type: FirmAnnouncement["type"]) => {
    switch (type) {
      case "training":
        return <BookOpen size={16} color="#8B5CF6" />;
      case "meeting":
        return <Calendar size={16} color="#3B82F6" />;
      case "referral":
        return <UserPlus size={16} color="#10B981" />;
      default:
        return <Megaphone size={16} color="#272D53" />;
    }
  };

  const getAnnouncementColor = (type: FirmAnnouncement["type"]) => {
    switch (type) {
      case "training":
        return { bg: "#F3E8FF", text: "#8B5CF6" };
      case "meeting":
        return { bg: "#DBEAFE", text: "#3B82F6" };
      case "referral":
        return { bg: "#D1FAE5", text: "#10B981" };
      default:
        return { bg: "#E8E9EE", text: "#272D53" };
    }
  };

  const getAgentTagStyle = (tag?: AgentTag) => {
    switch (tag) {
      case "top_producer":
        return { bg: "#E8E9EE", text: "#D97706", label: "Top Producer" };
      case "mentor":
        return { bg: "#DBEAFE", text: "#2563EB", label: "Mentor" };
      case "new":
        return { bg: "#D1FAE5", text: "#059669", label: "New Agent" };
      default:
        return null;
    }
  };

  const renderBenefitIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName] || CheckCircle;
    return <IconComponent size={20} color={theme.navy} />;
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.coverImageContainer}>
          <Image
            source={{ uri: firm.coverImage || firm.logo }}
            style={styles.coverImage}
            contentFit="cover"
          />
          <SafeAreaView edges={["top"]} style={styles.headerOverlay}>
            <BackButton />
          </SafeAreaView>
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: firm.logo }}
              style={styles.firmLogo}
              contentFit="cover"
            />
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.firmHeader}>
            <View style={styles.firmNameRow}>
              <Text style={[styles.firmName, dynamicStyles.cardTitle]}>{firm.name}</Text>
              {firm.isHiring && (
                <View style={styles.hiringBadge}>
                  <Briefcase size={12} color="#10B981" />
                  <Text style={styles.hiringText}>Hiring</Text>
                </View>
              )}
            </View>
            <View style={styles.ratingRow}>
              <Star size={16} color="#272D53" fill="#272D53" />
              <Text style={[styles.ratingText, dynamicStyles.cardSubtitle]}>
                {firm.rating} ({firm.reviewCount} reviews)
              </Text>
            </View>
            <View style={styles.locationRow}>
              <MapPin size={14} color={theme.textSecondary} />
              <Text style={[styles.locationText, dynamicStyles.cardSubtitle]}>
                {firm.address}
              </Text>
            </View>
            {firm.foundedYear && (
              <Text style={[styles.foundedText, dynamicStyles.cardSubtitle]}>
                Est. {firm.foundedYear} • {firm.agentCount} agents
              </Text>
            )}
          </View>

          {firm.mission && (
            <View style={[styles.missionCard, dynamicStyles.card]}>
              <Text style={[styles.missionLabel, dynamicStyles.statLabel]}>Our Mission</Text>
              <Text style={[styles.missionText, dynamicStyles.cardSubtitle]}>
                &ldquo;{firm.mission}&rdquo;
              </Text>
            </View>
          )}

          <Text style={[styles.descriptionText, dynamicStyles.cardSubtitle]}>
            {firm.description}
          </Text>

          {firm.announcements && firm.announcements.length > 0 && (
            <TouchableOpacity
              style={[styles.announcementBanner, { backgroundColor: "#E8E9EE" }]}
              onPress={() => setShowAnnouncementsModal(true)}
            >
              <View style={styles.announcementBannerContent}>
                <Megaphone size={20} color="#D97706" />
                <View style={styles.announcementBannerText}>
                  <Text style={[styles.announcementBannerTitle, { color: "#92400E" }]}>
                    {firm.announcements.length} Internal Announcement{firm.announcements.length > 1 ? "s" : ""}
                  </Text>
                  <Text style={[styles.announcementBannerSubtitle, { color: "#B45309" }]}>
                    View training, meetings & referrals
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color="#D97706" />
            </TouchableOpacity>
          )}

          <View style={[styles.statsCard, dynamicStyles.card]}>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Users size={22} color={theme.navy} />
                <Text style={[styles.statValue, dynamicStyles.statValue]}>{firm.agentCount}</Text>
                <Text style={[styles.statLabel, dynamicStyles.statLabel]}>Total Agents</Text>
              </View>
              {firm.teamSize && (
                <>
                  <View style={[styles.statDivider, dynamicStyles.divider]} />
                  <View style={styles.statItem}>
                    <TrendingUp size={22} color={theme.navy} />
                    <Text style={[styles.statValue, dynamicStyles.statValue]}>{firm.teamSize.topProducers}</Text>
                    <Text style={[styles.statLabel, dynamicStyles.statLabel]}>Top Producers</Text>
                  </View>
                  <View style={[styles.statDivider, dynamicStyles.divider]} />
                  <View style={styles.statItem}>
                    <GraduationCap size={22} color={theme.navy} />
                    <Text style={[styles.statValue, dynamicStyles.statValue]}>{firm.teamSize.mentors}</Text>
                    <Text style={[styles.statLabel, dynamicStyles.statLabel]}>Mentors</Text>
                  </View>
                </>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Compensation</Text>
            <View style={[styles.compensationCard, dynamicStyles.card]}>
              <View style={styles.compensationRow}>
                <Text style={[styles.compensationLabel, dynamicStyles.statLabel]}>Commission Split</Text>
                <Text style={[styles.compensationValue, dynamicStyles.cardTitle]}>{firm.commissionSplit}</Text>
              </View>
              {firm.capAmount && (
                <View style={styles.compensationRow}>
                  <Text style={[styles.compensationLabel, dynamicStyles.statLabel]}>Annual Cap</Text>
                  <Text style={[styles.compensationValue, dynamicStyles.cardTitle]}>{firm.capAmount}</Text>
                </View>
              )}
              {firm.fees && (
                <View style={styles.compensationRow}>
                  <Text style={[styles.compensationLabel, dynamicStyles.statLabel]}>Monthly Fees</Text>
                  <Text style={[styles.compensationValue, dynamicStyles.cardTitle]}>{firm.fees}</Text>
                </View>
              )}
              {firm.transactionFee && (
                <View style={styles.compensationRow}>
                  <Text style={[styles.compensationLabel, dynamicStyles.statLabel]}>Transaction Fee</Text>
                  <Text style={[styles.compensationValue, dynamicStyles.cardTitle]}>{firm.transactionFee}</Text>
                </View>
              )}
              <View style={styles.compensationRow}>
                <Text style={[styles.compensationLabel, dynamicStyles.statLabel]}>Leads Provided</Text>
                <View style={styles.leadsIndicator}>
                  {firm.leadsProvided ? (
                    <>
                      <CheckCircle size={16} color="#10B981" />
                      <Text style={[styles.leadsText, { color: "#10B981" }]}>Yes</Text>
                    </>
                  ) : (
                    <Text style={[styles.leadsText, { color: "#EF4444" }]}>No</Text>
                  )}
                </View>
              </View>
            </View>
          </View>

          {firm.benefits && firm.benefits.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Benefits & Perks</Text>
              {firm.benefits.map((benefit) => (
                <View key={benefit.id} style={[styles.benefitItem, dynamicStyles.card]}>
                  <View style={[styles.benefitIconContainer, dynamicStyles.badge]}>
                    {renderBenefitIcon(benefit.icon)}
                  </View>
                  <View style={styles.benefitContent}>
                    <Text style={[styles.benefitTitle, dynamicStyles.cardTitle]}>{benefit.title}</Text>
                    <Text style={[styles.benefitDescription, dynamicStyles.cardSubtitle]}>
                      {benefit.description}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {firm.trainingProgram && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Training Program</Text>
              <View style={[styles.trainingCard, dynamicStyles.card]}>
                <GraduationCap size={24} color={theme.navy} />
                <Text style={[styles.trainingText, dynamicStyles.cardSubtitle]}>
                  {firm.trainingProgram}
                </Text>
              </View>
            </View>
          )}

          {firm.techStack && firm.techStack.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Technology Stack</Text>
              <View style={styles.techChips}>
                {firm.techStack.map((tech, index) => (
                  <View key={index} style={[styles.techChip, dynamicStyles.chipContainer]}>
                    <Laptop size={14} color={theme.textSecondary} />
                    <Text style={[styles.techChipText, dynamicStyles.chipText]}>{tech}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {firm.featuredAgents && firm.featuredAgents.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Featured Agents</Text>
              {firm.featuredAgents.map((agent) => {
                const tagStyle = getAgentTagStyle(agent.tag);
                return (
                  <View key={agent.id} style={[styles.agentCard, dynamicStyles.card]}>
                    <Image
                      source={{ uri: agent.avatar }}
                      style={styles.agentAvatar}
                      contentFit="cover"
                    />
                    <View style={styles.agentInfo}>
                      <View style={styles.agentNameRow}>
                        <Text style={[styles.agentName, dynamicStyles.cardTitle]}>{agent.name}</Text>
                        {tagStyle && (
                          <View style={[styles.agentTag, { backgroundColor: tagStyle.bg }]}>
                            <Text style={[styles.agentTagText, { color: tagStyle.text }]}>
                              {tagStyle.label}
                            </Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.agentStats}>
                        <View style={styles.agentStat}>
                          <DollarSign size={12} color={theme.textSecondary} />
                          <Text style={[styles.agentStatText, dynamicStyles.cardSubtitle]}>
                            {formatPrice(agent.salesVolume)} volume
                          </Text>
                        </View>
                        <View style={styles.agentStat}>
                          <Star size={12} color="#272D53" fill="#272D53" />
                          <Text style={[styles.agentStatText, dynamicStyles.cardSubtitle]}>
                            {agent.rating}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {firm.recentDeals && firm.recentDeals.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Recent Deals</Text>
              {firm.recentDeals.map((deal, index) => (
                <View key={index} style={[styles.dealCard, dynamicStyles.card]}>
                  <View style={styles.dealInfo}>
                    <Text style={[styles.dealAddress, dynamicStyles.cardTitle]}>{deal.address}</Text>
                    <Text style={[styles.dealAgent, dynamicStyles.cardSubtitle]}>
                      Sold by {deal.agentName}
                    </Text>
                  </View>
                  <View style={styles.dealPrice}>
                    <Text style={[styles.dealPriceText, { color: "#10B981" }]}>
                      {formatPrice(deal.price)}
                    </Text>
                    <Text style={[styles.dealDate, dynamicStyles.cardSubtitle]}>
                      {new Date(deal.date).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {firm.awards && firm.awards.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Awards & Recognition</Text>
              <View style={styles.awardsContainer}>
                {firm.awards.map((award, index) => (
                  <View key={index} style={[styles.awardChip, dynamicStyles.badge]}>
                    <Award size={14} color={theme.navy} />
                    <Text style={[styles.awardText, dynamicStyles.badgeText]}>{award}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {firm.officeLocations && firm.officeLocations.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Office Locations</Text>
              <View style={styles.locationsContainer}>
                {firm.officeLocations.map((location, index) => (
                  <View key={index} style={[styles.locationChip, dynamicStyles.chipContainer]}>
                    <Building2 size={14} color={theme.textSecondary} />
                    <Text style={[styles.locationChipText, dynamicStyles.chipText]}>{location}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.contactActions}>
            <TouchableOpacity
              style={[styles.contactButton, dynamicStyles.secondaryButton]}
              onPress={handleCall}
            >
              <Phone size={18} color={theme.navy} />
              <Text style={[styles.contactButtonText, dynamicStyles.secondaryButtonText]}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.contactButton, dynamicStyles.secondaryButton]}
              onPress={handleEmail}
            >
              <Mail size={18} color={theme.navy} />
              <Text style={[styles.contactButtonText, dynamicStyles.secondaryButtonText]}>Email</Text>
            </TouchableOpacity>
            {firm.website && (
              <TouchableOpacity
                style={[styles.contactButton, dynamicStyles.secondaryButton]}
                onPress={handleWebsite}
              >
                <Globe size={18} color={theme.navy} />
                <Text style={[styles.contactButtonText, dynamicStyles.secondaryButtonText]}>Website</Text>
              </TouchableOpacity>
            )}
          </View>

          {firm.isHiring && (
            <TouchableOpacity
              style={[styles.joinButton, dynamicStyles.actionButton]}
              onPress={() => setShowJoinModal(true)}
            >
              <Send size={20} color="#FFFFFF" />
              <Text style={styles.joinButtonText}>Request to Join</Text>
            </TouchableOpacity>
          )}

          <View style={{ height: Platform.OS === "ios" ? 100 : 80 }} />
        </View>
      </ScrollView>

      <Modal
        visible={showJoinModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowJoinModal(false)}
      >
        <SafeAreaView style={[styles.modalContainer, dynamicStyles.modalContainer]}>
          <View style={[styles.modalHeader, dynamicStyles.modalHeader]}>
            <TouchableOpacity onPress={() => setShowJoinModal(false)}>
              <X size={24} color={theme.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, dynamicStyles.modalTitle]}>Request to Join</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={[styles.firmPreview, dynamicStyles.card]}>
              <Image source={{ uri: firm.logo }} style={styles.firmPreviewLogo} contentFit="cover" />
              <View style={styles.firmPreviewInfo}>
                <Text style={[styles.firmPreviewName, dynamicStyles.cardTitle]}>{firm.name}</Text>
                <Text style={[styles.firmPreviewAddress, dynamicStyles.cardSubtitle]}>
                  {firm.address}
                </Text>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>Full Name *</Text>
              <TextInput
                style={[styles.textInput, dynamicStyles.textInput]}
                value={applicationData.name}
                onChangeText={(text) => setApplicationData({ ...applicationData, name: text })}
                placeholder="Enter your full name"
                placeholderTextColor={theme.textTertiary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>Email *</Text>
              <TextInput
                style={[styles.textInput, dynamicStyles.textInput]}
                value={applicationData.email}
                onChangeText={(text) => setApplicationData({ ...applicationData, email: text })}
                placeholder="Enter your email"
                placeholderTextColor={theme.textTertiary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>Phone *</Text>
              <TextInput
                style={[styles.textInput, dynamicStyles.textInput]}
                value={applicationData.phone}
                onChangeText={(text) => setApplicationData({ ...applicationData, phone: text })}
                placeholder="Enter your phone number"
                placeholderTextColor={theme.textTertiary}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>Years of Experience</Text>
              <TextInput
                style={[styles.textInput, dynamicStyles.textInput]}
                value={applicationData.experience}
                onChangeText={(text) => setApplicationData({ ...applicationData, experience: text })}
                placeholder="e.g., 3 years"
                placeholderTextColor={theme.textTertiary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>Cover Letter / Message</Text>
              <TextInput
                style={[styles.textAreaInput, dynamicStyles.textInput]}
                value={applicationData.coverLetter}
                onChangeText={(text) => setApplicationData({ ...applicationData, coverLetter: text })}
                placeholder="Tell us why you'd like to join and what makes you a great fit..."
                placeholderTextColor={theme.textTertiary}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, dynamicStyles.actionButton]}
              onPress={handleSubmitApplication}
            >
              <Send size={20} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>Submit Application</Text>
            </TouchableOpacity>

            <Text style={[styles.privacyNote, dynamicStyles.cardSubtitle]}>
              Your information will be shared with {firm.name} for recruitment purposes.
            </Text>

            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showAnnouncementsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAnnouncementsModal(false)}
      >
        <SafeAreaView style={[styles.modalContainer, dynamicStyles.modalContainer]}>
          <View style={[styles.modalHeader, dynamicStyles.modalHeader]}>
            <TouchableOpacity onPress={() => setShowAnnouncementsModal(false)}>
              <X size={24} color={theme.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, dynamicStyles.modalTitle]}>Internal Announcements</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={[styles.announcementsSubtitle, dynamicStyles.cardSubtitle]}>
              Latest updates from {firm.name}
            </Text>

            {firm.announcements?.map((announcement) => {
              const colors = getAnnouncementColor(announcement.type);
              return (
                <View
                  key={announcement.id}
                  style={[styles.announcementItem, dynamicStyles.announcementCard]}
                >
                  <View style={styles.announcementHeader}>
                    <View style={[styles.announcementTypeTag, { backgroundColor: colors.bg }]}>
                      {getAnnouncementIcon(announcement.type)}
                      <Text style={[styles.announcementType, { color: colors.text }]}>
                        {announcement.type.charAt(0).toUpperCase() + announcement.type.slice(1)}
                      </Text>
                    </View>
                    <Text style={[styles.announcementDate, dynamicStyles.cardSubtitle]}>
                      {new Date(announcement.date).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={[styles.announcementTitle, dynamicStyles.cardTitle]}>
                    {announcement.title}
                  </Text>
                  <Text style={[styles.announcementContent, dynamicStyles.cardSubtitle]}>
                    {announcement.content}
                  </Text>
                </View>
              );
            })}

            <View style={{ height: 40 }} />
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
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  coverImageContainer: {
    height: 200,
    position: "relative",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  logoContainer: {
    position: "absolute",
    bottom: -40,
    left: 20,
  },
  firmLogo: {
    width: 80,
    height: 80,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  content: {
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  firmHeader: {
    marginBottom: 16,
  },
  firmNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  firmName: {
    fontSize: 24,
    fontWeight: "700" as const,
  },
  hiringBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  hiringText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#10B981",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 14,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    flex: 1,
  },
  foundedText: {
    fontSize: 13,
    marginTop: 4,
  },
  missionCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  missionLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  missionText: {
    fontSize: 15,
    fontStyle: "italic",
    lineHeight: 22,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  announcementBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  announcementBannerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  announcementBannerText: {
    flex: 1,
  },
  announcementBannerTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  announcementBannerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  statsCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    gap: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700" as const,
  },
  statLabel: {
    fontSize: 12,
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    height: 60,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    marginBottom: 12,
  },
  compensationCard: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  compensationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  compensationLabel: {
    fontSize: 14,
  },
  compensationValue: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  leadsIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  leadsText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    gap: 12,
  },
  benefitIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  trainingCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    borderRadius: 12,
    gap: 14,
  },
  trainingText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  techChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  techChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  techChipText: {
    fontSize: 13,
  },
  agentCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    gap: 12,
  },
  agentAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  agentInfo: {
    flex: 1,
  },
  agentNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  agentName: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  agentTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  agentTagText: {
    fontSize: 10,
    fontWeight: "600" as const,
  },
  agentStats: {
    flexDirection: "row",
    gap: 14,
  },
  agentStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  agentStatText: {
    fontSize: 12,
  },
  dealCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  dealInfo: {
    flex: 1,
  },
  dealAddress: {
    fontSize: 14,
    fontWeight: "500" as const,
    marginBottom: 4,
  },
  dealAgent: {
    fontSize: 12,
  },
  dealPrice: {
    alignItems: "flex-end",
  },
  dealPriceText: {
    fontSize: 16,
    fontWeight: "700" as const,
  },
  dealDate: {
    fontSize: 11,
    marginTop: 2,
  },
  awardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  awardChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  awardText: {
    fontSize: 13,
    fontWeight: "500" as const,
  },
  locationsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  locationChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  locationChipText: {
    fontSize: 13,
  },
  contactActions: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  contactButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  joinButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 20,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
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
  firmPreview: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
  },
  firmPreviewLogo: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  firmPreviewInfo: {
    flex: 1,
  },
  firmPreviewName: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  firmPreviewAddress: {
    fontSize: 13,
    marginTop: 2,
  },
  formGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500" as const,
    marginBottom: 8,
  },
  textInput: {
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
  },
  textAreaInput: {
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
    minHeight: 140,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 8,
    marginBottom: 12,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  privacyNote: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
  announcementsSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  announcementItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  announcementHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  announcementTypeTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  announcementType: {
    fontSize: 11,
    fontWeight: "600" as const,
    textTransform: "uppercase",
  },
  announcementDate: {
    fontSize: 12,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginBottom: 6,
  },
  announcementContent: {
    fontSize: 14,
    lineHeight: 20,
  },
});
