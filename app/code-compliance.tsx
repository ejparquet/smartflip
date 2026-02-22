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
  Plus,
  Search,
  Filter,
  CheckCircle,
  Circle,
  AlertTriangle,
  FileText,
  Calendar,
  Clock,
  ChevronRight,
  X,
  ClipboardCheck,
  Shield,
  Building2,
  Droplets,
  Flame,
  Wind,
  Info,
  Camera,
  MapPin,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";

interface CodeItem {
  id: string;
  code: string;
  description: string;
  requirement: string;
  isCompliant: boolean | null;
  notes?: string;
  photoRequired?: boolean;
  photoTaken?: boolean;
}

interface ComplianceChecklist {
  id: string;
  name: string;
  category: "residential" | "commercial" | "water_heater" | "drainage" | "gas" | "backflow";
  codeVersion: string;
  lastUpdated: string;
  items: CodeItem[];
  jobId?: string;
  jobAddress?: string;
  inspectorName?: string;
  inspectionDate?: string;
  status: "not_started" | "in_progress" | "completed" | "passed" | "failed";
  createdAt: string;
}

const categoryConfig: Record<string, { icon: any; color: string; bgColor: string; label: string }> = {
  residential: { icon: Building2, color: "#3B82F6", bgColor: "#DBEAFE", label: "Residential" },
  commercial: { icon: Building2, color: "#8B5CF6", bgColor: "#EDE9FE", label: "Commercial" },
  water_heater: { icon: Flame, color: "#272D53", bgColor: "#E8E9EE", label: "Water Heater" },
  drainage: { icon: Droplets, color: "#06B6D4", bgColor: "#CFFAFE", label: "Drainage" },
  gas: { icon: Flame, color: "#EF4444", bgColor: "#FEE2E2", label: "Gas Lines" },
  backflow: { icon: Wind, color: "#22C55E", bgColor: "#DCFCE7", label: "Backflow" },
};

const mockChecklists: ComplianceChecklist[] = [
  {
    id: "1",
    name: "Residential Plumbing Rough-In",
    category: "residential",
    codeVersion: "IPC 2021",
    lastUpdated: "2024-01-15",
    jobId: "job-001",
    jobAddress: "1234 Oak Valley Dr, Austin, TX",
    status: "in_progress",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    items: [
      { id: "1", code: "P2503.5.1", description: "Drain pipe slope", requirement: "Minimum 1/4 inch per foot slope for pipes 3\" and smaller", isCompliant: true },
      { id: "2", code: "P2503.6", description: "Vent pipe termination", requirement: "Vent pipes must extend 6 inches above roof line", isCompliant: true },
      { id: "3", code: "P2602.1", description: "Pipe support spacing", requirement: "Horizontal pipes supported every 4 feet for PVC", isCompliant: null, photoRequired: true },
      { id: "4", code: "P2705.1", description: "Trap requirements", requirement: "Each fixture must have an approved trap", isCompliant: null },
      { id: "5", code: "P2801.5", description: "Water heater clearance", requirement: "Minimum 18\" clearance from combustibles", isCompliant: null, photoRequired: true },
    ],
  },
  {
    id: "2",
    name: "Water Heater Installation",
    category: "water_heater",
    codeVersion: "IPC 2021 / IRC M2005",
    lastUpdated: "2024-01-10",
    jobId: "job-002",
    jobAddress: "567 Maple Street, Round Rock, TX",
    inspectorName: "John Martinez",
    inspectionDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    status: "not_started",
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    items: [
      { id: "1", code: "M2005.1", description: "Equipment approval", requirement: "Water heater must be listed and labeled", isCompliant: null },
      { id: "2", code: "M2005.2", description: "T&P relief valve", requirement: "Temperature and pressure relief valve required", isCompliant: null, photoRequired: true },
      { id: "3", code: "M2005.3", description: "Relief valve discharge", requirement: "Discharge pipe within 6\" of floor or drain", isCompliant: null, photoRequired: true },
      { id: "4", code: "P2801.6", description: "Seismic strapping", requirement: "Strapping required in seismic zones", isCompliant: null },
      { id: "5", code: "P2803.1", description: "Expansion tank", requirement: "Thermal expansion tank when check valve present", isCompliant: null },
      { id: "6", code: "E3901.1", description: "Electrical disconnect", requirement: "Disconnect within sight of equipment", isCompliant: null },
    ],
  },
  {
    id: "3",
    name: "Backflow Prevention Device",
    category: "backflow",
    codeVersion: "IPC 2021",
    lastUpdated: "2024-01-08",
    status: "completed",
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    items: [
      { id: "1", code: "P2902.1", description: "Device selection", requirement: "Appropriate backflow device for hazard level", isCompliant: true },
      { id: "2", code: "P2902.3", description: "Installation height", requirement: "Minimum 12\" above highest downstream opening", isCompliant: true },
      { id: "3", code: "P2902.4", description: "Testing access", requirement: "Test cocks accessible for annual testing", isCompliant: true },
      { id: "4", code: "P2902.5", description: "Certification", requirement: "Annual certification by licensed tester", isCompliant: true },
    ],
  },
  {
    id: "4",
    name: "Commercial Kitchen Drainage",
    category: "drainage",
    codeVersion: "IPC 2021",
    lastUpdated: "2024-01-05",
    jobId: "job-003",
    jobAddress: "890 Commerce St, Austin, TX",
    status: "failed",
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    items: [
      { id: "1", code: "P1003.1", description: "Grease interceptor", requirement: "Grease interceptor required for commercial kitchens", isCompliant: true },
      { id: "2", code: "P1003.3", description: "Interceptor sizing", requirement: "Properly sized for flow rate and retention", isCompliant: false, notes: "Undersized - needs 50 GPM unit" },
      { id: "3", code: "P1003.4", description: "Accessibility", requirement: "Access for cleaning and maintenance", isCompliant: true },
      { id: "4", code: "P3005.2", description: "Floor drain trap", requirement: "Trap primer or trap seal required", isCompliant: false, notes: "Missing trap primer" },
    ],
  },
];

const templateChecklists = [
  { id: "t1", name: "Residential Rough-In Inspection", category: "residential" as const },
  { id: "t2", name: "Residential Final Inspection", category: "residential" as const },
  { id: "t3", name: "Water Heater Installation", category: "water_heater" as const },
  { id: "t4", name: "Tankless Water Heater", category: "water_heater" as const },
  { id: "t5", name: "Backflow Device Installation", category: "backflow" as const },
  { id: "t6", name: "Commercial Plumbing Rough-In", category: "commercial" as const },
  { id: "t7", name: "Grease Interceptor", category: "drainage" as const },
  { id: "t8", name: "Gas Line Installation", category: "gas" as const },
];

export default function CodeComplianceScreen() {
  const router = useRouter();
  const [checklists, setChecklists] = useState<ComplianceChecklist[]>(mockChecklists);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState<ComplianceChecklist | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);

  const filteredChecklists = useMemo(() => {
    return checklists.filter((checklist) => {
      const matchesSearch =
        checklist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        checklist.jobAddress?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || checklist.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [checklists, searchQuery, selectedCategory]);

  const stats = useMemo(() => {
    return {
      total: checklists.length,
      inProgress: checklists.filter((c) => c.status === "in_progress").length,
      passed: checklists.filter((c) => c.status === "passed" || c.status === "completed").length,
      failed: checklists.filter((c) => c.status === "failed").length,
    };
  }, [checklists]);

  const handleToggleItem = useCallback((checklistId: string, itemId: string, value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setChecklists((prev) =>
      prev.map((checklist) =>
        checklist.id === checklistId
          ? {
              ...checklist,
              items: checklist.items.map((item) =>
                item.id === itemId ? { ...item, isCompliant: value } : item
              ),
            }
          : checklist
      )
    );
    if (selectedChecklist?.id === checklistId) {
      setSelectedChecklist((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((item) =>
                item.id === itemId ? { ...item, isCompliant: value } : item
              ),
            }
          : null
      );
    }
  }, [selectedChecklist]);

  const handleCompleteChecklist = useCallback((checklistId: string) => {
    const checklist = checklists.find((c) => c.id === checklistId);
    if (!checklist) return;

    const allChecked = checklist.items.every((item) => item.isCompliant !== null);
    if (!allChecked) {
      Alert.alert("Incomplete", "Please check all items before completing the inspection.");
      return;
    }

    const allPassed = checklist.items.every((item) => item.isCompliant === true);
    const newStatus = allPassed ? "passed" : "failed";

    Haptics.notificationAsync(
      allPassed ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning
    );

    setChecklists((prev) =>
      prev.map((c) => (c.id === checklistId ? { ...c, status: newStatus } : c))
    );
    setSelectedChecklist(null);

    Alert.alert(
      allPassed ? "Inspection Passed" : "Inspection Failed",
      allPassed
        ? "All items are compliant. The inspection has been marked as passed."
        : "Some items are non-compliant. The inspection has been marked as failed."
    );
  }, [checklists]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "passed":
      case "completed":
        return { color: "#22C55E", bgColor: "#DCFCE7", label: "Passed" };
      case "failed":
        return { color: "#EF4444", bgColor: "#FEE2E2", label: "Failed" };
      case "in_progress":
        return { color: "#272D53", bgColor: "#E8E9EE", label: "In Progress" };
      default:
        return { color: "#6B7280", bgColor: "#F3F4F6", label: "Not Started" };
    }
  };

  const getCompletionRate = (items: CodeItem[]) => {
    const checked = items.filter((item) => item.isCompliant !== null).length;
    return Math.round((checked / items.length) * 100);
  };

  const renderChecklistCard = (checklist: ComplianceChecklist) => {
    const category = categoryConfig[checklist.category];
    const status = getStatusConfig(checklist.status);
    const CategoryIcon = category.icon;
    const completionRate = getCompletionRate(checklist.items);
    const passedItems = checklist.items.filter((i) => i.isCompliant === true).length;
    const failedItems = checklist.items.filter((i) => i.isCompliant === false).length;

    return (
      <TouchableOpacity
        key={checklist.id}
        style={styles.checklistCard}
        onPress={() => setSelectedChecklist(checklist)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: category.bgColor }]}>
            <CategoryIcon size={14} color={category.color} />
            <Text style={[styles.categoryText, { color: category.color }]}>{category.label}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bgColor }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <Text style={styles.checklistName}>{checklist.name}</Text>

        {checklist.jobAddress && (
          <View style={styles.addressRow}>
            <MapPin size={12} color={Colors.textSecondary} />
            <Text style={styles.addressText} numberOfLines={1}>
              {checklist.jobAddress}
            </Text>
          </View>
        )}

        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${completionRate}%` }]} />
          </View>
          <Text style={styles.progressText}>{completionRate}% Complete</Text>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.itemStats}>
            <View style={styles.itemStat}>
              <CheckCircle size={14} color="#22C55E" />
              <Text style={styles.itemStatText}>{passedItems}</Text>
            </View>
            <View style={styles.itemStat}>
              <AlertTriangle size={14} color="#EF4444" />
              <Text style={styles.itemStatText}>{failedItems}</Text>
            </View>
            <View style={styles.itemStat}>
              <Circle size={14} color={Colors.textTertiary} />
              <Text style={styles.itemStatText}>{checklist.items.length - passedItems - failedItems}</Text>
            </View>
          </View>
          <View style={styles.codeVersionBadge}>
            <Text style={styles.codeVersionText}>{checklist.codeVersion}</Text>
          </View>
        </View>

        {checklist.inspectionDate && (
          <View style={styles.inspectionInfo}>
            <Calendar size={12} color={Colors.textSecondary} />
            <Text style={styles.inspectionText}>
              Inspection: {new Date(checklist.inspectionDate).toLocaleDateString()}
            </Text>
          </View>
        )}

        <ChevronRight size={20} color={Colors.textTertiary} style={styles.chevron} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Code Compliance",
          headerLeft: () => <BackButton />,
          headerRight: () => (
            <TouchableOpacity onPress={() => setShowNewModal(true)} style={styles.addButton}>
              <Plus size={24} color={Colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <ClipboardCheck size={20} color="#3B82F6" />
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#E8E9EE" }]}>
            <Clock size={20} color="#272D53" />
            <Text style={[styles.statValue, { color: "#272D53" }]}>{stats.inProgress}</Text>
            <Text style={[styles.statLabel, { color: "#272D53" }]}>In Progress</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#DCFCE7" }]}>
            <CheckCircle size={20} color="#22C55E" />
            <Text style={[styles.statValue, { color: "#22C55E" }]}>{stats.passed}</Text>
            <Text style={[styles.statLabel, { color: "#22C55E" }]}>Passed</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#FEE2E2" }]}>
            <AlertTriangle size={20} color="#EF4444" />
            <Text style={[styles.statValue, { color: "#EF4444" }]}>{stats.failed}</Text>
            <Text style={[styles.statLabel, { color: "#EF4444" }]}>Failed</Text>
          </View>
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
          <TouchableOpacity
            style={[styles.filterButton, showFilters && styles.filterButtonActive]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} color={showFilters ? Colors.white : Colors.text} />
          </TouchableOpacity>
        </View>

        {showFilters && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
            <TouchableOpacity
              style={[styles.filterChip, selectedCategory === "all" && styles.filterChipActive]}
              onPress={() => setSelectedCategory("all")}
            >
              <Text style={[styles.filterChipText, selectedCategory === "all" && styles.filterChipTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            {Object.entries(categoryConfig).map(([key, config]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.filterChip,
                  selectedCategory === key && styles.filterChipActive,
                  selectedCategory === key && { backgroundColor: config.color },
                ]}
                onPress={() => setSelectedCategory(key)}
              >
                <config.icon size={14} color={selectedCategory === key ? "#FFF" : config.color} />
                <Text style={[styles.filterChipText, selectedCategory === key && styles.filterChipTextActive]}>
                  {config.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={styles.checklistsSection}>
          <Text style={styles.sectionTitle}>Checklists ({filteredChecklists.length})</Text>
          {filteredChecklists.map(renderChecklistCard)}

          {filteredChecklists.length === 0 && (
            <View style={styles.emptyState}>
              <ClipboardCheck size={48} color={Colors.textTertiary} />
              <Text style={styles.emptyStateTitle}>No Checklists</Text>
              <Text style={styles.emptyStateText}>
                {searchQuery || selectedCategory !== "all"
                  ? "Try adjusting your filters"
                  : "Create a new checklist to get started"}
              </Text>
            </View>
          )}
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
              <Text style={styles.modalTitle}>Inspection Checklist</Text>
              <TouchableOpacity onPress={() => handleCompleteChecklist(selectedChecklist.id)}>
                <Text style={styles.completeText}>Complete</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.checklistHeader}>
                <Text style={styles.checklistDetailName}>{selectedChecklist.name}</Text>
                <View style={styles.codeVersionRow}>
                  <FileText size={14} color={Colors.textSecondary} />
                  <Text style={styles.codeVersionLabel}>{selectedChecklist.codeVersion}</Text>
                </View>
                {selectedChecklist.jobAddress && (
                  <View style={styles.jobAddressRow}>
                    <MapPin size={14} color={Colors.textSecondary} />
                    <Text style={styles.jobAddressLabel}>{selectedChecklist.jobAddress}</Text>
                  </View>
                )}
              </View>

              <View style={styles.itemsSection}>
                <Text style={styles.itemsSectionTitle}>Code Requirements</Text>
                {selectedChecklist.items.map((item) => (
                  <View key={item.id} style={styles.codeItem}>
                    <View style={styles.codeItemHeader}>
                      <View style={styles.codeBadge}>
                        <Text style={styles.codeText}>{item.code}</Text>
                      </View>
                      {item.photoRequired && (
                        <View style={styles.photoBadge}>
                          <Camera size={12} color="#8B5CF6" />
                          <Text style={styles.photoText}>Photo</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.codeDescription}>{item.description}</Text>
                    <Text style={styles.codeRequirement}>{item.requirement}</Text>
                    {item.notes && (
                      <View style={styles.notesRow}>
                        <Info size={12} color="#272D53" />
                        <Text style={styles.notesText}>{item.notes}</Text>
                      </View>
                    )}
                    <View style={styles.complianceButtons}>
                      <TouchableOpacity
                        style={[
                          styles.complianceButton,
                          item.isCompliant === true && styles.complianceButtonPass,
                        ]}
                        onPress={() => handleToggleItem(selectedChecklist.id, item.id, true)}
                      >
                        <CheckCircle
                          size={18}
                          color={item.isCompliant === true ? "#FFF" : "#22C55E"}
                        />
                        <Text
                          style={[
                            styles.complianceButtonText,
                            item.isCompliant === true && styles.complianceButtonTextActive,
                          ]}
                        >
                          Pass
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.complianceButton,
                          item.isCompliant === false && styles.complianceButtonFail,
                        ]}
                        onPress={() => handleToggleItem(selectedChecklist.id, item.id, false)}
                      >
                        <AlertTriangle
                          size={18}
                          color={item.isCompliant === false ? "#FFF" : "#EF4444"}
                        />
                        <Text
                          style={[
                            styles.complianceButtonText,
                            item.isCompliant === false && styles.complianceButtonTextActive,
                          ]}
                        >
                          Fail
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>

      <Modal visible={showNewModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowNewModal(false)}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Checklist</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.templateSectionTitle}>Select a Template</Text>
            {templateChecklists.map((template) => {
              const category = categoryConfig[template.category];
              const CategoryIcon = category.icon;
              return (
                <TouchableOpacity
                  key={template.id}
                  style={styles.templateCard}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    Alert.alert("Template Selected", `"${template.name}" template will be used for the new checklist.`);
                    setShowNewModal(false);
                  }}
                >
                  <View style={[styles.templateIcon, { backgroundColor: category.bgColor }]}>
                    <CategoryIcon size={20} color={category.color} />
                  </View>
                  <View style={styles.templateInfo}>
                    <Text style={styles.templateName}>{template.name}</Text>
                    <Text style={styles.templateCategory}>{category.label}</Text>
                  </View>
                  <ChevronRight size={20} color={Colors.textTertiary} />
                </TouchableOpacity>
              );
            })}
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
  statsRow: {
    flexDirection: "row",
    gap: 8,
    padding: 16,
    paddingBottom: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  searchSection: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchBar: {
    flex: 1,
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
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filtersScroll: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: Colors.navy,
    borderColor: Colors.navy,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#6B7280",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  checklistName: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 6,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  addressText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  progressSection: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.borderLight,
    borderRadius: 3,
    marginBottom: 6,
  },
  progressFill: {
    height: 6,
    backgroundColor: "#3B82F6",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemStats: {
    flexDirection: "row",
    gap: 12,
  },
  itemStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  itemStatText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  codeVersionBadge: {
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  codeVersionText: {
    fontSize: 11,
    fontWeight: "500" as const,
    color: Colors.textSecondary,
  },
  inspectionInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  inspectionText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  chevron: {
    position: "absolute",
    right: 16,
    top: "50%",
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
    textAlign: "center" as const,
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
  completeText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  checklistHeader: {
    marginBottom: 24,
  },
  checklistDetailName: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  codeVersionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  codeVersionLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  jobAddressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  jobAddressLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  itemsSection: {},
  itemsSectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 16,
  },
  codeItem: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  codeItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  codeBadge: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  codeText: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: "#3B82F6",
  },
  photoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EDE9FE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  photoText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: "#8B5CF6",
  },
  codeDescription: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  codeRequirement: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  notesRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    backgroundColor: "#E8E9EE",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  notesText: {
    fontSize: 13,
    color: "#92400E",
    flex: 1,
  },
  complianceButtons: {
    flexDirection: "row",
    gap: 10,
  },
  complianceButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  complianceButtonPass: {
    backgroundColor: "#22C55E",
    borderColor: "#22C55E",
  },
  complianceButtonFail: {
    backgroundColor: "#EF4444",
    borderColor: "#EF4444",
  },
  complianceButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  complianceButtonTextActive: {
    color: "#FFF",
  },
  templateSectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 16,
  },
  templateCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  templateIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  templateCategory: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
