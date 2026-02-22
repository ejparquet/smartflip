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
  HardHat,
  Clock,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  ChevronRight,
  MessageCircle,
  Bell,
  Sparkles,
  FileText,
  Package,
  AlertCircle,
  Users,
  Hammer,
  ClipboardCheck,
  Plus,
  DollarSign,
  FileCheck,
  Copy,
  Pencil,
  Save,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import {
  mockContractorInvitations,
  mockContractorProjects,
  ContractorProjectInvitation,
  ContractorProject,
} from "@/mocks/contractors";

type TabType = "invitations" | "active" | "completed" | "bids";

const clientTypeConfig = {
  investor: { label: "Investor", color: "#8B5CF6", bg: "#EDE9FE" },
  homeowner: { label: "Homeowner", color: "#3B82F6", bg: "#DBEAFE" },
  realtor: { label: "Realtor", color: "#EC4899", bg: "#FCE7F3" },
  developer: { label: "Developer", color: "#272D53", bg: "#E8E9EE" },
};

const projectTypeConfig = {
  renovation: { label: "Renovation", color: "#272D53", bg: "#E8E9EE" },
  addition: { label: "Addition", color: "#22C55E", bg: "#DCFCE7" },
  new_construction: { label: "New Build", color: "#3B82F6", bg: "#DBEAFE" },
  remodel: { label: "Remodel", color: "#8B5CF6", bg: "#EDE9FE" },
  commercial: { label: "Commercial", color: "#78716C", bg: "#F5F5F4" },
};

const statusConfig = {
  pending: { label: "Pending", color: "#272D53", bg: "#E8E9EE" },
  accepted: { label: "Accepted", color: "#22C55E", bg: "#DCFCE7" },
  declined: { label: "Declined", color: "#EF4444", bg: "#FEE2E2" },
  expired: { label: "Expired", color: "#6B7280", bg: "#F3F4F6" },
  awarded: { label: "Awarded", color: "#22C55E", bg: "#DCFCE7" },
  in_progress: { label: "In Progress", color: "#3B82F6", bg: "#DBEAFE" },
  completed: { label: "Completed", color: "#10B981", bg: "#ECFDF5" },
  on_hold: { label: "On Hold", color: "#272D53", bg: "#E8E9EE" },
};

const permitStatusConfig = {
  not_started: { label: "Not Started", color: "#6B7280" },
  in_progress: { label: "In Progress", color: "#272D53" },
  approved: { label: "Approved", color: "#22C55E" },
};

interface BidOpportunity {
  id: string;
  projectName: string;
  projectAddress: string;
  projectImage: string;
  clientName: string;
  clientType: "investor" | "homeowner" | "realtor" | "developer";
  projectType: "renovation" | "addition" | "new_construction" | "remodel" | "commercial";
  estimatedBudget: string;
  scope: string[];
  timeline: string;
  bidDeadline: string;
  bidCount: number;
  sqft?: number;
}

interface BidTemplate {
  id: string;
  name: string;
  description: string;
  laborRate: number;
  materialMarkup: number;
  contingency: number;
  paymentTerms: string;
}

const mockBidOpportunities: BidOpportunity[] = [
  {
    id: "bo1",
    projectName: "Full Kitchen Renovation",
    projectAddress: "234 Commonwealth Ave, Boston, MA",
    projectImage: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",
    clientName: "Jennifer Walsh",
    clientType: "homeowner",
    projectType: "renovation",
    estimatedBudget: "$45,000 - $60,000",
    scope: ["Demo existing kitchen", "New cabinets", "Countertops", "Electrical updates", "Plumbing updates", "Flooring"],
    timeline: "6-8 weeks",
    bidDeadline: "Feb 5, 2026",
    bidCount: 4,
    sqft: 280,
  },
  {
    id: "bo2",
    projectName: "Basement Finishing",
    projectAddress: "567 Beacon St, Brookline, MA",
    projectImage: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
    clientName: "Marcus Thompson",
    clientType: "investor",
    projectType: "remodel",
    estimatedBudget: "$35,000 - $45,000",
    scope: ["Framing", "Drywall", "Bathroom addition", "Electrical", "HVAC extension", "Flooring"],
    timeline: "4-6 weeks",
    bidDeadline: "Feb 8, 2026",
    bidCount: 6,
    sqft: 800,
  },
  {
    id: "bo3",
    projectName: "Office Build-Out",
    projectAddress: "100 Federal St, Boston, MA",
    projectImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
    clientName: "TechStart Inc.",
    clientType: "developer",
    projectType: "commercial",
    estimatedBudget: "$120,000 - $150,000",
    scope: ["Partition walls", "Conference rooms", "Break room", "Electrical/data", "HVAC", "Flooring"],
    timeline: "8-10 weeks",
    bidDeadline: "Feb 15, 2026",
    bidCount: 3,
    sqft: 3200,
  },
];

const mockBidTemplates: BidTemplate[] = [
  {
    id: "bt1",
    name: "Standard Renovation",
    description: "General renovation projects with standard materials",
    laborRate: 65,
    materialMarkup: 15,
    contingency: 10,
    paymentTerms: "30% deposit, 40% midpoint, 30% completion",
  },
  {
    id: "bt2",
    name: "Premium Finish",
    description: "High-end renovations with premium materials",
    laborRate: 85,
    materialMarkup: 20,
    contingency: 12,
    paymentTerms: "25% deposit, 25% framing, 25% finishes, 25% completion",
  },
  {
    id: "bt3",
    name: "Commercial Build-Out",
    description: "Commercial and office space projects",
    laborRate: 75,
    materialMarkup: 18,
    contingency: 15,
    paymentTerms: "20% deposit, progress payments monthly",
  },
];

export default function ContractorProjectsScreen() {
  const { theme, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>("invitations");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvitation, setSelectedInvitation] = useState<ContractorProjectInvitation | null>(null);
  const [selectedProject, setSelectedProject] = useState<ContractorProject | null>(null);
  const [invitations, setInvitations] = useState(mockContractorInvitations);
  const [selectedBidOpportunity, setSelectedBidOpportunity] = useState<BidOpportunity | null>(null);
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<BidTemplate | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [bidNotes, setBidNotes] = useState("");
  const [submittedBids, setSubmittedBids] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState<ContractorProject | null>(null);
  const [projects, setProjects] = useState(mockContractorProjects);

  const dynamicStyles = useMemo(() => ({
    container: { backgroundColor: theme.background },
    header: { backgroundColor: theme.surface, borderBottomColor: theme.border },
    headerTitle: { color: theme.text },
    searchInput: { backgroundColor: theme.surfaceSecondary, color: theme.text },
    tabBar: { backgroundColor: theme.surface, borderBottomColor: theme.border },
    tabText: { color: theme.textSecondary },
    tabTextActive: { color: "#272D53" },
    card: { backgroundColor: theme.surface },
    cardTitle: { color: theme.text },
    cardSubtitle: { color: theme.textSecondary },
    sectionTitle: { color: theme.text },
    modalContainer: { backgroundColor: theme.background },
    modalHeader: { backgroundColor: theme.surface, borderBottomColor: theme.border },
  }), [theme]);

  const pendingInvitations = invitations.filter(i => i.status === "pending");
  const activeProjects = projects.filter(p => p.status === "in_progress" || p.status === "awarded");
  const completedProjects = projects.filter(p => p.status === "completed");

  const handleSaveProject = () => {
    if (!editedProject || !selectedProject) return;
    setProjects(prev =>
      prev.map(p => p.id === editedProject.id ? editedProject : p)
    );
    setSelectedProject(editedProject);
    setIsEditing(false);
    setEditedProject(null);
    Alert.alert("Saved", "Project details have been updated.");
  };

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

  const getTaskProgress = (tasks: ContractorProject["tasks"]) => {
    const completed = tasks.filter(t => t.completed).length;
    return { completed, total: tasks.length, percentage: (completed / tasks.length) * 100 };
  };

  const renderInvitationsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {pendingInvitations.length > 0 && (
        <View style={[styles.urgentBanner, { backgroundColor: isDark ? "#78350F" : "#E8E9EE" }]}>
          <Bell size={18} color="#272D53" />
          <Text style={[styles.urgentText, { color: isDark ? "#FCD34D" : "#92400E" }]}>
            You have {pendingInvitations.length} pending invitation{pendingInvitations.length > 1 ? "s" : ""} to review
          </Text>
        </View>
      )}

      <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Project Invitations</Text>
      <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
        Flip, remodel & construction projects seeking contractors
      </Text>

      {invitations.filter(i => i.status === "pending").map((invitation) => {
        const clientConfig = clientTypeConfig[invitation.clientType];
        const projectConfig = projectTypeConfig[invitation.projectType];
        const permitConfig = invitation.permitStatus ? permitStatusConfig[invitation.permitStatus] : null;
        
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
                <View style={[styles.projectTypeBadge, { backgroundColor: projectConfig.bg }]}>
                  <Text style={[styles.projectTypeText, { color: projectConfig.color }]}>{projectConfig.label}</Text>
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
                <Text style={[styles.budgetText, { color: "#272D53" }]}>{invitation.estimatedBudget}</Text>
              </View>

              <View style={styles.projectMetaRow}>
                {invitation.sqft && (
                  <View style={[styles.metaChip, { backgroundColor: theme.surfaceSecondary }]}>
                    <Text style={[styles.metaChipText, { color: theme.textSecondary }]}>{invitation.sqft.toLocaleString()} sqft</Text>
                  </View>
                )}
                {permitConfig && (
                  <View style={[styles.metaChip, { backgroundColor: theme.surfaceSecondary }]}>
                    <Text style={[styles.metaChipText, { color: permitConfig.color }]}>Permits: {permitConfig.label}</Text>
                  </View>
                )}
              </View>

              <View style={styles.scopePreview}>
                {invitation.scope.slice(0, 3).map((item, idx) => (
                  <View key={idx} style={[styles.scopeChip, { backgroundColor: theme.surfaceSecondary }]}>
                    <Text style={[styles.scopeChipText, { color: theme.textSecondary }]}>{item}</Text>
                  </View>
                ))}
                {invitation.scope.length > 3 && (
                  <Text style={[styles.moreScope, { color: theme.textTertiary }]}>+{invitation.scope.length - 3} more</Text>
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
        const upcomingInspections = project.inspections.filter(i => i.status === "scheduled").length;

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
                <View style={styles.alertsRow}>
                  {pendingMaterials > 0 && (
                    <View style={styles.materialAlert}>
                      <Package size={12} color="#272D53" />
                      <Text style={styles.materialAlertText}>{pendingMaterials}</Text>
                    </View>
                  )}
                  {upcomingInspections > 0 && (
                    <View style={[styles.inspectionAlert, { backgroundColor: "#DBEAFE" }]}>
                      <ClipboardCheck size={12} color="#3B82F6" />
                      <Text style={[styles.inspectionAlertText, { color: "#1D4ED8" }]}>{upcomingInspections}</Text>
                    </View>
                  )}
                </View>
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
                <View style={styles.budgetInfo}>
                  <Text style={[styles.projectBudget, { color: "#272D53" }]}>{project.budget}</Text>
                  <Text style={[styles.spentText, { color: theme.textTertiary }]}>Spent: {project.spent}</Text>
                </View>
              </View>

              <View style={styles.crewRow}>
                <Users size={14} color={theme.textSecondary} />
                <Text style={[styles.crewText, { color: theme.textSecondary }]}>
                  {project.crew.length} crew member{project.crew.length !== 1 ? "s" : ""}
                </Text>
                <View style={styles.crewAvatars}>
                  {project.crew.slice(0, 3).map((member, idx) => (
                    <Image
                      key={member.id}
                      source={{ uri: member.avatar }}
                      style={[styles.crewAvatar, { marginLeft: idx > 0 ? -8 : 0 }]}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>
                    Tasks: {progress.completed}/{progress.total}
                  </Text>
                  <Text style={[styles.progressPercent, { color: "#272D53" }]}>
                    {Math.round(progress.percentage)}%
                  </Text>
                </View>
                <View style={[styles.progressBar, { backgroundColor: theme.surfaceSecondary }]}>
                  <View style={[styles.progressFill, { width: `${progress.percentage}%`, backgroundColor: "#272D53" }]} />
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
          <Text style={[styles.completedBannerTitle, { color: "#10B981" }]}>Excellent Work!</Text>
          <Text style={[styles.completedBannerSubtitle, { color: theme.textSecondary }]}>
            {completedProjects.length} projects completed this year
          </Text>
        </View>
      </View>

      {completedProjects.length === 0 ? (
        <View style={[styles.emptyState, dynamicStyles.card]}>
          <HardHat size={48} color={theme.textTertiary} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No Completed Projects Yet</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Your completed construction projects will appear here
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
              <Text style={[styles.completedBudget, { color: "#272D53" }]}>{project.budget}</Text>
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

  const handleCreateBid = (opportunity: BidOpportunity) => {
    setSelectedBidOpportunity(opportunity);
    setSelectedTemplate(null);
    setBidAmount("");
    setBidNotes("");
    setShowBidModal(true);
  };

  const handleSelectTemplate = (template: BidTemplate) => {
    setSelectedTemplate(template);
    const baseBudget = parseInt(selectedBidOpportunity?.estimatedBudget.replace(/\D/g, "").slice(0, 5) || "40000");
    const estimatedBid = Math.round(baseBudget * (1 + template.contingency / 100));
    setBidAmount(estimatedBid.toString());
  };

  const handleSubmitBid = () => {
    if (!selectedBidOpportunity || !bidAmount) {
      Alert.alert("Error", "Please enter a bid amount");
      return;
    }
    Alert.alert(
      "Submit Bid",
      `Submit bid of ${parseInt(bidAmount).toLocaleString()} for ${selectedBidOpportunity.projectName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Submit",
          onPress: () => {
            setSubmittedBids(prev => [...prev, selectedBidOpportunity.id]);
            setShowBidModal(false);
            setSelectedBidOpportunity(null);
            Alert.alert("Success", "Your bid has been submitted successfully!");
          },
        },
      ]
    );
  };

  const renderBidsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={[styles.bidsBanner, { backgroundColor: isDark ? "#78350F" : "#E8E9EE" }]}>
        <Sparkles size={20} color="#272D53" />
        <View style={styles.bidsBannerText}>
          <Text style={[styles.bidsBannerTitle, { color: "#272D53" }]}>Open Opportunities</Text>
          <Text style={[styles.bidsBannerSubtitle, { color: theme.textSecondary }]}>
            {mockBidOpportunities.length} projects seeking bids in your area
          </Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Available Projects</Text>

      {mockBidOpportunities.map((opportunity) => {
        const clientConfig = clientTypeConfig[opportunity.clientType];
        const projectConfig = projectTypeConfig[opportunity.projectType];
        const hasBid = submittedBids.includes(opportunity.id);

        return (
          <TouchableOpacity
            key={opportunity.id}
            style={[styles.bidOpportunityCard, dynamicStyles.card]}
            onPress={() => !hasBid && handleCreateBid(opportunity)}
            activeOpacity={hasBid ? 1 : 0.7}
          >
            <Image source={{ uri: opportunity.projectImage }} style={styles.bidOpportunityImage} contentFit="cover" />
            <View style={styles.bidOpportunityContent}>
              <View style={styles.bidOpportunityHeader}>
                <View style={[styles.clientTypeBadge, { backgroundColor: clientConfig.bg }]}>
                  <Text style={[styles.clientTypeText, { color: clientConfig.color }]}>{clientConfig.label}</Text>
                </View>
                <View style={[styles.projectTypeBadge, { backgroundColor: projectConfig.bg }]}>
                  <Text style={[styles.projectTypeText, { color: projectConfig.color }]}>{projectConfig.label}</Text>
                </View>
              </View>

              <Text style={[styles.bidOpportunityTitle, dynamicStyles.cardTitle]}>{opportunity.projectName}</Text>
              <View style={styles.addressRow}>
                <MapPin size={12} color={theme.textSecondary} />
                <Text style={[styles.addressText, dynamicStyles.cardSubtitle]} numberOfLines={1}>
                  {opportunity.projectAddress}
                </Text>
              </View>

              <View style={styles.bidOpportunityMeta}>
                <View style={styles.bidMetaItem}>
                  <DollarSign size={14} color="#272D53" />
                  <Text style={[styles.bidMetaText, { color: "#272D53" }]}>{opportunity.estimatedBudget}</Text>
                </View>
                <View style={styles.bidMetaItem}>
                  <Clock size={14} color={theme.textSecondary} />
                  <Text style={[styles.bidMetaText, { color: theme.textSecondary }]}>{opportunity.timeline}</Text>
                </View>
              </View>

              <View style={styles.scopePreview}>
                {opportunity.scope.slice(0, 3).map((item, idx) => (
                  <View key={idx} style={[styles.scopeChip, { backgroundColor: theme.surfaceSecondary }]}>
                    <Text style={[styles.scopeChipText, { color: theme.textSecondary }]}>{item}</Text>
                  </View>
                ))}
                {opportunity.scope.length > 3 && (
                  <Text style={[styles.moreScope, { color: theme.textTertiary }]}>+{opportunity.scope.length - 3} more</Text>
                )}
              </View>

              <View style={styles.bidOpportunityFooter}>
                <View style={styles.bidDeadlineRow}>
                  <Calendar size={12} color={theme.textSecondary} />
                  <Text style={[styles.bidDeadlineText, { color: theme.textSecondary }]}>
                    Bid by: {opportunity.bidDeadline}
                  </Text>
                </View>
                <View style={styles.bidCountRow}>
                  <Users size={12} color={theme.textTertiary} />
                  <Text style={[styles.bidCountText, { color: theme.textTertiary }]}>{opportunity.bidCount} bids</Text>
                </View>
              </View>

              {hasBid ? (
                <View style={[styles.bidSubmittedBadge, { backgroundColor: "#DCFCE7" }]}>
                  <CheckCircle size={16} color="#22C55E" />
                  <Text style={styles.bidSubmittedText}>Bid Submitted</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.createBidBtn}
                  onPress={() => handleCreateBid(opportunity)}
                >
                  <Plus size={16} color="#FFF" />
                  <Text style={styles.createBidBtnText}>Create Bid</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        );
      })}

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
            <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>Construction Projects</Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              Flip invitations & active jobs
            </Text>
          </View>
          <View style={[styles.headerBadge, { backgroundColor: "#272D53" }]}>
            <HardHat size={20} color="#FFF" />
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
            { id: "active" as const, label: "Active", icon: Hammer },
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
                  <TabIcon size={18} color={isActive ? "#272D53" : theme.textSecondary} />
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
                  <View style={[styles.projectTypeBadge, { backgroundColor: projectTypeConfig[selectedInvitation.projectType].bg }]}>
                    <Text style={[styles.projectTypeText, { color: projectTypeConfig[selectedInvitation.projectType].color }]}>
                      {projectTypeConfig[selectedInvitation.projectType].label}
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
                  <TouchableOpacity style={[styles.messageBtn, { backgroundColor: "#272D53" }]}>
                    <MessageCircle size={18} color="#FFF" />
                  </TouchableOpacity>
                </View>

                <View style={[styles.modalInfoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <View style={styles.modalInfoRow}>
                    <Text style={[styles.modalInfoLabel, { color: theme.textSecondary }]}>Budget</Text>
                    <Text style={[styles.modalInfoValue, { color: "#272D53" }]}>{selectedInvitation.estimatedBudget}</Text>
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
                  {selectedInvitation.sqft && (
                    <>
                      <View style={[styles.modalDivider, { backgroundColor: theme.borderLight }]} />
                      <View style={styles.modalInfoRow}>
                        <Text style={[styles.modalInfoLabel, { color: theme.textSecondary }]}>Square Footage</Text>
                        <Text style={[styles.modalInfoValue, { color: theme.text }]}>{selectedInvitation.sqft.toLocaleString()} sqft</Text>
                      </View>
                    </>
                  )}
                  {selectedInvitation.permitStatus && (
                    <>
                      <View style={[styles.modalDivider, { backgroundColor: theme.borderLight }]} />
                      <View style={styles.modalInfoRow}>
                        <Text style={[styles.modalInfoLabel, { color: theme.textSecondary }]}>Permit Status</Text>
                        <Text style={[styles.modalInfoValue, { color: permitStatusConfig[selectedInvitation.permitStatus].color }]}>
                          {permitStatusConfig[selectedInvitation.permitStatus].label}
                        </Text>
                      </View>
                    </>
                  )}
                </View>

                <Text style={[styles.scopeTitle, { color: theme.text }]}>Scope of Work</Text>
                <View style={styles.scopeList}>
                  {selectedInvitation.scope.map((item, idx) => (
                    <View key={idx} style={[styles.scopeItem, { backgroundColor: theme.surfaceSecondary }]}>
                      <CheckCircle size={14} color="#272D53" />
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

                <View style={[styles.expiryWarning, { backgroundColor: isDark ? "#78350F" : "#E8E9EE" }]}>
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

      <Modal
        visible={!!selectedProject}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => { setSelectedProject(null); setIsEditing(false); setEditedProject(null); }}
      >
        {selectedProject && (
          <SafeAreaView style={[styles.modalContainer, dynamicStyles.modalContainer]}>
            <View style={[styles.modalHeader, dynamicStyles.modalHeader]}>
              <TouchableOpacity onPress={() => { setSelectedProject(null); setIsEditing(false); setEditedProject(null); }}>
                <X size={24} color={theme.textSecondary} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Project Details</Text>
              <TouchableOpacity
                onPress={() => {
                  if (isEditing) {
                    handleSaveProject();
                  } else {
                    setEditedProject({ ...selectedProject });
                    setIsEditing(true);
                  }
                }}
                style={[styles.editBtn, { backgroundColor: isEditing ? "#22C55E" : theme.surfaceSecondary }]}
              >
                {isEditing ? (
                  <Save size={18} color="#FFF" />
                ) : (
                  <Pencil size={18} color={theme.textSecondary} />
                )}
              </TouchableOpacity>
            </View>

            {isEditing && (
              <View style={[styles.editingBanner, { backgroundColor: isDark ? "#78350F" : "#E8E9EE" }]}>
                <Pencil size={14} color="#272D53" />
                <Text style={[styles.editingBannerText, { color: isDark ? "#FCD34D" : "#92400E" }]}>Editing project details</Text>
                <TouchableOpacity onPress={() => { setIsEditing(false); setEditedProject(null); }}>
                  <Text style={[styles.editCancelText, { color: isDark ? "#FCD34D" : "#92400E" }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}

            <ScrollView style={styles.modalContent}>
              <Image source={{ uri: selectedProject.image }} style={styles.modalImage} contentFit="cover" />

              <View style={styles.modalBody}>
                {isEditing && editedProject ? (
                  <TextInput
                    style={[styles.editInput, styles.editInputTitle, { color: theme.text, backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}
                    value={editedProject.name}
                    onChangeText={(text) => setEditedProject({ ...editedProject, name: text })}
                    placeholder="Project name"
                    placeholderTextColor={theme.textTertiary}
                  />
                ) : (
                  <Text style={[styles.modalProjectTitle, { color: theme.text }]}>{selectedProject.name}</Text>
                )}
                <View style={[styles.modalAddressRow, isEditing && { marginBottom: 12 }]}>
                  <MapPin size={14} color={theme.textSecondary} />
                  {isEditing && editedProject ? (
                    <TextInput
                      style={[styles.editInput, styles.editInputAddress, { color: theme.text, backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}
                      value={editedProject.address}
                      onChangeText={(text) => setEditedProject({ ...editedProject, address: text })}
                      placeholder="Address"
                      placeholderTextColor={theme.textTertiary}
                    />
                  ) : (
                    <Text style={[styles.modalAddress, { color: theme.textSecondary }]}>{selectedProject.address}</Text>
                  )}
                </View>

                <View style={[styles.descriptionCard, { backgroundColor: theme.surfaceSecondary }]}>
                  <Text style={[styles.descriptionLabel, { color: theme.textSecondary }]}>Description</Text>
                  {isEditing && editedProject ? (
                    <TextInput
                      style={[styles.descriptionInput, { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border }]}
                      value={editedProject.description}
                      onChangeText={(text) => setEditedProject({ ...editedProject, description: text })}
                      placeholder="Describe the project scope and details..."
                      placeholderTextColor={theme.textTertiary}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                    />
                  ) : (
                    <Text style={[styles.descriptionText, { color: theme.text }]}>
                      {selectedProject.description || "No description added yet."}
                    </Text>
                  )}
                </View>

                {isEditing && editedProject && (
                  <View style={[styles.editDetailsCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Text style={[styles.editDetailsSectionTitle, { color: theme.text }]}>Project Details</Text>

                    <View style={styles.editDetailRow}>
                      <Text style={[styles.editDetailLabel, { color: theme.textSecondary }]}>Status</Text>
                      <View style={styles.editStatusOptions}>
                        {(["awarded", "in_progress", "completed", "on_hold"] as const).map((s) => {
                          const cfg = statusConfig[s];
                          const isSelected = editedProject.status === s;
                          return (
                            <TouchableOpacity
                              key={s}
                              style={[styles.editStatusChip, { backgroundColor: isSelected ? cfg.bg : theme.surfaceSecondary, borderColor: isSelected ? cfg.color : "transparent", borderWidth: 1 }]}
                              onPress={() => setEditedProject({ ...editedProject, status: s })}
                            >
                              <Text style={[styles.editStatusChipText, { color: isSelected ? cfg.color : theme.textTertiary }]}>{cfg.label}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>

                    <View style={[styles.editDetailDivider, { backgroundColor: theme.borderLight }]} />

                    <View style={styles.editDetailRow}>
                      <Text style={[styles.editDetailLabel, { color: theme.textSecondary }]}>Project Type</Text>
                      <View style={styles.editStatusOptions}>
                        {(["renovation", "addition", "new_construction", "remodel", "commercial"] as const).map((pt) => {
                          const cfg = projectTypeConfig[pt];
                          const isSelected = editedProject.projectType === pt;
                          return (
                            <TouchableOpacity
                              key={pt}
                              style={[styles.editStatusChip, { backgroundColor: isSelected ? cfg.bg : theme.surfaceSecondary, borderColor: isSelected ? cfg.color : "transparent", borderWidth: 1 }]}
                              onPress={() => setEditedProject({ ...editedProject, projectType: pt })}
                            >
                              <Text style={[styles.editStatusChipText, { color: isSelected ? cfg.color : theme.textTertiary }]}>{cfg.label}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>

                    <View style={[styles.editDetailDivider, { backgroundColor: theme.borderLight }]} />

                    <View style={styles.editDetailRow}>
                      <Text style={[styles.editDetailLabel, { color: theme.textSecondary }]}>Start Date</Text>
                      <TextInput
                        style={[styles.editDetailInput, { color: theme.text, backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}
                        value={editedProject.startDate}
                        onChangeText={(text) => setEditedProject({ ...editedProject, startDate: text })}
                        placeholder="e.g. Jan 1, 2026"
                        placeholderTextColor={theme.textTertiary}
                      />
                    </View>

                    <View style={[styles.editDetailDivider, { backgroundColor: theme.borderLight }]} />

                    <View style={styles.editDetailRow}>
                      <Text style={[styles.editDetailLabel, { color: theme.textSecondary }]}>End Date</Text>
                      <TextInput
                        style={[styles.editDetailInput, { color: theme.text, backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}
                        value={editedProject.endDate}
                        onChangeText={(text) => setEditedProject({ ...editedProject, endDate: text })}
                        placeholder="e.g. Mar 15, 2026"
                        placeholderTextColor={theme.textTertiary}
                      />
                    </View>
                  </View>
                )}

                {!isEditing && selectedProject.description && (
                  <View style={{ marginBottom: 0 }} />
                )}

                <View style={[styles.budgetCard, { backgroundColor: isDark ? "#78350F" : "#E8E9EE" }]}>
                  <View style={styles.budgetRow}>
                    <View>
                      <Text style={[styles.budgetLabel, { color: theme.textSecondary }]}>Budget</Text>
                      {isEditing && editedProject ? (
                        <TextInput
                          style={[styles.editInputSmall, { color: "#272D53", backgroundColor: "transparent" }]}
                          value={editedProject.budget}
                          onChangeText={(text) => setEditedProject({ ...editedProject, budget: text })}
                          placeholder="$0"
                          placeholderTextColor={theme.textTertiary}
                        />
                      ) : (
                        <Text style={[styles.budgetValue, { color: "#272D53" }]}>{selectedProject.budget}</Text>
                      )}
                    </View>
                    <View>
                      <Text style={[styles.budgetLabel, { color: theme.textSecondary }]}>Spent</Text>
                      {isEditing && editedProject ? (
                        <TextInput
                          style={[styles.editInputSmall, { color: theme.text, backgroundColor: "transparent" }]}
                          value={editedProject.spent}
                          onChangeText={(text) => setEditedProject({ ...editedProject, spent: text })}
                          placeholder="$0"
                          placeholderTextColor={theme.textTertiary}
                        />
                      ) : (
                        <Text style={[styles.budgetValue, { color: theme.text }]}>{selectedProject.spent}</Text>
                      )}
                    </View>
                    <View>
                      <Text style={[styles.budgetLabel, { color: theme.textSecondary }]}>Progress</Text>
                      {isEditing && editedProject ? (
                        <TextInput
                          style={[styles.editInputSmall, { color: "#22C55E", backgroundColor: "transparent" }]}
                          value={String(editedProject.progress)}
                          onChangeText={(text) => setEditedProject({ ...editedProject, progress: parseInt(text) || 0 })}
                          placeholder="0"
                          placeholderTextColor={theme.textTertiary}
                          keyboardType="numeric"
                        />
                      ) : (
                        <Text style={[styles.budgetValue, { color: "#22C55E" }]}>{selectedProject.progress}%</Text>
                      )}
                    </View>
                  </View>
                </View>

                <Text style={[styles.sectionHeader, { color: theme.text }]}>Tasks</Text>
                {(isEditing && editedProject ? editedProject.tasks : selectedProject.tasks).map((task, taskIndex) => (
                  <TouchableOpacity
                    key={task.id}
                    style={[styles.taskItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
                    onPress={() => {
                      if (isEditing && editedProject) {
                        const updatedTasks = [...editedProject.tasks];
                        updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], completed: !updatedTasks[taskIndex].completed };
                        setEditedProject({ ...editedProject, tasks: updatedTasks });
                      }
                    }}
                    activeOpacity={isEditing ? 0.7 : 1}
                  >
                    <View style={[styles.taskCheckbox, task.completed && styles.taskCheckboxCompleted]}>
                      {task.completed && <CheckCircle size={16} color="#FFF" />}
                    </View>
                    <View style={styles.taskInfo}>
                      <Text style={[styles.taskName, { color: theme.text }, task.completed && styles.taskNameCompleted]}>
                        {task.name}
                      </Text>
                      <Text style={[styles.taskCategory, { color: theme.textTertiary }]}>{task.category}</Text>
                    </View>
                    {task.dueDate && (
                      <Text style={[styles.taskDue, { color: theme.textSecondary }]}>{task.dueDate}</Text>
                    )}
                  </TouchableOpacity>
                ))}

                <Text style={[styles.sectionHeader, { color: theme.text }]}>Crew ({selectedProject.crew.length})</Text>
                {selectedProject.crew.map((member) => (
                  <View key={member.id} style={[styles.crewMemberCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Image source={{ uri: member.avatar }} style={styles.crewMemberAvatar} />
                    <View style={styles.crewMemberInfo}>
                      <Text style={[styles.crewMemberName, { color: theme.text }]}>{member.name}</Text>
                      <Text style={[styles.crewMemberRole, { color: theme.textSecondary }]}>{member.role}</Text>
                    </View>
                  </View>
                ))}

                <Text style={[styles.sectionHeader, { color: theme.text }]}>Permits</Text>
                {selectedProject.permits.map((permit) => (
                  <View key={permit.id} style={[styles.permitItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <View style={styles.permitInfo}>
                      <Text style={[styles.permitType, { color: theme.text }]}>{permit.type}</Text>
                      {permit.number && (
                        <Text style={[styles.permitNumber, { color: theme.textTertiary }]}>#{permit.number}</Text>
                      )}
                    </View>
                    <View style={[styles.permitStatus, { backgroundColor: permit.status === "approved" ? "#DCFCE7" : "#E8E9EE" }]}>
                      <Text style={[styles.permitStatusText, { color: permit.status === "approved" ? "#22C55E" : "#272D53" }]}>
                        {permit.status.charAt(0).toUpperCase() + permit.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                ))}

                <Text style={[styles.sectionHeader, { color: theme.text }]}>Inspections</Text>
                {selectedProject.inspections.map((inspection) => (
                  <View key={inspection.id} style={[styles.inspectionItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <View style={styles.inspectionInfo}>
                      <Text style={[styles.inspectionType, { color: theme.text }]}>{inspection.type}</Text>
                      <Text style={[styles.inspectionDate, { color: theme.textTertiary }]}>{inspection.date}</Text>
                    </View>
                    <View style={[
                      styles.inspectionStatus,
                      { backgroundColor: inspection.status === "passed" ? "#DCFCE7" : inspection.status === "failed" ? "#FEE2E2" : "#DBEAFE" }
                    ]}>
                      <Text style={[
                        styles.inspectionStatusText,
                        { color: inspection.status === "passed" ? "#22C55E" : inspection.status === "failed" ? "#EF4444" : "#3B82F6" }
                      ]}>
                        {inspection.status.charAt(0).toUpperCase() + inspection.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>

      <Modal
        visible={showBidModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowBidModal(false)}
      >
        {selectedBidOpportunity && (
          <SafeAreaView style={[styles.modalContainer, dynamicStyles.modalContainer]}>
            <View style={[styles.modalHeader, dynamicStyles.modalHeader]}>
              <TouchableOpacity onPress={() => setShowBidModal(false)}>
                <X size={24} color={theme.textSecondary} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Create Bid</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.modalBody}>
                <View style={[styles.bidProjectSummary, { backgroundColor: theme.surfaceSecondary }]}>
                  <Text style={[styles.bidProjectName, { color: theme.text }]}>{selectedBidOpportunity.projectName}</Text>
                  <Text style={[styles.bidProjectAddress, { color: theme.textSecondary }]}>{selectedBidOpportunity.projectAddress}</Text>
                  <View style={styles.bidProjectMeta}>
                    <Text style={[styles.bidProjectBudget, { color: "#272D53" }]}>{selectedBidOpportunity.estimatedBudget}</Text>
                    <Text style={[styles.bidProjectTimeline, { color: theme.textSecondary }]}>{selectedBidOpportunity.timeline}</Text>
                  </View>
                </View>

                <Text style={[styles.bidSectionTitle, { color: theme.text }]}>Select Template</Text>
                <Text style={[styles.bidSectionSubtitle, { color: theme.textSecondary }]}>Use a template to prefill bid details</Text>

                {mockBidTemplates.map((template) => (
                  <TouchableOpacity
                    key={template.id}
                    style={[
                      styles.bidTemplateCard,
                      { backgroundColor: theme.surface, borderColor: selectedTemplate?.id === template.id ? "#272D53" : theme.border }
                    ]}
                    onPress={() => handleSelectTemplate(template)}
                  >
                    <View style={styles.bidTemplateHeader}>
                      <View style={styles.bidTemplateInfo}>
                        <Copy size={18} color={selectedTemplate?.id === template.id ? "#272D53" : theme.textSecondary} />
                        <View>
                          <Text style={[styles.bidTemplateName, { color: theme.text }]}>{template.name}</Text>
                          <Text style={[styles.bidTemplateDesc, { color: theme.textSecondary }]}>{template.description}</Text>
                        </View>
                      </View>
                      {selectedTemplate?.id === template.id && (
                        <CheckCircle size={20} color="#272D53" />
                      )}
                    </View>
                    <View style={styles.bidTemplateDetails}>
                      <View style={styles.bidTemplateDetail}>
                        <Text style={[styles.bidTemplateLabel, { color: theme.textTertiary }]}>Labor Rate</Text>
                        <Text style={[styles.bidTemplateValue, { color: theme.text }]}>${template.laborRate}/hr</Text>
                      </View>
                      <View style={styles.bidTemplateDetail}>
                        <Text style={[styles.bidTemplateLabel, { color: theme.textTertiary }]}>Markup</Text>
                        <Text style={[styles.bidTemplateValue, { color: theme.text }]}>{template.materialMarkup}%</Text>
                      </View>
                      <View style={styles.bidTemplateDetail}>
                        <Text style={[styles.bidTemplateLabel, { color: theme.textTertiary }]}>Contingency</Text>
                        <Text style={[styles.bidTemplateValue, { color: theme.text }]}>{template.contingency}%</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}

                <Text style={[styles.bidSectionTitle, { color: theme.text, marginTop: 24 }]}>Bid Amount</Text>
                <View style={[styles.bidAmountInput, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
                  <DollarSign size={20} color="#272D53" />
                  <TextInput
                    style={[styles.bidAmountField, { color: theme.text }]}
                    value={bidAmount}
                    onChangeText={setBidAmount}
                    placeholder="Enter bid amount"
                    placeholderTextColor={theme.textTertiary}
                    keyboardType="numeric"
                  />
                </View>

                <Text style={[styles.bidSectionTitle, { color: theme.text, marginTop: 24 }]}>Notes (Optional)</Text>
                <TextInput
                  style={[styles.bidNotesInput, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border, color: theme.text }]}
                  value={bidNotes}
                  onChangeText={setBidNotes}
                  placeholder="Add any notes or special terms..."
                  placeholderTextColor={theme.textTertiary}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />

                <View style={styles.bidModalActions}>
                  <TouchableOpacity
                    style={[styles.bidCancelBtn, { borderColor: theme.border }]}
                    onPress={() => setShowBidModal(false)}
                  >
                    <Text style={[styles.bidCancelBtnText, { color: theme.textSecondary }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.bidSubmitBtn, !bidAmount && styles.bidSubmitBtnDisabled]}
                    onPress={handleSubmitBid}
                    disabled={!bidAmount}
                  >
                    <FileCheck size={18} color="#FFF" />
                    <Text style={styles.bidSubmitBtnText}>Submit Bid</Text>
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
    borderBottomColor: "#272D53",
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
  projectTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  projectTypeText: {
    fontSize: 11,
    fontWeight: "500" as const,
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
  projectMetaRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  metaChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  metaChipText: {
    fontSize: 12,
    fontWeight: "500" as const,
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
  alertsRow: {
    flexDirection: "row",
    gap: 8,
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
    fontWeight: "600" as const,
    color: "#92400E",
  },
  inspectionAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  inspectionAlertText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  projectTitle: {
    fontSize: 17,
    fontWeight: "600" as const,
    marginBottom: 4,
  },
  projectClientRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
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
  budgetInfo: {
    marginLeft: "auto",
    alignItems: "flex-end",
  },
  projectBudget: {
    fontSize: 15,
    fontWeight: "700" as const,
  },
  spentText: {
    fontSize: 11,
    marginTop: 2,
  },
  crewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  crewText: {
    fontSize: 12,
  },
  crewAvatars: {
    flexDirection: "row",
    marginLeft: "auto",
  },
  crewAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FFF",
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
    backgroundColor: "#272D53",
  },
  acceptBtnText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FFF",
  },
  budgetCard: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 20,
  },
  budgetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  budgetLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  budgetValue: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
  sectionHeader: {
    fontSize: 17,
    fontWeight: "600" as const,
    marginTop: 8,
    marginBottom: 12,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  taskCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
  },
  taskCheckboxCompleted: {
    backgroundColor: "#22C55E",
    borderColor: "#22C55E",
  },
  taskInfo: {
    flex: 1,
    marginLeft: 12,
  },
  taskName: {
    fontSize: 14,
    fontWeight: "500" as const,
  },
  taskNameCompleted: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  taskCategory: {
    fontSize: 12,
    marginTop: 2,
  },
  taskDue: {
    fontSize: 12,
  },
  crewMemberCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  crewMemberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  crewMemberInfo: {
    marginLeft: 12,
  },
  crewMemberName: {
    fontSize: 14,
    fontWeight: "500" as const,
  },
  crewMemberRole: {
    fontSize: 12,
    marginTop: 2,
  },
  permitItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  permitInfo: {
    flex: 1,
  },
  permitType: {
    fontSize: 14,
    fontWeight: "500" as const,
  },
  permitNumber: {
    fontSize: 12,
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
  inspectionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  inspectionInfo: {
    flex: 1,
  },
  inspectionType: {
    fontSize: 14,
    fontWeight: "500" as const,
  },
  inspectionDate: {
    fontSize: 12,
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
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  editingBanner: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  editingBannerText: {
    fontSize: 13,
    fontWeight: "500" as const,
    flex: 1,
  },
  editCancelText: {
    fontSize: 13,
    fontWeight: "600" as const,
    textDecorationLine: "underline" as const,
  },
  editInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  editInputTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    marginBottom: 6,
  },
  editInputAddress: {
    flex: 1,
    fontSize: 14,
    marginLeft: 6,
  },
  editInputSmall: {
    fontSize: 18,
    fontWeight: "700" as const,
    minWidth: 60,
    paddingVertical: 2,
  },
  descriptionCard: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  descriptionLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
  },
  descriptionInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    lineHeight: 22,
    minHeight: 100,
  },
  editDetailsCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  editDetailsSectionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginBottom: 16,
  },
  editDetailRow: {
    marginBottom: 4,
  },
  editDetailLabel: {
    fontSize: 13,
    fontWeight: "500" as const,
    marginBottom: 8,
  },
  editStatusOptions: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 8,
  },
  editStatusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editStatusChipText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  editDetailDivider: {
    height: 1,
    marginVertical: 12,
  },
  editDetailInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  bidOpportunityCard: {
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
  bidOpportunityImage: {
    width: "100%",
    height: 120,
  },
  bidOpportunityContent: {
    padding: 14,
  },
  bidOpportunityHeader: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  bidOpportunityTitle: {
    fontSize: 17,
    fontWeight: "600" as const,
    marginBottom: 4,
  },
  bidOpportunityMeta: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  bidMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  bidMetaText: {
    fontSize: 13,
    fontWeight: "500" as const,
  },
  bidOpportunityFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  bidDeadlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  bidDeadlineText: {
    fontSize: 12,
  },
  bidCountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  bidCountText: {
    fontSize: 12,
  },
  createBidBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#272D53",
  },
  createBidBtnText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FFF",
  },
  bidSubmittedBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
  },
  bidSubmittedText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#22C55E",
  },
  bidProjectSummary: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 20,
  },
  bidProjectName: {
    fontSize: 18,
    fontWeight: "700" as const,
    marginBottom: 4,
  },
  bidProjectAddress: {
    fontSize: 14,
    marginBottom: 12,
  },
  bidProjectMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  bidProjectBudget: {
    fontSize: 16,
    fontWeight: "700" as const,
  },
  bidProjectTimeline: {
    fontSize: 14,
  },
  bidSectionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginBottom: 4,
  },
  bidSectionSubtitle: {
    fontSize: 13,
    marginBottom: 12,
  },
  bidTemplateCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  bidTemplateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  bidTemplateInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  bidTemplateName: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  bidTemplateDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  bidTemplateDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  bidTemplateDetail: {
    alignItems: "center",
  },
  bidTemplateLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  bidTemplateValue: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  bidAmountInput: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  bidAmountField: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600" as const,
  },
  bidNotesInput: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 15,
    minHeight: 100,
  },
  bidModalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
    marginBottom: 40,
  },
  bidCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  bidCancelBtnText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  bidSubmitBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#272D53",
  },
  bidSubmitBtnDisabled: {
    opacity: 0.5,
  },
  bidSubmitBtnText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FFF",
  },
});
