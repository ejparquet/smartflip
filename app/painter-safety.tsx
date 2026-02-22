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
  Wind,
  Droplets,
  Eye,
  Hand,
  Paintbrush,
  Skull,
  Thermometer,
  Zap,
  Heart,
  BookOpen,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";

type ChecklistStatus = "pending" | "in_progress" | "completed" | "overdue";
type ChecklistCategory = "daily" | "weekly" | "pre_job" | "hazmat" | "ppe";

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
  type: "exposure" | "fall" | "spill" | "equipment" | "near_miss";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  project: string;
  location: string;
  reportedBy: string;
  reportedDate: string;
  status: "open" | "investigating" | "resolved";
}

interface HazardInfo {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  risks: string[];
  precautions: string[];
  firstAid: string;
  ppe: string[];
}

const hazardousSubstances: HazardInfo[] = [
  {
    id: "h1",
    name: "Lead Paint",
    icon: Skull,
    color: "#DC2626",
    risks: ["Lead poisoning", "Neurological damage", "Respiratory issues"],
    precautions: ["Use EPA RRP certified methods", "HEPA vacuum", "Wet scraping only", "Containment barriers"],
    firstAid: "If ingested, seek immediate medical attention. For skin contact, wash thoroughly.",
    ppe: ["P100 respirator", "Disposable coveralls", "Safety goggles", "Gloves"],
  },
  {
    id: "h2",
    name: "VOC Fumes",
    icon: Wind,
    color: "#272D53",
    risks: ["Dizziness", "Headaches", "Respiratory irritation", "Long-term health effects"],
    precautions: ["Ensure adequate ventilation", "Use low-VOC products when possible", "Take regular breaks", "Use exhaust fans"],
    firstAid: "Move to fresh air immediately. If symptoms persist, seek medical attention.",
    ppe: ["Organic vapor respirator", "Safety glasses", "Gloves"],
  },
  {
    id: "h3",
    name: "Solvents & Thinners",
    icon: Droplets,
    color: "#3B82F6",
    risks: ["Skin irritation", "Chemical burns", "Fire hazard", "Inhalation risks"],
    precautions: ["Store away from heat sources", "Use in well-ventilated areas", "No smoking", "Proper disposal"],
    firstAid: "Flush skin with water for 15 min. For eye contact, flush and seek medical help.",
    ppe: ["Chemical-resistant gloves", "Safety goggles", "Apron", "Respirator"],
  },
  {
    id: "h4",
    name: "Spray Paint Mist",
    icon: Paintbrush,
    color: "#8B5CF6",
    risks: ["Respiratory issues", "Eye irritation", "Skin sensitization", "Fire/explosion risk"],
    precautions: ["Use spray booth when possible", "Proper ventilation", "Ground equipment", "No ignition sources"],
    firstAid: "Move to fresh air. Wash affected skin. Flush eyes for 15 minutes.",
    ppe: ["Spray paint respirator", "Full face shield", "Coveralls", "Gloves"],
  },
];

const mockChecklists: SafetyChecklist[] = [
  {
    id: "sc1",
    name: "Daily Painter Safety Check",
    category: "daily",
    status: "in_progress",
    project: "Interior Painting - 3BR Home",
    location: "777 Color Way, Austin, TX",
    assignedTo: "Miguel Santos",
    dueDate: "2026-01-28",
    items: [
      { id: "i1", text: "Inspect respirators and masks for damage", isCompleted: true },
      { id: "i2", text: "Check ventilation equipment is working", isCompleted: true },
      { id: "i3", text: "Verify drop cloths properly placed", isCompleted: true },
      { id: "i4", text: "Review MSDS for today's products", isCompleted: false },
      { id: "i5", text: "Ensure first aid kit is stocked", isCompleted: false },
      { id: "i6", text: "Check ladder stability and condition", isCompleted: false },
      { id: "i7", text: "Confirm proper paint storage", isCompleted: true },
    ],
    completedCount: 4,
    totalCount: 7,
  },
  {
    id: "sc2",
    name: "PPE Inspection",
    category: "ppe",
    status: "completed",
    project: "Cabinet Refinishing",
    location: "888 Kitchen St, Pflugerville, TX",
    assignedTo: "Carlos Rivera",
    dueDate: "2026-01-27",
    completedDate: "2026-01-27",
    items: [
      { id: "i1", text: "Check respirator cartridges (replace if needed)", isCompleted: true },
      { id: "i2", text: "Inspect safety glasses for scratches", isCompleted: true },
      { id: "i3", text: "Verify chemical-resistant gloves intact", isCompleted: true },
      { id: "i4", text: "Check coveralls for tears or damage", isCompleted: true },
    ],
    completedCount: 4,
    totalCount: 4,
  },
  {
    id: "sc3",
    name: "Lead Paint Project Checklist",
    category: "hazmat",
    status: "pending",
    project: "Historic Home Restoration",
    location: "123 Heritage Dr, Austin, TX",
    assignedTo: "Luis Martinez",
    dueDate: "2026-01-30",
    items: [
      { id: "i1", text: "Set up containment barriers", isCompleted: false, requiresPhoto: true },
      { id: "i2", text: "Post warning signs", isCompleted: false },
      { id: "i3", text: "Verify RRP certification current", isCompleted: false },
      { id: "i4", text: "HEPA vacuum on site and tested", isCompleted: false },
      { id: "i5", text: "Proper disposal bags ready", isCompleted: false },
      { id: "i6", text: "Decontamination area set up", isCompleted: false, requiresPhoto: true },
    ],
    completedCount: 0,
    totalCount: 6,
  },
  {
    id: "sc4",
    name: "Weekly Equipment Safety Audit",
    category: "weekly",
    status: "overdue",
    project: "Exterior House Painting",
    location: "999 Home Ave, Austin, TX",
    assignedTo: "Miguel Santos",
    dueDate: "2026-01-20",
    items: [
      { id: "i1", text: "Inspect all ladders for damage", isCompleted: false, requiresPhoto: true },
      { id: "i2", text: "Check scaffolding connections", isCompleted: false, requiresPhoto: true },
      { id: "i3", text: "Test spray equipment pressure", isCompleted: false },
      { id: "i4", text: "Inspect extension cords", isCompleted: false },
      { id: "i5", text: "Verify ground fault protection working", isCompleted: false },
    ],
    completedCount: 0,
    totalCount: 5,
  },
];

const mockIncidents: SafetyIncident[] = [
  {
    id: "inc1",
    type: "exposure",
    severity: "low",
    description: "Minor solvent splash on forearm - washed immediately, no irritation",
    project: "Cabinet Refinishing",
    location: "888 Kitchen St, Pflugerville, TX",
    reportedBy: "Carlos Rivera",
    reportedDate: "2026-01-26",
    status: "resolved",
  },
  {
    id: "inc2",
    type: "near_miss",
    severity: "medium",
    description: "Ladder slipped on drop cloth - no injury, need better securing",
    project: "Interior Painting",
    location: "777 Color Way, Austin, TX",
    reportedBy: "Miguel Santos",
    reportedDate: "2026-01-25",
    status: "investigating",
  },
];

const trainingModules = [
  { id: "t1", name: "EPA RRP Lead-Safe Certification", status: "certified", expiry: "Dec 2027", icon: Skull, color: "#DC2626" },
  { id: "t2", name: "Respiratory Protection", status: "completed", expiry: "Valid", icon: Wind, color: "#3B82F6" },
  { id: "t3", name: "OSHA Ladder Safety", status: "completed", expiry: "Valid", icon: AlertTriangle, color: "#272D53" },
  { id: "t4", name: "Hazard Communication (GHS)", status: "due_soon", expiry: "Feb 2026", icon: FileText, color: "#8B5CF6" },
  { id: "t5", name: "First Aid & CPR", status: "completed", expiry: "Mar 2027", icon: Heart, color: "#EC4899" },
];

type TabType = "checklists" | "hazards" | "incidents" | "training";

export default function PainterSafetyScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("checklists");
  const [selectedHazard, setSelectedHazard] = useState<HazardInfo | null>(null);

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
      case "pre_job": return Paintbrush;
      case "hazmat": return Skull;
      case "ppe": return Shield;
    }
  };

  const getCategoryColor = (category: ChecklistCategory) => {
    switch (category) {
      case "daily": return "#272D53";
      case "weekly": return "#3B82F6";
      case "pre_job": return "#10B981";
      case "hazmat": return "#DC2626";
      case "ppe": return "#8B5CF6";
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
      case "exposure": return Droplets;
      case "fall": return AlertTriangle;
      case "spill": return Droplets;
      case "equipment": return Zap;
      case "near_miss": return Eye;
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
      <TouchableOpacity key={checklist.id} style={styles.checklistCard}>
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
          <TouchableOpacity style={[styles.continueBtn, { backgroundColor: getCategoryColor(checklist.category) }]}>
            <Text style={styles.continueBtnText}>
              {checklist.status === "pending" ? "Start Checklist" : "Continue"}
            </Text>
            <ChevronRight size={16} color={Colors.white} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const renderHazardsSection = () => (
    <View style={styles.hazardsSection}>
      <Text style={styles.hazardsSectionTitle}>Common Painting Hazards</Text>
      <Text style={styles.hazardsSubtitle}>Tap to learn safety protocols</Text>
      
      {hazardousSubstances.map(hazard => {
        const HazardIcon = hazard.icon;
        return (
          <TouchableOpacity 
            key={hazard.id} 
            style={styles.hazardCard}
            onPress={() => setSelectedHazard(hazard)}
          >
            <View style={[styles.hazardIconContainer, { backgroundColor: `${hazard.color}20` }]}>
              <HazardIcon size={24} color={hazard.color} />
            </View>
            <View style={styles.hazardInfo}>
              <Text style={styles.hazardName}>{hazard.name}</Text>
              <Text style={styles.hazardRiskPreview} numberOfLines={1}>
                {hazard.risks.slice(0, 2).join(", ")}
              </Text>
            </View>
            <ChevronRight size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        );
      })}

      {selectedHazard && (
        <View style={styles.hazardDetail}>
          <View style={styles.hazardDetailHeader}>
            <View style={[styles.hazardDetailIcon, { backgroundColor: `${selectedHazard.color}20` }]}>
              <selectedHazard.icon size={28} color={selectedHazard.color} />
            </View>
            <Text style={styles.hazardDetailTitle}>{selectedHazard.name}</Text>
            <TouchableOpacity onPress={() => setSelectedHazard(null)}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.hazardSection}>
            <Text style={styles.hazardSectionTitle}>⚠️ Risks</Text>
            {selectedHazard.risks.map((risk, i) => (
              <View key={i} style={styles.hazardListItem}>
                <AlertTriangle size={14} color={selectedHazard.color} />
                <Text style={styles.hazardListText}>{risk}</Text>
              </View>
            ))}
          </View>

          <View style={styles.hazardSection}>
            <Text style={styles.hazardSectionTitle}>🛡️ Required PPE</Text>
            <View style={styles.ppeGrid}>
              {selectedHazard.ppe.map((item, i) => (
                <View key={i} style={styles.ppeItem}>
                  <Shield size={14} color="#3B82F6" />
                  <Text style={styles.ppeText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.hazardSection}>
            <Text style={styles.hazardSectionTitle}>✅ Precautions</Text>
            {selectedHazard.precautions.map((precaution, i) => (
              <View key={i} style={styles.hazardListItem}>
                <CheckCircle size={14} color={Colors.success} />
                <Text style={styles.hazardListText}>{precaution}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.hazardSection, styles.firstAidSection]}>
            <Text style={styles.hazardSectionTitle}>🏥 First Aid</Text>
            <Text style={styles.firstAidText}>{selectedHazard.firstAid}</Text>
          </View>
        </View>
      )}

      <View style={styles.quickTipsCard}>
        <View style={styles.quickTipsHeader}>
          <BookOpen size={20} color="#272D53" />
          <Text style={styles.quickTipsTitle}>Painter Safety Quick Tips</Text>
        </View>
        <View style={styles.quickTip}>
          <Text style={styles.quickTipNumber}>1</Text>
          <Text style={styles.quickTipText}>Always read and follow MSDS/SDS sheets for all products</Text>
        </View>
        <View style={styles.quickTip}>
          <Text style={styles.quickTipNumber}>2</Text>
          <Text style={styles.quickTipText}>Never eat, drink, or smoke while handling paint products</Text>
        </View>
        <View style={styles.quickTip}>
          <Text style={styles.quickTipNumber}>3</Text>
          <Text style={styles.quickTipText}>Take regular breaks in fresh air when using oil-based products</Text>
        </View>
        <View style={styles.quickTip}>
          <Text style={styles.quickTipNumber}>4</Text>
          <Text style={styles.quickTipText}>Store flammable products away from heat sources and direct sunlight</Text>
        </View>
        <View style={styles.quickTip}>
          <Text style={styles.quickTipNumber}>5</Text>
          <Text style={styles.quickTipText}>Dispose of rags and materials properly to prevent spontaneous combustion</Text>
        </View>
      </View>
    </View>
  );

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
      {trainingModules.map(module => {
        const ModuleIcon = module.icon;
        const isExpiring = module.status === "due_soon";
        
        return (
          <View key={module.id} style={styles.trainingCard}>
            <View style={[styles.trainingIconContainer, { backgroundColor: `${module.color}20` }]}>
              <ModuleIcon size={24} color={module.color} />
            </View>
            <View style={styles.trainingInfo}>
              <Text style={styles.trainingName}>{module.name}</Text>
              <Text style={[styles.trainingExpiry, isExpiring && { color: "#272D53" }]}>
                {isExpiring ? "⚠️ " : ""}{module.expiry}
              </Text>
            </View>
            <View style={[
              styles.trainingStatusBadge, 
              { backgroundColor: module.status === "certified" ? `${Colors.success}15` : 
                                module.status === "due_soon" ? "#E8E9EE" : `${Colors.success}15` }
            ]}>
              {module.status === "certified" && <Shield size={12} color={Colors.success} />}
              {module.status === "completed" && <CheckCircle size={12} color={Colors.success} />}
              {module.status === "due_soon" && <AlertTriangle size={12} color="#272D53" />}
              <Text style={[
                styles.trainingStatusText,
                { color: module.status === "due_soon" ? "#272D53" : Colors.success }
              ]}>
                {module.status === "certified" ? "Certified" : 
                 module.status === "due_soon" ? "Due Soon" : "Completed"}
              </Text>
            </View>
          </View>
        );
      })}

      <TouchableOpacity style={styles.viewAllTrainingBtn}>
        <BookOpen size={18} color={Colors.white} />
        <Text style={styles.viewAllTrainingText}>View All Training Modules</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Painter Safety",
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
            <Text style={[styles.statValue, stats.overdue > 0 && { color: Colors.error }]}>{stats.overdue}</Text>
            <Text style={styles.statLabel}>Overdue</Text>
          </View>
        </View>

        <View style={styles.tabContainer}>
          {([
            { key: "checklists", label: "Checklists", icon: FileText },
            { key: "hazards", label: "Hazards", icon: AlertTriangle },
            { key: "incidents", label: "Incidents", icon: Eye },
            { key: "training", label: "Training", icon: BookOpen },
          ] as const).map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <tab.icon size={14} color={activeTab === tab.key ? Colors.white : Colors.textSecondary} />
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
        {activeTab === "hazards" && renderHazardsSection()}
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
    gap: 6,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSecondary,
  },
  tabActive: {
    backgroundColor: "#272D53",
  },
  tabText: {
    fontSize: 11,
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
    paddingVertical: 12,
    borderRadius: 10,
  },
  continueBtnText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  hazardsSection: {
    gap: 12,
  },
  hazardsSectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  hazardsSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  hazardCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  hazardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  hazardInfo: {
    flex: 1,
  },
  hazardName: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  hazardRiskPreview: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  hazardDetail: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginTop: 4,
  },
  hazardDetailHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  hazardDetailIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  hazardDetailTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  closeText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#272D53",
  },
  hazardSection: {
    marginBottom: 16,
  },
  hazardSectionTitle: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 10,
  },
  hazardListItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  hazardListText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  ppeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  ppeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  ppeText: {
    fontSize: 13,
    color: Colors.text,
  },
  firstAidSection: {
    backgroundColor: "#FEF2F2",
    padding: 14,
    borderRadius: 12,
    marginBottom: 0,
  },
  firstAidText: {
    fontSize: 14,
    color: "#991B1B",
    lineHeight: 20,
  },
  quickTipsCard: {
    backgroundColor: "#FFF7ED",
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E8E9EE",
  },
  quickTipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  quickTipsTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#9A3412",
  },
  quickTip: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 10,
  },
  quickTipNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#272D53",
    color: Colors.white,
    fontSize: 13,
    fontWeight: "700" as const,
    textAlign: "center",
    lineHeight: 24,
    overflow: "hidden",
  },
  quickTipText: {
    flex: 1,
    fontSize: 14,
    color: "#9A3412",
    lineHeight: 20,
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  trainingIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  trainingInfo: {
    flex: 1,
  },
  trainingName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  trainingExpiry: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  trainingStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  trainingStatusText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  viewAllTrainingBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#272D53",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 4,
  },
  viewAllTrainingText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.white,
  },
});
