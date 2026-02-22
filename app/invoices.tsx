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
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Plus,
  X,
  Check,
  FileText,
  Send,
  Download,
  DollarSign,
  Calendar,
  User,
  MapPin,
  Trash2,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Wallet,
  CreditCard,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail?: string;
  projectName: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  status: "draft" | "sent" | "paid" | "overdue";
  notes?: string;
}

const mockInvoices: Invoice[] = [
  {
    id: "1",
    invoiceNumber: "INV-001",
    clientName: "John Anderson",
    clientEmail: "john@email.com",
    projectName: "Kitchen Renovation",
    date: "2025-01-20",
    dueDate: "2025-02-20",
    items: [
      { id: "1", description: "Labor - Drywall Installation", quantity: 16, rate: 75 },
      { id: "2", description: "Labor - Electrical Rough-in", quantity: 8, rate: 85 },
      { id: "3", description: "Materials", quantity: 1, rate: 2500 },
    ],
    status: "sent",
  },
  {
    id: "2",
    invoiceNumber: "INV-002",
    clientName: "Sarah Miller",
    projectName: "Bathroom Remodel",
    date: "2025-01-15",
    dueDate: "2025-02-15",
    items: [
      { id: "1", description: "Plumbing Work", quantity: 12, rate: 80 },
      { id: "2", description: "Tile Installation", quantity: 8, rate: 65 },
    ],
    status: "paid",
  },
  {
    id: "3",
    invoiceNumber: "INV-003",
    clientName: "Mike Thompson",
    projectName: "Deck Construction",
    date: "2025-01-01",
    dueDate: "2025-01-31",
    items: [
      { id: "1", description: "Deck Framing", quantity: 24, rate: 70 },
      { id: "2", description: "Materials - Lumber", quantity: 1, rate: 3200 },
    ],
    status: "overdue",
  },
];

const statusConfig = {
  draft: { label: "Draft", color: "#6B7280", icon: FileText },
  sent: { label: "Sent", color: "#3B82F6", icon: Send },
  paid: { label: "Paid", color: "#10B981", icon: CheckCircle2 },
  overdue: { label: "Overdue", color: "#EF4444", icon: AlertCircle },
};

export default function InvoicesScreen() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [newInvoice, setNewInvoice] = useState({
    clientName: "",
    clientEmail: "",
    projectName: "",
    dueDate: "",
    notes: "",
  });
  const [newItems, setNewItems] = useState<InvoiceItem[]>([
    { id: "1", description: "", quantity: 1, rate: 0 },
  ]);

  const filteredInvoices = invoices.filter((inv) => {
    if (filterStatus === "all") return true;
    return inv.status === filterStatus;
  });

  const calculateTotal = (items: InvoiceItem[]) => {
    return items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  };

  const generateInvoiceNumber = () => {
    const num = invoices.length + 1;
    return `INV-${num.toString().padStart(3, "0")}`;
  };

  const handleAddItem = () => {
    setNewItems([
      ...newItems,
      { id: Date.now().toString(), description: "", quantity: 1, rate: 0 },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (newItems.length === 1) return;
    setNewItems(newItems.filter((item) => item.id !== id));
  };

  const handleUpdateItem = (id: string, field: string, value: string | number) => {
    setNewItems(
      newItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleCreateInvoice = () => {
    if (!newInvoice.clientName || !newInvoice.projectName) {
      Alert.alert("Error", "Please fill in client name and project");
      return;
    }
    if (newItems.some((item) => !item.description)) {
      Alert.alert("Error", "Please fill in all item descriptions");
      return;
    }

    const invoice: Invoice = {
      id: Date.now().toString(),
      invoiceNumber: generateInvoiceNumber(),
      clientName: newInvoice.clientName,
      clientEmail: newInvoice.clientEmail,
      projectName: newInvoice.projectName,
      date: new Date().toISOString().split("T")[0],
      dueDate: newInvoice.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      items: newItems,
      status: "draft",
      notes: newInvoice.notes,
    };

    setInvoices([invoice, ...invoices]);
    setNewInvoice({ clientName: "", clientEmail: "", projectName: "", dueDate: "", notes: "" });
    setNewItems([{ id: "1", description: "", quantity: 1, rate: 0 }]);
    setShowAddModal(false);
  };

  const handleSendInvoice = (id: string) => {
    Alert.alert(
      "Send Invoice",
      "This will send the invoice to the client via email.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send",
          onPress: () => {
            setInvoices(
              invoices.map((inv) =>
                inv.id === id ? { ...inv, status: "sent" } : inv
              )
            );
            Alert.alert("Success", "Invoice sent successfully!");
          },
        },
      ]
    );
  };

  const handleMarkPaid = (id: string) => {
    setInvoices(
      invoices.map((inv) =>
        inv.id === id ? { ...inv, status: "paid" } : inv
      )
    );
  };

  const getTotalOutstanding = () => {
    return invoices
      .filter((inv) => inv.status === "sent" || inv.status === "overdue")
      .reduce((sum, inv) => sum + calculateTotal(inv.items), 0);
  };

  const getTotalPaid = () => {
    return invoices
      .filter((inv) => inv.status === "paid")
      .reduce((sum, inv) => sum + calculateTotal(inv.items), 0);
  };

  const [paypalUsername, setPaypalUsername] = useState("");
  const [showPaypalSetup, setShowPaypalSetup] = useState(false);

  const [isTestMode] = useState(true);

  const handlePayWithPayPal = async (invoice: Invoice) => {
    const total = calculateTotal(invoice.items);
    
    if (!paypalUsername) {
      Alert.alert(
        "PayPal Setup Required",
        isTestMode 
          ? "Test Mode: Enter any username to simulate PayPal payments. In production, you'll need a real PayPal.me account."
          : "Please configure your PayPal username to receive payments.",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Setup Now", 
            onPress: () => setShowPaypalSetup(true)
          },
        ]
      );
      return;
    }

    const paypalUrl = `https://www.paypal.com/paypalme/${paypalUsername}/${total}`;
    
    if (isTestMode) {
      Alert.alert(
        "🧪 Test Mode - PayPal Payment",
        `This is a simulated PayPal payment for ${total.toLocaleString()}.\n\nIn production, the client would be redirected to PayPal to complete the payment.\n\nPayPal.me Link: paypal.me/${paypalUsername}/${total}`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Simulate Success",
            onPress: () => {
              handleMarkPaid(invoice.id);
              setSelectedInvoice(null);
              Alert.alert("✅ Test Payment Complete", "Invoice has been marked as paid (simulated).");
            },
          },
          {
            text: "Simulate Failure",
            style: "destructive",
            onPress: () => {
              Alert.alert("Payment Failed", "The simulated payment was declined. Please try again or use a different payment method.");
            },
          },
        ]
      );
      return;
    }

    Alert.alert(
      "Open PayPal",
      `You will be redirected to PayPal to complete the payment of ${total.toLocaleString()}.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue to PayPal",
          onPress: async () => {
            try {
              const supported = await Linking.canOpenURL(paypalUrl);
              if (supported) {
                await Linking.openURL(paypalUrl);
                setTimeout(() => {
                  Alert.alert(
                    "Payment Confirmation",
                    "Did the client complete the PayPal payment?",
                    [
                      { text: "No", style: "cancel" },
                      {
                        text: "Yes, Mark Paid",
                        onPress: () => {
                          handleMarkPaid(invoice.id);
                          setSelectedInvoice(null);
                          Alert.alert("Success", "Invoice has been marked as paid.");
                        },
                      },
                    ]
                  );
                }, 3000);
              } else {
                await Linking.openURL("https://www.paypal.com");
              }
            } catch (error) {
              console.log("PayPal error:", error);
              Alert.alert(
                "Unable to Open PayPal",
                "Please visit paypal.com to complete your payment, or try again later.",
                [{ text: "OK" }]
              );
            }
          },
        },
      ]
    );
  };

  const handleSavePaypalUsername = () => {
    if (!paypalUsername.trim()) {
      Alert.alert("Error", "Please enter your PayPal.me username");
      return;
    }
    setShowPaypalSetup(false);
    Alert.alert("Success", "PayPal username saved. You can now receive payments via PayPal.");
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.headerTitle}>Invoices</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Plus size={24} color={Colors.navy} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Outstanding</Text>
            <Text style={styles.statValue}>${getTotalOutstanding().toLocaleString()}</Text>
          </View>
          <View style={[styles.statCard, styles.statCardPaid]}>
            <Text style={styles.statLabel}>Paid (Total)</Text>
            <Text style={[styles.statValue, styles.statValuePaid]}>
              ${getTotalPaid().toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {["all", "draft", "sent", "paid", "overdue"].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterChip,
                  filterStatus === status && styles.filterChipActive,
                ]}
                onPress={() => setFilterStatus(status)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterStatus === status && styles.filterChipTextActive,
                  ]}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredInvoices.map((invoice) => {
            const config = statusConfig[invoice.status];
            const StatusIcon = config.icon;
            const total = calculateTotal(invoice.items);

            return (
              <TouchableOpacity
                key={invoice.id}
                style={styles.invoiceCard}
                onPress={() => setSelectedInvoice(invoice)}
                activeOpacity={0.7}
              >
                <View style={styles.invoiceHeader}>
                  <View>
                    <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
                    <Text style={styles.clientName}>{invoice.clientName}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: `${config.color}15` },
                    ]}
                  >
                    <StatusIcon size={14} color={config.color} strokeWidth={2} />
                    <Text style={[styles.statusText, { color: config.color }]}>
                      {config.label}
                    </Text>
                  </View>
                </View>

                <View style={styles.invoiceMeta}>
                  <View style={styles.metaItem}>
                    <MapPin size={14} color="#6B7280" strokeWidth={1.5} />
                    <Text style={styles.metaText}>{invoice.projectName}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Calendar size={14} color="#6B7280" strokeWidth={1.5} />
                    <Text style={styles.metaText}>Due: {invoice.dueDate}</Text>
                  </View>
                </View>

                <View style={styles.invoiceFooter}>
                  <Text style={styles.invoiceTotal}>${total.toLocaleString()}</Text>
                  <View style={styles.invoiceActions}>
                    {invoice.status === "draft" && (
                      <TouchableOpacity
                        style={styles.sendButton}
                        onPress={() => handleSendInvoice(invoice.id)}
                      >
                        <Send size={16} color="#FFFFFF" strokeWidth={2} />
                        <Text style={styles.sendButtonText}>Send</Text>
                      </TouchableOpacity>
                    )}
                    {(invoice.status === "sent" || invoice.status === "overdue") && (
                      <TouchableOpacity
                        style={styles.paidButton}
                        onPress={() => handleMarkPaid(invoice.id)}
                      >
                        <Check size={16} color="#FFFFFF" strokeWidth={2} />
                        <Text style={styles.paidButtonText}>Mark Paid</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>

      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <X size={24} color="#6B7280" strokeWidth={1.5} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Invoice</Text>
            <TouchableOpacity onPress={handleCreateInvoice}>
              <Check size={24} color={Colors.navy} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Client Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter client name"
                placeholderTextColor="#9CA3AF"
                value={newInvoice.clientName}
                onChangeText={(text) =>
                  setNewInvoice({ ...newInvoice, clientName: text })
                }
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Client Email</Text>
              <TextInput
                style={styles.input}
                placeholder="client@email.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                value={newInvoice.clientEmail}
                onChangeText={(text) =>
                  setNewInvoice({ ...newInvoice, clientEmail: text })
                }
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Project Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter project name"
                placeholderTextColor="#9CA3AF"
                value={newInvoice.projectName}
                onChangeText={(text) =>
                  setNewInvoice({ ...newInvoice, projectName: text })
                }
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Due Date</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9CA3AF"
                value={newInvoice.dueDate}
                onChangeText={(text) =>
                  setNewInvoice({ ...newInvoice, dueDate: text })
                }
              />
            </View>

            <View style={styles.itemsSection}>
              <Text style={styles.itemsSectionTitle}>Line Items</Text>
              {newItems.map((item, index) => (
                <View key={item.id} style={styles.itemRow}>
                  <View style={styles.itemDescriptionWrapper}>
                    <TextInput
                      style={styles.itemDescription}
                      placeholder="Description"
                      placeholderTextColor="#9CA3AF"
                      value={item.description}
                      onChangeText={(text) =>
                        handleUpdateItem(item.id, "description", text)
                      }
                    />
                  </View>
                  <TextInput
                    style={styles.itemQty}
                    placeholder="Qty"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="number-pad"
                    value={item.quantity.toString()}
                    onChangeText={(text) =>
                      handleUpdateItem(item.id, "quantity", parseInt(text) || 0)
                    }
                  />
                  <TextInput
                    style={styles.itemRate}
                    placeholder="Rate"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="decimal-pad"
                    value={item.rate.toString()}
                    onChangeText={(text) =>
                      handleUpdateItem(item.id, "rate", parseFloat(text) || 0)
                    }
                  />
                  <TouchableOpacity
                    style={styles.itemRemove}
                    onPress={() => handleRemoveItem(item.id)}
                  >
                    <Trash2 size={18} color="#EF4444" strokeWidth={1.5} />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.addItemButton} onPress={handleAddItem}>
                <Plus size={18} color={Colors.navy} strokeWidth={2} />
                <Text style={styles.addItemText}>Add Line Item</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.totalSection}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                ${calculateTotal(newItems).toLocaleString()}
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Payment terms, additional info..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                value={newInvoice.notes}
                onChangeText={(text) =>
                  setNewInvoice({ ...newInvoice, notes: text })
                }
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showPaypalSetup}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPaypalSetup(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPaypalSetup(false)}>
              <X size={24} color="#6B7280" strokeWidth={1.5} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>PayPal Setup</Text>
            <TouchableOpacity onPress={handleSavePaypalUsername}>
              <Check size={24} color={Colors.navy} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.paypalSetupCard}>
              <Wallet size={48} color="#0070BA" />
              <Text style={styles.paypalSetupTitle}>Connect PayPal</Text>
              <Text style={styles.paypalSetupDesc}>
                Enter your PayPal.me username to receive payments directly from clients.
              </Text>
              {isTestMode && (
                <View style={styles.testModeBanner}>
                  <Text style={styles.testModeText}>🧪 Test Mode: Enter any username to simulate payments</Text>
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>PayPal.me Username</Text>
              <View style={styles.paypalInputRow}>
                <Text style={styles.paypalPrefix}>paypal.me/</Text>
                <TextInput
                  style={styles.paypalInput}
                  placeholder="yourusername"
                  placeholderTextColor="#9CA3AF"
                  value={paypalUsername}
                  onChangeText={setPaypalUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              <Text style={styles.paypalHint}>
                This is the username you chose when setting up PayPal.me
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.paypalSaveButton}
              onPress={handleSavePaypalUsername}
            >
              <Text style={styles.paypalSaveButtonText}>Save PayPal Settings</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={selectedInvoice !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedInvoice(null)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSelectedInvoice(null)}>
              <X size={24} color="#6B7280" strokeWidth={1.5} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Invoice Details</Text>
            <TouchableOpacity>
              <Download size={24} color={Colors.navy} strokeWidth={1.5} />
            </TouchableOpacity>
          </View>

          {selectedInvoice && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.invoiceDetailHeader}>
                <Text style={styles.invoiceDetailNumber}>
                  {selectedInvoice.invoiceNumber}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: `${statusConfig[selectedInvoice.status].color}15` },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: statusConfig[selectedInvoice.status].color },
                    ]}
                  >
                    {statusConfig[selectedInvoice.status].label}
                  </Text>
                </View>
              </View>

              <View style={styles.detailCard}>
                <View style={styles.detailRow}>
                  <User size={18} color={Colors.navy} strokeWidth={1.5} />
                  <Text style={styles.detailLabel}>Client</Text>
                  <Text style={styles.detailValue}>{selectedInvoice.clientName}</Text>
                </View>
                <View style={styles.detailRow}>
                  <MapPin size={18} color={Colors.navy} strokeWidth={1.5} />
                  <Text style={styles.detailLabel}>Project</Text>
                  <Text style={styles.detailValue}>{selectedInvoice.projectName}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Calendar size={18} color={Colors.navy} strokeWidth={1.5} />
                  <Text style={styles.detailLabel}>Date</Text>
                  <Text style={styles.detailValue}>{selectedInvoice.date}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Clock size={18} color={Colors.navy} strokeWidth={1.5} />
                  <Text style={styles.detailLabel}>Due Date</Text>
                  <Text style={styles.detailValue}>{selectedInvoice.dueDate}</Text>
                </View>
              </View>

              <View style={styles.itemsDetailCard}>
                <Text style={styles.itemsDetailTitle}>Line Items</Text>
                {selectedInvoice.items.map((item) => (
                  <View key={item.id} style={styles.itemDetailRow}>
                    <View style={styles.itemDetailLeft}>
                      <Text style={styles.itemDetailDesc}>{item.description}</Text>
                      <Text style={styles.itemDetailMeta}>
                        {item.quantity} x ${item.rate}
                      </Text>
                    </View>
                    <Text style={styles.itemDetailAmount}>
                      ${(item.quantity * item.rate).toLocaleString()}
                    </Text>
                  </View>
                ))}
                <View style={styles.itemDetailTotal}>
                  <Text style={styles.itemDetailTotalLabel}>Total</Text>
                  <Text style={styles.itemDetailTotalValue}>
                    ${calculateTotal(selectedInvoice.items).toLocaleString()}
                  </Text>
                </View>
              </View>

              {selectedInvoice.notes && (
                <View style={styles.notesCard}>
                  <Text style={styles.notesTitle}>Notes</Text>
                  <Text style={styles.notesText}>{selectedInvoice.notes}</Text>
                </View>
              )}

              {(selectedInvoice.status === "sent" || selectedInvoice.status === "overdue") && (
                <View style={styles.paymentActions}>
                  <TouchableOpacity 
                    style={styles.paypalButton}
                    onPress={() => handlePayWithPayPal(selectedInvoice)}
                  >
                    <Wallet size={18} color="#FFFFFF" strokeWidth={2} />
                    <Text style={styles.paypalButtonText}>Pay with PayPal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.markPaidButton}
                    onPress={() => {
                      handleMarkPaid(selectedInvoice.id);
                      setSelectedInvoice(null);
                    }}
                  >
                    <CreditCard size={18} color="#10B981" strokeWidth={2} />
                    <Text style={styles.markPaidButtonText}>Mark as Paid</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F7",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  statsRow: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statCardPaid: {
    backgroundColor: "#ECFDF5",
  },
  statLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: "#1F2937",
  },
  statValuePaid: {
    color: "#10B981",
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingBottom: 12,
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
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
  },
  invoiceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  invoiceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.navy,
  },
  clientName: {
    fontSize: 14,
    color: "#374151",
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  invoiceMeta: {
    gap: 6,
    marginBottom: 14,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: "#6B7280",
  },
  invoiceFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 12,
  },
  invoiceTotal: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#1F2937",
  },
  invoiceActions: {
    flexDirection: "row",
    gap: 8,
  },
  sendButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.navy,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  sendButtonText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#FFFFFF",
  },
  paidButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#10B981",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  paidButtonText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#FFFFFF",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#F5F5F7",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  modalContent: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1F2937",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  itemsSection: {
    marginBottom: 16,
  },
  itemsSectionTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#374151",
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  itemDescriptionWrapper: {
    flex: 1,
  },
  itemDescription: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1F2937",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  itemQty: {
    width: 60,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1F2937",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    textAlign: "center",
  },
  itemRate: {
    width: 80,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1F2937",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    textAlign: "center",
  },
  itemRemove: {
    padding: 8,
  },
  addItemButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },
  addItemText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.navy,
  },
  totalSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#374151",
  },
  totalValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.navy,
  },
  invoiceDetailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  invoiceDetailNumber: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.navy,
  },
  detailCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  detailLabel: {
    flex: 1,
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 10,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#1F2937",
  },
  itemsDetailCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  itemsDetailTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#374151",
    marginBottom: 12,
  },
  itemDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  itemDetailLeft: {
    flex: 1,
  },
  itemDetailDesc: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#1F2937",
  },
  itemDetailMeta: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  itemDetailAmount: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  itemDetailTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    marginTop: 4,
  },
  itemDetailTotalLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#374151",
  },
  itemDetailTotalValue: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.navy,
  },
  notesCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#374151",
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  paymentActions: {
    padding: 16,
    gap: 12,
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
  markPaidButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#10B981",
    backgroundColor: "#FFFFFF",
  },
  markPaidButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#10B981",
  },
  paypalSetupCard: {
    alignItems: "center",
    backgroundColor: "#F0F9FF",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  paypalSetupTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 8,
  },
  paypalSetupDesc: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center" as const,
    lineHeight: 20,
  },
  paypalInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  paypalPrefix: {
    fontSize: 16,
    color: "#6B7280",
    paddingLeft: 14,
    paddingRight: 4,
  },
  paypalInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    paddingVertical: 12,
    paddingRight: 14,
  },
  paypalHint: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 8,
  },
  paypalSaveButton: {
    backgroundColor: "#0070BA",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
  },
  paypalSaveButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  testModeBanner: {
    backgroundColor: "#E8E9EE",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 16,
  },
  testModeText: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: "#92400E",
    textAlign: "center" as const,
  },
});
