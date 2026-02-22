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
import { useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import {
  ArrowLeft,
  Plus,
  Search,
  X,
  FileText,
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronRight,
  Building,
  Home,
  Zap,
  ClipboardList,
  Edit3,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";

type PermitStatus = "draft" | "submitted" | "approved" | "scheduled" | "passed" | "failed" | "expired";
type PermitType = "residential" | "commercial" | "industrial";
type InspectionType = "rough_in" | "underground" | "service" | "final" | "low_voltage" | "ev_charger";

interface Permit {
  id: string;
  permitNumber: string;
  projectName: string;
  projectAddress: string;
  type: PermitType;
  inspectionType: InspectionType;
  status: PermitStatus;
  submissionDate: string;
  approvalDate?: string;
  expirationDate?: string;
  scheduledInspection?: {
    date: string;
    time: string;
    inspector?: string;
    phone?: string;
  };
  inspectionResults?: {
    date: string;
    result: "passed" | "failed";
    notes?: string;
    corrections?: string[];
  };
  fee: number;
  notes?: string;
}

interface Inspector {
  id: string;
  name: string;
  phone: string;
  email: string;
  jurisdiction: string;
}

const mockPermits: Permit[] = [
  {
    id: "1",
    permitNumber: "EP-2025-0142",
    projectName: "Johnson Kitchen Remodel",
    projectAddress: "123 Oak Street, Springfield",
    type: "residential",
    inspectionType: "rough_in",
    status: "scheduled",
    submissionDate: "2025-01-15",
    approvalDate: "2025-01-18",
    scheduledInspection: {
      date: "2025-01-28",
      time: "9:00 AM - 12:00 PM",
      inspector: "Mike Thompson",
      phone: "(555) 234-5678",
    },
    fee: 150,
    notes: "200A panel upgrade, new circuits for kitchen appliances",
  },
  {
    id: "2",
    permitNumber: "EP-2025-0138",
    projectName: "Smith EV Charger Install",
    projectAddress: "456 Maple Ave, Springfield",
    type: "residential",
    inspectionType: "ev_charger",
    status: "passed",
    submissionDate: "2025-01-10",
    approvalDate: "2025-01-12",
    scheduledInspection: {
      date: "2025-01-20",
      time: "1:00 PM - 4:00 PM",
      inspector: "Sarah Wilson",
    },
    inspectionResults: {
      date: "2025-01-20",
      result: "passed",
      notes: "Installation meets all NEC requirements",
    },
    fee: 100,
  },
  {
    id: "3",
    permitNumber: "EP-2025-0145",
    projectName: "Downtown Office Buildout",
    projectAddress: "789 Commerce Blvd, Suite 200",
    type: "commercial",
    inspectionType: "rough_in",
    status: "submitted",
    submissionDate: "2025-01-22",
    fee: 450,
    notes: "New tenant buildout, 400A 3-phase service",
  },
  {
    id: "4",
    permitNumber: "EP-2025-0130",
    projectName: "Garcia Bathroom Addition",
    projectAddress: "321 Pine Road, Riverside",
    type: "residential",
    inspectionType: "final",
    status: "failed",
    submissionDate: "2025-01-05",
    approvalDate: "2025-01-08",
    scheduledInspection: {
      date: "2025-01-18",
      time: "9:00 AM - 12:00 PM",
      inspector: "Mike Thompson",
    },
    inspectionResults: {
      date: "2025-01-18",
      result: "failed",
      notes: "Corrections required before re-inspection",
      corrections: [
        "GFCI protection missing on bathroom receptacle",
        "Box fill exceeded in junction box above vanity",
        "Missing cable staple within 12\" of box",
      ],
    },
    fee: 125,
  },
];

const mockInspectors: Inspector[] = [
  { id: "1", name: "Mike Thompson", phone: "(555) 234-5678", email: "mthompson@city.gov", jurisdiction: "Springfield" },
  { id: "2", name: "Sarah Wilson", phone: "(555) 345-6789", email: "swilson@city.gov", jurisdiction: "Springfield" },
  { id: "3", name: "James Rodriguez", phone: "(555) 456-7890", email: "jrodriguez@county.gov", jurisdiction: "Riverside" },
];

const inspectionTypeLabels: Record<InspectionType, string> = {
  rough_in: "Rough-In",
  underground: "Underground",
  service: "Service Entrance",
  final: "Final",
  low_voltage: "Low Voltage",
  ev_charger: "EV Charger",
};

const statusConfig: Record<PermitStatus, { label: string; color: string; bgColor: string; icon: any }> = {
  draft: { label: "Draft", color: "#6B7280", bgColor: "#F3F4F6", icon: Edit3 },
  submitted: { label: "Submitted", color: "#3B82F6", bgColor: "#DBEAFE", icon: Clock },
  approved: { label: "Approved", color: "#8B5CF6", bgColor: "#EDE9FE", icon: CheckCircle },
  scheduled: { label: "Scheduled", color: "#272D53", bgColor: "#E8E9EE", icon: Calendar },
  passed: { label: "Passed", color: "#22C55E", bgColor: "#DCFCE7", icon: CheckCircle },
  failed: { label: "Failed", color: "#DC2626", bgColor: "#FEE2E2", icon: XCircle },
  expired: { label: "Expired", color: "#6B7280", bgColor: "#F3F4F6", icon: AlertCircle },
};

export default function ElectricalPermitsScreen() {
  const router = useRouter();
  const [permits, setPermits] = useState<Permit[]>(mockPermits);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<PermitStatus | "all">("all");
  const [selectedPermit, setSelectedPermit] = useState<Permit | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInspectorsModal, setShowInspectorsModal] = useState(false);
  const [newPermit, setNewPermit] = useState({
    projectName: "",
    projectAddress: "",
    type: "residential" as PermitType,
    inspectionType: "rough_in" as InspectionType,
    notes: "",
  });

  const filteredPermits = useMemo(() => {
    return permits.filter((p) => {
      const matchesSearch =
        p.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.permitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.projectAddress.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === "all" || p.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [permits, searchQuery, filterStatus]);

  const stats = useMemo(() => {
    return {
      pending: permits.filter((p) => p.status === "submitted" || p.status === "approved").length,
      scheduled: permits.filter((p) => p.status === "scheduled").length,
      passed: permits.filter((p) => p.status === "passed").length,
      failed: permits.filter((p) => p.status === "failed").length,
    };
  }, [permits]);

  const handleCreatePermit = useCallback(() => {
    if (!newPermit.projectName || !newPermit.projectAddress) {
      Alert.alert("Error", "Please fill in project name and address");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const permit: Permit = {
      id: Date.now().toString(),
      permitNumber: `EP-2025-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      projectName: newPermit.projectName,
      projectAddress: newPermit.projectAddress,
      type: newPermit.type,
      inspectionType: newPermit.inspectionType,
      status: "draft",
      submissionDate: new Date().toISOString().split("T")[0],
      fee: newPermit.type === "commercial" ? 450 : newPermit.type === "industrial" ? 750 : 150,
      notes: newPermit.notes,
    };

    setPermits((prev) => [permit, ...prev]);
    setNewPermit({ projectName: "", projectAddress: "", type: "residential", inspectionType: "rough_in", notes: "" });
    setShowAddModal(false);
    Alert.alert("Permit Created", `Permit ${permit.permitNumber} has been created as a draft.`);
  }, [newPermit]);

  const handleCallInspector = useCallback((phone: string) => {
    Linking.openURL(`tel:${phone}`);
  }, []);

  const handleSubmitPermit = useCallback((permit: Permit) => {
    Alert.alert("Submit Permit", `Submit ${permit.permitNumber} to the building department?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Submit",
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setPermits((prev) =>
            prev.map((p) => (p.id === permit.id ? { ...p, status: "submitted" as PermitStatus } : p))
          );
          setSelectedPermit((prev) => (prev ? { ...prev, status: "submitted" as PermitStatus } : null));
        },
      },
    ]);
  }, []);

  const renderPermitCard = (permit: Permit) => {
    const status = statusConfig[permit.status];
    const StatusIcon = status.icon;
    const TypeIcon = permit.type === "commercial" ? Building : permit.type === "industrial" ? Zap : Home;

    return (
      <TouchableOpacity
        key={permit.id}
        style={styles.permitCard}
        onPress={() => setSelectedPermit(permit)}
        activeOpacity={0.7}
      >
        <View style={styles.permitHeader}>
          <View style={[styles.typeIcon, { backgroundColor: permit.type === "commercial" ? "#EDE9FE" : permit.type === "industrial" ? "#E8E9EE" : "#DBEAFE" }]}>
            <TypeIcon size={20} color={permit.type === "commercial" ? "#8B5CF6" : permit.type === "industrial" ? "#272D53" : "#3B82F6"} />
          </View>
          <View style={styles.permitInfo}>
            <Text style={styles.permitNumber}>{permit.permitNumber}</Text>
            <Text style={styles.projectName}>{permit.projectName}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bgColor }]}>
            <StatusIcon size={12} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.permitDetails}>
          <View style={styles.detailRow}>
            <MapPin size={14} color={Colors.textTertiary} />
            <Text style={styles.detailText} numberOfLines={1}>{permit.projectAddress}</Text>
          </View>
          <View style={styles.detailRow}>
            <ClipboardList size={14} color={Colors.textTertiary} />
            <Text style={styles.detailText}>{inspectionTypeLabels[permit.inspectionType]} Inspection</Text>
          </View>
        </View>

        {permit.scheduledInspection && permit.status === "scheduled" && (
          <View style={styles.scheduledBanner}>
            <Calendar size={14} color="#272D53" />
            <Text style={styles.scheduledText}>
              {permit.scheduledInspection.date} • {permit.scheduledInspection.time}
            </Text>
          </View>
        )}

        {permit.status === "failed" && permit.inspectionResults?.corrections && (
          <View style={styles.failedBanner}>
            <AlertCircle size={14} color="#DC2626" />
            <Text style={styles.failedText}>
              {permit.inspectionResults.corrections.length} correction(s) required
            </Text>
          </View>
        )}

        <View style={styles.permitFooter}>
          <Text style={styles.dateText}>Submitted: {permit.submissionDate}</Text>
          <ChevronRight size={18} color={Colors.textTertiary} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Electrical Permits",
          headerLeft: () => <BackButton />,
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={() => setShowInspectorsModal(true)} style={styles.headerButton}>
                <Phone size={22} color={Colors.text} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.headerButton}>
                <Plus size={24} color="#EAB308" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: "#DBEAFE" }]}>
            <Text style={[styles.statValue, { color: "#1D4ED8" }]}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#E8E9EE" }]}>
            <Text style={[styles.statValue, { color: "#B45309" }]}>{stats.scheduled}</Text>
            <Text style={styles.statLabel}>Scheduled</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#DCFCE7" }]}>
            <Text style={[styles.statValue, { color: "#15803D" }]}>{stats.passed}</Text>
            <Text style={styles.statLabel}>Passed</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#FEE2E2" }]}>
            <Text style={[styles.statValue, { color: "#B91C1C" }]}>{stats.failed}</Text>
            <Text style={styles.statLabel}>Failed</Text>
          </View>
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Search size={18} color={Colors.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search permits..."
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

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContainer}>
          {(["all", "scheduled", "submitted", "approved", "passed", "failed"] as const).map((status) => (
            <TouchableOpacity
              key={status}
              style={[styles.filterChip, filterStatus === status && styles.filterChipActive]}
              onPress={() => setFilterStatus(status)}
            >
              <Text style={[styles.filterChipText, filterStatus === status && styles.filterChipTextActive]}>
                {status === "all" ? "All" : statusConfig[status as PermitStatus].label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.permitsSection}>
          <Text style={styles.sectionTitle}>Permits ({filteredPermits.length})</Text>
          {filteredPermits.length === 0 ? (
            <View style={styles.emptyState}>
              <FileText size={48} color={Colors.textTertiary} />
              <Text style={styles.emptyText}>No permits found</Text>
            </View>
          ) : (
            filteredPermits.map(renderPermitCard)
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal visible={selectedPermit !== null} animationType="slide" presentationStyle="pageSheet">
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
              <View style={styles.permitDetailCard}>
                <View style={styles.permitDetailHeader}>
                  <Text style={styles.permitDetailNumber}>{selectedPermit.permitNumber}</Text>
                  <View style={[styles.statusBadgeLarge, { backgroundColor: statusConfig[selectedPermit.status].bgColor }]}>
                    {React.createElement(statusConfig[selectedPermit.status].icon, { size: 16, color: statusConfig[selectedPermit.status].color })}
                    <Text style={[styles.statusTextLarge, { color: statusConfig[selectedPermit.status].color }]}>
                      {statusConfig[selectedPermit.status].label}
                    </Text>
                  </View>
                </View>
                <Text style={styles.permitDetailProject}>{selectedPermit.projectName}</Text>
                <View style={styles.addressRow}>
                  <MapPin size={16} color={Colors.textSecondary} />
                  <Text style={styles.addressText}>{selectedPermit.projectAddress}</Text>
                </View>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.infoSectionTitle}>Permit Information</Text>
                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Type</Text>
                    <Text style={styles.infoValue}>{selectedPermit.type.charAt(0).toUpperCase() + selectedPermit.type.slice(1)}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Inspection</Text>
                    <Text style={styles.infoValue}>{inspectionTypeLabels[selectedPermit.inspectionType]}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Fee</Text>
                    <Text style={styles.infoValue}>${selectedPermit.fee}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Submitted</Text>
                    <Text style={styles.infoValue}>{selectedPermit.submissionDate}</Text>
                  </View>
                </View>
              </View>

              {selectedPermit.notes && (
                <View style={styles.notesSection}>
                  <Text style={styles.infoSectionTitle}>Notes</Text>
                  <Text style={styles.notesText}>{selectedPermit.notes}</Text>
                </View>
              )}

              {selectedPermit.scheduledInspection && (
                <View style={styles.inspectionSection}>
                  <Text style={styles.infoSectionTitle}>Scheduled Inspection</Text>
                  <View style={styles.inspectionCard}>
                    <View style={styles.inspectionRow}>
                      <Calendar size={18} color="#272D53" />
                      <Text style={styles.inspectionDate}>{selectedPermit.scheduledInspection.date}</Text>
                    </View>
                    <View style={styles.inspectionRow}>
                      <Clock size={18} color={Colors.textSecondary} />
                      <Text style={styles.inspectionTime}>{selectedPermit.scheduledInspection.time}</Text>
                    </View>
                    {selectedPermit.scheduledInspection.inspector && (
                      <View style={styles.inspectorRow}>
                        <User size={18} color={Colors.textSecondary} />
                        <Text style={styles.inspectorName}>{selectedPermit.scheduledInspection.inspector}</Text>
                        {selectedPermit.scheduledInspection.phone && (
                          <TouchableOpacity
                            style={styles.callButton}
                            onPress={() => handleCallInspector(selectedPermit.scheduledInspection!.phone!)}
                          >
                            <Phone size={16} color="#FFFFFF" />
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              )}

              {selectedPermit.inspectionResults && (
                <View style={styles.resultsSection}>
                  <Text style={styles.infoSectionTitle}>Inspection Results</Text>
                  <View style={[styles.resultsCard, selectedPermit.inspectionResults.result === "passed" ? styles.resultsCardPassed : styles.resultsCardFailed]}>
                    <View style={styles.resultsHeader}>
                      {selectedPermit.inspectionResults.result === "passed" ? (
                        <CheckCircle size={24} color="#22C55E" />
                      ) : (
                        <XCircle size={24} color="#DC2626" />
                      )}
                      <Text style={[styles.resultsStatus, selectedPermit.inspectionResults.result === "passed" ? styles.resultsPassed : styles.resultsFailed]}>
                        {selectedPermit.inspectionResults.result === "passed" ? "PASSED" : "FAILED"}
                      </Text>
                      <Text style={styles.resultsDate}>{selectedPermit.inspectionResults.date}</Text>
                    </View>
                    {selectedPermit.inspectionResults.notes && (
                      <Text style={styles.resultsNotes}>{selectedPermit.inspectionResults.notes}</Text>
                    )}
                    {selectedPermit.inspectionResults.corrections && selectedPermit.inspectionResults.corrections.length > 0 && (
                      <View style={styles.correctionsSection}>
                        <Text style={styles.correctionsTitle}>Required Corrections:</Text>
                        {selectedPermit.inspectionResults.corrections.map((correction, index) => (
                          <View key={index} style={styles.correctionItem}>
                            <View style={styles.correctionBullet} />
                            <Text style={styles.correctionText}>{correction}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              )}

              {selectedPermit.status === "draft" && (
                <TouchableOpacity style={styles.submitButton} onPress={() => handleSubmitPermit(selectedPermit)}>
                  <Text style={styles.submitButtonText}>Submit Permit Application</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>

      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Permit</Text>
            <TouchableOpacity onPress={handleCreatePermit}>
              <CheckCircle size={24} color="#22C55E" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Project Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Kitchen Remodel"
                placeholderTextColor={Colors.textTertiary}
                value={newPermit.projectName}
                onChangeText={(text) => setNewPermit({ ...newPermit, projectName: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Project Address *</Text>
              <TextInput
                style={styles.input}
                placeholder="Full street address"
                placeholderTextColor={Colors.textTertiary}
                value={newPermit.projectAddress}
                onChangeText={(text) => setNewPermit({ ...newPermit, projectAddress: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Permit Type</Text>
              <View style={styles.typeSelector}>
                {(["residential", "commercial", "industrial"] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.typeOption, newPermit.type === type && styles.typeOptionActive]}
                    onPress={() => setNewPermit({ ...newPermit, type })}
                  >
                    {type === "residential" ? <Home size={18} color={newPermit.type === type ? "#FFFFFF" : Colors.text} /> :
                     type === "commercial" ? <Building size={18} color={newPermit.type === type ? "#FFFFFF" : Colors.text} /> :
                     <Zap size={18} color={newPermit.type === type ? "#FFFFFF" : Colors.text} />}
                    <Text style={[styles.typeOptionText, newPermit.type === type && styles.typeOptionTextActive]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Inspection Type</Text>
              <View style={styles.inspectionSelector}>
                {(Object.keys(inspectionTypeLabels) as InspectionType[]).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.inspectionOption, newPermit.inspectionType === type && styles.inspectionOptionActive]}
                    onPress={() => setNewPermit({ ...newPermit, inspectionType: type })}
                  >
                    <Text style={[styles.inspectionOptionText, newPermit.inspectionType === type && styles.inspectionOptionTextActive]}>
                      {inspectionTypeLabels[type]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Work description, panel size, circuits, etc."
                placeholderTextColor={Colors.textTertiary}
                value={newPermit.notes}
                onChangeText={(text) => setNewPermit({ ...newPermit, notes: text })}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.feePreview}>
              <Text style={styles.feeLabel}>Estimated Fee</Text>
              <Text style={styles.feeValue}>
                ${newPermit.type === "commercial" ? 450 : newPermit.type === "industrial" ? 750 : 150}
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal visible={showInspectorsModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowInspectorsModal(false)}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Inspectors</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.inspectorIntro}>
              Contact local electrical inspectors for questions or to schedule inspections.
            </Text>
            {mockInspectors.map((inspector) => (
              <View key={inspector.id} style={styles.inspectorCard}>
                <View style={styles.inspectorAvatar}>
                  <User size={24} color="#FFFFFF" />
                </View>
                <View style={styles.inspectorInfo}>
                  <Text style={styles.inspectorCardName}>{inspector.name}</Text>
                  <Text style={styles.inspectorJurisdiction}>{inspector.jurisdiction}</Text>
                  <View style={styles.inspectorContact}>
                    <TouchableOpacity
                      style={styles.inspectorContactButton}
                      onPress={() => handleCallInspector(inspector.phone)}
                    >
                      <Phone size={14} color="#3B82F6" />
                      <Text style={styles.inspectorContactText}>{inspector.phone}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
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
  headerButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  scrollView: {
    flex: 1,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  statCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700" as const,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
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
  filterScroll: {
    maxHeight: 44,
  },
  filterContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
  permitsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  permitCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  permitHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  typeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  permitInfo: {
    flex: 1,
  },
  permitNumber: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  projectName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  permitDetails: {
    gap: 6,
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  scheduledBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#E8E9EE",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  scheduledText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "#92400E",
  },
  failedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  failedText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "#991B1B",
  },
  permitFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 10,
  },
  dateText: {
    fontSize: 12,
    color: Colors.textTertiary,
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
    backgroundColor: Colors.surface,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  permitDetailCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  permitDetailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  permitDetailNumber: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  statusBadgeLarge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusTextLarge: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  permitDetailProject: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  addressText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  infoSection: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  infoSectionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  infoItem: {
    width: "45%",
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  notesSection: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  notesText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  inspectionSection: {
    marginBottom: 16,
  },
  inspectionCard: {
    backgroundColor: "#FEF9C3",
    borderRadius: 14,
    padding: 16,
    gap: 10,
  },
  inspectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  inspectionDate: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#92400E",
  },
  inspectionTime: {
    fontSize: 14,
    color: "#78350F",
  },
  inspectorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
  },
  inspectorName: {
    flex: 1,
    fontSize: 14,
    color: "#78350F",
  },
  callButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#22C55E",
    alignItems: "center",
    justifyContent: "center",
  },
  resultsSection: {
    marginBottom: 16,
  },
  resultsCard: {
    borderRadius: 14,
    padding: 16,
  },
  resultsCardPassed: {
    backgroundColor: "#DCFCE7",
  },
  resultsCardFailed: {
    backgroundColor: "#FEE2E2",
  },
  resultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  resultsStatus: {
    fontSize: 16,
    fontWeight: "700" as const,
    flex: 1,
  },
  resultsPassed: {
    color: "#15803D",
  },
  resultsFailed: {
    color: "#B91C1C",
  },
  resultsDate: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  resultsNotes: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  correctionsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  correctionsTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#B91C1C",
    marginBottom: 8,
  },
  correctionItem: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 6,
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
  submitButton: {
    backgroundColor: "#22C55E",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 32,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  typeSelector: {
    flexDirection: "row",
    gap: 8,
  },
  typeOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  typeOptionActive: {
    backgroundColor: "#EAB308",
    borderColor: "#EAB308",
  },
  typeOptionText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  typeOptionTextActive: {
    color: "#FFFFFF",
  },
  inspectionSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  inspectionOption: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  inspectionOptionActive: {
    backgroundColor: "#DBEAFE",
    borderColor: "#3B82F6",
  },
  inspectionOptionText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.text,
  },
  inspectionOptionTextActive: {
    color: "#1D4ED8",
  },
  feePreview: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 32,
  },
  feeLabel: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  feeValue: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  inspectorIntro: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  inspectorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    gap: 14,
  },
  inspectorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
  },
  inspectorInfo: {
    flex: 1,
  },
  inspectorCardName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  inspectorJurisdiction: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  inspectorContact: {
    flexDirection: "row",
    marginTop: 6,
  },
  inspectorContactButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  inspectorContactText: {
    fontSize: 13,
    color: "#3B82F6",
    fontWeight: "500" as const,
  },
});
