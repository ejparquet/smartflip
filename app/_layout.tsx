import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { PropertyProvider } from "@/contexts/PropertyContext";
import { LocationProvider } from "@/contexts/LocationContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { ServiceProvider } from "@/contexts/ServiceContext";
import { StatusPersistenceProvider } from "@/contexts/StatusPersistenceContext";
import { InvitationsProvider } from "@/contexts/InvitationsContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { trpc, trpcClient } from "@/lib/trpc";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { theme } = useTheme();
  
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        headerStyle: { backgroundColor: theme.background },
        headerShadowVisible: false,
        headerTintColor: theme.primary,
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="add-property" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(pro-tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="project/[id]"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="property/[id]"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="professional/[id]"
        options={{ title: "Professional Profile" }}
      />
      <Stack.Screen
        name="add-project"
        options={{ presentation: "modal", title: "New Project" }}
      />
      <Stack.Screen
        name="add-team-member"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="template/[id]"
        options={{ title: "Template" }}
      />
      <Stack.Screen
        name="chat/[id]"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="delivery-tracking"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="work-logs"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="time-tracking"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="invoices"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="safety-checklists"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="verify-email"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="firm/[id]"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="electrical-service-calls"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="electrical-estimates"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="electrical-panel-schedule"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="electrical-parts-database"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="weather"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="electrical-code-compliance"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="electrical-permits"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="electrical-safety"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="electrical-licensing"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="electrical-warranty-tracking"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="electrical-energy-audit"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="electrical-troubleshooting"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="electrical-photo-documentation"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="load-calculator"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="voltage-drop-calculator"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="conduit-fill-calculator"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="wire-reference"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="material-stores"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="material-tracking"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="client-portal"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="project-invitations"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="contract/[id]"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="contracts"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="add-contract"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="permits"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="permit/[id]"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="inspections"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="inspection/[id]"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="add-permit"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="add-inspection"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="permits-inspections"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="project-progress"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="project-documents"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="project-expenses"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="job-request/[id]"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="notifications"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AuthProvider>
            <ServiceProvider>
              <StatusPersistenceProvider>
                <InvitationsProvider>
                  <NotificationsProvider>
                  <LocationProvider>
                    <ProjectProvider>
                      <PropertyProvider>
                        <ThemeProvider>
                          <RootLayoutNav />
                        </ThemeProvider>
                      </PropertyProvider>
                    </ProjectProvider>
                  </LocationProvider>
                  </NotificationsProvider>
                </InvitationsProvider>
              </StatusPersistenceProvider>
            </ServiceProvider>
          </AuthProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
