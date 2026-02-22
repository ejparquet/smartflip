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
  Platform,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import {
  ArrowLeft,
  Plus,
  CircuitBoard,
  Zap,
  Search,
  X,
  Edit3,
  Trash2,
  Copy,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Power,
  Home,
  Building2,
  Gauge,
  ToggleLeft,
  ToggleRight,
  Grid3X3,
  FileText,
  Share2,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";

type BreakerSize = "15" | "20" | "30" | "40" | "50" | "60" | "70" | "100" | "125" | "150" | "200";
type BreakerType = "single" | "double" | "gfci" | "afci" | "dual_function" | "tandem";
type CircuitStatus = "active" | "spare" | "reserved" | "tripped";

interface Circuit {
  id: string;
  position: number;
  breakerSize: BreakerSize;
  breakerType: BreakerType;
  label: string;
  description: string;
  status: CircuitStatus;
  load?: string;
  room?: string;
  notes?: string;
}

interface Panel {
  id: string;
  name: string;
  location: string;
  mainBreakerSize: BreakerSize;
  totalCircuits: number;
  voltage: "120/240V" | "208V" | "480V";
  phases: "1" | "3";
  manufacturer?: string;
  model?: string;
  installDate?: string;
  circuits: Circuit[];
  customerId?: string;
  customerName?: string;
  address?: string;
}

const mockPanels: Panel[] = [
  {
    id: "1",
    name: "Main Panel",
    location: "Garage - East Wall",
    mainBreakerSize: "200",
    totalCircuits: 40,
    voltage: "120/240V",
    phases: "1",
    manufacturer: "Square D",
    model: "QO140L200PG",
    installDate: "2024-06-15",
    customerName: "Johnson Residence",
    address: "1234 Oak Street, Austin, TX",
    circuits: [
      { id: "c1", position: 1, breakerSize: "20", breakerType: "afci", label: "Master Bedroom", description: "Outlets & lights", status: "active", room: "Master Bedroom" },
      { id: "c2", position: 2, breakerSize: "20", breakerType: "afci", label: "Bedroom 2", description: "Outlets & lights", status: "active", room: "Bedroom 2" },
      { id: "c3", position: 3, breakerSize: "20", breakerType: "gfci", label: "Kitchen Outlets", description: "Counter outlets", status: "active", room: "Kitchen" },
      { id: "c4", position: 4, breakerSize: "20", breakerType: "gfci", label: "Kitchen Outlets 2", description: "Island & peninsula", status: "active", room: "Kitchen" },
      { id: "c5", position: 5, breakerSize: "20", breakerType: "single", label: "Dishwasher", description: "Dedicated circuit", status: "active", room: "Kitchen" },
      { id: "c6", position: 6, breakerSize: "20", breakerType: "single", label: "Disposal", description: "Garbage disposal", status: "active", room: "Kitchen" },
      { id: "c7", position: 7, breakerSize: "50", breakerType: "double", label: "Range", description: "Electric range/oven", status: "active", room: "Kitchen" },
      { id: "c9", position: 9, breakerSize: "30", breakerType: "double", label: "Dryer", description: "Electric dryer", status: "active", room: "Laundry" },
      { id: "c11", position: 11, breakerSize: "20", breakerType: "single", label: "Washer", description: "Washing machine", status: "active", room: "Laundry" },
      { id: "c12", position: 12, breakerSize: "20", breakerType: "gfci", label: "Bathroom 1", description: "Master bath outlets", status: "active", room: "Master Bath" },
      { id: "c13", position: 13, breakerSize: "15", breakerType: "single", label: "Lighting - Living", description: "Living room lights", status: "active", room: "Living Room" },
      { id: "c14", position: 14, breakerSize: "15", breakerType: "single", label: "Lighting - Kitchen", description: "Kitchen lights", status: "active", room: "Kitchen" },
      { id: "c15", position: 15, breakerSize: "40", breakerType: "double", label: "Water Heater", description: "Electric water heater", status: "active", room: "Garage" },
      { id: "c17", position: 17, breakerSize: "30", breakerType: "double", label: "A/C Compressor", description: "HVAC outdoor unit", status: "active", room: "Exterior" },
      { id: "c19", position: 19, breakerSize: "15", breakerType: "single", label: "Air Handler", description: "HVAC indoor unit", status: "active", room: "Attic" },
      { id: "c20", position: 20, breakerSize: "20", breakerType: "gfci", label: "Garage Outlets", description: "Garage receptacles", status: "active", room: "Garage" },
      { id: "c21", position: 21, breakerSize: "20", breakerType: "gfci", label: "Outdoor Outlets", description: "Exterior receptacles", status: "active", room: "Exterior" },
      { id: "c22", position: 22, breakerSize: "15", breakerType: "single", label: "Spare", description: "", status: "spare" },
      { id: "c23", position: 23, breakerSize: "50", breakerType: "double", label: "EV Charger", description: "Future EV charger", status: "reserved", room: "Garage" },
    ],
  },
  {
    id: "2",
    name: "Sub-Panel",
    location: "Workshop - North Wall",
    mainBreakerSize: "60",
    totalCircuits: 12,
    voltage: "120/240V",
    phases: "1",
    manufacturer: "Eaton",
    model: "BR612L100",
    customerName: "Johnson Residence",
    address: "1234 Oak Street, Austin, TX",
    circuits: [
      { id: "s1", position: 1, breakerSize: "20", breakerType: "gfci", label: "Workshop Outlets", description: "General outlets", status: "active", room: "Workshop" },
      { id: "s2", position: 2, breakerSize: "20", breakerType: "single", label: "Bench Outlets", description: "Workbench area", status: "active", room: "Workshop" },
      { id: "s3", position: 3, breakerSize: "20", breakerType: "single", label: "Air Compressor", description: "Dedicated circuit", status: "active", room: "Workshop" },
      { id: "s4", position: 4, breakerSize: "15", breakerType: "single", label: "Lighting", description: "Shop lights", status: "active", room: "Workshop" },
      { id: "s5", position: 5, breakerSize: "30", breakerType: "double", label: "Welder Outlet", description: "240V welder", status: "active", room: "Workshop" },
      { id: "s7", position: 7, breakerSize: "20", breakerType: "single", label: "Spare", description: "", status: "spare" },
    ],
  },
];

const breakerTypeConfig: Record<BreakerType, { label: string; color: string; icon: any }> = {
  single: { label: "Single Pole", color: "#3B82F6", icon: ToggleLeft },
  double: { label: "Double Pole", color: "#8B5CF6", icon: ToggleRight },
  gfci: { label: "GFCI", color: "#22C55E", icon: Zap },
  afci: { label: "AFCI", color: "#272D53", icon: AlertTriangle },
  dual_function: { label: "Dual Function", color: "#EC4899", icon: CheckCircle },
  tandem: { label: "Tandem", color: "#06B6D4", icon: Grid3X3 },
};

const statusConfig: Record<CircuitStatus, { label: string; color: string; bgColor: string }> = {
  active: { label: "Active", color: "#22C55E", bgColor: "#DCFCE7" },
  spare: { label: "Spare", color: "#6B7280", bgColor: "#F3F4F6" },
  reserved: { label: "Reserved", color: "#272D53", bgColor: "#E8E9EE" },
  tripped: { label: "Tripped", color: "#DC2626", bgColor: "#FEE2E2" },
};

export default function ElectricalPanelScheduleScreen() {
  const router = useRouter();
  const [panels, setPanels] = useState<Panel[]>(mockPanels);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPanel, setSelectedPanel] = useState<Panel | null>(null);
  const [showPanelModal, setShowPanelModal] = useState(false);
  const [showCircuitModal, setShowCircuitModal] = useState(false);
  const [selectedCircuit, setSelectedCircuit] = useState<Circuit | null>(null);
  const [editMode, setEditMode] = useState(false);

  const filteredPanels = useMemo(() => {
    return panels.filter((panel) => {
      const matchesSearch =
        panel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        panel.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (panel.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      return matchesSearch;
    });
  }, [panels, searchQuery]);

  const getPanelStats = useCallback((panel: Panel) => {
    const activeCircuits = panel.circuits.filter((c) => c.status === "active").length;
    const spareCircuits = panel.circuits.filter((c) => c.status === "spare").length;
    const reservedCircuits = panel.circuits.filter((c) => c.status === "reserved").length;
    const usedSlots = panel.circuits.reduce((sum, c) => {
      return sum + (c.breakerType === "double" ? 2 : c.breakerType === "tandem" ? 1 : 1);
    }, 0);
    return { activeCircuits, spareCircuits, reservedCircuits, usedSlots, totalSlots: panel.totalCircuits };
  }, []);

  const handleOpenPanel = useCallback((panel: Panel) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPanel(panel);
    setShowPanelModal(true);
  }, []);

  const handleEditCircuit = useCallback((circuit: Circuit) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCircuit(circuit);
    setShowCircuitModal(true);
  }, []);

  const handleDeletePanel = useCallback((panelId: string) => {
    Alert.alert(
      "Delete Panel",
      "Are you sure you want to delete this panel schedule?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setPanels((prev) => prev.filter((p) => p.id !== panelId));
          },
        },
      ]
    );
  }, []);

  const handleDuplicatePanel = useCallback((panel: Panel) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newPanel: Panel = {
      ...panel,
      id: Date.now().toString(),
      name: `${panel.name} (Copy)`,
      circuits: panel.circuits.map((c) => ({ ...c, id: `${c.id}-copy-${Date.now()}` })),
    };
    setPanels((prev) => [...prev, newPanel]);
    Alert.alert("Panel Duplicated", "A copy of the panel has been created.");
  }, []);

  const handleExportPanel = useCallback((panel: Panel) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      "Export Panel Schedule",
      "Choose export format:",
      [
        { text: "Cancel", style: "cancel" },
        { text: "PDF", onPress: () => Alert.alert("Exported", "Panel schedule exported as PDF") },
        { text: "CSV", onPress: () => Alert.alert("Exported", "Panel schedule exported as CSV") },
      ]
    );
  }, []);

  const renderPanelCard = (panel: Panel) => {
    const stats = getPanelStats(panel);
    const utilizationPercent = Math.round((stats.usedSlots / stats.totalSlots) * 100);

    return (
      <TouchableOpacity
        key={panel.id}
        style={styles.panelCard}
        onPress={() => handleOpenPanel(panel)}
        activeOpacity={0.7}
      >
        <View style={styles.panelHeader}>
          <View style={styles.panelIcon}>
            <CircuitBoard size={24} color="#EAB308" />
          </View>
          <View style={styles.panelInfo}>
            <Text style={styles.panelName}>{panel.name}</Text>
            <Text style={styles.panelLocation}>{panel.location}</Text>
            {panel.customerName && (
              <Text style={styles.panelCustomer}>{panel.customerName}</Text>
            )}
          </View>
          <ChevronRight size={20} color={Colors.textTertiary} />
        </View>

        <View style={styles.panelSpecs}>
          <View style={styles.specItem}>
            <Gauge size={14} color={Colors.textSecondary} />
            <Text style={styles.specText}>{panel.mainBreakerSize}A Main</Text>
          </View>
          <View style={styles.specItem}>
            <Zap size={14} color={Colors.textSecondary} />
            <Text style={styles.specText}>{panel.voltage}</Text>
          </View>
          <View style={styles.specItem}>
            <Grid3X3 size={14} color={Colors.textSecondary} />
            <Text style={styles.specText}>{panel.totalCircuits} Circuits</Text>
          </View>
        </View>

        <View style={styles.utilizationBar}>
          <View style={styles.utilizationTrack}>
            <View
              style={[
                styles.utilizationFill,
                {
                  width: `${utilizationPercent}%`,
                  backgroundColor: utilizationPercent > 80 ? "#DC2626" : utilizationPercent > 60 ? "#272D53" : "#22C55E",
                },
              ]}
            />
          </View>
          <Text style={styles.utilizationText}>{utilizationPercent}% Used</Text>
        </View>

        <View style={styles.panelStats}>
          <View style={[styles.statBadge, { backgroundColor: statusConfig.active.bgColor }]}>
            <Text style={[styles.statBadgeText, { color: statusConfig.active.color }]}>
              {stats.activeCircuits} Active
            </Text>
          </View>
          <View style={[styles.statBadge, { backgroundColor: statusConfig.spare.bgColor }]}>
            <Text style={[styles.statBadgeText, { color: statusConfig.spare.color }]}>
              {stats.spareCircuits} Spare
            </Text>
          </View>
          {stats.reservedCircuits > 0 && (
            <View style={[styles.statBadge, { backgroundColor: statusConfig.reserved.bgColor }]}>
              <Text style={[styles.statBadgeText, { color: statusConfig.reserved.color }]}>
                {stats.reservedCircuits} Reserved
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderCircuitRow = (circuit: Circuit, index: number) => {
    const typeConfig = breakerTypeConfig[circuit.breakerType];
    const status = statusConfig[circuit.status];
    const TypeIcon = typeConfig.icon;

    return (
      <TouchableOpacity
        key={circuit.id}
        style={[
          styles.circuitRow,
          circuit.breakerType === "double" && styles.doubleCircuitRow,
        ]}
        onPress={() => handleEditCircuit(circuit)}
        activeOpacity={0.7}
      >
        <View style={styles.circuitPosition}>
          <Text style={styles.positionNumber}>{circuit.position}</Text>
          {circuit.breakerType === "double" && (
            <Text style={styles.positionNumber}>{circuit.position + 1}</Text>
          )}
        </View>

        <View style={styles.circuitBreaker}>
          <View style={[styles.breakerIcon, { backgroundColor: `${typeConfig.color}20` }]}>
            <TypeIcon size={16} color={typeConfig.color} />
          </View>
          <Text style={styles.breakerSize}>{circuit.breakerSize}A</Text>
        </View>

        <View style={styles.circuitInfo}>
          <Text style={styles.circuitLabel}>{circuit.label || "Unlabeled"}</Text>
          {circuit.description && (
            <Text style={styles.circuitDescription}>{circuit.description}</Text>
          )}
          {circuit.room && (
            <View style={styles.roomTag}>
              <Home size={10} color={Colors.textTertiary} />
              <Text style={styles.roomText}>{circuit.room}</Text>
            </View>
          )}
        </View>

        <View style={[styles.statusBadge, { backgroundColor: status.bgColor }]}>
          <View style={[styles.statusDot, { backgroundColor: status.color }]} />
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Panel Schedules",
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
            <CircuitBoard size={32} color="#EAB308" />
          </View>
          <Text style={styles.headerTitle}>Panel Schedule Manager</Text>
          <Text style={styles.headerSubtitle}>
            Document circuit breaker layouts, labeling, and panel configurations
          </Text>
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Search size={18} color={Colors.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search panels..."
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

        <View style={styles.panelsSection}>
          <Text style={styles.sectionTitle}>Panel Schedules ({filteredPanels.length})</Text>
          {filteredPanels.map(renderPanelCard)}

          {filteredPanels.length === 0 && (
            <View style={styles.emptyState}>
              <CircuitBoard size={48} color={Colors.textTertiary} />
              <Text style={styles.emptyStateTitle}>No Panel Schedules</Text>
              <Text style={styles.emptyStateText}>
                Create your first panel schedule to document circuit configurations
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal visible={showPanelModal} animationType="slide" presentationStyle="pageSheet">
        {selectedPanel && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowPanelModal(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{selectedPanel.name}</Text>
              <TouchableOpacity onPress={() => setEditMode(!editMode)}>
                <Edit3 size={22} color={editMode ? "#EAB308" : Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.panelDetailHeader}>
                <View style={styles.panelDetailIcon}>
                  <CircuitBoard size={40} color="#EAB308" />
                </View>
                <View style={styles.panelDetailInfo}>
                  <Text style={styles.panelDetailName}>{selectedPanel.name}</Text>
                  <Text style={styles.panelDetailLocation}>{selectedPanel.location}</Text>
                  {selectedPanel.manufacturer && (
                    <Text style={styles.panelDetailManufacturer}>
                      {selectedPanel.manufacturer} {selectedPanel.model}
                    </Text>
                  )}
                </View>
              </View>

              {selectedPanel.customerName && (
                <View style={styles.customerCard}>
                  <Building2 size={16} color={Colors.textSecondary} />
                  <View style={styles.customerCardInfo}>
                    <Text style={styles.customerCardName}>{selectedPanel.customerName}</Text>
                    {selectedPanel.address && (
                      <Text style={styles.customerCardAddress}>{selectedPanel.address}</Text>
                    )}
                  </View>
                </View>
              )}

              <View style={styles.specsCard}>
                <Text style={styles.specsTitle}>Panel Specifications</Text>
                <View style={styles.specsGrid}>
                  <View style={styles.specGridItem}>
                    <Text style={styles.specGridLabel}>Main Breaker</Text>
                    <Text style={styles.specGridValue}>{selectedPanel.mainBreakerSize}A</Text>
                  </View>
                  <View style={styles.specGridItem}>
                    <Text style={styles.specGridLabel}>Voltage</Text>
                    <Text style={styles.specGridValue}>{selectedPanel.voltage}</Text>
                  </View>
                  <View style={styles.specGridItem}>
                    <Text style={styles.specGridLabel}>Phase</Text>
                    <Text style={styles.specGridValue}>{selectedPanel.phases}-Phase</Text>
                  </View>
                  <View style={styles.specGridItem}>
                    <Text style={styles.specGridLabel}>Total Circuits</Text>
                    <Text style={styles.specGridValue}>{selectedPanel.totalCircuits}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleExportPanel(selectedPanel)}
                >
                  <Share2 size={18} color="#3B82F6" />
                  <Text style={styles.actionButtonText}>Export</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDuplicatePanel(selectedPanel)}
                >
                  <Copy size={18} color="#22C55E" />
                  <Text style={styles.actionButtonText}>Duplicate</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    setShowPanelModal(false);
                    handleDeletePanel(selectedPanel.id);
                  }}
                >
                  <Trash2 size={18} color="#DC2626" />
                  <Text style={[styles.actionButtonText, { color: "#DC2626" }]}>Delete</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.circuitsSection}>
                <View style={styles.circuitsSectionHeader}>
                  <Text style={styles.circuitsSectionTitle}>Circuit Directory</Text>
                  {editMode && (
                    <TouchableOpacity style={styles.addCircuitButton}>
                      <Plus size={16} color="#EAB308" />
                      <Text style={styles.addCircuitText}>Add Circuit</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.circuitsList}>
                  {selectedPanel.circuits
                    .sort((a, b) => a.position - b.position)
                    .map((circuit, index) => renderCircuitRow(circuit, index))}
                </View>
              </View>

              <View style={styles.legendSection}>
                <Text style={styles.legendTitle}>Breaker Types</Text>
                <View style={styles.legendGrid}>
                  {Object.entries(breakerTypeConfig).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <View key={key} style={styles.legendItem}>
                        <View style={[styles.legendIcon, { backgroundColor: `${config.color}20` }]}>
                          <Icon size={12} color={config.color} />
                        </View>
                        <Text style={styles.legendLabel}>{config.label}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>

      <Modal visible={showCircuitModal} animationType="slide" presentationStyle="formSheet">
        {selectedCircuit && (
          <SafeAreaView style={styles.circuitModalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowCircuitModal(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Circuit Details</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.circuitModalContent}>
              <View style={styles.circuitDetailHeader}>
                <View style={styles.circuitDetailPosition}>
                  <Text style={styles.circuitDetailPositionText}>{selectedCircuit.position}</Text>
                </View>
                <View style={styles.circuitDetailInfo}>
                  <Text style={styles.circuitDetailLabel}>
                    {selectedCircuit.label || "Unlabeled Circuit"}
                  </Text>
                  <Text style={styles.circuitDetailDescription}>
                    {selectedCircuit.description || "No description"}
                  </Text>
                </View>
              </View>

              <View style={styles.circuitDetailSpecs}>
                <View style={styles.circuitDetailSpec}>
                  <Text style={styles.circuitSpecLabel}>Breaker Size</Text>
                  <Text style={styles.circuitSpecValue}>{selectedCircuit.breakerSize}A</Text>
                </View>
                <View style={styles.circuitDetailSpec}>
                  <Text style={styles.circuitSpecLabel}>Breaker Type</Text>
                  <Text style={styles.circuitSpecValue}>
                    {breakerTypeConfig[selectedCircuit.breakerType].label}
                  </Text>
                </View>
                <View style={styles.circuitDetailSpec}>
                  <Text style={styles.circuitSpecLabel}>Status</Text>
                  <View
                    style={[
                      styles.circuitStatusBadge,
                      { backgroundColor: statusConfig[selectedCircuit.status].bgColor },
                    ]}
                  >
                    <Text
                      style={[
                        styles.circuitStatusText,
                        { color: statusConfig[selectedCircuit.status].color },
                      ]}
                    >
                      {statusConfig[selectedCircuit.status].label}
                    </Text>
                  </View>
                </View>
                {selectedCircuit.room && (
                  <View style={styles.circuitDetailSpec}>
                    <Text style={styles.circuitSpecLabel}>Room/Area</Text>
                    <Text style={styles.circuitSpecValue}>{selectedCircuit.room}</Text>
                  </View>
                )}
              </View>

              {editMode && (
                <TouchableOpacity style={styles.saveCircuitButton}>
                  <Text style={styles.saveCircuitButtonText}>Save Changes</Text>
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
  searchSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
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
  panelsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 14,
  },
  panelCard: {
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
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  panelIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#FEF9C3",
    alignItems: "center",
    justifyContent: "center",
  },
  panelInfo: {
    flex: 1,
  },
  panelName: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  panelLocation: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  panelCustomer: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  panelSpecs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 12,
  },
  specItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  specText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  utilizationBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  utilizationTrack: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.borderLight,
    borderRadius: 3,
    overflow: "hidden",
  },
  utilizationFill: {
    height: "100%",
    borderRadius: 3,
  },
  utilizationText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
    width: 60,
    textAlign: "right" as const,
  },
  panelStats: {
    flexDirection: "row",
    gap: 8,
  },
  statBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statBadgeText: {
    fontSize: 12,
    fontWeight: "600" as const,
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
  panelDetailHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
  },
  panelDetailIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "#FEF9C3",
    alignItems: "center",
    justifyContent: "center",
  },
  panelDetailInfo: {},
  panelDetailName: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  panelDetailLocation: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  panelDetailManufacturer: {
    fontSize: 14,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  customerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  customerCardInfo: {
    flex: 1,
  },
  customerCardName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  customerCardAddress: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  specsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  specsTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  specsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  specGridItem: {
    width: "47%",
    backgroundColor: "#FEF9C3",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  specGridLabel: {
    fontSize: 11,
    color: "#92400E",
    fontWeight: "500" as const,
  },
  specGridValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#92400E",
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.surface,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  circuitsSection: {
    marginBottom: 20,
  },
  circuitsSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  circuitsSectionTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  addCircuitButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  addCircuitText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#EAB308",
  },
  circuitsList: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: "hidden",
  },
  circuitRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: 10,
  },
  doubleCircuitRow: {
    backgroundColor: "#FAFAFA",
  },
  circuitPosition: {
    width: 32,
    alignItems: "center",
  },
  positionNumber: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.textSecondary,
  },
  circuitBreaker: {
    alignItems: "center",
    gap: 4,
    width: 50,
  },
  breakerIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  breakerSize: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  circuitInfo: {
    flex: 1,
  },
  circuitLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  circuitDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  roomTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  roomText: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  legendSection: {
    marginBottom: 20,
  },
  legendTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  legendGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  legendIcon: {
    width: 20,
    height: 20,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  legendLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  circuitModalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  circuitModalContent: {
    flex: 1,
    padding: 20,
  },
  circuitDetailHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
  },
  circuitDetailPosition: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: "#FEF9C3",
    alignItems: "center",
    justifyContent: "center",
  },
  circuitDetailPositionText: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#92400E",
  },
  circuitDetailInfo: {
    flex: 1,
  },
  circuitDetailLabel: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  circuitDetailDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  circuitDetailSpecs: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  circuitDetailSpec: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  circuitSpecLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  circuitSpecValue: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  circuitStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  circuitStatusText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  saveCircuitButton: {
    backgroundColor: "#EAB308",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
  },
  saveCircuitButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#000",
  },
});
