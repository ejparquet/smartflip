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
  Calendar,
  ChevronDown,
  Clock,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";

type ContractType = "general" | "subcontractor" | "service" | "material" | "maintenance";
type ContractStatus = "active" | "pending" | "expired" | "completed";

interface ContractTypeOption {
  id: ContractType;
  label: string;
  description: string;
}

const contractTypes: ContractTypeOption[] = [
  { id: "general", label: "General Construction", description: "Full scope construction agreement" },
  { id: "subcontractor", label: "Subcontractor", description: "Agreement with a subcontractor" },
  { id: "service", label: "Service Agreement", description: "Ongoing service contract" },
  { id: "material", label: "Material Supply", description: "Material procurement contract" },
  { id: "maintenance", label: "Maintenance", description: "Maintenance and upkeep agreement" },
];

const statusOptions: { id: ContractStatus; label: string; color: string; bg: string }[] = [
  { id: "pending", label: "Pending", color: "#272D53", bg: "#E8E9EE" },
  { id: "active", label: "Active", color: "#10B981", bg: "#ECFDF5" },
  { id: "completed", label: "Completed", color: "#3B82F6", bg: "#EFF6FF" },
  { id: "expired", label: "Expired", color: "#EF4444", bg: "#FEF2F2" },
];

export default function AddContractScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  const [title, setTitle] = useState("");
  const [vendor, setVendor] = useState("");
  const [property, setProperty] = useState("");
  const [amount, setAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<ContractStatus>("pending");
  const [contractType, setContractType] = useState<ContractType | null>(null);
  const [description, setDescription] = useState("");
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  const selectedType = contractTypes.find((t) => t.id === contractType);

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert("Missing Information", "Please enter a contract title");
      return;
    }
    if (!vendor.trim()) {
      Alert.alert("Missing Information", "Please enter a vendor name");
      return;
    }
    if (!property.trim()) {
      Alert.alert("Missing Information", "Please enter a property address");
      return;
    }
    if (!amount.trim()) {
      Alert.alert("Missing Information", "Please enter the contract amount");
      return;
    }

    console.log("Creating contract:", {
      title,
      vendor,
      property,
      amount,
      startDate,
      endDate,
      status,
      contractType,
      description,
    });

    Alert.alert("Contract Created", "Your new contract has been created successfully.", [
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
            testID="close-add-contract"
          >
            <X size={20} color={theme.text} strokeWidth={1.5} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>New Contract</Text>
          <TouchableOpacity
            style={[
              styles.saveBtn,
              { backgroundColor: theme.navy },
              (!title.trim() || !vendor.trim()) && { opacity: 0.5 },
            ]}
            onPress={handleSubmit}
            testID="save-contract"
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
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Contract Details</Text>
              <View style={[styles.card, { backgroundColor: theme.surface }]}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabelBold, { color: theme.text }]}>Contract Title *</Text>
                  <TextInput
                    style={[styles.cardInput, { backgroundColor: theme.surfaceSecondary, color: theme.text }]}
                    placeholder="e.g. General Construction Agreement"
                    placeholderTextColor={theme.textTertiary}
                    value={title}
                    onChangeText={setTitle}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Contract Type</Text>
                  <TouchableOpacity
                    style={[styles.cardDropdown, { backgroundColor: theme.surfaceSecondary }]}
                    onPress={() => setShowTypePicker(!showTypePicker)}
                    testID="contract-type-picker"
                  >
                    <Text
                      style={[
                        styles.dropdownText,
                        { color: selectedType ? theme.text : theme.textTertiary },
                      ]}
                    >
                      {selectedType ? selectedType.label : "Select contract type"}
                    </Text>
                    <ChevronDown size={18} color={theme.textSecondary} strokeWidth={1.5} />
                  </TouchableOpacity>
                  {showTypePicker && (
                    <View style={[styles.dropdownList, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                      {contractTypes.map((type) => (
                        <TouchableOpacity
                          key={type.id}
                          style={[
                            styles.dropdownItem,
                            { borderBottomColor: theme.borderLight },
                            contractType === type.id && { backgroundColor: theme.surfaceSecondary },
                          ]}
                          onPress={() => {
                            setContractType(type.id);
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
                  <Text style={[styles.inputLabelBold, { color: theme.text }]}>Vendor / Contractor *</Text>
                  <TextInput
                    style={[styles.cardInput, { backgroundColor: theme.surfaceSecondary, color: theme.text }]}
                    placeholder="e.g. Smith & Sons Construction"
                    placeholderTextColor={theme.textTertiary}
                    value={vendor}
                    onChangeText={setVendor}
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

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabelBold, { color: theme.text }]}>Contract Amount *</Text>
                  <TextInput
                    style={[styles.cardInput, { backgroundColor: theme.surfaceSecondary, color: theme.text }]}
                    placeholder="$0.00"
                    placeholderTextColor={theme.textTertiary}
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Schedule & Status</Text>
              <View style={[styles.card, { backgroundColor: theme.surface }]}>
                <View style={styles.rowInputs}>
                  <View style={styles.halfInputGroup}>
                    <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Start Date</Text>
                    <View style={[styles.dateInput, { backgroundColor: theme.surfaceSecondary }]}>
                      <TextInput
                        style={[styles.dateInputText, { color: theme.text }]}
                        placeholder="MM/DD/YYYY"
                        placeholderTextColor={theme.textTertiary}
                        value={startDate}
                        onChangeText={setStartDate}
                      />
                      <Calendar size={18} color={theme.textSecondary} strokeWidth={1.5} />
                    </View>
                  </View>
                  <View style={styles.halfInputGroup}>
                    <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>End Date</Text>
                    <View style={[styles.dateInput, { backgroundColor: theme.surfaceSecondary }]}>
                      <TextInput
                        style={[styles.dateInputText, { color: theme.text }]}
                        placeholder="MM/DD/YYYY"
                        placeholderTextColor={theme.textTertiary}
                        value={endDate}
                        onChangeText={setEndDate}
                      />
                      <Clock size={18} color={theme.textSecondary} strokeWidth={1.5} />
                    </View>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Status</Text>
                  <TouchableOpacity
                    style={[styles.cardDropdown, { backgroundColor: theme.surfaceSecondary }]}
                    onPress={() => setShowStatusPicker(!showStatusPicker)}
                    testID="contract-status-picker"
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
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Description / Notes</Text>
                  <TextInput
                    style={[
                      styles.cardInput,
                      styles.multilineInput,
                      { backgroundColor: theme.surfaceSecondary, color: theme.text },
                    ]}
                    placeholder="Add any notes or terms for this contract..."
                    placeholderTextColor={theme.textTertiary}
                    value={description}
                    onChangeText={setDescription}
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
