import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  Alert,
} from "react-native";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import {
  Plus,
  Camera,
  X,
  ChevronRight,
  MapPin,
  Calendar,
  ArrowLeftRight,
  Share2,
  Trash2,
  Home,
  Eye,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";

interface BeforeAfterPhoto {
  id: string;
  beforeUrl: string;
  afterUrl: string | null;
  room: string;
  notes: string;
  dateTaken: string;
}

interface BeforeAfterProject {
  id: string;
  propertyName: string;
  address: string;
  photos: BeforeAfterPhoto[];
  createdAt: string;
  status: "in_progress" | "completed";
}

const mockProjects: BeforeAfterProject[] = [
  {
    id: "1",
    propertyName: "Oak Street Flip",
    address: "456 Oak Street, Austin, TX",
    createdAt: "2024-01-15",
    status: "in_progress",
    photos: [
      {
        id: "p1",
        beforeUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400",
        afterUrl: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400",
        room: "Living Room",
        notes: "Complete renovation with new flooring and paint",
        dateTaken: "2024-01-15",
      },
      {
        id: "p2",
        beforeUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
        afterUrl: "https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=400",
        room: "Kitchen",
        notes: "New cabinets, countertops, and appliances",
        dateTaken: "2024-01-18",
      },
      {
        id: "p3",
        beforeUrl: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400",
        afterUrl: null,
        room: "Master Bedroom",
        notes: "Awaiting completion",
        dateTaken: "2024-01-20",
      },
    ],
  },
  {
    id: "2",
    propertyName: "Maple Avenue Remodel",
    address: "789 Maple Ave, Dallas, TX",
    createdAt: "2024-02-01",
    status: "completed",
    photos: [
      {
        id: "p4",
        beforeUrl: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400",
        afterUrl: "https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=400",
        room: "Kitchen",
        notes: "Modern kitchen transformation",
        dateTaken: "2024-02-01",
      },
      {
        id: "p5",
        beforeUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400",
        afterUrl: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400",
        room: "Bathroom",
        notes: "Full bathroom renovation",
        dateTaken: "2024-02-05",
      },
    ],
  },
];

export default function BeforeAfterComparison() {
  const { theme } = useTheme();
  const [projects, setProjects] = useState<BeforeAfterProject[]>(mockProjects);
  const [selectedProject, setSelectedProject] = useState<BeforeAfterProject | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<BeforeAfterPhoto | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectAddress, setNewProjectAddress] = useState("");
  const [compareSliderPosition, setCompareSliderPosition] = useState(50);

  const dynamicStyles = useMemo(
    () => ({
      container: { backgroundColor: theme.background },
      card: { backgroundColor: theme.surface },
      text: { color: theme.text },
      textSecondary: { color: theme.textSecondary },
      border: { borderColor: theme.border },
      input: { backgroundColor: theme.surfaceSecondary, color: theme.text },
    }),
    [theme]
  );

  const handleAddProject = () => {
    if (!newProjectName.trim()) {
      Alert.alert("Error", "Please enter a project name");
      return;
    }

    const newProject: BeforeAfterProject = {
      id: Date.now().toString(),
      propertyName: newProjectName,
      address: newProjectAddress,
      photos: [],
      createdAt: new Date().toISOString().split("T")[0],
      status: "in_progress",
    };

    setProjects([newProject, ...projects]);
    setNewProjectName("");
    setNewProjectAddress("");
    setShowAddModal(false);
  };

  const handleDeleteProject = (projectId: string) => {
    Alert.alert("Delete Project", "Are you sure you want to delete this project?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setProjects(projects.filter((p) => p.id !== projectId));
          if (selectedProject?.id === projectId) {
            setSelectedProject(null);
          }
        },
      },
    ]);
  };

  const handleViewComparison = (photo: BeforeAfterPhoto) => {
    if (!photo.afterUrl) {
      Alert.alert("No After Photo", "Add an after photo to view the comparison");
      return;
    }
    setSelectedPhoto(photo);
    setShowCompareModal(true);
  };

  const completedPhotos = selectedProject?.photos.filter((p) => p.afterUrl) || [];
  const pendingPhotos = selectedProject?.photos.filter((p) => !p.afterUrl) || [];

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <Stack.Screen
        options={{
          title: "Before/After",
          headerStyle: { backgroundColor: theme.background },
          headerShadowVisible: false,
          headerTintColor: theme.text,
        }}
      />

      {!selectedProject ? (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={[styles.headerTitle, dynamicStyles.text]}>Your Projects</Text>
            <Text style={[styles.headerSubtitle, dynamicStyles.textSecondary]}>
              Track before and after transformations
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: "#272D53" }]}
            onPress={() => setShowAddModal(true)}
          >
            <Plus size={20} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.addButtonText}>New Project</Text>
          </TouchableOpacity>

          {projects.map((project) => (
            <TouchableOpacity
              key={project.id}
              style={[styles.projectCard, dynamicStyles.card]}
              onPress={() => setSelectedProject(project)}
              activeOpacity={0.7}
            >
              <View style={styles.projectCardHeader}>
                <View style={styles.projectInfo}>
                  <Text style={[styles.projectName, dynamicStyles.text]}>
                    {project.propertyName}
                  </Text>
                  <View style={styles.addressRow}>
                    <MapPin size={14} color={theme.textSecondary} strokeWidth={1.5} />
                    <Text style={[styles.projectAddress, dynamicStyles.textSecondary]}>
                      {project.address}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        project.status === "completed" ? "#D1FAE5" : "#E8E9EE",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color: project.status === "completed" ? "#059669" : "#D97706",
                      },
                    ]}
                  >
                    {project.status === "completed" ? "Completed" : "In Progress"}
                  </Text>
                </View>
              </View>

              {project.photos.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.photoPreviewScroll}
                >
                  {project.photos.slice(0, 4).map((photo) => (
                    <View key={photo.id} style={styles.photoPreviewContainer}>
                      <Image
                        source={{ uri: photo.beforeUrl }}
                        style={styles.photoPreview}
                        contentFit="cover"
                      />
                      {photo.afterUrl && (
                        <View style={styles.afterIndicator}>
                          <ArrowLeftRight size={12} color="#FFFFFF" />
                        </View>
                      )}
                    </View>
                  ))}
                </ScrollView>
              )}

              <View style={styles.projectFooter}>
                <View style={styles.footerStats}>
                  <View style={styles.statItem}>
                    <Camera size={14} color={theme.textTertiary} strokeWidth={1.5} />
                    <Text style={[styles.statText, dynamicStyles.textSecondary]}>
                      {project.photos.length} Photos
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Calendar size={14} color={theme.textTertiary} strokeWidth={1.5} />
                    <Text style={[styles.statText, dynamicStyles.textSecondary]}>
                      {project.createdAt}
                    </Text>
                  </View>
                </View>
                <ChevronRight size={20} color={theme.textTertiary} strokeWidth={1.5} />
              </View>
            </TouchableOpacity>
          ))}

          <View style={{ height: 100 }} />
        </ScrollView>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedProject(null)}
          >
            <Text style={[styles.backText, { color: "#272D53" }]}>← Back to Projects</Text>
          </TouchableOpacity>

          <View style={[styles.projectDetailHeader, dynamicStyles.card]}>
            <View style={styles.projectDetailInfo}>
              <Text style={[styles.projectDetailName, dynamicStyles.text]}>
                {selectedProject.propertyName}
              </Text>
              <View style={styles.addressRow}>
                <MapPin size={14} color={theme.textSecondary} strokeWidth={1.5} />
                <Text style={[styles.projectAddress, dynamicStyles.textSecondary]}>
                  {selectedProject.address}
                </Text>
              </View>
            </View>
            <View style={styles.projectActions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: `${theme.textSecondary}15` }]}
              >
                <Share2 size={18} color={theme.textSecondary} strokeWidth={1.5} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#FEE2E2" }]}
                onPress={() => handleDeleteProject(selectedProject.id)}
              >
                <Trash2 size={18} color="#DC2626" strokeWidth={1.5} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.addPhotoButton, { backgroundColor: "#272D5315" }]}
          >
            <Camera size={20} color="#272D53" strokeWidth={2} />
            <Text style={[styles.addPhotoText, { color: "#272D53" }]}>
              Add Before Photo
            </Text>
          </TouchableOpacity>

          {completedPhotos.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, dynamicStyles.text]}>
                Completed Comparisons
              </Text>
              {completedPhotos.map((photo) => (
                <TouchableOpacity
                  key={photo.id}
                  style={[styles.comparisonCard, dynamicStyles.card]}
                  onPress={() => handleViewComparison(photo)}
                  activeOpacity={0.8}
                >
                  <View style={styles.comparisonImages}>
                    <View style={styles.imageContainer}>
                      <Image
                        source={{ uri: photo.beforeUrl }}
                        style={styles.comparisonImage}
                        contentFit="cover"
                      />
                      <View style={styles.imageLabel}>
                        <Text style={styles.imageLabelText}>Before</Text>
                      </View>
                    </View>
                    <View style={styles.arrowContainer}>
                      <ArrowLeftRight size={20} color="#272D53" strokeWidth={2} />
                    </View>
                    <View style={styles.imageContainer}>
                      <Image
                        source={{ uri: photo.afterUrl! }}
                        style={styles.comparisonImage}
                        contentFit="cover"
                      />
                      <View style={[styles.imageLabel, { backgroundColor: "#10B981" }]}>
                        <Text style={styles.imageLabelText}>After</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.comparisonInfo}>
                    <View style={styles.roomBadge}>
                      <Home size={12} color="#272D53" strokeWidth={2} />
                      <Text style={[styles.roomText, { color: "#272D53" }]}>
                        {photo.room}
                      </Text>
                    </View>
                    <Text
                      style={[styles.comparisonNotes, dynamicStyles.textSecondary]}
                      numberOfLines={2}
                    >
                      {photo.notes}
                    </Text>
                  </View>
                  <View style={styles.viewButton}>
                    <Eye size={16} color="#272D53" strokeWidth={2} />
                    <Text style={[styles.viewButtonText, { color: "#272D53" }]}>
                      View Comparison
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {pendingPhotos.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, dynamicStyles.text]}>
                Pending After Photos
              </Text>
              {pendingPhotos.map((photo) => (
                <View
                  key={photo.id}
                  style={[styles.pendingCard, dynamicStyles.card]}
                >
                  <Image
                    source={{ uri: photo.beforeUrl }}
                    style={styles.pendingImage}
                    contentFit="cover"
                  />
                  <View style={styles.pendingInfo}>
                    <View style={styles.roomBadge}>
                      <Home size={12} color={theme.textSecondary} strokeWidth={2} />
                      <Text style={[styles.roomText, dynamicStyles.textSecondary]}>
                        {photo.room}
                      </Text>
                    </View>
                    <Text
                      style={[styles.pendingNotes, dynamicStyles.textSecondary]}
                      numberOfLines={1}
                    >
                      {photo.notes}
                    </Text>
                    <TouchableOpacity
                      style={[styles.addAfterButton, { backgroundColor: "#272D5320" }]}
                    >
                      <Camera size={14} color="#272D53" strokeWidth={2} />
                      <Text style={[styles.addAfterText, { color: "#272D53" }]}>
                        Add After
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, dynamicStyles.card]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, dynamicStyles.text]}>New Project</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={24} color={theme.textSecondary} strokeWidth={1.5} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, dynamicStyles.textSecondary]}>
                Project Name
              </Text>
              <TextInput
                style={[styles.input, dynamicStyles.input, dynamicStyles.border]}
                placeholder="e.g., Oak Street Flip"
                placeholderTextColor={theme.textTertiary}
                value={newProjectName}
                onChangeText={setNewProjectName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, dynamicStyles.textSecondary]}>
                Property Address
              </Text>
              <TextInput
                style={[styles.input, dynamicStyles.input, dynamicStyles.border]}
                placeholder="123 Main St, City, State"
                placeholderTextColor={theme.textTertiary}
                value={newProjectAddress}
                onChangeText={setNewProjectAddress}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: "#272D53" }]}
              onPress={handleAddProject}
            >
              <Text style={styles.submitButtonText}>Create Project</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showCompareModal} transparent animationType="fade">
        <View style={[styles.compareModalOverlay, { backgroundColor: "rgba(0,0,0,0.95)" }]}>
          <SafeAreaView style={styles.compareModalContent}>
            <View style={styles.compareHeader}>
              <TouchableOpacity onPress={() => setShowCompareModal(false)}>
                <X size={28} color="#FFFFFF" strokeWidth={1.5} />
              </TouchableOpacity>
              <Text style={styles.compareTitle}>{selectedPhoto?.room}</Text>
              <TouchableOpacity>
                <Share2 size={24} color="#FFFFFF" strokeWidth={1.5} />
              </TouchableOpacity>
            </View>

            {selectedPhoto && (
              <View style={styles.sliderContainer}>
                <View style={styles.sliderImageContainer}>
                  <Image
                    source={{ uri: selectedPhoto.afterUrl! }}
                    style={styles.sliderImage}
                    contentFit="cover"
                  />
                  <View
                    style={[
                      styles.sliderOverlay,
                      { width: `${compareSliderPosition}%` },
                    ]}
                  >
                    <Image
                      source={{ uri: selectedPhoto.beforeUrl }}
                      style={[styles.sliderImage, { width: "100%" }]}
                      contentFit="cover"
                    />
                  </View>
                  <View
                    style={[
                      styles.sliderHandle,
                      { left: `${compareSliderPosition}%` },
                    ]}
                  >
                    <View style={styles.sliderHandleInner}>
                      <ArrowLeftRight size={16} color="#FFFFFF" strokeWidth={2} />
                    </View>
                  </View>
                </View>

                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderLabel}>Before</Text>
                  <Text style={styles.sliderLabel}>After</Text>
                </View>

                <View style={styles.sliderControl}>
                  <TouchableOpacity
                    style={styles.sliderButton}
                    onPress={() =>
                      setCompareSliderPosition(Math.max(0, compareSliderPosition - 10))
                    }
                  >
                    <Text style={styles.sliderButtonText}>◀</Text>
                  </TouchableOpacity>
                  <View style={styles.sliderTrack}>
                    <View
                      style={[
                        styles.sliderProgress,
                        { width: `${compareSliderPosition}%` },
                      ]}
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.sliderButton}
                    onPress={() =>
                      setCompareSliderPosition(Math.min(100, compareSliderPosition + 10))
                    }
                  >
                    <Text style={styles.sliderButtonText}>▶</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800" as const,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginVertical: 16,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  projectCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  projectCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 17,
    fontWeight: "700" as const,
    marginBottom: 6,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  projectAddress: {
    fontSize: 13,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  photoPreviewScroll: {
    marginBottom: 12,
  },
  photoPreviewContainer: {
    marginRight: 8,
    position: "relative",
  },
  photoPreview: {
    width: 70,
    height: 70,
    borderRadius: 10,
  },
  afterIndicator: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "#272D53",
    borderRadius: 10,
    padding: 4,
  },
  projectFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerStats: {
    flexDirection: "row",
    gap: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 13,
  },
  backButton: {
    padding: 20,
    paddingBottom: 8,
  },
  backText: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  projectDetailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
  },
  projectDetailInfo: {
    flex: 1,
  },
  projectDetailName: {
    fontSize: 20,
    fontWeight: "700" as const,
    marginBottom: 6,
  },
  projectActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 10,
    borderRadius: 10,
  },
  addPhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#272D53",
    borderStyle: "dashed",
    gap: 8,
  },
  addPhotoText: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  comparisonCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 12,
    borderRadius: 16,
  },
  comparisonImages: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  imageContainer: {
    flex: 1,
    position: "relative",
  },
  comparisonImage: {
    height: 100,
    borderRadius: 10,
  },
  imageLabel: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "#6B7280",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  imageLabelText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600" as const,
  },
  arrowContainer: {
    paddingHorizontal: 8,
  },
  comparisonInfo: {
    marginBottom: 10,
  },
  roomBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  roomText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  comparisonNotes: {
    fontSize: 13,
    lineHeight: 18,
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#272D5315",
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  pendingCard: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 12,
    borderRadius: 16,
  },
  pendingImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  pendingInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  pendingNotes: {
    fontSize: 13,
  },
  addAfterButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addAfterText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500" as const,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  compareModalOverlay: {
    flex: 1,
  },
  compareModalContent: {
    flex: 1,
  },
  compareHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  compareTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600" as const,
  },
  sliderContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  sliderImageContainer: {
    position: "relative",
    height: 300,
    borderRadius: 16,
    overflow: "hidden",
  },
  sliderImage: {
    width: "100%",
    height: "100%",
  },
  sliderOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    overflow: "hidden",
  },
  sliderHandle: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: "#FFFFFF",
    marginLeft: -2,
    justifyContent: "center",
    alignItems: "center",
  },
  sliderHandleInner: {
    backgroundColor: "#272D53",
    padding: 8,
    borderRadius: 20,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingHorizontal: 8,
  },
  sliderLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600" as const,
  },
  sliderControl: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    gap: 12,
  },
  sliderButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#272D53",
    justifyContent: "center",
    alignItems: "center",
  },
  sliderButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  sliderTrack: {
    flex: 1,
    height: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 3,
    overflow: "hidden",
  },
  sliderProgress: {
    height: "100%",
    backgroundColor: "#272D53",
  },
});
