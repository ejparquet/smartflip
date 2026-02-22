import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Modal,
  Alert,
  Keyboard,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Image } from "expo-image";
import {
  ChevronLeft,
  Lock,
  Send,
  Paperclip,
  MoreVertical,
  Users,
  Phone,
  Video,
  Shield,
  Camera,
  FileText,
  Calendar,
  Receipt,
  X,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";
import { mockConversations, mockMessages } from "@/mocks/messages";
import { Message } from "@/types";

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });
    return () => {
      showSub.remove();
    };
  }, []);

  const conversation = mockConversations.find((c) => c.id === id);

  useEffect(() => {
    if (id && mockMessages[id]) {
      setMessages(mockMessages[id]);
    }
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [id]);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: false });
    }, 100);
  }, [messages]);

  if (!conversation) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Conversation not found</Text>
      </View>
    );
  }

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDateHeader = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
    }
  };

  const handleSend = () => {
    if (!messageText.trim()) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId: id || "",
      senderId: "current-user",
      senderName: "You",
      content: messageText.trim(),
      timestamp: new Date().toISOString(),
      isEncrypted: true,
      isRead: false,
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessageText("");
  };

  const handleSendPhoto = () => {
    setShowActions(false);
    Alert.alert("Send Photo", "Photo picker would open here. Select a job photo to share with the client.");
  };

  const handleShareDocument = () => {
    setShowActions(false);
    Alert.alert("Share Document", "Document picker would open here. Select a contract, permit, or inspection document to share.");
  };

  const handleScheduleUpdate = () => {
    setShowActions(false);
    Alert.alert(
      "Schedule Update",
      "Send a schedule update to the client?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send Update",
          onPress: () => {
            const updateMessage: Message = {
              id: `msg-${Date.now()}`,
              conversationId: id || "",
              senderId: "current-user",
              senderName: "You",
              content: "📅 Schedule Update: I will be arriving at the scheduled time. Please let me know if you have any questions.",
              timestamp: new Date().toISOString(),
              isEncrypted: true,
              isRead: false,
            };
            setMessages((prev) => [...prev, updateMessage]);
          },
        },
      ]
    );
  };

  const handleSendInvoice = () => {
    setShowActions(false);
    Alert.alert(
      "Send Invoice",
      "Send an invoice to the client?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Create & Send",
          onPress: () => {
            const invoiceMessage: Message = {
              id: `msg-${Date.now()}`,
              conversationId: id || "",
              senderId: "current-user",
              senderName: "You",
              content: "💰 Invoice #INV-2026-001 has been sent. Total: $850.00. Payment is due within 30 days. Thank you for your business!",
              timestamp: new Date().toISOString(),
              isEncrypted: true,
              isRead: false,
            };
            setMessages((prev) => [...prev, invoiceMessage]);
          },
        },
      ]
    );
  };

  const renderMessage = (message: Message, index: number) => {
    const isCurrentUser = message.senderId === "current-user";
    const showDateHeader = index === 0 || 
      new Date(message.timestamp).toDateString() !== 
      new Date(messages[index - 1].timestamp).toDateString();

    return (
      <View key={message.id}>
        {showDateHeader && (
          <View style={styles.dateHeaderContainer}>
            <View style={styles.dateHeaderLine} />
            <Text style={styles.dateHeader}>{formatDateHeader(message.timestamp)}</Text>
            <View style={styles.dateHeaderLine} />
          </View>
        )}
        <View style={[styles.messageContainer, isCurrentUser && styles.messageContainerRight]}>
          {!isCurrentUser && conversation.type === "team" && (
            <Image
              source={{ uri: message.senderAvatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100" }}
              style={styles.messageAvatar}
              contentFit="cover"
            />
          )}
          <View style={[styles.messageBubble, isCurrentUser ? styles.messageBubbleRight : styles.messageBubbleLeft]}>
            {!isCurrentUser && conversation.type === "team" && (
              <Text style={styles.senderName}>{message.senderName}</Text>
            )}
            <Text style={[styles.messageText, isCurrentUser && styles.messageTextRight]}>
              {message.content}
            </Text>
            <View style={styles.messageFooter}>
              <Lock size={10} color={isCurrentUser ? "rgba(255,255,255,0.6)" : Colors.textTertiary} />
              <Text style={[styles.messageTime, isCurrentUser && styles.messageTimeRight]}>
                {formatMessageTime(message.timestamp)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <BackButton />

          <TouchableOpacity style={styles.headerInfo}>
            <View style={styles.headerAvatarContainer}>
              {conversation.type === "team" ? (
                <View style={styles.headerTeamAvatar}>
                  <Image
                    source={{ uri: conversation.avatar }}
                    style={styles.headerAvatar}
                    contentFit="cover"
                  />
                  <View style={styles.headerTeamBadge}>
                    <Users size={8} color={Colors.white} />
                  </View>
                </View>
              ) : (
                <View style={styles.headerDirectAvatar}>
                  <Image
                    source={{ uri: conversation.avatar }}
                    style={styles.headerAvatarRound}
                    contentFit="cover"
                  />
                  {conversation.participants[0]?.isOnline && (
                    <View style={styles.headerOnlineIndicator} />
                  )}
                </View>
              )}
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerName} numberOfLines={1}>{conversation.name}</Text>
              <View style={styles.headerSubtitleRow}>
                <Shield size={10} color={Colors.success} />
                <Text style={styles.headerSubtitle}>
                  {conversation.type === "team" 
                    ? `${conversation.participants.length} members • Encrypted`
                    : conversation.participants[0]?.isOnline 
                      ? "Online • Encrypted" 
                      : "Encrypted"
                  }
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerActionButton}>
              <Phone size={20} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerActionButton}>
              <Video size={20} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerActionButton}>
              <MoreVertical size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <Animated.View style={[styles.chatContainer, { opacity: fadeAnim }]}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.encryptionNotice}>
            <Lock size={16} color={Colors.success} />
            <Text style={styles.encryptionNoticeText}>
              Messages are end-to-end encrypted. No one outside of this chat can read them.
            </Text>
          </View>

          {messages.map((message, index) => renderMessage(message, index))}
        </ScrollView>
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
        style={styles.keyboardAvoid}
      >
        <SafeAreaView edges={["bottom"]} style={styles.inputSafeArea}>
          <View style={styles.inputContainer}>
            <TouchableOpacity 
              style={styles.attachButton}
              onPress={() => setShowActions(true)}
            >
              <Paperclip size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="Type a message..."
                placeholderTextColor={Colors.textTertiary}
                value={messageText}
                onChangeText={setMessageText}
                multiline
                maxLength={1000}
              />
            </View>
            <TouchableOpacity 
              style={[styles.sendButton, messageText.trim() && styles.sendButtonActive]}
              onPress={handleSend}
              disabled={!messageText.trim()}
            >
              <Send size={20} color={messageText.trim() ? Colors.white : Colors.textTertiary} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>

      <Modal
        visible={showActions}
        transparent
        animationType="slide"
        onRequestClose={() => setShowActions(false)}
      >
        <TouchableOpacity 
          style={styles.actionModalOverlay}
          activeOpacity={1}
          onPress={() => setShowActions(false)}
        >
          <View style={styles.actionModalContent}>
            <View style={styles.actionModalHeader}>
              <Text style={styles.actionModalTitle}>Quick Actions</Text>
              <TouchableOpacity onPress={() => setShowActions(false)}>
                <X size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.actionGrid}>
              <TouchableOpacity style={styles.actionItem} onPress={handleSendPhoto}>
                <View style={[styles.actionIconWrapper, { backgroundColor: "#DBEAFE" }]}>
                  <Camera size={24} color="#3B82F6" />
                </View>
                <Text style={styles.actionItemText}>Send Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionItem} onPress={handleShareDocument}>
                <View style={[styles.actionIconWrapper, { backgroundColor: "#E8E9EE" }]}>
                  <FileText size={24} color="#D97706" />
                </View>
                <Text style={styles.actionItemText}>Share Document</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionItem} onPress={handleScheduleUpdate}>
                <View style={[styles.actionIconWrapper, { backgroundColor: "#D1FAE5" }]}>
                  <Calendar size={24} color="#059669" />
                </View>
                <Text style={styles.actionItemText}>Schedule Update</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionItem} onPress={handleSendInvoice}>
                <View style={[styles.actionIconWrapper, { backgroundColor: "#EDE9FE" }]}>
                  <Receipt size={24} color="#7C3AED" />
                </View>
                <Text style={styles.actionItemText}>Send Invoice</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerSafeArea: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  headerAvatarContainer: {
    marginRight: 12,
  },
  headerTeamAvatar: {
    position: "relative",
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
  },
  headerTeamBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  headerDirectAvatar: {
    position: "relative",
  },
  headerAvatarRound: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerOnlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 2,
  },
  headerSubtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerActionButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  encryptionNotice: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(72, 187, 120, 0.1)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  encryptionNoticeText: {
    fontSize: 12,
    color: Colors.success,
    textAlign: "center",
    flex: 1,
  },
  dateHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  dateHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  dateHeader: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginHorizontal: 12,
    fontWeight: "500" as const,
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-end",
  },
  messageContainerRight: {
    justifyContent: "flex-end",
  },
  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: "75%",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
  },
  messageBubbleLeft: {
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  messageBubbleRight: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.primary,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 20,
  },
  messageTextRight: {
    color: Colors.white,
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
    gap: 4,
  },
  messageTime: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
  messageTimeRight: {
    color: "rgba(255, 255, 255, 0.6)",
  },
  keyboardAvoid: {
    width: "100%",
  },
  inputSafeArea: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  attachButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 40,
    maxHeight: 120,
    justifyContent: "center",
  },
  textInput: {
    fontSize: 15,
    color: Colors.text,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonActive: {
    backgroundColor: Colors.primary,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center" as const,
    marginTop: 100,
  },
  actionModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  actionModalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  actionModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  actionModalTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  actionItem: {
    width: "45%",
    alignItems: "center",
    padding: 16,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 16,
  },
  actionIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  actionItemText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    textAlign: "center" as const,
  },
});
