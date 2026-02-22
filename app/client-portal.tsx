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
  MessageCircle,
  Phone,
  Mail,
  Video,
  FileText,
  Camera,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  Send,
  Paperclip,
  ChevronRight,
  Star,
  Home,
  User,
} from "lucide-react-native";
import { Linking, Alert, KeyboardAvoidingView, Platform } from "react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";

interface Client {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  project: string;
  projectStatus: "active" | "completed" | "on_hold";
  unreadMessages: number;
  lastContact: string;
  totalSpent: number;
  rating?: number;
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
  attachments?: { type: "image" | "document"; name: string }[];
}

interface Update {
  id: string;
  clientId: string;
  type: "progress" | "milestone" | "photo" | "invoice" | "schedule";
  title: string;
  description: string;
  timestamp: string;
  isViewed: boolean;
}

const mockClients: Client[] = [
  {
    id: "c1",
    name: "Jennifer Adams",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
    email: "jennifer.adams@email.com",
    phone: "(512) 555-1234",
    project: "Kitchen Renovation",
    projectStatus: "active",
    unreadMessages: 2,
    lastContact: "2026-01-27",
    totalSpent: 45000,
  },
  {
    id: "c2",
    name: "Robert Chen",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
    email: "robert.chen@email.com",
    phone: "(512) 555-2345",
    project: "Bathroom Remodel",
    projectStatus: "active",
    unreadMessages: 0,
    lastContact: "2026-01-26",
    totalSpent: 12500,
  },
  {
    id: "c3",
    name: "Sarah Williams",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    email: "sarah.w@email.com",
    phone: "(512) 555-3456",
    project: "Deck Addition",
    projectStatus: "active",
    unreadMessages: 1,
    lastContact: "2026-01-25",
    totalSpent: 9200,
  },
  {
    id: "c4",
    name: "Michael Torres",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    email: "m.torres@email.com",
    phone: "(512) 555-4567",
    project: "Basement Finishing",
    projectStatus: "completed",
    unreadMessages: 0,
    lastContact: "2026-01-20",
    totalSpent: 32000,
    rating: 5,
  },
];

const mockMessages: Message[] = [
  {
    id: "m1",
    senderId: "c1",
    text: "Hi! Just wanted to check on the cabinet delivery status?",
    timestamp: "2026-01-27T10:30:00",
    isRead: false,
  },
  {
    id: "m2",
    senderId: "me",
    text: "Good morning Jennifer! The cabinets are scheduled to arrive tomorrow morning. We'll start installation right away.",
    timestamp: "2026-01-27T10:45:00",
    isRead: true,
  },
  {
    id: "m3",
    senderId: "c1",
    text: "Perfect! Will you need us to be home for that?",
    timestamp: "2026-01-27T11:00:00",
    isRead: false,
  },
];

const mockUpdates: Update[] = [
  {
    id: "u1",
    clientId: "c1",
    type: "progress",
    title: "Demo Complete",
    description: "Kitchen demolition is complete. Ready to begin framing.",
    timestamp: "2026-01-26T16:00:00",
    isViewed: true,
  },
  {
    id: "u2",
    clientId: "c1",
    type: "photo",
    title: "Progress Photos",
    description: "Added 5 new photos showing demo progress",
    timestamp: "2026-01-26T16:30:00",
    isViewed: false,
  },
  {
    id: "u3",
    clientId: "c2",
    type: "milestone",
    title: "Plumbing Rough-in Complete",
    description: "All plumbing lines installed, ready for inspection",
    timestamp: "2026-01-25T14:00:00",
    isViewed: true,
  },
];

type TabType = "clients" | "messages" | "updates";

export default function ClientPortalScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("clients");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [messageText, setMessageText] = useState("");

  const getStatusColor = (status: Client["projectStatus"]) => {
    switch (status) {
      case "active": return Colors.success;
      case "completed": return "#3B82F6";
      case "on_hold": return "#272D53";
    }
  };

  const getUpdateIcon = (type: Update["type"]) => {
    switch (type) {
      case "progress": return CheckCircle;
      case "milestone": return Star;
      case "photo": return Camera;
      case "invoice": return DollarSign;
      case "schedule": return Calendar;
    }
  };

  const getUpdateColor = (type: Update["type"]) => {
    switch (type) {
      case "progress": return Colors.success;
      case "milestone": return "#272D53";
      case "photo": return "#8B5CF6";
      case "invoice": return "#3B82F6";
      case "schedule": return "#EC4899";
    }
  };

  const filteredClients = mockClients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.project.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = mockClients.reduce((sum, c) => sum + c.unreadMessages, 0);

  const renderClientCard = (client: Client) => (
    <TouchableOpacity 
      key={client.id} 
      style={styles.clientCard}
      onPress={() => setSelectedClient(client)}
    >
      <View style={styles.clientHeader}>
        <Image source={{ uri: client.avatar }} style={styles.clientAvatar} contentFit="cover" />
        <View style={styles.clientInfo}>
          <View style={styles.clientNameRow}>
            <Text style={styles.clientName}>{client.name}</Text>
            {client.unreadMessages > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{client.unreadMessages}</Text>
              </View>
            )}
          </View>
          <View style={styles.projectRow}>
            <Home size={12} color={Colors.textSecondary} />
            <Text style={styles.projectName}>{client.project}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(client.projectStatus)}15` }]}>
            <Text style={[styles.statusText, { color: getStatusColor(client.projectStatus) }]}>
              {client.projectStatus.replace("_", " ").toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.clientStats}>
        <View style={styles.clientStat}>
          <DollarSign size={14} color={Colors.success} />
          <Text style={styles.clientStatValue}>${client.totalSpent.toLocaleString()}</Text>
        </View>
        <View style={styles.clientStat}>
          <Clock size={14} color={Colors.textSecondary} />
          <Text style={styles.clientStatLabel}>
            Last: {new Date(client.lastContact).toLocaleDateString()}
          </Text>
        </View>
        {client.rating ? (
          <View style={styles.clientStat}>
            <Star size={14} color={Colors.warning} fill={Colors.warning} />
            <Text style={styles.clientStatValue}>{client.rating}.0</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.clientActions}>
        <TouchableOpacity style={styles.actionBtn}>
          <Phone size={18} color={Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Mail size={18} color={Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Video size={18} color={Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.messageBtn}>
          <MessageCircle size={16} color={Colors.white} />
          <Text style={styles.messageBtnText}>Message</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderMessageBubble = (message: Message, isMe: boolean) => (
    <View 
      key={message.id} 
      style={[styles.messageBubble, isMe ? styles.myMessage : styles.theirMessage]}
    >
      <Text style={[styles.messageText, isMe && styles.myMessageText]}>{message.text}</Text>
      <Text style={[styles.messageTime, isMe && styles.myMessageTime]}>
        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  const renderUpdateCard = (update: Update) => {
    const UpdateIcon = getUpdateIcon(update.type);
    const client = mockClients.find(c => c.id === update.clientId);
    
    return (
      <TouchableOpacity key={update.id} style={styles.updateCard}>
        <View style={styles.updateHeader}>
          <View style={[styles.updateIcon, { backgroundColor: `${getUpdateColor(update.type)}20` }]}>
            <UpdateIcon size={18} color={getUpdateColor(update.type)} />
          </View>
          <View style={styles.updateInfo}>
            <Text style={styles.updateTitle}>{update.title}</Text>
            <Text style={styles.updateClient}>{client?.name} • {client?.project}</Text>
          </View>
          {!update.isViewed && <View style={styles.newDot} />}
        </View>
        <Text style={styles.updateDesc}>{update.description}</Text>
        <Text style={styles.updateTime}>
          {new Date(update.timestamp).toLocaleString()}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderClientDetail = () => {
    if (!selectedClient) return null;
    
    return (
      <View style={styles.chatContainer}>
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => setSelectedClient(null)}>
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <Image source={{ uri: selectedClient.avatar }} style={styles.chatAvatar} />
          <View style={styles.chatHeaderInfo}>
            <Text style={styles.chatHeaderName}>{selectedClient.name}</Text>
            <Text style={styles.chatHeaderProject}>{selectedClient.project}</Text>
          </View>
          <TouchableOpacity 
            style={styles.chatActionBtn}
            onPress={() => Linking.openURL(`tel:${selectedClient.phone}`)}
          >
            <Phone size={20} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.chatActionBtn}
            onPress={() => Alert.alert("Video Call", `Starting video call with ${selectedClient.name}...`)}
          >
            <Video size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.messagesContainer} contentContainerStyle={styles.messagesContent}>
          {mockMessages.map(msg => renderMessageBubble(msg, msg.senderId === "me"))}
        </ScrollView>

        <View style={styles.quickActions}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => Alert.alert("Send Photos", "Photo sharing feature - select photos to send to client.")}
            >
              <Camera size={16} color="#272D53" />
              <Text style={styles.quickActionText}>Send Photos</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => Alert.alert("Share Document", "Document sharing feature - select files to share.")}
            >
              <FileText size={16} color="#3B82F6" />
              <Text style={styles.quickActionText}>Share Document</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => Alert.alert("Schedule Update", "Schedule a project update meeting with client.")}
            >
              <Calendar size={16} color="#8B5CF6" />
              <Text style={styles.quickActionText}>Schedule Update</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => Alert.alert("Send Invoice", "Create and send invoice to client.")}
            >
              <DollarSign size={16} color="#10B981" />
              <Text style={styles.quickActionText}>Send Invoice</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachBtn}>
            <Paperclip size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TextInput
            style={styles.messageInput}
            placeholder="Type a message..."
            placeholderTextColor={Colors.textTertiary}
            value={messageText}
            onChangeText={setMessageText}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendBtn, !messageText && styles.sendBtnDisabled]}
            onPress={() => {
              if (messageText.trim()) {
                Alert.alert("Message Sent", `Your message to ${selectedClient.name} has been sent.`);
                setMessageText("");
              }
            }}
            disabled={!messageText.trim()}
          >
            <Send size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (selectedClient) {
    return renderClientDetail();
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Client Portal",
          headerLeft: () => <BackButton />,
          headerStyle: { backgroundColor: Colors.background },
          headerShadowVisible: false,
        }}
      />

      <View style={styles.headerSection}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <User size={18} color="#272D53" />
            <Text style={styles.statValue}>{mockClients.length}</Text>
            <Text style={styles.statLabel}>Clients</Text>
          </View>
          <View style={styles.statCard}>
            <MessageCircle size={18} color={Colors.error} />
            <Text style={[styles.statValue, { color: Colors.error }]}>{totalUnread}</Text>
            <Text style={styles.statLabel}>Unread</Text>
          </View>
          <View style={styles.statCard}>
            <CheckCircle size={18} color={Colors.success} />
            <Text style={styles.statValue}>
              {mockClients.filter(c => c.projectStatus === "active").length}
            </Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
        </View>

        <View style={styles.tabContainer}>
          {([
            { key: "clients", label: "Clients", icon: User },
            { key: "messages", label: "Messages", icon: MessageCircle, badge: totalUnread },
            { key: "updates", label: "Updates", icon: FileText },
          ] as const).map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <tab.icon size={16} color={activeTab === tab.key ? Colors.white : Colors.textSecondary} />
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
              {"badge" in tab && tab.badge !== undefined && tab.badge > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{tab.badge}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={18} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search clients..."
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "clients" && filteredClients.map(client => renderClientCard(client))}
        {activeTab === "messages" && (
          <>
            {mockClients.filter(c => c.unreadMessages > 0).map(client => renderClientCard(client))}
            <Text style={styles.sectionDivider}>All Conversations</Text>
            {mockClients.filter(c => c.unreadMessages === 0).map(client => renderClientCard(client))}
          </>
        )}
        {activeTab === "updates" && mockUpdates.map(update => renderUpdateCard(update))}
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
    fontSize: 20,
    fontWeight: "800" as const,
    color: Colors.text,
    marginTop: 6,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: "row",
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
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
  searchSection: {
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 8,
    paddingBottom: 100,
  },
  sectionDivider: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
    marginTop: 16,
    marginBottom: 12,
  },
  clientCard: {
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
  clientHeader: {
    flexDirection: "row",
    marginBottom: 14,
  },
  clientAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 12,
  },
  clientInfo: {
    flex: 1,
  },
  clientNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  clientName: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  unreadBadge: {
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  projectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  projectName: {
    fontSize: 14,
    color: Colors.primary,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700" as const,
  },
  clientStats: {
    flexDirection: "row",
    gap: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 14,
  },
  clientStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  clientStatValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  clientStatLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  clientActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  messageBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#272D53",
  },
  messageBtnText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  updateCard: {
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
  updateHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  updateIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  updateInfo: {
    flex: 1,
  },
  updateTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  updateClient: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  newDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.error,
  },
  updateDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  updateTime: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    paddingTop: 50,
  },
  chatAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 12,
    marginRight: 10,
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatHeaderName: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  chatHeaderProject: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  chatActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#272D53",
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    alignSelf: "flex-start",
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 20,
  },
  myMessageText: {
    color: Colors.white,
  },
  messageTime: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  myMessageTime: {
    color: "rgba(255,255,255,0.7)",
  },
  quickActions: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    backgroundColor: Colors.surface,
  },
  quickAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    marginLeft: 12,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.text,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingBottom: 30,
  },
  attachBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  messageInput: {
    flex: 1,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text,
    maxHeight: 100,
    marginRight: 8,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#272D53",
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: {
    backgroundColor: Colors.textTertiary,
  },
});
