import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import {
  Edit2,
  DollarSign,
  TrendingUp,
  Percent,
  Clock,
  FileText,
  Plus,
  X,
  ChevronDown,
  Check,
  Users,
  Calendar,
  CheckCircle2,
  Camera,
  RefreshCw,
  Receipt,
  FolderOpen,
  Trash2,
  ImageIcon,
  AlignLeft,
  Save,
  MapPin,
  Home,
  Bed,
  Bath,
  Maximize,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";
import { useProjects } from "@/contexts/ProjectContext";

type TabType = "Overview" | "Financials" | "T&C's";

interface Expense {
  id: string;
  label: string;
  value: number;
}

interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
}

interface ProjectPhoto {
  id: string;
  uri: string;
  caption: string;
  date: string;
  category: string;
}

const expenseTypes = [
  "Materials",
  "Labor",
  "Permits",
  "Utilities",
  "Equipment",
  "Inspection",
  "Design",
  "Contingency",
  "Others",
];

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getProjectById, updateProject } = useProjects();
  const [activeTab, setActiveTab] = useState<TabType>("Overview");
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState("");
  const [selectedExpenseType, setSelectedExpenseType] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");

  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState<"planning" | "in_progress" | "on_hold" | "completed">("planning");
  const [editPurchasePrice, setEditPurchasePrice] = useState("");
  const [editEstimatedARV, setEditEstimatedARV] = useState("");
  const [editRenovationBudget, setEditRenovationBudget] = useState("");
  const [editBedrooms, setEditBedrooms] = useState("");
  const [editBathrooms, setEditBathrooms] = useState("");
  const [editSquareFeet, setEditSquareFeet] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: "1", label: "Materials", value: 35000 },
    { id: "2", label: "Labor", value: 28000 },
    { id: "3", label: "Permits", value: 3500 },
    { id: "4", label: "Utilities", value: 2800 },
    { id: "5", label: "Others", value: 1200 },
  ]);
  const [photos, setPhotos] = useState<ProjectPhoto[]>([
    {
      id: "p1",
      uri: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&q=80",
      caption: "Foundation work completed",
      date: "2024-01-15",
      category: "Foundation",
    },
    {
      id: "p2",
      uri: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80",
      caption: "Framing progress",
      date: "2024-02-01",
      category: "Framing",
    },
    {
      id: "p3",
      uri: "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=400&q=80",
      caption: "Electrical rough-in",
      date: "2024-02-10",
      category: "Electrical",
    },
    {
      id: "p4",
      uri: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80",
      caption: "Kitchen cabinets installed",
      date: "2024-02-20",
      category: "Kitchen",
    },
    {
      id: "p5",
      uri: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&q=80",
      caption: "Bathroom tile work",
      date: "2024-03-01",
      category: "Bathroom",
    },
    {
      id: "p6",
      uri: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&q=80",
      caption: "Exterior paint complete",
      date: "2024-03-10",
      category: "Exterior",
    },
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    { id: "t1", title: "Kitchen demolition", completed: true, dueDate: "2024-01-25" },
    { id: "t2", title: "Bathroom tile installation", completed: true, dueDate: "2024-02-10" },
    { id: "t3", title: "Flooring installation", completed: false, dueDate: "2024-03-05" },
    { id: "t4", title: "Exterior paint", completed: false, dueDate: "2024-03-20" },
    { id: "t5", title: "Landscaping", completed: false, dueDate: "2024-04-10" },
  ]);

  const handleAddExpense = useCallback(() => {
    if (!selectedExpenseType || !expenseAmount) return;

    const amount = parseFloat(expenseAmount.replace(/[^0-9.]/g, ""));
    if (isNaN(amount) || amount <= 0) return;

    const existingIndex = expenses.findIndex((e) => e.label === selectedExpenseType);
    if (existingIndex >= 0) {
      const updated = [...expenses];
      updated[existingIndex] = { ...updated[existingIndex], value: updated[existingIndex].value + amount };
      setExpenses(updated);
    } else {
      setExpenses([
        ...expenses,
        {
          id: Date.now().toString(),
          label: selectedExpenseType,
          value: amount,
        },
      ]);
    }

    setExpenseAmount("");
    setSelectedExpenseType("");
    setShowExpenseModal(false);
  }, [selectedExpenseType, expenseAmount, expenses]);

  const handleTakePhoto = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Camera access is needed to take photos.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const newPhoto: ProjectPhoto = {
          id: `p-${Date.now()}`,
          uri: asset.uri,
          caption: "New photo",
          date: new Date().toISOString().split("T")[0],
          category: "General",
        };
        setPhotos((prev) => [newPhoto, ...prev]);
        console.log("Photo added:", newPhoto.id);
      }
    } catch (error) {
      console.log("Camera error:", error);
      Alert.alert("Error", "Failed to open camera. Please try again.");
    }
  }, []);

  const handleAddTask = useCallback(() => {
    if (!newTaskTitle.trim()) return;

    setTasks([
      ...tasks,
      {
        id: `t-${Date.now()}`,
        title: newTaskTitle.trim(),
        completed: false,
        dueDate: newTaskDueDate || undefined,
      },
    ]);

    setNewTaskTitle("");
    setNewTaskDueDate("");
    setShowTaskModal(false);
  }, [newTaskTitle, newTaskDueDate, tasks]);

  const toggleTask = useCallback(
    (taskId: string) => {
      setTasks(tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)));
    },
    [tasks]
  );

  const deleteTask = useCallback(
    (taskId: string) => {
      Alert.alert("Delete Task", "Are you sure you want to remove this task?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => setTasks(tasks.filter((t) => t.id !== taskId)),
        },
      ]);
    },
    [tasks]
  );

  const project = getProjectById(id || "");
  const teamMembers = project?.team?.length ? project.team : [];

  const statusOptions: { value: "planning" | "in_progress" | "on_hold" | "completed"; label: string }[] = [
    { value: "planning", label: "Planning" },
    { value: "in_progress", label: "In Progress" },
    { value: "on_hold", label: "On Hold" },
    { value: "completed", label: "Completed" },
  ];

  const openEditModal = useCallback(() => {
    if (!project) return;
    setEditName(project.name);
    setEditAddress(project.address);
    setEditDescription(project.description || "");
    setEditStatus(project.status);
    setEditPurchasePrice(project.purchasePrice.toString());
    setEditEstimatedARV(project.estimatedARV.toString());
    setEditRenovationBudget(project.renovationBudget.toString());
    setEditBedrooms(project.bedrooms?.toString() || "");
    setEditBathrooms(project.bathrooms?.toString() || "");
    setEditSquareFeet(project.squareFeet?.toString() || "");
    setEditStartDate(project.startDate);
    setEditEndDate(project.estimatedEndDate || "");
    setShowStatusDropdown(false);
    setShowEditModal(true);
    console.log("Edit modal opened for project:", project.id);
  }, [project]);

  const handleSaveEdit = useCallback(async () => {
    if (!project || !editName.trim()) {
      Alert.alert("Error", "Project name is required.");
      return;
    }
    setIsSaving(true);
    try {
      const updates: Record<string, unknown> = {
        name: editName.trim(),
        address: editAddress.trim(),
        description: editDescription.trim() || undefined,
        status: editStatus,
        purchasePrice: parseFloat(editPurchasePrice) || 0,
        estimatedARV: parseFloat(editEstimatedARV) || 0,
        renovationBudget: parseFloat(editRenovationBudget) || 0,
        startDate: editStartDate,
        estimatedEndDate: editEndDate || undefined,
        bedrooms: editBedrooms ? parseInt(editBedrooms, 10) : undefined,
        bathrooms: editBathrooms ? parseInt(editBathrooms, 10) : undefined,
        squareFeet: editSquareFeet ? parseInt(editSquareFeet, 10) : undefined,
      };

      const arv = parseFloat(editEstimatedARV) || 0;
      const purchase = parseFloat(editPurchasePrice) || 0;
      const budget = parseFloat(editRenovationBudget) || 0;
      updates.estimatedProfit = arv - purchase - budget;

      await updateProject({ id: project.id, updates });
      setShowEditModal(false);
      console.log("Project updated successfully:", project.id);
      Alert.alert("Success", "Project details updated.");
    } catch (error) {
      console.log("Error updating project:", error);
      Alert.alert("Error", "Failed to update project. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [
    project, editName, editAddress, editDescription, editStatus,
    editPurchasePrice, editEstimatedARV, editRenovationBudget,
    editBedrooms, editBathrooms, editSquareFeet,
    editStartDate, editEndDate, updateProject,
  ]);

  if (!project) {
    return (
      <View style={styles.container}>
        <SafeAreaView edges={["top"]} style={styles.safeAreaError}>
          <View style={styles.headerError}>
            <BackButton />
            <Text style={styles.headerTitle}>Project Not Found</Text>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;
  const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const tabs: TabType[] = ["Overview", "Financials", "T&C's"];

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "in_progress":
        return "In Progress";
      case "completed":
        return "Completed";
      case "planning":
        return "Planning";
      case "on_hold":
        return "On Hold";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_progress":
        return "#3B82F6";
      case "completed":
        return "#10B981";
      case "planning":
        return "#272D53";
      case "on_hold":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const timelineEvents = [
    {
      id: "tl1",
      title: "Project Started",
      date: project.startDate,
      status: "completed" as const,
      description: "Initial setup and planning phase",
    },
    {
      id: "tl2",
      title: "Permits Acquired",
      date: project.permits?.[0]?.approvalDate || project.startDate,
      status: (project.permits?.some((p) => p.status === "approved") ? "completed" : "pending") as "completed" | "pending",
      description: `${project.permits?.length || 0} permits processed`,
    },
    {
      id: "tl3",
      title: "Renovation In Progress",
      date: project.startDate,
      status: (project.progressPercentage > 20 ? "completed" : "current") as "completed" | "current",
      description: `${project.progressPercentage}% complete`,
    },
    {
      id: "tl4",
      title: "Final Inspection",
      date: project.estimatedEndDate || "TBD",
      status: (project.progressPercentage >= 90 ? "current" : "upcoming") as "current" | "upcoming",
      description: "Scheduled for completion phase",
    },
    {
      id: "tl5",
      title: "Project Completion",
      date: project.completedDate || project.estimatedEndDate || "TBD",
      status: (project.status === "completed" ? "completed" : "upcoming") as "completed" | "upcoming",
      description: "Final walkthrough and handoff",
    },
  ];

  const renderTimeline = () => (
    <View style={styles.timelineContainer}>
      {timelineEvents.map((event, index) => {
        const isLast = index === timelineEvents.length - 1;
        const isCompleted = event.status === "completed";
        const isCurrent = event.status === "current";

        return (
          <View key={event.id} style={styles.timelineItem}>
            <View style={styles.timelineLeft}>
              <View
                style={[
                  styles.timelineDot,
                  isCompleted && styles.timelineDotCompleted,
                  isCurrent && styles.timelineDotCurrent,
                ]}
              >
                {isCompleted && <Check size={10} color="#FFFFFF" strokeWidth={3} />}
                {isCurrent && <View style={styles.timelineDotInner} />}
              </View>
              {!isLast && (
                <View
                  style={[
                    styles.timelineLine,
                    isCompleted && styles.timelineLineCompleted,
                  ]}
                />
              )}
            </View>
            <View style={[styles.timelineContent, isLast && { paddingBottom: 0 }]}>
              <View style={styles.timelineHeader}>
                <Text
                  style={[
                    styles.timelineTitle,
                    isCompleted && styles.timelineTitleCompleted,
                  ]}
                >
                  {event.title}
                </Text>
                <Text style={styles.timelineDate}>{event.date !== "TBD" ? formatDate(event.date) : "TBD"}</Text>
              </View>
              <Text style={styles.timelineDescription}>{event.description}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );

  const renderTeam = () => (
    <View style={styles.teamSection}>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionHeaderLeft}>
          <Users size={18} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Team Members</Text>
        </View>
        <TouchableOpacity
          style={styles.addSmallButton}
          onPress={() => router.push({ pathname: "/add-team-member", params: { projectId: project.id } })}
        >
          <Plus size={14} color={Colors.white} strokeWidth={2.5} />
          <Text style={styles.addSmallButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {teamMembers.length === 0 ? (
        <View style={styles.emptyTeam}>
          <Users size={36} color={Colors.border} />
          <Text style={styles.emptyTeamText}>No team members yet</Text>
          <TouchableOpacity
            style={styles.addTeamCta}
            onPress={() => router.push({ pathname: "/add-team-member", params: { projectId: project.id } })}
          >
            <Text style={styles.addTeamCtaText}>Add Team Member</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.teamScroll}>
          {teamMembers.map((member) => (
            <TouchableOpacity
              key={member.id}
              style={styles.teamMemberCard}
              onPress={() => router.push(`/professional/${member.professionalId}`)}
              activeOpacity={0.7}
            >
              <Image
                source={{ uri: member.professional?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80" }}
                style={styles.teamAvatar}
                contentFit="cover"
              />
              <Text style={styles.teamName} numberOfLines={1}>
                {member.professional?.name?.split(" ")[0] || "Member"}
              </Text>
              <Text style={styles.teamRole} numberOfLines={1}>
                {member.role}
              </Text>
              <View
                style={[
                  styles.teamStatusBadge,
                  {
                    backgroundColor: member.status === "accepted" ? "#D1FAE5" : "#E8E9EE",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.teamStatusText,
                    {
                      color: member.status === "accepted" ? "#059669" : "#D97706",
                    },
                  ]}
                >
                  {member.status === "accepted" ? "Active" : "Pending"}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.addTeamCard}
            onPress={() => router.push({ pathname: "/add-team-member", params: { projectId: project.id } })}
          >
            <View style={styles.addTeamIconCircle}>
              <Plus size={22} color={Colors.primary} />
            </View>
            <Text style={styles.addTeamCardText}>Add Member</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );

  const renderTasks = () => (
    <View style={styles.tasksSection}>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionHeaderLeft}>
          <CheckCircle2 size={18} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Tasks</Text>
          <View style={styles.taskCountBadge}>
            <Text style={styles.taskCountText}>
              {completedTasks}/{totalTasks}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.addSmallButton} onPress={() => setShowTaskModal(true)}>
          <Plus size={14} color={Colors.white} strokeWidth={2.5} />
          <Text style={styles.addSmallButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.taskProgressContainer}>
        <View style={styles.taskProgressBar}>
          <View style={[styles.taskProgressFill, { width: `${taskProgress}%` }]} />
        </View>
        <Text style={styles.taskProgressText}>{taskProgress}% complete</Text>
      </View>

      <View style={styles.tasksList}>
        {tasks.map((task) => (
          <TouchableOpacity
            key={task.id}
            style={styles.taskItem}
            onPress={() => toggleTask(task.id)}
            onLongPress={() => deleteTask(task.id)}
            activeOpacity={0.7}
          >
            <View style={styles.taskLeft}>
              {task.completed ? (
                <View style={styles.taskCheckboxChecked}>
                  <Check size={12} color="#FFFFFF" strokeWidth={3} />
                </View>
              ) : (
                <View style={styles.taskCheckbox} />
              )}
              <View style={styles.taskInfo}>
                <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>
                  {task.title}
                </Text>
                {task.dueDate && (
                  <View style={styles.taskDueDateRow}>
                    <Calendar size={11} color={Colors.textSecondary} />
                    <Text style={styles.taskDueDate}>{formatDate(task.dueDate)}</Text>
                  </View>
                )}
              </View>
            </View>
            <TouchableOpacity
              style={styles.taskDeleteBtn}
              onPress={() => deleteTask(task.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Trash2 size={14} color={Colors.textTertiary} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderOverview = () => (
    <View style={styles.tabContent}>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          activeOpacity={0.7}
          onPress={() => router.push({ pathname: "/project-progress", params: { projectId: project.id } })}
        >
          <View style={[styles.actionIconCircle, { backgroundColor: "#EEF2FF" }]}>
            <RefreshCw size={16} color="#4F46E5" />
          </View>
          <Text style={styles.actionButtonText}>Update Progress</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          activeOpacity={0.7}
          onPress={() => router.push({ pathname: "/project-documents", params: { projectId: project.id } })}
        >
          <View style={[styles.actionIconCircle, { backgroundColor: "#E8E9EE" }]}>
            <FolderOpen size={16} color="#D97706" />
          </View>
          <Text style={styles.actionButtonText}>View Documents</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} activeOpacity={0.7} onPress={handleTakePhoto}>
          <View style={[styles.actionIconCircle, { backgroundColor: "#D1FAE5" }]}>
            <Camera size={16} color="#059669" />
          </View>
          <Text style={styles.actionButtonText}>Add Photos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          activeOpacity={0.7}
          onPress={() => router.push({ pathname: "/project-expenses", params: { projectId: project.id } })}
        >
          <View style={[styles.actionIconCircle, { backgroundColor: "#FEE2E2" }]}>
            <Receipt size={16} color="#DC2626" />
          </View>
          <Text style={styles.actionButtonText}>Record Expense</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionHeaderLeft}>
          <Clock size={18} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Timeline</Text>
        </View>
      </View>
      {renderTimeline()}

      {renderTeam()}

      {renderTasks()}

      {renderPhotos()}
    </View>
  );

  const renderPhotos = () => (
    <View style={styles.photosSection}>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionHeaderLeft}>
          <ImageIcon size={18} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Photos</Text>
          <View style={styles.taskCountBadge}>
            <Text style={styles.taskCountText}>{photos.length}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.addSmallButton} onPress={handleTakePhoto}>
          <Plus size={14} color={Colors.white} strokeWidth={2.5} />
          <Text style={styles.addSmallButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {photos.length === 0 ? (
        <View style={styles.emptyPhotos}>
          <Camera size={36} color={Colors.border} />
          <Text style={styles.emptyPhotosText}>No photos added yet</Text>
          <TouchableOpacity style={styles.addTeamCta} onPress={handleTakePhoto}>
            <Text style={styles.addTeamCtaText}>Add Photos</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.photosGrid}>
          {photos.map((photo, index) => (
            <TouchableOpacity
              key={photo.id}
              style={[
                styles.photoCard,
                index % 3 === 0 && styles.photoCardLarge,
              ]}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: photo.uri }}
                style={styles.photoImage}
                contentFit="cover"
              />
              <View style={styles.photoOverlay}>
                <Text style={styles.photoCaption} numberOfLines={1}>
                  {photo.caption}
                </Text>
                <View style={styles.photoMeta}>
                  <Text style={styles.photoDate}>{formatDate(photo.date)}</Text>
                  <View style={styles.photoCategoryBadge}>
                    <Text style={styles.photoCategoryText}>{photo.category}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderFinancials = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Budget Overview</Text>
      <View style={styles.budgetCard}>
        <View style={styles.budgetRow}>
          <Text style={styles.budgetLabel}>Total Spent</Text>
          <Text style={styles.budgetValue}>{formatCurrency(project.actualSpent)}</Text>
        </View>
        <View style={styles.budgetRow}>
          <Text style={styles.budgetLabel}>Total Budget</Text>
          <Text style={styles.budgetValue}>{formatCurrency(project.renovationBudget)}</Text>
        </View>
        <View style={styles.budgetRow}>
          <Text style={styles.budgetLabel}>Remaining</Text>
          <Text style={[styles.budgetValue, styles.budgetRemaining]}>
            {formatCurrency(project.renovationBudget - project.actualSpent)}
          </Text>
        </View>
        <View style={styles.budgetProgressContainer}>
          <View style={styles.budgetProgressBar}>
            <View
              style={[
                styles.budgetProgressFill,
                {
                  width: `${Math.min((project.actualSpent / project.renovationBudget) * 100, 100)}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.budgetProgressText}>
            Budget Used: {Math.round((project.actualSpent / project.renovationBudget) * 100)}%
          </Text>
        </View>
      </View>

      <View style={styles.expenseHeaderRow}>
        <Text style={styles.sectionTitle}>Expense Breakdown</Text>
        <TouchableOpacity style={styles.addExpenseButton} onPress={() => setShowExpenseModal(true)}>
          <Plus size={16} color={Colors.white} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
      <View style={styles.expenseList}>
        {expenses.map((expense, index) => (
          <View
            key={expense.id}
            style={[styles.expenseItem, index === expenses.length - 1 && styles.expenseItemLast]}
          >
            <Text style={styles.expenseLabel}>{expense.label}</Text>
            <Text style={styles.expenseValue}>{formatCurrency(expense.value)}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderTerms = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Notes & Compliance Information</Text>
      <View style={styles.notesCard}>
        <View style={styles.noteItem}>
          <FileText size={18} color={Colors.primary} />
          <View style={styles.noteContent}>
            <Text style={styles.noteTitle}>Materials Specifications</Text>
            <Text style={styles.noteDescription}>Document for contractor</Text>
          </View>
        </View>
        <View style={styles.noteItem}>
          <FileText size={18} color={Colors.primary} />
          <View style={styles.noteContent}>
            <Text style={styles.noteTitle}>HOA Requirements</Text>
            <Text style={styles.noteDescription}>Community guidelines</Text>
          </View>
        </View>
      </View>

      {project.contracts && project.contracts.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Contracts</Text>
          <View style={styles.notesCard}>
            {project.contracts.map((contract) => (
              <TouchableOpacity
                key={contract.id}
                style={styles.noteItem}
                onPress={() => router.push(`/contract/${contract.id}`)}
              >
                <FileText size={18} color={Colors.primary} />
                <View style={styles.noteContent}>
                  <Text style={styles.noteTitle}>{contract.title}</Text>
                  <Text style={styles.noteDescription}>
                    {contract.professionalName} - {formatCurrency(contract.amount)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.contractStatusBadge,
                    {
                      backgroundColor:
                        contract.status === "signed"
                          ? "#D1FAE5"
                          : contract.status === "draft"
                          ? "#E8E9EE"
                          : "#DBEAFE",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.contractStatusText,
                      {
                        color:
                          contract.status === "signed"
                            ? "#059669"
                            : contract.status === "draft"
                            ? "#D97706"
                            : "#2563EB",
                      },
                    ]}
                  >
                    {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {project.permits && project.permits.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Permits</Text>
          <View style={styles.notesCard}>
            {project.permits.map((permit) => (
              <View key={permit.id} style={styles.noteItem}>
                <FileText size={18} color={Colors.primary} />
                <View style={styles.noteContent}>
                  <Text style={styles.noteTitle}>{permit.type}</Text>
                  <Text style={styles.noteDescription}>
                    {permit.permitNumber || "Pending"} - {permit.status}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: project.coverImage || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
        }}
        style={styles.coverImage}
        contentFit="cover"
      />

      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.header}>
          <BackButton />
          <View style={styles.headerCenter}>
            <Text style={styles.headerProjectName} numberOfLines={1}>
              {project.name}
            </Text>
            <View style={[styles.headerStatusBadge, { backgroundColor: getStatusColor(project.status) + "30" }]}>
              <View style={[styles.headerStatusDot, { backgroundColor: getStatusColor(project.status) }]} />
              <Text style={[styles.headerStatusText, { color: getStatusColor(project.status) }]}>
                {getStatusLabel(project.status)}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={openEditModal} testID="edit-project-button">
            <Edit2 size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.addressCard}>
          <Text style={styles.fullAddress}>{project.address}</Text>
        </View>

        {project.description ? (
          <View style={styles.descriptionCard}>
            <View style={styles.descriptionHeader}>
              <AlignLeft size={16} color={Colors.primary} />
              <Text style={styles.descriptionLabel}>Project Description</Text>
            </View>
            <Text style={styles.descriptionText}>{project.description}</Text>
          </View>
        ) : null}

        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={styles.metricIcon}>
              <DollarSign size={16} color={Colors.success} />
            </View>
            <Text style={styles.metricLabel}>Purchase Price</Text>
            <Text style={styles.metricValue}>{formatCurrency(project.purchasePrice)}</Text>
          </View>
          <View style={styles.metricCard}>
            <View style={styles.metricIcon}>
              <TrendingUp size={16} color={Colors.primary} />
            </View>
            <Text style={styles.metricLabel}>Estimated ARV</Text>
            <Text style={styles.metricValue}>{formatCurrency(project.estimatedARV)}</Text>
          </View>
          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, styles.metricIconProgress]}>
              <Percent size={16} color={Colors.progressBlue} />
            </View>
            <Text style={styles.metricLabel}>Progress</Text>
            <Text style={[styles.metricValue, styles.metricValueProgress]}>
              {project.progressPercentage}%
            </Text>
          </View>
          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, styles.metricIconProfit]}>
              <DollarSign size={16} color={Colors.success} />
            </View>
            <Text style={styles.metricLabel}>Potential Profit</Text>
            <Text style={[styles.metricValue, styles.metricValueProfit]}>
              {formatCurrency(project.estimatedProfit)}
            </Text>
          </View>
        </View>

        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === "Overview" && renderOverview()}
        {activeTab === "Financials" && renderFinancials()}
        {activeTab === "T&C's" && renderTerms()}

        <View style={{ height: Platform.OS === "ios" ? 100 : 80 }} />
      </ScrollView>

      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => {
              setShowEditModal(false);
              setShowStatusDropdown(false);
            }}
          />
          <View style={[styles.modalContent, styles.editModalContent]}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Project</Text>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowEditModal(false)}>
                <X size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.editScrollView} keyboardShouldPersistTaps="handled">
              <View style={styles.editFieldGroup}>
                <View style={styles.editFieldHeader}>
                  <Home size={14} color={Colors.primary} />
                  <Text style={styles.inputLabel}>Project Name</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Project name"
                  placeholderTextColor={Colors.textSecondary}
                  testID="edit-project-name"
                />
              </View>

              <View style={styles.editFieldGroup}>
                <View style={styles.editFieldHeader}>
                  <MapPin size={14} color={Colors.primary} />
                  <Text style={styles.inputLabel}>Address</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  value={editAddress}
                  onChangeText={setEditAddress}
                  placeholder="Property address"
                  placeholderTextColor={Colors.textSecondary}
                  testID="edit-project-address"
                />
              </View>

              <View style={styles.editFieldGroup}>
                <View style={styles.editFieldHeader}>
                  <AlignLeft size={14} color={Colors.primary} />
                  <Text style={styles.inputLabel}>Description</Text>
                </View>
                <TextInput
                  style={[styles.textInput, styles.editTextArea]}
                  value={editDescription}
                  onChangeText={setEditDescription}
                  placeholder="Project description"
                  placeholderTextColor={Colors.textSecondary}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  testID="edit-project-description"
                />
              </View>

              <View style={styles.editFieldGroup}>
                <Text style={styles.inputLabel}>Status</Text>
                <TouchableOpacity
                  style={styles.typeSelector}
                  onPress={() => setShowStatusDropdown(!showStatusDropdown)}
                >
                  <View style={styles.editStatusRow}>
                    <View style={[styles.editStatusDot, { backgroundColor: getStatusColor(editStatus) }]} />
                    <Text style={styles.typeSelectorText}>{getStatusLabel(editStatus)}</Text>
                  </View>
                  <ChevronDown size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
                {showStatusDropdown && (
                  <View style={styles.typeDropdown}>
                    {statusOptions.map((opt) => (
                      <TouchableOpacity
                        key={opt.value}
                        style={[styles.typeOption, editStatus === opt.value && styles.typeOptionSelected]}
                        onPress={() => {
                          setEditStatus(opt.value);
                          setShowStatusDropdown(false);
                        }}
                      >
                        <View style={styles.editStatusRow}>
                          <View style={[styles.editStatusDot, { backgroundColor: getStatusColor(opt.value) }]} />
                          <Text style={[styles.typeOptionText, editStatus === opt.value && styles.typeOptionTextSelected]}>
                            {opt.label}
                          </Text>
                        </View>
                        {editStatus === opt.value && <Check size={16} color={Colors.primary} />}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.editRowFields}>
                <View style={[styles.editFieldGroup, { flex: 1 }]}>
                  <View style={styles.editFieldHeader}>
                    <DollarSign size={14} color={Colors.success} />
                    <Text style={styles.inputLabel}>Purchase Price</Text>
                  </View>
                  <View style={styles.amountInputWrapper}>
                    <Text style={styles.currencySymbol}>$</Text>
                    <TextInput
                      style={styles.amountInput}
                      value={editPurchasePrice}
                      onChangeText={setEditPurchasePrice}
                      placeholder="0"
                      placeholderTextColor={Colors.textSecondary}
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>
                <View style={[styles.editFieldGroup, { flex: 1 }]}>
                  <View style={styles.editFieldHeader}>
                    <TrendingUp size={14} color={Colors.primary} />
                    <Text style={styles.inputLabel}>Estimated ARV</Text>
                  </View>
                  <View style={styles.amountInputWrapper}>
                    <Text style={styles.currencySymbol}>$</Text>
                    <TextInput
                      style={styles.amountInput}
                      value={editEstimatedARV}
                      onChangeText={setEditEstimatedARV}
                      placeholder="0"
                      placeholderTextColor={Colors.textSecondary}
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>
              </View>

              <View style={styles.editFieldGroup}>
                <View style={styles.editFieldHeader}>
                  <DollarSign size={14} color={Colors.warning} />
                  <Text style={styles.inputLabel}>Renovation Budget</Text>
                </View>
                <View style={styles.amountInputWrapper}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={editRenovationBudget}
                    onChangeText={setEditRenovationBudget}
                    placeholder="0"
                    placeholderTextColor={Colors.textSecondary}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <View style={styles.editRowFields}>
                <View style={[styles.editFieldGroup, { flex: 1 }]}>
                  <View style={styles.editFieldHeader}>
                    <Bed size={14} color={Colors.textSecondary} />
                    <Text style={styles.inputLabel}>Beds</Text>
                  </View>
                  <TextInput
                    style={styles.textInput}
                    value={editBedrooms}
                    onChangeText={setEditBedrooms}
                    placeholder="0"
                    placeholderTextColor={Colors.textSecondary}
                    keyboardType="number-pad"
                  />
                </View>
                <View style={[styles.editFieldGroup, { flex: 1 }]}>
                  <View style={styles.editFieldHeader}>
                    <Bath size={14} color={Colors.textSecondary} />
                    <Text style={styles.inputLabel}>Baths</Text>
                  </View>
                  <TextInput
                    style={styles.textInput}
                    value={editBathrooms}
                    onChangeText={setEditBathrooms}
                    placeholder="0"
                    placeholderTextColor={Colors.textSecondary}
                    keyboardType="number-pad"
                  />
                </View>
                <View style={[styles.editFieldGroup, { flex: 1 }]}>
                  <View style={styles.editFieldHeader}>
                    <Maximize size={14} color={Colors.textSecondary} />
                    <Text style={styles.inputLabel}>Sq Ft</Text>
                  </View>
                  <TextInput
                    style={styles.textInput}
                    value={editSquareFeet}
                    onChangeText={setEditSquareFeet}
                    placeholder="0"
                    placeholderTextColor={Colors.textSecondary}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <View style={styles.editRowFields}>
                <View style={[styles.editFieldGroup, { flex: 1 }]}>
                  <View style={styles.editFieldHeader}>
                    <Calendar size={14} color={Colors.primary} />
                    <Text style={styles.inputLabel}>Start Date</Text>
                  </View>
                  <TextInput
                    style={styles.textInput}
                    value={editStartDate}
                    onChangeText={setEditStartDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={Colors.textSecondary}
                  />
                </View>
                <View style={[styles.editFieldGroup, { flex: 1 }]}>
                  <View style={styles.editFieldHeader}>
                    <Calendar size={14} color={Colors.textSecondary} />
                    <Text style={styles.inputLabel}>End Date</Text>
                  </View>
                  <TextInput
                    style={styles.textInput}
                    value={editEndDate}
                    onChangeText={setEditEndDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={Colors.textSecondary}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, styles.editSaveBtn, isSaving && styles.submitBtnDisabled]}
                onPress={handleSaveEdit}
                disabled={isSaving}
                testID="save-project-edit"
              >
                <Save size={18} color={Colors.white} />
                <Text style={styles.submitBtnText}>{isSaving ? "Saving..." : "Save Changes"}</Text>
              </TouchableOpacity>

              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={showExpenseModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowExpenseModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => {
              setShowExpenseModal(false);
              setShowTypeDropdown(false);
            }}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Expense</Text>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowExpenseModal(false)}>
                <X size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Expense Type</Text>
            <TouchableOpacity
              style={styles.typeSelector}
              onPress={() => setShowTypeDropdown(!showTypeDropdown)}
            >
              <Text
                style={[styles.typeSelectorText, !selectedExpenseType && styles.typeSelectorPlaceholder]}
              >
                {selectedExpenseType || "Select expense type"}
              </Text>
              <ChevronDown size={20} color={Colors.textSecondary} />
            </TouchableOpacity>

            {showTypeDropdown && (
              <View style={styles.typeDropdown}>
                <ScrollView style={styles.typeDropdownScroll} nestedScrollEnabled>
                  {expenseTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[styles.typeOption, selectedExpenseType === type && styles.typeOptionSelected]}
                      onPress={() => {
                        setSelectedExpenseType(type);
                        setShowTypeDropdown(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.typeOptionText,
                          selectedExpenseType === type && styles.typeOptionTextSelected,
                        ]}
                      >
                        {type}
                      </Text>
                      {selectedExpenseType === type && <Check size={16} color={Colors.primary} />}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <Text style={styles.inputLabel}>Amount</Text>
            <View style={styles.amountInputWrapper}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor={Colors.textSecondary}
                keyboardType="decimal-pad"
                value={expenseAmount}
                onChangeText={setExpenseAmount}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.submitBtn,
                (!selectedExpenseType || !expenseAmount) && styles.submitBtnDisabled,
              ]}
              onPress={handleAddExpense}
              disabled={!selectedExpenseType || !expenseAmount}
            >
              <Text style={styles.submitBtnText}>Add Expense</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={showTaskModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTaskModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowTaskModal(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Task</Text>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowTaskModal(false)}>
                <X size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Task Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter task name"
              placeholderTextColor={Colors.textSecondary}
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
            />

            <Text style={styles.inputLabel}>Due Date (optional)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={Colors.textSecondary}
              value={newTaskDueDate}
              onChangeText={setNewTaskDueDate}
            />

            <TouchableOpacity
              style={[styles.submitBtn, !newTaskTitle.trim() && styles.submitBtnDisabled]}
              onPress={handleAddTask}
              disabled={!newTaskTitle.trim()}
            >
              <Text style={styles.submitBtnText}>Add Task</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  coverImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 280,
  },
  safeArea: {
    backgroundColor: "transparent",
  },
  safeAreaError: {
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 12,
  },
  headerProjectName: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.white,
    marginBottom: 4,
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  headerStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 5,
  },
  headerStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  headerStatusText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  headerError: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
    marginTop: 200,
  },
  scrollContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingTop: 20,
  },
  addressCard: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  fullAddress: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  descriptionCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  descriptionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  descriptionLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.primary,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  descriptionText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    width: "47%",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${Colors.success}15`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  metricIconProgress: {
    backgroundColor: `${Colors.progressBlue}15`,
  },
  metricIconProfit: {
    backgroundColor: `${Colors.success}15`,
  },
  metricLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  metricValueProgress: {
    color: Colors.progressBlue,
  },
  metricValueProfit: {
    color: Colors.success,
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 20,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.white,
  },
  tabContent: {
    paddingHorizontal: 20,
  },
  actionButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  actionButton: {
    width: "47%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  actionIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.text,
    flex: 1,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    marginTop: 4,
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  addSmallButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addSmallButtonText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  timelineContainer: {
    marginBottom: 24,
    paddingLeft: 4,
  },
  timelineItem: {
    flexDirection: "row",
  },
  timelineLeft: {
    alignItems: "center",
    width: 28,
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.borderLight,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  timelineDotCompleted: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  timelineDotCurrent: {
    backgroundColor: Colors.white,
    borderColor: Colors.progressBlue,
    borderWidth: 3,
  },
  timelineDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.progressBlue,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.border,
    marginVertical: -2,
  },
  timelineLineCompleted: {
    backgroundColor: Colors.success,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 24,
  },
  timelineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 3,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  timelineTitleCompleted: {
    color: Colors.success,
  },
  timelineDate: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  timelineDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  teamSection: {
    marginBottom: 24,
  },
  emptyTeam: {
    alignItems: "center",
    paddingVertical: 24,
    backgroundColor: Colors.surface,
    borderRadius: 16,
  },
  emptyTeamText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    marginBottom: 12,
  },
  addTeamCta: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addTeamCtaText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  teamScroll: {
    marginHorizontal: -4,
  },
  teamMemberCard: {
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 4,
    width: 110,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  teamAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginBottom: 8,
  },
  teamName: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 2,
    textAlign: "center",
  },
  teamRole: {
    fontSize: 11,
    color: Colors.textSecondary,
    textTransform: "capitalize",
    marginBottom: 6,
    textAlign: "center",
  },
  teamStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  teamStatusText: {
    fontSize: 10,
    fontWeight: "600" as const,
  },
  addTeamCard: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 4,
    width: 110,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: "dashed",
  },
  addTeamIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  addTeamCardText: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: Colors.textSecondary,
  },
  tasksSection: {
    marginBottom: 24,
  },
  photosSection: {
    marginBottom: 20,
  },
  emptyPhotos: {
    alignItems: "center",
    paddingVertical: 24,
    backgroundColor: Colors.surface,
    borderRadius: 16,
  },
  emptyPhotosText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    marginBottom: 12,
  },
  photosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  photoCard: {
    width: "48.5%",
    height: 140,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: Colors.surfaceSecondary,
  },
  photoCardLarge: {
    width: "100%",
    height: 180,
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  photoOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  photoCaption: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#FFFFFF",
    marginBottom: 3,
  },
  photoMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  photoDate: {
    fontSize: 10,
    color: "rgba(255,255,255,0.75)",
  },
  photoCategoryBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  photoCategoryText: {
    fontSize: 10,
    fontWeight: "500" as const,
    color: "#FFFFFF",
  },
  taskCountBadge: {
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  taskCountText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  taskProgressContainer: {
    marginBottom: 14,
  },
  taskProgressBar: {
    height: 6,
    backgroundColor: Colors.borderLight,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 6,
  },
  taskProgressFill: {
    height: "100%",
    backgroundColor: Colors.success,
    borderRadius: 3,
  },
  taskProgressText: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: "right",
  },
  tasksList: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: "hidden",
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  taskLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  taskCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  taskCheckboxChecked: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.success,
    alignItems: "center",
    justifyContent: "center",
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.text,
  },
  taskTitleCompleted: {
    textDecorationLine: "line-through",
    color: Colors.textTertiary,
  },
  taskDueDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },
  taskDueDate: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  taskDeleteBtn: {
    padding: 4,
  },
  budgetCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  budgetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  budgetLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  budgetValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  budgetRemaining: {
    color: Colors.success,
  },
  budgetProgressContainer: {
    marginTop: 12,
  },
  budgetProgressBar: {
    height: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  budgetProgressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  budgetProgressText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "right",
  },
  expenseList: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  expenseHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: 8,
  },
  addExpenseButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  expenseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  expenseItemLast: {
    borderBottomWidth: 0,
  },
  expenseLabel: {
    fontSize: 14,
    color: Colors.text,
  },
  expenseValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  notesCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  noteItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: Colors.text,
  },
  noteDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  contractStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  contractStatusText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeSelectorText: {
    fontSize: 15,
    color: Colors.text,
  },
  typeSelectorPlaceholder: {
    color: Colors.textSecondary,
  },
  typeDropdown: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginTop: -8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  typeDropdownScroll: {
    maxHeight: 200,
  },
  typeOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  typeOptionSelected: {
    backgroundColor: `${Colors.primary}10`,
  },
  typeOptionText: {
    fontSize: 15,
    color: Colors.text,
  },
  typeOptionTextSelected: {
    color: Colors.primary,
    fontWeight: "500" as const,
  },
  amountInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.text,
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "500" as const,
    color: Colors.text,
    paddingVertical: 14,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  submitBtnDisabled: {
    backgroundColor: Colors.border,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  editModalContent: {
    maxHeight: "85%",
  },
  editScrollView: {
    flexGrow: 0,
  },
  editFieldGroup: {
    marginBottom: 16,
  },
  editFieldHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  editTextArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  editRowFields: {
    flexDirection: "row",
    gap: 12,
  },
  editStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  editStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  editSaveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
});
