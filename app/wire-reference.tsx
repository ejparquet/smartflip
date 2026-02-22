import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import * as Haptics from "expo-haptics";
import {
  ArrowLeft,
  Search,
  Cable,
  Zap,
  Thermometer,
  Ruler,
  ChevronDown,
  ChevronUp,
  Info,
  BookOpen,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";

interface WireData {
  awg: string;
  kcmil?: number;
  diameter: number;
  area: number;
  resistance: number;
  ampacity60: number;
  ampacity75: number;
  ampacity90: number;
  maxOcpd: number;
}

interface ColorCode {
  color: string;
  hex: string;
  usage: string;
}

const wireDatabase: WireData[] = [
  { awg: "18", diameter: 1.02, area: 0.823, resistance: 7.77, ampacity60: 7, ampacity75: 10, ampacity90: 14, maxOcpd: 15 },
  { awg: "16", diameter: 1.29, area: 1.31, resistance: 4.89, ampacity60: 10, ampacity75: 13, ampacity90: 18, maxOcpd: 15 },
  { awg: "14", diameter: 1.63, area: 2.08, resistance: 3.14, ampacity60: 15, ampacity75: 20, ampacity90: 25, maxOcpd: 15 },
  { awg: "12", diameter: 2.05, area: 3.31, resistance: 1.98, ampacity60: 20, ampacity75: 25, ampacity90: 30, maxOcpd: 20 },
  { awg: "10", diameter: 2.59, area: 5.26, resistance: 1.24, ampacity60: 30, ampacity75: 35, ampacity90: 40, maxOcpd: 30 },
  { awg: "8", diameter: 3.26, area: 8.37, resistance: 0.778, ampacity60: 40, ampacity75: 50, ampacity90: 55, maxOcpd: 40 },
  { awg: "6", diameter: 4.11, area: 13.3, resistance: 0.491, ampacity60: 55, ampacity75: 65, ampacity90: 75, maxOcpd: 60 },
  { awg: "4", diameter: 5.19, area: 21.2, resistance: 0.308, ampacity60: 70, ampacity75: 85, ampacity90: 95, maxOcpd: 70 },
  { awg: "3", diameter: 5.83, area: 26.7, resistance: 0.245, ampacity60: 85, ampacity75: 100, ampacity90: 115, maxOcpd: 85 },
  { awg: "2", diameter: 6.54, area: 33.6, resistance: 0.194, ampacity60: 95, ampacity75: 115, ampacity90: 130, maxOcpd: 100 },
  { awg: "1", diameter: 7.35, area: 42.4, resistance: 0.154, ampacity60: 110, ampacity75: 130, ampacity90: 145, maxOcpd: 110 },
  { awg: "1/0", diameter: 8.25, area: 53.5, resistance: 0.122, ampacity60: 125, ampacity75: 150, ampacity90: 170, maxOcpd: 150 },
  { awg: "2/0", diameter: 9.27, area: 67.4, resistance: 0.0967, ampacity60: 145, ampacity75: 175, ampacity90: 195, maxOcpd: 175 },
  { awg: "3/0", diameter: 10.40, area: 85.0, resistance: 0.0766, ampacity60: 165, ampacity75: 200, ampacity90: 225, maxOcpd: 200 },
  { awg: "4/0", diameter: 11.68, area: 107, resistance: 0.0608, ampacity60: 195, ampacity75: 230, ampacity90: 260, maxOcpd: 230 },
  { awg: "250", kcmil: 250, diameter: 12.7, area: 127, resistance: 0.0515, ampacity60: 215, ampacity75: 255, ampacity90: 290, maxOcpd: 255 },
  { awg: "300", kcmil: 300, diameter: 13.9, area: 152, resistance: 0.0429, ampacity60: 240, ampacity75: 285, ampacity90: 320, maxOcpd: 285 },
  { awg: "350", kcmil: 350, diameter: 15.0, area: 177, resistance: 0.0367, ampacity60: 260, ampacity75: 310, ampacity90: 350, maxOcpd: 310 },
  { awg: "400", kcmil: 400, diameter: 16.0, area: 203, resistance: 0.0321, ampacity60: 280, ampacity75: 335, ampacity90: 380, maxOcpd: 335 },
  { awg: "500", kcmil: 500, diameter: 17.9, area: 253, resistance: 0.0258, ampacity60: 320, ampacity75: 380, ampacity90: 430, maxOcpd: 380 },
  { awg: "600", kcmil: 600, diameter: 19.6, area: 304, resistance: 0.0214, ampacity60: 355, ampacity75: 420, ampacity90: 475, maxOcpd: 420 },
  { awg: "750", kcmil: 750, diameter: 22.0, area: 380, resistance: 0.0171, ampacity60: 400, ampacity75: 475, ampacity90: 535, maxOcpd: 475 },
];

const colorCodes: ColorCode[] = [
  { color: "Black", hex: "#1a1a1a", usage: "Hot (ungrounded) - 120V/208V/240V" },
  { color: "Red", hex: "#DC2626", usage: "Hot (ungrounded) - Second hot in 240V" },
  { color: "Blue", hex: "#2563EB", usage: "Hot (ungrounded) - Three phase" },
  { color: "White", hex: "#F5F5F5", usage: "Neutral (grounded conductor)" },
  { color: "Gray", hex: "#6B7280", usage: "Neutral (grounded conductor) - alternate" },
  { color: "Green", hex: "#22C55E", usage: "Equipment grounding conductor" },
  { color: "Green/Yellow", hex: "#84CC16", usage: "Equipment grounding - isolated ground" },
  { color: "Bare", hex: "#D97706", usage: "Equipment grounding conductor" },
  { color: "Orange", hex: "#272D53", usage: "High-leg delta (208V wild leg)" },
  { color: "Brown", hex: "#92400E", usage: "Hot (ungrounded) - Three phase" },
  { color: "Yellow", hex: "#EAB308", usage: "Hot (ungrounded) - Three phase" },
  { color: "Purple/Violet", hex: "#9333EA", usage: "Switch leg or travelers" },
];

const categories = [
  { id: "ampacity", name: "Ampacity Charts", icon: Zap },
  { id: "specs", name: "Wire Specifications", icon: Ruler },
  { id: "colors", name: "Color Codes", icon: Cable },
  { id: "temp", name: "Temperature Ratings", icon: Thermometer },
];

export default function WireReferenceScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ampacity");
  const [expandedWire, setExpandedWire] = useState<string | null>(null);
  const [tempRating, setTempRating] = useState<60 | 75 | 90>(75);

  const filteredWires = useMemo(() => {
    if (!searchQuery) return wireDatabase;
    const query = searchQuery.toLowerCase();
    return wireDatabase.filter(
      (wire) =>
        wire.awg.toLowerCase().includes(query) ||
        (wire.kcmil && wire.kcmil.toString().includes(query))
    );
  }, [searchQuery]);

  const getAmpacityForTemp = useCallback((wire: WireData) => {
    switch (tempRating) {
      case 60: return wire.ampacity60;
      case 75: return wire.ampacity75;
      case 90: return wire.ampacity90;
      default: return wire.ampacity75;
    }
  }, [tempRating]);

  const toggleWireExpand = useCallback((awg: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedWire(expandedWire === awg ? null : awg);
  }, [expandedWire]);

  const renderAmpacityChart = () => (
    <View style={styles.chartSection}>
      <View style={styles.tempToggle}>
        {[60, 75, 90].map((temp) => (
          <TouchableOpacity
            key={temp}
            style={[styles.tempOption, tempRating === temp && styles.tempOptionActive]}
            onPress={() => {
              setTempRating(temp as 60 | 75 | 90);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Text style={[styles.tempText, tempRating === temp && styles.tempTextActive]}>
              {temp}°C
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.chartHeader}>
        <Text style={[styles.chartHeaderCell, { flex: 1 }]}>AWG/kcmil</Text>
        <Text style={[styles.chartHeaderCell, { flex: 1 }]}>Ampacity</Text>
        <Text style={[styles.chartHeaderCell, { flex: 1 }]}>Max OCPD</Text>
      </View>

      {filteredWires.map((wire) => (
        <TouchableOpacity
          key={wire.awg}
          style={[styles.chartRow, expandedWire === wire.awg && styles.chartRowExpanded]}
          onPress={() => toggleWireExpand(wire.awg)}
        >
          <View style={styles.chartRowMain}>
            <Text style={[styles.chartCell, styles.chartCellBold, { flex: 1 }]}>
              {wire.kcmil ? `${wire.kcmil} kcmil` : `${wire.awg} AWG`}
            </Text>
            <Text style={[styles.chartCell, styles.chartCellHighlight, { flex: 1 }]}>
              {getAmpacityForTemp(wire)}A
            </Text>
            <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={styles.chartCell}>{wire.maxOcpd}A</Text>
              {expandedWire === wire.awg ? (
                <ChevronUp size={16} color={Colors.textSecondary} />
              ) : (
                <ChevronDown size={16} color={Colors.textSecondary} />
              )}
            </View>
          </View>

          {expandedWire === wire.awg && (
            <View style={styles.wireDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>60°C (TW, UF)</Text>
                <Text style={styles.detailValue}>{wire.ampacity60}A</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>75°C (THW, THWN)</Text>
                <Text style={styles.detailValue}>{wire.ampacity75}A</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>90°C (THHN, XHHW)</Text>
                <Text style={styles.detailValue}>{wire.ampacity90}A</Text>
              </View>
              <View style={styles.detailDivider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Diameter</Text>
                <Text style={styles.detailValue}>{wire.diameter} mm</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Cross-sectional Area</Text>
                <Text style={styles.detailValue}>{wire.area} mm²</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Resistance (Ω/1000ft)</Text>
                <Text style={styles.detailValue}>{wire.resistance}</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderWireSpecs = () => (
    <View style={styles.specsSection}>
      <View style={styles.specsHeader}>
        <Text style={[styles.specsHeaderCell, { flex: 1 }]}>Size</Text>
        <Text style={[styles.specsHeaderCell, { flex: 1 }]}>Dia (mm)</Text>
        <Text style={[styles.specsHeaderCell, { flex: 1 }]}>Area (mm²)</Text>
        <Text style={[styles.specsHeaderCell, { flex: 1.2 }]}>Ω/1000ft</Text>
      </View>

      {filteredWires.map((wire) => (
        <View key={wire.awg} style={styles.specsRow}>
          <Text style={[styles.specsCell, styles.specsCellBold, { flex: 1 }]}>
            {wire.kcmil ? `${wire.kcmil}` : wire.awg}
          </Text>
          <Text style={[styles.specsCell, { flex: 1 }]}>{wire.diameter}</Text>
          <Text style={[styles.specsCell, { flex: 1 }]}>{wire.area}</Text>
          <Text style={[styles.specsCell, { flex: 1.2 }]}>{wire.resistance}</Text>
        </View>
      ))}
    </View>
  );

  const renderColorCodes = () => (
    <View style={styles.colorSection}>
      {colorCodes.map((code) => (
        <View key={code.color} style={styles.colorCard}>
          <View style={[styles.colorSwatch, { backgroundColor: code.hex }]}>
            {code.color === "White" && <View style={styles.colorSwatchBorder} />}
            {code.color === "Green/Yellow" && (
              <View style={styles.stripedSwatch}>
                <View style={[styles.stripe, { backgroundColor: "#22C55E" }]} />
                <View style={[styles.stripe, { backgroundColor: "#EAB308" }]} />
                <View style={[styles.stripe, { backgroundColor: "#22C55E" }]} />
                <View style={[styles.stripe, { backgroundColor: "#EAB308" }]} />
              </View>
            )}
            {code.color === "Bare" && (
              <Cable size={20} color="#FFF" />
            )}
          </View>
          <View style={styles.colorInfo}>
            <Text style={styles.colorName}>{code.color}</Text>
            <Text style={styles.colorUsage}>{code.usage}</Text>
          </View>
        </View>
      ))}

      <View style={styles.colorNote}>
        <Info size={16} color="#EAB308" />
        <Text style={styles.colorNoteText}>
          Color codes per NEC Article 200 & 250. Local codes may vary. Always verify with AHJ.
        </Text>
      </View>
    </View>
  );

  const renderTempRatings = () => (
    <View style={styles.tempSection}>
      <View style={styles.tempCard}>
        <View style={styles.tempCardHeader}>
          <Text style={styles.tempCardTitle}>60°C Insulation Types</Text>
        </View>
        <View style={styles.tempCardBody}>
          <View style={styles.tempItem}>
            <Text style={styles.tempCode}>TW</Text>
            <Text style={styles.tempDesc}>Thermoplastic, moisture resistant</Text>
          </View>
          <View style={styles.tempItem}>
            <Text style={styles.tempCode}>UF</Text>
            <Text style={styles.tempDesc}>Underground feeder, direct burial</Text>
          </View>
        </View>
      </View>

      <View style={styles.tempCard}>
        <View style={[styles.tempCardHeader, { backgroundColor: "#FEF9C3" }]}>
          <Text style={[styles.tempCardTitle, { color: "#92400E" }]}>75°C Insulation Types</Text>
        </View>
        <View style={styles.tempCardBody}>
          <View style={styles.tempItem}>
            <Text style={styles.tempCode}>THW</Text>
            <Text style={styles.tempDesc}>Thermoplastic, heat & moisture resistant</Text>
          </View>
          <View style={styles.tempItem}>
            <Text style={styles.tempCode}>THWN</Text>
            <Text style={styles.tempDesc}>THW with nylon jacket</Text>
          </View>
          <View style={styles.tempItem}>
            <Text style={styles.tempCode}>XHHW</Text>
            <Text style={styles.tempDesc}>Cross-linked polyethylene (wet locations)</Text>
          </View>
          <View style={styles.tempItem}>
            <Text style={styles.tempCode}>USE</Text>
            <Text style={styles.tempDesc}>Underground service entrance</Text>
          </View>
        </View>
      </View>

      <View style={styles.tempCard}>
        <View style={[styles.tempCardHeader, { backgroundColor: "#FEE2E2" }]}>
          <Text style={[styles.tempCardTitle, { color: "#DC2626" }]}>90°C Insulation Types</Text>
        </View>
        <View style={styles.tempCardBody}>
          <View style={styles.tempItem}>
            <Text style={styles.tempCode}>THHN</Text>
            <Text style={styles.tempDesc}>Thermoplastic, heat resistant, nylon jacket</Text>
          </View>
          <View style={styles.tempItem}>
            <Text style={styles.tempCode}>THWN-2</Text>
            <Text style={styles.tempDesc}>Dual-rated 90°C dry, 75°C wet</Text>
          </View>
          <View style={styles.tempItem}>
            <Text style={styles.tempCode}>XHHW-2</Text>
            <Text style={styles.tempDesc}>Cross-linked PE, 90°C wet & dry</Text>
          </View>
          <View style={styles.tempItem}>
            <Text style={styles.tempCode}>RHH</Text>
            <Text style={styles.tempDesc}>Rubber, heat resistant</Text>
          </View>
          <View style={styles.tempItem}>
            <Text style={styles.tempCode}>RHW-2</Text>
            <Text style={styles.tempDesc}>Rubber, heat & moisture resistant</Text>
          </View>
        </View>
      </View>

      <View style={styles.tempNote}>
        <Info size={16} color="#EAB308" />
        <Text style={styles.tempNoteText}>
          Per NEC 310.15(B)(2): When terminations are rated for 60°C or 75°C, conductor ampacity must be based on the lower temperature rating.
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Wire Reference",
          headerLeft: () => <BackButton />,
        }}
      />

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search wire size (e.g., 12, 4/0, 250)"
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.categoryTabs}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.categoryTabsInner}>
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryTab, selectedCategory === cat.id && styles.categoryTabActive]}
                  onPress={() => {
                    setSelectedCategory(cat.id);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Icon size={16} color={selectedCategory === cat.id ? "#000" : Colors.textSecondary} />
                  <Text style={[styles.categoryTabText, selectedCategory === cat.id && styles.categoryTabTextActive]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {selectedCategory === "ampacity" && renderAmpacityChart()}
        {selectedCategory === "specs" && renderWireSpecs()}
        {selectedCategory === "colors" && renderColorCodes()}
        {selectedCategory === "temp" && renderTempRatings()}

        <View style={styles.necBadge}>
          <BookOpen size={16} color="#EAB308" />
          <Text style={styles.necBadgeText}>
            Reference: NEC 2023 Table 310.16, Chapter 9
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerButton: {
    padding: 8,
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  categoryTabs: {
    paddingBottom: 12,
  },
  categoryTabsInner: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    borderRadius: 10,
  },
  categoryTabActive: {
    backgroundColor: "#EAB308",
  },
  categoryTabText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  categoryTabTextActive: {
    color: "#000",
  },
  scrollView: {
    flex: 1,
  },
  chartSection: {
    padding: 16,
    paddingTop: 8,
  },
  tempToggle: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tempOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  tempOptionActive: {
    backgroundColor: "#EAB308",
  },
  tempText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  tempTextActive: {
    color: "#000",
  },
  chartHeader: {
    flexDirection: "row",
    backgroundColor: "#FEF9C3",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  chartHeaderCell: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: "#92400E",
  },
  chartRow: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    marginBottom: 6,
    overflow: "hidden",
  },
  chartRowExpanded: {
    borderWidth: 1,
    borderColor: "#EAB308",
  },
  chartRowMain: {
    flexDirection: "row",
    padding: 12,
    alignItems: "center",
  },
  chartCell: {
    fontSize: 14,
    color: Colors.text,
  },
  chartCellBold: {
    fontWeight: "600" as const,
  },
  chartCellHighlight: {
    fontWeight: "700" as const,
    color: "#EAB308",
  },
  wireDetails: {
    padding: 12,
    paddingTop: 0,
    backgroundColor: "#FEFCE8",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  detailDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 8,
  },
  specsSection: {
    padding: 16,
    paddingTop: 8,
  },
  specsHeader: {
    flexDirection: "row",
    backgroundColor: "#FEF9C3",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  specsHeaderCell: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: "#92400E",
  },
  specsRow: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 4,
  },
  specsCell: {
    fontSize: 13,
    color: Colors.text,
  },
  specsCellBold: {
    fontWeight: "600" as const,
  },
  colorSection: {
    padding: 16,
    paddingTop: 8,
    gap: 10,
  },
  colorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    gap: 14,
  },
  colorSwatch: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  colorSwatchBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 10,
  },
  stripedSwatch: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
  },
  stripe: {
    flex: 1,
  },
  colorInfo: {
    flex: 1,
  },
  colorName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 2,
  },
  colorUsage: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  colorNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#FEF9C3",
    padding: 14,
    borderRadius: 12,
    marginTop: 6,
  },
  colorNoteText: {
    flex: 1,
    fontSize: 12,
    color: "#92400E",
    lineHeight: 18,
  },
  tempSection: {
    padding: 16,
    paddingTop: 8,
    gap: 12,
  },
  tempCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    overflow: "hidden",
  },
  tempCardHeader: {
    backgroundColor: Colors.surfaceSecondary,
    padding: 12,
  },
  tempCardTitle: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  tempCardBody: {
    padding: 12,
    gap: 10,
  },
  tempItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  tempCode: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#EAB308",
    width: 70,
  },
  tempDesc: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  tempNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#FEF9C3",
    padding: 14,
    borderRadius: 12,
  },
  tempNoteText: {
    flex: 1,
    fontSize: 12,
    color: "#92400E",
    lineHeight: 18,
  },
  necBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    marginTop: 8,
  },
  necBadgeText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
