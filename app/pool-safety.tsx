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
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Shield,
  CheckCircle,
  Circle,
  AlertTriangle,
  Clock,
  Calendar,
  User,
  MapPin,
  ChevronRight,
  Plus,
  FileText,
  HardHat,
  Droplets,
  Zap,
  X,
  Waves,
  AlertOctagon,
  Shovel,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";

type ChecklistStatus = "pending" | "in_progress" | "completed" | "overdue";
type ChecklistCategory = "daily" | "weekly" | "monthly" | "pre_job" | "excavation" | "electrical" | "chemical";

interface ChecklistItem {
  id: string;
  text: string;
  isCompleted: boolean;
  notes?: string;
  requiresPhoto?: boolean;
}

interface SafetyChecklist {
  id: string;
  name: string;
  category: ChecklistCategory;
  status: ChecklistStatus;
  project: string;
  location: string;
  assignedTo: string;
  dueDate: string;
  completedDate?: string;
  items: ChecklistItem[];
  completedCount: number;
  totalCount: number;
}

interface SafetyIncident {
  id: string;
  type: "injury" | "near_miss" | "property_damage" | "hazard" | "chemical_exposure";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  project: string;
  location: string;
  reportedBy: string;
  reportedDate: string;
  status: "open" | "investigating" | "resolved";
}

const mockPoolChecklists: SafetyChecklist[] = [
  {
    id: "psc1",
    name: "Daily Pool Site Safety",
    category: "daily",
    status: "in_progress",
    project: "Thompson Residence Pool",
    location: "4521 Lakewood Drive, Austin, TX",
    assignedTo: "Mike Rodriguez",
    dueDate: "2026-01-27",
    items: [
      { id: "i1", text: "All workers wearing proper PPE (hard hat, safety glasses, steel toes)", isCompleted: true },
      { id: "i2", text: "Excavation properly shored/sloped", isCompleted: true },
      { id: "i3", text: "Trench boxes in place where required", isCompleted: true },
      { id: "i4", text: "Safety barriers around excavation", isCompleted: false },
      { id: "i5", text: "First aid kit accessible and stocked", isCompleted: false },
      { id: "i6", text: "Emergency exits/access routes clear", isCompleted: true },
      { id: "i7", text: "Weather conditions suitable for work", isCompleted: true },
    ],
    completedCount: 5,
    totalCount: 7,
  },
  {
    id: "psc2",
    name: "Pre-Excavation Safety Briefing",
    category: "pre_job",
    status: "completed",
    project: "Thompson Residence Pool",
    location: "4521 Lakewood Drive, Austin, TX",
    assignedTo: "Carlos Martinez",
    dueDate: "2026-02-10",
    completedDate: "2026-02-10",
    items: [
      { id: "i1", text: "Utility locate completed (call 811)", isCompleted: true },
      { id: "i2", text: "All underground utilities marked", isCompleted: true },
      { id: "i3", text: "Soil stability assessed", isCompleted: true },
      { id: "i4", text: "Equipment inspected before use", isCompleted: true },
      { id: "i5", text: "Crew briefed on excavation hazards", isCompleted: true },
    ],
    completedCount: 5,
    totalCount: 5,
  },
  {
    id: "psc3",
    name: "Electrical Safety - Pool Equipment",
    category: "electrical",
    status: "pending",
    project: "Adams Infinity Pool",
    location: "8234 Hill Country Blvd, Lakeway, TX",
    assignedTo: "David Chen",
    dueDate: "2026-02-05",
    items: [
      { id: "i1", text: "GFCI protection verified for all pool circuits", isCompleted: false },
      { id: "i2", text: "Bonding and grounding complete per NEC 680", isCompleted: false },
      { id: "i3", text: "Proper clearances from water maintained", isCompleted: false },
      { id: "i4", text: "Low-voltage lighting properly installed", isCompleted: false },
      { id: "i5", text: "Equipment pad bonded correctly", isCompleted: false },
      { id: "i6", text: "All electrical connections weatherproofed", isCompleted: false },
    ],
    completedCount: 0,
    totalCount: 6,
  },
  {
    id: "psc4",
    name: "Weekly Chemical Safety Audit",
    category: "chemical",
    status: "overdue",
    project: "Martinez Fiberglass Pool",
    location: "1892 Sunset Canyon Road, Round Rock, TX",
    assignedTo: "James Wilson",
    dueDate: "2026-01-20",
    items: [
      { id: "i1", text: "Chemical storage area properly ventilated", isCompleted: false },
      { id: "i2", text: "MSDS sheets accessible for all chemicals", isCompleted: false },
      { id: "i3", text: "PPE available for chemical handling", isCompleted: false },
      { id: "i4", text: "Chemicals stored separately (no mixing)", isCompleted: false },
      { id: "i5", text: "Spill containment measures in place", isCompleted: false },
    ],
    completedCount: 0,
    totalCount: 5,
  },
  {
    id: "psc5",
    name: "Monthly Equipment Inspection",
    category: "monthly",
    status: "pending",
    project: "All Projects",
    location: "Equipment Yard",
    assignedTo: "Roberto Garcia",
    dueDate: "2026-01-31",
    items: [
      { id: "i1", text: "Excavator daily inspection logs reviewed", isCompleted: false, requiresPhoto: true },
      { id: "i2", text: "Gunite pump safety devices tested", isCompleted: false, requiresPhoto: true },
      { id: "i3", text: "Power tools inspected and tagged", isCompleted: false },
      { id: "i4", text: "Lifting equipment certified current", isCompleted: false, requiresPhoto: true },
      { id: "i5", text: "Safety barriers/fencing inventory complete", isCompleted: false },
    ],
    completedCount: 0,
    totalCount: 5,
  },
];

const mockPoolIncidents: SafetyIncident[] = [
  {
    id: "pinc1",
    type: "near_miss",
    severity: "medium",
    description: "Worker nearly fell into excavation when safety barrier moved by wind. Barrier secured with stakes.",
    project: "Thompson Residence Pool",
    location: "4521 Lakewood Drive, Austin, TX",
    reportedBy: "Carlos Martinez",
    reportedDate: "2026-01-25",
    status: "resolved",
  },
  {
    id: "pinc2",
    type: "hazard",
    severity: "low",
    description: "Electrical cord showing wear near junction. Replaced immediately.",
    project: "Adams Infinity Pool",
    location: "8234 Hill Country Blvd, Lakeway, TX",
    reportedBy: "David Chen",
    reportedDate: "2026-01-26",
    status: "resolved",
  },
  {
    id: "pinc3",
    type: "chemical_exposure",
    severity: "low",
    description: "Minor skin irritation from plaster mix. Worker washed area and applied treatment. Reminded crew about glove requirements.",
    project: "Martinez Fiberglass Pool",
    location: "1892 Sunset Canyon Road, Round Rock, TX",
    reportedBy: "Marcus Johnson",
    reportedDate: "2026-01-22",
    status: "resolved",
  },
];

type TabType = "checklists" | "incidents" | "training";

export default function PoolSafetyScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("checklists");
  const [selectedChecklist, setSelectedChecklist] = useState<SafetyChecklist | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [checklists, setChecklists] = useState(mockPoolChecklists);

  const [newEntry, setNewEntry] = useState({
    type: "checklist" as "checklist" | "incident",
    name: "",
    category: "daily" as ChecklistCategory,
    project: "",
    description: "",
  });

  const getStatusColor = (status: ChecklistStatus) => {
    switch (status) {
      case "pending": return Colors.textSecondary;
      case "in_progress": return "#3B82F6";
      case "completed": return Colors.success;
      case "overdue": return Colors.error;
    }
  };

  const getStatusLabel = (status: ChecklistStatus) => {
    switch (status) {
      case "pending": return "Pending";
      case "in_progress": return "In Progress";
      case "completed": return "Completed";
      case "overdue": return "Overdue";
    }
  };

  const getCategoryIcon = (category: ChecklistCategory) => {
    switch (category) {
      case "daily": return Clock;
      case "weekly": return Calendar;
      case "monthly": return Calendar;
      case "pre_job": return HardHat;
      case "excavation": return Shovel;
      case "electrical": return Zap;
      case "chemical": return Droplets;
    }
  };

  const getCategoryColor = (category: ChecklistCategory) => {
    switch (category) {
      case "daily": return "#0EA5E9";
      case "weekly": return "#3B82F6";
      case "monthly": return "#8B5CF6";
      case "pre_job": return "#10B981";
      case "excavation": return "#78716C";
      case "electrical": return "#272D53";
      case "chemical": return "#06B6D4";
    }
  };

  const getSeverityColor = (severity: SafetyIncident["severity"]) => {
    switch (severity) {
      case "low": return Colors.success;
      case "medium": return "#272D53";
      case "high": return Colors.error;
      case "critical": return "#DC2626";
    }
  };

  const getIncidentIcon = (type: SafetyIncident["type"]) => {
    switch (type) {
      case "injury": return AlertTriangle;
      case "near_miss": return AlertOctagon;
      case "property_damage": return AlertTriangle;
      case "hazard": return Zap;
      case "chemical_exposure": return Droplets;
    }
  };

  const stats = {
    pending: checklists.filter(c => c.status === "pending").length,
    inProgress: checklists.filter(c => c.status === "in_progress").length,
    completed: checklists.filter(c => c.status === "completed").length,
    overdue: checklists.filter(c => c.status === "overdue").length,
    openIncidents: mockPoolIncidents.filter(i => i.status !== "resolved").length,
  };

  const handleToggleItem = (checklistId: string, itemId: string) => {
    setChecklists(prev => prev.map(checklist => {
      if (checklist.id === checklistId) {
        const updatedItems = checklist.items.map(item =>
          item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
        );
        const completedCount = updatedItems.filter(i => i.isCompleted).length;
        return { ...checklist, items: updatedItems, completedCount };
      }
      return checklist;
    }));
    
    if (selectedChecklist?.id === checklistId) {
      setSelectedChecklist(prev => {
        if (!prev) return null;
        const updatedItems = prev.items.map(item =>
          item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
        );
        const completedCount = updatedItems.filter(i => i.isCompleted).length;
        return { ...prev, items: updatedItems, completedCount };
      });
    }
  };

  const handleAddEntry = () => {
    if (!newEntry.name || !newEntry.project) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }
    Alert.alert("Success", `${newEntry.type === "checklist" ? "Safety checklist" : "Incident report"} created successfully!`);
    setShowAddModal(false);
    setNewEntry({ type: "checklist", name: "", category: "daily", project: "", description: "" });
  };

  const renderChecklistCard = (checklist: SafetyChecklist) => {
    const CategoryIcon = getCategoryIcon(checklist.category);
    const progress = (checklist.completedCount / checklist.totalCount) * 100;
    
    return (
      <TouchableOpacity 
        key={checklist.id} 
        style={styles.checklistCard}
        onPress={() => setSelectedChecklist(checklist)}
      >
        <View style={styles.checklistHeader}>
          <View style={[styles.categoryIcon, { backgroundColor: `${getCategoryColor(checklist.category)}20` }]}>
            <CategoryIcon size={20} color={getCategoryColor(checklist.category)} />
          </View>
          <View style={styles.checklistInfo}>
            <Text style={styles.checklistName}>{checklist.name}</Text>
            <View style={styles.checklistMeta}>
              <MapPin size={12} color={Colors.textSecondary} />
              <Text style={styles.checklistMetaText} numberOfLines={1}>{checklist.project}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(checklist.status)}15` }]}>
            <Text style={[styles.statusText, { color: getStatusColor(checklist.status) }]}>
              {getStatusLabel(checklist.status)}
            </Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: getStatusColor(checklist.status) }]} />
          </View>
          <Text style={styles.progressText}>
            {checklist.completedCount}/{checklist.totalCount} items
          </Text>
        </View>

        <View style={styles.checklistFooter}>
          <View style={styles.assigneeRow}>
            <User size={14} color={Colors.textSecondary} />
            <Text style={styles.assigneeText}>{checklist.assignedTo}</Text>
          </View>
          <View style={styles.dueDateRow}>
            <Calendar size={14} color={checklist.status === "overdue" ? Colors.error : Colors.textSecondary} />
            <Text style={[styles.dueDateText, checklist.status === "overdue" && { color: Colors.error }]}>
              Due: {new Date(checklist.dueDate).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {checklist.status !== "completed" && (
          <TouchableOpacity style={styles.continueBtn}>
            <Text style={styles.continueBtnText}>
              {checklist.status === "pending" ? "Start Checklist" : "Continue"}
            </Text>
            <ChevronRight size={16} color={Colors.white} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const renderIncidentCard = (incident: SafetyIncident) => {
    const IncidentIcon = getIncidentIcon(incident.type);
    
    return (
      <TouchableOpacity key={incident.id} style={styles.incidentCard}>
        <View style={styles.incidentHeader}>
          <View style={[styles.incidentIcon, { backgroundColor: `${getSeverityColor(incident.severity)}20` }]}>
            <IncidentIcon size={20} color={getSeverityColor(incident.severity)} />
          </View>
          <View style={styles.incidentInfo}>
            <View style={styles.incidentTypeRow}>
              <Text style={styles.incidentType}>
                {incident.type.replace("_", " ").toUpperCase()}
              </Text>
              <View style={[styles.severityBadge, { backgroundColor: `${getSeverityColor(incident.severity)}20` }]}>
                <Text style={[styles.severityText, { color: getSeverityColor(incident.severity) }]}>
                  {incident.severity.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.incidentDesc} numberOfLines={2}>{incident.description}</Text>
          </View>
        </View>

        <View style={styles.incidentMeta}>
          <View style={styles.incidentMetaItem}>
            <Waves size={12} color={Colors.textSecondary} />
            <Text style={styles.incidentMetaText}>{incident.project}</Text>
          </View>
          <View style={styles.incidentMetaItem}>
            <User size={12} color={Colors.textSecondary} />
            <Text style={styles.incidentMetaText}>{incident.reportedBy}</Text>
          </View>
        </View>

        <View style={styles.incidentFooter}>
          <Text style={styles.incidentDate}>
            {new Date(incident.reportedDate).toLocaleDateString()}
          </Text>
          <View style={[
            styles.incidentStatusBadge,
            { backgroundColor: incident.status === "resolved" ? `${Colors.success}15` : "#E8E9EE" }
          ]}>
            <Text style={[
              styles.incidentStatusText,
              { color: incident.status === "resolved" ? Colors.success : "#B45309" }
            ]}>
              {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderTrainingSection = () => (
    <View style={styles.trainingSection}>
      <View style={styles.trainingCard}>
        <View style={[styles.trainingIcon, { backgroundColor: "#0EA5E920" }]}>
          <Waves size={28} color="#0EA5E9" />
        </View>
        <Text style={styles.trainingTitle}>CPO Certification</Text>
        <Text style={styles.trainingStatus}>Certified Pool Operator</Text>
        <View style={styles.trainingProgress}>
          <CheckCircle size={16} color={Colors.success} />
          <Text style={styles.trainingProgressText}>Valid until Dec 2027</Text>
        </View>
      </View>

      <View style={styles.trainingCard}>
        <View style={[styles.trainingIcon, { backgroundColor: "#272D5320" }]}>
          <HardHat size={28} color="#272D53" />
        </View>
        <Text style={styles.trainingTitle}>OSHA 30 Construction</Text>
        <Text style={styles.trainingStatus}>Safety Certification</Text>
        <View style={styles.trainingProgress}>
          <CheckCircle size={16} color={Colors.success} />
          <Text style={styles.trainingProgressText}>Completed</Text>
        </View>
      </View>

      <View style={styles.trainingCard}>
        <View style={[styles.trainingIcon, { backgroundColor: "#78716C20" }]}>
          <Shovel size={28} color="#78716C" />
        </View>
        <Text style={styles.trainingTitle}>Excavation Safety</Text>
        <Text style={styles.trainingStatus}>Competent Person Training</Text>
        <View style={styles.trainingProgress}>
          <AlertTriangle size={16} color="#272D53" />
          <Text style={[styles.trainingProgressText, { color: "#272D53" }]}>Renewal Due</Text>
        </View>
      </View>

      <View style={styles.trainingCard}>
        <View style={[styles.trainingIcon, { backgroundColor: "#06B6D420" }]}>
          <Droplets size={28} color="#06B6D4" />
        </View>
        <Text style={styles.trainingTitle}>Chemical Handling</Text>
        <Text style={styles.trainingStatus}>Pool Chemicals Safety</Text>
        <View style={styles.trainingProgressBar}>
          <View style={[styles.trainingProgressFill, { width: "75%" }]} />
        </View>
        <Text style={styles.trainingProgressPercent}>75% Complete</Text>
      </View>

      <View style={styles.trainingCard}>
        <View style={[styles.trainingIcon, { backgroundColor: "#EF444420" }]}>
          <AlertTriangle size={28} color={Colors.error} />
        </View>
        <Text style={styles.trainingTitle}>First Aid/CPR</Text>
        <Text style={styles.trainingStatus}>Emergency Response</Text>
        <View style={styles.trainingProgress}>
          <CheckCircle size={16} color={Colors.success} />
          <Text style={styles.trainingProgressText}>Valid until Mar 2026</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Pool Safety & Compliance",
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
            <Clock size={18} color={Colors.textSecondary} />
            <Text style={styles.statValue}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Shield size={18} color="#3B82F6" />
            <Text style={styles.statValue}>{stats.inProgress}</Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
          <View style={styles.statCard}>
            <CheckCircle size={18} color={Colors.success} />
            <Text style={styles.statValue}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <AlertTriangle size={18} color={Colors.error} />
            <Text style={[styles.statValue, stats.overdue > 0 && { color: Colors.error }]}>
              {stats.overdue}
            </Text>
            <Text style={styles.statLabel}>Overdue</Text>
          </View>
        </View>

        <View style={styles.tabContainer}>
          {([
            { key: "checklists", label: "Checklists", icon: FileText },
            { key: "incidents", label: "Incidents", icon: AlertTriangle },
            { key: "training", label: "Training", icon: HardHat },
          ] as const).map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <tab.icon size={16} color={activeTab === tab.key ? Colors.white : Colors.textSecondary} />
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
              {tab.key === "incidents" && stats.openIncidents > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{stats.openIncidents}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "checklists" && checklists.map(checklist => renderChecklistCard(checklist))}
        {activeTab === "incidents" && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Pool Site Incidents</Text>
              <TouchableOpacity style={styles.reportBtn} onPress={() => setShowAddModal(true)}>
                <Plus size={16} color={Colors.white} />
                <Text style={styles.reportBtnText}>Report</Text>
              </TouchableOpacity>
            </View>
            {mockPoolIncidents.map(incident => renderIncidentCard(incident))}
          </>
        )}
        {activeTab === "training" && renderTrainingSection()}
      </ScrollView>

      <Modal
        visible={!!selectedChecklist}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedChecklist(null)}
      >
        {selectedChecklist && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedChecklist(null)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Safety Checklist</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.checklistDetailHeader}>
                <Text style={styles.checklistDetailName}>{selectedChecklist.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(selectedChecklist.status)}15` }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(selectedChecklist.status) }]}>
                    {getStatusLabel(selectedChecklist.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.checklistDetailMeta}>
                <View style={styles.detailMetaRow}>
                  <Waves size={14} color={Colors.textSecondary} />
                  <Text style={styles.detailMetaText}>{selectedChecklist.project}</Text>
                </View>
                <View style={styles.detailMetaRow}>
                  <MapPin size={14} color={Colors.textSecondary} />
                  <Text style={styles.detailMetaText}>{selectedChecklist.location}</Text>
                </View>
                <View style={styles.detailMetaRow}>
                  <User size={14} color={Colors.textSecondary} />
                  <Text style={styles.detailMetaText}>Assigned to: {selectedChecklist.assignedTo}</Text>
                </View>
              </View>

              <View style={styles.checklistItems}>
                <Text style={styles.itemsTitle}>
                  Checklist Items ({selectedChecklist.completedCount}/{selectedChecklist.totalCount})
                </Text>
                {selectedChecklist.items.map(item => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={styles.checklistItem}
                    onPress={() => handleToggleItem(selectedChecklist.id, item.id)}
                  >
                    <View style={[
                      styles.itemCheckbox,
                      item.isCompleted && styles.itemCheckboxChecked
                    ]}>
                      {item.isCompleted && <CheckCircle size={16} color={Colors.white} />}
                      {!item.isCompleted && <Circle size={16} color={Colors.textTertiary} />}
                    </View>
                    <View style={styles.itemContent}>
                      <Text style={[
                        styles.itemText,
                        item.isCompleted && styles.itemTextCompleted
                      ]}>
                        {item.text}
                      </Text>
                      {item.requiresPhoto && (
                        <Text style={styles.photoRequired}>📷 Photo required</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {selectedChecklist.status !== "completed" && (
                <TouchableOpacity 
                  style={styles.completeBtn}
                  onPress={() => {
                    Alert.alert("Complete Checklist", "Mark this checklist as complete?", [
                      { text: "Cancel", style: "cancel" },
                      { text: "Complete", onPress: () => setSelectedChecklist(null) },
                    ]);
                  }}
                >
                  <CheckCircle size={18} color={Colors.white} />
                  <Text style={styles.completeBtnText}>Mark as Complete</Text>
                </TouchableOpacity>
              )}
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
            <Text style={styles.modalTitle}>Add Safety Entry</Text>
            <TouchableOpacity onPress={handleAddEntry}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContent}>
            <Text style={styles.formLabel}>Entry Type</Text>
            <View style={styles.typeToggle}>
              <TouchableOpacity
                style={[styles.typeBtn, newEntry.type === "checklist" && styles.typeBtnActive]}
                onPress={() => setNewEntry(prev => ({ ...prev, type: "checklist" }))}
              >
                <FileText size={18} color={newEntry.type === "checklist" ? Colors.white : Colors.textSecondary} />
                <Text style={[styles.typeBtnText, newEntry.type === "checklist" && styles.typeBtnTextActive]}>
                  Checklist
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeBtn, newEntry.type === "incident" && styles.typeBtnActive]}
                onPress={() => setNewEntry(prev => ({ ...prev, type: "incident" }))}
              >
                <AlertTriangle size={18} color={newEntry.type === "incident" ? Colors.white : Colors.textSecondary} />
                <Text style={[styles.typeBtnText, newEntry.type === "incident" && styles.typeBtnTextActive]}>
                  Incident
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.formLabel}>
              {newEntry.type === "checklist" ? "Checklist Name *" : "Incident Title *"}
            </Text>
            <TextInput
              style={styles.formInput}
              placeholder={newEntry.type === "checklist" ? "e.g., Daily Pool Site Safety" : "Brief incident description"}
              placeholderTextColor={Colors.textTertiary}
              value={newEntry.name}
              onChangeText={(text) => setNewEntry(prev => ({ ...prev, name: text }))}
            />

            <Text style={styles.formLabel}>Project *</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Project name"
              placeholderTextColor={Colors.textTertiary}
              value={newEntry.project}
              onChangeText={(text) => setNewEntry(prev => ({ ...prev, project: text }))}
            />

            {newEntry.type === "checklist" && (
              <>
                <Text style={styles.formLabel}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                  {(["daily", "weekly", "monthly", "pre_job", "excavation", "electrical", "chemical"] as ChecklistCategory[]).map(cat => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryChip,
                        newEntry.category === cat && { backgroundColor: getCategoryColor(cat) }
                      ]}
                      onPress={() => setNewEntry(prev => ({ ...prev, category: cat }))}
                    >
                      <Text style={[
                        styles.categoryChipText,
                        newEntry.category === cat && { color: Colors.white }
                      ]}>
                        {cat.replace("_", " ").charAt(0).toUpperCase() + cat.replace("_", " ").slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            {newEntry.type === "incident" && (
              <>
                <Text style={styles.formLabel}>Description</Text>
                <TextInput
                  style={[styles.formInput, styles.formTextArea]}
                  placeholder="Detailed description of the incident..."
                  placeholderTextColor={Colors.textTertiary}
                  value={newEntry.description}
                  onChangeText={(text) => setNewEntry(prev => ({ ...prev, description: text }))}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </>
            )}
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSecondary,
  },
  tabActive: {
    backgroundColor: "#0EA5E9",
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.white,
  },
  tabBadge: {
    backgroundColor: Colors.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  reportBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.error,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  reportBtnText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  checklistCard: {
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
  checklistHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checklistInfo: {
    flex: 1,
  },
  checklistName: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  checklistMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  checklistMetaText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
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
  progressSection: {
    marginBottom: 14,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  checklistFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  assigneeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  assigneeText: {
    fontSize: 13,
    color: Colors.text,
  },
  dueDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dueDateText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  continueBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0EA5E9",
    paddingVertical: 12,
    borderRadius: 10,
  },
  continueBtnText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  incidentCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  incidentHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  incidentIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  incidentInfo: {
    flex: 1,
  },
  incidentTypeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  incidentType: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: Colors.textSecondary,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  severityText: {
    fontSize: 10,
    fontWeight: "700" as const,
  },
  incidentDesc: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  incidentMeta: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 10,
  },
  incidentMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  incidentMetaText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  incidentFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  incidentDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  incidentStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  incidentStatusText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  trainingSection: {
    gap: 12,
  },
  trainingCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  trainingIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  trainingTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  trainingStatus: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  trainingProgress: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  trainingProgressText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.success,
  },
  trainingProgressBar: {
    width: "80%",
    height: 8,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  trainingProgressFill: {
    height: "100%",
    backgroundColor: "#06B6D4",
    borderRadius: 4,
  },
  trainingProgressPercent: {
    fontSize: 13,
    color: "#06B6D4",
    fontWeight: "600" as const,
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
  checklistDetailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  checklistDetailName: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
    flex: 1,
    marginRight: 12,
  },
  checklistDetailMeta: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 10,
  },
  detailMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  detailMetaText: {
    fontSize: 14,
    color: Colors.text,
  },
  checklistItems: {
    marginBottom: 20,
  },
  itemsTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 14,
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  itemCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  itemCheckboxChecked: {
    backgroundColor: Colors.success,
  },
  itemContent: {
    flex: 1,
  },
  itemText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  itemTextCompleted: {
    textDecorationLine: "line-through",
    color: Colors.textTertiary,
  },
  photoRequired: {
    fontSize: 12,
    color: "#272D53",
    marginTop: 4,
  },
  completeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.success,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  completeBtnText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  formContent: {
    flex: 1,
    padding: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 10,
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
  typeToggle: {
    flexDirection: "row",
    gap: 12,
  },
  typeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingVertical: 14,
  },
  typeBtnActive: {
    backgroundColor: "#0EA5E9",
  },
  typeBtnText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  typeBtnTextActive: {
    color: Colors.white,
  },
  categoryScroll: {
    marginBottom: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    marginRight: 8,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.textSecondary,
  },
});
