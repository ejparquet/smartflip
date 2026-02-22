import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Check, X } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import Button from "@/components/Button";
import BackButton from "@/components/BackButton";
import ProfessionalCard from "@/components/ProfessionalCard";
import { mockProfessionals, professionalTypes } from "@/mocks/professionals";
import { useProjects } from "@/contexts/ProjectContext";
import { ProfessionalType } from "@/types";

export default function AddTeamMemberScreen() {
  const router = useRouter();
  const { projectId, professionalId } = useLocalSearchParams<{
    projectId?: string;
    professionalId?: string;
  }>();
  const { projects, addTeamMember } = useProjects();
  const [selectedProfessionals, setSelectedProfessionals] = useState<string[]>(
    professionalId ? [professionalId] : []
  );
  const [selectedProject, setSelectedProject] = useState<string | null>(projectId || null);
  const [loading, setLoading] = useState(false);
  const [activeFilters, setActiveFilters] = useState<ProfessionalType[]>([]);

  const toggleFilter = (type: ProfessionalType) => {
    setActiveFilters((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  const clearFilters = () => setActiveFilters([]);

  const availableProfessionals = activeFilters.length > 0
    ? mockProfessionals.filter((p) => activeFilters.includes(p.professionalType))
    : mockProfessionals;

  const toggleProfessional = (id: string) => {
    setSelectedProfessionals((prev) =>
      prev.includes(id)
        ? prev.filter((pId) => pId !== id)
        : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (selectedProfessionals.length === 0) {
      Alert.alert("Error", "Please select at least one professional");
      return;
    }
    if (!selectedProject) {
      Alert.alert("Error", "Please select a project");
      return;
    }

    setLoading(true);
    try {
      for (const professionalId of selectedProfessionals) {
        const professional = mockProfessionals.find((p) => p.id === professionalId);
        if (!professional) continue;

        await addTeamMember({
          projectId: selectedProject,
          member: {
            projectId: selectedProject,
            professionalId: professionalId,
            professional: professional,
            role: professional.professionalType,
            status: "invited",
          },
        });
      }

      const memberText = selectedProfessionals.length === 1 ? "Team member" : `${selectedProfessionals.length} team members`;
      Alert.alert("Success", `${memberText} added successfully!`, [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to add team members. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.headerTitle}>Add Team Member</Text>
          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {!projectId && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Project</Text>
            {projects.filter((p) => p.status !== "completed").map((project) => (
              <TouchableOpacity
                key={project.id}
                style={[
                  styles.projectOption,
                  selectedProject === project.id && styles.projectOptionSelected,
                ]}
                onPress={() => setSelectedProject(project.id)}
              >
                <View style={styles.projectInfo}>
                  <Text style={styles.projectName}>{project.name}</Text>
                  <Text style={styles.projectAddress}>{project.address}</Text>
                </View>
                {selectedProject === project.id && (
                  <View style={styles.checkmark}>
                    <Check size={18} color={Colors.white} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
            {projects.filter((p) => p.status !== "completed").length === 0 && (
              <Text style={styles.emptyText}>No active projects available</Text>
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Professionals</Text>
          <Text style={styles.helperText}>
            Tap to select multiple team members ({selectedProfessionals.length} selected)
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterRow}
            contentContainerStyle={styles.filterRowContent}
          >
            {activeFilters.length > 0 && (
              <TouchableOpacity
                style={styles.clearChip}
                onPress={clearFilters}
                activeOpacity={0.7}
              >
                <X size={14} color={Colors.error} />
                <Text style={styles.clearChipText}>Clear</Text>
              </TouchableOpacity>
            )}
            {professionalTypes.map((pt) => {
              const isActive = activeFilters.includes(pt.type);
              return (
                <TouchableOpacity
                  key={pt.type}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => toggleFilter(pt.type)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                    {pt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          {availableProfessionals.map((professional) => (
            <TouchableOpacity
              key={professional.id}
              style={[
                styles.professionalWrapper,
                selectedProfessionals.includes(professional.id) && styles.professionalWrapperSelected,
              ]}
              onPress={() => toggleProfessional(professional.id)}
              activeOpacity={0.9}
            >
              <ProfessionalCard
                professional={professional}
                onPress={() => toggleProfessional(professional.id)}
              />
              {selectedProfessionals.includes(professional.id) && (
                <View style={styles.selectedOverlay}>
                  <View style={styles.checkmarkLarge}>
                    <Check size={24} color={Colors.white} />
                  </View>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomActions}>
        <Button
          title={selectedProfessionals.length > 1 ? `Add ${selectedProfessionals.length} Members to Team` : "Add to Team"}
          onPress={handleSubmit}
          loading={loading}
          disabled={selectedProfessionals.length === 0 || !selectedProject}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 8,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  helperText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  filterRow: {
    marginBottom: 14,
    marginHorizontal: -20,
    paddingVertical: 8,
  },
  filterRowContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterChipActive: {
    backgroundColor: Colors.navy,
    borderColor: Colors.navy,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#6B7280",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  clearChip: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.error,
    backgroundColor: Colors.surface,
  },
  clearChipText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.error,
  },
  projectOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "transparent",
  },
  projectOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}08`,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  projectAddress: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textTertiary,
    textAlign: "center",
    paddingVertical: 20,
  },
  professionalWrapper: {
    position: "relative",
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 18,
    marginBottom: 2,
  },
  professionalWrapperSelected: {
    borderColor: Colors.primary,
  },
  selectedOverlay: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  checkmarkLarge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  bottomActions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
});
