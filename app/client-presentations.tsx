import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
} from "react-native";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import {
  Search,
  Plus,
  Presentation as PresentationIcon,
  Calendar,
  Play,
  Eye,
  Share2,
  MoreVertical,
  X,
  FileText,
  Layers,
  DollarSign,
  CheckCircle,
  Send,
  Edit3,
  Trash2,
  Copy,
  Star,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";

interface PresentationData {
  id: string;
  title: string;
  clientName: string;
  clientAvatar: string;
  projectName: string;
  status: "draft" | "ready" | "presented" | "approved";
  slides: number;
  lastEdited: string;
  presentedDate?: string;
  coverImage: string;
  budget?: number;
  feedback?: string;
}

const mockPresentations: PresentationData[] = [
  {
    id: "p-1",
    title: "Westlake Modern Living Room Concept",
    clientName: "Sarah Mitchell",
    clientAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    projectName: "Westlake Modern Refresh",
    status: "approved",
    slides: 24,
    lastEdited: "2026-01-20",
    presentedDate: "2026-01-22",
    coverImage: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800",
    budget: 85000,
    feedback: "Love the direction! Let's proceed with Option B.",
  },
  {
    id: "p-2",
    title: "Downtown Condo Staging Proposal",
    clientName: "Michael Chen",
    clientAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    projectName: "Downtown Condo Staging",
    status: "ready",
    slides: 18,
    lastEdited: "2026-01-25",
    coverImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
    budget: 15000,
  },
  {
    id: "p-3",
    title: "Lakeway Kitchen Design Options",
    clientName: "Emily Rodriguez",
    clientAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
    projectName: "Lakeway Kitchen & Bath",
    status: "presented",
    slides: 32,
    lastEdited: "2026-01-18",
    presentedDate: "2026-01-19",
    coverImage: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",
    budget: 45000,
  },
  {
    id: "p-4",
    title: "Mueller Home Office Concept",
    clientName: "David Kim",
    clientAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
    projectName: "Mueller Home Redesign",
    status: "draft",
    slides: 8,
    lastEdited: "2026-01-26",
    coverImage: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=800",
    budget: 12000,
  },
];

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  draft: { label: "Draft", color: "#6B7280", bgColor: "#F3F4F6" },
  ready: { label: "Ready", color: "#2563EB", bgColor: "#DBEAFE" },
  presented: { label: "Presented", color: "#D97706", bgColor: "#E8E9EE" },
  approved: { label: "Approved", color: "#059669", bgColor: "#D1FAE5" },
};

type FilterStatus = "all" | "draft" | "ready" | "presented" | "approved";

export default function ClientPresentationsScreen() {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<FilterStatus>("all");
  const [selectedPresentation, setSelectedPresentation] = useState<PresentationData | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);

  const filteredPresentations = mockPresentations.filter((presentation) => {
    const matchesSearch = presentation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      presentation.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === "all" || presentation.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: "Client Presentations",
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerShadowVisible: false,
        }}
      />

      <View style={styles.header}>
        <View style={[styles.searchContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Search size={20} color={theme.textTertiary} strokeWidth={1.5} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search presentations..."
            placeholderTextColor={theme.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.addButton}>
          <Plus size={20} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScrollView}
        contentContainerStyle={styles.filterContainer}
      >
        {(["all", "draft", "ready", "presented", "approved"] as FilterStatus[]).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterChip,
              { backgroundColor: selectedFilter === filter ? theme.navy : theme.surface, borderColor: selectedFilter === filter ? theme.navy : theme.border },
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text
              style={[
                styles.filterChipText,
                { color: selectedFilter === filter ? "#FFFFFF" : theme.textSecondary },
              ]}
            >
              {filter === "all" ? "All" : statusConfig[filter].label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.statValue, { color: "#EC4899" }]}>{mockPresentations.length}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.statValue, { color: "#10B981" }]}>
              {mockPresentations.filter(p => p.status === "approved").length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Approved</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.statValue, { color: "#272D53" }]}>
              {mockPresentations.filter(p => p.status === "presented").length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Pending</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          {filteredPresentations.length} Presentation{filteredPresentations.length !== 1 ? "s" : ""}
        </Text>

        {filteredPresentations.map((presentation) => (
          <TouchableOpacity
            key={presentation.id}
            style={[styles.presentationCard, { backgroundColor: theme.surface }]}
            onPress={() => setSelectedPresentation(presentation)}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: presentation.coverImage }}
              style={styles.coverImage}
              contentFit="cover"
            />
            <View style={styles.cardOverlay} />
            
            <View style={styles.cardHeader}>
              <View style={[styles.statusBadge, { backgroundColor: statusConfig[presentation.status].bgColor }]}>
                <Text style={[styles.statusText, { color: statusConfig[presentation.status].color }]}>
                  {statusConfig[presentation.status].label}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.moreButton}
                onPress={() => {
                  setSelectedPresentation(presentation);
                  setShowActionModal(true);
                }}
              >
                <MoreVertical size={20} color="#FFFFFF" strokeWidth={1.5} />
              </TouchableOpacity>
            </View>

            <View style={styles.cardContent}>
              <View style={styles.clientRow}>
                <Image
                  source={{ uri: presentation.clientAvatar }}
                  style={styles.clientAvatar}
                  contentFit="cover"
                />
                <Text style={styles.clientName}>{presentation.clientName}</Text>
              </View>
              
              <Text style={styles.presentationTitle} numberOfLines={2}>
                {presentation.title}
              </Text>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Layers size={14} color="rgba(255,255,255,0.8)" strokeWidth={1.5} />
                  <Text style={styles.metaText}>{presentation.slides} slides</Text>
                </View>
                <View style={styles.metaItem}>
                  <Calendar size={14} color="rgba(255,255,255,0.8)" strokeWidth={1.5} />
                  <Text style={styles.metaText}>{formatDate(presentation.lastEdited)}</Text>
                </View>
                {presentation.budget && (
                  <View style={styles.metaItem}>
                    <DollarSign size={14} color="rgba(255,255,255,0.8)" strokeWidth={1.5} />
                    <Text style={styles.metaText}>{formatCurrency(presentation.budget)}</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Eye size={18} color="#FFFFFF" strokeWidth={1.5} />
                <Text style={styles.actionText}>Preview</Text>
              </TouchableOpacity>
              {presentation.status === "ready" && (
                <TouchableOpacity style={[styles.actionButton, styles.presentButton]}>
                  <Play size={18} color="#FFFFFF" strokeWidth={1.5} />
                  <Text style={styles.actionText}>Present</Text>
                </TouchableOpacity>
              )}
              {presentation.status === "draft" && (
                <TouchableOpacity style={[styles.actionButton, styles.editButton]}>
                  <Edit3 size={18} color="#FFFFFF" strokeWidth={1.5} />
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
              )}
              {(presentation.status === "presented" || presentation.status === "approved") && (
                <TouchableOpacity style={[styles.actionButton, styles.shareButton]}>
                  <Share2 size={18} color="#FFFFFF" strokeWidth={1.5} />
                  <Text style={styles.actionText}>Share</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        ))}

        {filteredPresentations.length === 0 && (
          <View style={styles.emptyState}>
            <PresentationIcon size={48} color={theme.textTertiary} strokeWidth={1.5} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No Presentations Found</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              {searchQuery ? "Try a different search" : "Create your first presentation"}
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Presentation Detail Modal */}
      <Modal
        visible={!!selectedPresentation && !showActionModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedPresentation(null)}
      >
        {selectedPresentation && (
          <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <TouchableOpacity onPress={() => setSelectedPresentation(null)}>
                <X size={24} color={theme.text} strokeWidth={1.5} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Presentation Details</Text>
              <TouchableOpacity onPress={() => setShowActionModal(true)}>
                <MoreVertical size={24} color={theme.text} strokeWidth={1.5} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <Image
                source={{ uri: selectedPresentation.coverImage }}
                style={styles.modalCoverImage}
                contentFit="cover"
              />

              <View style={styles.modalInfo}>
                <View style={[styles.statusBadgeLarge, { backgroundColor: statusConfig[selectedPresentation.status].bgColor }]}>
                  {selectedPresentation.status === "approved" && <CheckCircle size={16} color={statusConfig[selectedPresentation.status].color} strokeWidth={2} />}
                  <Text style={[styles.statusTextLarge, { color: statusConfig[selectedPresentation.status].color }]}>
                    {statusConfig[selectedPresentation.status].label}
                  </Text>
                </View>

                <Text style={[styles.modalPresentationTitle, { color: theme.text }]}>
                  {selectedPresentation.title}
                </Text>

                <View style={[styles.clientCard, { backgroundColor: theme.surfaceSecondary }]}>
                  <Image
                    source={{ uri: selectedPresentation.clientAvatar }}
                    style={styles.modalClientAvatar}
                    contentFit="cover"
                  />
                  <View style={styles.clientInfo}>
                    <Text style={[styles.modalClientName, { color: theme.text }]}>
                      {selectedPresentation.clientName}
                    </Text>
                    <Text style={[styles.modalProjectName, { color: theme.textSecondary }]}>
                      {selectedPresentation.projectName}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailsGrid}>
                  <View style={[styles.detailCard, { backgroundColor: theme.surface }]}>
                    <Layers size={20} color="#EC4899" strokeWidth={1.5} />
                    <Text style={[styles.detailValue, { color: theme.text }]}>{selectedPresentation.slides}</Text>
                    <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Slides</Text>
                  </View>
                  <View style={[styles.detailCard, { backgroundColor: theme.surface }]}>
                    <Calendar size={20} color="#3B82F6" strokeWidth={1.5} />
                    <Text style={[styles.detailValue, { color: theme.text }]}>
                      {formatDate(selectedPresentation.lastEdited).split(",")[0]}
                    </Text>
                    <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Last Edited</Text>
                  </View>
                  {selectedPresentation.budget && (
                    <View style={[styles.detailCard, { backgroundColor: theme.surface }]}>
                      <DollarSign size={20} color="#10B981" strokeWidth={1.5} />
                      <Text style={[styles.detailValue, { color: theme.text }]}>
                        {formatCurrency(selectedPresentation.budget)}
                      </Text>
                      <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Budget</Text>
                    </View>
                  )}
                  {selectedPresentation.presentedDate && (
                    <View style={[styles.detailCard, { backgroundColor: theme.surface }]}>
                      <PresentationIcon size={20} color="#272D53" strokeWidth={1.5} />
                      <Text style={[styles.detailValue, { color: theme.text }]}>
                        {formatDate(selectedPresentation.presentedDate).split(",")[0]}
                      </Text>
                      <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Presented</Text>
                    </View>
                  )}
                </View>

                {selectedPresentation.feedback && (
                  <View style={[styles.feedbackCard, { backgroundColor: "#D1FAE5" }]}>
                    <View style={styles.feedbackHeader}>
                      <Star size={16} color="#059669" fill="#059669" strokeWidth={1.5} />
                      <Text style={styles.feedbackTitle}>Client Feedback</Text>
                    </View>
                    <Text style={styles.feedbackText}>&quot;{selectedPresentation.feedback}&quot;</Text>
                  </View>
                )}

                <View style={styles.modalActions}>
                  <TouchableOpacity style={[styles.modalActionButton, { backgroundColor: theme.surface }]}>
                    <Eye size={20} color="#EC4899" strokeWidth={1.5} />
                    <Text style={[styles.modalActionText, { color: theme.text }]}>Preview</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalActionButton, { backgroundColor: theme.surface }]}>
                    <Edit3 size={20} color="#3B82F6" strokeWidth={1.5} />
                    <Text style={[styles.modalActionText, { color: theme.text }]}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalActionButton, { backgroundColor: theme.surface }]}>
                    <Share2 size={20} color="#10B981" strokeWidth={1.5} />
                    <Text style={[styles.modalActionText, { color: theme.text }]}>Share</Text>
                  </TouchableOpacity>
                </View>

                {selectedPresentation.status === "ready" && (
                  <TouchableOpacity style={styles.presentNowButton}>
                    <Play size={20} color="#FFFFFF" strokeWidth={2} />
                    <Text style={styles.presentNowText}>Start Presentation</Text>
                  </TouchableOpacity>
                )}

                {selectedPresentation.status === "presented" && (
                  <TouchableOpacity style={styles.sendButton}>
                    <Send size={20} color="#FFFFFF" strokeWidth={2} />
                    <Text style={styles.sendButtonText}>Send to Client</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>

      {/* Action Modal */}
      <Modal
        visible={showActionModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowActionModal(false)}
      >
        <TouchableOpacity 
          style={styles.actionModalOverlay}
          activeOpacity={1}
          onPress={() => setShowActionModal(false)}
        >
          <View style={[styles.actionModalContent, { backgroundColor: theme.surface }]}>
            <TouchableOpacity style={styles.actionModalItem}>
              <Edit3 size={20} color={theme.text} strokeWidth={1.5} />
              <Text style={[styles.actionModalText, { color: theme.text }]}>Edit Presentation</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionModalItem}>
              <Copy size={20} color={theme.text} strokeWidth={1.5} />
              <Text style={[styles.actionModalText, { color: theme.text }]}>Duplicate</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionModalItem}>
              <Share2 size={20} color={theme.text} strokeWidth={1.5} />
              <Text style={[styles.actionModalText, { color: theme.text }]}>Share Link</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionModalItem}>
              <FileText size={20} color={theme.text} strokeWidth={1.5} />
              <Text style={[styles.actionModalText, { color: theme.text }]}>Export PDF</Text>
            </TouchableOpacity>
            <View style={[styles.actionModalDivider, { backgroundColor: theme.border }]} />
            <TouchableOpacity style={styles.actionModalItem}>
              <Trash2 size={20} color="#EF4444" strokeWidth={1.5} />
              <Text style={[styles.actionModalText, { color: "#EF4444" }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#EC4899",
    justifyContent: "center",
    alignItems: "center",
  },
  filterScrollView: {
    maxHeight: 44,
    marginBottom: 8,
  },
  filterContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#6B7280",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
    marginTop: 8,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800" as const,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500" as const,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginBottom: 14,
  },
  presentationCard: {
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 16,
    height: 260,
  },
  coverImage: {
    ...StyleSheet.absoluteFillObject,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 14,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  moreButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    flex: 1,
    padding: 14,
    justifyContent: "flex-end",
  },
  clientRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  clientAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  clientName: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "rgba(255,255,255,0.9)",
    marginLeft: 8,
  },
  presentationTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    marginBottom: 10,
    lineHeight: 24,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  cardActions: {
    flexDirection: "row",
    padding: 14,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.15)",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  presentButton: {
    backgroundColor: "#EC4899",
  },
  editButton: {
    backgroundColor: "#3B82F6",
  },
  shareButton: {
    backgroundColor: "#10B981",
  },
  actionText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
  modalContent: {
    flex: 1,
  },
  modalCoverImage: {
    width: "100%",
    height: 200,
  },
  modalInfo: {
    padding: 20,
  },
  statusBadgeLarge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  statusTextLarge: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  modalPresentationTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    marginBottom: 16,
    lineHeight: 28,
  },
  clientCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    marginBottom: 20,
  },
  modalClientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  clientInfo: {
    marginLeft: 12,
    flex: 1,
  },
  modalClientName: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  modalProjectName: {
    fontSize: 13,
    marginTop: 2,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  detailCard: {
    width: "47%",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  detailValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    marginTop: 10,
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
  },
  feedbackCard: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 20,
  },
  feedbackHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  feedbackTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#059669",
  },
  feedbackText: {
    fontSize: 14,
    color: "#065F46",
    fontStyle: "italic",
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  modalActionButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
  },
  modalActionText: {
    fontSize: 13,
    fontWeight: "500" as const,
  },
  presentNowButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#EC4899",
    paddingVertical: 16,
    borderRadius: 14,
  },
  presentNowText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  sendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#3B82F6",
    paddingVertical: 16,
    borderRadius: 14,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  actionModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  actionModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  actionModalItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 16,
  },
  actionModalText: {
    fontSize: 16,
    fontWeight: "500" as const,
  },
  actionModalDivider: {
    height: 1,
    marginVertical: 8,
  },
});
