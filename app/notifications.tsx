import React, { useCallback, useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
  Platform,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Bell,
  BellOff,
  Trash2,
  CheckCheck,
  Briefcase,
  Clock,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { useNotifications, AppNotification } from "@/contexts/NotificationsContext";
import * as Haptics from "expo-haptics";

function NotificationItem({ item, onPress, theme }: {
  item: AppNotification;
  onPress: (id: string) => void;
  theme: ReturnType<typeof useTheme>["theme"];
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const getIcon = () => {
    switch (item.type) {
      case "job_accepted":
        return <CheckCircle2 size={22} color="#22C55E" />;
      case "job_declined":
        return <XCircle size={22} color="#EF4444" />;
      case "invite_accepted":
        return <Briefcase size={22} color="#3B82F6" />;
      default:
        return <Bell size={22} color={theme.textSecondary} />;
    }
  };

  const getAccentColor = () => {
    switch (item.type) {
      case "job_accepted": return "#22C55E";
      case "job_declined": return "#EF4444";
      case "invite_accepted": return "#3B82F6";
      default: return theme.textSecondary;
    }
  };

  const timeAgo = useMemo(() => {
    const now = Date.now();
    const diff = now - new Date(item.timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }, [item.timestamp]);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <TouchableOpacity
        style={[
          styles.notificationCard,
          {
            backgroundColor: item.read ? theme.surface : theme.surfaceSecondary,
            borderColor: item.read ? theme.border : getAccentColor() + "30",
            borderLeftColor: item.read ? theme.border : getAccentColor(),
          },
        ]}
        onPress={() => onPress(item.id)}
        activeOpacity={0.7}
        testID={`notification-${item.id}`}
      >
        <View style={[styles.iconContainer, { backgroundColor: getAccentColor() + "15" }]}>
          {getIcon()}
        </View>
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text
              style={[
                styles.notificationTitle,
                { color: theme.text, fontWeight: item.read ? "500" as const : "700" as const },
              ]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            {!item.read && <View style={[styles.unreadDot, { backgroundColor: getAccentColor() }]} />}
          </View>
          <Text style={[styles.notificationMessage, { color: theme.textSecondary }]} numberOfLines={2}>
            {item.message}
          </Text>
          <View style={styles.notificationMeta}>
            <Clock size={12} color={theme.textTertiary} />
            <Text style={[styles.timeText, { color: theme.textTertiary }]}>{timeAgo}</Text>
            {item.professionalType && (
              <View style={[styles.typeBadge, { backgroundColor: getAccentColor() + "15" }]}>
                <Text style={[styles.typeBadgeText, { color: getAccentColor() }]}>
                  {item.professionalType.replace("_", " ")}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const MemoizedNotificationItem = React.memo(NotificationItem);

export default function NotificationsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  } = useNotifications();

  const handleNotificationPress = useCallback((id: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    markAsRead(id);
  }, [markAsRead]);

  const handleMarkAllRead = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    markAllAsRead();
  }, [markAllAsRead]);

  const handleClear = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    clearNotifications();
  }, [clearNotifications]);

  const renderItem = useCallback(({ item }: { item: AppNotification }) => (
    <MemoizedNotificationItem item={item} onPress={handleNotificationPress} theme={theme} />
  ), [handleNotificationPress, theme]);

  const keyExtractor = useCallback((item: AppNotification) => item.id, []);

  const renderEmpty = useCallback(() => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconCircle, { backgroundColor: theme.surfaceSecondary }]}>
        <BellOff size={40} color={theme.textTertiary} />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>No Notifications</Text>
      <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
        You'll be notified here when professionals respond to your job requests.
      </Text>
    </View>
  ), [theme]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <TouchableOpacity
            style={[styles.headerBtn, { backgroundColor: theme.surfaceSecondary }]}
            onPress={() => router.back()}
            testID="notifications-back"
          >
            <ArrowLeft size={20} color={theme.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Notifications</Text>
            {unreadCount > 0 && (
              <View style={[styles.headerBadge, { backgroundColor: "#EF4444" }]}>
                <Text style={styles.headerBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          <View style={styles.headerActions}>
            {unreadCount > 0 && (
              <TouchableOpacity
                style={[styles.headerActionBtn, { backgroundColor: theme.surfaceSecondary }]}
                onPress={handleMarkAllRead}
                testID="mark-all-read"
              >
                <CheckCheck size={18} color={theme.navy} />
              </TouchableOpacity>
            )}
            {notifications.length > 0 && (
              <TouchableOpacity
                style={[styles.headerActionBtn, { backgroundColor: theme.surfaceSecondary }]}
                onPress={handleClear}
                testID="clear-notifications"
              >
                <Trash2 size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {unreadCount > 0 && (
          <View style={[styles.unreadBanner, { backgroundColor: "#272D53" + "10" }]}>
            <Bell size={14} color="#272D53" />
            <Text style={[styles.unreadBannerText, { color: "#272D53" }]}>
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </Text>
          </View>
        )}

        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={[
            styles.listContent,
            notifications.length === 0 && styles.emptyListContent,
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
        />
      </SafeAreaView>
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
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    letterSpacing: -0.3,
  },
  headerBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  headerBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700" as const,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  unreadBannerText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: "center",
  },
  notificationCard: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderLeftWidth: 3,
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationContent: {
    flex: 1,
    gap: 4,
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  notificationTitle: {
    fontSize: 15,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 13,
    lineHeight: 18,
  },
  notificationMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  timeText: {
    fontSize: 11,
    marginRight: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: "600" as const,
    textTransform: "capitalize" as const,
  },
  emptyContainer: {
    alignItems: "center",
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center" as const,
    lineHeight: 20,
  },
});
