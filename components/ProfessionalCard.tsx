import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Star, Phone, MessageCircle, Mail } from "lucide-react-native";
import Colors from "@/constants/colors";
import { Professional } from "@/types";
import { professionalTypes } from "@/mocks/professionals";

interface ProfessionalCardProps {
  professional: Professional;
  onPress: () => void;
  compact?: boolean;
  showActions?: boolean;
}

export default function ProfessionalCard({ 
  professional, 
  onPress, 
  compact = false,
  showActions = false 
}: ProfessionalCardProps) {
  const typeInfo = professionalTypes.find((t) => t.type === professional.professionalType);

  if (compact) {
    return (
      <TouchableOpacity style={styles.compactContainer} onPress={onPress} activeOpacity={0.8}>
        <Image
          source={{ uri: professional.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200" }}
          style={styles.compactAvatar}
          contentFit="cover"
        />
        <View style={styles.compactContent}>
          <Text style={styles.compactName} numberOfLines={1}>{professional.name}</Text>
          <Text style={styles.compactType}>{typeInfo?.label}</Text>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={10}
                color={Colors.gold}
                fill={star <= Math.floor(professional.rating) ? Colors.gold : "transparent"}
              />
            ))}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.header}>
        <Image
          source={{ uri: professional.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200" }}
          style={styles.avatar}
          contentFit="cover"
        />
        <View style={styles.headerContent}>
          <Text style={styles.name}>{professional.name}</Text>
          <Text style={styles.type}>{typeInfo?.label}</Text>
          <View style={styles.ratingContainer}>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={14}
                  color={Colors.gold}
                  fill={star <= Math.floor(professional.rating) ? Colors.gold : "transparent"}
                />
              ))}
            </View>
            <Text style={styles.ratingText}>{professional.rating.toFixed(1)}</Text>
          </View>
        </View>
        <View style={styles.projectsInfo}>
          <View style={styles.projectImages}>
            {professional.portfolioImages?.slice(0, 3).map((img, idx) => (
              <Image
                key={idx}
                source={{ uri: img }}
                style={[styles.projectThumb, { marginLeft: idx > 0 ? -8 : 0 }]}
                contentFit="cover"
              />
            ))}
          </View>
          <Text style={styles.projectsLabel}>Projects</Text>
        </View>
      </View>

      {showActions && (
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton}>
            <Phone size={18} color={Colors.primary} />
            <Text style={styles.actionText}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <MessageCircle size={18} color={Colors.primary} />
            <Text style={styles.actionText}>Message</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Mail size={18} color={Colors.primary} />
            <Text style={styles.actionText}>Email</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,

  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 2,
  },
  type: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: "500" as const,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  starsRow: {
    flexDirection: "row",
    gap: 2,
  },
  ratingRow: {
    flexDirection: "row",
    gap: 2,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.text,
  },
  projectsInfo: {
    alignItems: "center",
  },
  projectImages: {
    flexDirection: "row",
    marginBottom: 4,
  },
  projectThumb: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.white,
  },
  projectsLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  actionsRow: {
    flexDirection: "row",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    justifyContent: "space-around",
  },
  actionButton: {
    alignItems: "center",
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  compactContainer: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 10,
    marginRight: 12,
    width: 180,

  },
  compactAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 10,
  },
  compactContent: {
    flex: 1,
    justifyContent: "center",
  },
  compactName: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  compactType: {
    fontSize: 11,
    color: Colors.primary,
    marginVertical: 2,
  },
});
