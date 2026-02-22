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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Stack } from "expo-router";
import {
  Search,
  X,
  Trees,
  Clock,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  ChevronRight,
  MessageCircle,
  Briefcase,
  Bell,
  Sparkles,
  FileText,
  Package,
  AlertCircle,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import {
  mockFlipInvitations,
  mockLandscapeProjects,
  FlipProjectInvitation,
  LandscapeProject,
} from "@/mocks/landscaping";

type TabType = "invitations" | "active" | "completed" | "bids";

const clientTypeConfig = {
  investor: { label: "Investor", color: "#8B5CF6", bg: "#EDE9FE" },
  homeowner: { label: "Homeowner", color: "#3B82F6", bg: "#DBEAFE" },
  contractor: { label: "Contractor", color: "#272D53", bg: "#E8E9EE" },
  realtor: { label: "Realtor", color: "#EC4899", bg: "#FCE7F3" },
};

const statusConfig = {
  pending: { label: "Pending", color: "#272D53", bg: "#E8E9EE" },
  accepted: { label: "Accepted", color: "#22C55E", bg: "#DCFCE7" },
  declined: { label: "Declined", color: "#EF4444", bg: "#FEE2E2" },
  expired: { label: "Expired", color: "#6B7280", bg: "#F3F4F6" },
  invited: { label: "Invited", color: "#8B5CF6", bg: "#EDE9FE" },
  bidding: { label: "Bidding", color: "#272D53", bg: "#E8E9EE" },
  awarded: { label: "Awarded", color: "#22C55E", bg: "#DCFCE7" },
  in_progress: { label: "In Progress", color: "#3B82F6", bg: "#DBEAFE" },
  completed: { label: "Completed", color: "#10B981", bg: "#ECFDF5" },
};

export default function LandscapeProjectsScreen() {
  const { theme, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>("invitations");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvitation, setSelectedInvitation] = useState<FlipProjectInvitation | null>(null);
  const [selectedProject, setSelectedProject] = useState<LandscapeProject | null>(null);
  const [invitations, setInvitations] = useState(mockFlipInvitations);

  const dynamicStyles = useMemo(() => ({
    container: { backgroundColor: theme.background },
    header: { backgroundColor: theme.surface, borderBottomColor: theme.border },
    headerTitle: { color: theme.text },
    searchInput: { backgroundColor: theme.surfaceSecondary, color: theme.text },
    tabBar: { backgroundColor: theme.surface, borderBottomColor: theme.border },
    tabText: { color: theme.textSecondary },
    tabTextActive: { color: "#22C55E" },
    card: { backgroundColor: theme.surface },
    cardTitle: { color: theme.text },
    cardSubtitle: { color: theme.textSecondary },
    sectionTitle: { color: theme.text },
    modalContainer: { backgroundColor: theme.background },
    modalHeader: { backgroundColor: theme.surface, borderBottomColor: theme.border },
  }), [theme]);

  const pendingInvitations = invitations.filter(i => i.status === "pending");
  const activeProjects = mockLandscapeProjects.filter(p => p.status === "in_progress" || p.status === "awarded");
  const completedProjects = mockLandscapeProjects.filter(p => p.status === "completed");

  const handleAcceptInvitation = (invitationId: string) => {
    Alert.alert(
      "Accept Invitation",
      "Are you sure you want to accept this project invitation?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Accept",
          onPress: () => {
            setInvitations(prev =>
              prev.map(i => i.id === invitationId ? { ...i, status: "accepted" as const } : i)
            );
            setSelectedInvitation(null);
            Alert.alert("Success", "You've accepted the project invitation. The client will be notified.");
          },
        },
      ]
    );
  };

  const handleDeclineInvitation = (invitationId: string) => {
    Alert.alert(
      "Decline Invitation",
      "Are you sure you want to decline this project invitation?",
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

  const getTaskProgress = (tasks: LandscapeProject["tasks"]) => {
    const completed = tasks.filter(t => t.completed).length;
    return { completed, total: tasks.length, percentage: (completed / tasks.length) * 100 };
  };

  const renderInvitationsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {pendingInvitations.length > 0 && (
        <View style={[styles.urgentBanner, { backgroundColor: isDark ? "#7C2D12" : "#E8E9EE" }]}>
          <Bell size={18} color="#272D53" />
          <Text style={[styles.urgentText, { color: isDark ? "#FCD34D" : "#92400E" }]}>
            You have {pendingInvitations.length} pending invitation{pendingInvitations.length > 1 ? "s" : ""} to review
          </Text>
        </View>
      )}

      <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Project Invitations</Text>
      <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
        Flip & remodel projects seeking landscaping services
      </Text>

      {invitations.filter(i => i.status === "pending").map((invitation) => {
        const clientConfig = clientTypeConfig[invitation.clientType];
        return (
          <TouchableOpacity
            key={invitation.id}
            style={[styles.invitationCard, dynamicStyles.card]}
            onPress={() => setSelectedInvitation(invitation)}
            activeOpacity={0.7}
          >
            <Image source={{ uri: invitation.projectImage }} style={styles.invitationImage} contentFit="cover" />
            <View style={styles.invitationContent}>
              <View style={styles.invitationHeader}>
                <View style={[styles.clientTypeBadge, { backgroundColor: clientConfig.bg }]}>
                  <Text style={[styles.clientTypeText, { color: clientConfig.color }]}>{clientConfig.label}</Text>
                </View>
                <View style={[styles.phaseBadge, { backgroundColor: isDark ? "#064E3B" : "#ECFDF5" }]}>
                  <Text style={[styles.phaseText, { color: "#10B981" }]}>{invitation.projectPhase.replace("_", " ")}</Text>
                </View>
              </View>

              <Text style={[styles.invitationTitle, dynamicStyles.cardTitle]}>{invitation.projectName}</Text>
              <View style={styles.addressRow}>
                <MapPin size={12} color={theme.textSecondary} />
                <Text style={[styles.addressText, dynamicStyles.cardSubtitle]} numberOfLines={1}>
                  {invitation.projectAddress}
                </Text>
              </View>

              <View style={styles.invitationMeta}>
                <View style={styles.clientInfo}>
                  <Image source={{ uri: invitation.clientAvatar }} style={styles.clientAvatar} />
                  <Text style={[styles.clientName, { color: theme.textSecondary }]}>{invitation.clientName}</Text>
                </View>
                <Text style={[styles.budgetText, { color: "#22C55E" }]}>{invitation.estimatedBudget}</Text>
              </View>

              <View style={styles.scopePreview}>
                {invitation.scope.slice(0, 2).map((item, idx) => (
                  <View key={idx} style={[styles.scopeChip, { backgroundColor: theme.surfaceSecondary }]}>
                    <Text style={[styles.scopeChipText, { color: theme.textSecondary }]}>{item}</Text>
                  </View>
                ))}
                {invitation.scope.length > 2 && (
                  <Text style={[styles.moreScope, { color: theme.textTertiary }]}>+{invitation.scope.length - 2} more</Text>
                )}
              </View>

              <View style={styles.invitationFooter}>
                <View style={styles.timelineRow}>
                  <Calendar size={12} color={theme.textSecondary} />
                  <Text style={[styles.timelineText, { color: theme.textSecondary }]}>
                    Start: {invitation.startDate} • {invitation.timeline}
                  </Text>
                </View>
                <View style={styles.sentRow}>
                  <Clock size={12} color={theme.textTertiary} />
                  <Text style={[styles.sentText, { color: theme.textTertiary }]}>{invitation.sentAt}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}

      {invitations.filter(i => i.status !== "pending").length > 0 && (
        <>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle, { marginTop: 24 }]}>Past Invitations</Text>
          {invitations.filter(i => i.status !== "pending").map((invitation) => {
            const status = statusConfig[invitation.status];
            return (
              <TouchableOpacity
                key={invitation.id}
                style={[styles.pastInvitationCard, dynamicStyles.card]}
                activeOpacity={0.7}
              >
                <Image source={{ uri: invitation.projectImage }} style={styles.pastInvitationImage} />
                <View style={styles.pastInvitationContent}>
                  <Text style={[styles.pastInvitationTitle, dynamicStyles.cardTitle]} numberOfLines={1}>
                    {invitation.projectName}
                  </Text>
                  <Text style={[styles.pastInvitationClient, dynamicStyles.cardSubtitle]}>
                    {invitation.clientName}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                  <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </>
      )}
      <View style={{ height: 120 }} />
    </ScrollView>
  );

  const renderActiveTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={[styles.statsRow, { borderBottomColor: theme.border }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.text }]}>{activeProjects.length}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Active</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.text }]}>
            ${activeProjects.reduce((sum, p) => sum + parseInt(p.budget.replace(/\D/g, "")), 0).toLocaleString()}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Value</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.text }]}>
            {Math.round(activeProjects.reduce((sum, p) => sum + p.progress, 0) / activeProjects.length || 0)}%
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Avg Progress</Text>
        </View>
      </View>

      {activeProjects.map((project) => {
        const progress = getTaskProgress(project.tasks);
        const status = statusConfig[project.status];
        const pendingMaterials = project.materials.filter(m => !m.ordered).length;

        return (
          <TouchableOpacity
            key={project.id}
            style={[styles.projectCard, dynamicStyles.card]}
            onPress={() => setSelectedProject(project)}
            activeOpacity={0.7}
          >
            <Image source={{ uri: project.image }} style={styles.projectImage} contentFit="cover" />
            <View style={styles.projectContent}>
              <View style={styles.projectHeader}>
                <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                  <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                </View>
                {pendingMaterials > 0 && (
                  <View style={styles.materialAlert}>
                    <Package size={12} color="#272D53" />
                    <Text style={styles.materialAlertText}>{pendingMaterials} to order</Text>
                  </View>
                )}
              </View>

              <Text style={[styles.projectTitle, dynamicStyles.cardTitle]}>{project.name}</Text>
              <View style={styles.addressRow}>
                <MapPin size={12} color={theme.textSecondary} />
                <Text style={[styles.addressText, dynamicStyles.cardSubtitle]} numberOfLines={1}>
                  {project.address}
                </Text>
              </View>

              <View style={styles.projectClientRow}>
                <Image source={{ uri: project.client.avatar }} style={styles.projectClientAvatar} />
                <View>
                  <Text style={[styles.projectClientName, { color: theme.text }]}>{project.client.name}</Text>
                  <Text style={[styles.projectClientType, { color: theme.textTertiary }]}>{project.client.type}</Text>
                </View>
                <Text style={[styles.projectBudget, { color: "#22C55E" }]}>{project.budget}</Text>
              </View>

              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>
                    Tasks: {progress.completed}/{progress.total}
                  </Text>
                  <Text style={[styles.progressPercent, { color: "#22C55E" }]}>
                    {Math.round(progress.percentage)}%
                  </Text>
                </View>
                <View style={[styles.progressBar, { backgroundColor: theme.surfaceSecondary }]}>
                  <View style={[styles.progressFill, { width: `${progress.percentage}%`, backgroundColor: "#22C55E" }]} />
                </View>
              </View>

              <View style={styles.projectFooter}>
                <View style={styles.dateRow}>
                  <Calendar size={12} color={theme.textSecondary} />
                  <Text style={[styles.dateText, { color: theme.textSecondary }]}>
                    {project.startDate} - {project.endDate}
                  </Text>
                </View>
                <ChevronRight size={18} color={theme.textTertiary} />
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
      <View style={{ height: 120 }} />
    </ScrollView>
  );

  const renderCompletedTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={[styles.completedBanner, { backgroundColor: isDark ? "#064E3B" : "#ECFDF5" }]}>
        <CheckCircle size={20} color="#10B981" />
        <View style={styles.completedBannerText}>
          <Text style={[styles.completedBannerTitle, { color: "#10B981" }]}>Great Work!</Text>
          <Text style={[styles.completedBannerSubtitle, { color: theme.textSecondary }]}>
            {completedProjects.length} projects completed this season
          </Text>
        </View>
      </View>

      {completedProjects.length === 0 ? (
        <View style={[styles.emptyState, dynamicStyles.card]}>
          <Trees size={48} color={theme.textTertiary} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No Completed Projects Yet</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Your completed landscape projects will appear here
          </Text>
        </View>
      ) : (
        completedProjects.map((project) => (
          <TouchableOpacity
            key={project.id}
            style={[styles.completedCard, dynamicStyles.card]}
            activeOpacity={0.7}
          >
            <Image source={{ uri: project.image }} style={styles.completedImage} />
            <View style={styles.completedContent}>
              <Text style={[styles.completedTitle, dynamicStyles.cardTitle]}>{project.name}</Text>
              <Text style={[styles.completedClient, dynamicStyles.cardSubtitle]}>{project.client.name}</Text>
              <Text style={[styles.completedBudget, { color: "#22C55E" }]}>{project.budget}</Text>
            </View>
            <View style={styles.completedBadge}>
              <CheckCircle size={16} color="#10B981" />
            </View>
          </TouchableOpacity>
        ))
      )}
      <View style={{ height: 120 }} />
    </ScrollView>
  );

  const renderBidsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={[styles.bidsBanner, { backgroundColor: isDark ? "#312E81" : "#EEF2FF" }]}>
        <Sparkles size={20} color="#6366F1" />
        <View style={styles.bidsBannerText}>
          <Text style={[styles.bidsBannerTitle, { color: "#6366F1" }]}>Open Opportunities</Text>
          <Text style={[styles.bidsBannerSubtitle, { color: theme.textSecondary }]}>
            Browse and bid on landscape projects in your area
          </Text>
        </View>
      </View>

      <View style={[styles.emptyState, dynamicStyles.card]}>
        <FileText size={48} color={theme.textTertiary} />
        <Text style={[styles.emptyTitle, { color: theme.text }]}>No Open Bids</Text>
        <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
          Check back for new landscape opportunities to bid on
        </Text>
      </View>
      <View style={{ height: 120 }} />
    </ScrollView>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "invitations":
        return renderInvitationsTab();
      case "active":
        return renderActiveTab();
      case "completed":
        return renderCompletedTab();
      case "bids":
        return renderBidsTab();
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={[styles.header, dynamicStyles.header]}>
          <View>
            <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>Landscape Projects</Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              Flip invitations & active jobs
            </Text>
          </View>
          <View style={[styles.headerBadge, { backgroundColor: "#22C55E" }]}>
            <Trees size={20} color="#FFF" />
          </View>
        </View>

        <View style={[styles.searchSection, { backgroundColor: theme.surface }]}>
          <View style={[styles.searchInputWrapper, dynamicStyles.searchInput]}>
            <Search size={18} color={theme.textTertiary} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Search projects..."
              placeholderTextColor={theme.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View style={[styles.tabBar, dynamicStyles.tabBar]}>
          {[
            { id: "invitations" as const, label: "Invitations", icon: Bell, badge: pendingInvitations.length },
            { id: "active" as const, label: "Active", icon: Briefcase },
            { id: "completed" as const, label: "Completed", icon: CheckCircle },
            { id: "bids" as const, label: "Bids", icon: FileText },
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
                  <TabIcon size={18} color={isActive ? "#22C55E" : theme.textSecondary} />
                  {tab.badge && tab.badge > 0 && (
                    <View style={styles.tabBadge}>
                      <Text style={styles.tabBadgeText}>{tab.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.tabText, dynamicStyles.tabText, isActive && dynamicStyles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {renderTabContent()}
      </SafeAreaView>

      <Modal
        visible={!!selectedInvitation}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedInvitation(null)}
      >
        {selectedInvitation && (
          <SafeAreaView style={[styles.modalContainer, dynamicStyles.modalContainer]}>
            <View style={[styles.modalHeader, dynamicStyles.modalHeader]}>
              <TouchableOpacity onPress={() => setSelectedInvitation(null)}>
                <X size={24} color={theme.textSecondary} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Project Invitation</Text>
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
                  <View style={[styles.phaseBadge, { backgroundColor: isDark ? "#064E3B" : "#ECFDF5" }]}>
                    <Text style={[styles.phaseText, { color: "#10B981" }]}>
                      {selectedInvitation.projectPhase.replace("_", " ")}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.modalProjectTitle, { color: theme.text }]}>{selectedInvitation.projectName}</Text>
                <View style={styles.modalAddressRow}>
                  <MapPin size={14} color={theme.textSecondary} />
                  <Text style={[styles.modalAddress, { color: theme.textSecondary }]}>{selectedInvitation.projectAddress}</Text>
                </View>

                <View style={[styles.modalClientCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <Image source={{ uri: selectedInvitation.clientAvatar }} style={styles.modalClientAvatar} />
                  <View style={styles.modalClientInfo}>
                    <Text style={[styles.modalClientName, { color: theme.text }]}>{selectedInvitation.clientName}</Text>
                    <Text style={[styles.modalClientType, { color: theme.textSecondary }]}>
                      {clientTypeConfig[selectedInvitation.clientType].label}
                    </Text>
                  </View>
                  <TouchableOpacity style={[styles.messageBtn, { backgroundColor: "#22C55E" }]}>
                    <MessageCircle size={18} color="#FFF" />
                  </TouchableOpacity>
                </View>

                <View style={[styles.modalInfoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <View style={styles.modalInfoRow}>
                    <Text style={[styles.modalInfoLabel, { color: theme.textSecondary }]}>Budget</Text>
                    <Text style={[styles.modalInfoValue, { color: "#22C55E" }]}>{selectedInvitation.estimatedBudget}</Text>
                  </View>
                  <View style={[styles.modalDivider, { backgroundColor: theme.borderLight }]} />
                  <View style={styles.modalInfoRow}>
                    <Text style={[styles.modalInfoLabel, { color: theme.textSecondary }]}>Timeline</Text>
                    <Text style={[styles.modalInfoValue, { color: theme.text }]}>{selectedInvitation.timeline}</Text>
                  </View>
                  <View style={[styles.modalDivider, { backgroundColor: theme.borderLight }]} />
                  <View style={styles.modalInfoRow}>
                    <Text style={[styles.modalInfoLabel, { color: theme.textSecondary }]}>Start Date</Text>
                    <Text style={[styles.modalInfoValue, { color: theme.text }]}>{selectedInvitation.startDate}</Text>
                  </View>
                </View>

                <Text style={[styles.scopeTitle, { color: theme.text }]}>Scope of Work</Text>
                <View style={styles.scopeList}>
                  {selectedInvitation.scope.map((item, idx) => (
                    <View key={idx} style={[styles.scopeItem, { backgroundColor: theme.surfaceSecondary }]}>
                      <CheckCircle size={14} color="#22C55E" />
                      <Text style={[styles.scopeItemText, { color: theme.text }]}>{item}</Text>
                    </View>
                  ))}
                </View>

                {selectedInvitation.notes && (
                  <>
                    <Text style={[styles.notesTitle, { color: theme.text }]}>Notes from Client</Text>
                    <View style={[styles.notesCard, { backgroundColor: theme.surfaceSecondary }]}>
                      <Text style={[styles.notesText, { color: theme.textSecondary }]}>{selectedInvitation.notes}</Text>
                    </View>
                  </>
                )}

                <View style={[styles.expiryWarning, { backgroundColor: isDark ? "#7C2D12" : "#E8E9EE" }]}>
                  <AlertCircle size={16} color="#272D53" />
                  <Text style={[styles.expiryText, { color: isDark ? "#FCD34D" : "#92400E" }]}>
                    Expires: {selectedInvitation.expiresAt}
                  </Text>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.declineBtn, { borderColor: theme.border }]}
                    onPress={() => handleDeclineInvitation(selectedInvitation.id)}
                  >
                    <XCircle size={18} color="#EF4444" />
                    <Text style={[styles.declineBtnText, { color: "#EF4444" }]}>Decline</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.acceptBtn}
                    onPress={() => handleAcceptInvitation(selectedInvitation.id)}
                  >
                    <CheckCircle size={18} color="#FFF" />
                    <Text style={styles.acceptBtnText}>Accept Invitation</Text>
                  </TouchableOpacity>
                </View>
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
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700" as const,
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  headerBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
  },
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabButtonActive: {
    borderBottomColor: "#22C55E",
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
  },
  tabContent: {
    flex: 1,
  },
  urgentBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
  },
  urgentText: {
    fontSize: 13,
    fontWeight: "500" as const,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  invitationCard: {
    marginHorizontal: 20,
    marginBottom: 16,
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
  phaseBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  phaseText: {
    fontSize: 11,
    fontWeight: "500" as const,
    textTransform: "capitalize" as const,
  },
  invitationTitle: {
    fontSize: 17,
    fontWeight: "600" as const,
    marginBottom: 4,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 12,
  },
  addressText: {
    fontSize: 13,
    flex: 1,
  },
  invitationMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  clientInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  clientAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  clientName: {
    fontSize: 13,
    fontWeight: "500" as const,
  },
  budgetText: {
    fontSize: 15,
    fontWeight: "700" as const,
  },
  scopePreview: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  scopeChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  scopeChipText: {
    fontSize: 12,
  },
  moreScope: {
    fontSize: 12,
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
  },
  sentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sentText: {
    fontSize: 11,
  },
  pastInvitationCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 12,
    borderRadius: 14,
  },
  pastInvitationImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  pastInvitationContent: {
    flex: 1,
    marginLeft: 12,
  },
  pastInvitationTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  pastInvitationClient: {
    fontSize: 12,
    marginTop: 2,
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
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    marginHorizontal: 20,
    borderBottomWidth: 1,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700" as const,
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
  },
  projectCard: {
    marginHorizontal: 20,
    marginTop: 16,
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
    height: 120,
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
  materialAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E8E9EE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  materialAlertText: {
    fontSize: 11,
    fontWeight: "500" as const,
    color: "#92400E",
  },
  projectTitle: {
    fontSize: 17,
    fontWeight: "600" as const,
    marginBottom: 4,
  },
  projectClientRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  projectClientAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  projectClientName: {
    fontSize: 13,
    fontWeight: "500" as const,
    marginLeft: 10,
  },
  projectClientType: {
    fontSize: 11,
    marginLeft: 10,
  },
  projectBudget: {
    fontSize: 15,
    fontWeight: "700" as const,
    marginLeft: "auto",
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
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  projectFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateText: {
    fontSize: 12,
  },
  completedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 14,
  },
  completedBannerText: {
    flex: 1,
  },
  completedBannerTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  completedBannerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "600" as const,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  completedCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
  },
  completedImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  completedContent: {
    flex: 1,
    marginLeft: 12,
  },
  completedTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  completedClient: {
    fontSize: 12,
    marginTop: 2,
  },
  completedBudget: {
    fontSize: 14,
    fontWeight: "600" as const,
    marginTop: 4,
  },
  completedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ECFDF5",
    justifyContent: "center",
    alignItems: "center",
  },
  bidsBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 14,
  },
  bidsBannerText: {
    flex: 1,
  },
  bidsBannerTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  bidsBannerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "600" as const,
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
    marginBottom: 6,
  },
  modalAddressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 20,
  },
  modalAddress: {
    fontSize: 14,
  },
  modalClientCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  modalClientAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  modalClientInfo: {
    flex: 1,
    marginLeft: 12,
  },
  modalClientName: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  modalClientType: {
    fontSize: 13,
    marginTop: 2,
  },
  messageBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  modalInfoCard: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
    overflow: "hidden",
  },
  modalInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },
  modalInfoLabel: {
    fontSize: 14,
  },
  modalInfoValue: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  modalDivider: {
    height: 1,
  },
  scopeTitle: {
    fontSize: 17,
    fontWeight: "600" as const,
    marginBottom: 12,
  },
  scopeList: {
    gap: 8,
    marginBottom: 20,
  },
  scopeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 10,
  },
  scopeItemText: {
    fontSize: 14,
    flex: 1,
  },
  notesTitle: {
    fontSize: 17,
    fontWeight: "600" as const,
    marginBottom: 12,
  },
  notesCard: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  expiryWarning: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  expiryText: {
    fontSize: 13,
    fontWeight: "500" as const,
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
  },
  declineBtnText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  acceptBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#22C55E",
  },
  acceptBtnText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FFF",
  },
});
