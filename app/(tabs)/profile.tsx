import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Platform,
  Modal,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Edit2,
  Building2,
  Eye,
  EyeOff,
  ShieldCheck,
  Moon,
  Sun,
  Smartphone,
  Camera,
  X,
  FileText,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";
import { useAuth } from "@/contexts/AuthContext";
import { useProjects } from "@/contexts/ProjectContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Professional } from "@/types";
import { professionalTypes } from "@/mocks/professionals";

type TabType = "Profile" | "Portfolio" | "Notifications" | "Bank" | "Terms";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, updateProfile } = useAuth();
  const { projects } = useProjects();
  const { theme, themeMode, setTheme } = useTheme();

  const getUserRoleLabel = () => {
    if (!user) return "User";
    if (user.role === "professional") {
      const professional = user as Professional;
      const typeInfo = professionalTypes.find((t) => t.type === professional.professionalType);
      return typeInfo?.label || "Professional";
    }
    return "Home Owner/Investor";
  };
  const [activeTab, setActiveTab] = useState<TabType>("Profile");
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
    name: user?.name || "Eric Parquet",
    email: user?.email || "",
    phone: user?.phone || "(512) 555-0123",
    address: "5817 Rendyn Ct, Midlothian, TX 76065",
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAvatar, setEditingAvatar] = useState(user?.avatar || "");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleSaveProfile = async () => {
    try {
      await updateProfile({
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
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
      "Choose how you want to add your photo",
      [
        { text: "Take Photo", onPress: () => pickImage(true) },
        { text: "Choose from Library", onPress: () => pickImage(false) },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const completedProjects = projects.filter((p) => p.status === "completed").length;
  const activeProjects = projects.filter((p) => p.status === "in_progress").length;

  const tabs: TabType[] = ["Profile", "Portfolio", "Notifications", "Bank", "Terms"];

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

  const renderProfileTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Personal Information</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={profileData.name}
          onChangeText={(text) => setProfileData({ ...profileData, name: text })}
          placeholder="Enter your name"
          placeholderTextColor={Colors.textTertiary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          style={styles.input}
          value={profileData.email}
          onChangeText={(text) => setProfileData({ ...profileData, email: text })}
          placeholder="Enter your email"
          placeholderTextColor={Colors.textTertiary}
          keyboardType="email-address"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={profileData.phone}
          onChangeText={(text) => setProfileData({ ...profileData, phone: text })}
          placeholder="Enter your phone"
          placeholderTextColor={Colors.textTertiary}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Address</Text>
        <TextInput
          style={styles.input}
          value={profileData.address}
          onChangeText={(text) => setProfileData({ ...profileData, address: text })}
          placeholder="Enter your address"
          placeholderTextColor={Colors.textTertiary}
        />
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderNotificationsTab = () => (
    <View style={[styles.tabContent, { backgroundColor: theme.surface }]}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Appearance</Text>
      
      <View style={styles.themeOptionsContainer}>
        <TouchableOpacity
          style={[
            styles.themeOption,
            { backgroundColor: theme.surfaceSecondary, borderColor: themeMode === 'light' ? theme.primary : theme.border },
          ]}
          onPress={() => setTheme('light')}
        >
          <View style={[styles.themeIconContainer, { backgroundColor: '#F7FAFC' }]}>
            <Sun size={20} color="#272D53" />
          </View>
          <Text style={[styles.themeOptionText, { color: theme.text }]}>Light</Text>
          {themeMode === 'light' && <View style={[styles.themeCheckmark, { backgroundColor: theme.primary }]} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.themeOption,
            { backgroundColor: theme.surfaceSecondary, borderColor: themeMode === 'dark' ? theme.primary : theme.border },
          ]}
          onPress={() => setTheme('dark')}
        >
          <View style={[styles.themeIconContainer, { backgroundColor: '#1A202C' }]}>
            <Moon size={20} color="#A0AEC0" />
          </View>
          <Text style={[styles.themeOptionText, { color: theme.text }]}>Dark</Text>
          {themeMode === 'dark' && <View style={[styles.themeCheckmark, { backgroundColor: theme.primary }]} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.themeOption,
            { backgroundColor: theme.surfaceSecondary, borderColor: themeMode === 'system' ? theme.primary : theme.border },
          ]}
          onPress={() => setTheme('system')}
        >
          <View style={[styles.themeIconContainer, { backgroundColor: theme.border }]}>
            <Smartphone size={20} color={theme.textSecondary} />
          </View>
          <Text style={[styles.themeOptionText, { color: theme.text }]}>System</Text>
          {themeMode === 'system' && <View style={[styles.themeCheckmark, { backgroundColor: theme.primary }]} />}
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 24 }]}>Notification Preferences</Text>
      
      <View style={[styles.settingItem, { borderBottomColor: theme.borderLight }]}>
        <View style={styles.settingInfo}>
          <Text style={[styles.settingTitle, { color: theme.text }]}>Email Notifications</Text>
          <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>Receive updates via email</Text>
        </View>
        <View style={[styles.toggle, { backgroundColor: theme.primary }]}>
          <View style={[styles.toggleKnob, styles.toggleKnobActive]} />
        </View>
      </View>

      <View style={[styles.settingItem, { borderBottomColor: theme.borderLight }]}>
        <View style={styles.settingInfo}>
          <Text style={[styles.settingTitle, { color: theme.text }]}>Push Notifications</Text>
          <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>Receive push notifications</Text>
        </View>
        <View style={[styles.toggle, { backgroundColor: theme.primary }]}>
          <View style={[styles.toggleKnob, styles.toggleKnobActive]} />
        </View>
      </View>

      <View style={[styles.settingItem, { borderBottomColor: theme.borderLight }]}>
        <View style={styles.settingInfo}>
          <Text style={[styles.settingTitle, { color: theme.text }]}>Marketing Communications</Text>
          <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>Receive offers and news</Text>
        </View>
        <View style={[styles.toggle, { backgroundColor: theme.border }]}>
          <View style={styles.toggleKnob} />
        </View>
      </View>
    </View>
  );

  const renderBankTab = () => (
    <View style={styles.tabContent}>
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
          style={styles.input}
          value={bankInfo.bankName}
          onChangeText={(text) => setBankInfo({ ...bankInfo, bankName: text })}
          placeholder="e.g. Chase, Bank of America"
          placeholderTextColor={Colors.textTertiary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Account Holder Name</Text>
        <TextInput
          style={styles.input}
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
        onPress={() => {
          Alert.alert("Success", "Bank information saved successfully!");
        }}
      >
        <Text style={styles.saveBankButtonText}>Save Bank Information</Text>
      </TouchableOpacity>

      {bankInfo.accountNumber.length > 0 && (
        <TouchableOpacity 
          style={styles.removeBankButton}
          onPress={() => {
            Alert.alert(
              "Remove Bank Account",
              "Are you sure you want to remove your bank account information?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Remove",
                  style: "destructive",
                  onPress: () => {
                    setBankInfo({
                      bankName: "",
                      accountHolder: "",
                      accountNumber: "",
                      routingNumber: "",
                      accountType: "checking",
                    });
                  },
                },
              ]
            );
          }}
        >
          <Text style={styles.removeBankButtonText}>Remove Bank Account</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderPortfolioTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>My Projects Portfolio</Text>
      {projects.length > 0 ? (
        <View style={styles.portfolioGrid}>
          {projects.slice(0, 6).map((project) => (
            <TouchableOpacity key={project.id} style={styles.portfolioItem}>
              <Image
                source={{ uri: project.coverImage || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400" }}
                style={styles.portfolioImage}
                contentFit="cover"
              />
              <View style={styles.portfolioOverlay}>
                <Text style={styles.portfolioTitle} numberOfLines={1}>{project.name}</Text>
                <Text style={styles.portfolioStatus}>{project.status.replace("_", " ")}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.emptyPortfolio}>
          <Building2 size={48} color={Colors.textTertiary} />
          <Text style={styles.emptyPortfolioTitle}>No Projects Yet</Text>
          <Text style={styles.emptyPortfolioText}>Start your first project to build your portfolio</Text>
        </View>
      )}
    </View>
  );

  const renderTermsTab = () => (
    <View style={styles.tabContent}>
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
          <ShieldCheck size={20} color={Colors.primary} />
        </View>
        <View style={styles.legalContent}>
          <Text style={styles.legalTitle}>Privacy Policy</Text>
          <Text style={styles.legalSubtitle}>How we handle your data</Text>
        </View>
        <ChevronRight size={20} color={Colors.textTertiary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.legalItem} onPress={() => Alert.alert("User Agreement", "Opening User Agreement...")}>
        <View style={styles.legalIcon}>
          <FileText size={20} color={Colors.primary} />
        </View>
        <View style={styles.legalContent}>
          <Text style={styles.legalTitle}>User Agreement</Text>
          <Text style={styles.legalSubtitle}>Platform usage terms</Text>
        </View>
        <ChevronRight size={20} color={Colors.textTertiary} />
      </TouchableOpacity>

      <View style={styles.supportSection}>
        <Text style={styles.supportTitle}>Need Help?</Text>
        <Text style={styles.supportText}>Contact our support team for any questions.</Text>
        <TouchableOpacity style={styles.supportButton}>
          <Text style={styles.supportButtonText}>Contact Support</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.deleteButton} onPress={handleLogout}>
        <LogOut size={18} color={Colors.error} />
        <Text style={styles.deleteButtonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "Profile":
        return renderProfileTab();
      case "Portfolio":
        return renderPortfolioTab();
      case "Notifications":
        return renderNotificationsTab();
      case "Bank":
        return renderBankTab();
      case "Terms":
        return renderTermsTab();
      default:
        return renderProfileTab();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView edges={["top"]} style={[styles.safeArea, { backgroundColor: theme.surface }]}>
        <View style={[styles.header, { borderBottomColor: theme.borderLight }]}>
          <BackButton />
          <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>
          <TouchableOpacity style={styles.notificationButton}>
            <Bell size={22} color={theme.text} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.profileSection, { backgroundColor: theme.surface }]}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: user?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200" }}
              style={styles.avatar}
              contentFit="cover"
            />
            <TouchableOpacity 
              style={[styles.editAvatarButton, { backgroundColor: theme.primary }]}
              onPress={() => {
                setEditingAvatar(user?.avatar || "");
                setShowEditModal(true);
              }}
            >
              <Edit2 size={14} color={theme.white} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.userName, { color: theme.text }]}>{user?.name || "Eric Parquet"}</Text>
          <Text style={[styles.userRole, { color: theme.primary }]}>{getUserRoleLabel()}</Text>
          <Text style={[styles.memberSince, { color: theme.textSecondary }]}>Member since January 2024</Text>

          <View style={[styles.statsContainer, { backgroundColor: theme.surfaceSecondary }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.text }]}>{projects.length}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Projects</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.text }]}>{activeProjects}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Active Projects</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.text }]}>{completedProjects}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Completed Flips</Text>
            </View>
          </View>
        </View>

        <View style={[styles.tabsContainer, { backgroundColor: theme.surface, borderBottomColor: theme.borderLight }]}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, { backgroundColor: theme.surfaceSecondary }, activeTab === tab && { backgroundColor: theme.primary }]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, { color: theme.textSecondary }, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {renderTabContent()}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={Colors.error} />
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: Platform.OS === "ios" ? 100 : 80 }} />
      </ScrollView>

      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.surface, borderBottomColor: theme.borderLight }]}>
            <TouchableOpacity onPress={() => setShowEditModal(false)} style={styles.modalCloseButton}>
              <X size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Profile</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.editAvatarSection}>
              <View style={styles.editAvatarContainer}>
                <Image
                  source={{ uri: editingAvatar || user?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200" }}
                  style={styles.editAvatar}
                  contentFit="cover"
                />
                {isUploadingImage && (
                  <View style={styles.uploadingOverlay}>
                    <ActivityIndicator size="large" color={theme.white} />
                  </View>
                )}
              </View>
              <TouchableOpacity 
                style={[styles.changePhotoButton, { backgroundColor: theme.primary }]}
                onPress={showImagePickerOptions}
                disabled={isUploadingImage}
              >
                <Camera size={18} color={theme.white} />
                <Text style={styles.changePhotoText}>Change Photo</Text>
              </TouchableOpacity>
              <Text style={[styles.photoHint, { color: theme.textSecondary }]}>
                Upload a photo of yourself or your company logo
              </Text>
            </View>

            <View style={[styles.editFormSection, { backgroundColor: theme.surface }]}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Full Name</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: theme.surfaceSecondary, color: theme.text }]}
                  value={profileData.name}
                  onChangeText={(text) => setProfileData({ ...profileData, name: text })}
                  placeholder="Enter your name"
                  placeholderTextColor={theme.textTertiary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Email</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: theme.surfaceSecondary, color: theme.text }]}
                  value={profileData.email}
                  onChangeText={(text) => setProfileData({ ...profileData, email: text })}
                  placeholder="Enter your email"
                  placeholderTextColor={theme.textTertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Phone Number</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: theme.surfaceSecondary, color: theme.text }]}
                  value={profileData.phone}
                  onChangeText={(text) => setProfileData({ ...profileData, phone: text })}
                  placeholder="Enter your phone"
                  placeholderTextColor={theme.textTertiary}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Address</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: theme.surfaceSecondary, color: theme.text }]}
                  value={profileData.address}
                  onChangeText={(text) => setProfileData({ ...profileData, address: text })}
                  placeholder="Enter your address"
                  placeholderTextColor={theme.textTertiary}
                />
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.saveProfileButton, { backgroundColor: theme.primary }]} 
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
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: Platform.OS === "ios" ? 60 : 16,
    borderBottomWidth: 1,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  editAvatarSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  editAvatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  editAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  changePhotoButton: {
    flexDirection: "row",
    alignItems: "center",
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
    marginTop: 12,
    textAlign: "center",
  },
  editFormSection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  modalInput: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
  },
  saveProfileButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveProfileButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  safeArea: {
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  notificationButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  profileSection: {
    backgroundColor: Colors.surface,
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.white,
  },
  userName: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600" as const,
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
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
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 8,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
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
  tabContent: {
    backgroundColor: Colors.surface,
    marginTop: 12,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 16,
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
  input: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.text,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  saveButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  newChangesButton: {
    flex: 1,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  newChangesButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
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
    backgroundColor: Colors.border,
    padding: 2,
    justifyContent: "center",
  },
  toggleActive: {
    backgroundColor: Colors.primary,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.white,
  },
  toggleKnobActive: {
    alignSelf: "flex-end",
  },
  updateButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  updateButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 24,
    paddingVertical: 14,
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.error,
  },
  subscriptionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  subscriptionInfo: {},
  subscriptionTitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  subscriptionPlan: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  proBadge: {
    backgroundColor: Colors.gold,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  proBadgeText: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  billingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  billingLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  billingValue: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.text,
  },
  manageButton: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
  },
  manageButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  paymentMethodCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  paymentMethodIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  paymentMethodInfo: {
    flex: 1,
    marginLeft: 12,
  },
  paymentMethodType: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: Colors.text,
  },
  paymentMethodExpiry: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  defaultBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  defaultBadgeText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  removePaymentButton: {
    padding: 8,
  },
  addPaymentButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: "dashed",
  },
  addPaymentButtonText: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: Colors.primary,
  },
  bankHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  bankIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
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
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "500" as const,
  },
  secureInputContainer: {
    flexDirection: "row",
    alignItems: "center",
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
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  accountTypeContainer: {
    flexDirection: "row",
    gap: 12,
  },
  accountTypeButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
  },
  accountTypeButtonActive: {
    backgroundColor: Colors.primary,
  },
  accountTypeText: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: Colors.textSecondary,
  },
  accountTypeTextActive: {
    color: Colors.white,
  },
  saveBankButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  saveBankButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  removeBankButton: {
    alignItems: "center",
    paddingVertical: 14,
    marginTop: 12,
  },
  removeBankButtonText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#F56565",
  },
  paypalPaymentButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
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
  themeOptionsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  themeOption: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    position: "relative" as const,
  },
  themeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  themeOptionText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  themeCheckmark: {
    position: "absolute" as const,
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  portfolioGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 12,
  },
  portfolioItem: {
    width: "48%" as const,
    aspectRatio: 1.2,
    borderRadius: 12,
    overflow: "hidden" as const,
    position: "relative" as const,
  },
  portfolioImage: {
    width: "100%" as const,
    height: "100%" as const,
  },
  portfolioOverlay: {
    position: "absolute" as const,
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  portfolioTitle: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  portfolioStatus: {
    fontSize: 11,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
    textTransform: "capitalize" as const,
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
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  supportButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  logoutButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 10,
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.error,
  },
});
