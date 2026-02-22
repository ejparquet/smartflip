import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import {
  ArrowLeft,
  Star,
  MapPin,
  Phone,
  Mail,
  Hammer,
  Paintbrush,
  Droplets,
  Zap,
  Home as HomeIcon,
  TreePine,
  Palette,
  Waves,
  Truck,
  HardHat,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import BackButton from "@/components/BackButton";
import { mockProfessionals } from "@/mocks/professionals";

const serviceConfig: Record<string, { title: string; singularTitle: string; icon: any; color: string }> = {
  contractor: { title: "Contractors", singularTitle: "Contractor", icon: Hammer, color: "#3B82F6" },
  painter: { title: "Painters", singularTitle: "Painter", icon: Paintbrush, color: "#EC4899" },
  plumber: { title: "Plumbers", singularTitle: "Plumber", icon: Droplets, color: "#06B6D4" },
  electrician: { title: "Electricians", singularTitle: "Electrician", icon: Zap, color: "#272D53" },
  realtor: { title: "Realtors", singularTitle: "Realtor", icon: HomeIcon, color: "#10B981" },
  landscaper: { title: "Landscape", singularTitle: "Landscaper", icon: TreePine, color: "#22C55E" },
  interior_designer: { title: "Interior Design", singularTitle: "Interior Designer", icon: Palette, color: "#8B5CF6" },
  pool_company: { title: "Pools", singularTitle: "Pool Company", icon: Waves, color: "#0EA5E9" },
  dumpster_service: { title: "Dumper Loads", singularTitle: "Dumper Service", icon: Truck, color: "#78716C" },
  roofer: { title: "Roofing", singularTitle: "Roofer", icon: HardHat, color: "#B45309" },
};

export default function ServiceListScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: string }>();
  const { theme } = useTheme();

  const config = serviceConfig[type || "contractor"] || serviceConfig.contractor;
  const IconComponent = config.icon;

  const filteredProfessionals = useMemo(() => {
    return mockProfessionals.filter((p) => p.professionalType === type);
  }, [type]);

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={[styles.header, { backgroundColor: theme.background }]}>
          <BackButton />
          <Text style={[styles.headerTitle, { color: theme.text }]}>{config.title}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.countHeader}>
            <View style={[styles.iconBadge, { backgroundColor: `${config.color}15` }]}>
              <IconComponent size={20} color={config.color} strokeWidth={1.5} />
            </View>
            <Text style={[styles.countTitle, { color: theme.text }]}>
              {config.singularTitle}
            </Text>
            <View style={[styles.countBadge, { backgroundColor: theme.navy }]}>
              <Text style={styles.countText}>{filteredProfessionals.length}</Text>
            </View>
          </View>

          {filteredProfessionals.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: theme.surface }]}>
              <IconComponent size={48} color={theme.textTertiary} strokeWidth={1} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No {config.title} Yet</Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                Add your first {config.singularTitle.toLowerCase()} to see them here
              </Text>
            </View>
          ) : (
            filteredProfessionals.map((professional) => (
              <TouchableOpacity
                key={professional.id}
                style={[styles.professionalCard, { backgroundColor: theme.surface }]}
                onPress={() => router.push(`/professional/${professional.id}`)}
                activeOpacity={0.7}
              >
                <Image
                  source={{ uri: professional.avatar }}
                  style={styles.avatar}
                  contentFit="cover"
                />
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Text style={[styles.name, { color: theme.text }]}>{professional.name}</Text>
                    <View style={styles.ratingContainer}>
                      <Star size={14} color="#272D53" fill="#272D53" />
                      <Text style={[styles.rating, { color: theme.text }]}>
                        {professional.rating.toFixed(1)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.specialtyRow}>
                    <View style={[styles.specialtyBadge, { backgroundColor: `${config.color}15` }]}>
                      <IconComponent size={12} color={config.color} strokeWidth={1.5} />
                      <Text style={[styles.specialtyText, { color: config.color }]}>
                        {config.singularTitle}
                      </Text>
                    </View>
                    {professional.yearsExperience && (
                      <Text style={[styles.experience, { color: theme.textSecondary }]}>
                        {professional.yearsExperience} years exp.
                      </Text>
                    )}
                  </View>

                  {professional.city && professional.state && (
                    <View style={styles.locationRow}>
                      <MapPin size={14} color={theme.textTertiary} strokeWidth={1.5} />
                      <Text style={[styles.location, { color: theme.textSecondary }]} numberOfLines={1}>
                        {professional.city}, {professional.state}
                      </Text>
                    </View>
                  )}

                  <View style={styles.statsRow}>
                    <Text style={[styles.stat, { color: theme.textTertiary }]}>
                      {professional.completedProjects}+ projects
                    </Text>
                    <Text style={[styles.statDivider, { color: theme.border }]}>•</Text>
                    <Text style={[styles.stat, { color: theme.textTertiary }]}>
                      {professional.reviewCount} reviews
                    </Text>
                  </View>

                  <View style={styles.actionsRow}>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: theme.surfaceSecondary }]}
                      onPress={() => professional.phone && handleCall(professional.phone)}
                    >
                      <Phone size={16} color={theme.navy} strokeWidth={1.5} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: theme.surfaceSecondary }]}
                      onPress={() => professional.email && handleEmail(professional.email)}
                    >
                      <Mail size={16} color={theme.navy} strokeWidth={1.5} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.viewButton, { backgroundColor: theme.navy }]}
                      onPress={() => router.push(`/professional/${professional.id}`)}
                    >
                      <Text style={styles.viewButtonText}>View Profile</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}

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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  countHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  countTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    flex: 1,
  },
  countBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    borderRadius: 16,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  professionalCard: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  cardContent: {
    flex: 1,
    marginLeft: 14,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: "600" as const,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  specialtyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  specialtyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  specialtyText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  experience: {
    fontSize: 12,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  location: {
    fontSize: 12,
    flex: 1,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  stat: {
    fontSize: 12,
  },
  statDivider: {
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  viewButton: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  viewButtonText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
});
