import { Tabs } from "expo-router";
import { Platform, Image, View, StyleSheet } from "react-native";
import { Home, User, MessageCircle, BarChart3, Calendar } from "lucide-react-native";
import React, { useEffect } from "react";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useService } from "@/contexts/ServiceContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Professional } from "@/types";

const NAV_BG = "rgba(39, 45, 83, 0.90)";
const ACTIVE_COLOR = "#FFFFFF";
const INACTIVE_COLOR = "rgba(255,255,255,0.45)";

export default function ProTabLayout() {
  const { user } = useAuth();
  const { setCurrentService, serviceConfig } = useService();
  const { theme } = useTheme();
  const professional = user as Professional | null;

  useEffect(() => {
    if (professional?.professionalType) {
      console.log('[ProTabLayout] Setting service type:', professional.professionalType);
      setCurrentService(professional.professionalType);
    }
  }, [professional?.professionalType, setCurrentService]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: NAV_BG,
          borderTopWidth: 0,
          height: Platform.OS === "ios" ? 100 : 78,
          paddingTop: 12,
          paddingBottom: Platform.OS === "ios" ? 38 : 22,
          paddingHorizontal: 6,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          position: "absolute",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.2,
          shadowRadius: 20,
          elevation: 16,
          borderTopColor: "transparent",
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600" as const,
          marginTop: 4,
          letterSpacing: 0.2,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home size={23} color={color} strokeWidth={1.5} />,
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="bids"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="stores"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="reviews"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ color }) => <MessageCircle size={23} color={color} strokeWidth={1.5} />,
          tabBarBadge: 3,
          tabBarBadgeStyle: {
            backgroundColor: "#F56565",
            fontSize: 10,
            minWidth: 18,
            height: 18,
          },
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color }) => <Calendar size={23} color={color} strokeWidth={1.5} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: "Analytics",
          tabBarIcon: ({ color }) => <BarChart3 size={23} color={color} strokeWidth={1.5} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => 
            user?.avatar ? (
              <View style={[
                proStyles.avatarContainer,
                { borderColor: focused ? ACTIVE_COLOR : 'rgba(255,255,255,0.3)' }
              ]}>
                <Image
                  source={{ uri: user.avatar }}
                  style={proStyles.avatarImage}
                />
              </View>
            ) : (
              <User size={23} color={color} strokeWidth={1.5} />
            ),
        }}
      />
    </Tabs>
  );
}

const proStyles = StyleSheet.create({
  avatarContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});
