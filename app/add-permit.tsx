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
  FileCheck,
  User,
  MapPin,
  DollarSign,
  Calendar,
  ChevronDown,
  Clock,
  AlignLeft,
  Building2,
  Hash,
  Shield,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";

type PermitType = "construction" | "electrical" | "plumbing" | "demolition" | "roofing" | "mechanical" | "structural" | "site_work";
type PermitStatus = "approved" | "pending" | "expired" | "under_review" | "denied";

interface PermitTypeOption {
  id: PermitType;
  label: string;
  description: string;
}

const permitTypes: PermitTypeOption[] = [
  { id: "construction", label: "Construction", description: "Building and general construction permits" },
  { id: "electrical", label: "Electrical", description: "Electrical work and wiring permits" },
  { id: "plumbing", label: "Plumbing", description: "Plumbing installation and repair permits" },
  { id: "demolition", label: "Demolition", description: "Demolition and teardown permits" },
  { id: "roofing", label: "Roofing", description: "Roof installation or replacement permits" },
  { id: "mechanical", label: "Mechanical", description: "HVAC and mechanical system permits" },
  { id: "structural", label: "Structural", description: "Foundation and structural work permits" },
  { id: "site_work", label: "Site Work", description: "Grading, drainage, and site work permits" },
];

const statusOptions: { id: PermitStatus; label: string; color: string; bg: string }[] = [
  { id: "pending", label: "Pending", color: "#272D53", bg: "#E8E9EE" },
  { id: "under_review", label: "Under Review", color: "#6366F1", bg: "#EEF2FF" },
  { id: "approved", label: "Approved", color: "#10B981", bg: "#ECFDF5" },
  { id: "denied", label: "Denied", color: "#DC2626", bg: "#FEE2E2" },
  { id: "expired", label: "Expired", color: "#EF4444", bg: "#FEF2F2" },
];

export default function AddPermitScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  const [title, setTitle] = useState("");
  const [permitNumber, setPermitNumber] = useState("");
  const [property, setProperty] = useState("");
  const [fee, setFee] = useState("");
  const [issuedDate, setIssuedDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [status, setStatus] = useState<PermitStatus>("pending");
  const [permitType, setPermitType] = useState<PermitType | null>(null);
  const [jurisdiction, setJurisdiction] = useState("");
  const [applicant, setApplicant] = useState("");
  const [contractor, setContractor] = useState("");
  const [description, setDescription] = useState("");
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  const selectedType = permitTypes.find((t) => t.id === permitType);

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert("Missing Information", "Please enter a permit title");
      return;
    }
    if (!property.trim()) {
      Alert.alert("Missing Information", "Please enter a property address");
      return;
    }
    if (!jurisdiction.trim()) {
      Alert.alert("Missing Information", "Please enter the jurisdiction");
      return;
    }

    console.log("Creating permit:", {
      title,
      permitNumber,
      property,
      fee,
      issuedDate,
      expiryDate,
      status,
      permitType,
      jurisdiction,
      applicant,
      contractor,
      description,
    });

    Alert.alert("Permit Created", "Your new permit has been created successfully.", [
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
            testID="close-add-permit"
          >
            <X size={20} color={theme.text} strokeWidth={1.5} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>New Permit</Text>
          <TouchableOpacity
            style={[
              styles.saveBtn,
              { backgroundColor: theme.navy },
              (!title.trim() || !property.trim()) && { opacity: 0.5 },
            ]}
            onPress={handleSubmit}
            testID="save-permit"
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
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Permit Details</Text>
              <View style={[styles.card, { backgroundColor: theme.surface }]}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabelBold, { color: theme.text }]}>Permit Title *</Text>
                  <TextInput
                    style={[styles.cardInput, { backgroundColor: theme.surfaceSecondary, color: theme.text }]}
                    placeholder="e.g. Building Permit"
                    placeholderTextColor={theme.textTertiary}
                    value={title}
                    onChangeText={setTitle}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Permit Type</Text>
                  <TouchableOpacity
                    style={[styles.cardDropdown, { backgroundColor: theme.surfaceSecondary }]}
                    onPress={() => setShowTypePicker(!showTypePicker)}
                    testID="permit-type-picker"
                  >
                    <Text
                      style={[
                        styles.dropdownText,
                        { color: selectedType ? theme.text : theme.textTertiary },
                      ]}
                    >
                      {selectedType ? selectedType.label : "Select permit type"}
                    </Text>
                    <ChevronDown size={18} color={theme.textSecondary} strokeWidth={1.5} />
                  </TouchableOpacity>
                  {showTypePicker && (
                    <View style={[styles.dropdownList, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                      {permitTypes.map((type) => (
                        <TouchableOpacity
                          key={type.id}
                          style={[
                            styles.dropdownItem,
                            { borderBottomColor: theme.borderLight },
                            permitType === type.id && { backgroundColor: theme.surfaceSecondary },
                          ]}
                          onPress={() => {
                            setPermitType(type.id);
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
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Permit Number</Text>
                  <TextInput
                    style={[styles.cardInput, { backgroundColor: theme.surfaceSecondary, color: theme.text }]}
                    placeholder="e.g. BP-2026-0412"
                    placeholderTextColor={theme.textTertiary}
                    value={permitNumber}
                    onChangeText={setPermitNumber}
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
                  <Text style={[styles.inputLabelBold, { color: theme.text }]}>Jurisdiction *</Text>
                  <TextInput
                    style={[styles.cardInput, { backgroundColor: theme.surfaceSecondary, color: theme.text }]}
                    placeholder="e.g. Springfield"
                    placeholderTextColor={theme.textTertiary}
                    value={jurisdiction}
                    onChangeText={setJurisdiction}
                  />
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>People & Cost</Text>
              <View style={[styles.card, { backgroundColor: theme.surface }]}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Applicant</Text>
                  <TextInput
                    style={[styles.cardInput, { backgroundColor: theme.surfaceSecondary, color: theme.text }]}
                    placeholder="e.g. John Mitchell"
                    placeholderTextColor={theme.textTertiary}
                    value={applicant}
                    onChangeText={setApplicant}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Contractor</Text>
                  <TextInput
                    style={[styles.cardInput, { backgroundColor: theme.surfaceSecondary, color: theme.text }]}
                    placeholder="e.g. Smith & Sons Construction"
                    placeholderTextColor={theme.textTertiary}
                    value={contractor}
                    onChangeText={setContractor}
                  />
                </View>

                <View style={[styles.inputGroup, { marginBottom: 0 }]}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Permit Fee</Text>
                  <TextInput
                    style={[styles.cardInput, { backgroundColor: theme.surfaceSecondary, color: theme.text }]}
                    placeholder="$0.00"
                    placeholderTextColor={theme.textTertiary}
                    value={fee}
                    onChangeText={setFee}
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
                    <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Issued Date</Text>
                    <View style={[styles.dateInput, { backgroundColor: theme.surfaceSecondary }]}>
                      <TextInput
                        style={[styles.dateInputText, { color: theme.text }]}
                        placeholder="MM/DD/YYYY"
                        placeholderTextColor={theme.textTertiary}
                        value={issuedDate}
                        onChangeText={setIssuedDate}
                      />
                      <Calendar size={18} color={theme.textSecondary} strokeWidth={1.5} />
                    </View>
                  </View>
                  <View style={styles.halfInputGroup}>
                    <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Expiry Date</Text>
                    <View style={[styles.dateInput, { backgroundColor: theme.surfaceSecondary }]}>
                      <TextInput
                        style={[styles.dateInputText, { color: theme.text }]}
                        placeholder="MM/DD/YYYY"
                        placeholderTextColor={theme.textTertiary}
                        value={expiryDate}
                        onChangeText={setExpiryDate}
                      />
                      <Clock size={18} color={theme.textSecondary} strokeWidth={1.5} />
                    </View>
                  </View>
                </View>

                <View style={[styles.inputGroup, { marginBottom: 0 }]}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Status</Text>
                  <TouchableOpacity
                    style={[styles.cardDropdown, { backgroundColor: theme.surfaceSecondary }]}
                    onPress={() => setShowStatusPicker(!showStatusPicker)}
                    testID="permit-status-picker"
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
                    placeholder="Add any notes or details about this permit..."
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
