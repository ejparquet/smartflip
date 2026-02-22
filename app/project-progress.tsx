import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import {
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  Percent,
  ChevronUp,
  ChevronDown,
  MessageSquare,
  Calendar,
  Flag,
  Save,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";
import { useProjects } from "@/contexts/ProjectContext";

interface ProgressUpdate {
  id: string;
  date: string;
  note: string;
  percentage: number;
}

interface MilestoneItem {
  id: string;
  title: string;
  completed: boolean;
  targetDate?: string;
}

export default function ProjectProgressScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const router = useRouter();
  const { getProjectById } = useProjects();
  const project = getProjectById(projectId || "");

  const [progressPercent, setProgressPercent] = useState<number>(
    project?.progressPercentage ?? 0
  );
  const [progressNote, setProgressNote] = useState("");
  const [updates, setUpdates] = useState<ProgressUpdate[]>([
    {
      id: "u1",
      date: "2026-02-10",
      note: "Completed framing for second floor. Electrical rough-in started.",
      percentage: 45,
    },
    {
      id: "u2",
      date: "2026-02-03",
      note: "Demolition phase finished. Structural inspection passed.",
      percentage: 30,
    },
    {
      id: "u3",
      date: "2026-01-20",
      note: "Project kickoff. Demo crew mobilized on-site.",
      percentage: 10,
    },
  ]);

  const [milestones, setMilestones] = useState<MilestoneItem[]>([
    { id: "m1", title: "Demolition Complete", completed: true, targetDate: "2026-01-25" },
    { id: "m2", title: "Framing Complete", completed: true, targetDate: "2026-02-05" },
    { id: "m3", title: "Rough-In Inspections Passed", completed: false, targetDate: "2026-02-15" },
    { id: "m4", title: "Drywall & Insulation", completed: false, targetDate: "2026-02-25" },
    { id: "m5", title: "Finishes & Fixtures", completed: false, targetDate: "2026-03-10" },
    { id: "m6", title: "Final Walkthrough", completed: false, targetDate: "2026-03-20" },
  ]);

  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const incrementProgress = useCallback(() => {
    setProgressPercent((prev) => Math.min(prev + 5, 100));
  }, []);

  const decrementProgress = useCallback(() => {
    setProgressPercent((prev) => Math.max(prev - 5, 0));
  }, []);

  const handleSaveUpdate = useCallback(() => {
    if (!progressNote.trim()) {
      Alert.alert("Note Required", "Please add a note describing the progress update.");
      return;
    }

    const newUpdate: ProgressUpdate = {
      id: `u-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      note: progressNote.trim(),
      percentage: progressPercent,
    };

    setUpdates((prev) => [newUpdate, ...prev]);
    setProgressNote("");
    Alert.alert("Progress Updated", `Project progress updated to ${progressPercent}%.`);
    console.log("Progress update saved:", newUpdate);
  }, [progressNote, progressPercent]);

  const toggleMilestone = useCallback((id: string) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m))
    );
  }, []);

  const handleAddMilestone = useCallback(() => {
    if (!newMilestoneTitle.trim()) return;
    const newMilestone: MilestoneItem = {
      id: `m-${Date.now()}`,
      title: newMilestoneTitle.trim(),
      completed: false,
    };
    setMilestones((prev) => [...prev, newMilestone]);
    setNewMilestoneTitle("");
    setShowAddMilestone(false);
  }, [newMilestoneTitle]);

  const completedMilestones = milestones.filter((m) => m.completed).length;

  if (!project) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView edges={["top"]} style={styles.safeArea}>
          <View style={styles.headerRow}>
            <BackButton />
            <Text style={styles.headerTitle}>Project Not Found</Text>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.headerRow}>
          <BackButton />
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Update Progress</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {project.name}
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.progressCard}>
          <Text style={styles.progressCardTitle}>Current Progress</Text>
          <View style={styles.progressCircleRow}>
            <TouchableOpacity style={styles.adjustBtn} onPress={decrementProgress} activeOpacity={0.7}>
              <ChevronDown size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
            <View style={styles.progressCircle}>
              <Text style={styles.progressCircleValue}>{progressPercent}%</Text>
              <Text style={styles.progressCircleLabel}>Complete</Text>
            </View>
            <TouchableOpacity style={styles.adjustBtn} onPress={incrementProgress} activeOpacity={0.7}>
              <ChevronUp size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
            </View>
          </View>
        </View>

        <View style={styles.noteSection}>
          <Text style={styles.sectionTitle}>Progress Note</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="Describe what was accomplished..."
            placeholderTextColor={Colors.textTertiary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={progressNote}
            onChangeText={setProgressNote}
          />
          <TouchableOpacity
            style={[styles.saveBtn, !progressNote.trim() && styles.saveBtnDisabled]}
            onPress={handleSaveUpdate}
            disabled={!progressNote.trim()}
            activeOpacity={0.7}
          >
            <Save size={18} color="#FFF" />
            <Text style={styles.saveBtnText}>Save Progress Update</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.milestonesSection}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderLeft}>
              <Flag size={18} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Milestones</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>
                  {completedMilestones}/{milestones.length}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.addSmallBtn}
              onPress={() => setShowAddMilestone(!showAddMilestone)}
            >
              <Plus size={14} color="#FFF" strokeWidth={2.5} />
              <Text style={styles.addSmallBtnText}>Add</Text>
            </TouchableOpacity>
          </View>

          {showAddMilestone && (
            <View style={styles.addMilestoneRow}>
              <TextInput
                style={styles.addMilestoneInput}
                placeholder="Milestone name"
                placeholderTextColor={Colors.textTertiary}
                value={newMilestoneTitle}
                onChangeText={setNewMilestoneTitle}
                onSubmitEditing={handleAddMilestone}
              />
              <TouchableOpacity style={styles.addMilestoneBtn} onPress={handleAddMilestone}>
                <Plus size={18} color="#FFF" />
              </TouchableOpacity>
            </View>
          )}

          {milestones.map((milestone) => (
            <TouchableOpacity
              key={milestone.id}
              style={styles.milestoneItem}
              onPress={() => toggleMilestone(milestone.id)}
              activeOpacity={0.7}
            >
              {milestone.completed ? (
                <View style={styles.milestoneChecked}>
                  <CheckCircle2 size={20} color="#FFF" />
                </View>
              ) : (
                <View style={styles.milestoneUnchecked}>
                  <Circle size={20} color={Colors.border} />
                </View>
              )}
              <View style={styles.milestoneInfo}>
                <Text
                  style={[
                    styles.milestoneTitle,
                    milestone.completed && styles.milestoneTitleCompleted,
                  ]}
                >
                  {milestone.title}
                </Text>
                {milestone.targetDate && (
                  <View style={styles.milestoneDateRow}>
                    <Calendar size={11} color={Colors.textTertiary} />
                    <Text style={styles.milestoneDateText}>{formatDate(milestone.targetDate)}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.historySection}>
          <View style={styles.sectionHeaderLeft}>
            <Clock size={18} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Update History</Text>
          </View>

          {updates.map((update, index) => (
            <View key={update.id} style={styles.historyItem}>
              <View style={styles.historyDotCol}>
                <View style={styles.historyDot} />
                {index < updates.length - 1 && <View style={styles.historyLine} />}
              </View>
              <View style={styles.historyContent}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyDate}>{formatDate(update.date)}</Text>
                  <View style={styles.historyPercentBadge}>
                    <Percent size={10} color={Colors.primary} />
                    <Text style={styles.historyPercentText}>{update.percentage}%</Text>
                  </View>
                </View>
                <Text style={styles.historyNote}>{update.note}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: Platform.OS === "ios" ? 100 : 80 }} />
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
    backgroundColor: Colors.surface,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  progressCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  progressCardTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  progressCircleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
    marginBottom: 20,
  },
  adjustBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  progressCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.background,
    borderWidth: 6,
    borderColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  progressCircleValue: {
    fontSize: 32,
    fontWeight: "800" as const,
    color: Colors.primary,
  },
  progressCircleLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  progressBarContainer: {
    width: "100%",
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surfaceSecondary,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  noteSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  noteInput: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    color: Colors.text,
    minHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 14,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#FFF",
  },
  milestonesSection: {
    marginBottom: 28,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  countBadge: {
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  addSmallBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addSmallBtnText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#FFF",
  },
  addMilestoneRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  addMilestoneInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addMilestoneBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  milestoneItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  milestoneChecked: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.success,
    alignItems: "center",
    justifyContent: "center",
  },
  milestoneUnchecked: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.text,
  },
  milestoneTitleCompleted: {
    textDecorationLine: "line-through",
    color: Colors.textTertiary,
  },
  milestoneDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  milestoneDateText: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  historySection: {
    marginBottom: 20,
  },
  historyItem: {
    flexDirection: "row",
    gap: 14,
  },
  historyDotCol: {
    alignItems: "center",
    width: 20,
  },
  historyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    marginTop: 4,
  },
  historyLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  historyContent: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  historyDate: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  historyPercentBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: `${Colors.primary}15`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  historyPercentText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  historyNote: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 19,
  },
});
