import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { FileText, ClipboardCheck, FileSignature, ChevronRight } from "lucide-react-native";
import Colors from "@/constants/colors";
import { Template } from "@/types";

interface TemplateCardProps {
  template: Template;
  onPress: () => void;
}

export default function TemplateCard({ template, onPress }: TemplateCardProps) {
  const getIcon = () => {
    switch (template.type) {
      case "contract":
        return <FileSignature size={22} color={Colors.primary} />;
      case "permit":
        return <FileText size={22} color={Colors.warning} />;
      case "inspection":
        return <ClipboardCheck size={22} color={Colors.success} />;
      default:
        return <FileText size={22} color={Colors.primary} />;
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
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.iconContainer, { backgroundColor: `${getTypeColor()}12` }]}>
        {getIcon()}
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{template.title}</Text>
        <Text style={styles.description} numberOfLines={2}>{template.description}</Text>
        <View style={styles.footer}>
          <View style={[styles.typeBadge, { backgroundColor: `${getTypeColor()}15` }]}>
            <Text style={[styles.typeText, { color: getTypeColor() }]}>
              {template.type.charAt(0).toUpperCase() + template.type.slice(1)}
            </Text>
          </View>
          <Text style={styles.category}>{template.category}</Text>
        </View>
      </View>
      <ChevronRight size={20} color={Colors.textTertiary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,

  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  category: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
});
