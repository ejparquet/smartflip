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
  Linking,
  Alert,
} from "react-native";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import {
  Search,
  Plus,
  FileText,
  DollarSign,
  Calendar,
  Clock,
  X,
  Send,
  Download,
  MoreVertical,
  Check,
  AlertCircle,
  Copy,
  Trash2,
  Eye,
  Edit3,
  Printer,
  Mail,
  CreditCard,
  Wallet,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";

interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  clientAvatar: string;
  projectName: string;
  status: "draft" | "sent" | "viewed" | "paid" | "overdue";
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  paymentTerms: string;
}

const mockInvoices: Invoice[] = [
  {
    id: "inv-1",
    invoiceNumber: "INV-2026-001",
    clientName: "Sarah Mitchell",
    clientEmail: "sarah.mitchell@email.com",
    clientAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    projectName: "Westlake Modern Refresh",
    status: "paid",
    issueDate: "2026-01-15",
    dueDate: "2026-01-30",
    paidDate: "2026-01-28",
    lineItems: [
      { id: "li-1", description: "Design Consultation - Initial Meeting", quantity: 2, rate: 250, amount: 500 },
      { id: "li-2", description: "Living Room Design Package", quantity: 1, rate: 3500, amount: 3500 },
      { id: "li-3", description: "3D Renderings", quantity: 3, rate: 400, amount: 1200 },
      { id: "li-4", description: "Project Management Fee", quantity: 1, rate: 1500, amount: 1500 },
    ],
    subtotal: 6700,
    tax: 0,
    total: 6700,
    notes: "Thank you for choosing our design services!",
    paymentTerms: "Net 15",
  },
  {
    id: "inv-2",
    invoiceNumber: "INV-2026-002",
    clientName: "Michael Chen",
    clientEmail: "michael.chen@email.com",
    clientAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    projectName: "Downtown Condo Staging",
    status: "sent",
    issueDate: "2026-01-20",
    dueDate: "2026-02-04",
    lineItems: [
      { id: "li-5", description: "Staging Consultation", quantity: 1, rate: 350, amount: 350 },
      { id: "li-6", description: "Staging Design Package", quantity: 1, rate: 2800, amount: 2800 },
      { id: "li-7", description: "Furniture Rental Coordination", quantity: 1, rate: 500, amount: 500 },
    ],
    subtotal: 3650,
    tax: 0,
    total: 3650,
    paymentTerms: "Net 15",
  },
  {
    id: "inv-3",
    invoiceNumber: "INV-2026-003",
    clientName: "Emily Rodriguez",
    clientEmail: "emily.rodriguez@email.com",
    clientAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
    projectName: "Lakeway Kitchen & Bath",
    status: "overdue",
    issueDate: "2026-01-05",
    dueDate: "2026-01-20",
    lineItems: [
      { id: "li-8", description: "Kitchen Design Package", quantity: 1, rate: 4500, amount: 4500 },
      { id: "li-9", description: "Primary Bath Design", quantity: 1, rate: 2500, amount: 2500 },
      { id: "li-10", description: "Material Selection & Sourcing", quantity: 8, rate: 150, amount: 1200 },
    ],
    subtotal: 8200,
    tax: 0,
    total: 8200,
    paymentTerms: "Net 15",
  },
  {
    id: "inv-4",
    invoiceNumber: "INV-2026-004",
    clientName: "David Kim",
    clientEmail: "david.kim@email.com",
    clientAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
    projectName: "Mueller Home Office",
    status: "draft",
    issueDate: "2026-01-26",
    dueDate: "2026-02-10",
    lineItems: [
      { id: "li-11", description: "Home Office Design Consultation", quantity: 1, rate: 350, amount: 350 },
      { id: "li-12", description: "Space Planning & Layout", quantity: 1, rate: 800, amount: 800 },
    ],
    subtotal: 1150,
    tax: 0,
    total: 1150,
    paymentTerms: "Net 15",
  },
];

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
  draft: { label: "Draft", color: "#6B7280", bgColor: "#F3F4F6", icon: Edit3 },
  sent: { label: "Sent", color: "#3B82F6", bgColor: "#DBEAFE", icon: Send },
  viewed: { label: "Viewed", color: "#8B5CF6", bgColor: "#EDE9FE", icon: Eye },
  paid: { label: "Paid", color: "#10B981", bgColor: "#D1FAE5", icon: Check },
  overdue: { label: "Overdue", color: "#EF4444", bgColor: "#FEE2E2", icon: AlertCircle },
};

type FilterStatus = "all" | "draft" | "sent" | "viewed" | "paid" | "overdue";

export default function DesignInvoicingScreen() {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<FilterStatus>("all");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);

  const filteredInvoices = mockInvoices.filter((invoice) => {
    const matchesSearch = invoice.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.projectName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === "all" || invoice.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: mockInvoices.reduce((sum, inv) => sum + inv.total, 0),
    paid: mockInvoices.filter(inv => inv.status === "paid").reduce((sum, inv) => sum + inv.total, 0),
    pending: mockInvoices.filter(inv => ["sent", "viewed"].includes(inv.status)).reduce((sum, inv) => sum + inv.total, 0),
    overdue: mockInvoices.filter(inv => inv.status === "overdue").reduce((sum, inv) => sum + inv.total, 0),
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
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

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const handlePayWithPayPal = async (invoice: Invoice) => {
    const paypalUrl = `https://www.paypal.com/paypalme/YourPayPalUsername/${invoice.total}`;
    
    try {
      const supported = await Linking.canOpenURL(paypalUrl);
      if (supported) {
        await Linking.openURL(paypalUrl);
      } else {
        await Linking.openURL("https://www.paypal.com");
      }
    } catch (error) {
      Alert.alert(
        "Unable to Open PayPal",
        "Please visit paypal.com to complete your payment.",
        [{ text: "OK" }]
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: "Invoicing",
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
            placeholder="Search invoices..."
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
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Stats Overview */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
            <View style={[styles.statIcon, { backgroundColor: "#EDE9FE" }]}>
              <DollarSign size={18} color="#8B5CF6" strokeWidth={2} />
            </View>
            <Text style={[styles.statValue, { color: theme.text }]}>{formatCurrency(stats.total)}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Billed</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
            <View style={[styles.statIcon, { backgroundColor: "#D1FAE5" }]}>
              <Check size={18} color="#10B981" strokeWidth={2} />
            </View>
            <Text style={[styles.statValue, { color: "#10B981" }]}>{formatCurrency(stats.paid)}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Collected</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
            <View style={[styles.statIcon, { backgroundColor: "#E8E9EE" }]}>
              <Clock size={18} color="#272D53" strokeWidth={2} />
            </View>
            <Text style={[styles.statValue, { color: "#272D53" }]}>{formatCurrency(stats.pending)}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Pending</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
            <View style={[styles.statIcon, { backgroundColor: "#FEE2E2" }]}>
              <AlertCircle size={18} color="#EF4444" strokeWidth={2} />
            </View>
            <Text style={[styles.statValue, { color: "#EF4444" }]}>{formatCurrency(stats.overdue)}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Overdue</Text>
          </View>
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContainer}
        >
          {(["all", "draft", "sent", "viewed", "paid", "overdue"] as FilterStatus[]).map((filter) => (
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

        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          {filteredInvoices.length} Invoice{filteredInvoices.length !== 1 ? "s" : ""}
        </Text>

        {filteredInvoices.map((invoice) => {
          const StatusIcon = statusConfig[invoice.status].icon;
          const daysUntilDue = getDaysUntilDue(invoice.dueDate);
          
          return (
            <TouchableOpacity
              key={invoice.id}
              style={[styles.invoiceCard, { backgroundColor: theme.surface }]}
              onPress={() => setSelectedInvoice(invoice)}
              activeOpacity={0.8}
            >
              <View style={styles.invoiceHeader}>
                <Image
                  source={{ uri: invoice.clientAvatar }}
                  style={styles.clientAvatar}
                  contentFit="cover"
                />
                <View style={styles.invoiceInfo}>
                  <Text style={[styles.invoiceNumber, { color: "#EC4899" }]}>{invoice.invoiceNumber}</Text>
                  <Text style={[styles.clientName, { color: theme.text }]}>{invoice.clientName}</Text>
                  <Text style={[styles.projectName, { color: theme.textSecondary }]} numberOfLines={1}>
                    {invoice.projectName}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.moreButton}
                  onPress={() => {
                    setSelectedInvoice(invoice);
                    setShowActionModal(true);
                  }}
                >
                  <MoreVertical size={20} color={theme.textSecondary} strokeWidth={1.5} />
                </TouchableOpacity>
              </View>

              <View style={styles.invoiceMeta}>
                <View style={[styles.statusBadge, { backgroundColor: statusConfig[invoice.status].bgColor }]}>
                  <StatusIcon size={14} color={statusConfig[invoice.status].color} strokeWidth={2} />
                  <Text style={[styles.statusText, { color: statusConfig[invoice.status].color }]}>
                    {statusConfig[invoice.status].label}
                  </Text>
                </View>
                
                {invoice.status !== "paid" && invoice.status !== "draft" && (
                  <View style={styles.dueInfo}>
                    <Calendar size={14} color={theme.textTertiary} strokeWidth={1.5} />
                    <Text style={[
                      styles.dueText,
                      { color: daysUntilDue < 0 ? "#EF4444" : daysUntilDue <= 3 ? "#272D53" : theme.textSecondary }
                    ]}>
                      {daysUntilDue < 0
                        ? `${Math.abs(daysUntilDue)} days overdue`
                        : daysUntilDue === 0
                        ? "Due today"
                        : `Due in ${daysUntilDue} days`
                      }
                    </Text>
                  </View>
                )}
                
                {invoice.status === "paid" && invoice.paidDate && (
                  <View style={styles.dueInfo}>
                    <Check size={14} color="#10B981" strokeWidth={2} />
                    <Text style={[styles.dueText, { color: "#10B981" }]}>
                      Paid {formatDate(invoice.paidDate)}
                    </Text>
                  </View>
                )}
              </View>

              <View style={[styles.invoiceFooter, { borderTopColor: theme.borderLight }]}>
                <View style={styles.dateInfo}>
                  <Text style={[styles.dateLabel, { color: theme.textTertiary }]}>Issued</Text>
                  <Text style={[styles.dateValue, { color: theme.textSecondary }]}>
                    {formatDate(invoice.issueDate)}
                  </Text>
                </View>
                <Text style={[styles.invoiceTotal, { color: theme.text }]}>
                  {formatCurrency(invoice.total)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {filteredInvoices.length === 0 && (
          <View style={styles.emptyState}>
            <FileText size={48} color={theme.textTertiary} strokeWidth={1.5} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No Invoices Found</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              {searchQuery ? "Try a different search" : "Create your first invoice"}
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Invoice Detail Modal */}
      <Modal
        visible={!!selectedInvoice && !showActionModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedInvoice(null)}
      >
        {selectedInvoice && (
          <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <TouchableOpacity onPress={() => setSelectedInvoice(null)}>
                <X size={24} color={theme.text} strokeWidth={1.5} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Invoice Details</Text>
              <TouchableOpacity onPress={() => setShowActionModal(true)}>
                <MoreVertical size={24} color={theme.text} strokeWidth={1.5} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={[styles.invoiceHeaderSection, { backgroundColor: theme.surface }]}>
                <Text style={[styles.invoiceNumberLarge, { color: "#EC4899" }]}>
                  {selectedInvoice.invoiceNumber}
                </Text>
                <View style={[
                  styles.statusBadgeLarge,
                  { backgroundColor: statusConfig[selectedInvoice.status].bgColor }
                ]}>
                  {React.createElement(statusConfig[selectedInvoice.status].icon, {
                    size: 16,
                    color: statusConfig[selectedInvoice.status].color,
                    strokeWidth: 2,
                  })}
                  <Text style={[styles.statusTextLarge, { color: statusConfig[selectedInvoice.status].color }]}>
                    {statusConfig[selectedInvoice.status].label}
                  </Text>
                </View>
              </View>

              <View style={[styles.clientSection, { backgroundColor: theme.surface }]}>
                <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Bill To</Text>
                <View style={styles.clientRow}>
                  <Image
                    source={{ uri: selectedInvoice.clientAvatar }}
                    style={styles.modalClientAvatar}
                    contentFit="cover"
                  />
                  <View style={styles.clientDetails}>
                    <Text style={[styles.modalClientName, { color: theme.text }]}>
                      {selectedInvoice.clientName}
                    </Text>
                    <Text style={[styles.modalClientEmail, { color: theme.textSecondary }]}>
                      {selectedInvoice.clientEmail}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.modalProjectName, { color: theme.text }]}>
                  {selectedInvoice.projectName}
                </Text>
              </View>

              <View style={[styles.datesSection, { backgroundColor: theme.surface }]}>
                <View style={styles.dateItem}>
                  <Text style={[styles.dateLabelModal, { color: theme.textSecondary }]}>Issue Date</Text>
                  <Text style={[styles.dateValueModal, { color: theme.text }]}>
                    {formatDate(selectedInvoice.issueDate)}
                  </Text>
                </View>
                <View style={styles.dateItem}>
                  <Text style={[styles.dateLabelModal, { color: theme.textSecondary }]}>Due Date</Text>
                  <Text style={[styles.dateValueModal, { color: theme.text }]}>
                    {formatDate(selectedInvoice.dueDate)}
                  </Text>
                </View>
                <View style={styles.dateItem}>
                  <Text style={[styles.dateLabelModal, { color: theme.textSecondary }]}>Terms</Text>
                  <Text style={[styles.dateValueModal, { color: theme.text }]}>
                    {selectedInvoice.paymentTerms}
                  </Text>
                </View>
              </View>

              <View style={[styles.lineItemsSection, { backgroundColor: theme.surface }]}>
                <Text style={[styles.lineItemsTitle, { color: theme.text }]}>Line Items</Text>
                {selectedInvoice.lineItems.map((item, index) => (
                  <View
                    key={item.id}
                    style={[
                      styles.lineItem,
                      index < selectedInvoice.lineItems.length - 1 && {
                        borderBottomWidth: 1,
                        borderBottomColor: theme.borderLight,
                      },
                    ]}
                  >
                    <View style={styles.lineItemMain}>
                      <Text style={[styles.lineItemDesc, { color: theme.text }]}>{item.description}</Text>
                      <Text style={[styles.lineItemQty, { color: theme.textSecondary }]}>
                        {item.quantity} × {formatCurrency(item.rate)}
                      </Text>
                    </View>
                    <Text style={[styles.lineItemAmount, { color: theme.text }]}>
                      {formatCurrency(item.amount)}
                    </Text>
                  </View>
                ))}
                
                <View style={[styles.totalsSection, { borderTopColor: theme.border }]}>
                  <View style={styles.totalRow}>
                    <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>Subtotal</Text>
                    <Text style={[styles.totalValue, { color: theme.text }]}>
                      {formatCurrency(selectedInvoice.subtotal)}
                    </Text>
                  </View>
                  {selectedInvoice.tax > 0 && (
                    <View style={styles.totalRow}>
                      <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>Tax</Text>
                      <Text style={[styles.totalValue, { color: theme.text }]}>
                        {formatCurrency(selectedInvoice.tax)}
                      </Text>
                    </View>
                  )}
                  <View style={[styles.grandTotalRow, { borderTopColor: theme.borderLight }]}>
                    <Text style={[styles.grandTotalLabel, { color: theme.text }]}>Total</Text>
                    <Text style={styles.grandTotalValue}>{formatCurrency(selectedInvoice.total)}</Text>
                  </View>
                </View>
              </View>

              {selectedInvoice.notes && (
                <View style={[styles.notesSection, { backgroundColor: theme.surface }]}>
                  <Text style={[styles.notesTitle, { color: theme.text }]}>Notes</Text>
                  <Text style={[styles.notesText, { color: theme.textSecondary }]}>
                    {selectedInvoice.notes}
                  </Text>
                </View>
              )}

              <View style={styles.actionButtons}>
                {selectedInvoice.status === "draft" && (
                  <TouchableOpacity style={styles.sendButton}>
                    <Send size={18} color="#FFFFFF" strokeWidth={2} />
                    <Text style={styles.sendButtonText}>Send Invoice</Text>
                  </TouchableOpacity>
                )}
                {selectedInvoice.status === "sent" && (
                  <TouchableOpacity style={styles.sendButton}>
                    <Mail size={18} color="#FFFFFF" strokeWidth={2} />
                    <Text style={styles.sendButtonText}>Send Reminder</Text>
                  </TouchableOpacity>
                )}
                {selectedInvoice.status === "overdue" && (
                  <TouchableOpacity style={[styles.sendButton, { backgroundColor: "#EF4444" }]}>
                    <AlertCircle size={18} color="#FFFFFF" strokeWidth={2} />
                    <Text style={styles.sendButtonText}>Send Final Notice</Text>
                  </TouchableOpacity>
                )}
                {(selectedInvoice.status === "sent" || selectedInvoice.status === "viewed" || selectedInvoice.status === "overdue") && (
                  <>
                    <TouchableOpacity 
                      style={styles.paypalButton}
                      onPress={() => handlePayWithPayPal(selectedInvoice)}
                    >
                      <Wallet size={18} color="#FFFFFF" strokeWidth={2} />
                      <Text style={styles.paypalButtonText}>Pay with PayPal</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.markPaidButton, { borderColor: "#10B981" }]}>
                      <CreditCard size={18} color="#10B981" strokeWidth={2} />
                      <Text style={[styles.markPaidText, { color: "#10B981" }]}>Mark as Paid</Text>
                    </TouchableOpacity>
                  </>
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
              <Eye size={20} color={theme.text} strokeWidth={1.5} />
              <Text style={[styles.actionModalText, { color: theme.text }]}>Preview Invoice</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionModalItem}>
              <Edit3 size={20} color={theme.text} strokeWidth={1.5} />
              <Text style={[styles.actionModalText, { color: theme.text }]}>Edit Invoice</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionModalItem}>
              <Copy size={20} color={theme.text} strokeWidth={1.5} />
              <Text style={[styles.actionModalText, { color: theme.text }]}>Duplicate</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionModalItem}>
              <Download size={20} color={theme.text} strokeWidth={1.5} />
              <Text style={[styles.actionModalText, { color: theme.text }]}>Download PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionModalItem}>
              <Printer size={20} color={theme.text} strokeWidth={1.5} />
              <Text style={[styles.actionModalText, { color: theme.text }]}>Print</Text>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    width: "48%",
    padding: 14,
    borderRadius: 14,
    alignItems: "flex-start",
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800" as const,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
  },
  filterScroll: {
    marginBottom: 16,
    marginHorizontal: -20,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginBottom: 12,
  },
  invoiceCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  invoiceHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  clientAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  invoiceInfo: {
    flex: 1,
    marginLeft: 12,
  },
  invoiceNumber: {
    fontSize: 12,
    fontWeight: "600" as const,
    marginBottom: 2,
  },
  clientName: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  projectName: {
    fontSize: 13,
    marginTop: 2,
  },
  moreButton: {
    padding: 4,
  },
  invoiceMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 14,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  dueInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dueText: {
    fontSize: 12,
  },
  invoiceFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
  },
  dateInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateLabel: {
    fontSize: 11,
  },
  dateValue: {
    fontSize: 12,
  },
  invoiceTotal: {
    fontSize: 20,
    fontWeight: "700" as const,
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
  invoiceHeaderSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    margin: 20,
    marginBottom: 0,
    padding: 20,
    borderRadius: 16,
  },
  invoiceNumberLarge: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
  statusBadgeLarge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusTextLarge: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  clientSection: {
    margin: 20,
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
  },
  sectionLabel: {
    fontSize: 12,
    marginBottom: 12,
  },
  clientRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  modalClientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  clientDetails: {
    marginLeft: 12,
    flex: 1,
  },
  modalClientName: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  modalClientEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  modalProjectName: {
    fontSize: 14,
    fontWeight: "500" as const,
  },
  datesSection: {
    flexDirection: "row",
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
  },
  dateItem: {
    flex: 1,
    alignItems: "center",
  },
  dateLabelModal: {
    fontSize: 11,
    marginBottom: 4,
  },
  dateValueModal: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  lineItemsSection: {
    margin: 20,
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
  },
  lineItemsTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    marginBottom: 14,
  },
  lineItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 12,
  },
  lineItemMain: {
    flex: 1,
    marginRight: 12,
  },
  lineItemDesc: {
    fontSize: 14,
    fontWeight: "500" as const,
    marginBottom: 4,
  },
  lineItemQty: {
    fontSize: 12,
  },
  lineItemAmount: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  totalsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "500" as const,
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  grandTotalValue: {
    fontSize: 20,
    fontWeight: "800" as const,
    color: "#EC4899",
  },
  notesSection: {
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionButtons: {
    padding: 20,
    gap: 12,
  },
  sendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#EC4899",
    paddingVertical: 16,
    borderRadius: 14,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  markPaidButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 2,
  },
  markPaidText: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  paypalButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0070BA",
    paddingVertical: 16,
    borderRadius: 14,
  },
  paypalButtonText: {
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
