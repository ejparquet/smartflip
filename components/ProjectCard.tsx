import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { MapPin } from "lucide-react-native";
import Colors from "@/constants/colors";
import { Project } from "@/types";

interface ProjectCardProps {
  project: Project;
  onPress: () => void;
  variant?: "default" | "compact" | "list";
}

export default function ProjectCard({ project, onPress, variant = "default" }: ProjectCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (variant === "list") {
    return (
      <TouchableOpacity
        style={styles.listContainer}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: project.coverImage || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800" }}
          style={styles.listImage}
          contentFit="cover"
        />
        <View style={styles.listContent}>
          <Text style={styles.listTitle} numberOfLines={1}>{project.name}</Text>
          <View style={styles.listAddressRow}>
            <MapPin size={12} color={Colors.textSecondary} />
            <Text style={styles.listAddress} numberOfLines={1}>{project.address}</Text>
          </View>
          <View style={styles.listProgressContainer}>
            <View style={styles.listProgressBar}>
              <View 
                style={[styles.listProgressFill, { width: `${project.progressPercentage}%` }]} 
              />
            </View>
            <Text style={styles.listProgressText}>{project.progressPercentage}%</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === "compact") {
    return (
      <TouchableOpacity
        style={styles.compactContainer}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: project.coverImage || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800" }}
          style={styles.compactImage}
          contentFit="cover"
        />
        <View style={styles.compactOverlay}>
          <Text style={styles.compactTitle} numberOfLines={1}>{project.name}</Text>
          <Text style={styles.compactAddress} numberOfLines={1}>{project.address}</Text>
          <View style={styles.compactProgressContainer}>
            <View style={styles.compactProgressBar}>
              <View 
                style={[styles.compactProgressFill, { width: `${project.progressPercentage}%` }]} 
              />
            </View>
            <Text style={styles.compactProgressText}>{project.progressPercentage}% Done</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: project.coverImage || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800" }}
        style={styles.image}
        contentFit="cover"
      />
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>{project.name}</Text>
          <Text style={styles.address} numberOfLines={1}>{project.address}</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[styles.progressFill, { width: `${project.progressPercentage}%` }]} 
              />
            </View>
            <Text style={styles.progressText}>{project.progressPercentage}% Done</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 280,
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: Colors.surface,

  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    justifyContent: "flex-end",
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.white,
    marginBottom: 2,
  },
  address: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 12,
  },
  progressContainer: {
    gap: 6,
  },
  progressBar: {
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.progressBlue,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  compactContainer: {
    width: 200,
    height: 150,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: Colors.surface,

  },
  compactImage: {
    width: "100%",
    height: "100%",
  },
  compactOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
    padding: 12,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.white,
    marginBottom: 2,
  },
  compactAddress: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 8,
  },
  compactProgressContainer: {
    gap: 4,
  },
  compactProgressBar: {
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 1.5,
    overflow: "hidden",
  },
  compactProgressFill: {
    height: "100%",
    backgroundColor: Colors.progressBlue,
    borderRadius: 1.5,
  },
  compactProgressText: {
    fontSize: 10,
    fontWeight: "500" as const,
    color: Colors.white,
  },
  listContainer: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,

  },
  listImage: {
    width: 100,
    height: 80,
  },
  listContent: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  listTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  listAddressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  listAddress: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
  },
  listProgressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  listProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.borderLight,
    borderRadius: 2,
    overflow: "hidden",
  },
  listProgressFill: {
    height: "100%",
    backgroundColor: Colors.progressBlue,
    borderRadius: 2,
  },
  listProgressText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.text,
  },
});
