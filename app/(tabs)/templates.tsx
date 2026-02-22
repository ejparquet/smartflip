import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { FileSignature, FileText, ClipboardCheck } from "lucide-react-native";
import Colors from "@/constants/colors";
import TemplateCard from "@/components/TemplateCard";
import BackButton from "@/components/BackButton";
import { mockTemplates } from "@/mocks/projects";
import { Template } from "@/types";
import { useTheme } from "@/contexts/ThemeContext";

type TemplateType = "all" | "contract" | "permit" | "inspection";

export default function TemplatesScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [selectedType, setSelectedType] = useState<TemplateType>("all");

  const filteredTemplates = mockTemplates.filter((t) => {
    if (selectedType === "all") return true;
    return t.type === selectedType;
  });

  const typeFilters: { type: TemplateType; label: string; icon: React.ReactNode; count: number }[] = [
    {
      type: "all",
      label: "All",
      icon: null,
      count: mockTemplates.length,
    },
    {
      type: "contract",
      label: "Contracts",
      icon: <FileSignature size={16} color={selectedType === "contract" ? Colors.white : Colors.primary} />,
      count: mockTemplates.filter((t) => t.type === "contract").length,
    },
    {
      type: "permit",
      label: "Permits",
      icon: <FileText size={16} color={selectedType === "permit" ? Colors.white : Colors.warning} />,
      count: mockTemplates.filter((t) => t.type === "permit").length,
    },
    {
      type: "inspection",
      label: "Inspections",
      icon: <ClipboardCheck size={16} color={selectedType === "inspection" ? Colors.white : Colors.success} />,
      count: mockTemplates.filter((t) => t.type === "inspection").length,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.header}>
          <BackButton onPress={() => router.push("/(tabs)/home" as any)} />
          <Text style={[styles.title, { color: theme.text }]}>Templates</Text>
          <View style={{ width: 40 }} />
        </View>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Pre-built templates for your flip projects
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {typeFilters.map((filter) => (
            <TouchableOpacity
              key={filter.type}
              style={[styles.filterChip, selectedType === filter.type && styles.filterChipActive]}
              onPress={() => setSelectedType(filter.type)}
            >
              {filter.icon}
              <Text
                style={[
                  styles.filterText,
                  selectedType === filter.type && styles.filterTextActive,
                ]}
              >
                {filter.label} ({filter.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onPress={() => router.push(`/template/${template.id}` as any)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  subtitle: {
    fontSize: 14,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  filterContainer: {
    paddingTop: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  filterContent: {
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginRight: 8,
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: Colors.navy,
    borderColor: Colors.navy,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#6B7280",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
});
