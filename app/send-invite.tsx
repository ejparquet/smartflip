import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { Image } from "expo-image";
import {
  ArrowLeft,
  Search,
  Check,
  X,
  Send,
  Star,
  Briefcase,
  Clock,
  DollarSign,
  ChevronDown,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { useProjects } from "@/contexts/ProjectContext";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";
import { mockProfessionals, professionalTypes } from "@/mocks/professionals";

const roleOptions = [
  "Lead Contractor",
  "Subcontractor",
  "Project Manager",
  "Investment Partner",
  "Co-Investor",
  "Design Consultant",
  "Site Supervisor",
];

export default function SendInviteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useTheme();
  const { projects } = useProjects();

  const [selectedProject, setSelectedProject] = useState<string | null>(
    params.projectId as string || null
  );
  const [selectedProfessionals, setSelectedProfessionals] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");
  const [budget, setBudget] = useState("");
  const [duration, setDuration] = useState("");
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [showRolePicker, setShowRolePicker] = useState(false);

  const dynamicStyles = useMemo(() => ({
    container: { backgroundColor: theme.background },
    card: { backgroundColor: theme.surface },
    title: { color: theme.text },
    subtitle: { color: theme.textSecondary },
    input: { backgroundColor: theme.surfaceSecondary, color: theme.text },
    pickerButton: { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
  }), [theme]);

  const filteredProfessionals = mockProfessionals.filter((pro) =>
    pro.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pro.professionalType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleProfessional = (id: string) => {
    if (selectedProfessionals.includes(id)) {
      setSelectedProfessionals(selectedProfessionals.filter((p) => p !== id));
    } else {
      setSelectedProfessionals([...selectedProfessionals, id]);
    }
  };

  const handleSendInvites = () => {
    if (!selectedProject) {
      Alert.alert("Error", "Please select a project");
      return;
    }
    if (selectedProfessionals.length === 0) {
      Alert.alert("Error", "Please select at least one professional to invite");
      return;
    }
    if (!role) {
      Alert.alert("Error", "Please select a role for the invitation");
      return;
    }

    Alert.alert(
      "Invitations Sent!",
      `Successfully sent ${selectedProfessionals.length} invitation${selectedProfessionals.length > 1 ? "s" : ""} for your project.`,
      [{ text: "OK", onPress: () => router.back() }]
    );
  };

  const selectedProjectData = projects.find((p) => p.id === selectedProject);
  const getCategoryLabel = (type: string) => {
    const pt = professionalTypes.find((t) => t.type === type);
    return pt?.label || type.charAt(0).toUpperCase() + type.slice(1).replace("_", " ");
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Send Invitation",
          headerLeft: () => <BackButton />,
          headerStyle: { backgroundColor: theme.background },
          headerShadowVisible: false,
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Select Project */}
        <View style={[styles.card, dynamicStyles.card]}>
          <Text style={[styles.sectionTitle, dynamicStyles.title]}>Select Project</Text>
          <TouchableOpacity
            style={[styles.pickerButton, dynamicStyles.pickerButton]}
            onPress={() => setShowProjectPicker(true)}
          >
            {selectedProjectData ? (
              <View style={styles.selectedProject}>
                <Image
                  source={{ uri: selectedProjectData.coverImage }}
                  style={styles.projectThumb}
                  contentFit="cover"
                />
                <View style={styles.projectInfo}>
                  <Text style={[styles.projectName, dynamicStyles.title]}>{selectedProjectData.name}</Text>
                  <Text style={[styles.projectAddress, dynamicStyles.subtitle]} numberOfLines={1}>
                    {selectedProjectData.address}
                  </Text>
                </View>
              </View>
            ) : (
              <Text style={[styles.placeholderText, dynamicStyles.subtitle]}>Choose a project...</Text>
            )}
            <ChevronDown size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Select Role */}
        <View style={[styles.card, dynamicStyles.card]}>
          <Text style={[styles.sectionTitle, dynamicStyles.title]}>Invitation Role</Text>
          <TouchableOpacity
            style={[styles.pickerButton, dynamicStyles.pickerButton]}
            onPress={() => setShowRolePicker(true)}
          >
            <Text style={role ? [styles.selectedText, dynamicStyles.title] : [styles.placeholderText, dynamicStyles.subtitle]}>
              {role || "Select role for invitees..."}
            </Text>
            <ChevronDown size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Budget & Duration */}
        <View style={[styles.card, dynamicStyles.card]}>
          <Text style={[styles.sectionTitle, dynamicStyles.title]}>Project Details</Text>
          <View style={styles.rowInputs}>
            <View style={styles.halfInput}>
              <Text style={[styles.inputLabel, dynamicStyles.subtitle]}>Budget</Text>
              <View style={[styles.inputWithIcon, dynamicStyles.input]}>
                <DollarSign size={16} color={theme.textSecondary} />
                <TextInput
                  style={[styles.inputInner, { color: theme.text }]}
                  placeholder="0"
                  placeholderTextColor={theme.textTertiary}
                  value={budget}
                  onChangeText={setBudget}
                  keyboardType="numeric"
                />
              </View>
            </View>
            <View style={styles.halfInput}>
              <Text style={[styles.inputLabel, dynamicStyles.subtitle]}>Duration</Text>
              <View style={[styles.inputWithIcon, dynamicStyles.input]}>
                <Clock size={16} color={theme.textSecondary} />
                <TextInput
                  style={[styles.inputInner, { color: theme.text }]}
                  placeholder="e.g., 3 months"
                  placeholderTextColor={theme.textTertiary}
                  value={duration}
                  onChangeText={setDuration}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Message */}
        <View style={[styles.card, dynamicStyles.card]}>
          <Text style={[styles.sectionTitle, dynamicStyles.title]}>Message (Optional)</Text>
          <TextInput
            style={[styles.messageInput, dynamicStyles.input]}
            placeholder="Add a personal message to your invitation..."
            placeholderTextColor={theme.textTertiary}
            multiline
            numberOfLines={4}
            value={message}
            onChangeText={setMessage}
          />
        </View>

        {/* Select Professionals */}
        <View style={[styles.card, dynamicStyles.card]}>
          <Text style={[styles.sectionTitle, dynamicStyles.title]}>
            Select Professionals ({selectedProfessionals.length} selected)
          </Text>
          <View style={[styles.searchContainer, dynamicStyles.input]}>
            <Search size={18} color={theme.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Search professionals..."
              placeholderTextColor={theme.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {filteredProfessionals.map((professional) => {
            const isSelected = selectedProfessionals.includes(professional.id);
            return (
              <TouchableOpacity
                key={professional.id}
                style={[
                  styles.professionalItem,
                  { borderColor: isSelected ? theme.primary : theme.border },
                  isSelected && { backgroundColor: `${theme.primary}10` },
                ]}
                onPress={() => toggleProfessional(professional.id)}
              >
                <Image
                  source={{ uri: professional.avatar }}
                  style={styles.professionalAvatar}
                  contentFit="cover"
                />
                <View style={styles.professionalInfo}>
                  <Text style={[styles.professionalName, dynamicStyles.title]}>{professional.name}</Text>
                  <Text style={[styles.professionalType, dynamicStyles.subtitle]}>
                    {getCategoryLabel(professional.professionalType)}
                  </Text>
                  <View style={styles.professionalMeta}>
                    <Star size={12} color="#272D53" fill="#272D53" />
                    <Text style={styles.ratingText}>{professional.rating}</Text>
                    <Text style={[styles.experienceText, dynamicStyles.subtitle]}>
                      • {professional.yearsExperience} yrs
                    </Text>
                  </View>
                </View>
                <View style={[
                  styles.checkbox,
                  { borderColor: isSelected ? theme.primary : theme.border },
                  isSelected && { backgroundColor: theme.primary },
                ]}>
                  {isSelected && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Send Button */}
      <SafeAreaView edges={["bottom"]} style={[styles.bottomBar, { backgroundColor: theme.surface }]}>
        <TouchableOpacity
          style={[styles.sendButton, selectedProfessionals.length === 0 && styles.sendButtonDisabled]}
          onPress={handleSendInvites}
          disabled={selectedProfessionals.length === 0}
        >
          <Send size={20} color="#FFFFFF" strokeWidth={2} />
          <Text style={styles.sendButtonText}>
            Send {selectedProfessionals.length > 0 ? `${selectedProfessionals.length} ` : ""}Invitation{selectedProfessionals.length !== 1 ? "s" : ""}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Project Picker Modal */}
      <Modal visible={showProjectPicker} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={[styles.modalContainer, dynamicStyles.container]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.surface }]}>
            <TouchableOpacity onPress={() => setShowProjectPicker(false)}>
              <X size={24} color={theme.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, dynamicStyles.title]}>Select Project</Text>
            <View style={{ width: 24 }} />
          </View>
          <ScrollView style={styles.modalContent}>
            {projects.map((project) => (
              <TouchableOpacity
                key={project.id}
                style={[
                  styles.projectOption,
                  dynamicStyles.card,
                  selectedProject === project.id && { borderColor: theme.primary, borderWidth: 2 },
                ]}
                onPress={() => {
                  setSelectedProject(project.id);
                  setShowProjectPicker(false);
                }}
              >
                <Image source={{ uri: project.coverImage }} style={styles.projectOptionImage} contentFit="cover" />
                <View style={styles.projectOptionInfo}>
                  <Text style={[styles.projectOptionName, dynamicStyles.title]}>{project.name}</Text>
                  <Text style={[styles.projectOptionAddress, dynamicStyles.subtitle]} numberOfLines={1}>
                    {project.address}
                  </Text>
                </View>
                {selectedProject === project.id && (
                  <View style={[styles.checkIcon, { backgroundColor: theme.primary }]}>
                    <Check size={14} color="#FFFFFF" strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Role Picker Modal */}
      <Modal visible={showRolePicker} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={[styles.modalContainer, dynamicStyles.container]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.surface }]}>
            <TouchableOpacity onPress={() => setShowRolePicker(false)}>
              <X size={24} color={theme.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, dynamicStyles.title]}>Select Role</Text>
            <View style={{ width: 24 }} />
          </View>
          <ScrollView style={styles.modalContent}>
            {roleOptions.map((roleOption) => (
              <TouchableOpacity
                key={roleOption}
                style={[
                  styles.roleOption,
                  dynamicStyles.card,
                  role === roleOption && { borderColor: theme.primary, borderWidth: 2 },
                ]}
                onPress={() => {
                  setRole(roleOption);
                  setShowRolePicker(false);
                }}
              >
                <Briefcase size={20} color={role === roleOption ? theme.primary : theme.textSecondary} />
                <Text style={[styles.roleOptionText, dynamicStyles.title]}>{roleOption}</Text>
                {role === roleOption && (
                  <View style={[styles.checkIcon, { backgroundColor: theme.primary }]}>
                    <Check size={14} color="#FFFFFF" strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginBottom: 12,
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
  },
  placeholderText: {
    fontSize: 15,
  },
  selectedText: {
    fontSize: 15,
  },
  selectedProject: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  projectThumb: {
    width: 48,
    height: 48,
    borderRadius: 10,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  projectAddress: {
    fontSize: 13,
    marginTop: 2,
  },
  rowInputs: {
    flexDirection: "row",
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "500" as const,
    marginBottom: 8,
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    gap: 8,
  },
  inputInner: {
    flex: 1,
    fontSize: 15,
  },
  messageInput: {
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: "top",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  professionalItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  professionalAvatar: {
    width: 52,
    height: 52,
    borderRadius: 12,
  },
  professionalInfo: {
    flex: 1,
    marginLeft: 12,
  },
  professionalName: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  professionalType: {
    fontSize: 13,
    marginTop: 2,
  },
  professionalMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#272D53",
  },
  experienceText: {
    fontSize: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  sendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: Colors.navy,
    paddingVertical: 16,
    borderRadius: 14,
  },
  sendButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: Platform.OS === "ios" ? 60 : 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  modalContent: {
    padding: 16,
  },
  projectOption: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  projectOptionImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  projectOptionInfo: {
    flex: 1,
    marginLeft: 14,
  },
  projectOptionName: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  projectOptionAddress: {
    fontSize: 13,
    marginTop: 4,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  roleOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  roleOptionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500" as const,
  },
});
