import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { Image } from "expo-image";
import {
  ArrowLeft,
  Building2,
  Plus,
  CheckCircle,
  Clock,
  DollarSign,
  Send,
  Shield,
  Link2,
  X,
  ChevronRight,
  Landmark,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import BackButton from "@/components/BackButton";

interface BankAccount {
  id: string;
  name: string;
  institution: string;
  institutionLogo: string;
  accountType: "checking" | "savings";
  lastFour: string;
  isDefault: boolean;
  balance: number;
}

interface PaymentHistory {
  id: string;
  type: "incoming" | "outgoing";
  amount: number;
  description: string;
  date: string;
  status: "completed" | "pending" | "failed";
  counterparty: string;
  counterpartyAvatar?: string;
}

const mockBankAccounts: BankAccount[] = [
  {
    id: "ba1",
    name: "Business Checking",
    institution: "Chase Bank",
    institutionLogo: "https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?w=200",
    accountType: "checking",
    lastFour: "4521",
    isDefault: true,
    balance: 45280.50,
  },
  {
    id: "ba2",
    name: "Operating Account",
    institution: "Bank of America",
    institutionLogo: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=200",
    accountType: "checking",
    lastFour: "8934",
    isDefault: false,
    balance: 12450.00,
  },
];

const mockPaymentHistory: PaymentHistory[] = [
  {
    id: "ph1",
    type: "incoming",
    amount: 15000,
    description: "Progress payment - Beacon Hill Renovation",
    date: "2026-01-26",
    status: "completed",
    counterparty: "Robert Sterling",
    counterpartyAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
  },
  {
    id: "ph2",
    type: "outgoing",
    amount: 4200,
    description: "Cabinet World - Kitchen Cabinets",
    date: "2026-01-25",
    status: "completed",
    counterparty: "Cabinet World",
  },
  {
    id: "ph3",
    type: "outgoing",
    amount: 1850,
    description: "Electrical Supply House - Materials",
    date: "2026-01-24",
    status: "completed",
    counterparty: "Electrical Supply House",
  },
  {
    id: "ph4",
    type: "incoming",
    amount: 8500,
    description: "Deposit - South End Condo Flip",
    date: "2026-01-22",
    status: "completed",
    counterparty: "Amanda Foster",
    counterpartyAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
  },
  {
    id: "ph5",
    type: "outgoing",
    amount: 2400,
    description: "Boston Flooring - Hardwood",
    date: "2026-01-20",
    status: "pending",
    counterparty: "Boston Flooring",
  },
];

const mockPendingPayments = [
  {
    id: "pp1",
    clientName: "Robert Sterling",
    clientAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
    projectName: "Beacon Hill Renovation",
    amount: 25000,
    dueDate: "Feb 1, 2026",
    type: "Midpoint Payment",
  },
  {
    id: "pp2",
    clientName: "Amanda Foster",
    clientAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    projectName: "South End Condo Flip",
    amount: 12000,
    dueDate: "Feb 5, 2026",
    type: "Progress Payment",
  },
];

type TabType = "overview" | "accounts" | "history";

export default function ContractorPaymentsScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [bankAccounts, setBankAccounts] = useState(mockBankAccounts);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [linkStep, setLinkStep] = useState<"select" | "credentials" | "accounts" | "success">("select");
  const [selectedInstitution, setSelectedInstitution] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentRecipient, setPaymentRecipient] = useState("");
  const [paymentDescription, setPaymentDescription] = useState("");
  const [selectedAccount] = useState<BankAccount | null>(bankAccounts[0] || null);

  const totalBalance = bankAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const pendingIncoming = mockPendingPayments.reduce((sum, p) => sum + p.amount, 0);

  const institutions = [
    { id: "chase", name: "Chase", logo: "https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?w=200" },
    { id: "bofa", name: "Bank of America", logo: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=200" },
    { id: "wells", name: "Wells Fargo", logo: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200" },
    { id: "citi", name: "Citibank", logo: "https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=200" },
    { id: "usbank", name: "US Bank", logo: "https://images.unsplash.com/photo-1556742393-d75f468bfcb0?w=200" },
    { id: "pnc", name: "PNC Bank", logo: "https://images.unsplash.com/photo-1556742031-c6961e8560b0?w=200" },
  ];

  const handleLinkAccount = () => {
    setLinkStep("select");
    setSelectedInstitution(null);
    setShowLinkModal(true);
  };

  const handleSelectInstitution = (institutionId: string) => {
    setSelectedInstitution(institutionId);
    setLinkStep("credentials");
  };

  const handleSubmitCredentials = () => {
    setIsLinking(true);
    setTimeout(() => {
      setIsLinking(false);
      setLinkStep("accounts");
    }, 2000);
  };

  const handleConfirmAccounts = () => {
    setLinkStep("success");
    const newAccount: BankAccount = {
      id: `ba${Date.now()}`,
      name: "New Checking",
      institution: institutions.find(i => i.id === selectedInstitution)?.name || "Bank",
      institutionLogo: institutions.find(i => i.id === selectedInstitution)?.logo || "",
      accountType: "checking",
      lastFour: String(Math.floor(1000 + Math.random() * 9000)),
      isDefault: false,
      balance: Math.floor(Math.random() * 50000) + 5000,
    };
    setBankAccounts(prev => [...prev, newAccount]);
    setTimeout(() => {
      setShowLinkModal(false);
    }, 2000);
  };

  const handleMakePayment = () => {
    if (!paymentAmount || !paymentRecipient) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }
    Alert.alert(
      "Confirm Payment",
      `Send $${parseFloat(paymentAmount).toLocaleString()} to ${paymentRecipient}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send Payment",
          onPress: () => {
            setShowPaymentModal(false);
            setPaymentAmount("");
            setPaymentRecipient("");
            setPaymentDescription("");
            Alert.alert("Success", "Payment initiated successfully!");
          },
        },
      ]
    );
  };

  const renderOverviewTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={[styles.balanceCard, { backgroundColor: isDark ? "#1E3A5F" : "#0369A1" }]}>
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Shield size={20} color="rgba(255,255,255,0.7)" />
        </View>
        <Text style={styles.balanceAmount}>${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</Text>
        <View style={styles.balanceStats}>
          <View style={styles.balanceStat}>
            <ArrowDownLeft size={14} color="#4ADE80" />
            <Text style={styles.balanceStatLabel}>Pending</Text>
            <Text style={styles.balanceStatValue}>${pendingIncoming.toLocaleString()}</Text>
          </View>
          <View style={styles.balanceStatDivider} />
          <View style={styles.balanceStat}>
            <Building2 size={14} color="rgba(255,255,255,0.7)" />
            <Text style={styles.balanceStatLabel}>Accounts</Text>
            <Text style={styles.balanceStatValue}>{bankAccounts.length}</Text>
          </View>
        </View>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.quickActionBtn, { backgroundColor: theme.surface }]}
          onPress={() => setShowPaymentModal(true)}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: "#DBEAFE" }]}>
            <Send size={20} color="#3B82F6" />
          </View>
          <Text style={[styles.quickActionText, { color: theme.text }]}>Make Payment</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickActionBtn, { backgroundColor: theme.surface }]}
          onPress={handleLinkAccount}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: "#DCFCE7" }]}>
            <Link2 size={20} color="#22C55E" />
          </View>
          <Text style={[styles.quickActionText, { color: theme.text }]}>Link Account</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>Pending Payments</Text>
      {mockPendingPayments.map((payment) => (
        <TouchableOpacity key={payment.id} style={[styles.pendingPaymentCard, { backgroundColor: theme.surface }]}>
          <Image source={{ uri: payment.clientAvatar }} style={styles.pendingPaymentAvatar} />
          <View style={styles.pendingPaymentInfo}>
            <Text style={[styles.pendingPaymentClient, { color: theme.text }]}>{payment.clientName}</Text>
            <Text style={[styles.pendingPaymentProject, { color: theme.textSecondary }]}>{payment.projectName}</Text>
            <View style={styles.pendingPaymentMeta}>
              <View style={[styles.paymentTypeBadge, { backgroundColor: "#DBEAFE" }]}>
                <Text style={styles.paymentTypeText}>{payment.type}</Text>
              </View>
              <Text style={[styles.pendingPaymentDue, { color: theme.textTertiary }]}>Due: {payment.dueDate}</Text>
            </View>
          </View>
          <View style={styles.pendingPaymentAmount}>
            <Text style={styles.pendingPaymentAmountText}>${payment.amount.toLocaleString()}</Text>
            <ChevronRight size={18} color={theme.textTertiary} />
          </View>
        </TouchableOpacity>
      ))}

      <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 24 }]}>Recent Activity</Text>
      {mockPaymentHistory.slice(0, 3).map((payment) => (
        <View key={payment.id} style={[styles.activityItem, { backgroundColor: theme.surface }]}>
          <View style={[
            styles.activityIcon,
            { backgroundColor: payment.type === "incoming" ? "#DCFCE7" : "#FEE2E2" }
          ]}>
            {payment.type === "incoming" ? (
              <ArrowDownLeft size={18} color="#22C55E" />
            ) : (
              <ArrowUpRight size={18} color="#EF4444" />
            )}
          </View>
          <View style={styles.activityInfo}>
            <Text style={[styles.activityDesc, { color: theme.text }]} numberOfLines={1}>{payment.description}</Text>
            <Text style={[styles.activityDate, { color: theme.textTertiary }]}>
              {new Date(payment.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </Text>
          </View>
          <Text style={[
            styles.activityAmount,
            { color: payment.type === "incoming" ? "#22C55E" : theme.text }
          ]}>
            {payment.type === "incoming" ? "+" : "-"}${payment.amount.toLocaleString()}
          </Text>
        </View>
      ))}

      <View style={{ height: 100 }} />
    </ScrollView>
  );

  const renderAccountsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={[styles.securityBanner, { backgroundColor: isDark ? "#1E3A5F" : "#EFF6FF" }]}>
        <Shield size={20} color="#3B82F6" />
        <View style={styles.securityBannerText}>
          <Text style={[styles.securityBannerTitle, { color: isDark ? "#93C5FD" : "#1E40AF" }]}>Bank-Level Security</Text>
          <Text style={[styles.securityBannerSubtitle, { color: isDark ? "#BFDBFE" : "#3B82F6" }]}>
            Your accounts are protected with 256-bit encryption
          </Text>
        </View>
      </View>

      <View style={styles.accountsHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Linked Accounts</Text>
        <TouchableOpacity style={styles.addAccountBtn} onPress={handleLinkAccount}>
          <Plus size={18} color="#3B82F6" />
          <Text style={styles.addAccountBtnText}>Add Account</Text>
        </TouchableOpacity>
      </View>

      {bankAccounts.map((account) => (
        <TouchableOpacity key={account.id} style={[styles.accountCard, { backgroundColor: theme.surface }]}>
          <Image source={{ uri: account.institutionLogo }} style={styles.accountLogo} />
          <View style={styles.accountInfo}>
            <View style={styles.accountNameRow}>
              <Text style={[styles.accountName, { color: theme.text }]}>{account.name}</Text>
              {account.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultBadgeText}>Default</Text>
                </View>
              )}
            </View>
            <Text style={[styles.accountInstitution, { color: theme.textSecondary }]}>{account.institution}</Text>
            <Text style={[styles.accountNumber, { color: theme.textTertiary }]}>
              {account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)} ••••{account.lastFour}
            </Text>
          </View>
          <View style={styles.accountBalance}>
            <Text style={[styles.accountBalanceAmount, { color: theme.text }]}>
              ${account.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </Text>
            <ChevronRight size={18} color={theme.textTertiary} />
          </View>
        </TouchableOpacity>
      ))}

      <View style={{ height: 100 }} />
    </ScrollView>
  );

  const renderHistoryTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Payment History</Text>
      
      {mockPaymentHistory.map((payment) => (
        <TouchableOpacity key={payment.id} style={[styles.historyCard, { backgroundColor: theme.surface }]}>
          <View style={[
            styles.historyIcon,
            { backgroundColor: payment.type === "incoming" ? "#DCFCE7" : "#FEE2E2" }
          ]}>
            {payment.type === "incoming" ? (
              <ArrowDownLeft size={20} color="#22C55E" />
            ) : (
              <ArrowUpRight size={20} color="#EF4444" />
            )}
          </View>
          <View style={styles.historyInfo}>
            <Text style={[styles.historyCounterparty, { color: theme.text }]}>{payment.counterparty}</Text>
            <Text style={[styles.historyDesc, { color: theme.textSecondary }]} numberOfLines={1}>
              {payment.description}
            </Text>
            <View style={styles.historyMeta}>
              <Text style={[styles.historyDate, { color: theme.textTertiary }]}>
                {new Date(payment.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </Text>
              <View style={[
                styles.historyStatusBadge,
                { backgroundColor: payment.status === "completed" ? "#DCFCE7" : payment.status === "pending" ? "#E8E9EE" : "#FEE2E2" }
              ]}>
                <Text style={[
                  styles.historyStatusText,
                  { color: payment.status === "completed" ? "#22C55E" : payment.status === "pending" ? "#272D53" : "#EF4444" }
                ]}>
                  {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                </Text>
              </View>
            </View>
          </View>
          <Text style={[
            styles.historyAmount,
            { color: payment.type === "incoming" ? "#22C55E" : theme.text }
          ]}>
            {payment.type === "incoming" ? "+" : "-"}${payment.amount.toLocaleString()}
          </Text>
        </TouchableOpacity>
      ))}

      <View style={{ height: 100 }} />
    </ScrollView>
  );

  const renderLinkModal = () => (
    <Modal
      visible={showLinkModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowLinkModal(false)}
    >
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
        <View style={[styles.modalHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => setShowLinkModal(false)}>
            <X size={24} color={theme.textSecondary} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: theme.text }]}>Link Bank Account</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.modalContent}>
          {linkStep === "select" && (
            <View style={styles.linkStepContainer}>
              <View style={[styles.plaidBanner, { backgroundColor: isDark ? "#1E3A5F" : "#F0FDF4" }]}>
                <Shield size={24} color="#22C55E" />
                <View style={styles.plaidBannerText}>
                  <Text style={[styles.plaidBannerTitle, { color: isDark ? "#4ADE80" : "#166534" }]}>
                    Secure Connection via Plaid
                  </Text>
                  <Text style={[styles.plaidBannerSubtitle, { color: isDark ? "#86EFAC" : "#22C55E" }]}>
                    Your credentials are encrypted and never stored
                  </Text>
                </View>
              </View>

              <Text style={[styles.linkSectionTitle, { color: theme.text }]}>Select Your Bank</Text>
              <View style={styles.institutionsGrid}>
                {institutions.map((inst) => (
                  <TouchableOpacity
                    key={inst.id}
                    style={[styles.institutionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                    onPress={() => handleSelectInstitution(inst.id)}
                  >
                    <Image source={{ uri: inst.logo }} style={styles.institutionLogo} />
                    <Text style={[styles.institutionName, { color: theme.text }]}>{inst.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {linkStep === "credentials" && (
            <View style={styles.linkStepContainer}>
              <View style={styles.credentialsHeader}>
                <Image
                  source={{ uri: institutions.find(i => i.id === selectedInstitution)?.logo }}
                  style={styles.selectedInstitutionLogo}
                />
                <Text style={[styles.credentialsTitle, { color: theme.text }]}>
                  Connect to {institutions.find(i => i.id === selectedInstitution)?.name}
                </Text>
              </View>

              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Username</Text>
              <TextInput
                style={[styles.credentialInput, { backgroundColor: theme.surfaceSecondary, color: theme.text, borderColor: theme.border }]}
                placeholder="Enter username"
                placeholderTextColor={theme.textTertiary}
              />

              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Password</Text>
              <TextInput
                style={[styles.credentialInput, { backgroundColor: theme.surfaceSecondary, color: theme.text, borderColor: theme.border }]}
                placeholder="Enter password"
                placeholderTextColor={theme.textTertiary}
                secureTextEntry
              />

              <TouchableOpacity
                style={[styles.linkSubmitBtn, isLinking && styles.linkSubmitBtnLoading]}
                onPress={handleSubmitCredentials}
                disabled={isLinking}
              >
                {isLinking ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.linkSubmitBtnText}>Connect Account</Text>
                )}
              </TouchableOpacity>

              <View style={styles.securityNote}>
                <Shield size={16} color={theme.textTertiary} />
                <Text style={[styles.securityNoteText, { color: theme.textTertiary }]}>
                  Your login credentials are encrypted and securely transmitted
                </Text>
              </View>
            </View>
          )}

          {linkStep === "accounts" && (
            <View style={styles.linkStepContainer}>
              <CheckCircle size={48} color="#22C55E" style={styles.successIcon} />
              <Text style={[styles.accountsFoundTitle, { color: theme.text }]}>Accounts Found</Text>
              <Text style={[styles.accountsFoundSubtitle, { color: theme.textSecondary }]}>
                Select the accounts you want to link
              </Text>

              <View style={[styles.foundAccountCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={[styles.foundAccountCheck, { backgroundColor: "#22C55E" }]}>
                  <CheckCircle size={16} color="#FFF" />
                </View>
                <View style={styles.foundAccountInfo}>
                  <Text style={[styles.foundAccountName, { color: theme.text }]}>Business Checking</Text>
                  <Text style={[styles.foundAccountNumber, { color: theme.textSecondary }]}>••••1234</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.linkSubmitBtn} onPress={handleConfirmAccounts}>
                <Text style={styles.linkSubmitBtnText}>Link Selected Accounts</Text>
              </TouchableOpacity>
            </View>
          )}

          {linkStep === "success" && (
            <View style={styles.linkStepContainer}>
              <View style={styles.successContainer}>
                <View style={styles.successIconWrapper}>
                  <CheckCircle size={64} color="#22C55E" />
                </View>
                <Text style={[styles.successTitle, { color: theme.text }]}>Account Linked!</Text>
                <Text style={[styles.successSubtitle, { color: theme.textSecondary }]}>
                  Your bank account has been successfully connected
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const renderPaymentModal = () => (
    <Modal
      visible={showPaymentModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowPaymentModal(false)}
    >
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
        <View style={[styles.modalHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
            <X size={24} color={theme.textSecondary} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: theme.text }]}>Make Payment</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.paymentForm}>
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>From Account</Text>
            <TouchableOpacity style={[styles.accountSelector, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Landmark size={20} color={theme.textSecondary} />
              <View style={styles.accountSelectorInfo}>
                <Text style={[styles.accountSelectorName, { color: theme.text }]}>
                  {selectedAccount?.name || "Select Account"}
                </Text>
                <Text style={[styles.accountSelectorBalance, { color: theme.textSecondary }]}>
                  Balance: ${selectedAccount?.balance.toLocaleString() || "0"}
                </Text>
              </View>
              <ChevronRight size={18} color={theme.textTertiary} />
            </TouchableOpacity>

            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Recipient</Text>
            <TextInput
              style={[styles.paymentInput, { backgroundColor: theme.surfaceSecondary, color: theme.text, borderColor: theme.border }]}
              placeholder="Enter name or email"
              placeholderTextColor={theme.textTertiary}
              value={paymentRecipient}
              onChangeText={setPaymentRecipient}
            />

            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Amount</Text>
            <View style={[styles.amountInputWrapper, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
              <DollarSign size={24} color="#22C55E" />
              <TextInput
                style={[styles.amountInput, { color: theme.text }]}
                placeholder="0.00"
                placeholderTextColor={theme.textTertiary}
                value={paymentAmount}
                onChangeText={setPaymentAmount}
                keyboardType="numeric"
              />
            </View>

            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Description (Optional)</Text>
            <TextInput
              style={[styles.paymentInput, styles.paymentInputMultiline, { backgroundColor: theme.surfaceSecondary, color: theme.text, borderColor: theme.border }]}
              placeholder="What's this payment for?"
              placeholderTextColor={theme.textTertiary}
              value={paymentDescription}
              onChangeText={setPaymentDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.sendPaymentBtn, (!paymentAmount || !paymentRecipient) && styles.sendPaymentBtnDisabled]}
              onPress={handleMakePayment}
              disabled={!paymentAmount || !paymentRecipient}
            >
              <Send size={20} color="#FFF" />
              <Text style={styles.sendPaymentBtnText}>Send Payment</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Payments",
          headerLeft: () => <BackButton />,
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerShadowVisible: false,
        }}
      />

      <View style={[styles.tabBar, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        {[
          { id: "overview" as const, label: "Overview", icon: Wallet },
          { id: "accounts" as const, label: "Accounts", icon: Building2 },
          { id: "history" as const, label: "History", icon: Clock },
        ].map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <TabIcon size={18} color={isActive ? "#3B82F6" : theme.textSecondary} />
              <Text style={[styles.tabText, { color: isActive ? "#3B82F6" : theme.textSecondary }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {activeTab === "overview" && renderOverviewTab()}
      {activeTab === "accounts" && renderAccountsTab()}
      {activeTab === "history" && renderHistoryTab()}

      {renderLinkModal()}
      {renderPaymentModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backButton: { marginLeft: 8 },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabButtonActive: { borderBottomColor: "#3B82F6" },
  tabText: { fontSize: 13, fontWeight: "600" as const },
  tabContent: { flex: 1, paddingHorizontal: 20 },
  balanceCard: {
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  balanceLabel: { fontSize: 14, color: "rgba(255,255,255,0.8)" },
  balanceAmount: { fontSize: 36, fontWeight: "800" as const, color: "#FFF", marginBottom: 16 },
  balanceStats: { flexDirection: "row", alignItems: "center" },
  balanceStat: { flex: 1, alignItems: "center", gap: 4 },
  balanceStatLabel: { fontSize: 12, color: "rgba(255,255,255,0.7)" },
  balanceStatValue: { fontSize: 16, fontWeight: "700" as const, color: "#FFF" },
  balanceStatDivider: { width: 1, height: 30, backgroundColor: "rgba(255,255,255,0.2)" },
  quickActions: { flexDirection: "row", gap: 12, marginTop: 20 },
  quickActionBtn: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionIcon: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  quickActionText: { fontSize: 14, fontWeight: "600" as const },
  sectionTitle: { fontSize: 18, fontWeight: "700" as const, marginTop: 24, marginBottom: 14 },
  pendingPaymentCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  pendingPaymentAvatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  pendingPaymentInfo: { flex: 1 },
  pendingPaymentClient: { fontSize: 15, fontWeight: "600" as const },
  pendingPaymentProject: { fontSize: 13, marginTop: 2 },
  pendingPaymentMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  paymentTypeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  paymentTypeText: { fontSize: 11, fontWeight: "600" as const, color: "#1D4ED8" },
  pendingPaymentDue: { fontSize: 12 },
  pendingPaymentAmount: { alignItems: "flex-end", flexDirection: "row", gap: 4 },
  pendingPaymentAmountText: { fontSize: 18, fontWeight: "700" as const, color: "#22C55E" },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  activityIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", marginRight: 12 },
  activityInfo: { flex: 1 },
  activityDesc: { fontSize: 14, fontWeight: "500" as const },
  activityDate: { fontSize: 12, marginTop: 2 },
  activityAmount: { fontSize: 15, fontWeight: "700" as const },
  securityBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    marginTop: 20,
  },
  securityBannerText: { flex: 1 },
  securityBannerTitle: { fontSize: 14, fontWeight: "600" as const },
  securityBannerSubtitle: { fontSize: 12, marginTop: 2 },
  accountsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 14,
  },
  addAccountBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  addAccountBtnText: { fontSize: 14, fontWeight: "600" as const, color: "#3B82F6" },
  accountCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  accountLogo: { width: 48, height: 48, borderRadius: 12, marginRight: 14 },
  accountInfo: { flex: 1 },
  accountNameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  accountName: { fontSize: 16, fontWeight: "600" as const },
  defaultBadge: { backgroundColor: "#DBEAFE", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  defaultBadgeText: { fontSize: 10, fontWeight: "600" as const, color: "#1D4ED8" },
  accountInstitution: { fontSize: 14, marginTop: 2 },
  accountNumber: { fontSize: 12, marginTop: 2 },
  accountBalance: { alignItems: "flex-end", flexDirection: "row", gap: 4 },
  accountBalanceAmount: { fontSize: 16, fontWeight: "700" as const },
  historyCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
  },
  historyIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", marginRight: 12 },
  historyInfo: { flex: 1 },
  historyCounterparty: { fontSize: 15, fontWeight: "600" as const },
  historyDesc: { fontSize: 13, marginTop: 2 },
  historyMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  historyDate: { fontSize: 12 },
  historyStatusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  historyStatusText: { fontSize: 10, fontWeight: "600" as const },
  historyAmount: { fontSize: 16, fontWeight: "700" as const },
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 17, fontWeight: "600" as const },
  modalContent: { flex: 1, padding: 20 },
  linkStepContainer: { paddingTop: 10 },
  plaidBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    marginBottom: 24,
  },
  plaidBannerText: { flex: 1 },
  plaidBannerTitle: { fontSize: 14, fontWeight: "600" as const },
  plaidBannerSubtitle: { fontSize: 12, marginTop: 2 },
  linkSectionTitle: { fontSize: 16, fontWeight: "600" as const, marginBottom: 16 },
  institutionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  institutionCard: {
    width: "47%",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  institutionLogo: { width: 48, height: 48, borderRadius: 12, marginBottom: 10 },
  institutionName: { fontSize: 14, fontWeight: "500" as const },
  credentialsHeader: { alignItems: "center", marginBottom: 24 },
  selectedInstitutionLogo: { width: 64, height: 64, borderRadius: 16, marginBottom: 12 },
  credentialsTitle: { fontSize: 18, fontWeight: "600" as const },
  inputLabel: { fontSize: 13, fontWeight: "500" as const, marginBottom: 8, marginTop: 16 },
  credentialInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
  },
  linkSubmitBtn: {
    backgroundColor: "#3B82F6",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 24,
  },
  linkSubmitBtnLoading: { opacity: 0.7 },
  linkSubmitBtnText: { fontSize: 16, fontWeight: "600" as const, color: "#FFF" },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
  },
  securityNoteText: { fontSize: 12 },
  successIcon: { alignSelf: "center", marginBottom: 16 },
  accountsFoundTitle: { fontSize: 22, fontWeight: "700" as const, textAlign: "center" as const },
  accountsFoundSubtitle: { fontSize: 14, textAlign: "center" as const, marginTop: 8, marginBottom: 24 },
  foundAccountCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 24,
  },
  foundAccountCheck: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", marginRight: 12 },
  foundAccountInfo: { flex: 1 },
  foundAccountName: { fontSize: 15, fontWeight: "600" as const },
  foundAccountNumber: { fontSize: 13, marginTop: 2 },
  successContainer: { alignItems: "center", paddingVertical: 40 },
  successIconWrapper: { marginBottom: 20 },
  successTitle: { fontSize: 24, fontWeight: "700" as const },
  successSubtitle: { fontSize: 15, marginTop: 8, textAlign: "center" as const },
  paymentForm: { paddingTop: 10 },
  accountSelector: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  accountSelectorInfo: { flex: 1 },
  accountSelectorName: { fontSize: 15, fontWeight: "600" as const },
  accountSelectorBalance: { fontSize: 13, marginTop: 2 },
  paymentInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
  },
  paymentInputMultiline: { minHeight: 80 },
  amountInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  amountInput: { flex: 1, fontSize: 28, fontWeight: "700" as const },
  sendPaymentBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#22C55E",
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 32,
    marginBottom: 40,
  },
  sendPaymentBtnDisabled: { opacity: 0.5 },
  sendPaymentBtnText: { fontSize: 16, fontWeight: "600" as const, color: "#FFF" },
});
