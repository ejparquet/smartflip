import React, { useState } from "react";
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
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import {
  ArrowLeft,
  Camera,
  Plus,
  X,
  Calendar,
  MapPin,

  ChevronDown,
  Grid3X3,
  List,
  Trash2,
  Share2,
  Download,
  Droplets,
  Filter,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";

const { width } = Dimensions.get("window");
const imageSize = (width - 52) / 3;

type PhotoCategory = "excavation" | "steel_rebar" | "plumbing" | "electrical" | "gunite" | "tile" | "decking" | "equipment" | "finish" | "before" | "after" | "inspection";

interface PoolPhoto {
  id: string;
  uri: string;
  projectId: string;
  projectName: string;
  category: PhotoCategory;
  caption?: string;
  takenAt: string;
  takenBy: string;
}

const categoryConfig: Record<PhotoCategory, { label: string; color: string }> = {
  excavation: { label: "Excavation", color: "#78716C" },
  steel_rebar: { label: "Steel/Rebar", color: "#EF4444" },
  plumbing: { label: "Plumbing", color: "#06B6D4" },
  electrical: { label: "Electrical", color: "#272D53" },
  gunite: { label: "Gunite/Shell", color: "#1E3A5F" },
  tile: { label: "Tile & Coping", color: "#8B5CF6" },
  decking: { label: "Decking", color: "#D97706" },
  equipment: { label: "Equipment", color: "#3B82F6" },
  finish: { label: "Final Finish", color: "#0EA5E9" },
  before: { label: "Before", color: "#6B7280" },
  after: { label: "After", color: "#22C55E" },
  inspection: { label: "Inspection", color: "#EC4899" },
};

const mockPhotos: PoolPhoto[] = [
  {
    id: "ph1",
    uri: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=400",
    projectId: "pool-1",
    projectName: "Thompson Residence",
    category: "excavation",
    caption: "Excavation complete - 16x32 ft area",
    takenAt: "2026-02-12",
    takenBy: "Carlos Rodriguez",
  },
  {
    id: "ph2",
    uri: "https://images.unsplash.com/photo-1572331165267-854da2b10ccc?w=400",
    projectId: "pool-1",
    projectName: "Thompson Residence",
    category: "steel_rebar",
    caption: "Rebar framework installed",
    takenAt: "2026-02-20",
    takenBy: "Luis Ramirez",
  },
  {
    id: "ph3",
    uri: "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=400",
    projectId: "pool-1",
    projectName: "Thompson Residence",
    category: "plumbing",
    caption: "Main drain and return lines installed",
    takenAt: "2026-02-22",
    takenBy: "James Wilson",
  },
  {
    id: "ph4",
    uri: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400",
    projectId: "pool-2",
    projectName: "Adams Infinity Pool",
    category: "before",
    caption: "Backyard before construction",
    takenAt: "2026-01-28",
    takenBy: "Mike Rodriguez",
  },
  {
    id: "ph5",
    uri: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400",
    projectId: "pool-2",
    projectName: "Adams Infinity Pool",
    category: "excavation",
    caption: "Site preparation in progress",
    takenAt: "2026-02-05",
    takenBy: "Carlos Martinez",
  },
  {
    id: "ph6",
    uri: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=400",
    projectId: "pool-3",
    projectName: "Martinez Fiberglass",
    category: "finish",
    caption: "Completed pool - final inspection passed",
    takenAt: "2025-12-18",
    takenBy: "Mike Rodriguez",
  },
  {
    id: "ph7",
    uri: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400",
    projectId: "pool-3",
    projectName: "Martinez Fiberglass",
    category: "after",
    caption: "Project completed - client handoff",
    takenAt: "2025-12-18",
    takenBy: "Mike Rodriguez",
  },
  {
    id: "ph8",
    uri: "https://images.unsplash.com/photo-1558904541-efa843a96f01?w=400",
    projectId: "pool-1",
    projectName: "Thompson Residence",
    category: "inspection",
    caption: "Pre-pour inspection with city inspector",
    takenAt: "2026-02-14",
    takenBy: "Mike Rodriguez",
  },
];

const mockProjects = [
  { id: "pool-1", name: "Thompson Residence" },
  { id: "pool-2", name: "Adams Infinity Pool" },
  { id: "pool-3", name: "Martinez Fiberglass" },
];

type ViewMode = "grid" | "list";

export default function PoolPhotoDocumentationScreen() {
  const router = useRouter();
  const [photos, setPhotos] = useState<PoolPhoto[]>(mockPhotos);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedCategory, setSelectedCategory] = useState<PhotoCategory | "all">("all");
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [selectedPhoto, setSelectedPhoto] = useState<PoolPhoto | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  
  const [newPhoto, setNewPhoto] = useState({
    uri: "",
    projectId: "",
    category: "excavation" as PhotoCategory,
    caption: "",
  });

  const filteredPhotos = photos.filter(photo => {
    const matchesCategory = selectedCategory === "all" || photo.category === selectedCategory;
    const matchesProject = selectedProject === "all" || photo.projectId === selectedProject;
    return matchesCategory && matchesProject;
  });

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setNewPhoto(prev => ({ ...prev, uri: result.assets[0].uri }));
    }
  };

  const handleTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission Required", "Camera access is needed to take photos");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setNewPhoto(prev => ({ ...prev, uri: result.assets[0].uri }));
    }
  };

  const handleUploadPhoto = () => {
    if (!newPhoto.uri || !newPhoto.projectId) {
      Alert.alert("Error", "Please select an image and project");
      return;
    }

    const project = mockProjects.find(p => p.id === newPhoto.projectId);
    const photo: PoolPhoto = {
      id: `ph${Date.now()}`,
      uri: newPhoto.uri,
      projectId: newPhoto.projectId,
      projectName: project?.name || "Unknown Project",
      category: newPhoto.category,
      caption: newPhoto.caption,
      takenAt: new Date().toISOString().split("T")[0],
      takenBy: "Current User",
    };

    setPhotos(prev => [photo, ...prev]);
    setShowUploadModal(false);
    setNewPhoto({ uri: "", projectId: "", category: "excavation", caption: "" });
    Alert.alert("Success", "Photo uploaded successfully!");
  };

  const handleDeletePhoto = (photoId: string) => {
    Alert.alert(
      "Delete Photo",
      "Are you sure you want to delete this photo?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setPhotos(prev => prev.filter(p => p.id !== photoId));
            setSelectedPhoto(null);
          },
        },
      ]
    );
  };

  const handleSharePhoto = (photo: PoolPhoto) => {
    Alert.alert("Share Photo", `Sharing "${photo.caption || 'Pool Photo'}" from ${photo.projectName}`);
  };

  const renderGridItem = (photo: PoolPhoto) => (
    <TouchableOpacity
      key={photo.id}
      style={styles.gridItem}
      onPress={() => setSelectedPhoto(photo)}
    >
      <Image source={{ uri: photo.uri }} style={styles.gridImage} contentFit="cover" />
      <View style={[styles.categoryTag, { backgroundColor: categoryConfig[photo.category].color }]}>
        <Text style={styles.categoryTagText}>{categoryConfig[photo.category].label}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderListItem = (photo: PoolPhoto) => (
    <TouchableOpacity
      key={photo.id}
      style={styles.listItem}
      onPress={() => setSelectedPhoto(photo)}
    >
      <Image source={{ uri: photo.uri }} style={styles.listImage} contentFit="cover" />
      <View style={styles.listContent}>
        <View style={[styles.listCategoryBadge, { backgroundColor: `${categoryConfig[photo.category].color}15` }]}>
          <Text style={[styles.listCategoryText, { color: categoryConfig[photo.category].color }]}>
            {categoryConfig[photo.category].label}
          </Text>
        </View>
        <Text style={styles.listCaption} numberOfLines={2}>
          {photo.caption || "No caption"}
        </Text>
        <View style={styles.listMeta}>
          <MapPin size={12} color={Colors.textSecondary} />
          <Text style={styles.listMetaText}>{photo.projectName}</Text>
        </View>
        <View style={styles.listMeta}>
          <Calendar size={12} color={Colors.textSecondary} />
          <Text style={styles.listMetaText}>{photo.takenAt}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Pool Photos",
          headerLeft: () => <BackButton />,
          headerRight: () => (
            <TouchableOpacity style={styles.addButton} onPress={() => setShowUploadModal(true)}>
              <Camera size={20} color={Colors.white} />
            </TouchableOpacity>
          ),
          headerStyle: { backgroundColor: Colors.background },
          headerShadowVisible: false,
        }}
      />

      <View style={styles.headerSection}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Camera size={18} color="#0EA5E9" />
            <Text style={styles.statValue}>{photos.length}</Text>
            <Text style={styles.statLabel}>Total Photos</Text>
          </View>
          <View style={styles.statCard}>
            <Droplets size={18} color="#22C55E" />
            <Text style={styles.statValue}>{mockProjects.length}</Text>
            <Text style={styles.statLabel}>Projects</Text>
          </View>
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity 
            style={styles.filterSelect}
            onPress={() => setShowProjectDropdown(!showProjectDropdown)}
          >
            <MapPin size={14} color={Colors.textSecondary} />
            <Text style={styles.filterSelectText}>
              {selectedProject === "all" ? "All Projects" : mockProjects.find(p => p.id === selectedProject)?.name}
            </Text>
            <ChevronDown size={14} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.filterSelect}
            onPress={() => setShowFilterDropdown(!showFilterDropdown)}
          >
            <Filter size={14} color={Colors.textSecondary} />
            <Text style={styles.filterSelectText}>
              {selectedCategory === "all" ? "All Stages" : categoryConfig[selectedCategory].label}
            </Text>
            <ChevronDown size={14} color={Colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[styles.viewBtn, viewMode === "grid" && styles.viewBtnActive]}
              onPress={() => setViewMode("grid")}
            >
              <Grid3X3 size={16} color={viewMode === "grid" ? Colors.white : Colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewBtn, viewMode === "list" && styles.viewBtnActive]}
              onPress={() => setViewMode("list")}
            >
              <List size={16} color={viewMode === "list" ? Colors.white : Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {showProjectDropdown && (
        <View style={[styles.dropdown, { left: 20 }]}>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => { setSelectedProject("all"); setShowProjectDropdown(false); }}
          >
            <Text style={[styles.dropdownText, selectedProject === "all" && styles.dropdownTextActive]}>
              All Projects
            </Text>
          </TouchableOpacity>
          {mockProjects.map(project => (
            <TouchableOpacity
              key={project.id}
              style={styles.dropdownItem}
              onPress={() => { setSelectedProject(project.id); setShowProjectDropdown(false); }}
            >
              <Text style={[styles.dropdownText, selectedProject === project.id && styles.dropdownTextActive]}>
                {project.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {showFilterDropdown && (
        <View style={[styles.dropdown, { right: 70 }]}>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => { setSelectedCategory("all"); setShowFilterDropdown(false); }}
          >
            <Text style={[styles.dropdownText, selectedCategory === "all" && styles.dropdownTextActive]}>
              All Stages
            </Text>
          </TouchableOpacity>
          {Object.entries(categoryConfig).map(([key, config]) => (
            <TouchableOpacity
              key={key}
              style={styles.dropdownItem}
              onPress={() => { setSelectedCategory(key as PhotoCategory); setShowFilterDropdown(false); }}
            >
              <View style={[styles.dropdownDot, { backgroundColor: config.color }]} />
              <Text style={[styles.dropdownText, selectedCategory === key && styles.dropdownTextActive]}>
                {config.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {viewMode === "grid" ? (
          <View style={styles.gridContainer}>
            {filteredPhotos.map(photo => renderGridItem(photo))}
          </View>
        ) : (
          filteredPhotos.map(photo => renderListItem(photo))
        )}

        {filteredPhotos.length === 0 && (
          <View style={styles.emptyState}>
            <Camera size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Photos Found</Text>
            <Text style={styles.emptySubtitle}>Upload your first pool construction photo</Text>
            <TouchableOpacity 
              style={styles.uploadBtn}
              onPress={() => setShowUploadModal(true)}
            >
              <Plus size={18} color={Colors.white} />
              <Text style={styles.uploadBtnText}>Upload Photo</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={!!selectedPhoto}
        animationType="fade"
        presentationStyle="fullScreen"
        onRequestClose={() => setSelectedPhoto(null)}
      >
        {selectedPhoto && (
          <View style={styles.photoModal}>
            <SafeAreaView style={styles.photoModalHeader}>
              <TouchableOpacity onPress={() => setSelectedPhoto(null)}>
                <X size={24} color={Colors.white} />
              </TouchableOpacity>
              <Text style={styles.photoModalTitle} numberOfLines={1}>
                {selectedPhoto.projectName}
              </Text>
              <View style={{ width: 24 }} />
            </SafeAreaView>

            <Image 
              source={{ uri: selectedPhoto.uri }} 
              style={styles.fullImage} 
              contentFit="contain"
            />

            <View style={styles.photoModalFooter}>
              <View style={[styles.modalCategoryBadge, { backgroundColor: categoryConfig[selectedPhoto.category].color }]}>
                <Text style={styles.modalCategoryText}>{categoryConfig[selectedPhoto.category].label}</Text>
              </View>
              {selectedPhoto.caption && (
                <Text style={styles.photoCaption}>{selectedPhoto.caption}</Text>
              )}
              <View style={styles.photoMeta}>
                <Calendar size={14} color={Colors.textSecondary} />
                <Text style={styles.photoMetaText}>{selectedPhoto.takenAt}</Text>
                <Text style={styles.photoMetaText}>by {selectedPhoto.takenBy}</Text>
              </View>

              <View style={styles.photoActions}>
                <TouchableOpacity 
                  style={styles.photoActionBtn}
                  onPress={() => handleSharePhoto(selectedPhoto)}
                >
                  <Share2 size={20} color={Colors.text} />
                  <Text style={styles.photoActionText}>Share</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.photoActionBtn}>
                  <Download size={20} color={Colors.text} />
                  <Text style={styles.photoActionText}>Download</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.photoActionBtn, styles.deleteBtn]}
                  onPress={() => handleDeletePhoto(selectedPhoto.id)}
                >
                  <Trash2 size={20} color={Colors.error} />
                  <Text style={[styles.photoActionText, { color: Colors.error }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </Modal>

      <Modal
        visible={showUploadModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowUploadModal(false)}
      >
        <SafeAreaView style={styles.uploadModal}>
          <View style={styles.uploadHeader}>
            <TouchableOpacity onPress={() => setShowUploadModal(false)}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.uploadTitle}>Upload Photo</Text>
            <TouchableOpacity onPress={handleUploadPhoto}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.uploadContent}>
            {newPhoto.uri ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: newPhoto.uri }} style={styles.previewImage} contentFit="cover" />
                <TouchableOpacity 
                  style={styles.changePhotoBtn}
                  onPress={handlePickImage}
                >
                  <Text style={styles.changePhotoText}>Change Photo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.selectPhotoContainer}>
                <TouchableOpacity style={styles.selectPhotoBtn} onPress={handleTakePhoto}>
                  <Camera size={28} color="#0EA5E9" />
                  <Text style={styles.selectPhotoText}>Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.selectPhotoBtn} onPress={handlePickImage}>
                  <Plus size={28} color="#0EA5E9" />
                  <Text style={styles.selectPhotoText}>Choose from Gallery</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.formLabel}>Project *</Text>
            <View style={styles.projectOptions}>
              {mockProjects.map(project => (
                <TouchableOpacity
                  key={project.id}
                  style={[
                    styles.projectOption,
                    newPhoto.projectId === project.id && styles.projectOptionActive
                  ]}
                  onPress={() => setNewPhoto(prev => ({ ...prev, projectId: project.id }))}
                >
                  <Text style={[
                    styles.projectOptionText,
                    newPhoto.projectId === project.id && styles.projectOptionTextActive
                  ]}>
                    {project.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.formLabel}>Construction Stage *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {Object.entries(categoryConfig).map(([key, config]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.categoryOption,
                    newPhoto.category === key && { backgroundColor: config.color }
                  ]}
                  onPress={() => setNewPhoto(prev => ({ ...prev, category: key as PhotoCategory }))}
                >
                  <Text style={[
                    styles.categoryOptionText,
                    newPhoto.category === key && { color: Colors.white }
                  ]}>
                    {config.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.formLabel}>Caption</Text>
            <TextInput
              style={styles.captionInput}
              placeholder="Describe what's in this photo..."
              placeholderTextColor={Colors.textTertiary}
              value={newPhoto.caption}
              onChangeText={(text) => setNewPhoto(prev => ({ ...prev, caption: text }))}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </ScrollView>
        </SafeAreaView>
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
    marginLeft: 8,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#0EA5E9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  headerSection: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800" as const,
    color: Colors.text,
    marginTop: 6,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  filterRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  filterSelect: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  filterSelectText: {
    flex: 1,
    fontSize: 13,
    color: Colors.text,
  },
  viewToggle: {
    flexDirection: "row",
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 10,
    padding: 4,
  },
  viewBtn: {
    padding: 8,
    borderRadius: 8,
  },
  viewBtnActive: {
    backgroundColor: "#0EA5E9",
  },
  dropdown: {
    position: "absolute",
    top: 170,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
    minWidth: 160,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  dropdownText: {
    fontSize: 14,
    color: Colors.text,
  },
  dropdownTextActive: {
    color: "#0EA5E9",
    fontWeight: "600" as const,
  },
  dropdownDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  gridItem: {
    width: imageSize,
    height: imageSize,
    borderRadius: 12,
    overflow: "hidden",
  },
  gridImage: {
    width: "100%",
    height: "100%",
  },
  categoryTag: {
    position: "absolute",
    bottom: 6,
    left: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryTagText: {
    fontSize: 9,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  listItem: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 12,
  },
  listImage: {
    width: 100,
    height: 100,
  },
  listContent: {
    flex: 1,
    padding: 12,
  },
  listCategoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 6,
  },
  listCategoryText: {
    fontSize: 10,
    fontWeight: "600" as const,
  },
  listCaption: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.text,
    marginBottom: 6,
  },
  listMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  listMetaText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: 20,
  },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#0EA5E9",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  uploadBtnText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  photoModal: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  photoModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  photoModalTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.white,
    flex: 1,
    textAlign: "center" as const,
    marginHorizontal: 16,
  },
  fullImage: {
    flex: 1,
    width: "100%",
  },
  photoModalFooter: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalCategoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 10,
  },
  modalCategoryText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  photoCaption: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 10,
  },
  photoMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  photoMetaText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  photoActions: {
    flexDirection: "row",
    gap: 12,
  },
  photoActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.surfaceSecondary,
    paddingVertical: 12,
    borderRadius: 12,
  },
  photoActionText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  deleteBtn: {
    backgroundColor: "#FEE2E2",
  },
  uploadModal: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  uploadHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  uploadTitle: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  saveText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#0EA5E9",
  },
  uploadContent: {
    flex: 1,
    padding: 20,
  },
  selectPhotoContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  selectPhotoBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E0F2FE",
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: "#0EA5E9",
    borderStyle: "dashed",
  },
  selectPhotoText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#0EA5E9",
    marginTop: 8,
    textAlign: "center" as const,
  },
  previewContainer: {
    marginBottom: 24,
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    marginBottom: 12,
  },
  changePhotoBtn: {
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 8,
  },
  changePhotoText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 10,
    marginTop: 16,
  },
  projectOptions: {
    gap: 8,
  },
  projectOption: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    borderColor: "transparent",
  },
  projectOptionActive: {
    borderColor: "#0EA5E9",
    backgroundColor: "#E0F2FE",
  },
  projectOptionText: {
    fontSize: 15,
    color: Colors.text,
  },
  projectOptionTextActive: {
    fontWeight: "600" as const,
    color: "#0EA5E9",
  },
  categoryScroll: {
    marginBottom: 8,
  },
  categoryOption: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    marginRight: 8,
  },
  categoryOptionText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.textSecondary,
  },
  captionInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
    minHeight: 80,
  },
});
