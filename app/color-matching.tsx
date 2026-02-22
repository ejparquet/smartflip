import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
  Platform,
} from "react-native";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Camera,
  X,
  Crosshair,
  Copy,
  Check,
  Palette,
  Pipette,
  History,
  Trash2,
  Info,
} from "lucide-react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import Colors from "@/constants/colors";
import * as Haptics from "expo-haptics";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface MatchedColor {
  id: string;
  hex: string;
  rgb: { r: number; g: number; b: number };
  matches: PaintMatch[];
  capturedAt: string;
  name?: string;
}

interface PaintMatch {
  brand: string;
  name: string;
  code: string;
  hex: string;
  similarity: number;
}

const paintDatabase: { brand: string; colors: { name: string; code: string; hex: string }[] }[] = [
  {
    brand: "Sherwin-Williams",
    colors: [
      { name: "Agreeable Gray", code: "SW 7029", hex: "#D1CBC1" },
      { name: "Accessible Beige", code: "SW 7036", hex: "#D1C7B8" },
      { name: "Alabaster", code: "SW 7008", hex: "#F0EDE5" },
      { name: "Pure White", code: "SW 7005", hex: "#F1EFEA" },
      { name: "Repose Gray", code: "SW 7015", hex: "#C2BEB6" },
      { name: "Sea Salt", code: "SW 6204", hex: "#CAD5CE" },
      { name: "Naval", code: "SW 6244", hex: "#2F3C4B" },
      { name: "Tricorn Black", code: "SW 6258", hex: "#2F2F30" },
      { name: "Emerald Green", code: "SW 6743", hex: "#006B5B" },
      { name: "Caviar", code: "SW 6990", hex: "#353535" },
      { name: "Snowbound", code: "SW 7004", hex: "#EDEBE6" },
      { name: "Mindful Gray", code: "SW 7016", hex: "#B4AFA7" },
    ],
  },
  {
    brand: "Benjamin Moore",
    colors: [
      { name: "Simply White", code: "OC-117", hex: "#F4F0E5" },
      { name: "White Dove", code: "OC-17", hex: "#F0ECE0" },
      { name: "Chantilly Lace", code: "OC-65", hex: "#F5F2EB" },
      { name: "Hale Navy", code: "HC-154", hex: "#3C4657" },
      { name: "Revere Pewter", code: "HC-172", hex: "#C4BBAB" },
      { name: "Classic Gray", code: "OC-23", hex: "#D9D5CC" },
      { name: "Edgecomb Gray", code: "HC-173", hex: "#D3CCBD" },
      { name: "Chelsea Gray", code: "HC-168", hex: "#8A857D" },
      { name: "Kendall Charcoal", code: "HC-166", hex: "#5A5A5A" },
      { name: "Palladian Blue", code: "HC-144", hex: "#B8D4D2" },
      { name: "Caliente", code: "AF-290", hex: "#A4313A" },
      { name: "October Mist", code: "1495", hex: "#B5C1AB" },
    ],
  },
  {
    brand: "Behr",
    colors: [
      { name: "Ultra Pure White", code: "1850", hex: "#F5F5F5" },
      { name: "Polar Bear", code: "75", hex: "#EEE9DE" },
      { name: "Silver Drop", code: "790C-2", hex: "#C5C2BB" },
      { name: "Blueprint", code: "S530-5", hex: "#2D4A5E" },
      { name: "In The Moment", code: "T18-15", hex: "#5D7771" },
      { name: "Cameo Rose", code: "180C-2", hex: "#E5D4CF" },
      { name: "Wheat Bread", code: "N290-4", hex: "#B5A48F" },
      { name: "Intellectual", code: "N520-4", hex: "#8E8A85" },
      { name: "Black Garnet", code: "PPU18-20", hex: "#3A3634" },
      { name: "Creamy White", code: "YL-W10", hex: "#F5EEDE" },
    ],
  },
  {
    brand: "PPG",
    colors: [
      { name: "Gypsum", code: "PPG1025-2", hex: "#D9D2C5" },
      { name: "Dover White", code: "PPG1001-1", hex: "#EDEBE3" },
      { name: "Olive Sprig", code: "PPG1125-4", hex: "#9FA587" },
      { name: "Chinese Porcelain", code: "PPG1160-6", hex: "#2B4B68" },
      { name: "Thunderous", code: "PPG1043-7", hex: "#3D3F41" },
      { name: "Vining Ivy", code: "PPG1148-6", hex: "#3B6B52" },
      { name: "Red Gumball", code: "PPG1187-7", hex: "#B42D35" },
      { name: "Dusty Miller", code: "PPG1032-2", hex: "#CFC9BD" },
    ],
  },
];

const sampleColors = [
  "#E8DFD0", "#C9B99A", "#8B7355", "#5D4E37",
  "#3E5C76", "#748CAB", "#F0EDE5", "#B8D4D2",
  "#A67B5B", "#D4A574", "#8FBC8F", "#2F4F4F",
];

export default function ColorMatchingScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [matchedColors, setMatchedColors] = useState<MatchedColor[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchedColor | null>(null);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [simulatedColor, setSimulatedColor] = useState<string>("#C9B99A");

  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  };

  const colorDistance = (hex1: string, hex2: string): number => {
    const rgb1 = hexToRgb(hex1);
    const rgb2 = hexToRgb(hex2);
    return Math.sqrt(
      Math.pow(rgb1.r - rgb2.r, 2) +
      Math.pow(rgb1.g - rgb2.g, 2) +
      Math.pow(rgb1.b - rgb2.b, 2)
    );
  };

  const findMatchingPaints = (hex: string): PaintMatch[] => {
    const allMatches: PaintMatch[] = [];

    paintDatabase.forEach((brand) => {
      brand.colors.forEach((color) => {
        const distance = colorDistance(hex, color.hex);
        const similarity = Math.max(0, 100 - (distance / 4.41));
        allMatches.push({
          brand: brand.brand,
          name: color.name,
          code: color.code,
          hex: color.hex,
          similarity: Math.round(similarity),
        });
      });
    });

    return allMatches.sort((a, b) => b.similarity - a.similarity).slice(0, 8);
  };

  const handleColorCapture = (hex: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const rgb = hexToRgb(hex);
    const matches = findMatchingPaints(hex);

    const newMatch: MatchedColor = {
      id: Date.now().toString(),
      hex,
      rgb,
      matches,
      capturedAt: new Date().toISOString(),
    };

    setMatchedColors([newMatch, ...matchedColors]);
    setSelectedMatch(newMatch);
    setShowCamera(false);
  };

  const handleCopyColor = (hex: string) => {
    setCopiedColor(hex);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const handleDeleteMatch = (id: string) => {
    setMatchedColors(matchedColors.filter((m) => m.id !== id));
    if (selectedMatch?.id === id) {
      setSelectedMatch(null);
    }
  };

  const openCamera = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) return;
    }
    setShowCamera(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getContrastColor = (hex: string): string => {
    const rgb = hexToRgb(hex);
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness > 128 ? "#000000" : "#FFFFFF";
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Color Matching",
          headerStyle: { backgroundColor: Colors.background },
          headerShadowVisible: false,
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <Pipette size={32} color="#272D53" />
          </View>
          <Text style={styles.heroTitle}>Match Any Color</Text>
          <Text style={styles.heroSubtitle}>
            Capture colors from photos or your environment and find the perfect paint match
          </Text>
        </View>

        <TouchableOpacity style={styles.captureButton} onPress={openCamera}>
          <View style={styles.captureButtonInner}>
            <Camera size={24} color={Colors.white} />
            <Text style={styles.captureButtonText}>Open Camera</Text>
          </View>
          <Text style={styles.captureHint}>Point at any surface to match its color</Text>
        </TouchableOpacity>

        <View style={styles.simulatorSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Color Test</Text>
            <Text style={styles.sectionSubtitle}>Tap a color to see matches</Text>
          </View>

          <View style={styles.colorSamples}>
            {sampleColors.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.sampleColor,
                  { backgroundColor: color },
                  simulatedColor === color && styles.sampleColorActive,
                ]}
                onPress={() => {
                  setSimulatedColor(color);
                  handleColorCapture(color);
                }}
              >
                {simulatedColor === color && (
                  <Check size={16} color={getContrastColor(color)} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {matchedColors.length > 0 && (
          <View style={styles.historySection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <History size={18} color={Colors.textSecondary} />
                <Text style={styles.sectionTitle}>Recent Matches</Text>
              </View>
              <Text style={styles.matchCount}>{matchedColors.length} colors</Text>
            </View>

            {matchedColors.map((match) => (
              <TouchableOpacity
                key={match.id}
                style={[
                  styles.historyCard,
                  selectedMatch?.id === match.id && styles.historyCardActive,
                ]}
                onPress={() => setSelectedMatch(match)}
              >
                <View style={[styles.historyColor, { backgroundColor: match.hex }]} />
                <View style={styles.historyInfo}>
                  <Text style={styles.historyHex}>{match.hex.toUpperCase()}</Text>
                  <Text style={styles.historyMeta}>
                    RGB({match.rgb.r}, {match.rgb.g}, {match.rgb.b})
                  </Text>
                  <Text style={styles.historyDate}>{formatDate(match.capturedAt)}</Text>
                </View>
                <View style={styles.historyActions}>
                  <Text style={styles.matchCountBadge}>
                    {match.matches.length} matches
                  </Text>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteMatch(match.id)}
                  >
                    <Trash2 size={16} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {selectedMatch && (
          <View style={styles.matchResultsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Paint Matches</Text>
              <View style={styles.selectedColorPreview}>
                <View style={[styles.previewSwatch, { backgroundColor: selectedMatch.hex }]} />
                <Text style={styles.previewHex}>{selectedMatch.hex.toUpperCase()}</Text>
              </View>
            </View>

            {selectedMatch.matches.map((paint, index) => (
              <TouchableOpacity
                key={`${paint.brand}-${paint.code}`}
                style={styles.paintMatchCard}
                onPress={() => handleCopyColor(paint.hex)}
              >
                <View style={styles.paintMatchRank}>
                  <Text style={styles.rankNumber}>#{index + 1}</Text>
                </View>
                <View style={[styles.paintSwatch, { backgroundColor: paint.hex }]} />
                <View style={styles.paintInfo}>
                  <Text style={styles.paintBrand}>{paint.brand}</Text>
                  <Text style={styles.paintName}>{paint.name}</Text>
                  <Text style={styles.paintCode}>{paint.code}</Text>
                </View>
                <View style={styles.paintSimilarity}>
                  <View style={styles.similarityBar}>
                    <View
                      style={[
                        styles.similarityFill,
                        {
                          width: `${paint.similarity}%`,
                          backgroundColor:
                            paint.similarity >= 90
                              ? "#10B981"
                              : paint.similarity >= 75
                              ? "#272D53"
                              : "#EF4444",
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.similarityText}>{paint.similarity}%</Text>
                </View>
                <View style={styles.copyIcon}>
                  {copiedColor === paint.hex ? (
                    <Check size={18} color="#10B981" />
                  ) : (
                    <Copy size={18} color={Colors.textTertiary} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.tipsSection}>
          <View style={styles.tipCard}>
            <Info size={20} color="#272D53" />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Pro Tips for Accurate Matching</Text>
              <Text style={styles.tipText}>
                • Use natural daylight for best results{"\n"}
                • Clean the surface before capturing{"\n"}
                • Take multiple samples from different areas{"\n"}
                • Paint colors can vary by finish (matte vs. gloss)
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal
        visible={showCamera}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowCamera(false)}
      >
        <View style={styles.cameraContainer}>
          {Platform.OS !== "web" ? (
            <CameraView style={styles.camera}>
              <SafeAreaView style={styles.cameraOverlay}>
                <View style={styles.cameraHeader}>
                  <TouchableOpacity
                    style={styles.cameraCloseButton}
                    onPress={() => setShowCamera(false)}
                  >
                    <X size={24} color={Colors.white} />
                  </TouchableOpacity>
                  <Text style={styles.cameraTitle}>Point at a Color</Text>
                  <View style={{ width: 44 }} />
                </View>

                <View style={styles.crosshairContainer}>
                  <View style={styles.crosshairOuter}>
                    <View style={styles.crosshairInner}>
                      <Crosshair size={40} color={Colors.white} />
                    </View>
                  </View>
                  <Text style={styles.crosshairHint}>
                    Center the color in the viewfinder
                  </Text>
                </View>

                <View style={styles.cameraFooter}>
                  <Text style={styles.cameraInstruction}>
                    Tap a sample color below to simulate capture
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.cameraSamples}>
                      {sampleColors.map((color) => (
                        <TouchableOpacity
                          key={color}
                          style={[styles.cameraSample, { backgroundColor: color }]}
                          onPress={() => handleColorCapture(color)}
                        />
                      ))}
                    </View>
                  </ScrollView>
                </View>
              </SafeAreaView>
            </CameraView>
          ) : (
            <View style={styles.webCameraFallback}>
              <SafeAreaView style={styles.cameraOverlay}>
                <View style={styles.cameraHeader}>
                  <TouchableOpacity
                    style={styles.cameraCloseButton}
                    onPress={() => setShowCamera(false)}
                  >
                    <X size={24} color={Colors.white} />
                  </TouchableOpacity>
                  <Text style={styles.cameraTitle}>Color Picker</Text>
                  <View style={{ width: 44 }} />
                </View>

                <View style={styles.webPickerContent}>
                  <Palette size={64} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.webPickerTitle}>
                    Camera not available on web
                  </Text>
                  <Text style={styles.webPickerText}>
                    Select a sample color below to test the matching feature
                  </Text>
                </View>

                <View style={styles.cameraFooter}>
                  <Text style={styles.cameraInstruction}>
                    Tap a color to match
                  </Text>
                  <View style={styles.webColorGrid}>
                    {sampleColors.map((color) => (
                      <TouchableOpacity
                        key={color}
                        style={[styles.webColorSample, { backgroundColor: color }]}
                        onPress={() => handleColorCapture(color)}
                      />
                    ))}
                  </View>
                </View>
              </SafeAreaView>
            </View>
          )}
        </View>
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
  heroSection: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 24,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FFF7ED",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "800" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  captureButton: {
    backgroundColor: "#272D53",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#272D53",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  captureButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  captureButtonText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  captureHint: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginTop: 8,
  },
  simulatorSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  matchCount: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  colorSamples: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  sampleColor: {
    width: (SCREEN_WIDTH - 70) / 6,
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  sampleColorActive: {
    borderColor: Colors.text,
  },
  historySection: {
    marginBottom: 24,
  },
  historyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "transparent",
  },
  historyCardActive: {
    borderColor: "#272D53",
  },
  historyColor: {
    width: 50,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  historyInfo: {
    flex: 1,
    marginLeft: 14,
  },
  historyHex: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  historyMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  historyDate: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  historyActions: {
    alignItems: "flex-end",
    gap: 8,
  },
  matchCountBadge: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: "#272D53",
    backgroundColor: "#FFF7ED",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  deleteButton: {
    padding: 6,
  },
  matchResultsSection: {
    marginBottom: 24,
  },
  selectedColorPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  previewSwatch: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  previewHex: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  paintMatchCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  paintMatchRank: {
    width: 28,
    alignItems: "center",
  },
  rankNumber: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: Colors.textTertiary,
  },
  paintSwatch: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginLeft: 8,
  },
  paintInfo: {
    flex: 1,
    marginLeft: 14,
  },
  paintBrand: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: "#272D53",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  paintName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
    marginTop: 2,
  },
  paintCode: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  paintSimilarity: {
    alignItems: "flex-end",
    marginRight: 10,
  },
  similarityBar: {
    width: 50,
    height: 6,
    backgroundColor: Colors.borderLight,
    borderRadius: 3,
    overflow: "hidden",
  },
  similarityFill: {
    height: "100%",
    borderRadius: 3,
  },
  similarityText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  copyIcon: {
    width: 32,
    alignItems: "center",
  },
  tipsSection: {
    marginBottom: 24,
  },
  tipCard: {
    flexDirection: "row",
    backgroundColor: "#FFF7ED",
    borderRadius: 14,
    padding: 16,
    gap: 14,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
  },
  cameraHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  cameraCloseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  crosshairContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  crosshairOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  crosshairInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  crosshairHint: {
    fontSize: 14,
    color: Colors.white,
    marginTop: 20,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cameraFooter: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  cameraInstruction: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginBottom: 16,
  },
  cameraSamples: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 10,
  },
  cameraSample: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: Colors.white,
  },
  webCameraFallback: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  webPickerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  webPickerTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: Colors.white,
    marginTop: 24,
    marginBottom: 10,
  },
  webPickerText: {
    fontSize: 15,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    lineHeight: 22,
  },
  webColorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 14,
    paddingVertical: 10,
  },
  webColorSample: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: Colors.white,
  },
});
