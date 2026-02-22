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
  Platform,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import {
  ArrowLeft,
  Plus,
  Phone,
  MapPin,
  Clock,
  AlertTriangle,
  Zap,
  Calendar,
  CheckCircle,
  Navigation,
  Filter,
  Search,
  X,
  Droplets,
  Wrench,
  ClipboardCheck,
  Truck,
  User,
  DollarSign,
  ChevronRight,
  Bell,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";
import {
  ServiceCall,
  ServiceCallPriority,
  ServiceCallStatus,
  ServiceCallType,
} from "@/types";

const mockServiceCalls: ServiceCall[] = [
  {
    id: "1",
    customerId: "c1",
    customerName: "Sarah Mitchell",
    customerPhone: "(512) 555-0123",
    customerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    address: "1234 Oak Valley Dr, Austin, TX 78749",
    latitude: 30.2234,
    longitude: -97.7965,
    type: "emergency",
    priority: "emergency",
    status: "pending",
    description: "Burst pipe in basement - water flooding",
    issueDetails: "Main water line burst, basement flooding rapidly. Needs immediate attention.",
    estimatedDuration: "2-3 hours",
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: "2",
    customerId: "c2",
    customerName: "Michael Chen",
    customerPhone: "(512) 555-0456",
    customerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    address: "567 Maple Street, Round Rock, TX 78681",
    latitude: 30.5083,
    longitude: -97.6789,
    type: "repair",
    priority: "urgent",
    status: "dispatched",
    description: "Water heater not working - no hot water",
    issueDetails: "Electric water heater stopped working yesterday. Family of 4 without hot water.",
    scheduledDate: new Date().toISOString().split("T")[0],
    scheduledTime: "10:00 AM",
    estimatedDuration: "1-2 hours",
    estimatedCost: 350,
    dispatchedAt: new Date(Date.now() - 30 * 60000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60000).toISOString(),
  },
  {
    id: "3",
    customerId: "c3",
    customerName: "Jennifer Lopez",
    customerPhone: "(512) 555-0789",
    address: "890 Cedar Lane, Cedar Park, TX 78613",
    latitude: 30.5052,
    longitude: -97.8203,
    type: "installation",
    priority: "scheduled",
    status: "pending",
    description: "New bathroom fixture installation",
    issueDetails: "Install new toilet, vanity, and faucet in master bathroom remodel.",
    scheduledDate: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
    scheduledTime: "9:00 AM",
    estimatedDuration: "4-5 hours",
    estimatedCost: 800,
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    id: "4",
    customerId: "c4",
    customerName: "Robert Johnson",
    customerPhone: "(512) 555-0321",
    customerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
    address: "234 Pine Ave, Austin, TX 78704",
    latitude: 30.2456,
    longitude: -97.7654,
    type: "maintenance",
    priority: "routine",
    status: "in_progress",
    description: "Annual plumbing inspection",
    issueDetails: "Regular maintenance check for all plumbing fixtures and pipes.",
    scheduledDate: new Date().toISOString().split("T")[0],
    scheduledTime: "2:00 PM",
    estimatedDuration: "1 hour",
    estimatedCost: 150,
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 3600000).toISOString(),
  },
  {
    id: "5",
    customerId: "c5",
    customerName: "Emily Davis",
    customerPhone: "(512) 555-0654",
    address: "456 Elm Street, Pflugerville, TX 78660",
    latitude: 30.4393,
    longitude: -97.6200,
    type: "repair",
    priority: "urgent",
    status: "pending",
    description: "Clogged drain - water backing up",
    issueDetails: "Kitchen sink completely clogged. Water backing up into dishwasher.",
    estimatedDuration: "1-2 hours",
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 45 * 60000).toISOString(),
  },
  {
    id: "6",
    customerId: "c6",
    customerName: "David Wilson",
    customerPhone: "(512) 555-0987",
    address: "789 Walnut Dr, Lakeway, TX 78734",
    latitude: 30.3614,
    longitude: -97.9794,
    type: "inspection",
    priority: "scheduled",
    status: "completed",
    description: "Pre-purchase plumbing inspection",
    issueDetails: "Full plumbing inspection for home purchase closing.",
    scheduledDate: new Date(Date.now() - 1 * 86400000).toISOString().split("T")[0],
    scheduledTime: "11:00 AM",
    estimatedDuration: "2 hours",
    actualCost: 275,
    completedAt: new Date(Date.now() - 20 * 3600000).toISOString(),
    createdAt: new Date(Date.now() - 72 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 3600000).toISOString(),
  },
];

const priorityConfig: Record<ServiceCallPriority, { color: string; bgColor: string; icon: any; label: string }> = {
  emergency: { color: "#DC2626", bgColor: "#FEE2E2", icon: AlertTriangle, label: "Emergency" },
  urgent: { color: "#272D53", bgColor: "#E8E9EE", icon: Zap, label: "Urgent" },
  routine: { color: "#3B82F6", bgColor: "#DBEAFE", icon: Wrench, label: "Routine" },
  scheduled: { color: "#22C55E", bgColor: "#DCFCE7", icon: Calendar, label: "Scheduled" },
};

const statusConfig: Record<ServiceCallStatus, { color: string; label: string }> = {
  pending: { color: "#272D53", label: "Pending" },
  dispatched: { color: "#3B82F6", label: "Dispatched" },
  en_route: { color: "#8B5CF6", label: "En Route" },
  in_progress: { color: "#06B6D4", label: "In Progress" },
  completed: { color: "#22C55E", label: "Completed" },
  cancelled: { color: "#6B7280", label: "Cancelled" },
};

const typeConfig: Record<ServiceCallType, { icon: any; label: string }> = {
  repair: { icon: Wrench, label: "Repair" },
  installation: { icon: Droplets, label: "Installation" },
  maintenance: { icon: ClipboardCheck, label: "Maintenance" },
  inspection: { icon: ClipboardCheck, label: "Inspection" },
  emergency: { icon: AlertTriangle, label: "Emergency" },
};

export default function ServiceCallsScreen() {
  const router = useRouter();
  const [serviceCalls, setServiceCalls] = useState<ServiceCall[]>(mockServiceCalls);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<ServiceCallPriority | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<ServiceCallStatus | "all">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showNewCallModal, setShowNewCallModal] = useState(false);
  const [selectedCall, setSelectedCall] = useState<ServiceCall | null>(null);

  const filteredCalls = useMemo(() => {
    return serviceCalls
      .filter((call) => {
        const matchesSearch =
          call.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          call.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          call.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPriority = selectedPriority === "all" || call.priority === selectedPriority;
        const matchesStatus = selectedStatus === "all" || call.status === selectedStatus;
        return matchesSearch && matchesPriority && matchesStatus;
      })
      .sort((a, b) => {
        const priorityOrder = { emergency: 0, urgent: 1, routine: 2, scheduled: 3 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [serviceCalls, searchQuery, selectedPriority, selectedStatus]);

  const emergencyCalls = useMemo(() => {
    return serviceCalls.filter(
      (call) => call.priority === "emergency" && call.status !== "completed" && call.status !== "cancelled"
    );
  }, [serviceCalls]);

  const stats = useMemo(() => {
    const active = serviceCalls.filter((c) => !["completed", "cancelled"].includes(c.status));
    return {
      total: active.length,
      emergency: active.filter((c) => c.priority === "emergency").length,
      urgent: active.filter((c) => c.priority === "urgent").length,
      scheduled: active.filter((c) => c.priority === "scheduled").length,
    };
  }, [serviceCalls]);

  const handleCall = useCallback((phone: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(`tel:${phone.replace(/[^0-9]/g, "")}`);
  }, []);

  const handleNavigate = useCallback((address: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const encodedAddress = encodeURIComponent(address);
    const url = Platform.select({
      ios: `maps://app?daddr=${encodedAddress}`,
      android: `google.navigation:q=${encodedAddress}`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`,
    });
    Linking.openURL(url);
  }, []);

  const handleDispatch = useCallback((callId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setServiceCalls((prev) =>
      prev.map((call) =>
        call.id === callId
          ? { ...call, status: "dispatched" as ServiceCallStatus, dispatchedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
          : call
      )
    );
    Alert.alert("Dispatched!", "You have been dispatched to this service call.");
  }, []);

  const handleUpdateStatus = useCallback((callId: string, newStatus: ServiceCallStatus) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setServiceCalls((prev) =>
      prev.map((call) =>
        call.id === callId
          ? {
              ...call,
              status: newStatus,
              updatedAt: new Date().toISOString(),
              completedAt: newStatus === "completed" ? new Date().toISOString() : call.completedAt,
            }
          : call
      )
    );
  }, []);

  const handleEmergencyDispatch = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    if (emergencyCalls.length > 0) {
      const firstEmergency = emergencyCalls[0];
      Alert.alert(
        "Emergency Dispatch",
        `Dispatch to ${firstEmergency.customerName} at ${firstEmergency.address}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Dispatch Now",
            style: "destructive",
            onPress: () => handleDispatch(firstEmergency.id),
          },
        ]
      );
    } else {
      Alert.alert("No Emergencies", "There are no pending emergency calls.");
    }
  }, [emergencyCalls, handleDispatch]);

  const getTimeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const renderServiceCallCard = (call: ServiceCall) => {
    const priority = priorityConfig[call.priority];
    const status = statusConfig[call.status];
    const type = typeConfig[call.type];
    const PriorityIcon = priority.icon;
    const TypeIcon = type.icon;

    return (
      <TouchableOpacity
        key={call.id}
        style={[
          styles.callCard,
          call.priority === "emergency" && styles.emergencyCard,
        ]}
        onPress={() => setSelectedCall(call)}
        activeOpacity={0.7}
      >
        {call.priority === "emergency" && (
          <View style={styles.emergencyBanner}>
            <AlertTriangle size={14} color="#FFF" />
            <Text style={styles.emergencyBannerText}>EMERGENCY</Text>
          </View>
        )}

        <View style={styles.callCardHeader}>
          <View style={styles.customerInfo}>
            {call.customerAvatar ? (
              <Image source={{ uri: call.customerAvatar }} style={styles.customerAvatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <User size={20} color={Colors.textSecondary} />
              </View>
            )}
            <View style={styles.customerDetails}>
              <Text style={styles.customerName}>{call.customerName}</Text>
              <Text style={styles.callDescription} numberOfLines={1}>
                {call.description}
              </Text>
            </View>
          </View>
          <View style={[styles.priorityBadge, { backgroundColor: priority.bgColor }]}>
            <PriorityIcon size={12} color={priority.color} />
            <Text style={[styles.priorityText, { color: priority.color }]}>{priority.label}</Text>
          </View>
        </View>

        <View style={styles.callCardBody}>
          <View style={styles.addressRow}>
            <MapPin size={14} color={Colors.textSecondary} />
            <Text style={styles.addressText} numberOfLines={1}>
              {call.address}
            </Text>
          </View>

          <View style={styles.callMeta}>
            <View style={styles.metaItem}>
              <TypeIcon size={14} color={Colors.textSecondary} />
              <Text style={styles.metaText}>{type.label}</Text>
            </View>
            {call.scheduledDate && (
              <View style={styles.metaItem}>
                <Calendar size={14} color={Colors.textSecondary} />
                <Text style={styles.metaText}>
                  {new Date(call.scheduledDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  {call.scheduledTime && ` at ${call.scheduledTime}`}
                </Text>
              </View>
            )}
            {call.estimatedCost && (
              <View style={styles.metaItem}>
                <DollarSign size={14} color={Colors.textSecondary} />
                <Text style={styles.metaText}>${call.estimatedCost}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.callCardFooter}>
          <View style={[styles.statusBadge, { backgroundColor: `${status.color}15` }]}>
            <View style={[styles.statusDot, { backgroundColor: status.color }]} />
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
          <View style={styles.timeRow}>
            <Clock size={12} color={Colors.textTertiary} />
            <Text style={styles.timeText}>{getTimeAgo(call.createdAt)}</Text>
          </View>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => handleCall(call.customerPhone)}
          >
            <Phone size={16} color="#3B82F6" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => handleNavigate(call.address)}
          >
            <Navigation size={16} color="#22C55E" />
          </TouchableOpacity>
          {call.status === "pending" && (
            <TouchableOpacity
              style={[styles.dispatchButton, call.priority === "emergency" && styles.emergencyDispatchButton]}
              onPress={() => handleDispatch(call.id)}
            >
              <Truck size={14} color="#FFF" />
              <Text style={styles.dispatchButtonText}>Dispatch</Text>
            </TouchableOpacity>
          )}
          {call.status === "dispatched" && (
            <TouchableOpacity
              style={styles.enRouteButton}
              onPress={() => handleUpdateStatus(call.id, "en_route")}
            >
              <Text style={styles.enRouteButtonText}>En Route</Text>
            </TouchableOpacity>
          )}
          {call.status === "en_route" && (
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => handleUpdateStatus(call.id, "in_progress")}
            >
              <Text style={styles.startButtonText}>Start Job</Text>
            </TouchableOpacity>
          )}
          {call.status === "in_progress" && (
            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => handleUpdateStatus(call.id, "completed")}
            >
              <CheckCircle size={14} color="#FFF" />
              <Text style={styles.completeButtonText}>Complete</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Service Calls",
          headerLeft: () => <BackButton />,
          headerRight: () => (
            <TouchableOpacity onPress={() => setShowNewCallModal(true)} style={styles.addButton}>
              <Plus size={24} color={Colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {emergencyCalls.length > 0 && (
          <TouchableOpacity style={styles.emergencyAlert} onPress={handleEmergencyDispatch}>
            <View style={styles.emergencyAlertContent}>
              <View style={styles.emergencyAlertIcon}>
                <AlertTriangle size={24} color="#FFF" />
              </View>
              <View style={styles.emergencyAlertText}>
                <Text style={styles.emergencyAlertTitle}>
                  {emergencyCalls.length} Emergency Call{emergencyCalls.length > 1 ? "s" : ""}
                </Text>
                <Text style={styles.emergencyAlertSubtitle}>Tap to dispatch immediately</Text>
              </View>
            </View>
            <ChevronRight size={24} color="#FFF" />
          </TouchableOpacity>
        )}

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#FEE2E2" }]}>
            <Text style={[styles.statValue, { color: "#DC2626" }]}>{stats.emergency}</Text>
            <Text style={[styles.statLabel, { color: "#DC2626" }]}>Emergency</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#E8E9EE" }]}>
            <Text style={[styles.statValue, { color: "#272D53" }]}>{stats.urgent}</Text>
            <Text style={[styles.statLabel, { color: "#272D53" }]}>Urgent</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#DCFCE7" }]}>
            <Text style={[styles.statValue, { color: "#22C55E" }]}>{stats.scheduled}</Text>
            <Text style={[styles.statLabel, { color: "#22C55E" }]}>Scheduled</Text>
          </View>
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Search size={18} color={Colors.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search calls..."
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
            <Text style={styles.filterLabel}>Priority</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <TouchableOpacity
                style={[styles.filterChip, selectedPriority === "all" && styles.filterChipActive]}
                onPress={() => setSelectedPriority("all")}
              >
                <Text style={[styles.filterChipText, selectedPriority === "all" && styles.filterChipTextActive]}>
                  All
                </Text>
              </TouchableOpacity>
              {(Object.keys(priorityConfig) as ServiceCallPriority[]).map((priority) => (
                <TouchableOpacity
                  key={priority}
                  style={[
                    styles.filterChip,
                    selectedPriority === priority && styles.filterChipActive,
                    selectedPriority === priority && { backgroundColor: priorityConfig[priority].color },
                  ]}
                  onPress={() => setSelectedPriority(priority)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedPriority === priority && styles.filterChipTextActive,
                    ]}
                  >
                    {priorityConfig[priority].label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.filterLabel, { marginTop: 12 }]}>Status</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <TouchableOpacity
                style={[styles.filterChip, selectedStatus === "all" && styles.filterChipActive]}
                onPress={() => setSelectedStatus("all")}
              >
                <Text style={[styles.filterChipText, selectedStatus === "all" && styles.filterChipTextActive]}>
                  All
                </Text>
              </TouchableOpacity>
              {(Object.keys(statusConfig) as ServiceCallStatus[]).map((status) => (
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

        <View style={styles.callsSection}>
          <Text style={styles.sectionTitle}>
            Service Calls ({filteredCalls.length})
          </Text>
          {filteredCalls.map(renderServiceCallCard)}

          {filteredCalls.length === 0 && (
            <View style={styles.emptyState}>
              <Droplets size={48} color={Colors.textTertiary} />
              <Text style={styles.emptyStateTitle}>No Service Calls</Text>
              <Text style={styles.emptyStateText}>
                {searchQuery || selectedPriority !== "all" || selectedStatus !== "all"
                  ? "Try adjusting your filters"
                  : "New service calls will appear here"}
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal visible={selectedCall !== null} animationType="slide" presentationStyle="pageSheet">
        {selectedCall && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedCall(null)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Service Call Details</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.detailSection}>
                <View style={styles.customerHeader}>
                  {selectedCall.customerAvatar ? (
                    <Image source={{ uri: selectedCall.customerAvatar }} style={styles.detailAvatar} />
                  ) : (
                    <View style={styles.detailAvatarPlaceholder}>
                      <User size={32} color={Colors.textSecondary} />
                    </View>
                  )}
                  <View style={styles.customerHeaderInfo}>
                    <Text style={styles.detailCustomerName}>{selectedCall.customerName}</Text>
                    <TouchableOpacity
                      style={styles.phoneRow}
                      onPress={() => handleCall(selectedCall.customerPhone)}
                    >
                      <Phone size={14} color="#3B82F6" />
                      <Text style={styles.phoneText}>{selectedCall.customerPhone}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.priorityStatusRow}>
                  <View
                    style={[
                      styles.detailBadge,
                      { backgroundColor: priorityConfig[selectedCall.priority].bgColor },
                    ]}
                  >
                    {React.createElement(priorityConfig[selectedCall.priority].icon, {
                      size: 14,
                      color: priorityConfig[selectedCall.priority].color,
                    })}
                    <Text
                      style={[styles.detailBadgeText, { color: priorityConfig[selectedCall.priority].color }]}
                    >
                      {priorityConfig[selectedCall.priority].label}
                    </Text>
                  </View>
                  <View
                    style={[styles.detailBadge, { backgroundColor: `${statusConfig[selectedCall.status].color}15` }]}
                  >
                    <View
                      style={[styles.statusDot, { backgroundColor: statusConfig[selectedCall.status].color }]}
                    />
                    <Text
                      style={[styles.detailBadgeText, { color: statusConfig[selectedCall.status].color }]}
                    >
                      {statusConfig[selectedCall.status].label}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Issue</Text>
                <Text style={styles.detailValue}>{selectedCall.description}</Text>
                {selectedCall.issueDetails && (
                  <Text style={styles.detailSubtext}>{selectedCall.issueDetails}</Text>
                )}
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Location</Text>
                <TouchableOpacity
                  style={styles.addressCard}
                  onPress={() => handleNavigate(selectedCall.address)}
                >
                  <MapPin size={18} color="#22C55E" />
                  <Text style={styles.addressCardText}>{selectedCall.address}</Text>
                  <Navigation size={18} color="#22C55E" />
                </TouchableOpacity>
              </View>

              {(selectedCall.scheduledDate || selectedCall.estimatedDuration || selectedCall.estimatedCost) && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Schedule & Estimate</Text>
                  <View style={styles.infoGrid}>
                    {selectedCall.scheduledDate && (
                      <View style={styles.infoItem}>
                        <Calendar size={16} color={Colors.textSecondary} />
                        <Text style={styles.infoText}>
                          {new Date(selectedCall.scheduledDate).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                          {selectedCall.scheduledTime && ` at ${selectedCall.scheduledTime}`}
                        </Text>
                      </View>
                    )}
                    {selectedCall.estimatedDuration && (
                      <View style={styles.infoItem}>
                        <Clock size={16} color={Colors.textSecondary} />
                        <Text style={styles.infoText}>{selectedCall.estimatedDuration}</Text>
                      </View>
                    )}
                    {selectedCall.estimatedCost && (
                      <View style={styles.infoItem}>
                        <DollarSign size={16} color={Colors.textSecondary} />
                        <Text style={styles.infoText}>Est. ${selectedCall.estimatedCost}</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalActionButton}
                  onPress={() => handleCall(selectedCall.customerPhone)}
                >
                  <Phone size={20} color="#3B82F6" />
                  <Text style={styles.modalActionText}>Call</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalActionButton}
                  onPress={() => handleNavigate(selectedCall.address)}
                >
                  <Navigation size={20} color="#22C55E" />
                  <Text style={styles.modalActionText}>Navigate</Text>
                </TouchableOpacity>
              </View>

              {selectedCall.status === "pending" && (
                <TouchableOpacity
                  style={[
                    styles.primaryModalButton,
                    selectedCall.priority === "emergency" && styles.emergencyModalButton,
                  ]}
                  onPress={() => {
                    handleDispatch(selectedCall.id);
                    setSelectedCall(null);
                  }}
                >
                  <Truck size={20} color="#FFF" />
                  <Text style={styles.primaryModalButtonText}>Dispatch Now</Text>
                </TouchableOpacity>
              )}
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
  emergencyAlert: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#DC2626",
    margin: 16,
    marginBottom: 0,
    padding: 16,
    borderRadius: 16,
  },
  emergencyAlertContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  emergencyAlertIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  emergencyAlertText: {},
  emergencyAlertTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFF",
  },
  emergencyAlertSubtitle: {
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
  callsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 14,
  },
  callCard: {
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
  emergencyCard: {
    borderWidth: 2,
    borderColor: "#DC2626",
  },
  emergencyBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#DC2626",
    marginHorizontal: -16,
    marginTop: -16,
    marginBottom: 12,
    paddingVertical: 6,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  emergencyBannerText: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: "#FFF",
    letterSpacing: 1,
  },
  callCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  customerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  customerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  callDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  callCardBody: {
    marginBottom: 12,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  callMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  callCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  quickActions: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  quickActionButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  dispatchButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#3B82F6",
    paddingVertical: 10,
    borderRadius: 10,
  },
  emergencyDispatchButton: {
    backgroundColor: "#DC2626",
  },
  dispatchButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FFF",
  },
  enRouteButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8B5CF6",
    paddingVertical: 10,
    borderRadius: 10,
  },
  enRouteButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FFF",
  },
  startButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#06B6D4",
    paddingVertical: 10,
    borderRadius: 10,
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FFF",
  },
  completeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#22C55E",
    paddingVertical: 10,
    borderRadius: 10,
  },
  completeButtonText: {
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
  detailSection: {
    marginBottom: 24,
  },
  customerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  detailAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  detailAvatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  customerHeaderInfo: {},
  detailCustomerName: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  phoneText: {
    fontSize: 15,
    color: "#3B82F6",
  },
  priorityStatusRow: {
    flexDirection: "row",
    gap: 10,
  },
  detailBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  detailBadgeText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  detailSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 6,
    lineHeight: 20,
  },
  addressCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  addressCardText: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  infoGrid: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoText: {
    fontSize: 15,
    color: Colors.text,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
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
  primaryModalButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#3B82F6",
    paddingVertical: 16,
    borderRadius: 12,
  },
  emergencyModalButton: {
    backgroundColor: "#DC2626",
  },
  primaryModalButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFF",
  },
});
