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
import {
  ArrowLeft,
  Plus,
  X,
  Check,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Calendar,
  MapPin,
  ClipboardCheck,
  HardHat,
  Eye,
  Footprints,
  Hand,
  Flame,
  Zap,
  ChevronRight,
  RotateCcw,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";

interface ChecklistItem {
  id: string;
  text: string;
  isChecked: boolean;
  category: string;
}

interface SafetyChecklist {
  id: string;
  title: string;
  projectName: string;
  date: string;
  completedBy?: string;
  items: ChecklistItem[];
  status: "pending" | "in_progress" | "completed";
  notes?: string;
}

const defaultOshaItems: ChecklistItem[] = [
  { id: "1", text: "Hard hats worn in designated areas", isChecked: false, category: "PPE" },
  { id: "2", text: "Safety glasses/goggles available and worn", isChecked: false, category: "PPE" },
  { id: "3", text: "Steel-toed boots worn by all workers", isChecked: false, category: "PPE" },
  { id: "4", text: "Hearing protection provided where needed", isChecked: false, category: "PPE" },
  { id: "5", text: "Work gloves available and worn", isChecked: false, category: "PPE" },
  { id: "6", text: "Fall protection in place for heights over 6ft", isChecked: false, category: "Fall Protection" },
  { id: "7", text: "Guardrails installed on elevated platforms", isChecked: false, category: "Fall Protection" },
  { id: "8", text: "Ladders inspected and properly secured", isChecked: false, category: "Fall Protection" },
  { id: "9", text: "Fire extinguishers accessible and charged", isChecked: false, category: "Fire Safety" },
  { id: "10", text: "Emergency exits clear and marked", isChecked: false, category: "Fire Safety" },
  { id: "11", text: "Electrical cords and tools inspected", isChecked: false, category: "Electrical" },
  { id: "12", text: "GFCI protection on all outlets", isChecked: false, category: "Electrical" },
  { id: "13", text: "Lockout/tagout procedures followed", isChecked: false, category: "Electrical" },
  { id: "14", text: "First aid kit stocked and accessible", isChecked: false, category: "Emergency" },
  { id: "15", text: "Emergency contact numbers posted", isChecked: false, category: "Emergency" },
  { id: "16", text: "Hazardous materials properly stored", isChecked: false, category: "Hazmat" },
  { id: "17", text: "MSDS sheets available for chemicals", isChecked: false, category: "Hazmat" },
  { id: "18", text: "Walkways clear of debris and obstacles", isChecked: false, category: "Housekeeping" },
  { id: "19", text: "Tools properly stored when not in use", isChecked: false, category: "Housekeeping" },
  { id: "20", text: "Proper ventilation in work areas", isChecked: false, category: "Environment" },
];

const mockChecklists: SafetyChecklist[] = [
  {
    id: "1",
    title: "Daily Site Inspection",
    projectName: "Kitchen Renovation",
    date: "2025-01-25",
    completedBy: "John Smith",
    items: defaultOshaItems.map((item, index) => ({
      ...item,
      isChecked: index < 15,
    })),
    status: "in_progress",
  },
  {
    id: "2",
    title: "Weekly Safety Audit",
    projectName: "Bathroom Remodel",
    date: "2025-01-20",
    completedBy: "Mike Johnson",
    items: defaultOshaItems.map((item) => ({ ...item, isChecked: true })),
    status: "completed",
  },
];

const categoryIcons: Record<string, React.ReactNode> = {
  PPE: <HardHat size={16} color="#3B82F6" strokeWidth={1.5} />,
  "Fall Protection": <AlertTriangle size={16} color="#272D53" strokeWidth={1.5} />,
  "Fire Safety": <Flame size={16} color="#EF4444" strokeWidth={1.5} />,
  Electrical: <Zap size={16} color="#8B5CF6" strokeWidth={1.5} />,
  Emergency: <Shield size={16} color="#10B981" strokeWidth={1.5} />,
  Hazmat: <AlertTriangle size={16} color="#EC4899" strokeWidth={1.5} />,
  Housekeeping: <ClipboardCheck size={16} color="#6B7280" strokeWidth={1.5} />,
  Environment: <Eye size={16} color="#14B8A6" strokeWidth={1.5} />,
};

export default function SafetyChecklistsScreen() {
  const router = useRouter();
  const [checklists, setChecklists] = useState<SafetyChecklist[]>(mockChecklists);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState<SafetyChecklist | null>(null);
  const [newChecklist, setNewChecklist] = useState({
    title: "",
    projectName: "",
  });

  const getCompletionPercentage = (items: ChecklistItem[]) => {
    const checked = items.filter((item) => item.isChecked).length;
    return Math.round((checked / items.length) * 100);
  };

  const handleCreateChecklist = () => {
    if (!newChecklist.title || !newChecklist.projectName) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    const checklist: SafetyChecklist = {
      id: Date.now().toString(),
      title: newChecklist.title,
      projectName: newChecklist.projectName,
      date: new Date().toISOString().split("T")[0],
      items: defaultOshaItems.map((item) => ({ ...item, isChecked: false })),
      status: "pending",
    };

    setChecklists([checklist, ...checklists]);
    setNewChecklist({ title: "", projectName: "" });
    setShowAddModal(false);
    setSelectedChecklist(checklist);
  };

  const toggleItem = (itemId: string) => {
    if (!selectedChecklist) return;

    const updatedItems = selectedChecklist.items.map((item) =>
      item.id === itemId ? { ...item, isChecked: !item.isChecked } : item
    );

    const allChecked = updatedItems.every((item) => item.isChecked);
    const someChecked = updatedItems.some((item) => item.isChecked);

    const updatedChecklist: SafetyChecklist = {
      ...selectedChecklist,
      items: updatedItems,
      status: allChecked ? "completed" : someChecked ? "in_progress" : "pending",
    };

    setSelectedChecklist(updatedChecklist);
    setChecklists(
      checklists.map((c) => (c.id === updatedChecklist.id ? updatedChecklist : c))
    );
  };

  const resetChecklist = () => {
    if (!selectedChecklist) return;

    Alert.alert(
      "Reset Checklist",
      "This will uncheck all items. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            const updatedChecklist: SafetyChecklist = {
              ...selectedChecklist,
              items: selectedChecklist.items.map((item) => ({
                ...item,
                isChecked: false,
              })),
              status: "pending",
            };
            setSelectedChecklist(updatedChecklist);
            setChecklists(
              checklists.map((c) =>
                c.id === updatedChecklist.id ? updatedChecklist : c
              )
            );
          },
        },
      ]
    );
  };

  const groupItemsByCategory = (items: ChecklistItem[]) => {
    return items.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, ChecklistItem[]>);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.headerTitle}>Safety Checklists</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Plus size={24} color={Colors.navy} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Shield size={24} color={Colors.navy} strokeWidth={1.5} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>OSHA Compliance</Text>
            <Text style={styles.infoText}>
              Complete safety checklists to ensure job site compliance with OSHA
              regulations.
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {checklists.map((checklist) => {
            const percentage = getCompletionPercentage(checklist.items);
            const isComplete = checklist.status === "completed";

            return (
              <TouchableOpacity
                key={checklist.id}
                style={styles.checklistCard}
                onPress={() => setSelectedChecklist(checklist)}
                activeOpacity={0.7}
              >
                <View style={styles.checklistHeader}>
                  <View
                    style={[
                      styles.statusIcon,
                      isComplete && styles.statusIconComplete,
                    ]}
                  >
                    {isComplete ? (
                      <CheckCircle2 size={20} color="#FFFFFF" strokeWidth={2} />
                    ) : (
                      <ClipboardCheck size={20} color={Colors.navy} strokeWidth={1.5} />
                    )}
                  </View>
                  <View style={styles.checklistInfo}>
                    <Text style={styles.checklistTitle}>{checklist.title}</Text>
                    <View style={styles.checklistMeta}>
                      <MapPin size={12} color="#6B7280" strokeWidth={1.5} />
                      <Text style={styles.checklistMetaText}>
                        {checklist.projectName}
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={20} color="#D1D5DB" strokeWidth={1.5} />
                </View>

                <View style={styles.progressSection}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${percentage}%` },
                        isComplete && styles.progressFillComplete,
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.progressText,
                      isComplete && styles.progressTextComplete,
                    ]}
                  >
                    {percentage}% Complete
                  </Text>
                </View>

                <View style={styles.checklistFooter}>
                  <View style={styles.dateRow}>
                    <Calendar size={12} color="#6B7280" strokeWidth={1.5} />
                    <Text style={styles.dateText}>{checklist.date}</Text>
                  </View>
                  {checklist.completedBy && (
                    <Text style={styles.completedBy}>
                      By: {checklist.completedBy}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
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
            <Text style={styles.modalTitle}>New Checklist</Text>
            <TouchableOpacity onPress={handleCreateChecklist}>
              <Check size={24} color={Colors.navy} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Checklist Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Daily Site Inspection"
                placeholderTextColor="#9CA3AF"
                value={newChecklist.title}
                onChangeText={(text) =>
                  setNewChecklist({ ...newChecklist, title: text })
                }
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Project Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Select or enter project"
                placeholderTextColor="#9CA3AF"
                value={newChecklist.projectName}
                onChangeText={(text) =>
                  setNewChecklist({ ...newChecklist, projectName: text })
                }
              />
            </View>

            <View style={styles.previewSection}>
              <Text style={styles.previewTitle}>
                Standard OSHA Checklist Items ({defaultOshaItems.length} items)
              </Text>
              <Text style={styles.previewText}>
                This checklist includes standard OSHA compliance items covering:
              </Text>
              <View style={styles.previewCategories}>
                {Object.keys(categoryIcons).map((category) => (
                  <View key={category} style={styles.categoryBadge}>
                    {categoryIcons[category]}
                    <Text style={styles.categoryBadgeText}>{category}</Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={selectedChecklist !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedChecklist(null)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSelectedChecklist(null)}>
              <X size={24} color="#6B7280" strokeWidth={1.5} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Safety Checklist</Text>
            <TouchableOpacity onPress={resetChecklist}>
              <RotateCcw size={22} color="#6B7280" strokeWidth={1.5} />
            </TouchableOpacity>
          </View>

          {selectedChecklist && (
            <ScrollView style={styles.checklistContent}>
              <View style={styles.checklistDetailHeader}>
                <Text style={styles.checklistDetailTitle}>
                  {selectedChecklist.title}
                </Text>
                <View style={styles.checklistDetailMeta}>
                  <MapPin size={14} color="#6B7280" strokeWidth={1.5} />
                  <Text style={styles.checklistDetailMetaText}>
                    {selectedChecklist.projectName}
                  </Text>
                </View>
                <View style={styles.detailProgressBar}>
                  <View
                    style={[
                      styles.detailProgressFill,
                      {
                        width: `${getCompletionPercentage(
                          selectedChecklist.items
                        )}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.detailProgressText}>
                  {selectedChecklist.items.filter((i) => i.isChecked).length} of{" "}
                  {selectedChecklist.items.length} items completed
                </Text>
              </View>

              {Object.entries(groupItemsByCategory(selectedChecklist.items)).map(
                ([category, items]) => (
                  <View key={category} style={styles.categorySection}>
                    <View style={styles.categoryHeader}>
                      {categoryIcons[category]}
                      <Text style={styles.categoryTitle}>{category}</Text>
                      <Text style={styles.categoryCount}>
                        {items.filter((i) => i.isChecked).length}/{items.length}
                      </Text>
                    </View>
                    {items.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.checkItem}
                        onPress={() => toggleItem(item.id)}
                        activeOpacity={0.7}
                      >
                        <View
                          style={[
                            styles.checkbox,
                            item.isChecked && styles.checkboxChecked,
                          ]}
                        >
                          {item.isChecked && (
                            <Check size={14} color="#FFFFFF" strokeWidth={3} />
                          )}
                        </View>
                        <Text
                          style={[
                            styles.checkItemText,
                            item.isChecked && styles.checkItemTextChecked,
                          ]}
                        >
                          {item.text}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )
              )}
              <View style={{ height: 40 }} />
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
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    margin: 16,
    padding: 16,
    borderRadius: 14,
    gap: 14,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.navy,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 18,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  checklistCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  checklistHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  statusIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
  },
  statusIconComplete: {
    backgroundColor: "#10B981",
  },
  checklistInfo: {
    flex: 1,
    marginLeft: 12,
  },
  checklistTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  checklistMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  checklistMetaText: {
    fontSize: 13,
    color: "#6B7280",
  },
  progressSection: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    marginBottom: 6,
  },
  progressFill: {
    height: 8,
    backgroundColor: Colors.navy,
    borderRadius: 4,
  },
  progressFillComplete: {
    backgroundColor: "#10B981",
  },
  progressText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500" as const,
  },
  progressTextComplete: {
    color: "#10B981",
  },
  checklistFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 12,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: "#6B7280",
  },
  completedBy: {
    fontSize: 12,
    color: "#6B7280",
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
  previewSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginTop: 8,
  },
  previewTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 8,
  },
  previewText: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 12,
  },
  previewCategories: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "500" as const,
  },
  checklistContent: {
    flex: 1,
  },
  checklistDetailHeader: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginBottom: 16,
  },
  checklistDetailTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginBottom: 8,
  },
  checklistDetailMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  checklistDetailMetaText: {
    fontSize: 14,
    color: "#6B7280",
  },
  detailProgressBar: {
    height: 10,
    backgroundColor: "#E5E7EB",
    borderRadius: 5,
    marginBottom: 8,
  },
  detailProgressFill: {
    height: 10,
    backgroundColor: Colors.navy,
    borderRadius: 5,
  },
  detailProgressText: {
    fontSize: 13,
    color: "#6B7280",
  },
  categorySection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    overflow: "hidden",
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 14,
    backgroundColor: "#F9FAFB",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  categoryTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#374151",
  },
  categoryCount: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500" as const,
  },
  checkItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  checkItemText: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  checkItemTextChecked: {
    color: "#9CA3AF",
    textDecorationLine: "line-through",
  },
});
