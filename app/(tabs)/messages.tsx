import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Modal,
  Alert,
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
  Calendar,
  FileText,
  Phone,
  Clock,
  MapPin,
  ChevronRight,
  Copy,
  Send,
  X,
  Home,
  Share2,
  Video,
  MessageSquare,
  PhoneCall,
  PhoneOutgoing,
  PhoneIncoming,
  Building2,
  User,
  Briefcase,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import Colors from "@/constants/colors";
import { mockConversations } from "@/mocks/messages";
import { Conversation } from "@/types";

type FilterType = "all" | "direct" | "team";
type MainTab = "messages" | "schedule" | "templates" | "calls";
type ContactType = "buyer" | "seller" | "investor" | "firm" | "all";

interface ScheduleEvent {
  id: string;
  title: string;
  type: "showing" | "listing" | "strategy" | "meeting";
  date: string;
  time: string;
  location?: string;
  contactName: string;
  contactAvatar: string;
  contactType: ContactType;
  propertyAddress?: string;
  notes?: string;
}

interface MessageTemplate {
  id: string;
  category: "introduction" | "followup" | "confirmation" | "listing";
  title: string;
  content: string;
  tags: string[];
}

interface CallLog {
  id: string;
  contactName: string;
  contactAvatar: string;
  contactType: ContactType;
  type: "incoming" | "outgoing" | "missed";
  method: "call" | "text" | "video";
  timestamp: string;
  duration?: string;
  projectName?: string;
  notes?: string;
}

const mockScheduleEvents: ScheduleEvent[] = [
  {
    id: "evt-1",
    title: "Property Showing",
    type: "showing",
    date: "2026-01-27",
    time: "10:00 AM",
    location: "123 Oak Street, Austin, TX",
    contactName: "Marcus Chen",
    contactAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    contactType: "buyer",
    propertyAddress: "123 Oak Street",
    notes: "First-time buyer, interested in 3BR homes",
  },
  {
    id: "evt-2",
    title: "Listing Appointment",
    type: "listing",
    date: "2026-01-27",
    time: "2:00 PM",
    location: "456 Maple Ave, Austin, TX",
    contactName: "Jennifer Walsh",
    contactAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    contactType: "seller",
    propertyAddress: "456 Maple Ave",
    notes: "Preparing CMA presentation",
  },
  {
    id: "evt-3",
    title: "Strategy Call",
    type: "strategy",
    date: "2026-01-28",
    time: "9:00 AM",
    contactName: "David Rodriguez",
    contactAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
    contactType: "investor",
    notes: "Discuss Q1 investment opportunities",
  },
  {
    id: "evt-4",
    title: "Team Meeting",
    type: "meeting",
    date: "2026-01-28",
    time: "11:00 AM",
    location: "Keller Williams Office",
    contactName: "Regional Team",
    contactAvatar: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200",
    contactType: "firm",
    notes: "Monthly performance review",
  },
  {
    id: "evt-5",
    title: "Investor Walkthrough",
    type: "showing",
    date: "2026-01-29",
    time: "3:30 PM",
    location: "789 Pine Road, Austin, TX",
    contactName: "Robert Kim",
    contactAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
    contactType: "investor",
    propertyAddress: "789 Pine Road",
    notes: "Potential flip property - needs renovation estimate",
  },
];

const mockTemplates: MessageTemplate[] = [
  {
    id: "tpl-1",
    category: "introduction",
    title: "New Buyer Introduction",
    content: "Hi [Name],\n\nThank you for reaching out! I'm excited to help you find your perfect home. I specialize in [Area] and have helped many buyers navigate the market successfully.\n\nWould you be available for a quick call to discuss your needs and timeline? I'd love to learn more about what you're looking for.\n\nBest regards,\n[Your Name]",
    tags: ["buyer", "first contact"],
  },
  {
    id: "tpl-2",
    category: "introduction",
    title: "Investor Introduction",
    content: "Hi [Name],\n\nI received your inquiry about investment properties in [Area]. I work with several investors and have a good pulse on off-market deals and properties with strong ROI potential.\n\nLet's schedule a call to discuss your investment criteria and goals.\n\nLooking forward to connecting,\n[Your Name]",
    tags: ["investor", "first contact"],
  },
  {
    id: "tpl-3",
    category: "followup",
    title: "Post-Showing Follow-up",
    content: "Hi [Name],\n\nIt was great showing you [Property Address] today! I wanted to follow up and see if you have any questions about the property.\n\nHere are some key points we discussed:\n- [Point 1]\n- [Point 2]\n- [Point 3]\n\nLet me know if you'd like to schedule a second viewing or if there are other properties you'd like to see.\n\nBest,\n[Your Name]",
    tags: ["showing", "follow-up"],
  },
  {
    id: "tpl-4",
    category: "followup",
    title: "Weekly Market Update",
    content: "Hi [Name],\n\nHope you're having a great week! I wanted to share some updates on the [Area] market:\n\n📊 New Listings: [X] properties\n📈 Average Days on Market: [X] days\n💰 Price Range: $[X] - $[Y]\n\nI've attached a few properties that match your criteria. Let me know if any catch your eye!\n\nBest,\n[Your Name]",
    tags: ["market update", "nurture"],
  },
  {
    id: "tpl-5",
    category: "confirmation",
    title: "Showing Confirmation",
    content: "Hi [Name],\n\nThis is a confirmation for our property showing:\n\n📅 Date: [Date]\n⏰ Time: [Time]\n📍 Address: [Property Address]\n\nPlease let me know if you need to reschedule. I'll meet you at the property.\n\nSee you then!\n[Your Name]",
    tags: ["showing", "confirmation"],
  },
  {
    id: "tpl-6",
    category: "confirmation",
    title: "Listing Appointment Confirmation",
    content: "Hi [Name],\n\nI'm confirming our listing appointment:\n\n📅 Date: [Date]\n⏰ Time: [Time]\n📍 Your Property: [Address]\n\nI'll bring the CMA and discuss our marketing strategy. Please have any questions ready!\n\nLooking forward to it,\n[Your Name]",
    tags: ["listing", "confirmation"],
  },
  {
    id: "tpl-7",
    category: "listing",
    title: "New Listing Announcement",
    content: "🏠 Just Listed!\n\n[Property Address]\n\n✨ [Beds] BR | [Baths] BA | [SqFt] sq ft\n💰 Listed at $[Price]\n\nHighlights:\n• [Feature 1]\n• [Feature 2]\n• [Feature 3]\n\nPerfect for [buyer type]. Schedule a private showing today!\n\nContact me for more details.",
    tags: ["listing", "announcement"],
  },
  {
    id: "tpl-8",
    category: "listing",
    title: "Share to Investor Pipeline",
    content: "🎯 Investment Opportunity\n\n[Property Address]\n\n📊 Key Numbers:\n• List Price: $[Price]\n• ARV Estimate: $[ARV]\n• Rehab Estimate: $[Rehab]\n• Potential ROI: [X]%\n\nProperty needs: [Brief description]\n\nInterested? Let's discuss.\n\n[Your Name]",
    tags: ["investor", "opportunity"],
  },
];

const mockCallLogs: CallLog[] = [
  {
    id: "call-1",
    contactName: "Marcus Chen",
    contactAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    contactType: "buyer",
    type: "outgoing",
    method: "call",
    timestamp: "2026-01-27T09:30:00Z",
    duration: "12:45",
    projectName: "123 Oak Street Search",
    notes: "Discussed budget and preferences",
  },
  {
    id: "call-2",
    contactName: "Jennifer Walsh",
    contactAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    contactType: "seller",
    type: "incoming",
    method: "call",
    timestamp: "2026-01-27T08:15:00Z",
    duration: "8:22",
    projectName: "456 Maple Ave Listing",
    notes: "Confirmed listing appointment",
  },
  {
    id: "call-3",
    contactName: "David Rodriguez",
    contactAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
    contactType: "investor",
    type: "outgoing",
    method: "text",
    timestamp: "2026-01-26T16:45:00Z",
    projectName: "Q1 Investments",
    notes: "Sent property analysis report",
  },
  {
    id: "call-4",
    contactName: "Keller Williams Office",
    contactAvatar: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200",
    contactType: "firm",
    type: "incoming",
    method: "video",
    timestamp: "2026-01-26T14:00:00Z",
    duration: "45:00",
    notes: "Weekly team sync",
  },
  {
    id: "call-5",
    contactName: "Robert Kim",
    contactAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
    contactType: "investor",
    type: "missed",
    method: "call",
    timestamp: "2026-01-26T11:30:00Z",
    projectName: "789 Pine Road Flip",
  },
  {
    id: "call-6",
    contactName: "Sarah Martinez",
    contactAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
    contactType: "buyer",
    type: "outgoing",
    method: "text",
    timestamp: "2026-01-25T17:20:00Z",
    notes: "Sent showing confirmation",
  },
];

export default function MessagesScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [activeTab, setActiveTab] = useState<MainTab>("messages");
  const [templateCategory, setTemplateCategory] = useState<string>("all");
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [callFilter, setCallFilter] = useState<ContactType>("all");

  const dynamicStyles = useMemo(() => ({
    container: { backgroundColor: theme.background },
    safeArea: { backgroundColor: theme.surface },
    title: { color: theme.text },
    newChatButton: { backgroundColor: theme.primary },
    searchBox: { backgroundColor: theme.surfaceSecondary },
    searchInput: { color: theme.text },
    filterChip: { backgroundColor: theme.surface, borderColor: theme.border },
    filterChipActive: { backgroundColor: theme.navy, borderColor: theme.navy },
    filterText: { color: theme.textSecondary },
    filterTextActive: { color: theme.white },
    conversationItem: { backgroundColor: theme.surface, borderBottomColor: theme.borderLight },
    conversationName: { color: theme.text },
    timestamp: { color: theme.textTertiary },
    messagePreview: { color: theme.textSecondary },
    unreadPreview: { color: theme.text },
    onlineIndicator: { borderColor: theme.surface },
    teamBadge: { borderColor: theme.surface },
    emptyTitle: { color: theme.text },
    emptyText: { color: theme.textSecondary },
    tabActive: { backgroundColor: theme.primary },
    tabInactive: { backgroundColor: theme.surfaceSecondary },
  }), [theme]);

  const filteredConversations = mockConversations.filter((conv) => {
    const matchesSearch = conv.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === "all" || conv.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredTemplates = mockTemplates.filter((tpl) => {
    if (templateCategory === "all") return true;
    return tpl.category === templateCategory;
  });

  const filteredCallLogs = mockCallLogs.filter((log) => {
    if (callFilter === "all") return true;
    return log.contactType === callFilter;
  });

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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
    }
  };

  const copyTemplate = useCallback((content: string) => {
    Alert.alert("Copied!", "Template copied to clipboard");
    setSelectedTemplate(null);
  }, []);

  const getEventTypeColor = (type: ScheduleEvent["type"]) => {
    switch (type) {
      case "showing": return "#10B981";
      case "listing": return "#3B82F6";
      case "strategy": return "#8B5CF6";
      case "meeting": return "#272D53";
      default: return theme.primary;
    }
  };

  const getContactTypeIcon = (type: ContactType) => {
    switch (type) {
      case "buyer": return User;
      case "seller": return Home;
      case "investor": return Briefcase;
      case "firm": return Building2;
      default: return User;
    }
  };

  const getCallIcon = (log: CallLog) => {
    if (log.method === "text") return MessageSquare;
    if (log.method === "video") return Video;
    if (log.type === "incoming") return PhoneIncoming;
    if (log.type === "outgoing") return PhoneOutgoing;
    return Phone;
  };

  const getCallColor = (type: CallLog["type"]) => {
    switch (type) {
      case "incoming": return "#10B981";
      case "outgoing": return "#3B82F6";
      case "missed": return "#EF4444";
      default: return theme.textSecondary;
    }
  };

  const renderMainTabs = () => (
    <View style={styles.mainTabsContainer}>
      {[
        { key: "messages", icon: MessageCircle, label: "Messages" },
        { key: "schedule", icon: Calendar, label: "Schedule" },
        { key: "templates", icon: FileText, label: "Templates" },
        { key: "calls", icon: Phone, label: "Call Log" },
      ].map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.mainTab,
            activeTab === tab.key ? dynamicStyles.tabActive : dynamicStyles.tabInactive,
          ]}
          onPress={() => setActiveTab(tab.key as MainTab)}
        >
          <tab.icon
            size={16}
            color={activeTab === tab.key ? theme.white : theme.textSecondary}
          />
          <Text
            style={[
              styles.mainTabText,
              { color: activeTab === tab.key ? theme.white : theme.textSecondary },
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderMessagesTab = () => (
    <>
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, dynamicStyles.searchBox]}>
          <Search size={18} color={theme.textTertiary} />
          <TextInput
            style={[styles.searchInput, dynamicStyles.searchInput]}
            placeholder="Search conversations"
            placeholderTextColor={theme.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterChip, dynamicStyles.filterChip, activeFilter === "all" && dynamicStyles.filterChipActive]}
          onPress={() => setActiveFilter("all")}
        >
          <Text style={[styles.filterText, dynamicStyles.filterText, activeFilter === "all" && dynamicStyles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, dynamicStyles.filterChip, activeFilter === "direct" && dynamicStyles.filterChipActive]}
          onPress={() => setActiveFilter("direct")}
        >
          <MessageCircle size={14} color={activeFilter === "direct" ? theme.white : theme.textSecondary} />
          <Text style={[styles.filterText, dynamicStyles.filterText, activeFilter === "direct" && dynamicStyles.filterTextActive]}>
            Direct
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, dynamicStyles.filterChip, activeFilter === "team" && dynamicStyles.filterChipActive]}
          onPress={() => setActiveFilter("team")}
        >
          <Users size={14} color={activeFilter === "team" ? theme.white : theme.textSecondary} />
          <Text style={[styles.filterText, dynamicStyles.filterText, activeFilter === "team" && dynamicStyles.filterTextActive]}>
            Team
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredConversations.length === 0 ? (
          <View style={styles.emptyState}>
            <MessageCircle size={48} color={theme.textTertiary} />
            <Text style={[styles.emptyTitle, dynamicStyles.emptyTitle]}>No conversations</Text>
            <Text style={[styles.emptyText, dynamicStyles.emptyText]}>
              Start a new conversation with your contacts
            </Text>
          </View>
        ) : (
          filteredConversations.map((conversation) => {
            const isUnread = conversation.unreadCount > 0;
            return (
              <TouchableOpacity
                key={conversation.id}
                style={[styles.conversationItem, dynamicStyles.conversationItem]}
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
                      <View style={[styles.teamBadge, dynamicStyles.teamBadge, { backgroundColor: theme.primary }]}>
                        <Users size={10} color={theme.white} />
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
                        <View style={[styles.onlineIndicator, dynamicStyles.onlineIndicator, { backgroundColor: theme.success }]} />
                      )}
                    </View>
                  )}
                </View>
                <View style={styles.conversationContent}>
                  <View style={styles.conversationHeader}>
                    <View style={styles.nameRow}>
                      <Text style={[styles.conversationName, dynamicStyles.conversationName, isUnread && styles.unreadText]} numberOfLines={1}>
                        {conversation.name}
                      </Text>
                      {conversation.isEncrypted && (
                        <Lock size={12} color={theme.success} style={styles.lockIcon} />
                      )}
                    </View>
                    <Text style={[styles.timestamp, dynamicStyles.timestamp, isUnread && { color: theme.primary, fontWeight: "600" as const }]}>
                      {conversation.lastMessage ? formatTime(conversation.lastMessage.timestamp) : ""}
                    </Text>
                  </View>
                  <View style={styles.messagePreviewRow}>
                    <View style={styles.messagePreviewContainer}>
                      {conversation.lastMessage?.senderId === "current-user" && (
                        <View style={styles.readStatus}>
                          {conversation.lastMessage.isRead ? (
                            <CheckCheck size={14} color={theme.primary} />
                          ) : (
                            <Check size={14} color={theme.textTertiary} />
                          )}
                        </View>
                      )}
                      <Text style={[styles.messagePreview, dynamicStyles.messagePreview, isUnread && dynamicStyles.unreadPreview]} numberOfLines={1}>
                        {conversation.type === "team" && conversation.lastMessage?.senderId !== "current-user" 
                          ? `${conversation.lastMessage?.senderName?.split(" ")[0]}: ${conversation.lastMessage?.content}`
                          : conversation.lastMessage?.content
                        }
                      </Text>
                    </View>
                    {isUnread && (
                      <View style={[styles.unreadBadge, { backgroundColor: theme.primary }]}>
                        <Text style={[styles.unreadCount, { color: theme.white }]}>{conversation.unreadCount}</Text>
                      </View>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.shareButton, { backgroundColor: theme.surfaceSecondary }]}
                  onPress={() => setShareModalVisible(true)}
                >
                  <Share2 size={16} color={theme.primary} />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })
        )}
        <View style={{ height: Platform.OS === "ios" ? 100 : 80 }} />
      </ScrollView>
    </>
  );

  const renderScheduleTab = () => (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scheduleContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.scheduleHeader}>
        <Text style={[styles.scheduleTitle, { color: theme.text }]}>Upcoming Events</Text>
        <TouchableOpacity style={[styles.addEventButton, { backgroundColor: theme.primary }]}>
          <Plus size={16} color={theme.white} />
          <Text style={[styles.addEventText, { color: theme.white }]}>Add Event</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.calendarSyncBanner, { backgroundColor: `${theme.primary}15` }]}>
        <Calendar size={18} color={theme.primary} />
        <Text style={[styles.calendarSyncText, { color: theme.primary }]}>
          Sync with your calendar for automatic updates
        </Text>
        <TouchableOpacity>
          <Text style={[styles.calendarSyncLink, { color: theme.primary }]}>Connect</Text>
        </TouchableOpacity>
      </View>

      {mockScheduleEvents.map((event) => (
        <TouchableOpacity
          key={event.id}
          style={[styles.eventCard, { backgroundColor: theme.surface }]}
          activeOpacity={0.7}
        >
          <View style={[styles.eventTypeIndicator, { backgroundColor: getEventTypeColor(event.type) }]} />
          <View style={styles.eventContent}>
            <View style={styles.eventHeader}>
              <View style={styles.eventTitleRow}>
                <Text style={[styles.eventTitle, { color: theme.text }]}>{event.title}</Text>
                <View style={[styles.eventTypeBadge, { backgroundColor: `${getEventTypeColor(event.type)}20` }]}>
                  <Text style={[styles.eventTypeText, { color: getEventTypeColor(event.type) }]}>
                    {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                  </Text>
                </View>
              </View>
              <View style={styles.eventDateTime}>
                <Calendar size={14} color={theme.textSecondary} />
                <Text style={[styles.eventDateText, { color: theme.textSecondary }]}>
                  {formatDate(event.date)}
                </Text>
                <Clock size={14} color={theme.textSecondary} />
                <Text style={[styles.eventTimeText, { color: theme.textSecondary }]}>
                  {event.time}
                </Text>
              </View>
            </View>

            {event.location && (
              <View style={styles.eventLocation}>
                <MapPin size={14} color={theme.textTertiary} />
                <Text style={[styles.eventLocationText, { color: theme.textSecondary }]} numberOfLines={1}>
                  {event.location}
                </Text>
              </View>
            )}

            <View style={styles.eventContact}>
              <Image
                source={{ uri: event.contactAvatar }}
                style={styles.eventContactAvatar}
                contentFit="cover"
              />
              <View style={styles.eventContactInfo}>
                <Text style={[styles.eventContactName, { color: theme.text }]}>{event.contactName}</Text>
                <View style={styles.eventContactType}>
                  {React.createElement(getContactTypeIcon(event.contactType), {
                    size: 12,
                    color: theme.textTertiary,
                  })}
                  <Text style={[styles.eventContactTypeText, { color: theme.textTertiary }]}>
                    {event.contactType.charAt(0).toUpperCase() + event.contactType.slice(1)}
                  </Text>
                </View>
              </View>
              <ChevronRight size={18} color={theme.textTertiary} />
            </View>

            {event.notes && (
              <Text style={[styles.eventNotes, { color: theme.textSecondary }]} numberOfLines={2}>
                {event.notes}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      ))}
      <View style={{ height: Platform.OS === "ios" ? 100 : 80 }} />
    </ScrollView>
  );

  const renderTemplatesTab = () => (
    <>
      <View style={styles.templateCategoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.templateCategoryScroll}>
          {["all", "introduction", "followup", "confirmation", "listing"].map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.templateCategoryChip,
                templateCategory === cat ? dynamicStyles.tabActive : dynamicStyles.tabInactive,
              ]}
              onPress={() => setTemplateCategory(cat)}
            >
              <Text
                style={[
                  styles.templateCategoryText,
                  { color: templateCategory === cat ? theme.white : theme.textSecondary },
                ]}
              >
                {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.templatesContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredTemplates.map((template) => (
          <TouchableOpacity
            key={template.id}
            style={[styles.templateCard, { backgroundColor: theme.surface }]}
            onPress={() => setSelectedTemplate(template)}
            activeOpacity={0.7}
          >
            <View style={styles.templateHeader}>
              <View style={styles.templateTitleRow}>
                <FileText size={18} color={theme.primary} />
                <Text style={[styles.templateTitle, { color: theme.text }]}>{template.title}</Text>
              </View>
              <View style={[styles.templateCategoryBadge, { backgroundColor: `${theme.primary}15` }]}>
                <Text style={[styles.templateCategoryBadgeText, { color: theme.primary }]}>
                  {template.category}
                </Text>
              </View>
            </View>
            <Text style={[styles.templatePreview, { color: theme.textSecondary }]} numberOfLines={3}>
              {template.content}
            </Text>
            <View style={styles.templateTags}>
              {template.tags.map((tag, idx) => (
                <View key={idx} style={[styles.templateTag, { backgroundColor: theme.surfaceSecondary }]}>
                  <Text style={[styles.templateTagText, { color: theme.textSecondary }]}>{tag}</Text>
                </View>
              ))}
            </View>
            <View style={styles.templateActions}>
              <TouchableOpacity
                style={[styles.templateActionButton, { backgroundColor: theme.surfaceSecondary }]}
                onPress={() => copyTemplate(template.content)}
              >
                <Copy size={14} color={theme.textSecondary} />
                <Text style={[styles.templateActionText, { color: theme.textSecondary }]}>Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.templateActionButton, { backgroundColor: theme.primary }]}
              >
                <Send size={14} color={theme.white} />
                <Text style={[styles.templateActionText, { color: theme.white }]}>Use</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
        <View style={{ height: Platform.OS === "ios" ? 100 : 80 }} />
      </ScrollView>
    </>
  );

  const renderCallsTab = () => (
    <>
      <View style={styles.callFilterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.callFilterScroll}>
          {[
            { key: "all", label: "All" },
            { key: "buyer", label: "Buyers" },
            { key: "seller", label: "Sellers" },
            { key: "investor", label: "Investors" },
            { key: "firm", label: "Firm" },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.callFilterChip,
                callFilter === filter.key ? dynamicStyles.tabActive : dynamicStyles.tabInactive,
              ]}
              onPress={() => setCallFilter(filter.key as ContactType)}
            >
              <Text
                style={[
                  styles.callFilterText,
                  { color: callFilter === filter.key ? theme.white : theme.textSecondary },
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.callsContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredCallLogs.map((log) => {
          const CallIcon = getCallIcon(log);
          return (
            <TouchableOpacity
              key={log.id}
              style={[styles.callLogItem, { backgroundColor: theme.surface, borderBottomColor: theme.borderLight }]}
              activeOpacity={0.7}
            >
              <View style={styles.callLogAvatar}>
                <Image
                  source={{ uri: log.contactAvatar }}
                  style={styles.callLogAvatarImage}
                  contentFit="cover"
                />
                <View style={[styles.callLogMethodBadge, { backgroundColor: getCallColor(log.type) }]}>
                  <CallIcon size={10} color={theme.white} />
                </View>
              </View>

              <View style={styles.callLogContent}>
                <View style={styles.callLogHeader}>
                  <Text style={[styles.callLogName, { color: theme.text }]}>{log.contactName}</Text>
                  <Text style={[styles.callLogTime, { color: theme.textTertiary }]}>
                    {formatTime(log.timestamp)}
                  </Text>
                </View>

                <View style={styles.callLogDetails}>
                  <View style={styles.callLogTypeRow}>
                    {React.createElement(getContactTypeIcon(log.contactType), {
                      size: 12,
                      color: theme.textTertiary,
                    })}
                    <Text style={[styles.callLogTypeText, { color: theme.textTertiary }]}>
                      {log.contactType.charAt(0).toUpperCase() + log.contactType.slice(1)}
                    </Text>
                    {log.duration && (
                      <>
                        <View style={[styles.callLogDot, { backgroundColor: theme.textTertiary }]} />
                        <Text style={[styles.callLogDuration, { color: theme.textSecondary }]}>
                          {log.duration}
                        </Text>
                      </>
                    )}
                  </View>
                </View>

                {log.projectName && (
                  <View style={styles.callLogProject}>
                    <Briefcase size={12} color={theme.primary} />
                    <Text style={[styles.callLogProjectText, { color: theme.primary }]}>
                      {log.projectName}
                    </Text>
                  </View>
                )}

                {log.notes && (
                  <Text style={[styles.callLogNotes, { color: theme.textSecondary }]} numberOfLines={1}>
                    {log.notes}
                  </Text>
                )}
              </View>

              <View style={styles.callLogActions}>
                <TouchableOpacity style={[styles.callBackButton, { backgroundColor: `${theme.success}15` }]}>
                  <PhoneCall size={16} color={theme.success} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.messageBackButton, { backgroundColor: `${theme.primary}15` }]}>
                  <MessageSquare size={16} color={theme.primary} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: Platform.OS === "ios" ? 100 : 80 }} />
      </ScrollView>
    </>
  );

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <SafeAreaView edges={["top"]} style={[styles.safeArea, dynamicStyles.safeArea]}>
        <View style={styles.header}>
          <Text style={[styles.title, dynamicStyles.title]}>Communication</Text>
          <TouchableOpacity style={[styles.newChatButton, dynamicStyles.newChatButton]}>
            <Plus size={20} color={theme.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.encryptionBanner}>
          <Lock size={14} color={theme.success} />
          <Text style={[styles.encryptionText, { color: theme.success }]}>End-to-end encrypted</Text>
        </View>

        <Text style={[styles.sectionHint, { color: theme.textTertiary }]}>Tap to switch sections</Text>
        {renderMainTabs()}
      </SafeAreaView>

      {activeTab === "messages" && renderMessagesTab()}
      {activeTab === "schedule" && renderScheduleTab()}
      {activeTab === "templates" && renderTemplatesTab()}
      {activeTab === "calls" && renderCallsTab()}

      <Modal
        visible={shareModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setShareModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.shareModal, { backgroundColor: theme.surface }]}>
            <View style={styles.shareModalHeader}>
              <Text style={[styles.shareModalTitle, { color: theme.text }]}>Share Listing</Text>
              <TouchableOpacity onPress={() => setShareModalVisible(false)}>
                <X size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.shareModalSubtitle, { color: theme.textSecondary }]}>
              Send to investor or buyer pipelines
            </Text>

            <View style={styles.shareOptions}>
              {[
                { icon: User, label: "Active Buyers", count: 12 },
                { icon: Briefcase, label: "Investors", count: 8 },
                { icon: Building2, label: "Firm Network", count: 24 },
                { icon: Users, label: "Team Members", count: 5 },
              ].map((option, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.shareOption, { backgroundColor: theme.surfaceSecondary }]}
                >
                  <option.icon size={20} color={theme.primary} />
                  <View style={styles.shareOptionText}>
                    <Text style={[styles.shareOptionLabel, { color: theme.text }]}>{option.label}</Text>
                    <Text style={[styles.shareOptionCount, { color: theme.textSecondary }]}>
                      {option.count} contacts
                    </Text>
                  </View>
                  <ChevronRight size={18} color={theme.textTertiary} />
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.shareButton2, { backgroundColor: theme.primary }]}
              onPress={() => {
                setShareModalVisible(false);
                Alert.alert("Shared!", "Listing sent to selected pipelines");
              }}
            >
              <Share2 size={18} color={theme.white} />
              <Text style={[styles.shareButtonText, { color: theme.white }]}>Share to All</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={selectedTemplate !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedTemplate(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.templateModal, { backgroundColor: theme.surface }]}>
            <View style={styles.templateModalHeader}>
              <Text style={[styles.templateModalTitle, { color: theme.text }]}>
                {selectedTemplate?.title}
              </Text>
              <TouchableOpacity onPress={() => setSelectedTemplate(null)}>
                <X size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.templateModalContent}>
              <Text style={[styles.templateModalText, { color: theme.text }]}>
                {selectedTemplate?.content}
              </Text>
            </ScrollView>

            <View style={styles.templateModalActions}>
              <TouchableOpacity
                style={[styles.templateModalButton, { backgroundColor: theme.surfaceSecondary }]}
                onPress={() => copyTemplate(selectedTemplate?.content || "")}
              >
                <Copy size={18} color={theme.text} />
                <Text style={[styles.templateModalButtonText, { color: theme.text }]}>Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.templateModalButton, { backgroundColor: theme.primary }]}
              >
                <Send size={18} color={theme.white} />
                <Text style={[styles.templateModalButtonText, { color: theme.white }]}>Send Message</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {},
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
  },
  newChatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  encryptionBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 6,
    backgroundColor: "rgba(72, 187, 120, 0.1)",
    marginHorizontal: 20,
    marginTop: 4,
    borderRadius: 8,
  },
  encryptionText: {
    fontSize: 12,
    fontWeight: "500" as const,
  },
  sectionHint: {
    fontSize: 11,
    textAlign: "center",
    marginTop: 8,
    marginBottom: -4,
  },
  mainTabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 6,
  },
  mainTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  mainTabText: {
    fontSize: 11,
    fontWeight: "700" as const,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 10,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 12,
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
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#6B7280",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
  },
  conversationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
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
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
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
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
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
    flexShrink: 1,
  },
  lockIcon: {
    marginLeft: 6,
  },
  timestamp: {
    fontSize: 12,
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
    fontSize: 13,
    flex: 1,
  },
  unreadText: {
    fontWeight: "700" as const,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  unreadCount: {
    fontSize: 11,
    fontWeight: "700" as const,
  },
  shareButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },
  scheduleContent: {
    padding: 20,
  },
  scheduleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
  addEventButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  addEventText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  calendarSyncBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    gap: 10,
  },
  calendarSyncText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500" as const,
  },
  calendarSyncLink: {
    fontSize: 13,
    fontWeight: "700" as const,
  },
  eventCard: {
    flexDirection: "row",
    borderRadius: 14,
    marginBottom: 12,
    overflow: "hidden",
  },
  eventTypeIndicator: {
    width: 4,
  },
  eventContent: {
    flex: 1,
    padding: 14,
  },
  eventHeader: {
    marginBottom: 10,
  },
  eventTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  eventTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  eventTypeText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  eventDateTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  eventDateText: {
    fontSize: 13,
    marginRight: 8,
  },
  eventTimeText: {
    fontSize: 13,
  },
  eventLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  eventLocationText: {
    fontSize: 13,
    flex: 1,
  },
  eventContact: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    gap: 10,
  },
  eventContactAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  eventContactInfo: {
    flex: 1,
  },
  eventContactName: {
    fontSize: 14,
    fontWeight: "500" as const,
  },
  eventContactType: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  eventContactTypeText: {
    fontSize: 11,
  },
  eventNotes: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: "italic",
  },
  templateCategoryContainer: {
    paddingVertical: 8,
  },
  templateCategoryScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  templateCategoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  templateCategoryText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  templatesContent: {
    padding: 20,
    paddingTop: 8,
  },
  templateCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  templateHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  templateTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  templateTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    flex: 1,
  },
  templateCategoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  templateCategoryBadgeText: {
    fontSize: 11,
    fontWeight: "600" as const,
    textTransform: "capitalize",
  },
  templatePreview: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  templateTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  templateTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  templateTagText: {
    fontSize: 11,
  },
  templateActions: {
    flexDirection: "row",
    gap: 10,
  },
  templateActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  templateActionText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  callFilterContainer: {
    paddingVertical: 8,
  },
  callFilterScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  callFilterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  callFilterText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  callsContent: {
    paddingTop: 8,
  },
  callLogItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  callLogAvatar: {
    position: "relative",
    marginRight: 14,
  },
  callLogAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  callLogMethodBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  callLogContent: {
    flex: 1,
  },
  callLogHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  callLogName: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  callLogTime: {
    fontSize: 12,
  },
  callLogDetails: {
    marginBottom: 4,
  },
  callLogTypeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  callLogTypeText: {
    fontSize: 12,
  },
  callLogDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    marginHorizontal: 4,
  },
  callLogDuration: {
    fontSize: 12,
  },
  callLogProject: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  callLogProjectText: {
    fontSize: 12,
    fontWeight: "500" as const,
  },
  callLogNotes: {
    fontSize: 12,
    marginTop: 4,
  },
  callLogActions: {
    flexDirection: "row",
    gap: 8,
  },
  callBackButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  messageBackButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  shareModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
  },
  shareModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  shareModalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
  },
  shareModalSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  shareOptions: {
    gap: 10,
    marginBottom: 20,
  },
  shareOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    gap: 14,
  },
  shareOptionText: {
    flex: 1,
  },
  shareOptionLabel: {
    fontSize: 15,
    fontWeight: "500" as const,
  },
  shareOptionCount: {
    fontSize: 12,
    marginTop: 2,
  },
  shareButton2: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  shareButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  templateModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    maxHeight: "80%",
  },
  templateModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  templateModalTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    flex: 1,
    marginRight: 16,
  },
  templateModalContent: {
    maxHeight: 300,
    marginBottom: 20,
  },
  templateModalText: {
    fontSize: 14,
    lineHeight: 22,
  },
  templateModalActions: {
    flexDirection: "row",
    gap: 12,
  },
  templateModalButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  templateModalButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
});
