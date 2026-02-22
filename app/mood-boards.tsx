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
  Plus,
  Grid3X3,
  List,
  X,
  Palette,
  Calendar,
  Edit3,
  Trash2,
  Copy,
  Share2,
  Image as ImageIcon,
  Move,
  Check,
  FolderOpen,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { Alert, Platform } from "react-native";
import Colors from "@/constants/colors";
import { mockMoodBoards, MoodBoard, DesignStyle } from "@/mocks/interior-designers";

const styleLabels: Record<DesignStyle, string> = {
  modern: "Modern",
  traditional: "Traditional",
  transitional: "Transitional",
  minimalist: "Minimalist",
  bohemian: "Bohemian",
  industrial: "Industrial",
  scandinavian: "Scandinavian",
  mid_century: "Mid-Century",
  coastal: "Coastal",
  farmhouse: "Farmhouse",
  contemporary: "Contemporary",
  eclectic: "Eclectic",
};

export default function MoodBoardsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedBoard, setSelectedBoard] = useState<MoodBoard | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [boards, setBoards] = useState(mockMoodBoards);
  const [newBoardName, setNewBoardName] = useState("");
  const [newBoardStyle, setNewBoardStyle] = useState<DesignStyle>("modern");
  const [newBoardNotes, setNewBoardNotes] = useState("");
  const [newBoardImages, setNewBoardImages] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const filteredBoards = boards.filter(
    (board) =>
      board.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      styleLabels[board.style].toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          title: "Mood Boards",
          headerStyle: { backgroundColor: Colors.background },
          headerShadowVisible: false,
        }}
      />

      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search mood boards..."
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.boardsHeader}>
          <Text style={styles.boardsCount}>
            {filteredBoards.length} Board{filteredBoards.length !== 1 ? "s" : ""}
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Plus size={18} color={Colors.white} />
            <Text style={styles.createButtonText}>New Board</Text>
          </TouchableOpacity>
        </View>

        {viewMode === "grid" ? (
          <View style={styles.gridContainer}>
            {filteredBoards.map((board) => (
              <TouchableOpacity
                key={board.id}
                style={styles.gridCard}
                onPress={() => setSelectedBoard(board)}
              >
                <View style={styles.gridImageContainer}>
                  {board.images.slice(0, 4).map((image, index) => (
                    <Image
                      key={index}
                      source={{ uri: image }}
                      style={[
                        styles.gridImage,
                        board.images.length === 1 && styles.gridImageFull,
                        board.images.length === 2 && styles.gridImageHalf,
                      ]}
                      contentFit="cover"
                    />
                  ))}
                </View>
                <View style={styles.gridCardContent}>
                  <Text style={styles.gridCardTitle} numberOfLines={1}>
                    {board.name}
                  </Text>
                  <View style={styles.gridCardMeta}>
                    <View style={styles.styleBadge}>
                      <Text style={styles.styleBadgeText}>{styleLabels[board.style]}</Text>
                    </View>
                  </View>
                  <View style={styles.colorSwatches}>
                    {board.colorPalette.slice(0, 5).map((color, index) => (
                      <View
                        key={index}
                        style={[styles.colorSwatch, { backgroundColor: color }]}
                      />
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filteredBoards.map((board) => (
              <TouchableOpacity
                key={board.id}
                style={styles.listCard}
                onPress={() => setSelectedBoard(board)}
              >
                <Image
                  source={{ uri: board.images[0] }}
                  style={styles.listImage}
                  contentFit="cover"
                />
                <View style={styles.listCardContent}>
                  <Text style={styles.listCardTitle}>{board.name}</Text>
                  <View style={styles.styleBadge}>
                    <Text style={styles.styleBadgeText}>{styleLabels[board.style]}</Text>
                  </View>
                  <View style={styles.listMeta}>
                    <Calendar size={12} color={Colors.textTertiary} />
                    <Text style={styles.listMetaText}>
                      Updated {formatDate(board.updatedAt)}
                    </Text>
                  </View>
                  <View style={styles.colorSwatches}>
                    {board.colorPalette.slice(0, 5).map((color, index) => (
                      <View
                        key={index}
                        style={[styles.colorSwatch, { backgroundColor: color }]}
                      />
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {filteredBoards.length === 0 && (
          <View style={styles.emptyState}>
            <Palette size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Mood Boards Found</Text>
            <Text style={styles.emptyText}>
              Create your first mood board to get started
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal
        visible={!!selectedBoard}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedBoard(null)}
      >
        {selectedBoard && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setSelectedBoard(null)}
              >
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle} numberOfLines={1}>
                {selectedBoard.name}
              </Text>
              <TouchableOpacity style={styles.modalClose}>
                <Share2 size={22} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.modalMeta}>
                <View style={styles.styleBadgeLarge}>
                  <Text style={styles.styleBadgeLargeText}>
                    {styleLabels[selectedBoard.style]}
                  </Text>
                </View>
                <Text style={styles.modalDate}>
                  Updated {formatDate(selectedBoard.updatedAt)}
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Color Palette</Text>
                <View style={styles.paletteContainer}>
                  {selectedBoard.colorPalette.map((color, index) => (
                    <View key={index} style={styles.paletteItem}>
                      <View
                        style={[styles.paletteColor, { backgroundColor: color }]}
                      />
                      <Text style={styles.paletteHex}>{color}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Inspiration Images ({selectedBoard.images.length})
                </Text>
                <View style={styles.imagesGrid}>
                  {selectedBoard.images.map((image, index) => (
                    <Image
                      key={index}
                      source={{ uri: image }}
                      style={styles.modalImage}
                      contentFit="cover"
                    />
                  ))}
                </View>
              </View>

              {selectedBoard.notes && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Notes</Text>
                  <View style={styles.notesContainer}>
                    <Text style={styles.notesText}>{selectedBoard.notes}</Text>
                  </View>
                </View>
              )}

              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => {
                    setNewBoardName(selectedBoard.name);
                    setNewBoardStyle(selectedBoard.style);
                    setNewBoardNotes(selectedBoard.notes || "");
                    setNewBoardImages(selectedBoard.images);
                    setIsEditing(true);
                    setSelectedBoard(null);
                    setShowCreateModal(true);
                  }}
                >
                  <Edit3 size={18} color="#EC4899" />
                  <Text style={[styles.actionButtonText, { color: "#EC4899" }]}>
                    Edit
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => {
                    const duplicatedBoard: MoodBoard = {
                      ...selectedBoard,
                      id: `mb-${Date.now()}`,
                      name: `${selectedBoard.name} (Copy)`,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    };
                    setBoards([duplicatedBoard, ...boards]);
                    setSelectedBoard(null);
                    Alert.alert("Success", "Board duplicated successfully!");
                  }}
                >
                  <Copy size={18} color={Colors.primary} />
                  <Text style={[styles.actionButtonText, { color: Colors.primary }]}>
                    Duplicate
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => {
                    Alert.alert(
                      "Delete Board",
                      "Are you sure you want to delete this mood board?",
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Delete",
                          style: "destructive",
                          onPress: () => {
                            setBoards(boards.filter(b => b.id !== selectedBoard.id));
                            setSelectedBoard(null);
                          },
                        },
                      ]
                    );
                  }}
                >
                  <Trash2 size={18} color={Colors.error} />
                  <Text style={[styles.actionButtonText, { color: Colors.error }]}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>

      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowCreateModal(false)}
            >
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Mood Board</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView style={styles.formContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Board Name</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g., Living Room Inspiration"
                placeholderTextColor={Colors.textTertiary}
                value={newBoardName}
                onChangeText={setNewBoardName}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Design Style</Text>
              <View style={styles.styleGrid}>
                {Object.entries(styleLabels).map(([key, label]) => (
                  <TouchableOpacity 
                    key={key} 
                    style={[styles.styleOption, newBoardStyle === key && styles.styleOptionActive]}
                    onPress={() => setNewBoardStyle(key as DesignStyle)}
                  >
                    <Text style={[styles.styleOptionText, newBoardStyle === key && styles.styleOptionTextActive]}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Link to Project (Optional)</Text>
              <TouchableOpacity style={styles.selectButton}>
                <Text style={styles.selectButtonText}>Select Project</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Add Images</Text>
              {newBoardImages.length > 0 && (
                <View style={styles.imagePreviewGrid}>
                  {newBoardImages.map((img, idx) => (
                    <View key={idx} style={styles.imagePreviewItem}>
                      <Image source={{ uri: img }} style={styles.imagePreview} contentFit="cover" />
                      <TouchableOpacity
                        style={styles.removeImageBtn}
                        onPress={() => setNewBoardImages(newBoardImages.filter((_, i) => i !== idx))}
                      >
                        <X size={14} color={Colors.white} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
              <TouchableOpacity 
                style={styles.addImagesButton}
                onPress={async () => {
                  if (Platform.OS !== "web") {
                    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                    if (status !== "granted") {
                      Alert.alert("Permission needed", "Please grant camera roll permissions to add images.");
                      return;
                    }
                  }
                  const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsMultipleSelection: true,
                    quality: 0.8,
                  });
                  if (!result.canceled && result.assets) {
                    setNewBoardImages([...newBoardImages, ...result.assets.map(a => a.uri)]);
                  }
                }}
              >
                <Plus size={24} color={Colors.textSecondary} />
                <Text style={styles.addImagesText}>Tap to add inspiration images</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Notes</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                placeholder="Add any notes or ideas..."
                placeholderTextColor={Colors.textTertiary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={newBoardNotes}
                onChangeText={setNewBoardNotes}
              />
            </View>
          </ScrollView>

          <View style={styles.formFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowCreateModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={() => {
                if (!newBoardName.trim()) {
                  Alert.alert("Error", "Please enter a board name");
                  return;
                }
                if (isEditing && selectedBoard) {
                  setBoards(boards.map(b => 
                    b.id === selectedBoard.id 
                      ? { ...b, name: newBoardName, style: newBoardStyle, notes: newBoardNotes, images: newBoardImages, updatedAt: new Date().toISOString() }
                      : b
                  ));
                  Alert.alert("Success", "Board updated successfully!");
                } else {
                  const newBoard: MoodBoard = {
                    id: `mb-${Date.now()}`,
                    projectId: selectedProject || undefined,
                    name: newBoardName,
                    style: newBoardStyle,
                    colorPalette: ["#2C3E50", "#ECF0F1", "#D4A574", "#1ABC9C", "#95A5A6"],
                    images: newBoardImages.length > 0 ? newBoardImages : ["https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400"],
                    notes: newBoardNotes || undefined,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  };
                  setBoards([newBoard, ...boards]);
                  Alert.alert("Success", "Board created successfully!");
                }
                setShowCreateModal(false);
                setNewBoardName("");
                setNewBoardStyle("modern");
                setNewBoardNotes("");
                setNewBoardImages([]);
                setSelectedProject(null);
                setIsEditing(false);
              }}
            >
              <Text style={styles.saveButtonText}>{isEditing ? "Update Board" : "Create Board"}</Text>
            </TouchableOpacity>
          </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  boardsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  boardsCount: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EC4899",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  gridCard: {
    width: "48%",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  gridImageContainer: {
    height: 140,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  gridImage: {
    width: "50%",
    height: "50%",
  },
  gridImageFull: {
    width: "100%",
    height: "100%",
  },
  gridImageHalf: {
    width: "50%",
    height: "100%",
  },
  gridCardContent: {
    padding: 12,
  },
  gridCardTitle: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  gridCardMeta: {
    marginBottom: 10,
  },
  styleBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FCE7F3",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  styleBadgeText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: "#EC4899",
  },
  colorSwatches: {
    flexDirection: "row",
    gap: 4,
  },
  colorSwatch: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  listContainer: {
    gap: 12,
  },
  listCard: {
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
    height: 120,
  },
  listCardContent: {
    flex: 1,
    padding: 14,
    justifyContent: "space-between",
  },
  listCardTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 6,
  },
  listMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
    marginBottom: 10,
  },
  listMetaText: {
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
    flex: 1,
    textAlign: "center",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  styleBadgeLarge: {
    backgroundColor: "#FCE7F3",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  styleBadgeLargeText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#EC4899",
  },
  modalDate: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 14,
  },
  paletteContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  paletteItem: {
    alignItems: "center",
    gap: 6,
  },
  paletteColor: {
    width: 56,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  paletteHex: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: "500" as const,
  },
  imagesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  modalImage: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: 12,
  },
  notesContainer: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 14,
  },
  notesText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginTop: 16,
  },
  actionButton: {
    alignItems: "center",
    gap: 6,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "500" as const,
  },
  formContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 10,
  },
  formInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  textArea: {
    height: 100,
    paddingTop: 14,
  },
  styleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  styleOption: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  styleOptionText: {
    fontSize: 14,
    color: Colors.text,
  },
  selectButton: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderStyle: "dashed",
    alignItems: "center",
  },
  selectButtonText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  addImagesButton: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 32,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderStyle: "dashed",
    alignItems: "center",
    gap: 8,
  },
  addImagesText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  formFooter: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#EC4899",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  styleOptionActive: {
    backgroundColor: "#FCE7F3",
    borderColor: "#EC4899",
  },
  styleOptionTextActive: {
    color: "#EC4899",
    fontWeight: "600" as const,
  },
  imagePreviewGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 8,
    marginBottom: 12,
  },
  imagePreviewItem: {
    position: "relative" as const,
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: "hidden" as const,
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  removeImageBtn: {
    position: "absolute" as const,
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
});
