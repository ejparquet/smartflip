import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Image } from "expo-image";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  CheckCircle,
  XCircle,
  ChevronRight,
  MessageCircle,
  Phone,
  Droplets,
  AlertCircle,
  X,
  Check,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";

interface PlumberInvitation {
  id: string;
  clientName: string;
  clientAvatar: string;
  clientPhone: string;
  projectTitle: string;
  projectType: string;
  description: string;
  location: string;
  scheduledDate: string;
  scheduledTime: string;
  estimatedBudget: string;
  status: "pending" | "accepted" | "declined";
  clientMessage?: string;
  urgency: "normal" | "urgent" | "emergency";
  createdAt: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: "job" | "estimate" | "follow_up";
  clientName: string;
  location: string;
}

const mockInvitations: PlumberInvitation[] = [
  {
    id: "inv1",
    clientName: "Sarah Johnson",
    clientAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    clientPhone: "(617) 555-1234",
    projectTitle: "Kitchen Sink Installation",
    projectType: "Fixture Installation",
    description: "Need to install a new kitchen sink with garbage disposal. The existing plumbing is in good condition but needs updating to fit the new double-bowl sink.",
    location: "123 Main St, Boston, MA",
    scheduledDate: "2026-02-03",
    scheduledTime: "9:00 AM",
    estimatedBudget: "$400 - $600",
    status: "pending",
    clientMessage: "Hi! We just bought a new house and the kitchen sink needs to be replaced. The current one is leaking and we'd like to upgrade to a double-bowl model. Looking forward to hearing from you!",
    urgency: "normal",
    createdAt: "2026-01-30",
  },
  {
    id: "inv2",
    clientName: "Mike Thompson",
    clientAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    clientPhone: "(617) 555-2345",
    projectTitle: "Emergency Pipe Leak",
    projectType: "Emergency Repair",
    description: "Water pipe burst in the basement. Water has been shut off but need immediate repair.",
    location: "456 Oak Ave, Cambridge, MA",
    scheduledDate: "2026-01-31",
    scheduledTime: "ASAP",
    estimatedBudget: "$200 - $500",
    status: "pending",
    clientMessage: "URGENT: We have a burst pipe in our basement! Water everywhere. Please come as soon as possible!",
    urgency: "emergency",
    createdAt: "2026-01-30",
  },
  {
    id: "inv3",
    clientName: "Emily Chen",
    clientAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
    clientPhone: "(617) 555-3456",
    projectTitle: "Bathroom Remodel Plumbing",
    projectType: "Renovation",
    description: "Complete bathroom remodel requiring new plumbing for shower, toilet, and vanity. Moving some fixtures to new locations.",
    location: "789 Pine St, Somerville, MA",
    scheduledDate: "2026-02-10",
    scheduledTime: "10:00 AM",
    estimatedBudget: "$2,000 - $3,500",
    status: "pending",
    clientMessage: "We're planning a complete bathroom renovation and need professional plumbing work. The contractor recommended reaching out to you. Can we schedule a consultation?",
    urgency: "normal",
    createdAt: "2026-01-28",
  },
  {
    id: "inv4",
    clientName: "David Wilson",
    clientAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
    clientPhone: "(617) 555-4567",
    projectTitle: "Water Heater Replacement",
    projectType: "Appliance Installation",
    description: "50-gallon gas water heater needs replacement. Current unit is 15 years old and not heating efficiently.",
    location: "321 Elm St, Brookline, MA",
    scheduledDate: "2026-02-05",
    scheduledTime: "2:00 PM",
    estimatedBudget: "$1,200 - $1,800",
    status: "accepted",
    clientMessage: "Our water heater finally gave out. We've already purchased a new one from Home Depot. Just need it installed professionally.",
    urgency: "urgent",
    createdAt: "2026-01-25",
  },
];

const mockCalendarEvents: CalendarEvent[] = [
  {
    id: "cal1",
    title: "Water Heater Installation",
    date: "2026-02-05",
    time: "2:00 PM",
    type: "job",
    clientName: "David Wilson",
    location: "321 Elm St, Brookline, MA",
  },
  {
    id: "cal2",
    title: "Drain Cleaning Follow-up",
    date: "2026-02-06",
    time: "11:00 AM",
    type: "follow_up",
    clientName: "Jennifer Adams",
    location: "555 Maple Dr, Newton, MA",
  },
  {
    id: "cal3",
    title: "Estimate - Pipe Replacement",
    date: "2026-02-07",
    time: "3:00 PM",
    type: "estimate",
    clientName: "Robert Martinez",
    location: "888 Cedar Ln, Quincy, MA",
  },
];

export default function PlumberInvitationsScreen() {
  const router = useRouter();
  const [invitations, setInvitations] = useState<PlumberInvitation[]>(mockInvitations);
  const [selectedInvitation, setSelectedInvitation] = useState<PlumberInvitation | null>(null);
  const [showAcceptConfirmation, setShowAcceptConfirmation] = useState(false);
  const [activeTab, setActiveTab] = useState<"invitations" | "calendar">("invitations");

  const pendingInvitations = invitations.filter(inv => inv.status === "pending");
  const acceptedInvitations = invitations.filter(inv => inv.status === "accepted");

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "emergency": return Colors.error;
      case "urgent": return "#272D53";
      default: return Colors.success;
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case "emergency": return "Emergency";
      case "urgent": return "Urgent";
      default: return "Normal";
    }
  };

  const handleAcceptInvitation = (invitation: PlumberInvitation) => {
    setSelectedInvitation(invitation);
    setShowAcceptConfirmation(true);
  };

  const confirmAcceptInvitation = () => {
    if (selectedInvitation) {
      setInvitations(prev =>
        prev.map(inv =>
          inv.id === selectedInvitation.id ? { ...inv, status: "accepted" as const } : inv
        )
      );
      setShowAcceptConfirmation(false);
      
      Alert.alert(
        "Job Accepted! ✓",
        `You've accepted the job from ${selectedInvitation.clientName}.\n\nClient's Message:\n"${selectedInvitation.clientMessage || 'No message provided'}"\n\nThe job has been added to your calendar. Don't forget to contact the client to confirm details.`,
        [
          {
            text: "Call Client Now",
            onPress: () => {
              console.log("Calling client:", selectedInvitation.clientPhone);
            },
          },
          {
            text: "Message Client",
            onPress: () => {
              router.push("/chat/new");
            },
          },
          { text: "Done", style: "cancel" },
        ]
      );
      setSelectedInvitation(null);
    }
  };

  const handleDeclineInvitation = (invitation: PlumberInvitation) => {
    Alert.alert(
      "Decline Job",
      `Are you sure you want to decline the job from ${invitation.clientName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Decline",
          style: "destructive",
          onPress: () => {
            setInvitations(prev =>
              prev.map(inv =>
                inv.id === invitation.id ? { ...inv, status: "declined" as const } : inv
              )
            );
            Alert.alert("Job Declined", "The client will be notified.");
          },
        },
      ]
    );
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "job": return "#3B82F6";
      case "estimate": return "#8B5CF6";
      case "follow_up": return "#10B981";
      default: return Colors.textSecondary;
    }
  };

  const renderInvitationCard = (invitation: PlumberInvitation) => (
    <TouchableOpacity
      key={invitation.id}
      style={styles.invitationCard}
      onPress={() => setSelectedInvitation(invitation)}
    >
      <View style={styles.invitationHeader}>
        <Image source={{ uri: invitation.clientAvatar }} style={styles.clientAvatar} contentFit="cover" />
        <View style={styles.invitationInfo}>
          <Text style={styles.clientName}>{invitation.clientName}</Text>
          <Text style={styles.projectTitle}>{invitation.projectTitle}</Text>
          <Text style={styles.projectType}>{invitation.projectType}</Text>
        </View>
        <View style={[styles.urgencyBadge, { backgroundColor: `${getUrgencyColor(invitation.urgency)}15` }]}>
          <AlertCircle size={12} color={getUrgencyColor(invitation.urgency)} />
          <Text style={[styles.urgencyText, { color: getUrgencyColor(invitation.urgency) }]}>
            {getUrgencyLabel(invitation.urgency)}
          </Text>
        </View>
      </View>

      <View style={styles.invitationMeta}>
        <View style={styles.metaItem}>
          <Calendar size={14} color={Colors.textSecondary} />
          <Text style={styles.metaText}>{new Date(invitation.scheduledDate).toLocaleDateString()}</Text>
        </View>
        <View style={styles.metaItem}>
          <Clock size={14} color={Colors.textSecondary} />
          <Text style={styles.metaText}>{invitation.scheduledTime}</Text>
        </View>
        <View style={styles.metaItem}>
          <DollarSign size={14} color={Colors.textSecondary} />
          <Text style={styles.metaText}>{invitation.estimatedBudget}</Text>
        </View>
      </View>

      <View style={styles.locationRow}>
        <MapPin size={14} color={Colors.textSecondary} />
        <Text style={styles.locationText} numberOfLines={1}>{invitation.location}</Text>
      </View>

      {invitation.status === "pending" && (
        <View style={styles.invitationActions}>
          <TouchableOpacity
            style={styles.declineButton}
            onPress={() => handleDeclineInvitation(invitation)}
          >
            <XCircle size={18} color={Colors.error} />
            <Text style={styles.declineText}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => handleAcceptInvitation(invitation)}
          >
            <CheckCircle size={18} color={Colors.white} />
            <Text style={styles.acceptText}>Accept</Text>
          </TouchableOpacity>
        </View>
      )}

      {invitation.status === "accepted" && (
        <View style={styles.acceptedBadge}>
          <CheckCircle size={16} color={Colors.success} />
          <Text style={styles.acceptedText}>Accepted</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderCalendarEvent = (event: CalendarEvent) => (
    <TouchableOpacity key={event.id} style={styles.eventCard}>
      <View style={[styles.eventIndicator, { backgroundColor: getEventTypeColor(event.type) }]} />
      <View style={styles.eventContent}>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <Text style={styles.eventClient}>{event.clientName}</Text>
        <View style={styles.eventMeta}>
          <View style={styles.eventMetaItem}>
            <Calendar size={12} color={Colors.textSecondary} />
            <Text style={styles.eventMetaText}>{new Date(event.date).toLocaleDateString()}</Text>
          </View>
          <View style={styles.eventMetaItem}>
            <Clock size={12} color={Colors.textSecondary} />
            <Text style={styles.eventMetaText}>{event.time}</Text>
          </View>
        </View>
        <View style={styles.eventLocation}>
          <MapPin size={12} color={Colors.textSecondary} />
          <Text style={styles.eventLocationText} numberOfLines={1}>{event.location}</Text>
        </View>
      </View>
      <ChevronRight size={20} color={Colors.textTertiary} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Job Invitations",
          headerLeft: () => <BackButton />,
          headerStyle: { backgroundColor: Colors.background },
          headerShadowVisible: false,
        }}
      />

      <View style={styles.headerSection}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Droplets size={18} color="#06B6D4" />
            <Text style={styles.statCardValue}>{pendingInvitations.length}</Text>
            <Text style={styles.statCardLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <CheckCircle size={18} color={Colors.success} />
            <Text style={[styles.statCardValue, { color: Colors.success }]}>{acceptedInvitations.length}</Text>
            <Text style={styles.statCardLabel}>Accepted</Text>
          </View>
          <View style={styles.statCard}>
            <Calendar size={18} color="#3B82F6" />
            <Text style={styles.statCardValue}>{mockCalendarEvents.length}</Text>
            <Text style={styles.statCardLabel}>Upcoming</Text>
          </View>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "invitations" && styles.tabActive]}
            onPress={() => setActiveTab("invitations")}
          >
            <MessageCircle size={16} color={activeTab === "invitations" ? Colors.white : Colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === "invitations" && styles.tabTextActive]}>
              Invitations
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "calendar" && styles.tabActive]}
            onPress={() => setActiveTab("calendar")}
          >
            <Calendar size={16} color={activeTab === "calendar" ? Colors.white : Colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === "calendar" && styles.tabTextActive]}>
              Calendar
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "invitations" && (
          <>
            {pendingInvitations.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Pending Invitations</Text>
                {pendingInvitations.map(renderInvitationCard)}
              </View>
            )}

            {acceptedInvitations.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Accepted Jobs</Text>
                {acceptedInvitations.map(renderInvitationCard)}
              </View>
            )}

            {pendingInvitations.length === 0 && acceptedInvitations.length === 0 && (
              <View style={styles.emptyState}>
                <MessageCircle size={48} color={Colors.textTertiary} />
                <Text style={styles.emptyTitle}>No Invitations</Text>
                <Text style={styles.emptyText}>New job invitations will appear here</Text>
              </View>
            )}
          </>
        )}

        {activeTab === "calendar" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming Schedule</Text>
            {mockCalendarEvents.map(renderCalendarEvent)}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showAcceptConfirmation}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAcceptConfirmation(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationModal}>
            <View style={styles.confirmationHeader}>
              <CheckCircle size={48} color={Colors.success} />
              <Text style={styles.confirmationTitle}>Accept This Job?</Text>
            </View>

            {selectedInvitation && (
              <>
                <View style={styles.confirmationDetails}>
                  <Text style={styles.confirmationProject}>{selectedInvitation.projectTitle}</Text>
                  <Text style={styles.confirmationClient}>From: {selectedInvitation.clientName}</Text>
                  <Text style={styles.confirmationDate}>
                    {new Date(selectedInvitation.scheduledDate).toLocaleDateString()} at {selectedInvitation.scheduledTime}
                  </Text>
                </View>

                {selectedInvitation.clientMessage && (
                  <View style={styles.clientMessageBox}>
                    <Text style={styles.clientMessageLabel}>Client's Message:</Text>
                    <Text style={styles.clientMessageText}>{`"${selectedInvitation.clientMessage}"`}</Text>
                  </View>
                )}
              </>
            )}

            <View style={styles.confirmationActions}>
              <TouchableOpacity
                style={styles.cancelConfirmButton}
                onPress={() => setShowAcceptConfirmation(false)}
              >
                <Text style={styles.cancelConfirmText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmAcceptButton}
                onPress={confirmAcceptInvitation}
              >
                <Check size={18} color={Colors.white} />
                <Text style={styles.confirmAcceptText}>Accept Job</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={selectedInvitation !== null && !showAcceptConfirmation}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedInvitation(null)}
      >
        {selectedInvitation && (
          <View style={styles.detailModalContainer}>
            <View style={styles.detailHeader}>
              <TouchableOpacity onPress={() => setSelectedInvitation(null)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.detailTitle}>Job Details</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.detailContent}>
              <View style={styles.detailClientSection}>
                <Image source={{ uri: selectedInvitation.clientAvatar }} style={styles.detailClientAvatar} contentFit="cover" />
                <View style={styles.detailClientInfo}>
                  <Text style={styles.detailClientName}>{selectedInvitation.clientName}</Text>
                  <TouchableOpacity style={styles.detailContactButton}>
                    <Phone size={14} color={Colors.primary} />
                    <Text style={styles.detailContactText}>{selectedInvitation.clientPhone}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.detailCard}>
                <Text style={styles.detailProjectTitle}>{selectedInvitation.projectTitle}</Text>
                <View style={styles.detailBadgeRow}>
                  <View style={styles.detailTypeBadge}>
                    <Droplets size={12} color="#06B6D4" />
                    <Text style={styles.detailTypeText}>{selectedInvitation.projectType}</Text>
                  </View>
                  <View style={[styles.detailUrgencyBadge, { backgroundColor: `${getUrgencyColor(selectedInvitation.urgency)}15` }]}>
                    <Text style={[styles.detailUrgencyText, { color: getUrgencyColor(selectedInvitation.urgency) }]}>
                      {getUrgencyLabel(selectedInvitation.urgency)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.detailInfoCard}>
                <View style={styles.detailInfoRow}>
                  <Calendar size={18} color={Colors.primary} />
                  <View style={styles.detailInfoContent}>
                    <Text style={styles.detailInfoLabel}>Scheduled Date</Text>
                    <Text style={styles.detailInfoValue}>
                      {new Date(selectedInvitation.scheduledDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                </View>
                <View style={styles.detailInfoRow}>
                  <Clock size={18} color={Colors.primary} />
                  <View style={styles.detailInfoContent}>
                    <Text style={styles.detailInfoLabel}>Time</Text>
                    <Text style={styles.detailInfoValue}>{selectedInvitation.scheduledTime}</Text>
                  </View>
                </View>
                <View style={styles.detailInfoRow}>
                  <MapPin size={18} color={Colors.primary} />
                  <View style={styles.detailInfoContent}>
                    <Text style={styles.detailInfoLabel}>Location</Text>
                    <Text style={styles.detailInfoValue}>{selectedInvitation.location}</Text>
                  </View>
                </View>
                <View style={styles.detailInfoRow}>
                  <DollarSign size={18} color={Colors.primary} />
                  <View style={styles.detailInfoContent}>
                    <Text style={styles.detailInfoLabel}>Estimated Budget</Text>
                    <Text style={styles.detailInfoValue}>{selectedInvitation.estimatedBudget}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.detailDescriptionCard}>
                <Text style={styles.detailDescriptionLabel}>Job Description</Text>
                <Text style={styles.detailDescriptionText}>{selectedInvitation.description}</Text>
              </View>

              {selectedInvitation.clientMessage && (
                <View style={styles.detailMessageCard}>
                  <Text style={styles.detailMessageLabel}>Message from Client</Text>
                  <Text style={styles.detailMessageText}>{`"${selectedInvitation.clientMessage}"`}</Text>
                </View>
              )}
            </ScrollView>

            {selectedInvitation.status === "pending" && (
              <View style={styles.detailActions}>
                <TouchableOpacity
                  style={styles.detailDeclineButton}
                  onPress={() => {
                    setSelectedInvitation(null);
                    handleDeclineInvitation(selectedInvitation);
                  }}
                >
                  <XCircle size={20} color={Colors.error} />
                  <Text style={styles.detailDeclineText}>Decline</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.detailAcceptButton}
                  onPress={() => handleAcceptInvitation(selectedInvitation)}
                >
                  <CheckCircle size={20} color={Colors.white} />
                  <Text style={styles.detailAcceptText}>Accept Job</Text>
                </TouchableOpacity>
              </View>
            )}
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
  backButton: {
    marginLeft: 8,
  },
  headerSection: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  statCardValue: {
    fontSize: 20,
    fontWeight: "800" as const,
    color: Colors.text,
    marginTop: 6,
  },
  statCardLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: "row",
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSecondary,
  },
  tabActive: {
    backgroundColor: "#06B6D4",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  invitationCard: {
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
  invitationHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  clientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  invitationInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  projectTitle: {
    fontSize: 14,
    color: Colors.primary,
    marginTop: 2,
  },
  projectType: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  urgencyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  urgencyText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  invitationMeta: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 14,
  },
  locationText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  invitationActions: {
    flexDirection: "row",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 14,
  },
  declineButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  declineText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.error,
  },
  acceptButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
  acceptedBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    marginTop: 4,
  },
  acceptedText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.success,
  },
  eventCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  eventIndicator: {
    width: 4,
    height: 48,
    borderRadius: 2,
    marginRight: 14,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  eventClient: {
    fontSize: 13,
    color: Colors.primary,
    marginTop: 2,
  },
  eventMeta: {
    flexDirection: "row",
    gap: 12,
    marginTop: 6,
  },
  eventMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  eventMetaText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  eventLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  eventLocationText: {
    fontSize: 12,
    color: Colors.textSecondary,
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  confirmationModal: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  confirmationHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  confirmationTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
    marginTop: 12,
  },
  confirmationDetails: {
    alignItems: "center",
    marginBottom: 16,
  },
  confirmationProject: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  confirmationClient: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  confirmationDate: {
    fontSize: 13,
    color: Colors.primary,
    marginTop: 4,
  },
  clientMessageBox: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  clientMessageLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  clientMessageText: {
    fontSize: 14,
    color: Colors.text,
    fontStyle: "italic",
    lineHeight: 20,
  },
  confirmationActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  cancelConfirmText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  confirmAcceptButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.success,
  },
  confirmAcceptText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  detailModalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  detailContent: {
    flex: 1,
    padding: 20,
  },
  detailClientSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  detailClientAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 14,
  },
  detailClientInfo: {
    flex: 1,
  },
  detailClientName: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  detailContactButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  detailContactText: {
    fontSize: 14,
    color: Colors.primary,
  },
  detailCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  detailProjectTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  detailBadgeRow: {
    flexDirection: "row",
    gap: 8,
  },
  detailTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  detailTypeText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#06B6D4",
  },
  detailUrgencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  detailUrgencyText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  detailInfoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  detailInfoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  detailInfoContent: {
    flex: 1,
    marginLeft: 12,
  },
  detailInfoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  detailInfoValue: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: Colors.text,
  },
  detailDescriptionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  detailDescriptionLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  detailDescriptionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  detailMessageCard: {
    backgroundColor: "#E8E9EE",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  detailMessageLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#B45309",
    marginBottom: 8,
  },
  detailMessageText: {
    fontSize: 14,
    color: "#92400E",
    fontStyle: "italic",
    lineHeight: 22,
  },
  detailActions: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  detailDeclineButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  detailDeclineText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.error,
  },
  detailAcceptButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: Colors.success,
  },
  detailAcceptText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.white,
  },
});
