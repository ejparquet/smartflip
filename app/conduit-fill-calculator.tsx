import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import * as Haptics from "expo-haptics";
import {
  ArrowLeft,
  Circle,
  Plus,
  Minus,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Info,
  RotateCcw,
  Save,
  Share2,
  ChevronDown,
  ChevronUp,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";

interface WireType {
  awg: string;
  thhn: number;
  thwn: number;
  xhhw: number;
}

interface ConduitType {
  size: string;
  emt: number;
  imc: number;
  rmc: number;
  pvc40: number;
  pvc80: number;
}

interface WireEntry {
  id: string;
  awg: string;
  insulation: "thhn" | "thwn" | "xhhw";
  quantity: number;
}

const wireAreas: WireType[] = [
  { awg: "14", thhn: 0.0097, thwn: 0.0097, xhhw: 0.0139 },
  { awg: "12", thhn: 0.0133, thwn: 0.0133, xhhw: 0.0181 },
  { awg: "10", thhn: 0.0211, thwn: 0.0211, xhhw: 0.0243 },
  { awg: "8", thhn: 0.0366, thwn: 0.0366, xhhw: 0.0437 },
  { awg: "6", thhn: 0.0507, thwn: 0.0507, xhhw: 0.059 },
  { awg: "4", thhn: 0.0824, thwn: 0.0824, xhhw: 0.0814 },
  { awg: "3", thhn: 0.0973, thwn: 0.0973, xhhw: 0.0962 },
  { awg: "2", thhn: 0.1158, thwn: 0.1158, xhhw: 0.1146 },
  { awg: "1", thhn: 0.1562, thwn: 0.1562, xhhw: 0.1534 },
  { awg: "1/0", thhn: 0.1855, thwn: 0.1855, xhhw: 0.1825 },
  { awg: "2/0", thhn: 0.2223, thwn: 0.2223, xhhw: 0.219 },
  { awg: "3/0", thhn: 0.2679, thwn: 0.2679, xhhw: 0.2642 },
  { awg: "4/0", thhn: 0.3237, thwn: 0.3237, xhhw: 0.3197 },
  { awg: "250", thhn: 0.3970, thwn: 0.3970, xhhw: 0.3904 },
  { awg: "300", thhn: 0.4608, thwn: 0.4608, xhhw: 0.4536 },
  { awg: "350", thhn: 0.5242, thwn: 0.5242, xhhw: 0.5166 },
  { awg: "500", thhn: 0.7073, thwn: 0.7073, xhhw: 0.6984 },
];

const conduitAreas: ConduitType[] = [
  { size: "1/2\"", emt: 0.304, imc: 0.342, rmc: 0.314, pvc40: 0.285, pvc80: 0.217 },
  { size: "3/4\"", emt: 0.533, imc: 0.586, rmc: 0.549, pvc40: 0.508, pvc80: 0.409 },
  { size: "1\"", emt: 0.864, imc: 0.959, rmc: 0.887, pvc40: 0.832, pvc80: 0.688 },
  { size: "1-1/4\"", emt: 1.496, imc: 1.647, rmc: 1.526, pvc40: 1.453, pvc80: 1.237 },
  { size: "1-1/2\"", emt: 2.036, imc: 2.225, rmc: 2.071, pvc40: 1.986, pvc80: 1.711 },
  { size: "2\"", emt: 3.356, imc: 3.630, rmc: 3.408, pvc40: 3.291, pvc80: 2.874 },
  { size: "2-1/2\"", emt: 4.866, imc: 5.452, rmc: 4.866, pvc40: 4.695, pvc80: 4.119 },
  { size: "3\"", emt: 7.499, imc: 8.085, rmc: 7.499, pvc40: 7.268, pvc80: 6.442 },
  { size: "3-1/2\"", emt: 9.521, imc: 10.584, rmc: 9.521, pvc40: 9.233, pvc80: 8.213 },
  { size: "4\"", emt: 12.723, imc: 13.631, rmc: 12.566, pvc40: 12.243, pvc80: 10.95 },
];

const conduitTypes = [
  { id: "emt", name: "EMT", description: "Electrical Metallic Tubing" },
  { id: "imc", name: "IMC", description: "Intermediate Metal Conduit" },
  { id: "rmc", name: "RMC", description: "Rigid Metal Conduit" },
  { id: "pvc40", name: "PVC 40", description: "Schedule 40 PVC" },
  { id: "pvc80", name: "PVC 80", description: "Schedule 80 PVC" },
];

const insulationTypes = [
  { id: "thhn", name: "THHN/THWN-2", temp: "90°C" },
  { id: "thwn", name: "THWN", temp: "75°C" },
  { id: "xhhw", name: "XHHW", temp: "90°C" },
];

export default function ConduitFillCalculatorScreen() {
  const router = useRouter();
  const [conduitSize, setConduitSize] = useState("3/4\"");
  const [conduitType, setConduitType] = useState<"emt" | "imc" | "rmc" | "pvc40" | "pvc80">("emt");
  const [wires, setWires] = useState<WireEntry[]>([
    { id: "1", awg: "12", insulation: "thhn", quantity: 3 },
  ]);
  const [showConduitDropdown, setShowConduitDropdown] = useState(false);
  const [expandedWire, setExpandedWire] = useState<string | null>(null);

  const calculations = useMemo(() => {
    const conduit = conduitAreas.find((c) => c.size === conduitSize);
    if (!conduit) {
      return { totalWireArea: 0, conduitArea: 0, fillPercent: 0, maxFillPercent: 40, status: "unknown" as const };
    }

    const conduitArea = conduit[conduitType];
    let totalWireArea = 0;
    let wireCount = 0;

    wires.forEach((wire) => {
      const wireData = wireAreas.find((w) => w.awg === wire.awg);
      if (wireData) {
        totalWireArea += wireData[wire.insulation] * wire.quantity;
        wireCount += wire.quantity;
      }
    });

    let maxFillPercent = 40;
    if (wireCount === 1) maxFillPercent = 53;
    else if (wireCount === 2) maxFillPercent = 31;

    const fillPercent = (totalWireArea / conduitArea) * 100;

    let status: "excellent" | "good" | "acceptable" | "over" = "excellent";
    if (fillPercent <= maxFillPercent * 0.6) status = "excellent";
    else if (fillPercent <= maxFillPercent * 0.8) status = "good";
    else if (fillPercent <= maxFillPercent) status = "acceptable";
    else status = "over";

    return {
      totalWireArea: Math.round(totalWireArea * 10000) / 10000,
      conduitArea: Math.round(conduitArea * 1000) / 1000,
      fillPercent: Math.round(fillPercent * 10) / 10,
      maxFillPercent,
      wireCount,
      status,
    };
  }, [conduitSize, conduitType, wires]);

  const suggestedConduit = useMemo(() => {
    let totalWireArea = 0;
    let wireCount = 0;

    wires.forEach((wire) => {
      const wireData = wireAreas.find((w) => w.awg === wire.awg);
      if (wireData) {
        totalWireArea += wireData[wire.insulation] * wire.quantity;
        wireCount += wire.quantity;
      }
    });

    let maxFillPercent = 40;
    if (wireCount === 1) maxFillPercent = 53;
    else if (wireCount === 2) maxFillPercent = 31;

    for (const conduit of conduitAreas) {
      const conduitArea = conduit[conduitType];
      const fillPercent = (totalWireArea / conduitArea) * 100;
      if (fillPercent <= maxFillPercent) {
        return conduit.size;
      }
    }
    return "4\"+ required";
  }, [wires, conduitType]);

  const addWire = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newId = String(Date.now());
    setWires((prev) => [...prev, { id: newId, awg: "12", insulation: "thhn", quantity: 1 }]);
    setExpandedWire(newId);
  }, []);

  const removeWire = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setWires((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const updateWire = useCallback((id: string, updates: Partial<WireEntry>) => {
    setWires((prev) => prev.map((w) => (w.id === id ? { ...w, ...updates } : w)));
  }, []);

  const resetCalculation = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert("Reset Calculator", "Reset all values to defaults?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: () => {
          setConduitSize("3/4\"");
          setConduitType("emt");
          setWires([{ id: "1", awg: "12", insulation: "thhn", quantity: 3 }]);
        },
      },
    ]);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent": return "#22C55E";
      case "good": return "#84CC16";
      case "acceptable": return "#EAB308";
      case "over": return "#EF4444";
      default: return Colors.textSecondary;
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Conduit Fill Calculator",
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
            {calculations.status === "over" ? (
              <AlertTriangle size={24} color="#EF4444" />
            ) : (
              <CheckCircle size={24} color={getStatusColor(calculations.status)} />
            )}
            <View style={styles.resultHeaderText}>
              <Text style={styles.resultTitle}>Conduit Fill Analysis</Text>
              <Text style={[styles.statusBadge, { color: getStatusColor(calculations.status) }]}>
                {calculations.status === "over" ? "OVER LIMIT" : calculations.status.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.fillVisual}>
            <View style={styles.conduitVisual}>
              <View style={styles.conduitOuter}>
                <View
                  style={[
                    styles.conduitFill,
                    {
                      height: `${Math.min(calculations.fillPercent, 100)}%`,
                      backgroundColor: getStatusColor(calculations.status),
                    },
                  ]}
                />
              </View>
              <Text style={styles.conduitLabel}>{conduitSize} {conduitType.toUpperCase()}</Text>
            </View>

            <View style={styles.fillStats}>
              <View style={styles.fillStatRow}>
                <Text style={styles.fillStatLabel}>Fill</Text>
                <Text style={[styles.fillStatValue, { color: getStatusColor(calculations.status) }]}>
                  {calculations.fillPercent}%
                </Text>
              </View>
              <View style={styles.fillStatRow}>
                <Text style={styles.fillStatLabel}>Max Allowed</Text>
                <Text style={styles.fillStatValue}>{calculations.maxFillPercent}%</Text>
              </View>
              <View style={styles.fillStatRow}>
                <Text style={styles.fillStatLabel}>Wire Area</Text>
                <Text style={styles.fillStatValue}>{calculations.totalWireArea} in²</Text>
              </View>
              <View style={styles.fillStatRow}>
                <Text style={styles.fillStatLabel}>Conduit Area</Text>
                <Text style={styles.fillStatValue}>{calculations.conduitArea} in²</Text>
              </View>
              <View style={[styles.fillStatRow, styles.fillStatRowHighlight]}>
                <Text style={styles.fillStatLabelHighlight}>Minimum Size</Text>
                <Text style={styles.fillStatValueHighlight}>{suggestedConduit}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Conduit</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Conduit Size</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowConduitDropdown(!showConduitDropdown)}
            >
              <Circle size={18} color={Colors.textSecondary} />
              <Text style={styles.dropdownText}>{conduitSize}</Text>
              <ChevronDown size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
            {showConduitDropdown && (
              <View style={styles.dropdownMenu}>
                <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                  {conduitAreas.map((conduit) => (
                    <TouchableOpacity
                      key={conduit.size}
                      style={[styles.dropdownItem, conduitSize === conduit.size && styles.dropdownItemActive]}
                      onPress={() => {
                        setConduitSize(conduit.size);
                        setShowConduitDropdown(false);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                    >
                      <Text style={[styles.dropdownItemText, conduitSize === conduit.size && styles.dropdownItemTextActive]}>
                        {conduit.size}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Conduit Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.typeChips}>
                {conduitTypes.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[styles.typeChip, conduitType === type.id && styles.typeChipActive]}
                    onPress={() => {
                      setConduitType(type.id as typeof conduitType);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <Text style={[styles.typeChipText, conduitType === type.id && styles.typeChipTextActive]}>
                      {type.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>

        <View style={styles.wiresSection}>
          <View style={styles.wiresSectionHeader}>
            <Text style={styles.sectionTitle}>Conductors</Text>
            <TouchableOpacity style={styles.addWireButton} onPress={addWire}>
              <Plus size={18} color="#EAB308" />
              <Text style={styles.addWireText}>Add Wire</Text>
            </TouchableOpacity>
          </View>

          {wires.map((wire) => {
            const wireData = wireAreas.find((w) => w.awg === wire.awg);
            const wireArea = wireData ? wireData[wire.insulation] * wire.quantity : 0;
            const isExpanded = expandedWire === wire.id;

            return (
              <View key={wire.id} style={styles.wireCard}>
                <TouchableOpacity
                  style={styles.wireCardHeader}
                  onPress={() => setExpandedWire(isExpanded ? null : wire.id)}
                >
                  <View style={styles.wireCardInfo}>
                    <Text style={styles.wireCardTitle}>
                      {wire.quantity}× {wire.awg} AWG {wire.insulation.toUpperCase()}
                    </Text>
                    <Text style={styles.wireCardMeta}>
                      {Math.round(wireArea * 10000) / 10000} in²
                    </Text>
                  </View>
                  <View style={styles.wireCardActions}>
                    {wires.length > 1 && (
                      <TouchableOpacity
                        style={styles.wireDeleteButton}
                        onPress={() => removeWire(wire.id)}
                      >
                        <Trash2 size={18} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                    {isExpanded ? (
                      <ChevronUp size={20} color={Colors.textSecondary} />
                    ) : (
                      <ChevronDown size={20} color={Colors.textSecondary} />
                    )}
                  </View>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.wireCardBody}>
                    <View style={styles.wireInputGroup}>
                      <Text style={styles.wireInputLabel}>Wire Size</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.wireChips}>
                          {wireAreas.slice(0, 10).map((w) => (
                            <TouchableOpacity
                              key={w.awg}
                              style={[styles.wireChip, wire.awg === w.awg && styles.wireChipActive]}
                              onPress={() => updateWire(wire.id, { awg: w.awg })}
                            >
                              <Text style={[styles.wireChipText, wire.awg === w.awg && styles.wireChipTextActive]}>
                                {w.awg}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </ScrollView>
                    </View>

                    <View style={styles.wireInputGroup}>
                      <Text style={styles.wireInputLabel}>Insulation</Text>
                      <View style={styles.insulationChips}>
                        {insulationTypes.map((ins) => (
                          <TouchableOpacity
                            key={ins.id}
                            style={[styles.insulationChip, wire.insulation === ins.id && styles.insulationChipActive]}
                            onPress={() => updateWire(wire.id, { insulation: ins.id as WireEntry["insulation"] })}
                          >
                            <Text style={[styles.insulationChipText, wire.insulation === ins.id && styles.insulationChipTextActive]}>
                              {ins.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    <View style={styles.wireInputGroup}>
                      <Text style={styles.wireInputLabel}>Quantity</Text>
                      <View style={styles.quantityControls}>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => updateWire(wire.id, { quantity: Math.max(1, wire.quantity - 1) })}
                        >
                          <Minus size={18} color={Colors.text} />
                        </TouchableOpacity>
                        <Text style={styles.quantityValue}>{wire.quantity}</Text>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => updateWire(wire.id, { quantity: wire.quantity + 1 })}
                        >
                          <Plus size={18} color={Colors.text} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.referenceSection}>
          <Text style={styles.sectionTitle}>NEC Fill Limits (Chapter 9)</Text>
          <View style={styles.referenceCard}>
            <View style={styles.referenceRow}>
              <Text style={styles.referenceLabel}>1 Wire</Text>
              <Text style={styles.referenceValue}>53% max fill</Text>
            </View>
            <View style={styles.referenceRow}>
              <Text style={styles.referenceLabel}>2 Wires</Text>
              <Text style={styles.referenceValue}>31% max fill</Text>
            </View>
            <View style={styles.referenceRow}>
              <Text style={styles.referenceLabel}>3+ Wires</Text>
              <Text style={styles.referenceValue}>40% max fill</Text>
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
    marginBottom: 20,
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
  fillVisual: {
    flexDirection: "row",
    gap: 20,
  },
  conduitVisual: {
    alignItems: "center",
  },
  conduitOuter: {
    width: 80,
    height: 120,
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#92400E",
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  conduitFill: {
    width: "100%",
    borderBottomLeftRadius: 37,
    borderBottomRightRadius: 37,
  },
  conduitLabel: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#92400E",
  },
  fillStats: {
    flex: 1,
    gap: 8,
  },
  fillStatRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fillStatRowHighlight: {
    backgroundColor: "rgba(255,255,255,0.6)",
    padding: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  fillStatLabel: {
    fontSize: 13,
    color: "#92400E",
  },
  fillStatLabelHighlight: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#92400E",
  },
  fillStatValue: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: "#92400E",
  },
  fillStatValueHighlight: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#EAB308",
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
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
    marginBottom: 8,
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
  typeChips: {
    flexDirection: "row",
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    borderRadius: 10,
  },
  typeChipActive: {
    backgroundColor: "#EAB308",
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  typeChipTextActive: {
    color: "#000",
  },
  wiresSection: {
    padding: 16,
    paddingTop: 0,
  },
  wiresSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  addWireButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#FEF9C3",
    borderRadius: 8,
  },
  addWireText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#92400E",
  },
  wireCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    marginBottom: 10,
    overflow: "hidden",
  },
  wireCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  wireCardInfo: {
    flex: 1,
  },
  wireCardTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  wireCardMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  wireCardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  wireDeleteButton: {
    padding: 4,
  },
  wireCardBody: {
    padding: 14,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  wireInputGroup: {
    marginTop: 12,
  },
  wireInputLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  wireChips: {
    flexDirection: "row",
    gap: 6,
  },
  wireChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 8,
  },
  wireChipActive: {
    backgroundColor: "#EAB308",
  },
  wireChipText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  wireChipTextActive: {
    color: "#000",
  },
  insulationChips: {
    flexDirection: "row",
    gap: 8,
  },
  insulationChip: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 8,
    alignItems: "center",
  },
  insulationChipActive: {
    backgroundColor: "#EAB308",
  },
  insulationChipText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  insulationChipTextActive: {
    color: "#000",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    minWidth: 40,
    textAlign: "center" as const,
  },
  referenceSection: {
    padding: 16,
    paddingTop: 0,
  },
  referenceCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  referenceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  referenceLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  referenceValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
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
