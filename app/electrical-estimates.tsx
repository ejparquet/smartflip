import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import {
  ArrowLeft,
  Plus,
  Zap,
  DollarSign,
  Clock,
  ChevronRight,
  X,
  Calculator,
  Lightbulb,
  Plug,
  CircuitBoard,
  Gauge,
  Home,
  Building,
  Check,
  Send,
  FileText,
  Edit3,
  Copy,
  Trash2,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";

interface EstimateLineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

interface ElectricalEstimate {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  address: string;
  jobType: string;
  status: "draft" | "sent" | "accepted" | "declined" | "expired";
  lineItems: EstimateLineItem[];
  laborHours: number;
  laborRate: number;
  materialsCost: number;
  permitFee: number;
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  validUntil: string;
  createdAt: string;
}

interface QuickEstimateTemplate {
  id: string;
  name: string;
  icon: any;
  description: string;
  basePrice: number;
  priceRange: string;
  timeEstimate: string;
  category: "residential" | "commercial";
  includes: string[];
}

const quickEstimateTemplates: QuickEstimateTemplate[] = [
  {
    id: "1",
    name: "Outlet Installation",
    icon: Plug,
    description: "Standard 120V outlet installation",
    basePrice: 175,
    priceRange: "$150 - $300",
    timeEstimate: "30-60 min",
    category: "residential",
    includes: ["New outlet box", "Wiring to nearest junction", "Testing", "Cleanup"],
  },
  {
    id: "2",
    name: "Ceiling Fan Install",
    icon: Lightbulb,
    description: "Install ceiling fan with existing wiring",
    basePrice: 225,
    priceRange: "$150 - $350",
    timeEstimate: "1-2 hours",
    category: "residential",
    includes: ["Fan assembly", "Mounting hardware", "Wiring connection", "Balance & test"],
  },
  {
    id: "3",
    name: "Panel Upgrade 200A",
    icon: CircuitBoard,
    description: "Upgrade main panel to 200 amp service",
    basePrice: 2500,
    priceRange: "$2,000 - $4,000",
    timeEstimate: "6-8 hours",
    category: "residential",
    includes: ["New 200A panel", "Main breaker", "Permit fees", "Utility coordination", "Inspection"],
  },
  {
    id: "4",
    name: "EV Charger Level 2",
    icon: Gauge,
    description: "Level 2 EV charger installation (240V/50A)",
    basePrice: 1200,
    priceRange: "$800 - $2,000",
    timeEstimate: "3-4 hours",
    category: "residential",
    includes: ["50A circuit installation", "Dedicated breaker", "Conduit & wiring", "Charger mounting", "Testing"],
  },
  {
    id: "5",
    name: "Recessed Lighting (per light)",
    icon: Lightbulb,
    description: "LED recessed light installation",
    basePrice: 150,
    priceRange: "$125 - $200",
    timeEstimate: "45 min each",
    category: "residential",
    includes: ["LED fixture", "Can housing", "Wiring", "Drywall repair if needed"],
  },
  {
    id: "6",
    name: "GFCI Outlet",
    icon: Plug,
    description: "GFCI outlet installation or replacement",
    basePrice: 185,
    priceRange: "$150 - $250",
    timeEstimate: "30-45 min",
    category: "residential",
    includes: ["GFCI outlet", "Wiring upgrade if needed", "Testing", "Code compliance"],
  },
  {
    id: "7",
    name: "Whole House Surge Protector",
    icon: Zap,
    description: "Panel-mounted surge protection",
    basePrice: 450,
    priceRange: "$350 - $600",
    timeEstimate: "1-2 hours",
    category: "residential",
    includes: ["Surge protector device", "Panel installation", "Wiring", "Testing"],
  },
  {
    id: "8",
    name: "Generator Transfer Switch",
    icon: CircuitBoard,
    description: "Manual transfer switch installation",
    basePrice: 1100,
    priceRange: "$800 - $1,500",
    timeEstimate: "3-4 hours",
    category: "residential",
    includes: ["Transfer switch", "Panel integration", "Load selection", "Testing"],
  },
  {
    id: "9",
    name: "Commercial Panel Install",
    icon: Building,
    description: "Commercial sub-panel installation",
    basePrice: 3500,
    priceRange: "$2,500 - $5,000",
    timeEstimate: "8-10 hours",
    category: "commercial",
    includes: ["Sub-panel", "Main breaker", "Conduit run", "Permit & inspection"],
  },
  {
    id: "10",
    name: "Home Rewire (per sq ft)",
    icon: Home,
    description: "Complete home rewiring service",
    basePrice: 8,
    priceRange: "$6 - $12/sq ft",
    timeEstimate: "3-5 days",
    category: "residential",
    includes: ["New wiring throughout", "Panel upgrade", "All outlets & switches", "Permits & inspections"],
  },
];

const mockEstimates: ElectricalEstimate[] = [
  {
    id: "1",
    customerName: "Michael Chen",
    customerPhone: "(512) 555-0123",
    customerEmail: "mchen@email.com",
    address: "1234 Oak Valley Dr, Austin, TX",
    jobType: "Panel Upgrade",
    status: "sent",
    lineItems: [
      { id: "1", description: "200A Main Panel", quantity: 1, unit: "ea", unitPrice: 850, total: 850 },
      { id: "2", description: "Circuit Breakers", quantity: 20, unit: "ea", unitPrice: 35, total: 700 },
      { id: "3", description: "Copper Wire 4/0", quantity: 25, unit: "ft", unitPrice: 12, total: 300 },
    ],
    laborHours: 8,
    laborRate: 95,
    materialsCost: 1850,
    permitFee: 150,
    subtotal: 2760,
    tax: 152.63,
    total: 2912.63,
    notes: "Includes coordination with utility company for meter disconnect.",
    validUntil: new Date(Date.now() + 14 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "2",
    customerName: "Sarah Johnson",
    customerPhone: "(512) 555-0456",
    address: "567 Maple Street, Round Rock, TX",
    jobType: "EV Charger Installation",
    status: "accepted",
    lineItems: [
      { id: "1", description: "50A Circuit Installation", quantity: 1, unit: "ea", unitPrice: 400, total: 400 },
      { id: "2", description: "6/3 NM-B Wire", quantity: 40, unit: "ft", unitPrice: 8, total: 320 },
      { id: "3", description: "50A GFCI Breaker", quantity: 1, unit: "ea", unitPrice: 85, total: 85 },
    ],
    laborHours: 4,
    laborRate: 95,
    materialsCost: 805,
    permitFee: 0,
    subtotal: 1185,
    tax: 66.43,
    total: 1251.43,
    validUntil: new Date(Date.now() + 7 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "3",
    customerName: "Robert Garcia",
    customerPhone: "(512) 555-0789",
    address: "890 Cedar Lane, Cedar Park, TX",
    jobType: "Recessed Lighting",
    status: "draft",
    lineItems: [
      { id: "1", description: "6\" LED Recessed Light", quantity: 8, unit: "ea", unitPrice: 45, total: 360 },
      { id: "2", description: "14/2 Romex Wire", quantity: 100, unit: "ft", unitPrice: 1.5, total: 150 },
      { id: "3", description: "Dimmer Switch", quantity: 1, unit: "ea", unitPrice: 65, total: 65 },
    ],
    laborHours: 6,
    laborRate: 95,
    materialsCost: 575,
    permitFee: 0,
    subtotal: 1145,
    tax: 47.44,
    total: 1192.44,
    validUntil: new Date(Date.now() + 14 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

const statusConfig: Record<string, { color: string; bgColor: string; label: string }> = {
  draft: { color: "#6B7280", bgColor: "#F3F4F6", label: "Draft" },
  sent: { color: "#3B82F6", bgColor: "#DBEAFE", label: "Sent" },
  accepted: { color: "#22C55E", bgColor: "#DCFCE7", label: "Accepted" },
  declined: { color: "#EF4444", bgColor: "#FEE2E2", label: "Declined" },
  expired: { color: "#272D53", bgColor: "#E8E9EE", label: "Expired" },
};

export default function ElectricalEstimatesScreen() {
  const router = useRouter();
  const [estimates, setEstimates] = useState<ElectricalEstimate[]>(mockEstimates);
  const [activeTab, setActiveTab] = useState<"templates" | "estimates">("templates");
  const [selectedTemplate, setSelectedTemplate] = useState<QuickEstimateTemplate | null>(null);
  const [selectedEstimate, setSelectedEstimate] = useState<ElectricalEstimate | null>(null);
  const [showQuickQuote, setShowQuickQuote] = useState(false);
  const [quickQuoteQuantity, setQuickQuoteQuantity] = useState("1");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "residential" | "commercial">("all");

  const filteredTemplates = useMemo(() => {
    if (selectedCategory === "all") return quickEstimateTemplates;
    return quickEstimateTemplates.filter((t) => t.category === selectedCategory);
  }, [selectedCategory]);

  const stats = useMemo(() => {
    return {
      total: estimates.length,
      pending: estimates.filter((e) => e.status === "sent").length,
      accepted: estimates.filter((e) => e.status === "accepted").length,
      totalValue: estimates.filter((e) => e.status === "accepted").reduce((sum, e) => sum + e.total, 0),
    };
  }, [estimates]);

  const handleCreateQuickQuote = useCallback(() => {
    if (!selectedTemplate) return;
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const qty = parseInt(quickQuoteQuantity) || 1;
    const total = selectedTemplate.basePrice * qty;
    
    Alert.alert(
      "Quick Quote Ready",
      `${selectedTemplate.name}\nQuantity: ${qty}\nEstimated Total: $${total.toLocaleString()}\n\nWould you like to create a full estimate?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Create Estimate",
          onPress: () => {
            setShowQuickQuote(false);
            setSelectedTemplate(null);
            Alert.alert("Success", "Estimate created and saved to drafts.");
          },
        },
      ]
    );
  }, [selectedTemplate, quickQuoteQuantity]);

  const handleSendEstimate = useCallback((estimateId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setEstimates((prev) =>
      prev.map((e) =>
        e.id === estimateId ? { ...e, status: "sent" as const } : e
      )
    );
    Alert.alert("Estimate Sent", "The estimate has been sent to the customer.");
  }, []);

  const handleDuplicateEstimate = useCallback((estimate: ElectricalEstimate) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newEstimate: ElectricalEstimate = {
      ...estimate,
      id: Date.now().toString(),
      status: "draft",
      createdAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 14 * 86400000).toISOString(),
    };
    setEstimates((prev) => [newEstimate, ...prev]);
    Alert.alert("Duplicated", "Estimate has been duplicated as a draft.");
  }, []);

  const renderTemplateCard = (template: QuickEstimateTemplate) => {
    const Icon = template.icon;
    
    return (
      <TouchableOpacity
        key={template.id}
        style={styles.templateCard}
        onPress={() => {
          setSelectedTemplate(template);
          setShowQuickQuote(true);
          setQuickQuoteQuantity("1");
        }}
        activeOpacity={0.7}
      >
        <View style={styles.templateHeader}>
          <View style={[styles.templateIcon, { backgroundColor: "#FEF9C3" }]}>
            <Icon size={24} color="#EAB308" />
          </View>
          <View style={styles.templateInfo}>
            <Text style={styles.templateName}>{template.name}</Text>
            <Text style={styles.templateDescription}>{template.description}</Text>
          </View>
        </View>
        
        <View style={styles.templateMeta}>
          <View style={styles.templateMetaItem}>
            <DollarSign size={14} color="#22C55E" />
            <Text style={styles.templatePrice}>{template.priceRange}</Text>
          </View>
          <View style={styles.templateMetaItem}>
            <Clock size={14} color={Colors.textSecondary} />
            <Text style={styles.templateTime}>{template.timeEstimate}</Text>
          </View>
        </View>
        
        <View style={styles.templateIncludes}>
          {template.includes.slice(0, 3).map((item, index) => (
            <View key={index} style={styles.includeItem}>
              <Check size={12} color="#22C55E" />
              <Text style={styles.includeText}>{item}</Text>
            </View>
          ))}
          {template.includes.length > 3 && (
            <Text style={styles.moreIncludes}>+{template.includes.length - 3} more</Text>
          )}
        </View>
        
        <View style={styles.templateFooter}>
          <Text style={styles.basePriceLabel}>Starting at</Text>
          <Text style={styles.basePrice}>${template.basePrice}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEstimateCard = (estimate: ElectricalEstimate) => {
    const status = statusConfig[estimate.status];
    
    return (
      <TouchableOpacity
        key={estimate.id}
        style={styles.estimateCard}
        onPress={() => setSelectedEstimate(estimate)}
        activeOpacity={0.7}
      >
        <View style={styles.estimateHeader}>
          <View style={styles.estimateInfo}>
            <Text style={styles.customerName}>{estimate.customerName}</Text>
            <Text style={styles.jobType}>{estimate.jobType}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bgColor }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>
        
        <Text style={styles.estimateAddress}>{estimate.address}</Text>
        
        <View style={styles.estimateFooter}>
          <View style={styles.estimateTotal}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${estimate.total.toLocaleString()}</Text>
          </View>
          <View style={styles.estimateDate}>
            <Text style={styles.dateLabel}>
              {estimate.status === "draft" ? "Created" : "Valid until"}
            </Text>
            <Text style={styles.dateValue}>
              {new Date(estimate.status === "draft" ? estimate.createdAt : estimate.validUntil).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </Text>
          </View>
          <ChevronRight size={20} color={Colors.textTertiary} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Electrical Estimates",
          headerLeft: () => <BackButton />,
          headerRight: () => (
            <TouchableOpacity onPress={() => {}} style={styles.addButton}>
              <Plus size={24} color="#EAB308" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#DBEAFE" }]}>
            <Text style={[styles.statValue, { color: "#3B82F6" }]}>{stats.pending}</Text>
            <Text style={[styles.statLabel, { color: "#3B82F6" }]}>Pending</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#DCFCE7" }]}>
            <Text style={[styles.statValue, { color: "#22C55E" }]}>{stats.accepted}</Text>
            <Text style={[styles.statLabel, { color: "#22C55E" }]}>Accepted</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#FEF9C3" }]}>
            <Text style={[styles.statValue, { color: "#CA8A04" }]}>${(stats.totalValue / 1000).toFixed(1)}k</Text>
            <Text style={[styles.statLabel, { color: "#CA8A04" }]}>Won</Text>
          </View>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "templates" && styles.activeTab]}
            onPress={() => setActiveTab("templates")}
          >
            <Calculator size={18} color={activeTab === "templates" ? "#EAB308" : Colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === "templates" && styles.activeTabText]}>Quick Quotes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "estimates" && styles.activeTab]}
            onPress={() => setActiveTab("estimates")}
          >
            <FileText size={18} color={activeTab === "estimates" ? "#EAB308" : Colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === "estimates" && styles.activeTabText]}>Estimates</Text>
          </TouchableOpacity>
        </View>

        {activeTab === "templates" && (
          <>
            <View style={styles.categoryFilter}>
              {(["all", "residential", "commercial"] as const).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.templatesSection}>
              <Text style={styles.sectionTitle}>Common Electrical Jobs</Text>
              <Text style={styles.sectionSubtitle}>Tap to generate a quick quote</Text>
              {filteredTemplates.map(renderTemplateCard)}
            </View>
          </>
        )}

        {activeTab === "estimates" && (
          <View style={styles.estimatesSection}>
            <Text style={styles.sectionTitle}>Your Estimates ({estimates.length})</Text>
            {estimates.map(renderEstimateCard)}

            {estimates.length === 0 && (
              <View style={styles.emptyState}>
                <FileText size={48} color={Colors.textTertiary} />
                <Text style={styles.emptyStateTitle}>No Estimates Yet</Text>
                <Text style={styles.emptyStateText}>Create your first estimate using quick quotes</Text>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal visible={showQuickQuote} animationType="slide" presentationStyle="pageSheet">
        {selectedTemplate && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowQuickQuote(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Quick Quote</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.quoteTemplateHeader}>
                <View style={[styles.quoteIcon, { backgroundColor: "#FEF9C3" }]}>
                  <selectedTemplate.icon size={32} color="#EAB308" />
                </View>
                <Text style={styles.quoteName}>{selectedTemplate.name}</Text>
                <Text style={styles.quoteDescription}>{selectedTemplate.description}</Text>
              </View>

              <View style={styles.quoteDetails}>
                <View style={styles.quoteDetailRow}>
                  <Text style={styles.quoteDetailLabel}>Price Range</Text>
                  <Text style={styles.quoteDetailValue}>{selectedTemplate.priceRange}</Text>
                </View>
                <View style={styles.quoteDetailRow}>
                  <Text style={styles.quoteDetailLabel}>Time Estimate</Text>
                  <Text style={styles.quoteDetailValue}>{selectedTemplate.timeEstimate}</Text>
                </View>
                <View style={styles.quoteDetailRow}>
                  <Text style={styles.quoteDetailLabel}>Category</Text>
                  <Text style={styles.quoteDetailValue}>
                    {selectedTemplate.category.charAt(0).toUpperCase() + selectedTemplate.category.slice(1)}
                  </Text>
                </View>
              </View>

              <View style={styles.includesSection}>
                <Text style={styles.includesTitle}>What's Included</Text>
                {selectedTemplate.includes.map((item, index) => (
                  <View key={index} style={styles.includeRow}>
                    <Check size={16} color="#22C55E" />
                    <Text style={styles.includeRowText}>{item}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.quantitySection}>
                <Text style={styles.quantityLabel}>Quantity</Text>
                <View style={styles.quantityInput}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => setQuickQuoteQuantity((prev) => Math.max(1, parseInt(prev) - 1).toString())}
                  >
                    <Text style={styles.quantityButtonText}>-</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={styles.quantityValue}
                    value={quickQuoteQuantity}
                    onChangeText={setQuickQuoteQuantity}
                    keyboardType="number-pad"
                    textAlign="center"
                  />
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => setQuickQuoteQuantity((prev) => (parseInt(prev) + 1).toString())}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.quoteTotalSection}>
                <Text style={styles.quoteTotalLabel}>Estimated Total</Text>
                <Text style={styles.quoteTotalValue}>
                  ${(selectedTemplate.basePrice * (parseInt(quickQuoteQuantity) || 1)).toLocaleString()}
                </Text>
                <Text style={styles.quoteTotalNote}>Final price may vary based on site conditions</Text>
              </View>

              <TouchableOpacity style={styles.createQuoteButton} onPress={handleCreateQuickQuote}>
                <Calculator size={20} color="#000" />
                <Text style={styles.createQuoteButtonText}>Create Estimate</Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>

      <Modal visible={selectedEstimate !== null} animationType="slide" presentationStyle="pageSheet">
        {selectedEstimate && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedEstimate(null)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Estimate Details</Text>
              <TouchableOpacity onPress={() => handleDuplicateEstimate(selectedEstimate)}>
                <Copy size={22} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.estimateDetailHeader}>
                <View style={styles.estimateDetailInfo}>
                  <Text style={styles.estimateDetailName}>{selectedEstimate.customerName}</Text>
                  <Text style={styles.estimateDetailJob}>{selectedEstimate.jobType}</Text>
                </View>
                <View style={[styles.statusBadgeLarge, { backgroundColor: statusConfig[selectedEstimate.status].bgColor }]}>
                  <Text style={[styles.statusTextLarge, { color: statusConfig[selectedEstimate.status].color }]}>
                    {statusConfig[selectedEstimate.status].label}
                  </Text>
                </View>
              </View>

              <View style={styles.estimateDetailSection}>
                <Text style={styles.estimateDetailLabel}>Customer Info</Text>
                <View style={styles.infoCard}>
                  <Text style={styles.infoText}>{selectedEstimate.customerPhone}</Text>
                  {selectedEstimate.customerEmail && (
                    <Text style={styles.infoText}>{selectedEstimate.customerEmail}</Text>
                  )}
                  <Text style={styles.infoText}>{selectedEstimate.address}</Text>
                </View>
              </View>

              <View style={styles.estimateDetailSection}>
                <Text style={styles.estimateDetailLabel}>Line Items</Text>
                <View style={styles.lineItemsCard}>
                  {selectedEstimate.lineItems.map((item) => (
                    <View key={item.id} style={styles.lineItem}>
                      <View style={styles.lineItemInfo}>
                        <Text style={styles.lineItemDescription}>{item.description}</Text>
                        <Text style={styles.lineItemQuantity}>
                          {item.quantity} {item.unit} × ${item.unitPrice}
                        </Text>
                      </View>
                      <Text style={styles.lineItemTotal}>${item.total}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.estimateDetailSection}>
                <Text style={styles.estimateDetailLabel}>Summary</Text>
                <View style={styles.summaryCard}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Labor ({selectedEstimate.laborHours}h × ${selectedEstimate.laborRate})</Text>
                    <Text style={styles.summaryValue}>${selectedEstimate.laborHours * selectedEstimate.laborRate}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Materials</Text>
                    <Text style={styles.summaryValue}>${selectedEstimate.materialsCost}</Text>
                  </View>
                  {selectedEstimate.permitFee > 0 && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Permit Fee</Text>
                      <Text style={styles.summaryValue}>${selectedEstimate.permitFee}</Text>
                    </View>
                  )}
                  <View style={[styles.summaryRow, styles.subtotalRow]}>
                    <Text style={styles.summaryLabel}>Subtotal</Text>
                    <Text style={styles.summaryValue}>${selectedEstimate.subtotal.toFixed(2)}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Tax</Text>
                    <Text style={styles.summaryValue}>${selectedEstimate.tax.toFixed(2)}</Text>
                  </View>
                  <View style={[styles.summaryRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValueLarge}>${selectedEstimate.total.toFixed(2)}</Text>
                  </View>
                </View>
              </View>

              {selectedEstimate.notes && (
                <View style={styles.estimateDetailSection}>
                  <Text style={styles.estimateDetailLabel}>Notes</Text>
                  <Text style={styles.notesText}>{selectedEstimate.notes}</Text>
                </View>
              )}

              <View style={styles.estimateActions}>
                <TouchableOpacity style={styles.editEstimateButton}>
                  <Edit3 size={18} color={Colors.primary} />
                  <Text style={styles.editEstimateText}>Edit</Text>
                </TouchableOpacity>
                {selectedEstimate.status === "draft" && (
                  <TouchableOpacity
                    style={styles.sendEstimateButton}
                    onPress={() => {
                      handleSendEstimate(selectedEstimate.id);
                      setSelectedEstimate(null);
                    }}
                  >
                    <Send size={18} color="#FFF" />
                    <Text style={styles.sendEstimateText}>Send to Customer</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </SafeAreaView>
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
    padding: 8,
  },
  addButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    padding: 16,
    paddingBottom: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tabsContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: "#FEF9C3",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: "#CA8A04",
  },
  categoryFilter: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
  },
  categoryChipActive: {
    backgroundColor: "#EAB308",
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.text,
  },
  categoryTextActive: {
    color: "#000",
  },
  templatesSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  templateCard: {
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
  templateHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  templateIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  templateDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  templateMeta: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  templateMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  templatePrice: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#22C55E",
  },
  templateTime: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  templateIncludes: {
    marginBottom: 12,
  },
  includeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  includeText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  moreIncludes: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  templateFooter: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "flex-end",
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 12,
  },
  basePriceLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginRight: 4,
  },
  basePrice: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: "#EAB308",
  },
  estimatesSection: {
    padding: 16,
  },
  estimateCard: {
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
  estimateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  estimateInfo: {},
  customerName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  jobType: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  estimateAddress: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  estimateFooter: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  estimateTotal: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  estimateDate: {
    marginRight: 8,
  },
  dateLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.text,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.text,
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: "center" as const,
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
  modalTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  quoteTemplateHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  quoteIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  quoteName: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.text,
    textAlign: "center" as const,
  },
  quoteDescription: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center" as const,
    marginTop: 4,
  },
  quoteDetails: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  quoteDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  quoteDetailLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  quoteDetailValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  includesSection: {
    marginBottom: 20,
  },
  includesTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  includeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  includeRowText: {
    fontSize: 15,
    color: Colors.text,
  },
  quantitySection: {
    marginBottom: 20,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  quantityInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  quantityButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  quantityButtonText: {
    fontSize: 24,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  quantityValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
    width: 60,
  },
  quoteTotalSection: {
    alignItems: "center",
    backgroundColor: "#FEF9C3",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  quoteTotalLabel: {
    fontSize: 14,
    color: "#92400E",
  },
  quoteTotalValue: {
    fontSize: 36,
    fontWeight: "800" as const,
    color: "#92400E",
    marginVertical: 4,
  },
  quoteTotalNote: {
    fontSize: 12,
    color: "#92400E",
    opacity: 0.7,
  },
  createQuoteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#EAB308",
    paddingVertical: 16,
    borderRadius: 12,
  },
  createQuoteButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#000",
  },
  estimateDetailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  estimateDetailInfo: {},
  estimateDetailName: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  estimateDetailJob: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  statusBadgeLarge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusTextLarge: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  estimateDetailSection: {
    marginBottom: 20,
  },
  estimateDetailLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    gap: 4,
  },
  infoText: {
    fontSize: 15,
    color: Colors.text,
  },
  lineItemsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: "hidden",
  },
  lineItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  lineItemInfo: {},
  lineItemDescription: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: Colors.text,
  },
  lineItemQuantity: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  lineItemTotal: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  subtotalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    marginTop: 8,
    paddingTop: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.text,
  },
  totalRow: {
    borderTopWidth: 2,
    borderTopColor: Colors.border,
    marginTop: 8,
    paddingTop: 12,
  },
  totalValueLarge: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#EAB308",
  },
  notesText: {
    fontSize: 15,
    color: Colors.text,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    lineHeight: 22,
  },
  estimateActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  editEstimateButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.surface,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  editEstimateText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  sendEstimateButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#EAB308",
    paddingVertical: 14,
    borderRadius: 12,
  },
  sendEstimateText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#000",
  },
});
