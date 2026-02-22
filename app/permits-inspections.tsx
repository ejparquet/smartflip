import React, { useState, useMemo, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Animated,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import {
  Search,
  FileCheck,
  ClipboardCheck,
  Calendar,
  MapPin,
  User,
  Plus,
  X,
  AlertCircle,
  XCircle,
  ChevronRight,
  Phone,
  Hash,
  Building2,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import BackButton from "@/components/BackButton";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type PermitStatus = "approved" | "pending" | "expired" | "under_review";
type InspectionStatus = "scheduled" | "passed" | "failed" | "pending";

interface Permit {
  id: string;
  title: string;
  permitNumber: string;
  property: string;
  type: string;
  issuedDate: string;
  expiryDate: string;
  status: PermitStatus;
  fee: number;
  jurisdiction: string;
  notes?: string;
}

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
}

const mockPermits: Permit[] = [
  {
    id: "p1",
    title: "Building Permit",
    permitNumber: "BP-2026-0412",
    property: "123 Oak Street",
    type: "Construction",
    issuedDate: "Jan 10, 2026",
    expiryDate: "Jul 10, 2026",
    status: "approved",
    fee: 1250,
    jurisdiction: "Springfield",
  },
  {
    id: "p2",
    title: "Electrical Permit",
    permitNumber: "EP-2026-0198",
    property: "456 Maple Ave",
    type: "Electrical",
    issuedDate: "Feb 5, 2026",
    expiryDate: "Aug 5, 2026",
    status: "approved",
    fee: 450,
    jurisdiction: "Springfield",
  },
  {
    id: "p3",
    title: "Plumbing Permit",
    permitNumber: "PP-2026-0321",
    property: "123 Oak Street",
    type: "Plumbing",
    issuedDate: "",
    expiryDate: "",
    status: "pending",
    fee: 350,
    jurisdiction: "Springfield",
    notes: "Awaiting plan review from building department",
  },
  {
    id: "p4",
    title: "Demolition Permit",
    permitNumber: "DP-2026-0055",
    property: "789 Pine Blvd",
    type: "Demolition",
    issuedDate: "",
    expiryDate: "",
    status: "under_review",
    fee: 800,
    jurisdiction: "Riverside",
    notes: "Environmental review in progress",
  },
  {
    id: "p5",
    title: "Roofing Permit",
    permitNumber: "RP-2025-0789",
    property: "456 Maple Ave",
    type: "Roofing",
    issuedDate: "Jun 1, 2025",
    expiryDate: "Dec 1, 2025",
    status: "expired",
    fee: 275,
    jurisdiction: "Springfield",
  },
  {
    id: "p6",
    title: "HVAC Permit",
    permitNumber: "HP-2026-0067",
    property: "321 Elm Drive",
    type: "Mechanical",
    issuedDate: "Feb 8, 2026",
    expiryDate: "Aug 8, 2026",
    status: "approved",
    fee: 500,
    jurisdiction: "Riverside",
  },
];

const mockInspections: Inspection[] = [
  {
    id: "i1",
    title: "Framing Inspection",
    inspector: "Robert Chen",
    inspectorPhone: "(555) 234-5678",
    property: "123 Oak Street",
    type: "Structural",
    date: "Feb 12, 2026",
    time: "9:00 AM",
    status: "scheduled",
    notes: "Ensure all framing is complete before inspection",
    permitRef: "BP-2026-0412",
  },
  {
    id: "i2",
    title: "Electrical Rough-In",
    inspector: "Maria Lopez",
    inspectorPhone: "(555) 345-6789",
    property: "456 Maple Ave",
    type: "Electrical",
    date: "Feb 18, 2026",
    time: "10:30 AM",
    status: "scheduled",
    notes: "Panel must be labeled",
    permitRef: "EP-2026-0198",
  },
  {
    id: "i3",
    title: "Foundation Inspection",
    inspector: "James Wilson",
    inspectorPhone: "(555) 456-7890",
    property: "123 Oak Street",
    type: "Structural",
    date: "Jan 20, 2026",
    time: "8:00 AM",
    status: "passed",
    notes: "All requirements met",
    permitRef: "BP-2026-0412",
  },
  {
    id: "i4",
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
  },
  {
    id: "i5",
    title: "Final Walkthrough",
    inspector: "TBD",
    property: "456 Maple Ave",
    type: "General",
    date: "TBD",
    time: "TBD",
    status: "pending",
    notes: "Awaiting completion of all prior inspections",
  },
  {
    id: "i6",
    title: "HVAC Ductwork Inspection",
    inspector: "David Park",
    inspectorPhone: "(555) 678-9012",
    property: "321 Elm Drive",
    type: "Mechanical",
    date: "Feb 25, 2026",
    time: "11:00 AM",
    status: "scheduled",
    notes: "Verify duct sealing and insulation",
    permitRef: "HP-2026-0067",
  },
];

const permitStatusConfig: Record<PermitStatus, { label: string; color: string; bg: string }> = {
  approved: { label: "Approved", color: "#10B981", bg: "#ECFDF5" },
  pending: { label: "Pending", color: "#272D53", bg: "#E8E9EE" },
  expired: { label: "Expired", color: "#EF4444", bg: "#FEF2F2" },
  under_review: { label: "Under Review", color: "#6366F1", bg: "#EEF2FF" },
};

const inspectionStatusConfig: Record<InspectionStatus, { label: string; color: string; bg: string }> = {
  scheduled: { label: "Scheduled", color: "#3B82F6", bg: "#EFF6FF" },
  passed: { label: "Passed", color: "#10B981", bg: "#ECFDF5" },
  failed: { label: "Failed", color: "#EF4444", bg: "#FEF2F2" },
  pending: { label: "Pending", color: "#272D53", bg: "#E8E9EE" },
};

const permitFilters = ["All", "Approved", "Pending", "Under Review", "Expired"];
const inspectionFilters = ["All", "Scheduled", "Passed", "Failed", "Pending"];

type ActiveTab = "permits" | "inspections";

export default function PermitsInspectionsScreen() {
  useRouter();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<ActiveTab>("permits");
  const [searchQuery, setSearchQuery] = useState("");
  const [permitFilter, setPermitFilter] = useState("All");
  const [inspectionFilter, setInspectionFilter] = useState("All");
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [selectedPermit, setSelectedPermit] = useState<Permit | null>(null);

  const tabIndicator = useRef(new Animated.Value(0)).current;

  const switchTab = useCallback((tab: ActiveTab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
    setSearchQuery("");
    Animated.spring(tabIndicator, {
      toValue: tab === "permits" ? 0 : 1,
      useNativeDriver: true,
      tension: 300,
      friction: 30,
    }).start();
  }, [tabIndicator]);

  const permitStats = useMemo(() => ({
    total: mockPermits.length,
    approved: mockPermits.filter((p) => p.status === "approved").length,
    pending: mockPermits.filter((p) => p.status === "pending" || p.status === "under_review").length,
    expired: mockPermits.filter((p) => p.status === "expired").length,
  }), []);

  const inspectionStats = useMemo(() => ({
    total: mockInspections.length,
    scheduled: mockInspections.filter((i) => i.status === "scheduled").length,
    passed: mockInspections.filter((i) => i.status === "passed").length,
    failed: mockInspections.filter((i) => i.status === "failed").length,
  }), []);

  const filteredPermits = useMemo(() => {
    return mockPermits.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.permitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.property.toLowerCase().includes(searchQuery.toLowerCase());
      const filterMap: Record<string, string> = {
        Approved: "approved",
        Pending: "pending",
        "Under Review": "under_review",
        Expired: "expired",
      };
      const matchesFilter = permitFilter === "All" || p.status === filterMap[permitFilter];
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, permitFilter]);

  const filteredInspections = useMemo(() => {
    return mockInspections.filter((i) => {
      const matchesSearch =
        i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.inspector.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter =
        inspectionFilter === "All" || i.status === inspectionFilter.toLowerCase();
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, inspectionFilter]);

  const tabWidth = (SCREEN_WIDTH - 48) / 2;
  const indicatorTranslateX = tabIndicator.interpolate({
    inputRange: [0, 1],
    outputRange: [0, tabWidth],
  });

  const getPermitTypeIcon = useCallback((type: string) => {
    switch (type) {
      case "Construction": return { bg: "#DBEAFE", color: "#2563EB" };
      case "Electrical": return { bg: "#E8E9EE", color: "#D97706" };
      case "Plumbing": return { bg: "#E0E7FF", color: "#4F46E5" };
      case "Demolition": return { bg: "#FEE2E2", color: "#DC2626" };
      case "Roofing": return { bg: "#D1FAE5", color: "#059669" };
      case "Mechanical": return { bg: "#FCE7F3", color: "#DB2777" };
      default: return { bg: "#F3F4F6", color: "#6B7280" };
    }
  }, []);

  const getInspectionTypeIcon = useCallback((type: string) => {
    switch (type) {
      case "Structural": return { bg: "#DBEAFE", color: "#2563EB" };
      case "Electrical": return { bg: "#E8E9EE", color: "#D97706" };
      case "Plumbing": return { bg: "#E0E7FF", color: "#4F46E5" };
      case "Mechanical": return { bg: "#FCE7F3", color: "#DB2777" };
      case "General": return { bg: "#F3F4F6", color: "#6B7280" };
      default: return { bg: "#F3F4F6", color: "#6B7280" };
    }
  }, []);

  const renderPermitCard = useCallback((permit: Permit) => {
    const cfg = permitStatusConfig[permit.status];
    const typeColors = getPermitTypeIcon(permit.type);

    return (
      <TouchableOpacity
        key={permit.id}
        style={[styles.card, { backgroundColor: theme.surface }]}
        activeOpacity={0.7}
        onPress={() => setSelectedPermit(permit)}
        testID={`permit-card-${permit.id}`}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconCircle, { backgroundColor: typeColors.bg }]}>
            <FileCheck size={20} color={typeColors.color} strokeWidth={1.5} />
          </View>
          <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>
        <Text style={[styles.cardTitle, { color: theme.text }]}>{permit.title}</Text>
        <View style={styles.permitNumberRow}>
          <Hash size={12} color={theme.textTertiary} strokeWidth={1.5} />
          <Text style={[styles.permitNumber, { color: theme.textSecondary }]}>{permit.permitNumber}</Text>
        </View>
        <View style={styles.cardMetaRow}>
          <MapPin size={13} color={theme.textTertiary} strokeWidth={1.5} />
          <Text style={[styles.metaText, { color: theme.textTertiary }]}>{permit.property}</Text>
        </View>
        <View style={styles.cardFooter}>
          <View style={[styles.typeBadge, { backgroundColor: theme.surfaceSecondary }]}>
            <Text style={[styles.typeText, { color: theme.textSecondary }]}>{permit.type}</Text>
          </View>
          {permit.issuedDate ? (
            <View style={styles.dateRow}>
              <Calendar size={12} color={theme.textTertiary} strokeWidth={1.5} />
              <Text style={[styles.dateText, { color: theme.textSecondary }]}>{permit.expiryDate}</Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  }, [theme, getPermitTypeIcon]);

  const renderInspectionCard = useCallback((inspection: Inspection) => {
    const cfg = inspectionStatusConfig[inspection.status];
    const typeColors = getInspectionTypeIcon(inspection.type);

    return (
      <TouchableOpacity
        key={inspection.id}
        style={[styles.card, { backgroundColor: theme.surface }]}
        activeOpacity={0.7}
        onPress={() => setSelectedInspection(inspection)}
        testID={`inspection-card-${inspection.id}`}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconCircle, { backgroundColor: typeColors.bg }]}>
            <ClipboardCheck size={20} color={typeColors.color} strokeWidth={1.5} />
          </View>
          <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
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
        {inspection.notes ? (
          <Text style={[styles.notePreview, { color: theme.textTertiary }]} numberOfLines={1}>
            {inspection.notes}
          </Text>
        ) : null}
      </TouchableOpacity>
    );
  }, [theme, getInspectionTypeIcon]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.header}>
          <BackButton />
          <Text style={[styles.headerTitle, { color: theme.text }]}>Permits & Inspections</Text>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: theme.navy }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              Alert.alert(
                "New Entry",
                "What would you like to add?",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Permit", onPress: () => console.log("Add permit") },
                  { text: "Inspection", onPress: () => console.log("Add inspection") },
                ]
              );
            }}
            testID="add-button"
          >
            <Plus size={20} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          {activeTab === "permits" ? (
            <>
              <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
                <Text style={[styles.statValue, { color: "#10B981" }]}>{permitStats.approved}</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Approved</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
                <Text style={[styles.statValue, { color: "#272D53" }]}>{permitStats.pending}</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Pending</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
                <Text style={[styles.statValue, { color: "#EF4444" }]}>{permitStats.expired}</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Expired</Text>
              </View>
            </>
          ) : (
            <>
              <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
                <Text style={[styles.statValue, { color: "#3B82F6" }]}>{inspectionStats.scheduled}</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Scheduled</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
                <Text style={[styles.statValue, { color: "#10B981" }]}>{inspectionStats.passed}</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Passed</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
                <Text style={[styles.statValue, { color: "#EF4444" }]}>{inspectionStats.failed}</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Failed</Text>
              </View>
            </>
          )}
        </View>

        <View style={[styles.tabContainer, { backgroundColor: theme.surfaceSecondary }]}>
          <Animated.View
            style={[
              styles.tabIndicator,
              {
                backgroundColor: theme.navy,
                width: tabWidth,
                transform: [{ translateX: indicatorTranslateX }],
              },
            ]}
          />
          <TouchableOpacity
            style={styles.tab}
            onPress={() => switchTab("permits")}
            activeOpacity={0.7}
            testID="permits-tab"
          >
            <FileCheck size={16} color={activeTab === "permits" ? "#FFFFFF" : theme.textSecondary} strokeWidth={1.5} />
            <Text style={[styles.tabText, activeTab === "permits" ? styles.tabTextActive : { color: theme.textSecondary }]}>
              Permits
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => switchTab("inspections")}
            activeOpacity={0.7}
            testID="inspections-tab"
          >
            <ClipboardCheck size={16} color={activeTab === "inspections" ? "#FFFFFF" : theme.textSecondary} strokeWidth={1.5} />
            <Text style={[styles.tabText, activeTab === "inspections" ? styles.tabTextActive : { color: theme.textSecondary }]}>
              Inspections
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchRow}>
          <View style={[styles.searchBox, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
            <Search size={18} color={theme.textTertiary} strokeWidth={1.5} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder={activeTab === "permits" ? "Search permits..." : "Search inspections..."}
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

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {(activeTab === "permits" ? permitFilters : inspectionFilters).map((f) => {
            const isSelected = activeTab === "permits" ? permitFilter === f : inspectionFilter === f;
            return (
              <TouchableOpacity
                key={f}
                style={[
                  styles.filterChip,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                  isSelected && { backgroundColor: theme.navy, borderColor: theme.navy },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (activeTab === "permits") {
                    setPermitFilter(f);
                  } else {
                    setInspectionFilter(f);
                  }
                }}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: theme.textSecondary },
                    isSelected && { color: "#FFFFFF" },
                  ]}
                >
                  {f}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={[styles.countLabel, { color: theme.textSecondary }]}>
          {activeTab === "permits"
            ? `${filteredPermits.length} permit${filteredPermits.length !== 1 ? "s" : ""}`
            : `${filteredInspections.length} inspection${filteredInspections.length !== 1 ? "s" : ""}`}
        </Text>

        <ScrollView
          style={styles.list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {activeTab === "permits" ? (
            filteredPermits.length === 0 ? (
              <View style={styles.emptyState}>
                <FileCheck size={48} color={theme.textTertiary} strokeWidth={1} />
                <Text style={[styles.emptyTitle, { color: theme.text }]}>No permits found</Text>
                <Text style={[styles.emptySubtitle, { color: theme.textTertiary }]}>
                  Try adjusting your search or filters
                </Text>
              </View>
            ) : (
              filteredPermits.map(renderPermitCard)
            )
          ) : filteredInspections.length === 0 ? (
            <View style={styles.emptyState}>
              <ClipboardCheck size={48} color={theme.textTertiary} strokeWidth={1} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No inspections found</Text>
              <Text style={[styles.emptySubtitle, { color: theme.textTertiary }]}>
                Try adjusting your search or filters
              </Text>
            </View>
          ) : (
            filteredInspections.map(renderInspectionCard)
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>

      <Modal visible={selectedPermit !== null} animationType="slide" presentationStyle="pageSheet">
        {selectedPermit && (
          <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
            <View style={[styles.modalHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
              <TouchableOpacity onPress={() => setSelectedPermit(null)} testID="close-permit-modal">
                <X size={24} color={theme.text} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Permit Details</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
                <View style={styles.modalCardHeader}>
                  <Text style={[styles.modalPermitNumber, { color: theme.textSecondary }]}>{selectedPermit.permitNumber}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: permitStatusConfig[selectedPermit.status].bg }]}>
                    <Text style={[styles.statusText, { color: permitStatusConfig[selectedPermit.status].color }]}>
                      {permitStatusConfig[selectedPermit.status].label}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.modalCardTitle, { color: theme.text }]}>{selectedPermit.title}</Text>
                <View style={styles.modalMetaRow}>
                  <MapPin size={16} color={theme.textSecondary} strokeWidth={1.5} />
                  <Text style={[styles.modalMetaText, { color: theme.textSecondary }]}>{selectedPermit.property}</Text>
                </View>
                <View style={styles.modalMetaRow}>
                  <Building2 size={16} color={theme.textSecondary} strokeWidth={1.5} />
                  <Text style={[styles.modalMetaText, { color: theme.textSecondary }]}>{selectedPermit.jurisdiction}</Text>
                </View>
              </View>

              <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
                <Text style={[styles.modalSectionTitle, { color: theme.text }]}>Details</Text>
                <View style={styles.detailGrid}>
                  <View style={styles.detailItem}>
                    <Text style={[styles.detailLabel, { color: theme.textTertiary }]}>Type</Text>
                    <Text style={[styles.detailValue, { color: theme.text }]}>{selectedPermit.type}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={[styles.detailLabel, { color: theme.textTertiary }]}>Fee</Text>
                    <Text style={[styles.detailValue, { color: theme.text }]}>${selectedPermit.fee.toLocaleString()}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={[styles.detailLabel, { color: theme.textTertiary }]}>Issued</Text>
                    <Text style={[styles.detailValue, { color: theme.text }]}>{selectedPermit.issuedDate || "—"}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={[styles.detailLabel, { color: theme.textTertiary }]}>Expires</Text>
                    <Text style={[styles.detailValue, { color: theme.text }]}>{selectedPermit.expiryDate || "—"}</Text>
                  </View>
                </View>
              </View>

              {selectedPermit.notes && (
                <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
                  <Text style={[styles.modalSectionTitle, { color: theme.text }]}>Notes</Text>
                  <Text style={[styles.modalNotes, { color: theme.textSecondary }]}>{selectedPermit.notes}</Text>
                </View>
              )}

              {(() => {
                const relatedInspections = mockInspections.filter((i) => i.permitRef === selectedPermit.permitNumber);
                if (relatedInspections.length === 0) return null;
                return (
                  <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.modalSectionTitle, { color: theme.text }]}>Related Inspections</Text>
                    {relatedInspections.map((ins) => {
                      const insCfg = inspectionStatusConfig[ins.status];
                      return (
                        <View key={ins.id} style={[styles.relatedItem, { borderBottomColor: theme.borderLight }]}>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.relatedTitle, { color: theme.text }]}>{ins.title}</Text>
                            <Text style={[styles.relatedDate, { color: theme.textTertiary }]}>{ins.date} at {ins.time}</Text>
                          </View>
                          <View style={[styles.statusBadge, { backgroundColor: insCfg.bg }]}>
                            <Text style={[styles.statusText, { color: insCfg.color }]}>{insCfg.label}</Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                );
              })()}

              <View style={{ height: 40 }} />
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>

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
                  <View style={[styles.statusBadge, { backgroundColor: inspectionStatusConfig[selectedInspection.status].bg }]}>
                    <Text style={[styles.statusText, { color: inspectionStatusConfig[selectedInspection.status].color }]}>
                      {inspectionStatusConfig[selectedInspection.status].label}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.modalCardTitle, { color: theme.text }]}>{selectedInspection.title}</Text>
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
                        Alert.alert("Call Inspector", `Call ${selectedInspection.inspector}?`);
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
                </View>
              )}

              {selectedInspection.permitRef && (
                <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
                  <Text style={[styles.modalSectionTitle, { color: theme.text }]}>Linked Permit</Text>
                  <View style={styles.linkedPermitRow}>
                    <FileCheck size={18} color={theme.textSecondary} strokeWidth={1.5} />
                    <Text style={[styles.linkedPermitText, { color: theme.text }]}>{selectedInspection.permitRef}</Text>
                    <ChevronRight size={18} color={theme.textTertiary} strokeWidth={1.5} />
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
    fontSize: 18,
    fontWeight: "700" as const,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 14,
    alignItems: "center",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700" as const,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "500" as const,
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 4,
    marginBottom: 14,
    position: "relative" as const,
  },
  tabIndicator: {
    position: "absolute" as const,
    top: 4,
    left: 4,
    height: 40,
    borderRadius: 11,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    gap: 6,
    zIndex: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  tabTextActive: {
    color: "#FFFFFF",
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
  filterContainer: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
    paddingVertical: 2,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#6B7280",
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
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
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
  permitNumberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  permitNumber: {
    fontSize: 13,
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
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
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
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateText: {
    fontSize: 12,
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
  notePreview: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: "italic" as const,
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
  modalPermitNumber: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  modalCardTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
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
  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  detailItem: {
    width: "45%" as any,
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  modalNotes: {
    fontSize: 14,
    lineHeight: 20,
  },
  relatedItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  relatedTitle: {
    fontSize: 15,
    fontWeight: "500" as const,
  },
  relatedDate: {
    fontSize: 13,
    marginTop: 2,
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
});
