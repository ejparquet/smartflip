import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import {
  ArrowLeft,
  Shield,
  Zap,
  Lock,
  AlertTriangle,
  CheckCircle,
  Circle,
  X,
  ChevronRight,
  HardHat,
  Flame,
  FileText,
  RotateCcw,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";

interface SafetyItem {
  id: string;
  text: string;
  isChecked: boolean;
  severity: "critical" | "warning" | "standard";
  details?: string;
}

interface SafetyProcedure {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  items: SafetyItem[];
  category: "loto" | "arc_flash" | "ppe" | "general";
}

interface ActiveChecklist {
  id: string;
  procedureId: string;
  procedureTitle: string;
  jobName: string;
  date: string;
  items: SafetyItem[];
  completedBy?: string;
  status: "active" | "completed";
}

const safetyProcedures: SafetyProcedure[] = [
  {
    id: "loto",
    title: "Lockout/Tagout (LOTO)",
    description: "Energy isolation procedures per OSHA 1910.147",
    icon: Lock,
    color: "#DC2626",
    bgColor: "#FEE2E2",
    category: "loto",
    items: [
      { id: "1", text: "Notify all affected employees of the lockout", isChecked: false, severity: "critical", details: "Inform workers in the area that equipment will be locked out" },
      { id: "2", text: "Identify all energy sources (electrical, mechanical, hydraulic, pneumatic, thermal)", isChecked: false, severity: "critical", details: "Use equipment documentation to identify all energy inputs" },
      { id: "3", text: "Shut down equipment using normal stopping procedure", isChecked: false, severity: "critical" },
      { id: "4", text: "Isolate equipment from energy sources", isChecked: false, severity: "critical", details: "Open disconnects, close valves, block moving parts" },
      { id: "5", text: "Apply lockout devices to energy isolation points", isChecked: false, severity: "critical", details: "Each worker applies their own lock" },
      { id: "6", text: "Attach tags with date, time, and worker name", isChecked: false, severity: "critical" },
      { id: "7", text: "Release stored energy (capacitors, springs, pressure)", isChecked: false, severity: "critical", details: "Discharge capacitors, release springs, bleed pressure lines" },
      { id: "8", text: "Verify zero energy state with appropriate test equipment", isChecked: false, severity: "critical", details: "Use voltage tester on all phases, test each conductor" },
      { id: "9", text: "Attempt to restart equipment to confirm isolation", isChecked: false, severity: "warning", details: "Return controls to off position after test" },
      { id: "10", text: "Ground conductors if work involves contact with conductors", isChecked: false, severity: "warning" },
    ],
  },
  {
    id: "arc_flash",
    title: "Arc Flash Protection",
    description: "NFPA 70E compliant arc flash safety",
    icon: Flame,
    color: "#272D53",
    bgColor: "#E8E9EE",
    category: "arc_flash",
    items: [
      { id: "1", text: "Review arc flash hazard analysis for equipment", isChecked: false, severity: "critical", details: "Check incident energy level and PPE category" },
      { id: "2", text: "Verify arc flash labels are present on equipment", isChecked: false, severity: "critical", details: "Labels should show incident energy or PPE category" },
      { id: "3", text: "Determine approach boundaries (Limited, Restricted, Prohibited)", isChecked: false, severity: "critical" },
      { id: "4", text: "Select PPE rated for incident energy level", isChecked: false, severity: "critical", details: "Arc rating (cal/cm²) must exceed incident energy" },
      { id: "5", text: "Inspect PPE for damage, contamination, or wear", isChecked: false, severity: "critical" },
      { id: "6", text: "Don arc-rated face shield with balaclava", isChecked: false, severity: "critical" },
      { id: "7", text: "Wear arc-rated gloves appropriate for voltage", isChecked: false, severity: "critical" },
      { id: "8", text: "Ensure no gaps in PPE coverage", isChecked: false, severity: "warning", details: "Sleeves tucked into gloves, shirt into pants" },
      { id: "9", text: "Remove or cover conductive jewelry and metal objects", isChecked: false, severity: "warning" },
      { id: "10", text: "Position body to minimize exposure if arc occurs", isChecked: false, severity: "warning", details: "Stand to the side, not directly in front of equipment" },
      { id: "11", text: "Use insulated tools rated for voltage", isChecked: false, severity: "critical" },
      { id: "12", text: "Have a safety observer present for high-risk work", isChecked: false, severity: "warning" },
    ],
  },
  {
    id: "ppe_electrical",
    title: "Electrical PPE Requirements",
    description: "Personal protective equipment by voltage class",
    icon: HardHat,
    color: "#3B82F6",
    bgColor: "#DBEAFE",
    category: "ppe",
    items: [
      { id: "1", text: "Rubber insulating gloves - inspect for damage before each use", isChecked: false, severity: "critical", details: "Air test, visual inspection for holes, cracks, tears" },
      { id: "2", text: "Verify glove class rating matches voltage", isChecked: false, severity: "critical", details: "Class 00: 500V, Class 0: 1000V, Class 1: 7500V, Class 2: 17000V" },
      { id: "3", text: "Wear leather protectors over rubber gloves", isChecked: false, severity: "warning" },
      { id: "4", text: "Check glove test date (6-month max interval)", isChecked: false, severity: "critical" },
      { id: "5", text: "Safety glasses with side shields", isChecked: false, severity: "standard" },
      { id: "6", text: "Arc-rated face shield for arc flash hazard", isChecked: false, severity: "critical" },
      { id: "7", text: "Dielectric footwear or overshoes", isChecked: false, severity: "warning" },
      { id: "8", text: "Arc-rated clothing (FR shirt and pants)", isChecked: false, severity: "critical", details: "No synthetic fabrics that can melt" },
      { id: "9", text: "Hard hat rated for electrical work (Class E)", isChecked: false, severity: "warning", details: "Tested to 20,000V" },
      { id: "10", text: "Hearing protection if noise exceeds 85 dB", isChecked: false, severity: "standard" },
    ],
  },
  {
    id: "voltage_safety",
    title: "Voltage-Specific Safety",
    description: "Safety procedures by voltage level",
    icon: Zap,
    color: "#8B5CF6",
    bgColor: "#EDE9FE",
    category: "general",
    items: [
      { id: "1", text: "Test voltage tester on known live source first", isChecked: false, severity: "critical", details: "Verify tester is working before and after use" },
      { id: "2", text: "Test all conductors phase-to-phase and phase-to-ground", isChecked: false, severity: "critical" },
      { id: "3", text: "Treat all conductors as energized until tested dead", isChecked: false, severity: "critical" },
      { id: "4", text: "Maintain safe approach distances for voltage level", isChecked: false, severity: "critical", details: "50V-300V: 10 ft limited, 300V-750V: 3.5 ft restricted" },
      { id: "5", text: "Use appropriately rated test equipment", isChecked: false, severity: "critical", details: "CAT III for distribution, CAT IV for utility" },
      { id: "6", text: "Ground conductors before contact for >600V", isChecked: false, severity: "critical" },
      { id: "7", text: "Use single-hand rule when possible", isChecked: false, severity: "warning", details: "Keep one hand behind back to prevent current path through heart" },
      { id: "8", text: "Stand on insulated mat for panel work", isChecked: false, severity: "warning" },
      { id: "9", text: "Never work alone on energized circuits", isChecked: false, severity: "warning" },
      { id: "10", text: "Have rescue plan and trained rescuer present", isChecked: false, severity: "critical" },
    ],
  },
];

const arcFlashCategories = [
  { category: "1", calRating: "4 cal/cm²", ppe: "Arc-rated shirt/pants, safety glasses, hearing protection" },
  { category: "2", calRating: "8 cal/cm²", ppe: "Arc-rated shirt/pants, arc-rated face shield, balaclava, jacket" },
  { category: "3", calRating: "25 cal/cm²", ppe: "Arc flash suit hood, arc-rated jacket/pants, insulating gloves" },
  { category: "4", calRating: "40 cal/cm²", ppe: "Arc flash suit (multi-layer), arc-rated gloves, full face protection" },
];

const gloveClasses = [
  { class: "00", maxVoltage: "500V AC", color: "Beige", testInterval: "6 months" },
  { class: "0", maxVoltage: "1,000V AC", color: "Red", testInterval: "6 months" },
  { class: "1", maxVoltage: "7,500V AC", color: "White", testInterval: "6 months" },
  { class: "2", maxVoltage: "17,000V AC", color: "Yellow", testInterval: "6 months" },
  { class: "3", maxVoltage: "26,500V AC", color: "Green", testInterval: "6 months" },
  { class: "4", maxVoltage: "36,000V AC", color: "Orange", testInterval: "6 months" },
];

export default function ElectricalSafetyScreen() {
  const router = useRouter();
  const [selectedProcedure, setSelectedProcedure] = useState<SafetyProcedure | null>(null);
  const [activeChecklists, setActiveChecklists] = useState<ActiveChecklist[]>([]);
  const [currentChecklist, setCurrentChecklist] = useState<ActiveChecklist | null>(null);
  const [showReferenceModal, setShowReferenceModal] = useState(false);
  const [referenceTab, setReferenceTab] = useState<"arc_flash" | "gloves">("arc_flash");

  const startChecklist = useCallback((procedure: SafetyProcedure) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newChecklist: ActiveChecklist = {
      id: Date.now().toString(),
      procedureId: procedure.id,
      procedureTitle: procedure.title,
      jobName: "Current Job",
      date: new Date().toISOString().split("T")[0],
      items: procedure.items.map((item) => ({ ...item, isChecked: false })),
      status: "active",
    };
    setActiveChecklists((prev) => [newChecklist, ...prev]);
    setCurrentChecklist(newChecklist);
    setSelectedProcedure(null);
  }, []);

  const toggleItem = useCallback((itemId: string) => {
    if (!currentChecklist) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const updatedItems = currentChecklist.items.map((item) =>
      item.id === itemId ? { ...item, isChecked: !item.isChecked } : item
    );

    const allChecked = updatedItems.every((item) => item.isChecked);
    const updatedChecklist: ActiveChecklist = {
      ...currentChecklist,
      items: updatedItems,
      status: allChecked ? "completed" : "active",
    };

    setCurrentChecklist(updatedChecklist);
    setActiveChecklists((prev) =>
      prev.map((c) => (c.id === updatedChecklist.id ? updatedChecklist : c))
    );

    if (allChecked) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Checklist Complete", "All safety items have been verified.");
    }
  }, [currentChecklist]);

  const resetChecklist = useCallback(() => {
    if (!currentChecklist) return;
    Alert.alert("Reset Checklist", "Uncheck all items?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: () => {
          const resetItems = currentChecklist.items.map((item) => ({
            ...item,
            isChecked: false,
          }));
          const updated = { ...currentChecklist, items: resetItems, status: "active" as const };
          setCurrentChecklist(updated);
          setActiveChecklists((prev) =>
            prev.map((c) => (c.id === updated.id ? updated : c))
          );
        },
      },
    ]);
  }, [currentChecklist]);

  const completedCount = useMemo(() => {
    if (!currentChecklist) return 0;
    return currentChecklist.items.filter((i) => i.isChecked).length;
  }, [currentChecklist]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "#DC2626";
      case "warning": return "#272D53";
      default: return "#3B82F6";
    }
  };

  const renderProcedureCard = (procedure: SafetyProcedure) => {
    const Icon = procedure.icon;
    return (
      <TouchableOpacity
        key={procedure.id}
        style={styles.procedureCard}
        onPress={() => setSelectedProcedure(procedure)}
        activeOpacity={0.7}
      >
        <View style={[styles.procedureIcon, { backgroundColor: procedure.bgColor }]}>
          <Icon size={24} color={procedure.color} />
        </View>
        <View style={styles.procedureInfo}>
          <Text style={styles.procedureTitle}>{procedure.title}</Text>
          <Text style={styles.procedureDescription}>{procedure.description}</Text>
          <View style={styles.procedureMeta}>
            <View style={styles.itemCount}>
              <CheckCircle size={12} color={Colors.textTertiary} />
              <Text style={styles.itemCountText}>{procedure.items.length} items</Text>
            </View>
          </View>
        </View>
        <ChevronRight size={20} color={Colors.textTertiary} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Electrical Safety",
          headerLeft: () => <BackButton />,
          headerRight: () => (
            <TouchableOpacity onPress={() => setShowReferenceModal(true)} style={styles.refButton}>
              <FileText size={24} color="#EAB308" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <View style={styles.headerIconContainer}>
            <Shield size={32} color="#DC2626" />
          </View>
          <Text style={styles.headerTitle}>Electrical Safety Procedures</Text>
          <Text style={styles.headerSubtitle}>
            OSHA 1910.147 & NFPA 70E compliance checklists
          </Text>
        </View>

        <View style={styles.warningBanner}>
          <AlertTriangle size={20} color="#DC2626" />
          <Text style={styles.warningText}>
            Electricity kills. Always verify de-energized state before contact with conductors.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safety Procedures</Text>
          {safetyProcedures.map(renderProcedureCard)}
        </View>

        {activeChecklists.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Checklists</Text>
            {activeChecklists.slice(0, 3).map((checklist) => {
              const completed = checklist.items.filter((i) => i.isChecked).length;
              const total = checklist.items.length;
              const percent = Math.round((completed / total) * 100);

              return (
                <TouchableOpacity
                  key={checklist.id}
                  style={styles.recentCard}
                  onPress={() => setCurrentChecklist(checklist)}
                >
                  <View style={styles.recentInfo}>
                    <Text style={styles.recentTitle}>{checklist.procedureTitle}</Text>
                    <Text style={styles.recentDate}>{checklist.date}</Text>
                  </View>
                  <View style={styles.recentProgress}>
                    <Text style={[styles.recentPercent, checklist.status === "completed" && styles.recentPercentComplete]}>
                      {percent}%
                    </Text>
                    {checklist.status === "completed" && (
                      <CheckCircle size={16} color="#22C55E" />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal visible={selectedProcedure !== null} animationType="slide" presentationStyle="pageSheet">
        {selectedProcedure && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedProcedure(null)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{selectedProcedure.title}</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={[styles.modalBanner, { backgroundColor: selectedProcedure.bgColor }]}>
                <selectedProcedure.icon size={32} color={selectedProcedure.color} />
                <Text style={[styles.modalBannerText, { color: selectedProcedure.color }]}>
                  {selectedProcedure.description}
                </Text>
              </View>

              <Text style={styles.procedureIntro}>
                Review all {selectedProcedure.items.length} safety items before starting work:
              </Text>

              {selectedProcedure.items.map((item, index) => (
                <View key={item.id} style={styles.previewItem}>
                  <View style={styles.previewNumber}>
                    <Text style={styles.previewNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.previewContent}>
                    <View style={styles.previewHeader}>
                      <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(item.severity) + "20" }]}>
                        <Text style={[styles.severityText, { color: getSeverityColor(item.severity) }]}>
                          {item.severity.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.previewText}>{item.text}</Text>
                    {item.details && (
                      <Text style={styles.previewDetails}>{item.details}</Text>
                    )}
                  </View>
                </View>
              ))}

              <TouchableOpacity
                style={[styles.startButton, { backgroundColor: selectedProcedure.color }]}
                onPress={() => startChecklist(selectedProcedure)}
              >
                <Text style={styles.startButtonText}>Start Safety Checklist</Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>

      <Modal visible={currentChecklist !== null} animationType="slide" presentationStyle="pageSheet">
        {currentChecklist && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setCurrentChecklist(null)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Safety Checklist</Text>
              <TouchableOpacity onPress={resetChecklist}>
                <RotateCcw size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.checklistHeader}>
                <Text style={styles.checklistTitle}>{currentChecklist.procedureTitle}</Text>
                <View style={styles.progressCard}>
                  <View style={styles.progressInfo}>
                    <Text style={styles.progressLabel}>Progress</Text>
                    <Text style={styles.progressValue}>
                      {completedCount}/{currentChecklist.items.length}
                    </Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${(completedCount / currentChecklist.items.length) * 100}%`,
                          backgroundColor: currentChecklist.status === "completed" ? "#22C55E" : "#EAB308",
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>

              {currentChecklist.items.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.checkItem, item.isChecked && styles.checkItemChecked]}
                  onPress={() => toggleItem(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.checkItemLeft}>
                    <View style={[styles.stepNumber, item.isChecked && styles.stepNumberChecked]}>
                      <Text style={[styles.stepNumberText, item.isChecked && styles.stepNumberTextChecked]}>
                        {index + 1}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.checkItemContent}>
                    <View style={styles.checkItemHeader}>
                      <View style={[styles.severityDot, { backgroundColor: getSeverityColor(item.severity) }]} />
                      <Text style={styles.severityLabel}>{item.severity}</Text>
                    </View>
                    <Text style={[styles.checkItemText, item.isChecked && styles.checkItemTextChecked]}>
                      {item.text}
                    </Text>
                    {item.details && (
                      <Text style={styles.checkItemDetails}>{item.details}</Text>
                    )}
                  </View>
                  <View style={styles.checkItemRight}>
                    {item.isChecked ? (
                      <CheckCircle size={24} color="#22C55E" />
                    ) : (
                      <Circle size={24} color={Colors.textTertiary} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}

              <View style={styles.legendCard}>
                <Text style={styles.legendTitle}>Severity Levels</Text>
                <View style={styles.legendItems}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: "#DC2626" }]} />
                    <Text style={styles.legendText}>Critical - Must complete</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: "#272D53" }]} />
                    <Text style={styles.legendText}>Warning - Strongly recommended</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: "#3B82F6" }]} />
                    <Text style={styles.legendText}>Standard - Best practice</Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>

      <Modal visible={showReferenceModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowReferenceModal(false)}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Quick Reference</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.refTabs}>
            <TouchableOpacity
              style={[styles.refTab, referenceTab === "arc_flash" && styles.refTabActive]}
              onPress={() => setReferenceTab("arc_flash")}
            >
              <Text style={[styles.refTabText, referenceTab === "arc_flash" && styles.refTabTextActive]}>
                Arc Flash PPE
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.refTab, referenceTab === "gloves" && styles.refTabActive]}
              onPress={() => setReferenceTab("gloves")}
            >
              <Text style={[styles.refTabText, referenceTab === "gloves" && styles.refTabTextActive]}>
                Glove Classes
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {referenceTab === "arc_flash" ? (
              <>
                <Text style={styles.refSectionTitle}>Arc Flash PPE Categories (NFPA 70E)</Text>
                {arcFlashCategories.map((cat) => (
                  <View key={cat.category} style={styles.refCard}>
                    <View style={styles.refCardHeader}>
                      <View style={styles.refCategoryBadge}>
                        <Text style={styles.refCategoryText}>Category {cat.category}</Text>
                      </View>
                      <Text style={styles.refRating}>{cat.calRating}</Text>
                    </View>
                    <Text style={styles.refPPE}>{cat.ppe}</Text>
                  </View>
                ))}
              </>
            ) : (
              <>
                <Text style={styles.refSectionTitle}>Rubber Insulating Glove Classes</Text>
                {gloveClasses.map((glove) => (
                  <View key={glove.class} style={styles.refCard}>
                    <View style={styles.refCardHeader}>
                      <View style={[styles.refGloveBadge, { backgroundColor: glove.color === "Beige" ? "#F5F5DC" : glove.color === "Red" ? "#FEE2E2" : glove.color === "White" ? "#F9FAFB" : glove.color === "Yellow" ? "#FEF9C3" : glove.color === "Green" ? "#DCFCE7" : "#E8E9EE" }]}>
                        <Text style={styles.refGloveClass}>Class {glove.class}</Text>
                      </View>
                      <Text style={styles.refVoltage}>{glove.maxVoltage}</Text>
                    </View>
                    <View style={styles.refGloveDetails}>
                      <Text style={styles.refGloveLabel}>Color: {glove.color}</Text>
                      <Text style={styles.refGloveLabel}>Test: {glove.testInterval}</Text>
                    </View>
                  </View>
                ))}
              </>
            )}

            <View style={styles.disclaimerCard}>
              <AlertTriangle size={20} color="#272D53" />
              <Text style={styles.disclaimerText}>
                Always refer to current NFPA 70E and OSHA standards. PPE requirements may vary based on specific hazard analysis.
              </Text>
            </View>
          </ScrollView>
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
  backButton: {
    padding: 8,
  },
  refButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  headerCard: {
    backgroundColor: "#FEE2E2",
    margin: 16,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
  },
  headerIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(220, 38, 38, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#991B1B",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#991B1B",
    opacity: 0.8,
    marginTop: 4,
    textAlign: "center" as const,
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 14,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: "#991B1B",
    fontWeight: "500" as const,
    lineHeight: 18,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  procedureCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  procedureIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  procedureInfo: {
    flex: 1,
    marginLeft: 14,
  },
  procedureTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  procedureDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  procedureMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  itemCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  itemCountText: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  recentCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  recentInfo: {
    flex: 1,
  },
  recentTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  recentDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  recentProgress: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  recentPercent: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  recentPercentComplete: {
    color: "#22C55E",
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
    backgroundColor: Colors.surface,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    gap: 14,
    marginBottom: 16,
  },
  modalBannerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500" as const,
  },
  procedureIntro: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  previewItem: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  previewNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  previewNumberText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  previewContent: {
    flex: 1,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  severityText: {
    fontSize: 10,
    fontWeight: "700" as const,
  },
  previewText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  previewDetails: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 4,
    fontStyle: "italic" as const,
  },
  startButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 32,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  checklistHeader: {
    marginBottom: 16,
  },
  checklistTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  progressCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  progressValue: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  checkItem: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  checkItemChecked: {
    backgroundColor: "#DCFCE7",
  },
  checkItemLeft: {
    alignItems: "center",
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberChecked: {
    backgroundColor: "#22C55E",
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.textSecondary,
  },
  stepNumberTextChecked: {
    color: "#FFFFFF",
  },
  checkItemContent: {
    flex: 1,
  },
  checkItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  severityLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
    textTransform: "capitalize" as const,
  },
  checkItemText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  checkItemTextChecked: {
    textDecorationLine: "line-through",
    color: Colors.textSecondary,
  },
  checkItemDetails: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 4,
    fontStyle: "italic" as const,
  },
  checkItemRight: {
    justifyContent: "center",
  },
  legendCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    marginBottom: 32,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 10,
  },
  legendItems: {
    gap: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  refTabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: Colors.surface,
  },
  refTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
  },
  refTabActive: {
    backgroundColor: "#EAB308",
  },
  refTabText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  refTabTextActive: {
    color: "#000",
  },
  refSectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  refCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  refCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  refCategoryBadge: {
    backgroundColor: "#E8E9EE",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  refCategoryText: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: "#92400E",
  },
  refRating: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  refPPE: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  refGloveBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  refGloveClass: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  refVoltage: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  refGloveDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  refGloveLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  disclaimerCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#E8E9EE",
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    marginBottom: 32,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 13,
    color: "#92400E",
    lineHeight: 18,
  },
});
