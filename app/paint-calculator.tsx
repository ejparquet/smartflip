import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import {
  Calculator,
  Paintbrush,
  Square,
  Minus,
  Plus,
  RotateCcw,
  ChevronDown,
  Info,
  DoorOpen,
  Grid3X3,
  Layers,
  Droplets,
  CheckCircle,
  Save,
  Share2,
} from "lucide-react-native";
import Colors from "@/constants/colors";

interface Room {
  id: string;
  name: string;
  length: string;
  width: string;
  height: string;
  doors: number;
  windows: number;
}

interface PaintType {
  id: string;
  name: string;
  coverage: number;
  description: string;
}

const paintTypes: PaintType[] = [
  { id: "flat", name: "Flat/Matte", coverage: 400, description: "Best for ceilings, low-traffic areas" },
  { id: "eggshell", name: "Eggshell", coverage: 350, description: "Great for living rooms, bedrooms" },
  { id: "satin", name: "Satin", coverage: 350, description: "Good for kitchens, bathrooms, hallways" },
  { id: "semi-gloss", name: "Semi-Gloss", coverage: 400, description: "Ideal for trim, doors, cabinets" },
  { id: "gloss", name: "High Gloss", coverage: 400, description: "Best for accents, furniture" },
  { id: "primer", name: "Primer", coverage: 300, description: "Required for new drywall, dark colors" },
];

const surfaceTypes = [
  { id: "smooth", name: "Smooth Drywall", factor: 1.0 },
  { id: "textured", name: "Textured Wall", factor: 1.2 },
  { id: "rough", name: "Rough/Stucco", factor: 1.5 },
  { id: "brick", name: "Brick", factor: 1.4 },
  { id: "wood", name: "Wood Paneling", factor: 1.1 },
];

const DOOR_SQ_FT = 21;
const WINDOW_SQ_FT = 15;

export default function PaintCalculatorScreen() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([
    { id: "1", name: "Room 1", length: "", width: "", height: "8", doors: 1, windows: 1 },
  ]);
  const [selectedPaintType, setSelectedPaintType] = useState<PaintType>(paintTypes[1]);
  const [coats, setCoats] = useState(2);
  const [surfaceType, setSurfaceType] = useState(surfaceTypes[0]);
  const [showPaintPicker, setShowPaintPicker] = useState(false);
  const [showSurfacePicker, setShowSurfacePicker] = useState(false);
  const [includeCeiling, setIncludeCeiling] = useState(false);
  const [wastePercentage, setWastePercentage] = useState(10);

  const calculations = useMemo(() => {
    let totalWallArea = 0;
    let totalCeilingArea = 0;
    let totalDoorArea = 0;
    let totalWindowArea = 0;

    rooms.forEach((room) => {
      const length = parseFloat(room.length) || 0;
      const width = parseFloat(room.width) || 0;
      const height = parseFloat(room.height) || 0;

      if (length > 0 && width > 0 && height > 0) {
        const perimeter = 2 * (length + width);
        const wallArea = perimeter * height;
        const doorArea = room.doors * DOOR_SQ_FT;
        const windowArea = room.windows * WINDOW_SQ_FT;
        const ceilingArea = length * width;

        totalWallArea += wallArea;
        totalDoorArea += doorArea;
        totalWindowArea += windowArea;
        totalCeilingArea += ceilingArea;
      }
    });

    const paintableWallArea = Math.max(0, totalWallArea - totalDoorArea - totalWindowArea);
    const totalPaintableArea = includeCeiling ? paintableWallArea + totalCeilingArea : paintableWallArea;
    const adjustedArea = totalPaintableArea * surfaceType.factor;
    const areaWithCoats = adjustedArea * coats;
    const areaWithWaste = areaWithCoats * (1 + wastePercentage / 100);
    const gallonsNeeded = areaWithWaste / selectedPaintType.coverage;
    const roundedGallons = Math.ceil(gallonsNeeded * 4) / 4;

    return {
      totalWallArea: Math.round(totalWallArea),
      totalCeilingArea: Math.round(totalCeilingArea),
      totalDoorArea: Math.round(totalDoorArea),
      totalWindowArea: Math.round(totalWindowArea),
      paintableArea: Math.round(totalPaintableArea),
      adjustedArea: Math.round(adjustedArea),
      gallonsNeeded: roundedGallons,
      quartsNeeded: Math.round(roundedGallons * 4),
    };
  }, [rooms, selectedPaintType, coats, surfaceType, includeCeiling, wastePercentage]);

  const addRoom = () => {
    const newRoom: Room = {
      id: Date.now().toString(),
      name: `Room ${rooms.length + 1}`,
      length: "",
      width: "",
      height: "8",
      doors: 1,
      windows: 1,
    };
    setRooms([...rooms, newRoom]);
  };

  const removeRoom = (id: string) => {
    if (rooms.length === 1) {
      Alert.alert("Cannot Remove", "You need at least one room.");
      return;
    }
    setRooms(rooms.filter((r) => r.id !== id));
  };

  const updateRoom = (id: string, field: keyof Room, value: string | number) => {
    setRooms(rooms.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const resetCalculator = () => {
    setRooms([{ id: "1", name: "Room 1", length: "", width: "", height: "8", doors: 1, windows: 1 }]);
    setCoats(2);
    setIncludeCeiling(false);
    setWastePercentage(10);
    setSelectedPaintType(paintTypes[1]);
    setSurfaceType(surfaceTypes[0]);
  };

  const saveEstimate = () => {
    Alert.alert(
      "Estimate Saved",
      `${calculations.gallonsNeeded} gallons needed for ${calculations.paintableArea} sq ft`,
      [{ text: "OK" }]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Paint Calculator",
          headerStyle: { backgroundColor: Colors.background },
          headerShadowVisible: false,
          headerTitleStyle: { color: Colors.text, fontWeight: "700" },
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.heroIconContainer}>
            <Calculator size={32} color="#272D53" />
          </View>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Paint Calculator</Text>
            <Text style={styles.heroSubtitle}>
              Calculate exact gallons needed based on room dimensions
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Square size={20} color="#272D53" />
            <Text style={styles.sectionTitle}>Room Dimensions</Text>
          </View>

          {rooms.map((room, index) => (
            <View key={room.id} style={styles.roomCard}>
              <View style={styles.roomHeader}>
                <TextInput
                  style={styles.roomNameInput}
                  value={room.name}
                  onChangeText={(text) => updateRoom(room.id, "name", text)}
                  placeholder="Room Name"
                  placeholderTextColor={Colors.textTertiary}
                />
                {rooms.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeRoomButton}
                    onPress={() => removeRoom(room.id)}
                  >
                    <Minus size={16} color={Colors.error} />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.dimensionsRow}>
                <View style={styles.dimensionInput}>
                  <Text style={styles.inputLabel}>Length (ft)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={room.length}
                    onChangeText={(text) => updateRoom(room.id, "length", text)}
                    placeholder="0"
                    placeholderTextColor={Colors.textTertiary}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={styles.dimensionInput}>
                  <Text style={styles.inputLabel}>Width (ft)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={room.width}
                    onChangeText={(text) => updateRoom(room.id, "width", text)}
                    placeholder="0"
                    placeholderTextColor={Colors.textTertiary}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={styles.dimensionInput}>
                  <Text style={styles.inputLabel}>Height (ft)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={room.height}
                    onChangeText={(text) => updateRoom(room.id, "height", text)}
                    placeholder="8"
                    placeholderTextColor={Colors.textTertiary}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <View style={styles.openingsRow}>
                <View style={styles.openingControl}>
                  <DoorOpen size={16} color={Colors.textSecondary} />
                  <Text style={styles.openingLabel}>Doors</Text>
                  <View style={styles.counterButtons}>
                    <TouchableOpacity
                      style={styles.counterButton}
                      onPress={() => updateRoom(room.id, "doors", Math.max(0, room.doors - 1))}
                    >
                      <Minus size={14} color={Colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.counterValue}>{room.doors}</Text>
                    <TouchableOpacity
                      style={styles.counterButton}
                      onPress={() => updateRoom(room.id, "doors", room.doors + 1)}
                    >
                      <Plus size={14} color={Colors.text} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.openingControl}>
                  <Grid3X3 size={16} color={Colors.textSecondary} />
                  <Text style={styles.openingLabel}>Windows</Text>
                  <View style={styles.counterButtons}>
                    <TouchableOpacity
                      style={styles.counterButton}
                      onPress={() => updateRoom(room.id, "windows", Math.max(0, room.windows - 1))}
                    >
                      <Minus size={14} color={Colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.counterValue}>{room.windows}</Text>
                    <TouchableOpacity
                      style={styles.counterButton}
                      onPress={() => updateRoom(room.id, "windows", room.windows + 1)}
                    >
                      <Plus size={14} color={Colors.text} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.addRoomButton} onPress={addRoom}>
            <Plus size={18} color="#272D53" />
            <Text style={styles.addRoomText}>Add Another Room</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Paintbrush size={20} color="#272D53" />
            <Text style={styles.sectionTitle}>Paint Options</Text>
          </View>

          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowPaintPicker(!showPaintPicker)}
          >
            <View style={styles.pickerContent}>
              <Droplets size={18} color="#272D53" />
              <View style={styles.pickerTextContent}>
                <Text style={styles.pickerLabel}>Paint Type</Text>
                <Text style={styles.pickerValue}>{selectedPaintType.name}</Text>
              </View>
            </View>
            <ChevronDown size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          {showPaintPicker && (
            <View style={styles.optionsList}>
              {paintTypes.map((paint) => (
                <TouchableOpacity
                  key={paint.id}
                  style={[
                    styles.optionItem,
                    selectedPaintType.id === paint.id && styles.optionItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedPaintType(paint);
                    setShowPaintPicker(false);
                  }}
                >
                  <View style={styles.optionContent}>
                    <Text style={styles.optionName}>{paint.name}</Text>
                    <Text style={styles.optionDescription}>{paint.description}</Text>
                    <Text style={styles.optionCoverage}>{paint.coverage} sq ft/gallon</Text>
                  </View>
                  {selectedPaintType.id === paint.id && (
                    <CheckCircle size={20} color="#272D53" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowSurfacePicker(!showSurfacePicker)}
          >
            <View style={styles.pickerContent}>
              <Layers size={18} color="#272D53" />
              <View style={styles.pickerTextContent}>
                <Text style={styles.pickerLabel}>Surface Type</Text>
                <Text style={styles.pickerValue}>{surfaceType.name}</Text>
              </View>
            </View>
            <ChevronDown size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          {showSurfacePicker && (
            <View style={styles.optionsList}>
              {surfaceTypes.map((surface) => (
                <TouchableOpacity
                  key={surface.id}
                  style={[
                    styles.optionItem,
                    surfaceType.id === surface.id && styles.optionItemSelected,
                  ]}
                  onPress={() => {
                    setSurfaceType(surface);
                    setShowSurfacePicker(false);
                  }}
                >
                  <View style={styles.optionContent}>
                    <Text style={styles.optionName}>{surface.name}</Text>
                    <Text style={styles.optionCoverage}>
                      {surface.factor > 1 ? `+${Math.round((surface.factor - 1) * 100)}% more paint` : "Standard coverage"}
                    </Text>
                  </View>
                  {surfaceType.id === surface.id && (
                    <CheckCircle size={20} color="#272D53" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.coatsRow}>
            <View style={styles.coatsLabel}>
              <Layers size={18} color={Colors.textSecondary} />
              <Text style={styles.coatsText}>Number of Coats</Text>
            </View>
            <View style={styles.counterButtons}>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => setCoats(Math.max(1, coats - 1))}
              >
                <Minus size={14} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.counterValueLarge}>{coats}</Text>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => setCoats(Math.min(4, coats + 1))}
              >
                <Plus size={14} color={Colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.toggleRow}
            onPress={() => setIncludeCeiling(!includeCeiling)}
          >
            <Text style={styles.toggleLabel}>Include Ceiling</Text>
            <View style={[styles.toggleSwitch, includeCeiling && styles.toggleSwitchOn]}>
              <View style={[styles.toggleKnob, includeCeiling && styles.toggleKnobOn]} />
            </View>
          </TouchableOpacity>

          <View style={styles.wasteRow}>
            <View style={styles.wasteLabel}>
              <Info size={16} color={Colors.textSecondary} />
              <Text style={styles.wasteText}>Waste Factor: {wastePercentage}%</Text>
            </View>
            <View style={styles.wasteButtons}>
              {[5, 10, 15, 20].map((percent) => (
                <TouchableOpacity
                  key={percent}
                  style={[
                    styles.wasteButton,
                    wastePercentage === percent && styles.wasteButtonSelected,
                  ]}
                  onPress={() => setWastePercentage(percent)}
                >
                  <Text
                    style={[
                      styles.wasteButtonText,
                      wastePercentage === percent && styles.wasteButtonTextSelected,
                    ]}
                  >
                    {percent}%
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.resultsSection}>
          <View style={styles.resultsSectionHeader}>
            <Calculator size={20} color="#272D53" />
            <Text style={styles.sectionTitle}>Calculation Results</Text>
          </View>

          <View style={styles.mainResultCard}>
            <View style={styles.mainResultIcon}>
              <Paintbrush size={32} color="#272D53" />
            </View>
            <Text style={styles.mainResultLabel}>Paint Required</Text>
            <Text style={styles.mainResultValue}>{calculations.gallonsNeeded}</Text>
            <Text style={styles.mainResultUnit}>Gallons</Text>
            <Text style={styles.mainResultSubtext}>
              ({calculations.quartsNeeded} quarts)
            </Text>
          </View>

          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownTitle}>Calculation Breakdown</Text>
            
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Total Wall Area</Text>
              <Text style={styles.breakdownValue}>{calculations.totalWallArea} sq ft</Text>
            </View>
            
            {includeCeiling && (
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Ceiling Area</Text>
                <Text style={styles.breakdownValue}>{calculations.totalCeilingArea} sq ft</Text>
              </View>
            )}
            
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Doors ({rooms.reduce((sum, r) => sum + r.doors, 0)})</Text>
              <Text style={styles.breakdownValueNegative}>-{calculations.totalDoorArea} sq ft</Text>
            </View>
            
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Windows ({rooms.reduce((sum, r) => sum + r.windows, 0)})</Text>
              <Text style={styles.breakdownValueNegative}>-{calculations.totalWindowArea} sq ft</Text>
            </View>
            
            <View style={styles.breakdownDivider} />
            
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Paintable Area</Text>
              <Text style={styles.breakdownValue}>{calculations.paintableArea} sq ft</Text>
            </View>
            
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Surface Adjustment</Text>
              <Text style={styles.breakdownValue}>×{surfaceType.factor}</Text>
            </View>
            
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Coats</Text>
              <Text style={styles.breakdownValue}>×{coats}</Text>
            </View>
            
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Waste Factor</Text>
              <Text style={styles.breakdownValue}>+{wastePercentage}%</Text>
            </View>
            
            <View style={styles.breakdownDivider} />
            
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabelBold}>Adjusted Area</Text>
              <Text style={styles.breakdownValueBold}>{calculations.adjustedArea} sq ft</Text>
            </View>
            
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabelBold}>Coverage Rate</Text>
              <Text style={styles.breakdownValueBold}>{selectedPaintType.coverage} sq ft/gal</Text>
            </View>
          </View>

          <View style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <Info size={18} color="#0EA5E9" />
              <Text style={styles.tipsTitle}>Pro Tips</Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>Always buy slightly more than calculated to ensure consistent color</Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>Dark colors over light may need 3+ coats</Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>Primer is recommended for new drywall or dramatic color changes</Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>One gallon typically covers 350-400 sq ft per coat</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.resetButton} onPress={resetCalculator}>
            <RotateCcw size={18} color={Colors.textSecondary} />
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.saveButton} onPress={saveEstimate}>
            <Save size={18} color={Colors.white} />
            <Text style={styles.saveButtonText}>Save Estimate</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  heroCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#272D5315",
    margin: 20,
    marginBottom: 12,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#272D5330",
  },
  heroIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: "#272D5320",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  heroContent: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
  roomCard: {
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
  roomHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  roomNameInput: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    flex: 1,
    padding: 0,
  },
  removeRoomButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: `${Colors.error}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  dimensionsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  dimensionInput: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    textAlign: "center",
  },
  openingsRow: {
    flexDirection: "row",
    gap: 16,
  },
  openingControl: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  openingLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  counterButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  counterButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  counterValue: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    minWidth: 20,
    textAlign: "center",
  },
  counterValueLarge: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    minWidth: 28,
    textAlign: "center",
  },
  addRoomButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#272D5315",
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#272D5330",
    borderStyle: "dashed",
  },
  addRoomText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#272D53",
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  pickerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  pickerTextContent: {
    gap: 2,
  },
  pickerLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  pickerValue: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
  },
  optionsList: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  optionItemSelected: {
    backgroundColor: "#272D5310",
  },
  optionContent: {
    flex: 1,
  },
  optionName: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  optionCoverage: {
    fontSize: 12,
    fontWeight: "500",
    color: "#272D53",
  },
  coatsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  coatsLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  coatsText: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.text,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.text,
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.border,
    padding: 3,
  },
  toggleSwitchOn: {
    backgroundColor: "#272D53",
  },
  toggleKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.white,
  },
  toggleKnobOn: {
    transform: [{ translateX: 22 }],
  },
  wasteRow: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  wasteLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  wasteText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  wasteButtons: {
    flexDirection: "row",
    gap: 10,
  },
  wasteButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
  },
  wasteButtonSelected: {
    backgroundColor: "#272D53",
  },
  wasteButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  wasteButtonTextSelected: {
    color: Colors.white,
  },
  resultsSection: {
    paddingHorizontal: 20,
  },
  resultsSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  mainResultCard: {
    backgroundColor: "#272D53",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    marginBottom: 16,
  },
  mainResultIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  mainResultLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 4,
  },
  mainResultValue: {
    fontSize: 56,
    fontWeight: "800",
    color: Colors.white,
  },
  mainResultUnit: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.white,
    marginTop: -4,
  },
  mainResultSubtext: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginTop: 8,
  },
  breakdownCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 14,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  breakdownLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  breakdownLabelBold: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  breakdownValueBold: {
    fontSize: 14,
    fontWeight: "700",
    color: "#272D53",
  },
  breakdownValueNegative: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.error,
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 8,
  },
  tipsCard: {
    backgroundColor: "#0EA5E910",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#0EA5E930",
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0EA5E9",
  },
  tipItem: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  tipBullet: {
    fontSize: 14,
    color: "#0EA5E9",
    fontWeight: "600",
  },
  tipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#272D53",
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.white,
  },
});
