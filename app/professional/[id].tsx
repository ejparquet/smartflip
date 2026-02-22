import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Star,
  Phone,
  MessageCircle,
  Mail,
  ChevronLeft,
  Bell,
  Search,
  SlidersHorizontal,
  HardHat,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";
import { getProfessionalById } from "@/mocks/professionals";
import { getReviewsByProfessionalId } from "@/mocks/projects";
import { professionalTypes } from "@/mocks/professionals";

type TabType = "About" | "Experience" | "Projects" | "Reviews";

export default function ProfessionalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("About");

  const professional = getProfessionalById(id || "");
  const reviews = getReviewsByProfessionalId(id || "");

  if (!professional) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Professional not found</Text>
        </View>
      </View>
    );
  }

  const typeInfo = professionalTypes.find((t) => t.type === professional.professionalType);
  const tabs: TabType[] = ["About", "Experience", "Projects", "Reviews"];

  const handleCall = () => {
    if (professional.phone) {
      Linking.openURL(`tel:${professional.phone}`);
    }
  };

  const handleMessage = () => {
    if (professional.phone) {
      Linking.openURL(`sms:${professional.phone}`);
    }
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${professional.email}`);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "About":
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bioText}>{professional.bio}</Text>
            <TouchableOpacity>
              <Text style={styles.readMore}>Read More</Text>
            </TouchableOpacity>
          </View>
        );
      case "Experience":
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Experience</Text>
            <Text style={styles.bioText}>
              {professional.yearsExperience} years of experience in {typeInfo?.label?.toLowerCase() || "construction"}.
              Completed {professional.completedProjects}+ projects with excellent client satisfaction.
            </Text>
            <View style={styles.specialtiesGrid}>
              {professional.specialties.map((specialty, index) => (
                <View key={index} style={styles.specialtyChip}>
                  <Text style={styles.specialtyText}>{specialty}</Text>
                </View>
              ))}
            </View>
          </View>
        );
      case "Projects":
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Projects</Text>
            <View style={styles.projectsGrid}>
              {professional.portfolioImages.map((image, index) => (
                <View key={index} style={styles.projectImageContainer}>
                  <Image
                    source={{ uri: image }}
                    style={styles.projectImage}
                    contentFit="cover"
                  />
                  <Text style={styles.projectImageLabel}>
                    {index === 0 ? "15 Lakeridge Ct." : index === 1 ? "2017 Rendyn Ct." : `Project ${index + 1}`}
                  </Text>
                </View>
              ))}
            </View>
            <TouchableOpacity>
              <Text style={styles.viewMore}>View More</Text>
            </TouchableOpacity>
          </View>
        );
      case "Reviews":
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            {reviews.length === 0 ? (
              <Text style={styles.noReviews}>No reviews yet</Text>
            ) : (
              reviews.map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewerAvatar}>
                      <Text style={styles.reviewerInitial}>
                        {review.reviewerName.charAt(0)}
                      </Text>
                    </View>
                    <View style={styles.reviewerInfo}>
                      <Text style={styles.reviewerName}>{review.reviewerName}</Text>
                      <Text style={styles.reviewDate}>2 weeks ago</Text>
                    </View>
                  </View>
                  <Text style={styles.reviewText}>{review.comment}</Text>
                </View>
              ))
            )}
            <TouchableOpacity>
              <Text style={styles.viewMore}>View More</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <SafeAreaView edges={["top"]} style={styles.safeAreaTop}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoIcon}>
              <View style={styles.logoInner}>
                <View style={styles.logoArrow} />
                <View style={styles.logoHouse} />
              </View>
            </View>
            <Text style={styles.headerTitle}>Contractors</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Bell size={22} color={Colors.text} strokeWidth={1.5} />
          </TouchableOpacity>
        </View>

        <View style={styles.subHeader}>
          <BackButton />
          <View style={styles.searchBox}>
            <Search size={16} color={Colors.textTertiary} />
            <Text style={styles.searchPlaceholder}>Search</Text>
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <SlidersHorizontal size={16} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <Image
            source={{ uri: professional.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600" }}
            style={styles.heroImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(30, 42, 94, 0.9)"]}
            style={styles.heroGradient}
          />
          <View style={styles.heroContent}>
            <Text style={styles.heroName}>{professional.name}</Text>
            <View style={styles.heroRoleRow}>
              <HardHat size={14} color={Colors.success} />
              <Text style={styles.heroRole}>{typeInfo?.label}</Text>
            </View>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  color={Colors.gold}
                  fill={star <= Math.floor(professional.rating) ? Colors.gold : "transparent"}
                />
              ))}
            </View>
          </View>
        </View>

        <View style={styles.actionButtonsRow}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
            <View style={styles.actionIconContainer}>
              <Phone size={20} color={Colors.primary} />
            </View>
            <Text style={styles.actionButtonLabel}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleMessage}>
            <View style={styles.actionIconContainer}>
              <MessageCircle size={20} color={Colors.primary} />
            </View>
            <Text style={styles.actionButtonLabel}>Message</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleEmail}>
            <View style={styles.actionIconContainer}>
              <Mail size={20} color={Colors.primary} />
            </View>
            <Text style={styles.actionButtonLabel}>Email</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {renderTabContent()}

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.hireButton}
          onPress={() => router.push({ pathname: "/add-team-member", params: { professionalId: id } })}
        >
          <HardHat size={18} color={Colors.white} />
          <Text style={styles.hireButtonText}>Hire {professional.name.split(" ")[0]}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  notFoundText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  safeAreaTop: {
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  logoInner: {
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  logoArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: Colors.white,
    position: "absolute",
    top: 0,
  },
  logoHouse: {
    width: 12,
    height: 8,
    backgroundColor: Colors.white,
    position: "absolute",
    bottom: 0,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  subHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 38,
    gap: 8,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: Colors.textTertiary,
  },
  filterButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    height: 280,
    position: "relative",
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 20,
    overflow: "hidden",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  heroContent: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  heroName: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.white,
    marginBottom: 4,
  },
  heroRoleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  heroRole: {
    fontSize: 14,
    color: Colors.success,
    fontWeight: "500" as const,
  },
  starsRow: {
    flexDirection: "row",
    gap: 3,
  },
  actionButtonsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 32,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  actionButton: {
    alignItems: "center",
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 6,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  actionButtonLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  tabsContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: Colors.surface,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.text,
    fontWeight: "600" as const,
  },
  tabContent: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  bioText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 8,
  },
  readMore: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: "600" as const,
  },
  viewMore: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: "600" as const,
    marginTop: 12,
  },
  specialtiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  specialtyChip: {
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  specialtyText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  projectsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  projectImageContainer: {
    width: "47%",
  },
  projectImage: {
    width: "100%",
    height: 100,
    borderRadius: 12,
    marginBottom: 6,
  },
  projectImageLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  noReviews: {
    fontSize: 14,
    color: Colors.textTertiary,
    textAlign: "center",
    paddingVertical: 20,
  },
  reviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  reviewerInitial: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  reviewText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  bottomActions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  hireButton: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  hireButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.white,
  },
});
