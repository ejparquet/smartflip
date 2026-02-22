import React, { useState } from "react";
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
import { Image } from "expo-image";
import {
  ArrowLeft,
  Plus,
  X,
  Check,
  Calendar,
  Clock,
  MapPin,
  FileText,
  Camera,
  CloudSun,
  Users,
  ChevronRight,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";

interface WorkLog {
  id: string;
  date: string;
  projectName: string;
  description: string;
  hoursWorked: number;
  weather?: string;
  workers?: string[];
  photos?: string[];
  notes?: string;
}

const mockLogs: WorkLog[] = [
  {
    id: "1",
    date: "2025-01-25",
    projectName: "Kitchen Renovation",
    description: "Completed drywall installation in main area. Started mudding and taping.",
    hoursWorked: 8,
    weather: "Sunny, 72°F",
    workers: ["John Smith", "Mike Johnson"],
    photos: [
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
      "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=400",
    ],
    notes: "Need more drywall mud for tomorrow",
  },
  {
    id: "2",
    date: "2025-01-24",
    projectName: "Bathroom Remodel",
    description: "Installed new plumbing fixtures. Tested for leaks - all clear.",
    hoursWorked: 6,
    weather: "Cloudy, 65°F",
    workers: ["John Smith"],
    notes: "Client approved tile selection",
  },
  {
    id: "3",
    date: "2025-01-23",
    projectName: "Kitchen Renovation",
    description: "Framing complete. Electrical rough-in started.",
    hoursWorked: 9,
    weather: "Rainy, 58°F",
    workers: ["John Smith", "Mike Johnson", "Tom Wilson"],
  },
];

export default function WorkLogsScreen() {
  const router = useRouter();
  const [logs, setLogs] = useState<WorkLog[]>(mockLogs);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState<WorkLog | null>(null);
  const [newLog, setNewLog] = useState({
    projectName: "",
    description: "",
    hoursWorked: "",
    weather: "",
    workers: "",
    notes: "",
  });

  const handleAddLog = () => {
    if (!newLog.projectName || !newLog.description) {
      Alert.alert("Error", "Please fill in project and description");
      return;
    }
    const log: WorkLog = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      projectName: newLog.projectName,
      description: newLog.description,
      hoursWorked: parseFloat(newLog.hoursWorked) || 0,
      weather: newLog.weather,
      workers: newLog.workers ? newLog.workers.split(",").map((w) => w.trim()) : undefined,
      notes: newLog.notes,
    };
    setLogs([log, ...logs]);
    setNewLog({
      projectName: "",
      description: "",
      hoursWorked: "",
      weather: "",
      workers: "",
      notes: "",
    });
    setShowAddModal(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === today.toISOString().split("T")[0]) return "Today";
    if (dateStr === yesterday.toISOString().split("T")[0]) return "Yesterday";
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.headerTitle}>Daily Work Logs</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Plus size={24} color={Colors.navy} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {logs.map((log) => (
            <TouchableOpacity
              key={log.id}
              style={styles.logCard}
              onPress={() => setSelectedLog(log)}
              activeOpacity={0.7}
            >
              <View style={styles.logHeader}>
                <View style={styles.dateRow}>
                  <Calendar size={16} color={Colors.navy} strokeWidth={1.5} />
                  <Text style={styles.dateText}>{formatDate(log.date)}</Text>
                </View>
                <View style={styles.hoursRow}>
                  <Clock size={14} color="#6B7280" strokeWidth={1.5} />
                  <Text style={styles.hoursText}>{log.hoursWorked}h</Text>
                </View>
              </View>

              <View style={styles.projectRow}>
                <MapPin size={14} color="#6B7280" strokeWidth={1.5} />
                <Text style={styles.projectText}>{log.projectName}</Text>
              </View>

              <Text style={styles.descriptionText} numberOfLines={2}>
                {log.description}
              </Text>

              <View style={styles.logFooter}>
                {log.weather && (
                  <View style={styles.weatherBadge}>
                    <CloudSun size={12} color="#272D53" strokeWidth={1.5} />
                    <Text style={styles.weatherText}>{log.weather}</Text>
                  </View>
                )}
                {log.workers && log.workers.length > 0 && (
                  <View style={styles.workersBadge}>
                    <Users size={12} color="#6B7280" strokeWidth={1.5} />
                    <Text style={styles.workersText}>
                      {log.workers.length} worker{log.workers.length > 1 ? "s" : ""}
                    </Text>
                  </View>
                )}
                {log.photos && log.photos.length > 0 && (
                  <View style={styles.photosBadge}>
                    <Camera size={12} color="#6B7280" strokeWidth={1.5} />
                    <Text style={styles.photosText}>{log.photos.length} photos</Text>
                  </View>
                )}
              </View>

              <ChevronRight
                size={20}
                color="#D1D5DB"
                style={styles.chevron}
                strokeWidth={1.5}
              />
            </TouchableOpacity>
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
            <Text style={styles.modalTitle}>New Work Log</Text>
            <TouchableOpacity onPress={handleAddLog}>
              <Check size={24} color={Colors.navy} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Project Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Select or enter project"
                placeholderTextColor="#9CA3AF"
                value={newLog.projectName}
                onChangeText={(text) =>
                  setNewLog({ ...newLog, projectName: text })
                }
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Work Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe what was accomplished today..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                value={newLog.description}
                onChangeText={(text) =>
                  setNewLog({ ...newLog, description: text })
                }
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Hours Worked</Text>
              <TextInput
                style={styles.input}
                placeholder="8"
                placeholderTextColor="#9CA3AF"
                keyboardType="decimal-pad"
                value={newLog.hoursWorked}
                onChangeText={(text) =>
                  setNewLog({ ...newLog, hoursWorked: text })
                }
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Weather Conditions</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Sunny, 72°F"
                placeholderTextColor="#9CA3AF"
                value={newLog.weather}
                onChangeText={(text) => setNewLog({ ...newLog, weather: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Workers Present</Text>
              <TextInput
                style={styles.input}
                placeholder="John Smith, Mike Johnson"
                placeholderTextColor="#9CA3AF"
                value={newLog.workers}
                onChangeText={(text) => setNewLog({ ...newLog, workers: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Additional Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Any additional notes or reminders..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                value={newLog.notes}
                onChangeText={(text) => setNewLog({ ...newLog, notes: text })}
              />
            </View>

            <TouchableOpacity style={styles.photoButton}>
              <Camera size={20} color={Colors.navy} strokeWidth={1.5} />
              <Text style={styles.photoButtonText}>Add Photos</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={selectedLog !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedLog(null)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSelectedLog(null)}>
              <X size={24} color="#6B7280" strokeWidth={1.5} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Work Log Details</Text>
            <View style={{ width: 24 }} />
          </View>

          {selectedLog && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.detailSection}>
                <View style={styles.detailRow}>
                  <Calendar size={18} color={Colors.navy} strokeWidth={1.5} />
                  <Text style={styles.detailLabel}>Date</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(selectedLog.date)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <MapPin size={18} color={Colors.navy} strokeWidth={1.5} />
                  <Text style={styles.detailLabel}>Project</Text>
                  <Text style={styles.detailValue}>{selectedLog.projectName}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Clock size={18} color={Colors.navy} strokeWidth={1.5} />
                  <Text style={styles.detailLabel}>Hours</Text>
                  <Text style={styles.detailValue}>
                    {selectedLog.hoursWorked} hours
                  </Text>
                </View>
                {selectedLog.weather && (
                  <View style={styles.detailRow}>
                    <CloudSun size={18} color={Colors.navy} strokeWidth={1.5} />
                    <Text style={styles.detailLabel}>Weather</Text>
                    <Text style={styles.detailValue}>{selectedLog.weather}</Text>
                  </View>
                )}
              </View>

              <View style={styles.detailCard}>
                <Text style={styles.detailCardTitle}>Work Description</Text>
                <Text style={styles.detailCardText}>
                  {selectedLog.description}
                </Text>
              </View>

              {selectedLog.workers && selectedLog.workers.length > 0 && (
                <View style={styles.detailCard}>
                  <Text style={styles.detailCardTitle}>Workers Present</Text>
                  {selectedLog.workers.map((worker, index) => (
                    <View key={index} style={styles.workerItem}>
                      <View style={styles.workerAvatar}>
                        <Text style={styles.workerInitial}>
                          {worker.charAt(0)}
                        </Text>
                      </View>
                      <Text style={styles.workerName}>{worker}</Text>
                    </View>
                  ))}
                </View>
              )}

              {selectedLog.photos && selectedLog.photos.length > 0 && (
                <View style={styles.detailCard}>
                  <Text style={styles.detailCardTitle}>Photos</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {selectedLog.photos.map((photo, index) => (
                      <Image
                        key={index}
                        source={{ uri: photo }}
                        style={styles.photoThumb}
                        contentFit="cover"
                      />
                    ))}
                  </ScrollView>
                </View>
              )}

              {selectedLog.notes && (
                <View style={styles.detailCard}>
                  <Text style={styles.detailCardTitle}>Notes</Text>
                  <Text style={styles.detailCardText}>{selectedLog.notes}</Text>
                </View>
              )}
            </ScrollView>
          )}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  logCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: "relative",
  },
  logHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.navy,
  },
  hoursRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  hoursText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#374151",
  },
  projectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  projectText: {
    fontSize: 14,
    color: "#6B7280",
  },
  descriptionText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    marginBottom: 12,
  },
  logFooter: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  weatherBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E8E9EE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  weatherText: {
    fontSize: 11,
    color: "#92400E",
  },
  workersBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  workersText: {
    fontSize: 11,
    color: "#6B7280",
  },
  photosBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  photosText: {
    fontSize: 11,
    color: "#6B7280",
  },
  chevron: {
    position: "absolute",
    right: 16,
    top: "50%",
    marginTop: -10,
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
    minHeight: 100,
    textAlignVertical: "top",
  },
  photoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    marginBottom: 20,
  },
  photoButtonText: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: Colors.navy,
  },
  detailSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  detailLabel: {
    flex: 1,
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 10,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#1F2937",
  },
  detailCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  detailCardTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#374151",
    marginBottom: 10,
  },
  detailCardText: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
  },
  workerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  workerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.navy,
    justifyContent: "center",
    alignItems: "center",
  },
  workerInitial: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  workerName: {
    fontSize: 14,
    color: "#374151",
  },
  photoThumb: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 10,
  },
});
