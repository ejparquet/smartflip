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
import {
  Plus,
  X,
  Palette,
  Copy,
  Edit3,
  Trash2,
  Check,
  Droplet,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { mockColorPalettes, ColorPalette, PaletteColor, DesignStyle } from "@/mocks/interior-designers";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

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

const popularColors = [
  { hex: "#FFFFFF", name: "White" },
  { hex: "#F5F5F4", name: "Off-White" },
  { hex: "#E5E5E5", name: "Light Gray" },
  { hex: "#A3A3A3", name: "Gray" },
  { hex: "#525252", name: "Dark Gray" },
  { hex: "#1F2937", name: "Charcoal" },
  { hex: "#1E3A5F", name: "Navy" },
  { hex: "#3B82F6", name: "Blue" },
  { hex: "#06B6D4", name: "Teal" },
  { hex: "#10B981", name: "Green" },
  { hex: "#84CC16", name: "Lime" },
  { hex: "#EAB308", name: "Yellow" },
  { hex: "#272D53", name: "Amber" },
  { hex: "#272D53", name: "Orange" },
  { hex: "#EF4444", name: "Red" },
  { hex: "#EC4899", name: "Pink" },
  { hex: "#8B5CF6", name: "Purple" },
  { hex: "#C4B5A0", name: "Taupe" },
  { hex: "#A67B5B", name: "Tan" },
  { hex: "#8B4513", name: "Brown" },
];

export default function ColorPaletteScreen() {
  const [palettes, setPalettes] = useState<ColorPalette[]>(mockColorPalettes);
  const [selectedPalette, setSelectedPalette] = useState<ColorPalette | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [newPalette, setNewPalette] = useState({
    name: "",
    style: "modern" as DesignStyle,
    colors: [] as { hex: string; name: string; type: "primary" | "secondary" | "accent" | "neutral" }[],
  });

  const handleCopyColor = (hex: string) => {
    setCopiedColor(hex);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const addColorToPalette = (color: { hex: string; name: string }) => {
    if (newPalette.colors.length >= 6) return;
    const type = newPalette.colors.length === 0 ? "primary" : 
                 newPalette.colors.length === 1 ? "secondary" : 
                 newPalette.colors.length < 4 ? "accent" : "neutral";
    setNewPalette({
      ...newPalette,
      colors: [...newPalette.colors, { ...color, type, id: Date.now().toString() } as any],
    });
  };

  const removeColorFromPalette = (hex: string) => {
    setNewPalette({
      ...newPalette,
      colors: newPalette.colors.filter(c => c.hex !== hex),
    });
  };

  const handleCreatePalette = () => {
    if (newPalette.name && newPalette.colors.length >= 2) {
      const palette: ColorPalette = {
        id: Date.now().toString(),
        name: newPalette.name,
        style: newPalette.style,
        colors: newPalette.colors.map((c, i) => ({
          id: `c-${Date.now()}-${i}`,
          hex: c.hex,
          name: c.name,
          type: c.type,
        })),
        createdAt: new Date().toISOString().split("T")[0],
      };
      setPalettes([palette, ...palettes]);
      setNewPalette({ name: "", style: "modern", colors: [] });
      setShowCreateModal(false);
    }
  };

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
          title: "Color Palettes",
          headerStyle: { backgroundColor: Colors.background },
          headerShadowVisible: false,
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>My Palettes</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Plus size={18} color={Colors.white} />
            <Text style={styles.createButtonText}>New Palette</Text>
          </TouchableOpacity>
        </View>

        {palettes.map((palette) => (
          <TouchableOpacity
            key={palette.id}
            style={styles.paletteCard}
            onPress={() => setSelectedPalette(palette)}
          >
            <View style={styles.paletteHeader}>
              <View>
                <Text style={styles.paletteName}>{palette.name}</Text>
                <View style={styles.paletteMeta}>
                  <View style={styles.styleBadge}>
                    <Text style={styles.styleBadgeText}>
                      {styleLabels[palette.style]}
                    </Text>
                  </View>
                  <Text style={styles.paletteDate}>
                    {formatDate(palette.createdAt)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.colorStrip}>
              {palette.colors.map((color, index) => (
                <TouchableOpacity
                  key={color.id}
                  style={[
                    styles.colorBlock,
                    { backgroundColor: color.hex },
                    index === 0 && styles.colorBlockFirst,
                    index === palette.colors.length - 1 && styles.colorBlockLast,
                  ]}
                  onPress={() => handleCopyColor(color.hex)}
                >
                  {copiedColor === color.hex && (
                    <View style={styles.copiedOverlay}>
                      <Check size={16} color={Colors.white} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.colorLabels}>
              {palette.colors.map((color) => (
                <View key={color.id} style={styles.colorLabel}>
                  <Text style={styles.colorName} numberOfLines={1}>
                    {color.name}
                  </Text>
                  <Text style={styles.colorHex}>{color.hex}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        ))}

        {palettes.length === 0 && (
          <View style={styles.emptyState}>
            <Palette size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Palettes Yet</Text>
            <Text style={styles.emptyText}>
              Create your first color palette to get started
            </Text>
          </View>
        )}

        <View style={styles.popularSection}>
          <Text style={styles.sectionTitle}>Popular Colors</Text>
          <View style={styles.popularGrid}>
            {popularColors.map((color) => (
              <TouchableOpacity
                key={color.hex}
                style={styles.popularColor}
                onPress={() => handleCopyColor(color.hex)}
              >
                <View
                  style={[styles.popularSwatch, { backgroundColor: color.hex }]}
                >
                  {copiedColor === color.hex && (
                    <Check size={14} color={color.hex === "#FFFFFF" ? Colors.text : Colors.white} />
                  )}
                </View>
                <Text style={styles.popularName} numberOfLines={1}>
                  {color.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal
        visible={!!selectedPalette}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedPalette(null)}
      >
        {selectedPalette && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setSelectedPalette(null)}
              >
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{selectedPalette.name}</Text>
              <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.modalMeta}>
                <View style={styles.styleBadgeLarge}>
                  <Text style={styles.styleBadgeLargeText}>
                    {styleLabels[selectedPalette.style]}
                  </Text>
                </View>
              </View>

              <View style={styles.detailColors}>
                {selectedPalette.colors.map((color) => (
                  <TouchableOpacity
                    key={color.id}
                    style={styles.detailColorRow}
                    onPress={() => handleCopyColor(color.hex)}
                  >
                    <View
                      style={[styles.detailSwatch, { backgroundColor: color.hex }]}
                    />
                    <View style={styles.detailColorInfo}>
                      <Text style={styles.detailColorName}>{color.name}</Text>
                      <Text style={styles.detailColorType}>
                        {color.type.charAt(0).toUpperCase() + color.type.slice(1)}
                      </Text>
                    </View>
                    <View style={styles.detailColorCodes}>
                      <Text style={styles.detailHex}>{color.hex}</Text>
                      {color.paintBrand && (
                        <Text style={styles.detailPaint}>
                          {color.paintBrand} {color.paintCode}
                        </Text>
                      )}
                    </View>
                    <View style={styles.copyButton}>
                      {copiedColor === color.hex ? (
                        <Check size={18} color="#10B981" />
                      ) : (
                        <Copy size={18} color={Colors.textSecondary} />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionButton}>
                  <Edit3 size={18} color="#EC4899" />
                  <Text style={[styles.actionButtonText, { color: "#EC4899" }]}>
                    Edit
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Copy size={18} color={Colors.primary} />
                  <Text style={[styles.actionButtonText, { color: Colors.primary }]}>
                    Duplicate
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
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
            <Text style={styles.modalTitle}>New Palette</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView style={styles.formContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Palette Name</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g., Living Room Palette"
                placeholderTextColor={Colors.textTertiary}
                value={newPalette.name}
                onChangeText={(text) => setNewPalette({ ...newPalette, name: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Design Style</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.styleOptions}>
                  {Object.entries(styleLabels).map(([key, label]) => (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.styleOption,
                        newPalette.style === key && styles.styleOptionActive,
                      ]}
                      onPress={() =>
                        setNewPalette({ ...newPalette, style: key as DesignStyle })
                      }
                    >
                      <Text
                        style={[
                          styles.styleOptionText,
                          newPalette.style === key && styles.styleOptionTextActive,
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                Selected Colors ({newPalette.colors.length}/6)
              </Text>
              {newPalette.colors.length > 0 ? (
                <View style={styles.selectedColors}>
                  {newPalette.colors.map((color) => (
                    <TouchableOpacity
                      key={color.hex}
                      style={styles.selectedColor}
                      onPress={() => removeColorFromPalette(color.hex)}
                    >
                      <View
                        style={[
                          styles.selectedSwatch,
                          { backgroundColor: color.hex },
                        ]}
                      >
                        <X size={14} color={Colors.white} />
                      </View>
                      <Text style={styles.selectedName}>{color.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={styles.noColorsText}>
                  Tap colors below to add them
                </Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Choose Colors</Text>
              <View style={styles.colorPicker}>
                {popularColors.map((color) => (
                  <TouchableOpacity
                    key={color.hex}
                    style={[
                      styles.pickerColor,
                      newPalette.colors.some((c) => c.hex === color.hex) &&
                        styles.pickerColorSelected,
                    ]}
                    onPress={() => addColorToPalette(color)}
                    disabled={newPalette.colors.some((c) => c.hex === color.hex)}
                  >
                    <View
                      style={[styles.pickerSwatch, { backgroundColor: color.hex }]}
                    >
                      {newPalette.colors.some((c) => c.hex === color.hex) && (
                        <Check
                          size={14}
                          color={color.hex === "#FFFFFF" ? Colors.text : Colors.white}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
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
              style={[
                styles.saveButton,
                (!newPalette.name || newPalette.colors.length < 2) &&
                  styles.saveButtonDisabled,
              ]}
              onPress={handleCreatePalette}
              disabled={!newPalette.name || newPalette.colors.length < 2}
            >
              <Text style={styles.saveButtonText}>Create Palette</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
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
  paletteCard: {
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
  paletteHeader: {
    marginBottom: 14,
  },
  paletteName: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  paletteMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 6,
  },
  styleBadge: {
    backgroundColor: "#FCE7F3",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  styleBadgeText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#EC4899",
  },
  paletteDate: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  colorStrip: {
    flexDirection: "row",
    height: 56,
    borderRadius: 12,
    overflow: "hidden",
  },
  colorBlock: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  colorBlockFirst: {
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  colorBlockLast: {
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  copiedOverlay: {
    backgroundColor: "rgba(0,0,0,0.4)",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  colorLabels: {
    flexDirection: "row",
    marginTop: 10,
  },
  colorLabel: {
    flex: 1,
    alignItems: "center",
  },
  colorName: {
    fontSize: 11,
    color: Colors.text,
    fontWeight: "500" as const,
  },
  colorHex: {
    fontSize: 10,
    color: Colors.textTertiary,
    marginTop: 2,
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
  popularSection: {
    marginTop: 24,
  },
  popularGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14,
  },
  popularColor: {
    width: "18%",
    alignItems: "center",
  },
  popularSwatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
  },
  popularName: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 4,
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
    padding: 20,
  },
  modalMeta: {
    marginBottom: 24,
  },
  styleBadgeLarge: {
    alignSelf: "flex-start",
    backgroundColor: "#FCE7F3",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  styleBadgeLargeText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#EC4899",
  },
  detailColors: {
    gap: 10,
  },
  detailColorRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 12,
  },
  detailSwatch: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  detailColorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  detailColorName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  detailColorType: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  detailColorCodes: {
    alignItems: "flex-end",
    marginRight: 12,
  },
  detailHex: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.text,
  },
  detailPaint: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  copyButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginTop: 24,
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
  styleOptions: {
    flexDirection: "row",
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
  styleOptionActive: {
    backgroundColor: "#FCE7F3",
    borderColor: "#EC4899",
  },
  styleOptionText: {
    fontSize: 14,
    color: Colors.text,
  },
  styleOptionTextActive: {
    color: "#EC4899",
    fontWeight: "600" as const,
  },
  selectedColors: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  selectedColor: {
    alignItems: "center",
  },
  selectedSwatch: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.white,
  },
  selectedName: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  noColorsText: {
    fontSize: 14,
    color: Colors.textTertiary,
    fontStyle: "italic",
  },
  colorPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  pickerColor: {
    opacity: 1,
  },
  pickerColorSelected: {
    opacity: 0.5,
  },
  pickerSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
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
  saveButtonDisabled: {
    backgroundColor: Colors.border,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.white,
  },
});
