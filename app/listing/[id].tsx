import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Linking,
  Platform,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Stack } from "expo-router";
import {
  ArrowLeft,
  Heart,
  Share2,
  MapPin,
  Phone,
  MessageCircle,
  Clock,
  Package,
  Tag,
  User,
  ChevronLeft,
  ChevronRight,
  Bookmark,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";
import { mockMarketplaceListings } from "@/mocks/marketplace";
import { ListingCondition } from "@/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const listing = mockMarketplaceListings.find((l) => l.id === id);

  if (!listing) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.errorContainer}>
          <Text style={styles.errorText}>Listing not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

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
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleCall = () => {
    if (listing.sellerPhone) {
      Linking.openURL(`tel:${listing.sellerPhone}`);
    }
  };

  const handleMessage = () => {
    Alert.alert("Message Seller", "This would open a chat with the seller.");
  };

  const handleShare = () => {
    Alert.alert("Share", "Share functionality would open here.");
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleImageScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentImageIndex(index);
  };

  const goToImage = (index: number) => {
    scrollViewRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Image Gallery */}
      <View style={styles.imageGalleryContainer}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleImageScroll}
          scrollEventThrottle={16}
        >
          {listing.images.map((image, index) => (
            <Image
              key={index}
              source={{ uri: image }}
              style={styles.galleryImage}
              contentFit="cover"
            />
          ))}
        </ScrollView>

        {/* Header Overlay */}
        <SafeAreaView edges={["top"]} style={styles.headerOverlay}>
          <BackButton />
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
              <Share2 size={20} color="#1F2937" strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={handleSave}>
              <Heart
                size={20}
                color={isSaved ? "#EF4444" : "#1F2937"}
                fill={isSaved ? "#EF4444" : "transparent"}
                strokeWidth={2}
              />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Image Pagination */}
        {listing.images.length > 1 && (
          <View style={styles.paginationContainer}>
            <View style={styles.pagination}>
              {listing.images.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => goToImage(index)}
                  style={[
                    styles.paginationDot,
                    currentImageIndex === index && styles.paginationDotActive,
                  ]}
                />
              ))}
            </View>
          </View>
        )}

        {/* Image Navigation */}
        {listing.images.length > 1 && (
          <>
            {currentImageIndex > 0 && (
              <TouchableOpacity
                style={[styles.imageNav, styles.imageNavLeft]}
                onPress={() => goToImage(currentImageIndex - 1)}
              >
                <ChevronLeft size={24} color="#FFFFFF" strokeWidth={2} />
              </TouchableOpacity>
            )}
            {currentImageIndex < listing.images.length - 1 && (
              <TouchableOpacity
                style={[styles.imageNav, styles.imageNavRight]}
                onPress={() => goToImage(currentImageIndex + 1)}
              >
                <ChevronRight size={24} color="#FFFFFF" strokeWidth={2} />
              </TouchableOpacity>
            )}
          </>
        )}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.contentScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Price and Condition */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatPrice(listing.price)}</Text>
          <View
            style={[
              styles.conditionBadge,
              { backgroundColor: `${conditionColors[listing.condition]}15` },
            ]}
          >
            <View
              style={[
                styles.conditionDot,
                { backgroundColor: conditionColors[listing.condition] },
              ]}
            />
            <Text
              style={[styles.conditionText, { color: conditionColors[listing.condition] }]}
            >
              {conditionLabels[listing.condition]}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>{listing.title}</Text>

        {/* Meta Info */}
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <MapPin size={16} color="#6B7280" strokeWidth={1.5} />
            <Text style={styles.metaText}>{listing.location}</Text>
          </View>
          <View style={styles.metaItem}>
            <Clock size={16} color="#6B7280" strokeWidth={1.5} />
            <Text style={styles.metaText}>Posted {formatDate(listing.createdAt)}</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Package size={20} color={Colors.navy} strokeWidth={1.5} />
            <Text style={styles.statValue}>
              {listing.quantity} {listing.unit}
            </Text>
            <Text style={styles.statLabel}>Quantity</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Tag size={20} color={Colors.navy} strokeWidth={1.5} />
            <Text style={styles.statValue}>
              {formatPrice(listing.price / listing.quantity)}
            </Text>
            <Text style={styles.statLabel}>per {listing.unit.replace(/s$/, "")}</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{listing.description}</Text>
        </View>

        {/* Original Project */}
        {listing.originalProject && (
          <View style={styles.projectBadge}>
            <Bookmark size={16} color={Colors.navy} strokeWidth={1.5} />
            <Text style={styles.projectText}>
              From project: {listing.originalProject}
            </Text>
          </View>
        )}

        {/* Seller Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seller</Text>
          <View style={styles.sellerCard}>
            <Image
              source={{
                uri:
                  listing.sellerAvatar ||
                  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80",
              }}
              style={styles.sellerAvatar}
              contentFit="cover"
            />
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>{listing.sellerName}</Text>
              <Text style={styles.sellerLocation}>{listing.location}</Text>
            </View>
            <TouchableOpacity style={styles.viewProfileButton}>
              <Text style={styles.viewProfileText}>View Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Action Bar */}
      <SafeAreaView edges={["bottom"]} style={styles.bottomBar}>
        <View style={styles.bottomBarContent}>
          <TouchableOpacity style={styles.callButton} onPress={handleCall}>
            <Phone size={20} color={Colors.navy} strokeWidth={2} />
            <Text style={styles.callButtonText}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.messageButton} onPress={handleMessage}>
            <MessageCircle size={20} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.messageButtonText}>Message Seller</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#6B7280",
    marginBottom: 16,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.navy,
    borderRadius: 10,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  imageGalleryContainer: {
    position: "relative",
    height: 320,
  },
  galleryImage: {
    width: SCREEN_WIDTH,
    height: 320,
  },
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRight: {
    flexDirection: "row",
    gap: 10,
  },
  paginationContainer: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  pagination: {
    flexDirection: "row",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  paginationDotActive: {
    backgroundColor: "#FFFFFF",
    width: 20,
  },
  imageNav: {
    position: "absolute",
    top: "50%",
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageNavLeft: {
    left: 12,
  },
  imageNavRight: {
    right: 12,
  },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  price: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: Colors.navy,
  },
  conditionBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  conditionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  conditionText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  title: {
    fontSize: 22,
    fontWeight: "600" as const,
    color: "#1F2937",
    lineHeight: 30,
    marginBottom: 12,
  },
  metaContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: "#6B7280",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 16,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginTop: 8,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 24,
  },
  projectBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
    marginBottom: 24,
  },
  projectText: {
    fontSize: 13,
    color: Colors.navy,
    fontWeight: "500" as const,
  },
  sellerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 14,
  },
  sellerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  sellerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 2,
  },
  sellerLocation: {
    fontSize: 13,
    color: "#6B7280",
  },
  viewProfileButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  viewProfileText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "#4B5563",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  bottomBarContent: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 8 : 16,
    gap: 12,
  },
  callButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.navy,
    gap: 8,
  },
  callButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.navy,
  },
  messageButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    backgroundColor: Colors.navy,
    borderRadius: 12,
    gap: 8,
    shadowColor: Colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  messageButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
});
