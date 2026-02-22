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
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import {
  ArrowLeft,
  Zap,
  Plus,
  Minus,
  Calculator,
  Home,
  Lightbulb,
  Refrigerator,
  Wind,
  Flame,
  Droplets,
  Tv,
  Plug,
  CircuitBoard,
  Gauge,
  Info,
  RotateCcw,
  Save,
  Share2,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";

interface LoadItem {
  id: string;
  name: string;
  icon: any;
  category: string;
  watts: number;
  quantity: number;
  demandFactor: number;
  isIncluded: boolean;
}

interface PanelSize {
  amps: number;
  label: string;
  recommended: boolean;
}

const defaultLoadItems: LoadItem[] = [
  { id: "1", name: "General Lighting", icon: Lightbulb, category: "Lighting", watts: 3, quantity: 2000, demandFactor: 1.0, isIncluded: true },
  { id: "2", name: "Small Appliances (Kitchen)", icon: Plug, category: "Kitchen", watts: 1500, quantity: 2, demandFactor: 1.0, isIncluded: true },
  { id: "3", name: "Laundry Circuit", icon: Plug, category: "Laundry", watts: 1500, quantity: 1, demandFactor: 1.0, isIncluded: true },
  { id: "4", name: "Electric Range", icon: Flame, category: "Kitchen", watts: 12000, quantity: 1, demandFactor: 0.8, isIncluded: true },
  { id: "5", name: "Electric Dryer", icon: Wind, category: "Laundry", watts: 5000, quantity: 1, demandFactor: 1.0, isIncluded: true },
  { id: "6", name: "Electric Water Heater", icon: Droplets, category: "Water Heating", watts: 4500, quantity: 1, demandFactor: 1.0, isIncluded: true },
  { id: "7", name: "Central A/C (3 ton)", icon: Wind, category: "HVAC", watts: 5000, quantity: 1, demandFactor: 1.0, isIncluded: true },
  { id: "8", name: "Heat Pump", icon: Wind, category: "HVAC", watts: 6000, quantity: 0, demandFactor: 1.0, isIncluded: false },
  { id: "9", name: "Electric Furnace", icon: Flame, category: "HVAC", watts: 10000, quantity: 0, demandFactor: 0.65, isIncluded: false },
  { id: "10", name: "Dishwasher", icon: Droplets, category: "Kitchen", watts: 1500, quantity: 1, demandFactor: 1.0, isIncluded: true },
  { id: "11", name: "Garbage Disposal", icon: Plug, category: "Kitchen", watts: 750, quantity: 1, demandFactor: 1.0, isIncluded: true },
  { id: "12", name: "Microwave", icon: Plug, category: "Kitchen", watts: 1500, quantity: 1, demandFactor: 1.0, isIncluded: true },
  { id: "13", name: "EV Charger (Level 2)", icon: Gauge, category: "EV Charging", watts: 9600, quantity: 0, demandFactor: 1.0, isIncluded: false },
  { id: "14", name: "Hot Tub / Spa", icon: Droplets, category: "Pool/Spa", watts: 6000, quantity: 0, demandFactor: 1.0, isIncluded: false },
  { id: "15", name: "Pool Pump", icon: Droplets, category: "Pool/Spa", watts: 2000, quantity: 0, demandFactor: 1.0, isIncluded: false },
  { id: "16", name: "Workshop/Garage", icon: Plug, category: "Other", watts: 3000, quantity: 0, demandFactor: 1.0, isIncluded: false },
  { id: "17", name: "Home Office", icon: Tv, category: "Other", watts: 1500, quantity: 0, demandFactor: 1.0, isIncluded: false },
  { id: "18", name: "Sauna", icon: Flame, category: "Other", watts: 6000, quantity: 0, demandFactor: 1.0, isIncluded: false },
];

const panelSizes: PanelSize[] = [
  { amps: 100, label: "100A", recommended: false },
  { amps: 125, label: "125A", recommended: false },
  { amps: 150, label: "150A", recommended: false },
  { amps: 200, label: "200A", recommended: false },
  { amps: 225, label: "225A", recommended: false },
  { amps: 320, label: "320A", recommended: false },
  { amps: 400, label: "400A", recommended: false },
];

export default function LoadCalculatorScreen() {
  const router = useRouter();
  const [loadItems, setLoadItems] = useState<LoadItem[]>(defaultLoadItems);
  const [squareFootage, setSquareFootage] = useState("2000");
  const [voltage, setVoltage] = useState<"120/240" | "120/208">("120/240");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(loadItems.map((item) => item.category));
    return Array.from(cats);
  }, [loadItems]);

  const calculations = useMemo(() => {
    const sqft = parseInt(squareFootage) || 0;
    
    const generalLighting = sqft * 3;
    const smallAppliances = 3000;
    const laundry = 1500;
    const baseLoad = generalLighting + smallAppliances + laundry;
    
    const first3000 = Math.min(baseLoad, 3000);
    const over3000 = Math.max(baseLoad - 3000, 0) * 0.35;
    const adjustedBaseLoad = first3000 + over3000;
    
    let applianceLoad = 0;
    loadItems.forEach((item) => {
      if (item.isIncluded && item.quantity > 0 && !["General Lighting", "Small Appliances (Kitchen)", "Laundry Circuit"].includes(item.name)) {
        applianceLoad += item.watts * item.quantity * item.demandFactor;
      }
    });
    
    const hvacItems = loadItems.filter((item) => item.category === "HVAC" && item.isIncluded && item.quantity > 0);
    let hvacLoad = 0;
    if (hvacItems.length > 0) {
      const heatingLoad = hvacItems.filter((i) => i.name.includes("Heat") || i.name.includes("Furnace")).reduce((sum, i) => sum + i.watts * i.quantity * i.demandFactor, 0);
      const coolingLoad = hvacItems.filter((i) => i.name.includes("A/C")).reduce((sum, i) => sum + i.watts * i.quantity * i.demandFactor, 0);
      hvacLoad = Math.max(heatingLoad, coolingLoad);
      applianceLoad -= Math.min(heatingLoad, coolingLoad);
    }
    
    const totalConnectedLoad = baseLoad + loadItems.filter((i) => i.isIncluded && !["General Lighting", "Small Appliances (Kitchen)", "Laundry Circuit"].includes(i.name)).reduce((sum, i) => sum + i.watts * i.quantity, 0);
    
    const totalDemandLoad = adjustedBaseLoad + applianceLoad + hvacLoad;
    
    const voltageMultiplier = voltage === "120/240" ? 240 : 208;
    const serviceAmps = totalDemandLoad / voltageMultiplier;
    
    let recommendedPanel = 100;
    if (serviceAmps <= 80) recommendedPanel = 100;
    else if (serviceAmps <= 100) recommendedPanel = 125;
    else if (serviceAmps <= 120) recommendedPanel = 150;
    else if (serviceAmps <= 160) recommendedPanel = 200;
    else if (serviceAmps <= 180) recommendedPanel = 225;
    else if (serviceAmps <= 256) recommendedPanel = 320;
    else recommendedPanel = 400;
    
    return {
      squareFootage: sqft,
      generalLighting,
      smallAppliances,
      laundry,
      baseLoad,
      adjustedBaseLoad,
      applianceLoad,
      hvacLoad,
      totalConnectedLoad,
      totalDemandLoad,
      serviceAmps: Math.round(serviceAmps),
      recommendedPanel,
    };
  }, [loadItems, squareFootage, voltage]);

  const updateItemQuantity = useCallback((itemId: string, delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoadItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, quantity: Math.max(0, item.quantity + delta), isIncluded: item.quantity + delta > 0 }
          : item
      )
    );
  }, []);

  const toggleItem = useCallback((itemId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoadItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, isIncluded: !item.isIncluded, quantity: !item.isIncluded ? 1 : item.quantity }
          : item
      )
    );
  }, []);

  const resetCalculation = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      "Reset Calculator",
      "This will reset all values to defaults. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            setLoadItems(defaultLoadItems);
            setSquareFootage("2000");
          },
        },
      ]
    );
  }, []);

  const saveCalculation = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Saved!", "Load calculation has been saved to your projects.");
  }, []);

  const getItemsByCategory = (category: string) => {
    return loadItems.filter((item) => item.category === category);
  };

  const renderLoadItem = (item: LoadItem) => {
    const Icon = item.icon;
    
    return (
      <View key={item.id} style={[styles.loadItem, item.isIncluded && styles.loadItemActive]}>
        <TouchableOpacity
          style={styles.loadItemCheck}
          onPress={() => toggleItem(item.id)}
        >
          {item.isIncluded ? (
            <View style={styles.checkboxChecked}>
              <Check size={14} color="#FFF" />
            </View>
          ) : (
            <View style={styles.checkboxUnchecked} />
          )}
        </TouchableOpacity>
        
        <View style={[styles.loadItemIcon, { opacity: item.isIncluded ? 1 : 0.4 }]}>
          <Icon size={20} color={item.isIncluded ? "#EAB308" : Colors.textTertiary} />
        </View>
        
        <View style={styles.loadItemInfo}>
          <Text style={[styles.loadItemName, !item.isIncluded && styles.loadItemNameInactive]}>
            {item.name}
          </Text>
          <Text style={styles.loadItemWatts}>
            {item.watts.toLocaleString()}W {item.demandFactor < 1 && `(${item.demandFactor * 100}% DF)`}
          </Text>
        </View>
        
        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateItemQuantity(item.id, -1)}
          >
            <Minus size={16} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.quantityValue}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateItemQuantity(item.id, 1)}
          >
            <Plus size={16} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Load Calculator",
          headerLeft: () => <BackButton />,
          headerRight: () => (
            <TouchableOpacity onPress={resetCalculation} style={styles.addButton}>
              <RotateCcw size={22} color="#EAB308" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <CircuitBoard size={28} color="#EAB308" />
            <Text style={styles.resultTitle}>Service Requirements</Text>
          </View>
          
          <View style={styles.resultGrid}>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Connected Load</Text>
              <Text style={styles.resultValue}>{calculations.totalConnectedLoad.toLocaleString()}W</Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Demand Load</Text>
              <Text style={styles.resultValue}>{calculations.totalDemandLoad.toLocaleString()}W</Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Service Amps</Text>
              <Text style={[styles.resultValue, styles.resultValueLarge]}>{calculations.serviceAmps}A</Text>
            </View>
            <View style={[styles.resultItem, styles.resultItemHighlight]}>
              <Text style={styles.resultLabelHighlight}>Recommended Panel</Text>
              <Text style={styles.resultValueHighlight}>{calculations.recommendedPanel}A</Text>
            </View>
          </View>

          <View style={styles.panelRecommendation}>
            {panelSizes.map((panel) => (
              <View
                key={panel.amps}
                style={[
                  styles.panelOption,
                  panel.amps === calculations.recommendedPanel && styles.panelOptionRecommended,
                  panel.amps < calculations.recommendedPanel && styles.panelOptionInsufficient,
                ]}
              >
                <Text
                  style={[
                    styles.panelOptionText,
                    panel.amps === calculations.recommendedPanel && styles.panelOptionTextRecommended,
                    panel.amps < calculations.recommendedPanel && styles.panelOptionTextInsufficient,
                  ]}
                >
                  {panel.label}
                </Text>
                {panel.amps === calculations.recommendedPanel && (
                  <Check size={12} color="#FFF" />
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Building Information</Text>
          
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Square Footage</Text>
              <View style={styles.inputContainer}>
                <Home size={18} color={Colors.textSecondary} />
                <TextInput
                  style={styles.textInput}
                  value={squareFootage}
                  onChangeText={setSquareFootage}
                  keyboardType="number-pad"
                  placeholder="2000"
                  placeholderTextColor={Colors.textTertiary}
                />
                <Text style={styles.inputUnit}>sq ft</Text>
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Voltage</Text>
              <View style={styles.voltageToggle}>
                <TouchableOpacity
                  style={[styles.voltageOption, voltage === "120/240" && styles.voltageOptionActive]}
                  onPress={() => setVoltage("120/240")}
                >
                  <Text style={[styles.voltageText, voltage === "120/240" && styles.voltageTextActive]}>
                    120/240V
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.voltageOption, voltage === "120/208" && styles.voltageOptionActive]}
                  onPress={() => setVoltage("120/208")}
                >
                  <Text style={[styles.voltageText, voltage === "120/208" && styles.voltageTextActive]}>
                    120/208V
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.loadsSection}>
          <View style={styles.loadsSectionHeader}>
            <Text style={styles.sectionTitle}>Electrical Loads</Text>
            <TouchableOpacity
              style={styles.advancedToggle}
              onPress={() => setShowAdvanced(!showAdvanced)}
            >
              <Text style={styles.advancedToggleText}>
                {showAdvanced ? "Simple View" : "Advanced"}
              </Text>
              {showAdvanced ? <ChevronUp size={16} color="#EAB308" /> : <ChevronDown size={16} color="#EAB308" />}
            </TouchableOpacity>
          </View>

          {categories.map((category) => (
            <View key={category} style={styles.categorySection}>
              <TouchableOpacity
                style={styles.categoryHeader}
                onPress={() => setSelectedCategory(selectedCategory === category ? null : category)}
              >
                <Text style={styles.categoryTitle}>{category}</Text>
                <View style={styles.categoryMeta}>
                  <Text style={styles.categoryCount}>
                    {getItemsByCategory(category).filter((i) => i.isIncluded).length}/{getItemsByCategory(category).length}
                  </Text>
                  {selectedCategory === category ? (
                    <ChevronUp size={18} color={Colors.textSecondary} />
                  ) : (
                    <ChevronDown size={18} color={Colors.textSecondary} />
                  )}
                </View>
              </TouchableOpacity>

              {(selectedCategory === category || selectedCategory === null) && (
                <View style={styles.categoryItems}>
                  {getItemsByCategory(category).map(renderLoadItem)}
                </View>
              )}
            </View>
          ))}
        </View>

        {showAdvanced && (
          <View style={styles.breakdownSection}>
            <Text style={styles.sectionTitle}>Load Breakdown</Text>
            <View style={styles.breakdownCard}>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>General Lighting ({calculations.squareFootage} sq ft × 3W)</Text>
                <Text style={styles.breakdownValue}>{calculations.generalLighting.toLocaleString()}W</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Small Appliances (2 circuits)</Text>
                <Text style={styles.breakdownValue}>{calculations.smallAppliances.toLocaleString()}W</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Laundry Circuit</Text>
                <Text style={styles.breakdownValue}>{calculations.laundry.toLocaleString()}W</Text>
              </View>
              <View style={[styles.breakdownRow, styles.breakdownRowSubtotal]}>
                <Text style={styles.breakdownLabelBold}>Base Load Subtotal</Text>
                <Text style={styles.breakdownValueBold}>{calculations.baseLoad.toLocaleString()}W</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>After NEC 220.42 Demand (35%)</Text>
                <Text style={styles.breakdownValue}>{Math.round(calculations.adjustedBaseLoad).toLocaleString()}W</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Fixed Appliances</Text>
                <Text style={styles.breakdownValue}>{Math.round(calculations.applianceLoad).toLocaleString()}W</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>HVAC (Largest Load)</Text>
                <Text style={styles.breakdownValue}>{Math.round(calculations.hvacLoad).toLocaleString()}W</Text>
              </View>
              <View style={[styles.breakdownRow, styles.breakdownRowTotal]}>
                <Text style={styles.breakdownLabelTotal}>Total Demand Load</Text>
                <Text style={styles.breakdownValueTotal}>{Math.round(calculations.totalDemandLoad).toLocaleString()}W</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Service Amps ({voltage}V)</Text>
                <Text style={styles.breakdownValueHighlight}>{calculations.serviceAmps}A</Text>
              </View>
            </View>

            <View style={styles.necReference}>
              <Info size={16} color="#EAB308" />
              <Text style={styles.necReferenceText}>
                Calculation per NEC Article 220 - Standard Method for Dwelling Units
              </Text>
            </View>
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.saveButton} onPress={saveCalculation}>
            <Save size={18} color="#EAB308" />
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton} onPress={() => Alert.alert("Share", "Share functionality coming soon")}>
            <Share2 size={18} color="#FFF" />
            <Text style={styles.shareButtonText}>Share Report</Text>
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
  resultCard: {
    backgroundColor: "#FEF9C3",
    margin: 16,
    padding: 20,
    borderRadius: 20,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#92400E",
  },
  resultGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  resultItem: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  resultItemHighlight: {
    backgroundColor: "#EAB308",
    minWidth: "100%",
  },
  resultLabel: {
    fontSize: 12,
    color: "#92400E",
    marginBottom: 4,
  },
  resultLabelHighlight: {
    fontSize: 12,
    color: "#FFF",
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#92400E",
  },
  resultValueLarge: {
    fontSize: 24,
  },
  resultValueHighlight: {
    fontSize: 28,
    fontWeight: "800" as const,
    color: "#FFF",
  },
  panelRecommendation: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "center",
  },
  panelOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  panelOptionRecommended: {
    backgroundColor: "#22C55E",
  },
  panelOptionInsufficient: {
    backgroundColor: "rgba(220,38,38,0.2)",
  },
  panelOptionText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#92400E",
  },
  panelOptionTextRecommended: {
    color: "#FFF",
  },
  panelOptionTextInsufficient: {
    color: "#DC2626",
  },
  inputSection: {
    padding: 16,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 14,
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  inputUnit: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  voltageToggle: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
  },
  voltageOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  voltageOptionActive: {
    backgroundColor: "#EAB308",
  },
  voltageText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  voltageTextActive: {
    color: "#000",
  },
  loadsSection: {
    padding: 16,
    paddingTop: 0,
  },
  loadsSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  advancedToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  advancedToggleText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#EAB308",
  },
  categorySection: {
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  categoryMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryCount: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  categoryItems: {
    marginTop: 8,
    gap: 6,
  },
  loadItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  loadItemActive: {
    backgroundColor: "#FEF9C3",
    borderWidth: 1,
    borderColor: "#EAB308",
  },
  loadItemCheck: {
    padding: 2,
  },
  checkboxChecked: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: "#EAB308",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxUnchecked: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  loadItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  loadItemInfo: {
    flex: 1,
  },
  loadItemName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  loadItemNameInactive: {
    color: Colors.textTertiary,
  },
  loadItemWatts: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    minWidth: 24,
    textAlign: "center" as const,
  },
  breakdownSection: {
    padding: 16,
    paddingTop: 0,
  },
  breakdownCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  breakdownRowSubtotal: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.border,
    marginTop: 4,
  },
  breakdownRowTotal: {
    borderBottomWidth: 0,
    backgroundColor: "#FEF9C3",
    marginHorizontal: -16,
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: -8,
    paddingBottom: 12,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  breakdownLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  breakdownLabelBold: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  breakdownLabelTotal: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#92400E",
  },
  breakdownValue: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.text,
  },
  breakdownValueBold: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  breakdownValueTotal: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#92400E",
  },
  breakdownValueHighlight: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#EAB308",
  },
  necReference: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: "#FEF9C3",
    borderRadius: 10,
  },
  necReferenceText: {
    flex: 1,
    fontSize: 12,
    color: "#92400E",
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    paddingTop: 8,
  },
  saveButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.surface,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EAB308",
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#EAB308",
  },
  shareButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#EAB308",
    paddingVertical: 14,
    borderRadius: 12,
  },
  shareButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#000",
  },
});
