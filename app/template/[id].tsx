import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import {
  FileSignature,
  FileText,
  ClipboardCheck,
  CheckCircle,
  Copy,
  Download,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { useTheme } from "@/contexts/ThemeContext";
import Button from "@/components/Button";
import BackButton from "@/components/BackButton";
import { mockTemplates } from "@/mocks/projects";

export default function TemplateDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useTheme();

  const dynamicStyles = useMemo(() => ({
    container: { backgroundColor: theme.background },
    card: { backgroundColor: theme.surface },
    text: { color: theme.text },
    textSecondary: { color: theme.textSecondary },
    border: { borderColor: theme.border },
    borderLight: { borderBottomColor: theme.borderLight },
  }), [theme]);

  const template = mockTemplates.find((t) => t.id === id);

  if (!template) {
    return (
      <View style={[styles.container, dynamicStyles.container]}>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView edges={["top"]} style={styles.safeArea}>
          <View style={[styles.headerRow, { backgroundColor: theme.background }]}>
            <BackButton color={theme.navy} backgroundColor={theme.surfaceSecondary} />
            <Text style={[styles.headerRowTitle, { color: theme.text }]}>Not Found</Text>
            <View style={{ width: 40 }} />
          </View>
          <View style={styles.notFound}>
            <Text style={[styles.notFoundText, dynamicStyles.textSecondary]}>Template not found</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const getIcon = () => {
    switch (template.type) {
      case "contract":
        return <FileSignature size={32} color={Colors.primary} />;
      case "permit":
        return <FileText size={32} color={Colors.warning} />;
      case "inspection":
        return <ClipboardCheck size={32} color={Colors.success} />;
      default:
        return <FileText size={32} color={Colors.primary} />;
    }
  };

  const getTypeColor = () => {
    switch (template.type) {
      case "contract":
        return Colors.primary;
      case "permit":
        return Colors.warning;
      case "inspection":
        return Colors.success;
      default:
        return Colors.primary;
    }
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={[styles.headerRow, { backgroundColor: theme.background }]}>
          <BackButton color={theme.navy} backgroundColor={theme.surfaceSecondary} />
          <Text style={[styles.headerRowTitle, { color: theme.text }]} numberOfLines={1}>{template.title}</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, dynamicStyles.card]}>
          <View style={[styles.iconContainer, { backgroundColor: `${getTypeColor()}12` }]}>
            {getIcon()}
          </View>
          <Text style={[styles.title, dynamicStyles.text]}>{template.title}</Text>
          <View style={[styles.typeBadge, { backgroundColor: `${getTypeColor()}15` }]}>
            <Text style={[styles.typeText, { color: getTypeColor() }]}>
              {template.type.charAt(0).toUpperCase() + template.type.slice(1)}
            </Text>
          </View>
          <Text style={[styles.category, dynamicStyles.textSecondary]}>{template.category}</Text>
        </View>

        <View style={[styles.section, dynamicStyles.card]}>
          <Text style={[styles.sectionTitle, dynamicStyles.text]}>Description</Text>
          <Text style={[styles.description, dynamicStyles.textSecondary]}>{template.description}</Text>
        </View>

        {template.items && template.items.length > 0 && (
          <View style={[styles.section, dynamicStyles.card]}>
            <Text style={[styles.sectionTitle, dynamicStyles.text]}>Checklist Items</Text>
            {template.items.map((item, index) => (
              <View key={index} style={[styles.checklistItem, dynamicStyles.borderLight]}>
                <View style={styles.checklistCircle}>
                  <CheckCircle size={18} color={theme.textTertiary} />
                </View>
                <Text style={[styles.checklistText, dynamicStyles.text]}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        {template.type === "contract" && (
          <View style={[styles.section, dynamicStyles.card]}>
            <Text style={[styles.sectionTitle, dynamicStyles.text]}>Contract Sections</Text>
            {[
              "Scope of Work",
              "Timeline & Milestones",
              "Payment Terms",
              "Materials & Specifications",
              "Change Order Process",
              "Warranties & Guarantees",
              "Insurance Requirements",
              "Termination Clause",
              "Signatures",
            ].map((section, index) => (
              <View key={index} style={[styles.contractSection, dynamicStyles.borderLight]}>
                <View style={[styles.contractNumber, { backgroundColor: theme.navy }]}>
                  <Text style={styles.contractNumberText}>{index + 1}</Text>
                </View>
                <Text style={[styles.contractSectionText, dynamicStyles.text]}>{section}</Text>
              </View>
            ))}
          </View>
        )}

        {template.type === "permit" && (
          <View style={[styles.section, dynamicStyles.card]}>
            <Text style={[styles.sectionTitle, dynamicStyles.text]}>Required Documents</Text>
            {[
              "Site Plan",
              "Floor Plans",
              "Elevation Drawings",
              "Structural Calculations",
              "Energy Compliance Documents",
              "Contractor License",
              "Proof of Insurance",
              "Property Ownership Documents",
            ].map((doc, index) => (
              <View key={index} style={[styles.documentItem, dynamicStyles.borderLight]}>
                <FileText size={16} color={Colors.warning} />
                <Text style={[styles.documentText, dynamicStyles.text]}>{doc}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={[styles.bottomActions, { backgroundColor: theme.surface, borderTopColor: theme.borderLight }]}>
        <TouchableOpacity style={[styles.secondaryButton, { borderColor: theme.navy }]}>
          <Copy size={20} color={theme.navy} />
          <Text style={[styles.secondaryButtonText, { color: theme.navy }]}>Copy to Clipboard</Text>
        </TouchableOpacity>
        <Button
          title="Use Template"
          onPress={() => {}}
          icon={<Download size={18} color={Colors.white} />}
          style={{ flex: 1, backgroundColor: theme.navy }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
  },
  headerRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerRowTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    flex: 1,
    textAlign: "center" as const,
    marginHorizontal: 8,
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  notFoundText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    padding: 24,
    paddingTop: 32,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "800" as const,
    textAlign: "center",
    marginBottom: 12,
  },
  typeBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  typeText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  category: {
    fontSize: 14,
  },
  section: {
    padding: 20,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    marginBottom: 14,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  checklistCircle: {
    marginRight: 12,
  },
  checklistText: {
    fontSize: 15,
    flex: 1,
  },
  contractSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  contractNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  contractNumberText: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  contractSectionText: {
    fontSize: 15,
    flex: 1,
  },
  documentItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 12,
  },
  documentText: {
    fontSize: 15,
    flex: 1,
  },
  bottomActions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    gap: 12,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 6,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
});
