import React, { useState } from "react";
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
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Search,
  Plus,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  MapPin,
  ChevronRight,
  X,
  Upload,
  Download,
  Eye,
  Phone,

  Building,
  Droplets,
  Filter,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";

type PermitStatus = "draft" | "submitted" | "under_review" | "approved" | "rejected" | "expired";
type PermitType = "building" | "electrical" | "plumbing" | "pool_barrier" | "health_dept" | "zoning";

interface PoolPermit {
  id: string;
  type: PermitType;
  permitNumber?: string;
  projectName: string;
  projectAddress: string;
  status: PermitStatus;
  submittedDate?: string;
  approvedDate?: string;
  expirationDate?: string;
  inspector?: string;
  inspectorPhone?: string;
  notes?: string;
  documents: { name: string; type: string }[];
  fee: number;
  feePaid: boolean;
}

const permitTypeConfig: Record<PermitType, { label: string; color: string; icon: any }> = {
  building: { label: "Building Permit", color: "#3B82F6", icon: Building },
  electrical: { label: "Electrical Permit", color: "#272D53", icon: FileText },
  plumbing: { label: "Plumbing Permit", color: "#06B6D4", icon: Droplets },
  pool_barrier: { label: "Pool Barrier/Fence", color: "#8B5CF6", icon: FileText },
  health_dept: { label: "Health Department", color: "#10B981", icon: FileText },
  zoning: { label: "Zoning Approval", color: "#EC4899", icon: MapPin },
};

const statusConfig: Record<PermitStatus, { label: string; color: string; bg: string }> = {
  draft: { label: "Draft", color: "#6B7280", bg: "#F3F4F6" },
  submitted: { label: "Submitted", color: "#3B82F6", bg: "#DBEAFE" },
  under_review: { label: "Under Review", color: "#272D53", bg: "#E8E9EE" },
  approved: { label: "Approved", color: "#22C55E", bg: "#DCFCE7" },
  rejected: { label: "Rejected", color: "#EF4444", bg: "#FEE2E2" },
  expired: { label: "Expired", color: "#DC2626", bg: "#FEE2E2" },
};

const mockPermits: PoolPermit[] = [
  {
    id: "pp1",
    type: "building",
    permitNumber: "BP-2026-4521",
    projectName: "Thompson Residence Pool",
    projectAddress: "4521 Lakewood Drive, Austin, TX",
    status: "approved",
    submittedDate: "2026-01-22",
    approvedDate: "2026-02-03",
    expirationDate: "2027-02-03",
    inspector: "J. Martinez",
    inspectorPhone: "(512) 555-1234",
    notes: "All structural requirements met",
    documents: [
      { name: "Site Plan", type: "pdf" },
      { name: "Engineering Report", type: "pdf" },
      { name: "Pool Design Specs", type: "pdf" },
    ],
    fee: 850,
    feePaid: true,
  },
  {
    id: "pp2",
    type: "electrical",
    permitNumber: "EP-2026-1234",
    projectName: "Thompson Residence Pool",
    projectAddress: "4521 Lakewood Drive, Austin, TX",
    status: "approved",
    submittedDate: "2026-01-25",
    approvedDate: "2026-02-05",
    expirationDate: "2027-02-05",
    inspector: "R. Davis",
    inspectorPhone: "(512) 555-2345",
    documents: [
      { name: "Electrical Plan", type: "pdf" },
      { name: "Load Calculations", type: "pdf" },
    ],
    fee: 350,
    feePaid: true,
  },
  {
    id: "pp3",
    type: "plumbing",
    permitNumber: "PP-2026-5678",
    projectName: "Thompson Residence Pool",
    projectAddress: "4521 Lakewood Drive, Austin, TX",
    status: "approved",
    submittedDate: "2026-01-25",
    approvedDate: "2026-02-05",
    expirationDate: "2027-02-05",
    documents: [
      { name: "Plumbing Layout", type: "pdf" },
    ],
    fee: 275,
    feePaid: true,
  },
  {
    id: "pp4",
    type: "pool_barrier",
    projectName: "Adams Infinity Pool",
    projectAddress: "8234 Hill Country Blvd, Lakeway, TX",
    status: "under_review",
    submittedDate: "2026-01-28",
    notes: "Awaiting fence height verification",
    documents: [
      { name: "Fence Plan", type: "pdf" },
      { name: "Safety Gate Specs", type: "pdf" },
    ],
    fee: 150,
    feePaid: true,
  },
  {
    id: "pp5",
    type: "building",
    projectName: "Adams Infinity Pool",
    projectAddress: "8234 Hill Country Blvd, Lakeway, TX",
    status: "submitted",
    submittedDate: "2026-01-30",
    documents: [
      { name: "Site Plan", type: "pdf" },
      { name: "Engineering Report", type: "pdf" },
    ],
    fee: 950,
    feePaid: false,
  },
  {
    id: "pp6",
    type: "health_dept",
    projectName: "Commercial Resort Pool",
    projectAddress: "2100 Resort Way, Dripping Springs, TX",
    status: "draft",
    notes: "Need to complete water treatment plan",
    documents: [],
    fee: 500,
    feePaid: false,
  },
];

type TabType = "all" | "pending" | "approved";

export default function PoolPermitsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPermit, setSelectedPermit] = useState<PoolPermit | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterType, setFilterType] = useState<PermitType | "all">("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const [newPermit, setNewPermit] = useState({
    type: "building" as PermitType,
    projectName: "",
    projectAddress: "",
    notes: "",
  });

  const filteredPermits = mockPermits.filter(permit => {
    const matchesSearch = 
      permit.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      permit.projectAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (permit.permitNumber?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTab = 
      activeTab === "all" ||
      (activeTab === "pending" && ["draft", "submitted", "under_review"].includes(permit.status)) ||
      (activeTab === "approved" && permit.status === "approved");

    const matchesType = filterType === "all" || permit.type === filterType;

    return matchesSearch && matchesTab && matchesType;
  });

  const stats = {
    total: mockPermits.length,
    pending: mockPermits.filter(p => ["draft", "submitted", "under_review"].includes(p.status)).length,
    approved: mockPermits.filter(p => p.status === "approved").length,
    needsAttention: mockPermits.filter(p => p.status === "rejected" || p.status === "expired" || !p.feePaid).length,
  };

  const handleAddPermit = () => {
    if (!newPermit.projectName || !newPermit.projectAddress) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }
    Alert.alert("Success", "Permit application created! You can now upload required documents.");
    setShowAddModal(false);
    setNewPermit({ type: "building", projectName: "", projectAddress: "", notes: "" });
  };

  const handleCallInspector = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const renderPermitCard = (permit: PoolPermit) => {
    const typeConfig = permitTypeConfig[permit.type];
    const status = statusConfig[permit.status];
    const TypeIcon = typeConfig.icon;

    return (
      <TouchableOpacity
        key={permit.id}
        style={styles.permitCard}
        onPress={() => setSelectedPermit(permit)}
      >
        <View style={styles.permitHeader}>
          <View style={[styles.typeIcon, { backgroundColor: `${typeConfig.color}15` }]}>
            <TypeIcon size={20} color={typeConfig.color} />
          </View>
          <View style={styles.permitInfo}>
            <Text style={styles.permitType}>{typeConfig.label}</Text>
            {permit.permitNumber && (
              <Text style={styles.permitNumber}>#{permit.permitNumber}</Text>
            )}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <Text style={styles.projectName}>{permit.projectName}</Text>
        <View style={styles.addressRow}>
          <MapPin size={12} color={Colors.textSecondary} />
          <Text style={styles.addressText} numberOfLines={1}>{permit.projectAddress}</Text>
        </View>

        <View style={styles.permitMeta}>
          {permit.submittedDate && (
            <View style={styles.metaItem}>
              <Calendar size={12} color={Colors.textSecondary} />
              <Text style={styles.metaText}>Submitted: {permit.submittedDate}</Text>
            </View>
          )}
          <View style={styles.metaItem}>
            <FileText size={12} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{permit.documents.length} docs</Text>
          </View>
        </View>

        {!permit.feePaid && (
          <View style={styles.feeWarning}>
            <AlertCircle size={14} color="#272D53" />
            <Text style={styles.feeWarningText}>Fee pending: ${permit.fee}</Text>
          </View>
        )}

        <View style={styles.cardFooter}>
          <ChevronRight size={18} color={Colors.textTertiary} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Pool Permits",
          headerLeft: () => <BackButton />,
          headerRight: () => (
            <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
              <Plus size={20} color={Colors.white} />
            </TouchableOpacity>
          ),
          headerStyle: { backgroundColor: Colors.background },
          headerShadowVisible: false,
        }}
      />

      <View style={styles.headerSection}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <FileText size={18} color="#3B82F6" />
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Clock size={18} color="#272D53" />
            <Text style={styles.statValue}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <CheckCircle size={18} color={Colors.success} />
            <Text style={styles.statValue}>{stats.approved}</Text>
            <Text style={styles.statLabel}>Approved</Text>
          </View>
          <View style={styles.statCard}>
            <AlertCircle size={18} color={Colors.error} />
            <Text style={[styles.statValue, stats.needsAttention > 0 && { color: Colors.error }]}>
              {stats.needsAttention}
            </Text>
            <Text style={styles.statLabel}>Attention</Text>
          </View>
        </View>

        <View style={styles.tabContainer}>
          {([
            { key: "all" as const, label: "All" },
            { key: "pending" as const, label: "Pending" },
            { key: "approved" as const, label: "Approved" },
          ]).map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={18} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search permits..."
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilterDropdown(!showFilterDropdown)}
        >
          <Filter size={18} color={filterType !== "all" ? "#0EA5E9" : Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {showFilterDropdown && (
        <View style={styles.filterDropdown}>
          <TouchableOpacity
            style={styles.filterOption}
            onPress={() => { setFilterType("all"); setShowFilterDropdown(false); }}
          >
            <Text style={[styles.filterOptionText, filterType === "all" && styles.filterOptionActive]}>
              All Types
            </Text>
          </TouchableOpacity>
          {Object.entries(permitTypeConfig).map(([key, config]) => (
            <TouchableOpacity
              key={key}
              style={styles.filterOption}
              onPress={() => { setFilterType(key as PermitType); setShowFilterDropdown(false); }}
            >
              <View style={[styles.filterDot, { backgroundColor: config.color }]} />
              <Text style={[styles.filterOptionText, filterType === key && styles.filterOptionActive]}>
                {config.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredPermits.map(permit => renderPermitCard(permit))}

        {filteredPermits.length === 0 && (
          <View style={styles.emptyState}>
            <FileText size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Permits Found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? "Try adjusting your search" : "Add your first pool permit"}
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={!!selectedPermit}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedPermit(null)}
      >
        {selectedPermit && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedPermit(null)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Permit Details</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.detailHeader}>
                <View style={[styles.detailTypeIcon, { backgroundColor: `${permitTypeConfig[selectedPermit.type].color}15` }]}>
                  {React.createElement(permitTypeConfig[selectedPermit.type].icon, {
                    size: 28,
                    color: permitTypeConfig[selectedPermit.type].color,
                  })}
                </View>
                <Text style={styles.detailType}>{permitTypeConfig[selectedPermit.type].label}</Text>
                {selectedPermit.permitNumber && (
                  <Text style={styles.detailPermitNumber}>#{selectedPermit.permitNumber}</Text>
                )}
                <View style={[styles.detailStatusBadge, { backgroundColor: statusConfig[selectedPermit.status].bg }]}>
                  <Text style={[styles.detailStatusText, { color: statusConfig[selectedPermit.status].color }]}>
                    {statusConfig[selectedPermit.status].label}
                  </Text>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Project</Text>
                <Text style={styles.detailProjectName}>{selectedPermit.projectName}</Text>
                <View style={styles.detailAddressRow}>
                  <MapPin size={14} color={Colors.textSecondary} />
                  <Text style={styles.detailAddress}>{selectedPermit.projectAddress}</Text>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Timeline</Text>
                <View style={styles.timelineCard}>
                  {selectedPermit.submittedDate && (
                    <View style={styles.timelineRow}>
                      <Text style={styles.timelineLabel}>Submitted</Text>
                      <Text style={styles.timelineValue}>{selectedPermit.submittedDate}</Text>
                    </View>
                  )}
                  {selectedPermit.approvedDate && (
                    <View style={styles.timelineRow}>
                      <Text style={styles.timelineLabel}>Approved</Text>
                      <Text style={[styles.timelineValue, { color: Colors.success }]}>
                        {selectedPermit.approvedDate}
                      </Text>
                    </View>
                  )}
                  {selectedPermit.expirationDate && (
                    <View style={styles.timelineRow}>
                      <Text style={styles.timelineLabel}>Expires</Text>
                      <Text style={styles.timelineValue}>{selectedPermit.expirationDate}</Text>
                    </View>
                  )}
                </View>
              </View>

              {selectedPermit.inspector && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Inspector</Text>
                  <View style={styles.inspectorCard}>
                    <Text style={styles.inspectorName}>{selectedPermit.inspector}</Text>
                    {selectedPermit.inspectorPhone && (
                      <TouchableOpacity 
                        style={styles.callInspectorBtn}
                        onPress={() => handleCallInspector(selectedPermit.inspectorPhone!)}
                      >
                        <Phone size={16} color={Colors.white} />
                        <Text style={styles.callInspectorText}>Call</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Fee</Text>
                <View style={styles.feeCard}>
                  <Text style={styles.feeAmount}>${selectedPermit.fee}</Text>
                  <View style={[
                    styles.feeBadge, 
                    { backgroundColor: selectedPermit.feePaid ? "#DCFCE7" : "#E8E9EE" }
                  ]}>
                    <Text style={[
                      styles.feeBadgeText, 
                      { color: selectedPermit.feePaid ? "#22C55E" : "#272D53" }
                    ]}>
                      {selectedPermit.feePaid ? "Paid" : "Pending"}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Documents ({selectedPermit.documents.length})</Text>
                {selectedPermit.documents.length > 0 ? (
                  selectedPermit.documents.map((doc, idx) => (
                    <View key={idx} style={styles.documentRow}>
                      <FileText size={16} color={Colors.textSecondary} />
                      <Text style={styles.documentName}>{doc.name}</Text>
                      <View style={styles.documentActions}>
                        <TouchableOpacity style={styles.docActionBtn}>
                          <Eye size={16} color={Colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.docActionBtn}>
                          <Download size={16} color={Colors.primary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                ) : (
                  <TouchableOpacity style={styles.uploadDocBtn}>
                    <Upload size={18} color="#0EA5E9" />
                    <Text style={styles.uploadDocText}>Upload Documents</Text>
                  </TouchableOpacity>
                )}
              </View>

              {selectedPermit.notes && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Notes</Text>
                  <Text style={styles.notesText}>{selectedPermit.notes}</Text>
                </View>
              )}

              <View style={{ height: 40 }} />
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>

      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Permit Application</Text>
            <TouchableOpacity onPress={handleAddPermit}>
              <Text style={styles.saveText}>Create</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContent}>
            <Text style={styles.formLabel}>Permit Type *</Text>
            <View style={styles.typeGrid}>
              {Object.entries(permitTypeConfig).map(([key, config]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.typeOption,
                    newPermit.type === key && { borderColor: config.color, backgroundColor: `${config.color}10` }
                  ]}
                  onPress={() => setNewPermit(prev => ({ ...prev, type: key as PermitType }))}
                >
                  {React.createElement(config.icon, {
                    size: 20,
                    color: newPermit.type === key ? config.color : Colors.textSecondary,
                  })}
                  <Text style={[
                    styles.typeOptionText,
                    newPermit.type === key && { color: config.color }
                  ]}>
                    {config.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.formLabel}>Project Name *</Text>
            <TextInput
              style={styles.formInput}
              placeholder="e.g., Thompson Residence Pool"
              placeholderTextColor={Colors.textTertiary}
              value={newPermit.projectName}
              onChangeText={(text) => setNewPermit(prev => ({ ...prev, projectName: text }))}
            />

            <Text style={styles.formLabel}>Project Address *</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Full address"
              placeholderTextColor={Colors.textTertiary}
              value={newPermit.projectAddress}
              onChangeText={(text) => setNewPermit(prev => ({ ...prev, projectAddress: text }))}
            />

            <Text style={styles.formLabel}>Notes</Text>
            <TextInput
              style={[styles.formInput, styles.formTextArea]}
              placeholder="Any additional notes..."
              placeholderTextColor={Colors.textTertiary}
              value={newPermit.notes}
              onChangeText={(text) => setNewPermit(prev => ({ ...prev, notes: text }))}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
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
    marginLeft: 8,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#0EA5E9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  headerSection: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800" as const,
    color: Colors.text,
    marginTop: 6,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: "row",
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: "#0EA5E9",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.white,
  },
  searchSection: {
    flexDirection: "row",
    padding: 20,
    paddingBottom: 12,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    paddingVertical: 12,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  filterDropdown: {
    position: "absolute",
    top: 180,
    right: 20,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  filterOptionText: {
    fontSize: 14,
    color: Colors.text,
  },
  filterOptionActive: {
    color: "#0EA5E9",
    fontWeight: "600" as const,
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 8,
    paddingBottom: 100,
  },
  permitCard: {
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
  permitHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  typeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  permitInfo: {
    flex: 1,
  },
  permitType: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  permitNumber: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
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
  projectName: {
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
  permitMeta: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  feeWarning: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#E8E9EE",
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  feeWarningText: {
    fontSize: 13,
    color: "#B45309",
    fontWeight: "500" as const,
  },
  cardFooter: {
    alignItems: "flex-end",
    marginTop: 8,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.text,
    marginTop: 16,
  },
  emptySubtitle: {
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
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  saveText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#0EA5E9",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  detailHeader: {
    alignItems: "center",
    paddingVertical: 20,
  },
  detailTypeIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  detailType: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  detailPermitNumber: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  detailStatusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  detailStatusText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  detailProjectName: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  detailAddressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailAddress: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  timelineCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
  },
  timelineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  timelineLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  timelineValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  inspectorCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
  },
  inspectorName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  callInspectorBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#0EA5E9",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  callInspectorText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  feeCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
  },
  feeAmount: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  feeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  feeBadgeText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  documentRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  documentName: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    marginLeft: 10,
  },
  documentActions: {
    flexDirection: "row",
    gap: 8,
  },
  docActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadDocBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#E0F2FE",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#0EA5E9",
    borderStyle: "dashed",
  },
  uploadDocText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#0EA5E9",
  },
  notesText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
  },
  formContent: {
    flex: 1,
    padding: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  formInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
  },
  formTextArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  typeOption: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    borderColor: "transparent",
  },
  typeOptionText: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: Colors.textSecondary,
    flex: 1,
  },
});
