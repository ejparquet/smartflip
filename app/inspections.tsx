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
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import {
  Search,
  ClipboardCheck,
  Calendar,
  MapPin,
  User,
  Plus,
  X,
  Phone,
  AlertCircle,
  XCircle,
  ChevronRight,
  FileCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Camera,
  MessageSquare,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import BackButton from "@/components/BackButton";

type InspectionStatus = "scheduled" | "passed" | "failed" | "pending" | "in_progress";

interface Inspection {
  id: string;
  title: string;
  inspector: string;
  inspectorPhone?: string;
  property: string;
  type: string;
  date: string;
  time: string;
  status: InspectionStatus;
  notes: string;
  permitRef?: string;
  corrections?: string[];
  priority: "low" | "medium" | "high";
  projectName: string;
}

const mockInspections: Inspection[] = [
  {
    id: "1",
    title: "Framing Inspection",
    inspector: "Robert Chen",
    inspectorPhone: "(555) 234-5678",
    property: "123 Oak Street",
    type: "Structural",
    date: "Feb 12, 2026",
    time: "9:00 AM",
    status: "scheduled",
    notes: "Ensure all framing is complete before inspection. All load-bearing walls must be clearly marked.",
    permitRef: "BP-2026-0412",
    priority: "high",
    projectName: "Oak Street Renovation",
  },
  {
    id: "2",
    title: "Electrical Rough-In",
    inspector: "Maria Lopez",
    inspectorPhone: "(555) 345-6789",
    property: "456 Maple Ave",
    type: "Electrical",
    date: "Feb 18, 2026",
    time: "10:30 AM",
    status: "scheduled",
    notes: "Panel must be labeled. All circuits must be identified.",
    permitRef: "EP-2026-0198",
    priority: "high",
    projectName: "Maple Ave Remodel",
  },
  {
    id: "3",
    title: "Foundation Inspection",
    inspector: "James Wilson",
    inspectorPhone: "(555) 456-7890",
    property: "123 Oak Street",
    type: "Structural",
    date: "Jan 20, 2026",
    time: "8:00 AM",
    status: "passed",
    notes: "All requirements met. Foundation depth and rebar spacing within spec.",
    permitRef: "BP-2026-0412",
    priority: "medium",
    projectName: "Oak Street Renovation",
  },
  {
    id: "4",
    title: "Plumbing Pressure Test",
    inspector: "Sarah Kim",
    inspectorPhone: "(555) 567-8901",
    property: "789 Pine Blvd",
    type: "Plumbing",
    date: "Jan 15, 2026",
    time: "2:00 PM",
    status: "failed",
    notes: "Leak found at kitchen junction - reschedule required",
    corrections: [
      "Fix leak at kitchen supply junction",
      "Re-solder connection at main branch",
      "Retest at 40 PSI for 15 minutes",
    ],
    priority: "high",
    projectName: "Pine Blvd Commercial",
  },
  {
    id: "5",
    title: "Final Walkthrough",
    inspector: "TBD",
    property: "456 Maple Ave",
    type: "General",
    date: "TBD",
    time: "TBD",
    status: "pending",
    notes: "Awaiting completion of all prior inspections",
    priority: "low",
    projectName: "Maple Ave Remodel",
  },
  {
    id: "6",
    title: "HVAC Ductwork Inspection",
    inspector: "David Park",
    inspectorPhone: "(555) 678-9012",
    property: "321 Elm Drive",
    type: "Mechanical",
    date: "Feb 25, 2026",
    time: "11:00 AM",
    status: "scheduled",
    notes: "Verify duct sealing and insulation. R-8 minimum for all supply ducts.",
    permitRef: "HP-2026-0067",
    priority: "medium",
    projectName: "Elm Drive New Build",
  },
  {
    id: "7",
    title: "Insulation Inspection",
    inspector: "Robert Chen",
    inspectorPhone: "(555) 234-5678",
    property: "123 Oak Street",
    type: "Energy",
    date: "Feb 20, 2026",
    time: "1:00 PM",
    status: "in_progress",
    notes: "Checking wall and attic insulation R-values. Vapor barrier installation.",
    permitRef: "BP-2026-0412",
    priority: "medium",
    projectName: "Oak Street Renovation",
  },
  {
    id: "8",
    title: "Fire Stopping Inspection",
    inspector: "Lisa Martinez",
    inspectorPhone: "(555) 789-0123",
    property: "789 Pine Blvd",
    type: "Fire Safety",
    date: "Feb 28, 2026",
    time: "9:30 AM",
    status: "scheduled",
    notes: "All penetrations through fire-rated assemblies must be properly sealed.",
    priority: "high",
    projectName: "Pine Blvd Commercial",
  },
  {
    id: "9",
    title: "Sewer Line Inspection",
    inspector: "James Wilson",
    inspectorPhone: "(555) 456-7890",
    property: "321 Elm Drive",
    type: "Plumbing",
    date: "Jan 8, 2026",
    time: "3:00 PM",
    status: "passed",
    notes: "Sewer connection and slope verified. Camera inspection completed.",
    priority: "medium",
    projectName: "Elm Drive New Build",
  },
];

const statusConfig: Record<InspectionStatus, { label: string; color: string; bg: string }> = {
  scheduled: { label: "Scheduled", color: "#3B82F6", bg: "#EFF6FF" },
  passed: { label: "Passed", color: "#10B981", bg: "#ECFDF5" },
  failed: { label: "Failed", color: "#EF4444", bg: "#FEF2F2" },
  pending: { label: "Pending", color: "#272D53", bg: "#E8E9EE" },
  in_progress: { label: "In Progress", color: "#8B5CF6", bg: "#F5F3FF" },
};

const filters = ["All", "Scheduled", "In Progress", "Passed", "Failed", "Pending"];

const getInspectionTypeColors = (type: string) => {
  switch (type) {
    case "Structural": return { bg: "#DBEAFE", color: "#2563EB" };
    case "Electrical": return { bg: "#E8E9EE", color: "#D97706" };
    case "Plumbing": return { bg: "#E0E7FF", color: "#4F46E5" };
    case "Mechanical": return { bg: "#FCE7F3", color: "#DB2777" };
    case "General": return { bg: "#F3F4F6", color: "#6B7280" };
    case "Energy": return { bg: "#D1FAE5", color: "#059669" };
    case "Fire Safety": return { bg: "#FEE2E2", color: "#DC2626" };
    default: return { bg: "#F3F4F6", color: "#6B7280" };
  }
};

const priorityConfig = {
  low: { label: "Low", color: "#6B7280", bg: "#F3F4F6" },
  medium: { label: "Medium", color: "#272D53", bg: "#E8E9EE" },
  high: { label: "High", color: "#EF4444", bg: "#FEF2F2" },
};

export default function InspectionsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);

  const stats = useMemo(() => ({
    total: mockInspections.length,
    scheduled: mockInspections.filter((i) => i.status === "scheduled").length,
    passed: mockInspections.filter((i) => i.status === "passed").length,
    failed: mockInspections.filter((i) => i.status === "failed").length,
  }), []);

  const filtered = useMemo(() => {
    return mockInspections.filter((i) => {
      const matchesSearch =
        i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.inspector.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.projectName.toLowerCase().includes(searchQuery.toLowerCase());
      const filterMap: Record<string, string> = {
        Scheduled: "scheduled",
        "In Progress": "in_progress",
        Passed: "passed",
        Failed: "failed",
        Pending: "pending",
      };
      const matchesFilter = selectedFilter === "All" || i.status === filterMap[selectedFilter];
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, selectedFilter]);

  const upcomingCount = useMemo(() => {
    return mockInspections.filter((i) => i.status === "scheduled" || i.status === "in_progress").length;
  }, []);

  const renderInspectionCard = useCallback((inspection: Inspection) => {
    const cfg = statusConfig[inspection.status];
    const typeColors = getInspectionTypeColors(inspection.type);
    const priCfg = priorityConfig[inspection.priority];

    return (
      <TouchableOpacity
        key={inspection.id}
        style={[styles.card, { backgroundColor: theme.surface }]}
        activeOpacity={0.7}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setSelectedInspection(inspection);
        }}
        testID={`inspection-card-${inspection.id}`}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconCircle, { backgroundColor: typeColors.bg }]}>
            <ClipboardCheck size={20} color={typeColors.color} strokeWidth={1.5} />
          </View>
          <View style={styles.cardBadges}>
            {inspection.priority === "high" && (
              <View style={[styles.priorityBadge, { backgroundColor: priCfg.bg }]}>
                <Text style={[styles.priorityText, { color: priCfg.color }]}>!</Text>
              </View>
            )}
            <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
              <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
            </View>
          </View>
        </View>
        <Text style={[styles.cardTitle, { color: theme.text }]}>{inspection.title}</Text>
        <View style={[styles.typeBadge, { backgroundColor: theme.surfaceSecondary, alignSelf: "flex-start" as const, marginBottom: 10 }]}>
          <Text style={[styles.typeText, { color: theme.textSecondary }]}>{inspection.type}</Text>
        </View>
        <View style={styles.cardMetaRow}>
          <MapPin size={13} color={theme.textTertiary} strokeWidth={1.5} />
          <Text style={[styles.metaText, { color: theme.textTertiary }]}>{inspection.property}</Text>
        </View>
        <View style={styles.cardMetaRow}>
          <User size={13} color={theme.textTertiary} strokeWidth={1.5} />
          <Text style={[styles.metaText, { color: theme.textTertiary }]}>{inspection.inspector}</Text>
        </View>
        <View style={styles.cardMetaRow}>
          <Calendar size={13} color={theme.textTertiary} strokeWidth={1.5} />
          <Text style={[styles.metaText, { color: theme.textSecondary }]}>
            {inspection.date} at {inspection.time}
          </Text>
        </View>
        {inspection.status === "failed" && inspection.corrections && (
          <View style={[styles.failedBanner, { backgroundColor: "#FEE2E2" }]}>
            <AlertCircle size={14} color="#DC2626" strokeWidth={1.5} />
            <Text style={styles.failedBannerText}>
              {inspection.corrections.length} correction{inspection.corrections.length !== 1 ? "s" : ""} required
            </Text>
          </View>
        )}
        {inspection.permitRef && (
          <View style={[styles.permitRefStrip, { backgroundColor: theme.surfaceSecondary }]}>
            <FileCheck size={12} color={theme.textTertiary} strokeWidth={1.5} />
            <Text style={[styles.permitRefText, { color: theme.textSecondary }]}>{inspection.permitRef}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }, [theme]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.header}>
          <BackButton />
          <Text style={[styles.headerTitle, { color: theme.text }]}>Inspections</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.statValue, { color: "#3B82F6" }]}>{stats.scheduled}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Scheduled</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.statValue, { color: "#10B981" }]}>{stats.passed}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Passed</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.statValue, { color: "#EF4444" }]}>{stats.failed}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Failed</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.statValue, { color: theme.navy }]}>{stats.total}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total</Text>
          </View>
        </View>

        {upcomingCount > 0 && (
          <View style={[styles.upcomingBanner, { backgroundColor: "#EFF6FF" }]}>
            <Clock size={16} color="#2563EB" strokeWidth={1.5} />
            <Text style={styles.upcomingText}>
              {upcomingCount} upcoming inspection{upcomingCount !== 1 ? "s" : ""} this month
            </Text>
          </View>
        )}

        <View style={styles.searchRow}>
          <View style={[styles.searchBox, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
            <Search size={18} color={theme.textTertiary} strokeWidth={1.5} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Search inspections, inspectors..."
              placeholderTextColor={theme.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              testID="search-input"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")} testID="clear-search">
                <X size={18} color={theme.textTertiary} strokeWidth={1.5} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Inspections</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
          <TouchableOpacity
            style={[styles.addFilterBtn, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}
            onPress={() => router.push("/add-inspection")}
          >
            <Plus size={18} color={theme.textSecondary} strokeWidth={2} />
          </TouchableOpacity>
          {filters.map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterChip,
                { backgroundColor: theme.surface, borderColor: theme.border },
                selectedFilter === f && { backgroundColor: theme.navy, borderColor: theme.navy },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedFilter(f);
              }}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: theme.textSecondary },
                  selectedFilter === f && { color: "#FFFFFF" },
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
          </ScrollView>
        </View>

        <Text style={[styles.countLabel, { color: theme.textSecondary }]}>
          {filtered.length} inspection{filtered.length !== 1 ? "s" : ""}
        </Text>

        <ScrollView
          style={styles.list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <ClipboardCheck size={48} color={theme.textTertiary} strokeWidth={1} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No inspections found</Text>
              <Text style={[styles.emptySubtitle, { color: theme.textTertiary }]}>
                Try adjusting your search or filters
              </Text>
            </View>
          ) : (
            filtered.map(renderInspectionCard)
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>

      <Modal visible={selectedInspection !== null} animationType="slide" presentationStyle="pageSheet">
        {selectedInspection && (
          <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
            <View style={[styles.modalHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
              <TouchableOpacity onPress={() => setSelectedInspection(null)} testID="close-inspection-modal">
                <X size={24} color={theme.text} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Inspection Details</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
                <View style={styles.modalCardHeader}>
                  <View style={[styles.typeBadge, { backgroundColor: theme.surfaceSecondary }]}>
                    <Text style={[styles.typeText, { color: theme.textSecondary }]}>{selectedInspection.type}</Text>
                  </View>
                  <View style={styles.modalBadgeRow}>
                    <View style={[styles.priorityBadgeLg, { backgroundColor: priorityConfig[selectedInspection.priority].bg }]}>
                      <Text style={[styles.priorityTextLg, { color: priorityConfig[selectedInspection.priority].color }]}>
                        {priorityConfig[selectedInspection.priority].label}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusConfig[selectedInspection.status].bg }]}>
                      <Text style={[styles.statusText, { color: statusConfig[selectedInspection.status].color }]}>
                        {statusConfig[selectedInspection.status].label}
                      </Text>
                    </View>
                  </View>
                </View>
                <Text style={[styles.modalCardTitle, { color: theme.text }]}>{selectedInspection.title}</Text>
                <Text style={[styles.modalProjectName, { color: theme.textSecondary }]}>{selectedInspection.projectName}</Text>
                <View style={styles.modalMetaRow}>
                  <MapPin size={16} color={theme.textSecondary} strokeWidth={1.5} />
                  <Text style={[styles.modalMetaText, { color: theme.textSecondary }]}>{selectedInspection.property}</Text>
                </View>
              </View>

              <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
                <Text style={[styles.modalSectionTitle, { color: theme.text }]}>Schedule</Text>
                <View style={styles.scheduleRow}>
                  <View style={[styles.scheduleIcon, { backgroundColor: "#EFF6FF" }]}>
                    <Calendar size={20} color="#3B82F6" strokeWidth={1.5} />
                  </View>
                  <View>
                    <Text style={[styles.scheduleDate, { color: theme.text }]}>{selectedInspection.date}</Text>
                    <Text style={[styles.scheduleTime, { color: theme.textSecondary }]}>{selectedInspection.time}</Text>
                  </View>
                </View>
              </View>

              <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
                <Text style={[styles.modalSectionTitle, { color: theme.text }]}>Inspector</Text>
                <View style={styles.inspectorRow}>
                  <View style={[styles.inspectorAvatar, { backgroundColor: "#3B82F6" }]}>
                    <User size={20} color="#FFFFFF" strokeWidth={1.5} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inspectorName, { color: theme.text }]}>{selectedInspection.inspector}</Text>
                    {selectedInspection.inspectorPhone && (
                      <Text style={[styles.inspectorPhone, { color: theme.textSecondary }]}>{selectedInspection.inspectorPhone}</Text>
                    )}
                  </View>
                  {selectedInspection.inspectorPhone && (
                    <TouchableOpacity
                      style={styles.callBtn}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        const phoneUrl = `tel:${selectedInspection.inspectorPhone?.replace(/\D/g, "")}`;
                        Linking.canOpenURL(phoneUrl).then((supported) => {
                          if (supported) {
                            Linking.openURL(phoneUrl);
                          } else {
                            Alert.alert("Call Inspector", `Call ${selectedInspection.inspector} at ${selectedInspection.inspectorPhone}`);
                          }
                        });
                      }}
                    >
                      <Phone size={16} color="#FFFFFF" strokeWidth={2} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {selectedInspection.notes && (
                <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
                  <Text style={[styles.modalSectionTitle, { color: theme.text }]}>Notes</Text>
                  <Text style={[styles.modalNotes, { color: theme.textSecondary }]}>{selectedInspection.notes}</Text>
                </View>
              )}

              {selectedInspection.status === "failed" && selectedInspection.corrections && (
                <View style={[styles.modalCard, { backgroundColor: "#FEF2F2" }]}>
                  <View style={styles.correctionsHeader}>
                    <XCircle size={18} color="#DC2626" strokeWidth={1.5} />
                    <Text style={styles.correctionsTitle}>Required Corrections</Text>
                  </View>
                  {selectedInspection.corrections.map((correction, index) => (
                    <View key={index} style={styles.correctionItem}>
                      <View style={styles.correctionBullet} />
                      <Text style={styles.correctionText}>{correction}</Text>
                    </View>
                  ))}
                  <TouchableOpacity
                    style={styles.rescheduleBtn}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      Alert.alert("Reschedule", "This would open the rescheduling form.");
                    }}
                  >
                    <Text style={styles.rescheduleBtnText}>Reschedule Inspection</Text>
                  </TouchableOpacity>
                </View>
              )}

              {selectedInspection.permitRef && (
                <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
                  <Text style={[styles.modalSectionTitle, { color: theme.text }]}>Linked Permit</Text>
                  <TouchableOpacity style={styles.linkedPermitRow} activeOpacity={0.7}>
                    <FileCheck size={18} color={theme.textSecondary} strokeWidth={1.5} />
                    <Text style={[styles.linkedPermitText, { color: theme.text }]}>{selectedInspection.permitRef}</Text>
                    <ChevronRight size={18} color={theme.textTertiary} strokeWidth={1.5} />
                  </TouchableOpacity>
                </View>
              )}

              {(selectedInspection.status === "scheduled" || selectedInspection.status === "in_progress") && (
                <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
                  <Text style={[styles.modalSectionTitle, { color: theme.text }]}>Quick Actions</Text>
                  <View style={styles.actionsRow}>
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: theme.surfaceSecondary }]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        Alert.alert("Photos", "This would open the camera for documentation.");
                      }}
                    >
                      <Camera size={20} color={theme.navy} strokeWidth={1.5} />
                      <Text style={[styles.actionBtnText, { color: theme.text }]}>Add Photos</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: theme.surfaceSecondary }]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        Alert.alert("Message", "This would open a message to the inspector.");
                      }}
                    >
                      <MessageSquare size={20} color={theme.navy} strokeWidth={1.5} />
                      <Text style={[styles.actionBtnText, { color: theme.text }]}>Message</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <View style={{ height: 40 }} />
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 14,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700" as const,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "500" as const,
    marginTop: 2,
  },
  upcomingBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  upcomingText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#1D4ED8",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
  },
  section: {
    marginBottom: 0,
  },
  sectionHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
  filterContainer: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  addFilterBtn: {
    width: 40,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500" as const,
  },
  countLabel: {
    paddingHorizontal: 16,
    fontSize: 13,
    fontWeight: "500" as const,
    marginBottom: 10,
  },
  list: { flex: 1 },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },
  card: {
    borderRadius: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardBadges: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  priorityBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  priorityText: {
    fontSize: 14,
    fontWeight: "700" as const,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginBottom: 6,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 12,
    fontWeight: "500" as const,
  },
  cardMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  metaText: {
    fontSize: 13,
  },
  failedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 10,
  },
  failedBannerText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "#991B1B",
  },
  permitRefStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  permitRefText: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "600" as const,
    marginTop: 4,
  },
  emptySubtitle: {
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  modalCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modalBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  priorityBadgeLg: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  priorityTextLg: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  modalCardTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    marginBottom: 4,
  },
  modalProjectName: {
    fontSize: 14,
    marginBottom: 12,
  },
  modalMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  modalMetaText: {
    fontSize: 14,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginBottom: 12,
  },
  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  scheduleIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  scheduleDate: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  scheduleTime: {
    fontSize: 14,
    marginTop: 2,
  },
  inspectorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  inspectorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  inspectorName: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  inspectorPhone: {
    fontSize: 13,
    marginTop: 2,
  },
  callBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#22C55E",
    alignItems: "center",
    justifyContent: "center",
  },
  modalNotes: {
    fontSize: 14,
    lineHeight: 20,
  },
  correctionsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  correctionsTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#B91C1C",
  },
  correctionItem: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },
  correctionBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#DC2626",
    marginTop: 6,
  },
  correctionText: {
    flex: 1,
    fontSize: 13,
    color: "#7F1D1D",
    lineHeight: 18,
  },
  rescheduleBtn: {
    backgroundColor: "#DC2626",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  rescheduleBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600" as const,
  },
  linkedPermitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  linkedPermitText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500" as const,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
});
