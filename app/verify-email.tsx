import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Mail, ArrowLeft, RefreshCw } from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";
import { ProfessionalType } from "@/types";

const CODE_LENGTH = 6;

export default function VerifyEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email: string; name: string; role: string; professionalType?: string }>();
  const { completeRegistration } = useAuth();
  
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const verifyMutation = trpc.auth.verifyCode.useMutation({
    onSuccess: async (data) => {
      if (data.verified && data.userData) {
        await completeRegistration({
          name: data.userData.name as string,
          email: data.userData.email as string,
          password: "",
          role: data.userData.role as "homeowner" | "professional",
          professionalType: data.userData.professionalType as ProfessionalType | undefined,
        });
        
        const role = data.userData.role as string;
        if (role === "professional") {
          router.replace("/(pro-tabs)/dashboard");
        } else {
          router.replace("/add-property");
        }
      }
    },
    onError: (error) => {
      Alert.alert("Verification Failed", error.message);
    },
  });

  const resendMutation = trpc.auth.resendCode.useMutation({
    onSuccess: () => {
      setCountdown(60);
      Alert.alert("Code Sent", "A new verification code has been sent to your email.");
    },
    onError: (error) => {
      Alert.alert("Error", error.message);
    },
  });

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    
    if (text.length > 1) {
      const digits = text.replace(/\D/g, "").slice(0, CODE_LENGTH);
      for (let i = 0; i < digits.length && index + i < CODE_LENGTH; i++) {
        newCode[index + i] = digits[i];
      }
      setCode(newCode);
      const nextIndex = Math.min(index + digits.length, CODE_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
    } else {
      newCode[index] = text.replace(/\D/g, "");
      setCode(newCode);
      
      if (text && index < CODE_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (e: { nativeEvent: { key: string } }, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const fullCode = code.join("");
    if (fullCode.length !== CODE_LENGTH) {
      Alert.alert("Error", "Please enter the complete 6-digit code.");
      return;
    }

    verifyMutation.mutate({
      email: params.email,
      code: fullCode,
    });
  };

  const handleResend = () => {
    if (countdown > 0) return;
    
    resendMutation.mutate({
      email: params.email,
    });
  };

  const isLoading = verifyMutation.isPending || resendMutation.isPending;
  const isCodeComplete = code.every((digit) => digit !== "");

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <BackButton />

          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Mail size={40} color={Colors.primary} />
              </View>
            </View>

            <Text style={styles.title}>Verify your email</Text>
            <Text style={styles.subtitle}>
              We have sent a 6-digit verification code to
            </Text>
            <Text style={styles.email}>{params.email}</Text>

            <View style={styles.codeContainer}>
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => { inputRefs.current[index] = ref; }}
                  style={[
                    styles.codeInput,
                    digit && styles.codeInputFilled,
                  ]}
                  value={digit}
                  onChangeText={(text) => handleCodeChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={CODE_LENGTH}
                  selectTextOnFocus
                  editable={!isLoading}
                />
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.verifyButton,
                (!isCodeComplete || isLoading) && styles.verifyButtonDisabled,
              ]}
              onPress={handleVerify}
              disabled={!isCodeComplete || isLoading}
            >
              {verifyMutation.isPending ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.verifyButtonText}>Verify Email</Text>
              )}
            </TouchableOpacity>

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn{"'"}t receive the code?</Text>
              <TouchableOpacity
                onPress={handleResend}
                disabled={countdown > 0 || resendMutation.isPending}
                style={styles.resendButton}
              >
                {resendMutation.isPending ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <View style={styles.resendButtonContent}>
                    <RefreshCw size={16} color={countdown > 0 ? Colors.textTertiary : Colors.primary} />
                    <Text
                      style={[
                        styles.resendButtonText,
                        countdown > 0 && styles.resendButtonTextDisabled,
                      ]}
                    >
                      {countdown > 0 ? `Resend in ${countdown}s` : "Resend"}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  backButton: {
    padding: 16,
    alignSelf: "flex-start",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(30, 58, 95, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  email: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.primary,
    marginBottom: 40,
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 40,
  },
  codeInput: {
    width: 48,
    height: 56,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.border,
    fontSize: 24,
    fontWeight: "700" as const,
    textAlign: "center",
    color: Colors.text,
  },
  codeInputFilled: {
    borderColor: Colors.primary,
    backgroundColor: "rgba(30, 58, 95, 0.05)",
  },
  verifyButton: {
    width: "100%",
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 24,
  },
  verifyButtonDisabled: {
    backgroundColor: Colors.textTertiary,
  },
  verifyButtonText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  resendContainer: {
    alignItems: "center",
  },
  resendText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  resendButton: {
    padding: 8,
  },
  resendButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  resendButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  resendButtonTextDisabled: {
    color: Colors.textTertiary,
  },
});
