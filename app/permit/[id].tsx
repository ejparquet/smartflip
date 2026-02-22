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
  FileCheck,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  MapPin,
  Download,
  Share2,
  MoreVertical,
  FileText,
  Shield,
  ClipboardList,
  Phone,
  Mail,
  AlertTriangle,
  CircleDot,
  Hash,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import BackButton from "@/components/BackButton";

interface PermitInspection {
  id: string;
  title: string;
  date: string;
  inspector: string;
  status: "passed" | "failed" | "scheduled" | "pending";
  notes?: string;
}

interface PermitDocument {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedDate: string;
}

interface PermitCondition {
  id: string;
  description: string;
  status: "met" | "pending" | "not_met";
}

interface PermitTimeline {
  id: string;
  event: string;
  date: string;
  description: string;
  type: "submitted" | "reviewed" | "approved" | "inspection" | "update";
}

interface PermitDetail {
  id: string;
  title: string;
  permitNumber: string;
  property: string;
  propertyAddress: string;
  type: string;
  status: "approved" | "pending" | "expired" | "under_review";
  issuedDate: string;
  expiryDate: string;
  applicationDate: string;
  lastInspection: string;
  description: string;
  jurisdiction: string;
  fee: number;
  feePaid: boolean;
  applicant: string;
  applicantPhone: string;
  applicantEmail: string;
  contractor: string;
  contractorLicense: string;
  scope: string[];
  inspections: PermitInspection[];
  documents: PermitDocument[];
  conditions: PermitCondition[];
  timeline: PermitTimeline[];
}

const mockPermitDetails: Record<string, PermitDetail> = {
  "1": {
    id: "1",
    title: "Building Permit",
    permitNumber: "BP-2026-0412",
    property: "123 Oak Street",
    propertyAddress: "123 Oak Street, Austin, TX 78701",
    type: "Construction",
    status: "approved",
    issuedDate: "Jan 10, 2026",
    expiryDate: "Jul 10, 2026",
    applicationDate: "Dec 15, 2025",
    lastInspection: "Feb 20, 2026",
    description: "Full residential renovation including structural modifications, new framing, interior finishing, and exterior improvements. Work includes removal of load-bearing wall with steel beam installation.",
    jurisdiction: "City of Austin - Development Services",
    fee: 2450,
    feePaid: true,
    applicant: "Robert Smith",
    applicantPhone: "(555) 234-5678",
    applicantEmail: "robert@smithsons.com",
    contractor: "Smith & Sons Construction",
    contractorLicense: "TXGC-2024-88412",
    scope: [
      "Structural modifications per engineered plans",
      "Load-bearing wall removal with LVL beam",
      "New partition walls and framing",
      "Foundation repair at south wall",
      "Roof framing modifications",
      "Egress window installation",
    ],
    inspections: [
      { id: "i1", title: "Foundation Inspection", date: "Jan 22, 2026", inspector: "Mike Torres", status: "passed", notes: "Foundation meets code requirements. Rebar spacing correct." },
      { id: "i2", title: "Framing Inspection", date: "Feb 12, 2026", inspector: "Mike Torres", status: "passed", notes: "Framing approved. Header sizes verified per engineering." },
      { id: "i3", title: "Rough-In Inspection", date: "Mar 15, 2026", inspector: "Lisa Park", status: "scheduled" },
      { id: "i4", title: "Insulation Inspection", date: "Apr 5, 2026", inspector: "TBD", status: "pending" },
      { id: "i5", title: "Final Inspection", date: "Jun 20, 2026", inspector: "TBD", status: "pending" },
    ],
    documents: [
      { id: "d1", name: "Building Permit Application.pdf", type: "PDF", size: "1.8 MB", uploadedDate: "Dec 15, 2025" },
      { id: "d2", name: "Approved Plans Set.pdf", type: "PDF", size: "12.4 MB", uploadedDate: "Jan 10, 2026" },
      { id: "d3", name: "Structural Engineering Report.pdf", type: "PDF", size: "3.2 MB", uploadedDate: "Dec 10, 2025" },
      { id: "d4", name: "Site Survey.pdf", type: "PDF", size: "2.1 MB", uploadedDate: "Dec 8, 2025" },
      { id: "d5", name: "Insurance Certificate.pdf", type: "PDF", size: "890 KB", uploadedDate: "Dec 15, 2025" },
    ],
    conditions: [
      { id: "c1", description: "All work must conform to IRC 2021 and local amendments", status: "met" },
      { id: "c2", description: "Approved plans must be on-site at all times during construction", status: "met" },
      { id: "c3", description: "Erosion control measures must be in place before work begins", status: "met" },
      { id: "c4", description: "Final inspection required before occupancy", status: "pending" },
      { id: "c5", description: "As-built survey required at completion", status: "pending" },
    ],
    timeline: [
      { id: "t1", event: "Application Submitted", date: "Dec 15, 2025", description: "Initial permit application submitted with plans", type: "submitted" },
      { id: "t2", event: "Plan Review Started", date: "Dec 22, 2025", description: "Plans assigned to reviewer", type: "reviewed" },
      { id: "t3", event: "Revisions Requested", date: "Jan 3, 2026", description: "Minor corrections needed on structural details", type: "update" },
      { id: "t4", event: "Revised Plans Submitted", date: "Jan 6, 2026", description: "Corrected plans resubmitted", type: "submitted" },
      { id: "t5", event: "Permit Approved", date: "Jan 10, 2026", description: "Permit issued - construction may begin", type: "approved" },
      { id: "t6", event: "Foundation Inspection", date: "Jan 22, 2026", description: "Passed - all requirements met", type: "inspection" },
      { id: "t7", event: "Framing Inspection", date: "Feb 12, 2026", description: "Passed - framing per approved plans", type: "inspection" },
    ],
  },
  "2": {
    id: "2",
    title: "Electrical Permit",
    permitNumber: "EP-2026-0198",
    property: "456 Maple Ave",
    propertyAddress: "456 Maple Ave, Austin, TX 78702",
    type: "Electrical",
    status: "approved",
    issuedDate: "Feb 5, 2026",
    expiryDate: "Aug 5, 2026",
    applicationDate: "Jan 20, 2026",
    lastInspection: "Feb 18, 2026",
    description: "Complete electrical system upgrade including 200-amp panel replacement, whole-house rewiring, and smart home wiring infrastructure installation.",
    jurisdiction: "City of Austin - Electrical Division",
    fee: 850,
    feePaid: true,
    applicant: "James Wilson",
    applicantPhone: "(555) 345-6789",
    applicantEmail: "james@powerline.com",
    contractor: "PowerLine Electric",
    contractorLicense: "TXEC-2023-55219",
    scope: [
      "200-amp service panel upgrade",
      "Whole-house copper rewiring",
      "Smart home low-voltage wiring",
      "Outdoor landscape lighting circuits",
      "Dedicated circuits for HVAC and appliances",
    ],
    inspections: [
      { id: "i1", title: "Rough-In Electrical", date: "Feb 18, 2026", inspector: "Carlos Ruiz", status: "passed", notes: "Wire sizing and routing approved. Box fill calculations verified." },
      { id: "i2", title: "Service Panel", date: "Mar 1, 2026", inspector: "Carlos Ruiz", status: "scheduled" },
      { id: "i3", title: "Final Electrical", date: "Mar 12, 2026", inspector: "TBD", status: "pending" },
    ],
    documents: [
      { id: "d1", name: "Electrical Permit Application.pdf", type: "PDF", size: "1.2 MB", uploadedDate: "Jan 20, 2026" },
      { id: "d2", name: "Electrical Plans.pdf", type: "PDF", size: "4.8 MB", uploadedDate: "Jan 20, 2026" },
      { id: "d3", name: "Load Calculation Sheet.pdf", type: "PDF", size: "420 KB", uploadedDate: "Jan 20, 2026" },
    ],
    conditions: [
      { id: "c1", description: "All work per NEC 2023 and local amendments", status: "met" },
      { id: "c2", description: "Licensed electrician must perform all work", status: "met" },
      { id: "c3", description: "GFCI protection required in all wet locations", status: "met" },
      { id: "c4", description: "Arc-fault protection on all bedroom circuits", status: "pending" },
    ],
    timeline: [
      { id: "t1", event: "Application Submitted", date: "Jan 20, 2026", description: "Permit application with load calcs submitted", type: "submitted" },
      { id: "t2", event: "Permit Approved", date: "Feb 5, 2026", description: "Electrical permit issued", type: "approved" },
      { id: "t3", event: "Rough-In Inspection", date: "Feb 18, 2026", description: "Passed - wiring approved", type: "inspection" },
    ],
  },
  "3": {
    id: "3",
    title: "Plumbing Permit",
    permitNumber: "PP-2026-0321",
    property: "123 Oak Street",
    propertyAddress: "123 Oak Street, Austin, TX 78701",
    type: "Plumbing",
    status: "pending",
    issuedDate: "",
    expiryDate: "",
    applicationDate: "Feb 28, 2026",
    lastInspection: "",
    description: "New plumbing rough-in for kitchen relocation and additional bathroom. Includes new water supply lines, drain/waste/vent piping, and fixture connections.",
    jurisdiction: "City of Austin - Plumbing Division",
    fee: 650,
    feePaid: true,
    applicant: "Robert Smith",
    applicantPhone: "(555) 234-5678",
    applicantEmail: "robert@smithsons.com",
    contractor: "AquaFix Plumbing",
    contractorLicense: "TXPL-2024-33108",
    scope: [
      "Kitchen drain relocation",
      "New bathroom rough-in (supply & DWV)",
      "Water heater relocation",
      "Hose bib additions",
    ],
    inspections: [],
    documents: [
      { id: "d1", name: "Plumbing Permit Application.pdf", type: "PDF", size: "1.4 MB", uploadedDate: "Feb 28, 2026" },
      { id: "d2", name: "Plumbing Riser Diagram.pdf", type: "PDF", size: "680 KB", uploadedDate: "Feb 28, 2026" },
    ],
    conditions: [
      { id: "c1", description: "All work per IPC 2021 and local amendments", status: "pending" },
      { id: "c2", description: "Pressure test required before concealment", status: "pending" },
    ],
    timeline: [
      { id: "t1", event: "Application Submitted", date: "Feb 28, 2026", description: "Plumbing permit application filed", type: "submitted" },
      { id: "t2", event: "Under Review", date: "Mar 3, 2026", description: "Plans assigned to reviewer", type: "reviewed" },
    ],
  },
  "4": {
    id: "4",
    title: "Demolition Permit",
    permitNumber: "DP-2026-0055",
    property: "789 Pine Blvd",
    propertyAddress: "789 Pine Blvd, Austin, TX 78703",
    type: "Demolition",
    status: "under_review",
    issuedDate: "",
    expiryDate: "",
    applicationDate: "Mar 1, 2026",
    lastInspection: "",
    description: "Partial interior demolition of existing commercial space for tenant build-out. Includes removal of non-load-bearing partition walls, ceiling grid, and floor coverings.",
    jurisdiction: "City of Austin - Commercial Division",
    fee: 1200,
    feePaid: false,
    applicant: "David Chen",
    applicantPhone: "(555) 567-8901",
    applicantEmail: "david@aquafix.com",
    contractor: "Smith & Sons Construction",
    contractorLicense: "TXGC-2024-88412",
    scope: [
      "Interior non-structural wall removal",
      "Ceiling grid and tile removal",
      "Floor covering removal",
      "MEP disconnect and cap-off",
      "Debris hauling and disposal",
    ],
    inspections: [],
    documents: [
      { id: "d1", name: "Demolition Permit Application.pdf", type: "PDF", size: "980 KB", uploadedDate: "Mar 1, 2026" },
      { id: "d2", name: "Asbestos Survey Report.pdf", type: "PDF", size: "2.6 MB", uploadedDate: "Feb 25, 2026" },
      { id: "d3", name: "Demolition Plan.pdf", type: "PDF", size: "1.8 MB", uploadedDate: "Mar 1, 2026" },
    ],
    conditions: [
      { id: "c1", description: "Asbestos abatement must be completed before demolition", status: "met" },
      { id: "c2", description: "Utility disconnects must be verified", status: "pending" },
      { id: "c3", description: "Dust control measures required during work", status: "pending" },
    ],
    timeline: [
      { id: "t1", event: "Application Submitted", date: "Mar 1, 2026", description: "Demolition permit application filed", type: "submitted" },
      { id: "t2", event: "Plan Review", date: "Mar 5, 2026", description: "Review in progress - pending fee payment", type: "reviewed" },
    ],
  },
  "5": {
    id: "5",
    title: "Roofing Permit",
    permitNumber: "RP-2025-0789",
    property: "456 Maple Ave",
    propertyAddress: "456 Maple Ave, Austin, TX 78702",
    type: "Roofing",
    status: "expired",
    issuedDate: "Jun 1, 2025",
    expiryDate: "Dec 1, 2025",
    applicationDate: "May 20, 2025",
    lastInspection: "Aug 15, 2025",
    description: "Complete roof replacement including tear-off of existing composition shingles, inspection and repair of decking, and installation of new architectural shingles with updated flashing and ventilation.",
    jurisdiction: "City of Austin - Residential Division",
    fee: 480,
    feePaid: true,
    applicant: "Sarah Johnson",
    applicantPhone: "(555) 678-9012",
    applicantEmail: "sarah@greenscape.com",
    contractor: "TopShield Roofing",
    contractorLicense: "TXRF-2023-44567",
    scope: [
      "Tear-off existing roofing material",
      "Inspect and repair roof decking",
      "Install ice & water shield at valleys and eaves",
      "Install GAF Timberline HDZ shingles",
      "Replace all flashing and pipe boots",
      "Install ridge vent system",
    ],
    inspections: [
      { id: "i1", title: "Decking Inspection", date: "Jul 10, 2025", inspector: "Tom Harris", status: "passed", notes: "Decking in acceptable condition. Two sheets replaced at south slope." },
      { id: "i2", title: "Final Roofing Inspection", date: "Aug 15, 2025", inspector: "Tom Harris", status: "passed", notes: "Shingle installation and flashing meet manufacturer specs." },
    ],
    documents: [
      { id: "d1", name: "Roofing Permit Application.pdf", type: "PDF", size: "1.1 MB", uploadedDate: "May 20, 2025" },
      { id: "d2", name: "Manufacturer Warranty.pdf", type: "PDF", size: "540 KB", uploadedDate: "Aug 20, 2025" },
      { id: "d3", name: "Final Inspection Report.pdf", type: "PDF", size: "720 KB", uploadedDate: "Aug 15, 2025" },
    ],
    conditions: [
      { id: "c1", description: "All work per IRC Chapter 9 and manufacturer specifications", status: "met" },
      { id: "c2", description: "Dumpster placement requires right-of-way permit", status: "met" },
      { id: "c3", description: "Final inspection before permit expiration", status: "met" },
    ],
    timeline: [
      { id: "t1", event: "Application Submitted", date: "May 20, 2025", description: "Roofing permit application filed", type: "submitted" },
      { id: "t2", event: "Permit Approved", date: "Jun 1, 2025", description: "Permit issued", type: "approved" },
      { id: "t3", event: "Decking Inspection", date: "Jul 10, 2025", description: "Passed", type: "inspection" },
      { id: "t4", event: "Final Inspection", date: "Aug 15, 2025", description: "Passed - work complete", type: "inspection" },
      { id: "t5", event: "Permit Expired", date: "Dec 1, 2025", description: "Permit reached expiration date", type: "update" },
    ],
  },
};

const statusConfig = {
  approved: { label: "Approved", color: "#10B981", bg: "#ECFDF5", icon: CheckCircle },
  pending: { label: "Pending", color: "#272D53", bg: "#E8E9EE", icon: Clock },
  expired: { label: "Expired", color: "#EF4444", bg: "#FEF2F2", icon: AlertCircle },
  under_review: { label: "Under Review", color: "#6366F1", bg: "#EEF2FF", icon: AlertTriangle },
};

const inspectionStatusConfig: Record<string, { color: string; bg: string; label: string }> = {
  passed: { color: "#10B981", bg: "#ECFDF5", label: "Passed" },
  failed: { color: "#EF4444", bg: "#FEF2F2", label: "Failed" },
  scheduled: { color: "#3B82F6", bg: "#EFF6FF", label: "Scheduled" },
  pending: { color: "#9CA3AF", bg: "#F3F4F6", label: "Pending" },
};

const conditionStatusConfig: Record<string, { color: string; bg: string; label: string }> = {
  met: { color: "#10B981", bg: "#ECFDF5", label: "Met" },
  pending: { color: "#272D53", bg: "#E8E9EE", label: "Pending" },
  not_met: { color: "#EF4444", bg: "#FEF2F2", label: "Not Met" },
};

const timelineTypeConfig: Record<string, { color: string; bg: string }> = {
  submitted: { color: "#3B82F6", bg: "#EFF6FF" },
  reviewed: { color: "#8B5CF6", bg: "#F5F3FF" },
  approved: { color: "#10B981", bg: "#ECFDF5" },
  inspection: { color: "#272D53", bg: "#E8E9EE" },
  update: { color: "#6B7280", bg: "#F3F4F6" },
};

type TabKey = "overview" | "inspections" | "conditions" | "documents";

const tabs: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "inspections", label: "Inspections" },
  { key: "conditions", label: "Conditions" },
  { key: "documents", label: "Documents" },
];

export default function PermitDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const scrollY = useRef(new Animated.Value(0)).current;

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const permit = mockPermitDetails[id || "1"];

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const cfg = permit ? statusConfig[permit.status] : statusConfig.pending;
  const StatusIcon = cfg.icon;

  const passedInspections = permit ? permit.inspections.filter((i) => i.status === "passed").length : 0;
  const totalInspections = permit ? permit.inspections.length : 0;
  const metConditions = permit ? permit.conditions.filter((c) => c.status === "met").length : 0;
  const totalConditions = permit ? permit.conditions.length : 0;

  const renderOverview = useCallback(() => {
    if (!permit) return null;
    return (
      <View style={styles.tabContent}>
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Description</Text>
          <Text style={[styles.descriptionText, { color: theme.textSecondary }]}>{permit.description}</Text>
        </View>

        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Applicant / Contractor</Text>
          <View style={styles.contactCard}>
            <View style={[styles.contactAvatar, { backgroundColor: isDark ? "#1E3A5F" : "#E8F0FE" }]}>
              <User size={22} color={isDark ? "#58A6FF" : "#1E2A3B"} strokeWidth={1.5} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={[styles.contactName, { color: theme.text }]}>{permit.applicant}</Text>
              <Text style={[styles.contactCompany, { color: theme.textSecondary }]}>{permit.contractor}</Text>
            </View>
          </View>
          <View style={styles.contactActions}>
            <TouchableOpacity style={[styles.contactAction, { backgroundColor: isDark ? "#1E3A5F" : "#E8F0FE" }]}>
              <Phone size={16} color={isDark ? "#58A6FF" : "#1E2A3B"} strokeWidth={1.5} />
              <Text style={[styles.contactActionText, { color: isDark ? "#58A6FF" : "#1E2A3B" }]}>{permit.applicantPhone}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.contactAction, { backgroundColor: isDark ? "#1E3A5F" : "#E8F0FE" }]}>
              <Mail size={16} color={isDark ? "#58A6FF" : "#1E2A3B"} strokeWidth={1.5} />
              <Text style={[styles.contactActionText, { color: isDark ? "#58A6FF" : "#1E2A3B" }]} numberOfLines={1}>{permit.applicantEmail}</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.licenseRow, { backgroundColor: isDark ? "#21262D" : "#F8FAFC", marginTop: 12 }]}>
            <Hash size={14} color={theme.textTertiary} strokeWidth={1.5} />
            <Text style={[styles.licenseText, { color: theme.textSecondary }]}>License: {permit.contractorLicense}</Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Scope of Work</Text>
          {permit.scope.map((item, index) => (
            <View key={index} style={styles.scopeItem}>
              <View style={[styles.scopeDot, { backgroundColor: theme.navy }]} />
              <Text style={[styles.scopeText, { color: theme.textSecondary }]}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Permit Details</Text>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textTertiary }]}>Jurisdiction</Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>{permit.jurisdiction}</Text>
          </View>
          <View style={[styles.detailDivider, { backgroundColor: theme.border }]} />
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textTertiary }]}>Permit Fee</Text>
            <View style={styles.detailValueRow}>
              <Text style={[styles.detailValue, { color: theme.text }]}>${permit.fee.toLocaleString()}</Text>
              <View style={[styles.smallBadge, { backgroundColor: permit.feePaid ? "#ECFDF5" : "#E8E9EE" }]}>
                <Text style={[styles.smallBadgeText, { color: permit.feePaid ? "#10B981" : "#272D53" }]}>
                  {permit.feePaid ? "Paid" : "Unpaid"}
                </Text>
              </View>
            </View>
          </View>
          <View style={[styles.detailDivider, { backgroundColor: theme.border }]} />
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textTertiary }]}>Type</Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>{permit.type}</Text>
          </View>
          <View style={[styles.detailDivider, { backgroundColor: theme.border }]} />
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textTertiary }]}>Application Date</Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>{permit.applicationDate}</Text>
          </View>
          {permit.issuedDate ? (
            <>
              <View style={[styles.detailDivider, { backgroundColor: theme.border }]} />
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.textTertiary }]}>Issued</Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>{permit.issuedDate}</Text>
              </View>
            </>
          ) : null}
          {permit.expiryDate ? (
            <>
              <View style={[styles.detailDivider, { backgroundColor: theme.border }]} />
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.textTertiary }]}>Expires</Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>{permit.expiryDate}</Text>
              </View>
            </>
          ) : null}
        </View>

        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Activity Timeline</Text>
          {permit.timeline.map((event, index) => {
            const tCfg = timelineTypeConfig[event.type];
            const isLast = index === permit.timeline.length - 1;
            return (
              <View key={event.id} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View style={[styles.timelineDot, { backgroundColor: tCfg.bg, borderColor: tCfg.color }]} />
                  {!isLast && <View style={[styles.timelineConnector, { backgroundColor: theme.border }]} />}
                </View>
                <View style={[styles.timelineContent, !isLast && { paddingBottom: 20 }]}>
                  <Text style={[styles.timelineEvent, { color: theme.text }]}>{event.event}</Text>
                  <Text style={[styles.timelineDate, { color: theme.textTertiary }]}>{event.date}</Text>
                  <Text style={[styles.timelineDesc, { color: theme.textSecondary }]}>{event.description}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  }, [permit, theme, isDark]);

  const renderInspections = useCallback(() => {
    if (!permit) return null;
    return (
      <View style={styles.tabContent}>
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <View style={styles.inspectionProgress}>
            <Text style={[styles.inspectionSummary, { color: theme.text }]}>
              {passedInspections} of {totalInspections} inspections passed
            </Text>
            {totalInspections > 0 && (
              <View style={[styles.progressBarTrack, { backgroundColor: isDark ? "#21262D" : "#F3F4F6" }]}>
                <View style={[styles.progressBarFill, { width: `${totalInspections > 0 ? (passedInspections / totalInspections) * 100 : 0}%`, backgroundColor: "#10B981" }]} />
              </View>
            )}
          </View>
        </View>

        {permit.inspections.length === 0 ? (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <View style={styles.emptyInspections}>
              <ClipboardList size={36} color={theme.textTertiary} strokeWidth={1.2} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No inspections scheduled yet</Text>
              <Text style={[styles.emptySubtext, { color: theme.textTertiary }]}>Inspections will appear here once the permit is approved</Text>
            </View>
          </View>
        ) : (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Inspection Schedule</Text>
            {permit.inspections.map((inspection, index) => {
              const iCfg = inspectionStatusConfig[inspection.status];
              const isLast = index === permit.inspections.length - 1;
              return (
                <View key={inspection.id} style={styles.inspectionItem}>
                  <View style={styles.inspectionTimeline}>
                    <View style={[styles.inspectionCircle, { backgroundColor: iCfg.bg, borderColor: iCfg.color }]}>
                      {inspection.status === "passed" ? (
                        <CheckCircle size={14} color={iCfg.color} strokeWidth={2} />
                      ) : inspection.status === "failed" ? (
                        <AlertCircle size={14} color={iCfg.color} strokeWidth={2} />
                      ) : inspection.status === "scheduled" ? (
                        <CircleDot size={14} color={iCfg.color} strokeWidth={2} />
                      ) : (
                        <Clock size={14} color={iCfg.color} strokeWidth={2} />
                      )}
                    </View>
                    {!isLast && <View style={[styles.inspectionConnector, { backgroundColor: inspection.status === "passed" ? "#10B981" : theme.border }]} />}
                  </View>
                  <View style={[styles.inspectionContent, !isLast && { paddingBottom: 24 }]}>
                    <View style={styles.inspectionHeader}>
                      <Text style={[styles.inspectionTitle, { color: theme.text }]}>{inspection.title}</Text>
                      <View style={[styles.smallBadge, { backgroundColor: iCfg.bg }]}>
                        <Text style={[styles.smallBadgeText, { color: iCfg.color }]}>{iCfg.label}</Text>
                      </View>
                    </View>
                    <Text style={[styles.inspectionDate, { color: theme.textTertiary }]}>{inspection.date}</Text>
                    <Text style={[styles.inspectionInspector, { color: theme.textSecondary }]}>Inspector: {inspection.inspector}</Text>
                    {inspection.notes ? (
                      <View style={[styles.inspectionNotes, { backgroundColor: isDark ? "#21262D" : "#F8FAFC" }]}>
                        <Text style={[styles.inspectionNotesText, { color: theme.textSecondary }]}>{inspection.notes}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    );
  }, [permit, theme, isDark, passedInspections, totalInspections]);

  const renderConditions = useCallback(() => {
    if (!permit) return null;
    return (
      <View style={styles.tabContent}>
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <View style={styles.conditionProgress}>
            <Text style={[styles.conditionSummary, { color: theme.text }]}>
              {metConditions} of {totalConditions} conditions met
            </Text>
            {totalConditions > 0 && (
              <View style={[styles.progressBarTrack, { backgroundColor: isDark ? "#21262D" : "#F3F4F6" }]}>
                <View style={[styles.progressBarFill, { width: `${totalConditions > 0 ? (metConditions / totalConditions) * 100 : 0}%`, backgroundColor: "#10B981" }]} />
              </View>
            )}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Permit Conditions</Text>
          {permit.conditions.map((condition, index) => {
            const cCfg = conditionStatusConfig[condition.status];
            return (
              <View
                key={condition.id}
                style={[
                  styles.conditionItem,
                  index < permit.conditions.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border },
                ]}
              >
                <View style={styles.conditionLeft}>
                  <View style={[styles.conditionIcon, { backgroundColor: cCfg.bg }]}>
                    {condition.status === "met" ? (
                      <CheckCircle size={16} color={cCfg.color} strokeWidth={2} />
                    ) : condition.status === "not_met" ? (
                      <AlertCircle size={16} color={cCfg.color} strokeWidth={2} />
                    ) : (
                      <Clock size={16} color={cCfg.color} strokeWidth={2} />
                    )}
                  </View>
                  <Text style={[styles.conditionText, { color: theme.textSecondary }]}>{condition.description}</Text>
                </View>
                <View style={[styles.smallBadge, { backgroundColor: cCfg.bg }]}>
                  <Text style={[styles.smallBadgeText, { color: cCfg.color }]}>{cCfg.label}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  }, [permit, theme, isDark, metConditions, totalConditions]);

  const renderDocuments = useCallback(() => {
    if (!permit) return null;
    return (
      <View style={styles.tabContent}>
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Permit Documents</Text>
          {permit.documents.map((doc, index) => (
            <TouchableOpacity
              key={doc.id}
              style={[styles.documentItem, index < permit.documents.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }]}
              activeOpacity={0.6}
            >
              <View style={[styles.docIcon, { backgroundColor: isDark ? "#2D1B1B" : "#FEF2F2" }]}>
                <FileText size={20} color="#EF4444" strokeWidth={1.5} />
              </View>
              <View style={styles.docInfo}>
                <Text style={[styles.docName, { color: theme.text }]}>{doc.name}</Text>
                <Text style={[styles.docMeta, { color: theme.textTertiary }]}>{doc.size} · {doc.uploadedDate}</Text>
              </View>
              <Download size={18} color={theme.textTertiary} strokeWidth={1.5} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[styles.uploadBtn, { borderColor: theme.navy, borderWidth: 1.5 }]} activeOpacity={0.7}>
          <FileText size={18} color={theme.navy} strokeWidth={1.5} />
          <Text style={[styles.uploadBtnText, { color: theme.navy }]}>Upload Document</Text>
        </TouchableOpacity>
      </View>
    );
  }, [permit, theme, isDark]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview": return renderOverview();
      case "inspections": return renderInspections();
      case "conditions": return renderConditions();
      case "documents": return renderDocuments();
      default: return renderOverview();
    }
  };

  if (!permit) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <SafeAreaView edges={["top"]} style={styles.safeArea}>
          <View style={styles.header}>
            <BackButton onPress={handleBack} />
          </View>
          <View style={styles.emptyState}>
            <FileCheck size={48} color={theme.textTertiary} strokeWidth={1} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Permit Not Found</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              {"This permit may have been removed or doesn't exist."}
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
            <Text style={[styles.floatingHeaderTitle, { color: theme.text }]} numberOfLines={1}>{permit.title}</Text>
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
            <View style={[styles.permitIconLarge, { backgroundColor: isDark ? "#2D2410" : "#E8E9EE" }]}>
              <FileCheck size={32} color="#D97706" strokeWidth={1.5} />
            </View>
            <View style={[styles.statusBadgeLarge, { backgroundColor: cfg.bg }]}>
              <StatusIcon size={14} color={cfg.color} strokeWidth={2} />
              <Text style={[styles.statusTextLarge, { color: cfg.color }]}>{cfg.label}</Text>
            </View>
            <Text style={[styles.permitTitle, { color: theme.text }]}>{permit.title}</Text>
            <Text style={[styles.permitNumber, { color: theme.textTertiary }]}>{permit.permitNumber}</Text>

            <View style={styles.quickStats}>
              <View style={[styles.statCard, { backgroundColor: isDark ? theme.surfaceSecondary : "#F8FAFC" }]}>
                <Shield size={18} color="#D97706" strokeWidth={1.5} />
                <Text style={[styles.statValue, { color: theme.text }]}>{permit.type}</Text>
                <Text style={[styles.statLabel, { color: theme.textTertiary }]}>Permit Type</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: isDark ? theme.surfaceSecondary : "#F8FAFC" }]}>
                <ClipboardList size={18} color="#3B82F6" strokeWidth={1.5} />
                <Text style={[styles.statValue, { color: theme.text }]}>{passedInspections}/{totalInspections}</Text>
                <Text style={[styles.statLabel, { color: theme.textTertiary }]}>Inspections</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: isDark ? theme.surfaceSecondary : "#F8FAFC" }]}>
                <Calendar size={18} color={permit.status === "expired" ? "#EF4444" : "#10B981"} strokeWidth={1.5} />
                <Text style={[styles.statValue, { color: theme.text }]}>{permit.expiryDate ? permit.expiryDate.split(",")[0] : "TBD"}</Text>
                <Text style={[styles.statLabel, { color: theme.textTertiary }]}>Expires</Text>
              </View>
            </View>

            <View style={styles.propertyRow}>
              <MapPin size={14} color={theme.textSecondary} strokeWidth={1.5} />
              <Text style={[styles.propertyText, { color: theme.textSecondary }]}>{permit.propertyAddress}</Text>
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
  scrollContent: { paddingBottom: 40 },
  floatingHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    borderBottomWidth: 1,
  },
  floatingHeaderInner: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
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
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  heroSection: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  permitIconLarge: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  statusBadgeLarge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 12,
  },
  statusTextLarge: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  permitTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    textAlign: "center",
    marginBottom: 4,
    lineHeight: 28,
  },
  permitNumber: {
    fontSize: 13,
    fontWeight: "500" as const,
    marginBottom: 20,
  },
  quickStats: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
    width: "100%",
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    gap: 6,
  },
  statValue: {
    fontSize: 15,
    fontWeight: "700" as const,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "500" as const,
  },
  propertyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  propertyText: {
    fontSize: 13,
    fontWeight: "500" as const,
  },
  tabsRow: {
    paddingHorizontal: 16,
    gap: 4,
    marginBottom: 4,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500" as const,
  },
  tabContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  section: {
    borderRadius: 16,
    padding: 18,
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
    marginBottom: 14,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginBottom: 2,
  },
  contactCompany: {
    fontSize: 13,
  },
  contactActions: {
    gap: 8,
  },
  contactAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  contactActionText: {
    fontSize: 13,
    fontWeight: "500" as const,
  },
  licenseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  licenseText: {
    fontSize: 13,
    fontWeight: "500" as const,
  },
  scopeItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
    gap: 12,
  },
  scopeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
  },
  scopeText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: "500" as const,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    textAlign: "right" as const,
    flex: 1,
    marginLeft: 16,
  },
  detailValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "flex-end",
    flex: 1,
    marginLeft: 16,
  },
  detailDivider: {
    height: 1,
  },
  smallBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  smallBadgeText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  timelineItem: {
    flexDirection: "row",
  },
  timelineLeft: {
    alignItems: "center",
    width: 36,
    marginRight: 12,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  timelineConnector: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 0,
  },
  timelineEvent: {
    fontSize: 14,
    fontWeight: "600" as const,
    marginBottom: 2,
  },
  timelineDate: {
    fontSize: 12,
    marginBottom: 4,
  },
  timelineDesc: {
    fontSize: 13,
    lineHeight: 19,
  },
  inspectionProgress: {
    gap: 10,
  },
  inspectionSummary: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  emptyInspections: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 8,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  emptySubtext: {
    fontSize: 13,
    textAlign: "center",
  },
  inspectionItem: {
    flexDirection: "row",
  },
  inspectionTimeline: {
    alignItems: "center",
    width: 36,
    marginRight: 12,
  },
  inspectionCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  inspectionConnector: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  inspectionContent: {
    flex: 1,
    paddingTop: 2,
  },
  inspectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inspectionTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    flex: 1,
    marginRight: 8,
  },
  inspectionDate: {
    fontSize: 12,
    marginTop: 2,
  },
  inspectionInspector: {
    fontSize: 13,
    marginTop: 4,
  },
  inspectionNotes: {
    marginTop: 8,
    padding: 12,
    borderRadius: 10,
  },
  inspectionNotesText: {
    fontSize: 13,
    lineHeight: 19,
  },
  conditionProgress: {
    gap: 10,
  },
  conditionSummary: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  conditionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    gap: 12,
  },
  conditionLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    gap: 12,
  },
  conditionIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 0,
  },
  conditionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  documentItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 14,
  },
  docIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  docInfo: {
    flex: 1,
  },
  docName: {
    fontSize: 14,
    fontWeight: "600" as const,
    marginBottom: 2,
  },
  docMeta: {
    fontSize: 12,
  },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 14,
    borderStyle: "dashed" as const,
  },
  uploadBtnText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
  },
});
