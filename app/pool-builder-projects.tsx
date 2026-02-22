import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import {
  Search,
  X,
  Plus,
  Droplets,
  Clock,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  ChevronRight,
  MessageCircle,
  Bell,
  FileText,
  AlertCircle,
  Users,
  DollarSign,
  Phone,
  Mail,
  Wrench,
  ClipboardCheck,
  Mountain,
  CloudRain,
  Package,
  Edit3,
  ChevronDown,
  Filter,
  ArrowLeft,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";
import {
  mockPoolProjects,
  mockPoolInvitations,
  poolTypeConfig,
  poolStatusConfig,
  noteCategoryConfig,
  PoolProject,
  PoolProjectInvitation,
  PoolProjectStatus,
  PoolNoteCategory,
} from "@/mocks/pool-builders";

const { width } = Dimensions.get("window");

type TabType = "active" | "invitations" | "completed";

const clientTypeConfig = {
  homeowner: { label: "Homeowner", color: "#3B82F6", bg: "#DBEAFE" },
  builder: { label: "Builder", color: "#22C55E", bg: "#DCFCE7" },
  developer: { label: "Developer", color: "#272D53", bg: "#E8E9EE" },
  commercial: { label: "Commercial", color: "#8B5CF6", bg: "#EDE9FE" },
};

const getNoteIcon = (category: PoolNoteCategory) => {
  switch (category) {
    case "soil_issues": return Mountain;
    case "change_request": return Edit3;
    case "inspection": return ClipboardCheck;
    case "client_communication": return MessageCircle;
    case "weather_delay": return CloudRain;
    case "material_issue": return Package;
    default: return FileText;
  }
};

export default function PoolBuilderProjectsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState<PoolProject | null>(null);
  const [selectedInvitation, setSelectedInvitation] = useState<PoolProjectInvitation | null>(null);
  const [invitations, setInvitations] = useState(mockPoolInvitations);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [newNoteCategory, setNewNoteCategory] = useState<PoolNoteCategory>("general");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [statusFilter, setStatusFilter] = useState<PoolProjectStatus | "all">("all");
  const [showStatusFilter, setShowStatusFilter] = useState(false);

  const activeProjects = mockPoolProjects.filter(p => p.status !== "completed" && p.status !== "on_hold");
  const completedProjects = mockPoolProjects.filter(p => p.status === "completed");
  const pendingInvitations = invitations.filter(i => i.status === "pending");

  const filteredActiveProjects = useMemo(() => {
    let projects = activeProjects;
    if (statusFilter !== "all") {
      projects = projects.filter(p => p.status === statusFilter);
    }
    if (searchQuery) {
      projects = projects.filter(p => 
        p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return projects;
  }, [activeProjects, statusFilter, searchQuery]);

  const handleAcceptInvitation = (invitationId: string) => {
    Alert.alert(
      "Accept Project",
      "Are you sure you want to accept this pool project?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Accept",
          onPress: () => {
            setInvitations(prev =>
              prev.map(i => i.id === invitationId ? { ...i, status: "accepted" as const } : i)
            );
            setSelectedInvitation(null);
            Alert.alert("Success", "Project accepted! It will appear in your active projects.");
          },
        },
      ]
    );
  };

  const handleDeclineInvitation = (invitationId: string) => {
    Alert.alert(
      "Decline Project",
      "Are you sure you want to decline this pool project?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Decline",
          style: "destructive",
          onPress: () => {
            setInvitations(prev =>
              prev.map(i => i.id === invitationId ? { ...i, status: "declined" as const } : i)
            );
            setSelectedInvitation(null);
          },
        },
      ]
    );
  };

  const handleAddNote = () => {
    if (!newNoteContent.trim()) {
      Alert.alert("Error", "Please enter a note");
      return;
    }
    Alert.alert("Success", "Note added successfully!");
    setShowAddNoteModal(false);
    setNewNoteContent("");
    setNewNoteCategory("general");
  };

  const getProgressSteps = (status: PoolProjectStatus) => {
    const currentStep = poolStatusConfig[status]?.step || 0;
    const steps = [
      "Design", "Permits", "Excavation", "Steel/Plumbing", 
      "Shell", "Tile", "Decking", "Equipment", "Finish"
    ];
    return { steps, currentStep };
  };

  const renderActiveTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{activeProjects.length}</Text>
          <Text style={styles.statLabel}>Active Builds</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            ${activeProjects.reduce((sum, p) => sum + parseInt(p.budget.replace(/\D/g, "")), 0).toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>Total Value</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {Math.round(activeProjects.reduce((sum, p) => sum + p.progress, 0) / activeProjects.length || 0)}%
          </Text>
          <Text style={styles.statLabel}>Avg Progress</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.filterButton}
        onPress={() => setShowStatusFilter(!showStatusFilter)}
      >
        <Filter size={16} color={Colors.textSecondary} />
        <Text style={styles.filterText}>
          {statusFilter === "all" ? "All Statuses" : poolStatusConfig[statusFilter]?.label}
        </Text>
        <ChevronDown size={16} color={Colors.textSecondary} />
      </TouchableOpacity>

      {showStatusFilter && (
        <View style={styles.filterDropdown}>
          <TouchableOpacity 
            style={styles.filterOption}
            onPress={() => { setStatusFilter("all"); setShowStatusFilter(false); }}
          >
            <Text style={[styles.filterOptionText, statusFilter === "all" && styles.filterOptionActive]}>
              All Statuses
            </Text>
          </TouchableOpacity>
          {Object.entries(poolStatusConfig).filter(([key]) => key !== "completed" && key !== "on_hold").map(([key, config]) => (
            <TouchableOpacity 
              key={key}
              style={styles.filterOption}
              onPress={() => { setStatusFilter(key as PoolProjectStatus); setShowStatusFilter(false); }}
            >
              <View style={[styles.filterDot, { backgroundColor: config.color }]} />
              <Text style={[styles.filterOptionText, statusFilter === key && styles.filterOptionActive]}>
                {config.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {filteredActiveProjects.map((project) => {
        const typeConfig = poolTypeConfig[project.poolType];
        const statusConfig = poolStatusConfig[project.status];
        const { steps, currentStep } = getProgressSteps(project.status);
        const upcomingInspections = project.inspections.filter(i => i.status === "scheduled" || i.status === "pending").length;

        return (
          <TouchableOpacity
            key={project.id}
            style={styles.projectCard}
            onPress={() => setSelectedProject(project)}
            activeOpacity={0.7}
          >
            <Image source={{ uri: project.coverImage }} style={styles.projectImage} contentFit="cover" />
            <View style={styles.projectContent}>
              <View style={styles.projectHeader}>
                <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                  <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
                </View>
                <View style={[styles.typeBadge, { backgroundColor: typeConfig.bg }]}>
                  <Text style={[styles.typeText, { color: typeConfig.color }]}>{typeConfig.label}</Text>
                </View>
              </View>

              <Text style={styles.projectTitle}>{project.clientName}</Text>
              <View style={styles.addressRow}>
                <MapPin size={12} color={Colors.textSecondary} />
                <Text style={styles.addressText} numberOfLines={1}>{project.address}, {project.city}</Text>
              </View>

              <View style={styles.poolInfoRow}>
                <View style={styles.poolInfoItem}>
                  <Droplets size={14} color="#0EA5E9" />
                  <Text style={styles.poolInfoText}>{project.poolSize}</Text>
                </View>
                <View style={styles.poolInfoItem}>
                  <Text style={styles.poolInfoLabel}>Depth:</Text>
                  <Text style={styles.poolInfoText}>{project.poolDepth}</Text>
                </View>
              </View>

              <View style={styles.budgetRow}>
                <View>
                  <Text style={styles.budgetLabel}>Budget</Text>
                  <Text style={styles.budgetValue}>{project.budget}</Text>
                </View>
                <View>
                  <Text style={styles.budgetLabel}>Spent</Text>
                  <Text style={styles.spentValue}>{project.spent}</Text>
                </View>
                {upcomingInspections > 0 && (
                  <View style={styles.inspectionBadge}>
                    <ClipboardCheck size={14} color="#3B82F6" />
                    <Text style={styles.inspectionBadgeText}>{upcomingInspections}</Text>
                  </View>
                )}
              </View>

              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Progress</Text>
                  <Text style={styles.progressPercent}>{project.progress}%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${project.progress}%` }]} />
                </View>
                <View style={styles.stepsRow}>
                  {steps.slice(0, 5).map((step, idx) => (
                    <View 
                      key={step} 
                      style={[
                        styles.stepDot, 
                        idx < currentStep && styles.stepDotCompleted,
                        idx === currentStep - 1 && styles.stepDotActive,
                      ]} 
                    />
                  ))}
                  <Text style={styles.stepsMore}>+{steps.length - 5}</Text>
                </View>
              </View>

              <View style={styles.projectFooter}>
                <View style={styles.dateRow}>
                  <Calendar size={12} color={Colors.textSecondary} />
                  <Text style={styles.dateText}>Est. {project.estimatedEndDate}</Text>
                </View>
                <View style={styles.crewRow}>
                  <Users size={12} color={Colors.textSecondary} />
                  <Text style={styles.crewText}>{project.crew.length} crew</Text>
                </View>
                <ChevronRight size={18} color={Colors.textTertiary} />
              </View>
            </View>
          </TouchableOpacity>
        );
      })}

      {filteredActiveProjects.length === 0 && (
        <View style={styles.emptyState}>
          <Droplets size={48} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>No Active Projects</Text>
          <Text style={styles.emptySubtitle}>Your pool construction projects will appear here</Text>
        </View>
      )}
      <View style={{ height: 120 }} />
    </ScrollView>
  );

  const renderInvitationsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {pendingInvitations.length > 0 && (
        <View style={styles.urgentBanner}>
          <Bell size={18} color="#0EA5E9" />
          <Text style={styles.urgentText}>
            You have {pendingInvitations.length} new project request{pendingInvitations.length > 1 ? "s" : ""}
          </Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Pool Project Requests</Text>
      <Text style={styles.sectionSubtitle}>New pool builds seeking your expertise</Text>

      {pendingInvitations.map((invitation) => {
        const typeConfig = poolTypeConfig[invitation.poolType];
        const clientConfig = clientTypeConfig[invitation.clientType];

        return (
          <TouchableOpacity
            key={invitation.id}
            style={styles.invitationCard}
            onPress={() => setSelectedInvitation(invitation)}
            activeOpacity={0.7}
          >
            <Image source={{ uri: invitation.projectImage }} style={styles.invitationImage} contentFit="cover" />
            <View style={styles.invitationContent}>
              <View style={styles.invitationHeader}>
                <View style={[styles.clientTypeBadge, { backgroundColor: clientConfig.bg }]}>
                  <Text style={[styles.clientTypeText, { color: clientConfig.color }]}>{clientConfig.label}</Text>
                </View>
                <View style={[styles.poolTypeBadge, { backgroundColor: typeConfig.bg }]}>
                  <Text style={[styles.poolTypeText, { color: typeConfig.color }]}>{typeConfig.label}</Text>
                </View>
              </View>

              <View style={styles.clientRow}>
                <Image source={{ uri: invitation.clientAvatar }} style={styles.clientAvatar} />
                <Text style={styles.clientName}>{invitation.clientName}</Text>
              </View>

              <View style={styles.addressRow}>
                <MapPin size={12} color={Colors.textSecondary} />
                <Text style={styles.addressText} numberOfLines={1}>{invitation.projectAddress}</Text>
              </View>

              <View style={styles.invitationMeta}>
                <View style={styles.metaItem}>
                  <Droplets size={14} color="#0EA5E9" />
                  <Text style={styles.metaText}>{invitation.estimatedSize}</Text>
                </View>
                <Text style={styles.budgetHighlight}>{invitation.estimatedBudget}</Text>
              </View>

              <View style={styles.featuresPreview}>
                {invitation.features.slice(0, 3).map((feature, idx) => (
                  <View key={idx} style={styles.featureChip}>
                    <Text style={styles.featureChipText}>{feature}</Text>
                  </View>
                ))}
                {invitation.features.length > 3 && (
                  <Text style={styles.moreFeatures}>+{invitation.features.length - 3}</Text>
                )}
              </View>

              <View style={styles.invitationFooter}>
                <View style={styles.timelineRow}>
                  <Calendar size={12} color={Colors.textSecondary} />
                  <Text style={styles.timelineText}>Start: {invitation.startDate} • {invitation.timeline}</Text>
                </View>
                <View style={styles.sentRow}>
                  <Clock size={12} color={Colors.textTertiary} />
                  <Text style={styles.sentText}>{invitation.sentAt}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}

      {pendingInvitations.length === 0 && (
        <View style={styles.emptyState}>
          <Mail size={48} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>No Pending Requests</Text>
          <Text style={styles.emptySubtitle}>New pool project requests will appear here</Text>
        </View>
      )}
      <View style={{ height: 120 }} />
    </ScrollView>
  );

  const renderCompletedTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.completedBanner}>
        <CheckCircle size={20} color="#22C55E" />
        <View style={styles.completedBannerText}>
          <Text style={styles.completedBannerTitle}>Great Work!</Text>
          <Text style={styles.completedBannerSubtitle}>{completedProjects.length} pools completed</Text>
        </View>
      </View>

      {completedProjects.map((project) => {
        const typeConfig = poolTypeConfig[project.poolType];

        return (
          <TouchableOpacity
            key={project.id}
            style={styles.completedCard}
            onPress={() => setSelectedProject(project)}
            activeOpacity={0.7}
          >
            <Image source={{ uri: project.coverImage }} style={styles.completedImage} />
            <View style={styles.completedContent}>
              <Text style={styles.completedTitle}>{project.clientName}</Text>
              <Text style={styles.completedAddress}>{project.address}</Text>
              <View style={styles.completedMeta}>
                <View style={[styles.typeBadgeSmall, { backgroundColor: typeConfig.bg }]}>
                  <Text style={[styles.typeBadgeSmallText, { color: typeConfig.color }]}>{typeConfig.label}</Text>
                </View>
                <Text style={styles.completedBudget}>{project.budget}</Text>
              </View>
            </View>
            <View style={styles.completedBadge}>
              <CheckCircle size={20} color="#22C55E" />
            </View>
          </TouchableOpacity>
        );
      })}

      {completedProjects.length === 0 && (
        <View style={styles.emptyState}>
          <CheckCircle size={48} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>No Completed Projects</Text>
          <Text style={styles.emptySubtitle}>Finished pools will appear here</Text>
        </View>
      )}
      <View style={{ height: 120 }} />
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.header}>
          <BackButton />
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Pool Projects</Text>
            <Text style={styles.headerSubtitle}>Manage your pool builds</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.addButton}>
              <Plus size={20} color={Colors.white} />
            </TouchableOpacity>
            <View style={styles.headerBadge}>
              <Droplets size={20} color="#FFF" />
            </View>
          </View>
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchInputWrapper}>
            <Search size={18} color={Colors.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search projects..."
              placeholderTextColor={Colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View style={styles.tabBar}>
          {[
            { id: "active" as const, label: "Active", icon: Wrench, badge: activeProjects.length },
            { id: "invitations" as const, label: "Requests", icon: Bell, badge: pendingInvitations.length },
            { id: "completed" as const, label: "Completed", icon: CheckCircle },
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                onPress={() => setActiveTab(tab.id)}
              >
                <View style={styles.tabIconContainer}>
                  <TabIcon size={18} color={isActive ? "#0EA5E9" : Colors.textSecondary} />
                  {tab.badge && tab.badge > 0 && (
                    <View style={styles.tabBadge}>
                      <Text style={styles.tabBadgeText}>{tab.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {activeTab === "active" && renderActiveTab()}
        {activeTab === "invitations" && renderInvitationsTab()}
        {activeTab === "completed" && renderCompletedTab()}
      </SafeAreaView>

      <Modal
        visible={!!selectedProject}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedProject(null)}
      >
        {selectedProject && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedProject(null)}>
                <X size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Project Details</Text>
              <TouchableOpacity onPress={() => setShowAddNoteModal(true)}>
                <Plus size={24} color="#0EA5E9" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Image source={{ uri: selectedProject.coverImage }} style={styles.modalImage} contentFit="cover" />

              <View style={styles.modalBody}>
                <View style={styles.modalBadges}>
                  <View style={[styles.statusBadge, { backgroundColor: poolStatusConfig[selectedProject.status].bg }]}>
                    <Text style={[styles.statusText, { color: poolStatusConfig[selectedProject.status].color }]}>
                      {poolStatusConfig[selectedProject.status].label}
                    </Text>
                  </View>
                  <View style={[styles.typeBadge, { backgroundColor: poolTypeConfig[selectedProject.poolType].bg }]}>
                    <Text style={[styles.typeText, { color: poolTypeConfig[selectedProject.poolType].color }]}>
                      {poolTypeConfig[selectedProject.poolType].label}
                    </Text>
                  </View>
                </View>

                <Text style={styles.modalProjectTitle}>{selectedProject.clientName}</Text>
                <View style={styles.modalAddressRow}>
                  <MapPin size={14} color={Colors.textSecondary} />
                  <Text style={styles.modalAddress}>{selectedProject.address}, {selectedProject.city}, {selectedProject.state}</Text>
                </View>

                <View style={styles.clientCard}>
                  <Image source={{ uri: selectedProject.clientAvatar }} style={styles.modalClientAvatar} />
                  <View style={styles.clientInfo}>
                    <Text style={styles.clientCardName}>{selectedProject.clientName}</Text>
                    <Text style={styles.clientCardEmail}>{selectedProject.clientEmail}</Text>
                  </View>
                  <View style={styles.clientActions}>
                    <TouchableOpacity style={styles.clientActionBtn}>
                      <Phone size={16} color="#0EA5E9" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.clientActionBtn}>
                      <MessageCircle size={16} color="#0EA5E9" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Pool Size</Text>
                    <Text style={styles.infoValue}>{selectedProject.poolSize}</Text>
                  </View>
                  <View style={styles.infoDivider} />
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Depth</Text>
                    <Text style={styles.infoValue}>{selectedProject.poolDepth}</Text>
                  </View>
                  <View style={styles.infoDivider} />
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Budget</Text>
                    <Text style={[styles.infoValue, { color: "#0EA5E9" }]}>{selectedProject.budget}</Text>
                  </View>
                  <View style={styles.infoDivider} />
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Spent</Text>
                    <Text style={styles.infoValue}>{selectedProject.spent}</Text>
                  </View>
                  <View style={styles.infoDivider} />
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Start Date</Text>
                    <Text style={styles.infoValue}>{selectedProject.startDate}</Text>
                  </View>
                  <View style={styles.infoDivider} />
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Est. Completion</Text>
                    <Text style={styles.infoValue}>{selectedProject.estimatedEndDate}</Text>
                  </View>
                </View>

                <Text style={styles.sectionHeader}>Features</Text>
                <View style={styles.featuresGrid}>
                  {selectedProject.features.map((feature, idx) => (
                    <View key={idx} style={styles.featureItem}>
                      <CheckCircle size={14} color="#22C55E" />
                      <Text style={styles.featureItemText}>{feature}</Text>
                    </View>
                  ))}
                </View>

                <Text style={styles.sectionHeader}>Milestones</Text>
                {selectedProject.milestones.map((milestone) => (
                  <View key={milestone.id} style={styles.milestoneItem}>
                    <View style={[
                      styles.milestoneCheckbox,
                      milestone.status === "completed" && styles.milestoneCompleted,
                      milestone.status === "in_progress" && styles.milestoneInProgress,
                    ]}>
                      {milestone.status === "completed" && <CheckCircle size={16} color="#FFF" />}
                      {milestone.status === "in_progress" && <Clock size={16} color="#FFF" />}
                    </View>
                    <View style={styles.milestoneInfo}>
                      <Text style={[
                        styles.milestoneName,
                        milestone.status === "completed" && styles.milestoneNameCompleted,
                      ]}>
                        {milestone.name}
                      </Text>
                      <Text style={styles.milestoneDate}>
                        {milestone.completedDate ? `Completed: ${milestone.completedDate}` : `Target: ${milestone.targetDate}`}
                      </Text>
                    </View>
                  </View>
                ))}

                <Text style={styles.sectionHeader}>Inspections</Text>
                {selectedProject.inspections.map((inspection) => (
                  <View key={inspection.id} style={styles.inspectionItem}>
                    <View style={styles.inspectionInfo}>
                      <Text style={styles.inspectionType}>{inspection.type}</Text>
                      <Text style={styles.inspectionDate}>{inspection.date}</Text>
                    </View>
                    <View style={[
                      styles.inspectionStatus,
                      { backgroundColor: inspection.status === "passed" ? "#DCFCE7" : inspection.status === "failed" ? "#FEE2E2" : inspection.status === "scheduled" ? "#DBEAFE" : "#F3F4F6" }
                    ]}>
                      <Text style={[
                        styles.inspectionStatusText,
                        { color: inspection.status === "passed" ? "#22C55E" : inspection.status === "failed" ? "#EF4444" : inspection.status === "scheduled" ? "#3B82F6" : "#6B7280" }
                      ]}>
                        {inspection.status.charAt(0).toUpperCase() + inspection.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                ))}

                <Text style={styles.sectionHeader}>Project Notes</Text>
                {selectedProject.notes.map((note) => {
                  const NoteIcon = getNoteIcon(note.category);
                  const noteConfig = noteCategoryConfig[note.category];
                  return (
                    <View key={note.id} style={[styles.noteItem, note.isImportant && styles.noteImportant]}>
                      <View style={[styles.noteIconContainer, { backgroundColor: `${noteConfig.color}20` }]}>
                        <NoteIcon size={16} color={noteConfig.color} />
                      </View>
                      <View style={styles.noteContent}>
                        <View style={styles.noteHeader}>
                          <Text style={[styles.noteCategory, { color: noteConfig.color }]}>{noteConfig.label}</Text>
                          {note.isImportant && (
                            <AlertCircle size={14} color="#EF4444" />
                          )}
                        </View>
                        <Text style={styles.noteText}>{note.content}</Text>
                        <Text style={styles.noteMeta}>{note.createdBy} • {note.createdAt}</Text>
                      </View>
                    </View>
                  );
                })}

                <Text style={styles.sectionHeader}>Crew ({selectedProject.crew.length})</Text>
                {selectedProject.crew.map((member) => (
                  <View key={member.id} style={styles.crewMemberCard}>
                    <Image source={{ uri: member.avatar }} style={styles.crewMemberAvatar} />
                    <View style={styles.crewMemberInfo}>
                      <Text style={styles.crewMemberName}>{member.name}</Text>
                      <Text style={styles.crewMemberRole}>{member.role}</Text>
                    </View>
                    <TouchableOpacity style={styles.crewCallBtn}>
                      <Phone size={16} color="#0EA5E9" />
                    </TouchableOpacity>
                  </View>
                ))}

                <Text style={styles.sectionHeader}>Permits</Text>
                {selectedProject.permits.map((permit) => (
                  <View key={permit.id} style={styles.permitItem}>
                    <View style={styles.permitInfo}>
                      <Text style={styles.permitType}>{permit.type}</Text>
                      {permit.number && <Text style={styles.permitNumber}>#{permit.number}</Text>}
                    </View>
                    <View style={[
                      styles.permitStatus,
                      { backgroundColor: permit.status === "approved" ? "#DCFCE7" : permit.status === "rejected" ? "#FEE2E2" : "#E8E9EE" }
                    ]}>
                      <Text style={[
                        styles.permitStatusText,
                        { color: permit.status === "approved" ? "#22C55E" : permit.status === "rejected" ? "#EF4444" : "#272D53" }
                      ]}>
                        {permit.status.charAt(0).toUpperCase() + permit.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                ))}

                <View style={{ height: 40 }} />
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>

      <Modal
        visible={!!selectedInvitation}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedInvitation(null)}
      >
        {selectedInvitation && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedInvitation(null)}>
                <X size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Project Request</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.modalContent}>
              <Image source={{ uri: selectedInvitation.projectImage }} style={styles.modalImage} contentFit="cover" />

              <View style={styles.modalBody}>
                <View style={styles.modalBadges}>
                  <View style={[styles.clientTypeBadge, { backgroundColor: clientTypeConfig[selectedInvitation.clientType].bg }]}>
                    <Text style={[styles.clientTypeText, { color: clientTypeConfig[selectedInvitation.clientType].color }]}>
                      {clientTypeConfig[selectedInvitation.clientType].label}
                    </Text>
                  </View>
                  <View style={[styles.poolTypeBadge, { backgroundColor: poolTypeConfig[selectedInvitation.poolType].bg }]}>
                    <Text style={[styles.poolTypeText, { color: poolTypeConfig[selectedInvitation.poolType].color }]}>
                      {poolTypeConfig[selectedInvitation.poolType].label}
                    </Text>
                  </View>
                </View>

                <View style={styles.clientCard}>
                  <Image source={{ uri: selectedInvitation.clientAvatar }} style={styles.modalClientAvatar} />
                  <View style={styles.clientInfo}>
                    <Text style={styles.clientCardName}>{selectedInvitation.clientName}</Text>
                    <Text style={styles.clientCardType}>{clientTypeConfig[selectedInvitation.clientType].label}</Text>
                  </View>
                  <TouchableOpacity style={[styles.messageBtn, { backgroundColor: "#0EA5E9" }]}>
                    <MessageCircle size={18} color="#FFF" />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalAddressRow}>
                  <MapPin size={14} color={Colors.textSecondary} />
                  <Text style={styles.modalAddress}>{selectedInvitation.projectAddress}</Text>
                </View>

                <View style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Pool Size</Text>
                    <Text style={styles.infoValue}>{selectedInvitation.estimatedSize}</Text>
                  </View>
                  <View style={styles.infoDivider} />
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Budget Range</Text>
                    <Text style={[styles.infoValue, { color: "#0EA5E9" }]}>{selectedInvitation.estimatedBudget}</Text>
                  </View>
                  <View style={styles.infoDivider} />
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Timeline</Text>
                    <Text style={styles.infoValue}>{selectedInvitation.timeline}</Text>
                  </View>
                  <View style={styles.infoDivider} />
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Start Date</Text>
                    <Text style={styles.infoValue}>{selectedInvitation.startDate}</Text>
                  </View>
                </View>

                <Text style={styles.sectionHeader}>Requested Features</Text>
                <View style={styles.featuresGrid}>
                  {selectedInvitation.features.map((feature, idx) => (
                    <View key={idx} style={styles.featureItem}>
                      <CheckCircle size={14} color="#0EA5E9" />
                      <Text style={styles.featureItemText}>{feature}</Text>
                    </View>
                  ))}
                </View>

                {selectedInvitation.notes && (
                  <>
                    <Text style={styles.sectionHeader}>Client Notes</Text>
                    <View style={styles.clientNotesCard}>
                      <Text style={styles.clientNotesText}>{selectedInvitation.notes}</Text>
                    </View>
                  </>
                )}

                <View style={styles.expiryWarning}>
                  <AlertCircle size={16} color="#272D53" />
                  <Text style={styles.expiryText}>Expires: {selectedInvitation.expiresAt}</Text>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.declineBtn}
                    onPress={() => handleDeclineInvitation(selectedInvitation.id)}
                  >
                    <XCircle size={18} color="#EF4444" />
                    <Text style={styles.declineBtnText}>Decline</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.acceptBtn}
                    onPress={() => handleAcceptInvitation(selectedInvitation.id)}
                  >
                    <CheckCircle size={18} color="#FFF" />
                    <Text style={styles.acceptBtnText}>Accept Project</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>

      <Modal
        visible={showAddNoteModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddNoteModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddNoteModal(false)}>
              <X size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Note</Text>
            <TouchableOpacity onPress={handleAddNote}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.addNoteContent}>
            <Text style={styles.inputLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {Object.entries(noteCategoryConfig).map(([key, config]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.categoryChip,
                    newNoteCategory === key && { backgroundColor: config.color },
                  ]}
                  onPress={() => setNewNoteCategory(key as PoolNoteCategory)}
                >
                  <Text style={[
                    styles.categoryChipText,
                    newNoteCategory === key && { color: "#FFF" },
                  ]}>
                    {config.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.inputLabel}>Note</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="Enter your note..."
              placeholderTextColor={Colors.textTertiary}
              value={newNoteContent}
              onChangeText={setNewNoteContent}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>
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
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#0EA5E9",
    alignItems: "center",
    justifyContent: "center",
  },
  headerBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#0EA5E9",
    justifyContent: "center",
    alignItems: "center",
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: Colors.text,
  },
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabButtonActive: {
    borderBottomColor: "#0EA5E9",
  },
  tabIconContainer: {
    position: "relative",
  },
  tabBadge: {
    position: "absolute",
    top: -6,
    right: -10,
    backgroundColor: "#EF4444",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: "#FFF",
  },
  tabText: {
    fontSize: 11,
    fontWeight: "500" as const,
    marginTop: 4,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: "#0EA5E9",
  },
  tabContent: {
    flex: 1,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginBottom: 8,
  },
  filterText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  filterDropdown: {
    marginHorizontal: 20,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  filterDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  filterOptionText: {
    fontSize: 14,
    color: Colors.text,
  },
  filterOptionActive: {
    color: "#0EA5E9",
    fontWeight: "600" as const,
  },
  projectCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  projectImage: {
    width: "100%",
    height: 140,
  },
  projectContent: {
    padding: 14,
  },
  projectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 11,
    fontWeight: "500" as const,
  },
  projectTitle: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 10,
  },
  addressText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  poolInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 12,
  },
  poolInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  poolInfoLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  poolInfoText: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: "500" as const,
  },
  budgetRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 20,
  },
  budgetLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  budgetValue: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: "#0EA5E9",
  },
  spentValue: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  inspectionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: "auto",
  },
  inspectionBadgeText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#1D4ED8",
  },
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#0EA5E9",
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#0EA5E9",
    borderRadius: 3,
  },
  stepsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  stepDotCompleted: {
    backgroundColor: "#22C55E",
  },
  stepDotActive: {
    backgroundColor: "#0EA5E9",
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  stepsMore: {
    fontSize: 10,
    color: Colors.textTertiary,
    marginLeft: 4,
  },
  projectFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  crewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  crewText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  urgentBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#E0F2FE",
  },
  urgentText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "#0369A1",
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.text,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  invitationCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  invitationImage: {
    width: "100%",
    height: 140,
  },
  invitationContent: {
    padding: 14,
  },
  invitationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  clientTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  clientTypeText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  poolTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  poolTypeText: {
    fontSize: 11,
    fontWeight: "500" as const,
  },
  clientRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  clientAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  clientName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  invitationMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: "500" as const,
  },
  budgetHighlight: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#0EA5E9",
  },
  featuresPreview: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  featureChip: {
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  featureChipText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  moreFeatures: {
    fontSize: 12,
    color: Colors.textTertiary,
    alignSelf: "center",
  },
  invitationFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timelineText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  sentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sentText: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  completedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#ECFDF5",
  },
  completedBannerText: {
    flex: 1,
  },
  completedBannerTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#22C55E",
  },
  completedBannerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  completedCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 12,
    padding: 12,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  completedImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
  },
  completedContent: {
    flex: 1,
    marginLeft: 12,
  },
  completedTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  completedAddress: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  completedMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 6,
  },
  typeBadgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeSmallText: {
    fontSize: 10,
    fontWeight: "500" as const,
  },
  completedBudget: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#0EA5E9",
  },
  completedBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
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
  },
  modalImage: {
    width: "100%",
    height: 200,
  },
  modalBody: {
    padding: 20,
  },
  modalBadges: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  modalProjectTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 6,
  },
  modalAddressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  modalAddress: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  clientCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 16,
  },
  modalClientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  clientInfo: {
    flex: 1,
    marginLeft: 12,
  },
  clientCardName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  clientCardEmail: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  clientCardType: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  clientActions: {
    flexDirection: "row",
    gap: 8,
  },
  clientActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
    justifyContent: "center",
  },
  messageBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 20,
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  infoDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  sectionHeader: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: Colors.text,
    marginTop: 8,
    marginBottom: 12,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  featureItemText: {
    fontSize: 13,
    color: Colors.text,
  },
  milestoneItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 8,
  },
  milestoneCheckbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  milestoneCompleted: {
    backgroundColor: "#22C55E",
    borderColor: "#22C55E",
  },
  milestoneInProgress: {
    backgroundColor: "#0EA5E9",
    borderColor: "#0EA5E9",
  },
  milestoneInfo: {
    flex: 1,
    marginLeft: 12,
  },
  milestoneName: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.text,
  },
  milestoneNameCompleted: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  milestoneDate: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  inspectionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 8,
  },
  inspectionInfo: {
    flex: 1,
  },
  inspectionType: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.text,
  },
  inspectionDate: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  inspectionStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  inspectionStatusText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  noteItem: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 8,
  },
  noteImportant: {
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF2F2",
  },
  noteIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  noteContent: {
    flex: 1,
    marginLeft: 12,
  },
  noteHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  noteCategory: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  noteText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 6,
  },
  noteMeta: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  crewMemberCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 8,
  },
  crewMemberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  crewMemberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  crewMemberName: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.text,
  },
  crewMemberRole: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  crewCallBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
    justifyContent: "center",
  },
  permitItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 8,
  },
  permitInfo: {
    flex: 1,
  },
  permitType: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.text,
  },
  permitNumber: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  permitStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  permitStatusText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  clientNotesCard: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  clientNotesText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  expiryWarning: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#E8E9EE",
    marginBottom: 20,
  },
  expiryText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "#92400E",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  declineBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  declineBtnText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#EF4444",
  },
  acceptBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#0EA5E9",
  },
  acceptBtnText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FFF",
  },
  addNoteContent: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 10,
  },
  categoryScroll: {
    marginBottom: 20,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSecondary,
    marginRight: 10,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.text,
  },
  noteInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
    minHeight: 150,
  },
});
