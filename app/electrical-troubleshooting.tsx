import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import {
  ArrowLeft,
  Search,
  X,
  HelpCircle,
  Zap,
  Lightbulb,
  Plug,
  CircuitBoard,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  CheckCircle,
  XCircle,
  Clock,
  Wrench,
  ThermometerSun,
  Power,
  Gauge,
  Eye,
  Shield,
  BookOpen,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";

type ProblemCategory = "no_power" | "circuit_breaker" | "outlet" | "lighting" | "flickering" | "overload" | "gfci" | "safety";
type Difficulty = "easy" | "intermediate" | "advanced" | "professional";

interface DiagnosticStep {
  id: string;
  instruction: string;
  expectedResult?: string;
  warning?: string;
  tip?: string;
}

interface TroubleshootingGuide {
  id: string;
  title: string;
  category: ProblemCategory;
  description: string;
  symptoms: string[];
  commonCauses: string[];
  difficulty: Difficulty;
  estimatedTime: string;
  toolsNeeded: string[];
  safetyWarnings: string[];
  diagnosticSteps: DiagnosticStep[];
  solutions: Solution[];
  whenToCallPro: string[];
}

interface Solution {
  id: string;
  title: string;
  description: string;
  steps: string[];
  estimatedCost?: string;
}

const mockGuides: TroubleshootingGuide[] = [
  {
    id: "1",
    title: "Outlet Not Working",
    category: "outlet",
    description: "Diagnose and fix outlets that have stopped providing power",
    symptoms: [
      "Device won't turn on when plugged in",
      "No indicator lights on power strip",
      "Outlet tester shows no power",
    ],
    commonCauses: [
      "Tripped GFCI outlet upstream",
      "Tripped circuit breaker",
      "Loose wire connection",
      "Damaged outlet",
      "Burnt wiring",
    ],
    difficulty: "intermediate",
    estimatedTime: "15-45 minutes",
    toolsNeeded: ["Voltage tester", "Screwdriver", "Outlet tester", "Flashlight"],
    safetyWarnings: [
      "Always turn off breaker before working on outlets",
      "Test for voltage before touching any wires",
      "Never work on live circuits",
    ],
    diagnosticSteps: [
      { id: "d1", instruction: "Check if other outlets on the same circuit work", expectedResult: "Helps identify if issue is localized or circuit-wide" },
      { id: "d2", instruction: "Look for a tripped GFCI outlet (usually in kitchen, bathroom, garage)", expectedResult: "GFCI outlets protect downstream outlets", tip: "Press the RESET button on any GFCI outlet" },
      { id: "d3", instruction: "Check the circuit breaker panel for tripped breakers", expectedResult: "Tripped breaker will be in middle position or OFF" },
      { id: "d4", instruction: "Use a non-contact voltage tester at the outlet", expectedResult: "No beep = no power reaching outlet", warning: "If voltage is present but outlet doesn't work, issue may be internal" },
      { id: "d5", instruction: "Turn off breaker, remove outlet cover, inspect wiring", expectedResult: "Look for loose, burnt, or damaged wires", warning: "Confirm power is OFF before touching any wires" },
    ],
    solutions: [
      { id: "s1", title: "Reset GFCI", description: "If a GFCI outlet is tripped, reset it to restore power to downstream outlets", steps: ["Locate GFCI outlet (has TEST/RESET buttons)", "Press RESET button firmly", "Test outlet again"], estimatedCost: "Free" },
      { id: "s2", title: "Reset Circuit Breaker", description: "A tripped breaker needs to be reset to restore power", steps: ["Locate correct breaker in panel", "Push breaker firmly to OFF", "Push breaker to ON", "If it trips again, there may be a short"], estimatedCost: "Free" },
      { id: "s3", title: "Tighten Loose Connections", description: "Loose wire connections can cause intermittent or complete power loss", steps: ["Turn off breaker", "Remove outlet cover and outlet", "Check all wire connections", "Tighten screw terminals or replace wire nuts", "Reinstall outlet"], estimatedCost: "$0-5" },
      { id: "s4", title: "Replace Damaged Outlet", description: "If outlet shows burn marks or damage, it needs replacement", steps: ["Turn off breaker", "Remove old outlet", "Note wire positions", "Connect wires to new outlet", "Install and test"], estimatedCost: "$3-10" },
    ],
    whenToCallPro: [
      "Burning smell from outlet or wall",
      "Visible burn marks or melted plastic",
      "Breaker trips repeatedly after reset",
      "Multiple outlets on different circuits not working",
      "You're uncomfortable working with electrical",
    ],
  },
  {
    id: "2",
    title: "Circuit Breaker Keeps Tripping",
    category: "circuit_breaker",
    description: "Diagnose why a circuit breaker repeatedly trips and how to fix it",
    symptoms: [
      "Breaker trips when turning on specific appliance",
      "Breaker trips randomly",
      "Breaker trips immediately when reset",
      "Breaker feels hot to touch",
    ],
    commonCauses: [
      "Circuit overload (too many devices)",
      "Short circuit in wiring or appliance",
      "Ground fault",
      "Faulty breaker",
      "Loose wire connections in panel",
    ],
    difficulty: "intermediate",
    estimatedTime: "20-60 minutes",
    toolsNeeded: ["Clamp meter", "Voltage tester", "Screwdriver", "Flashlight"],
    safetyWarnings: [
      "Panel work can be dangerous - main breaker may still be live",
      "If unsure, call a licensed electrician",
      "Never bypass or tape a breaker in the ON position",
    ],
    diagnosticSteps: [
      { id: "d1", instruction: "Note what was happening when breaker tripped", expectedResult: "Identifies if specific appliance or load caused trip" },
      { id: "d2", instruction: "Count devices/appliances on the circuit", expectedResult: "15A circuit = ~1,440W max, 20A = ~1,920W max", tip: "Add up wattage of all devices" },
      { id: "d3", instruction: "Unplug all devices on circuit, reset breaker", expectedResult: "If it stays on, overload was likely cause" },
      { id: "d4", instruction: "Plug devices back in one at a time", expectedResult: "Identify which device causes trip" },
      { id: "d5", instruction: "Check for burning smell or visible damage at outlets", expectedResult: "Signs of short circuit or arc fault", warning: "Stop immediately if you smell burning" },
    ],
    solutions: [
      { id: "s1", title: "Reduce Circuit Load", description: "Too many devices on one circuit", steps: ["Identify high-wattage devices (heaters, hair dryers)", "Move some devices to different circuits", "Avoid using multiple high-wattage devices simultaneously"], estimatedCost: "Free" },
      { id: "s2", title: "Replace Faulty Appliance", description: "If one appliance consistently trips the breaker", steps: ["Identify problem appliance", "Check appliance cord for damage", "Test appliance on different circuit", "Replace if faulty"], estimatedCost: "Varies" },
      { id: "s3", title: "Add Dedicated Circuit", description: "High-demand appliances should have dedicated circuits", steps: ["Identify need for dedicated circuit", "Have electrician run new circuit", "Install appropriate outlet"], estimatedCost: "$200-500" },
    ],
    whenToCallPro: [
      "Breaker is hot to touch",
      "Visible damage or burn marks on breaker",
      "Breaker trips immediately upon reset every time",
      "You need to add circuits to the panel",
      "Burning smell from panel",
    ],
  },
  {
    id: "3",
    title: "Lights Flickering",
    category: "flickering",
    description: "Diagnose the cause of flickering lights throughout the home",
    symptoms: [
      "Lights dim or flicker occasionally",
      "Lights flicker when large appliances turn on",
      "Lights flicker constantly",
      "Only certain lights flicker",
    ],
    commonCauses: [
      "Loose bulb connection",
      "Faulty light switch",
      "Voltage fluctuations",
      "Overloaded circuit",
      "Loose wiring connections",
      "Failing utility transformer",
    ],
    difficulty: "easy",
    estimatedTime: "10-30 minutes",
    toolsNeeded: ["Voltage tester", "Screwdriver", "Multimeter (optional)"],
    safetyWarnings: [
      "Let bulbs cool before handling",
      "Turn off switch before checking bulb",
      "Whole-house flickering may indicate serious issue",
    ],
    diagnosticSteps: [
      { id: "d1", instruction: "Determine if flickering is one light or multiple", expectedResult: "Single light = local issue, multiple = circuit/service issue" },
      { id: "d2", instruction: "Check if bulb is properly seated in socket", expectedResult: "Loose bulbs can cause intermittent connection" },
      { id: "d3", instruction: "Try a different bulb", expectedResult: "Rules out faulty bulb" },
      { id: "d4", instruction: "Toggle the light switch - feel for looseness", expectedResult: "Loose or worn switch can cause flickering" },
      { id: "d5", instruction: "Note if flickering occurs when A/C, dryer, or other large load starts", expectedResult: "Normal slight dimming, excessive = undersized service" },
    ],
    solutions: [
      { id: "s1", title: "Tighten or Replace Bulb", description: "Loose bulbs or failing bulbs cause flickering", steps: ["Turn off light switch", "Let bulb cool if necessary", "Remove and reseat bulb firmly", "Replace if problem persists"], estimatedCost: "$2-15" },
      { id: "s2", title: "Replace Light Switch", description: "Worn or faulty switches can cause flickering", steps: ["Turn off breaker", "Remove switch plate", "Test for voltage", "Replace switch", "Restore power and test"], estimatedCost: "$5-15" },
      { id: "s3", title: "Use Correct Dimmer Switch", description: "LED/CFL bulbs need compatible dimmers", steps: ["Check bulb type", "Verify dimmer compatibility", "Replace with LED-compatible dimmer if needed"], estimatedCost: "$20-40" },
    ],
    whenToCallPro: [
      "Whole house lights flicker frequently",
      "Flickering accompanied by buzzing sounds",
      "Lights flicker and dim significantly",
      "Flickering started after storm or car hit utility pole",
      "You notice burning smell",
    ],
  },
  {
    id: "4",
    title: "GFCI Won't Reset",
    category: "gfci",
    description: "Troubleshoot a GFCI outlet that won't stay reset",
    symptoms: [
      "GFCI trips immediately when reset",
      "GFCI reset button won't stay in",
      "GFCI test button doesn't trip outlet",
      "Downstream outlets have no power",
    ],
    commonCauses: [
      "Ground fault on circuit",
      "Moisture in outlet or connected device",
      "Faulty GFCI outlet",
      "Incorrect wiring",
      "End-of-life GFCI",
    ],
    difficulty: "intermediate",
    estimatedTime: "15-45 minutes",
    toolsNeeded: ["GFCI outlet tester", "Voltage tester", "Screwdriver"],
    safetyWarnings: [
      "GFCI is a safety device - don't bypass it",
      "Moisture + electricity = dangerous",
      "Turn off breaker before inspecting wiring",
    ],
    diagnosticSteps: [
      { id: "d1", instruction: "Unplug all devices from GFCI and downstream outlets", expectedResult: "Eliminates devices as cause" },
      { id: "d2", instruction: "Try to reset GFCI with nothing plugged in", expectedResult: "If it resets, a device was causing the trip" },
      { id: "d3", instruction: "Check for moisture around outlet or connected boxes", expectedResult: "Moisture causes ground faults", tip: "Use hair dryer to dry if moisture present" },
      { id: "d4", instruction: "Test GFCI with outlet tester", expectedResult: "Will indicate if wired correctly" },
      { id: "d5", instruction: "Check GFCI age - most last 10-15 years", expectedResult: "Old GFCIs become less reliable" },
    ],
    solutions: [
      { id: "s1", title: "Dry Out Moisture", description: "Moisture is the most common cause of GFCI trips", steps: ["Unplug all devices", "Use hair dryer on outlet area", "Wait several hours if significant moisture", "Try to reset"], estimatedCost: "Free" },
      { id: "s2", title: "Isolate Faulty Device", description: "A ground fault in a device will trip GFCI", steps: ["Unplug all devices", "Reset GFCI", "Plug devices back one at a time", "Identify and replace faulty device"], estimatedCost: "Varies" },
      { id: "s3", title: "Replace GFCI Outlet", description: "GFCIs wear out and need replacement", steps: ["Turn off breaker", "Remove old GFCI", "Note LINE vs LOAD wires", "Install new GFCI", "Test with outlet tester"], estimatedCost: "$15-25" },
    ],
    whenToCallPro: [
      "GFCI keeps tripping with nothing connected",
      "You're unsure about LINE vs LOAD wiring",
      "Multiple GFCIs trip simultaneously",
      "GFCI is warm or discolored",
      "You're not comfortable working with wiring",
    ],
  },
  {
    id: "5",
    title: "No Power to Part of House",
    category: "no_power",
    description: "Diagnose partial power outage affecting multiple rooms or areas",
    symptoms: [
      "Multiple rooms have no power",
      "Half the house is dark",
      "Some outlets work, others don't",
      "Large appliances won't work",
    ],
    commonCauses: [
      "Tripped main breaker",
      "Lost one leg of 240V service",
      "Multiple tripped breakers",
      "Utility issue",
      "Damaged service entrance",
    ],
    difficulty: "advanced",
    estimatedTime: "30-60 minutes",
    toolsNeeded: ["Voltage tester", "Multimeter", "Flashlight"],
    safetyWarnings: [
      "Partial power loss can indicate serious utility issue",
      "Main breaker and service entrance are extremely dangerous",
      "When in doubt, call utility company first",
    ],
    diagnosticSteps: [
      { id: "d1", instruction: "Check if neighbors have power", expectedResult: "Determines if utility issue" },
      { id: "d2", instruction: "Check main breaker position", expectedResult: "Should be firmly in ON position" },
      { id: "d3", instruction: "Look for any tripped breakers in panel", expectedResult: "Multiple trips may indicate underlying issue", warning: "Don't reset repeatedly - could cause fire" },
      { id: "d4", instruction: "Test voltage at 240V outlet (dryer, range)", expectedResult: "Should read ~240V between hots", tip: "Reading of ~120V indicates lost leg" },
      { id: "d5", instruction: "Check meter base for damage or burn marks", expectedResult: "Visible damage requires utility call" },
    ],
    solutions: [
      { id: "s1", title: "Reset Main Breaker", description: "Main breaker may have tripped", steps: ["Turn main breaker OFF", "Wait 30 seconds", "Turn main breaker ON", "Check if power restored"], estimatedCost: "Free" },
      { id: "s2", title: "Call Utility Company", description: "Lost leg of service requires utility repair", steps: ["Note symptoms", "Call utility emergency line", "Report partial power loss", "Wait for utility response"], estimatedCost: "Free (utility side)" },
      { id: "s3", title: "Call Licensed Electrician", description: "Service entrance issues require professional repair", steps: ["Don't attempt DIY repairs", "Call licensed electrician", "Describe symptoms", "May need utility to disconnect for repair"], estimatedCost: "$200-1000+" },
    ],
    whenToCallPro: [
      "Any suspected service entrance issue",
      "Burning smell or visible damage at meter or panel",
      "Main breaker trips repeatedly",
      "Utility confirms their side is OK",
      "You see sparking anywhere",
    ],
  },
];

const categoryConfig: Record<ProblemCategory, { label: string; icon: any; color: string }> = {
  no_power: { label: "No Power", icon: Power, color: "#DC2626" },
  circuit_breaker: { label: "Circuit Breaker", icon: CircuitBoard, color: "#272D53" },
  outlet: { label: "Outlet Issues", icon: Plug, color: "#3B82F6" },
  lighting: { label: "Lighting", icon: Lightbulb, color: "#FBBF24" },
  flickering: { label: "Flickering", icon: Zap, color: "#8B5CF6" },
  overload: { label: "Overload", icon: Gauge, color: "#EF4444" },
  gfci: { label: "GFCI", icon: Shield, color: "#22C55E" },
  safety: { label: "Safety", icon: AlertTriangle, color: "#DC2626" },
};

const difficultyConfig: Record<Difficulty, { label: string; color: string; bgColor: string }> = {
  easy: { label: "DIY Friendly", color: "#22C55E", bgColor: "#DCFCE7" },
  intermediate: { label: "Some Experience", color: "#272D53", bgColor: "#E8E9EE" },
  advanced: { label: "Advanced", color: "#EF4444", bgColor: "#FEE2E2" },
  professional: { label: "Call Professional", color: "#DC2626", bgColor: "#FEE2E2" },
};

export default function ElectricalTroubleshootingScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGuide, setSelectedGuide] = useState<TroubleshootingGuide | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<string[]>([]);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ProblemCategory | "all">("all");

  const filteredGuides = useMemo(() => {
    return mockGuides.filter((guide) => {
      const matchesSearch =
        guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.symptoms.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === "all" || guide.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleToggleStep = useCallback((stepId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedSteps((prev) =>
      prev.includes(stepId) ? prev.filter((id) => id !== stepId) : [...prev, stepId]
    );
  }, []);

  const handleCompleteStep = useCallback((stepId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCompletedSteps((prev) =>
      prev.includes(stepId) ? prev.filter((id) => id !== stepId) : [...prev, stepId]
    );
  }, []);

  const renderGuideCard = (guide: TroubleshootingGuide) => {
    const category = categoryConfig[guide.category];
    const difficulty = difficultyConfig[guide.difficulty];
    const CategoryIcon = category.icon;

    return (
      <TouchableOpacity
        key={guide.id}
        style={styles.guideCard}
        onPress={() => {
          setSelectedGuide(guide);
          setExpandedSteps([]);
          setCompletedSteps([]);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.guideHeader}>
          <View style={[styles.guideIcon, { backgroundColor: `${category.color}15` }]}>
            <CategoryIcon size={24} color={category.color} />
          </View>
          <View style={styles.guideInfo}>
            <Text style={styles.guideTitle}>{guide.title}</Text>
            <Text style={styles.guideDescription} numberOfLines={2}>{guide.description}</Text>
          </View>
          <ChevronRight size={20} color={Colors.textTertiary} />
        </View>

        <View style={styles.guideMeta}>
          <View style={[styles.difficultyBadge, { backgroundColor: difficulty.bgColor }]}>
            <Text style={[styles.difficultyText, { color: difficulty.color }]}>{difficulty.label}</Text>
          </View>
          <View style={styles.timeEstimate}>
            <Clock size={12} color={Colors.textSecondary} />
            <Text style={styles.timeText}>{guide.estimatedTime}</Text>
          </View>
        </View>

        <View style={styles.symptomsList}>
          {guide.symptoms.slice(0, 2).map((symptom, index) => (
            <View key={index} style={styles.symptomItem}>
              <AlertTriangle size={12} color={Colors.textTertiary} />
              <Text style={styles.symptomText} numberOfLines={1}>{symptom}</Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Troubleshooting",
          headerLeft: () => <BackButton />,
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <HelpCircle size={32} color="#EAB308" />
          </View>
          <Text style={styles.headerTitle}>Troubleshooting Guides</Text>
          <Text style={styles.headerSubtitle}>
            Step-by-step diagnostic guides for common electrical problems
          </Text>
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Search size={18} color={Colors.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search problems or symptoms..."
              placeholderTextColor={Colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <X size={18} color={Colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          <TouchableOpacity
            style={[styles.categoryChip, selectedCategory === "all" && styles.categoryChipActive]}
            onPress={() => setSelectedCategory("all")}
          >
            <Text style={[styles.categoryChipText, selectedCategory === "all" && styles.categoryChipTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          {(Object.keys(categoryConfig) as ProblemCategory[]).map((cat) => {
            const config = categoryConfig[cat];
            const Icon = config.icon;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat && styles.categoryChipActive,
                  selectedCategory === cat && { backgroundColor: config.color },
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Icon size={14} color={selectedCategory === cat ? Colors.white : config.color} />
                <Text style={[styles.categoryChipText, selectedCategory === cat && styles.categoryChipTextActive]}>
                  {config.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.guidesSection}>
          <Text style={styles.sectionTitle}>Guides ({filteredGuides.length})</Text>
          {filteredGuides.map(renderGuideCard)}

          {filteredGuides.length === 0 && (
            <View style={styles.emptyState}>
              <HelpCircle size={48} color={Colors.textTertiary} />
              <Text style={styles.emptyStateTitle}>No Guides Found</Text>
              <Text style={styles.emptyStateText}>
                Try a different search term
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal visible={selectedGuide !== null} animationType="slide" presentationStyle="pageSheet">
        {selectedGuide && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedGuide(null)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Troubleshooting</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.guideDetailHeader}>
                <View style={[styles.detailIcon, { backgroundColor: `${categoryConfig[selectedGuide.category].color}15` }]}>
                  {React.createElement(categoryConfig[selectedGuide.category].icon, {
                    size: 32,
                    color: categoryConfig[selectedGuide.category].color,
                  })}
                </View>
                <Text style={styles.detailTitle}>{selectedGuide.title}</Text>
                <Text style={styles.detailDescription}>{selectedGuide.description}</Text>
                <View style={styles.detailMeta}>
                  <View style={[styles.detailDifficulty, { backgroundColor: difficultyConfig[selectedGuide.difficulty].bgColor }]}>
                    <Text style={[styles.detailDifficultyText, { color: difficultyConfig[selectedGuide.difficulty].color }]}>
                      {difficultyConfig[selectedGuide.difficulty].label}
                    </Text>
                  </View>
                  <View style={styles.detailTime}>
                    <Clock size={14} color={Colors.textSecondary} />
                    <Text style={styles.detailTimeText}>{selectedGuide.estimatedTime}</Text>
                  </View>
                </View>
              </View>

              {selectedGuide.safetyWarnings.length > 0 && (
                <View style={styles.safetyCard}>
                  <View style={styles.safetyHeader}>
                    <AlertTriangle size={18} color="#DC2626" />
                    <Text style={styles.safetyTitle}>Safety Warnings</Text>
                  </View>
                  {selectedGuide.safetyWarnings.map((warning, index) => (
                    <Text key={index} style={styles.safetyText}>• {warning}</Text>
                  ))}
                </View>
              )}

              <View style={styles.sectionCard}>
                <Text style={styles.sectionCardTitle}>Common Symptoms</Text>
                {selectedGuide.symptoms.map((symptom, index) => (
                  <View key={index} style={styles.listItem}>
                    <AlertTriangle size={14} color="#272D53" />
                    <Text style={styles.listItemText}>{symptom}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.sectionCard}>
                <Text style={styles.sectionCardTitle}>Tools Needed</Text>
                <View style={styles.toolsGrid}>
                  {selectedGuide.toolsNeeded.map((tool, index) => (
                    <View key={index} style={styles.toolBadge}>
                      <Wrench size={12} color={Colors.textSecondary} />
                      <Text style={styles.toolText}>{tool}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.sectionCard}>
                <Text style={styles.sectionCardTitle}>Diagnostic Steps</Text>
                {selectedGuide.diagnosticSteps.map((step, index) => (
                  <View key={step.id} style={styles.stepCard}>
                    <TouchableOpacity
                      style={styles.stepHeader}
                      onPress={() => handleToggleStep(step.id)}
                    >
                      <TouchableOpacity
                        style={[styles.stepCheckbox, completedSteps.includes(step.id) && styles.stepCheckboxComplete]}
                        onPress={() => handleCompleteStep(step.id)}
                      >
                        {completedSteps.includes(step.id) ? (
                          <CheckCircle size={20} color="#22C55E" />
                        ) : (
                          <Text style={styles.stepNumber}>{index + 1}</Text>
                        )}
                      </TouchableOpacity>
                      <Text style={[styles.stepInstruction, completedSteps.includes(step.id) && styles.stepInstructionComplete]}>
                        {step.instruction}
                      </Text>
                      {(step.expectedResult || step.warning || step.tip) && (
                        expandedSteps.includes(step.id) ? (
                          <ChevronDown size={18} color={Colors.textTertiary} />
                        ) : (
                          <ChevronRight size={18} color={Colors.textTertiary} />
                        )
                      )}
                    </TouchableOpacity>
                    {expandedSteps.includes(step.id) && (
                      <View style={styles.stepDetails}>
                        {step.expectedResult && (
                          <View style={styles.stepDetail}>
                            <Eye size={14} color="#3B82F6" />
                            <Text style={styles.stepDetailText}>{step.expectedResult}</Text>
                          </View>
                        )}
                        {step.tip && (
                          <View style={styles.stepDetail}>
                            <Lightbulb size={14} color="#22C55E" />
                            <Text style={[styles.stepDetailText, { color: "#22C55E" }]}>{step.tip}</Text>
                          </View>
                        )}
                        {step.warning && (
                          <View style={styles.stepDetail}>
                            <AlertTriangle size={14} color="#DC2626" />
                            <Text style={[styles.stepDetailText, { color: "#DC2626" }]}>{step.warning}</Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                ))}
              </View>

              <View style={styles.sectionCard}>
                <Text style={styles.sectionCardTitle}>Solutions</Text>
                {selectedGuide.solutions.map((solution) => (
                  <View key={solution.id} style={styles.solutionCard}>
                    <View style={styles.solutionHeader}>
                      <Text style={styles.solutionTitle}>{solution.title}</Text>
                      {solution.estimatedCost && (
                        <Text style={styles.solutionCost}>{solution.estimatedCost}</Text>
                      )}
                    </View>
                    <Text style={styles.solutionDescription}>{solution.description}</Text>
                    <View style={styles.solutionSteps}>
                      {solution.steps.map((step, index) => (
                        <Text key={index} style={styles.solutionStep}>{index + 1}. {step}</Text>
                      ))}
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.callProCard}>
                <View style={styles.callProHeader}>
                  <Phone size={20} color="#DC2626" />
                  <Text style={styles.callProTitle}>When to Call a Professional</Text>
                </View>
                {selectedGuide.whenToCallPro.map((reason, index) => (
                  <View key={index} style={styles.callProItem}>
                    <XCircle size={14} color="#DC2626" />
                    <Text style={styles.callProText}>{reason}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </View>
  );
}

const Phone = ({ size, color }: { size: number; color: string }) => (
  <AlertTriangle size={size} color={color} />
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#FEF9C3",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center" as const,
    lineHeight: 20,
  },
  searchSection: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 10,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: "#EAB308",
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.text,
  },
  categoryChipTextActive: {
    color: Colors.white,
  },
  guidesSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 14,
  },
  guideCard: {
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
  guideHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  guideIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  guideInfo: {
    flex: 1,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  guideDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  guideMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  timeEstimate: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  symptomsList: {
    gap: 6,
  },
  symptomItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  symptomText: {
    fontSize: 12,
    color: Colors.textTertiary,
    flex: 1,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.text,
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
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
  modalTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  guideDetailHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  detailIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
    textAlign: "center" as const,
    marginBottom: 8,
  },
  detailDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center" as const,
    marginBottom: 16,
  },
  detailMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  detailDifficulty: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  detailDifficultyText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  detailTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailTimeText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  safetyCard: {
    backgroundColor: "#FEE2E2",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  safetyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  safetyTitle: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: "#DC2626",
  },
  safetyText: {
    fontSize: 13,
    color: "#991B1B",
    marginBottom: 4,
    lineHeight: 18,
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  sectionCardTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 8,
  },
  listItemText: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  toolsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  toolBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.background,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  toolText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  stepCard: {
    marginBottom: 12,
    backgroundColor: Colors.background,
    borderRadius: 10,
    overflow: "hidden",
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 12,
  },
  stepCheckbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
  },
  stepCheckboxComplete: {
    borderColor: "#22C55E",
    backgroundColor: "#DCFCE7",
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  stepInstruction: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  stepInstructionComplete: {
    color: Colors.textSecondary,
    textDecorationLine: "line-through" as const,
  },
  stepDetails: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    paddingLeft: 52,
    gap: 8,
  },
  stepDetail: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  stepDetailText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  solutionCard: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  solutionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  solutionTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  solutionCost: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#22C55E",
  },
  solutionDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 10,
    lineHeight: 18,
  },
  solutionSteps: {
    gap: 4,
  },
  solutionStep: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 20,
  },
  callProCard: {
    backgroundColor: "#FEE2E2",
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  callProHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  callProTitle: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: "#DC2626",
  },
  callProItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 6,
  },
  callProText: {
    fontSize: 13,
    color: "#991B1B",
    flex: 1,
    lineHeight: 18,
  },
});
