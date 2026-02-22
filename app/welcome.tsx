import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";

const { width } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const handleSocialLogin = async (provider: string) => {
    try {
      const email = `${provider.toLowerCase()}user@smartflip.com`;
      await login(email, "social-auth");
      router.replace("/(tabs)/home");
    } catch {
      Alert.alert("Error", `${provider} Sign In failed. Please try again.`);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.topSection}>
            <Text style={styles.title}>Welcome to</Text>
            <Text style={styles.titleBrand}>SMART FLIP</Text>
          </View>

          <View style={styles.imageContainer}>
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80" }}
              style={styles.houseImage}
              contentFit="contain"
            />
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.signUpButton}
              onPress={() => router.push("/onboarding")}
              activeOpacity={0.8}
            >
              <Text style={styles.signUpText}>Sign Up</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => router.push("/auth")}
              activeOpacity={0.8}
            >
              <Text style={styles.loginText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.forgotButton}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.googleButton}
              onPress={() => handleSocialLogin("Google")}
              activeOpacity={0.7}
              testID="google-sign-in"
            >
              <View style={styles.socialIconWrap}>
                <Text style={styles.googleG}>G</Text>
              </View>
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.appleButton}
              onPress={() => handleSocialLogin("Apple")}
              activeOpacity={0.7}
              testID="apple-sign-in"
            >
              <View style={styles.socialIconWrap}>
                <Text style={styles.appleIcon}>{"\uF8FF"}</Text>
              </View>
              <Text style={styles.appleButtonText}>Continue with Apple</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
  },
  topSection: {
    paddingTop: 60,
    alignItems: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "400" as const,
    color: Colors.primary,
    textAlign: "center",
  },
  titleBrand: {
    fontSize: 30,
    fontWeight: "700" as const,
    color: Colors.primary,
    textAlign: "center",
  },
  imageContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  houseImage: {
    width: width - 80,
    height: width - 80,
  },
  buttonsContainer: {
    paddingBottom: 50,
  },
  signUpButton: {
    backgroundColor: "#E5E5E5",
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 16,
  },
  signUpText: {
    fontSize: 18,
    fontWeight: "500" as const,
    color: Colors.primary,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 24,
  },
  loginText: {
    fontSize: 18,
    fontWeight: "500" as const,
    color: Colors.white,
  },
  forgotButton: {
    alignItems: "center",
  },
  forgotText: {
    fontSize: 16,
    color: Colors.primary,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#D8D8D8",
  },
  dividerText: {
    fontSize: 14,
    color: "#999",
    marginHorizontal: 14,
    fontWeight: "500" as const,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 54,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    backgroundColor: Colors.white,
    marginBottom: 12,
    gap: 10,
  },
  appleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 54,
    borderRadius: 30,
    backgroundColor: "#000",
    marginBottom: 12,
    gap: 10,
  },
  socialIconWrap: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  googleG: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#4285F4",
  },
  appleIcon: {
    fontSize: 22,
    color: "#FFF",
    marginTop: -2,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  appleButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFF",
  },
});
