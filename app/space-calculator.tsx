import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
} from "react-native";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Calculator,
  Home,
  Sofa,
  Bed,
  UtensilsCrossed,
  Bath,
  Briefcase,
  Baby,
  Dumbbell,
  Tv,
  ChevronDown,
  ChevronUp,
  Info,
  RotateCcw,
  Share2,
  Bookmark,
  Check,
  AlertCircle,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";

interface RoomType {
  id: string;
  name: string;
  icon: any;
  minSqFt: number;
  recommendedSqFt: number;
  maxSqFt: number;
  furnitureGuide: FurnitureGuide[];
  tips: string[];
}

interface FurnitureGuide {
  item: string;
  dimensions: string;
  clearance: string;
}

const roomTypes: RoomType[] = [
  {
    id: "living",
    name: "Living Room",
    icon: Sofa,
    minSqFt: 150,
    recommendedSqFt: 250,
    maxSqFt: 500,
    furnitureGuide: [
      { item: "3-Seat Sofa", dimensions: "84\" x 36\"", clearance: "18\" front" },
      { item: "Coffee Table", dimensions: "48\" x 24\"", clearance: "18\" all sides" },
      { item: "Accent Chair", dimensions: "32\" x 32\"", clearance: "36\" path" },
      { item: "Media Console", dimensions: "60\" x 18\"", clearance: "8-10ft from seating" },
    ],
    tips: [
      "Allow 3-4 feet between seating pieces for conversation",
      "Main walkway should be 36\" minimum",
      "Rug should extend 18\" beyond furniture",
    ],
  },
  {
    id: "bedroom",
    name: "Primary Bedroom",
    icon: Bed,
    minSqFt: 120,
    recommendedSqFt: 180,
    maxSqFt: 350,
    furnitureGuide: [
      { item: "King Bed", dimensions: "76\" x 80\"", clearance: "24\" sides, 36\" foot" },
      { item: "Queen Bed", dimensions: "60\" x 80\"", clearance: "24\" sides, 30\" foot" },
      { item: "Nightstands (pair)", dimensions: "24\" x 18\" each", clearance: "Adjacent to bed" },
      { item: "Dresser", dimensions: "60\" x 18\"", clearance: "36\" front" },
    ],
    tips: [
      "24\" minimum on each side of bed for easy movement",
      "36\" clearance at foot of bed for walking",
      "Consider closet access paths",
    ],
  },
  {
    id: "dining",
    name: "Dining Room",
    icon: UtensilsCrossed,
    minSqFt: 100,
    recommendedSqFt: 160,
    maxSqFt: 300,
    furnitureGuide: [
      { item: "6-Person Table", dimensions: "72\" x 36\"", clearance: "36\" all sides" },
      { item: "8-Person Table", dimensions: "96\" x 40\"", clearance: "42\" all sides" },
      { item: "Dining Chairs", dimensions: "20\" x 20\"", clearance: "24\" from table edge" },
      { item: "Sideboard", dimensions: "60\" x 18\"", clearance: "36\" front" },
    ],
    tips: [
      "Allow 24\" per person at the table",
      "36\" minimum from table edge to wall for seated guests",
      "48\" for walk-behind traffic",
    ],
  },
  {
    id: "bathroom",
    name: "Primary Bathroom",
    icon: Bath,
    minSqFt: 40,
    recommendedSqFt: 75,
    maxSqFt: 150,
    furnitureGuide: [
      { item: "Double Vanity", dimensions: "60-72\"", clearance: "30\" front" },
      { item: "Single Vanity", dimensions: "24-36\"", clearance: "24\" front" },
      { item: "Freestanding Tub", dimensions: "60\" x 30\"", clearance: "24\" access" },
      { item: "Shower", dimensions: "36\" x 36\" min", clearance: "24\" door swing" },
    ],
    tips: [
      "21\" minimum in front of toilet",
      "15\" from centerline of toilet to side wall",
      "Consider door swing clearances",
    ],
  },
  {
    id: "office",
    name: "Home Office",
    icon: Briefcase,
    minSqFt: 70,
    recommendedSqFt: 120,
    maxSqFt: 200,
    furnitureGuide: [
      { item: "Executive Desk", dimensions: "60\" x 30\"", clearance: "36\" behind for chair" },
      { item: "Compact Desk", dimensions: "48\" x 24\"", clearance: "30\" behind" },
      { item: "Bookcase", dimensions: "36\" x 12\"", clearance: "24\" front" },
      { item: "Filing Cabinet", dimensions: "15\" x 22\"", clearance: "24\" drawer pull" },
    ],
    tips: [
      "Position desk facing door or with view",
      "Natural light from side, not behind screen",
      "Allow space for video call background",
    ],
  },
  {
    id: "nursery",
    name: "Nursery",
    icon: Baby,
    minSqFt: 100,
    recommendedSqFt: 130,
    maxSqFt: 200,
    furnitureGuide: [
      { item: "Crib", dimensions: "52\" x 28\"", clearance: "36\" all sides" },
      { item: "Changing Table", dimensions: "36\" x 20\"", clearance: "24\" front" },
      { item: "Glider/Rocker", dimensions: "30\" x 32\"", clearance: "24\" for motion" },
      { item: "Dresser", dimensions: "48\" x 18\"", clearance: "36\" front" },
    ],
    tips: [
      "Keep crib away from windows and cords",
      "36\" minimum around crib for safety",
      "Place changing table near storage",
    ],
  },
  {
    id: "gym",
    name: "Home Gym",
    icon: Dumbbell,
    minSqFt: 100,
    recommendedSqFt: 200,
    maxSqFt: 400,
    furnitureGuide: [
      { item: "Treadmill", dimensions: "77\" x 35\"", clearance: "36\" behind, 24\" sides" },
      { item: "Weight Bench", dimensions: "48\" x 24\"", clearance: "36\" all sides" },
      { item: "Yoga/Mat Area", dimensions: "72\" x 24\"", clearance: "24\" all sides" },
      { item: "Free Weights Area", dimensions: "6' x 4'", clearance: "48\" for movement" },
    ],
    tips: [
      "8-10 foot ceiling height for overhead exercises",
      "Rubber flooring recommended",
      "Good ventilation and mirrors helpful",
    ],
  },
  {
    id: "media",
    name: "Media Room",
    icon: Tv,
    minSqFt: 150,
    recommendedSqFt: 250,
    maxSqFt: 500,
    furnitureGuide: [
      { item: "Sectional Sofa", dimensions: "100\" x 100\"", clearance: "36\" paths" },
      { item: "Theater Seating (row)", dimensions: "22\" per seat", clearance: "36\" front" },
      { item: "TV/Screen", dimensions: "View distance = TV size x 1.5-2", clearance: "N/A" },
      { item: "Equipment Console", dimensions: "48\" x 18\"", clearance: "Ventilation space" },
    ],
    tips: [
      "TV viewing distance: 1.5-2x screen diagonal",
      "Consider acoustics and light control",
      "Tiered seating adds 12\" per row",
    ],
  },
];

export default function SpaceCalculatorScreen() {
  const { theme } = useTheme();
  const [selectedRoom, setSelectedRoom] = useState<RoomType>(roomTypes[0]);
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [expandedSection, setExpandedSection] = useState<string | null>("furniture");

  const squareFootage = useMemo(() => {
    const l = parseFloat(length) || 0;
    const w = parseFloat(width) || 0;
    return l * w;
  }, [length, width]);

  const getAssessment = () => {
    if (squareFootage === 0) return null;
    
    if (squareFootage < selectedRoom.minSqFt) {
      return {
        status: "small",
        label: "Below Minimum",
        color: "#EF4444",
        bgColor: "#FEE2E2",
        message: `This space is ${selectedRoom.minSqFt - squareFootage} sq ft below the minimum recommended for a ${selectedRoom.name.toLowerCase()}. Consider a more compact layout or alternative use.`,
      };
    } else if (squareFootage < selectedRoom.recommendedSqFt) {
      return {
        status: "adequate",
        label: "Adequate",
        color: "#272D53",
        bgColor: "#E8E9EE",
        message: `This space meets minimum requirements but is ${selectedRoom.recommendedSqFt - squareFootage} sq ft below the ideal size. Careful furniture selection will be important.`,
      };
    } else if (squareFootage <= selectedRoom.maxSqFt) {
      return {
        status: "ideal",
        label: "Ideal Size",
        color: "#10B981",
        bgColor: "#D1FAE5",
        message: `This is an ideal size for a ${selectedRoom.name.toLowerCase()}. You have flexibility in furniture arrangement and can create comfortable zones.`,
      };
    } else {
      return {
        status: "large",
        label: "Very Spacious",
        color: "#3B82F6",
        bgColor: "#DBEAFE",
        message: `This space exceeds typical ${selectedRoom.name.toLowerCase()} dimensions. Consider creating multiple zones or adding supplementary functions.`,
      };
    }
  };

  const assessment = getAssessment();

  const resetCalculator = () => {
    setLength("");
    setWidth("");
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: "Space Calculator",
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerShadowVisible: false,
        }}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Room Type Selector */}
        <Text style={[styles.sectionLabel, { color: theme.text }]}>Room Type</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.roomTypeScroll}
          contentContainerStyle={styles.roomTypeContainer}
        >
          {roomTypes.map((room) => (
            <TouchableOpacity
              key={room.id}
              style={[
                styles.roomTypeCard,
                { backgroundColor: selectedRoom.id === room.id ? "#EC4899" : theme.surface },
              ]}
              onPress={() => setSelectedRoom(room)}
            >
              <room.icon
                size={22}
                color={selectedRoom.id === room.id ? "#FFFFFF" : theme.textSecondary}
                strokeWidth={1.5}
              />
              <Text
                style={[
                  styles.roomTypeName,
                  { color: selectedRoom.id === room.id ? "#FFFFFF" : theme.text },
                ]}
                numberOfLines={1}
              >
                {room.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Dimensions Input */}
        <View style={[styles.inputCard, { backgroundColor: theme.surface }]}>
          <Text style={[styles.inputTitle, { color: theme.text }]}>Room Dimensions</Text>
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Length</Text>
              <View style={[styles.inputWrapper, { backgroundColor: theme.surfaceSecondary }]}>
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  value={length}
                  onChangeText={setLength}
                  placeholder="0"
                  placeholderTextColor={theme.textTertiary}
                  keyboardType="decimal-pad"
                />
                <Text style={[styles.inputUnit, { color: theme.textSecondary }]}>ft</Text>
              </View>
            </View>
            <View style={styles.inputDivider}>
              <Text style={[styles.dividerText, { color: theme.textTertiary }]}>×</Text>
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Width</Text>
              <View style={[styles.inputWrapper, { backgroundColor: theme.surfaceSecondary }]}>
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  value={width}
                  onChangeText={setWidth}
                  placeholder="0"
                  placeholderTextColor={theme.textTertiary}
                  keyboardType="decimal-pad"
                />
                <Text style={[styles.inputUnit, { color: theme.textSecondary }]}>ft</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.resultRow}>
            <View style={styles.resultBox}>
              <Text style={[styles.resultLabel, { color: theme.textSecondary }]}>Total Area</Text>
              <Text style={[styles.resultValue, { color: "#EC4899" }]}>
                {squareFootage.toFixed(0)} <Text style={styles.resultUnit}>sq ft</Text>
              </Text>
            </View>
            <TouchableOpacity style={styles.resetButton} onPress={resetCalculator}>
              <RotateCcw size={18} color={theme.textSecondary} strokeWidth={1.5} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Assessment */}
        {assessment && (
          <View style={[styles.assessmentCard, { backgroundColor: assessment.bgColor }]}>
            <View style={styles.assessmentHeader}>
              {assessment.status === "ideal" ? (
                <Check size={20} color={assessment.color} strokeWidth={2} />
              ) : (
                <AlertCircle size={20} color={assessment.color} strokeWidth={2} />
              )}
              <Text style={[styles.assessmentLabel, { color: assessment.color }]}>
                {assessment.label}
              </Text>
            </View>
            <Text style={[styles.assessmentMessage, { color: assessment.color }]}>
              {assessment.message}
            </Text>
          </View>
        )}

        {/* Reference Sizes */}
        <View style={[styles.referenceCard, { backgroundColor: theme.surface }]}>
          <Text style={[styles.referenceTitle, { color: theme.text }]}>
            {selectedRoom.name} Reference Sizes
          </Text>
          <View style={styles.referenceRow}>
            <View style={styles.referenceItem}>
              <View style={[styles.referenceDot, { backgroundColor: "#EF4444" }]} />
              <Text style={[styles.referenceLabel, { color: theme.textSecondary }]}>Minimum</Text>
              <Text style={[styles.referenceValue, { color: theme.text }]}>
                {selectedRoom.minSqFt} sq ft
              </Text>
            </View>
            <View style={styles.referenceItem}>
              <View style={[styles.referenceDot, { backgroundColor: "#10B981" }]} />
              <Text style={[styles.referenceLabel, { color: theme.textSecondary }]}>Recommended</Text>
              <Text style={[styles.referenceValue, { color: theme.text }]}>
                {selectedRoom.recommendedSqFt} sq ft
              </Text>
            </View>
            <View style={styles.referenceItem}>
              <View style={[styles.referenceDot, { backgroundColor: "#3B82F6" }]} />
              <Text style={[styles.referenceLabel, { color: theme.textSecondary }]}>Spacious</Text>
              <Text style={[styles.referenceValue, { color: theme.text }]}>
                {selectedRoom.maxSqFt}+ sq ft
              </Text>
            </View>
          </View>
        </View>

        {/* Furniture Guide */}
        <TouchableOpacity
          style={[styles.expandableSection, { backgroundColor: theme.surface }]}
          onPress={() => toggleSection("furniture")}
        >
          <View style={styles.expandableHeader}>
            <Sofa size={20} color="#EC4899" strokeWidth={1.5} />
            <Text style={[styles.expandableTitle, { color: theme.text }]}>Furniture Guide</Text>
          </View>
          {expandedSection === "furniture" ? (
            <ChevronUp size={20} color={theme.textSecondary} strokeWidth={1.5} />
          ) : (
            <ChevronDown size={20} color={theme.textSecondary} strokeWidth={1.5} />
          )}
        </TouchableOpacity>
        
        {expandedSection === "furniture" && (
          <View style={[styles.expandableContent, { backgroundColor: theme.surface }]}>
            {selectedRoom.furnitureGuide.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.furnitureItem,
                  index < selectedRoom.furnitureGuide.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: theme.borderLight,
                  },
                ]}
              >
                <Text style={[styles.furnitureName, { color: theme.text }]}>{item.item}</Text>
                <View style={styles.furnitureDetails}>
                  <View style={styles.furnitureDetail}>
                    <Text style={[styles.detailLabel, { color: theme.textTertiary }]}>Size</Text>
                    <Text style={[styles.detailValue, { color: theme.textSecondary }]}>
                      {item.dimensions}
                    </Text>
                  </View>
                  <View style={styles.furnitureDetail}>
                    <Text style={[styles.detailLabel, { color: theme.textTertiary }]}>Clearance</Text>
                    <Text style={[styles.detailValue, { color: theme.textSecondary }]}>
                      {item.clearance}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Tips */}
        <TouchableOpacity
          style={[styles.expandableSection, { backgroundColor: theme.surface }]}
          onPress={() => toggleSection("tips")}
        >
          <View style={styles.expandableHeader}>
            <Info size={20} color="#3B82F6" strokeWidth={1.5} />
            <Text style={[styles.expandableTitle, { color: theme.text }]}>Design Tips</Text>
          </View>
          {expandedSection === "tips" ? (
            <ChevronUp size={20} color={theme.textSecondary} strokeWidth={1.5} />
          ) : (
            <ChevronDown size={20} color={theme.textSecondary} strokeWidth={1.5} />
          )}
        </TouchableOpacity>
        
        {expandedSection === "tips" && (
          <View style={[styles.expandableContent, { backgroundColor: theme.surface }]}>
            {selectedRoom.tips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <View style={[styles.tipBullet, { backgroundColor: "#3B82F6" }]} />
                <Text style={[styles.tipText, { color: theme.textSecondary }]}>{tip}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.secondaryBtn, { borderColor: theme.border }]}>
            <Bookmark size={18} color={theme.text} strokeWidth={1.5} />
            <Text style={[styles.secondaryBtnText, { color: theme.text }]}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryBtn}>
            <Share2 size={18} color="#FFFFFF" strokeWidth={1.5} />
            <Text style={styles.primaryBtnText}>Share Results</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginBottom: 12,
  },
  roomTypeScroll: {
    marginBottom: 20,
    marginHorizontal: -20,
  },
  roomTypeContainer: {
    paddingHorizontal: 20,
    gap: 10,
  },
  roomTypeCard: {
    width: 100,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignItems: "center",
    gap: 8,
    marginRight: 10,
  },
  roomTypeName: {
    fontSize: 12,
    fontWeight: "600" as const,
    textAlign: "center",
  },
  inputCard: {
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
  },
  inputTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 20,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  input: {
    flex: 1,
    fontSize: 20,
    fontWeight: "600" as const,
  },
  inputUnit: {
    fontSize: 14,
    marginLeft: 4,
  },
  inputDivider: {
    width: 40,
    alignItems: "center",
    paddingBottom: 14,
  },
  dividerText: {
    fontSize: 24,
    fontWeight: "300" as const,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  resultBox: {
    flex: 1,
  },
  resultLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 32,
    fontWeight: "800" as const,
  },
  resultUnit: {
    fontSize: 16,
    fontWeight: "500" as const,
  },
  resetButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  assessmentCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  assessmentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  assessmentLabel: {
    fontSize: 15,
    fontWeight: "700" as const,
  },
  assessmentMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  referenceCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  referenceTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    marginBottom: 14,
  },
  referenceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  referenceItem: {
    alignItems: "center",
    flex: 1,
  },
  referenceDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 6,
  },
  referenceLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  referenceValue: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  expandableSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 14,
    padding: 16,
    marginBottom: 2,
  },
  expandableHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  expandableTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  expandableContent: {
    borderRadius: 14,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    padding: 16,
    paddingTop: 8,
    marginBottom: 16,
  },
  furnitureItem: {
    paddingVertical: 12,
  },
  furnitureName: {
    fontSize: 15,
    fontWeight: "600" as const,
    marginBottom: 8,
  },
  furnitureDetails: {
    flexDirection: "row",
    gap: 24,
  },
  furnitureDetail: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 8,
    gap: 12,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  primaryBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#EC4899",
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
});
