import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Play,
  Pause,
  Square,
  Clock,
  Calendar,
  MapPin,
  Plus,
  X,
  Check,
  DollarSign,
  BarChart3,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";

interface TimeEntry {
  id: string;
  projectName: string;
  task: string;
  date: string;
  startTime: string;
  endTime?: string;
  duration: number;
  hourlyRate?: number;
  notes?: string;
  isRunning: boolean;
}

const mockEntries: TimeEntry[] = [
  {
    id: "1",
    projectName: "Kitchen Renovation",
    task: "Drywall Installation",
    date: "2025-01-25",
    startTime: "08:00",
    endTime: "12:30",
    duration: 4.5 * 3600,
    hourlyRate: 75,
    isRunning: false,
  },
  {
    id: "2",
    projectName: "Kitchen Renovation",
    task: "Electrical Rough-in",
    date: "2025-01-25",
    startTime: "13:00",
    endTime: "17:00",
    duration: 4 * 3600,
    hourlyRate: 85,
    isRunning: false,
  },
  {
    id: "3",
    projectName: "Bathroom Remodel",
    task: "Plumbing Fixtures",
    date: "2025-01-24",
    startTime: "09:00",
    endTime: "15:00",
    duration: 6 * 3600,
    hourlyRate: 80,
    isRunning: false,
  },
];

export default function TimeTrackingScreen() {
  const router = useRouter();
  const [entries, setEntries] = useState<TimeEntry[]>(mockEntries);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTimer, setActiveTimer] = useState<TimeEntry | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [newEntry, setNewEntry] = useState({
    projectName: "",
    task: "",
    hourlyRate: "",
    notes: "",
  });

  useEffect(() => {
    const running = entries.find((e) => e.isRunning);
    if (running) {
      setActiveTimer(running);
      setTimerSeconds(running.duration);
    }
  }, []);

  useEffect(() => {
    if (activeTimer?.isRunning) {
      intervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [activeTimer?.isRunning]);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatHours = (seconds: number) => {
    return (seconds / 3600).toFixed(1);
  };

  const startTimer = () => {
    if (!newEntry.projectName || !newEntry.task) {
      Alert.alert("Error", "Please fill in project and task");
      return;
    }
    const entry: TimeEntry = {
      id: Date.now().toString(),
      projectName: newEntry.projectName,
      task: newEntry.task,
      date: new Date().toISOString().split("T")[0],
      startTime: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      duration: 0,
      hourlyRate: parseFloat(newEntry.hourlyRate) || undefined,
      notes: newEntry.notes,
      isRunning: true,
    };
    setEntries([entry, ...entries]);
    setActiveTimer(entry);
    setTimerSeconds(0);
    setShowAddModal(false);
    setNewEntry({ projectName: "", task: "", hourlyRate: "", notes: "" });
  };

  const pauseTimer = () => {
    if (!activeTimer) return;
    setEntries(
      entries.map((e) =>
        e.id === activeTimer.id
          ? { ...e, isRunning: false, duration: timerSeconds }
          : e
      )
    );
    setActiveTimer({ ...activeTimer, isRunning: false });
  };

  const resumeTimer = () => {
    if (!activeTimer) return;
    setEntries(
      entries.map((e) => (e.id === activeTimer.id ? { ...e, isRunning: true } : e))
    );
    setActiveTimer({ ...activeTimer, isRunning: true });
  };

  const stopTimer = () => {
    if (!activeTimer) return;
    const endTime = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    setEntries(
      entries.map((e) =>
        e.id === activeTimer.id
          ? { ...e, isRunning: false, duration: timerSeconds, endTime }
          : e
      )
    );
    setActiveTimer(null);
    setTimerSeconds(0);
  };

  const getTotalHoursToday = () => {
    const today = new Date().toISOString().split("T")[0];
    return entries
      .filter((e) => e.date === today)
      .reduce((sum, e) => sum + e.duration, 0);
  };

  const getTotalEarningsToday = () => {
    const today = new Date().toISOString().split("T")[0];
    return entries
      .filter((e) => e.date === today && e.hourlyRate)
      .reduce((sum, e) => sum + (e.duration / 3600) * (e.hourlyRate || 0), 0);
  };

  const groupedEntries = entries.reduce((acc, entry) => {
    if (!acc[entry.date]) acc[entry.date] = [];
    acc[entry.date].push(entry);
    return acc;
  }, {} as Record<string, TimeEntry[]>);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (dateStr === today) return "Today";
    if (dateStr === yesterdayStr) return "Yesterday";
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.headerTitle}>Time Tracking</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Plus size={24} color={Colors.navy} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {activeTimer && (
          <View style={styles.activeTimerCard}>
            <View style={styles.timerInfo}>
              <Text style={styles.timerProject}>{activeTimer.projectName}</Text>
              <Text style={styles.timerTask}>{activeTimer.task}</Text>
            </View>
            <Text style={styles.timerDisplay}>{formatDuration(timerSeconds)}</Text>
            <View style={styles.timerControls}>
              {activeTimer.isRunning ? (
                <TouchableOpacity
                  style={styles.pauseButton}
                  onPress={pauseTimer}
                >
                  <Pause size={24} color="#FFFFFF" fill="#FFFFFF" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.playButton}
                  onPress={resumeTimer}
                >
                  <Play size={24} color="#FFFFFF" fill="#FFFFFF" />
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.stopButton} onPress={stopTimer}>
                <Square size={20} color="#EF4444" fill="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Clock size={20} color={Colors.navy} strokeWidth={1.5} />
            <Text style={styles.statValue}>
              {formatHours(getTotalHoursToday())}h
            </Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
          <View style={styles.statCard}>
            <DollarSign size={20} color="#10B981" strokeWidth={1.5} />
            <Text style={styles.statValue}>
              ${getTotalEarningsToday().toFixed(0)}
            </Text>
            <Text style={styles.statLabel}>Earned</Text>
          </View>
          <View style={styles.statCard}>
            <BarChart3 size={20} color="#272D53" strokeWidth={1.5} />
            <Text style={styles.statValue}>{entries.length}</Text>
            <Text style={styles.statLabel}>Entries</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {Object.entries(groupedEntries).map(([date, dayEntries]) => (
            <View key={date} style={styles.dayGroup}>
              <Text style={styles.dayHeader}>{formatDate(date)}</Text>
              {dayEntries.map((entry) => (
                <View
                  key={entry.id}
                  style={[
                    styles.entryCard,
                    entry.isRunning && styles.entryCardActive,
                  ]}
                >
                  <View style={styles.entryLeft}>
                    <Text style={styles.entryProject}>{entry.projectName}</Text>
                    <Text style={styles.entryTask}>{entry.task}</Text>
                    <View style={styles.entryTimeRow}>
                      <Clock size={12} color="#9CA3AF" strokeWidth={1.5} />
                      <Text style={styles.entryTime}>
                        {entry.startTime}
                        {entry.endTime ? ` - ${entry.endTime}` : " (running)"}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.entryRight}>
                    <Text style={styles.entryDuration}>
                      {formatHours(entry.id === activeTimer?.id ? timerSeconds : entry.duration)}h
                    </Text>
                    {entry.hourlyRate && (
                      <Text style={styles.entryEarnings}>
                        $
                        {(
                          ((entry.id === activeTimer?.id ? timerSeconds : entry.duration) / 3600) *
                          entry.hourlyRate
                        ).toFixed(2)}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ))}
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>

      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <X size={24} color="#6B7280" strokeWidth={1.5} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Start Timer</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Project Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Select or enter project"
                placeholderTextColor="#9CA3AF"
                value={newEntry.projectName}
                onChangeText={(text) =>
                  setNewEntry({ ...newEntry, projectName: text })
                }
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Task Description *</Text>
              <TextInput
                style={styles.input}
                placeholder="What are you working on?"
                placeholderTextColor="#9CA3AF"
                value={newEntry.task}
                onChangeText={(text) =>
                  setNewEntry({ ...newEntry, task: text })
                }
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Hourly Rate ($)</Text>
              <TextInput
                style={styles.input}
                placeholder="75"
                placeholderTextColor="#9CA3AF"
                keyboardType="decimal-pad"
                value={newEntry.hourlyRate}
                onChangeText={(text) =>
                  setNewEntry({ ...newEntry, hourlyRate: text })
                }
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Additional notes..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                value={newEntry.notes}
                onChangeText={(text) =>
                  setNewEntry({ ...newEntry, notes: text })
                }
              />
            </View>

            <TouchableOpacity style={styles.startTimerButton} onPress={startTimer}>
              <Play size={20} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={styles.startTimerText}>Start Timer</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F7",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  activeTimerCard: {
    backgroundColor: Colors.navy,
    margin: 16,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  timerInfo: {
    alignItems: "center",
    marginBottom: 12,
  },
  timerProject: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  timerTask: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginTop: 4,
  },
  timerDisplay: {
    fontSize: 48,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    fontVariant: ["tabular-nums"],
    marginBottom: 16,
  },
  timerControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  pauseButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#272D53",
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
  },
  stopButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginTop: 6,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  dayGroup: {
    marginBottom: 20,
  },
  dayHeader: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#6B7280",
    marginBottom: 10,
  },
  entryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  entryCardActive: {
    borderWidth: 2,
    borderColor: Colors.navy,
  },
  entryLeft: {
    flex: 1,
  },
  entryProject: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  entryTask: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  entryTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  entryTime: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  entryRight: {
    alignItems: "flex-end",
  },
  entryDuration: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.navy,
  },
  entryEarnings: {
    fontSize: 13,
    color: "#10B981",
    fontWeight: "500" as const,
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#F5F5F7",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  modalContent: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1F2937",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  startTimerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: Colors.navy,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 8,
  },
  startTimerText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
});
