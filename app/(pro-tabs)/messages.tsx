import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import {
  Search,
  Plus,
  Users,
  Lock,
  Check,
  CheckCheck,
  MessageCircle,
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Leaf,
  Droplets,
  Wrench,
  Home,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { useTheme } from "@/contexts/ThemeContext";
import { mockConversations } from "@/mocks/messages";
import { mockLandscapeProjects } from "@/mocks/landscapers";
import { Conversation, ProfessionalType } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { Professional } from "@/types";

type FilterType = "all" | "invitations" | "team" | "direct";

interface ProjectInvitation {
  id: string;
  projectName: string;
  clientName: string;
  clientAvatar: string;
  location: string;
  projectType: string;
  timeline: string;
  timestamp: string;
  isNew: boolean;
  budget?: string;
  description?: string;
}

const getRealtorInvitations = (): ProjectInvitation[] => [
  {
    id: "inv-1",
    projectName: "Flip Project Collaboration",
    clientName: "Marcus Chen - FlipPro Investments",
    clientAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
    location: "1234 Oak Valley Dr, Austin, TX",
    projectType: "Fix & Flip",
    timeline: "Listing in 6 weeks",
    timestamp: "2026-01-26T09:00:00Z",
    isNew: true,
  },
  {
    id: "inv-2",
    projectName: "Open House Co-Hosting",
    clientName: "Amanda Foster - Keller Williams",
    clientAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    location: "567 Lakefront Blvd, Austin, TX",
    projectType: "Open House",
    timeline: "This Saturday, 2-5 PM",
    timestamp: "2026-01-26T08:30:00Z",
    isNew: true,
  },
  {
    id: "inv-3",
    projectName: "Investment Property Listing",
    clientName: "David Park - Horizon Capital",
    clientAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    location: "890 Commerce St, Round Rock, TX",
    projectType: "Commercial Listing",
    timeline: "Ready to list",
    timestamp: "2026-01-25T16:00:00Z",
    isNew: false,
  },
];

const getLandscaperInvitations = (): ProjectInvitation[] => 
  mockLandscapeProjects.map(project => ({
    id: project.id,
    projectName: project.projectName,
    clientName: project.clientName,
    clientAvatar: project.clientAvatar,
    location: project.location,
    projectType: project.projectType,
    timeline: project.timeline,
    timestamp: project.timestamp,
    isNew: project.isNew,
    budget: project.budget,
    description: project.description,
  }));

const getContractorInvitations = (): ProjectInvitation[] => [
  {
    id: "cinv-1",
    projectName: "Kitchen Renovation",
    clientName: "Sarah Thompson - Homeowner",
    clientAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
    location: "456 Maple St, Austin, TX",
    projectType: "Full Renovation",
    timeline: "Start in 3 weeks",
    timestamp: "2026-01-26T10:00:00Z",
    isNew: true,
    budget: "$45,000 - $55,000",
  },
  {
    id: "cinv-2",
    projectName: "Bathroom Remodel",
    clientName: "Robert Wilson - Flip Investor",
    clientAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    location: "789 Oak Dr, Round Rock, TX",
    projectType: "Flip Project",
    timeline: "ASAP",
    timestamp: "2026-01-26T08:00:00Z",
    isNew: true,
    budget: "$12,000 - $15,000",
  },
  {
    id: "cinv-3",
    projectName: "Deck Addition",
    clientName: "Jennifer Martinez - Homeowner",
    clientAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    location: "123 Pine Ave, Cedar Park, TX",
    projectType: "New Construction",
    timeline: "Start next month",
    timestamp: "2026-01-25T14:00:00Z",
    isNew: false,
    budget: "$8,000 - $12,000",
  },
];

const getPlumberInvitations = (): ProjectInvitation[] => [
  {
    id: "pinv-1",
    projectName: "Emergency Pipe Repair",
    clientName: "David Chen - Property Manager",
    clientAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
    location: "567 Business Park Ave, Round Rock, TX",
    projectType: "Emergency Repair",
    timeline: "ASAP - Urgent",
    timestamp: "2026-01-26T11:00:00Z",
    isNew: true,
    budget: "Hourly Rate",
  },
  {
    id: "pinv-2",
    projectName: "Water Heater Installation",
    clientName: "Amanda Foster - Homeowner",
    clientAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    location: "890 Lakefront Blvd, Lakeway, TX",
    projectType: "Installation",
    timeline: "This week",
    timestamp: "2026-01-26T09:30:00Z",
    isNew: true,
    budget: "$1,500 - $2,500",
  },
  {
    id: "pinv-3",
    projectName: "Full Bathroom Plumbing",
    clientName: "Robert Wilson - Flip Investor",
    clientAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    location: "234 Commerce St, Austin, TX",
    projectType: "New Construction",
    timeline: "Start in 2 weeks",
    timestamp: "2026-01-25T15:00:00Z",
    isNew: false,
    budget: "$5,000 - $7,000",
  },
];

const getInvitationsForType = (professionalType: ProfessionalType | undefined): ProjectInvitation[] => {
  switch (professionalType) {
    case "realtor":
      return getRealtorInvitations();
    case "landscaper":
      return getLandscaperInvitations();
    case "contractor":
      return getContractorInvitations();
    case "plumber":
      return getPlumberInvitations();
    default:
      return getContractorInvitations();
  }
};

const getProjectIcon = (professionalType: ProfessionalType | undefined) => {
  switch (professionalType) {
    case "realtor":
      return Home;
    case "landscaper":
      return Leaf;
    case "plumber":
      return Droplets;
    case "contractor":
      return Wrench;
    default:
      return Briefcase;
  }
};

export default function ProMessagesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();
  const professional = user as Professional | null;
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const ds = useMemo(() => ({
    container: { backgroundColor: theme.background },
    safeArea: { backgroundColor: theme.surface },
    title: { color: theme.text },
    subtitle: { color: theme.navy },
    newChatButton: { backgroundColor: theme.navy },
    searchBox: { backgroundColor: theme.surfaceSecondary },
    searchInput: { color: theme.text },
    filterChip: { backgroundColor: theme.surface, borderColor: theme.border },
    filterChipActive: { backgroundColor: theme.navy, borderColor: theme.navy },
    sectionTitle: { color: theme.text },
    seeAllText: { color: theme.navy },
    invitationCard: { backgroundColor: theme.surface },
    invitationProject: { color: theme.text },
    invitationClient: { color: theme.textSecondary },
    conversationItem: { backgroundColor: theme.surface },
    conversationName: { color: theme.text },
    messagePreview: { color: theme.textSecondary },
    timestamp: { color: theme.textTertiary },
    unreadBadge: { backgroundColor: theme.navy },
    emptySectionText: { color: theme.textSecondary },
  }), [theme]);

  const projectInvitations = getInvitationsForType(professional?.professionalType);
  const ProjectIcon = getProjectIcon(professional?.professionalType);

  const teamConversations = mockConversations.filter((conv) => conv.type === "team");
  const directConversations = mockConversations.filter((conv) => conv.type === "direct");

  const filteredConversations = mockConversations.filter((conv) => {
    const matchesSearch = conv.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeFilter === "all") return matchesSearch;
    if (activeFilter === "team") return matchesSearch && conv.type === "team";
    if (activeFilter === "direct") return matchesSearch && conv.type === "direct";
    return false;
  });

  const filteredInvitations = projectInvitations.filter((inv) =>
    inv.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = mockConversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
  const newInvitations = projectInvitations.filter((inv) => inv.isNew).length;

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const renderProjectInvitation = (invitation: ProjectInvitation) => (
    <TouchableOpacity key={invitation.id} style={styles.invitationCard}>
      <View style={styles.invitationHeader}>
        <View style={styles.invitationClientInfo}>
          <Image
            source={{ uri: invitation.clientAvatar }}
            style={styles.invitationAvatar}
            contentFit="cover"
          />
          <View style={styles.invitationClientDetails}>
            <View style={styles.invitationTitleRow}>
              <Text style={styles.invitationProject}>{invitation.projectName}</Text>
              {invitation.isNew && (
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>New</Text>
                </View>
              )}
            </View>
            <Text style={styles.invitationClient}>from {invitation.clientName}</Text>
          </View>
        </View>
        <Text style={styles.invitationTime}>{formatTime(invitation.timestamp)}</Text>
      </View>

      <View style={styles.invitationDetails}>
        <View style={styles.invitationDetail}>
          <MapPin size={14} color={Colors.textSecondary} strokeWidth={1.5} />
          <Text style={styles.invitationDetailText} numberOfLines={1}>{invitation.location}</Text>
        </View>
        <View style={styles.invitationDetailRow}>
          <View style={styles.invitationDetail}>
            <ProjectIcon size={14} color={Colors.textSecondary} strokeWidth={1.5} />
            <Text style={styles.invitationDetailText}>{invitation.projectType}</Text>
          </View>
          <View style={styles.invitationDetail}>
            <Clock size={14} color={Colors.textSecondary} strokeWidth={1.5} />
            <Text style={styles.invitationDetailText}>{invitation.timeline}</Text>
          </View>
        </View>
        {invitation.budget && (
          <View style={styles.invitationDetail}>
            <DollarSign size={14} color={Colors.textSecondary} strokeWidth={1.5} />
            <Text style={styles.invitationDetailText}>{invitation.budget}</Text>
          </View>
        )}
      </View>

      <View style={styles.invitationActions}>
        <TouchableOpacity style={styles.declineButton}>
          <Text style={styles.declineButtonText}>Decline</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.acceptButton}>
          <Text style={styles.acceptButtonText}>View & Accept</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderConversationItem = (conversation: Conversation) => {
    const isUnread = conversation.unreadCount > 0;
    
    return (
      <TouchableOpacity
        key={conversation.id}
        style={styles.conversationItem}
        onPress={() => router.push(`/chat/${conversation.id}` as any)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          {conversation.type === "team" ? (
            <View style={styles.teamAvatarContainer}>
              <Image
                source={{ uri: conversation.avatar }}
                style={styles.teamAvatar}
                contentFit="cover"
              />
              <View style={styles.teamBadge}>
                <Users size={10} color={Colors.white} />
              </View>
            </View>
          ) : (
            <View style={styles.directAvatarContainer}>
              <Image
                source={{ uri: conversation.avatar }}
                style={styles.avatar}
                contentFit="cover"
              />
              {conversation.participants[0]?.isOnline && (
                <View style={styles.onlineIndicator} />
              )}
            </View>
          )}
        </View>

        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <View style={styles.nameRow}>
              <Text style={[styles.conversationName, isUnread && styles.unreadText]} numberOfLines={1}>
                {conversation.name}
              </Text>
              {conversation.isEncrypted && (
                <Lock size={12} color={Colors.success} style={styles.lockIcon} />
              )}
            </View>
            <Text style={[styles.timestamp, isUnread && styles.unreadTimestamp]}>
              {conversation.lastMessage ? formatTime(conversation.lastMessage.timestamp) : ""}
            </Text>
          </View>
          
          <View style={styles.messagePreviewRow}>
            <View style={styles.messagePreviewContainer}>
              {conversation.lastMessage?.senderId === "current-user" && (
                <View style={styles.readStatus}>
                  {conversation.lastMessage.isRead ? (
                    <CheckCheck size={14} color={Colors.primary} />
                  ) : (
                    <Check size={14} color={Colors.textTertiary} />
                  )}
                </View>
              )}
              <Text 
                style={[styles.messagePreview, isUnread && styles.unreadPreview]} 
                numberOfLines={1}
              >
                {conversation.type === "team" && conversation.lastMessage?.senderId !== "current-user" 
                  ? `${conversation.lastMessage?.senderName?.split(" ")[0]}: ${conversation.lastMessage?.content}`
                  : conversation.lastMessage?.content
                }
              </Text>
            </View>
            {isUnread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>{conversation.unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const getInvitationLabel = () => {
    switch (professional?.professionalType) {
      case "realtor":
        return "Project Invitations";
      case "landscaper":
        return "Landscape Projects";
      case "plumber":
        return "Service Requests";
      case "contractor":
        return "Job Requests";
      default:
        return "Project Invitations";
    }
  };

  return (
    <View style={[styles.container, ds.container]}>
      <SafeAreaView edges={["top"]} style={[styles.safeArea, ds.safeArea]}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, ds.title]}>Messages</Text>
            <Text style={[styles.subtitle, ds.subtitle]}>
              {newInvitations > 0 && `${newInvitations} new invitation${newInvitations > 1 ? "s" : ""}`}
              {newInvitations > 0 && totalUnread > 0 ? " • " : ""}
              {totalUnread > 0 && `${totalUnread} unread message${totalUnread > 1 ? "s" : ""}`}
            </Text>
          </View>
          <TouchableOpacity style={[styles.newChatButton, ds.newChatButton]}>
            <Plus size={20} color={theme.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={[styles.searchBox, ds.searchBox]}>
            <Search size={18} color={theme.textTertiary} />
            <TextInput
              style={[styles.searchInput, ds.searchInput]}
              placeholder="Search messages & invitations"
              placeholderTextColor={theme.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            <TouchableOpacity
              style={[styles.filterChip, activeFilter === "all" && styles.filterChipActive]}
              onPress={() => setActiveFilter("all")}
            >
              <Text style={[styles.filterText, activeFilter === "all" && styles.filterTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, activeFilter === "invitations" && styles.filterChipActive]}
              onPress={() => setActiveFilter("invitations")}
            >
              <ProjectIcon size={14} color={activeFilter === "invitations" ? theme.white : theme.textSecondary} />
              <Text style={[styles.filterText, activeFilter === "invitations" && styles.filterTextActive]}>
                Invites
              </Text>
              {newInvitations > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{newInvitations}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, activeFilter === "team" && styles.filterChipActive]}
              onPress={() => setActiveFilter("team")}
            >
              <Users size={14} color={activeFilter === "team" ? theme.white : theme.textSecondary} />
              <Text style={[styles.filterText, activeFilter === "team" && styles.filterTextActive]}>
                Team Chats
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, activeFilter === "direct" && styles.filterChipActive]}
              onPress={() => setActiveFilter("direct")}
            >
              <MessageCircle size={14} color={activeFilter === "direct" ? theme.white : theme.textSecondary} />
              <Text style={[styles.filterText, activeFilter === "direct" && styles.filterTextActive]}>
                Direct
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {(activeFilter === "all" || activeFilter === "invitations") && filteredInvitations.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <ProjectIcon size={18} color={theme.navy} strokeWidth={1.5} />
                <Text style={[styles.sectionTitle, ds.sectionTitle]}>{getInvitationLabel()}</Text>
              </View>
              {activeFilter === "all" && filteredInvitations.length > 2 && (
                <TouchableOpacity onPress={() => setActiveFilter("invitations")}>
                  <Text style={[styles.seeAllText, ds.seeAllText]}>See All</Text>
                </TouchableOpacity>
              )}
            </View>
            {(activeFilter === "invitations" ? filteredInvitations : filteredInvitations.slice(0, 2)).map(renderProjectInvitation)}
          </View>
        )}

        {(activeFilter === "all" || activeFilter === "team") && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Users size={18} color={theme.navy} strokeWidth={1.5} />
                <Text style={[styles.sectionTitle, ds.sectionTitle]}>Team Chats</Text>
              </View>
            </View>
            {teamConversations.length === 0 ? (
              <View style={styles.emptySection}>
                <Text style={styles.emptySectionText}>No team chats yet</Text>
              </View>
            ) : (
              (activeFilter === "team" ? teamConversations : teamConversations.slice(0, 3)).map(renderConversationItem)
            )}
          </View>
        )}

        {(activeFilter === "all" || activeFilter === "direct") && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <MessageCircle size={18} color={theme.navy} strokeWidth={1.5} />
                <Text style={[styles.sectionTitle, ds.sectionTitle]}>Direct Messages</Text>
              </View>
            </View>
            {directConversations.length === 0 ? (
              <View style={styles.emptySection}>
                <Text style={styles.emptySectionText}>No direct messages yet</Text>
              </View>
            ) : (
              directConversations.map(renderConversationItem)
            )}
          </View>
        )}

        <View style={{ height: Platform.OS === "ios" ? 120 : 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "800" as const,
    color: Colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.primary,
    marginTop: 2,
    fontWeight: "500" as const,
  },
  newChatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceSecondary,
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
  filterContainer: {
    paddingBottom: 12,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 6,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: Colors.navy,
    borderColor: Colors.navy,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#6B7280",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  filterBadge: {
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    marginLeft: 2,
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  emptySection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  emptySectionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  invitationCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  invitationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  invitationClientInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  invitationAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  invitationClientDetails: {
    flex: 1,
  },
  invitationTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  invitationProject: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  invitationClient: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  newBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  invitationTime: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  invitationDetails: {
    gap: 8,
    marginBottom: 16,
  },
  invitationDetailRow: {
    flexDirection: "row",
    gap: 20,
  },
  invitationDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  invitationDetailText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  invitationActions: {
    flexDirection: "row",
    gap: 12,
  },
  declineButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  declineButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  acceptButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: "center",
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  conversationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  avatarContainer: {
    marginRight: 14,
  },
  directAvatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  teamAvatarContainer: {
    position: "relative",
  },
  teamAvatar: {
    width: 52,
    height: 52,
    borderRadius: 14,
  },
  teamBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  conversationName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
    flexShrink: 1,
  },
  lockIcon: {
    marginLeft: 6,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  unreadTimestamp: {
    color: Colors.primary,
    fontWeight: "600" as const,
  },
  messagePreviewRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  messagePreviewContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  readStatus: {
    marginRight: 4,
  },
  messagePreview: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  unreadText: {
    fontWeight: "700" as const,
  },
  unreadPreview: {
    color: Colors.text,
    fontWeight: "500" as const,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  unreadCount: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: Colors.white,
  },
});
