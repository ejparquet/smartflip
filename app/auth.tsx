import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Dimensions,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { Eye, EyeOff, ChevronDown, ArrowLeft } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { ProfessionalType } from "@/types";
import { professionalTypes } from "@/mocks/professionals";

const { width } = Dimensions.get("window");

type ScreenMode = "landing" | "login" | "signup";

export default function AuthScreen() {
  const router = useRouter();
  const { login, selectedRole, completeRegistration } = useAuth();
  const [mode, setMode] = useState<ScreenMode>("landing");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [professionalType, setProfessionalType] = useState<ProfessionalType | null>(null);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateToForm = (target: "login" | "signup") => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setMode(target);
      slideAnim.setValue(30);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const animateToLanding = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setMode("landing");
      setEmail("");
      setPassword("");
      setName("");
      setProfessionalType(null);
      slideAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleDirectRegistration = async () => {
    try {
      await completeRegistration({
        name,
        email,
        password,
        role: (selectedRole || "homeowner") as "homeowner" | "professional",
        professionalType: professionalType || undefined,
      });

      if (selectedRole === "professional") {
        router.replace("/(pro-tabs)/dashboard" as any);
      } else {
        router.replace("/add-property" as any);
      }
    } catch {
      Alert.alert("Error", "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (mode === "signup" && !name) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    if (mode === "signup" && selectedRole === "professional" && !professionalType) {
      Alert.alert("Error", "Please select your profession type");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
        router.replace("/(tabs)/home" as any);
      } else {
        await handleDirectRegistration();
        return;
      }
    } catch {
      Alert.alert("Error", "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderLanding = () => (
    <Animated.View style={[styles.landingContent, { opacity: fadeAnim }]}>
      <View style={styles.heroSection}>
        <Text style={styles.welcomeText}>Welcome to</Text>
        <Text style={styles.brandText}>SMART FLIP</Text>
      </View>


      <View style={styles.buttonsSection}>
        <TouchableOpacity
          style={styles.signUpButton}
          onPress={() => animateToForm("signup")}
          activeOpacity={0.7}
          testID="signup-button"
        >
          <Text style={styles.signUpButtonText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => animateToForm("login")}
          activeOpacity={0.7}
          testID="login-button"
        >
          <Text style={styles.loginButtonText}>Login</Text>
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
          onPress={() => {
            Alert.alert("Google Sign In", "Google Sign In is not yet configured.");
          }}
          activeOpacity={0.7}
          testID="google-sign-in"
        >
          <View style={styles.googleLogoWrap}>
            <Text style={styles.googleG}>G</Text>
          </View>
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.appleButton}
          onPress={() => {
            Alert.alert("Apple Sign In", "Apple Sign In is not yet configured.");
          }}
          activeOpacity={0.7}
          testID="apple-sign-in"
        >
          <Text style={styles.appleIcon}>{"\uF8FF"}</Text>
          <Text style={styles.appleButtonText}>Continue with Apple</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderForm = () => (
    <Animated.View
      style={[
        styles.formContent,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={animateToLanding}
        activeOpacity={0.7}
      >
        <ArrowLeft size={24} color="#1B2340" />
      </TouchableOpacity>

      <View style={styles.formHeroSection}>
        <Text style={styles.formTitle}>
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </Text>
        <Text style={styles.formSubtitle}>
          {mode === "login"
            ? "Sign in to continue"
            : "Fill in your details to get started"}
        </Text>
      </View>

      <View style={styles.formFields}>
        {mode === "signup" && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#A0A0A8"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="#A0A0A8"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#A0A0A8"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            {showPassword ? (
              <EyeOff size={20} color="#A0A0A8" />
            ) : (
              <Eye size={20} color="#A0A0A8" />
            )}
          </TouchableOpacity>
        </View>

        {mode === "signup" && selectedRole === "professional" && (
          <View>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowTypeDropdown(!showTypeDropdown)}
            >
              <Text
                style={[
                  styles.dropdownText,
                  !professionalType && styles.placeholder,
                ]}
              >
                {professionalType
                  ? professionalTypes.find((t) => t.type === professionalType)?.label
                  : "Select your profession"}
              </Text>
              <ChevronDown size={20} color="#A0A0A8" />
            </TouchableOpacity>

            {showTypeDropdown && (
              <View style={styles.dropdownList}>
                <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled>
                  {professionalTypes.map((type) => (
                    <TouchableOpacity
                      key={type.type}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setProfessionalType(type.type);
                        setShowTypeDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{type.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        )}

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          activeOpacity={0.7}
          disabled={loading}
        >
          {loading ? (
            <Text style={styles.submitButtonText}>Please wait...</Text>
          ) : (
            <Text style={styles.submitButtonText}>
              {mode === "login" ? "Login" : "Sign Up"}
            </Text>
          )}
        </TouchableOpacity>

        {mode === "login" && (
          <TouchableOpacity style={styles.forgotButton}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => {
            const target = mode === "login" ? "signup" : "login";
            setMode(target);
          }}
        >
          <Text style={styles.switchText}>
            {mode === "login"
              ? "Don't have an account? "
              : "Already have an account? "}
            <Text style={styles.switchLink}>
              {mode === "login" ? "Sign Up" : "Login"}
            </Text>
          </Text>
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.googleButton}
          onPress={() => {
            Alert.alert("Google Sign In", "Google Sign In is not yet configured.");
          }}
          activeOpacity={0.7}
        >
          <View style={styles.googleLogoWrap}>
            <Text style={styles.googleG}>G</Text>
          </View>
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.appleButton}
          onPress={() => {
            Alert.alert("Apple Sign In", "Apple Sign In is not yet configured.");
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.appleIcon}>{"\uF8FF"}</Text>
          <Text style={styles.appleButtonText}>Continue with Apple</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {mode === "landing" ? renderLanding() : renderForm()}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 50,
  },
  landingContent: {
    flex: 1,
  },
  heroSection: {
    alignItems: "center",
    paddingTop: 80,
    paddingBottom: 4,
  },
  welcomeText: {
    fontSize: 34,
    fontWeight: "300" as const,
    color: "#1B2340",
    letterSpacing: 0.5,
  },
  brandText: {
    fontSize: 38,
    fontWeight: "800" as const,
    color: "#1B2340",
    letterSpacing: 2,
  },

  buttonsSection: {
    paddingHorizontal: 36,
    paddingTop: 8,
  },
  signUpButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E8E6EE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  signUpButtonText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#1B2340",
  },
  loginButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1B2340",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  forgotButton: {
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 8,
  },
  forgotText: {
    fontSize: 15,
    color: "#1B2340",
    fontWeight: "400" as const,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#DCDCE0",
  },
  dividerText: {
    fontSize: 13,
    color: "#A0A0A8",
    marginHorizontal: 16,
    fontWeight: "400" as const,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    borderRadius: 26,
    borderWidth: 1.2,
    borderColor: "#DCDCE0",
    backgroundColor: "#FFFFFF",
    gap: 10,
    marginBottom: 12,
  },
  googleLogoWrap: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  googleG: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: "#4285F4",
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#222222",
  },
  appleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    borderRadius: 26,
    backgroundColor: "#000000",
    gap: 8,
    marginBottom: 12,
  },
  appleIcon: {
    fontSize: 20,
    color: "#FFFFFF",
  },
  appleButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  formContent: {
    flex: 1,
    paddingTop: 60,
  },
  backButton: {
    marginLeft: 20,
    marginBottom: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F0F0F2",
    alignItems: "center",
    justifyContent: "center",
  },
  formHeroSection: {
    paddingHorizontal: 36,
    marginBottom: 28,
  },
  formTitle: {
    fontSize: 30,
    fontWeight: "700" as const,
    color: "#1B2340",
    marginBottom: 6,
  },
  formSubtitle: {
    fontSize: 15,
    color: "#A0A0A8",
    fontWeight: "400" as const,
  },
  formFields: {
    paddingHorizontal: 36,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F2",
    borderRadius: 16,
    marginBottom: 14,
    paddingHorizontal: 18,
  },
  input: {
    flex: 1,
    height: 54,
    fontSize: 16,
    color: "#1B2340",
  },
  eyeButton: {
    padding: 8,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F0F0F2",
    borderRadius: 16,
    paddingHorizontal: 18,
    height: 54,
    marginBottom: 14,
  },
  dropdownText: {
    fontSize: 16,
    color: "#1B2340",
  },
  placeholder: {
    color: "#A0A0A8",
  },
  dropdownList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#DCDCE0",
    marginBottom: 14,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F2",
  },
  dropdownItemText: {
    fontSize: 15,
    color: "#1B2340",
  },
  submitButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1B2340",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    marginTop: 4,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  switchButton: {
    alignItems: "center",
    marginBottom: 20,
  },
  switchText: {
    fontSize: 14,
    color: "#A0A0A8",
  },
  switchLink: {
    color: "#1B2340",
    fontWeight: "600" as const,
  },
});
