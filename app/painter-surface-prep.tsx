import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Image } from "expo-image";
import {
  ArrowLeft,
  Search,
  Plus,
  CheckCircle,
  Circle,
  Clock,
  AlertTriangle,
  Camera,
  User,
  MapPin,
  Calendar,
  ChevronDown,
  ChevronRight,
  Layers,
  Droplets,
  Wind,
  Thermometer,
  Paintbrush,
  Wrench,
  Shield,
  FileText,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";

type PrepStatus = "pending" | "in_progress" | "completed" | "needs_attention";
type PrepCategory = "cleaning" | "repair" | "sanding" | "priming" | "masking" | "caulking";
type SurfaceType = "drywall" | "wood" | "metal" | "concrete" | "brick" | "stucco" | "trim";

interface PrepTask {
  id: string;
  title: string;
  description: string;
  status: PrepStatus;
  category: PrepCategory;
  surfaceType: SurfaceType;
  location: string;
  assignedTo: string;
  assignedAvatar: string;
  estimatedTime: string;
  completedDate?: string;
  photos: string[];
  notes?: string;
}

interface PrepProject {
  id: string;
  name: string;
  address: string;
  totalTasks: number;
  completedTasks: number;
  image: string;
  surfaceCondition: "excellent" | "good" | "fair" | "poor";
}

const mockProjects: PrepProject[] = [
  {
    id: "proj1",
    name: "Interior Painting - 3BR Home",
    address: "777 Color Way, Austin, TX",
    totalTasks: 18,
    completedTasks: 12,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400",
    surfaceCondition: "good",
  },
  {
    id: "proj2",
    name: "Cabinet Refinishing",
    address: "888 Kitchen St, Pflugerville, TX",
    totalTasks: 10,
    completedTasks: 4,
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
    surfaceCondition: "fair",
  },
  {
    id: "proj3",
    name: "Exterior House Painting",
    address: "999 Home Ave, Austin, TX",
    totalTasks: 24,
    completedTasks: 8,
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400",
    surfaceCondition: "poor",
  },
];

const mockPrepTasks: PrepTask[] = [
  {
    id: "pt1",
    title: "Clean walls - dust and cobwebs",
    description: "Use tack cloth to remove all dust from walls. Pay attention to corners and ceiling edges.",
    status: "completed",
    category: "cleaning",
    surfaceType: "drywall",
    location: "Master Bedroom",
    assignedTo: "Miguel Santos",
    assignedAvatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200",
    estimatedTime: "45 min",
    completedDate: "2026-01-27",
    photos: [],
  },
  {
    id: "pt2",
    title: "Patch nail holes and cracks",
    description: "Fill all nail holes with spackle. Use mesh tape and joint compound for cracks wider than 1/8 inch.",
    status: "in_progress",
    category: "repair",
    surfaceType: "drywall",
    location: "Living Room",
    assignedTo: "Carlos Rivera",
    assignedAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
    estimatedTime: "2 hours",
    photos: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400"],
    notes: "Found 3 large cracks near window that need mesh tape",
  },
  {
    id: "pt3",
    title: "Sand patched areas smooth",
    description: "Sand all patched areas with 120-grit paper, then finish with 220-grit for smooth blend.",
    status: "pending",
    category: "sanding",
    surfaceType: "drywall",
    location: "Living Room",
    assignedTo: "Miguel Santos",
    assignedAvatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200",
    estimatedTime: "1.5 hours",
    photos: [],
  },
  {
    id: "pt4",
    title: "Apply primer to repaired areas",
    description: "Spot prime all repaired areas with Kilz Original. Ensure complete coverage of patches.",
    status: "pending",
    category: "priming",
    surfaceType: "drywall",
    location: "Living Room",
    assignedTo: "Carlos Rivera",
    assignedAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
    estimatedTime: "1 hour",
    photos: [],
  },
  {
    id: "pt5",
    title: "Mask trim and windows",
    description: "Apply painter's tape to all trim, window frames, and door frames. Use plastic sheeting for windows.",
    status: "pending",
    category: "masking",
    surfaceType: "trim",
    location: "Master Bedroom",
    assignedTo: "Luis Martinez",
    assignedAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
    estimatedTime: "1 hour",
    photos: [],
  },
  {
    id: "pt6",
    title: "Caulk gaps around trim",
    description: "Apply paintable caulk to all gaps between walls and trim. Tool smooth for professional finish.",
    status: "needs_attention",
    category: "caulking",
    surfaceType: "trim",
    location: "Kitchen",
    assignedTo: "Carlos Rivera",
    assignedAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
    estimatedTime: "2 hours",
    photos: [],
    notes: "Client requested additional caulking around crown molding",
  },
  {
    id: "pt7",
    title: "TSP wash exterior siding",
    description: "Power wash entire exterior with TSP solution. Allow 48 hours dry time before priming.",
    status: "pending",
    category: "cleaning",
    surfaceType: "wood",
    location: "Exterior - All Sides",
    assignedTo: "Miguel Santos",
    assignedAvatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200",
    estimatedTime: "4 hours",
    photos: [],
  },
  {
    id: "pt8",
    title: "Scrape peeling paint",
    description: "Remove all loose and peeling paint with scraper. Feather edges of remaining paint.",
    status: "needs_attention",
    category: "repair",
    surfaceType: "wood",
    location: "Exterior - South Side",
    assignedTo: "Luis Martinez",
    assignedAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
    estimatedTime: "3 hours",
    photos: [],
    notes: "More peeling than expected - may need additional time",
  },
];

const prepChecklistItems = [
  { id: "c1", category: "cleaning", items: ["Remove switch/outlet covers", "Dust all surfaces", "Clean with TSP if needed", "Remove cobwebs", "Vacuum floor debris"] },
  { id: "c2", category: "repair", items: ["Fill nail holes", "Patch cracks", "Repair water damage", "Replace damaged drywall", "Fix loose trim"] },
  { id: "c3", category: "sanding", items: ["Sand patches smooth", "Scuff glossy surfaces", "Remove rough spots", "Feather patch edges", "Final dust removal"] },
  { id: "c4", category: "priming", items: ["Prime repairs", "Block stains", "Prime bare wood", "Prime new drywall", "Check coverage"] },
  { id: "c5", category: "masking", items: ["Tape trim edges", "Cover windows", "Protect flooring", "Mask fixtures", "Drop cloths in place"] },
];

export default function PainterSurfacePrepScreen() {
  const router = useRouter();
  const [selectedProject, setSelectedProject] = useState<PrepProject | null>(mockProjects[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<PrepCategory | "all">("all");
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [activeTab, setActiveTab] = useState<"tasks" | "checklist" | "conditions">("tasks");

  const getStatusColor = (status: PrepStatus) => {
    switch (status) {
      case "pending": return Colors.textSecondary;
      case "in_progress": return "#3B82F6";
      case "completed": return Colors.success;
      case "needs_attention": return "#272D53";
    }
  };

  const getStatusLabel = (status: PrepStatus) => {
    switch (status) {
      case "pending": return "Pending";
      case "in_progress": return "In Progress";
      case "completed": return "Completed";
      case "needs_attention": return "Needs Attention";
    }
  };

  const getCategoryIcon = (category: PrepCategory) => {
    switch (category) {
      case "cleaning": return Droplets;
      case "repair": return Wrench;
      case "sanding": return Layers;
      case "priming": return Paintbrush;
      case "masking": return Shield;
      case "caulking": return FileText;
    }
  };

  const getCategoryColor = (category: PrepCategory) => {
    switch (category) {
      case "cleaning": return "#06B6D4";
      case "repair": return "#272D53";
      case "sanding": return "#8B5CF6";
      case "priming": return "#EC4899";
      case "masking": return "#10B981";
      case "caulking": return "#3B82F6";
    }
  };

  const getCategoryLabel = (category: PrepCategory) => {
    switch (category) {
      case "cleaning": return "Cleaning";
      case "repair": return "Repair";
      case "sanding": return "Sanding";
      case "priming": return "Priming";
      case "masking": return "Masking";
      case "caulking": return "Caulking";
    }
  };

  const getConditionColor = (condition: PrepProject["surfaceCondition"]) => {
    switch (condition) {
      case "excellent": return Colors.success;
      case "good": return "#10B981";
      case "fair": return "#272D53";
      case "poor": return Colors.error;
    }
  };

  const filteredTasks = mockPrepTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || task.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: mockPrepTasks.length,
    pending: mockPrepTasks.filter(t => t.status === "pending").length,
    inProgress: mockPrepTasks.filter(t => t.status === "in_progress").length,
    completed: mockPrepTasks.filter(t => t.status === "completed").length,
    needsAttention: mockPrepTasks.filter(t => t.status === "needs_attention").length,
  };

  const completionPercent = selectedProject 
    ? Math.round((selectedProject.completedTasks / selectedProject.totalTasks) * 100)
    : 0;

  const renderPrepTaskCard = (task: PrepTask) => {
    const CategoryIcon = getCategoryIcon(task.category);
    
    return (
      <TouchableOpacity key={task.id} style={styles.taskCard}>
        <View style={styles.taskHeader}>
          <View style={[styles.categoryIcon, { backgroundColor: `${getCategoryColor(task.category)}20` }]}>
            <CategoryIcon size={18} color={getCategoryColor(task.category)} />
          </View>
          <View style={styles.taskInfo}>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <View style={styles.taskMeta}>
              <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(task.status)}15` }]}>
                <Text style={[styles.statusText, { color: getStatusColor(task.status) }]}>
                  {getStatusLabel(task.status)}
                </Text>
              </View>
              <Text style={styles.surfaceText}>{task.surfaceType}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.taskDescription} numberOfLines={2}>{task.description}</Text>

        <View style={styles.taskLocation}>
          <MapPin size={14} color={Colors.textSecondary} />
          <Text style={styles.taskLocationText}>{task.location}</Text>
        </View>

        <View style={styles.taskAssignment}>
          <View style={styles.assignedToRow}>
            <Image source={{ uri: task.assignedAvatar }} style={styles.assigneeAvatar} />
            <View>
              <Text style={styles.assignedLabel}>Assigned to</Text>
              <Text style={styles.assigneeName}>{task.assignedTo}</Text>
            </View>
          </View>
          <View style={styles.timeEstimate}>
            <Clock size={14} color={Colors.textSecondary} />
            <Text style={styles.timeText}>{task.estimatedTime}</Text>
          </View>
        </View>

        {task.notes && (
          <View style={styles.notesSection}>
            <AlertTriangle size={14} color="#272D53" />
            <Text style={styles.notesText}>{task.notes}</Text>
          </View>
        )}

        <View style={styles.taskFooter}>
          <View style={styles.taskActions}>
            {task.photos.length > 0 && (
              <View style={styles.photoCount}>
                <Camera size={14} color={Colors.textSecondary} />
                <Text style={styles.photoCountText}>{task.photos.length}</Text>
              </View>
            )}
          </View>
          {task.status !== "completed" && (
            <TouchableOpacity style={[styles.completeBtn, { backgroundColor: getCategoryColor(task.category) }]}>
              <CheckCircle size={16} color={Colors.white} />
              <Text style={styles.completeBtnText}>Mark Complete</Text>
            </TouchableOpacity>
          )}
          {task.status === "completed" && (
            <Text style={styles.completedText}>
              ✓ Completed {task.completedDate}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderChecklist = () => (
    <View style={styles.checklistContainer}>
      {prepChecklistItems.map(checklist => {
        const CategoryIcon = getCategoryIcon(checklist.category as PrepCategory);
        return (
          <View key={checklist.id} style={styles.checklistSection}>
            <View style={styles.checklistHeader}>
              <View style={[styles.checklistIcon, { backgroundColor: `${getCategoryColor(checklist.category as PrepCategory)}20` }]}>
                <CategoryIcon size={20} color={getCategoryColor(checklist.category as PrepCategory)} />
              </View>
              <Text style={styles.checklistTitle}>{getCategoryLabel(checklist.category as PrepCategory)}</Text>
            </View>
            {checklist.items.map((item, index) => (
              <TouchableOpacity key={index} style={styles.checklistItem}>
                <Circle size={18} color={Colors.textTertiary} />
                <Text style={styles.checklistItemText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      })}
    </View>
  );

  const renderConditions = () => (
    <View style={styles.conditionsContainer}>
      <View style={styles.conditionCard}>
        <View style={styles.conditionHeader}>
          <Thermometer size={24} color="#272D53" />
          <Text style={styles.conditionTitle}>Temperature</Text>
        </View>
        <Text style={styles.conditionValue}>68°F</Text>
        <View style={styles.conditionStatus}>
          <CheckCircle size={14} color={Colors.success} />
          <Text style={styles.conditionStatusText}>Ideal for painting (50-85°F)</Text>
        </View>
      </View>

      <View style={styles.conditionCard}>
        <View style={styles.conditionHeader}>
          <Droplets size={24} color="#3B82F6" />
          <Text style={styles.conditionTitle}>Humidity</Text>
        </View>
        <Text style={styles.conditionValue}>45%</Text>
        <View style={styles.conditionStatus}>
          <CheckCircle size={14} color={Colors.success} />
          <Text style={styles.conditionStatusText}>Good humidity (40-50%)</Text>
        </View>
      </View>

      <View style={styles.conditionCard}>
        <View style={styles.conditionHeader}>
          <Wind size={24} color="#06B6D4" />
          <Text style={styles.conditionTitle}>Ventilation</Text>
        </View>
        <Text style={styles.conditionValue}>Good</Text>
        <View style={styles.conditionStatus}>
          <CheckCircle size={14} color={Colors.success} />
          <Text style={styles.conditionStatusText}>Adequate airflow</Text>
        </View>
      </View>

      <View style={styles.surfaceAssessmentCard}>
        <Text style={styles.surfaceAssessmentTitle}>Surface Assessment Checklist</Text>
        <View style={styles.assessmentItem}>
          <CheckCircle size={16} color={Colors.success} />
          <Text style={styles.assessmentText}>No moisture present</Text>
        </View>
        <View style={styles.assessmentItem}>
          <CheckCircle size={16} color={Colors.success} />
          <Text style={styles.assessmentText}>Surface is clean and dust-free</Text>
        </View>
        <View style={styles.assessmentItem}>
          <AlertTriangle size={16} color="#272D53" />
          <Text style={styles.assessmentText}>Some areas need additional sanding</Text>
        </View>
        <View style={styles.assessmentItem}>
          <CheckCircle size={16} color={Colors.success} />
          <Text style={styles.assessmentText}>All repairs are fully cured</Text>
        </View>
        <View style={styles.assessmentItem}>
          <CheckCircle size={16} color={Colors.success} />
          <Text style={styles.assessmentText}>Primer is properly applied</Text>
        </View>
      </View>

      <View style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>Pro Tips for Surface Prep</Text>
        <View style={styles.tipItem}>
          <Text style={styles.tipNumber}>1</Text>
          <Text style={styles.tipText}>Always clean surfaces before patching - dirt prevents proper adhesion</Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipNumber}>2</Text>
          <Text style={styles.tipText}>Let patches dry completely before sanding (24 hrs for deep fills)</Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipNumber}>3</Text>
          <Text style={styles.tipText}>Use appropriate primer for stains (shellac for water/smoke damage)</Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipNumber}>4</Text>
          <Text style={styles.tipText}>Remove painter's tape within 24 hours of final coat</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Surface Preparation",
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
        <TouchableOpacity 
          style={styles.projectSelector}
          onPress={() => setShowProjectPicker(!showProjectPicker)}
        >
          {selectedProject && (
            <>
              <Image source={{ uri: selectedProject.image }} style={styles.projectImage} contentFit="cover" />
              <View style={styles.projectInfo}>
                <Text style={styles.projectName}>{selectedProject.name}</Text>
                <View style={styles.conditionRow}>
                  <View style={[styles.conditionBadge, { backgroundColor: `${getConditionColor(selectedProject.surfaceCondition)}15` }]}>
                    <Text style={[styles.conditionBadgeText, { color: getConditionColor(selectedProject.surfaceCondition) }]}>
                      {selectedProject.surfaceCondition.toUpperCase()} CONDITION
                    </Text>
                  </View>
                </View>
              </View>
              <ChevronDown size={20} color={Colors.textSecondary} />
            </>
          )}
        </TouchableOpacity>

        {showProjectPicker && (
          <View style={styles.projectPicker}>
            {mockProjects.map(proj => (
              <TouchableOpacity 
                key={proj.id}
                style={[styles.projectOption, selectedProject?.id === proj.id && styles.projectOptionSelected]}
                onPress={() => {
                  setSelectedProject(proj);
                  setShowProjectPicker(false);
                }}
              >
                <Image source={{ uri: proj.image }} style={styles.projectOptionImage} contentFit="cover" />
                <View style={styles.projectOptionInfo}>
                  <Text style={styles.projectOptionName}>{proj.name}</Text>
                  <Text style={styles.projectOptionProgress}>
                    {proj.completedTasks}/{proj.totalTasks} tasks complete
                  </Text>
                </View>
                {selectedProject?.id === proj.id && (
                  <CheckCircle size={20} color={Colors.success} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Prep Progress</Text>
            <Text style={styles.progressPercent}>{completionPercent}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${completionPercent}%` }]} />
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: Colors.textSecondary }]} />
              <Text style={styles.statText}>{stats.pending} Pending</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: "#3B82F6" }]} />
              <Text style={styles.statText}>{stats.inProgress} Active</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: "#272D53" }]} />
              <Text style={styles.statText}>{stats.needsAttention} Attention</Text>
            </View>
          </View>
        </View>

        <View style={styles.tabContainer}>
          {([
            { key: "tasks", label: "Tasks" },
            { key: "checklist", label: "Checklist" },
            { key: "conditions", label: "Conditions" },
          ] as const).map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {activeTab === "tasks" && (
        <>
          <View style={styles.filterSection}>
            <View style={styles.searchContainer}>
              <Search size={18} color={Colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search tasks..."
                placeholderTextColor={Colors.textTertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
            {(["all", "cleaning", "repair", "sanding", "priming", "masking", "caulking"] as const).map(category => (
              <TouchableOpacity
                key={category}
                style={[styles.filterChip, filterCategory === category && styles.filterChipActive]}
                onPress={() => setFilterCategory(category)}
              >
                <Text style={[styles.filterChipText, filterCategory === category && styles.filterChipTextActive]}>
                  {category === "all" ? "All" : getCategoryLabel(category)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "tasks" && filteredTasks.map(task => renderPrepTaskCard(task))}
        {activeTab === "checklist" && renderChecklist()}
        {activeTab === "conditions" && renderConditions()}

        {activeTab === "tasks" && filteredTasks.length === 0 && (
          <View style={styles.emptyState}>
            <Layers size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyStateTitle}>No Tasks Found</Text>
            <Text style={styles.emptyStateSubtitle}>
              {filterCategory === "all" ? "Add surface prep tasks" : "No tasks in this category"}
            </Text>
          </View>
        )}
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
  projectSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  projectImage: {
    width: 44,
    height: 44,
    borderRadius: 10,
    marginRight: 12,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  conditionRow: {
    flexDirection: "row",
    marginTop: 4,
  },
  conditionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  conditionBadgeText: {
    fontSize: 10,
    fontWeight: "700" as const,
  },
  projectPicker: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 8,
    marginBottom: 16,
    gap: 4,
  },
  projectOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
  },
  projectOptionSelected: {
    backgroundColor: Colors.surface,
  },
  projectOptionImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  projectOptionInfo: {
    flex: 1,
  },
  projectOptionName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  projectOptionProgress: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  progressSection: {},
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  progressPercent: {
    fontSize: 18,
    fontWeight: "800" as const,
    color: "#272D53",
  },
  progressBar: {
    height: 10,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#272D53",
    borderRadius: 5,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  tabContainer: {
    flexDirection: "row",
    gap: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSecondary,
  },
  tabActive: {
    backgroundColor: "#272D53",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.white,
  },
  filterSection: {
    padding: 20,
    paddingBottom: 12,
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
    fontSize: 15,
    color: Colors.text,
    paddingVertical: 12,
  },
  filterChips: {
    paddingHorizontal: 20,
    marginBottom: 8,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 8,
    paddingBottom: 100,
  },
  taskCard: {
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
  taskHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 6,
  },
  taskMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700" as const,
  },
  surfaceText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: "capitalize" as const,
  },
  taskDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 10,
  },
  taskLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  taskLocationText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  taskAssignment: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 12,
  },
  assignedToRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  assigneeAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  assignedLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  assigneeName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  timeEstimate: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timeText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  notesSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#E8E9EE",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  notesText: {
    flex: 1,
    fontSize: 13,
    color: "#92400E",
  },
  taskFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskActions: {
    flexDirection: "row",
    gap: 12,
  },
  photoCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  photoCountText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  completeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  completeBtnText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  completedText: {
    fontSize: 13,
    color: Colors.success,
    fontWeight: "500" as const,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.text,
    marginTop: 16,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  checklistContainer: {
    gap: 16,
  },
  checklistSection: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  checklistHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  checklistIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  checklistTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  checklistItemText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  conditionsContainer: {
    gap: 12,
  },
  conditionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  conditionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  conditionTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  conditionValue: {
    fontSize: 32,
    fontWeight: "800" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  conditionStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  conditionStatusText: {
    fontSize: 13,
    color: Colors.success,
  },
  surfaceAssessmentCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  surfaceAssessmentTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 14,
  },
  assessmentItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  assessmentText: {
    fontSize: 14,
    color: Colors.text,
  },
  tipsCard: {
    backgroundColor: "#FFF7ED",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E8E9EE",
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#9A3412",
    marginBottom: 14,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  tipNumber: {
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
  tipText: {
    flex: 1,
    fontSize: 14,
    color: "#9A3412",
    lineHeight: 20,
  },
});
