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
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import {
  ArrowLeft,
  Plus,
  Shield,
  Search,
  X,
  Filter,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
  MapPin,
  Phone,
  FileText,
  ChevronRight,
  Zap,
  CircuitBoard,
  Lightbulb,
  Package,
  Building2,
  Mail,
  ExternalLink,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";

type WarrantyStatus = "active" | "expiring_soon" | "expired" | "claimed";
type WarrantyType = "parts" | "labor" | "full" | "manufacturer" | "extended";
type EquipmentCategory = "panel" | "breaker" | "outlet" | "switch" | "lighting" | "ev_charger" | "generator" | "other";

interface WarrantyItem {
  id: string;
  jobId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAvatar?: string;
  address: string;
  equipmentName: string;
  equipmentCategory: EquipmentCategory;
  brand: string;
  model: string;
  serialNumber?: string;
  warrantyType: WarrantyType;
  startDate: string;
  endDate: string;
  durationMonths: number;
  status: WarrantyStatus;
  coverageDetails: string;
  claimHistory?: WarrantyClaim[];
  documents?: string[];
  notes?: string;
}

interface WarrantyClaim {
  id: string;
  date: string;
  issue: string;
  resolution: string;
  cost?: number;
}

const mockWarranties: WarrantyItem[] = [
  {
    id: "1",
    jobId: "J-2024-001",
    customerId: "c1",
    customerName: "David Thompson",
    customerPhone: "(512) 555-0123",
    customerEmail: "david.t@email.com",
    customerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
    address: "1234 Tech Park Dr, Austin, TX 78749",
    equipmentName: "200A Main Breaker Panel",
    equipmentCategory: "panel",
    brand: "Square D",
    model: "QO140L200PG",
    serialNumber: "SQD-2024-789456",
    warrantyType: "full",
    startDate: "2024-06-15",
    endDate: "2029-06-15",
    durationMonths: 60,
    status: "active",
    coverageDetails: "5-year full coverage on parts and labor for panel defects. Includes all breakers installed.",
    notes: "Panel upgrade from 100A to 200A service.",
  },
  {
    id: "2",
    jobId: "J-2024-015",
    customerId: "c2",
    customerName: "Sarah Martinez",
    customerPhone: "(512) 555-0456",
    customerEmail: "sarah.m@email.com",
    address: "567 Office Plaza, Round Rock, TX 78681",
    equipmentName: "Tesla Wall Connector",
    equipmentCategory: "ev_charger",
    brand: "Tesla",
    model: "Wall Connector Gen 3",
    serialNumber: "TWC3-2024-123456",
    warrantyType: "manufacturer",
    startDate: "2024-08-20",
    endDate: "2028-08-20",
    durationMonths: 48,
    status: "active",
    coverageDetails: "4-year manufacturer warranty covering defects in materials and workmanship.",
    notes: "Level 2 EV charger installation in garage.",
  },
  {
    id: "3",
    jobId: "J-2024-008",
    customerId: "c3",
    customerName: "Michael Chen",
    customerPhone: "(512) 555-0789",
    address: "890 Cedar Lane, Cedar Park, TX 78613",
    equipmentName: "Recessed LED Lighting (12 units)",
    equipmentCategory: "lighting",
    brand: "Halo",
    model: "RL6069S1EWHR",
    warrantyType: "parts",
    startDate: "2024-05-10",
    endDate: "2027-05-10",
    durationMonths: 36,
    status: "active",
    coverageDetails: "3-year parts warranty on LED fixtures. Covers LED driver and housing.",
  },
  {
    id: "4",
    jobId: "J-2023-042",
    customerId: "c4",
    customerName: "Jennifer Wilson",
    customerPhone: "(512) 555-0321",
    customerAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200",
    address: "234 Pine Ave, Austin, TX 78704",
    equipmentName: "Whole House Surge Protector",
    equipmentCategory: "panel",
    brand: "Eaton",
    model: "CHSPT2ULTRA",
    serialNumber: "EAT-2023-654321",
    warrantyType: "full",
    startDate: "2023-11-01",
    endDate: "2025-02-01",
    durationMonths: 15,
    status: "expiring_soon",
    coverageDetails: "Limited warranty covering equipment and connected equipment up to $75,000.",
    notes: "Installed during panel upgrade project.",
  },
  {
    id: "5",
    jobId: "J-2023-018",
    customerId: "c5",
    customerName: "Robert Garcia",
    customerPhone: "(512) 555-0654",
    address: "456 Elm Street, Pflugerville, TX 78660",
    equipmentName: "Generac Generator",
    equipmentCategory: "generator",
    brand: "Generac",
    model: "Guardian 22kW",
    serialNumber: "GEN-2023-987654",
    warrantyType: "extended",
    startDate: "2023-03-15",
    endDate: "2028-03-15",
    durationMonths: 60,
    status: "active",
    coverageDetails: "5-year extended warranty including annual maintenance visits and parts replacement.",
    claimHistory: [
      {
        id: "cl1",
        date: "2024-06-20",
        issue: "Battery replacement needed",
        resolution: "Battery replaced under warranty",
        cost: 0,
      },
    ],
  },
  {
    id: "6",
    jobId: "J-2022-089",
    customerId: "c6",
    customerName: "Lisa Anderson",
    customerPhone: "(512) 555-0987",
    address: "789 Walnut Dr, Lakeway, TX 78734",
    equipmentName: "GFCI Outlet Package (8 units)",
    equipmentCategory: "outlet",
    brand: "Leviton",
    model: "GFNT2-W",
    warrantyType: "labor",
    startDate: "2022-09-10",
    endDate: "2024-09-10",
    durationMonths: 24,
    status: "expired",
    coverageDetails: "2-year labor warranty on GFCI installation. Parts covered by manufacturer.",
  },
  {
    id: "7",
    jobId: "J-2024-022",
    customerId: "c7",
    customerName: "James Brown",
    customerPhone: "(512) 555-1234",
    address: "321 Maple Court, Georgetown, TX 78628",
    equipmentName: "Smart Home Panel",
    equipmentCategory: "panel",
    brand: "Span",
    model: "Span Panel",
    serialNumber: "SPAN-2024-456789",
    warrantyType: "manufacturer",
    startDate: "2024-09-01",
    endDate: "2034-09-01",
    durationMonths: 120,
    status: "active",
    coverageDetails: "10-year manufacturer warranty covering panel hardware and software updates.",
  },
];

const statusConfig: Record<WarrantyStatus, { label: string; color: string; bgColor: string; icon: any }> = {
  active: { label: "Active", color: "#22C55E", bgColor: "#DCFCE7", icon: CheckCircle },
  expiring_soon: { label: "Expiring Soon", color: "#272D53", bgColor: "#E8E9EE", icon: AlertTriangle },
  expired: { label: "Expired", color: "#6B7280", bgColor: "#F3F4F6", icon: Clock },
  claimed: { label: "Claimed", color: "#3B82F6", bgColor: "#DBEAFE", icon: FileText },
};

const warrantyTypeConfig: Record<WarrantyType, { label: string; color: string }> = {
  parts: { label: "Parts Only", color: "#3B82F6" },
  labor: { label: "Labor Only", color: "#8B5CF6" },
  full: { label: "Full Coverage", color: "#22C55E" },
  manufacturer: { label: "Manufacturer", color: "#272D53" },
  extended: { label: "Extended", color: "#EC4899" },
};

const categoryConfig: Record<EquipmentCategory, { label: string; icon: any; color: string }> = {
  panel: { label: "Panel", icon: CircuitBoard, color: "#EF4444" },
  breaker: { label: "Breaker", icon: Zap, color: "#272D53" },
  outlet: { label: "Outlet", icon: Package, color: "#3B82F6" },
  switch: { label: "Switch", icon: Zap, color: "#8B5CF6" },
  lighting: { label: "Lighting", icon: Lightbulb, color: "#FBBF24" },
  ev_charger: { label: "EV Charger", icon: Zap, color: "#10B981" },
  generator: { label: "Generator", icon: Zap, color: "#06B6D4" },
  other: { label: "Other", icon: Package, color: "#6B7280" },
};

export default function ElectricalWarrantyTrackingScreen() {
  const router = useRouter();
  const [warranties, setWarranties] = useState<WarrantyItem[]>(mockWarranties);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<WarrantyStatus | "all">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedWarranty, setSelectedWarranty] = useState<WarrantyItem | null>(null);

  const filteredWarranties = useMemo(() => {
    return warranties.filter((w) => {
      const matchesSearch =
        w.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.equipmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = selectedStatus === "all" || w.status === selectedStatus;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => {
      const statusOrder = { expiring_soon: 0, active: 1, claimed: 2, expired: 3 };
      return statusOrder[a.status] - statusOrder[b.status];
    });
  }, [warranties, searchQuery, selectedStatus]);

  const stats = useMemo(() => {
    const active = warranties.filter((w) => w.status === "active").length;
    const expiringSoon = warranties.filter((w) => w.status === "expiring_soon").length;
    const expired = warranties.filter((w) => w.status === "expired").length;
    return { total: warranties.length, active, expiringSoon, expired };
  }, [warranties]);

  const getDaysRemaining = useCallback((endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  }, []);

  const handleFileClaim = useCallback((warranty: WarrantyItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "File Warranty Claim",
      `Start a claim for ${warranty.equipmentName}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Start Claim", onPress: () => Alert.alert("Claim Started", "Warranty claim process initiated.") },
      ]
    );
  }, []);

  const handleContactCustomer = useCallback((phone: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert("Contact Customer", `Call ${phone}?`);
  }, []);

  const renderWarrantyCard = (warranty: WarrantyItem) => {
    const status = statusConfig[warranty.status];
    const category = categoryConfig[warranty.equipmentCategory];
    const warrantyType = warrantyTypeConfig[warranty.warrantyType];
    const CategoryIcon = category.icon;
    const StatusIcon = status.icon;
    const daysRemaining = getDaysRemaining(warranty.endDate);

    return (
      <TouchableOpacity
        key={warranty.id}
        style={[
          styles.warrantyCard,
          warranty.status === "expiring_soon" && styles.expiringCard,
        ]}
        onPress={() => setSelectedWarranty(warranty)}
        activeOpacity={0.7}
      >
        {warranty.status === "expiring_soon" && (
          <View style={styles.expiringBanner}>
            <AlertTriangle size={14} color="#92400E" />
            <Text style={styles.expiringBannerText}>
              Expires in {daysRemaining} days
            </Text>
          </View>
        )}

        <View style={styles.cardHeader}>
          <View style={[styles.categoryIcon, { backgroundColor: `${category.color}15` }]}>
            <CategoryIcon size={20} color={category.color} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.equipmentName}>{warranty.equipmentName}</Text>
            <Text style={styles.brandModel}>{warranty.brand} {warranty.model}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bgColor }]}>
            <StatusIcon size={12} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.customerRow}>
          {warranty.customerAvatar ? (
            <Image source={{ uri: warranty.customerAvatar }} style={styles.customerAvatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <User size={14} color={Colors.textSecondary} />
            </View>
          )}
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{warranty.customerName}</Text>
            <View style={styles.addressRow}>
              <MapPin size={12} color={Colors.textTertiary} />
              <Text style={styles.addressText} numberOfLines={1}>{warranty.address}</Text>
            </View>
          </View>
        </View>

        <View style={styles.warrantyDetails}>
          <View style={[styles.typeBadge, { backgroundColor: `${warrantyType.color}15` }]}>
            <Shield size={12} color={warrantyType.color} />
            <Text style={[styles.typeText, { color: warrantyType.color }]}>{warrantyType.label}</Text>
          </View>
          <View style={styles.dateRange}>
            <Calendar size={12} color={Colors.textSecondary} />
            <Text style={styles.dateText}>
              {new Date(warranty.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
              {" → "}
              {new Date(warranty.endDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
            </Text>
          </View>
        </View>

        {warranty.claimHistory && warranty.claimHistory.length > 0 && (
          <View style={styles.claimIndicator}>
            <FileText size={12} color="#3B82F6" />
            <Text style={styles.claimIndicatorText}>
              {warranty.claimHistory.length} claim{warranty.claimHistory.length > 1 ? "s" : ""} filed
            </Text>
          </View>
        )}
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
            <TouchableOpacity onPress={() => {}} style={styles.addButton}>
              <Plus size={24} color="#EAB308" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Shield size={32} color="#EAB308" />
          </View>
          <Text style={styles.headerTitle}>Electrical Warranty Tracking</Text>
          <Text style={styles.headerSubtitle}>
            Track parts and labor warranties for completed jobs
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#DCFCE7" }]}>
            <Text style={[styles.statValue, { color: "#22C55E" }]}>{stats.active}</Text>
            <Text style={[styles.statLabel, { color: "#22C55E" }]}>Active</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#E8E9EE" }]}>
            <Text style={[styles.statValue, { color: "#272D53" }]}>{stats.expiringSoon}</Text>
            <Text style={[styles.statLabel, { color: "#272D53" }]}>Expiring</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#F3F4F6" }]}>
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
            <Text style={styles.filterLabel}>Status</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <TouchableOpacity
                style={[styles.filterChip, selectedStatus === "all" && styles.filterChipActive]}
                onPress={() => setSelectedStatus("all")}
              >
                <Text style={[styles.filterChipText, selectedStatus === "all" && styles.filterChipTextActive]}>
                  All
                </Text>
              </TouchableOpacity>
              {(Object.keys(statusConfig) as WarrantyStatus[]).map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterChip,
                    selectedStatus === status && styles.filterChipActive,
                    selectedStatus === status && { backgroundColor: statusConfig[status].color },
                  ]}
                  onPress={() => setSelectedStatus(status)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedStatus === status && styles.filterChipTextActive,
                    ]}
                  >
                    {statusConfig[status].label}
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
              <Text style={styles.emptyStateTitle}>No Warranties Found</Text>
              <Text style={styles.emptyStateText}>
                Try adjusting your search or filters
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
              <View style={styles.modalEquipmentHeader}>
                <View style={[styles.modalCategoryIcon, { backgroundColor: `${categoryConfig[selectedWarranty.equipmentCategory].color}15` }]}>
                  {React.createElement(categoryConfig[selectedWarranty.equipmentCategory].icon, {
                    size: 32,
                    color: categoryConfig[selectedWarranty.equipmentCategory].color,
                  })}
                </View>
                <View style={styles.modalEquipmentInfo}>
                  <Text style={styles.modalEquipmentName}>{selectedWarranty.equipmentName}</Text>
                  <Text style={styles.modalBrandModel}>{selectedWarranty.brand} {selectedWarranty.model}</Text>
                  {selectedWarranty.serialNumber && (
                    <Text style={styles.modalSerialNumber}>S/N: {selectedWarranty.serialNumber}</Text>
                  )}
                </View>
              </View>

              <View style={styles.warrantyStatusCard}>
                <View style={[styles.modalStatusBadge, { backgroundColor: statusConfig[selectedWarranty.status].bgColor }]}>
                  {React.createElement(statusConfig[selectedWarranty.status].icon, {
                    size: 16,
                    color: statusConfig[selectedWarranty.status].color,
                  })}
                  <Text style={[styles.modalStatusText, { color: statusConfig[selectedWarranty.status].color }]}>
                    {statusConfig[selectedWarranty.status].label}
                  </Text>
                </View>
                <View style={[styles.modalTypeBadge, { backgroundColor: `${warrantyTypeConfig[selectedWarranty.warrantyType].color}15` }]}>
                  <Shield size={14} color={warrantyTypeConfig[selectedWarranty.warrantyType].color} />
                  <Text style={[styles.modalTypeText, { color: warrantyTypeConfig[selectedWarranty.warrantyType].color }]}>
                    {warrantyTypeConfig[selectedWarranty.warrantyType].label}
                  </Text>
                </View>
              </View>

              <View style={styles.dateCard}>
                <Text style={styles.dateCardTitle}>Warranty Period</Text>
                <View style={styles.dateCardContent}>
                  <View style={styles.dateItem}>
                    <Text style={styles.dateLabel}>Start Date</Text>
                    <Text style={styles.dateValue}>
                      {new Date(selectedWarranty.startDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </Text>
                  </View>
                  <View style={styles.dateItem}>
                    <Text style={styles.dateLabel}>End Date</Text>
                    <Text style={styles.dateValue}>
                      {new Date(selectedWarranty.endDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </Text>
                  </View>
                  <View style={styles.dateItem}>
                    <Text style={styles.dateLabel}>Duration</Text>
                    <Text style={styles.dateValue}>{selectedWarranty.durationMonths} months</Text>
                  </View>
                  <View style={styles.dateItem}>
                    <Text style={styles.dateLabel}>Days Remaining</Text>
                    <Text style={[styles.dateValue, getDaysRemaining(selectedWarranty.endDate) <= 30 && { color: "#272D53" }]}>
                      {Math.max(0, getDaysRemaining(selectedWarranty.endDate))} days
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.coverageCard}>
                <Text style={styles.coverageTitle}>Coverage Details</Text>
                <Text style={styles.coverageText}>{selectedWarranty.coverageDetails}</Text>
              </View>

              <View style={styles.customerCard}>
                <Text style={styles.customerCardTitle}>Customer Information</Text>
                <View style={styles.customerCardContent}>
                  {selectedWarranty.customerAvatar ? (
                    <Image source={{ uri: selectedWarranty.customerAvatar }} style={styles.modalCustomerAvatar} />
                  ) : (
                    <View style={styles.modalAvatarPlaceholder}>
                      <User size={24} color={Colors.textSecondary} />
                    </View>
                  )}
                  <View style={styles.customerCardInfo}>
                    <Text style={styles.modalCustomerName}>{selectedWarranty.customerName}</Text>
                    <TouchableOpacity style={styles.contactRow} onPress={() => handleContactCustomer(selectedWarranty.customerPhone)}>
                      <Phone size={14} color="#3B82F6" />
                      <Text style={styles.contactText}>{selectedWarranty.customerPhone}</Text>
                    </TouchableOpacity>
                    {selectedWarranty.customerEmail && (
                      <View style={styles.contactRow}>
                        <Mail size={14} color={Colors.textSecondary} />
                        <Text style={styles.contactTextSecondary}>{selectedWarranty.customerEmail}</Text>
                      </View>
                    )}
                    <View style={styles.contactRow}>
                      <MapPin size={14} color={Colors.textSecondary} />
                      <Text style={styles.contactTextSecondary}>{selectedWarranty.address}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {selectedWarranty.claimHistory && selectedWarranty.claimHistory.length > 0 && (
                <View style={styles.claimHistoryCard}>
                  <Text style={styles.claimHistoryTitle}>Claim History</Text>
                  {selectedWarranty.claimHistory.map((claim) => (
                    <View key={claim.id} style={styles.claimItem}>
                      <View style={styles.claimHeader}>
                        <Text style={styles.claimDate}>
                          {new Date(claim.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </Text>
                        {claim.cost !== undefined && (
                          <Text style={styles.claimCost}>${claim.cost.toFixed(2)}</Text>
                        )}
                      </View>
                      <Text style={styles.claimIssue}>{claim.issue}</Text>
                      <Text style={styles.claimResolution}>{claim.resolution}</Text>
                    </View>
                  ))}
                </View>
              )}

              {selectedWarranty.notes && (
                <View style={styles.notesCard}>
                  <Text style={styles.notesTitle}>Notes</Text>
                  <Text style={styles.notesText}>{selectedWarranty.notes}</Text>
                </View>
              )}

              {selectedWarranty.status === "active" || selectedWarranty.status === "expiring_soon" ? (
                <TouchableOpacity
                  style={styles.claimButton}
                  onPress={() => handleFileClaim(selectedWarranty)}
                >
                  <FileText size={20} color="#000" />
                  <Text style={styles.claimButtonText}>File Warranty Claim</Text>
                </TouchableOpacity>
              ) : null}
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
  header: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#FEF9C3",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center" as const,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  searchSection: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 8,
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
    backgroundColor: "#EAB308",
  },
  filtersSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
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
    padding: 14,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  expiringCard: {
    borderWidth: 2,
    borderColor: "#272D53",
  },
  expiringBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#E8E9EE",
    marginHorizontal: -14,
    marginTop: -14,
    marginBottom: 12,
    paddingVertical: 6,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  expiringBannerText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#92400E",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: {
    flex: 1,
  },
  equipmentName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  brandModel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  customerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  customerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.text,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  addressText: {
    fontSize: 12,
    color: Colors.textTertiary,
    flex: 1,
  },
  warrantyDetails: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  dateRange: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  claimIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  claimIndicatorText: {
    fontSize: 12,
    color: "#3B82F6",
    fontWeight: "500" as const,
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
  modalEquipmentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
  },
  modalCategoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  modalEquipmentInfo: {
    flex: 1,
  },
  modalEquipmentName: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  modalBrandModel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  modalSerialNumber: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 2,
    fontFamily: "monospace",
  },
  warrantyStatusCard: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  modalStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  modalStatusText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  modalTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  modalTypeText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  dateCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  dateCardTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  dateCardContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  dateItem: {
    width: "47%",
    backgroundColor: "#FEF9C3",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  dateLabel: {
    fontSize: 11,
    color: "#92400E",
    fontWeight: "500" as const,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#92400E",
    marginTop: 4,
    textAlign: "center" as const,
  },
  coverageCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  coverageTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  coverageText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  customerCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  customerCardTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  customerCardContent: {
    flexDirection: "row",
    gap: 12,
  },
  modalCustomerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  modalAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  customerCardInfo: {
    flex: 1,
  },
  modalCustomerName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 6,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  contactText: {
    fontSize: 14,
    color: "#3B82F6",
  },
  contactTextSecondary: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  claimHistoryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  claimHistoryTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  claimItem: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    paddingBottom: 12,
    marginBottom: 12,
  },
  claimHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  claimDate: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  claimCost: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#22C55E",
  },
  claimIssue: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
  },
  claimResolution: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  notesCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  notesTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  claimButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#EAB308",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  claimButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#000",
  },
});
