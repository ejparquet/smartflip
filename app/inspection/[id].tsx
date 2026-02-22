import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ClipboardCheck,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  MapPin,
  Share2,
  MoreVertical,
  FileText,
  Phone,
  Mail,
  AlertTriangle,
  Camera,
  Shield,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import BackButton from "@/components/BackButton";

interface InspectionChecklist {
  id: string;
  item: string;
  status: "pass" | "fail" | "na" | "pending";
  notes?: string;
}

interface InspectionPhoto {
  id: string;
  description: string;
  timestamp: string;
}

interface InspectionComment {
  id: string;
  author: string;
  text: string;
  date: string;
}

interface InspectionDocument {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedDate: string;
}

interface InspectionDetail {
  id: string;
  title: string;
  inspector: string;
  inspectorPhone: string;
  inspectorEmail: string;
  property: string;
  propertyAddress: string;
  type: string;
  date: string;
  time: string;
  status: "scheduled" | "passed" | "failed" | "pending";
  notes: string;
  description: string;
  permitNumber: string;
  checklist: InspectionChecklist[];
  photos: InspectionPhoto[];
  comments: InspectionComment[];
  documents: InspectionDocument[];
}

const mockInspectionDetails: Record<string, InspectionDetail> = {
  "1": {
    id: "1",
    title: "Framing Inspection",
    inspector: "Robert Chen",
    inspectorPhone: "(555) 123-4567",
    inspectorEmail: "rchen@cityinspections.gov",
    property: "123 Oak Street",
    propertyAddress: "123 Oak Street, Austin, TX 78701",
    type: "Structural",
    date: "Feb 12, 2026",
    time: "9:00 AM",
    status: "scheduled",
    notes: "Ensure all framing is complete before inspection",
    description: "Full structural framing inspection including load-bearing walls, headers, joists, and roof framing. All work must conform to approved plans and IRC 2021 requirements.",
    permitNumber: "BP-2026-0412",
    checklist: [
      { id: "c1", item: "Wall framing per approved plans", status: "pending" },
      { id: "c2", item: "Headers sized per engineering", status: "pending" },
      { id: "c3", item: "Joist hangers properly installed", status: "pending" },
      { id: "c4", item: "Fire blocking in place", status: "pending" },
      { id: "c5", item: "Bracing and sheathing per code", status: "pending" },
      { id: "c6", item: "Nailing patterns correct", status: "pending" },
    ],
    photos: [],
    comments: [
      { id: "cm1", author: "Robert Smith", text: "Framing is 95% complete. Waiting on steel beam delivery for kitchen header.", date: "Feb 8, 2026" },
      { id: "cm2", author: "Robert Chen", text: "Will need to verify beam installation before approval. Please have engineering calcs on site.", date: "Feb 9, 2026" },
    ],
    documents: [
      { id: "d1", name: "Approved Structural Plans.pdf", type: "PDF", size: "8.2 MB", uploadedDate: "Jan 10, 2026" },
      { id: "d2", name: "Engineering Calculations.pdf", type: "PDF", size: "2.4 MB", uploadedDate: "Jan 8, 2026" },
    ],
  },
  "2": {
    id: "2",
    title: "Electrical Rough-In",
    inspector: "Maria Lopez",
    inspectorPhone: "(555) 234-5678",
    inspectorEmail: "mlopez@cityinspections.gov",
    property: "456 Maple Ave",
    propertyAddress: "456 Maple Ave, Austin, TX 78702",
    type: "Electrical",
    date: "Feb 18, 2026",
    time: "10:30 AM",
    status: "scheduled",
    notes: "Panel must be labeled",
    description: "Electrical rough-in inspection covering all wiring, boxes, panel connections, and grounding. NEC 2023 compliance required.",
    permitNumber: "EP-2026-0198",
    checklist: [
      { id: "c1", item: "Panel properly grounded", status: "pending" },
      { id: "c2", item: "Wire sizing per load calculations", status: "pending" },
      { id: "c3", item: "AFCI/GFCI protection where required", status: "pending" },
      { id: "c4", item: "Box fill calculations met", status: "pending" },
      { id: "c5", item: "Conductor support and stapling", status: "pending" },
    ],
    photos: [],
    comments: [
      { id: "cm1", author: "PowerLine Electric", text: "Rough-in complete. Panel labeled and ready for inspection.", date: "Feb 15, 2026" },
    ],
    documents: [
      { id: "d1", name: "Electrical Plans.pdf", type: "PDF", size: "4.1 MB", uploadedDate: "Feb 1, 2026" },
      { id: "d2", name: "Load Calculations.pdf", type: "PDF", size: "1.2 MB", uploadedDate: "Feb 1, 2026" },
    ],
  },
  "3": {
    id: "3",
    title: "Foundation Inspection",
    inspector: "James Wilson",
    inspectorPhone: "(555) 345-6789",
    inspectorEmail: "jwilson@cityinspections.gov",
    property: "123 Oak Street",
    propertyAddress: "123 Oak Street, Austin, TX 78701",
    type: "Structural",
    date: "Jan 20, 2026",
    time: "8:00 AM",
    status: "passed",
    notes: "All requirements met",
    description: "Foundation inspection for residential renovation. Includes verification of footings, rebar placement, and foundation repair at south wall per engineering specifications.",
    permitNumber: "BP-2026-0412",
    checklist: [
      { id: "c1", item: "Footing dimensions per plan", status: "pass" },
      { id: "c2", item: "Rebar size and spacing", status: "pass" },
      { id: "c3", item: "Foundation repair per engineering", status: "pass" },
      { id: "c4", item: "Drainage and moisture barrier", status: "pass" },
      { id: "c5", item: "Anchor bolts properly placed", status: "pass" },
    ],
    photos: [
      { id: "p1", description: "Foundation footings - north wall", timestamp: "Jan 20, 2026 8:15 AM" },
      { id: "p2", description: "Rebar placement detail", timestamp: "Jan 20, 2026 8:22 AM" },
      { id: "p3", description: "South wall repair", timestamp: "Jan 20, 2026 8:30 AM" },
    ],
    comments: [
      { id: "cm1", author: "James Wilson", text: "Foundation meets all code requirements. Rebar spacing and coverage verified. Approved to proceed with framing.", date: "Jan 20, 2026" },
    ],
    documents: [
      { id: "d1", name: "Foundation Inspection Report.pdf", type: "PDF", size: "1.8 MB", uploadedDate: "Jan 20, 2026" },
      { id: "d2", name: "Structural Engineering Report.pdf", type: "PDF", size: "3.2 MB", uploadedDate: "Dec 10, 2025" },
    ],
  },
  "4": {
    id: "4",
    title: "Plumbing Pressure Test",
    inspector: "Sarah Kim",
    inspectorPhone: "(555) 456-7890",
    inspectorEmail: "skim@cityinspections.gov",
    property: "789 Pine Blvd",
    propertyAddress: "789 Pine Blvd, Austin, TX 78703",
    type: "Plumbing",
    date: "Jan 15, 2026",
    time: "2:00 PM",
    status: "failed",
    notes: "Leak found at kitchen junction - reschedule required",
    description: "Plumbing pressure test for new rough-in installation. System must hold 60 PSI for 15 minutes with no pressure drop. All connections and joints to be verified.",
    permitNumber: "PP-2026-0321",
    checklist: [
      { id: "c1", item: "System pressurized to 60 PSI", status: "pass" },
      { id: "c2", item: "Pressure held for 15 minutes", status: "fail", notes: "Pressure dropped to 42 PSI" },
      { id: "c3", item: "All joints and connections secure", status: "fail", notes: "Leak at kitchen tee junction" },
      { id: "c4", item: "Proper pipe support and hangers", status: "pass" },
      { id: "c5", item: "Cleanout access provided", status: "pass" },
    ],
    photos: [
      { id: "p1", description: "Pressure gauge showing drop", timestamp: "Jan 15, 2026 2:20 PM" },
      { id: "p2", description: "Leak location at kitchen junction", timestamp: "Jan 15, 2026 2:25 PM" },
    ],
    comments: [
      { id: "cm1", author: "Sarah Kim", text: "Failed - leak detected at kitchen tee junction. Pressure dropped from 60 to 42 PSI within 8 minutes. Must repair and reschedule.", date: "Jan 15, 2026" },
      { id: "cm2", author: "AquaFix Plumbing", text: "Will repair the junction and reschedule for next week.", date: "Jan 16, 2026" },
    ],
    documents: [
      { id: "d1", name: "Plumbing Inspection Report.pdf", type: "PDF", size: "1.1 MB", uploadedDate: "Jan 15, 2026" },
      { id: "d2", name: "Failure Notice.pdf", type: "PDF", size: "420 KB", uploadedDate: "Jan 15, 2026" },
    ],
  },
  "5": {
    id: "5",
    title: "Final Walkthrough",
    inspector: "TBD",
    inspectorPhone: "",
    inspectorEmail: "",
    property: "456 Maple Ave",
    propertyAddress: "456 Maple Ave, Austin, TX 78702",
    type: "General",
    date: "TBD",
    time: "TBD",
    status: "pending",
    notes: "Awaiting completion of all prior inspections",
    description: "Final walkthrough inspection to verify all work has been completed per approved plans and all prior inspection items have been addressed. Required before certificate of occupancy.",
    permitNumber: "BP-2026-0412",
    checklist: [
      { id: "c1", item: "All prior inspections passed", status: "pending" },
      { id: "c2", item: "Smoke/CO detectors installed and tested", status: "pending" },
      { id: "c3", item: "Egress windows operational", status: "pending" },
      { id: "c4", item: "Handrails and guardrails per code", status: "pending" },
      { id: "c5", item: "Site cleanup complete", status: "pending" },
    ],
    photos: [],
    comments: [],
    documents: [],
  },
};

const statusConfig = {
  scheduled: { label: "Scheduled", color: "#3B82F6", bg: "#EFF6FF", icon: Clock },
  passed: { label: "Passed", color: "#10B981", bg: "#ECFDF5", icon: CheckCircle },
  failed: { label: "Failed", color: "#EF4444", bg: "#FEF2F2", icon: AlertCircle },
  pending: { label: "Pending", color: "#272D53", bg: "#E8E9EE", icon: AlertTriangle },
};

const checklistStatusConfig: Record<string, { color: string; bg: string; label: string }> = {
  pass: { color: "#10B981", bg: "#ECFDF5", label: "Pass" },
  fail: { color: "#EF4444", bg: "#FEF2F2", label: "Fail" },
  na: { color: "#9CA3AF", bg: "#F3F4F6", label: "N/A" },
  pending: { color: "#272D53", bg: "#E8E9EE", label: "Pending" },
};

type TabKey = "overview" | "checklist" | "comments" | "documents";

const tabs: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "checklist", label: "Checklist" },
  { key: "comments", label: "Comments" },
  { key: "documents", label: "Documents" },
];

export default function InspectionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const scrollY = useRef(new Animated.Value(0)).current;

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const inspection = mockInspectionDetails[id || "1"];

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const cfg = inspection ? statusConfig[inspection.status] : statusConfig.pending;
  const StatusIcon = cfg.icon;

  const passedItems = inspection ? inspection.checklist.filter((c) => c.status === "pass").length : 0;
  const totalItems = inspection ? inspection.checklist.length : 0;

  const renderOverview = useCallback(() => {
    if (!inspection) return null;
    return (
      <View style={styles.tabContent}>
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Description</Text>
          <Text style={[styles.descriptionText, { color: theme.textSecondary }]}>{inspection.description}</Text>
        </View>

        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Inspector</Text>
          <View style={styles.contactCard}>
            <View style={[styles.contactAvatar, { backgroundColor: isDark ? "#1E3A5F" : "#E8F0FE" }]}>
              <User size={22} color={isDark ? "#58A6FF" : "#1E2A3B"} strokeWidth={1.5} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={[styles.contactName, { color: theme.text }]}>{inspection.inspector}</Text>
              <Text style={[styles.contactCompany, { color: theme.textSecondary }]}>City Inspector</Text>
            </View>
          </View>
          {inspection.inspectorPhone ? (
            <View style={styles.contactActions}>
              <TouchableOpacity style={[styles.contactAction, { backgroundColor: isDark ? "#1E3A5F" : "#E8F0FE" }]}>
                <Phone size={16} color={isDark ? "#58A6FF" : "#1E2A3B"} strokeWidth={1.5} />
                <Text style={[styles.contactActionText, { color: isDark ? "#58A6FF" : "#1E2A3B" }]}>{inspection.inspectorPhone}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.contactAction, { backgroundColor: isDark ? "#1E3A5F" : "#E8F0FE" }]}>
                <Mail size={16} color={isDark ? "#58A6FF" : "#1E2A3B"} strokeWidth={1.5} />
                <Text style={[styles.contactActionText, { color: isDark ? "#58A6FF" : "#1E2A3B" }]} numberOfLines={1}>{inspection.inspectorEmail}</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Inspection Details</Text>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textTertiary }]}>Type</Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>{inspection.type}</Text>
          </View>
          <View style={[styles.detailDivider, { backgroundColor: theme.border }]} />
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textTertiary }]}>Date</Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>{inspection.date}</Text>
          </View>
          <View style={[styles.detailDivider, { backgroundColor: theme.border }]} />
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textTertiary }]}>Time</Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>{inspection.time}</Text>
          </View>
          <View style={[styles.detailDivider, { backgroundColor: theme.border }]} />
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textTertiary }]}>Permit #</Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>{inspection.permitNumber}</Text>
          </View>
        </View>

        {inspection.notes ? (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Notes</Text>
            <Text style={[styles.descriptionText, { color: theme.textSecondary }]}>{inspection.notes}</Text>
          </View>
        ) : null}

        {inspection.photos.length > 0 ? (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Photos ({inspection.photos.length})</Text>
            {inspection.photos.map((photo) => (
              <View key={photo.id} style={[styles.photoItem, { backgroundColor: isDark ? "#21262D" : "#F8FAFC" }]}>
                <View style={[styles.photoIcon, { backgroundColor: isDark ? "#1E3A5F" : "#E8F0FE" }]}>
                  <Camera size={16} color={isDark ? "#58A6FF" : "#1E2A3B"} strokeWidth={1.5} />
                </View>
                <View style={styles.photoInfo}>
                  <Text style={[styles.photoDesc, { color: theme.text }]}>{photo.description}</Text>
                  <Text style={[styles.photoTime, { color: theme.textTertiary }]}>{photo.timestamp}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    );
  }, [inspection, theme, isDark]);

  const renderChecklist = useCallback(() => {
    if (!inspection) return null;
    return (
      <View style={styles.tabContent}>
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <View style={styles.checklistHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Inspection Checklist</Text>
            <Text style={[styles.checklistCount, { color: theme.textSecondary }]}>{passedItems}/{totalItems} passed</Text>
          </View>
          {inspection.checklist.map((item) => {
            const itemCfg = checklistStatusConfig[item.status];
            return (
              <View key={item.id} style={[styles.checklistItem, { borderBottomColor: theme.border }]}>
                <View style={styles.checklistMain}>
                  <View style={[styles.checklistDot, { backgroundColor: itemCfg.color }]} />
                  <Text style={[styles.checklistText, { color: theme.text }]}>{item.item}</Text>
                  <View style={[styles.checklistBadge, { backgroundColor: itemCfg.bg }]}>
                    <Text style={[styles.checklistBadgeText, { color: itemCfg.color }]}>{itemCfg.label}</Text>
                  </View>
                </View>
                {item.notes ? (
                  <Text style={[styles.checklistNotes, { color: theme.textTertiary }]}>{item.notes}</Text>
                ) : null}
              </View>
            );
          })}
        </View>
      </View>
    );
  }, [inspection, theme, passedItems, totalItems]);

  const renderComments = useCallback(() => {
    if (!inspection) return null;
    return (
      <View style={styles.tabContent}>
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Comments ({inspection.comments.length})</Text>
          {inspection.comments.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.textTertiary }]}>No comments yet</Text>
          ) : (
            inspection.comments.map((comment) => (
              <View key={comment.id} style={[styles.commentItem, { borderBottomColor: theme.border }]}>
                <View style={[styles.commentAvatar, { backgroundColor: isDark ? "#1E3A5F" : "#E8F0FE" }]}>
                  <User size={14} color={isDark ? "#58A6FF" : "#1E2A3B"} strokeWidth={1.5} />
                </View>
                <View style={styles.commentContent}>
                  <View style={styles.commentHeader}>
                    <Text style={[styles.commentAuthor, { color: theme.text }]}>{comment.author}</Text>
                    <Text style={[styles.commentDate, { color: theme.textTertiary }]}>{comment.date}</Text>
                  </View>
                  <Text style={[styles.commentText, { color: theme.textSecondary }]}>{comment.text}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </View>
    );
  }, [inspection, theme, isDark]);

  const renderDocuments = useCallback(() => {
    if (!inspection) return null;
    return (
      <View style={styles.tabContent}>
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Documents ({inspection.documents.length})</Text>
          {inspection.documents.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.textTertiary }]}>No documents uploaded</Text>
          ) : (
            inspection.documents.map((doc) => (
              <TouchableOpacity key={doc.id} style={[styles.docItem, { borderBottomColor: theme.border }]}>
                <View style={[styles.docIcon, { backgroundColor: isDark ? "#2D1B1B" : "#FEF2F2" }]}>
                  <FileText size={18} color="#EF4444" strokeWidth={1.5} />
                </View>
                <View style={styles.docInfo}>
                  <Text style={[styles.docName, { color: theme.text }]} numberOfLines={1}>{doc.name}</Text>
                  <Text style={[styles.docMeta, { color: theme.textTertiary }]}>{doc.type} · {doc.size} · {doc.uploadedDate}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </View>
    );
  }, [inspection, theme, isDark]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview": return renderOverview();
      case "checklist": return renderChecklist();
      case "comments": return renderComments();
      case "documents": return renderDocuments();
      default: return renderOverview();
    }
  };

  if (!inspection) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <SafeAreaView edges={["top"]} style={styles.safeArea}>
          <View style={styles.header}>
            <BackButton onPress={handleBack} />
          </View>
          <View style={styles.emptyState}>
            <ClipboardCheck size={48} color={theme.textTertiary} strokeWidth={1} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Inspection Not Found</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              {"This inspection may have been removed or doesn't exist."}
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.View pointerEvents="none" style={[styles.floatingHeader, { backgroundColor: theme.surface, opacity: headerOpacity, borderBottomColor: theme.border }]}>
        <SafeAreaView edges={["top"]}>
          <View style={styles.floatingHeaderInner}>
            <Text style={[styles.floatingHeaderTitle, { color: theme.text }]} numberOfLines={1}>{inspection.title}</Text>
          </View>
        </SafeAreaView>
      </Animated.View>

      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <BackButton onPress={handleBack} />
            <View style={styles.headerActions}>
              <TouchableOpacity style={[styles.headerActionBtn, { backgroundColor: theme.surfaceSecondary }]}>
                <Share2 size={18} color={theme.text} strokeWidth={1.5} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.headerActionBtn, { backgroundColor: theme.surfaceSecondary }]}>
                <MoreVertical size={18} color={theme.text} strokeWidth={1.5} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.heroSection}>
            <View style={[styles.inspectionIconLarge, { backgroundColor: isDark ? "#0F2B1D" : "#ECFDF5" }]}>
              <ClipboardCheck size={32} color="#059669" strokeWidth={1.5} />
            </View>
            <View style={[styles.statusBadgeLarge, { backgroundColor: cfg.bg }]}>
              <StatusIcon size={14} color={cfg.color} strokeWidth={2} />
              <Text style={[styles.statusTextLarge, { color: cfg.color }]}>{cfg.label}</Text>
            </View>
            <Text style={[styles.inspectionTitle, { color: theme.text }]}>{inspection.title}</Text>
            <Text style={[styles.inspectionType, { color: theme.textTertiary }]}>{inspection.type} Inspection</Text>

            <View style={styles.quickStats}>
              <View style={[styles.statCard, { backgroundColor: isDark ? theme.surfaceSecondary : "#F8FAFC" }]}>
                <Calendar size={18} color="#3B82F6" strokeWidth={1.5} />
                <Text style={[styles.statValue, { color: theme.text }]}>{inspection.date}</Text>
                <Text style={[styles.statLabel, { color: theme.textTertiary }]}>Date</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: isDark ? theme.surfaceSecondary : "#F8FAFC" }]}>
                <Clock size={18} color="#8B5CF6" strokeWidth={1.5} />
                <Text style={[styles.statValue, { color: theme.text }]}>{inspection.time}</Text>
                <Text style={[styles.statLabel, { color: theme.textTertiary }]}>Time</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: isDark ? theme.surfaceSecondary : "#F8FAFC" }]}>
                <Shield size={18} color="#059669" strokeWidth={1.5} />
                <Text style={[styles.statValue, { color: theme.text }]}>{passedItems}/{totalItems}</Text>
                <Text style={[styles.statLabel, { color: theme.textTertiary }]}>Checklist</Text>
              </View>
            </View>

            <View style={styles.propertyRow}>
              <MapPin size={14} color={theme.textSecondary} strokeWidth={1.5} />
              <Text style={[styles.propertyText, { color: theme.textSecondary }]}>{inspection.propertyAddress}</Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsRow}
          >
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tab,
                  { borderBottomColor: "transparent" },
                  activeTab === tab.key && { borderBottomColor: theme.navy },
                ]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: theme.textTertiary },
                    activeTab === tab.key && { color: theme.navy, fontWeight: "600" as const },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {renderTabContent()}
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  floatingHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    borderBottomWidth: 1,
  },
  floatingHeaderInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  floatingHeaderTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  inspectionIconLarge: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  statusBadgeLarge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    marginBottom: 12,
  },
  statusTextLarge: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  inspectionTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    textAlign: "center",
    marginBottom: 4,
  },
  inspectionType: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  quickStats: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 14,
    gap: 6,
  },
  statValue: {
    fontSize: 13,
    fontWeight: "700" as const,
  },
  statLabel: {
    fontSize: 11,
  },
  propertyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  propertyText: {
    fontSize: 13,
  },
  tabsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 4,
    marginBottom: 16,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500" as const,
  },
  tabContent: {
    gap: 12,
    paddingHorizontal: 16,
  },
  section: {
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    marginBottom: 14,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  contactAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  contactCompany: {
    fontSize: 13,
    marginTop: 2,
  },
  contactActions: {
    gap: 8,
  },
  contactAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  contactActionText: {
    fontSize: 13,
    fontWeight: "500" as const,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  detailLabel: {
    fontSize: 13,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  detailDivider: {
    height: 1,
  },
  photoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  photoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  photoInfo: {
    flex: 1,
  },
  photoDesc: {
    fontSize: 14,
    fontWeight: "500" as const,
  },
  photoTime: {
    fontSize: 12,
    marginTop: 2,
  },
  checklistHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  checklistCount: {
    fontSize: 13,
    fontWeight: "500" as const,
  },
  checklistItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  checklistMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  checklistDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  checklistText: {
    flex: 1,
    fontSize: 14,
  },
  checklistBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  checklistBadgeText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  checklistNotes: {
    fontSize: 12,
    marginTop: 6,
    marginLeft: 18,
    fontStyle: "italic" as const,
  },
  commentItem: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  commentDate: {
    fontSize: 11,
  },
  commentText: {
    fontSize: 13,
    lineHeight: 20,
  },
  docItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  docIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  docInfo: {
    flex: 1,
  },
  docName: {
    fontSize: 14,
    fontWeight: "500" as const,
  },
  docMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 20,
  },
});
