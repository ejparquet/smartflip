import { Tabs } from "expo-router";
import { Platform, Image, View, StyleSheet } from "react-native";
import { Home, Calendar, Contact, MessageCircle, User } from "lucide-react-native";
import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";

const NAV_BG = "rgba(39, 45, 83, 0.90)";
const ACTIVE_COLOR = "#FFFFFF";
const INACTIVE_COLOR = "rgba(255,255,255,0.45)";

export default function TabLayout() {
  const { theme } = useTheme();
  const { user } = useAuth();

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
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home size={23} color={color} strokeWidth={1.5} />,
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color }) => <Calendar size={23} color={color} strokeWidth={1.5} />,
        }}
      />
      <Tabs.Screen
        name="team"
        options={{
          title: "Contacts",
          tabBarIcon: ({ color }) => <Contact size={23} color={color} strokeWidth={1.5} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ color }) => <MessageCircle size={23} color={color} strokeWidth={1.5} />,
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="realtors"
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
        name="templates"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => 
            user?.avatar ? (
              <View style={[
                styles.avatarContainer,
                { borderColor: focused ? ACTIVE_COLOR : 'rgba(255,255,255,0.3)' }
              ]}>
                <Image
                  source={{ uri: user.avatar }}
                  style={styles.avatarImage}
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

const styles = StyleSheet.create({
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
