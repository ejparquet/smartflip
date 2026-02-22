import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  TextInput,
  Alert,
  Linking,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  Zap,
  Phone,
  Mail,
  Star,
  CheckCircle,
  XCircle,
  Home,
  Ruler,
  FileText,
  Shield,
  Package,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  AlertTriangle,
  Briefcase,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useInvitations } from "@/contexts/InvitationsContext";
import { useService } from "@/contexts/ServiceContext";
import { useNotifications } from "@/contexts/NotificationsContext";
import { getJobRequestById } from "@/mocks/job-requests";
import { Professional } from "@/types";
import * as Haptics from "expo-haptics";

type JobStatus = "pending" | "accepted" | "declined";

export default function JobRequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { updateJobStatus } = useInvitations();
  const { serviceConfig } = useService();
  const { addNotification } = useNotifications();
  const professional = user as Professional | null;
  const serviceColor = serviceConfig?.color || "#272D53";

  const job = getJobRequestById(id || "");

  const [status, setStatus] = useState<JobStatus>("pending");
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [selectedDeclineReason, setSelectedDeclineReason] = useState<string | null>(null);
  const [scopeExpanded, setScopeExpanded] = useState(true);
  const [requirementsExpanded, setRequirementsExpanded] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const statusBannerAnim = useRef(new Animated.Value(0)).current;
  const modalAnim = useRef(new Animated.Value(0)).current;
  const scaleAccept = useRef(new Animated.Value(1)).current;
  const scaleDecline = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const showStatusBanner = useCallback(() => {
    Animated.spring(statusBannerAnim, {
      toValue: 1,
      friction: 6,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [statusBannerAnim]);

  const openModal = useCallback(() => {
    Animated.timing(modalAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [modalAnim]);

  const closeModal = useCallback((cb?: () => void) => {
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => cb?.());
  }, [modalAnim]);

  const handlePressIn = useCallback((anim: Animated.Value) => {
    Animated.spring(anim, {
      toValue: 0.95,
      friction: 5,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressOut = useCallback((anim: Animated.Value) => {
    Animated.spring(anim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  }, []);

  const declineReasons = [
    "Schedule conflict",
    "Outside service area",
    "Budget too low",
    "Not my specialty",
    "Too busy currently",
    "Other",
  ];

  const handleAcceptPress = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setShowAcceptModal(true);
    openModal();
  }, [openModal]);

  const handleDeclinePress = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowDeclineModal(true);
    openModal();
  }, [openModal]);

  const confirmAccept = useCallback(() => {
    console.log("[JobRequestDetail] Accepting job:", id);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    closeModal(() => {
      setShowAcceptModal(false);
      setStatus("accepted");
      if (id) updateJobStatus(id, "accepted");
      addNotification({
        type: "job_accepted",
        title: "Job Request Accepted",
        message: `${professional?.name || "A professional"} has accepted your job request for "${job?.title || "your project"}". They will be in touch shortly.`,
        jobId: id,
        professionalName: professional?.name,
        professionalType: serviceConfig?.type,
      });
      showStatusBanner();
    });
  }, [id, job, professional, serviceConfig, updateJobStatus, addNotification, closeModal, showStatusBanner]);

  const confirmDecline = useCallback(() => {
    console.log("[JobRequestDetail] Declining job:", id, "Reason:", selectedDeclineReason, declineReason);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    closeModal(() => {
      setShowDeclineModal(false);
      setStatus("declined");
      if (id) updateJobStatus(id, "declined");
      addNotification({
        type: "job_declined",
        title: "Job Request Declined",
        message: `${professional?.name || "A professional"} has declined your job request for "${job?.title || "your project"}". You may want to reach out to other professionals.`,
        jobId: id,
        professionalName: professional?.name,
        professionalType: serviceConfig?.type,
      });
      showStatusBanner();
    });
  }, [id, job, professional, serviceConfig, selectedDeclineReason, declineReason, updateJobStatus, addNotification, closeModal, showStatusBanner]);

  const cancelModal = useCallback(() => {
    closeModal(() => {
      setShowAcceptModal(false);
      setShowDeclineModal(false);
      setDeclineReason("");
      setSelectedDeclineReason(null);
    });
  }, [closeModal]);

  const handleCall = useCallback(() => {
    if (job?.clientPhone) {
      Linking.openURL(`tel:${job.clientPhone}`);
    }
  }, [job]);

  const handleEmail = useCallback(() => {
    if (job?.clientEmail) {
      Linking.openURL(`mailto:${job.clientEmail}`);
    }
  }, [job]);

  const ds = useMemo(() => ({
    bg: { backgroundColor: theme.background },
    surface: { backgroundColor: theme.surface },
    text: { color: theme.text },
    textSecondary: { color: theme.textSecondary },
    textTertiary: { color: theme.textTertiary },
    border: { borderColor: theme.border },
    surfaceSecondary: { backgroundColor: theme.surfaceSecondary },
  }), [theme]);

  if (!job) {
    return (
      <View style={[styles.container, ds.bg]}>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.errorContainer}>
          <AlertTriangle size={48} color={theme.textTertiary} />
          <Text style={[styles.errorTitle, ds.text]}>Job Not Found</Text>
          <Text style={[styles.errorText, ds.textSecondary]}>This job request may have been removed.</Text>
          <TouchableOpacity style={[styles.backBtn2, { backgroundColor: serviceColor }]} onPress={() => router.back()}>
            <Text style={styles.backBtn2Text}>Go Back</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  const statusBannerTranslateY = statusBannerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-80, 0],
  });

  const modalOverlayOpacity = modalAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const modalScale = modalAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });

  const daysAgo = Math.floor((Date.now() - new Date(job.postedDate).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <View style={[styles.container, ds.bg]}>
      <Stack.Screen options={{ headerShown: false }} />

      {status !== "pending" && (
        <Animated.View
          style={[
            styles.statusBanner,
            {
              backgroundColor: status === "accepted" ? "#22C55E" : "#EF4444",
              transform: [{ translateY: statusBannerTranslateY }],
            },
          ]}
        >
          <SafeAreaView edges={["top"]} style={styles.statusBannerInner}>
            {status === "accepted" ? (
              <CheckCircle size={20} color="#FFFFFF" />
            ) : (
              <XCircle size={20} color="#FFFFFF" />
            )}
            <Text style={styles.statusBannerText}>
              {status === "accepted" ? "Job Accepted! The client has been notified." : "Job Declined. The client has been notified."}
            </Text>
          </SafeAreaView>
        </Animated.View>
      )}

      <SafeAreaView edges={["top"]} style={[styles.headerSafe, ds.surface]}>
        <View style={[styles.header, ds.surface, { borderBottomColor: theme.borderLight }]}>
          <TouchableOpacity style={[styles.headerBtn, ds.surfaceSecondary]} onPress={() => router.back()}>
            <ArrowLeft size={20} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, ds.text]} numberOfLines={1}>Job Request</Text>
          <View style={styles.headerBtnPlaceholder} />
        </View>
      </SafeAreaView>

      <Animated.ScrollView
        style={[styles.scrollView, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        showsVerticalScrollIndicator={false}
      >
        <Image source={{ uri: job.propertyImage }} style={styles.propertyImage} contentFit="cover" />

        {job.isUrgent && (
          <View style={styles.urgentOverlay}>
            <Zap size={14} color="#FFFFFF" />
            <Text style={styles.urgentOverlayText}>Urgent Request</Text>
          </View>
        )}

        <View style={[styles.titleSection, ds.surface]}>
          <View style={styles.titleRow}>
            <View style={styles.titleInfo}>
              <Text style={[styles.jobTitle, ds.text]}>{job.title}</Text>
              <View style={styles.addressRow}>
                <MapPin size={14} color={theme.textSecondary} />
                <Text style={[styles.addressText, ds.textSecondary]}>{job.address}</Text>
              </View>
            </View>
            <View style={[styles.statusChip, {
              backgroundColor: status === "pending" ? `${serviceColor}15` : status === "accepted" ? "#22C55E15" : "#EF444515"
            }]}>
              <Text style={[styles.statusChipText, {
                color: status === "pending" ? serviceColor : status === "accepted" ? "#22C55E" : "#EF4444"
              }]}>
                {status === "pending" ? "New" : status === "accepted" ? "Accepted" : "Declined"}
              </Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <DollarSign size={16} color={serviceColor} />
              <Text style={[styles.metaValue, ds.text]}>{job.budget}</Text>
              <Text style={[styles.metaLabel, ds.textSecondary]}>Budget</Text>
            </View>
            <View style={[styles.metaDivider, { backgroundColor: theme.borderLight }]} />
            <View style={styles.metaItem}>
              <Calendar size={16} color={serviceColor} />
              <Text style={[styles.metaValue, ds.text]}>{job.timeline}</Text>
              <Text style={[styles.metaLabel, ds.textSecondary]}>Timeline</Text>
            </View>
            <View style={[styles.metaDivider, { backgroundColor: theme.borderLight }]} />
            <View style={styles.metaItem}>
              <Clock size={16} color={serviceColor} />
              <Text style={[styles.metaValue, ds.text]}>{daysAgo === 0 ? "Today" : `${daysAgo}d ago`}</Text>
              <Text style={[styles.metaLabel, ds.textSecondary]}>Posted</Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, ds.surface]}>
          <Text style={[styles.cardTitle, ds.text]}>Description</Text>
          <Text style={[styles.descriptionText, ds.textSecondary]}>{job.description}</Text>
        </View>

        <View style={[styles.card, ds.surface]}>
          <TouchableOpacity
            style={styles.expandableHeader}
            onPress={() => setScopeExpanded(!scopeExpanded)}
            activeOpacity={0.7}
          >
            <View style={styles.expandableTitle}>
              <FileText size={18} color={serviceColor} />
              <Text style={[styles.cardTitleInline, ds.text]}>Scope of Work</Text>
              <View style={styles.scopeCountBadge}>
                <Text style={[styles.scopeCountText, { color: serviceColor }]}>{job.scopeOfWork.length}</Text>
              </View>
            </View>
            {scopeExpanded ? (
              <ChevronUp size={20} color={theme.textSecondary} />
            ) : (
              <ChevronDown size={20} color={theme.textSecondary} />
            )}
          </TouchableOpacity>
          {scopeExpanded && (
            <View style={styles.scopeList}>
              {job.scopeOfWork.map((item, index) => (
                <View key={index} style={styles.scopeItem}>
                  <View style={[styles.scopeDot, { backgroundColor: serviceColor }]} />
                  <Text style={[styles.scopeText, ds.text]}>{item}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={[styles.card, ds.surface]}>
          <Text style={[styles.cardTitle, ds.text]}>Property Details</Text>
          <View style={styles.propertyDetails}>
            <View style={styles.propertyDetail}>
              <Home size={16} color={theme.textSecondary} />
              <Text style={[styles.propertyDetailText, ds.textSecondary]}>{job.propertyType}</Text>
            </View>
            <View style={styles.propertyDetail}>
              <Ruler size={16} color={theme.textSecondary} />
              <Text style={[styles.propertyDetailText, ds.textSecondary]}>{job.propertySqFt}</Text>
            </View>
            <View style={styles.propertyDetail}>
              <Calendar size={16} color={theme.textSecondary} />
              <Text style={[styles.propertyDetailText, ds.textSecondary]}>Start: {job.startDate}</Text>
            </View>
            <View style={styles.propertyDetail}>
              <Clock size={16} color={theme.textSecondary} />
              <Text style={[styles.propertyDetailText, ds.textSecondary]}>Duration: {job.estimatedDuration}</Text>
            </View>
            <View style={styles.propertyDetail}>
              <Package size={16} color={theme.textSecondary} />
              <Text style={[styles.propertyDetailText, ds.textSecondary]}>
                Materials: {job.materialsProvided ? "Provided by client" : "Contractor provides"}
              </Text>
            </View>
            {job.permitRequired && (
              <View style={styles.propertyDetail}>
                <Shield size={16} color="#EAB308" />
                <Text style={[styles.propertyDetailText, { color: "#EAB308" }]}>Permit Required</Text>
              </View>
            )}
          </View>
        </View>

        {job.specialRequirements && job.specialRequirements.length > 0 && (
          <View style={[styles.card, ds.surface]}>
            <TouchableOpacity
              style={styles.expandableHeader}
              onPress={() => setRequirementsExpanded(!requirementsExpanded)}
              activeOpacity={0.7}
            >
              <View style={styles.expandableTitle}>
                <AlertTriangle size={18} color="#EAB308" />
                <Text style={[styles.cardTitleInline, ds.text]}>Special Requirements</Text>
              </View>
              {requirementsExpanded ? (
                <ChevronUp size={20} color={theme.textSecondary} />
              ) : (
                <ChevronDown size={20} color={theme.textSecondary} />
              )}
            </TouchableOpacity>
            {requirementsExpanded && (
              <View style={styles.requirementsList}>
                {job.specialRequirements.map((req, index) => (
                  <View key={index} style={[styles.requirementItem, { backgroundColor: "#FEF3C720" }]}>
                    <AlertTriangle size={14} color="#EAB308" />
                    <Text style={[styles.requirementText, ds.text]}>{req}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        <View style={[styles.card, ds.surface]}>
          <Text style={[styles.cardTitle, ds.text]}>Client</Text>
          <View style={styles.clientSection}>
            <Image source={{ uri: job.clientAvatar }} style={styles.clientAvatar} contentFit="cover" />
            <View style={styles.clientInfo}>
              <Text style={[styles.clientName, ds.text]}>{job.clientName}</Text>
              <View style={styles.clientMeta}>
                <View style={styles.clientRating}>
                  <Star size={14} color="#EAB308" fill="#EAB308" />
                  <Text style={[styles.clientRatingText, ds.text]}>{job.clientRating.toFixed(1)}</Text>
                </View>
                <Text style={[styles.clientDot, ds.textTertiary]}>·</Text>
                <View style={styles.clientJobs}>
                  <Briefcase size={12} color={theme.textSecondary} />
                  <Text style={[styles.clientJobsText, ds.textSecondary]}>{job.clientJobsPosted} jobs posted</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.clientActions}>
            <TouchableOpacity style={[styles.clientActionBtn, ds.surfaceSecondary]} onPress={handleCall}>
              <Phone size={18} color={serviceColor} />
              <Text style={[styles.clientActionText, { color: serviceColor }]}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.clientActionBtn, ds.surfaceSecondary]} onPress={handleEmail}>
              <Mail size={18} color={serviceColor} />
              <Text style={[styles.clientActionText, { color: serviceColor }]}>Email</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.clientActionBtn, ds.surfaceSecondary]}
              onPress={() => {
                console.log("[JobRequestDetail] Opening chat with client");
                Alert.alert("Message", "Chat feature coming soon!");
              }}
            >
              <MessageCircle size={18} color={serviceColor} />
              <Text style={[styles.clientActionText, { color: serviceColor }]}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 140 }} />
      </Animated.ScrollView>

      {status === "pending" && (
        <SafeAreaView edges={["bottom"]} style={[styles.bottomBar, ds.surface, { borderTopColor: theme.borderLight }]}>
          <Animated.View style={{ flex: 1, transform: [{ scale: scaleDecline }] }}>
            <TouchableOpacity
              style={[styles.declineBtn, { borderColor: theme.border }]}
              onPress={handleDeclinePress}
              onPressIn={() => handlePressIn(scaleDecline)}
              onPressOut={() => handlePressOut(scaleDecline)}
              activeOpacity={0.8}
            >
              <XCircle size={20} color={theme.textSecondary} />
              <Text style={[styles.declineBtnText, ds.textSecondary]}>Decline</Text>
            </TouchableOpacity>
          </Animated.View>
          <View style={{ width: 12 }} />
          <Animated.View style={{ flex: 2, transform: [{ scale: scaleAccept }] }}>
            <TouchableOpacity
              style={[styles.acceptBtn, { backgroundColor: serviceColor }]}
              onPress={handleAcceptPress}
              onPressIn={() => handlePressIn(scaleAccept)}
              onPressOut={() => handlePressOut(scaleAccept)}
              activeOpacity={0.8}
            >
              <CheckCircle size={20} color="#FFFFFF" />
              <Text style={styles.acceptBtnText}>Accept Job</Text>
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      )}

      {status !== "pending" && (
        <SafeAreaView edges={["bottom"]} style={[styles.bottomBar, ds.surface, { borderTopColor: theme.borderLight }]}>
          <TouchableOpacity
            style={[styles.fullBtn, { backgroundColor: theme.surfaceSecondary }]}
            onPress={() => router.back()}
          >
            <ArrowLeft size={18} color={theme.text} />
            <Text style={[styles.fullBtnText, ds.text]}>Back to Dashboard</Text>
          </TouchableOpacity>
        </SafeAreaView>
      )}

      {(showAcceptModal || showDeclineModal) && (
        <Animated.View style={[styles.modalOverlay, { opacity: modalOverlayOpacity }]}>
          <TouchableOpacity style={styles.modalOverlayTouch} activeOpacity={1} onPress={cancelModal} />
          <Animated.View style={[
            styles.modalContent,
            ds.surface,
            { transform: [{ scale: modalScale }] },
          ]}>
            {showAcceptModal && (
              <>
                <View style={[styles.modalIconCircle, { backgroundColor: "#22C55E15" }]}>
                  <CheckCircle size={32} color="#22C55E" />
                </View>
                <Text style={[styles.modalTitle, ds.text]}>Accept This Job?</Text>
                <Text style={[styles.modalDesc, ds.textSecondary]}>
                  You're about to accept "{job.title}" for {job.budget}. The client will be notified and you can start coordinating details.
                </Text>

                <View style={[styles.modalSummary, ds.surfaceSecondary]}>
                  <View style={styles.modalSummaryRow}>
                    <Text style={[styles.modalSummaryLabel, ds.textSecondary]}>Client</Text>
                    <Text style={[styles.modalSummaryValue, ds.text]}>{job.clientName}</Text>
                  </View>
                  <View style={styles.modalSummaryRow}>
                    <Text style={[styles.modalSummaryLabel, ds.textSecondary]}>Budget</Text>
                    <Text style={[styles.modalSummaryValue, ds.text]}>{job.budget}</Text>
                  </View>
                  <View style={styles.modalSummaryRow}>
                    <Text style={[styles.modalSummaryLabel, ds.textSecondary]}>Start Date</Text>
                    <Text style={[styles.modalSummaryValue, ds.text]}>{job.startDate}</Text>
                  </View>
                  <View style={[styles.modalSummaryRow, { borderBottomWidth: 0 }]}>
                    <Text style={[styles.modalSummaryLabel, ds.textSecondary]}>Duration</Text>
                    <Text style={[styles.modalSummaryValue, ds.text]}>{job.estimatedDuration}</Text>
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity style={[styles.modalCancelBtn, { borderColor: theme.border }]} onPress={cancelModal}>
                    <Text style={[styles.modalCancelText, ds.textSecondary]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalConfirmBtn, { backgroundColor: "#22C55E" }]} onPress={confirmAccept}>
                    <CheckCircle size={18} color="#FFFFFF" />
                    <Text style={styles.modalConfirmText}>Accept</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {showDeclineModal && (
              <>
                <View style={[styles.modalIconCircle, { backgroundColor: "#EF444515" }]}>
                  <XCircle size={32} color="#EF4444" />
                </View>
                <Text style={[styles.modalTitle, ds.text]}>Decline This Job?</Text>
                <Text style={[styles.modalDesc, ds.textSecondary]}>
                  Please select a reason for declining. This helps clients understand and find the right professional.
                </Text>

                <View style={styles.reasonsList}>
                  {declineReasons.map((reason) => (
                    <TouchableOpacity
                      key={reason}
                      style={[
                        styles.reasonChip,
                        {
                          borderColor: selectedDeclineReason === reason ? "#EF4444" : theme.border,
                          backgroundColor: selectedDeclineReason === reason ? "#EF444510" : "transparent",
                        },
                      ]}
                      onPress={() => {
                        setSelectedDeclineReason(reason);
                        if (Platform.OS !== "web") {
                          Haptics.selectionAsync();
                        }
                      }}
                    >
                      <Text style={[
                        styles.reasonChipText,
                        { color: selectedDeclineReason === reason ? "#EF4444" : theme.text },
                      ]}>
                        {reason}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {selectedDeclineReason === "Other" && (
                  <TextInput
                    style={[styles.reasonInput, ds.text, { borderColor: theme.border, backgroundColor: theme.surfaceSecondary }]}
                    placeholder="Tell us more..."
                    placeholderTextColor={theme.textTertiary}
                    value={declineReason}
                    onChangeText={setDeclineReason}
                    multiline
                  />
                )}

                <View style={styles.modalActions}>
                  <TouchableOpacity style={[styles.modalCancelBtn, { borderColor: theme.border }]} onPress={cancelModal}>
                    <Text style={[styles.modalCancelText, ds.textSecondary]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modalConfirmBtn,
                      {
                        backgroundColor: selectedDeclineReason ? "#EF4444" : theme.border,
                      },
                    ]}
                    onPress={confirmDecline}
                    disabled={!selectedDeclineReason}
                  >
                    <XCircle size={18} color="#FFFFFF" />
                    <Text style={styles.modalConfirmText}>Decline</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    marginTop: 8,
  },
  errorText: {
    fontSize: 15,
    textAlign: "center" as const,
  },
  backBtn2: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  backBtn2Text: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  statusBanner: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  statusBannerInner: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    paddingBottom: 12,
    paddingHorizontal: 20,
  },
  statusBannerText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  headerSafe: {},
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  headerBtnPlaceholder: {
    width: 40,
    height: 40,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600" as const,
    flex: 1,
    textAlign: "center" as const,
  },
  scrollView: {
    flex: 1,
  },
  propertyImage: {
    width: "100%",
    height: 220,
  },
  urgentOverlay: {
    position: "absolute" as const,
    top: 16,
    right: 16,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    backgroundColor: "#EF4444",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  urgentOverlayText: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  titleSection: {
    padding: 20,
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "flex-start" as const,
    marginBottom: 20,
  },
  titleInfo: {
    flex: 1,
    marginRight: 12,
  },
  jobTitle: {
    fontSize: 22,
    fontWeight: "800" as const,
    marginBottom: 6,
  },
  addressRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  addressText: {
    fontSize: 14,
    flex: 1,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusChipText: {
    fontSize: 13,
    fontWeight: "700" as const,
  },
  metaRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-around" as const,
  },
  metaItem: {
    alignItems: "center" as const,
    flex: 1,
  },
  metaValue: {
    fontSize: 15,
    fontWeight: "700" as const,
    marginTop: 6,
  },
  metaLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  metaDivider: {
    width: 1,
    height: 40,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
    padding: 20,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    marginBottom: 12,
  },
  cardTitleInline: {
    fontSize: 17,
    fontWeight: "700" as const,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
  },
  expandableHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
  },
  expandableTitle: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  scopeCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  scopeCountText: {
    fontSize: 13,
    fontWeight: "700" as const,
  },
  scopeList: {
    marginTop: 16,
    gap: 10,
  },
  scopeItem: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    gap: 10,
  },
  scopeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  scopeText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  propertyDetails: {
    gap: 12,
  },
  propertyDetail: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
  },
  propertyDetailText: {
    fontSize: 14,
  },
  requirementsList: {
    marginTop: 16,
    gap: 8,
  },
  requirementItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    padding: 12,
    borderRadius: 10,
  },
  requirementText: {
    fontSize: 14,
    flex: 1,
  },
  clientSection: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 14,
    marginBottom: 16,
  },
  clientAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: "700" as const,
    marginBottom: 4,
  },
  clientMeta: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  clientRating: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  clientRatingText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  clientDot: {
    fontSize: 14,
  },
  clientJobs: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  clientJobsText: {
    fontSize: 13,
  },
  clientActions: {
    flexDirection: "row" as const,
    gap: 10,
  },
  clientActionBtn: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  clientActionText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  bottomBar: {
    flexDirection: "row" as const,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  declineBtn: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  declineBtnText: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  acceptBtn: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  acceptBtnText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  fullBtn: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  fullBtnText: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  modalOverlay: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    zIndex: 200,
  },
  modalOverlayTouch: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    width: "88%",
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    alignItems: "center" as const,
  },
  modalIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800" as const,
    marginBottom: 8,
    textAlign: "center" as const,
  },
  modalDesc: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center" as const,
    marginBottom: 20,
  },
  modalSummary: {
    width: "100%",
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  modalSummaryRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  modalSummaryLabel: {
    fontSize: 14,
  },
  modalSummaryValue: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  modalActions: {
    flexDirection: "row" as const,
    gap: 12,
    width: "100%",
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  modalConfirmBtn: {
    flex: 1,
    flexDirection: "row" as const,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 6,
  },
  modalConfirmText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  reasonsList: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 8,
    width: "100%",
    marginBottom: 16,
  },
  reasonChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  reasonChipText: {
    fontSize: 14,
    fontWeight: "500" as const,
  },
  reasonInput: {
    width: "100%",
    minHeight: 80,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    textAlignVertical: "top" as const,
    marginBottom: 16,
  },
});
