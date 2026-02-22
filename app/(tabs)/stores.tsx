import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import {
  Search,
  X,
  Briefcase,
  Users,
  Bell,
  Star,
  StarOff,
  MessageCircle,
  FileText,
  Calendar,
  CheckSquare,
  Plus,
  ChevronRight,
  Clock,
  MapPin,
  TrendingUp,
  Home,
  Building,
  Filter,
  Zap,
  Target,
  UserPlus,
  ArrowUpRight,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import Colors from "@/constants/colors";
import { useRouter } from "expo-router";

type TabType = "projects" | "matches" | "notifications" | "favorites";
type ProjectStatus = "scouting" | "under_contract" | "rehab" | "listing_soon";

interface Investor {
  id: string;
  name: string;
  avatar: string;
  type: "flipper" | "investor" | "wholesaler";
  specialties: string[];
  location: string;
  projectsCompleted: number;
  rating: number;
  isPreferred: boolean;
  matchScore?: number;
  lastActive: string;
}

interface ActiveProject {
  id: string;
  title: string;
  address: string;
  status: ProjectStatus;
  investor: Investor;
  image: string;
  budget: string;
  deadline: string;
  tasks: ProjectTask[];
  unreadMessages: number;
  lastUpdated: string;
}

interface ProjectTask {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
}

interface Notification {
  id: string;
  type: "new_project" | "task_due" | "message" | "deadline";
  title: string;
  description: string;
  time: string;
  read: boolean;
  projectId?: string;
  investorId?: string;
}

const mockInvestors: Investor[] = [
  {
    id: "1",
    name: "Marcus Chen",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
    type: "flipper",
    specialties: ["Single Family", "Fix & Flip"],
    location: "Austin, TX",
    projectsCompleted: 34,
    rating: 4.9,
    isPreferred: true,
    matchScore: 95,
    lastActive: "2 hours ago",
  },
  {
    id: "2",
    name: "Sarah Williams",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    type: "investor",
    specialties: ["Multi-family", "Buy & Hold"],
    location: "Austin, TX",
    projectsCompleted: 22,
    rating: 4.8,
    isPreferred: false,
    matchScore: 88,
    lastActive: "1 day ago",
  },
  {
    id: "3",
    name: "David Park",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    type: "wholesaler",
    specialties: ["Off-market deals", "Distressed properties"],
    location: "Round Rock, TX",
    projectsCompleted: 56,
    rating: 4.7,
    isPreferred: true,
    matchScore: 82,
    lastActive: "3 hours ago",
  },
  {
    id: "4",
    name: "Jennifer Torres",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
    type: "flipper",
    specialties: ["Luxury Rehabs", "New Construction"],
    location: "Cedar Park, TX",
    projectsCompleted: 18,
    rating: 4.9,
    isPreferred: false,
    matchScore: 79,
    lastActive: "5 hours ago",
  },
];

const mockProjects: ActiveProject[] = [
  {
    id: "1",
    title: "Oak Hill Flip",
    address: "2847 Oak Hill Dr, Austin, TX",
    status: "rehab",
    investor: mockInvestors[0],
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400",
    budget: "$285,000",
    deadline: "Mar 15, 2026",
    tasks: [
      { id: "t1", title: "Create CMA report", completed: true },
      { id: "t2", title: "Schedule photographer", completed: false, dueDate: "Feb 1" },
      { id: "t3", title: "Prepare listing copy", completed: false, dueDate: "Feb 5" },
      { id: "t4", title: "Review contractor bids", completed: true },
    ],
    unreadMessages: 3,
    lastUpdated: "2 hours ago",
  },
  {
    id: "2",
    title: "Downtown Condo Investment",
    address: "1200 Congress Ave #405, Austin, TX",
    status: "under_contract",
    investor: mockInvestors[1],
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400",
    budget: "$425,000",
    deadline: "Feb 28, 2026",
    tasks: [
      { id: "t5", title: "Coordinate inspection", completed: false, dueDate: "Jan 30" },
      { id: "t6", title: "Review HOA documents", completed: false },
      { id: "t7", title: "Submit earnest money", completed: true },
    ],
    unreadMessages: 0,
    lastUpdated: "1 day ago",
  },
  {
    id: "3",
    title: "South Lamar Duplex",
    address: "3456 S Lamar Blvd, Austin, TX",
    status: "scouting",
    investor: mockInvestors[2],
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400",
    budget: "$550,000",
    deadline: "TBD",
    tasks: [
      { id: "t8", title: "Run comparable analysis", completed: false },
      { id: "t9", title: "Schedule property viewing", completed: false, dueDate: "Jan 29" },
    ],
    unreadMessages: 1,
    lastUpdated: "4 hours ago",
  },
  {
    id: "4",
    title: "Pflugerville Starter Home",
    address: "789 Pecan St, Pflugerville, TX",
    status: "listing_soon",
    investor: mockInvestors[0],
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400",
    budget: "$320,000",
    deadline: "Feb 10, 2026",
    tasks: [
      { id: "t10", title: "Final walkthrough", completed: false, dueDate: "Feb 8" },
      { id: "t11", title: "Upload listing photos", completed: true },
      { id: "t12", title: "Set listing price", completed: true },
      { id: "t13", title: "Create virtual tour", completed: false },
    ],
    unreadMessages: 5,
    lastUpdated: "30 min ago",
  },
];

const mockNotifications: Notification[] = [
  {
    id: "n1",
    type: "new_project",
    title: "New Flip Project in Your Area",
    description: "Marcus Chen posted a new fix & flip opportunity in East Austin seeking a realtor partner.",
    time: "10 min ago",
    read: false,
    investorId: "1",
  },
  {
    id: "n2",
    type: "task_due",
    title: "Task Due Tomorrow",
    description: "Schedule photographer for Oak Hill Flip is due tomorrow.",
    time: "1 hour ago",
    read: false,
    projectId: "1",
  },
  {
    id: "n3",
    type: "message",
    title: "New Message from Sarah Williams",
    description: "Can we discuss the inspection findings for Downtown Condo?",
    time: "3 hours ago",
    read: true,
    investorId: "2",
  },
  {
    id: "n4",
    type: "deadline",
    title: "Listing Deadline Approaching",
    description: "Pflugerville Starter Home listing deadline is in 2 weeks.",
    time: "5 hours ago",
    read: true,
    projectId: "4",
  },
  {
    id: "n5",
    type: "new_project",
    title: "Investor Seeking Realtor",
    description: "Jennifer Torres is looking for a realtor for a luxury rehab in Westlake.",
    time: "1 day ago",
    read: true,
    investorId: "4",
  },
];

const statusConfig: Record<ProjectStatus, { label: string; color: string; bgColor: string }> = {
  scouting: { label: "Scouting", color: "#6366F1", bgColor: "#EEF2FF" },
  under_contract: { label: "Under Contract", color: "#272D53", bgColor: "#E8E9EE" },
  rehab: { label: "In Rehab", color: "#10B981", bgColor: "#ECFDF5" },
  listing_soon: { label: "Listing Soon", color: "#EC4899", bgColor: "#FCE7F3" },
};

export default function LeadsProjectsScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("projects");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState<ActiveProject | null>(null);
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all");
  const [investors, setInvestors] = useState(mockInvestors);
  const [notifications, setNotifications] = useState(mockNotifications);

  const dynamicStyles = useMemo(() => ({
    container: { backgroundColor: theme.background },
    header: { backgroundColor: theme.surface, borderBottomColor: theme.border },
    headerTitle: { color: theme.text },
    tabBar: { backgroundColor: theme.surface, borderBottomColor: theme.border },
    tabButton: { backgroundColor: "transparent" },
    tabButtonActive: { borderBottomColor: theme.navy },
    tabText: { color: theme.textSecondary },
    tabTextActive: { color: theme.navy },
    searchSection: { backgroundColor: theme.surface },
    searchInput: { backgroundColor: theme.surfaceSecondary, color: theme.text },
    card: { backgroundColor: theme.surface },
    cardTitle: { color: theme.text },
    cardSubtitle: { color: theme.textSecondary },
    sectionTitle: { color: theme.text },
    filterChip: { backgroundColor: theme.surface, borderColor: theme.border },
    filterChipActive: { backgroundColor: theme.navy, borderColor: theme.navy },
    filterChipText: { color: theme.textSecondary },
    filterChipTextActive: { color: theme.white },
    modalContainer: { backgroundColor: theme.background },
    modalHeader: { backgroundColor: theme.surface, borderBottomColor: theme.border },
    modalTitle: { color: theme.text },
  }), [theme, isDark]);

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const filteredProjects = useMemo(() => {
    let projects = mockProjects;
    if (statusFilter !== "all") {
      projects = projects.filter(p => p.status === statusFilter);
    }
    if (searchQuery) {
      projects = projects.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.investor.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return projects;
  }, [statusFilter, searchQuery]);

  const filteredInvestors = useMemo(() => {
    if (!searchQuery) return investors;
    return investors.filter(i =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      i.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [investors, searchQuery]);

  const preferredInvestors = useMemo(() => {
    return investors.filter(i => i.isPreferred);
  }, [investors]);

  const togglePreferred = (investorId: string) => {
    setInvestors(prev => prev.map(i =>
      i.id === investorId ? { ...i, isPreferred: !i.isPreferred } : i
    ));
  };

  const markNotificationRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    ));
  };

  const getTaskProgress = (tasks: ProjectTask[]) => {
    const completed = tasks.filter(t => t.completed).length;
    return { completed, total: tasks.length, percentage: (completed / tasks.length) * 100 };
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "projects":
        return renderProjectsTab();
      case "matches":
        return renderMatchesTab();
      case "notifications":
        return renderNotificationsTab();
      case "favorites":
        return renderFavoritesTab();
      default:
        return null;
    }
  };

  const renderProjectsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={[styles.filterSection, { borderBottomColor: theme.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {[
            { id: "all" as const, label: "All Projects" },
            { id: "scouting" as const, label: "Scouting" },
            { id: "under_contract" as const, label: "Under Contract" },
            { id: "rehab" as const, label: "In Rehab" },
            { id: "listing_soon" as const, label: "Listing Soon" },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterChip,
                dynamicStyles.filterChip,
                statusFilter === filter.id && dynamicStyles.filterChipActive,
              ]}
              onPress={() => setStatusFilter(filter.id)}
            >
              <Text style={[
                styles.filterChipText,
                dynamicStyles.filterChipText,
                statusFilter === filter.id && dynamicStyles.filterChipTextActive,
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.projectsList}>
        {filteredProjects.map((project) => {
          const progress = getTaskProgress(project.tasks);
          const status = statusConfig[project.status];
          
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
                  <View style={[styles.statusBadge, { backgroundColor: status.bgColor }]}>
                    <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                  </View>
                  {project.unreadMessages > 0 && (
                    <View style={styles.messageBadge}>
                      <MessageCircle size={12} color="#FFF" />
                      <Text style={styles.messageBadgeText}>{project.unreadMessages}</Text>
                    </View>
                  )}
                </View>
                
                <Text style={[styles.projectTitle, dynamicStyles.cardTitle]}>{project.title}</Text>
                <View style={styles.projectAddressRow}>
                  <MapPin size={12} color={theme.textSecondary} />
                  <Text style={[styles.projectAddress, dynamicStyles.cardSubtitle]} numberOfLines={1}>
                    {project.address}
                  </Text>
                </View>

                <View style={styles.projectMeta}>
                  <View style={styles.investorChip}>
                    <Image source={{ uri: project.investor.avatar }} style={styles.investorAvatar} />
                    <Text style={[styles.investorName, { color: theme.textSecondary }]}>{project.investor.name}</Text>
                  </View>
                  <Text style={[styles.projectBudget, { color: theme.navy }]}>{project.budget}</Text>
                </View>

                <View style={styles.taskProgressSection}>
                  <View style={styles.taskProgressHeader}>
                    <Text style={[styles.taskProgressLabel, { color: theme.textSecondary }]}>
                      Tasks: {progress.completed}/{progress.total}
                    </Text>
                    <Text style={[styles.taskProgressPercent, { color: theme.navy }]}>
                      {Math.round(progress.percentage)}%
                    </Text>
                  </View>
                  <View style={[styles.progressBar, { backgroundColor: theme.surfaceSecondary }]}>
                    <View 
                      style={[styles.progressFill, { width: `${progress.percentage}%`, backgroundColor: theme.navy }]} 
                    />
                  </View>
                </View>

                <View style={styles.projectFooter}>
                  <View style={styles.deadlineRow}>
                    <Calendar size={12} color={theme.textSecondary} />
                    <Text style={[styles.deadlineText, { color: theme.textSecondary }]}>{project.deadline}</Text>
                  </View>
                  <Text style={[styles.lastUpdated, { color: theme.textTertiary }]}>{project.lastUpdated}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={{ height: 120 }} />
    </ScrollView>
  );

  const renderMatchesTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={[styles.matchesHeader, { backgroundColor: isDark ? "#312E81" : "#EEF2FF" }]}>
        <Zap size={20} color={theme.navy} />
        <View style={styles.matchesHeaderText}>
          <Text style={[styles.matchesTitle, { color: theme.navy }]}>AI-Powered Matching</Text>
          <Text style={[styles.matchesSubtitle, { color: theme.textSecondary }]}>
            Investors matched to your specialty & location
          </Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Recommended Matches</Text>

      {filteredInvestors.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0)).map((investor) => (
        <TouchableOpacity
          key={investor.id}
          style={[styles.investorCard, dynamicStyles.card]}
          activeOpacity={0.7}
        >
          <View style={styles.investorCardHeader}>
            <Image source={{ uri: investor.avatar }} style={styles.investorCardAvatar} />
            <View style={styles.investorCardInfo}>
              <View style={styles.investorNameRow}>
                <Text style={[styles.investorCardName, dynamicStyles.cardTitle]}>{investor.name}</Text>
                {investor.matchScore && (
                  <View style={[styles.matchScoreBadge, { backgroundColor: isDark ? "#312E81" : "#EEF2FF" }]}>
                    <Target size={10} color={theme.navy} />
                    <Text style={[styles.matchScoreText, { color: theme.navy }]}>{investor.matchScore}%</Text>
                  </View>
                )}
              </View>
              <View style={styles.investorTypeRow}>
                <Text style={[styles.investorType, { color: theme.textSecondary }]}>
                  {investor.type.charAt(0).toUpperCase() + investor.type.slice(1)}
                </Text>
                <Text style={[styles.investorDot, { color: theme.textTertiary }]}>•</Text>
                <Text style={[styles.investorLocation, { color: theme.textSecondary }]}>{investor.location}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.preferredButton}
              onPress={() => togglePreferred(investor.id)}
            >
              {investor.isPreferred ? (
                <Star size={22} color="#272D53" fill="#272D53" />
              ) : (
                <StarOff size={22} color={theme.textTertiary} />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.specialtiesRow}>
            {investor.specialties.map((spec, idx) => (
              <View key={idx} style={[styles.specialtyChip, { backgroundColor: theme.surfaceSecondary }]}>
                <Text style={[styles.specialtyText, { color: theme.textSecondary }]}>{spec}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.investorStats, { borderTopColor: theme.borderLight }]}>
            <View style={styles.statItem}>
              <Briefcase size={14} color={theme.textSecondary} />
              <Text style={[styles.statValue, { color: theme.text }]}>{investor.projectsCompleted}</Text>
              <Text style={[styles.statLabel, { color: theme.textTertiary }]}>Projects</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.borderLight }]} />
            <View style={styles.statItem}>
              <Star size={14} color="#272D53" />
              <Text style={[styles.statValue, { color: theme.text }]}>{investor.rating}</Text>
              <Text style={[styles.statLabel, { color: theme.textTertiary }]}>Rating</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.borderLight }]} />
            <View style={styles.statItem}>
              <Clock size={14} color={theme.textSecondary} />
              <Text style={[styles.statValue, { color: theme.text }]}>{investor.lastActive}</Text>
            </View>
          </View>

          <View style={styles.investorActions}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.surfaceSecondary }]}>
              <MessageCircle size={16} color={theme.navy} />
              <Text style={[styles.actionBtnText, { color: theme.navy }]}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.primaryBtn, { backgroundColor: theme.navy }]}>
              <UserPlus size={16} color="#FFF" />
              <Text style={[styles.actionBtnText, { color: "#FFF" }]}>Connect</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}
      <View style={{ height: 120 }} />
    </ScrollView>
  );

  const renderNotificationsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {notifications.map((notification) => {
        const iconConfig = {
          new_project: { icon: Home, color: "#6366F1", bg: "#EEF2FF" },
          task_due: { icon: CheckSquare, color: "#272D53", bg: "#E8E9EE" },
          message: { icon: MessageCircle, color: "#10B981", bg: "#ECFDF5" },
          deadline: { icon: Calendar, color: "#EC4899", bg: "#FCE7F3" },
        }[notification.type];
        const IconComponent = iconConfig.icon;

        return (
          <TouchableOpacity
            key={notification.id}
            style={[
              styles.notificationCard,
              dynamicStyles.card,
              !notification.read && styles.unreadNotification,
            ]}
            onPress={() => markNotificationRead(notification.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.notificationIcon, { backgroundColor: iconConfig.bg }]}>
              <IconComponent size={18} color={iconConfig.color} />
            </View>
            <View style={styles.notificationContent}>
              <Text style={[styles.notificationTitle, dynamicStyles.cardTitle]}>{notification.title}</Text>
              <Text style={[styles.notificationDesc, dynamicStyles.cardSubtitle]} numberOfLines={2}>
                {notification.description}
              </Text>
              <Text style={[styles.notificationTime, { color: theme.textTertiary }]}>{notification.time}</Text>
            </View>
            {!notification.read && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        );
      })}
      <View style={{ height: 120 }} />
    </ScrollView>
  );

  const renderFavoritesTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Preferred Partners</Text>
      <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
        Your saved investors and flippers for quick access
      </Text>

      {preferredInvestors.length === 0 ? (
        <View style={[styles.emptyState, dynamicStyles.card]}>
          <Star size={40} color={theme.textTertiary} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No Favorites Yet</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Star investors and flippers to add them to your quick access list
          </Text>
        </View>
      ) : (
        preferredInvestors.map((investor) => (
          <TouchableOpacity
            key={investor.id}
            style={[styles.favoriteCard, dynamicStyles.card]}
            activeOpacity={0.7}
          >
            <Image source={{ uri: investor.avatar }} style={styles.favoriteAvatar} />
            <View style={styles.favoriteInfo}>
              <Text style={[styles.favoriteName, dynamicStyles.cardTitle]}>{investor.name}</Text>
              <Text style={[styles.favoriteType, dynamicStyles.cardSubtitle]}>
                {investor.type.charAt(0).toUpperCase() + investor.type.slice(1)} • {investor.projectsCompleted} projects
              </Text>
            </View>
            <View style={styles.favoriteActions}>
              <TouchableOpacity style={[styles.iconBtn, { backgroundColor: theme.surfaceSecondary }]}>
                <MessageCircle size={18} color={theme.navy} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconBtn, { backgroundColor: "#E8E9EE" }]}
                onPress={() => togglePreferred(investor.id)}
              >
                <Star size={18} color="#272D53" fill="#272D53" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))
      )}
      <View style={{ height: 120 }} />
    </ScrollView>
  );

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={[styles.header, dynamicStyles.header]}>
          <View>
            <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>Leads & Projects</Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              Collaborate with investors & flippers
            </Text>
          </View>
          <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.navy }]}>
            <Plus size={20} color="#FFF" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        <View style={[styles.searchSection, dynamicStyles.searchSection]}>
          <View style={[styles.searchInputWrapper, dynamicStyles.searchInput]}>
            <Search size={18} color={theme.textTertiary} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Search projects, investors..."
              placeholderTextColor={theme.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <X size={18} color={theme.textTertiary} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <View style={[styles.tabBar, dynamicStyles.tabBar]}>
          {[
            { id: "projects" as const, label: "Projects", icon: Briefcase },
            { id: "matches" as const, label: "Matches", icon: Users },
            { id: "notifications" as const, label: "Alerts", icon: Bell, badge: unreadNotifications },
            { id: "favorites" as const, label: "Favorites", icon: Star },
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabButton, isActive && dynamicStyles.tabButtonActive]}
                onPress={() => setActiveTab(tab.id)}
              >
                <View style={styles.tabIconContainer}>
                  <TabIcon size={18} color={isActive ? theme.navy : theme.textSecondary} />
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
        visible={!!selectedProject}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedProject(null)}
      >
        {selectedProject && (
          <SafeAreaView style={[styles.modalContainer, dynamicStyles.modalContainer]}>
            <View style={[styles.modalHeader, dynamicStyles.modalHeader]}>
              <TouchableOpacity onPress={() => setSelectedProject(null)}>
                <X size={24} color={theme.textSecondary} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, dynamicStyles.modalTitle]}>Project Details</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.modalContent}>
              <Image source={{ uri: selectedProject.image }} style={styles.modalImage} contentFit="cover" />
              
              <View style={styles.modalBody}>
                <View style={[styles.statusBadge, { backgroundColor: statusConfig[selectedProject.status].bgColor }]}>
                  <Text style={[styles.statusText, { color: statusConfig[selectedProject.status].color }]}>
                    {statusConfig[selectedProject.status].label}
                  </Text>
                </View>
                
                <Text style={[styles.modalProjectTitle, { color: theme.text }]}>{selectedProject.title}</Text>
                <View style={styles.modalAddressRow}>
                  <MapPin size={14} color={theme.textSecondary} />
                  <Text style={[styles.modalAddress, { color: theme.textSecondary }]}>{selectedProject.address}</Text>
                </View>

                <View style={[styles.modalInfoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <View style={styles.modalInfoRow}>
                    <Text style={[styles.modalInfoLabel, { color: theme.textSecondary }]}>Budget</Text>
                    <Text style={[styles.modalInfoValue, { color: theme.text }]}>{selectedProject.budget}</Text>
                  </View>
                  <View style={[styles.modalDivider, { backgroundColor: theme.borderLight }]} />
                  <View style={styles.modalInfoRow}>
                    <Text style={[styles.modalInfoLabel, { color: theme.textSecondary }]}>Deadline</Text>
                    <Text style={[styles.modalInfoValue, { color: theme.text }]}>{selectedProject.deadline}</Text>
                  </View>
                </View>

                <View style={[styles.modalInvestorCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <Image source={{ uri: selectedProject.investor.avatar }} style={styles.modalInvestorAvatar} />
                  <View style={styles.modalInvestorInfo}>
                    <Text style={[styles.modalInvestorName, { color: theme.text }]}>{selectedProject.investor.name}</Text>
                    <Text style={[styles.modalInvestorType, { color: theme.textSecondary }]}>
                      {selectedProject.investor.type.charAt(0).toUpperCase() + selectedProject.investor.type.slice(1)}
                    </Text>
                  </View>
                  <TouchableOpacity style={[styles.messageBtn, { backgroundColor: theme.navy }]}>
                    <MessageCircle size={18} color="#FFF" />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.tasksTitle, { color: theme.text }]}>Tasks</Text>
                {selectedProject.tasks.map((task) => (
                  <View key={task.id} style={[styles.taskItem, { borderBottomColor: theme.borderLight }]}>
                    <View style={[styles.taskCheckbox, task.completed && styles.taskCheckboxCompleted, { borderColor: task.completed ? theme.navy : theme.border }]}>
                      {task.completed && <CheckSquare size={14} color={theme.navy} />}
                    </View>
                    <View style={styles.taskInfo}>
                      <Text style={[styles.taskTitle, { color: theme.text }, task.completed && styles.taskTitleCompleted]}>
                        {task.title}
                      </Text>
                      {task.dueDate && (
                        <Text style={[styles.taskDue, { color: theme.textTertiary }]}>Due: {task.dueDate}</Text>
                      )}
                    </View>
                  </View>
                ))}

                <View style={styles.modalActions}>
                  <TouchableOpacity style={[styles.modalActionBtn, { backgroundColor: theme.surfaceSecondary }]}>
                    <FileText size={18} color={theme.navy} />
                    <Text style={[styles.modalActionText, { color: theme.navy }]}>Documents</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalActionBtn, { backgroundColor: theme.surfaceSecondary }]}>
                    <MessageCircle size={18} color={theme.navy} />
                    <Text style={[styles.modalActionText, { color: theme.navy }]}>Chat</Text>
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
  addButton: {
    width: 40,
    height: 40,
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
  filterSection: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 8,
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
  filterChipText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#6B7280",
  },
  projectsList: {
    padding: 20,
  },
  projectCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
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
  messageBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EF4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  messageBadgeText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: "#FFF",
  },
  projectTitle: {
    fontSize: 17,
    fontWeight: "600" as const,
    marginBottom: 4,
  },
  projectAddressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 12,
  },
  projectAddress: {
    fontSize: 13,
    flex: 1,
  },
  projectMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  investorChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  investorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  investorName: {
    fontSize: 13,
    fontWeight: "500" as const,
  },
  projectBudget: {
    fontSize: 15,
    fontWeight: "700" as const,
  },
  taskProgressSection: {
    marginBottom: 12,
  },
  taskProgressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  taskProgressLabel: {
    fontSize: 12,
  },
  taskProgressPercent: {
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
  deadlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  deadlineText: {
    fontSize: 12,
  },
  lastUpdated: {
    fontSize: 11,
  },
  matchesHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    margin: 20,
    marginBottom: 0,
    padding: 16,
    borderRadius: 14,
  },
  matchesHeaderText: {
    flex: 1,
  },
  matchesTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  matchesSubtitle: {
    fontSize: 12,
    marginTop: 2,
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
    paddingBottom: 12,
  },
  investorCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
  },
  investorCardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  investorCardAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  investorCardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  investorNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  investorCardName: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  matchScoreBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  matchScoreText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  investorTypeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  investorType: {
    fontSize: 13,
  },
  investorDot: {
    marginHorizontal: 6,
  },
  investorLocation: {
    fontSize: 13,
  },
  preferredButton: {
    padding: 4,
  },
  specialtiesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  specialtyChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  specialtyText: {
    fontSize: 12,
  },
  investorStats: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  statItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  statLabel: {
    fontSize: 11,
  },
  statDivider: {
    width: 1,
    height: 24,
  },
  investorActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  primaryBtn: {},
  actionBtnText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  notificationCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginHorizontal: 20,
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
  },
  unreadNotification: {
    borderLeftWidth: 3,
    borderLeftColor: "#6366F1",
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationContent: {
    flex: 1,
    marginLeft: 12,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    marginBottom: 4,
  },
  notificationDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 11,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#6366F1",
    marginLeft: 8,
    marginTop: 4,
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
  favoriteCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 14,
    borderRadius: 14,
  },
  favoriteAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  favoriteInfo: {
    flex: 1,
    marginLeft: 12,
  },
  favoriteName: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  favoriteType: {
    fontSize: 13,
    marginTop: 2,
  },
  favoriteActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
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
  modalProjectTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    marginTop: 12,
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
  modalInfoCard: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
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
  modalInvestorCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
  },
  modalInvestorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  modalInvestorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  modalInvestorName: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  modalInvestorType: {
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
  tasksTitle: {
    fontSize: 17,
    fontWeight: "600" as const,
    marginBottom: 12,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  taskCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  taskCheckboxCompleted: {
    backgroundColor: "#EEF2FF",
  },
  taskInfo: {
    flex: 1,
    marginLeft: 12,
  },
  taskTitle: {
    fontSize: 14,
  },
  taskTitleCompleted: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  taskDue: {
    fontSize: 12,
    marginTop: 2,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  modalActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  modalActionText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
});
