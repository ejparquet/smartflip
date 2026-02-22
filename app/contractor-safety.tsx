import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Stack, useRouter } from "expo-router";
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
  Flame,
  Zap,
  Droplets,
  Wind,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";

type ChecklistStatus = "pending" | "in_progress" | "completed" | "overdue";
type ChecklistCategory = "daily" | "weekly" | "monthly" | "pre_job" | "incident";

interface ChecklistItem {
  id: string;
  text: string;
  isCompleted: boolean;
  notes?: string;
  requiresPhoto?: boolean;
  photoTaken?: boolean;
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
  type: "injury" | "near_miss" | "property_damage" | "hazard";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  project: string;
  location: string;
  reportedBy: string;
  reportedDate: string;
  status: "open" | "investigating" | "resolved";
}

const mockChecklists: SafetyChecklist[] = [
  {
    id: "sc1",
    name: "Daily Site Safety Check",
    category: "daily",
    status: "in_progress",
    project: "Kitchen Renovation",
    location: "456 Maple St, Austin, TX",
    assignedTo: "Mike Rodriguez",
    dueDate: "2026-01-27",
    items: [
      { id: "i1", text: "PPE available for all workers", isCompleted: true },
      { id: "i2", text: "First aid kit stocked and accessible", isCompleted: true },
      { id: "i3", text: "Fire extinguisher present and charged", isCompleted: true },
      { id: "i4", text: "Electrical cords inspected for damage", isCompleted: false },
      { id: "i5", text: "Work area clear of debris and hazards", isCompleted: false },
      { id: "i6", text: "Proper ventilation ensured", isCompleted: false },
      { id: "i7", text: "Emergency exits unobstructed", isCompleted: true },
    ],
    completedCount: 4,
    totalCount: 7,
  },
  {
    id: "sc2",
    name: "Pre-Job Safety Briefing",
    category: "pre_job",
    status: "completed",
    project: "Kitchen Renovation",
    location: "456 Maple St, Austin, TX",
    assignedTo: "Mike Rodriguez",
    dueDate: "2026-01-27",
    completedDate: "2026-01-27",
    items: [
      { id: "i1", text: "Review job hazards with crew", isCompleted: true },
      { id: "i2", text: "Verify all workers have proper PPE", isCompleted: true },
      { id: "i3", text: "Confirm emergency procedures understood", isCompleted: true },
      { id: "i4", text: "Check equipment before use", isCompleted: true },
    ],
    completedCount: 4,
    totalCount: 4,
  },
  {
    id: "sc3",
    name: "Weekly Equipment Inspection",
    category: "weekly",
    status: "pending",
    project: "Deck Addition",
    location: "123 Pine Ave, Cedar Park, TX",
    assignedTo: "Carlos Martinez",
    dueDate: "2026-01-31",
    items: [
      { id: "i1", text: "Inspect all power tools", isCompleted: false, requiresPhoto: true },
      { id: "i2", text: "Check ladder condition", isCompleted: false },
      { id: "i3", text: "Verify scaffold stability", isCompleted: false, requiresPhoto: true },
      { id: "i4", text: "Test GFCI outlets", isCompleted: false },
      { id: "i5", text: "Inspect fall protection equipment", isCompleted: false, requiresPhoto: true },
    ],
    completedCount: 0,
    totalCount: 5,
  },
  {
    id: "sc4",
    name: "Monthly Safety Audit",
    category: "monthly",
    status: "overdue",
    project: "Bathroom Remodel",
    location: "789 Oak Dr, Round Rock, TX",
    assignedTo: "Mike Rodriguez",
    dueDate: "2026-01-15",
    items: [
      { id: "i1", text: "Review all incident reports", isCompleted: false },
      { id: "i2", text: "Update safety training records", isCompleted: false },
      { id: "i3", text: "Inspect all PPE inventory", isCompleted: false },
      { id: "i4", text: "Review emergency procedures", isCompleted: false },
      { id: "i5", text: "Document any safety concerns", isCompleted: false },
    ],
    completedCount: 0,
    totalCount: 5,
  },
];

const mockIncidents: SafetyIncident[] = [
  {
    id: "inc1",
    type: "near_miss",
    severity: "medium",
    description: "Unsecured material stack nearly fell during wind gust",
    project: "Deck Addition",
    location: "123 Pine Ave, Cedar Park, TX",
    reportedBy: "Carlos Martinez",
    reportedDate: "2026-01-25",
    status: "resolved",
  },
  {
    id: "inc2",
    type: "hazard",
    severity: "low",
    description: "Extension cord showing wear - needs replacement",
    project: "Kitchen Renovation",
    location: "456 Maple St, Austin, TX",
    reportedBy: "Tony Hernandez",
    reportedDate: "2026-01-26",
    status: "investigating",
  },
];

type TabType = "checklists" | "incidents" | "training";

export default function ContractorSafetyScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("checklists");
  const [selectedChecklist, setSelectedChecklist] = useState<SafetyChecklist | null>(null);

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
      case "incident": return AlertTriangle;
    }
  };

  const getCategoryColor = (category: ChecklistCategory) => {
    switch (category) {
      case "daily": return "#272D53";
      case "weekly": return "#3B82F6";
      case "monthly": return "#8B5CF6";
      case "pre_job": return "#10B981";
      case "incident": return Colors.error;
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
      case "near_miss": return Wind;
      case "property_damage": return Flame;
      case "hazard": return Zap;
    }
  };

  const stats = {
    pending: mockChecklists.filter(c => c.status === "pending").length,
    inProgress: mockChecklists.filter(c => c.status === "in_progress").length,
    completed: mockChecklists.filter(c => c.status === "completed").length,
    overdue: mockChecklists.filter(c => c.status === "overdue").length,
    openIncidents: mockIncidents.filter(i => i.status !== "resolved").length,
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
            <MapPin size={12} color={Colors.textSecondary} />
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
        <View style={styles.trainingIcon}>
          <HardHat size={28} color="#272D53" />
        </View>
        <Text style={styles.trainingTitle}>OSHA 10 Certification</Text>
        <Text style={styles.trainingStatus}>Valid until Dec 2027</Text>
        <View style={styles.trainingProgress}>
          <CheckCircle size={16} color={Colors.success} />
          <Text style={styles.trainingProgressText}>Completed</Text>
        </View>
      </View>

      <View style={styles.trainingCard}>
        <View style={styles.trainingIcon}>
          <Flame size={28} color={Colors.error} />
        </View>
        <Text style={styles.trainingTitle}>Fire Safety</Text>
        <Text style={styles.trainingStatus}>Annual Renewal Due</Text>
        <View style={styles.trainingProgress}>
          <AlertTriangle size={16} color="#272D53" />
          <Text style={[styles.trainingProgressText, { color: "#272D53" }]}>Due in 30 days</Text>
        </View>
      </View>

      <View style={styles.trainingCard}>
        <View style={styles.trainingIcon}>
          <Zap size={28} color="#3B82F6" />
        </View>
        <Text style={styles.trainingTitle}>Electrical Safety</Text>
        <Text style={styles.trainingStatus}>In Progress</Text>
        <View style={styles.trainingProgressBar}>
          <View style={[styles.trainingProgressFill, { width: "65%" }]} />
        </View>
        <Text style={styles.trainingProgressPercent}>65% Complete</Text>
      </View>

      <View style={styles.trainingCard}>
        <View style={styles.trainingIcon}>
          <Droplets size={28} color="#06B6D4" />
        </View>
        <Text style={styles.trainingTitle}>First Aid/CPR</Text>
        <Text style={styles.trainingStatus}>Valid until Mar 2026</Text>
        <View style={styles.trainingProgress}>
          <CheckCircle size={16} color={Colors.success} />
          <Text style={styles.trainingProgressText}>Completed</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Safety & Compliance",
          headerLeft: () => <BackButton />,
          headerRight: () => (
            <TouchableOpacity style={styles.addButton}>
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
            <Text style={[styles.statValue, { color: Colors.error }]}>{stats.overdue}</Text>
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
        {activeTab === "checklists" && mockChecklists.map(checklist => renderChecklistCard(checklist))}
        {activeTab === "incidents" && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Incidents</Text>
              <TouchableOpacity style={styles.reportBtn}>
                <Plus size={16} color={Colors.white} />
                <Text style={styles.reportBtnText}>Report</Text>
              </TouchableOpacity>
            </View>
            {mockIncidents.map(incident => renderIncidentCard(incident))}
          </>
        )}
        {activeTab === "training" && renderTrainingSection()}
      </ScrollView>
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
    backgroundColor: "#272D53",
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
    backgroundColor: "#272D53",
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
    backgroundColor: "#272D53",
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
    backgroundColor: Colors.surfaceSecondary,
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
    backgroundColor: "#3B82F6",
    borderRadius: 4,
  },
  trainingProgressPercent: {
    fontSize: 13,
    color: "#3B82F6",
    fontWeight: "600" as const,
  },
});
