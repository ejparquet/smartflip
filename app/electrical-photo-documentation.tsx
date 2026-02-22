import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Dimensions,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import {
  ArrowLeft,
  Plus,
  Camera,
  Search,
  X,
  Filter,
  Calendar,
  User,
  MapPin,
  ChevronRight,
  Zap,
  CircuitBoard,
  Lightbulb,
  Image as ImageIcon,
  Folder,
  Grid3X3,
  List,
  Download,
  Share2,
  Trash2,
  Tag,
  Clock,
  Eye,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";

const { width } = Dimensions.get("window");
const GRID_SIZE = (width - 48) / 3;

type PhotoCategory = "before" | "after" | "in_progress" | "existing_conditions" | "issue" | "completed";
type JobType = "panel" | "wiring" | "outlet" | "lighting" | "ev_charger" | "inspection" | "other";

interface Photo {
  id: string;
  uri: string;
  category: PhotoCategory;
  caption?: string;
  tags?: string[];
  timestamp: string;
}

interface PhotoProject {
  id: string;
  jobId: string;
  jobType: JobType;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  address: string;
  description: string;
  photos: Photo[];
  createdAt: string;
  updatedAt: string;
}

const mockProjects: PhotoProject[] = [
  {
    id: "1",
    jobId: "J-2024-001",
    jobType: "panel",
    customerId: "c1",
    customerName: "David Thompson",
    customerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
    address: "1234 Tech Park Dr, Austin, TX",
    description: "200A Panel Upgrade - Before/After Documentation",
    photos: [
      { id: "p1", uri: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400", category: "before", caption: "Original 100A Federal Pacific panel", timestamp: "2024-06-14T09:30:00Z", tags: ["panel", "federal pacific", "outdated"] },
      { id: "p2", uri: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400", category: "existing_conditions", caption: "Existing wiring conditions - double tapped breakers", timestamp: "2024-06-14T09:35:00Z", tags: ["wiring", "code violation"] },
      { id: "p3", uri: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", category: "in_progress", caption: "New Square D panel installed", timestamp: "2024-06-15T14:20:00Z", tags: ["panel", "square d"] },
      { id: "p4", uri: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400", category: "after", caption: "Completed 200A service - all circuits labeled", timestamp: "2024-06-15T17:00:00Z", tags: ["panel", "completed", "labeled"] },
    ],
    createdAt: "2024-06-14T09:00:00Z",
    updatedAt: "2024-06-15T17:00:00Z",
  },
  {
    id: "2",
    jobId: "J-2024-015",
    jobType: "ev_charger",
    customerId: "c2",
    customerName: "Sarah Martinez",
    address: "567 Office Plaza, Round Rock, TX",
    description: "Tesla Wall Connector Installation",
    photos: [
      { id: "p5", uri: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400", category: "before", caption: "Garage wall before installation", timestamp: "2024-08-20T08:00:00Z", tags: ["garage", "wall"] },
      { id: "p6", uri: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", category: "in_progress", caption: "50A circuit run from panel", timestamp: "2024-08-20T11:30:00Z", tags: ["wiring", "circuit"] },
      { id: "p7", uri: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400", category: "after", caption: "Tesla Wall Connector installed and operational", timestamp: "2024-08-20T15:00:00Z", tags: ["ev charger", "tesla", "completed"] },
    ],
    createdAt: "2024-08-20T08:00:00Z",
    updatedAt: "2024-08-20T15:00:00Z",
  },
  {
    id: "3",
    jobId: "J-2024-022",
    jobType: "lighting",
    customerId: "c3",
    customerName: "Michael Chen",
    address: "890 Cedar Lane, Cedar Park, TX",
    description: "Recessed Lighting Installation - Living Room & Kitchen",
    photos: [
      { id: "p8", uri: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400", category: "before", caption: "Original ceiling fixtures", timestamp: "2024-09-05T09:00:00Z", tags: ["lighting", "original"] },
      { id: "p9", uri: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400", category: "in_progress", caption: "Holes cut for recessed cans", timestamp: "2024-09-05T12:00:00Z", tags: ["lighting", "installation"] },
      { id: "p10", uri: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400", category: "after", caption: "12 LED recessed lights installed", timestamp: "2024-09-05T16:30:00Z", tags: ["lighting", "led", "completed"] },
    ],
    createdAt: "2024-09-05T09:00:00Z",
    updatedAt: "2024-09-05T16:30:00Z",
  },
  {
    id: "4",
    jobId: "J-2024-028",
    jobType: "wiring",
    customerId: "c4",
    customerName: "Jennifer Wilson",
    customerAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200",
    address: "234 Pine Ave, Austin, TX",
    description: "Kitchen GFCI Circuit Repair",
    photos: [
      { id: "p11", uri: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", category: "issue", caption: "Burnt GFCI outlet - arcing damage", timestamp: "2024-09-10T10:00:00Z", tags: ["gfci", "damage", "arcing"] },
      { id: "p12", uri: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", category: "existing_conditions", caption: "Backstabbed connections - fire hazard", timestamp: "2024-09-10T10:15:00Z", tags: ["wiring", "hazard", "backstab"] },
      { id: "p13", uri: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", category: "after", caption: "New GFCI with proper side-wired connections", timestamp: "2024-09-10T11:30:00Z", tags: ["gfci", "repair", "completed"] },
    ],
    createdAt: "2024-09-10T10:00:00Z",
    updatedAt: "2024-09-10T11:30:00Z",
  },
];

const categoryConfig: Record<PhotoCategory, { label: string; color: string; bgColor: string }> = {
  before: { label: "Before", color: "#272D53", bgColor: "#E8E9EE" },
  after: { label: "After", color: "#22C55E", bgColor: "#DCFCE7" },
  in_progress: { label: "In Progress", color: "#3B82F6", bgColor: "#DBEAFE" },
  existing_conditions: { label: "Existing", color: "#8B5CF6", bgColor: "#EDE9FE" },
  issue: { label: "Issue", color: "#DC2626", bgColor: "#FEE2E2" },
  completed: { label: "Completed", color: "#22C55E", bgColor: "#DCFCE7" },
};

const jobTypeConfig: Record<JobType, { label: string; icon: any; color: string }> = {
  panel: { label: "Panel", icon: CircuitBoard, color: "#EF4444" },
  wiring: { label: "Wiring", icon: Zap, color: "#272D53" },
  outlet: { label: "Outlet", icon: Zap, color: "#3B82F6" },
  lighting: { label: "Lighting", icon: Lightbulb, color: "#FBBF24" },
  ev_charger: { label: "EV Charger", icon: Zap, color: "#10B981" },
  inspection: { label: "Inspection", icon: Eye, color: "#8B5CF6" },
  other: { label: "Other", icon: Folder, color: "#6B7280" },
};

export default function ElectricalPhotoDocumentationScreen() {
  const router = useRouter();
  const [projects, setProjects] = useState<PhotoProject[]>(mockProjects);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProject, setSelectedProject] = useState<PhotoProject | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [selectedCategory, setSelectedCategory] = useState<PhotoCategory | "all">("all");

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.jobId.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [projects, searchQuery]);

  const stats = useMemo(() => {
    const totalPhotos = projects.reduce((sum, p) => sum + p.photos.length, 0);
    const beforeAfterPairs = projects.filter(
      (p) => p.photos.some((ph) => ph.category === "before") && p.photos.some((ph) => ph.category === "after")
    ).length;
    return { totalProjects: projects.length, totalPhotos, beforeAfterPairs };
  }, [projects]);

  const filteredPhotos = useMemo(() => {
    if (!selectedProject) return [];
    if (selectedCategory === "all") return selectedProject.photos;
    return selectedProject.photos.filter((p) => p.category === selectedCategory);
  }, [selectedProject, selectedCategory]);

  const handleShareProject = useCallback((project: PhotoProject) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Share Documentation",
      "Choose how to share this project's photos:",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Generate PDF", onPress: () => Alert.alert("Exported", "PDF report generated") },
        { text: "Share Link", onPress: () => Alert.alert("Shared", "Share link copied to clipboard") },
      ]
    );
  }, []);

  const handleDeletePhoto = useCallback((photoId: string) => {
    Alert.alert(
      "Delete Photo",
      "Are you sure you want to delete this photo?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            if (selectedProject) {
              setProjects((prev) =>
                prev.map((p) =>
                  p.id === selectedProject.id
                    ? { ...p, photos: p.photos.filter((ph) => ph.id !== photoId) }
                    : p
                )
              );
              setSelectedProject((prev) =>
                prev ? { ...prev, photos: prev.photos.filter((ph) => ph.id !== photoId) } : null
              );
            }
            setSelectedPhoto(null);
          },
        },
      ]
    );
  }, [selectedProject]);

  const handleAddPhoto = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Add Photo",
      "Choose photo source:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Take Photo",
          onPress: () => {
            Alert.alert(
              "Select Category",
              "What type of photo is this?",
              [
                { text: "Before", onPress: () => addMockPhoto("before") },
                { text: "After", onPress: () => addMockPhoto("after") },
                { text: "In Progress", onPress: () => addMockPhoto("in_progress") },
                { text: "Issue", onPress: () => addMockPhoto("issue") },
                { text: "Cancel", style: "cancel" },
              ]
            );
          },
        },
        {
          text: "Choose from Library",
          onPress: () => {
            Alert.alert(
              "Select Category",
              "What type of photo is this?",
              [
                { text: "Before", onPress: () => addMockPhoto("before") },
                { text: "After", onPress: () => addMockPhoto("after") },
                { text: "In Progress", onPress: () => addMockPhoto("in_progress") },
                { text: "Issue", onPress: () => addMockPhoto("issue") },
                { text: "Cancel", style: "cancel" },
              ]
            );
          },
        },
      ]
    );
  }, []);

  const addMockPhoto = useCallback((category: PhotoCategory) => {
    const newPhoto: Photo = {
      id: `p${Date.now()}`,
      uri: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
      category,
      caption: `New ${category.replace("_", " ")} photo`,
      timestamp: new Date().toISOString(),
      tags: ["electrical", category],
    };

    if (selectedProject) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === selectedProject.id
            ? { ...p, photos: [...p.photos, newPhoto], updatedAt: new Date().toISOString() }
            : p
        )
      );
      setSelectedProject((prev) =>
        prev ? { ...prev, photos: [...prev.photos, newPhoto] } : null
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", "Photo added to project!");
    } else {
      Alert.alert("Select Project", "Please select a project first to add photos.");
    }
  }, [selectedProject]);

  const renderProjectCard = (project: PhotoProject) => {
    const jobType = jobTypeConfig[project.jobType];
    const JobIcon = jobType.icon;
    const beforeCount = project.photos.filter((p) => p.category === "before").length;
    const afterCount = project.photos.filter((p) => p.category === "after").length;

    return (
      <TouchableOpacity
        key={project.id}
        style={styles.projectCard}
        onPress={() => {
          setSelectedProject(project);
          setSelectedCategory("all");
        }}
        activeOpacity={0.7}
      >
        <View style={styles.projectHeader}>
          <View style={[styles.jobTypeIcon, { backgroundColor: `${jobType.color}15` }]}>
            <JobIcon size={20} color={jobType.color} />
          </View>
          <View style={styles.projectInfo}>
            <Text style={styles.projectDescription}>{project.description}</Text>
            <Text style={styles.projectJobId}>{project.jobId}</Text>
          </View>
          <ChevronRight size={20} color={Colors.textTertiary} />
        </View>

        <View style={styles.photoPreviewRow}>
          {project.photos.slice(0, 4).map((photo, index) => (
            <View key={photo.id} style={styles.photoPreviewContainer}>
              <Image source={{ uri: photo.uri }} style={styles.photoPreview} />
              {index === 3 && project.photos.length > 4 && (
                <View style={styles.morePhotosOverlay}>
                  <Text style={styles.morePhotosText}>+{project.photos.length - 4}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.projectMeta}>
          <View style={styles.customerRow}>
            {project.customerAvatar ? (
              <Image source={{ uri: project.customerAvatar }} style={styles.customerAvatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <User size={12} color={Colors.textSecondary} />
              </View>
            )}
            <Text style={styles.customerName}>{project.customerName}</Text>
          </View>
          <View style={styles.photoStats}>
            <View style={styles.photoStatBadge}>
              <Camera size={12} color={Colors.textSecondary} />
              <Text style={styles.photoStatText}>{project.photos.length}</Text>
            </View>
            {beforeCount > 0 && afterCount > 0 && (
              <View style={[styles.photoStatBadge, { backgroundColor: "#DCFCE7" }]}>
                <Text style={[styles.photoStatText, { color: "#22C55E" }]}>
                  {beforeCount}→{afterCount}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.addressRow}>
          <MapPin size={12} color={Colors.textTertiary} />
          <Text style={styles.addressText} numberOfLines={1}>{project.address}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderPhotoGrid = () => (
    <View style={styles.photoGrid}>
      {filteredPhotos.map((photo) => {
        const category = categoryConfig[photo.category];
        return (
          <TouchableOpacity
            key={photo.id}
            style={styles.gridPhotoContainer}
            onPress={() => setSelectedPhoto(photo)}
            activeOpacity={0.8}
          >
            <Image source={{ uri: photo.uri }} style={styles.gridPhoto} />
            <View style={[styles.gridCategoryBadge, { backgroundColor: category.bgColor }]}>
              <Text style={[styles.gridCategoryText, { color: category.color }]}>{category.label}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderPhotoList = () => (
    <View style={styles.photoList}>
      {filteredPhotos.map((photo) => {
        const category = categoryConfig[photo.category];
        return (
          <TouchableOpacity
            key={photo.id}
            style={styles.listPhotoContainer}
            onPress={() => setSelectedPhoto(photo)}
            activeOpacity={0.7}
          >
            <Image source={{ uri: photo.uri }} style={styles.listPhoto} />
            <View style={styles.listPhotoInfo}>
              <View style={[styles.listCategoryBadge, { backgroundColor: category.bgColor }]}>
                <Text style={[styles.listCategoryText, { color: category.color }]}>{category.label}</Text>
              </View>
              {photo.caption && (
                <Text style={styles.listCaption} numberOfLines={2}>{photo.caption}</Text>
              )}
              <View style={styles.listTimestamp}>
                <Clock size={12} color={Colors.textTertiary} />
                <Text style={styles.listTimestampText}>
                  {new Date(photo.timestamp).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
              {photo.tags && photo.tags.length > 0 && (
                <View style={styles.tagRow}>
                  {photo.tags.slice(0, 3).map((tag) => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Photo Documentation",
          headerLeft: () => <BackButton />,
          headerRight: () => (
            <TouchableOpacity onPress={handleAddPhoto} style={styles.addButton}>
              <Plus size={24} color="#EAB308" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Camera size={32} color="#EAB308" />
          </View>
          <Text style={styles.headerTitle}>Photo Documentation</Text>
          <Text style={styles.headerSubtitle}>
            Before/after photos and existing wiring conditions
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalProjects}</Text>
            <Text style={styles.statLabel}>Projects</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#FEF9C3" }]}>
            <Text style={[styles.statValue, { color: "#EAB308" }]}>{stats.totalPhotos}</Text>
            <Text style={[styles.statLabel, { color: "#EAB308" }]}>Photos</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#DCFCE7" }]}>
            <Text style={[styles.statValue, { color: "#22C55E" }]}>{stats.beforeAfterPairs}</Text>
            <Text style={[styles.statLabel, { color: "#22C55E" }]}>Before/After</Text>
          </View>
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Search size={18} color={Colors.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search projects..."
              placeholderTextColor={Colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <X size={18} color={Colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.projectsSection}>
          <Text style={styles.sectionTitle}>Photo Projects ({filteredProjects.length})</Text>
          {filteredProjects.map(renderProjectCard)}

          {filteredProjects.length === 0 && (
            <View style={styles.emptyState}>
              <Camera size={48} color={Colors.textTertiary} />
              <Text style={styles.emptyStateTitle}>No Projects Found</Text>
              <Text style={styles.emptyStateText}>
                Start documenting your electrical work with photos
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal visible={selectedProject !== null && selectedPhoto === null} animationType="slide" presentationStyle="pageSheet">
        {selectedProject && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedProject(null)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Project Photos</Text>
              <TouchableOpacity onPress={() => handleShareProject(selectedProject)}>
                <Share2 size={22} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.projectDetailHeader}>
                <Text style={styles.projectDetailDescription}>{selectedProject.description}</Text>
                <Text style={styles.projectDetailJobId}>{selectedProject.jobId}</Text>
                <View style={styles.projectDetailCustomer}>
                  {selectedProject.customerAvatar ? (
                    <Image source={{ uri: selectedProject.customerAvatar }} style={styles.detailCustomerAvatar} />
                  ) : (
                    <View style={styles.detailAvatarPlaceholder}>
                      <User size={16} color={Colors.textSecondary} />
                    </View>
                  )}
                  <Text style={styles.detailCustomerName}>{selectedProject.customerName}</Text>
                </View>
                <View style={styles.detailAddressRow}>
                  <MapPin size={14} color={Colors.textSecondary} />
                  <Text style={styles.detailAddressText}>{selectedProject.address}</Text>
                </View>
              </View>

              <View style={styles.viewModeRow}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                  <TouchableOpacity
                    style={[styles.categoryChip, selectedCategory === "all" && styles.categoryChipActive]}
                    onPress={() => setSelectedCategory("all")}
                  >
                    <Text style={[styles.categoryChipText, selectedCategory === "all" && styles.categoryChipTextActive]}>
                      All ({selectedProject.photos.length})
                    </Text>
                  </TouchableOpacity>
                  {(Object.keys(categoryConfig) as PhotoCategory[]).map((cat) => {
                    const count = selectedProject.photos.filter((p) => p.category === cat).length;
                    if (count === 0) return null;
                    return (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.categoryChip,
                          selectedCategory === cat && styles.categoryChipActive,
                          selectedCategory === cat && { backgroundColor: categoryConfig[cat].color },
                        ]}
                        onPress={() => setSelectedCategory(cat)}
                      >
                        <Text style={[styles.categoryChipText, selectedCategory === cat && styles.categoryChipTextActive]}>
                          {categoryConfig[cat].label} ({count})
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                <View style={styles.viewModeToggle}>
                  <TouchableOpacity
                    style={[styles.viewModeButton, viewMode === "grid" && styles.viewModeButtonActive]}
                    onPress={() => setViewMode("grid")}
                  >
                    <Grid3X3 size={18} color={viewMode === "grid" ? Colors.white : Colors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.viewModeButton, viewMode === "list" && styles.viewModeButtonActive]}
                    onPress={() => setViewMode("list")}
                  >
                    <List size={18} color={viewMode === "list" ? Colors.white : Colors.text} />
                  </TouchableOpacity>
                </View>
              </View>

              {viewMode === "grid" ? renderPhotoGrid() : renderPhotoList()}
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>

      <Modal visible={selectedPhoto !== null} animationType="fade" transparent>
        {selectedPhoto && (
          <View style={styles.photoViewerContainer}>
            <SafeAreaView style={styles.photoViewerSafeArea}>
              <View style={styles.photoViewerHeader}>
                <TouchableOpacity onPress={() => setSelectedPhoto(null)}>
                  <X size={24} color={Colors.white} />
                </TouchableOpacity>
                <View style={[styles.viewerCategoryBadge, { backgroundColor: categoryConfig[selectedPhoto.category].bgColor }]}>
                  <Text style={[styles.viewerCategoryText, { color: categoryConfig[selectedPhoto.category].color }]}>
                    {categoryConfig[selectedPhoto.category].label}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleDeletePhoto(selectedPhoto.id)}>
                  <Trash2 size={22} color="#DC2626" />
                </TouchableOpacity>
              </View>

              <View style={styles.photoViewerContent}>
                <Image source={{ uri: selectedPhoto.uri }} style={styles.fullPhoto} contentFit="contain" />
              </View>

              <View style={styles.photoViewerFooter}>
                {selectedPhoto.caption && (
                  <Text style={styles.viewerCaption}>{selectedPhoto.caption}</Text>
                )}
                <Text style={styles.viewerTimestamp}>
                  {new Date(selectedPhoto.timestamp).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </Text>
                {selectedPhoto.tags && selectedPhoto.tags.length > 0 && (
                  <View style={styles.viewerTags}>
                    {selectedPhoto.tags.map((tag) => (
                      <View key={tag} style={styles.viewerTag}>
                        <Tag size={10} color={Colors.white} />
                        <Text style={styles.viewerTagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </SafeAreaView>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backButton: {
    padding: 8,
  },
  addButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#FEF9C3",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center" as const,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  searchSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 10,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  projectsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 14,
  },
  projectCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  projectHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  jobTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  projectInfo: {
    flex: 1,
  },
  projectDescription: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  projectJobId: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  photoPreviewRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  photoPreviewContainer: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 8,
    overflow: "hidden",
  },
  photoPreview: {
    width: "100%",
    height: "100%",
  },
  morePhotosOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  morePhotosText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  projectMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  customerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  customerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  avatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  customerName: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: "500" as const,
  },
  photoStats: {
    flexDirection: "row",
    gap: 6,
  },
  photoStatBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  photoStatText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  addressText: {
    fontSize: 12,
    color: Colors.textTertiary,
    flex: 1,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.text,
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: "center" as const,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  projectDetailHeader: {
    marginBottom: 20,
  },
  projectDetailDescription: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  projectDetailJobId: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  projectDetailCustomer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  detailCustomerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  detailAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  detailCustomerName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  detailAddressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailAddressText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  viewModeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
  },
  categoryScroll: {
    flex: 1,
    flexGrow: 0,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: "#EAB308",
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  categoryChipTextActive: {
    color: Colors.white,
  },
  viewModeToggle: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 2,
  },
  viewModeButton: {
    padding: 6,
    borderRadius: 6,
  },
  viewModeButtonActive: {
    backgroundColor: "#EAB308",
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  gridPhotoContainer: {
    width: GRID_SIZE,
    height: GRID_SIZE,
    borderRadius: 10,
    overflow: "hidden",
  },
  gridPhoto: {
    width: "100%",
    height: "100%",
  },
  gridCategoryBadge: {
    position: "absolute",
    bottom: 4,
    left: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  gridCategoryText: {
    fontSize: 9,
    fontWeight: "600" as const,
  },
  photoList: {
    gap: 12,
  },
  listPhotoContainer: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: "hidden",
  },
  listPhoto: {
    width: 100,
    height: 100,
  },
  listPhotoInfo: {
    flex: 1,
    padding: 12,
  },
  listCategoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  listCategoryText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  listCaption: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 6,
  },
  listTimestamp: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  listTimestampText: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 6,
  },
  tag: {
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  photoViewerContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
  },
  photoViewerSafeArea: {
    flex: 1,
  },
  photoViewerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  viewerCategoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  viewerCategoryText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  photoViewerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  fullPhoto: {
    width: "100%",
    height: "100%",
  },
  photoViewerFooter: {
    padding: 20,
  },
  viewerCaption: {
    fontSize: 16,
    color: Colors.white,
    marginBottom: 8,
  },
  viewerTimestamp: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    marginBottom: 12,
  },
  viewerTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  viewerTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  viewerTagText: {
    fontSize: 12,
    color: Colors.white,
  },
});
