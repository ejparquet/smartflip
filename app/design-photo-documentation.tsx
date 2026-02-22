import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from "react-native";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import {
  Search,
  Filter,
  Plus,
  X,
  Camera,
  Grid3X3,
  List,
  Calendar,
  Tag,
  Trash2,
  Download,
  Share2,
  ChevronDown,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { mockDesignProjects } from "@/mocks/interior-designers";

interface DesignPhoto {
  id: string;
  url: string;
  type: "inspiration" | "before" | "progress" | "after" | "mood_board";
  caption?: string;
  projectName?: string;
  roomName?: string;
  uploadedAt: string;
}

const mockPhotos: DesignPhoto[] = [
  {
    id: "p-1",
    url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800",
    type: "inspiration",
    caption: "Living room inspiration - modern minimalist",
    projectName: "Westlake Modern Refresh",
    roomName: "Living Room",
    uploadedAt: "2026-01-20",
  },
  {
    id: "p-2",
    url: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800",
    type: "before",
    caption: "Current living room state",
    projectName: "Westlake Modern Refresh",
    roomName: "Living Room",
    uploadedAt: "2026-01-10",
  },
  {
    id: "p-3",
    url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",
    type: "inspiration",
    caption: "Kitchen redesign concept",
    projectName: "Lakeway Kitchen & Bath",
    roomName: "Kitchen",
    uploadedAt: "2026-01-15",
  },
  {
    id: "p-4",
    url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
    type: "progress",
    caption: "Furniture installation in progress",
    projectName: "Westlake Modern Refresh",
    roomName: "Living Room",
    uploadedAt: "2026-01-22",
  },
  {
    id: "p-5",
    url: "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800",
    type: "after",
    caption: "Completed bedroom design",
    projectName: "Downtown Condo Staging",
    roomName: "Primary Bedroom",
    uploadedAt: "2026-01-25",
  },
  {
    id: "p-6",
    url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800",
    type: "mood_board",
    caption: "Modern coastal mood board",
    uploadedAt: "2026-01-18",
  },
];

const typeConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  inspiration: { label: "Inspiration", color: "#8B5CF6", bgColor: "#EDE9FE" },
  before: { label: "Before", color: "#272D53", bgColor: "#E8E9EE" },
  progress: { label: "Progress", color: "#3B82F6", bgColor: "#DBEAFE" },
  after: { label: "After", color: "#10B981", bgColor: "#D1FAE5" },
  mood_board: { label: "Mood Board", color: "#EC4899", bgColor: "#FCE7F3" },
};

export default function DesignPhotoDocumentationScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedPhoto, setSelectedPhoto] = useState<DesignPhoto | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const filteredPhotos = mockPhotos.filter((photo) => {
    const matchesSearch =
      photo.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.projectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.roomName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || photo.type === selectedType;
    return matchesSearch && matchesType;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Photo Documentation",
          headerStyle: { backgroundColor: Colors.background },
          headerShadowVisible: false,
        }}
      />

      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search photos..."
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === "grid" && styles.toggleActive]}
            onPress={() => setViewMode("grid")}
          >
            <Grid3X3 size={18} color={viewMode === "grid" ? Colors.white : Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === "list" && styles.toggleActive]}
            onPress={() => setViewMode("list")}
          >
            <List size={18} color={viewMode === "list" ? Colors.white : Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.typeFilters}
        contentContainerStyle={styles.typeFiltersContent}
      >
        <TouchableOpacity
          style={[styles.typeChip, selectedType === "all" && styles.typeChipActive]}
          onPress={() => setSelectedType("all")}
        >
          <Text style={[styles.typeChipText, selectedType === "all" && styles.typeChipTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        {Object.entries(typeConfig).map(([type, config]) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.typeChip,
              selectedType === type && styles.typeChipActive,
              selectedType === type && { backgroundColor: config.color },
            ]}
            onPress={() => setSelectedType(type)}
          >
            <Text
              style={[
                styles.typeChipText,
                selectedType === type && styles.typeChipTextActive,
              ]}
            >
              {config.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.listHeader}>
          <Text style={styles.photoCount}>
            {filteredPhotos.length} photo{filteredPhotos.length !== 1 ? "s" : ""}
          </Text>
          <TouchableOpacity style={styles.uploadButton}>
            <Plus size={18} color={Colors.white} />
            <Text style={styles.uploadButtonText}>Upload</Text>
          </TouchableOpacity>
        </View>

        {viewMode === "grid" ? (
          <View style={styles.gridContainer}>
            {filteredPhotos.map((photo) => (
              <TouchableOpacity
                key={photo.id}
                style={styles.gridItem}
                onPress={() => setSelectedPhoto(photo)}
              >
                <Image
                  source={{ uri: photo.url }}
                  style={styles.gridImage}
                  contentFit="cover"
                />
                <View
                  style={[
                    styles.gridTypeBadge,
                    { backgroundColor: typeConfig[photo.type].color },
                  ]}
                >
                  <Text style={styles.gridTypeBadgeText}>
                    {typeConfig[photo.type].label}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filteredPhotos.map((photo) => (
              <TouchableOpacity
                key={photo.id}
                style={styles.listItem}
                onPress={() => setSelectedPhoto(photo)}
              >
                <Image
                  source={{ uri: photo.url }}
                  style={styles.listImage}
                  contentFit="cover"
                />
                <View style={styles.listContent}>
                  <View
                    style={[
                      styles.listTypeBadge,
                      { backgroundColor: typeConfig[photo.type].bgColor },
                    ]}
                  >
                    <Text
                      style={[
                        styles.listTypeBadgeText,
                        { color: typeConfig[photo.type].color },
                      ]}
                    >
                      {typeConfig[photo.type].label}
                    </Text>
                  </View>
                  {photo.caption && (
                    <Text style={styles.listCaption} numberOfLines={2}>
                      {photo.caption}
                    </Text>
                  )}
                  {photo.projectName && (
                    <Text style={styles.listProject}>{photo.projectName}</Text>
                  )}
                  <View style={styles.listMeta}>
                    <Calendar size={12} color={Colors.textTertiary} />
                    <Text style={styles.listDate}>{formatDate(photo.uploadedAt)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {filteredPhotos.length === 0 && (
          <View style={styles.emptyState}>
            <Camera size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Photos Found</Text>
            <Text style={styles.emptyText}>
              Upload photos to document your design projects
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal
        visible={!!selectedPhoto}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedPhoto(null)}
      >
        {selectedPhoto && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setSelectedPhoto(null)}
              >
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Photo Details</Text>
              <TouchableOpacity style={styles.modalClose}>
                <Share2 size={22} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Image
                source={{ uri: selectedPhoto.url }}
                style={styles.modalImage}
                contentFit="cover"
              />

              <View style={styles.modalInfo}>
                <View
                  style={[
                    styles.modalTypeBadge,
                    { backgroundColor: typeConfig[selectedPhoto.type].bgColor },
                  ]}
                >
                  <Text
                    style={[
                      styles.modalTypeBadgeText,
                      { color: typeConfig[selectedPhoto.type].color },
                    ]}
                  >
                    {typeConfig[selectedPhoto.type].label}
                  </Text>
                </View>

                {selectedPhoto.caption && (
                  <Text style={styles.modalCaption}>{selectedPhoto.caption}</Text>
                )}

                <View style={styles.detailRows}>
                  {selectedPhoto.projectName && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Project</Text>
                      <Text style={styles.detailValue}>{selectedPhoto.projectName}</Text>
                    </View>
                  )}
                  {selectedPhoto.roomName && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Room</Text>
                      <Text style={styles.detailValue}>{selectedPhoto.roomName}</Text>
                    </View>
                  )}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Uploaded</Text>
                    <Text style={styles.detailValue}>
                      {formatDate(selectedPhoto.uploadedAt)}
                    </Text>
                  </View>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Download size={20} color="#EC4899" />
                    <Text style={styles.actionButtonText}>Download</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Tag size={20} color={Colors.primary} />
                    <Text style={styles.actionButtonText}>Add Tags</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Trash2 size={20} color={Colors.error} />
                    <Text style={[styles.actionButtonText, { color: Colors.error }]}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
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
  header: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
  },
  viewToggle: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  toggleActive: {
    backgroundColor: "#EC4899",
  },
  typeFilters: {
    maxHeight: 44,
    marginBottom: 8,
  },
  typeFiltersContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    marginRight: 8,
  },
  typeChipActive: {
    backgroundColor: "#EC4899",
  },
  typeChipText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.textSecondary,
  },
  typeChipTextActive: {
    color: Colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  photoCount: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EC4899",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  gridItem: {
    width: "32%",
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  gridImage: {
    width: "100%",
    height: "100%",
  },
  gridTypeBadge: {
    position: "absolute",
    bottom: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  gridTypeBadgeText: {
    fontSize: 9,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  listContainer: {
    gap: 12,
  },
  listItem: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  listImage: {
    width: 100,
    height: 100,
  },
  listContent: {
    flex: 1,
    padding: 12,
  },
  listTypeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 6,
  },
  listTypeBadgeText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  listCaption: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  listProject: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  listMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  listDate: {
    fontSize: 12,
    color: Colors.textTertiary,
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
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: "center",
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
  modalClose: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  modalContent: {
    flex: 1,
  },
  modalImage: {
    width: "100%",
    aspectRatio: 1,
  },
  modalInfo: {
    padding: 20,
  },
  modalTypeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  modalTypeBadgeText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  modalCaption: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 20,
    lineHeight: 26,
  },
  detailRows: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.text,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  actionButton: {
    alignItems: "center",
    gap: 6,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.text,
  },
});
