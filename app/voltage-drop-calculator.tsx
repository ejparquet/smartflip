import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import * as Haptics from "expo-haptics";
import {
  ArrowLeft,
  Zap,
  Cable,
  Ruler,
  Activity,
  AlertTriangle,
  CheckCircle,
  Info,
  RotateCcw,
  Save,
  Share2,
  ChevronDown,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";

interface WireGauge {
  awg: string;
  diameter: number;
  resistance: number;
  ampacity60: number;
  ampacity75: number;
  ampacity90: number;
}

const wireGauges: WireGauge[] = [
  { awg: "14", diameter: 1.63, resistance: 3.14, ampacity60: 15, ampacity75: 20, ampacity90: 25 },
  { awg: "12", diameter: 2.05, resistance: 1.98, ampacity60: 20, ampacity75: 25, ampacity90: 30 },
  { awg: "10", diameter: 2.59, resistance: 1.24, ampacity60: 30, ampacity75: 35, ampacity90: 40 },
  { awg: "8", diameter: 3.26, resistance: 0.778, ampacity60: 40, ampacity75: 50, ampacity90: 55 },
  { awg: "6", diameter: 4.11, resistance: 0.491, ampacity60: 55, ampacity75: 65, ampacity90: 75 },
  { awg: "4", diameter: 5.19, resistance: 0.308, ampacity60: 70, ampacity75: 85, ampacity90: 95 },
  { awg: "3", diameter: 5.83, resistance: 0.245, ampacity60: 85, ampacity75: 100, ampacity90: 115 },
  { awg: "2", diameter: 6.54, resistance: 0.194, ampacity60: 95, ampacity75: 115, ampacity90: 130 },
  { awg: "1", diameter: 7.35, resistance: 0.154, ampacity60: 110, ampacity75: 130, ampacity90: 145 },
  { awg: "1/0", diameter: 8.25, resistance: 0.122, ampacity60: 125, ampacity75: 150, ampacity90: 170 },
  { awg: "2/0", diameter: 9.27, resistance: 0.0967, ampacity60: 145, ampacity75: 175, ampacity90: 195 },
  { awg: "3/0", diameter: 10.40, resistance: 0.0766, ampacity60: 165, ampacity75: 200, ampacity90: 225 },
  { awg: "4/0", diameter: 11.68, resistance: 0.0608, ampacity60: 195, ampacity75: 230, ampacity90: 260 },
];

const conductorMaterials = [
  { id: "copper", name: "Copper", factor: 1.0 },
  { id: "aluminum", name: "Aluminum", factor: 1.61 },
];

const circuitTypes = [
  { id: "single", name: "Single Phase", factor: 2 },
  { id: "three", name: "Three Phase", factor: 1.732 },
];

export default function VoltageDropCalculatorScreen() {
  const router = useRouter();
  const [wireGauge, setWireGauge] = useState("12");
  const [conductorMaterial, setConductorMaterial] = useState("copper");
  const [circuitType, setCircuitType] = useState("single");
  const [voltage, setVoltage] = useState("120");
  const [current, setCurrent] = useState("15");
  const [distance, setDistance] = useState("100");
  const [showGaugeDropdown, setShowGaugeDropdown] = useState(false);

  const calculations = useMemo(() => {
    const v = parseFloat(voltage) || 0;
    const i = parseFloat(current) || 0;
    const d = parseFloat(distance) || 0;

    const wire = wireGauges.find((w) => w.awg === wireGauge);
    if (!wire || v === 0) {
      return {
        voltageDrop: 0,
        voltageDropPercent: 0,
        endVoltage: v,
        status: "unknown" as const,
        recommendation: "",
      };
    }

    const materialFactor = conductorMaterials.find((m) => m.id === conductorMaterial)?.factor || 1;
    const phaseFactor = circuitTypes.find((c) => c.id === circuitType)?.factor || 2;

    const resistance = wire.resistance * materialFactor;
    const voltageDrop = (phaseFactor * i * d * resistance) / 1000;
    const voltageDropPercent = (voltageDrop / v) * 100;
    const endVoltage = v - voltageDrop;

    let status: "excellent" | "good" | "acceptable" | "poor" = "excellent";
    let recommendation = "";

    if (voltageDropPercent <= 2) {
      status = "excellent";
      recommendation = "Excellent! Well within NEC recommendations.";
    } else if (voltageDropPercent <= 3) {
      status = "good";
      recommendation = "Good for branch circuits. Consider larger wire for feeders.";
    } else if (voltageDropPercent <= 5) {
      status = "acceptable";
      recommendation = "Acceptable for branch circuits only. Use larger gauge for better efficiency.";
    } else {
      status = "poor";
      recommendation = "Exceeds NEC recommendations. Use larger wire gauge or reduce distance.";
    }

    return {
      voltageDrop: Math.round(voltageDrop * 100) / 100,
      voltageDropPercent: Math.round(voltageDropPercent * 100) / 100,
      endVoltage: Math.round(endVoltage * 100) / 100,
      status,
      recommendation,
    };
  }, [wireGauge, conductorMaterial, circuitType, voltage, current, distance]);

  const suggestedGauge = useMemo(() => {
    const v = parseFloat(voltage) || 0;
    const i = parseFloat(current) || 0;
    const d = parseFloat(distance) || 0;

    if (v === 0 || i === 0 || d === 0) return null;

    const materialFactor = conductorMaterials.find((m) => m.id === conductorMaterial)?.factor || 1;
    const phaseFactor = circuitTypes.find((c) => c.id === circuitType)?.factor || 2;

    for (const wire of wireGauges) {
      const resistance = wire.resistance * materialFactor;
      const vd = (phaseFactor * i * d * resistance) / 1000;
      const vdPercent = (vd / v) * 100;
      if (vdPercent <= 3) {
        return wire.awg;
      }
    }
    return "4/0+";
  }, [voltage, current, distance, conductorMaterial, circuitType]);

  const resetCalculation = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert("Reset Calculator", "Reset all values to defaults?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: () => {
          setWireGauge("12");
          setConductorMaterial("copper");
          setCircuitType("single");
          setVoltage("120");
          setCurrent("15");
          setDistance("100");
        },
      },
    ]);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "#22C55E";
      case "good":
        return "#84CC16";
      case "acceptable":
        return "#EAB308";
      case "poor":
        return "#EF4444";
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "excellent":
      case "good":
        return <CheckCircle size={24} color={getStatusColor(status)} />;
      case "acceptable":
      case "poor":
        return <AlertTriangle size={24} color={getStatusColor(status)} />;
      default:
        return <Info size={24} color={Colors.textSecondary} />;
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Voltage Drop Calculator",
          headerLeft: () => <BackButton />,
          headerRight: () => (
            <TouchableOpacity onPress={resetCalculation} style={styles.headerButton}>
              <RotateCcw size={22} color="#EAB308" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            {getStatusIcon(calculations.status)}
            <View style={styles.resultHeaderText}>
              <Text style={styles.resultTitle}>Voltage Drop Analysis</Text>
              <Text style={[styles.statusBadge, { color: getStatusColor(calculations.status) }]}>
                {calculations.status.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.resultGrid}>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Voltage Drop</Text>
              <Text style={styles.resultValue}>{calculations.voltageDrop}V</Text>
            </View>
            <View style={[styles.resultItem, styles.resultItemHighlight]}>
              <Text style={styles.resultLabelHighlight}>Drop Percentage</Text>
              <Text style={styles.resultValueHighlight}>{calculations.voltageDropPercent}%</Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>End Voltage</Text>
              <Text style={styles.resultValue}>{calculations.endVoltage}V</Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Suggested Gauge</Text>
              <Text style={[styles.resultValue, { color: "#EAB308" }]}>
                {suggestedGauge ? `${suggestedGauge} AWG` : "—"}
              </Text>
            </View>
          </View>

          <View style={styles.recommendationBox}>
            <Info size={16} color={getStatusColor(calculations.status)} />
            <Text style={[styles.recommendationText, { color: getStatusColor(calculations.status) }]}>
              {calculations.recommendation}
            </Text>
          </View>

          <View style={styles.dropScale}>
            <View style={styles.dropScaleLabels}>
              <Text style={styles.dropScaleLabel}>0%</Text>
              <Text style={styles.dropScaleLabel}>3%</Text>
              <Text style={styles.dropScaleLabel}>5%</Text>
            </View>
            <View style={styles.dropScaleBar}>
              <View style={[styles.dropScaleExcellent, { flex: 2 }]} />
              <View style={[styles.dropScaleGood, { flex: 1 }]} />
              <View style={[styles.dropScalePoor, { flex: 2 }]} />
              <View
                style={[
                  styles.dropScaleIndicator,
                  { left: `${Math.min(calculations.voltageDropPercent * 20, 100)}%` },
                ]}
              />
            </View>
          </View>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Circuit Parameters</Text>

          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Voltage (V)</Text>
              <View style={styles.inputContainer}>
                <Zap size={18} color={Colors.textSecondary} />
                <TextInput
                  style={styles.textInput}
                  value={voltage}
                  onChangeText={setVoltage}
                  keyboardType="number-pad"
                  placeholder="120"
                  placeholderTextColor={Colors.textTertiary}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Current (A)</Text>
              <View style={styles.inputContainer}>
                <Activity size={18} color={Colors.textSecondary} />
                <TextInput
                  style={styles.textInput}
                  value={current}
                  onChangeText={setCurrent}
                  keyboardType="decimal-pad"
                  placeholder="15"
                  placeholderTextColor={Colors.textTertiary}
                />
              </View>
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>One-Way Distance (ft)</Text>
              <View style={styles.inputContainer}>
                <Ruler size={18} color={Colors.textSecondary} />
                <TextInput
                  style={styles.textInput}
                  value={distance}
                  onChangeText={setDistance}
                  keyboardType="number-pad"
                  placeholder="100"
                  placeholderTextColor={Colors.textTertiary}
                />
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Wire Gauge (AWG)</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowGaugeDropdown(!showGaugeDropdown)}
            >
              <Cable size={18} color={Colors.textSecondary} />
              <Text style={styles.dropdownText}>{wireGauge} AWG</Text>
              <ChevronDown size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
            {showGaugeDropdown && (
              <View style={styles.dropdownMenu}>
                <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                  {wireGauges.map((wire) => (
                    <TouchableOpacity
                      key={wire.awg}
                      style={[styles.dropdownItem, wireGauge === wire.awg && styles.dropdownItemActive]}
                      onPress={() => {
                        setWireGauge(wire.awg);
                        setShowGaugeDropdown(false);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                    >
                      <Text style={[styles.dropdownItemText, wireGauge === wire.awg && styles.dropdownItemTextActive]}>
                        {wire.awg} AWG
                      </Text>
                      <Text style={styles.dropdownItemMeta}>
                        {wire.ampacity75}A @ 75°C
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Conductor Material</Text>
            <View style={styles.toggleGroup}>
              {conductorMaterials.map((material) => (
                <TouchableOpacity
                  key={material.id}
                  style={[styles.toggleOption, conductorMaterial === material.id && styles.toggleOptionActive]}
                  onPress={() => {
                    setConductorMaterial(material.id);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text style={[styles.toggleText, conductorMaterial === material.id && styles.toggleTextActive]}>
                    {material.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Circuit Type</Text>
            <View style={styles.toggleGroup}>
              {circuitTypes.map((circuit) => (
                <TouchableOpacity
                  key={circuit.id}
                  style={[styles.toggleOption, circuitType === circuit.id && styles.toggleOptionActive]}
                  onPress={() => {
                    setCircuitType(circuit.id);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text style={[styles.toggleText, circuitType === circuit.id && styles.toggleTextActive]}>
                    {circuit.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.referenceSection}>
          <Text style={styles.sectionTitle}>NEC Guidelines</Text>
          <View style={styles.referenceCard}>
            <View style={styles.referenceRow}>
              <View style={[styles.referenceDot, { backgroundColor: "#22C55E" }]} />
              <Text style={styles.referenceText}>≤ 3% for branch circuits (NEC 210.19)</Text>
            </View>
            <View style={styles.referenceRow}>
              <View style={[styles.referenceDot, { backgroundColor: "#84CC16" }]} />
              <Text style={styles.referenceText}>≤ 3% for feeders (NEC 215.2)</Text>
            </View>
            <View style={styles.referenceRow}>
              <View style={[styles.referenceDot, { backgroundColor: "#EAB308" }]} />
              <Text style={styles.referenceText}>≤ 5% total (branch + feeder combined)</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert("Saved!", "Calculation saved to your projects.");
            }}
          >
            <Save size={18} color="#EAB308" />
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => Alert.alert("Share", "Share functionality coming soon")}
          >
            <Share2 size={18} color="#000" />
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
  headerButton: {
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
    gap: 12,
    marginBottom: 16,
  },
  resultHeaderText: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#92400E",
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: "700" as const,
    marginTop: 2,
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
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#92400E",
  },
  resultValueHighlight: {
    fontSize: 24,
    fontWeight: "800" as const,
    color: "#FFF",
  },
  recommendationBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.6)",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  recommendationText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500" as const,
    lineHeight: 18,
  },
  dropScale: {
    marginTop: 4,
  },
  dropScaleLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    paddingHorizontal: 2,
  },
  dropScaleLabel: {
    fontSize: 10,
    color: "#92400E",
    fontWeight: "600" as const,
  },
  dropScaleBar: {
    flexDirection: "row",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    position: "relative",
  },
  dropScaleExcellent: {
    backgroundColor: "#22C55E",
  },
  dropScaleGood: {
    backgroundColor: "#EAB308",
  },
  dropScalePoor: {
    backgroundColor: "#EF4444",
  },
  dropScaleIndicator: {
    position: "absolute",
    top: -4,
    width: 4,
    height: 16,
    backgroundColor: "#000",
    borderRadius: 2,
    marginLeft: -2,
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
    marginBottom: 12,
  },
  inputGroup: {
    flex: 1,
    marginBottom: 12,
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
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  dropdownMenu: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  dropdownItemActive: {
    backgroundColor: "#FEF9C3",
  },
  dropdownItemText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  dropdownItemTextActive: {
    color: "#92400E",
  },
  dropdownItemMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  toggleGroup: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  toggleOptionActive: {
    backgroundColor: "#EAB308",
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  toggleTextActive: {
    color: "#000",
  },
  referenceSection: {
    padding: 16,
    paddingTop: 0,
  },
  referenceCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  referenceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  referenceDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  referenceText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
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
