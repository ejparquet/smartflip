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
  Search,
  Filter,
  X,
  ChevronRight,
  ChevronDown,
  CheckCircle,
  Circle,
  AlertTriangle,
  Info,
  FileText,
  Zap,
  Home,
  Building,
  Shield,
  BookOpen,
  ClipboardCheck,
  Lightbulb,
  Plug,
  CircuitBoard,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";

interface CodeRequirement {
  id: string;
  code: string;
  title: string;
  description: string;
  necReference: string;
  category: string;
  isChecked: boolean;
  notes?: string;
  severity: "critical" | "important" | "standard";
}

interface InspectionChecklist {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: "residential" | "commercial";
  requirements: CodeRequirement[];
  completedCount: number;
  totalCount: number;
}

const inspectionChecklists: InspectionChecklist[] = [
  {
    id: "1",
    name: "Rough-In Inspection",
    description: "Before drywall - wiring, boxes, and conduit",
    icon: CircuitBoard,
    category: "residential",
    completedCount: 0,
    totalCount: 15,
    requirements: [
      { id: "1", code: "NEC 314.16", title: "Box Fill Calculations", description: "Verify box fill does not exceed allowable capacity", necReference: "314.16(A)", category: "Boxes", isChecked: false, severity: "critical" },
      { id: "2", code: "NEC 314.23", title: "Box Support", description: "All boxes securely fastened to structure", necReference: "314.23", category: "Boxes", isChecked: false, severity: "critical" },
      { id: "3", code: "NEC 300.4", title: "Protection from Physical Damage", description: "Cables protected where passing through studs/joists", necReference: "300.4(A)", category: "Wiring", isChecked: false, severity: "critical" },
      { id: "4", code: "NEC 334.30", title: "NM Cable Securing", description: "NM cable secured within 12\" of boxes", necReference: "334.30", category: "Wiring", isChecked: false, severity: "important" },
      { id: "5", code: "NEC 210.52", title: "Receptacle Spacing", description: "No point along wall more than 6' from receptacle", necReference: "210.52(A)", category: "Layout", isChecked: false, severity: "important" },
      { id: "6", code: "NEC 210.8", title: "GFCI Locations", description: "GFCI protection in required locations", necReference: "210.8(A)", category: "Protection", isChecked: false, severity: "critical" },
      { id: "7", code: "NEC 210.12", title: "AFCI Protection", description: "AFCI protection for bedroom circuits", necReference: "210.12(A)", category: "Protection", isChecked: false, severity: "critical" },
      { id: "8", code: "NEC 250.52", title: "Grounding Electrode", description: "Proper grounding electrode system installed", necReference: "250.52", category: "Grounding", isChecked: false, severity: "critical" },
      { id: "9", code: "NEC 250.66", title: "GEC Sizing", description: "Grounding electrode conductor properly sized", necReference: "250.66", category: "Grounding", isChecked: false, severity: "critical" },
      { id: "10", code: "NEC 408.36", title: "Panel Clearance", description: "36\" clearance in front of panel", necReference: "408.36", category: "Panel", isChecked: false, severity: "important" },
      { id: "11", code: "NEC 314.27", title: "Ceiling Fan Box", description: "Boxes rated for ceiling fan support", necReference: "314.27(C)", category: "Boxes", isChecked: false, severity: "important" },
      { id: "12", code: "NEC 404.2", title: "Switch Location", description: "Switches grounded and accessible", necReference: "404.2", category: "Switches", isChecked: false, severity: "standard" },
      { id: "13", code: "NEC 300.14", title: "Conductor Length", description: "Minimum 6\" conductor length at boxes", necReference: "300.14", category: "Wiring", isChecked: false, severity: "important" },
      { id: "14", code: "NEC 334.80", title: "Ampacity Adjustment", description: "NM cable ampacity adjustment for bundling", necReference: "334.80", category: "Wiring", isChecked: false, severity: "standard" },
      { id: "15", code: "NEC 310.15", title: "Conductor Sizing", description: "Conductors properly sized for load", necReference: "310.15", category: "Wiring", isChecked: false, severity: "critical" },
    ],
  },
  {
    id: "2",
    name: "Final Inspection",
    description: "After completion - fixtures, devices, and testing",
    icon: ClipboardCheck,
    category: "residential",
    completedCount: 0,
    totalCount: 12,
    requirements: [
      { id: "1", code: "NEC 406.12", title: "Tamper-Resistant Receptacles", description: "TR receptacles in dwelling units", necReference: "406.12", category: "Receptacles", isChecked: false, severity: "critical" },
      { id: "2", code: "NEC 406.4", title: "Receptacle Rating", description: "Receptacles match circuit rating", necReference: "406.4(B)", category: "Receptacles", isChecked: false, severity: "important" },
      { id: "3", code: "NEC 404.9", title: "Switch Faceplates", description: "All switches have proper cover plates", necReference: "404.9(A)", category: "Switches", isChecked: false, severity: "standard" },
      { id: "4", code: "NEC 410.16", title: "Luminaire Support", description: "Fixtures properly supported", necReference: "410.16", category: "Lighting", isChecked: false, severity: "important" },
      { id: "5", code: "NEC 408.4", title: "Circuit Directory", description: "Panel directory complete and accurate", necReference: "408.4", category: "Panel", isChecked: false, severity: "important" },
      { id: "6", code: "NEC 210.8", title: "GFCI Testing", description: "All GFCI devices tested and functional", necReference: "210.8", category: "Testing", isChecked: false, severity: "critical" },
      { id: "7", code: "NEC 210.12", title: "AFCI Testing", description: "All AFCI devices tested and functional", necReference: "210.12", category: "Testing", isChecked: false, severity: "critical" },
      { id: "8", code: "NEC 406.3", title: "Polarity Check", description: "Verify correct polarity on all receptacles", necReference: "406.3(A)", category: "Testing", isChecked: false, severity: "critical" },
      { id: "9", code: "NEC 250.119", title: "Ground Continuity", description: "Verify ground continuity throughout system", necReference: "250.119", category: "Testing", isChecked: false, severity: "critical" },
      { id: "10", code: "NEC 408.7", title: "Panel Identification", description: "Panel rated and labeled properly", necReference: "408.7", category: "Panel", isChecked: false, severity: "standard" },
      { id: "11", code: "NEC 422.5", title: "Appliance Connections", description: "Fixed appliances properly connected", necReference: "422.5", category: "Appliances", isChecked: false, severity: "important" },
      { id: "12", code: "NEC 680.44", title: "Pool/Spa Bonding", description: "Pool equipment bonding verified (if applicable)", necReference: "680.44", category: "Special", isChecked: false, severity: "critical" },
    ],
  },
  {
    id: "3",
    name: "Service Entrance",
    description: "Main service panel and meter installation",
    icon: Zap,
    category: "residential",
    completedCount: 0,
    totalCount: 10,
    requirements: [
      { id: "1", code: "NEC 230.70", title: "Service Disconnect", description: "Service disconnect readily accessible", necReference: "230.70(A)", category: "Disconnect", isChecked: false, severity: "critical" },
      { id: "2", code: "NEC 230.79", title: "Disconnect Rating", description: "Service disconnect properly rated", necReference: "230.79", category: "Disconnect", isChecked: false, severity: "critical" },
      { id: "3", code: "NEC 230.42", title: "Service Conductor Size", description: "Service conductors properly sized", necReference: "230.42", category: "Conductors", isChecked: false, severity: "critical" },
      { id: "4", code: "NEC 230.54", title: "Service Mast", description: "Service mast properly installed", necReference: "230.54", category: "Installation", isChecked: false, severity: "important" },
      { id: "5", code: "NEC 250.24", title: "Main Bonding Jumper", description: "Main bonding jumper installed", necReference: "250.24(B)", category: "Grounding", isChecked: false, severity: "critical" },
      { id: "6", code: "NEC 250.28", title: "Main Bonding Jumper Size", description: "MBJ properly sized", necReference: "250.28", category: "Grounding", isChecked: false, severity: "critical" },
      { id: "7", code: "NEC 230.43", title: "Wiring Methods", description: "Approved wiring methods used", necReference: "230.43", category: "Wiring", isChecked: false, severity: "important" },
      { id: "8", code: "NEC 230.82", title: "Equipment on Supply Side", description: "Only permitted equipment on line side", necReference: "230.82", category: "Installation", isChecked: false, severity: "important" },
      { id: "9", code: "NEC 408.3", title: "Panel Location", description: "Panel in permitted location", necReference: "408.3", category: "Panel", isChecked: false, severity: "important" },
      { id: "10", code: "NEC 110.26", title: "Working Space", description: "Required working space maintained", necReference: "110.26", category: "Safety", isChecked: false, severity: "critical" },
    ],
  },
  {
    id: "4",
    name: "EV Charger Installation",
    description: "Electric vehicle charging equipment",
    icon: Plug,
    category: "residential",
    completedCount: 0,
    totalCount: 8,
    requirements: [
      { id: "1", code: "NEC 625.40", title: "EVSE Rating", description: "EVSE listed and rated properly", necReference: "625.40", category: "Equipment", isChecked: false, severity: "critical" },
      { id: "2", code: "NEC 625.44", title: "EVSE Location", description: "EVSE installed in permitted location", necReference: "625.44", category: "Installation", isChecked: false, severity: "important" },
      { id: "3", code: "NEC 625.41", title: "Overcurrent Protection", description: "Circuit breaker properly sized", necReference: "625.41", category: "Protection", isChecked: false, severity: "critical" },
      { id: "4", code: "NEC 625.42", title: "Disconnecting Means", description: "Disconnect accessible and lockable", necReference: "625.42", category: "Disconnect", isChecked: false, severity: "important" },
      { id: "5", code: "NEC 625.43", title: "Cord Connection", description: "Proper cord and connector used", necReference: "625.43", category: "Connections", isChecked: false, severity: "important" },
      { id: "6", code: "NEC 210.17", title: "Dedicated Circuit", description: "EVSE on dedicated circuit", necReference: "210.17", category: "Circuit", isChecked: false, severity: "critical" },
      { id: "7", code: "NEC 625.54", title: "GFCI Protection", description: "GFCI protection provided where required", necReference: "625.54", category: "Protection", isChecked: false, severity: "critical" },
      { id: "8", code: "NEC 110.3", title: "Listed Equipment", description: "All equipment listed and labeled", necReference: "110.3(B)", category: "Equipment", isChecked: false, severity: "critical" },
    ],
  },
  {
    id: "5",
    name: "Commercial Rough-In",
    description: "Commercial electrical rough-in inspection",
    icon: Building,
    category: "commercial",
    completedCount: 0,
    totalCount: 12,
    requirements: [
      { id: "1", code: "NEC 250.30", title: "Separately Derived Systems", description: "Grounding of separately derived systems", necReference: "250.30", category: "Grounding", isChecked: false, severity: "critical" },
      { id: "2", code: "NEC 358.10", title: "EMT Installation", description: "EMT properly supported and secured", necReference: "358.10", category: "Conduit", isChecked: false, severity: "important" },
      { id: "3", code: "NEC 300.5", title: "Underground Installations", description: "Proper burial depth for underground", necReference: "300.5", category: "Installation", isChecked: false, severity: "critical" },
      { id: "4", code: "NEC 215.2", title: "Feeder Sizing", description: "Feeders properly sized for load", necReference: "215.2", category: "Feeders", isChecked: false, severity: "critical" },
      { id: "5", code: "NEC 220.40", title: "Load Calculations", description: "Commercial load calculations verified", necReference: "220.40", category: "Calculations", isChecked: false, severity: "critical" },
      { id: "6", code: "NEC 700.10", title: "Emergency Systems", description: "Emergency circuits separated", necReference: "700.10", category: "Emergency", isChecked: false, severity: "critical" },
      { id: "7", code: "NEC 517.13", title: "Healthcare Grounding", description: "Healthcare facility grounding (if applicable)", necReference: "517.13", category: "Special", isChecked: false, severity: "critical" },
      { id: "8", code: "NEC 410.36", title: "Recessed Luminaires", description: "Clearance from combustibles", necReference: "410.36", category: "Lighting", isChecked: false, severity: "important" },
      { id: "9", code: "NEC 480.3", title: "Battery Systems", description: "Battery installation requirements", necReference: "480.3", category: "Special", isChecked: false, severity: "important" },
      { id: "10", code: "NEC 440.4", title: "HVAC Circuits", description: "HVAC equipment circuits properly sized", necReference: "440.4", category: "Equipment", isChecked: false, severity: "important" },
      { id: "11", code: "NEC 250.104", title: "Bonding Other Systems", description: "Metal piping systems bonded", necReference: "250.104", category: "Bonding", isChecked: false, severity: "important" },
      { id: "12", code: "NEC 314.28", title: "Pull/Junction Box Sizing", description: "Pull boxes properly sized for conductors", necReference: "314.28", category: "Boxes", isChecked: false, severity: "important" },
    ],
  },
];

const necQuickReference = [
  { code: "210.8", title: "GFCI Protection", description: "Required in bathrooms, kitchens, garages, outdoors, etc." },
  { code: "210.12", title: "AFCI Protection", description: "Required in bedrooms, living rooms, hallways, etc." },
  { code: "210.52", title: "Receptacle Spacing", description: "Max 12' between receptacles, 6' from opening" },
  { code: "314.16", title: "Box Fill", description: "Volume calculations for device boxes" },
  { code: "250.66", title: "GEC Sizing", description: "Based on service entrance conductors" },
  { code: "334.30", title: "NM Cable Support", description: "12\" from box, every 4.5' thereafter" },
  { code: "406.12", title: "Tamper-Resistant", description: "Required in all dwelling unit receptacles" },
  { code: "408.36", title: "Working Space", description: "36\" depth, 30\" width, 6.5' height minimum" },
];

export default function ElectricalCodeComplianceScreen() {
  const router = useRouter();
  const [checklists, setChecklists] = useState<InspectionChecklist[]>(inspectionChecklists);
  const [selectedChecklist, setSelectedChecklist] = useState<InspectionChecklist | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "residential" | "commercial">("all");
  const [showQuickRef, setShowQuickRef] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const filteredChecklists = useMemo(() => {
    return checklists.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || c.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [checklists, searchQuery, selectedCategory]);

  const toggleRequirement = useCallback((checklistId: string, requirementId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setChecklists((prev) =>
      prev.map((checklist) => {
        if (checklist.id === checklistId) {
          const updatedReqs = checklist.requirements.map((req) =>
            req.id === requirementId ? { ...req, isChecked: !req.isChecked } : req
          );
          return {
            ...checklist,
            requirements: updatedReqs,
            completedCount: updatedReqs.filter((r) => r.isChecked).length,
          };
        }
        return checklist;
      })
    );
    
    if (selectedChecklist) {
      setSelectedChecklist((prev) => {
        if (!prev) return null;
        const updatedReqs = prev.requirements.map((req) =>
          req.id === requirementId ? { ...req, isChecked: !req.isChecked } : req
        );
        return {
          ...prev,
          requirements: updatedReqs,
          completedCount: updatedReqs.filter((r) => r.isChecked).length,
        };
      });
    }
  }, [selectedChecklist]);

  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  }, []);

  const getProgressColor = (completed: number, total: number) => {
    const percentage = (completed / total) * 100;
    if (percentage === 100) return "#22C55E";
    if (percentage >= 50) return "#EAB308";
    return "#6B7280";
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "#DC2626";
      case "important": return "#272D53";
      default: return "#3B82F6";
    }
  };

  const groupRequirementsByCategory = (requirements: CodeRequirement[]) => {
    const grouped: Record<string, CodeRequirement[]> = {};
    requirements.forEach((req) => {
      if (!grouped[req.category]) {
        grouped[req.category] = [];
      }
      grouped[req.category].push(req);
    });
    return grouped;
  };

  const renderChecklistCard = (checklist: InspectionChecklist) => {
    const Icon = checklist.icon;
    const progressColor = getProgressColor(checklist.completedCount, checklist.totalCount);
    const progressPercent = (checklist.completedCount / checklist.totalCount) * 100;

    return (
      <TouchableOpacity
        key={checklist.id}
        style={styles.checklistCard}
        onPress={() => setSelectedChecklist(checklist)}
        activeOpacity={0.7}
      >
        <View style={styles.checklistHeader}>
          <View style={[styles.checklistIcon, { backgroundColor: "#FEF9C3" }]}>
            <Icon size={24} color="#EAB308" />
          </View>
          <View style={styles.checklistInfo}>
            <Text style={styles.checklistName}>{checklist.name}</Text>
            <Text style={styles.checklistDescription}>{checklist.description}</Text>
          </View>
          <ChevronRight size={20} color={Colors.textTertiary} />
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={[styles.progressValue, { color: progressColor }]}>
              {checklist.completedCount}/{checklist.totalCount}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressPercent}%`, backgroundColor: progressColor },
              ]}
            />
          </View>
        </View>

        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>
            {checklist.category === "residential" ? "🏠 Residential" : "🏢 Commercial"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "NEC Code Compliance",
          headerLeft: () => <BackButton />,
          headerRight: () => (
            <TouchableOpacity onPress={() => setShowQuickRef(true)} style={styles.addButton}>
              <BookOpen size={24} color="#EAB308" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <View style={styles.headerIcon}>
            <Shield size={32} color="#EAB308" />
          </View>
          <Text style={styles.headerTitle}>NEC 2023 Compliance</Text>
          <Text style={styles.headerSubtitle}>
            Inspection checklists based on the National Electrical Code
          </Text>
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Search size={18} color={Colors.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search checklists..."
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

        <View style={styles.categoryFilter}>
          {(["all", "residential", "commercial"] as const).map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.categoryChipText, selectedCategory === cat && styles.categoryChipTextActive]}>
                {cat === "all" ? "All" : cat === "residential" ? "🏠 Residential" : "🏢 Commercial"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.checklistsSection}>
          <Text style={styles.sectionTitle}>Inspection Checklists</Text>
          {filteredChecklists.map(renderChecklistCard)}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal visible={selectedChecklist !== null} animationType="slide" presentationStyle="pageSheet">
        {selectedChecklist && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedChecklist(null)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{selectedChecklist.name}</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.modalProgressCard}>
                <View style={styles.modalProgressHeader}>
                  <Text style={styles.modalProgressLabel}>Completion</Text>
                  <Text style={[styles.modalProgressValue, { color: getProgressColor(selectedChecklist.completedCount, selectedChecklist.totalCount) }]}>
                    {Math.round((selectedChecklist.completedCount / selectedChecklist.totalCount) * 100)}%
                  </Text>
                </View>
                <View style={styles.modalProgressBar}>
                  <View
                    style={[
                      styles.modalProgressFill,
                      {
                        width: `${(selectedChecklist.completedCount / selectedChecklist.totalCount) * 100}%`,
                        backgroundColor: getProgressColor(selectedChecklist.completedCount, selectedChecklist.totalCount),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.modalProgressText}>
                  {selectedChecklist.completedCount} of {selectedChecklist.totalCount} items checked
                </Text>
              </View>

              {Object.entries(groupRequirementsByCategory(selectedChecklist.requirements)).map(([category, requirements]) => (
                <View key={category} style={styles.requirementCategory}>
                  <TouchableOpacity
                    style={styles.categoryHeader}
                    onPress={() => toggleCategory(category)}
                  >
                    <Text style={styles.categoryTitle}>{category}</Text>
                    <View style={styles.categoryMeta}>
                      <Text style={styles.categoryCount}>
                        {requirements.filter((r) => r.isChecked).length}/{requirements.length}
                      </Text>
                      {expandedCategories.includes(category) ? (
                        <ChevronDown size={20} color={Colors.textSecondary} />
                      ) : (
                        <ChevronRight size={20} color={Colors.textSecondary} />
                      )}
                    </View>
                  </TouchableOpacity>

                  {(expandedCategories.includes(category) || expandedCategories.length === 0) && (
                    <View style={styles.requirementsList}>
                      {requirements.map((req) => (
                        <TouchableOpacity
                          key={req.id}
                          style={[styles.requirementItem, req.isChecked && styles.requirementItemChecked]}
                          onPress={() => toggleRequirement(selectedChecklist.id, req.id)}
                        >
                          <View style={styles.requirementCheck}>
                            {req.isChecked ? (
                              <CheckCircle size={22} color="#22C55E" />
                            ) : (
                              <Circle size={22} color={Colors.textTertiary} />
                            )}
                          </View>
                          <View style={styles.requirementContent}>
                            <View style={styles.requirementHeader}>
                              <Text style={[styles.requirementCode, { color: getSeverityColor(req.severity) }]}>
                                {req.code}
                              </Text>
                              <View style={[styles.severityDot, { backgroundColor: getSeverityColor(req.severity) }]} />
                            </View>
                            <Text style={[styles.requirementTitle, req.isChecked && styles.requirementTitleChecked]}>
                              {req.title}
                            </Text>
                            <Text style={styles.requirementDescription}>{req.description}</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              ))}

              <View style={styles.legendSection}>
                <Text style={styles.legendTitle}>Severity Legend</Text>
                <View style={styles.legendItems}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: "#DC2626" }]} />
                    <Text style={styles.legendText}>Critical - Must pass</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: "#272D53" }]} />
                    <Text style={styles.legendText}>Important - Should address</Text>
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

      <Modal visible={showQuickRef} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowQuickRef(false)}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>NEC Quick Reference</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.quickRefHeader}>
              <BookOpen size={32} color="#EAB308" />
              <Text style={styles.quickRefTitle}>Common Code References</Text>
              <Text style={styles.quickRefSubtitle}>Frequently used NEC sections</Text>
            </View>

            {necQuickReference.map((item, index) => (
              <View key={index} style={styles.quickRefCard}>
                <View style={styles.quickRefCodeBadge}>
                  <Text style={styles.quickRefCode}>{item.code}</Text>
                </View>
                <Text style={styles.quickRefItemTitle}>{item.title}</Text>
                <Text style={styles.quickRefItemDesc}>{item.description}</Text>
              </View>
            ))}

            <View style={styles.disclaimerCard}>
              <AlertTriangle size={20} color="#272D53" />
              <Text style={styles.disclaimerText}>
                Always refer to the full NEC and local amendments for complete requirements. This is a quick reference guide only.
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
  addButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  headerCard: {
    backgroundColor: "#FEF9C3",
    margin: 16,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(234, 179, 8, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#92400E",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#92400E",
    opacity: 0.8,
    marginTop: 4,
    textAlign: "center" as const,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingBottom: 8,
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
  categoryFilter: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
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
    color: "#000",
  },
  checklistsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 14,
  },
  checklistCard: {
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
  checklistHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  checklistIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checklistInfo: {
    flex: 1,
  },
  checklistName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  checklistDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  progressValue: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    color: Colors.textSecondary,
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
  modalProgressCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  modalProgressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modalProgressLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  modalProgressValue: {
    fontSize: 24,
    fontWeight: "700" as const,
  },
  modalProgressBar: {
    height: 10,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 8,
  },
  modalProgressFill: {
    height: "100%",
    borderRadius: 5,
  },
  modalProgressText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center" as const,
  },
  requirementCategory: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  categoryMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryCount: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  requirementsList: {
    marginTop: 8,
  },
  requirementItem: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  requirementItemChecked: {
    backgroundColor: "#DCFCE7",
  },
  requirementCheck: {
    paddingTop: 2,
  },
  requirementContent: {
    flex: 1,
  },
  requirementHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  requirementCode: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  severityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  requirementTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  requirementTitleChecked: {
    textDecorationLine: "line-through",
    color: Colors.textSecondary,
  },
  requirementDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  legendSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 12,
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
  quickRefHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  quickRefTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
    marginTop: 12,
  },
  quickRefSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  quickRefCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  quickRefCodeBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FEF9C3",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  quickRefCode: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: "#92400E",
  },
  quickRefItemTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  quickRefItemDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  disclaimerCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#E8E9EE",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 13,
    color: "#92400E",
    lineHeight: 18,
  },
});
