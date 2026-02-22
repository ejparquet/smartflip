import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  X,
  ClipboardCheck,
  User,
  MapPin,
  Calendar,
  ChevronDown,
  Clock,
  AlignLeft,
  Briefcase,
  FileCheck,
  Phone,
  AlertTriangle,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";

type InspectionType = "structural" | "electrical" | "plumbing" | "mechanical" | "general" | "energy" | "fire_safety";
type InspectionStatus = "scheduled" | "passed" | "failed" | "pending" | "in_progress";
type InspectionPriority = "low" | "medium" | "high";

interface InspectionTypeOption {
  id: InspectionType;
  label: string;
  description: string;
}

const inspectionTypes: InspectionTypeOption[] = [
  { id: "structural", label: "Structural", description: "Foundation, framing, and structural inspections" },
  { id: "electrical", label: "Electrical", description: "Electrical rough-in and final inspections" },
  { id: "plumbing", label: "Plumbing", description: "Plumbing pressure tests and final inspections" },
  { id: "mechanical", label: "Mechanical", description: "HVAC ductwork and mechanical inspections" },
  { id: "general", label: "General", description: "Final walkthrough and general inspections" },
  { id: "energy", label: "Energy", description: "Insulation and energy efficiency inspections" },
  { id: "fire_safety", label: "Fire Safety", description: "Fire stopping and safety inspections" },
];

const statusOptions: { id: InspectionStatus; label: string; color: string; bg: string }[] = [
  { id: "pending", label: "Pending", color: "#272D53", bg: "#E8E9EE" },
  { id: "scheduled", label: "Scheduled", color: "#3B82F6", bg: "#EFF6FF" },
  { id: "in_progress", label: "In Progress", color: "#8B5CF6", bg: "#F5F3FF" },
  { id: "passed", label: "Passed", color: "#10B981", bg: "#ECFDF5" },
  { id: "failed", label: "Failed", color: "#EF4444", bg: "#FEF2F2" },
];

const priorityOptions: { id: InspectionPriority; label: string; color: string; bg: string }[] = [
  { id: "low", label: "Low", color: "#6B7280", bg: "#F3F4F6" },
  { id: "medium", label: "Medium", color: "#272D53", bg: "#E8E9EE" },
  { id: "high", label: "High", color: "#EF4444", bg: "#FEF2F2" },
];

export default function AddInspectionScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  const [title, setTitle] = useState("");
  const [inspector, setInspector] = useState("");
  const [inspectorPhone, setInspectorPhone] = useState("");
  const [property, setProperty] = useState("");
  const [projectName, setProjectName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [status, setStatus] = useState<InspectionStatus>("pending");
  const [priority, setPriority] = useState<InspectionPriority>("medium");
  const [inspectionType, setInspectionType] = useState<InspectionType | null>(null);
  const [permitRef, setPermitRef] = useState("");
  const [notes, setNotes] = useState("");
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);

  const selectedType = inspectionTypes.find((t) => t.id === inspectionType);

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert("Missing Information", "Please enter an inspection title");
      return;
    }
    if (!property.trim()) {
      Alert.alert("Missing Information", "Please enter a property address");
      return;
    }
    if (!inspector.trim()) {
      Alert.alert("Missing Information", "Please enter the inspector name");
      return;
    }

    console.log("Creating inspection:", {
      title,
      inspector,
      inspectorPhone,
      property,
      projectName,
      date,
      time,
      status,
      priority,
      inspectionType,
      permitRef,
      notes,
    });

    Alert.alert("Inspection Created", "Your new inspection has been created successfully.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: theme.surfaceSecondary }]}
            onPress={() => router.back()}
            testID="close-add-inspection"
          >
            <X size={20} color={theme.text} strokeWidth={1.5} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>New Inspection</Text>
          <TouchableOpacity
            style={[
              styles.saveBtn,
              { backgroundColor: theme.navy },
              (!title.trim() || !property.trim()) && { opacity: 0.5 },
            ]}
            onPress={handleSubmit}
            testID="save-inspection"
          >
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            style={styles.form}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.formContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Inspection Details</Text>
              <View style={[styles.card, { backgroundColor: theme.surface }]}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabelBold, { color: theme.text }]}>Inspection Title *</Text>
                  <TextInput
                    style={[styles.cardInput, { backgroundColor: theme.surfaceSecondary, color: theme.text }]}
                    placeholder="e.g. Framing Inspection"
                    placeholderTextColor={theme.textTertiary}
                    value={title}
                    onChangeText={setTitle}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Inspection Type</Text>
                  <TouchableOpacity
                    style={[styles.cardDropdown, { backgroundColor: theme.surfaceSecondary }]}
                    onPress={() => setShowTypePicker(!showTypePicker)}
                    testID="inspection-type-picker"
                  >
                    <Text
                      style={[
                        styles.dropdownText,
                        { color: selectedType ? theme.text : theme.textTertiary },
                      ]}
                    >
                      {selectedType ? selectedType.label : "Select inspection type"}
                    </Text>
                    <ChevronDown size={18} color={theme.textSecondary} strokeWidth={1.5} />
                  </TouchableOpacity>
                  {showTypePicker && (
                    <View style={[styles.dropdownList, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                      {inspectionTypes.map((type) => (
                        <TouchableOpacity
                          key={type.id}
                          style={[
                            styles.dropdownItem,
                            { borderBottomColor: theme.borderLight },
                            inspectionType === type.id && { backgroundColor: theme.surfaceSecondary },
                          ]}
                          onPress={() => {
                            setInspectionType(type.id);
                            setShowTypePicker(false);
                          }}
                        >
                          <Text style={[styles.optionLabel, { color: theme.text }]}>{type.label}</Text>
                          <Text style={[styles.optionDesc, { color: theme.textTertiary }]}>
                            {type.description}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Project Name</Text>
                  <TextInput
                    style={[styles.cardInput, { backgroundColor: theme.surfaceSecondary, color: theme.text }]}
                    placeholder="e.g. Oak Street Renovation"
                    placeholderTextColor={theme.textTertiary}
                    value={projectName}
                    onChangeText={setProjectName}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabelBold, { color: theme.text }]}>Property *</Text>
                  <TextInput
                    style={[styles.cardInput, { backgroundColor: theme.surfaceSecondary, color: theme.text }]}
                    placeholder="e.g. 123 Oak Street"
                    placeholderTextColor={theme.textTertiary}
                    value={property}
                    onChangeText={setProperty}
                  />
                </View>

                <View style={[styles.inputGroup, { marginBottom: 0 }]}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Linked Permit</Text>
                  <TextInput
                    style={[styles.cardInput, { backgroundColor: theme.surfaceSecondary, color: theme.text }]}
                    placeholder="e.g. BP-2026-0412"
                    placeholderTextColor={theme.textTertiary}
                    value={permitRef}
                    onChangeText={setPermitRef}
                  />
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Inspector Info</Text>
              <View style={[styles.card, { backgroundColor: theme.surface }]}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabelBold, { color: theme.text }]}>Inspector *</Text>
                  <TextInput
                    style={[styles.cardInput, { backgroundColor: theme.surfaceSecondary, color: theme.text }]}
                    placeholder="e.g. Robert Chen"
                    placeholderTextColor={theme.textTertiary}
                    value={inspector}
                    onChangeText={setInspector}
                  />
                </View>

                <View style={[styles.inputGroup, { marginBottom: 0 }]}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Inspector Phone</Text>
                  <TextInput
                    style={[styles.cardInput, { backgroundColor: theme.surfaceSecondary, color: theme.text }]}
                    placeholder="e.g. (555) 234-5678"
                    placeholderTextColor={theme.textTertiary}
                    value={inspectorPhone}
                    onChangeText={setInspectorPhone}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Schedule & Status</Text>
              <View style={[styles.card, { backgroundColor: theme.surface }]}>
                <View style={styles.rowInputs}>
                  <View style={styles.halfInputGroup}>
                    <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Date</Text>
                    <View style={[styles.dateInput, { backgroundColor: theme.surfaceSecondary }]}>
                      <TextInput
                        style={[styles.dateInputText, { color: theme.text }]}
                        placeholder="MM/DD/YYYY"
                        placeholderTextColor={theme.textTertiary}
                        value={date}
                        onChangeText={setDate}
                      />
                      <Calendar size={18} color={theme.textSecondary} strokeWidth={1.5} />
                    </View>
                  </View>
                  <View style={styles.halfInputGroup}>
                    <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Time</Text>
                    <View style={[styles.dateInput, { backgroundColor: theme.surfaceSecondary }]}>
                      <TextInput
                        style={[styles.dateInputText, { color: theme.text }]}
                        placeholder="HH:MM AM"
                        placeholderTextColor={theme.textTertiary}
                        value={time}
                        onChangeText={setTime}
                      />
                      <Clock size={18} color={theme.textSecondary} strokeWidth={1.5} />
                    </View>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Priority</Text>
                  <TouchableOpacity
                    style={[styles.cardDropdown, { backgroundColor: theme.surfaceSecondary }]}
                    onPress={() => setShowPriorityPicker(!showPriorityPicker)}
                    testID="inspection-priority-picker"
                  >
                    <View style={styles.statusInPicker}>
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: priorityOptions.find((p) => p.id === priority)?.color },
                        ]}
                      />
                      <Text style={[styles.dropdownText, { color: theme.text }]}>
                        {priorityOptions.find((p) => p.id === priority)?.label}
                      </Text>
                    </View>
                    <ChevronDown size={18} color={theme.textSecondary} strokeWidth={1.5} />
                  </TouchableOpacity>
                  {showPriorityPicker && (
                    <View style={[styles.dropdownList, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                      {priorityOptions.map((opt) => (
                        <TouchableOpacity
                          key={opt.id}
                          style={[
                            styles.dropdownItem,
                            { borderBottomColor: theme.borderLight },
                            priority === opt.id && { backgroundColor: theme.surfaceSecondary },
                          ]}
                          onPress={() => {
                            setPriority(opt.id);
                            setShowPriorityPicker(false);
                          }}
                        >
                          <View style={styles.statusOptionRow}>
                            <View style={[styles.statusDot, { backgroundColor: opt.color }]} />
                            <Text style={[styles.optionLabel, { color: theme.text }]}>{opt.label}</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                <View style={[styles.inputGroup, { marginBottom: 0 }]}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Status</Text>
                  <TouchableOpacity
                    style={[styles.cardDropdown, { backgroundColor: theme.surfaceSecondary }]}
                    onPress={() => setShowStatusPicker(!showStatusPicker)}
                    testID="inspection-status-picker"
                  >
                    <View style={styles.statusInPicker}>
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: statusOptions.find((s) => s.id === status)?.color },
                        ]}
                      />
                      <Text style={[styles.dropdownText, { color: theme.text }]}>
                        {statusOptions.find((s) => s.id === status)?.label}
                      </Text>
                    </View>
                    <ChevronDown size={18} color={theme.textSecondary} strokeWidth={1.5} />
                  </TouchableOpacity>
                  {showStatusPicker && (
                    <View style={[styles.dropdownList, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                      {statusOptions.map((opt) => (
                        <TouchableOpacity
                          key={opt.id}
                          style={[
                            styles.dropdownItem,
                            { borderBottomColor: theme.borderLight },
                            status === opt.id && { backgroundColor: theme.surfaceSecondary },
                          ]}
                          onPress={() => {
                            setStatus(opt.id);
                            setShowStatusPicker(false);
                          }}
                        >
                          <View style={styles.statusOptionRow}>
                            <View style={[styles.statusDot, { backgroundColor: opt.color }]} />
                            <Text style={[styles.optionLabel, { color: theme.text }]}>{opt.label}</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Additional Info</Text>
              <View style={[styles.card, { backgroundColor: theme.surface }]}>
                <View style={[styles.inputGroup, { marginBottom: 0 }]}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Notes</Text>
                  <TextInput
                    style={[
                      styles.cardInput,
                      styles.multilineInput,
                      { backgroundColor: theme.surfaceSecondary, color: theme.text },
                    ]}
                    placeholder="Add any notes or requirements for this inspection..."
                    placeholderTextColor={theme.textTertiary}
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    textAlignVertical="top"
                  />
                </View>
              </View>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
  saveBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600" as const,
  },
  form: { flex: 1 },
  formContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  inputLabelBold: {
    fontSize: 14,
    fontWeight: "600" as const,
    marginBottom: 6,
  },
  cardInput: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
  },
  multilineInput: {
    height: 120,
    textAlignVertical: "top" as const,
  },
  cardDropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  dropdownText: {
    fontSize: 14,
  },
  dropdownList: {
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 4,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: "500" as const,
  },
  optionDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  rowInputs: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  halfInputGroup: {
    flex: 1,
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dateInputText: {
    flex: 1,
    fontSize: 14,
  },
  statusInPicker: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
