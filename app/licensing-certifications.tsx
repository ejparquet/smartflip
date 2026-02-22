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
  Award,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  FileText,
  Search,
  Filter,
  X,
  ChevronRight,
  Bell,
  BookOpen,
  GraduationCap,
  RefreshCw,
  Edit3,
  Trash2,
  Eye,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";
import {
  License,
  ContinuingEducation,
  LicenseStatus,
  CertificationType,
} from "@/types";

const mockLicenses: License[] = [
  {
    id: "1",
    type: "plumber_license",
    name: "Master Plumber License",
    licenseNumber: "MP-2024-78542",
    issuingAuthority: "Texas State Board of Plumbing Examiners",
    state: "TX",
    issueDate: "2020-03-15",
    expirationDate: "2025-03-15",
    status: "active",
    renewalReminder: true,
    ceCreditsRequired: 24,
    ceCreditsCompleted: 18,
    notes: "Primary license for commercial and residential work",
  },
  {
    id: "2",
    type: "backflow",
    name: "Backflow Prevention Certification",
    licenseNumber: "BF-TX-45892",
    issuingAuthority: "Texas Commission on Environmental Quality",
    state: "TX",
    issueDate: "2023-06-10",
    expirationDate: "2024-06-10",
    status: "expired",
    renewalReminder: true,
    notes: "Required for testing and repairing backflow devices",
  },
  {
    id: "3",
    type: "medical_gas",
    name: "Medical Gas Installer Certification",
    licenseNumber: "MG-2023-1147",
    issuingAuthority: "ASSE International",
    issueDate: "2023-09-20",
    expirationDate: "2026-09-20",
    status: "active",
    renewalReminder: true,
    ceCreditsRequired: 16,
    ceCreditsCompleted: 16,
  },
  {
    id: "4",
    type: "water_heater",
    name: "Water Heater Installation License",
    licenseNumber: "WH-TX-33201",
    issuingAuthority: "Texas State Board of Plumbing Examiners",
    state: "TX",
    issueDate: "2022-01-05",
    expirationDate: "2025-01-05",
    status: "active",
    renewalReminder: false,
  },
  {
    id: "5",
    type: "osha",
    name: "OSHA 30-Hour Construction",
    licenseNumber: "OSHA-30-894521",
    issuingAuthority: "OSHA Training Institute",
    issueDate: "2023-04-12",
    expirationDate: "2028-04-12",
    status: "active",
    renewalReminder: false,
  },
  {
    id: "6",
    type: "continuing_education",
    name: "Journeyman Plumber License",
    licenseNumber: "JP-2019-45123",
    issuingAuthority: "Texas State Board of Plumbing Examiners",
    state: "TX",
    issueDate: "2019-08-22",
    expirationDate: "2024-08-22",
    status: "pending",
    renewalReminder: true,
    ceCreditsRequired: 24,
    ceCreditsCompleted: 20,
    notes: "Renewal application submitted - awaiting approval",
  },
];

const mockCECourses: ContinuingEducation[] = [
  {
    id: "1",
    licenseId: "1",
    courseName: "Advanced Plumbing Code Updates 2024",
    provider: "Texas Plumbing Association",
    completionDate: "2024-01-15",
    credits: 6,
    category: "Code Updates",
  },
  {
    id: "2",
    licenseId: "1",
    courseName: "Green Plumbing Technologies",
    provider: "IAPMO",
    completionDate: "2023-11-20",
    credits: 4,
    category: "Sustainability",
  },
  {
    id: "3",
    licenseId: "1",
    courseName: "Safety in the Workplace",
    provider: "OSHA Online",
    completionDate: "2023-09-05",
    credits: 4,
    category: "Safety",
  },
  {
    id: "4",
    licenseId: "1",
    courseName: "Water Conservation Methods",
    provider: "Texas Commission on Environmental Quality",
    completionDate: "2023-06-18",
    credits: 4,
    category: "Environmental",
  },
  {
    id: "5",
    licenseId: "6",
    courseName: "Residential Plumbing Systems",
    provider: "Plumbing-Heating-Cooling Contractors Association",
    completionDate: "2024-02-10",
    credits: 8,
    category: "Technical",
  },
  {
    id: "6",
    licenseId: "6",
    courseName: "Business Management for Plumbers",
    provider: "Texas Plumbing Association",
    completionDate: "2023-12-01",
    credits: 6,
    category: "Business",
  },
  {
    id: "7",
    licenseId: "6",
    courseName: "Customer Service Excellence",
    provider: "Trade Skills Academy",
    completionDate: "2023-10-15",
    credits: 6,
    category: "Professional Development",
  },
];

const statusConfig: Record<LicenseStatus, { color: string; bgColor: string; label: string; icon: any }> = {
  active: { color: "#22C55E", bgColor: "#DCFCE7", label: "Active", icon: CheckCircle },
  expired: { color: "#DC2626", bgColor: "#FEE2E2", label: "Expired", icon: AlertTriangle },
  pending: { color: "#272D53", bgColor: "#E8E9EE", label: "Pending", icon: Clock },
  suspended: { color: "#6B7280", bgColor: "#F3F4F6", label: "Suspended", icon: AlertTriangle },
};

const typeConfig: Record<CertificationType, { label: string; icon: any; color: string }> = {
  plumber_license: { label: "Plumber License", icon: Award, color: "#3B82F6" },
  backflow: { label: "Backflow", icon: Shield, color: "#8B5CF6" },
  medical_gas: { label: "Medical Gas", icon: Shield, color: "#EC4899" },
  water_heater: { label: "Water Heater", icon: FileText, color: "#272D53" },
  continuing_education: { label: "CE Required", icon: GraduationCap, color: "#06B6D4" },
  osha: { label: "OSHA", icon: Shield, color: "#EF4444" },
  epa: { label: "EPA", icon: Shield, color: "#22C55E" },
  electrician_license: { label: "Electrician License", icon: Award, color: "#272D53" },
  journeyman_electrician: { label: "Journeyman Electrician", icon: Award, color: "#0EA5E9" },
  master_electrician: { label: "Master Electrician", icon: Award, color: "#8B5CF6" },
  low_voltage: { label: "Low Voltage", icon: Shield, color: "#14B8A6" },
  fire_alarm: { label: "Fire Alarm", icon: Shield, color: "#DC2626" },
  other: { label: "Other", icon: FileText, color: "#6B7280" },
};

export default function LicensingCertificationsScreen() {
  const router = useRouter();
  const [licenses, setLicenses] = useState<License[]>(mockLicenses);
  const [ceCourses] = useState<ContinuingEducation[]>(mockCECourses);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<LicenseStatus | "all">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"licenses" | "education">("licenses");

  const filteredLicenses = useMemo(() => {
    return licenses.filter((license) => {
      const matchesSearch =
        license.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        license.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        license.issuingAuthority.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = selectedStatus === "all" || license.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [licenses, searchQuery, selectedStatus]);

  const stats = useMemo(() => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    return {
      total: licenses.length,
      active: licenses.filter((l) => l.status === "active").length,
      expired: licenses.filter((l) => l.status === "expired").length,
      expiringSoon: licenses.filter((l) => {
        const expDate = new Date(l.expirationDate);
        return l.status === "active" && expDate <= thirtyDaysFromNow && expDate > now;
      }).length,
    };
  }, [licenses]);

  const expiringLicenses = useMemo(() => {
    const now = new Date();
    const sixtyDaysFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    
    return licenses.filter((l) => {
      const expDate = new Date(l.expirationDate);
      return (l.status === "active" && expDate <= sixtyDaysFromNow) || l.status === "expired";
    }).sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime());
  }, [licenses]);

  const getDaysUntilExpiration = (expirationDate: string) => {
    const now = new Date();
    const expDate = new Date(expirationDate);
    const diff = expDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const handleRenew = useCallback((licenseId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      "Start Renewal",
      "Would you like to start the renewal process for this license?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Start Renewal",
          onPress: () => {
            setLicenses((prev) =>
              prev.map((l) =>
                l.id === licenseId ? { ...l, status: "pending" as LicenseStatus } : l
              )
            );
            Alert.alert("Success", "Renewal process started. You will receive updates on your application status.");
          },
        },
      ]
    );
  }, []);

  const handleDelete = useCallback((licenseId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      "Delete License",
      "Are you sure you want to remove this license from your records?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setLicenses((prev) => prev.filter((l) => l.id !== licenseId));
            setSelectedLicense(null);
          },
        },
      ]
    );
  }, []);

  const getLicenseCECourses = (licenseId: string) => {
    return ceCourses.filter((course) => course.licenseId === licenseId);
  };

  const renderLicenseCard = (license: License) => {
    const status = statusConfig[license.status];
    const type = typeConfig[license.type];
    const StatusIcon = status.icon;
    const TypeIcon = type.icon;
    const daysUntil = getDaysUntilExpiration(license.expirationDate);
    const isExpiringSoon = daysUntil <= 60 && daysUntil > 0;

    return (
      <TouchableOpacity
        key={license.id}
        style={[
          styles.licenseCard,
          license.status === "expired" && styles.expiredCard,
          isExpiringSoon && styles.expiringSoonCard,
        ]}
        onPress={() => setSelectedLicense(license)}
        activeOpacity={0.7}
      >
        {(license.status === "expired" || isExpiringSoon) && (
          <View style={[styles.alertBanner, license.status === "expired" ? styles.expiredBanner : styles.warningBanner]}>
            <AlertTriangle size={14} color="#FFF" />
            <Text style={styles.alertBannerText}>
              {license.status === "expired" ? "EXPIRED" : `EXPIRES IN ${daysUntil} DAYS`}
            </Text>
          </View>
        )}

        <View style={styles.licenseCardHeader}>
          <View style={[styles.typeIcon, { backgroundColor: `${type.color}15` }]}>
            <TypeIcon size={22} color={type.color} />
          </View>
          <View style={styles.licenseInfo}>
            <Text style={styles.licenseName}>{license.name}</Text>
            <Text style={styles.licenseNumber}>{license.licenseNumber}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bgColor }]}>
            <StatusIcon size={12} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.licenseDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Issuing Authority</Text>
            <Text style={styles.detailValue} numberOfLines={1}>{license.issuingAuthority}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Expiration</Text>
            <Text style={[
              styles.detailValue,
              (license.status === "expired" || isExpiringSoon) && { color: license.status === "expired" ? "#DC2626" : "#272D53" }
            ]}>
              {new Date(license.expirationDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </Text>
          </View>
        </View>

        {license.ceCreditsRequired && license.ceCreditsRequired > 0 && (
          <View style={styles.ceProgress}>
            <View style={styles.ceProgressHeader}>
              <GraduationCap size={14} color={Colors.textSecondary} />
              <Text style={styles.ceProgressLabel}>CE Credits</Text>
              <Text style={styles.ceProgressValue}>
                {license.ceCreditsCompleted || 0}/{license.ceCreditsRequired}
              </Text>
            </View>
            <View style={styles.ceProgressBar}>
              <View
                style={[
                  styles.ceProgressFill,
                  {
                    width: `${Math.min(((license.ceCreditsCompleted || 0) / license.ceCreditsRequired) * 100, 100)}%`,
                    backgroundColor: (license.ceCreditsCompleted || 0) >= license.ceCreditsRequired ? "#22C55E" : "#3B82F6",
                  },
                ]}
              />
            </View>
          </View>
        )}

        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.viewButton} onPress={() => setSelectedLicense(license)}>
            <Eye size={16} color={Colors.primary} />
            <Text style={styles.viewButtonText}>View Details</Text>
          </TouchableOpacity>
          {(license.status === "expired" || isExpiringSoon) && (
            <TouchableOpacity
              style={[styles.renewButton, license.status === "expired" && styles.urgentRenewButton]}
              onPress={() => handleRenew(license.id)}
            >
              <RefreshCw size={16} color="#FFF" />
              <Text style={styles.renewButtonText}>Renew</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderCECourseCard = (course: ContinuingEducation) => {
    return (
      <View key={course.id} style={styles.courseCard}>
        <View style={styles.courseHeader}>
          <View style={styles.courseIcon}>
            <BookOpen size={18} color="#8B5CF6" />
          </View>
          <View style={styles.courseInfo}>
            <Text style={styles.courseName}>{course.courseName}</Text>
            <Text style={styles.courseProvider}>{course.provider}</Text>
          </View>
          <View style={styles.creditsBadge}>
            <Text style={styles.creditsValue}>{course.credits}</Text>
            <Text style={styles.creditsLabel}>Credits</Text>
          </View>
        </View>
        <View style={styles.courseFooter}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{course.category}</Text>
          </View>
          <Text style={styles.completionDate}>
            Completed {new Date(course.completionDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Licenses & Certifications",
          headerLeft: () => <BackButton />,
          headerRight: () => (
            <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
              <Plus size={24} color={Colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {expiringLicenses.length > 0 && (
          <TouchableOpacity style={styles.alertCard}>
            <View style={styles.alertCardContent}>
              <View style={styles.alertIconContainer}>
                <Bell size={24} color="#FFF" />
              </View>
              <View style={styles.alertTextContent}>
                <Text style={styles.alertTitle}>
                  {stats.expired > 0 ? `${stats.expired} Expired License${stats.expired > 1 ? "s" : ""}` : `${stats.expiringSoon} License${stats.expiringSoon > 1 ? "s" : ""} Expiring Soon`}
                </Text>
                <Text style={styles.alertSubtitle}>
                  {stats.expired > 0 ? "Renew now to continue working legally" : "Plan your renewals to avoid interruption"}
                </Text>
              </View>
            </View>
            <ChevronRight size={24} color="#FFF" />
          </TouchableOpacity>
        )}

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#DCFCE7" }]}>
            <Text style={[styles.statValue, { color: "#22C55E" }]}>{stats.active}</Text>
            <Text style={[styles.statLabel, { color: "#22C55E" }]}>Active</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#FEE2E2" }]}>
            <Text style={[styles.statValue, { color: "#DC2626" }]}>{stats.expired}</Text>
            <Text style={[styles.statLabel, { color: "#DC2626" }]}>Expired</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#E8E9EE" }]}>
            <Text style={[styles.statValue, { color: "#272D53" }]}>{stats.expiringSoon}</Text>
            <Text style={[styles.statLabel, { color: "#272D53" }]}>Expiring</Text>
          </View>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "licenses" && styles.activeTab]}
            onPress={() => setActiveTab("licenses")}
          >
            <Award size={18} color={activeTab === "licenses" ? Colors.primary : Colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === "licenses" && styles.activeTabText]}>Licenses</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "education" && styles.activeTab]}
            onPress={() => setActiveTab("education")}
          >
            <GraduationCap size={18} color={activeTab === "education" ? Colors.primary : Colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === "education" && styles.activeTabText]}>CE Courses</Text>
          </TouchableOpacity>
        </View>

        {activeTab === "licenses" && (
          <>
            <View style={styles.searchSection}>
              <View style={styles.searchBar}>
                <Search size={18} color={Colors.textTertiary} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search licenses..."
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
                  {(Object.keys(statusConfig) as LicenseStatus[]).map((status) => (
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

            <View style={styles.licensesSection}>
              <Text style={styles.sectionTitle}>
                Your Licenses ({filteredLicenses.length})
              </Text>
              {filteredLicenses.map(renderLicenseCard)}

              {filteredLicenses.length === 0 && (
                <View style={styles.emptyState}>
                  <Award size={48} color={Colors.textTertiary} />
                  <Text style={styles.emptyStateTitle}>No Licenses Found</Text>
                  <Text style={styles.emptyStateText}>
                    {searchQuery || selectedStatus !== "all"
                      ? "Try adjusting your filters"
                      : "Add your first license to get started"}
                  </Text>
                </View>
              )}
            </View>
          </>
        )}

        {activeTab === "education" && (
          <View style={styles.educationSection}>
            <Text style={styles.sectionTitle}>Continuing Education ({ceCourses.length})</Text>
            <Text style={styles.sectionSubtitle}>Track your CE credits and completed courses</Text>
            {ceCourses.map(renderCECourseCard)}

            <TouchableOpacity style={styles.addCourseButton}>
              <Plus size={20} color={Colors.primary} />
              <Text style={styles.addCourseText}>Add CE Course</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal visible={selectedLicense !== null} animationType="slide" presentationStyle="pageSheet">
        {selectedLicense && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedLicense(null)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>License Details</Text>
              <TouchableOpacity onPress={() => handleDelete(selectedLicense.id)}>
                <Trash2 size={22} color={Colors.error} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.modalLicenseHeader}>
                <View style={[styles.modalTypeIcon, { backgroundColor: `${typeConfig[selectedLicense.type].color}15` }]}>
                  {React.createElement(typeConfig[selectedLicense.type].icon, {
                    size: 32,
                    color: typeConfig[selectedLicense.type].color,
                  })}
                </View>
                <Text style={styles.modalLicenseName}>{selectedLicense.name}</Text>
                <View style={[styles.modalStatusBadge, { backgroundColor: statusConfig[selectedLicense.status].bgColor }]}>
                  {React.createElement(statusConfig[selectedLicense.status].icon, {
                    size: 14,
                    color: statusConfig[selectedLicense.status].color,
                  })}
                  <Text style={[styles.modalStatusText, { color: statusConfig[selectedLicense.status].color }]}>
                    {statusConfig[selectedLicense.status].label}
                  </Text>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>License Information</Text>
                <View style={styles.detailGrid}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailItemLabel}>License Number</Text>
                    <Text style={styles.detailItemValue}>{selectedLicense.licenseNumber}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailItemLabel}>Issuing Authority</Text>
                    <Text style={styles.detailItemValue}>{selectedLicense.issuingAuthority}</Text>
                  </View>
                  {selectedLicense.state && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailItemLabel}>State</Text>
                      <Text style={styles.detailItemValue}>{selectedLicense.state}</Text>
                    </View>
                  )}
                  <View style={styles.detailItem}>
                    <Text style={styles.detailItemLabel}>Issue Date</Text>
                    <Text style={styles.detailItemValue}>
                      {new Date(selectedLicense.issueDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailItemLabel}>Expiration Date</Text>
                    <Text style={[
                      styles.detailItemValue,
                      selectedLicense.status === "expired" && { color: "#DC2626" }
                    ]}>
                      {new Date(selectedLicense.expirationDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </Text>
                  </View>
                </View>
              </View>

              {selectedLicense.ceCreditsRequired && selectedLicense.ceCreditsRequired > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Continuing Education</Text>
                  <View style={styles.ceDetailCard}>
                    <View style={styles.ceDetailHeader}>
                      <Text style={styles.ceDetailCredits}>
                        {selectedLicense.ceCreditsCompleted || 0} / {selectedLicense.ceCreditsRequired}
                      </Text>
                      <Text style={styles.ceDetailLabel}>Credits Completed</Text>
                    </View>
                    <View style={styles.ceDetailProgressBar}>
                      <View
                        style={[
                          styles.ceDetailProgressFill,
                          {
                            width: `${Math.min(((selectedLicense.ceCreditsCompleted || 0) / selectedLicense.ceCreditsRequired) * 100, 100)}%`,
                            backgroundColor: (selectedLicense.ceCreditsCompleted || 0) >= selectedLicense.ceCreditsRequired ? "#22C55E" : "#3B82F6",
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.ceDetailRemaining}>
                      {Math.max(selectedLicense.ceCreditsRequired - (selectedLicense.ceCreditsCompleted || 0), 0)} credits remaining
                    </Text>
                  </View>

                  <Text style={styles.relatedCoursesTitle}>Related Courses</Text>
                  {getLicenseCECourses(selectedLicense.id).map(renderCECourseCard)}
                </View>
              )}

              {selectedLicense.notes && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Notes</Text>
                  <Text style={styles.notesText}>{selectedLicense.notes}</Text>
                </View>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.editButton}>
                  <Edit3 size={18} color={Colors.primary} />
                  <Text style={styles.editButtonText}>Edit License</Text>
                </TouchableOpacity>
                {(selectedLicense.status === "expired" || getDaysUntilExpiration(selectedLicense.expirationDate) <= 60) && (
                  <TouchableOpacity
                    style={[styles.modalRenewButton, selectedLicense.status === "expired" && styles.urgentModalRenewButton]}
                    onPress={() => {
                      handleRenew(selectedLicense.id);
                      setSelectedLicense(null);
                    }}
                  >
                    <RefreshCw size={18} color="#FFF" />
                    <Text style={styles.modalRenewButtonText}>Start Renewal</Text>
                  </TouchableOpacity>
                )}
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
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#DC2626",
    margin: 16,
    marginBottom: 0,
    padding: 16,
    borderRadius: 16,
  },
  alertCardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  alertIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  alertTextContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFF",
  },
  alertSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
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
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tabsContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: Colors.surfaceSecondary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.primary,
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
  licensesSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 14,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: -10,
    marginBottom: 16,
  },
  licenseCard: {
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
  expiredCard: {
    borderWidth: 2,
    borderColor: "#DC2626",
  },
  expiringSoonCard: {
    borderWidth: 2,
    borderColor: "#272D53",
  },
  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginHorizontal: -16,
    marginTop: -16,
    marginBottom: 12,
    paddingVertical: 6,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  expiredBanner: {
    backgroundColor: "#DC2626",
  },
  warningBanner: {
    backgroundColor: "#272D53",
  },
  alertBannerText: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: "#FFF",
    letterSpacing: 1,
  },
  licenseCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  licenseInfo: {
    flex: 1,
  },
  licenseName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  licenseNumber: {
    fontSize: 13,
    color: Colors.textSecondary,
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
  licenseDetails: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 10,
    padding: 12,
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.text,
    flex: 1,
    textAlign: "right" as const,
    marginLeft: 12,
  },
  ceProgress: {
    marginBottom: 12,
  },
  ceProgressHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  ceProgressLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  ceProgressValue: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  ceProgressBar: {
    height: 6,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 3,
    overflow: "hidden",
  },
  ceProgressFill: {
    height: "100%",
    borderRadius: 3,
  },
  cardActions: {
    flexDirection: "row",
    gap: 10,
  },
  viewButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.surfaceSecondary,
    paddingVertical: 10,
    borderRadius: 10,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  renewButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#272D53",
    paddingVertical: 10,
    borderRadius: 10,
  },
  urgentRenewButton: {
    backgroundColor: "#DC2626",
  },
  renewButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FFF",
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
  educationSection: {
    padding: 16,
  },
  courseCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  courseHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  courseIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#8B5CF615",
    alignItems: "center",
    justifyContent: "center",
  },
  courseInfo: {
    flex: 1,
  },
  courseName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  courseProvider: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  creditsBadge: {
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  creditsValue: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#22C55E",
  },
  creditsLabel: {
    fontSize: 10,
    color: "#22C55E",
    fontWeight: "500" as const,
  },
  courseFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryBadge: {
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: Colors.textSecondary,
  },
  completionDate: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  addCourseButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.surface,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderStyle: "dashed",
  },
  addCourseText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.primary,
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
  modalLicenseHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  modalTypeIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalLicenseName: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
    textAlign: "center" as const,
    marginBottom: 12,
  },
  modalStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  modalStatusText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  detailGrid: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    gap: 14,
  },
  detailItem: {},
  detailItemLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  detailItemValue: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  ceDetailCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  ceDetailHeader: {
    alignItems: "center",
    marginBottom: 12,
  },
  ceDetailCredits: {
    fontSize: 32,
    fontWeight: "800" as const,
    color: Colors.text,
  },
  ceDetailLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  ceDetailProgressBar: {
    width: "100%",
    height: 10,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 8,
  },
  ceDetailProgressFill: {
    height: "100%",
    borderRadius: 5,
  },
  ceDetailRemaining: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  relatedCoursesTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  notesText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 14,
  },
  modalActions: {
    gap: 12,
    marginTop: 8,
  },
  editButton: {
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
  editButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  modalRenewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#272D53",
    paddingVertical: 16,
    borderRadius: 12,
  },
  urgentModalRenewButton: {
    backgroundColor: "#DC2626",
  },
  modalRenewButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFF",
  },
});
