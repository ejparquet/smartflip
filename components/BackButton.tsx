import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";

interface BackButtonProps {
  onPress?: () => void;
  color?: string;
  backgroundColor?: string;
  size?: number;
}

export default function BackButton({ onPress, color, backgroundColor, size = 20 }: BackButtonProps) {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: backgroundColor ?? theme.surface },
      ]}
      onPress={onPress ?? (() => router.back())}
      activeOpacity={0.7}
      testID="back-button"
    >
      <ArrowLeft size={size} color={color ?? theme.text} strokeWidth={2} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
});
