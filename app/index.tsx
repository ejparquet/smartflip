import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, ImageBackground } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import Svg, { Polygon, Path } from "react-native-svg";

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const hasNavigated = useRef(false);

  useEffect(() => {
    const navigate = () => {
      if (hasNavigated.current) return;
      hasNavigated.current = true;
      
      if (isAuthenticated && user) {
        // User is already logged in, navigate to appropriate dashboard
        if (user.role === "professional") {
          router.replace("/(pro-tabs)/dashboard" as any);
        } else {
          router.replace("/(tabs)/home" as any);
        }
      } else {
        // Not logged in, go to welcome screen to choose
        router.replace("/welcome");
      }
    };

    // Navigate after loading completes + 1s delay for splash effect
    if (!isLoading) {
      const timer = setTimeout(navigate, 1000);
      return () => clearTimeout(timer);
    }

    // Fallback: force navigation after 3 seconds
    const fallbackTimer = setTimeout(() => {
      console.log("Splash screen fallback timer triggered");
      navigate();
    }, 3000);

    return () => clearTimeout(fallbackTimer);
  }, [isLoading, isAuthenticated, user, router]);

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80' }}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.hexagonWrapper}>
            <Svg width={90} height={100} viewBox="0 0 90 100">
              <Polygon
                points="45,5 85,27 85,73 45,95 5,73 5,27"
                fill="transparent"
                stroke="#FFFFFF"
                strokeWidth="2.5"
              />
            </Svg>
            <View style={styles.iconContainer}>
              <Svg width={40} height={40} viewBox="0 0 40 40">
                <Path
                  d="M10 18 L20 10 L30 18"
                  stroke="#FFFFFF"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M8 28 C8 28 14 28 20 28 C26 28 32 28 32 28"
                  stroke="#FFFFFF"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
              </Svg>
              <Text style={styles.sText}>S</Text>
              <View style={styles.dotsContainer}>
                <View style={styles.dot} />
                <View style={styles.dot} />
                <View style={styles.dot} />
              </View>
            </View>
          </View>
          <Text style={styles.logoText}>SMART FLIP</Text>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
  },
  hexagonWrapper: {
    width: 90,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sText: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginTop: -8,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 2,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  logoText: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: '#FFFFFF',
    letterSpacing: 4,
  },
});
