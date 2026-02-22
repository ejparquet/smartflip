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
  Shield,
  Calendar,
  Clock,
  ChevronRight,
  X,
  AlertTriangle,
  CheckCircle,
  Wrench,
  Droplets,
  Flame,
  Package,
  FileText,
  Phone,
  Building2,
  MapPin,
  DollarSign,
  Bell,
  User,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";

interface WarrantyItem {
  id: string;
  type: "parts" | "labor" | "equipment" | "installation";
  productName: string;
  brand: string;
  modelNumber?: string;
  serialNumber?: string;
  purchaseDate: string;
  installationDate: string;
  warrantyStart: string;
  warrantyEnd: string;
  warrantyLength: string;
  coverageDetails: string;
  status: "active" | "expiring_soon" | "expired" | "claimed";
  jobId: string;
  jobAddress: string;
  customerName: string;
  customerPhone: string;
  laborCost?: number;
  partsCost?: number;
  claimHistory?: WarrantyClaim[];
  notes?: string;
}

interface WarrantyClaim {
  id: string;
  date: string;
  issue: string;
  resolution: string;
  cost: number;
  covered: boolean;
}

const typeConfig: Record<string, { icon: any; color: string; bgColor: string; label: string }> = {
  parts: { icon: Package, color: "#3B82F6", bgColor: "#DBEAFE", label: "Parts" },
  labor: { icon: Wrench, color: "#8B5CF6", bgColor: "#EDE9FE", label: "Labor" },
  equipment: { icon: Droplets, color: "#06B6D4", bgColor: "#CFFAFE", label: "Equipment" },
  installation: { icon: Shield, color: "#22C55E", bgColor: "#DCFCE7", label: "Installation" },
};

const mockWarranties: WarrantyItem[] = [
  {
    id: "1",
    type: "equipment",
    productName: "Rheem Performance Plus Water Heater",
    brand: "Rheem",
    modelNumber: "XG50T12DM40U0",
    serialNumber: "RH2024-5847291",
    purchaseDate: "2024-01-05",
    installationDate: "2024-01-08",
    warrantyStart: "2024-01-08",
    warrantyEnd: "2030-01-08",
    warrantyLength: "6 Years",
    coverageDetails: "Tank: 6 years, Parts: 6 years, Labor: 1 year. Covers manufacturing defects and tank failure.",
    status: "active",
    jobId: "job-001",
    jobAddress: "1234 Oak Valley Dr, Austin, TX",
    customerName: "Sarah Mitchell",
    customerPhone: "(512) 555-0123",
    laborCost: 450,
    partsCost: 1200,
  },
  {
    id: "2",
    type: "parts",
    productName: "Moen Arbor Kitchen Faucet",
    brand: "Moen",
    modelNumber: "7594SRS",
    serialNumber: "MN2024-3928471",
    purchaseDate: "2024-02-12",
    installationDate: "2024-02-12",
    warrantyStart: "2024-02-12",
    warrantyEnd: "2029-02-12",
    warrantyLength: "Limited Lifetime",
    coverageDetails: "Lifetime warranty on finish and function. Covers drips, leaks, and finish defects.",
    status: "active",
    jobId: "job-002",
    jobAddress: "567 Maple Street, Round Rock, TX",
    customerName: "Michael Chen",
    customerPhone: "(512) 555-0456",
    partsCost: 380,
    laborCost: 150,
  },
  {
    id: "3",
    type: "labor",
    productName: "Bathroom Remodel - Plumbing",
    brand: "N/A",
    purchaseDate: "2023-11-20",
    installationDate: "2023-11-20",
    warrantyStart: "2023-11-20",
    warrantyEnd: "2024-11-20",
    warrantyLength: "1 Year",
    coverageDetails: "Workmanship warranty covers all plumbing installation and connections.",
    status: "expiring_soon",
    jobId: "job-003",
    jobAddress: "890 Cedar Lane, Cedar Park, TX",
    customerName: "Jennifer Lopez",
    customerPhone: "(512) 555-0789",
    laborCost: 2800,
    notes: "Full bathroom rough-in and finish plumbing",
  },
  {
    id: "4",
    type: "equipment",
    productName: "Rinnai Tankless Water Heater",
    brand: "Rinnai",
    modelNumber: "RU199iN",
    serialNumber: "RN2023-1928374",
    purchaseDate: "2023-06-15",
    installationDate: "2023-06-18",
    warrantyStart: "2023-06-18",
    warrantyEnd: "2033-06-18",
    warrantyLength: "10 Years",
    coverageDetails: "Heat exchanger: 10 years, Parts: 5 years, Labor: 1 year (expired). Residential use only.",
    status: "active",
    jobId: "job-004",
    jobAddress: "234 Pine Ave, Austin, TX",
    customerName: "Robert Johnson",
    customerPhone: "(512) 555-0321",
    laborCost: 800,
    partsCost: 2400,
    claimHistory: [
      {
        id: "c1",
        date: "2024-01-10",
        issue: "Error code 11 - No ignition",
        resolution: "Replaced igniter under warranty",
        cost: 0,
        covered: true,
      },
    ],
  },
  {
    id: "5",
    type: "installation",
    productName: "Whole House Water Filtration",
    brand: "Aquasana",
    modelNumber: "EQ-1000",
    serialNumber: "AQ2023-8374651",
    purchaseDate: "2023-03-01",
    installationDate: "2023-03-05",
    warrantyStart: "2023-03-05",
    warrantyEnd: "2024-03-05",
    warrantyLength: "1 Year",
    coverageDetails: "Installation warranty expired. Product warranty still active through manufacturer.",
    status: "expired",
    jobId: "job-005",
    jobAddress: "456 Elm Street, Pflugerville, TX",
    customerName: "Emily Davis",
    customerPhone: "(512) 555-0654",
    laborCost: 350,
    partsCost: 1100,
  },
  {
    id: "6",
    type: "parts",
    productName: "Kohler Cimarron Toilet",
    brand: "Kohler",
    modelNumber: "K-3609-0",
    serialNumber: "KH2024-9182736",
    purchaseDate: "2024-03-10",
    installationDate: "2024-03-10",
    warrantyStart: "2024-03-10",
    warrantyEnd: "2025-03-10",
    warrantyLength: "1 Year",
    coverageDetails: "1-year limited warranty on parts. Does not cover installation or normal wear.",
    status: "active",
    jobId: "job-006",
    jobAddress: "789 Walnut Dr, Lakeway, TX",
    customerName: "David Wilson",
    customerPhone: "(512) 555-0987",
    partsCost: 420,
    laborCost: 180,
  },
];

export default function WarrantyTrackingScreen() {
  const router = useRouter();
  const [warranties, setWarranties] = useState<WarrantyItem[]>(mockWarranties);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedWarranty, setSelectedWarranty] = useState<WarrantyItem | null>(null);

  const filteredWarranties = useMemo(() => {
    return warranties.filter((warranty) => {
      const matchesSearch =
        warranty.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        warranty.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        warranty.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        warranty.jobAddress.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === "all" || warranty.type === selectedType;
      const matchesStatus = selectedStatus === "all" || warranty.status === selectedStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [warranties, searchQuery, selectedType, selectedStatus]);

  const stats = useMemo(() => {
    const now = new Date();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    return {
      total: warranties.length,
      active: warranties.filter((w) => w.status === "active").length,
      expiringSoon: warranties.filter((w) => {
        const endDate = new Date(w.warrantyEnd);
        return endDate > now && endDate.getTime() - now.getTime() < thirtyDays;
      }).length,
      expired: warranties.filter((w) => w.status === "expired").length,
    };
  }, [warranties]);

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const getStatusConfig = (status: string, endDate: string) => {
    const days = getDaysRemaining(endDate);
    if (status === "claimed") {
      return { color: "#8B5CF6", bgColor: "#EDE9FE", label: "Claimed" };
    }
    if (days < 0) {
      return { color: "#6B7280", bgColor: "#F3F4F6", label: "Expired" };
    }
    if (days <= 30) {
      return { color: "#272D53", bgColor: "#E8E9EE", label: "Expiring Soon" };
    }
    return { color: "#22C55E", bgColor: "#DCFCE7", label: "Active" };
  };

  const handleFileClaim = useCallback((warrantyId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "File Warranty Claim",
      "This will initiate a warranty claim process. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          onPress: () => {
            Alert.alert("Claim Initiated", "A warranty claim has been created. Contact the manufacturer for next steps.");
          },
        },
      ]
    );
  }, []);

  const handleSetReminder = useCallback((warranty: WarrantyItem) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      "Reminder Set",
      `You'll be reminded 30 days before the warranty expires on ${new Date(warranty.warrantyEnd).toLocaleDateString()}.`
    );
  }, []);

  const renderWarrantyCard = (warranty: WarrantyItem) => {
    const type = typeConfig[warranty.type];
    const status = getStatusConfig(warranty.status, warranty.warrantyEnd);
    const TypeIcon = type.icon;
    const daysRemaining = getDaysRemaining(warranty.warrantyEnd);

    return (
      <TouchableOpacity
        key={warranty.id}
        style={styles.warrantyCard}
        onPress={() => setSelectedWarranty(warranty)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.typeBadge, { backgroundColor: type.bgColor }]}>
            <TypeIcon size={14} color={type.color} />
            <Text style={[styles.typeText, { color: type.color }]}>{type.label}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bgColor }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <Text style={styles.productName}>{warranty.productName}</Text>
        <Text style={styles.brandText}>{warranty.brand}</Text>

        <View style={styles.customerRow}>
          <User size={12} color={Colors.textSecondary} />
          <Text style={styles.customerText}>{warranty.customerName}</Text>
        </View>

        <View style={styles.addressRow}>
          <MapPin size={12} color={Colors.textSecondary} />
          <Text style={styles.addressText} numberOfLines={1}>
            {warranty.jobAddress}
          </Text>
        </View>

        <View style={styles.warrantyDates}>
          <View style={styles.dateItem}>
            <Calendar size={12} color={Colors.textSecondary} />
            <Text style={styles.dateLabel}>Installed:</Text>
            <Text style={styles.dateValue}>
              {new Date(warranty.installationDate).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.dateItem}>
            <Clock size={12} color={daysRemaining <= 30 ? "#272D53" : Colors.textSecondary} />
            <Text style={styles.dateLabel}>Expires:</Text>
            <Text style={[styles.dateValue, daysRemaining <= 30 && { color: "#272D53" }]}>
              {new Date(warranty.warrantyEnd).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {daysRemaining > 0 && daysRemaining <= 90 && (
          <View style={[styles.daysRemainingBadge, daysRemaining <= 30 && styles.daysRemainingUrgent]}>
            <AlertTriangle size={12} color={daysRemaining <= 30 ? "#272D53" : "#3B82F6"} />
            <Text style={[styles.daysRemainingText, daysRemaining <= 30 && { color: "#272D53" }]}>
              {daysRemaining} days remaining
            </Text>
          </View>
        )}

        {warranty.claimHistory && warranty.claimHistory.length > 0 && (
          <View style={styles.claimBadge}>
            <FileText size={12} color="#8B5CF6" />
            <Text style={styles.claimText}>{warranty.claimHistory.length} claim(s) filed</Text>
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
          title: "Warranty Tracking",
          headerLeft: () => <BackButton />,
          headerRight: () => (
            <TouchableOpacity onPress={() => Alert.alert("Add Warranty", "Add warranty form coming soon")} style={styles.addButton}>
              <Plus size={24} color={Colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Shield size={20} color="#3B82F6" />
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#DCFCE7" }]}>
            <CheckCircle size={20} color="#22C55E" />
            <Text style={[styles.statValue, { color: "#22C55E" }]}>{stats.active}</Text>
            <Text style={[styles.statLabel, { color: "#22C55E" }]}>Active</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#E8E9EE" }]}>
            <AlertTriangle size={20} color="#272D53" />
            <Text style={[styles.statValue, { color: "#272D53" }]}>{stats.expiringSoon}</Text>
            <Text style={[styles.statLabel, { color: "#272D53" }]}>Expiring</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#F3F4F6" }]}>
            <Clock size={20} color="#6B7280" />
            <Text style={[styles.statValue, { color: "#6B7280" }]}>{stats.expired}</Text>
            <Text style={[styles.statLabel, { color: "#6B7280" }]}>Expired</Text>
          </View>
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Search size={18} color={Colors.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search warranties..."
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
          <View style={styles.filtersSection}>
            <Text style={styles.filterLabel}>Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <TouchableOpacity
                style={[styles.filterChip, selectedType === "all" && styles.filterChipActive]}
                onPress={() => setSelectedType("all")}
              >
                <Text style={[styles.filterChipText, selectedType === "all" && styles.filterChipTextActive]}>
                  All
                </Text>
              </TouchableOpacity>
              {Object.entries(typeConfig).map(([key, config]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.filterChip,
                    selectedType === key && styles.filterChipActive,
                    selectedType === key && { backgroundColor: config.color },
                  ]}
                  onPress={() => setSelectedType(key)}
                >
                  <config.icon size={14} color={selectedType === key ? "#FFF" : config.color} />
                  <Text style={[styles.filterChipText, selectedType === key && styles.filterChipTextActive]}>
                    {config.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.filterLabel, { marginTop: 12 }]}>Status</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {["all", "active", "expiring_soon", "expired"].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[styles.filterChip, selectedStatus === status && styles.filterChipActive]}
                  onPress={() => setSelectedStatus(status)}
                >
                  <Text style={[styles.filterChipText, selectedStatus === status && styles.filterChipTextActive]}>
                    {status === "all" ? "All" : status === "expiring_soon" ? "Expiring" : status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.warrantiesSection}>
          <Text style={styles.sectionTitle}>Warranties ({filteredWarranties.length})</Text>
          {filteredWarranties.map(renderWarrantyCard)}

          {filteredWarranties.length === 0 && (
            <View style={styles.emptyState}>
              <Shield size={48} color={Colors.textTertiary} />
              <Text style={styles.emptyStateTitle}>No Warranties</Text>
              <Text style={styles.emptyStateText}>
                {searchQuery || selectedType !== "all" || selectedStatus !== "all"
                  ? "Try adjusting your filters"
                  : "Add warranties to track them here"}
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal visible={selectedWarranty !== null} animationType="slide" presentationStyle="pageSheet">
        {selectedWarranty && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedWarranty(null)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Warranty Details</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.detailHeader}>
                <View style={[styles.detailTypeBadge, { backgroundColor: typeConfig[selectedWarranty.type].bgColor }]}>
                  {React.createElement(typeConfig[selectedWarranty.type].icon, {
                    size: 20,
                    color: typeConfig[selectedWarranty.type].color,
                  })}
                </View>
                <View style={styles.detailHeaderInfo}>
                  <Text style={styles.detailProductName}>{selectedWarranty.productName}</Text>
                  <Text style={styles.detailBrand}>{selectedWarranty.brand}</Text>
                </View>
              </View>

              {selectedWarranty.modelNumber && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Model Number</Text>
                  <Text style={styles.detailValue}>{selectedWarranty.modelNumber}</Text>
                </View>
              )}

              {selectedWarranty.serialNumber && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Serial Number</Text>
                  <Text style={styles.detailValue}>{selectedWarranty.serialNumber}</Text>
                </View>
              )}

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Warranty Period</Text>
                <View style={styles.warrantyPeriodCard}>
                  <View style={styles.periodRow}>
                    <Text style={styles.periodLabel}>Length</Text>
                    <Text style={styles.periodValue}>{selectedWarranty.warrantyLength}</Text>
                  </View>
                  <View style={styles.periodRow}>
                    <Text style={styles.periodLabel}>Start Date</Text>
                    <Text style={styles.periodValue}>
                      {new Date(selectedWarranty.warrantyStart).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.periodRow}>
                    <Text style={styles.periodLabel}>End Date</Text>
                    <Text style={[styles.periodValue, getDaysRemaining(selectedWarranty.warrantyEnd) <= 30 && { color: "#272D53" }]}>
                      {new Date(selectedWarranty.warrantyEnd).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Coverage Details</Text>
                <Text style={styles.coverageText}>{selectedWarranty.coverageDetails}</Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Customer Information</Text>
                <View style={styles.customerCard}>
                  <View style={styles.customerCardRow}>
                    <User size={16} color={Colors.textSecondary} />
                    <Text style={styles.customerCardText}>{selectedWarranty.customerName}</Text>
                  </View>
                  <TouchableOpacity style={styles.customerCardRow}>
                    <Phone size={16} color="#3B82F6" />
                    <Text style={[styles.customerCardText, { color: "#3B82F6" }]}>
                      {selectedWarranty.customerPhone}
                    </Text>
                  </TouchableOpacity>
                  <View style={styles.customerCardRow}>
                    <MapPin size={16} color={Colors.textSecondary} />
                    <Text style={styles.customerCardText}>{selectedWarranty.jobAddress}</Text>
                  </View>
                </View>
              </View>

              {(selectedWarranty.laborCost || selectedWarranty.partsCost) && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Original Costs</Text>
                  <View style={styles.costsRow}>
                    {selectedWarranty.partsCost && (
                      <View style={styles.costItem}>
                        <DollarSign size={16} color="#22C55E" />
                        <View>
                          <Text style={styles.costLabel}>Parts</Text>
                          <Text style={styles.costValue}>${selectedWarranty.partsCost.toLocaleString()}</Text>
                        </View>
                      </View>
                    )}
                    {selectedWarranty.laborCost && (
                      <View style={styles.costItem}>
                        <Wrench size={16} color="#3B82F6" />
                        <View>
                          <Text style={styles.costLabel}>Labor</Text>
                          <Text style={styles.costValue}>${selectedWarranty.laborCost.toLocaleString()}</Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {selectedWarranty.claimHistory && selectedWarranty.claimHistory.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Claim History</Text>
                  {selectedWarranty.claimHistory.map((claim) => (
                    <View key={claim.id} style={styles.claimCard}>
                      <View style={styles.claimHeader}>
                        <Text style={styles.claimDate}>
                          {new Date(claim.date).toLocaleDateString()}
                        </Text>
                        <View style={[styles.claimCoveredBadge, { backgroundColor: claim.covered ? "#DCFCE7" : "#FEE2E2" }]}>
                          <Text style={[styles.claimCoveredText, { color: claim.covered ? "#22C55E" : "#EF4444" }]}>
                            {claim.covered ? "Covered" : "Not Covered"}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.claimIssue}>{claim.issue}</Text>
                      <Text style={styles.claimResolution}>{claim.resolution}</Text>
                      {claim.cost > 0 && (
                        <Text style={styles.claimCost}>Cost: ${claim.cost}</Text>
                      )}
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalActionButton}
                  onPress={() => handleSetReminder(selectedWarranty)}
                >
                  <Bell size={20} color="#272D53" />
                  <Text style={styles.modalActionText}>Set Reminder</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalActionButton, styles.claimButton]}
                  onPress={() => handleFileClaim(selectedWarranty.id)}
                >
                  <FileText size={20} color="#FFF" />
                  <Text style={styles.claimButtonText}>File Claim</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
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
  filtersSection: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  filterScroll: {
    flexGrow: 0,
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
  warrantiesSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 14,
  },
  warrantyCard: {
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
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  typeText: {
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
  productName: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  brandText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  customerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  customerText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  addressText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  warrantyDates: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  dateItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  dateValue: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  daysRemainingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 10,
  },
  daysRemainingUrgent: {
    backgroundColor: "#E8E9EE",
  },
  daysRemainingText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#3B82F6",
  },
  claimBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
  },
  claimText: {
    fontSize: 12,
    color: "#8B5CF6",
    fontWeight: "500" as const,
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
  modalContent: {
    flex: 1,
    padding: 20,
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
  },
  detailTypeBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  detailHeaderInfo: {
    flex: 1,
  },
  detailProductName: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  detailBrand: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  detailSection: {
    marginTop: 24,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  warrantyPeriodCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  periodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  periodLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  periodValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  coverageText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 12,
  },
  customerCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  customerCardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  customerCardText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  costsRow: {
    flexDirection: "row",
    gap: 12,
  },
  costItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 12,
  },
  costLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  costValue: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  claimCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  claimHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  claimDate: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  claimCoveredBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  claimCoveredText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  claimIssue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  claimResolution: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  claimCost: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 6,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
    marginBottom: 20,
  },
  modalActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.surface,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  modalActionText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  claimButton: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  claimButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#FFF",
  },
});
