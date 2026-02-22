import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  FileText,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  MapPin,
  Download,
  Share2,
  MoreVertical,
  CircleDot,
  Phone,
  Mail,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import BackButton from "@/components/BackButton";



interface ContractDetail {
  id: string;
  title: string;
  vendor: string;
  vendorContact: string;
  vendorPhone: string;
  vendorEmail: string;
  property: string;
  propertyAddress: string;
  amount: number;
  paidAmount: number;
  startDate: string;
  endDate: string;
  status: "active" | "pending" | "expired" | "completed";
  contractNumber: string;
  description: string;
  scope: string[];
  milestones: ContractMilestone[];
  payments: PaymentSchedule[];
  documents: ContractDocument[];
  terms: ContractTerm[];
  changeOrders: ChangeOrder[];
  createdDate: string;
  signedDate: string;
  lastModified: string;
}

interface ContractMilestone {
  id: string;
  title: string;
  dueDate: string;
  status: "completed" | "in_progress" | "upcoming" | "overdue";
  percentage: number;
}

interface PaymentSchedule {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  status: "paid" | "due" | "upcoming" | "overdue";
  paidDate?: string;
}

interface ContractDocument {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedDate: string;
}

interface ContractTerm {
  id: string;
  title: string;
  content: string;
}

interface ChangeOrder {
  id: string;
  title: string;
  amount: number;
  status: "approved" | "pending" | "rejected";
  date: string;
  description: string;
}

const mockContractDetails: Record<string, ContractDetail> = {
  "1": {
    id: "1",
    title: "General Construction Agreement",
    vendor: "Smith & Sons Construction",
    vendorContact: "Robert Smith",
    vendorPhone: "(555) 234-5678",
    vendorEmail: "robert@smithsons.com",
    property: "123 Oak Street",
    propertyAddress: "123 Oak Street, Austin, TX 78701",
    amount: 85000,
    paidAmount: 42500,
    startDate: "Jan 15, 2026",
    endDate: "Jun 30, 2026",
    status: "active",
    contractNumber: "CNT-2026-0042",
    description: "Complete renovation of single-family residence including structural modifications, new electrical and plumbing systems, interior finishing, and exterior improvements.",
    scope: [
      "Demolition of existing interior walls per approved plans",
      "Structural reinforcement and new framing",
      "Complete electrical rewiring to code",
      "New plumbing rough-in and fixtures",
      "Drywall installation and finishing",
      "Flooring installation (hardwood & tile)",
      "Kitchen and bathroom cabinetry",
      "Interior and exterior painting",
      "Final cleanup and punch list completion",
    ],
    milestones: [
      { id: "m1", title: "Demolition Complete", dueDate: "Feb 1, 2026", status: "completed", percentage: 10 },
      { id: "m2", title: "Framing & Structural", dueDate: "Mar 1, 2026", status: "completed", percentage: 25 },
      { id: "m3", title: "Rough-In (MEP)", dueDate: "Apr 1, 2026", status: "in_progress", percentage: 45 },
      { id: "m4", title: "Drywall & Finishes", dueDate: "May 1, 2026", status: "upcoming", percentage: 70 },
      { id: "m5", title: "Final Walkthrough", dueDate: "Jun 15, 2026", status: "upcoming", percentage: 95 },
      { id: "m6", title: "Project Closeout", dueDate: "Jun 30, 2026", status: "upcoming", percentage: 100 },
    ],
    payments: [
      { id: "p1", description: "Initial deposit", amount: 17000, dueDate: "Jan 15, 2026", status: "paid", paidDate: "Jan 14, 2026" },
      { id: "p2", description: "Demolition completion", amount: 8500, dueDate: "Feb 5, 2026", status: "paid", paidDate: "Feb 4, 2026" },
      { id: "p3", description: "Framing milestone", amount: 17000, dueDate: "Mar 5, 2026", status: "paid", paidDate: "Mar 6, 2026" },
      { id: "p4", description: "Rough-in completion", amount: 17000, dueDate: "Apr 5, 2026", status: "due" },
      { id: "p5", description: "Finishes milestone", amount: 17000, dueDate: "May 10, 2026", status: "upcoming" },
      { id: "p6", description: "Final payment", amount: 8500, dueDate: "Jun 30, 2026", status: "upcoming" },
    ],
    documents: [
      { id: "d1", name: "Signed Contract.pdf", type: "PDF", size: "2.4 MB", uploadedDate: "Jan 12, 2026" },
      { id: "d2", name: "Insurance Certificate.pdf", type: "PDF", size: "1.1 MB", uploadedDate: "Jan 12, 2026" },
      { id: "d3", name: "Scope of Work.pdf", type: "PDF", size: "856 KB", uploadedDate: "Jan 10, 2026" },
      { id: "d4", name: "Change Order #1.pdf", type: "PDF", size: "340 KB", uploadedDate: "Feb 28, 2026" },
    ],
    terms: [
      { id: "t1", title: "Payment Terms", content: "Net 5 days upon milestone completion. Late payments subject to 1.5% monthly interest." },
      { id: "t2", title: "Warranty", content: "1-year warranty on all workmanship. Materials covered by manufacturer warranties." },
      { id: "t3", title: "Termination", content: "Either party may terminate with 30 days written notice. Payment due for completed work." },
      { id: "t4", title: "Dispute Resolution", content: "Disputes resolved through mediation before arbitration. Venue: Travis County, TX." },
      { id: "t5", title: "Insurance Requirements", content: "Contractor maintains $1M general liability and workers' compensation coverage." },
    ],
    changeOrders: [
      { id: "co1", title: "Additional outlet installations", amount: 2400, status: "approved", date: "Feb 28, 2026", description: "Add 8 additional electrical outlets in kitchen and living room per owner request." },
      { id: "co2", title: "Upgraded bathroom fixtures", amount: 1800, status: "pending", date: "Mar 10, 2026", description: "Upgrade to premium shower fixtures and faucets in master bathroom." },
    ],
    createdDate: "Jan 8, 2026",
    signedDate: "Jan 12, 2026",
    lastModified: "Mar 10, 2026",
  },
  "2": {
    id: "2",
    title: "Electrical Wiring Contract",
    vendor: "PowerLine Electric",
    vendorContact: "James Wilson",
    vendorPhone: "(555) 345-6789",
    vendorEmail: "james@powerline.com",
    property: "456 Maple Ave",
    propertyAddress: "456 Maple Ave, Austin, TX 78702",
    amount: 12500,
    paidAmount: 5000,
    startDate: "Feb 1, 2026",
    endDate: "Mar 15, 2026",
    status: "active",
    contractNumber: "CNT-2026-0058",
    description: "Complete electrical system upgrade including panel replacement, new wiring throughout, and smart home integration.",
    scope: [
      "200-amp electrical panel upgrade",
      "Full house rewiring (copper)",
      "Smart home wiring infrastructure",
      "Outdoor lighting installation",
      "Final inspection coordination",
    ],
    milestones: [
      { id: "m1", title: "Panel Upgrade", dueDate: "Feb 10, 2026", status: "completed", percentage: 30 },
      { id: "m2", title: "Rough-In Wiring", dueDate: "Feb 25, 2026", status: "in_progress", percentage: 60 },
      { id: "m3", title: "Trim & Devices", dueDate: "Mar 8, 2026", status: "upcoming", percentage: 85 },
      { id: "m4", title: "Final Inspection", dueDate: "Mar 15, 2026", status: "upcoming", percentage: 100 },
    ],
    payments: [
      { id: "p1", description: "Deposit (40%)", amount: 5000, dueDate: "Feb 1, 2026", status: "paid", paidDate: "Jan 30, 2026" },
      { id: "p2", description: "Rough-in complete", amount: 3750, dueDate: "Feb 28, 2026", status: "due" },
      { id: "p3", description: "Final payment", amount: 3750, dueDate: "Mar 15, 2026", status: "upcoming" },
    ],
    documents: [
      { id: "d1", name: "Electrical Contract.pdf", type: "PDF", size: "1.8 MB", uploadedDate: "Jan 28, 2026" },
      { id: "d2", name: "License & Insurance.pdf", type: "PDF", size: "920 KB", uploadedDate: "Jan 28, 2026" },
    ],
    terms: [
      { id: "t1", title: "Payment Terms", content: "40% deposit, 30% at rough-in, 30% at completion." },
      { id: "t2", title: "Warranty", content: "5-year warranty on all electrical work." },
      { id: "t3", title: "Code Compliance", content: "All work per NEC 2023 and local amendments." },
    ],
    changeOrders: [],
    createdDate: "Jan 25, 2026",
    signedDate: "Jan 28, 2026",
    lastModified: "Feb 10, 2026",
  },
  "3": {
    id: "3",
    title: "Interior Painting Agreement",
    vendor: "ColorPro Painters",
    vendorContact: "Maria Garcia",
    vendorPhone: "(555) 456-7890",
    vendorEmail: "maria@colorpro.com",
    property: "123 Oak Street",
    propertyAddress: "123 Oak Street, Austin, TX 78701",
    amount: 8200,
    paidAmount: 0,
    startDate: "Mar 1, 2026",
    endDate: "Mar 20, 2026",
    status: "pending",
    contractNumber: "CNT-2026-0071",
    description: "Interior painting of all rooms including prep work, priming, and two coats of premium paint.",
    scope: [
      "Surface preparation and patching",
      "Priming all surfaces",
      "Two coats of Sherwin-Williams Emerald",
      "Trim and door painting",
      "Final touch-ups and cleanup",
    ],
    milestones: [
      { id: "m1", title: "Prep Work", dueDate: "Mar 3, 2026", status: "upcoming", percentage: 20 },
      { id: "m2", title: "Priming Complete", dueDate: "Mar 8, 2026", status: "upcoming", percentage: 40 },
      { id: "m3", title: "First Coat", dueDate: "Mar 13, 2026", status: "upcoming", percentage: 65 },
      { id: "m4", title: "Final Coat & Touch-ups", dueDate: "Mar 20, 2026", status: "upcoming", percentage: 100 },
    ],
    payments: [
      { id: "p1", description: "Deposit (25%)", amount: 2050, dueDate: "Mar 1, 2026", status: "upcoming" },
      { id: "p2", description: "Mid-project", amount: 4100, dueDate: "Mar 12, 2026", status: "upcoming" },
      { id: "p3", description: "Completion", amount: 2050, dueDate: "Mar 20, 2026", status: "upcoming" },
    ],
    documents: [
      { id: "d1", name: "Painting Contract.pdf", type: "PDF", size: "1.2 MB", uploadedDate: "Feb 20, 2026" },
      { id: "d2", name: "Color Selections.pdf", type: "PDF", size: "3.5 MB", uploadedDate: "Feb 22, 2026" },
    ],
    terms: [
      { id: "t1", title: "Payment Terms", content: "25% deposit, 50% at mid-project, 25% at completion." },
      { id: "t2", title: "Warranty", content: "2-year warranty on paint adhesion and workmanship." },
    ],
    changeOrders: [],
    createdDate: "Feb 18, 2026",
    signedDate: "Feb 20, 2026",
    lastModified: "Feb 22, 2026",
  },
  "4": {
    id: "4",
    title: "Plumbing Services Contract",
    vendor: "AquaFix Plumbing",
    vendorContact: "David Chen",
    vendorPhone: "(555) 567-8901",
    vendorEmail: "david@aquafix.com",
    property: "789 Pine Blvd",
    propertyAddress: "789 Pine Blvd, Austin, TX 78703",
    amount: 15000,
    paidAmount: 15000,
    startDate: "Dec 1, 2025",
    endDate: "Jan 31, 2026",
    status: "completed",
    contractNumber: "CNT-2025-0198",
    description: "Complete plumbing renovation including new supply lines, drain replacement, and fixture installation.",
    scope: [
      "Demo existing plumbing",
      "New copper supply lines",
      "PVC drain system replacement",
      "Water heater installation",
      "Fixture installation (kitchen & 2 baths)",
    ],
    milestones: [
      { id: "m1", title: "Demo & Rough-In", dueDate: "Dec 15, 2025", status: "completed", percentage: 35 },
      { id: "m2", title: "Supply & Drain", dueDate: "Jan 5, 2026", status: "completed", percentage: 65 },
      { id: "m3", title: "Fixtures & Testing", dueDate: "Jan 20, 2026", status: "completed", percentage: 90 },
      { id: "m4", title: "Final Inspection", dueDate: "Jan 31, 2026", status: "completed", percentage: 100 },
    ],
    payments: [
      { id: "p1", description: "Deposit", amount: 4500, dueDate: "Dec 1, 2025", status: "paid", paidDate: "Nov 30, 2025" },
      { id: "p2", description: "Rough-in complete", amount: 5250, dueDate: "Dec 18, 2025", status: "paid", paidDate: "Dec 17, 2025" },
      { id: "p3", description: "Final payment", amount: 5250, dueDate: "Jan 31, 2026", status: "paid", paidDate: "Jan 30, 2026" },
    ],
    documents: [
      { id: "d1", name: "Plumbing Contract.pdf", type: "PDF", size: "1.6 MB", uploadedDate: "Nov 28, 2025" },
      { id: "d2", name: "Final Inspection Report.pdf", type: "PDF", size: "780 KB", uploadedDate: "Jan 31, 2026" },
    ],
    terms: [
      { id: "t1", title: "Payment Terms", content: "30% deposit, 35% at rough-in, 35% at final." },
      { id: "t2", title: "Warranty", content: "3-year warranty on all plumbing work." },
    ],
    changeOrders: [],
    createdDate: "Nov 25, 2025",
    signedDate: "Nov 28, 2025",
    lastModified: "Jan 31, 2026",
  },
  "5": {
    id: "5",
    title: "Landscaping Maintenance",
    vendor: "GreenScape LLC",
    vendorContact: "Sarah Johnson",
    vendorPhone: "(555) 678-9012",
    vendorEmail: "sarah@greenscape.com",
    property: "456 Maple Ave",
    propertyAddress: "456 Maple Ave, Austin, TX 78702",
    amount: 4500,
    paidAmount: 4500,
    startDate: "Sep 1, 2025",
    endDate: "Nov 30, 2025",
    status: "expired",
    contractNumber: "CNT-2025-0156",
    description: "Seasonal landscaping maintenance including mowing, trimming, and fall cleanup.",
    scope: [
      "Weekly lawn mowing and edging",
      "Bi-weekly hedge trimming",
      "Monthly fertilization",
      "Fall leaf cleanup",
      "Irrigation system winterization",
    ],
    milestones: [
      { id: "m1", title: "Month 1 Complete", dueDate: "Oct 1, 2025", status: "completed", percentage: 33 },
      { id: "m2", title: "Month 2 Complete", dueDate: "Nov 1, 2025", status: "completed", percentage: 66 },
      { id: "m3", title: "Season Closeout", dueDate: "Nov 30, 2025", status: "completed", percentage: 100 },
    ],
    payments: [
      { id: "p1", description: "Month 1", amount: 1500, dueDate: "Sep 30, 2025", status: "paid", paidDate: "Sep 28, 2025" },
      { id: "p2", description: "Month 2", amount: 1500, dueDate: "Oct 31, 2025", status: "paid", paidDate: "Oct 30, 2025" },
      { id: "p3", description: "Month 3", amount: 1500, dueDate: "Nov 30, 2025", status: "paid", paidDate: "Nov 29, 2025" },
    ],
    documents: [
      { id: "d1", name: "Maintenance Agreement.pdf", type: "PDF", size: "980 KB", uploadedDate: "Aug 28, 2025" },
    ],
    terms: [
      { id: "t1", title: "Payment Terms", content: "Monthly invoicing, net 15 days." },
      { id: "t2", title: "Service Guarantee", content: "Re-service within 48 hours if not satisfied." },
    ],
    changeOrders: [],
    createdDate: "Aug 25, 2025",
    signedDate: "Aug 28, 2025",
    lastModified: "Nov 30, 2025",
  },
};

const statusConfig = {
  active: { label: "Active", color: "#10B981", bg: "#ECFDF5", icon: CheckCircle },
  pending: { label: "Pending", color: "#272D53", bg: "#E8E9EE", icon: Clock },
  expired: { label: "Expired", color: "#EF4444", bg: "#FEF2F2", icon: AlertCircle },
  completed: { label: "Completed", color: "#3B82F6", bg: "#EFF6FF", icon: CheckCircle },
};

const milestoneStatusColors: Record<string, { color: string; bg: string }> = {
  completed: { color: "#10B981", bg: "#ECFDF5" },
  in_progress: { color: "#3B82F6", bg: "#EFF6FF" },
  upcoming: { color: "#9CA3AF", bg: "#F3F4F6" },
  overdue: { color: "#EF4444", bg: "#FEF2F2" },
};

const paymentStatusConfig: Record<string, { color: string; bg: string; label: string }> = {
  paid: { color: "#10B981", bg: "#ECFDF5", label: "Paid" },
  due: { color: "#272D53", bg: "#E8E9EE", label: "Due" },
  upcoming: { color: "#9CA3AF", bg: "#F3F4F6", label: "Upcoming" },
  overdue: { color: "#EF4444", bg: "#FEF2F2", label: "Overdue" },
};

const changeOrderStatusConfig: Record<string, { color: string; bg: string; label: string }> = {
  approved: { color: "#10B981", bg: "#ECFDF5", label: "Approved" },
  pending: { color: "#272D53", bg: "#E8E9EE", label: "Pending" },
  rejected: { color: "#EF4444", bg: "#FEF2F2", label: "Rejected" },
};

type TabKey = "overview" | "payments" | "milestones" | "documents";

const tabs: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "payments", label: "Payments" },
  { key: "milestones", label: "Milestones" },
  { key: "documents", label: "Documents" },
];

export default function ContractDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const scrollY = useRef(new Animated.Value(0)).current;

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const contract = mockContractDetails[id || "1"];

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const cfg = contract ? statusConfig[contract.status] : statusConfig.pending;
  const StatusIcon = cfg.icon;
  const progressPct = contract ? contract.paidAmount / contract.amount : 0;
  const completedMilestones = contract ? contract.milestones.filter((m) => m.status === "completed").length : 0;
  const totalMilestones = contract ? contract.milestones.length : 0;

  const renderOverview = useCallback(() => {if (!contract) return null; return (
    <View style={styles.tabContent}>
      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Description</Text>
        <Text style={[styles.descriptionText, { color: theme.textSecondary }]}>{contract.description}</Text>
      </View>

      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Contractor</Text>
        <View style={styles.contactCard}>
          <View style={[styles.contactAvatar, { backgroundColor: isDark ? "#1E3A5F" : "#E8F0FE" }]}>
            <User size={22} color={isDark ? "#58A6FF" : "#1E2A3B"} strokeWidth={1.5} />
          </View>
          <View style={styles.contactInfo}>
            <Text style={[styles.contactName, { color: theme.text }]}>{contract.vendorContact}</Text>
            <Text style={[styles.contactCompany, { color: theme.textSecondary }]}>{contract.vendor}</Text>
          </View>
        </View>
        <View style={styles.contactActions}>
          <TouchableOpacity style={[styles.contactAction, { backgroundColor: isDark ? "#1E3A5F" : "#E8F0FE" }]}>
            <Phone size={16} color={isDark ? "#58A6FF" : "#1E2A3B"} strokeWidth={1.5} />
            <Text style={[styles.contactActionText, { color: isDark ? "#58A6FF" : "#1E2A3B" }]}>{contract.vendorPhone}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.contactAction, { backgroundColor: isDark ? "#1E3A5F" : "#E8F0FE" }]}>
            <Mail size={16} color={isDark ? "#58A6FF" : "#1E2A3B"} strokeWidth={1.5} />
            <Text style={[styles.contactActionText, { color: isDark ? "#58A6FF" : "#1E2A3B" }]} numberOfLines={1}>{contract.vendorEmail}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Scope of Work</Text>
        {contract.scope.map((item, index) => (
          <View key={index} style={styles.scopeItem}>
            <View style={[styles.scopeDot, { backgroundColor: theme.navy }]} />
            <Text style={[styles.scopeText, { color: theme.textSecondary }]}>{item}</Text>
          </View>
        ))}
      </View>

      {contract.changeOrders.length > 0 && (
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }]}>Change Orders</Text>
            <View style={[styles.countBadge, { backgroundColor: isDark ? "#30363D" : "#F3F4F6" }]}>
              <Text style={[styles.countBadgeText, { color: theme.textSecondary }]}>{contract.changeOrders.length}</Text>
            </View>
          </View>
          {contract.changeOrders.map((co) => {
            const coCfg = changeOrderStatusConfig[co.status];
            return (
              <View key={co.id} style={[styles.changeOrderCard, { backgroundColor: isDark ? theme.surfaceSecondary : "#FAFAFA", borderColor: theme.border }]}>
                <View style={styles.changeOrderHeader}>
                  <Text style={[styles.changeOrderTitle, { color: theme.text }]}>{co.title}</Text>
                  <View style={[styles.smallBadge, { backgroundColor: coCfg.bg }]}>
                    <Text style={[styles.smallBadgeText, { color: coCfg.color }]}>{coCfg.label}</Text>
                  </View>
                </View>
                <Text style={[styles.changeOrderDesc, { color: theme.textSecondary }]}>{co.description}</Text>
                <View style={styles.changeOrderFooter}>
                  <Text style={[styles.changeOrderAmount, { color: theme.text }]}>+${co.amount.toLocaleString()}</Text>
                  <Text style={[styles.changeOrderDate, { color: theme.textTertiary }]}>{co.date}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Key Terms</Text>
        {contract.terms.map((term, index) => (
          <View key={term.id} style={[styles.termItem, index < contract.terms.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
            <Text style={[styles.termTitle, { color: theme.text }]}>{term.title}</Text>
            <Text style={[styles.termContent, { color: theme.textSecondary }]}>{term.content}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Timeline</Text>
        <View style={styles.timelineRow}>
          <View style={styles.timelineItem}>
            <Text style={[styles.timelineLabel, { color: theme.textTertiary }]}>Created</Text>
            <Text style={[styles.timelineValue, { color: theme.text }]}>{contract.createdDate}</Text>
          </View>
          <View style={styles.timelineItem}>
            <Text style={[styles.timelineLabel, { color: theme.textTertiary }]}>Signed</Text>
            <Text style={[styles.timelineValue, { color: theme.text }]}>{contract.signedDate}</Text>
          </View>
          <View style={styles.timelineItem}>
            <Text style={[styles.timelineLabel, { color: theme.textTertiary }]}>Modified</Text>
            <Text style={[styles.timelineValue, { color: theme.text }]}>{contract.lastModified}</Text>
          </View>
        </View>
      </View>
    </View>
  );}, [contract, theme, isDark]);

  const renderPayments = useCallback(() => {
    if (!contract) return null;
    const totalPaid = contract.payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount, 0);
    const totalDue = contract.payments.filter((p) => p.status === "due").reduce((sum, p) => sum + p.amount, 0);
    return (
      <View style={styles.tabContent}>
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <View style={styles.paymentSummaryRow}>
            <View style={styles.paymentSummaryItem}>
              <Text style={[styles.paymentSummaryLabel, { color: theme.textTertiary }]}>Total</Text>
              <Text style={[styles.paymentSummaryValue, { color: theme.text }]}>${contract.amount.toLocaleString()}</Text>
            </View>
            <View style={[styles.paymentSummaryDivider, { backgroundColor: theme.border }]} />
            <View style={styles.paymentSummaryItem}>
              <Text style={[styles.paymentSummaryLabel, { color: theme.textTertiary }]}>Paid</Text>
              <Text style={[styles.paymentSummaryValue, { color: "#10B981" }]}>${totalPaid.toLocaleString()}</Text>
            </View>
            <View style={[styles.paymentSummaryDivider, { backgroundColor: theme.border }]} />
            <View style={styles.paymentSummaryItem}>
              <Text style={[styles.paymentSummaryLabel, { color: theme.textTertiary }]}>Due Now</Text>
              <Text style={[styles.paymentSummaryValue, { color: totalDue > 0 ? "#272D53" : theme.textTertiary }]}>${totalDue.toLocaleString()}</Text>
            </View>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarTrack, { backgroundColor: isDark ? "#21262D" : "#F3F4F6" }]}>
              <View style={[styles.progressBarFill, { width: `${Math.min(progressPct * 100, 100)}%`, backgroundColor: "#10B981" }]} />
            </View>
            <Text style={[styles.progressLabel, { color: theme.textTertiary }]}>{Math.round(progressPct * 100)}% paid</Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Payment Schedule</Text>
          {contract.payments.map((payment, index) => {
            const pCfg = paymentStatusConfig[payment.status];
            return (
              <View key={payment.id} style={[styles.paymentItem, index < contract.payments.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
                <View style={styles.paymentItemLeft}>
                  <View style={[styles.paymentDot, { backgroundColor: pCfg.color }]} />
                  <View>
                    <Text style={[styles.paymentDescription, { color: theme.text }]}>{payment.description}</Text>
                    <Text style={[styles.paymentDate, { color: theme.textTertiary }]}>
                      {payment.status === "paid" ? `Paid ${payment.paidDate}` : `Due ${payment.dueDate}`}
                    </Text>
                  </View>
                </View>
                <View style={styles.paymentItemRight}>
                  <Text style={[styles.paymentAmount, { color: theme.text }]}>${payment.amount.toLocaleString()}</Text>
                  <View style={[styles.smallBadge, { backgroundColor: pCfg.bg }]}>
                    <Text style={[styles.smallBadgeText, { color: pCfg.color }]}>{pCfg.label}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  }, [contract, theme, isDark, progressPct]);

  const renderMilestones = useCallback(() => {if (!contract) return null; return (
    <View style={styles.tabContent}>
      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <View style={styles.milestoneProgress}>
          <Text style={[styles.milestoneSummary, { color: theme.text }]}>
            {completedMilestones} of {totalMilestones} milestones completed
          </Text>
          <View style={[styles.progressBarTrack, { backgroundColor: isDark ? "#21262D" : "#F3F4F6" }]}>
            <View style={[styles.progressBarFill, { width: `${(completedMilestones / totalMilestones) * 100}%`, backgroundColor: "#10B981" }]} />
          </View>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        {contract.milestones.map((milestone, index) => {
          const mCfg = milestoneStatusColors[milestone.status];
          const isLast = index === contract.milestones.length - 1;
          return (
            <View key={milestone.id} style={styles.milestoneItem}>
              <View style={styles.milestoneTimeline}>
                <View style={[styles.milestoneCircle, { backgroundColor: mCfg.bg, borderColor: mCfg.color }]}>
                  {milestone.status === "completed" ? (
                    <CheckCircle size={14} color={mCfg.color} strokeWidth={2} />
                  ) : milestone.status === "in_progress" ? (
                    <CircleDot size={14} color={mCfg.color} strokeWidth={2} />
                  ) : (
                    <Clock size={14} color={mCfg.color} strokeWidth={2} />
                  )}
                </View>
                {!isLast && <View style={[styles.milestoneConnector, { backgroundColor: milestone.status === "completed" ? "#10B981" : theme.border }]} />}
              </View>
              <View style={[styles.milestoneContent, !isLast && { paddingBottom: 24 }]}>
                <View style={styles.milestoneHeader}>
                  <Text style={[styles.milestoneTitle, { color: theme.text }]}>{milestone.title}</Text>
                  <Text style={[styles.milestonePercentage, { color: mCfg.color }]}>{milestone.percentage}%</Text>
                </View>
                <Text style={[styles.milestoneDue, { color: theme.textTertiary }]}>{milestone.dueDate}</Text>
                <View style={[styles.smallBadge, { backgroundColor: mCfg.bg, alignSelf: "flex-start" as const, marginTop: 6 }]}>
                  <Text style={[styles.smallBadgeText, { color: mCfg.color }]}>
                    {milestone.status === "in_progress" ? "In Progress" : milestone.status.charAt(0).toUpperCase() + milestone.status.slice(1)}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );}, [contract, theme, isDark, completedMilestones, totalMilestones]);

  const renderDocuments = useCallback(() => {if (!contract) return null; return (
    <View style={styles.tabContent}>
      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Contract Documents</Text>
        {contract.documents.map((doc, index) => (
          <TouchableOpacity
            key={doc.id}
            style={[styles.documentItem, index < contract.documents.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }]}
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
  );}, [contract, theme, isDark]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview": return renderOverview();
      case "payments": return renderPayments();
      case "milestones": return renderMilestones();
      case "documents": return renderDocuments();
      default: return renderOverview();
    }
  };

  if (!contract) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <SafeAreaView edges={["top"]} style={styles.safeArea}>
          <View style={styles.header}>
            <BackButton onPress={handleBack} />
          </View>
          <View style={styles.emptyState}>
            <FileText size={48} color={theme.textTertiary} strokeWidth={1} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Contract Not Found</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              {"This contract may have been removed or doesn't exist."}
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
            <Text style={[styles.floatingHeaderTitle, { color: theme.text }]} numberOfLines={1}>{contract.title}</Text>
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
            <View style={[styles.contractIconLarge, { backgroundColor: isDark ? "#1B2838" : "#EEF2FF" }]}>
              <FileText size={32} color={isDark ? "#6B8AFF" : "#4F46E5"} strokeWidth={1.5} />
            </View>
            <View style={[styles.statusBadgeLarge, { backgroundColor: cfg.bg }]}>
              <StatusIcon size={14} color={cfg.color} strokeWidth={2} />
              <Text style={[styles.statusTextLarge, { color: cfg.color }]}>{cfg.label}</Text>
            </View>
            <Text style={[styles.contractTitle, { color: theme.text }]}>{contract.title}</Text>
            <Text style={[styles.contractNumber, { color: theme.textTertiary }]}>{contract.contractNumber}</Text>

            <View style={styles.quickStats}>
              <View style={[styles.statCard, { backgroundColor: isDark ? theme.surfaceSecondary : "#F8FAFC" }]}>
                <DollarSign size={18} color="#10B981" strokeWidth={1.5} />
                <Text style={[styles.statValue, { color: theme.text }]}>${contract.amount.toLocaleString()}</Text>
                <Text style={[styles.statLabel, { color: theme.textTertiary }]}>Total Value</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: isDark ? theme.surfaceSecondary : "#F8FAFC" }]}>
                <Calendar size={18} color="#3B82F6" strokeWidth={1.5} />
                <Text style={[styles.statValue, { color: theme.text }]}>{contract.startDate.split(",")[0]}</Text>
                <Text style={[styles.statLabel, { color: theme.textTertiary }]}>Start Date</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: isDark ? theme.surfaceSecondary : "#F8FAFC" }]}>
                <Clock size={18} color="#272D53" strokeWidth={1.5} />
                <Text style={[styles.statValue, { color: theme.text }]}>{contract.endDate.split(",")[0]}</Text>
                <Text style={[styles.statLabel, { color: theme.textTertiary }]}>End Date</Text>
              </View>
            </View>

            <View style={styles.propertyRow}>
              <MapPin size={14} color={theme.textSecondary} strokeWidth={1.5} />
              <Text style={[styles.propertyText, { color: theme.textSecondary }]}>{contract.propertyAddress}</Text>
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
  contractIconLarge: {
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
  contractTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    textAlign: "center",
    marginBottom: 4,
    lineHeight: 28,
  },
  contractNumber: {
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
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    marginBottom: 14,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: "600" as const,
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
  changeOrderCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  changeOrderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  changeOrderTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    flex: 1,
    marginRight: 8,
  },
  changeOrderDesc: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 10,
  },
  changeOrderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  changeOrderAmount: {
    fontSize: 15,
    fontWeight: "700" as const,
  },
  changeOrderDate: {
    fontSize: 12,
  },
  termItem: {
    paddingVertical: 12,
  },
  termTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    marginBottom: 4,
  },
  termContent: {
    fontSize: 13,
    lineHeight: 20,
  },
  timelineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timelineItem: {
    alignItems: "center",
    flex: 1,
  },
  timelineLabel: {
    fontSize: 11,
    fontWeight: "500" as const,
    marginBottom: 4,
  },
  timelineValue: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  paymentSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  paymentSummaryItem: {
    flex: 1,
    alignItems: "center",
  },
  paymentSummaryDivider: {
    width: 1,
    height: 32,
  },
  paymentSummaryLabel: {
    fontSize: 11,
    fontWeight: "500" as const,
    marginBottom: 4,
  },
  paymentSummaryValue: {
    fontSize: 16,
    fontWeight: "700" as const,
  },
  progressBarContainer: {
    gap: 6,
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
  progressLabel: {
    fontSize: 12,
    fontWeight: "500" as const,
    textAlign: "right" as const,
  },
  paymentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
  paymentItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  paymentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  paymentDescription: {
    fontSize: 14,
    fontWeight: "500" as const,
    marginBottom: 2,
  },
  paymentDate: {
    fontSize: 12,
  },
  paymentItemRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  paymentAmount: {
    fontSize: 15,
    fontWeight: "700" as const,
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
  milestoneProgress: {
    gap: 10,
  },
  milestoneSummary: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  milestoneItem: {
    flexDirection: "row",
  },
  milestoneTimeline: {
    alignItems: "center",
    width: 36,
    marginRight: 12,
  },
  milestoneCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  milestoneConnector: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  milestoneContent: {
    flex: 1,
    paddingTop: 2,
  },
  milestoneHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  milestoneTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  milestonePercentage: {
    fontSize: 13,
    fontWeight: "700" as const,
  },
  milestoneDue: {
    fontSize: 12,
    marginTop: 2,
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
