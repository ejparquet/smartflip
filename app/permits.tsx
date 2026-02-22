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
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import {
  Search,
  FileCheck,
  Calendar,
  MapPin,
  Plus,
  X,
  Hash,
  Building2,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Shield,
  ChevronRight,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import BackButton from "@/components/BackButton";

type PermitStatus = "approved" | "pending" | "expired" | "under_review" | "denied";

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
  applicant: string;
  contractor: string;
  description: string;
  notes?: string;
}

const mockPermits: Permit[] = [
  {
    id: "1",
    title: "Building Permit",
    permitNumber: "BP-2026-0412",
    property: "123 Oak Street",
    type: "Construction",
    issuedDate: "Jan 10, 2026",
    expiryDate: "Jul 10, 2026",
    status: "approved",
    fee: 1250,
    jurisdiction: "Springfield",
    applicant: "John Mitchell",
    contractor: "Smith & Sons Construction",
    description: "New residential construction - single family dwelling, 2,400 sq ft",
  },
  {
    id: "2",
    title: "Electrical Permit",
    permitNumber: "EP-2026-0198",
    property: "456 Maple Ave",
    type: "Electrical",
    issuedDate: "Feb 5, 2026",
    expiryDate: "Aug 5, 2026",
    status: "approved",
    fee: 450,
    jurisdiction: "Springfield",
    applicant: "Sarah Davis",
    contractor: "PowerLine Electric",
    description: "Complete rewiring of residential property, 200A service upgrade",
  },
  {
    id: "3",
    title: "Plumbing Permit",
    permitNumber: "PP-2026-0321",
    property: "123 Oak Street",
    type: "Plumbing",
    issuedDate: "",
    expiryDate: "",
    status: "pending",
    fee: 350,
    jurisdiction: "Springfield",
    applicant: "John Mitchell",
    contractor: "AquaFix Plumbing",
    description: "New plumbing rough-in for kitchen and 2 bathrooms",
    notes: "Awaiting plan review from building department",
  },
  {
    id: "4",
    title: "Demolition Permit",
    permitNumber: "DP-2026-0055",
    property: "789 Pine Blvd",
    type: "Demolition",
    issuedDate: "",
    expiryDate: "",
    status: "under_review",
    fee: 800,
    jurisdiction: "Riverside",
    applicant: "Mike Torres",
    contractor: "Demo Kings LLC",
    description: "Interior demolition of commercial space for renovation",
    notes: "Environmental review in progress",
  },
  {
    id: "5",
    title: "Roofing Permit",
    permitNumber: "RP-2025-0789",
    property: "456 Maple Ave",
    type: "Roofing",
    issuedDate: "Jun 1, 2025",
    expiryDate: "Dec 1, 2025",
    status: "expired",
    fee: 275,
    jurisdiction: "Springfield",
    applicant: "Sarah Davis",
    contractor: "TopShield Roofing",
    description: "Complete roof replacement - architectural shingles",
  },
  {
    id: "6",
    title: "HVAC Permit",
    permitNumber: "HP-2026-0067",
    property: "321 Elm Drive",
    type: "Mechanical",
    issuedDate: "Feb 8, 2026",
    expiryDate: "Aug 8, 2026",
    status: "approved",
    fee: 500,
    jurisdiction: "Riverside",
    applicant: "Lisa Park",
    contractor: "CoolAir Systems",
    description: "New central HVAC installation - 3.5 ton split system",
  },
  {
    id: "7",
    title: "Foundation Permit",
    permitNumber: "FP-2026-0103",
    property: "555 Cedar Lane",
    type: "Structural",
    issuedDate: "",
    expiryDate: "",
    status: "denied",
    fee: 950,
    jurisdiction: "Springfield",
    applicant: "Mark Johnson",
    contractor: "SolidBase Foundations",
    description: "New foundation pour for addition - 800 sq ft",
    notes: "Soil report required before resubmission",
  },
  {
    id: "8",
    title: "Grading Permit",
    permitNumber: "GP-2026-0044",
    property: "789 Pine Blvd",
    type: "Site Work",
    issuedDate: "Jan 28, 2026",
    expiryDate: "Jul 28, 2026",
    status: "approved",
    fee: 600,
    jurisdiction: "Riverside",
    applicant: "Mike Torres",
    contractor: "EarthMovers Inc",
    description: "Site grading and drainage improvement for commercial lot",
  },
];

const statusConfig: Record<PermitStatus, { label: string; color: string; bg: string; icon: React.ComponentType<any> }> = {
  approved: { label: "Approved", color: "#10B981", bg: "#ECFDF5", icon: CheckCircle2 },
  pending: { label: "Pending", color: "#272D53", bg: "#E8E9EE", icon: Clock },
  expired: { label: "Expired", color: "#EF4444", bg: "#FEF2F2", icon: AlertTriangle },
  under_review: { label: "Under Review", color: "#6366F1", bg: "#EEF2FF", icon: FileText },
  denied: { label: "Denied", color: "#DC2626", bg: "#FEE2E2", icon: X },
};

const filters = ["All", "Approved", "Pending", "Under Review", "Expired", "Denied"];

const getPermitTypeColors = (type: string) => {
  switch (type) {
    case "Construction": return { bg: "#DBEAFE", color: "#2563EB" };
    case "Electrical": return { bg: "#E8E9EE", color: "#D97706" };
    case "Plumbing": return { bg: "#E0E7FF", color: "#4F46E5" };
    case "Demolition": return { bg: "#FEE2E2", color: "#DC2626" };
    case "Roofing": return { bg: "#D1FAE5", color: "#059669" };
    case "Mechanical": return { bg: "#FCE7F3", color: "#DB2777" };
    case "Structural": return { bg: "#FED7AA", color: "#C2410C" };
    case "Site Work": return { bg: "#CCFBF1", color: "#0D9488" };
    default: return { bg: "#F3F4F6", color: "#6B7280" };
  }
};

export default function PermitsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedPermit, setSelectedPermit] = useState<Permit | null>(null);

  const stats = useMemo(() => ({
    total: mockPermits.length,
    approved: mockPermits.filter((p) => p.status === "approved").length,
    pending: mockPermits.filter((p) => p.status === "pending" || p.status === "under_review").length,
    expired: mockPermits.filter((p) => p.status === "expired").length,
    totalFees: mockPermits.reduce((sum, p) => sum + p.fee, 0),
  }), []);

  const filtered = useMemo(() => {
    return mockPermits.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.permitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.contractor.toLowerCase().includes(searchQuery.toLowerCase());
      const filterMap: Record<string, string> = {
        Approved: "approved",
        Pending: "pending",
        "Under Review": "under_review",
        Expired: "expired",
        Denied: "denied",
      };
      const matchesFilter = selectedFilter === "All" || p.status === filterMap[selectedFilter];
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, selectedFilter]);

  const renderPermitCard = useCallback((permit: Permit) => {
    const cfg = statusConfig[permit.status];
    const typeColors = getPermitTypeColors(permit.type);

    return (
      <TouchableOpacity
        key={permit.id}
        style={[styles.card, { backgroundColor: theme.surface }]}
        activeOpacity={0.7}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setSelectedPermit(permit);
        }}
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
        <View style={styles.cardMetaRow}>
          <Building2 size={13} color={theme.textTertiary} strokeWidth={1.5} />
          <Text style={[styles.metaText, { color: theme.textTertiary }]}>{permit.contractor}</Text>
        </View>
        <View style={styles.cardFooter}>
          <View style={[styles.typeBadge, { backgroundColor: theme.surfaceSecondary }]}>
            <Text style={[styles.typeText, { color: theme.textSecondary }]}>{permit.type}</Text>
          </View>
          <View style={styles.feeRow}>
            <DollarSign size={12} color={theme.textSecondary} strokeWidth={1.5} />
            <Text style={[styles.feeText, { color: theme.text }]}>{permit.fee.toLocaleString()}</Text>
          </View>
        </View>
        {permit.issuedDate ? (
          <View style={[styles.dateStrip, { backgroundColor: theme.surfaceSecondary }]}>
            <Calendar size={12} color={theme.textTertiary} strokeWidth={1.5} />
            <Text style={[styles.dateStripText, { color: theme.textSecondary }]}>
              {permit.issuedDate} — {permit.expiryDate}
            </Text>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  }, [theme]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.header}>
          <BackButton />
          <Text style={[styles.headerTitle, { color: theme.text }]}>Permits</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.statValue, { color: "#10B981" }]}>{stats.approved}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Approved</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.statValue, { color: "#272D53" }]}>{stats.pending}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Pending</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.statValue, { color: "#EF4444" }]}>{stats.expired}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Expired</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.statValue, { color: theme.navy }]}>{stats.total}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total</Text>
          </View>
        </View>

        <View style={styles.searchRow}>
          <View style={[styles.searchBox, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
            <Search size={18} color={theme.textTertiary} strokeWidth={1.5} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Search permits, properties..."
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
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Permits</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
          <TouchableOpacity
            style={[styles.addFilterBtn, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}
            onPress={() => router.push("/add-permit")}
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
          {filtered.length} permit{filtered.length !== 1 ? "s" : ""}
        </Text>

        <ScrollView
          style={styles.list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <FileCheck size={48} color={theme.textTertiary} strokeWidth={1} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No permits found</Text>
              <Text style={[styles.emptySubtitle, { color: theme.textTertiary }]}>
                Try adjusting your search or filters
              </Text>
            </View>
          ) : (
            filtered.map(renderPermitCard)
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
                  <View style={[styles.statusBadge, { backgroundColor: statusConfig[selectedPermit.status].bg }]}>
                    <Text style={[styles.statusText, { color: statusConfig[selectedPermit.status].color }]}>
                      {statusConfig[selectedPermit.status].label}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.modalCardTitle, { color: theme.text }]}>{selectedPermit.title}</Text>
                <Text style={[styles.modalDescription, { color: theme.textSecondary }]}>{selectedPermit.description}</Text>
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

              <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
                <Text style={[styles.modalSectionTitle, { color: theme.text }]}>People</Text>
                <View style={styles.personRow}>
                  <View style={[styles.personAvatar, { backgroundColor: "#3B82F6" }]}>
                    <Text style={styles.personAvatarText}>{selectedPermit.applicant.charAt(0)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.personName, { color: theme.text }]}>{selectedPermit.applicant}</Text>
                    <Text style={[styles.personRole, { color: theme.textTertiary }]}>Applicant</Text>
                  </View>
                </View>
                <View style={[styles.personDivider, { backgroundColor: theme.borderLight }]} />
                <View style={styles.personRow}>
                  <View style={[styles.personAvatar, { backgroundColor: "#10B981" }]}>
                    <Text style={styles.personAvatarText}>{selectedPermit.contractor.charAt(0)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.personName, { color: theme.text }]}>{selectedPermit.contractor}</Text>
                    <Text style={[styles.personRole, { color: theme.textTertiary }]}>Contractor</Text>
                  </View>
                </View>
              </View>

              {selectedPermit.notes && (
                <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
                  <Text style={[styles.modalSectionTitle, { color: theme.text }]}>Notes</Text>
                  <Text style={[styles.modalNotes, { color: theme.textSecondary }]}>{selectedPermit.notes}</Text>
                </View>
              )}

              {selectedPermit.status === "denied" && (
                <View style={[styles.modalCard, { backgroundColor: "#FEF2F2" }]}>
                  <View style={styles.deniedHeader}>
                    <AlertTriangle size={18} color="#DC2626" strokeWidth={1.5} />
                    <Text style={styles.deniedTitle}>Permit Denied</Text>
                  </View>
                  <Text style={styles.deniedText}>
                    {selectedPermit.notes || "Please contact the building department for more information."}
                  </Text>
                  <TouchableOpacity
                    style={styles.resubmitBtn}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      Alert.alert("Resubmit", "This would open the resubmission form.");
                    }}
                  >
                    <Text style={styles.resubmitBtnText}>Resubmit Application</Text>
                  </TouchableOpacity>
                </View>
              )}

              {selectedPermit.status === "expired" && (
                <View style={[styles.modalCard, { backgroundColor: "#FEF2F2" }]}>
                  <View style={styles.deniedHeader}>
                    <AlertTriangle size={18} color="#EF4444" strokeWidth={1.5} />
                    <Text style={[styles.deniedTitle, { color: "#B91C1C" }]}>Permit Expired</Text>
                  </View>
                  <Text style={styles.deniedText}>
                    This permit has expired. You may need to apply for a renewal.
                  </Text>
                  <TouchableOpacity
                    style={[styles.resubmitBtn, { backgroundColor: "#EF4444" }]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      Alert.alert("Renew", "This would open the renewal form.");
                    }}
                  >
                    <Text style={styles.resubmitBtnText}>Renew Permit</Text>
                  </TouchableOpacity>
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
    marginBottom: 14,
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
    marginTop: 8,
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
  feeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  feeText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  dateStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  dateStripText: {
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
  modalPermitNumber: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  modalCardTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    lineHeight: 20,
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
  personRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 4,
  },
  personAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  personAvatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700" as const,
  },
  personName: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  personRole: {
    fontSize: 12,
    marginTop: 1,
  },
  personDivider: {
    height: 1,
    marginVertical: 10,
  },
  modalNotes: {
    fontSize: 14,
    lineHeight: 20,
  },
  deniedHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  deniedTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#991B1B",
  },
  deniedText: {
    fontSize: 13,
    color: "#7F1D1D",
    lineHeight: 18,
    marginBottom: 14,
  },
  resubmitBtn: {
    backgroundColor: "#DC2626",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  resubmitBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600" as const,
  },
});
