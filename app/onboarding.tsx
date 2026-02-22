import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, Bell, SlidersHorizontal, HardHat, Paintbrush, Droplets, Zap, Star, ChevronRight } from "lucide-react-native";
import Colors from "@/constants/colors";

const { width, height } = Dimensions.get("window");

const onboardingSlides = [
  {
    id: 1,
    title: "All of your project\ninformation in one\nplace",
    type: "phone",
  },
  {
    id: 2,
    title: "Track your projects",
    type: "tags",
    tags: ["Construction", "Timelines", "Renovations", "Purchases"],
  },
  {
    id: 3,
    title: "Store important\ndocuments",
    type: "documents",
    tags: ["Properties", "Contracts", "Agreements", "Contacts"],
  },
  {
    id: 4,
    title: "Handyman contacts\nin one place",
    type: "contacts",
    avatars: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&q=80",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80",
    ],
  },
  {
    id: 5,
    title: "Get started",
    type: "final",
  },
];

function PhoneMockup() {
  return (
    <View style={styles.phoneMockup}>
      <View style={styles.phoneNotch} />
      <View style={styles.phoneScreen}>
        <View style={styles.mockAppHeader}>
          <View style={styles.mockLogoIcon}>
            <View style={styles.mockLogoInner} />
          </View>
          <Bell size={18} color={Colors.text} strokeWidth={1.5} />
        </View>
        
        <View style={styles.mockSearchContainer}>
          <View style={styles.mockSearchBox}>
            <Search size={14} color={Colors.textTertiary} />
            <Text style={styles.mockSearchText}>Search</Text>
          </View>
          <View style={styles.mockFilterIcon}>
            <SlidersHorizontal size={12} color={Colors.primary} />
          </View>
        </View>

        <Text style={styles.mockSectionTitle}>Projects</Text>
        <View style={styles.mockTabs}>
          <View style={styles.mockTabActive}><Text style={styles.mockTabTextActive}>All</Text></View>
          <View style={styles.mockTab}><Text style={styles.mockTabText}>Active projects</Text></View>
          <View style={styles.mockTab}><Text style={styles.mockTabText}>Upcoming projects</Text></View>
        </View>

        <View style={styles.mockProjectCard}>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=300&q=80" }}
            style={styles.mockProjectImage}
            contentFit="cover"
          />
          <View style={styles.mockProjectInfo}>
            <Text style={styles.mockProjectName}>My Home</Text>
            <Text style={styles.mockProjectAddress}>2817 Rendyn Ct. Midlothian TX</Text>
            <View style={styles.mockProgressBar}>
              <View style={styles.mockProgressFill} />
            </View>
            <Text style={styles.mockProgressText}>75% Done</Text>
          </View>
        </View>

        <Text style={styles.mockSectionTitle}>Services</Text>
        <View style={styles.mockServices}>
          <View style={styles.mockServiceItem}>
            <View style={styles.mockServiceIcon}><HardHat size={16} color={Colors.primary} strokeWidth={1.5} /></View>
            <Text style={styles.mockServiceText}>Contractors</Text>
          </View>
          <View style={styles.mockServiceItem}>
            <View style={styles.mockServiceIcon}><Paintbrush size={16} color={Colors.primary} strokeWidth={1.5} /></View>
            <Text style={styles.mockServiceText}>Painters</Text>
          </View>
          <View style={styles.mockServiceItem}>
            <View style={styles.mockServiceIcon}><Droplets size={16} color={Colors.primary} strokeWidth={1.5} /></View>
            <Text style={styles.mockServiceText}>Plumbers</Text>
          </View>
          <View style={styles.mockServiceItem}>
            <View style={styles.mockServiceIcon}><Zap size={16} color={Colors.primary} strokeWidth={1.5} /></View>
            <Text style={styles.mockServiceText}>Electricians</Text>
          </View>
        </View>

        <View style={styles.mockTeamHeader}>
          <Text style={styles.mockSectionTitle}>My Team</Text>
          <ChevronRight size={14} color={Colors.textSecondary} />
        </View>
        <View style={styles.mockTeamCard}>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80" }}
            style={styles.mockTeamAvatar}
            contentFit="cover"
          />
          <View style={styles.mockTeamInfo}>
            <Text style={styles.mockTeamName}>James Smith</Text>
            <View style={styles.mockTeamRoleRow}>
              <HardHat size={10} color={Colors.primary} />
              <Text style={styles.mockTeamRole}>Contractor</Text>
            </View>
            <View style={styles.mockStarsRow}>
              {[1,2,3,4,5].map(i => <Star key={i} size={10} color={Colors.gold} fill={Colors.gold} />)}
            </View>
          </View>
          <View style={styles.mockProjectsStack}>
            <View style={styles.mockProjectThumbStack}>
              {[0,1,2].map((i) => (
                <Image
                  key={i}
                  source={{ uri: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=100&q=80" }}
                  style={[styles.mockProjectThumb, { marginLeft: i > 0 ? -4 : 0, zIndex: 3-i }]}
                  contentFit="cover"
                />
              ))}
            </View>
            <Text style={styles.mockProjectsLabel}>3+ Projects</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function PhoneMockupSmall() {
  return (
    <View style={styles.phoneMockupSmall}>
      <View style={styles.phoneNotchSmall} />
      <View style={styles.phoneScreenSmall}>
        <View style={styles.mockAppHeaderSmall}>
          <View style={styles.mockLogoIconSmall} />
          <Bell size={12} color={Colors.text} strokeWidth={1.5} />
        </View>
        <View style={styles.mockSearchBoxSmall}>
          <Search size={10} color={Colors.textTertiary} />
          <Text style={styles.mockSearchTextSmall}>Search</Text>
        </View>
        <Text style={styles.mockSectionTitleSmall}>Projects</Text>
        <View style={styles.mockTabsSmall}>
          <View style={styles.mockTabActiveSmall}><Text style={styles.mockTabTextActiveSmall}>All</Text></View>
          <View style={styles.mockTabSmall}><Text style={styles.mockTabTextSmall}>Active projects</Text></View>
          <View style={styles.mockTabSmall}><Text style={styles.mockTabTextSmall}>Upcoming projects</Text></View>
        </View>
        <View style={styles.mockProjectCardSmall}>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200&q=80" }}
            style={styles.mockProjectImageSmall}
            contentFit="cover"
          />
          <View style={styles.mockProjectInfoSmall}>
            <Text style={styles.mockProjectNameSmall}>My Home</Text>
            <Text style={styles.mockProjectAddressSmall}>2817 Rendyn Ct. Midlothian TX</Text>
            <View style={styles.mockProgressBarSmall}><View style={styles.mockProgressFillSmall} /></View>
            <Text style={styles.mockProgressTextSmall}>75% Done</Text>
          </View>
        </View>
        <Text style={styles.mockSectionTitleSmall}>Services</Text>
        <View style={styles.mockServicesSmall}>
          {["Contractors", "Painters", "Plumbers", "Electricians"].map(s => (
            <View key={s} style={styles.mockServiceItemSmall}>
              <View style={styles.mockServiceIconSmall} />
              <Text style={styles.mockServiceTextSmall}>{s}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.mockSectionTitleSmall}>My Team</Text>
        <View style={styles.mockTeamCardSmall}>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80" }}
            style={styles.mockTeamAvatarSmall}
            contentFit="cover"
          />
          <View style={styles.mockTeamInfoSmall}>
            <Text style={styles.mockTeamNameSmall}>James Smith</Text>
            <Text style={styles.mockTeamRoleSmall}>Contractor</Text>
            <Text style={styles.mockStarsSmall}>★★★★★</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < onboardingSlides.length - 1) {
      scrollViewRef.current?.scrollTo({
        x: (currentIndex + 1) * width,
        animated: true,
      });
      setCurrentIndex(currentIndex + 1);
    } else {
      router.push("/signup");
    }
  };

  const renderSlide = (slide: typeof onboardingSlides[0]) => {
    if (slide.type === "phone") {
      return (
        <View key={slide.id} style={styles.slide}>
          <Text style={styles.slideTitle}>{slide.title}</Text>
          <View style={styles.phoneContainer}>
            <PhoneMockup />
          </View>
        </View>
      );
    }

    if (slide.type === "tags") {
      return (
        <View key={slide.id} style={styles.slide}>
          <Text style={styles.slideTitle}>{slide.title}</Text>
          <View style={styles.tagsContainer}>
            <View style={[styles.floatingTag, styles.tagTopRight]}>
              <Text style={styles.tagText}>Timelines</Text>
            </View>
            <View style={[styles.floatingTag, styles.tagTopLeft]}>
              <Text style={styles.tagText}>Construction</Text>
            </View>
            <View style={styles.isometricPhoneContainer}>
              <View style={styles.isometricPhone}>
                <View style={styles.isometricPhoneFrame}>
                  <Image
                    source={{ uri: "https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=800&q=80" }}
                    style={styles.isometricMapImage}
                    contentFit="cover"
                  />
                </View>
              </View>
            </View>
            <View style={[styles.floatingTag, styles.tagBottomRight]}>
              <Text style={styles.tagText}>Renovations</Text>
            </View>
            <View style={[styles.floatingTag, styles.tagBottomLeft]}>
              <Text style={styles.tagText}>Purchases</Text>
            </View>
          </View>
        </View>
      );
    }

    if (slide.type === "documents") {
      return (
        <View key={slide.id} style={styles.slide}>
          <Text style={styles.slideTitle}>{slide.title}</Text>
          <View style={styles.documentsContainer}>
            <View style={[styles.floatingTag, styles.docTagTopRight]}>
              <Text style={styles.tagText}>Contracts</Text>
            </View>
            <View style={[styles.floatingTag, styles.docTagTopLeft]}>
              <Text style={styles.tagText}>Properties</Text>
            </View>
            <PhoneMockupSmall />
            <View style={[styles.floatingTag, styles.docTagBottomRight]}>
              <Text style={styles.tagText}>Agreements</Text>
            </View>
            <View style={[styles.floatingTag, styles.docTagBottomLeft]}>
              <Text style={styles.tagText}>Contacts</Text>
            </View>
          </View>
        </View>
      );
    }

    if (slide.type === "contacts") {
      return (
        <View key={slide.id} style={styles.slide}>
          <Text style={styles.slideTitle}>{slide.title}</Text>
          <View style={styles.contactsContainer}>
            <View style={[styles.avatarCircle, styles.avatarTopLeft]}>
              <Image source={{ uri: slide.avatars?.[0] }} style={styles.avatarImage} contentFit="cover" />
            </View>
            <View style={[styles.avatarCircle, styles.avatarTopRight]}>
              <Image source={{ uri: slide.avatars?.[1] }} style={styles.avatarImage} contentFit="cover" />
            </View>
            <PhoneMockupSmall />
            <View style={[styles.avatarCircle, styles.avatarMiddleLeft]}>
              <Image source={{ uri: slide.avatars?.[2] }} style={styles.avatarImage} contentFit="cover" />
            </View>
            <View style={[styles.avatarCircle, styles.avatarMiddleRight]}>
              <Image source={{ uri: slide.avatars?.[3] }} style={styles.avatarImage} contentFit="cover" />
            </View>
            <View style={[styles.avatarCircle, styles.avatarBottom]}>
              <Image source={{ uri: slide.avatars?.[4] }} style={styles.avatarImage} contentFit="cover" />
            </View>
          </View>
        </View>
      );
    }

    return (
      <View key={slide.id} style={styles.slide}>
        <Text style={styles.slideTitle}>{slide.title}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.scrollView}
        >
          {onboardingSlides.map((slide) => renderSlide(slide))}
        </ScrollView>

        <View style={styles.bottomContainer}>
          <View style={styles.pagination}>
            {onboardingSlides.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  currentIndex === index && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>

          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>
              {currentIndex === onboardingSlides.length - 1 ? "Done" : "Next"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width: width,
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 50,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: "600" as const,
    color: Colors.primary,
    textAlign: "center",
    lineHeight: 38,
    marginBottom: 20,
  },
  phoneContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  phoneMockup: {
    width: width * 0.58,
    height: height * 0.52,
    backgroundColor: "#1a1a1a",
    borderRadius: 36,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 15,
  },
  phoneNotch: {
    position: "absolute",
    top: 8,
    left: "50%",
    marginLeft: -40,
    width: 80,
    height: 24,
    backgroundColor: "#1a1a1a",
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    zIndex: 10,
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 28,
    padding: 12,
    paddingTop: 28,
    overflow: "hidden",
  },
  mockAppHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  mockLogoIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  mockLogoInner: {
    width: 12,
    height: 12,
    backgroundColor: Colors.white,
    borderRadius: 2,
  },
  mockSearchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  mockSearchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  mockSearchText: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
  mockFilterIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  mockSectionTitle: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  mockTabs: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 10,
  },
  mockTab: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSecondary,
  },
  mockTabActive: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  mockTabText: {
    fontSize: 8,
    color: Colors.textSecondary,
  },
  mockTabTextActive: {
    fontSize: 8,
    color: Colors.white,
  },
  mockProjectCard: {
    flexDirection: "row",
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 10,
    padding: 8,
    marginBottom: 12,
  },
  mockProjectImage: {
    width: 55,
    height: 55,
    borderRadius: 8,
  },
  mockProjectInfo: {
    flex: 1,
    marginLeft: 10,
    justifyContent: "center",
  },
  mockProjectName: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  mockProjectAddress: {
    fontSize: 8,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  mockProgressBar: {
    height: 5,
    backgroundColor: Colors.border,
    borderRadius: 2.5,
    marginBottom: 3,
  },
  mockProgressFill: {
    width: "75%",
    height: "100%",
    backgroundColor: Colors.progressBlue,
    borderRadius: 2.5,
  },
  mockProgressText: {
    fontSize: 8,
    color: Colors.textSecondary,
  },
  mockServices: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  mockServiceItem: {
    alignItems: "center",
  },
  mockServiceIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mockServiceText: {
    fontSize: 7,
    color: Colors.textSecondary,
  },
  mockTeamHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  mockTeamCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 10,
    padding: 8,
  },
  mockTeamAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  mockTeamInfo: {
    flex: 1,
    marginLeft: 8,
  },
  mockTeamName: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  mockTeamRoleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginVertical: 2,
  },
  mockTeamRole: {
    fontSize: 8,
    color: Colors.primary,
  },
  mockStarsRow: {
    flexDirection: "row",
    gap: 1,
  },
  mockProjectsStack: {
    alignItems: "center",
  },
  mockProjectThumbStack: {
    flexDirection: "row",
    marginBottom: 2,
  },
  mockProjectThumb: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.white,
  },
  mockProjectsLabel: {
    fontSize: 7,
    color: Colors.textSecondary,
  },
  phoneMockupSmall: {
    width: width * 0.5,
    height: height * 0.42,
    backgroundColor: "#1a1a1a",
    borderRadius: 32,
    padding: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  phoneNotchSmall: {
    position: "absolute",
    top: 6,
    left: "50%",
    marginLeft: -30,
    width: 60,
    height: 18,
    backgroundColor: "#1a1a1a",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    zIndex: 10,
  },
  phoneScreenSmall: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 26,
    padding: 10,
    paddingTop: 22,
    overflow: "hidden",
  },
  mockAppHeaderSmall: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  mockLogoIconSmall: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  mockSearchBoxSmall: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
    marginBottom: 8,
  },
  mockSearchTextSmall: {
    fontSize: 8,
    color: Colors.textTertiary,
  },
  mockSectionTitleSmall: {
    fontSize: 9,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 6,
  },
  mockTabsSmall: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 8,
  },
  mockTabSmall: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSecondary,
  },
  mockTabActiveSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: Colors.primary,
  },
  mockTabTextSmall: {
    fontSize: 6,
    color: Colors.textSecondary,
  },
  mockTabTextActiveSmall: {
    fontSize: 6,
    color: Colors.white,
  },
  mockProjectCardSmall: {
    flexDirection: "row",
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 8,
    padding: 6,
    marginBottom: 8,
  },
  mockProjectImageSmall: {
    width: 40,
    height: 40,
    borderRadius: 6,
  },
  mockProjectInfoSmall: {
    flex: 1,
    marginLeft: 8,
    justifyContent: "center",
  },
  mockProjectNameSmall: {
    fontSize: 8,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  mockProjectAddressSmall: {
    fontSize: 6,
    color: Colors.textSecondary,
    marginBottom: 3,
  },
  mockProgressBarSmall: {
    height: 3,
    backgroundColor: Colors.border,
    borderRadius: 1.5,
    marginBottom: 2,
  },
  mockProgressFillSmall: {
    width: "75%",
    height: "100%",
    backgroundColor: Colors.progressBlue,
    borderRadius: 1.5,
  },
  mockProgressTextSmall: {
    fontSize: 6,
    color: Colors.textSecondary,
  },
  mockServicesSmall: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  mockServiceItemSmall: {
    alignItems: "center",
  },
  mockServiceIconSmall: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: Colors.surfaceSecondary,
    marginBottom: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mockServiceTextSmall: {
    fontSize: 5,
    color: Colors.textSecondary,
  },
  mockTeamCardSmall: {
    flexDirection: "row",
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 6,
    padding: 6,
  },
  mockTeamAvatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
  mockTeamInfoSmall: {
    marginLeft: 6,
    justifyContent: "center",
  },
  mockTeamNameSmall: {
    fontSize: 7,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  mockTeamRoleSmall: {
    fontSize: 6,
    color: Colors.textSecondary,
  },
  mockStarsSmall: {
    fontSize: 6,
    color: Colors.gold,
  },
  tagsContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  floatingTag: {
    position: "absolute",
    backgroundColor: "#2D3748",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    zIndex: 10,
  },
  tagText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  tagTopRight: {
    top: 20,
    right: 20,
  },
  tagTopLeft: {
    top: 80,
    left: 0,
  },
  tagBottomRight: {
    bottom: 160,
    right: 0,
  },
  tagBottomLeft: {
    bottom: 100,
    left: 30,
  },
  isometricPhoneContainer: {
    width: width * 0.9,
    height: height * 0.35,
    alignItems: "center",
    justifyContent: "center",
  },
  isometricPhone: {
    width: width * 0.85,
    height: height * 0.32,
    transform: [{ perspective: 1200 }, { rotateX: "25deg" }, { rotateZ: "-5deg" }],
  },
  isometricPhoneFrame: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    borderRadius: 28,
    padding: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.35,
    shadowRadius: 30,
    elevation: 20,
    overflow: "hidden",
  },
  isometricMapImage: {
    flex: 1,
    borderRadius: 22,
  },
  documentsContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  docTagTopRight: {
    top: 50,
    right: -15,
  },
  docTagTopLeft: {
    top: 110,
    left: -25,
  },
  docTagBottomRight: {
    bottom: 130,
    right: -25,
  },
  docTagBottomLeft: {
    bottom: 90,
    left: -15,
  },
  contactsContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  avatarCircle: {
    position: "absolute",
    width: 75,
    height: 75,
    borderRadius: 37.5,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: Colors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarTopLeft: {
    top: 30,
    left: 20,
  },
  avatarTopRight: {
    top: 10,
    right: 40,
  },
  avatarMiddleLeft: {
    top: "40%",
    left: -5,
  },
  avatarMiddleRight: {
    top: "35%",
    right: -5,
  },
  avatarBottom: {
    bottom: 100,
    right: 50,
  },
  bottomContainer: {
    paddingHorizontal: 28,
    paddingBottom: 30,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    gap: 12,
  },
  paginationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#E0E0E0",
  },
  paginationDotActive: {
    width: 45,
    backgroundColor: Colors.primary,
  },
  nextButton: {
    backgroundColor: "#F0F0F0",
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: "center",
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: "500" as const,
    color: Colors.text,
  },
});
