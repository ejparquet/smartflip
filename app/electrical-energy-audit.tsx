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
  Search,
  X,
  Lightbulb,
  Thermometer,
  Fan,
  Tv,
  Refrigerator,
  WashingMachine,
  DollarSign,
  TrendingDown,
  Leaf,
  Calculator,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Home,
  Building2,
  Clock,
  BarChart3,
  PieChart,
  Settings,
  Smartphone,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";

type ApplianceCategory = "lighting" | "hvac" | "appliances" | "electronics" | "water_heating" | "other";
type EfficiencyRating = "excellent" | "good" | "fair" | "poor";

interface Appliance {
  id: string;
  name: string;
  category: ApplianceCategory;
  wattage: number;
  hoursPerDay: number;
  quantity: number;
  currentType?: string;
  recommendedUpgrade?: string;
  potentialSavings?: number;
}

interface EnergyAudit {
  id: string;
  customerId: string;
  customerName: string;
  address: string;
  auditDate: string;
  homeSize: number;
  homeAge: number;
  currentMonthlyBill: number;
  appliances: Appliance[];
  recommendations: Recommendation[];
  efficiencyRating: EfficiencyRating;
  totalMonthlyUsage: number;
  projectedSavings: number;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: ApplianceCategory;
  priority: "high" | "medium" | "low";
  estimatedCost: number;
  annualSavings: number;
  paybackPeriod: number;
  implemented?: boolean;
}

const mockAudits: EnergyAudit[] = [
  {
    id: "1",
    customerId: "c1",
    customerName: "David Thompson",
    address: "1234 Tech Park Dr, Austin, TX",
    auditDate: "2024-09-15",
    homeSize: 2400,
    homeAge: 25,
    currentMonthlyBill: 285,
    efficiencyRating: "fair",
    totalMonthlyUsage: 1425,
    projectedSavings: 78,
    appliances: [
      { id: "a1", name: "Incandescent Bulbs", category: "lighting", wattage: 60, hoursPerDay: 5, quantity: 24, currentType: "Incandescent", recommendedUpgrade: "LED", potentialSavings: 35 },
      { id: "a2", name: "Central A/C", category: "hvac", wattage: 3500, hoursPerDay: 8, quantity: 1, currentType: "15 SEER", recommendedUpgrade: "20 SEER", potentialSavings: 25 },
      { id: "a3", name: "Electric Water Heater", category: "water_heating", wattage: 4500, hoursPerDay: 3, quantity: 1, currentType: "Standard Tank", recommendedUpgrade: "Heat Pump", potentialSavings: 18 },
      { id: "a4", name: "Refrigerator", category: "appliances", wattage: 150, hoursPerDay: 24, quantity: 1 },
      { id: "a5", name: "Washing Machine", category: "appliances", wattage: 500, hoursPerDay: 1, quantity: 1 },
      { id: "a6", name: "Dryer", category: "appliances", wattage: 3000, hoursPerDay: 1, quantity: 1 },
      { id: "a7", name: "TV", category: "electronics", wattage: 100, hoursPerDay: 4, quantity: 3 },
      { id: "a8", name: "Computer", category: "electronics", wattage: 200, hoursPerDay: 6, quantity: 2 },
    ],
    recommendations: [
      { id: "r1", title: "LED Lighting Retrofit", description: "Replace all 24 incandescent bulbs with LED equivalents. LEDs use 75% less energy and last 25x longer.", category: "lighting", priority: "high", estimatedCost: 150, annualSavings: 420, paybackPeriod: 0.4 },
      { id: "r2", title: "Smart Thermostat Installation", description: "Install a smart thermostat to optimize HVAC scheduling and reduce energy waste when away.", category: "hvac", priority: "high", estimatedCost: 250, annualSavings: 180, paybackPeriod: 1.4 },
      { id: "r3", title: "Heat Pump Water Heater", description: "Replace standard electric water heater with a heat pump model for 50-70% energy savings.", category: "water_heating", priority: "medium", estimatedCost: 2500, annualSavings: 350, paybackPeriod: 7.1 },
      { id: "r4", title: "Smart Power Strips", description: "Install smart power strips to eliminate phantom loads from electronics.", category: "electronics", priority: "low", estimatedCost: 80, annualSavings: 60, paybackPeriod: 1.3 },
    ],
  },
];

const categoryConfig: Record<ApplianceCategory, { label: string; icon: any; color: string }> = {
  lighting: { label: "Lighting", icon: Lightbulb, color: "#FBBF24" },
  hvac: { label: "HVAC", icon: Thermometer, color: "#3B82F6" },
  appliances: { label: "Appliances", icon: Refrigerator, color: "#22C55E" },
  electronics: { label: "Electronics", icon: Tv, color: "#8B5CF6" },
  water_heating: { label: "Water Heating", icon: Thermometer, color: "#EF4444" },
  other: { label: "Other", icon: Zap, color: "#6B7280" },
};

const efficiencyConfig: Record<EfficiencyRating, { label: string; color: string; bgColor: string }> = {
  excellent: { label: "Excellent", color: "#22C55E", bgColor: "#DCFCE7" },
  good: { label: "Good", color: "#3B82F6", bgColor: "#DBEAFE" },
  fair: { label: "Fair", color: "#272D53", bgColor: "#E8E9EE" },
  poor: { label: "Poor", color: "#DC2626", bgColor: "#FEE2E2" },
};

const priorityConfig = {
  high: { label: "High Priority", color: "#DC2626", bgColor: "#FEE2E2" },
  medium: { label: "Medium Priority", color: "#272D53", bgColor: "#E8E9EE" },
  low: { label: "Low Priority", color: "#22C55E", bgColor: "#DCFCE7" },
};

const ELECTRICITY_RATE = 0.12;

export default function ElectricalEnergyAuditScreen() {
  const router = useRouter();
  const [audits, setAudits] = useState<EnergyAudit[]>(mockAudits);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAudit, setSelectedAudit] = useState<EnergyAudit | null>(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculatorInputs, setCalculatorInputs] = useState({
    wattage: "",
    hoursPerDay: "",
    daysPerMonth: "30",
  });

  const filteredAudits = useMemo(() => {
    return audits.filter((audit) => {
      const matchesSearch =
        audit.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        audit.address.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [audits, searchQuery]);

  const calculateMonthlyUsage = useCallback((wattage: number, hoursPerDay: number, quantity: number = 1) => {
    return (wattage * hoursPerDay * 30 * quantity) / 1000;
  }, []);

  const calculateMonthlyCost = useCallback((kWh: number) => {
    return kWh * ELECTRICITY_RATE;
  }, []);

  const calculatorResult = useMemo(() => {
    const wattage = parseFloat(calculatorInputs.wattage) || 0;
    const hours = parseFloat(calculatorInputs.hoursPerDay) || 0;
    const days = parseFloat(calculatorInputs.daysPerMonth) || 30;
    
    const kWh = (wattage * hours * days) / 1000;
    const cost = kWh * ELECTRICITY_RATE;
    const annualKWh = kWh * 12;
    const annualCost = cost * 12;

    return { kWh, cost, annualKWh, annualCost };
  }, [calculatorInputs]);

  const handleCreateAudit = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("New Energy Audit", "Start a new energy audit for a customer?");
  }, []);

  const handleLEDGuide = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      "LED Retrofit Guide",
      "LED Lighting Benefits:\n\n• 75% less energy than incandescent\n• 25x longer lifespan\n• Instant-on, no warm-up\n• Available in various color temps\n• Dimmable options available\n\nCommon Upgrades:\n• 60W incandescent → 9W LED\n• 100W incandescent → 14W LED\n• 4ft T8 fluorescent → 18W LED tube",
      [{ text: "Got it" }]
    );
  }, []);

  const handleSmartHome = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      "Smart Home Solutions",
      "Energy-Saving Smart Devices:\n\n• Smart Thermostats: Save 10-25% on HVAC\n• Smart Plugs: Eliminate phantom loads\n• Smart Lighting: Schedule & automate\n• Smart Power Strips: Auto shut-off\n• Energy Monitors: Track usage real-time\n\nPopular Brands:\n• Ecobee, Nest, Honeywell\n• Lutron, Philips Hue\n• Sense, Emporia",
      [{ text: "Got it" }]
    );
  }, []);

  const handleImplementRecommendation = useCallback((auditId: string, recId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setAudits((prev) =>
      prev.map((audit) =>
        audit.id === auditId
          ? {
              ...audit,
              recommendations: audit.recommendations.map((rec) =>
                rec.id === recId ? { ...rec, implemented: true } : rec
              ),
            }
          : audit
      )
    );
    if (selectedAudit?.id === auditId) {
      setSelectedAudit((prev) =>
        prev
          ? {
              ...prev,
              recommendations: prev.recommendations.map((rec) =>
                rec.id === recId ? { ...rec, implemented: true } : rec
              ),
            }
          : null
      );
    }
    Alert.alert("Marked Complete", "Recommendation marked as implemented.");
  }, [selectedAudit]);

  const renderAuditCard = (audit: EnergyAudit) => {
    const efficiency = efficiencyConfig[audit.efficiencyRating];
    const implementedCount = audit.recommendations.filter((r) => r.implemented).length;

    return (
      <TouchableOpacity
        key={audit.id}
        style={styles.auditCard}
        onPress={() => setSelectedAudit(audit)}
        activeOpacity={0.7}
      >
        <View style={styles.auditHeader}>
          <View style={styles.auditIcon}>
            <BarChart3 size={24} color="#EAB308" />
          </View>
          <View style={styles.auditInfo}>
            <Text style={styles.auditCustomer}>{audit.customerName}</Text>
            <Text style={styles.auditAddress} numberOfLines={1}>{audit.address}</Text>
          </View>
          <View style={[styles.efficiencyBadge, { backgroundColor: efficiency.bgColor }]}>
            <Text style={[styles.efficiencyText, { color: efficiency.color }]}>{efficiency.label}</Text>
          </View>
        </View>

        <View style={styles.auditStats}>
          <View style={styles.auditStatItem}>
            <Zap size={16} color={Colors.textSecondary} />
            <Text style={styles.auditStatValue}>{audit.totalMonthlyUsage} kWh</Text>
            <Text style={styles.auditStatLabel}>Monthly Usage</Text>
          </View>
          <View style={styles.auditStatItem}>
            <DollarSign size={16} color={Colors.textSecondary} />
            <Text style={styles.auditStatValue}>${audit.currentMonthlyBill}</Text>
            <Text style={styles.auditStatLabel}>Monthly Bill</Text>
          </View>
          <View style={styles.auditStatItem}>
            <TrendingDown size={16} color="#22C55E" />
            <Text style={[styles.auditStatValue, { color: "#22C55E" }]}>${audit.projectedSavings}</Text>
            <Text style={styles.auditStatLabel}>Potential Savings</Text>
          </View>
        </View>

        <View style={styles.auditFooter}>
          <View style={styles.dateRow}>
            <Clock size={12} color={Colors.textTertiary} />
            <Text style={styles.dateText}>
              Audited {new Date(audit.auditDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </Text>
          </View>
          <View style={styles.recommendationProgress}>
            <Text style={styles.progressText}>
              {implementedCount}/{audit.recommendations.length} recommendations
            </Text>
            <ChevronRight size={16} color={Colors.textTertiary} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Energy Audit",
          headerLeft: () => <BackButton />,
          headerRight: () => (
            <TouchableOpacity onPress={() => setShowCalculator(true)} style={styles.calcButton}>
              <Calculator size={24} color="#EAB308" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Leaf size={32} color="#22C55E" />
          </View>
          <Text style={styles.headerTitle}>Energy Audit Tools</Text>
          <Text style={styles.headerSubtitle}>
            Calculate usage, recommend efficiency upgrades, LED retrofits & smart home solutions
          </Text>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction} onPress={handleCreateAudit}>
            <View style={[styles.quickActionIcon, { backgroundColor: "#DCFCE7" }]}>
              <Plus size={20} color="#22C55E" />
            </View>
            <Text style={styles.quickActionText}>New Audit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={() => setShowCalculator(true)}>
            <View style={[styles.quickActionIcon, { backgroundColor: "#FEF9C3" }]}>
              <Calculator size={20} color="#EAB308" />
            </View>
            <Text style={styles.quickActionText}>Calculator</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={handleLEDGuide}>
            <View style={[styles.quickActionIcon, { backgroundColor: "#DBEAFE" }]}>
              <Lightbulb size={20} color="#3B82F6" />
            </View>
            <Text style={styles.quickActionText}>LED Guide</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={handleSmartHome}>
            <View style={[styles.quickActionIcon, { backgroundColor: "#EDE9FE" }]}>
              <Smartphone size={20} color="#8B5CF6" />
            </View>
            <Text style={styles.quickActionText}>Smart Home</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Search size={18} color={Colors.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search audits..."
              placeholderTextColor={Colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <X size={18} color={Colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.auditsSection}>
          <Text style={styles.sectionTitle}>Energy Audits ({filteredAudits.length})</Text>
          {filteredAudits.map(renderAuditCard)}

          {filteredAudits.length === 0 && (
            <View style={styles.emptyState}>
              <BarChart3 size={48} color={Colors.textTertiary} />
              <Text style={styles.emptyStateTitle}>No Audits Found</Text>
              <Text style={styles.emptyStateText}>
                Start a new energy audit to help customers save money
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal visible={showCalculator} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCalculator(false)}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Energy Calculator</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.calculatorCard}>
              <Text style={styles.calculatorTitle}>Calculate Energy Usage</Text>
              <Text style={styles.calculatorSubtitle}>
                Enter appliance details to calculate monthly and annual costs
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Wattage (W)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 60"
                  placeholderTextColor={Colors.textTertiary}
                  keyboardType="numeric"
                  value={calculatorInputs.wattage}
                  onChangeText={(v) => setCalculatorInputs((p) => ({ ...p, wattage: v }))}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Hours per Day</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 5"
                  placeholderTextColor={Colors.textTertiary}
                  keyboardType="numeric"
                  value={calculatorInputs.hoursPerDay}
                  onChangeText={(v) => setCalculatorInputs((p) => ({ ...p, hoursPerDay: v }))}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Days per Month</Text>
                <TextInput
                  style={styles.input}
                  placeholder="30"
                  placeholderTextColor={Colors.textTertiary}
                  keyboardType="numeric"
                  value={calculatorInputs.daysPerMonth}
                  onChangeText={(v) => setCalculatorInputs((p) => ({ ...p, daysPerMonth: v }))}
                />
              </View>
            </View>

            <View style={styles.resultsCard}>
              <Text style={styles.resultsTitle}>Results</Text>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Monthly Usage</Text>
                <Text style={styles.resultValue}>{calculatorResult.kWh.toFixed(2)} kWh</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Monthly Cost</Text>
                <Text style={styles.resultValue}>${calculatorResult.cost.toFixed(2)}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Annual Usage</Text>
                <Text style={styles.resultValue}>{calculatorResult.annualKWh.toFixed(2)} kWh</Text>
              </View>
              <View style={[styles.resultRow, styles.resultRowHighlight]}>
                <Text style={styles.resultLabelHighlight}>Annual Cost</Text>
                <Text style={styles.resultValueHighlight}>${calculatorResult.annualCost.toFixed(2)}</Text>
              </View>
            </View>

            <View style={styles.tipsCard}>
              <Text style={styles.tipsTitle}>Common Wattages</Text>
              <View style={styles.tipsList}>
                <View style={styles.tipItem}>
                  <Lightbulb size={16} color="#FBBF24" />
                  <Text style={styles.tipText}>LED Bulb: 9W | Incandescent: 60W</Text>
                </View>
                <View style={styles.tipItem}>
                  <Tv size={16} color="#8B5CF6" />
                  <Text style={styles.tipText}>LED TV: 50-100W | Plasma: 200-400W</Text>
                </View>
                <View style={styles.tipItem}>
                  <Refrigerator size={16} color="#22C55E" />
                  <Text style={styles.tipText}>Refrigerator: 100-200W (avg)</Text>
                </View>
                <View style={styles.tipItem}>
                  <Thermometer size={16} color="#3B82F6" />
                  <Text style={styles.tipText}>Central A/C: 3000-5000W</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal visible={selectedAudit !== null} animationType="slide" presentationStyle="pageSheet">
        {selectedAudit && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedAudit(null)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Audit Details</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.auditDetailHeader}>
                <Text style={styles.auditDetailCustomer}>{selectedAudit.customerName}</Text>
                <Text style={styles.auditDetailAddress}>{selectedAudit.address}</Text>
                <View style={styles.homeSpecs}>
                  <View style={styles.homeSpec}>
                    <Home size={14} color={Colors.textSecondary} />
                    <Text style={styles.homeSpecText}>{selectedAudit.homeSize} sq ft</Text>
                  </View>
                  <View style={styles.homeSpec}>
                    <Clock size={14} color={Colors.textSecondary} />
                    <Text style={styles.homeSpecText}>{selectedAudit.homeAge} years old</Text>
                  </View>
                </View>
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Energy Summary</Text>
                <View style={styles.summaryGrid}>
                  <View style={styles.summaryItem}>
                    <Zap size={20} color="#EAB308" />
                    <Text style={styles.summaryValue}>{selectedAudit.totalMonthlyUsage}</Text>
                    <Text style={styles.summaryLabel}>kWh/month</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <DollarSign size={20} color="#DC2626" />
                    <Text style={styles.summaryValue}>${selectedAudit.currentMonthlyBill}</Text>
                    <Text style={styles.summaryLabel}>Monthly Bill</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <TrendingDown size={20} color="#22C55E" />
                    <Text style={[styles.summaryValue, { color: "#22C55E" }]}>${selectedAudit.projectedSavings}</Text>
                    <Text style={styles.summaryLabel}>Savings Potential</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <PieChart size={20} color={efficiencyConfig[selectedAudit.efficiencyRating].color} />
                    <Text style={[styles.summaryValue, { color: efficiencyConfig[selectedAudit.efficiencyRating].color }]}>
                      {efficiencyConfig[selectedAudit.efficiencyRating].label}
                    </Text>
                    <Text style={styles.summaryLabel}>Rating</Text>
                  </View>
                </View>
              </View>

              <View style={styles.recommendationsSection}>
                <Text style={styles.recommendationsTitle}>Recommendations</Text>
                {selectedAudit.recommendations.map((rec) => {
                  const priority = priorityConfig[rec.priority];
                  const category = categoryConfig[rec.category];
                  const CategoryIcon = category.icon;
                  return (
                    <View key={rec.id} style={[styles.recommendationCard, rec.implemented && styles.recommendationImplemented]}>
                      <View style={styles.recommendationHeader}>
                        <View style={[styles.recommendationIcon, { backgroundColor: `${category.color}15` }]}>
                          <CategoryIcon size={18} color={category.color} />
                        </View>
                        <View style={styles.recommendationInfo}>
                          <Text style={styles.recommendationTitle}>{rec.title}</Text>
                          <View style={[styles.priorityBadge, { backgroundColor: priority.bgColor }]}>
                            <Text style={[styles.priorityText, { color: priority.color }]}>{priority.label}</Text>
                          </View>
                        </View>
                        {rec.implemented && (
                          <CheckCircle size={20} color="#22C55E" />
                        )}
                      </View>
                      <Text style={styles.recommendationDescription}>{rec.description}</Text>
                      <View style={styles.recommendationStats}>
                        <View style={styles.recStat}>
                          <Text style={styles.recStatLabel}>Cost</Text>
                          <Text style={styles.recStatValue}>${rec.estimatedCost}</Text>
                        </View>
                        <View style={styles.recStat}>
                          <Text style={styles.recStatLabel}>Annual Savings</Text>
                          <Text style={[styles.recStatValue, { color: "#22C55E" }]}>${rec.annualSavings}</Text>
                        </View>
                        <View style={styles.recStat}>
                          <Text style={styles.recStatLabel}>Payback</Text>
                          <Text style={styles.recStatValue}>{rec.paybackPeriod} years</Text>
                        </View>
                      </View>
                      {!rec.implemented && (
                        <TouchableOpacity
                          style={styles.implementButton}
                          onPress={() => handleImplementRecommendation(selectedAudit.id, rec.id)}
                        >
                          <CheckCircle size={16} color="#22C55E" />
                          <Text style={styles.implementButtonText}>Mark as Implemented</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
              </View>

              <View style={styles.appliancesSection}>
                <Text style={styles.appliancesTitle}>Appliance Breakdown</Text>
                {selectedAudit.appliances.map((appliance) => {
                  const category = categoryConfig[appliance.category];
                  const CategoryIcon = category.icon;
                  const monthlyKWh = calculateMonthlyUsage(appliance.wattage, appliance.hoursPerDay, appliance.quantity);
                  const monthlyCost = calculateMonthlyCost(monthlyKWh);
                  return (
                    <View key={appliance.id} style={styles.applianceRow}>
                      <View style={[styles.applianceIcon, { backgroundColor: `${category.color}15` }]}>
                        <CategoryIcon size={16} color={category.color} />
                      </View>
                      <View style={styles.applianceInfo}>
                        <Text style={styles.applianceName}>{appliance.name}</Text>
                        <Text style={styles.applianceSpecs}>
                          {appliance.wattage}W × {appliance.hoursPerDay}h × {appliance.quantity}
                        </Text>
                      </View>
                      <View style={styles.applianceUsage}>
                        <Text style={styles.applianceKwh}>{monthlyKWh.toFixed(1)} kWh</Text>
                        <Text style={styles.applianceCost}>${monthlyCost.toFixed(2)}/mo</Text>
                      </View>
                    </View>
                  );
                })}
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
  calcButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center" as const,
    lineHeight: 20,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  quickAction: {
    alignItems: "center",
    gap: 6,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  searchSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 10,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  auditsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 14,
  },
  auditCard: {
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
  auditHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  auditIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#FEF9C3",
    alignItems: "center",
    justifyContent: "center",
  },
  auditInfo: {
    flex: 1,
  },
  auditCustomer: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  auditAddress: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  efficiencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  efficiencyText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  auditStats: {
    flexDirection: "row",
    marginBottom: 12,
  },
  auditStatItem: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  auditStatValue: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  auditStatLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
  auditFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  recommendationProgress: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  progressText: {
    fontSize: 12,
    color: Colors.textSecondary,
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
  calculatorCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  calculatorTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  calculatorSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  resultsCard: {
    backgroundColor: "#FEF9C3",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#92400E",
    marginBottom: 12,
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  resultLabel: {
    fontSize: 14,
    color: "#92400E",
  },
  resultValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#92400E",
  },
  resultRowHighlight: {
    borderBottomWidth: 0,
    marginTop: 4,
  },
  resultLabelHighlight: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#92400E",
  },
  resultValueHighlight: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#92400E",
  },
  tipsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  tipsList: {
    gap: 10,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  tipText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  auditDetailHeader: {
    marginBottom: 20,
  },
  auditDetailCustomer: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  auditDetailAddress: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  homeSpecs: {
    flexDirection: "row",
    gap: 16,
  },
  homeSpec: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  homeSpecText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 14,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  summaryItem: {
    width: "47%",
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  summaryLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  recommendationsSection: {
    marginBottom: 20,
  },
  recommendationsTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  recommendationCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  recommendationImplemented: {
    opacity: 0.7,
  },
  recommendationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  recommendationIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  recommendationInfo: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  priorityBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "600" as const,
  },
  recommendationDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  recommendationStats: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
  },
  recStat: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
  },
  recStatLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
  recStatValue: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.text,
    marginTop: 2,
  },
  implementButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#22C55E",
  },
  implementButtonText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#22C55E",
  },
  appliancesSection: {
    marginBottom: 20,
  },
  appliancesTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  applianceRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  applianceIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  applianceInfo: {
    flex: 1,
  },
  applianceName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  applianceSpecs: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  applianceUsage: {
    alignItems: "flex-end",
  },
  applianceKwh: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  applianceCost: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
