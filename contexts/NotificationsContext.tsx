import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useCallback, useMemo } from "react";

export interface AppNotification {
  id: string;
  type: "job_accepted" | "job_declined" | "invite_accepted" | "invite_declined" | "general";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  jobId?: string;
  professionalName?: string;
  professionalType?: string;
}

const STORAGE_KEY = "smartflip_notifications";

interface NotificationsState {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  addNotification: (notification: Omit<AppNotification, "id" | "timestamp" | "read">) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

export const [NotificationsProvider, useNotifications] = createContextHook<NotificationsState>(() => {
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const dataQuery = useQuery({
    queryKey: ["notifications-data"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as AppNotification[];
      }
      return [] as AppNotification[];
    },
  });

  useEffect(() => {
    if (dataQuery.data) {
      setNotifications(dataQuery.data);
    }
  }, [dataQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async (data: AppNotification[]) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["notifications-data"], data);
    },
  });

  const addNotification = useCallback((notification: Omit<AppNotification, "id" | "timestamp" | "read">) => {
    console.log("[NotificationsContext] Adding notification:", notification.title);
    const newNotification: AppNotification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      saveMutation.mutate(updated);
      return updated;
    });
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    console.log("[NotificationsContext] Marking as read:", notificationId);
    setNotifications(prev => {
      const updated = prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      );
      saveMutation.mutate(updated);
      return updated;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    console.log("[NotificationsContext] Marking all as read");
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      saveMutation.mutate(updated);
      return updated;
    });
  }, []);

  const clearNotifications = useCallback(() => {
    console.log("[NotificationsContext] Clearing all notifications");
    setNotifications([]);
    saveMutation.mutate([]);
  }, []);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  return {
    notifications,
    unreadCount,
    isLoading: dataQuery.isLoading,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };
});
