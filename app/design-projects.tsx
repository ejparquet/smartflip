import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import {
  Search,
  Filter,
  Plus,
  MapPin,
  Calendar,
  DollarSign,
  ChevronRight,
  Home,
  Palette,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Phone,
  Save,
} from "lucide-react-native";
import { Linking, Alert } from "react-native";
import Colors from "@/constants/colors";
import { mockDesignProjects, DesignProject } from "@/mocks/interior-designers";

type ProjectStatus = "all" | "inquiry" | "proposal" | "in_progress" | "revision" | "completed";
type ProjectType = "all" | "full_home" | "room_redesign" | "consultation" | "staging" | "commercial";

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  inquiry: { label: "Inquiry", color: "#6366F1", bgColor: "#EEF2FF" },
  proposal: { label: "Proposal", color: "#272D53", bgColor: "#E8E9EE" },
  in_progress: { label: "In Progress", color: "#3B82F6", bgColor: "#DBEAFE" },
  revision: { label: "Revision", color: "#EC4899", bgColor: "#FCE7F3" },
  completed: { label: "Completed", color: "#10B981", bgColor: "#D1FAE5" },
};

const typeConfig: Record<string, { label: string; icon: any }> = {
  full_home: { label: "Full Home", icon: Home },
  room_redesign: { label: "Room Redesign", icon: Palette },
  consultation: { label: "Consultation", icon: Users },
  staging: { label: "Staging", icon: Home },
  commercial: { label: "Commercial", icon: Home },
};

export default function DesignProjectsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus>("all");
  const [selectedType, setSelectedType] = useState<ProjectType>("all");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<DesignProject | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projects, setProjects] = useState(mockDesignProjects);
  const [newProject, setNewProject] = useState({
    clientName: "",
    projectName: "",
    projectType: "room_redesign" as DesignProject["projectType"],
    address: "",
    budget: "",
    style: "modern" as DesignProject["style"],
  });

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || project.status === selectedStatus;
    const matchesType = selectedType === "all" || project.projectType === selectedType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle size={14} color={statusConfig[status].color} />;
      case "revision":
        return <AlertCircle size={14} color={statusConfig[status].color} />;
      case "in_progress":
        return <Clock size={14} color={statusConfig[status].color} />;
      default:
        return null;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRoomCount = (project: DesignProject) => {
    return project.rooms.length;
  };

  const getCompletedRooms = (project: DesignProject) => {
    return project.rooms.filter((r) => r.status === "completed").length;
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Design Projects",
          headerStyle: { backgroundColor: Colors.background },
          headerShadowVisible: false,
        }}
      />

      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search projects, clients..."
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Filter size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.statusFilters}
        contentContainerStyle={styles.statusFiltersContent}
      >
        {(["all", "inquiry", "proposal", "in_progress", "revision", "completed"] as ProjectStatus[]).map(
          (status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusChip,
                selectedStatus === status && styles.statusChipActive,
              ]}
              onPress={() => setSelectedStatus(status)}
            >
              <Text
                style={[
                  styles.statusChipText,
                  selectedStatus === status && styles.statusChipTextActive,
                ]}
              >
                {status === "all" ? "All" : statusConfig[status]?.label || status}
              </Text>
            </TouchableOpacity>
          )
        )}
      </ScrollView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.projectsHeader}>
          <Text style={styles.projectsCount}>
            {filteredProjects.length} Project{filteredProjects.length !== 1 ? "s" : ""}
          </Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowCreateModal(true)}>
            <Plus size={18} color={Colors.white} />
            <Text style={styles.addButtonText}>New Project</Text>
          </TouchableOpacity>
        </View>

        {filteredProjects.map((project) => (
          <TouchableOpacity
            key={project.id}
            style={styles.projectCard}
            onPress={() => setSelectedProject(project)}
          >
            <View style={styles.projectHeader}>
              <View style={styles.clientInfo}>
                <Image
                  source={{ uri: project.clientAvatar }}
                  style={styles.clientAvatar}
                  contentFit="cover"
                />
                <View style={styles.clientDetails}>
                  <Text style={styles.projectName}>{project.projectName}</Text>
                  <Text style={styles.clientName}>{project.clientName}</Text>
                </View>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusConfig[project.status]?.bgColor },
                ]}
              >
                {getStatusIcon(project.status)}
                <Text
                  style={[
                    styles.statusBadgeText,
                    { color: statusConfig[project.status]?.color },
                  ]}
                >
                  {statusConfig[project.status]?.label}
                </Text>
              </View>
            </View>

            <View style={styles.projectAddress}>
              <MapPin size={14} color={Colors.textSecondary} />
              <Text style={styles.addressText} numberOfLines={1}>
                {project.address}
              </Text>
            </View>

            <View style={styles.projectMeta}>
              <View style={styles.metaItem}>
                <Palette size={14} color={Colors.textSecondary} />
                <Text style={styles.metaText}>
                  {typeConfig[project.projectType]?.label}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Home size={14} color={Colors.textSecondary} />
                <Text style={styles.metaText}>
                  {getCompletedRooms(project)}/{getRoomCount(project)} Rooms
                </Text>
              </View>
              <View style={styles.metaItem}>
                <DollarSign size={14} color={Colors.textSecondary} />
                <Text style={styles.metaText}>{formatCurrency(project.budget)}</Text>
              </View>
            </View>

            {project.startDate && (
              <View style={styles.dateRow}>
                <Calendar size={14} color={Colors.textTertiary} />
                <Text style={styles.dateText}>
                  Started {new Date(project.startDate).toLocaleDateString()}
                  {project.estimatedEndDate &&
                    ` • Est. completion ${new Date(project.estimatedEndDate).toLocaleDateString()}`}
                </Text>
              </View>
            )}

            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${(getCompletedRooms(project) / Math.max(getRoomCount(project), 1)) * 100}%`,
                  },
                ]}
              />
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.viewDetails}>View Details</Text>
              <ChevronRight size={16} color={Colors.primary} />
            </View>
          </TouchableOpacity>
        ))}

        {filteredProjects.length === 0 && (
          <View style={styles.emptyState}>
            <Palette size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Projects Found</Text>
            <Text style={styles.emptyText}>
              {searchQuery
                ? "Try adjusting your search or filters"
                : "Start by creating your first design project"}
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal
        visible={!!selectedProject}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedProject(null)}
      >
        {selectedProject && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setSelectedProject(null)}
              >
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Project Details</Text>
              <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.modalClientSection}>
                <Image
                  source={{ uri: selectedProject.clientAvatar }}
                  style={styles.modalClientAvatar}
                  contentFit="cover"
                />
                <View style={styles.modalClientInfo}>
                  <Text style={styles.modalProjectName}>
                    {selectedProject.projectName}
                  </Text>
                  <Text style={styles.modalClientName}>
                    {selectedProject.clientName}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusConfig[selectedProject.status]?.bgColor },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        { color: statusConfig[selectedProject.status]?.color },
                      ]}
                    >
                      {statusConfig[selectedProject.status]?.label}
                    </Text>
                  </View>
                </View>
              </View>

              {selectedProject.clientPhone && (
                <TouchableOpacity 
                  style={styles.contactButton}
                  onPress={() => Linking.openURL(`tel:${selectedProject.clientPhone}`)}
                >
                  <Phone size={18} color={Colors.white} />
                  <Text style={styles.contactButtonText}>
                    Call {selectedProject.clientPhone}
                  </Text>
                </TouchableOpacity>
              )}

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Project Information</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Type</Text>
                  <Text style={styles.detailValue}>
                    {typeConfig[selectedProject.projectType]?.label}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Style</Text>
                  <Text style={styles.detailValue}>
                    {selectedProject.style.charAt(0).toUpperCase() +
                      selectedProject.style.slice(1).replace("_", " ")}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Budget</Text>
                  <Text style={styles.detailValue}>
                    {formatCurrency(selectedProject.budget)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Address</Text>
                  <Text style={styles.detailValue}>{selectedProject.address}</Text>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>
                  Rooms ({selectedProject.rooms.length})
                </Text>
                {selectedProject.rooms.map((room) => (
                  <View key={room.id} style={styles.roomCard}>
                    <View style={styles.roomHeader}>
                      <Text style={styles.roomName}>{room.name}</Text>
                      <View
                        style={[
                          styles.roomStatus,
                          {
                            backgroundColor:
                              room.status === "completed"
                                ? "#D1FAE5"
                                : room.status === "installation"
                                ? "#DBEAFE"
                                : "#E8E9EE",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.roomStatusText,
                            {
                              color:
                                room.status === "completed"
                                  ? "#10B981"
                                  : room.status === "installation"
                                  ? "#3B82F6"
                                  : "#272D53",
                            },
                          ]}
                        >
                          {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                        </Text>
                      </View>
                    </View>
                    {room.dimensions && (
                      <Text style={styles.roomDimensions}>
                        {room.dimensions.width}' × {room.dimensions.length}' ×{" "}
                        {room.dimensions.height}'
                      </Text>
                    )}
                    <Text style={styles.itemCount}>{room.items.length} items</Text>
                  </View>
                ))}
              </View>

              {selectedProject.images.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Project Images</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {selectedProject.images.map((image) => (
                      <View key={image.id} style={styles.imageContainer}>
                        <Image
                          source={{ uri: image.url }}
                          style={styles.projectImage}
                          contentFit="cover"
                        />
                        <View style={styles.imageTypeBadge}>
                          <Text style={styles.imageTypeText}>
                            {image.type.replace("_", " ")}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>

      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowCreateModal(false)}
            >
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Project</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Client Name</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter client name"
                placeholderTextColor={Colors.textTertiary}
                value={newProject.clientName}
                onChangeText={(text) => setNewProject({ ...newProject, clientName: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Project Name</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g., Living Room Redesign"
                placeholderTextColor={Colors.textTertiary}
                value={newProject.projectName}
                onChangeText={(text) => setNewProject({ ...newProject, projectName: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Project Type</Text>
              <View style={styles.typeOptionsGrid}>
                {(["full_home", "room_redesign", "consultation", "staging", "commercial"] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeOptionBtn,
                      newProject.projectType === type && styles.typeOptionBtnActive,
                    ]}
                    onPress={() => setNewProject({ ...newProject, projectType: type })}
                  >
                    <Text
                      style={[
                        styles.typeOptionBtnText,
                        newProject.projectType === type && styles.typeOptionBtnTextActive,
                      ]}
                    >
                      {typeConfig[type]?.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Address</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Project address"
                placeholderTextColor={Colors.textTertiary}
                value={newProject.address}
                onChangeText={(text) => setNewProject({ ...newProject, address: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Budget</Text>
              <TextInput
                style={styles.formInput}
                placeholder="$0"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="numeric"
                value={newProject.budget}
                onChangeText={(text) => setNewProject({ ...newProject, budget: text })}
              />
            </View>
          </ScrollView>

          <View style={styles.createFormFooter}>
            <TouchableOpacity
              style={styles.cancelCreateBtn}
              onPress={() => setShowCreateModal(false)}
            >
              <Text style={styles.cancelCreateBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveCreateBtn}
              onPress={() => {
                if (!newProject.clientName || !newProject.projectName) {
                  Alert.alert("Error", "Please fill in client name and project name");
                  return;
                }
                const project: DesignProject = {
                  id: `dp-${Date.now()}`,
                  clientName: newProject.clientName,
                  clientAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
                  projectName: newProject.projectName,
                  projectType: newProject.projectType,
                  address: newProject.address || "TBD",
                  status: "inquiry",
                  budget: parseInt(newProject.budget) || 0,
                  style: newProject.style,
                  rooms: [],
                  images: [],
                  createdAt: new Date().toISOString(),
                };
                setProjects([project, ...projects]);
                setShowCreateModal(false);
                setNewProject({
                  clientName: "",
                  projectName: "",
                  projectType: "room_redesign",
                  address: "",
                  budget: "",
                  style: "modern",
                });
                Alert.alert("Success", "Project created successfully!");
              }}
            >
              <Save size={18} color={Colors.white} />
              <Text style={styles.saveCreateBtnText}>Create Project</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showFilterModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowFilterModal(false)}
            >
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Filter Projects</Text>
            <TouchableOpacity
              onPress={() => {
                setSelectedStatus("all");
                setSelectedType("all");
              }}
            >
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterContent}>
            <Text style={styles.filterSectionTitle}>Project Type</Text>
            {(["all", "full_home", "room_redesign", "consultation", "staging", "commercial"] as ProjectType[]).map(
              (type) => (
                <TouchableOpacity
                  key={type}
                  style={styles.filterOption}
                  onPress={() => setSelectedType(type)}
                >
                  <Text style={styles.filterOptionText}>
                    {type === "all" ? "All Types" : typeConfig[type]?.label}
                  </Text>
                  <View
                    style={[
                      styles.radioButton,
                      selectedType === type && styles.radioButtonActive,
                    ]}
                  >
                    {selectedType === type && <View style={styles.radioButtonInner} />}
                  </View>
                </TouchableOpacity>
              )
            )}
          </ScrollView>

          <View style={styles.filterFooter}>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statusFilters: {
    maxHeight: 44,
    marginBottom: 8,
  },
  statusFiltersContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  statusChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    marginRight: 8,
  },
  statusChipActive: {
    backgroundColor: "#EC4899",
  },
  statusChipText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.textSecondary,
  },
  statusChipTextActive: {
    color: Colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  projectsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  projectsCount: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EC4899",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  projectCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  projectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  clientInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  clientAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  clientDetails: {
    marginLeft: 12,
    flex: 1,
  },
  projectName: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  clientName: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  projectAddress: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  addressText: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  projectMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  dateText: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.borderLight,
    borderRadius: 2,
    marginBottom: 12,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#EC4899",
    borderRadius: 2,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  viewDetails: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.text,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  modalClose: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  clearText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500" as const,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalClientSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  modalClientAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  modalClientInfo: {
    marginLeft: 16,
    flex: 1,
  },
  modalProjectName: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  modalClientName: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: 8,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EC4899",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginBottom: 24,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  detailSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.text,
    flex: 1,
    textAlign: "right" as const,
  },
  roomCard: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  roomHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  roomName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  roomStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roomStatusText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  roomDimensions: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  itemCount: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  imageContainer: {
    marginRight: 12,
    position: "relative",
  },
  projectImage: {
    width: 160,
    height: 120,
    borderRadius: 12,
  },
  imageTypeBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  imageTypeText: {
    fontSize: 11,
    color: Colors.white,
    fontWeight: "500" as const,
    textTransform: "capitalize",
  },
  filterContent: {
    flex: 1,
    padding: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 16,
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  filterOptionText: {
    fontSize: 16,
    color: Colors.text,
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonActive: {
    borderColor: "#EC4899",
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#EC4899",
  },
  filterFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  applyButton: {
    backgroundColor: "#EC4899",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  typeOptionsGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 8,
  },
  typeOptionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  typeOptionBtnActive: {
    backgroundColor: "#FCE7F3",
    borderColor: "#EC4899",
  },
  typeOptionBtnText: {
    fontSize: 14,
    color: Colors.text,
  },
  typeOptionBtnTextActive: {
    color: "#EC4899",
    fontWeight: "600" as const,
  },
  createFormFooter: {
    flexDirection: "row" as const,
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  cancelCreateBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center" as const,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelCreateBtnText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  saveCreateBtn: {
    flex: 1,
    flexDirection: "row" as const,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: "#EC4899",
    gap: 8,
  },
  saveCreateBtnText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.white,
  },
});
