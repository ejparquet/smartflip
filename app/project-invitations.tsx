import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Modal,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Image } from "expo-image";
import {
  MapPin,
  DollarSign,
  Clock,
  Phone,
  X,
  Check,
  ChevronRight,
  UserPlus,
  Calendar,
  Home,
  Hammer,
  Building,
  HardHat,
  MessageCircle,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { mockProjectInvitations } from "@/mocks/invitations";
import { ProjectInvitation, ProjectInvitationType } from "@/types";

const getProjectTypeIcon = (type: ProjectInvitationType) => {
  switch (type) {
    case "flip":
      return Home;
    case "remodel":
      return Hammer;
    case "renovation":
      return Building;
    case "new_construction":
      return HardHat;
    default:
      return Home;
  }
};

const getProjectTypeColor = (type: ProjectInvitationType) => {
  switch (type) {
    case "flip":
      return "#10B981";
    case "remodel":
      return "#6366F1";
    case "renovation":
      return "#272D53";
    case "new_construction":
      return "#EC4899";
    default:
      return Colors.primary;
  }
};

const formatCurrency = (amount: number | undefined) => {
  if (!amount) return "TBD";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function ProjectInvitationsScreen() {
  const router = useRouter();
  const [invitations, setInvitations] = useState<ProjectInvitation[]>(mockProjectInvitations);
  const [selectedInvitation, setSelectedInvitation] = useState<ProjectInvitation | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "accepted" | "declined">("all");

  const filteredInvitations = invitations.filter((inv) => {
    if (filter === "all") return true;
    return inv.status === filter;
  });

  const pendingCount = invitations.filter((inv) => inv.status === "pending").length;

  const handleAccept = (invitationId: string) => {
    Alert.alert(
      "Accept Invitation",
      "Are you sure you want to accept this project invitation?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Accept",
          onPress: () => {
            setInvitations((prev) =>
              prev.map((inv) =>
                inv.id === invitationId ? { ...inv, status: "accepted" as const } : inv
              )
            );
            setShowDetailModal(false);
            Alert.alert("Success", "You have accepted the project invitation!");
          },
        },
      ]
    );
  };

  const handleDecline = (invitationId: string) => {
    Alert.alert(
      "Decline Invitation",
      "Are you sure you want to decline this project invitation?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Decline",
          style: "destructive",
          onPress: () => {
            setInvitations((prev) =>
              prev.map((inv) =>
                inv.id === invitationId ? { ...inv, status: "declined" as const } : inv
              )
            );
            setShowDetailModal(false);
          },
        },
      ]
    );
  };

  const handleCall = (phone: string | undefined) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`);
  };

  const handleMessage = (invitation: ProjectInvitation) => {
    Alert.alert("Message", `Starting conversation with ${invitation.inviterName}`);
  };

  const openDetailModal = (invitation: ProjectInvitation) => {
    setSelectedInvitation(invitation);
    setShowDetailModal(true);
  };

  const renderInvitationCard = (invitation: ProjectInvitation) => {
    const TypeIcon = getProjectTypeIcon(invitation.projectType);
    const typeColor = getProjectTypeColor(invitation.projectType);
    const isPending = invitation.status === "pending";

    return (
      <TouchableOpacity
        key={invitation.id}
        style={styles.invitationCard}
        onPress={() => openDetailModal(invitation)}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: invitation.projectImage }}
          style={styles.cardImage}
          contentFit="cover"
        />
        
        <View style={[styles.statusBadge, { 
          backgroundColor: invitation.status === "accepted" ? Colors.success : 
                          invitation.status === "declined" ? Colors.error : 
                          Colors.primary 
        }]}>
          <Text style={styles.statusText}>
            {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
          </Text>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.projectInfo}>
              <Text style={styles.projectName} numberOfLines={1}>{invitation.projectName}</Text>
              <View style={[styles.typeBadge, { backgroundColor: `${typeColor}20` }]}>
                <TypeIcon size={12} color={typeColor} />
                <Text style={[styles.typeText, { color: typeColor }]}>
                  {invitation.projectType.charAt(0).toUpperCase() + invitation.projectType.slice(1).replace("_", " ")}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.addressRow}>
            <MapPin size={14} color={Colors.textSecondary} />
            <Text style={styles.addressText} numberOfLines={1}>{invitation.projectAddress}</Text>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <DollarSign size={14} color={Colors.textSecondary} />
              <Text style={styles.metaText}>{formatCurrency(invitation.budget)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Clock size={14} color={Colors.textSecondary} />
              <Text style={styles.metaText}>{invitation.estimatedDuration || "TBD"}</Text>
            </View>
          </View>

          <View style={styles.inviterRow}>
            <View style={styles.inviterInfo}>
              <Image
                source={{ uri: invitation.inviterAvatar }}
                style={styles.inviterAvatar}
                contentFit="cover"
              />
              <View>
                <Text style={styles.inviterName}>{invitation.inviterName}</Text>
                <Text style={styles.roleText}>{invitation.role}</Text>
              </View>
            </View>
            <ChevronRight size={20} color={Colors.textTertiary} />
          </View>

          {isPending && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.declineButton}
                onPress={() => handleDecline(invitation.id)}
              >
                <X size={16} color={Colors.error} />
                <Text style={styles.declineText}>Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => handleAccept(invitation.id)}
              >
                <Check size={16} color={Colors.white} />
                <Text style={styles.acceptText}>Accept</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Project Invitations",
          headerStyle: { backgroundColor: Colors.background },
          headerShadowVisible: false,
          headerTitleStyle: { color: Colors.text, fontWeight: "700" },
        }}
      />

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {[
            { key: "all", label: "All" },
            { key: "pending", label: `Pending (${pendingCount})` },
            { key: "accepted", label: "Accepted" },
            { key: "declined", label: "Declined" },
          ].map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[styles.filterChip, filter === item.key && styles.filterChipActive]}
              onPress={() => setFilter(item.key as typeof filter)}
            >
              <Text style={[styles.filterChipText, filter === item.key && styles.filterChipTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {filteredInvitations.length > 0 ? (
          filteredInvitations.map(renderInvitationCard)
        ) : (
          <View style={styles.emptyState}>
            <UserPlus size={64} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Invitations</Text>
            <Text style={styles.emptyText}>
              {filter === "all"
                ? "You haven't received any project invitations yet"
                : `No ${filter} invitations`}
            </Text>
          </View>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>

      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetailModal(false)}
      >
        {selectedInvitation && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Invitation Details</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowDetailModal(false)}
              >
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
              <Image
                source={{ uri: selectedInvitation.projectImage }}
                style={styles.modalImage}
                contentFit="cover"
              />

              <View style={styles.modalBody}>
                <View style={styles.modalProjectHeader}>
                  <Text style={styles.modalProjectName}>{selectedInvitation.projectName}</Text>
                  <View style={[styles.typeBadgeLarge, { backgroundColor: `${getProjectTypeColor(selectedInvitation.projectType)}20` }]}>
                    {React.createElement(getProjectTypeIcon(selectedInvitation.projectType), {
                      size: 16,
                      color: getProjectTypeColor(selectedInvitation.projectType),
                    })}
                    <Text style={[styles.typeTextLarge, { color: getProjectTypeColor(selectedInvitation.projectType) }]}>
                      {selectedInvitation.projectType.charAt(0).toUpperCase() + selectedInvitation.projectType.slice(1).replace("_", " ")}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <MapPin size={18} color={Colors.textSecondary} />
                  <Text style={styles.detailText}>{selectedInvitation.projectAddress}</Text>
                </View>

                <View style={styles.detailsGrid}>
                  <View style={styles.detailCard}>
                    <DollarSign size={20} color={Colors.primary} />
                    <Text style={styles.detailCardLabel}>Budget</Text>
                    <Text style={styles.detailCardValue}>{formatCurrency(selectedInvitation.budget)}</Text>
                  </View>
                  <View style={styles.detailCard}>
                    <Clock size={20} color={Colors.warning} />
                    <Text style={styles.detailCardLabel}>Duration</Text>
                    <Text style={styles.detailCardValue}>{selectedInvitation.estimatedDuration || "TBD"}</Text>
                  </View>
                </View>

                <View style={styles.sectionDivider} />

                <Text style={styles.sectionTitle}>Your Role</Text>
                <View style={styles.roleCard}>
                  <Text style={styles.roleName}>{selectedInvitation.role}</Text>
                </View>

                <Text style={styles.sectionTitle}>Project Description</Text>
                <Text style={styles.descriptionText}>{selectedInvitation.description}</Text>

                <View style={styles.sectionDivider} />

                <Text style={styles.sectionTitle}>Invited By</Text>
                <View style={styles.inviterCard}>
                  <View style={styles.inviterTopRow}>
                    <Image
                      source={{ uri: selectedInvitation.inviterAvatar }}
                      style={styles.inviterAvatarLarge}
                      contentFit="cover"
                    />
                    <View style={styles.inviterDetails}>
                      <Text style={styles.inviterNameLarge}>{selectedInvitation.inviterName}</Text>
                      <Text style={styles.inviterDate}>Invited on {formatDate(selectedInvitation.createdAt)}</Text>
                      {selectedInvitation.expiresAt && (
                        <Text style={styles.expiresText}>
                          Expires: {formatDate(selectedInvitation.expiresAt)}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.contactButtonsRow}>
                    <TouchableOpacity
                      style={styles.contactButtonWide}
                      onPress={() => handleCall(selectedInvitation.inviterPhone)}
                    >
                      <Phone size={18} color={Colors.primary} />
                      <Text style={styles.contactButtonText}>Call</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.contactButtonWide}
                      onPress={() => handleMessage(selectedInvitation)}
                    >
                      <MessageCircle size={18} color={Colors.primary} />
                      <Text style={styles.contactButtonText}>Message</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {selectedInvitation.status === "pending" && (
                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={styles.modalDeclineButton}
                      onPress={() => handleDecline(selectedInvitation.id)}
                    >
                      <X size={20} color={Colors.error} />
                      <Text style={styles.modalDeclineText}>Decline</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.modalAcceptButton}
                      onPress={() => handleAccept(selectedInvitation.id)}
                    >
                      <Check size={20} color={Colors.white} />
                      <Text style={styles.modalAcceptText}>Accept Invitation</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {selectedInvitation.status === "accepted" && (
                  <View style={styles.acceptedBanner}>
                    <Check size={24} color={Colors.success} />
                    <Text style={styles.acceptedText}>You've accepted this invitation</Text>
                  </View>
                )}

                {selectedInvitation.status === "declined" && (
                  <View style={styles.declinedBanner}>
                    <X size={24} color={Colors.error} />
                    <Text style={styles.declinedText}>You've declined this invitation</Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  filterContainer: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  filterScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  filterChipActive: {
    backgroundColor: Colors.navy,
    borderColor: Colors.navy,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#6B7280",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  modalScrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  invitationCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden" as const,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardImage: {
    width: "100%",
    height: 140,
  },
  statusBadge: {
    position: "absolute" as const,
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    marginBottom: 8,
  },
  projectInfo: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
  },
  projectName: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  typeBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  addressRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    marginBottom: 12,
  },
  addressText: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  metaRow: {
    flexDirection: "row" as const,
    gap: 20,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  inviterRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  inviterInfo: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
  },
  inviterAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  inviterName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  roleText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "500" as const,
  },
  actionButtons: {
    flexDirection: "row" as const,
    gap: 12,
    marginTop: 16,
  },
  declineButton: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.error,
    backgroundColor: `${Colors.error}10`,
  },
  declineText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.error,
  },
  acceptButton: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.success,
  },
  acceptText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  emptyState: {
    alignItems: "center" as const,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: "center" as const,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  modalContent: {
    flex: 1,
  },
  modalImage: {
    width: "100%",
    height: 200,
  },
  modalBody: {
    padding: 20,
  },
  modalProjectHeader: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    justifyContent: "space-between" as const,
    marginBottom: 12,
  },
  modalProjectName: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.text,
    flex: 1,
    marginRight: 12,
  },
  typeBadgeLarge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  typeTextLarge: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  detailRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    marginBottom: 20,
  },
  detailText: {
    fontSize: 15,
    color: Colors.textSecondary,
    flex: 1,
  },
  detailsGrid: {
    flexDirection: "row" as const,
    gap: 12,
    marginBottom: 20,
  },
  detailCard: {
    flex: 1,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center" as const,
  },
  detailCardLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  detailCardValue: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
    marginTop: 4,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  roleCard: {
    backgroundColor: Colors.primary + "15",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  roleName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.primary,
    textAlign: "center" as const,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  inviterCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  inviterTopRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 14,
  },
  inviterAvatarLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  inviterDetails: {
    flex: 1,
    marginLeft: 14,
  },
  inviterNameLarge: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  inviterDate: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  expiresText: {
    fontSize: 12,
    color: Colors.warning,
    marginTop: 4,
    fontWeight: "500" as const,
  },
  contactButtonsRow: {
    flexDirection: "row" as const,
    gap: 12,
  },
  contactButtonWide: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.primary + "15",
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  modalActions: {
    flexDirection: "row" as const,
    gap: 12,
    marginTop: 24,
  },
  modalDeclineButton: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.error,
    backgroundColor: `${Colors.error}10`,
  },
  modalDeclineText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.error,
  },
  modalAcceptButton: {
    flex: 2,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: Colors.success,
  },
  modalAcceptText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  acceptedBanner: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 10,
    backgroundColor: Colors.success + "15",
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },
  acceptedText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.success,
  },
  declinedBanner: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 10,
    backgroundColor: Colors.error + "15",
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },
  declinedText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.error,
  },
});
