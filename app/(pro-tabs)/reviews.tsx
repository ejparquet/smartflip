import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Star, Quote } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useService } from "@/contexts/ServiceContext";
import { 
  mockReviews, 
  mockRealtorReviews, 
  mockLandscaperReviews,
  mockContractorReviews,
  mockPlumberReviews,
  mockElectricianReviews,
  mockInteriorDesignerReviews,
  mockPoolBuilderReviews,
  mockDumpsterReviews,
  mockPainterReviews,
} from "@/mocks/projects";
import { Professional, ProfessionalType, Review } from "@/types";

const getReviewsForType = (professionalType: ProfessionalType | undefined): Review[] => {
  switch (professionalType) {
    case "realtor":
      return mockRealtorReviews;
    case "landscaper":
      return mockLandscaperReviews;
    case "contractor":
      return mockContractorReviews;
    case "plumber":
      return mockPlumberReviews;
    case "electrician":
      return mockElectricianReviews;
    case "interior_designer":
      return mockInteriorDesignerReviews;
    case "pool_company":
      return mockPoolBuilderReviews;
    case "dumpster_service":
      return mockDumpsterReviews;
    case "painter":
      return mockPainterReviews;
    default:
      return mockReviews;
  }
};

const getSubtitleForType = (professionalType: ProfessionalType | undefined): string => {
  switch (professionalType) {
    case "realtor":
      return "What clients are saying about your real estate services";
    case "landscaper":
      return "What clients are saying about your landscaping work";
    case "contractor":
      return "What clients are saying about your contracting work";
    case "plumber":
      return "What clients are saying about your plumbing services";
    case "electrician":
      return "What clients are saying about your electrical work";
    case "painter":
      return "What clients are saying about your painting services";
    case "interior_designer":
      return "What clients are saying about your design work";
    case "pool_company":
      return "What clients are saying about your pool services";
    case "dumpster_service":
      return "What clients are saying about your hauling services";
    default:
      return "What clients are saying about you";
  }
};

export default function ReviewsScreen() {
  const { user } = useAuth();
  const { serviceConfig } = useService();
  const professional = user as Professional | null;

  const reviews = getReviewsForType(professional?.professionalType);
  const subtitle = getSubtitleForType(professional?.professionalType);
  const serviceColor = serviceConfig?.color || Colors.primary;

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            color={Colors.accent}
            fill={star <= rating ? Colors.accent : "transparent"}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Reviews</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryLeft}>
            <Text style={styles.summaryRating}>
              {professional?.rating?.toFixed(1) || "4.8"}
            </Text>
            <View style={styles.summaryStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={18}
                  color={Colors.accent}
                  fill={star <= (professional?.rating || 4.8) ? Colors.accent : "transparent"}
                />
              ))}
            </View>
            <Text style={styles.summaryCount}>
              {professional?.reviewCount || reviews.length} reviews
            </Text>
          </View>
          <View style={styles.summaryRight}>
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = reviews.filter((r) => Math.floor(r.rating) === rating).length;
              const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              return (
                <View key={rating} style={styles.ratingBar}>
                  <Text style={styles.ratingBarLabel}>{rating}</Text>
                  <View style={styles.ratingBarTrack}>
                    <View
                      style={[styles.ratingBarFill, { width: `${percentage}%` }]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {reviews.map((review) => (
          <View key={review.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.reviewerInfo}>
                <View style={styles.reviewerAvatar}>
                  <Text style={styles.reviewerInitial}>
                    {review.reviewerName.charAt(0)}
                  </Text>
                </View>
                <View>
                  <Text style={styles.reviewerName}>{review.reviewerName}</Text>
                  {review.projectName && (
                    <Text style={styles.projectName}>{review.projectName}</Text>
                  )}
                </View>
              </View>
              {renderStars(review.rating)}
            </View>
            <View style={styles.reviewContent}>
              <Quote size={16} color={Colors.textTertiary} style={styles.quoteIcon} />
              <Text style={styles.reviewText}>{review.comment}</Text>
            </View>
            <Text style={styles.reviewDate}>{review.createdAt}</Text>
          </View>
        ))}

        {reviews.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>⭐</Text>
            <Text style={styles.emptyTitle}>No Reviews Yet</Text>
            <Text style={styles.emptyText}>
              Complete jobs to start receiving reviews from clients
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    backgroundColor: Colors.surface,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "800" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  summaryCard: {
    flexDirection: "row",
    backgroundColor: Colors.surfaceSecondary,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
  },
  summaryLeft: {
    alignItems: "center",
    paddingRight: 24,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  summaryRating: {
    fontSize: 48,
    fontWeight: "800" as const,
    color: Colors.text,
  },
  summaryStars: {
    flexDirection: "row",
    gap: 2,
    marginVertical: 8,
  },
  summaryCount: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  summaryRight: {
    flex: 1,
    paddingLeft: 24,
    justifyContent: "center",
    gap: 6,
  },
  ratingBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ratingBarLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    width: 12,
  },
  ratingBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  ratingBarFill: {
    height: "100%",
    backgroundColor: Colors.accent,
    borderRadius: 3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
  },
  reviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  reviewerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary as string,
    alignItems: "center",
    justifyContent: "center",
  },
  reviewerInitial: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  reviewerName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  projectName: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 2,
  },
  reviewContent: {
    flexDirection: "row",
    marginBottom: 12,
  },
  quoteIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  reviewText: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
  reviewDate: {
    fontSize: 13,
    color: Colors.textTertiary,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
  },
});
