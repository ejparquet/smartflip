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
  Filter,
  ChevronDown,
  MessageCircle,
  Trash2,
  Edit3,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";

type PunchItemStatus = "pending" | "in_progress" | "completed" | "disputed";
type PunchItemPriority = "low" | "medium" | "high" | "critical";
type PunchItemCategory = "structural" | "electrical" | "plumbing" | "finish" | "paint" | "cleanup" | "other";

interface PunchItem {
  id: string;
  title: string;
  description: string;
  status: PunchItemStatus;
  priority: PunchItemPriority;
  category: PunchItemCategory;
  location: string;
  assignedTo: string;
  assignedAvatar: string;
  createdDate: string;
  dueDate?: string;
  completedDate?: string;
  photos: string[];
  comments: number;
  reportedBy: string;
}

interface Project {
  id: string;
  name: string;
  address: string;
  totalItems: number;
  completedItems: number;
  image: string;
}

const mockProjects: Project[] = [
  {
    id: "proj1",
    name: "Kitchen Renovation",
    address: "456 Maple St, Austin, TX",
    totalItems: 12,
    completedItems: 8,
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
  },
  {
    id: "proj2",
    name: "Bathroom Remodel",
    address: "789 Oak Dr, Round Rock, TX",
    totalItems: 8,
    completedItems: 3,
    image: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400",
  },
  {
    id: "proj3",
    name: "Deck Addition",
    address: "123 Pine Ave, Cedar Park, TX",
    totalItems: 5,
    completedItems: 5,
    image: "https://images.unsplash.com/photo-1591825729269-caeb344f6df2?w=400",
  },
];

const mockPunchItems: PunchItem[] = [
  {
    id: "pi1",
    title: "Touch up paint on cabinet trim",
    description: "Minor paint chips on upper cabinet trim near sink. Needs white semi-gloss touch up.",
    status: "pending",
    priority: "low",
    category: "paint",
    location: "Kitchen - Upper Cabinets",
    assignedTo: "Tony Hernandez",
    assignedAvatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200",
    createdDate: "2026-01-25",
    dueDate: "2026-01-30",
    photos: ["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400"],
    comments: 2,
    reportedBy: "Client",
  },
  {
    id: "pi2",
    title: "Adjust cabinet door alignment",
    description: "Lower left cabinet door is slightly misaligned. Gap visible at top.",
    status: "in_progress",
    priority: "medium",
    category: "finish",
    location: "Kitchen - Lower Cabinets",
    assignedTo: "Carlos Martinez",
    assignedAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
    createdDate: "2026-01-24",
    dueDate: "2026-01-28",
    photos: [],
    comments: 1,
    reportedBy: "Foreman",
  },
  {
    id: "pi3",
    title: "Install missing outlet cover",
    description: "Outlet cover plate missing on island counter. Standard white decora plate needed.",
    status: "completed",
    priority: "high",
    category: "electrical",
    location: "Kitchen - Island",
    assignedTo: "David Chen",
    assignedAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
    createdDate: "2026-01-23",
    completedDate: "2026-01-26",
    photos: [],
    comments: 0,
    reportedBy: "Inspector",
  },
  {
    id: "pi4",
    title: "Fix slow drain in kitchen sink",
    description: "Kitchen sink draining slowly. May need to check p-trap or vent.",
    status: "pending",
    priority: "high",
    category: "plumbing",
    location: "Kitchen - Sink",
    assignedTo: "James Wilson",
    assignedAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200",
    createdDate: "2026-01-26",
    dueDate: "2026-01-28",
    photos: [],
    comments: 3,
    reportedBy: "Client",
  },
  {
    id: "pi5",
    title: "Replace cracked floor tile",
    description: "Small crack in floor tile near refrigerator area. Single tile replacement needed.",
    status: "disputed",
    priority: "medium",
    category: "finish",
    location: "Kitchen - Floor",
    assignedTo: "Carlos Martinez",
    assignedAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
    createdDate: "2026-01-24",
    photos: ["https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=400"],
    comments: 5,
    reportedBy: "Client",
  },
  {
    id: "pi6",
    title: "Final cleanup - dust on surfaces",
    description: "Construction dust visible on countertops and inside cabinets. Full wipe down needed.",
    status: "pending",
    priority: "low",
    category: "cleanup",
    location: "Kitchen - All Areas",
    assignedTo: "Roberto Garcia",
    assignedAvatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200",
    createdDate: "2026-01-27",
    dueDate: "2026-01-29",
    photos: [],
    comments: 0,
    reportedBy: "Foreman",
  },
];

export default function PunchListScreen() {
  const router = useRouter();
  const [selectedProject, setSelectedProject] = useState<Project | null>(mockProjects[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<PunchItemStatus | "all">("all");
  const [showProjectPicker, setShowProjectPicker] = useState(false);

  const getStatusColor = (status: PunchItemStatus) => {
    switch (status) {
      case "pending": return Colors.textSecondary;
      case "in_progress": return "#3B82F6";
      case "completed": return Colors.success;
      case "disputed": return Colors.error;
    }
  };

  const getStatusLabel = (status: PunchItemStatus) => {
    switch (status) {
      case "pending": return "Pending";
      case "in_progress": return "In Progress";
      case "completed": return "Completed";
      case "disputed": return "Disputed";
    }
  };

  const getStatusIcon = (status: PunchItemStatus) => {
    switch (status) {
      case "pending": return Circle;
      case "in_progress": return Clock;
      case "completed": return CheckCircle;
      case "disputed": return AlertTriangle;
    }
  };

  const getPriorityColor = (priority: PunchItemPriority) => {
    switch (priority) {
      case "low": return Colors.textSecondary;
      case "medium": return "#272D53";
      case "high": return Colors.error;
      case "critical": return "#DC2626";
    }
  };

  const getCategoryLabel = (category: PunchItemCategory) => {
    switch (category) {
      case "structural": return "Structural";
      case "electrical": return "Electrical";
      case "plumbing": return "Plumbing";
      case "finish": return "Finish Work";
      case "paint": return "Paint";
      case "cleanup": return "Cleanup";
      case "other": return "Other";
    }
  };

  const filteredItems = mockPunchItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: mockPunchItems.length,
    pending: mockPunchItems.filter(i => i.status === "pending").length,
    inProgress: mockPunchItems.filter(i => i.status === "in_progress").length,
    completed: mockPunchItems.filter(i => i.status === "completed").length,
    disputed: mockPunchItems.filter(i => i.status === "disputed").length,
  };

  const completionPercent = selectedProject 
    ? Math.round((selectedProject.completedItems / selectedProject.totalItems) * 100)
    : 0;

  const renderPunchItemCard = (item: PunchItem) => {
    const StatusIcon = getStatusIcon(item.status);
    
    return (
      <TouchableOpacity key={item.id} style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <TouchableOpacity style={[styles.statusIcon, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
            <StatusIcon size={18} color={getStatusColor(item.status)} />
          </TouchableOpacity>
          <View style={styles.itemInfo}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <View style={styles.itemMeta}>
              <View style={[styles.priorityBadge, { backgroundColor: `${getPriorityColor(item.priority)}15` }]}>
                <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
                  {item.priority.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.categoryText}>{getCategoryLabel(item.category)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.itemDescription} numberOfLines={2}>{item.description}</Text>

        <View style={styles.itemLocation}>
          <MapPin size={14} color={Colors.textSecondary} />
          <Text style={styles.itemLocationText}>{item.location}</Text>
        </View>

        <View style={styles.itemAssignment}>
          <View style={styles.assignedToRow}>
            <Image source={{ uri: item.assignedAvatar }} style={styles.assigneeAvatar} />
            <View>
              <Text style={styles.assignedLabel}>Assigned to</Text>
              <Text style={styles.assigneeName}>{item.assignedTo}</Text>
            </View>
          </View>
          {item.dueDate && item.status !== "completed" && (
            <View style={styles.dueDate}>
              <Calendar size={14} color={Colors.textSecondary} />
              <Text style={styles.dueDateText}>
                Due: {new Date(item.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.itemFooter}>
          <View style={styles.itemActions}>
            {item.photos.length > 0 && (
              <View style={styles.photoCount}>
                <Camera size={14} color={Colors.textSecondary} />
                <Text style={styles.photoCountText}>{item.photos.length}</Text>
              </View>
            )}
            {item.comments > 0 && (
              <View style={styles.commentCount}>
                <MessageCircle size={14} color={Colors.textSecondary} />
                <Text style={styles.commentCountText}>{item.comments}</Text>
              </View>
            )}
          </View>
          <View style={styles.itemButtonRow}>
            {item.status !== "completed" && (
              <>
                <TouchableOpacity style={styles.itemActionBtn}>
                  <Edit3 size={16} color={Colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.completeBtn}>
                  <CheckCircle size={16} color={Colors.white} />
                  <Text style={styles.completeBtnText}>Complete</Text>
                </TouchableOpacity>
              </>
            )}
            {item.status === "completed" && (
              <Text style={styles.completedText}>
                ✓ Completed {new Date(item.completedDate!).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Punch List",
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
                <Text style={styles.projectAddress}>{selectedProject.address}</Text>
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
                    {proj.completedItems}/{proj.totalItems} items complete
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
            <Text style={styles.progressLabel}>Completion Progress</Text>
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
              <Text style={styles.statText}>{stats.inProgress} In Progress</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: Colors.success }]} />
              <Text style={styles.statText}>{stats.completed} Done</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.filterSection}>
        <View style={styles.searchContainer}>
          <Search size={18} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search items..."
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
        {(["all", "pending", "in_progress", "completed", "disputed"] as const).map(status => (
          <TouchableOpacity
            key={status}
            style={[styles.filterChip, filterStatus === status && styles.filterChipActive]}
            onPress={() => setFilterStatus(status)}
          >
            <Text style={[styles.filterChipText, filterStatus === status && styles.filterChipTextActive]}>
              {status === "all" ? "All" : getStatusLabel(status)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredItems.map(item => renderPunchItemCard(item))}

        {filteredItems.length === 0 && (
          <View style={styles.emptyState}>
            <CheckCircle size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyStateTitle}>No Items Found</Text>
            <Text style={styles.emptyStateSubtitle}>
              {filterStatus === "all" ? "Add your first punch list item" : "No items match this filter"}
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
  projectAddress: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
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
  itemCard: {
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
  itemHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  statusIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 6,
  },
  itemMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "700" as const,
  },
  categoryText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  itemDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 10,
  },
  itemLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  itemLocationText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  itemAssignment: {
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
  dueDate: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dueDateText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemActions: {
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
  commentCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  commentCountText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  itemButtonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  itemActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  completeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.success,
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
});
