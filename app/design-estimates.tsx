import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from "react-native";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Search,
  Plus,
  Filter,
  X,
  DollarSign,
  Calendar,
  User,
  Mail,
  Phone,
  ChevronRight,
  Send,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Save,
} from "lucide-react-native";
import { Linking, Alert } from "react-native";
import Colors from "@/constants/colors";
import { mockDesignEstimates, DesignEstimate } from "@/mocks/interior-designers";

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
  draft: { label: "Draft", color: "#6B7280", bgColor: "#F3F4F6", icon: FileText },
  sent: { label: "Sent", color: "#3B82F6", bgColor: "#DBEAFE", icon: Send },
  accepted: { label: "Accepted", color: "#10B981", bgColor: "#D1FAE5", icon: CheckCircle },
  declined: { label: "Declined", color: "#EF4444", bgColor: "#FEE2E2", icon: AlertCircle },
  expired: { label: "Expired", color: "#272D53", bgColor: "#E8E9EE", icon: Clock },
};

export default function DesignEstimatesScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedEstimate, setSelectedEstimate] = useState<DesignEstimate | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [estimates, setEstimates] = useState(mockDesignEstimates);
  const [newEstimate, setNewEstimate] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    projectType: "Room Redesign",
    designFee: "",
    furnitureBudget: "",
    laborCosts: "",
    notes: "",
  });

  const filteredEstimates = estimates.filter((estimate) => {
    const matchesSearch =
      estimate.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      estimate.projectType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || estimate.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const totalPending = estimates
    .filter((e) => e.status === "sent")
    .reduce((sum, e) => sum + e.totalEstimate, 0);

  const totalAccepted = estimates
    .filter((e) => e.status === "accepted")
    .reduce((sum, e) => sum + e.totalEstimate, 0);

  const handleEmail = (email: string | undefined) => {
    if (!email) return;
    Linking.openURL(`mailto:${email}`);
  };

  const handlePhone = (phone: string | undefined) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Design Estimates",
          headerStyle: { backgroundColor: Colors.background },
          headerShadowVisible: false,
        }}
      />

      <View style={styles.summaryCards}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Pending</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totalPending)}</Text>
          <Text style={styles.summaryCount}>
            {mockDesignEstimates.filter((e) => e.status === "sent").length} estimates
          </Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: "#D1FAE5" }]}>
          <Text style={[styles.summaryLabel, { color: "#065F46" }]}>Accepted</Text>
          <Text style={[styles.summaryValue, { color: "#10B981" }]}>
            {formatCurrency(totalAccepted)}
          </Text>
          <Text style={[styles.summaryCount, { color: "#065F46" }]}>
            {mockDesignEstimates.filter((e) => e.status === "accepted").length} estimates
          </Text>
        </View>
      </View>

      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search estimates..."
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.statusFilters}
        contentContainerStyle={styles.statusFiltersContent}
      >
        {["all", "draft", "sent", "accepted", "declined", "expired"].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.statusChip,
              selectedStatus === status && styles.statusChipActive,
            ]}
            onPress={() => setSelectedStatus(status)}
          >
            <Text
              style={[
                styles.statusChipText,
                selectedStatus === status && styles.statusChipTextActive,
              ]}
            >
              {status === "all" ? "All" : statusConfig[status]?.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.listHeader}>
          <Text style={styles.listCount}>
            {filteredEstimates.length} Estimate{filteredEstimates.length !== 1 ? "s" : ""}
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Plus size={18} color={Colors.white} />
            <Text style={styles.createButtonText}>New Estimate</Text>
          </TouchableOpacity>
        </View>

        {filteredEstimates.map((estimate) => {
          const StatusIcon = statusConfig[estimate.status]?.icon || FileText;
          return (
            <TouchableOpacity
              key={estimate.id}
              style={styles.estimateCard}
              onPress={() => setSelectedEstimate(estimate)}
            >
              <View style={styles.estimateHeader}>
                <View style={styles.clientInfo}>
                  <View style={styles.clientAvatar}>
                    <User size={20} color={Colors.textSecondary} />
                  </View>
                  <View style={styles.clientDetails}>
                    <Text style={styles.clientName}>{estimate.clientName}</Text>
                    <Text style={styles.projectType}>{estimate.projectType}</Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusConfig[estimate.status]?.bgColor },
                  ]}
                >
                  <StatusIcon size={12} color={statusConfig[estimate.status]?.color} />
                  <Text
                    style={[
                      styles.statusBadgeText,
                      { color: statusConfig[estimate.status]?.color },
                    ]}
                  >
                    {statusConfig[estimate.status]?.label}
                  </Text>
                </View>
              </View>

              <View style={styles.estimateBreakdown}>
                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>Design Fee</Text>
                  <Text style={styles.breakdownValue}>
                    {formatCurrency(estimate.designFee)}
                  </Text>
                </View>
                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>Furniture</Text>
                  <Text style={styles.breakdownValue}>
                    {formatCurrency(estimate.furnitureBudget)}
                  </Text>
                </View>
                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>Labor</Text>
                  <Text style={styles.breakdownValue}>
                    {formatCurrency(estimate.laborCosts)}
                  </Text>
                </View>
              </View>

              <View style={styles.estimateTotal}>
                <Text style={styles.totalLabel}>Total Estimate</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(estimate.totalEstimate)}
                </Text>
              </View>

              <View style={styles.estimateMeta}>
                <View style={styles.metaItem}>
                  <Calendar size={14} color={Colors.textTertiary} />
                  <Text style={styles.metaText}>
                    Valid until {formatDate(estimate.validUntil)}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.roomCount}>
                    {estimate.rooms.length} room{estimate.rooms.length !== 1 ? "s" : ""}
                  </Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.viewDetails}>View Details</Text>
                <ChevronRight size={16} color={Colors.primary} />
              </View>
            </TouchableOpacity>
          );
        })}

        {filteredEstimates.length === 0 && (
          <View style={styles.emptyState}>
            <DollarSign size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Estimates Found</Text>
            <Text style={styles.emptyText}>
              Create your first estimate to get started
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal
        visible={!!selectedEstimate}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedEstimate(null)}
      >
        {selectedEstimate && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setSelectedEstimate(null)}
              >
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Estimate Details</Text>
              <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.modalClientSection}>
                <View style={styles.modalClientAvatar}>
                  <User size={28} color={Colors.textSecondary} />
                </View>
                <View style={styles.modalClientInfo}>
                  <Text style={styles.modalClientName}>
                    {selectedEstimate.clientName}
                  </Text>
                  <Text style={styles.modalProjectType}>
                    {selectedEstimate.projectType}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusConfig[selectedEstimate.status]?.bgColor },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        { color: statusConfig[selectedEstimate.status]?.color },
                      ]}
                    >
                      {statusConfig[selectedEstimate.status]?.label}
                    </Text>
                  </View>
                </View>
              </View>

              {(selectedEstimate.clientEmail || selectedEstimate.clientPhone) && (
                <View style={styles.contactSection}>
                  {selectedEstimate.clientEmail && (
                    <TouchableOpacity 
                      style={styles.contactButton}
                      onPress={() => handleEmail(selectedEstimate.clientEmail)}
                    >
                      <Mail size={18} color="#EC4899" />
                      <Text style={styles.contactButtonText}>
                        {selectedEstimate.clientEmail}
                      </Text>
                    </TouchableOpacity>
                  )}
                  {selectedEstimate.clientPhone && (
                    <TouchableOpacity 
                      style={styles.contactButton}
                      onPress={() => handlePhone(selectedEstimate.clientPhone)}
                    >
                      <Phone size={18} color="#EC4899" />
                      <Text style={styles.contactButtonText}>
                        {selectedEstimate.clientPhone}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Room Breakdown</Text>
                {selectedEstimate.rooms.map((room) => (
                  <View key={room.id} style={styles.roomRow}>
                    <View style={styles.roomInfo}>
                      <Text style={styles.roomName}>{room.name}</Text>
                      {room.notes && (
                        <Text style={styles.roomNotes}>{room.notes}</Text>
                      )}
                    </View>
                    <View style={styles.roomCosts}>
                      <Text style={styles.roomDesignFee}>
                        Design: {formatCurrency(room.designFee)}
                      </Text>
                      <Text style={styles.roomBudget}>
                        Items: {formatCurrency(room.itemsBudget)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Cost Summary</Text>
                <View style={styles.costBreakdown}>
                  <View style={styles.costRow}>
                    <Text style={styles.costLabel}>Design Fee</Text>
                    <Text style={styles.costValue}>
                      {formatCurrency(selectedEstimate.designFee)}
                    </Text>
                  </View>
                  <View style={styles.costRow}>
                    <Text style={styles.costLabel}>Furniture & Items</Text>
                    <Text style={styles.costValue}>
                      {formatCurrency(selectedEstimate.furnitureBudget)}
                    </Text>
                  </View>
                  <View style={styles.costRow}>
                    <Text style={styles.costLabel}>Labor & Installation</Text>
                    <Text style={styles.costValue}>
                      {formatCurrency(selectedEstimate.laborCosts)}
                    </Text>
                  </View>
                  <View style={styles.costRow}>
                    <Text style={styles.costLabel}>Contingency</Text>
                    <Text style={styles.costValue}>
                      {formatCurrency(selectedEstimate.contingency)}
                    </Text>
                  </View>
                  <View style={[styles.costRow, styles.totalRow]}>
                    <Text style={styles.totalCostLabel}>Total</Text>
                    <Text style={styles.totalCostValue}>
                      {formatCurrency(selectedEstimate.totalEstimate)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Valid Until</Text>
                <Text style={styles.validDate}>
                  {formatDate(selectedEstimate.validUntil)}
                </Text>
              </View>

              {selectedEstimate.notes && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Notes</Text>
                  <View style={styles.notesBox}>
                    <Text style={styles.notesText}>{selectedEstimate.notes}</Text>
                  </View>
                </View>
              )}

              {selectedEstimate.status === "draft" && (
                <TouchableOpacity 
                  style={styles.sendButton}
                  onPress={() => {
                    setEstimates(estimates.map(e => 
                      e.id === selectedEstimate.id ? { ...e, status: "sent" as const } : e
                    ));
                    setSelectedEstimate({ ...selectedEstimate, status: "sent" });
                    Alert.alert("Success", "Estimate sent to client!");
                  }}
                >
                  <Send size={18} color={Colors.white} />
                  <Text style={styles.sendButtonText}>Send to Client</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>

      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowCreateModal(false)}
            >
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Estimate</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Client Name</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter client name"
                placeholderTextColor={Colors.textTertiary}
                value={newEstimate.clientName}
                onChangeText={(text) => setNewEstimate({ ...newEstimate, clientName: text })}
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Client Email</Text>
              <TextInput
                style={styles.formInput}
                placeholder="client@email.com"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="email-address"
                value={newEstimate.clientEmail}
                onChangeText={(text) => setNewEstimate({ ...newEstimate, clientEmail: text })}
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Client Phone</Text>
              <TextInput
                style={styles.formInput}
                placeholder="(555) 123-4567"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="phone-pad"
                value={newEstimate.clientPhone}
                onChangeText={(text) => setNewEstimate({ ...newEstimate, clientPhone: text })}
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Project Type</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g., Room Redesign, Full Home"
                placeholderTextColor={Colors.textTertiary}
                value={newEstimate.projectType}
                onChangeText={(text) => setNewEstimate({ ...newEstimate, projectType: text })}
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Design Fee</Text>
              <TextInput
                style={styles.formInput}
                placeholder="$0"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="numeric"
                value={newEstimate.designFee}
                onChangeText={(text) => setNewEstimate({ ...newEstimate, designFee: text })}
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Furniture Budget</Text>
              <TextInput
                style={styles.formInput}
                placeholder="$0"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="numeric"
                value={newEstimate.furnitureBudget}
                onChangeText={(text) => setNewEstimate({ ...newEstimate, furnitureBudget: text })}
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Labor Costs</Text>
              <TextInput
                style={styles.formInput}
                placeholder="$0"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="numeric"
                value={newEstimate.laborCosts}
                onChangeText={(text) => setNewEstimate({ ...newEstimate, laborCosts: text })}
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Notes</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea]}
                placeholder="Add any notes..."
                placeholderTextColor={Colors.textTertiary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={newEstimate.notes}
                onChangeText={(text) => setNewEstimate({ ...newEstimate, notes: text })}
              />
            </View>
          </ScrollView>

          <View style={styles.createFooter}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowCreateModal(false)}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={() => {
                if (!newEstimate.clientName) {
                  Alert.alert("Error", "Please enter a client name");
                  return;
                }
                const designFee = parseInt(newEstimate.designFee) || 0;
                const furnitureBudget = parseInt(newEstimate.furnitureBudget) || 0;
                const laborCosts = parseInt(newEstimate.laborCosts) || 0;
                const contingency = Math.round((designFee + furnitureBudget + laborCosts) * 0.1);
                const total = designFee + furnitureBudget + laborCosts + contingency;

                const estimate: DesignEstimate = {
                  id: `de-${Date.now()}`,
                  clientName: newEstimate.clientName,
                  clientEmail: newEstimate.clientEmail || undefined,
                  clientPhone: newEstimate.clientPhone || undefined,
                  projectType: newEstimate.projectType || "Room Redesign",
                  rooms: [{ id: "r-1", name: "Room 1", designFee: designFee, itemsBudget: furnitureBudget }],
                  designFee,
                  furnitureBudget,
                  laborCosts,
                  contingency,
                  totalEstimate: total,
                  validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                  status: "draft",
                  notes: newEstimate.notes || undefined,
                  createdAt: new Date().toISOString(),
                };
                setEstimates([estimate, ...estimates]);
                setShowCreateModal(false);
                setNewEstimate({
                  clientName: "",
                  clientEmail: "",
                  clientPhone: "",
                  projectType: "Room Redesign",
                  designFee: "",
                  furnitureBudget: "",
                  laborCosts: "",
                  notes: "",
                });
                Alert.alert("Success", "Estimate created successfully!");
              }}
            >
              <Save size={18} color={Colors.white} />
              <Text style={styles.saveBtnText}>Create Estimate</Text>
            </TouchableOpacity>
          </View>
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
  summaryCards: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#FCE7F3",
    borderRadius: 16,
    padding: 16,
  },
  summaryLabel: {
    fontSize: 13,
    color: "#9D174D",
    fontWeight: "500" as const,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "800" as const,
    color: "#EC4899",
    marginTop: 4,
  },
  summaryCount: {
    fontSize: 12,
    color: "#9D174D",
    marginTop: 4,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
  },
  statusFilters: {
    maxHeight: 44,
    marginBottom: 8,
  },
  statusFiltersContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  statusChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    marginRight: 8,
  },
  statusChipActive: {
    backgroundColor: "#EC4899",
  },
  statusChipText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.textSecondary,
  },
  statusChipTextActive: {
    color: Colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  listCount: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EC4899",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  estimateCard: {
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
  estimateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  clientInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  clientAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  clientDetails: {
    marginLeft: 12,
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  projectType: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  estimateBreakdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  breakdownItem: {
    alignItems: "center",
  },
  breakdownLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginBottom: 4,
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  estimateTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "800" as const,
    color: "#EC4899",
  },
  estimateMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: Colors.textTertiary,
  },
  roomCount: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "500" as const,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  viewDetails: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.primary,
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
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: "center",
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
  modalClose: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
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
  modalClientSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  modalClientAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  modalClientInfo: {
    marginLeft: 16,
    flex: 1,
  },
  modalClientName: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  modalProjectType: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: 8,
  },
  contactSection: {
    gap: 10,
    marginBottom: 24,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FCE7F3",
    padding: 14,
    borderRadius: 12,
    gap: 10,
  },
  contactButtonText: {
    fontSize: 14,
    color: "#EC4899",
    fontWeight: "500" as const,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 14,
  },
  roomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  roomNotes: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  roomCosts: {
    alignItems: "flex-end",
  },
  roomDesignFee: {
    fontSize: 13,
    color: Colors.text,
  },
  roomBudget: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  costBreakdown: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 14,
  },
  costRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  costLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  costValue: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.text,
  },
  totalRow: {
    borderBottomWidth: 0,
    paddingTop: 14,
    marginTop: 4,
  },
  totalCostLabel: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  totalCostValue: {
    fontSize: 20,
    fontWeight: "800" as const,
    color: "#EC4899",
  },
  validDate: {
    fontSize: 16,
    color: Colors.text,
  },
  notesBox: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 14,
  },
  notesText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
  },
  sendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EC4899",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 10,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  formSection: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  formTextArea: {
    height: 100,
    paddingTop: 14,
  },
  createFooter: {
    flexDirection: "row" as const,
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center" as const,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  saveBtn: {
    flex: 1,
    flexDirection: "row" as const,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: "#EC4899",
    gap: 8,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.white,
  },
});
