import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronLeft,
  Plus,
  DollarSign,
  Calendar,
  Bed,
  Bath,
  Square,
  FolderKanban,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import BackButton from "@/components/BackButton";
import { useProperties } from "@/contexts/PropertyContext";
import { useProjects } from "@/contexts/ProjectContext";
import Colors from "@/constants/colors";

export default function PropertyDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const { getPropertyById, deleteProperty } = useProperties();
  const { projects } = useProjects();
  const [refreshing, setRefreshing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const property = getPropertyById(id || "");

  const propertyProjects = useMemo(() => {
    if (!property) return [];
    return projects.filter((p) => property.projectIds.includes(p.id));
  }, [property, projects]);

  const dynamicStyles = useMemo(
    () => ({
      container: { backgroundColor: theme.background },
      card: { backgroundColor: theme.surface },
      text: { color: theme.text },
      textSecondary: { color: theme.textSecondary },
      border: { borderColor: theme.border },
    }),
    [theme]
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleDeleteProperty = () => {
    Alert.alert(
      "Delete Property",
      "Are you sure you want to delete this property? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteProperty(id || "");
              router.back();
            } catch {
              Alert.alert("Error", "Failed to delete property");
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "signed":
        return "#10B981";
      case "pending":
        return "#272D53";
      case "closed":
        return "#6B7280";
      default:
        return "#6B7280";
    }
  };

  if (!property) {
    return (
      <View style={[styles.container, dynamicStyles.container]}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <BackButton />
            <Text style={[styles.headerTitle, dynamicStyles.text]}>Property Not Found</Text>
            <View style={{ width: 40 }} />
          </View>
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, dynamicStyles.textSecondary]}>
              This property could not be found.
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.navy} />
        }
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: property.coverImage }}
            style={styles.coverImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={["rgba(0,0,0,0.5)", "transparent", "rgba(0,0,0,0.7)"]}
            locations={[0, 0.3, 1]}
            style={styles.imageOverlay}
          />
          <SafeAreaView style={styles.imageHeader}>
            <TouchableOpacity
              style={styles.imageHeaderButton}
              onPress={() => router.back()}
            >
              <ChevronLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.imageHeaderButton}
                onPress={() => setShowMenu(!showMenu)}
              >
                <MoreVertical size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          {showMenu && (
            <View style={[styles.menuDropdown, dynamicStyles.card]}>
              <TouchableOpacity style={styles.menuItem} onPress={() => setShowMenu(false)}>
                <Edit size={18} color={theme.text} />
                <Text style={[styles.menuItemText, dynamicStyles.text]}>Edit Property</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.menuItem, styles.menuItemDanger]}
                onPress={() => {
                  setShowMenu(false);
                  handleDeleteProperty();
                }}
              >
                <Trash2 size={18} color="#EF4444" />
                <Text style={[styles.menuItemText, { color: "#EF4444" }]}>Delete Property</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.imageInfo}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(property.status) },
              ]}
            >
              <Text style={styles.statusText}>
                {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
              </Text>
            </View>
            <Text style={styles.propertyAddress}>{property.address}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={[styles.priceCard, dynamicStyles.card]}>
            <View style={styles.priceRow}>
              <View style={styles.priceItem}>
                <Text style={[styles.priceLabel, dynamicStyles.textSecondary]}>
                  Purchase Price
                </Text>
                <Text style={[styles.priceValue, dynamicStyles.text]}>
                  {formatPrice(property.purchasePrice)}
                </Text>
              </View>
              <View style={styles.priceDivider} />
              <View style={styles.priceItem}>
                <Text style={[styles.priceLabel, dynamicStyles.textSecondary]}>
                  Estimated ARV
                </Text>
                <Text style={[styles.priceValue, { color: "#10B981" }]}>
                  {formatPrice(property.estimatedARV)}
                </Text>
              </View>
            </View>
            <View style={styles.potentialRow}>
              <DollarSign size={16} color="#10B981" />
              <Text style={styles.potentialText}>
                Potential Profit:{" "}
                <Text style={styles.potentialValue}>
                  {formatPrice(property.estimatedARV - property.purchasePrice)}
                </Text>
              </Text>
            </View>
          </View>

          <View style={[styles.detailsCard, dynamicStyles.card]}>
            <Text style={[styles.sectionTitle, dynamicStyles.text]}>Property Details</Text>
            <View style={styles.detailsGrid}>
              {property.bedrooms ? (
                <View style={styles.detailItem}>
                  <Bed size={20} color={theme.navy} />
                  <Text style={[styles.detailValue, dynamicStyles.text]}>
                    {property.bedrooms}
                  </Text>
                  <Text style={[styles.detailLabel, dynamicStyles.textSecondary]}>Beds</Text>
                </View>
              ) : null}
              {property.bathrooms ? (
                <View style={styles.detailItem}>
                  <Bath size={20} color={theme.navy} />
                  <Text style={[styles.detailValue, dynamicStyles.text]}>
                    {property.bathrooms}
                  </Text>
                  <Text style={[styles.detailLabel, dynamicStyles.textSecondary]}>Baths</Text>
                </View>
              ) : null}
              {property.squareFeet ? (
                <View style={styles.detailItem}>
                  <Square size={20} color={theme.navy} />
                  <Text style={[styles.detailValue, dynamicStyles.text]}>
                    {property.squareFeet.toLocaleString()}
                  </Text>
                  <Text style={[styles.detailLabel, dynamicStyles.textSecondary]}>Sq Ft</Text>
                </View>
              ) : null}
              <View style={styles.detailItem}>
                <Calendar size={20} color={theme.navy} />
                <Text style={[styles.detailValue, dynamicStyles.text]}>
                  {new Date(property.startDate).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </Text>
                <Text style={[styles.detailLabel, dynamicStyles.textSecondary]}>Start</Text>
              </View>
            </View>

            <View style={styles.descriptionSection}>
              <Text style={[styles.descriptionText, dynamicStyles.textSecondary]}>
                Beautiful 5-bedroom, 3.5 bathroom home in prime location. Needs kitchen and bathroom renovations with modern finishes.
              </Text>
            </View>
          </View>

          <View style={[styles.projectsCard, dynamicStyles.card]}>
            <View style={styles.projectsHeader}>
              <View style={styles.projectsTitleRow}>
                <FolderKanban size={20} color={theme.navy} />
                <Text style={[styles.sectionTitle, dynamicStyles.text]}>Projects</Text>
              </View>
              <TouchableOpacity
                style={styles.addProjectButton}
                onPress={() => router.push({ pathname: "/add-project", params: { propertyId: property.id } })}
              >
                <Plus size={18} color="#FFFFFF" />
                <Text style={styles.addProjectText}>Add Project</Text>
              </TouchableOpacity>
            </View>

            {propertyProjects.length === 0 ? (
              <View style={styles.emptyProjects}>
                <FolderKanban size={48} color={theme.border} />
                <Text style={[styles.emptyProjectsTitle, dynamicStyles.text]}>
                  No projects yet
                </Text>
                <Text style={[styles.emptyProjectsText, dynamicStyles.textSecondary]}>
                  Add a project to start tracking renovations for this property.
                </Text>
              </View>
            ) : (
              <View style={styles.projectsList}>
                {propertyProjects.map((project) => (
                  <TouchableOpacity
                    key={project.id}
                    style={[styles.projectItem, dynamicStyles.border]}
                    onPress={() => router.push(`/project/${project.id}`)}
                  >
                    <Image
                      source={{ uri: project.coverImage }}
                      style={styles.projectImage}
                      contentFit="cover"
                    />
                    <View style={styles.projectInfo}>
                      <Text style={[styles.projectName, dynamicStyles.text]} numberOfLines={1}>
                        {project.name}
                      </Text>
                      <View style={styles.projectMeta}>
                        <View
                          style={[
                            styles.projectStatusBadge,
                            {
                              backgroundColor:
                                project.status === "in_progress"
                                  ? "#DBEAFE"
                                  : project.status === "completed"
                                  ? "#D1FAE5"
                                  : "#E8E9EE",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.projectStatusText,
                              {
                                color:
                                  project.status === "in_progress"
                                    ? "#1D4ED8"
                                    : project.status === "completed"
                                    ? "#059669"
                                    : "#D97706",
                              },
                            ]}
                          >
                            {project.status === "in_progress"
                              ? "In Progress"
                              : project.status === "completed"
                              ? "Completed"
                              : "Planning"}
                          </Text>
                        </View>
                        <Text style={[styles.projectProgress, dynamicStyles.textSecondary]}>
                          {project.progressPercentage}%
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
  imageContainer: {
    height: 300,
    position: "relative",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  imageHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  imageHeaderButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  menuDropdown: {
    position: "absolute",
    top: 100,
    right: 16,
    borderRadius: 12,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemDanger: {
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: "500" as const,
  },
  imageInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  propertyAddress: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    lineHeight: 28,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  priceCard: {
    borderRadius: 16,
    padding: 20,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  priceItem: {
    flex: 1,
  },
  priceDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 16,
  },
  priceLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 22,
    fontWeight: "700" as const,
  },
  potentialRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  potentialText: {
    fontSize: 14,
    color: "#6B7280",
  },
  potentialValue: {
    fontWeight: "700" as const,
    color: "#10B981",
  },
  detailsCard: {
    borderRadius: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  detailItem: {
    alignItems: "center",
    gap: 6,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  detailLabel: {
    fontSize: 12,
  },
  descriptionSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 21,
  },
  projectsCard: {
    borderRadius: 16,
    padding: 20,
  },
  projectsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  projectsTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  addProjectButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.navy,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addProjectText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  emptyProjects: {
    alignItems: "center",
    paddingVertical: 30,
  },
  emptyProjectsTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginTop: 12,
    marginBottom: 6,
  },
  emptyProjectsText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  projectsList: {
    gap: 12,
  },
  projectItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  projectImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
  },
  projectInfo: {
    flex: 1,
    marginLeft: 12,
  },
  projectName: {
    fontSize: 15,
    fontWeight: "600" as const,
    marginBottom: 6,
  },
  projectMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  projectStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  projectStatusText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  projectProgress: {
    fontSize: 12,
    fontWeight: "500" as const,
  },
});
