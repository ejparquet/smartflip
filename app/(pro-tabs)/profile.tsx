import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  Platform,
  Linking,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import {
  Mail,
  Phone,
  MapPin,
  Settings,
  CreditCard,
  HelpCircle,
  FileText,
  LogOut,
  ChevronRight,
  ChevronLeft,
  BadgeCheck,
  Camera,
  Star,
  Shield,
  AlertTriangle,
  MessageSquare,
  TrendingUp,
  Users,
  BookOpen,
  Clock,
  CheckCircle,
  CircleDot,
  Leaf,
  Droplets,
  Wrench,
  DollarSign,
  Building2,
  X,
  Edit2,
  Paintbrush,
  Palette,
  Layers,
  Award,
  Eye,
  EyeOff,
  ShieldCheck,
  Plus,
  Image as ImageIcon,
  Briefcase,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { Professional, ProfessionalType } from "@/types";
import { professionalTypes } from "@/mocks/professionals";
import { landscaperFaqItems } from "@/mocks/landscapers";

interface RatingItem {
  label: string;
  value: number;
  icon: React.ComponentType<{ size: number; color: string }>;
}

interface DisclosureItem {
  label: string;
  value: string;
  status: string;
}

interface DisputeItem {
  id: string;
  title: string;
  status: string;
  date: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

const getServiceConfig = (professionalType: ProfessionalType | undefined) => {
  switch (professionalType) {
    case "realtor":
      return {
        ratingBreakdown: [
          { label: "Professionalism", value: 4.9, icon: Users },
          { label: "Negotiation", value: 4.7, icon: TrendingUp },
          { label: "Communication", value: 4.8, icon: MessageSquare },
          { label: "Market Knowledge", value: 4.6, icon: BookOpen },
        ] as RatingItem[],
        disclosures: [
          { label: "Commission Rate", value: "2.5% - 3%", status: "disclosed" },
          { label: "Referral Fees", value: "Up to 25%", status: "disclosed" },
          { label: "Dual Agency", value: "Permitted with consent", status: "disclosed" },
        ] as DisclosureItem[],
        disputes: [
          { id: "1", title: "Commission clarification", status: "resolved", date: "Jan 15, 2026" },
          { id: "2", title: "Scheduling conflict", status: "in_progress", date: "Jan 22, 2026" },
        ] as DisputeItem[],
        faqItems: [
          { question: "How do leads work?", answer: "Leads are assigned based on your service area, specialties, and availability. You receive notifications for new opportunities." },
          { question: "How are projects assigned?", answer: "Projects are matched to your profile. Investors can also directly invite you based on your portfolio and reviews." },
          { question: "How are ratings calculated?", answer: "Ratings are averaged from client reviews across professionalism, negotiation, communication, and market knowledge." },
          { question: "What are referral fees?", answer: "Referral fees apply when another agent refers a client to you. Standard rates range from 20-25%." },
        ] as FaqItem[],
        faqTitle: "Realtor FAQ",
        showDisclosures: true,
        statLabels: { first: "Years Exp.", second: "Closings", third: "Avg Sale" },
      };
    case "landscaper":
      return {
        ratingBreakdown: [
          { label: "Quality of Work", value: 4.9, icon: Star },
          { label: "Timeliness", value: 4.7, icon: Clock },
          { label: "Communication", value: 4.8, icon: MessageSquare },
          { label: "Value for Money", value: 4.6, icon: DollarSign },
        ] as RatingItem[],
        disclosures: [
          { label: "Licensed & Insured", value: "$1M General Liability", status: "verified" },
          { label: "Certifications", value: "Licensed Irrigator, ISA Certified", status: "verified" },
          { label: "Equipment", value: "Full commercial fleet", status: "verified" },
        ] as DisclosureItem[],
        disputes: [
          { id: "1", title: "Plant warranty claim", status: "resolved", date: "Jan 10, 2026" },
        ] as DisputeItem[],
        faqItems: landscaperFaqItems,
        faqTitle: "Landscaper FAQ",
        showDisclosures: true,
        statLabels: { first: "Years Exp.", second: "Projects", third: "Per Hour" },
      };
    case "contractor":
      return {
        ratingBreakdown: [
          { label: "Quality of Work", value: 4.8, icon: Wrench },
          { label: "Timeliness", value: 4.6, icon: Clock },
          { label: "Communication", value: 4.7, icon: MessageSquare },
          { label: "Budget Accuracy", value: 4.5, icon: DollarSign },
        ] as RatingItem[],
        disclosures: [
          { label: "License", value: "General Contractor #12345", status: "verified" },
          { label: "Insurance", value: "$2M General Liability", status: "verified" },
          { label: "Bonded", value: "Yes - $500K", status: "verified" },
        ] as DisclosureItem[],
        disputes: [] as DisputeItem[],
        faqItems: [
          { question: "How do project bids work?", answer: "You receive project requests and submit competitive bids. Clients review bids and select based on price, timeline, and your reviews." },
          { question: "What's the payment schedule?", answer: "Typically 30% upfront, 40% at midpoint, 30% on completion. Can be customized per project." },
          { question: "How are ratings calculated?", answer: "Ratings are based on work quality, timeliness, communication, and budget accuracy." },
          { question: "What about permits?", answer: "You're responsible for pulling required permits. The app can help track permit status." },
        ] as FaqItem[],
        faqTitle: "Contractor FAQ",
        showDisclosures: true,
        statLabels: { first: "Years Exp.", second: "Projects", third: "Per Hour" },
      };
    case "plumber":
      return {
        ratingBreakdown: [
          { label: "Quality of Work", value: 4.8, icon: Droplets },
          { label: "Response Time", value: 4.9, icon: Clock },
          { label: "Communication", value: 4.7, icon: MessageSquare },
          { label: "Fair Pricing", value: 4.6, icon: DollarSign },
        ] as RatingItem[],
        disclosures: [
          { label: "License", value: "Master Plumber #54321", status: "verified" },
          { label: "Insurance", value: "$1M General Liability", status: "verified" },
          { label: "Emergency Service", value: "24/7 Available", status: "verified" },
        ] as DisclosureItem[],
        disputes: [] as DisputeItem[],
        faqItems: [
          { question: "How do emergency calls work?", answer: "Emergency jobs are flagged as urgent. You receive priority notifications and can charge emergency rates." },
          { question: "How is pricing set?", answer: "You set your hourly rate and can provide flat-rate quotes for standard jobs." },
          { question: "What about parts markup?", answer: "Standard industry practice is 20-30% markup on parts. Be transparent with clients." },
          { question: "How are ratings calculated?", answer: "Based on work quality, response time, communication, and pricing fairness." },
        ] as FaqItem[],
        faqTitle: "Plumber FAQ",
        showDisclosures: true,
        statLabels: { first: "Years Exp.", second: "Jobs Done", third: "Per Hour" },
      };
    case "painter":
      return {
        ratingBreakdown: [
          { label: "Quality of Work", value: 4.9, icon: Paintbrush },
          { label: "Surface Prep", value: 4.8, icon: Layers },
          { label: "Color Matching", value: 4.7, icon: Palette },
          { label: "Cleanliness", value: 4.9, icon: CheckCircle },
          { label: "Timeliness", value: 4.6, icon: Clock },
        ] as RatingItem[],
        disclosures: [
          { label: "License", value: "Licensed Painter #PP-78432", status: "verified" },
          { label: "Insurance", value: "$1M General Liability", status: "verified" },
          { label: "EPA Lead-Safe", value: "Certified Renovator", status: "verified" },
          { label: "Bonded", value: "Yes - $250K", status: "verified" },
        ] as DisclosureItem[],
        disputes: [] as DisputeItem[],
        faqItems: [
          { question: "What types of painting do you offer?", answer: "We offer interior, exterior, cabinet refinishing, deck staining, specialty finishes like faux painting, and commercial painting services." },
          { question: "How do you estimate jobs?", answer: "Estimates are based on square footage, surface condition, number of coats needed, paint quality, and any specialty finishes requested." },
          { question: "What brands of paint do you use?", answer: "We primarily use premium brands like Sherwin-Williams, Benjamin Moore, and Behr for superior coverage and durability." },
          { question: "How long does a typical job take?", answer: "A single room takes 1-2 days, whole house interior 3-5 days, exterior projects 4-7 days depending on size and prep work needed." },
          { question: "Do you handle surface preparation?", answer: "Yes, proper prep is crucial. We handle sanding, patching, priming, caulking, and power washing for exterior jobs." },
        ] as FaqItem[],
        faqTitle: "Painter FAQ",
        showDisclosures: true,
        statLabels: { first: "Years Exp.", second: "Jobs Done", third: "Per Sq Ft" },
        showBio: true,
      };
    default:
      return {
        ratingBreakdown: [
          { label: "Quality of Work", value: 4.8, icon: Star },
          { label: "Timeliness", value: 4.7, icon: Clock },
          { label: "Communication", value: 4.8, icon: MessageSquare },
          { label: "Value", value: 4.6, icon: DollarSign },
        ] as RatingItem[],
        disclosures: [
          { label: "Licensed", value: "Yes", status: "verified" },
          { label: "Insured", value: "General Liability", status: "verified" },
        ] as DisclosureItem[],
        disputes: [] as DisputeItem[],
        faqItems: [
          { question: "How do I get jobs?", answer: "Jobs are matched to your profile based on service area, specialties, and availability." },
          { question: "How do payments work?", answer: "Clients pay through the platform. You receive payment within 3-5 business days after job completion." },
          { question: "How are ratings calculated?", answer: "Ratings are averaged from client reviews across multiple categories." },
        ] as FaqItem[],
        faqTitle: "FAQ",
        showDisclosures: true,
        statLabels: { first: "Years Exp.", second: "Completed", third: "Per Hour" },
      };
  }
};

type ProfileTabType = "Profile" | "Portfolio" | "Notifications" | "Bank" | "Terms";

export default function ProProfileScreen() {
  const router = useRouter();
  const { user, logout, updateProfile } = useAuth();
  const { theme } = useTheme();
  const professional = user as Professional | null;

  const [activeTab, setActiveTab] = useState<ProfileTabType>("Profile");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAvatar, setEditingAvatar] = useState(professional?.avatar || "");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [showRoutingNumber, setShowRoutingNumber] = useState(false);
  const [bankInfo, setBankInfo] = useState({
    bankName: "",
    accountHolder: "",
    accountNumber: "",
    routingNumber: "",
    accountType: "checking" as "checking" | "savings",
  });
  const [profileData, setProfileData] = useState({
    name: professional?.name || "",
    email: professional?.email || "",
    phone: professional?.phone || "",
    bio: professional?.bio || "",
    serviceArea: professional?.serviceArea || "",
  });

  const typeInfo = professional
    ? professionalTypes.find((t) => t.type === professional.professionalType)
    : null;

  const serviceConfig = getServiceConfig(professional?.professionalType);

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/onboarding" as any);
        },
      },
    ]);
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile({
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        bio: profileData.bio,
        serviceArea: profileData.serviceArea,
        avatar: editingAvatar || undefined,
      });
      Alert.alert("Success", "Profile updated successfully!");
      setShowEditModal(false);
    } catch (_error) {
      Alert.alert("Error", "Failed to update profile. Please try again.");
    }
  };

  const pickImage = async (useCamera: boolean) => {
    try {
      setIsUploadingImage(true);
      
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission Required", "Camera access is needed to take photos.");
          setIsUploadingImage(false);
          return;
        }
        
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
        
        if (!result.canceled && result.assets[0]) {
          setEditingAvatar(result.assets[0].uri);
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission Required", "Photo library access is needed to select images.");
          setIsUploadingImage(false);
          return;
        }
        
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
        
        if (!result.canceled && result.assets[0]) {
          setEditingAvatar(result.assets[0].uri);
        }
      }
    } catch (error) {
      console.log("Image picker error:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      "Update Profile Picture",
      "Choose how you want to add your photo or company logo",
      [
        { text: "Take Photo", onPress: () => pickImage(true) },
        { text: "Choose from Library", onPress: () => pickImage(false) },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const [expandedFaq, setExpandedFaq] = React.useState<number | null>(null);

  const handleReportIssue = () => {
    Alert.alert(
      "Report an Issue",
      "Select the type of issue you'd like to report:",
      [
        { text: "Client Dispute", onPress: () => Alert.alert("Submitted", "Your dispute has been logged. We'll review it within 48 hours.") },
        { text: "Payment Issue", onPress: () => Alert.alert("Submitted", "Your payment issue has been submitted. Our team will reach out shortly.") },
        { text: "Platform Issue", onPress: () => Alert.alert("Submitted", "Technical issue reported. Our support team will investigate.") },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const profileTabs: ProfileTabType[] = ["Profile", "Portfolio", "Notifications", "Bank", "Terms"];

  const getStatValue = (index: number) => {
    if (index === 0) return professional?.yearsExperience || 0;
    if (index === 1) return professional?.completedProjects || 0;
    if (index === 2) return `$${professional?.hourlyRate || 0}`;
    return 0;
  };

  const getAboutMeIcon = () => {
    switch (professional?.professionalType) {
      case "painter": return Paintbrush;
      case "plumber": return Droplets;
      case "electrician": return Wrench;
      case "landscaper": return Leaf;
      case "contractor": return Briefcase;
      case "realtor": return Building2;
      case "interior_designer": return Palette;
      case "pool_company": return Droplets;
      case "dumpster_service": return Wrench;
      default: return Briefcase;
    }
  };

  const getAboutMeColor = () => {
    switch (professional?.professionalType) {
      case "painter": return "#272D53";
      case "plumber": return "#3B82F6";
      case "electrician": return "#EAB308";
      case "landscaper": return "#22C55E";
      case "contractor": return "#272D53";
      case "realtor": return "#8B5CF6";
      case "interior_designer": return "#EC4899";
      case "pool_company": return "#06B6D4";
      case "dumpster_service": return "#78716C";
      default: return Colors.primary;
    }
  };

  const AboutMeIcon = getAboutMeIcon();
  const aboutMeColor = getAboutMeColor();

  const renderProfileTab = () => (
    <>
      <View style={styles.bioSection}>
        <View style={styles.bioHeader}>
          <AboutMeIcon size={20} color={aboutMeColor} />
          <Text style={styles.sectionTitle}>About Me</Text>
        </View>
        <View style={[styles.bioCard, { backgroundColor: `${aboutMeColor}10`, borderColor: `${aboutMeColor}30` }]}>
          <Text style={styles.bioText}>
            {professional?.bio || `Professional ${typeInfo?.label || "service provider"} with expertise in ${professional?.specialties?.slice(0, 3).join(", ") || "various services"}. Committed to quality craftsmanship and customer satisfaction.`}
          </Text>
          <View style={styles.bioHighlights}>
            <View style={styles.bioHighlightItem}>
              <Award size={16} color={aboutMeColor} />
              <Text style={[styles.bioHighlightText, { color: aboutMeColor }]}>Licensed & Insured</Text>
            </View>
            <View style={styles.bioHighlightItem}>
              <Star size={16} color={aboutMeColor} />
              <Text style={[styles.bioHighlightText, { color: aboutMeColor }]}>{professional?.rating?.toFixed(1) || "4.8"} Rating</Text>
            </View>
            <View style={styles.bioHighlightItem}>
              <CheckCircle size={16} color={aboutMeColor} />
              <Text style={[styles.bioHighlightText, { color: aboutMeColor }]}>{professional?.completedProjects || 0} Projects</Text>
            </View>
          </View>
        </View>
      </View>

      {professional?.specialties && professional.specialties.length > 0 && (
        <View style={styles.specialtiesSection}>
          <Text style={styles.sectionTitle}>Specialties</Text>
          <View style={styles.specialtiesGrid}>
            {professional.specialties.map((specialty, index) => (
              <View key={index} style={[styles.specialtyChip, { backgroundColor: `${aboutMeColor}15`, borderColor: `${aboutMeColor}40` }]}>
                <Text style={[styles.specialtyText, { color: aboutMeColor }]}>{specialty}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.ratingBreakdownSection}>
        <Text style={styles.sectionTitle}>Rating Breakdown</Text>
        <View style={styles.ratingBreakdownContainer}>
          {serviceConfig.ratingBreakdown.map((item, index) => (
            <View key={index} style={styles.ratingBreakdownItem}>
              <View style={styles.ratingBreakdownLeft}>
                <View style={styles.ratingBreakdownIcon}>
                  <item.icon size={16} color={Colors.primary} />
                </View>
                <Text style={styles.ratingBreakdownLabel}>{item.label}</Text>
              </View>
              <View style={styles.ratingBreakdownRight}>
                <View style={styles.ratingBar}>
                  <View style={[styles.ratingBarFill, { width: `${(item.value / 5) * 100}%` }]} />
                </View>
                <Text style={styles.ratingBreakdownValue}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {serviceConfig.showDisclosures && (
        <View style={styles.disclosureSection}>
          <View style={styles.disclosureHeader}>
            <Shield size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>
              {professional?.professionalType === "realtor" ? "Disclosures" : "Credentials"}
            </Text>
          </View>
          <View style={styles.disclosureContainer}>
            {serviceConfig.disclosures.map((item, index) => (
              <View key={index} style={styles.disclosureItem}>
                <View style={styles.disclosureLeft}>
                  <Text style={styles.disclosureLabel}>{item.label}</Text>
                  <Text style={styles.disclosureValue}>{item.value}</Text>
                </View>
                <View style={styles.disclosedBadge}>
                  <CheckCircle size={12} color={Colors.success} />
                  <Text style={styles.disclosedText}>
                    {item.status === "disclosed" ? "Disclosed" : "Verified"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.disputeSection}>
        <View style={styles.disputeHeader}>
          <Text style={styles.sectionTitle}>Issues & Disputes</Text>
          <TouchableOpacity style={styles.reportButton} onPress={handleReportIssue}>
            <AlertTriangle size={14} color={Colors.white} />
            <Text style={styles.reportButtonText}>Report</Text>
          </TouchableOpacity>
        </View>
        {serviceConfig.disputes.length > 0 ? (
          <View style={styles.disputeList}>
            {serviceConfig.disputes.map((dispute) => (
              <View key={dispute.id} style={styles.disputeItem}>
                <View style={styles.disputeLeft}>
                  <CircleDot 
                    size={14} 
                    color={dispute.status === "resolved" ? Colors.success : Colors.warning} 
                  />
                  <View>
                    <Text style={styles.disputeTitle}>{dispute.title}</Text>
                    <Text style={styles.disputeDate}>{dispute.date}</Text>
                  </View>
                </View>
                <View style={[
                  styles.disputeStatusBadge,
                  dispute.status === "resolved" ? styles.resolvedBadge : styles.progressBadge
                ]}>
                  <Text style={[
                    styles.disputeStatusText,
                    dispute.status === "resolved" ? styles.resolvedText : styles.progressText
                  ]}>
                    {dispute.status === "resolved" ? "Resolved" : "In Progress"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noDisputes}>No issues or disputes</Text>
        )}
      </View>

      <View style={styles.faqSection}>
        <View style={styles.faqHeader}>
          <HelpCircle size={20} color={Colors.primary} />
          <Text style={styles.sectionTitle}>{serviceConfig.faqTitle}</Text>
        </View>
        <View style={styles.faqContainer}>
          {serviceConfig.faqItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.faqItem}
              onPress={() => setExpandedFaq(expandedFaq === index ? null : index)}
            >
              <View style={styles.faqQuestion}>
                <Text style={styles.faqQuestionText}>{item.question}</Text>
                <ChevronRight 
                  size={18} 
                  color={Colors.textSecondary} 
                  style={{ transform: [{ rotate: expandedFaq === index ? '90deg' : '0deg' }] }}
                />
              </View>
              {expandedFaq === index && (
                <Text style={styles.faqAnswer}>{item.answer}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.paymentSection}>
        <Text style={styles.sectionTitle}>Make a Payment</Text>
        <TouchableOpacity 
          style={styles.paypalButton}
          onPress={async () => {
            try {
              await Linking.openURL("https://www.paypal.com");
            } catch (_error) {
              Alert.alert("Error", "Unable to open PayPal. Please try again.");
            }
          }}
        >
          <View style={styles.paypalIcon}>
            <Text style={styles.paypalIconText}>P</Text>
          </View>
          <View style={styles.paypalInfo}>
            <Text style={styles.paypalTitle}>Pay with PayPal</Text>
            <Text style={styles.paypalSubtitle}>Fast and secure payments</Text>
          </View>
          <ChevronRight size={20} color={Colors.textTertiary} />
        </TouchableOpacity>
      </View>
    </>
  );

  const renderPortfolioTab = () => (
    <View style={styles.tabContentSection}>
      <Text style={styles.sectionTitle}>Portfolio Images</Text>
      {professional?.portfolioImages && professional.portfolioImages.length > 0 ? (
        <View style={styles.portfolioGrid}>
          {professional.portfolioImages.map((image, index) => (
            <View key={index} style={styles.portfolioImageContainer}>
              <Image source={{ uri: image }} style={styles.portfolioImage} contentFit="cover" />
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyPortfolio}>
          <ImageIcon size={48} color={Colors.textTertiary} />
          <Text style={styles.emptyPortfolioTitle}>No Portfolio Images</Text>
          <Text style={styles.emptyPortfolioText}>Add photos of your completed work to showcase your skills</Text>
          <TouchableOpacity style={[styles.addPortfolioButton, { backgroundColor: aboutMeColor }]}>
            <Plus size={18} color={Colors.white} />
            <Text style={styles.addPortfolioText}>Add Photos</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderNotificationsTab = () => (
    <View style={styles.tabContentSection}>
      <Text style={styles.sectionTitle}>Notification Preferences</Text>
      
      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>Email Notifications</Text>
          <Text style={styles.settingDescription}>Receive job updates via email</Text>
        </View>
        <View style={[styles.toggle, { backgroundColor: Colors.primary }]}>
          <View style={[styles.toggleKnob, styles.toggleKnobActive]} />
        </View>
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>Push Notifications</Text>
          <Text style={styles.settingDescription}>Get instant alerts on your device</Text>
        </View>
        <View style={[styles.toggle, { backgroundColor: Colors.primary }]}>
          <View style={[styles.toggleKnob, styles.toggleKnobActive]} />
        </View>
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>New Job Alerts</Text>
          <Text style={styles.settingDescription}>Get notified about new job opportunities</Text>
        </View>
        <View style={[styles.toggle, { backgroundColor: Colors.primary }]}>
          <View style={[styles.toggleKnob, styles.toggleKnobActive]} />
        </View>
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>Marketing Communications</Text>
          <Text style={styles.settingDescription}>Receive offers and updates</Text>
        </View>
        <View style={[styles.toggle, { backgroundColor: Colors.border }]}>
          <View style={styles.toggleKnob} />
        </View>
      </View>
    </View>
  );

  const renderBankTab = () => (
    <View style={styles.tabContentSection}>
      <View style={styles.bankHeader}>
        <View style={styles.bankIconContainer}>
          <Building2 size={24} color={Colors.primary} />
        </View>
        <View style={styles.bankHeaderText}>
          <Text style={styles.sectionTitle}>Bank Account</Text>
          <Text style={styles.bankSubtitle}>Add your bank details to receive payments</Text>
        </View>
      </View>

      <View style={styles.securityNotice}>
        <ShieldCheck size={16} color={Colors.success} />
        <Text style={styles.securityNoticeText}>Your bank information is encrypted and secure</Text>
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Bank Name</Text>
        <TextInput
          style={styles.bankInput}
          value={bankInfo.bankName}
          onChangeText={(text) => setBankInfo({ ...bankInfo, bankName: text })}
          placeholder="e.g. Chase, Bank of America"
          placeholderTextColor={Colors.textTertiary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Account Holder Name</Text>
        <TextInput
          style={styles.bankInput}
          value={bankInfo.accountHolder}
          onChangeText={(text) => setBankInfo({ ...bankInfo, accountHolder: text })}
          placeholder="Name as it appears on account"
          placeholderTextColor={Colors.textTertiary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Account Number</Text>
        <View style={styles.secureInputContainer}>
          <TextInput
            style={styles.secureInput}
            value={bankInfo.accountNumber}
            onChangeText={(text) => setBankInfo({ ...bankInfo, accountNumber: text.replace(/[^0-9]/g, "") })}
            placeholder="Enter account number"
            placeholderTextColor={Colors.textTertiary}
            keyboardType="number-pad"
            secureTextEntry={!showAccountNumber}
          />
          <TouchableOpacity 
            style={styles.eyeButton}
            onPress={() => setShowAccountNumber(!showAccountNumber)}
          >
            {showAccountNumber ? (
              <EyeOff size={20} color={Colors.textSecondary} />
            ) : (
              <Eye size={20} color={Colors.textSecondary} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Routing Number</Text>
        <View style={styles.secureInputContainer}>
          <TextInput
            style={styles.secureInput}
            value={bankInfo.routingNumber}
            onChangeText={(text) => setBankInfo({ ...bankInfo, routingNumber: text.replace(/[^0-9]/g, "") })}
            placeholder="9-digit routing number"
            placeholderTextColor={Colors.textTertiary}
            keyboardType="number-pad"
            maxLength={9}
            secureTextEntry={!showRoutingNumber}
          />
          <TouchableOpacity 
            style={styles.eyeButton}
            onPress={() => setShowRoutingNumber(!showRoutingNumber)}
          >
            {showRoutingNumber ? (
              <EyeOff size={20} color={Colors.textSecondary} />
            ) : (
              <Eye size={20} color={Colors.textSecondary} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Account Type</Text>
        <View style={styles.accountTypeContainer}>
          <TouchableOpacity
            style={[
              styles.accountTypeButton,
              bankInfo.accountType === "checking" && styles.accountTypeButtonActive,
            ]}
            onPress={() => setBankInfo({ ...bankInfo, accountType: "checking" })}
          >
            <Text
              style={[
                styles.accountTypeText,
                bankInfo.accountType === "checking" && styles.accountTypeTextActive,
              ]}
            >
              Checking
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.accountTypeButton,
              bankInfo.accountType === "savings" && styles.accountTypeButtonActive,
            ]}
            onPress={() => setBankInfo({ ...bankInfo, accountType: "savings" })}
          >
            <Text
              style={[
                styles.accountTypeText,
                bankInfo.accountType === "savings" && styles.accountTypeTextActive,
              ]}
            >
              Savings
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.saveBankButton}
        onPress={() => Alert.alert("Success", "Bank information saved successfully!")}
      >
        <Text style={styles.saveBankButtonText}>Save Bank Information</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTermsTab = () => (
    <View style={styles.tabContentSection}>
      <Text style={styles.sectionTitle}>Legal Documents</Text>
      
      <TouchableOpacity style={styles.legalItem} onPress={() => Alert.alert("Terms of Service", "Opening Terms of Service...")}>
        <View style={styles.legalIcon}>
          <FileText size={20} color={Colors.primary} />
        </View>
        <View style={styles.legalContent}>
          <Text style={styles.legalTitle}>Terms of Service</Text>
          <Text style={styles.legalSubtitle}>Last updated: January 15, 2026</Text>
        </View>
        <ChevronRight size={20} color={Colors.textTertiary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.legalItem} onPress={() => Alert.alert("Privacy Policy", "Opening Privacy Policy...")}>
        <View style={styles.legalIcon}>
          <Shield size={20} color={Colors.primary} />
        </View>
        <View style={styles.legalContent}>
          <Text style={styles.legalTitle}>Privacy Policy</Text>
          <Text style={styles.legalSubtitle}>How we handle your data</Text>
        </View>
        <ChevronRight size={20} color={Colors.textTertiary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.legalItem} onPress={() => Alert.alert("Contractor Agreement", "Opening Contractor Agreement...")}>
        <View style={styles.legalIcon}>
          <FileText size={20} color={Colors.primary} />
        </View>
        <View style={styles.legalContent}>
          <Text style={styles.legalTitle}>Professional Agreement</Text>
          <Text style={styles.legalSubtitle}>Service provider terms</Text>
        </View>
        <ChevronRight size={20} color={Colors.textTertiary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.legalItem} onPress={() => Alert.alert("Payment Terms", "Opening Payment Terms...")}>
        <View style={styles.legalIcon}>
          <CreditCard size={20} color={Colors.primary} />
        </View>
        <View style={styles.legalContent}>
          <Text style={styles.legalTitle}>Payment Terms</Text>
          <Text style={styles.legalSubtitle}>Billing and payment information</Text>
        </View>
        <ChevronRight size={20} color={Colors.textTertiary} />
      </TouchableOpacity>

      <View style={styles.supportSection}>
        <Text style={styles.supportTitle}>Need Help?</Text>
        <Text style={styles.supportText}>Contact our support team for any questions about our terms or policies.</Text>
        <TouchableOpacity 
          style={styles.supportButton}
          onPress={() => Alert.alert("Support", "Opening support chat...")}
        >
          <MessageSquare size={18} color={Colors.white} />
          <Text style={styles.supportButtonText}>Contact Support</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "Profile": return renderProfileTab();
      case "Portfolio": return renderPortfolioTab();
      case "Notifications": return renderNotificationsTab();
      case "Bank": return renderBankTab();
      case "Terms": return renderTermsTab();
      default: return renderProfileTab();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView edges={["top"]} style={[styles.safeArea, { backgroundColor: theme.surface }]}>
        <View style={[styles.header, { borderBottomColor: theme.borderLight }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>Profile</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Settings size={22} color={theme.text} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: professional?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200" }}
              style={styles.avatar}
              contentFit="cover"
            />
            {professional?.isVerified && (
              <View style={styles.verifiedBadge}>
                <BadgeCheck size={20} color={Colors.white} />
              </View>
            )}
            <TouchableOpacity 
              style={styles.editAvatarButton}
              onPress={() => {
                setEditingAvatar(professional?.avatar || "");
                setProfileData({
                  name: professional?.name || "",
                  email: professional?.email || "",
                  phone: professional?.phone || "",
                  bio: professional?.bio || "",
                  serviceArea: professional?.serviceArea || "",
                });
                setShowEditModal(true);
              }}
            >
              <Edit2 size={14} color={Colors.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{professional?.name || "Professional"}</Text>
          <Text style={styles.userType}>{typeInfo?.label || "Service Professional"}</Text>

          <View style={styles.ratingRow}>
            <Star size={16} color={Colors.accent} fill={Colors.accent} />
            <Text style={styles.ratingText}>
              {professional?.rating?.toFixed(1) || "4.8"} ({professional?.reviewCount || 0} reviews)
            </Text>
          </View>

          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Mail size={16} color={Colors.textSecondary} />
              <Text style={styles.contactText}>{professional?.email || "email@example.com"}</Text>
            </View>
            {professional?.phone && (
              <View style={styles.contactItem}>
                <Phone size={16} color={Colors.textSecondary} />
                <Text style={styles.contactText}>{professional.phone}</Text>
              </View>
            )}
            {professional?.serviceArea && (
              <View style={styles.contactItem}>
                <MapPin size={16} color={Colors.textSecondary} />
                <Text style={styles.contactText}>{professional.serviceArea}</Text>
              </View>
            )}
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{getStatValue(0)}</Text>
              <Text style={styles.statLabel}>{serviceConfig.statLabels.first}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{getStatValue(1)}</Text>
              <Text style={styles.statLabel}>{serviceConfig.statLabels.second}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{getStatValue(2)}</Text>
              <Text style={styles.statLabel}>{serviceConfig.statLabels.third}</Text>
            </View>
          </View>
        </View>

        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScrollContent}>
            {profileTabs.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {renderTabContent()}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Smart Flip v1.0.0</Text>

        <View style={{ height: Platform.OS === "ios" ? 100 : 80 }} />
      </ScrollView>

      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditModal(false)} style={styles.modalCloseButton}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.editAvatarSection}>
              <View style={styles.editAvatarContainer}>
                <Image
                  source={{ uri: editingAvatar || professional?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200" }}
                  style={styles.editAvatar}
                  contentFit="cover"
                />
                {isUploadingImage && (
                  <View style={styles.uploadingOverlay}>
                    <ActivityIndicator size="large" color={Colors.white} />
                  </View>
                )}
              </View>
              <TouchableOpacity 
                style={styles.changePhotoButton}
                onPress={showImagePickerOptions}
                disabled={isUploadingImage}
              >
                <Camera size={18} color={Colors.white} />
                <Text style={styles.changePhotoText}>Change Photo</Text>
              </TouchableOpacity>
              <Text style={styles.photoHint}>
                Upload your photo or company logo
              </Text>
            </View>

            <View style={styles.editFormSection}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name / Company Name</Text>
                <TextInput
                  style={styles.modalInput}
                  value={profileData.name}
                  onChangeText={(text) => setProfileData({ ...profileData, name: text })}
                  placeholder="Enter your name or company name"
                  placeholderTextColor={Colors.textTertiary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.modalInput}
                  value={profileData.email}
                  onChangeText={(text) => setProfileData({ ...profileData, email: text })}
                  placeholder="Enter your email"
                  placeholderTextColor={Colors.textTertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  style={styles.modalInput}
                  value={profileData.phone}
                  onChangeText={(text) => setProfileData({ ...profileData, phone: text })}
                  placeholder="Enter your phone"
                  placeholderTextColor={Colors.textTertiary}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Service Area</Text>
                <TextInput
                  style={styles.modalInput}
                  value={profileData.serviceArea}
                  onChangeText={(text) => setProfileData({ ...profileData, serviceArea: text })}
                  placeholder="e.g. Dallas-Fort Worth, TX"
                  placeholderTextColor={Colors.textTertiary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Bio</Text>
                <TextInput
                  style={[styles.modalInput, styles.bioInput]}
                  value={profileData.bio}
                  onChangeText={(text) => setProfileData({ ...profileData, bio: text })}
                  placeholder="Tell clients about yourself and your services..."
                  placeholderTextColor={Colors.textTertiary}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>

            <TouchableOpacity 
              style={styles.saveProfileButton} 
              onPress={handleSaveProfile}
            >
              <Text style={styles.saveProfileButtonText}>Save Changes</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: Platform.OS === "ios" ? 60 : 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  editAvatarSection: {
    alignItems: "center" as const,
    marginBottom: 24,
  },
  editAvatarContainer: {
    position: "relative" as const,
    marginBottom: 16,
  },
  editAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  uploadingOverlay: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 60,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  changePhotoButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  changePhotoText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  photoHint: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 12,
    textAlign: "center" as const,
  },
  editFormSection: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.text,
  },
  bioInput: {
    minHeight: 100,
    paddingTop: 14,
  },
  saveProfileButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center" as const,
  },
  saveProfileButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  editAvatarButton: {
    position: "absolute" as const,
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderWidth: 3,
    borderColor: Colors.surface,
  },
  safeArea: {
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  title: {
    fontSize: 28,
    fontWeight: "800" as const,
    color: Colors.text,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: Colors.surface,
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: Colors.surface,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  userType: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: "600" as const,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 16,
  },
  ratingText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  contactInfo: {
    gap: 8,
    marginBottom: 20,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: "100%",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  specialtiesSection: {
    backgroundColor: Colors.surface,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  specialtiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  specialtyChip: {
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  specialtyText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "500" as const,
  },
  ratingBreakdownSection: {
    backgroundColor: Colors.surface,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  ratingBreakdownContainer: {
    gap: 12,
  },
  ratingBreakdownItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
  },
  ratingBreakdownLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    flex: 1,
  },
  ratingBreakdownIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  ratingBreakdownLabel: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "500" as const,
  },
  ratingBreakdownRight: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    flex: 1,
    justifyContent: "flex-end" as const,
  },
  ratingBar: {
    width: 80,
    height: 6,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 3,
    overflow: "hidden" as const,
  },
  ratingBarFill: {
    height: "100%" as const,
    backgroundColor: Colors.accent,
    borderRadius: 3,
  },
  ratingBreakdownValue: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.text,
    width: 30,
    textAlign: "right" as const,
  },
  disclosureSection: {
    backgroundColor: Colors.surface,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  disclosureHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    marginBottom: 12,
  },
  disclosureContainer: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    overflow: "hidden" as const,
  },
  disclosureItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  disclosureLeft: {
    flex: 1,
  },
  disclosureLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  disclosureValue: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  disclosedBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  disclosedText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.success,
  },
  disputeSection: {
    backgroundColor: Colors.surface,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  disputeHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginBottom: 12,
  },
  reportButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    backgroundColor: Colors.warning,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  reportButtonText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  disputeList: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    overflow: "hidden" as const,
  },
  disputeItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  disputeLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
  },
  disputeTitle: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.text,
  },
  disputeDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  disputeStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  resolvedBadge: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
  },
  progressBadge: {
    backgroundColor: "rgba(245, 158, 11, 0.1)",
  },
  disputeStatusText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  resolvedText: {
    color: Colors.success,
  },
  progressText: {
    color: Colors.warning,
  },
  noDisputes: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center" as const,
    paddingVertical: 20,
  },
  faqSection: {
    backgroundColor: Colors.surface,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  faqHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    marginBottom: 12,
  },
  faqContainer: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    overflow: "hidden" as const,
  },
  faqItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  faqQuestion: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
  },
  faqQuestionText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    flex: 1,
    paddingRight: 10,
  },
  faqAnswer: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 10,
    lineHeight: 20,
  },
  menuSection: {
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  menuSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  badge: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    gap: 8,
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.error,
  },
  version: {
    textAlign: "center",
    fontSize: 13,
    color: Colors.textTertiary,
    marginBottom: 32,
  },
  paymentSection: {
    backgroundColor: Colors.surface,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  paypalButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 14,
  },
  paypalIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#0070BA",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  paypalIconText: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  paypalInfo: {
    flex: 1,
    marginLeft: 12,
  },
  paypalTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  paypalSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  bioSection: {
    backgroundColor: Colors.surface,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  bioHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    marginBottom: 12,
  },
  bioCard: {
    backgroundColor: "#FFF7ED",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E8E9EE",
  },
  bioText: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.text,
    marginBottom: 16,
  },
  bioHighlights: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 12,
  },
  bioHighlightItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  bioHighlightText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#9A3412",
  },
  painterSpecialtyChip: {
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FDBA74",
  },
  painterSpecialtyText: {
    color: "#C2410C",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  tabsContainer: {
    backgroundColor: Colors.surface,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  tabsScrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surfaceSecondary,
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.white,
  },
  tabContentSection: {
    backgroundColor: Colors.surface,
    marginTop: 12,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  portfolioGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 12,
  },
  portfolioImageContainer: {
    width: "31%" as const,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden" as const,
  },
  portfolioImage: {
    width: "100%" as const,
    height: "100%" as const,
  },
  emptyPortfolio: {
    alignItems: "center" as const,
    paddingVertical: 40,
  },
  emptyPortfolioTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.text,
    marginTop: 16,
  },
  emptyPortfolioText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: "center" as const,
  },
  addPortfolioButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 20,
  },
  addPortfolioText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  settingItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: Colors.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: "center" as const,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.white,
  },
  toggleKnobActive: {
    alignSelf: "flex-end" as const,
  },
  bankHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 16,
    gap: 12,
  },
  bankIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  bankHeaderText: {
    flex: 1,
  },
  bankSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  securityNotice: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 20,
    gap: 8,
  },
  securityNoticeText: {
    fontSize: 13,
    color: Colors.success,
    flex: 1,
  },
  bankInput: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.text,
  },
  secureInputContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
  },
  secureInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.text,
  },
  eyeButton: {
    padding: 12,
  },
  accountTypeContainer: {
    flexDirection: "row" as const,
    gap: 12,
  },
  accountTypeButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center" as const,
    borderWidth: 2,
    borderColor: "transparent",
  },
  accountTypeButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  accountTypeText: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: Colors.textSecondary,
  },
  accountTypeTextActive: {
    color: Colors.primary,
  },
  saveBankButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center" as const,
    marginTop: 8,
  },
  saveBankButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  legalItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  legalIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginRight: 12,
  },
  legalContent: {
    flex: 1,
  },
  legalTitle: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: Colors.text,
  },
  legalSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  supportSection: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    alignItems: "center" as const,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  supportText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center" as const,
    marginBottom: 16,
  },
  supportButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  supportButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.white,
  },
});
